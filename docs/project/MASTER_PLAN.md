# MASTER PLAN: HỆ SINH THÁI Y TẾ SỐ TOÀN DIỆN
## Viện Y Dược Học Dân Tộc TP.HCM — Website & Super App
### *Tài liệu chuẩn dự án — Cập nhật: 2026-04-21*

> **MỤC ĐÍCH CỦA FILE NÀY:**
> Bất kỳ phiên làm việc nào (bất kỳ AI Agent hoặc Developer nào) chỉ cần đọc file này
> là có đủ thông tin để tiếp tục xây dựng và hoàn thiện 100% dự án.

---

## I. TỔNG QUAN DỰ ÁN

### Mục tiêu
Xây dựng hệ sinh thái y tế số toàn diện (theo mô hình UMC Care của BV Đại học Y Dược TP.HCM), bao gồm:
- **Website đặt khám online** (đa luồng: theo Chuyên khoa / Bác sĩ / Ngày)
- **Cổng thanh toán VietQR** (VietinBank RSA Certificate)
- **Tích hợp HIS** (Oracle Database, schema MEDI — đọc/ghi trực tiếp)
- **Trợ lý AI y tế** (RAG trên Dược Điển + kiến thức y khoa nội bộ)
- **Mobile App** (Y Dược Care — Giai đoạn sau)

### Tech Stack
| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 16.2.4, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | Express.js, TypeScript, tsx (dev), oracledb (thick client) |
| Database | Oracle 11g (192.168.1.113:1521, SID=medi), Schema: `MEDI` (1,269 bảng) |
| Auth | JWT + bcryptjs, HTTP-Only Cookies, Next.js Middleware |
| Payment | VietinBank VietQR API + RSA .cer1 signature verification |
| Infra | Windows Server, IIS Reverse Proxy (Production) |

### Cấu trúc thư mục
```
vien-ydhdt-website/
├── backend/                    # Express API Server (Port 4000)
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── shared/
│   │   │   └── database.ts     # Oracle connection pool
│   │   ├── modules/
│   │   │   ├── departments/    # GET /api/departments
│   │   │   ├── doctors/        # GET /api/doctors, GET /api/doctors/:id/image
│   │   │   ├── appointments/   # POST+GET /api/appointments
│   │   │   ├── auth/           # POST /api/auth/login (JWT)
│   │   │   ├── payment/        # POST /api/payment/generate-qr, POST /api/payment/webhook
│   │   │   ├── booking/        # GET /api/booking/specialties,pricing,insurance-tuyen,patient-types
│   │   │   └── his/            # his-integration.service.ts (HIS read/write)
│   │   └── scripts/            # Các script khám phá DB (chỉ dùng dev)
│   └── .env                    # Biến môi trường (KHÔNG commit lên git)
├── vien-ydh-frontend/          # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Trang chủ
│   │   │   ├── dat-lich/       # Trang đặt lịch (Landing + 3 luồng)
│   │   │   │   ├── page.tsx         # Landing: 3 card + Bảng giá
│   │   │   │   ├── chuyen-khoa/     # Luồng đặt theo Chuyên khoa
│   │   │   │   ├── bac-si/          # Luồng đặt theo Bác sĩ
│   │   │   │   └── ngay/            # Luồng đặt theo Ngày
│   │   │   ├── duoc-lieu/      # Trang dược liệu
│   │   │   ├── admin/          # Admin Dashboard (Protected)
│   │   │   │   ├── login/      # Đăng nhập Admin
│   │   │   │   └── appointments/ # Quản lý lịch khám
│   │   │   └── api/            # Next.js API Routes
│   │   ├── components/
│   │   │   ├── features/BookingForm.tsx  # Form đặt khám đa bước
│   │   │   ├── layout/         # Header, Footer
│   │   │   ├── sections/       # Hero, FeaturedDoctors, etc.
│   │   │   └── ui/             # Shared UI components
│   │   ├── services/api.ts     # HTTP Client (SSOT gọi Backend API)
│   │   └── lib/                # Utils, types
│   └── .env.local              # Frontend env
└── docs/                       # Tài liệu dự án
    ├── project/
    │   ├── MASTER_PLAN.md       # << FILE NÀY
    │   ├── ARCHITECTURE.md
    │   ├── Rules.md             # Quy tắc phát triển (Git flow, PR, etc.)
    │   └── PROJECT_PRD.md
    ├── VietQRConnection/        # Chứng chỉ + tài liệu VietinBank
    │   ├── PRD_VIETINBANK_API_CERT.cer1
    │   ├── PRD_VIETINBANK_NOTIFYTRANS_CERT.cer1
    │   └── genVietQRproduction.md
    └── api/                     # API documentation
```

---

## II. DỮ LIỆU ORACLE HIS ĐÃ THU THẬP (Schema MEDI)

> **Kết nối:** `192.168.1.113:1521`, SID: `medi`, User: xem `.env`
> **Tổng số bảng:** 1,269

### 1. Bảng Chuyên Khoa (`MEDI.DMCHUYENKHOA`)
| ID | TEN |
|---|---|
| 1 | Chuyên khoa Nội |
| 2 | Chuyên khoa Ngoại |
| 3 | Chuyên khoa Nhi |
| 4 | Chuyên khoa Sản |

### 2. Bảng Bác Sĩ (`MEDI.DMBS`)
- Cột: `MA`, `HOTEN`, `MAKP`, `CHUCVU`, `GIOITINH`, `CHUYENKHOA`, `NGAYUD`
- Có ảnh BLOB trong bảng riêng (stream qua `GET /api/doctors/:id/image`)
- Tổng: **253+ bác sĩ** trong hệ thống

### 3. Bảng Giá Viện Phí (`MEDI.V_GIAVP`)
Cột quan trọng: `ID`, `MA`, `TEN`, `DVT`, `GIA_BH`, `GIA_DV`, `GIA_NN`, `BHYT`, `LOAIBN`

**Giá khám thực tế (đã xác nhận):**
| Mã | Tên | Giá BHYT | Giá DV | Giá NN | BHYT% |
|---|---|---|---|---|---|
| K1 | Khám Y học cổ truyền | 50,600đ | 50,600đ | 150,000đ | 100% |
| K3 | Khám Phục hồi chức năng | 50,600đ | 50,600đ | 150,000đ | 100% |
| KDD | Khám Dinh dưỡng | 250,000đ | 250,000đ | 250,000đ | 0% |
| KPS | Khám Phụ khoa | 300,000đ | 200,000đ | 300,000đ | 0% |

### 4. Bảng Đối Tượng (`MEDI.DOITUONG`, `MEDI.DOITUONG_BHYT`)
4 đối tượng chính: **BHYT**, **Dịch vụ**, **Nước ngoài**, **Chuyên gia**

### 5. Bảng BHYT (`MEDI.DMBHYT`)
Cột: `MABN`, `SOTHE`, `MATHE`, `HOTEN`, `NAMSINH`, `GIOITINH`, `DIACHI`, `TUNGAY`, `DENNGAY`, `MABV`, `SUDUNG`, `MADOITUONG`
- `MABV` = `79426` (Mã BV của Viện YDHDT)
- `SUDUNG`: 1 = đang sử dụng, 0 = hết hạn

### 6. Bảng Tuyến BHYT (`MEDI.DMTRAITUYEN`)
| Mã | Tên | Trái tuyến? |
|---|---|---|
| 1.1 | Đúng tuyến - Đúng KCB | ❌ |
| 1.3 | Đúng tuyến - Giấy chuyển | ❌ |
| 1.4 | Đúng tuyến - Công tác | ❌ |
| 1.5 | Đúng tuyến - Hẹn khám | ❌ |
| 2 | Cấp cứu | ⚠️ Đặc biệt |
| 3.6 | Trái tuyến - Dân tộc/Hộ nghèo 100% | ✅ |
| 10 | Đúng tuyến - Tự đến tuyến tỉnh | ❌ |

### 7. Bảng Lịch Hẹn Web (`MEDI.W_HEN` + `MEDI.W_HENCT`)
**W_HEN:** `ID` (PK), `IDLOGIN`, `LOAI`, `CHUONGTRINH`, `LYDO`, `MABS`, `DONE`, `NGAYUD`
**W_HENCT:** `ID` (FK→W_HEN), `NGAY`, `GHICHU`, `NGAYUD`
→ Đây là bảng sẽ INSERT khi bệnh nhân đặt khám online thành công.

### 8. Bảng SMS Hẹn (`MEDI.HEN_SENDSMS`)
Cột: `MABN`, `MAVAOVIEN`, `MAKP`, `NGAY`, `SONGAY`, `NGAYHEN`, `GHICHU`, `LOAI`, `DONE`, `USERID`

### 9. Bảng Bệnh Nhân (`MEDI.BENHNHAN`)
Cột: `MABN`, `HOTEN`, `NAMSINH`, `GIOITINH`, `DIENTHOAI`, `DIACHI`, `SOTHE`, `MADT`, `MATT`, `MAQU`, `MAPHUONGXA`

### 10. Bảng STT Khám (`MEDI.TBL_STTKHAM`)
Chỉ 2 cột: `NGAY` (VARCHAR2), `STT` (NUMBER) → Counter số thứ tự theo ngày

### 11. Bảng Phòng Khám (`MEDI.DMPHONG`)
Cột: `MAKP`, `ID`, `STT`, `MA`, `TEN`, `LOAI`, `LOAIVP`, `DICHVU`

### 12. Sequences (`MEDI`)
| Sequence | Last Number |
|---|---|
| SEQ_HDT | 1 |
| SEQ_LKO | 2 |
| SEQ_TTO | 2 |

### 13. Bảng Tuyến BV (`MEDI.DMTUYEN`)
| MA | TEN |
|---|---|
| 0 | Tỉnh |
| 1 | Huyện |
| 2 | Xã |

---

## III. LUỒNG NGHIỆP VỤ O2O (Online to Offline)

### Mô hình tham khảo: UMC Care (BV Đại học Y Dược TP.HCM)
UMC có 4 dịch vụ đặt khám: **Theo chuyên khoa**, **Theo bác sĩ**, **Tiêm chủng**, **Thẩm mỹ**
Luồng 5 bước: Hồ sơ → Chọn thông tin → Xác nhận → Thanh toán → Hoàn tất

### Luồng đã thiết kế cho Viện YDHDT (3 hình thức)

**1️⃣ Đặt theo Chuyên khoa:**
```
Chọn Chuyên khoa → Chọn đối tượng (BHYT/DV/CG/NN) → Chọn Ngày+Giờ → Nhập TT bệnh nhân → BHYT (nếu có) → Thanh toán QR → STT
```

**2️⃣ Đặt theo Bác sĩ:**
```
Chọn Bác sĩ → Xem lịch trống → Chọn Ngày+Giờ → Chọn đối tượng → Nhập TT bệnh nhân → Thanh toán QR → STT
```

**3️⃣ Đặt theo Ngày:**
```
Chọn Ngày → Xem tất cả slot trống → Chọn Khoa+Giờ → Chọn đối tượng → Nhập TT bệnh nhân → Thanh toán QR → STT
```

### Luồng tại Bệnh viện (Khi BN đến khám)
- **Dịch vụ:** Bệnh nhân đưa Mã Phiếu + STT cho nhân viên tiếp nhận → Lấy số → Vào phòng khám
- **BHYT:** Bệnh nhân đưa Mã Phiếu + Thẻ BHYT vật lý + CCCD → Nhân viên quẹt thẻ xác minh → Lấy số → Vào phòng khám

> **LƯU Ý:** Viện hiện KHÔNG có máy Kiosk quét QR. Chỉ có máy in số thứ tự. Do đó hệ thống tự sinh STT thay vì yêu cầu quét QR.

---

## IV. THANH TOÁN VIETINBANK VIETQR

### Thông tin kết nối
- **API URL:** `https://api.vietinbank.vn/vtb/public/vietqr/v1/generator`
- **Xác thực:** `x-ibm-client-id` + `x-ibm-client-secret` (đọc từ .env)
- **Chứng chỉ IPN:** `docs/VietQRConnection/PRD_VIETINBANK_NOTIFYTRANS_CERT.cer1`
- **Chứng chỉ API:** `docs/VietQRConnection/PRD_VIETINBANK_API_CERT.cer1`
- **Mã BV:** `79426` (Viện YDHDT)

### Biến môi trường cần thiết (.env)
```
VIETINBANK_CLIENT_ID=<từ VietinBank portal>
VIETINBANK_CLIENT_SECRET=<từ VietinBank portal>
VIETINBANK_PROVIDER_ID=<provider ID>
VIETINBANK_MERCHANT_ID=<merchant ID>
VIETINBANK_ACCOUNT=<số tài khoản VietinBank>
VIETINBANK_CERT_PATH=<optional, mặc định đọc từ docs/>
```

### Luồng thanh toán
1. Frontend gọi `POST /api/payment/generate-qr` → Backend gọi VietinBank API → Trả về QR image
2. Bệnh nhân quét QR bằng app ngân hàng → Thanh toán
3. VietinBank gọi `POST /api/payment/webhook` (IPN) → Backend verify chữ ký RSA → Cập nhật trạng thái

> **Fallback (Dev):** Khi chưa kết nối được API thật, dùng VietQR.io public API render QR

---

## V. LỘ TRÌNH PHÁT TRIỂN (TIẾN ĐỘ)

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 1 | Khởi tạo Next.js + Design System | ✅ Hoàn thành |
| 2 | Layout (Header/Footer) | ✅ Hoàn thành |
| 3 | Trang chủ + Mock Data | ✅ Hoàn thành |
| 4 | Trang con (Dược liệu, Đặt lịch v1) | ✅ Hoàn thành |
| 5 | UI/UX Redesign (Framer Motion, AI Images) | ✅ Hoàn thành |
| 6 | Backend Express + SQLite | ✅ Hoàn thành (đã thay bằng Oracle) |
| 7 | — | Bỏ qua |
| 8 | Tái cấu trúc Monorepo + Oracle DB thật | ✅ Hoàn thành |
| 9 | Admin JWT Auth + Cookies | ✅ Hoàn thành |
| 10 | VietinBank VietQR + Booking 5-step + STT | ✅ Hoàn thành |
| **11** | **Advanced Booking Engine (3 luồng, BHYT, HIS APIs)** | **✅ Hoàn thành** |
| **12** | **HIS Write (INSERT W_HEN khi thanh toán OK)** | ⏳ Tiếp theo |
| 13 | Trợ lý AI Viện Y Dược (RAG + LLM) | 📋 Lên kế hoạch |
| 14 | CMS Quản lý Bài viết Y khoa | 📋 Lên kế hoạch |
| 15 | Bảng giá Dịch vụ (Dynamic từ HIS) | 📋 Lên kế hoạch |
| 16 | Trang Giới thiệu + Đội ngũ | 📋 Lên kế hoạch |
| 17 | SEO + Performance Optimization | 📋 Lên kế hoạch |
| 18 | Mobile App (React Native / Flutter) | 📋 Giai đoạn 2 |
| 19 | Đa ngôn ngữ (EN, 中文) | 📋 Giai đoạn 2 |
| 20 | Deploy Production (IIS + SSL) | 📋 Giai đoạn cuối |

---

## VI. HƯỚNG DẪN CHẠY DỰ ÁN

### Yêu cầu
- Node.js >= 20
- Oracle Instant Client (thick mode)
- Git

### Backend
```bash
cd backend
cp .env.example .env   # Sửa thông tin Oracle + VietinBank
npm install
npm run dev            # → http://localhost:4000
```

### Frontend
```bash
cd vien-ydh-frontend
cp .env.example .env.local   # Sửa NEXT_PUBLIC_API_URL
npm install
npm run dev            # → http://localhost:3000
```

### Git Flow
- `main` — Production
- `develop` — Staging
- `feature/phase-XX-*` — Feature branches
- **Nhánh hiện tại:** `feature/phase-10-cms`

---

## VII. API ENDPOINTS HIỆN CÓ

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | /api/departments | Danh sách khoa (HIS) | ❌ |
| GET | /api/doctors | Danh sách bác sĩ (HIS) | ❌ |
| GET | /api/doctors/:id/image | Ảnh bác sĩ (BLOB stream) | ❌ |
| POST | /api/appointments | Tạo lịch hẹn | ❌ |
| GET | /api/appointments | Xem lịch hẹn | ✅ JWT |
| POST | /api/auth/login | Đăng nhập Admin | ❌ |
| POST | /api/payment/generate-qr | Sinh mã QR VietinBank | ❌ |
| POST | /api/payment/webhook | IPN Webhook | Signature |
| GET | /api/booking/specialties | Chuyên khoa (HIS) | ❌ |
| GET | /api/booking/pricing | Bảng giá khám (HIS) | ❌ |
| GET | /api/booking/insurance-tuyen | Tuyến BHYT (HIS) | ❌ |
| GET | /api/booking/patient-types | Đối tượng BN (HIS) | ❌ |

---

## VIII. THÔNG TIN BỔ SUNG

### Tài khoản Admin mặc định
- Username: `admin`
- Password: `admin123`
- Bảng: `WEB_USERS` (Oracle, auto-created)

### Biến môi trường Backend (.env)
```
# Oracle Database
DB_USER=<user>
DB_PASSWORD=<password>
DB_HOST=192.168.1.113
DB_PORT=1521
DB_SID=medi

# JWT
JWT_SECRET=<secret>

# VietinBank (xem Section IV)
VIETINBANK_CLIENT_ID=
VIETINBANK_CLIENT_SECRET=
VIETINBANK_PROVIDER_ID=
VIETINBANK_MERCHANT_ID=
VIETINBANK_ACCOUNT=

# Server
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

### Quy ước Phát triển
1. Mỗi Phase xong → Double check → Tạo PR merge vào develop
2. Checkout sang branch mới cho Phase tiếp
3. Cập nhật file này sau mỗi Phase
4. Không hardcode bất kỳ key/secret nào trong source code
5. Mọi dữ liệu nhạy cảm đọc từ `.env` (đã gitignore)