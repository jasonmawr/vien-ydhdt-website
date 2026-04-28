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
 * [Phase 12] Lưu thông tin Hẹn Khám vào Bảng W_HEN & W_HENCT
 * Đồng thời tự động sinh STT cho bệnh nhân từ TBL_STTKHAM
 */
export async function saveToHis(data: HISAppointmentData): Promise<{ appointmentId: string; stt: number }> {
  const conn = await getConnection();
  try {
    const formattedDate = data.appointmentDate.split('-').reverse().join('/'); // YYYY-MM-DD -> DD/MM/YYYY

    // 1. Tự động cấp số thứ tự (STT) cho Ngày khám
    let stt = 1;
    const sttQuery = await conn.execute(
      `SELECT STT FROM MEDI.TBL_STTKHAM WHERE NGAY = :ngay`,
      { ngay: formattedDate }
    );
    
    if (sttQuery.rows && sttQuery.rows.length > 0) {
      stt = Number((sttQuery.rows as any[])[0].STT) + 1;
      await conn.execute(
        `UPDATE MEDI.TBL_STTKHAM SET STT = :stt WHERE NGAY = :ngay`,
        { stt, ngay: formattedDate }
      );
    } else {
      await conn.execute(
        `INSERT INTO MEDI.TBL_STTKHAM (NGAY, STT) VALUES (:ngay, :stt)`,
        { ngay: formattedDate, stt }
      );
    }

    // 2. Tìm hoặc tạo bệnh nhân trong W_LOGIN
    let idLogin = 1;
    const loginQuery = await conn.execute(
      `SELECT ID FROM MEDI.W_LOGIN WHERE DTDIDONG = :phone AND ROWNUM = 1`,
      { phone: data.phone }
    );
    
    if (loginQuery.rows && loginQuery.rows.length > 0) {
      idLogin = Number((loginQuery.rows as any[])[0].ID);
    } else {
      const maxLoginIdRes = await conn.execute(`SELECT NVL(MAX(ID), 0) + 1 as NEXT_ID FROM MEDI.W_LOGIN`);
      idLogin = Number((maxLoginIdRes.rows as any[])[0].NEXT_ID);
      await conn.execute(
        `INSERT INTO MEDI.W_LOGIN (ID, HOTEN, DTDIDONG, NGAYUD) VALUES (:id, :hoten, :phone, SYSDATE)`,
        { id: idLogin, hoten: data.fullName, phone: data.phone }
      );
    }

    // 3. Ghi vào W_HEN
    const maxHenIdRes = await conn.execute(`SELECT NVL(MAX(ID), 0) + 1 as NEXT_ID FROM MEDI.W_HEN`);
    const idHen = Number((maxHenIdRes.rows as any[])[0].NEXT_ID);
    
    await conn.execute(
      `INSERT INTO MEDI.W_HEN (ID, IDLOGIN, LOAI, CHUONGTRINH, LYDO, MABS, DONE, NGAYUD, LYDO_VN) 
       VALUES (:id, :idlogin, 0, 0, :symptoms, :mabs, 0, SYSDATE, :symptoms_vn)`,
      {
        id: idHen,
        idlogin: idLogin,
        symptoms: data.symptoms || '',
        mabs: data.doctorId || '',
        symptoms_vn: data.symptoms || ''
      }
    );

    // 4. Ghi chi tiết vào W_HENCT
    await conn.execute(
      `INSERT INTO MEDI.W_HENCT (ID, NGAY, GHICHU, NGAYUD, GHICHU_VN) 
       VALUES (:id, TO_DATE(:ngaykham, 'YYYY-MM-DD'), :ghichu, SYSDATE, :ghichu_vn)`,
      {
        id: idHen,
        ngaykham: data.appointmentDate,
        ghichu: data.appointmentTime ? `Giờ khám: ${data.appointmentTime}` : '',
        ghichu_vn: data.appointmentTime ? `Giờ khám: ${data.appointmentTime}` : ''
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
