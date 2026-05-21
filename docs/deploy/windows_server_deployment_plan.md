# KẾ HOẠCH TRIỂN KHAI NATIVE WINDOWS SERVER
## HỆ THỐNG CỔNG THÔNG TIN & ĐẶT LỊCH KHÁM - VIỆN Y DƯỢC HỌC DÂN TỘC

Tài liệu này mô tả chi tiết kế hoạch triển khai chính thức (Go-live) hệ thống Cổng thông tin trực tuyến và Đặt lịch khám bệnh tích hợp thanh toán tự động của Viện Y Dược Học Dân Tộc Thành Phố Hồ Chí Minh trên hạ tầng máy chủ vật lý chạy hệ điều hành Windows Server.

---

## 1. PHƯƠNG ÁN KIẾN TRÚC & HẠ TẦNG

### 1.1. Thông số Cấu hình Máy chủ ảo
*   **Địa chỉ IP Máy chủ ảo:** `192.168.1.34` (Tách ra từ Máy chủ vật lý tổng `SVR01`).
*   **Hệ điều hành:** Windows Server (64-bit).
*   **Tài khoản Quản trị:** `Administrator` / `Admin@123!@#`.
*   **Cơ sở dữ liệu đích:** Oracle HIS của Viện (`192.168.1.113:1521/medi`).
*   **Rào cản kỹ thuật:** Máy chủ ảo không hỗ trợ ảo hóa lồng nhau (Nested Virtualization), do đó không cài đặt được Docker/WSL2.

### 1.2. Giải pháp Kiến trúc: Triển khai Native sử dụng IIS làm Reverse Proxy
Để khắc phục hoàn toàn rào cản của Docker và tận dụng tối đa sức mạnh phần cứng của Windows Server, hệ thống được triển khai Native trực tiếp trên hệ điều hành thông qua kiến trúc sau:

```
[ Người dùng truy cập Internet / Nội bộ ]
                  │
                  ▼ (Cổng 80 / 443)
┌─────────────────────────────────────────────────────────┐
│               MÁY CHỦ ẢO (192.168.1.34)                 │
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
│            MÁY CHỦ DỮ LIỆU ORACLE HIS (Viện)            │
│               IP: 192.168.1.113:1521/medi               │
└─────────────────────────────────────────────────────────┘
```

1.  **IIS (Internet Information Services):** Đóng vai trò là cổng tiếp nhận duy nhất (Cổng 80/443), phân luồng thông minh thông qua Module **URL Rewrite** và **Application Request Routing (ARR)**:
    *   Mọi yêu cầu gọi API `/api/*` sẽ được IIS chuyển tiếp nội bộ về **Backend Node.js** (chạy tại cổng `4000`).
    *   Mọi yêu cầu tải trang giao diện `/*` sẽ được IIS chuyển tiếp về **Frontend Next.js** (chạy tại cổng `3000`).
2.  **Windows Services:** Cả Backend và Frontend sẽ được đăng ký chạy ngầm dưới dạng Dịch vụ hệ thống (Windows Services) bằng công cụ **NSSM (Non-Sucking Service Manager)** cực kỳ nhẹ. Các dịch vụ này tự khởi động khi máy chủ bật, tự khởi động lại khi gặp sự cố, đảm bảo hoạt động 24/7 không gián đoạn.

---

## 2. QUY TRÌNH THIẾT LẬP MÁY CHỦ (CHỈ CẦN LÀM 1 LẦN)

Để chuẩn bị cho việc triển khai, quản trị viên hệ thống của Viện cần thực hiện các bước cấu hình ban đầu sau trên máy chủ `192.168.1.34`:

### Bước 2.1: Cài đặt Node.js & Git
1. Tải và cài đặt **Node.js phiên bản LTS** (Long Term Support - Khuyến nghị chọn **v22.22.3 LTS** hoặc **v24.15.0 LTS** có nút màu xanh lam trên trang chủ [nodejs.org](https://nodejs.org/)).
   > [!IMPORTANT]
   > Hãy chọn bản **LTS (Long Term Support)** thay vì bản "Hiện hành" (Current / v25, v26). Bản LTS là bản ổn định lâu dài dành cho máy chủ doanh nghiệp/bệnh viện, đảm bảo tính bảo mật và tương thích tốt nhất. Các bản "Hiện hành" chứa nhiều tính năng thử nghiệm có thể hoạt động không ổn định.
2. Chọn cài đặt cả công cụ build tự động và kiểm tra bằng lệnh trong CMD/PowerShell:
   ```powershell
   node -v
   npm -v
   ```

### Bước 2.2: Cài đặt & Cấu hình IIS + URL Rewrite + ARR
1.  **Kích hoạt IIS:** Vào *Server Manager* -> *Add Roles and Features* -> Chọn *Web Server (IIS)* và kích hoạt.
2.  **Cấu hình Cổng (Port) cho Website:**
    > [!IMPORTANT]
    > **Lưu ý về xung đột cổng:** Do cổng `5080` trên máy chủ `192.168.1.34` đang được sử dụng bởi một phần mềm khác của Viện, chúng ta tuyệt đối không cấu hình IIS cho website này chạy cổng `5080`.
    > Thay vào đó, hãy cấu hình IIS lắng nghe trên **cổng `80` (Cổng HTTP chuẩn)**. Khi sử dụng cổng `80`, người dùng chỉ cần gõ địa chỉ IP `http://192.168.1.34` là có thể truy cập thẳng vào hệ thống mà không cần gõ thêm bất kỳ số cổng nào đằng sau, tăng độ chuyên nghiệp và bảo mật.
3.  **Cài đặt Module URL Rewrite:** Tải và cài đặt từ trang chủ Microsoft:
    *   [URL Rewrite 2.1](https://www.iis.net/downloads/microsoft/url-rewrite)
4.  **Cài đặt Module Application Request Routing (ARR):**
    *   [ARR 3.0](https://www.iis.net/downloads/microsoft/application-request-routing)
5.  **Bật Proxy trong ARR:**
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

## 5. BÁO CÁO HOÀN THIỆN GIAO DIỆN & TÍNH NĂNG

### 5.1. Các phần đã tối ưu hóa đạt 100% độ chính xác:
1.  **Thương hiệu chuẩn "VIỆN Y DƯỢC HỌC DÂN TỘC":**
    *   Khắc phục hoàn toàn lỗi lệch chữ, xuống dòng sai của thương hiệu Viện. Tên đơn vị luôn luôn nằm trọn vẹn trên hàng đầu và cụm từ "THÀNH PHỐ HỒ CHÍ MINH" nằm trọn vẹn ở hàng dưới, tuyệt đối không viết tắt.
    *   Hỗ trợ hoàn hảo và đồng bộ ở cả 3 phiên bản ngôn ngữ (Tiếng Việt, Tiếng Anh, Tiếng Trung) trên mọi kích thước màn hình.
2.  **Giao diện Language Switcher nhỏ gọn, sang trọng:**
    *   Khắc phục hoàn toàn lỗi hiển thị cờ trên hệ điều hành Windows (vốn hiển thị thành các ký tự viết tắt gây mất thẩm mỹ).
    *   Hỗ trợ chế độ siêu nhỏ gọn (`compact={true}`) chỉ hiển thị biểu tượng Quả địa cầu và mã ngôn ngữ (`VI`, `EN`, `ZH`) tinh tế, giúp menu bar không bị lệch trên bất kỳ độ phân giải nào.
3.  **Mở rộng bộ dữ liệu giả lập bác sĩ (Oracle HIS Simulator):**
    *   Mở rộng danh sách lên **10 Bác sĩ chuyên khoa đầu ngành** với đầy đủ thông tin (Học hàm, Học vị, Chuyên khoa, Số điện thoại, Kinh nghiệm lâm sàng...).
    *   Danh sách bác sĩ ở trang Giới thiệu, trang Đặt lịch khám và Trang Quản trị Admin của nhân viên viện đã hiển thị đầy đủ, phong phú và chính xác tuyệt đối.

---

## 6. KẾ HOẠCH BÀN GIAO & NGHIỆM THU

### Các bước nghiệm thu thực tế trên máy chủ:
1.  **Kiểm tra dịch vụ hoạt động:** Truy cập máy chủ `192.168.1.34`, mở CMD gõ `sc query VienYDHDT_API` và `sc query VienYDHDT_WEB` để đảm bảo trạng thái dịch vụ đang ở dạng `RUNNING`.
2.  **Kiểm tra tính kết nối:**
    *   Mở trình duyệt gõ `http://192.168.1.34/api/health` để xem phản hồi kết nối thành công với database Oracle HIS.
    *   Mở trình duyệt truy cập `http://192.168.1.34` để kiểm tra độ mượt mà của Cổng thông tin.
3.  **Xác minh tính năng:**
    *   Mở chatbot AI, các biểu tượng chia sẻ mạng xã hội góc phải phải ẩn đi linh động khi chatbot mở để không che màn hình.
    *   Thực hiện đặt lịch khám thử, chọn các bác sĩ mới thêm để kiểm tra đồng bộ dữ liệu.
