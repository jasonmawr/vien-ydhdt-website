# Nhật ký bàn giao - Nâng cấp phân hệ AI Chatbot & Standalone Sub-Portal (Bản Chuẩn Hóa Viện)

Phân hệ AI Chatbot đã được nâng cấp toàn diện, tách biệt thành một cổng quản trị độc lập (Sub-Portal) hoàn toàn mới tại `/chatbot` và đồng bộ sửa đổi trang quản trị CMS. Toàn bộ giao diện đã được chuẩn hóa 100% để tập trung vào bản sắc thương hiệu của Viện, bổ sung các hiệu ứng tương tác cao cấp và tinh chỉnh trải nghiệm tối đa theo đóng góp ý kiến của anh/chị.

---

## 🛠️ Các cập nhật chuẩn hóa & sửa đổi mới nhất

### 1. Chuẩn hóa tên đơn vị chính thức của Viện
*   Đã cập nhật tên đơn vị thành chính xác: **"Viện Y dược học Dân tộc Thành phố Hồ Chí Minh"** (không viết tắt hay dùng tên cũ).
*   Được đồng bộ ở cả trang quản trị độc lập `/chatbot`, trang quản trị CMS chatbot, tệp gieo hạt SQLite khởi tạo cấu hình (`hospital_name`) và các câu chào mừng của trợ lý ảo.

### 2. Loại bỏ hoàn toàn thương hiệu bên thứ ba (Brand Cleanup)
*   **Sidebar logo**: Đã đổi logo text "Aidox AI" thành **"Y Dược AI - Viện Y Dược Học Dân Tộc"** đại diện chính thức cho Viện.
*   **Sidebar footer**: Đã loại bỏ hoàn toàn dòng thương hiệu "Powered by Aidox - aidox.vn" ở chân trang bên trái trong tệp `/chatbot/page.tsx`, đảm bảo giao diện thuộc sở hữu độc quyền của Viện.

### 3. Tinh chỉnh Huy hiệu "GIÁM ĐỐC" ở Header
*   Đã rút gọn huy hiệu badge từ `GIÁM ĐỐC / KHÁCH` thành duy nhất chữ **"GIÁM ĐỐC"** nằm trong một khung phát sáng màu hổ phách sang trọng, trang nghiêm và chuyên nghiệp.

### 4. Thuần Việt hóa 100% các nút và nhãn thao tác
*   **Language pill**: Đổi nút chuyển ngôn ngữ "VI / EN" cũ thành một nhãn thông tin tĩnh gọn gàng: **"Tiếng Việt (Chuẩn)"** với đèn tín hiệu xanh ngọc lục bảo.
*   **Nút chức năng**: Việt hóa toàn bộ các nút thao tác tiếng Anh cũ:
    *   *“Sync CMS RAG”* ➡️ **“Đồng bộ từ bài viết”**
    *   *“Gemini-2.0-Flash”* ➡️ **“Mô hình AI: Gemini 2.0”**
    *   *“CMS Live Realtime”* ➡️ **“CMS Động - Thời gian thực”**
    *   *“Q&A thủ công”* ➡️ **“Hỏi đáp thủ công”**
    *   *“Tất cả”* ➡️ **“Tất cả tri thức”**

### 5. Thiết kế Custom Dropdown Select & Hiệu ứng Rê chuột (Hover) cao cấp
*   **Dropdown Select**: Không dùng viền mặc định thô cứng của trình duyệt, đã tùy biến bộ chọn bằng CSS cao cấp với đường viền mờ nhạt mềm mại, bóng đổ mượt, caret mũi tên vector dạng SVG hiện đại tự thiết kế, và chuyển động giãn nở dịu mắt khi tương tác.
*   **Hover & Active**:
    *   Tất cả các nút hành động đều được bọc hiệu ứng **Cyber Glow** nhẹ, khi rê chuột sẽ phóng to nhẹ `scale-102` cùng bóng mờ màu xanh lục nhạt `#109173` và khi bấm xuống sẽ lún nhẹ `scale-97`.
    *   Các card Cài đặt sở hữu chuyển động bóng đổ nổi bật khi hover.

### 6. Đồng bộ nâng cấp trang quản trị CMS Chatbot
*   Đã cập nhật mã nguồn tệp quản trị cũ trong CMS:
    *   Chuẩn hóa tiêu đề banner thành: **"Viện Y dược học Dân tộc Thành phố Hồ Chí Minh"**
    *   Đổi câu hỏi mẫu phổ biến thành: **"Địa chỉ Viện Y dược học Dân tộc Thành phố Hồ Chí Minh"**

### 7. Tích hợp Đầy đủ Cấu hình kỹ thuật Gemini AI ở Tab Cài đặt
*   Tab Cài đặt giờ đây được chia thành **2 cột chuyên nghiệp**:
    *   *Cột 1*: Quản lý 6 thông tin liên hệ chính thức của Viện (Tên Viện, Cơ sở 1, Cơ sở 2, Số điện thoại hotline, Giờ làm việc, Đường dẫn Website).
    *   *Cột 2*: Quản lý thông số kỹ thuật AI trực quan (Mô hình chạy chính Gemini, Slider chỉnh độ sáng tạo Temperature, Bảng chọn màu bong bóng Chat, Ô nhập câu chào mừng mặc định, và Vùng nhập System Prompt Persona).

### 8. Biến 6 Thẻ Chỉ Số Thống Kê Thành Nút Nhấp Chuyển Tab Nhanh
*   Đã chuyển hóa 6 thẻ chỉ số đo lường tại tab **Thống kê tổng quan** thành các nút bấm tương tác thông minh (`button`).
*   Khi Giám đốc nhấp chuột vào các chỉ số (ví dụ: nhấp vào *Khách ghé thăm* / *Cuộc hội thoại* ➡️ chuyển ngay sang Tab **Lịch sử hội thoại**; nhấp vào *Tổng tri thức* ➡️ chuyển sang Tab **Cơ sở tri thức**; nhấp vào *Cần phản hồi* ➡️ chuyển sang Tab **Câu hỏi chưa khớp**).
*   *Đặc biệt: Nhấp vào thẻ "Đánh giá tốt" sẽ tự động chuyển sang tab lịch sử và kích hoạt sẵn bộ lọc các cuộc hội thoại bệnh nhân hài lòng.*

---

### 9. Chuẩn hóa & Khắc phục thông tin Bệnh viện cũ còn sót lại (Codebase-wide Audit)
Để đảm bảo bản sắc thương hiệu và độ chính xác tối cao của **Viện Y dược học Dân tộc Thành phố Hồ Chí Minh**, em đã thực hiện rà soát toàn bộ dự án và sửa đổi triệt để các lỗi hiển thị thông tin bệnh viện cũ:
*   **Database Auto-migration (sqlite.ts)**: Viết thêm cơ chế tự động phát hiện thông tin gieo hạt cũ (Nam Kỳ Khởi Nghĩa, yhct.vn) và thực hiện câu lệnh `UPDATE` đồng bộ lại về địa chỉ và hotline chuẩn mới của Viện mà không cần cài lại DB.
*   **Frontend Fallback & Options (page.tsx)**: Đồng bộ fallback state trong `/chatbot` trang đơn và tắt thuộc tính `required` đối với ô nhập liệu **Cơ sở 2** biểu mẫu cấu hình do Viện chỉ có 1 cơ sở duy nhất.
*   **Audit và thay đổi địa chỉ toàn hệ thống**:
    *   **Root Layout Schema**: Chuẩn hóa thông tin `streetAddress` và `addressLocality` của Viện tại [layout.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/layout.tsx).
    *   **Trang dịch vụ & Tenders**: Sửa đổi địa chỉ liên hệ tại [kham-chua-benh/page.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/kham-chua-benh/page.tsx) và [dau-thau/page.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/dau-thau/page.tsx).
    *   **Lịch sử cuộc hẹn bệnh nhân**: Sửa đổi nhãn bản đồ MapPin hiển thị địa chỉ Viện tại [lich-hen/page.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/tai-khoan/lich-hen/page.tsx).
    *   **Trang câu hỏi FAQ**: Chuẩn hóa địa chỉ trong câu trả lời mẫu tại [faq/page.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/faq/page.tsx) và cấu trúc schema tại [faq/layout.tsx](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/vien-ydh-frontend/src/app/faq/layout.tsx).
    *   **Mẫu Email đặt lịch thành công**: Sửa đổi mẫu email tự động gửi cho bệnh nhân tại [appointment-confirm.hbs](file:///f:/HAILEO/My%20Project/vien-ydhdt-website/backend/src/shared/templates/appointment-confirm.hbs).

---

## 🚀 HƯỚNG DẪN ĐỒNG BỘ LÊN SERVER SAU KHI SỬA ĐỔI

Mã nguồn mới nhất đã được em commit và push trực tiếp lên nhánh **`feature/ai-chatbot-enhancements`** trên Github.

### 1. Triển khai lên Vercel & Render
Anh/chị chỉ cần tạo Merge Request từ nhánh `feature/ai-chatbot-enhancements` vào `develop` thông qua đường link tiện ích này:
👉 **[Tạo Pull Request trên GitHub](https://github.com/jasonmawr/vien-ydhdt-website/pull/new/feature/ai-chatbot-enhancements)**
*Sau khi Merge, hệ thống tự động sẽ tự biên dịch và đưa phiên bản chuẩn hóa này lên Cloud ngay lập tức.*

### 2. Triển khai lên máy chủ nội bộ của Viện (Windows Server)
Anh/chị chạy lại quy trình tự động trong 2 bước:
1.  **Tại máy Local**: Chạy lệnh script đóng gói: `./deploy-windows-server.ps1`
2.  **Tại Server Viện (RDP)**: Chạy Powershell (Run as Administrator):
    ```powershell
    cd C:\inetpub\wwwroot\vien-ydh-website
    .\server-setup.ps1
    ```
    *Phiên bản chuẩn hóa mới nhất sẽ hoạt động ngay lập tức.*
