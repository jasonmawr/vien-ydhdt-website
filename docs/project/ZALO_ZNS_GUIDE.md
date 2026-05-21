# HƯỚNG DẪN TÍCH HỢP ZALO ZNS CHO BỆNH VIỆN

Tài liệu này giải thích sự khác biệt giữa các khái niệm của Zalo và hướng dẫn từng bước để Bệnh viện có thể cấu hình gửi tin nhắn đặt lịch thành công qua Zalo cho Bệnh nhân.

## 1. Phân biệt các khái niệm Zalo

### 1.1. Zalo OA (Official Account) là gì?
- **Ví dụ thực tế:** Giống như Fanpage Facebook của Bệnh viện.
- **Trạng thái hiện tại:** Đơn vị của bạn đã có sẵn cái này. Bệnh nhân có thể vào đây nhắn tin hỏi đáp với nhân viên y tế.
- **Hạn chế:** Zalo OA *không thể* chủ động nhắn tin cho một người lạ (người chưa từng bấm "Quan tâm" hoặc chưa từng nhắn tin cho OA).

### 1.2. Zalo ZNS (Zalo Notification Service) là gì?
- **Định nghĩa:** Là dịch vụ "Tin nhắn chăm sóc khách hàng" của Zalo. 
- **Ưu điểm Cốt lõi:** Cho phép Bệnh viện **gửi tin nhắn đến BẤT KỲ SĐT nào** (miễn là SĐT đó có đăng ký Zalo) mà KHÔNG cần họ phải Follow OA Bệnh viện.
- **Bắt buộc:** Bạn không thể gõ text tự do để gửi qua ZNS. Bạn phải tạo một "Biểu mẫu" (Template) (Ví dụ: Chào anh/chị {name}, Mã phiếu khám của anh/chị là {id}...) và gửi cho Zalo kiểm duyệt trước. 

### 1.3. Zalo Developers là gì?
- **Định nghĩa:** Đây là "Cổng kỹ thuật" dành cho Lập trình viên. 
- Để Website Đặt Khám (code của chúng ta) có thể nói chuyện được với Zalo OA và dùng được ZNS, chúng ta phải vào Zalo Developers để tạo một cái **"Chìa khóa" (API Token/App ID)** giao cho phần mềm.

---

## 2. Các bước thực hiện (Dành cho bộ phận Marketing / IT)

**Bước 1: Đăng ký ZCA (Zalo Cloud Account)**
1. Truy cập [Zalo Cloud Account](https://account.zalo.cloud/).
2. Đăng nhập bằng Zalo của người quản trị OA Bệnh viện.
3. Tạo tài khoản ZCA và liên kết với Zalo OA hiện có của Bệnh viện.
4. Nạp tiền vào ZCA (ZNS tính phí khoảng 200đ - 300đ/tin nhắn gửi thành công).

**Bước 2: Tạo Mẫu tin nhắn (Template ZNS)**
1. Vẫn trong hệ thống Zalo Cloud, vào mục ZNS -> Tạo Template mới.
2. Thiết kế mẫu tin nhắn. Ví dụ nội dung:
   > **VIỆN Y DƯỢC HỌC DÂN TỘC XÁC NHẬN**
   > Chào bạn <patient_name>,
   > Bệnh viện xác nhận bạn đã thanh toán và đặt lịch khám thành công.
   > - Số Thứ Tự: <stt>
   > - Chuyên khoa: <department_name>
   > - Ngày khám: <appointment_date> lúc <appointment_time>
   > - Mã phiếu: <appointment_id>
   > Vui lòng đến sớm 15 phút và đưa mã phiếu này cho nhân viên tiếp nhận.
3. Gửi Zalo duyệt (Thường mất 1-2 ngày làm việc). Sau khi duyệt, Zalo sẽ cấp cho bạn một mã số gọi là **Template ID**.

**Bước 3: Tạo Zalo App (Lấy "Chìa khóa" cho Lập trình viên)**
1. Truy cập [Zalo Developers](https://developers.zalo.me/).
2. Bấm "Thêm ứng dụng mới".
3. Vào phần cài đặt ứng dụng, liên kết ứng dụng này với Zalo OA của bệnh viện.
4. Ở phần "API", cấp quyền gửi ZNS cho ứng dụng.
5. Cung cấp cho Lập trình viên (hoặc điền vào file `.env` của hệ thống) 3 thông số sau:
   - `ZALO_APP_ID`: ID của ứng dụng vừa tạo.
   - `ZALO_ACCESS_TOKEN`: Token dùng để gọi API (cần setup cơ chế lấy tự động).
   - `ZALO_TEMPLATE_ID`: Mã số của cái Template đã được duyệt ở Bước 2.

*Sau khi cấu hình xong 3 bước trên, hệ thống Website sẽ tự động bắn tin nhắn cho bệnh nhân mỗi khi họ quét mã QR thanh toán thành công.*
