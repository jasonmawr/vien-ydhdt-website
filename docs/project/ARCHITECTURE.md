# **KIẾN TRÚC HỆ THỐNG & CẤU TRÚC THƯ MỤC**

*Tài liệu chuẩn - Cập nhật: 2026-04-22*

## **1. KIẾN TRÚC TỔNG THỂ (DUAL-DB ARCHITECTURE)**

Hệ thống của Viện Y Dược Học Dân Tộc được thiết kế theo kiến trúc **Monorepo** với sự phân tách rõ ràng giữa Frontend và Backend. Đặc biệt, hệ thống áp dụng mô hình **Dual-Database (Hai cơ sở dữ liệu song song)** để đảm bảo an toàn tuyệt đối cho Dữ liệu Y tế (HIS) và tối ưu hóa cho Dữ liệu Nội dung (CMS).

### Sơ đồ Hệ thống:
- **Frontend Client (Port 3000):** Next.js (App Router), React 19, Tailwind v4. Proxy toàn bộ `/api/*` về Backend qua `rewrites` trong `next.config.ts` để hỗ trợ Mobile LAN.
- **Backend API (Port 4000):** Express.js, TypeScript. Đóng vai trò làm Controller giao tiếp với 2 Cơ sở dữ liệu.
- **Database 1 (Core HIS):** Oracle 11g (`192.168.1.113:1521/medi`). Chứa dữ liệu lâm sàng và cấu hình bệnh viện.
- **Database 2 (Web CMS):** SQLite nội bộ của Backend (sau này có thể đổi qua PostgreSQL). Chứa dữ liệu nội dung bài viết, tin tức, cấu hình web.

## **2. QUYẾT ĐỊNH KIẾN TRÚC LƯU TRỮ (ARCHITECTURAL DECISION)**

### A. Dữ liệu Y tế (Oracle HIS)
- **Nội dung:** Danh sách Bác sĩ, Chuyên khoa, Bảng giá, Đối tượng BHYT, Lịch khám đặt trước (`W_HEN`, `TIEPDON`).
- **Cách thức:** Backend sử dụng `oracledb` thick-client để truy vấn **Real-time** từ Oracle.
- **Lý do:** Single Source of Truth (Nguồn chân lý duy nhất). Đảm bảo website hiển thị giá khám, bác sĩ chính xác 100% với những gì Lễ tân và Kế toán đang thấy trong bệnh viện. Đặt lịch khám xong là có số thứ tự ngay.

### B. Dữ liệu Nội dung Website (Web CMS Database)
- **Nội dung:** Bài viết Y khoa, Tin tức hoạt động, Quản lý tài khoản Admin Web, Banners, Meta SEO, Hồ sơ chi tiết của Bác sĩ (Tiểu sử dài, hình ảnh chuyên sâu).
- **Cách thức:** Backend sử dụng CSDL riêng (hiện tại là SQLite, file lưu tại thư mục backend).
- **Lý do:** 
  1. **Bảo mật:** Cô lập hoàn toàn tấn công web (SQL Injection) khỏi CSDL bệnh án Oracle.
  2. **Hiệu suất:** Tách tải đọc báo, xem tin tức khỏi máy chủ Oracle để Oracle chuyên tâm xử lý tiếp đón và toa thuốc.
  3. **Không rác HIS:** Không tạo các bảng `WEB_POSTS` không liên quan vào Schema `MEDI` của phòng IT.
  4. **Data Blending (Kết hợp dữ liệu):** Khi hiển thị danh sách bác sĩ lên web, Backend sẽ lấy Tên/Chức vụ từ Oracle, và lấy Tiểu sử/Bài viết từ Web DB để ghép lại thành 1 Profile hoàn chỉnh.

## **3. SQLITE LÀ GÌ VÀ DEPLOY NHƯ THẾ NÀO?**

- **SQLite là gì?** Nó là một cơ sở dữ liệu quan hệ (RDBMS) cực kỳ nhẹ, không cần cài đặt dịch vụ (serverless). Toàn bộ dữ liệu của website (bài viết, user admin) sẽ được lưu gọn gàng vào duy nhất **1 file vật lý** (ví dụ: `database.sqlite`) nằm ngay trong thư mục code `backend/`.
- **Deploy lên Server ảo (VM) của Viện có dễ không?** CỰC KỲ DỄ DÀNG. 
  - Vì nó chỉ là 1 file, khi bạn copy code lên Server bằng Git, hệ thống sẽ tự động tạo file này nếu chưa có.
  - Chạy `npm run dev` hoặc `pm2` là xong. Bạn không cần phải cài đặt cấu hình rườm rà như SQL Server hay MySQL. 
  - Rất phù hợp cho Web CMS lưu lượng vừa và nhỏ. Việc Backup cũng chỉ đơn giản là copy file `database.sqlite` cất đi.

## **4. CẤU TRÚC THƯ MỤC**

```
vien-ydhdt-website/
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── shared/
│   │   │   ├── database.ts     # Oracle connection pool
│   │   │   └── sqlite.ts       # Nơi thiết lập Web CMS Database
│   │   ├── modules/
│   │   │   ├── his/            # Chuyên trách giao tiếp Oracle HIS
│   │   │   └── cms/            # Chuyên trách giao tiếp Web DB (Bài viết, Auth)
├── vien-ydh-frontend/          # Next.js Frontend
│   ├── src/
│   │   ├── app/                
│   │   │   ├── (main)/         # Trang public (Home, Đặt lịch, Tin tức)
│   │   │   └── admin/          # Admin Dashboard (Protected)
│   │   ├── components/         
│   │   ├── services/
│   │   │   └── api.ts          # SSOT Data Fetching
```