# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG NỀN TẢNG SỐ (GO-LIVE PLAN)
## VIỆN Y DƯỢC HỌC DÂN TỘC THÀNH PHỐ HỒ CHÍ MINH

Nài liệu này trình bày phương án triển khai sản xuất (Go-live) cho Cổng thông tin trực tuyến và Hệ thống đặt lịch khám bệnh tích hợp thanh toán tự động của Viện Y Dược Học Dân Tộc TP.HCM trên hạ tầng máy chủ Windows Server được cấp phát riêng biệt.

---

## 1. PHƯƠNG ÁN HẠ TẦNG & KIẾN TRÚC MÁY CHỦ

### 1.1. Hiện trạng Hạ tầng
*   **Địa chỉ IP Máy chủ ảo:** `192.168.1.34` (Tách ra từ Máy chủ vật lý tổng `SVR01`).
*   **Hệ điều hành:** Windows Server (64-bit).
*   **Tài khoản Quản trị:** `Administrator` / `Admin@123!@#`.
*   **Cơ sở dữ liệu đích:** Oracle HIS (`192.168.1.113:1521/medi`).
*   **Rào cản kỹ thuật với Docker:** Máy chủ ảo không hỗ trợ ảo hóa lồng nhau (Nested Virtualization), do đó không cài đặt được Docker/WSL2.

### 1.2. Giải pháp Kiến trúc: Triển khai Native sử dụng IIS làm Reverse Proxy
Để khắc phục hoàn toàn rào cản Docker, hệ thống được triển khai native trực tiếp trên nền tảng Windows Server nhằm đạt hiệu năng tối đa và độ ổn định cao nhất:

```
[ Người dùng truy cập Internet ]
               │
               ▼ (Cổng 80 / 443)
┌─────────────────────────────────────────────────────────┐
│              MÁY CHỦ ẢO (192.168.1.34)                  │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │        IIS (Web Server & Reverse Proxy)         │   │
│   │                                                 │   │
│   │  - /api/* ──► Forward sang Backend (Port 4000)  │   │
│   │  - /*     ──► Forward sang Frontend (Port 3000) │   │
│   └─────────────────────────────────────────────────┘   │
│            │                               │            │
│            ▼                               ▼            │
│  ┌──────────────────┐            ┌──────────────────┐   │
│  │ Backend (Express)│            │  Frontend (Next) │   │
│  │  Windows Service │            │  Windows Service │   │
│  │    (Port 4000)   │            │    (Port 3000)   │   │
│  └──────────────────┘            └──────────────────┘   │
│            │                                            │
└────────────┼────────────────────────────────────────────┘
             │ (Kết nối mạng nội bộ)
             ▼
┌─────────────────────────────────────────────────────────┐
│           MÁY CHỦ DỮ LIỆU ORACLE HIS (Viện)             │
│               IP: 192.168.1.113:1521/medi               │
└─────────────────────────────────────────────────────────┘
```

1.  **IIS (Internet Information Services):** Đóng vai trò là cổng tiếp nhận duy nhất (Cổng 80/443), phân luồng thông minh thông qua Module **URL Rewrite** và **Application Request Routing (ARR)**:
    *   Mọi yêu cầu gọi API `/api/*` sẽ được IIS chuyển tiếp nội bộ về **Backend Node.js** (chạy tại cổng `4000`).
    *   Mọi yêu cầu tải trang giao diện `/*` sẽ được IIS chuyển tiếp về **Frontend Next.js** (chạy tại cổng `3000`).
2.  **Windows Services:** Cả Backend và Frontend sẽ được đăng ký chạy ngầm như các Dịch vụ hệ thống (Windows Services) bằng công cụ **NSSM (Non-Sucking Service Manager)** cực kỳ nhẹ. Các dịch vụ này tự khởi động khi máy chủ bật, tự khởi động lại khi gặp sự cố, đảm bảo hoạt động 24/7 không gián đoạn.

---

## 2. QUY TRÌNH THIẾT LẬP MÁY CHỦ (CHỈ CẦN LÀM 1 LẦN)

Để chuẩn bị cho việc triển khai, quản trị viên hệ thống của Viện cần thực hiện các bước cấu hình ban đầu sau trên máy chủ `192.168.1.34`:

### Bước 2.1: Cài đặt Node.js & Git
1. Tải và cài đặt **Node.js LTS** (khuyến nghị phiên bản 18 hoặc 20) từ trang chủ [nodejs.org](https://nodejs.org/).
2. Chọn cài đặt cả công cụ build tự động và kiểm tra bằng lệnh trong CMD/PowerShell:
   ```bash
   node -v
   npm -v
   ```

### Bước 2.2: Cài đặt & Cấu hình IIS + URL Rewrite + ARR
1.  **Kích hoạt IIS:** Vào *Server Manager* -> *Add Roles and Features* -> Chọn *Web Server (IIS)* và kích hoạt.
2.  **Cài đặt Module URL Rewrite:** Tải và cài đặt từ trang chủ Microsoft:
    *   [URL Rewrite 2.1](https://www.iis.net/downloads/microsoft/url-rewrite)
3.  **Cài đặt Module Application Request Routing (ARR):**
    *   [ARR 3.0](https://www.iis.net/downloads/microsoft/application-request-routing)
4.  **Bật Proxy trong ARR:**
    *   Mở *IIS Manager* -> Chọn tên máy chủ -> Chọn *Application Request Routing Cache*.
    *   Ở khung bên phải, chọn *Server Proxy Settings*.
    *   Tích chọn **Enable proxy** -> Bấm *Apply*.

### Bước 2.3: Tải NSSM (Non-Sucking Service Manager)
1. Tải file zip NSSM từ [nssm.cc/download](https://nssm.cc/download).
2. Giải nén và copy file `nssm.exe` (thư mục `win64`) vào một thư mục tiện ích trong máy chủ (ví dụ `C:\nssm\nssm.exe`) và thêm đường dẫn này vào System PATH để có thể chạy lệnh từ bất kỳ đâu.

---

## 3. THIẾT LẬP MÔI TRƯỜNG SẢN XUẤT (.env)

Khi triển khai lên server, các file `.env` sẽ được tự động đồng bộ hóa:

### 3.1. File `backend/.env` (Backend Production)
```env
PORT=4000
NODE_ENV=production

# Kết nối CSDL Oracle HIS của Viện
DB_USER=system
DB_PASSWORD=hssmedi123a
DB_CONNECT_STRING=192.168.1.113:1521/medi
ORACLE_PATH=C:\oracle\instantclient_19_12

# Địa chỉ Frontend được phép truy cập
FRONTEND_URL=http://localhost:3000
```

### 3.2. File `vien-ydh-frontend/.env` (Frontend Production)
```env
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://192.168.1.34/api
```

---

## 4. KỊCH BẢN TRIỂN KHAI TỰ ĐỘNG BẰNG POWERSHELL (`deploy-windows-server.ps1`)

Để tối ưu hóa thời gian và giảm thiểu rủi ro thao tác tay, một tập lệnh PowerShell tự động (`deploy-windows-server.ps1`) đã được xây dựng sẵn ở thư mục gốc của dự án. Quản trị viên chỉ cần chạy tập lệnh này từ máy cá nhân (Dev):

### 4.1. Cách thức Hoạt động của Script:
1.  **Biên dịch sản xuất (Build):** Thực hiện `npm run build` cho cả Backend và Frontend để tối ưu dung lượng và tốc độ tải trang.
2.  **Nén gói tin (Pack ZIP):** Nén toàn bộ mã nguồn sạch của Backend và Frontend thành hai file `.zip` (bỏ qua `node_modules` không cần thiết để truyền dữ liệu qua mạng nội bộ nhanh nhất).
3.  **Kết nối ổ đĩa mạng (Mount SMB):** Tự động ánh xạ thư mục hệ thống máy chủ `\\192.168.1.34\C$` thành ổ đĩa ảo `Z:` trên máy Dev bằng thông tin tài khoản quản trị được cấp.
4.  **Tạm dừng dịch vụ cũ:** Ra lệnh cho máy chủ tắt tạm thời các dịch vụ cũ đang chạy ngầm để giải phóng file hệ thống.
5.  **Sao chép và giải nén:** Chép hai file `.zip` lên thư mục triển khai của máy chủ (`C:\inetpub\wwwroot\vien-ydh-website\`) và thực hiện giải nén tức thì qua lệnh PowerShell từ xa.
6.  **Đăng ký & Khởi chạy Windows Services:** Kiểm tra nếu dịch vụ chưa được đăng ký, script sẽ gọi `NSSM` đăng ký dịch vụ `VienYDHDT_API` và `VienYDHDT_WEB`, sau đó khởi động lại chúng.
7.  **Kết quả:** Hệ thống chính thức chạy mượt mà trên server ảo của Viện.

---

## 5. KẾ HOẠCH BÀN GIAO & NGHIỆM THU (VERIFICATION PLAN)

### 5.1. Các phần đã tối ưu hóa và kiểm tra cục bộ đạt 100% độ chính xác:
1.  **Giao diện Language Switcher nhỏ gọn, sang trọng:**
    *   Khắc phục hoàn toàn lỗi hiển thị cờ trên hệ điều hành Windows (vốn không hỗ trợ emoji cờ và hiển thị thành các ký tự viết tắt như `VN`, `US`, `CN` gây tràn viền nút bấm).
    *   Hỗ trợ chế độ siêu nhỏ gọn (`compact={true}`) chỉ hiển thị biểu tượng Quả địa cầu và mã ngôn ngữ (`VI`, `EN`, `ZH`) tinh tế, giúp menu bar không bị lệch trên bất kỳ độ phân giải nào.
2.  **Khắc phục lỗi lệch Menu Bar trên toàn trang:**
    *   Đồng bộ hóa kích thước chữ của biểu tượng/logo trên toàn bộ trang chủ (`landing-page.tsx`) và trang con (`Header.tsx`) chuẩn kích thước nhỏ gọn (`text-[13px]` và `text-[11px]`), mở rộng không gian cho menu điều hướng.
3.  **Mở rộng bộ dữ liệu giả lập bác sĩ (Oracle HIS Simulator):**
    *   Mở rộng danh sách lên **10 Bác sĩ chuyên khoa đầu ngành** với đầy đủ thông tin (Học hàm, Học vị, Chuyên khoa, Số điện thoại, Kinh nghiệm lâm sàng...).
    *   Danh sách bác sĩ ở trang Giới thiệu, trang Đặt lịch khám và Trang Quản trị Admin của nhân viên viện đã hiển thị đầy đủ, phong phú và chính xác tuyệt đối, không còn bị giới hạn ở 4 bác sĩ như trước.

### 5.2. Các bước nghiệm thu thực tế trên máy chủ:
1.  **Kiểm tra dịch vụ hoạt động:** Truy cập máy chủ `192.168.1.34`, mở CMD gõ `sc query VienYDHDT_API` và `sc query VienYDHDT_WEB` để đảm bảo trạng thái dịch vụ đang ở dạng `RUNNING`.
2.  **Kiểm tra tính kết nối:**
    *   Mở trình duyệt gõ `http://192.168.1.34/api/health` hoặc API tương ứng để xem phản hồi kết nối thành công với database Oracle HIS.
    *   Mở trình duyệt truy cập `http://192.168.1.34` để kiểm tra độ mượt mà của Cổng thông tin.
3.  **Xác minh tính năng:**
    *   Mở chatbot AI, các biểu tượng chia sẻ mạng xã hội góc phải phải ẩn đi linh động để không che chatbot.
    *   Thực hiện đặt lịch khám thử, chọn các bác sĩ mới thêm để kiểm tra đồng bộ dữ liệu.
