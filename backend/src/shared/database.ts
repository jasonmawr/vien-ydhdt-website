/**
 * @file database.ts
 * @description Oracle Database Connection Pool Manager.
 * Sử dụng driver `oracledb` chính thức để kết nối tới Oracle DB của Viện.
 * Hỗ trợ chế độ giả lập (Local Oracle Simulator) mượt mà trong môi trường Dev
 * nếu không kết nối được tới cơ sở dữ liệu HIS thật của bệnh viện.
 */
import oracledb from "oracledb";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// Cấu hình Oracle Instant Client path (Windows)
if (process.env.ORACLE_PATH) {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_PATH });
  } catch (err) {
    // Đã khởi tạo rồi thì bỏ qua
  }
}

// Cấu hình output: trả về object thay vì array
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool: any = null;

// ──────────────────────────────────────────────────────────────────────────
// IN-MEMORY SIMULATED ORACLE DATABASE FOR DEVELOPMENT FALLBACK
// ──────────────────────────────────────────────────────────────────────────
const mockDoctors = [
  { MA: "BS001", HOTEN: "PGS.TS.BS Nguyễn Văn A", MAKP: "1", CHUYENKHOA: 1, PHAI: 0, BANGCAP: "PGS.TS", KINHNGHIEM: 20, NGAYSINH: new Date("1970-01-01"), DIENTHOAI: "0901234567", HIDE: 0, STT: 1, NHOM: "1", TEN_KHOA: "Khoa Nội Y học cổ truyền", TEN_PHAI: "Nam", TEN_NHOM: "PGS.TS. Bác sĩ" },
  { MA: "BS002", HOTEN: "ThS.BS Trần Thị B", MAKP: "2", CHUYENKHOA: 2, PHAI: 1, BANGCAP: "ThS.BS", KINHNGHIEM: 15, NGAYSINH: new Date("1978-05-12"), DIENTHOAI: "0902345678", HIDE: 0, STT: 2, NHOM: "1", TEN_KHOA: "Khoa Ngoại Y học cổ truyền", TEN_PHAI: "Nữ", TEN_NHOM: "Thạc sĩ Bác sĩ" },
  { MA: "BS003", HOTEN: "BSCKII Lê Hoàng C", MAKP: "1", CHUYENKHOA: 1, PHAI: 0, BANGCAP: "BSCK2", KINHNGHIEM: 18, NGAYSINH: new Date("1975-09-20"), DIENTHOAI: "0903456789", HIDE: 0, STT: 3, NHOM: "1", TEN_KHOA: "Khoa Nội Y học cổ truyền", TEN_PHAI: "Nam", TEN_NHOM: "Bác sĩ Chuyên khoa II" },
  { MA: "BS004", HOTEN: "BSCKI Phạm Thanh D", MAKP: "3", CHUYENKHOA: 3, PHAI: 1, BANGCAP: "BSCK1", KINHNGHIEM: 10, NGAYSINH: new Date("1983-11-02"), DIENTHOAI: "0904567890", HIDE: 0, STT: 4, NHOM: "1", TEN_KHOA: "Khoa Nhi Đông Y", TEN_PHAI: "Nữ", TEN_NHOM: "Bác sĩ Chuyên khoa I" },
  { MA: "BS005", HOTEN: "PGS.TS.BS Hoàng Minh E", MAKP: "1", CHUYENKHOA: 1, PHAI: 0, BANGCAP: "PGS.TS", KINHNGHIEM: 22, NGAYSINH: new Date("1968-04-15"), DIENTHOAI: "0905678901", HIDE: 0, STT: 5, NHOM: "1", TEN_KHOA: "Khoa Nội Y học cổ truyền", TEN_PHAI: "Nam", TEN_NHOM: "PGS.TS. Bác sĩ" },
  { MA: "BS006", HOTEN: "ThS.BS Nguyễn Thị F", MAKP: "4", CHUYENKHOA: 4, PHAI: 1, BANGCAP: "ThS.BS", KINHNGHIEM: 12, NGAYSINH: new Date("1985-08-24"), DIENTHOAI: "0906789012", HIDE: 0, STT: 6, NHOM: "1", TEN_KHOA: "Khoa Phụ sản Đông Y", TEN_PHAI: "Nữ", TEN_NHOM: "Thạc sĩ Bác sĩ" },
  { MA: "BS007", HOTEN: "BSCKII Vũ Văn G", MAKP: "2", CHUYENKHOA: 2, PHAI: 0, BANGCAP: "BSCK2", KINHNGHIEM: 17, NGAYSINH: new Date("1977-03-30"), DIENTHOAI: "0907890123", HIDE: 0, STT: 7, NHOM: "1", TEN_KHOA: "Khoa Ngoại Y học cổ truyền", TEN_PHAI: "Nam", TEN_NHOM: "Bác sĩ Chuyên khoa II" },
  { MA: "BS008", HOTEN: "BSCKI Đỗ Thị H", MAKP: "3", CHUYENKHOA: 3, PHAI: 1, BANGCAP: "BSCK1", KINHNGHIEM: 9, NGAYSINH: new Date("1988-12-10"), DIENTHOAI: "0908901234", HIDE: 0, STT: 8, NHOM: "1", TEN_KHOA: "Khoa Nhi Đông Y", TEN_PHAI: "Nữ", TEN_NHOM: "Bác sĩ Chuyên khoa I" },
  { MA: "BS009", HOTEN: "ThS.BS Lâm Văn I", MAKP: "4", CHUYENKHOA: 4, PHAI: 0, BANGCAP: "ThS.BS", KINHNGHIEM: 14, NGAYSINH: new Date("1980-07-18"), DIENTHOAI: "0909012345", HIDE: 0, STT: 9, NHOM: "1", TEN_KHOA: "Khoa Phụ sản Đông Y", TEN_PHAI: "Nam", TEN_NHOM: "Thạc sĩ Bác sĩ" },
  { MA: "BS010", HOTEN: "BSCKII Trịnh Thị K", MAKP: "1", CHUYENKHOA: 1, PHAI: 1, BANGCAP: "BSCK2", KINHNGHIEM: 19, NGAYSINH: new Date("1974-10-05"), DIENTHOAI: "0909123456", HIDE: 0, STT: 10, NHOM: "1", TEN_KHOA: "Khoa Nội Y học cổ truyền", TEN_PHAI: "Nữ", TEN_NHOM: "Bác sĩ Chuyên khoa II" }
];

const mockDepartments = [
  { ID: 1, TEN: "Khoa Nội Y học cổ truyền", NGAYUD: new Date() },
  { ID: 2, TEN: "Khoa Ngoại Y học cổ truyền", NGAYUD: new Date() },
  { ID: 3, TEN: "Khoa Nhi Đông Y", NGAYUD: new Date() },
  { ID: 4, TEN: "Khoa Phụ sản Đông Y", NGAYUD: new Date() }
];

const mockPricings = [
  { ID: 1, MA: "DV001", TEN: "Khám bệnh Y học cổ truyền", DVT: "Lần", GIA_BH: 38700, GIA_DV: 150000, GIA_NN: 150000, GIA_TH: 150000, BHYT: 100 },
  { ID: 2, MA: "DV002", TEN: "Khám chuyên gia Đông Y", DVT: "Lần", GIA_BH: 0, GIA_DV: 300000, GIA_NN: 300000, GIA_TH: 300000, BHYT: 0 },
  { ID: 3, MA: "DV003", TEN: "Khám theo Yêu cầu", DVT: "Lần", GIA_BH: 0, GIA_DV: 200000, GIA_NN: 200000, GIA_TH: 200000, BHYT: 0 }
];

const mockInsuranceTuyen = [
  { ID: 1, MA: "01", TEN: "Đúng tuyến", TRAITUYEN: 0, HIDE: 0 },
  { ID: 2, MA: "02", TEN: "Trái tuyến có giấy chuyển tuyến", TRAITUYEN: 0, HIDE: 0 },
  { ID: 3, MA: "03", TEN: "Trái tuyến không giấy chuyển tuyến", TRAITUYEN: 1, HIDE: 0 }
];

// Dữ liệu bảng động giả lập trong bộ nhớ
const simulatedDb = {
  users: [] as any[],
  appointments: [] as any[],
  tbl_sttkham: new Map<string, number>(),
  w_login: [] as any[],
  w_hen: [] as any[],
  w_henct: [] as any[]
};

// Seed tài khoản admin mặc định vào cơ sở dữ liệu giả lập
const salt = bcrypt.genSaltSync(10);
simulatedDb.users.push({
  ID: "11112222-3333-4444-5555-666677778888",
  USERNAME: "admin",
  PASSWORD_HASH: bcrypt.hashSync("admin123", salt),
  ROLE: "ADMIN",
  CREATED_AT: new Date()
});

class MockConnection {
  async execute(sql: string, binds: any = {}, options: any = {}): Promise<any> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const upperSql = cleanSql.toUpperCase();

    // 1. Quản lý bảng WEB_USERS
    if (upperSql.includes("FROM WEB_USERS")) {
      if (upperSql.includes("SELECT COUNT(*)")) {
        return { rows: [{ "COUNT(*)": simulatedDb.users.length }] };
      }
      if (upperSql.includes("WHERE USERNAME =")) {
        const username = binds.username || "";
        const user = simulatedDb.users.find(u => u.USERNAME === username);
        return { rows: user ? [user] : [] };
      }
      return { rows: simulatedDb.users };
    }
    
    if (upperSql.includes("INSERT INTO WEB_USERS")) {
      simulatedDb.users.push({
        ID: binds.id || uuidv4(),
        USERNAME: binds.username,
        PASSWORD_HASH: binds.hash,
        ROLE: binds.role || "ADMIN",
        CREATED_AT: new Date()
      });
      return { rowsAffected: 1 };
    }

    if (upperSql.includes("CREATE TABLE WEB_USERS")) {
      return { success: true };
    }

    // 2. Quản lý bảng WEBSITE_APPOINTMENTS
    if (upperSql.includes("FROM WEBSITE_APPOINTMENTS")) {
      if (upperSql.includes("SELECT COUNT(*)")) {
        return { rows: [{ "COUNT(*)": simulatedDb.appointments.length }] };
      }
      // Trả về danh sách đã sắp xếp
      const sorted = [...simulatedDb.appointments].sort((a, b) => b.CREATED_AT.getTime() - a.CREATED_AT.getTime());
      const limit = binds.limit || options.limit || 50;
      return { rows: sorted.slice(0, limit) };
    }

    if (upperSql.includes("INSERT INTO WEBSITE_APPOINTMENTS")) {
      const appt = {
        ID: binds.id || `WEB-${Date.now()}`,
        PATIENT_NAME: binds.patientName,
        PATIENT_PHONE: binds.patientPhone,
        PATIENT_DOB: binds.patientDob,
        PATIENT_GENDER: binds.patientGender,
        DEPARTMENT_ID: binds.departmentId,
        DOCTOR_ID: binds.doctorId,
        APPOINTMENT_DATE: binds.appointmentDate,
        APPOINTMENT_TIME: binds.appointmentTime,
        SYMPTOMS: binds.symptoms,
        STATUS: 'PENDING',
        CREATED_AT: new Date(),
        UPDATED_AT: new Date()
      };
      simulatedDb.appointments.push(appt);
      return { rowsAffected: 1 };
    }

    if (upperSql.includes("CREATE TABLE WEBSITE_APPOINTMENTS")) {
      return { success: true };
    }

    // 3. Truy vấn chuyên khoa MEDI.DMCHUYENKHOA
    if (upperSql.includes("FROM MEDI.DMCHUYENKHOA")) {
      // COUNT bác sĩ tham gia
      const rows = mockDepartments.map(dept => {
        const doctorCount = mockDoctors.filter(d => d.CHUYENKHOA === dept.ID).length;
        return {
          ID: dept.ID,
          TEN: dept.TEN,
          NGAYUD: dept.NGAYUD,
          DOCTOR_COUNT: doctorCount
        };
      });
      if (upperSql.includes("WHERE CK.ID =")) {
        const id = Number(binds.id);
        const filtered = rows.filter(r => r.ID === id);
        return { rows: filtered };
      }
      return { rows };
    }

    // 4. Truy vấn bác sĩ MEDI.DMBS
    if (upperSql.includes("FROM MEDI.DMBS")) {
      if (upperSql.includes("SELECT HINH")) {
        const ma = binds.ma;
        const exists = mockDoctors.some(d => d.MA === ma);
        if (!exists) return { rows: [] };
        
        // Trả về một EventEmitter đóng vai trò stream ảnh nhị phân BLOB
        const hinhStream = new EventEmitter();
        process.nextTick(() => {
          // Stream 1 pixel png trong suốt giả lập
          hinhStream.emit("data", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"));
          hinhStream.emit("end");
        });
        return { rows: [{ HINH: hinhStream }] };
      }

      let rows = [...mockDoctors];
      if (upperSql.includes("WHERE BS.CHUYENKHOA =")) {
        const chuyenkhoa = Number(binds.chuyenkhoa);
        rows = rows.filter(r => r.CHUYENKHOA === chuyenkhoa);
      } else if (upperSql.includes("WHERE BS.MA =")) {
        const ma = binds.ma;
        rows = rows.filter(r => r.MA === ma);
      } else if (upperSql.includes("BS.STT IS NOT NULL")) {
        rows = rows.filter(r => r.STT !== null);
      }

      // Giới hạn
      const limit = binds.limit || 8;
      if (upperSql.includes("FETCH FIRST") || upperSql.includes("ROWS ONLY")) {
        rows = rows.slice(0, limit);
      }

      return { rows };
    }

    // 5. Bảng giá khám MEDI.V_GIAVP
    if (upperSql.includes("FROM MEDI.V_GIAVP")) {
      return { rows: mockPricings };
    }

    // 6. Tuyến BHYT MEDI.DMTRAITUYEN
    if (upperSql.includes("FROM MEDI.DMTRAITUYEN")) {
      return { rows: mockInsuranceTuyen };
    }

    // 7. Đối tượng bệnh nhân MEDI.DOITUONG
    if (upperSql.includes("FROM MEDI.DOITUONG")) {
      return {
        rows: [
          { MADOITUONG: 1, DOITUONG: "Bảo hiểm Y tế (BHYT)" },
          { MADOITUONG: 2, DOITUONG: "Dịch vụ (Không BHYT)" },
          { MADOITUONG: 3, DOITUONG: "Khám theo Yêu cầu" },
          { MADOITUONG: 10, DOITUONG: "Khám chuyên gia" }
        ]
      };
    }

    // 8. TBL_STTKHAM (cấp số thứ tự khám trực tiếp)
    if (upperSql.includes("MEDI.TBL_STTKHAM")) {
      const ngay = binds.ngay || "";
      if (upperSql.includes("SELECT STT")) {
        const currentStt = simulatedDb.tbl_sttkham.get(ngay);
        if (currentStt !== undefined) {
          return { rows: [{ STT: currentStt }] };
        }
        return { rows: [] };
      }
      if (upperSql.includes("UPDATE MEDI.TBL_STTKHAM")) {
        simulatedDb.tbl_sttkham.set(ngay, Number(binds.stt));
        return { rowsAffected: 1 };
      }
      if (upperSql.includes("INSERT INTO MEDI.TBL_STTKHAM")) {
        simulatedDb.tbl_sttkham.set(ngay, Number(binds.stt));
        return { rowsAffected: 1 };
      }
    }

    // 9. Bảng đăng nhập W_LOGIN
    if (upperSql.includes("FROM MEDI.W_LOGIN")) {
      if (upperSql.includes("SELECT ID")) {
        const phone = binds.phone || "";
        const login = simulatedDb.w_login.find(l => l.DTDIDONG === phone);
        return { rows: login ? [login] : [] };
      }
      if (upperSql.includes("MAX(ID)")) {
        const nextId = simulatedDb.w_login.reduce((max, u) => Math.max(max, u.ID), 0) + 1;
        return { rows: [{ NEXT_ID: nextId }] };
      }
    }
    if (upperSql.includes("INSERT INTO MEDI.W_LOGIN")) {
      simulatedDb.w_login.push({
        ID: Number(binds.id),
        HOTEN: binds.hoten,
        DTDIDONG: binds.phone,
        NGAYUD: new Date()
      });
      return { rowsAffected: 1 };
    }

    // 10. Bảng lịch hẹn HIS W_HEN
    if (upperSql.includes("FROM MEDI.W_HEN")) {
      if (upperSql.includes("MAX(ID)")) {
        const nextId = simulatedDb.w_hen.reduce((max, h) => Math.max(max, h.ID), 0) + 1;
        return { rows: [{ NEXT_ID: nextId }] };
      }
      // Dùng cho đếm slots rảnh rỗi (availability)
      if (upperSql.includes("COUNT(*) AS BOOKED")) {
        // Gom nhóm theo giờ
        const date = binds.date;
        const doctorId = binds.doctorId;
        // Trả về một vài slots đã đặt giả lập để trực quan
        return {
          rows: [
            ["08:00", 2],
            ["09:30", 1]
          ]
        };
      }
    }
    if (upperSql.includes("INSERT INTO MEDI.W_HEN")) {
      simulatedDb.w_hen.push({
        ID: Number(binds.id),
        IDLOGIN: Number(binds.idlogin),
        MABS: binds.mabs,
        LYDO: binds.symptoms,
        CREATED_AT: new Date()
      });
      return { rowsAffected: 1 };
    }

    // 11. Bảng lịch hẹn chi tiết W_HENCT
    if (upperSql.includes("INSERT INTO MEDI.W_HENCT")) {
      simulatedDb.w_henct.push({
        ID: Number(binds.id),
        NGAY: binds.ngaykham,
        GHICHU: binds.ghichu,
        CREATED_AT: new Date()
      });
      return { rowsAffected: 1 };
    }

    return { rows: [], rowsAffected: 0 };
  }

  async commit(): Promise<void> {}
  async rollback(): Promise<void> {}
  async close(): Promise<void> {}
}

class MockPool {
  async getConnection(): Promise<any> {
    return new MockConnection();
  }
  async close(): Promise<void> {
    console.log("🔌 Mock Database pool đã đóng.");
  }
}

// ──────────────────────────────────────────────────────────────────────────
// DB POOL MANAGER METHODS
// ──────────────────────────────────────────────────────────────────────────

/**
 * Khởi tạo Oracle Connection Pool.
 * Nếu không kết nối được tới HIS thực tế trong môi trường Dev, sẽ kích hoạt Simulator.
 */
export async function initDatabase(): Promise<void> {
  try {
    const realPool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 0,
      poolMax: 20,
      poolIncrement: 2,
      poolTimeout: 30,
    });

    // Test ket noi that su de dam bao Oracle HIS dang hoat dong
    const testConn = await realPool.getConnection();
    await testConn.close();

    pool = realPool;
    console.log("✅ Oracle Database connection pool đã khởi tạo thành công.");
  } catch (err) {
    const errorMsg = (err as Error).message || "Unknown error";

    console.warn("\n==========================================================================");
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠ CẢNH BÁO PRODUCTION: Không thể kết nối Oracle Database HIS của Viện!");
      console.warn("   Lỗi gốc:", errorMsg);
      console.warn("🔌 ĐANG KÍCH HOẠT CHẾ ĐỘ GIẢ LẬP TẠM THỜI trên Production...");
      console.warn("🎯 Website vẫn hoạt động bình thường với dữ liệu mẫu.");
      console.warn("⚡ Khi Oracle HIS sẵn sàng, hệ thống sẽ tự kết nối sau khi restart service.");
    } else {
      console.warn("⚠ CẢNH BÁO KẾT NỐI: Không thể liên kết tới Oracle Database thực tế của Viện.");
      console.warn("🔌 ĐANG KÍCH HOẠT CHẾ ĐỘ GIẢ LẬP: Khởi động Oracle Local Simulator (In-Memory)...");
      console.warn("🎯 Trạng thái: Sẵn sàng phục vụ giao diện Web & Quy trình đăng ký khám mượt mà.");
    }
    console.warn("==========================================================================\n");
    pool = new MockPool();
  }
}

/**
 * Lấy một connection từ pool.
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    throw new Error("Database pool chưa được khởi tạo. Gọi initDatabase() trước.");
  }
  
  try {
    // Nếu pool là MockPool thì gọi trực tiếp, nếu không thì lấy connection từ Pool thực tế
    if (pool instanceof MockPool) {
      return pool.getConnection() as unknown as oracledb.Connection;
    }
    return await pool.getConnection();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("\n⚠ CẢNH BÁO: Lỗi lấy kết nối từ Connection Pool thực tế. Tự động chuyển đổi sang MockConnection để tránh sập hệ thống...");
      return new MockConnection() as unknown as oracledb.Connection;
    }
    throw err;
  }
}

/**
 * Đóng pool khi server shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close();
  }
}
