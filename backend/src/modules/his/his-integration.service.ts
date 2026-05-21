/**
 * @file his-integration.service.ts
 * @description Xử lý tương tác trực tiếp với schema MEDI của hệ thống HIS.
 * WARNING: Mọi thao tác ghi dữ liệu ở đây đều đẩy thẳng bệnh nhân vào luồng khám thực tế.
 */
import { getConnection } from "../../shared/database";

export interface HISAppointmentData {
  fullName: string;
  phone: string;
  dob?: string;
  gender?: string;
  departmentId: string;
  doctorId?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime?: string; // HH:MM
  amount: number;
  symptoms?: string;
}

/**
 * Sinh ID kế tiếp và thực thi insertFn. Nếu xảy ra ORA-00001 (duplicate PK)
 * do concurrent request, tự động đọc lại MAX và thử lại — không deadlock.
 */
async function insertWithNextId(
  conn: any,
  maxIdQuery: string,
  insertFn: (id: number) => Promise<unknown>,
  maxAttempts = 5
): Promise<number> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await conn.execute(maxIdQuery);
    const nextId = Number((res.rows as any[])[0].NEXT_ID);
    try {
      await insertFn(nextId);
      return nextId;
    } catch (err: any) {
      // ORA-00001: unique constraint violated — đọc lại MAX và thử lại
      if (err.errorNum === 1 && attempt < maxAttempts - 1) continue;
      throw err;
    }
  }
  throw new Error(`[HIS] insertWithNextId: thất bại sau ${maxAttempts} lần thử`);
}

/**
 * [Phase 12] Lưu thông tin Hẹn Khám vào Bảng W_HEN & W_HENCT
 * Đồng thời tự động sinh STT cho bệnh nhân từ TBL_STTKHAM
 */
export async function saveToHis(data: HISAppointmentData): Promise<{ appointmentId: string; stt: number }> {
  const conn = await getConnection();
  try {
    const formattedDate = data.appointmentDate.split('-').reverse().join('/'); // YYYY-MM-DD -> DD/MM/YYYY

    // 1. Tự động cấp STT — dùng FOR UPDATE để lock dòng của ngày này (atomic)
    let stt = 1;
    const sttQuery = await conn.execute(
      `SELECT STT FROM MEDI.TBL_STTKHAM WHERE NGAY = :ngay FOR UPDATE`,
      { ngay: formattedDate }
    );

    if (sttQuery.rows && sttQuery.rows.length > 0) {
      stt = Number((sttQuery.rows as any[])[0].STT) + 1;
      await conn.execute(
        `UPDATE MEDI.TBL_STTKHAM SET STT = :stt WHERE NGAY = :ngay`,
        { stt, ngay: formattedDate }
      );
    } else {
      try {
        await conn.execute(
          `INSERT INTO MEDI.TBL_STTKHAM (NGAY, STT) VALUES (:ngay, :stt)`,
          { ngay: formattedDate, stt }
        );
      } catch (insertErr: any) {
        // ORA-00001: Unique Constraint Violated
        // Tranh chấp đồng thời đầu ngày khi chưa có dòng ngày mới. Một tiến trình đã INSERT thành công trước đó.
        // Ta thực hiện SELECT FOR UPDATE lại dòng vừa được tạo để lấy STT cộng dồn.
        if (insertErr.errorNum === 1) {
          const retryQuery = await conn.execute(
            `SELECT STT FROM MEDI.TBL_STTKHAM WHERE NGAY = :ngay FOR UPDATE`,
            { ngay: formattedDate }
          );
          if (retryQuery.rows && retryQuery.rows.length > 0) {
            stt = Number((retryQuery.rows as any[])[0].STT) + 1;
            await conn.execute(
              `UPDATE MEDI.TBL_STTKHAM SET STT = :stt WHERE NGAY = :ngay`,
              { stt, ngay: formattedDate }
            );
          } else {
            throw new Error("[HIS Integration] Không thể lấy STT khám (TBL_STTKHAM) sau khi có xung đột chèn dòng.");
          }
        } else {
          throw insertErr;
        }
      }
    }

    // 2. Tìm hoặc tạo bệnh nhân trong W_LOGIN
    let idLogin: number;
    const loginQuery = await conn.execute(
      `SELECT ID FROM MEDI.W_LOGIN WHERE DTDIDONG = :phone AND ROWNUM = 1`,
      { phone: data.phone }
    );

    if (loginQuery.rows && loginQuery.rows.length > 0) {
      idLogin = Number((loginQuery.rows as any[])[0].ID);
    } else {
      idLogin = await insertWithNextId(
        conn,
        `SELECT NVL(MAX(ID), 0) + 1 AS NEXT_ID FROM MEDI.W_LOGIN`,
        (id) => conn.execute(
          `INSERT INTO MEDI.W_LOGIN (ID, HOTEN, DTDIDONG, NGAYUD) VALUES (:id, :hoten, :phone, SYSDATE)`,
          { id, hoten: data.fullName, phone: data.phone }
        )
      );
    }

    // 3. Ghi vào W_HEN
    const idHen = await insertWithNextId(
      conn,
      `SELECT NVL(MAX(ID), 0) + 1 AS NEXT_ID FROM MEDI.W_HEN`,
      (id) => conn.execute(
        `INSERT INTO MEDI.W_HEN (ID, IDLOGIN, LOAI, CHUONGTRINH, LYDO, MABS, DONE, NGAYUD, LYDO_VN)
         VALUES (:id, :idlogin, 0, 0, :symptoms, :mabs, 0, SYSDATE, :symptoms_vn)`,
        {
          id,
          idlogin: idLogin,
          symptoms: data.symptoms || '',
          mabs: data.doctorId || '',
          symptoms_vn: data.symptoms || '',
        }
      )
    );

    // 4. Ghi chi tiết vào W_HENCT
    await conn.execute(
      `INSERT INTO MEDI.W_HENCT (ID, NGAY, GHICHU, NGAYUD, GHICHU_VN)
       VALUES (:id, TO_DATE(:ngaykham, 'YYYY-MM-DD'), :ghichu, SYSDATE, :ghichu_vn)`,
      {
        id: idHen,
        ngaykham: data.appointmentDate,
        ghichu: data.appointmentTime ? `Giờ khám: ${data.appointmentTime}` : '',
        ghichu_vn: data.appointmentTime ? `Giờ khám: ${data.appointmentTime}` : '',
      }
    );

    await conn.commit();
    console.log(`[HIS Integration] Đã ghi nhận thành công W_HEN (ID: ${idHen}), STT: ${stt}`);

    return { appointmentId: `WEB-${idHen}`, stt };
  } catch (err) {
    console.error("[HIS Integration] Lỗi ghi lịch khám online (W_HEN):", err);
    await conn.rollback();
    throw err;
  } finally {
    await conn.close();
  }
}
