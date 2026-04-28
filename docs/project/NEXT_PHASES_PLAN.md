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

## 🌐 Phase 19: Đa ngôn ngữ - i18n (Tiếng Anh, Tiếng Trung)

**Mục tiêu:** Hỗ trợ bệnh nhân là người nước ngoài, du khách, hoặc chuyên gia y tế quốc tế có thể thao tác dễ dàng trên Web.

**Lựa chọn Công nghệ:**
- Thư viện: `next-intl` (Khuyên dùng nhất cho Next.js App Router hiện tại) hoặc `react-i18next`.

**Kiến trúc Triển khai:**
1. **Routing:** Sử dụng cơ chế Sub-path Routing của Next.js (VD: `/en/dat-kham`, `/zh/dat-kham`).
2. **Cấu trúc Dịch thuật (Dictionaries):**
   - Tạo thư mục `messages/` ở gốc Frontend.
   - Cấu trúc file: `vi.json`, `en.json`, `zh.json`.
   - Ví dụ `en.json`: `{ "booking": { "step1": "Select Department", "btn_next": "Continue" } }`
3. **Database (Dữ liệu động):**
   - Các dữ liệu lấy từ Oracle HIS (Tên Khoa, Tên Bác sĩ) hiện đang là Tiếng Việt.
   - Cần thêm cột `NAME_EN`, `NAME_ZH` vào Database (Nếu được phép can thiệp), hoặc tạo một bảng Mapping/Dictionary ở phía Backend Node.js để tự động dịch Tên Khoa sang Tiếng Anh/Trung trước khi trả về API.

**Các bước thực hiện:**
- Cài đặt `npm install next-intl`.
- Chuyển toàn bộ các chuỗi văn bản (hard-code) trong `BookingForm.tsx` thành các biến dịch `t('booking.step1')`.
- Tạo Component `LanguageSwitcher` trên Header (Cờ VN, Cờ Anh, Cờ Trung Quốc).

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
