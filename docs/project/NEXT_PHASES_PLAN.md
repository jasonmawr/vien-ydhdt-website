# TÀI LIỆU KẾ HOẠCH TRIỂN KHAI CÁC PHASE CUỐI (18, 19, 20)
*Dự án: Hệ thống Đặt Lịch Khám - Viện Y Dược Học Dân Tộc TPHCM*

Tài liệu này đóng vai trò là "Bản thiết kế thi công" (Blueprint) cho 3 giai đoạn cuối của dự án. Nhóm phát triển có thể dùng tài liệu này làm kim chỉ nam cho các phiên làm việc tiếp theo.

---

## 📱 Phase 18: Phát triển Mobile App (Giai đoạn 2)

**Mục tiêu:** Cung cấp ứng dụng di động trên iOS/Android để bệnh nhân dễ dàng đặt lịch, theo dõi lịch sử và nhận thông báo Push Notification.

**Lựa chọn Công nghệ:**
- Đề xuất sử dụng **Flutter** (ngôn ngữ Dart) hoặc **React Native** (để tận dụng lại kiến thức React/TypeScript hiện có).
- Với đặc thù dự án bệnh viện cần nhanh gọn, **React Native (Expo)** là lựa chọn số 1.

**Kiến trúc Triển khai (2 Phương án):**
1. **Phương án 1 (Nhanh - Tiết kiệm): WebView Wrapper**
   - Tạo một App Mobile đơn giản chỉ chứa lõi `WebView`. 
   - Nhúng trực tiếp URL của trang Web hiện tại (`https://datkham.viendongy.vn`) vào App. Vì web ta đã làm chuẩn "Mobile-first" 100%, trải nghiệm trên App WebView sẽ giống hệt Web.
   - Ưu điểm: Làm cực nhanh (1 ngày), không cần viết lại Logic giao diện.
2. **Phương án 2 (Native API - Chuyên sâu):**
   - Xây dựng lại toàn bộ giao diện bằng các Component của React Native.
   - Gọi API trực tiếp qua Backend Node.js hiện tại (`/api/appointments`, `/api/doctors`).
   - Ưu điểm: Hiệu năng cao nhất, tích hợp Push Notification (Firebase) mượt mà, lưu Cache offline tốt.

**Các bước thực hiện (Theo Phương án 2):**
- Khởi tạo thư mục `mobile-app` bằng Expo: `npx create-expo-app mobile-app -t expo-template-blank-typescript`
- Setup thư viện Axios gọi API, React Navigation để chuyển trang.
- Xây dựng lại màn hình Đặt Khám (5 bước) và màn hình Lịch sử Khám (đòi hỏi bệnh nhân đăng nhập).

---

## 🌐 Phase 19: Đa ngôn ngữ - i18n (Tiếng Anh, Tiếng Trung) — ✅ HOÀN THÀNH (2026-05-03)

**Mục tiêu:** Hỗ trợ bệnh nhân là người nước ngoài, du khách, hoặc chuyên gia y tế quốc tế có thể thao tác dễ dàng trên Web.

**Công nghệ đã chọn:** `next-intl` v4.10.0 — Cookie-based (without i18n routing)

**Kiến trúc Triển khai (Thực tế):**
1. **Phương pháp:** Cookie-based locale detection (Cookie `NEXT_LOCALE`) — KHÔNG dùng Sub-path Routing (`/en/...`). URL giữ nguyên tiếng Việt, ngôn ngữ chuyển qua cookie.
2. **Config:** `i18n/request.ts` sử dụng `getRequestConfig()` đọc cookie `NEXT_LOCALE` mỗi request.
3. **API:** `POST /api/locale` — Endpoint set cookie `NEXT_LOCALE`, LanguageSwitcher gọi API này rồi `router.refresh()`.
4. **Cấu trúc Dịch thuật:**
   - `messages/vi.json` (555 dòng, 27KB)
   - `messages/en.json` (558 dòng, 24KB)
   - `messages/zh.json` (558 dòng, 21KB)
5. **Integration:** `next.config.ts` wrapped với `createNextIntlPlugin()`.
6. **Lưu ý:** Dữ liệu từ Oracle HIS (Tên Khoa, Tên Bác sĩ) vẫn hiển thị Tiếng Việt. Nếu cần dịch động, phải thêm cột `NAME_EN`, `NAME_ZH` vào Database HIS hoặc tạo bảng Mapping.

---

## 🚀 Phase 20: Triển khai Production (Go-Live)

**Mục tiêu:** Đưa hệ thống từ máy tính Local lên Máy chủ (Server) thật của bệnh viện, cấu hình tên miền và bảo mật HTTPS để phục vụ bệnh nhân thực tế.

**Yêu cầu Môi trường Server:**
- Server dùng HĐH Windows Server (theo chuẩn bệnh viện) hoặc Linux (Ubuntu).
- Cài đặt sẵn: Node.js (v20+), Nginx (hoặc IIS), Oracle Instant Client (Thick mode).

**Các bước thực hiện Chi tiết:**

**1. Chuẩn bị mã nguồn (Build):**
- Frontend (Next.js): Chạy lệnh `npm run build` để sinh ra thư mục `.next` tối ưu.
- Backend (Express/TS): Chạy lệnh `npx tsc` để biên dịch toàn bộ TypeScript sang Javascript (thư mục `dist/`).

**2. Quản lý Tiến trình (Process Manager):**
- Không thể dùng `npm run dev` trên Production vì rủi ro sập do lỗi.
- BẮT BUỘC sử dụng **PM2** (Process Manager 2).
- Cài đặt: `npm install -g pm2`
- Khởi chạy Backend: `pm2 start dist/index.js --name "vien-ydh-api"`
- Khởi chạy Frontend: `pm2 start npm --name "vien-ydh-web" -- start`

**3. Cấu hình Reverse Proxy (Nginx / IIS):**
- Mở Port 80 (HTTP) và 443 (HTTPS) trên Firewall.
- Cấu hình Nginx (hoặc IIS) để:
  - Tất cả Request vào `https://datkham.viendongy.vn` sẽ điều hướng ngầm (Proxy Pass) vào port `3000` (Frontend).
  - Tất cả Request vào `https://datkham.viendongy.vn/api` sẽ điều hướng ngầm vào port `4000` (Backend).

**4. Bảo mật (SSL/TLS):**
- Yêu cầu bộ phận IT cung cấp file Chứng chỉ SSL (`.crt` và `.key`).
- Gắn vào cấu hình Nginx/IIS để trang web có biểu tượng Ổ khóa xanh (HTTPS), đảm bảo an toàn thanh toán và chống đánh cắp dữ liệu bệnh nhân.

**5. Kiểm thử Go-Live:**
- Kiểm tra tính năng sinh QR Code (Bật cờ Live ở cổng VietinBank IPN thật).
- Kiểm tra kết nối mạng nội bộ (LAN) từ Server Backend Node.js tới Server Oracle HIS của viện.
- Theo dõi log bằng lệnh `pm2 logs`.
