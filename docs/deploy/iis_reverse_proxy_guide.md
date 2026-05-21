# HƯỚNG DẪN CẤU HÌNH REVERSE PROXY TRÊN IIS (NATIVE WINDOWS SERVER)
## ĐIỀU HƯỚNG CỔNG THÔNG TIN & API KHÁM BỆNH - VIỆN Y DƯỢC HỌC DÂN TỘC

Hướng dẫn này giúp Quản trị viên hệ thống của Viện thực hiện cấu hình **Internet Information Services (IIS)** làm **Reverse Proxy** để nhận yêu cầu từ cổng tiêu chuẩn `80` (hoặc `443` HTTPS) và phân phối thông minh:
*   Mọi request đến `/api/*` ──► Chuyển tiếp về **Node.js API Backend** (cổng `4000`).
*   Mọi request tải trang `/*` ──► Chuyển tiếp về **Next.js Web Frontend** (cổng `3000`).

---

## BƯỚC 1: CÀI ĐẶT CÁC CÔNG CỤ TIỀN ĐỀ

Trước khi cấu hình trên IIS, máy chủ cần được cài đặt hai module chính thức từ Microsoft:

1.  **URL Rewrite Module 2.1:**
    *   *Mục đích:* Dùng để viết lại các đường dẫn (Rewrite URL) và chuyển hướng yêu cầu.
    *   *Link tải:* [Microsoft URL Rewrite Downloads](https://www.iis.net/downloads/microsoft/url-rewrite)
2.  **Application Request Routing (ARR) 3.0:**
    *   *Mục đích:* Kích hoạt tính năng ủy quyền (Proxy) trên IIS, cho phép IIS nhận request và gửi tiếp đến một cổng hoặc server khác.
    *   *Link tải:* [Microsoft Application Request Routing Downloads](https://www.iis.net/downloads/microsoft/application-request-routing)

> [!IMPORTANT]
> Sau khi cài đặt xong hai công cụ trên, hãy khởi động lại dịch vụ IIS bằng cách mở CMD chạy lệnh `iisreset` để IIS nhận diện đầy đủ các module mới.

---

## BƯỚC 2: BẬT TÍNH NĂNG PROXY TRÊN ARR

Đây là bước cực kỳ quan trọng. Nếu không bật, IIS sẽ báo lỗi `403` hoặc không chuyển tiếp gói tin được.

### Sơ đồ giao diện IIS Manager:
```
┌─────────────────────────────────────────────────────────────┐
│ Internet Information Services (IIS) Manager                 │
├─────────────────────────────────────────────────────────────┤
│ Connections      │  [TÊN MÁY CHỦ] Home                       │
│ 🏙️ SVR-WEB34      │  Double-click vào biểu tượng:            │
│  └─ Sites        │  📶 Application Request Routing Cache    │
│                  └──────────────────────────────────────────┤
│                     Actions (Cột bên phải)                  │
│                     👉 Click: Server Proxy Settings...       │
└─────────────────────────────────────────────────────────────┘
```

### Các bước thực hiện bằng hình ảnh/thao tác chi tiết:
1.  Mở **IIS Manager** (Gõ `inetmgr` trong cửa sổ Run).
2.  Tại cột **Connections** ở bên trái, nhấp chọn vào **Tên Máy Chủ** (ví dụ `SVR-WEB34` hoặc tên máy tính của bạn).
3.  Ở khu vực chính giữa, double-click vào biểu tượng **Application Request Routing Cache**.
4.  Tại cột **Actions** ở bên phải, nhấp vào liên kết **Server Proxy Settings...**.
5.  Trang cấu hình hiện ra, tích chọn vào ô **Enable proxy**.
6.  *Lưu ý cấu hình tối ưu:*
    *   **Keep alive:** Tích chọn (để giữ kết nối bền vững, tăng tốc độ gọi API).
    *   **Time-out (seconds):** Thiết lập `120` (để tránh ngắt kết nối khi các API xử lý báo cáo Oracle HIS mất thời gian).
7.  Nhấp vào nút **Apply** ở cột bên phải để lưu cấu hình.

---

## BƯỚC 3: CẤU HÌNH FILE `WEB.CONFIG` ĐIỀU HƯỚNG TỰ ĐỘNG

Cách nhanh nhất, chuyên nghiệp nhất và tránh sai sót khi thao tác bằng giao diện là cấu hình file cấu hình `web.config` trực tiếp tại thư mục gốc của trang web trên IIS (`C:\inetpub\wwwroot\vien-ydh-website`).

Khi chạy, IIS sẽ tự động đọc file này và áp dụng 2 quy tắc điều hướng thông minh.

### 📝 Nội dung file `C:\inetpub\wwwroot\vien-ydh-website\web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <clear />
        
        <!-- RULE 1: FORWARD ALL API REQUESTS (/api/*) TO BACKEND (PORT 4000) -->
        <rule name="ReverseProxy_Backend_API" stopProcessing="true">
          <match url="^api/(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false" />
          <action type="Rewrite" url="http://127.0.0.1:4000/api/{R:1}" />
        </rule>
        
        <!-- RULE 2: FORWARD OTHER REQUESTS TO FRONTEND NEXT.JS (PORT 3000) -->
        <rule name="ReverseProxy_Frontend_NextJS" stopProcessing="true">
          <match url="^(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <!-- Exclude static files and direct backend requests if any -->
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>
        
      </rules>
    </rewrite>
    <directoryBrowse enabled="false" />
    <httpErrors errorMode="Detailed" />
  </system.webServer>
</configuration>
```

---

## BƯỚC 4: XÁC MINH VÀ KIỂM TRA LƯU LƯỢNG

Sau khi đã lưu file `web.config` vào thư mục của Website, bạn có thể thực hiện kiểm tra hoạt động trực tiếp:

1.  **Kiểm tra tính kết nối của Cổng thông tin:**
    *   Mở trình duyệt trên máy của bạn và truy cập `http://192.168.1.34/`.
    *   IIS sẽ bắt yêu cầu này, đối chiếu với Quy tắc 2, thấy không khớp với `/api/`, và chuyển tiếp ngầm tới `http://127.0.0.1:3000` (Next.js). Trang chủ Viện Y Dược Học Dân Tộc sẽ hiện lên mượt mà.
2.  **Kiểm tra tính kết nối của Hệ thống API & Database:**
    *   Truy cập đường dẫn `http://192.168.1.34/api/health` hoặc gọi thử API danh sách bác sĩ.
    *   IIS sẽ đối chiếu với Quy tắc 1, nhận diện đường dẫn khớp với `api/*`, thực hiện viết lại thành `http://127.0.0.1:4000/api/health` và trả về kết quả JSON từ Backend Node.js.

---

## BƯỚC 5: MỘT SỐ LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC

*   **Lỗi `HTTP Error 500.50 - URL Rewrite Module Error`:**
    *   *Nguyên nhân:* Chưa cài đặt module URL Rewrite hoặc file `web.config` bị lỗi cú pháp XML (thiếu dấu đóng tag).
    *   *Khắc phục:* Cài đặt lại URL Rewrite 2.1 và kiểm tra tính hợp lệ của file XML.
*   **Lỗi `HTTP Error 403.9 - Forbidden` hoặc `502.3 - Bad Gateway`:**
    *   *Nguyên nhân:* Dịch vụ Backend (cổng `4000`) hoặc Frontend (cổng `3000`) chưa được bật, hoặc chưa tích chọn **Enable proxy** trong Application Request Routing.
    *   *Khắc phục:* Kiểm tra dịch vụ Windows ngầm (`VienYDHDT_API` và `VienYDHDT_WEB`) đã `Running` chưa bằng lệnh `Get-Service VienYDHDT_*`. Kiểm tra xem đã bật Enable Proxy trong IIS ARR chưa.
