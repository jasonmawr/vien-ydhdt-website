# DANH MỤC TÍNH NĂNG HỆ THỐNG
## Viện Y Dược Học Dân Tộc TP.HCM — Cổng Thông Tin & Phần Mềm Quản Lý

> **Phiên bản:** 1.4  
> **Ngày soạn:** 13/05/2026 | **Cập nhật lần cuối:** 21/05/2026  
> **Người soạn:** Bộ phận Công nghệ thông tin  
> **Mục đích:** Tài liệu tổng hợp toàn bộ tính năng hiện có và định hướng phát triển tương lai  
> **Phương châm:** *Lấy người bệnh làm trọng tâm — Ứng dụng công nghệ phục vụ y tế*

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Tính năng hiện tại — Cổng thông tin công khai](#2-tính-năng-hiện-tại--cổng-thông-tin-công-khai)
3. [Tính năng hiện tại — Đặt lịch & Dịch vụ bệnh nhân](#3-tính-năng-hiện-tại--đặt-lịch--dịch-vụ-bệnh-nhân)
4. [Tính năng hiện tại — Hệ thống quản trị nội bộ (Admin)](#4-tính-năng-hiện-tại--hệ-thống-quản-trị-nội-bộ-admin)
5. [Tính năng hiện tại — Tích hợp kỹ thuật](#5-tính-năng-hiện-tại--tích-hợp-kỹ-thuật)
6. [Kế hoạch phát triển — Nhóm Bệnh nhân & Lâm sàng](#6-kế-hoạch-phát-triển--nhóm-bệnh-nhân--lâm-sàng)
7. [Kế hoạch phát triển — Nhóm Vận hành & Quản lý](#7-kế-hoạch-phát-triển--nhóm-vận-hành--quản-lý)
8. [Kế hoạch phát triển — Nhóm Cộng đồng & Phát triển thương hiệu](#8-kế-hoạch-phát-triển--nhóm-cộng-đồng--phát-triển-thương-hiệu)
9. [Kế hoạch phát triển — Nhóm Hạ tầng & Kỹ thuật](#9-kế-hoạch-phát-triển--nhóm-hạ-tầng--kỹ-thuật)
10. [Tóm tắt lộ trình theo thời gian](#10-tóm-tắt-lộ-trình-theo-thời-gian)

---

## 1. Tổng quan hệ thống

Hệ thống phần mềm của Viện Y Dược Học Dân Tộc TP.HCM là nền tảng kỹ thuật số tích hợp, gồm 3 thành phần chính hoạt động đồng bộ:

| Thành phần | Mô tả |
|---|---|
| **Cổng thông tin công khai** | Website chính thức, thông tin viện, tin tức y tế, đặt lịch khám |
| **Hệ thống quản trị nội bộ** | Dashboard quản lý nội dung, lịch hẹn, nhân sự, truyền thông |
| **Hệ thống HIS** | Kết nối trực tiếp với phần mềm Oracle HIS đang vận hành tại viện |

**Ngôn ngữ hỗ trợ:** Tiếng Việt · Tiếng Anh · Tiếng Trung (phục vụ bệnh nhân quốc tế)

---

## 2. Tính năng hiện tại — Cổng thông tin công khai

### 2.1 Trang chủ

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Banner thông tin viện | Ảnh mosaic phong cách đại học y, thanh thống kê nhanh (số bác sĩ, chuyên khoa, năm kinh nghiệm, bệnh nhân) | ✅ Hoàn thành |
| Danh sách chuyên khoa nổi bật | Hiển thị các chuyên khoa chính: châm cứu, vật lý trị liệu, trĩ, béo phì, xoa bóp bấm huyệt | ✅ Hoàn thành |
| Đội ngũ bác sĩ nổi bật | Ảnh, học hàm, chuyên khoa, liên kết đặt lịch trực tiếp | ✅ Hoàn thành |
| Tin tức y tế mới nhất | 3–6 bài viết gần nhất, liên kết tới trang tin tức | ✅ Hoàn thành |
| Nút đặt lịch nhanh | Nổi bật trên toàn bộ trang, luôn hiển thị | ✅ Hoàn thành |
| Bản đồ Google Maps | Vị trí viện, hỗ trợ chỉ đường | ✅ Hoàn thành |
| Kênh mạng xã hội | Facebook, YouTube, Zalo OA | ✅ Hoàn thành |

### 2.2 Giới thiệu về Viện

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Lịch sử hình thành | Quá trình thành lập, phát triển của viện | ✅ Hoàn thành |
| Chức năng nhiệm vụ | Sứ mệnh, mục tiêu hoạt động | ✅ Hoàn thành |
| Cơ cấu tổ chức | Sơ đồ các phòng ban, bộ phận | ✅ Hoàn thành |
| Thành tích & Giải thưởng | Bằng khen, danh hiệu thi đua | ✅ Hoàn thành |

### 2.3 Bác sĩ & Chuyên khoa

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Danh sách toàn bộ bác sĩ | Tìm kiếm, lọc theo chuyên khoa, hiển thị ảnh — học vị — chuyên môn | ✅ Hoàn thành |
| Trang chi tiết bác sĩ | Tiểu sử, quá trình đào tạo, thành tích, lịch làm việc, nút đặt lịch | ✅ Hoàn thành |
| Danh sách chuyên khoa | Tất cả chuyên khoa tại viện, mô tả từng khoa, liên kết đặt lịch | ✅ Hoàn thành |
| Dữ liệu từ HIS Oracle | Ảnh bác sĩ và thông tin đồng bộ trực tiếp từ hệ thống HIS đang vận hành | ✅ Hoàn thành |

### 2.4 Tin tức & Nội dung y tế

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Danh sách bài viết | Phân trang, lọc theo danh mục, tìm kiếm toàn văn | ✅ Hoàn thành |
| Bài viết chi tiết | Nội dung phong phú, ảnh, file đính kèm, lượt xem, SEO | ✅ Hoàn thành |
| Danh mục động | Tin tức y tế, thông báo, dược liệu, nghiên cứu khoa học,... | ✅ Hoàn thành |
| Chia sẻ mạng xã hội | Nút share Facebook, copy link | ✅ Hoàn thành |
| Tìm kiếm toàn trang | Tìm kiếm xuyên suốt bài viết, bác sĩ, chuyên khoa | ✅ Hoàn thành |

### 2.5 Dược liệu cổ truyền

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Danh mục dược liệu | Tra cứu các dược liệu YHCT, tên Hán-Việt, tên khoa học, công dụng | ✅ MVP hoàn thành |
| Thuốc YHCT | Thông tin thuốc y học cổ truyền, hướng dẫn sử dụng | ✅ Hoàn thành |
| Bài thuốc cổ phương | Các bài thuốc phối hợp truyền thống (đang bổ sung nội dung) | 🔄 Đang phát triển |

### 2.6 Thông tin hành chính & Pháp lý

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Bảng giá dịch vụ | Danh mục giá khám, xét nghiệm, phẫu thuật — giá dịch vụ + BHYT | ✅ Hoàn thành |
| Câu hỏi thường gặp (FAQ) | Giải đáp thắc mắc bệnh nhân thường xuyên hỏi | ✅ Hoàn thành |
| Liên hệ & Góp ý | Form liên hệ, địa chỉ, điện thoại, bản đồ | ✅ Hoàn thành |
| Chính sách bảo mật | Quy định bảo vệ thông tin cá nhân bệnh nhân | ✅ Hoàn thành |
| Quy định sử dụng | Điều khoản dịch vụ | ✅ Hoàn thành |
| Đào tạo | Thông tin các chương trình đào tạo y tế cổ truyền | ✅ Hoàn thành |
| Đấu thầu | Thông báo đấu thầu mua sắm trang thiết bị | ✅ Hoàn thành |

---

## 3. Tính năng hiện tại — Đặt lịch & Dịch vụ bệnh nhân

### 3.1 Hệ thống đặt lịch khám

Bệnh nhân có thể đặt lịch theo 3 cách tùy nhu cầu:

| Chế độ | Mô tả | Trạng thái |
|---|---|---|
| **Đặt lịch theo Chuyên khoa** | Chọn chuyên khoa → hệ thống phân bổ bác sĩ phù hợp | ✅ Hoàn thành |
| **Đặt lịch theo Bác sĩ** | Chọn trực tiếp bác sĩ mong muốn → chọn ngày giờ | ✅ Hoàn thành |
| **Đặt lịch theo Ngày** | Chọn ngày thuận tiện → hệ thống hiển thị bác sĩ còn lịch | ✅ Hoàn thành |

**Thông tin thu thập khi đặt lịch:**
- Họ tên, số điện thoại, ngày sinh, giới tính
- Chuyên khoa / Bác sĩ mong muốn
- Ngày và giờ mong muốn
- Mô tả triệu chứng
- Loại bệnh nhân (dịch vụ / BHYT)

**Lưu ý:** Dữ liệu đặt lịch được ghi vào **Oracle HIS** theo thời gian thực — tích hợp trực tiếp với quy trình vận hành của viện.

### 3.2 Tra cứu lịch hẹn

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Tra cứu bằng OTP | Nhập số điện thoại → nhận OTP → xem toàn bộ lịch sử hẹn | ✅ Hoàn thành |
| Xem trạng thái lịch hẹn | Chờ xác nhận / Đã xác nhận / Đã khám / Đã hủy | ✅ Hoàn thành |
| Thông tin lịch hẹn đầy đủ | Bác sĩ, chuyên khoa, ngày giờ, số thứ tự | ✅ Hoàn thành |

### 3.3 Thanh toán

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| VietQR — Tạo mã QR thanh toán | Tích hợp VietinBank, tạo mã QR tức thì cho thanh toán dịch vụ | ✅ Hoàn thành |
| Xác nhận thanh toán tự động | SSE (Server-Sent Events) cập nhật trạng thái thanh toán theo thời gian thực | ✅ Hoàn thành |

### 3.4 Hỗ trợ người bệnh — AI Chatbot

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Chatbot AI (Gemini 2.0 Flash) | Trả lời tức thì 24/7: giờ khám, thủ tục, chuyên khoa, bác sĩ, dược liệu | ✅ Hoàn thành |
| Kiến thức chuyên khoa YHCT | Chatbot được huấn luyện về y học cổ truyền, dược liệu, bài thuốc | ✅ Hoàn thành |
| Gợi ý đặt lịch | Hướng dẫn người dùng sang trang đặt lịch phù hợp | ✅ Hoàn thành |
| Ẩn trang admin | Không hiển thị chatbot trong khu vực quản trị | ✅ Hoàn thành |

### 3.5 Kênh kết nối mạng xã hội

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Social FAB (nút nổi) | Nút mạng xã hội nổi ở góc màn hình, bấm vào xổ ra 3 kênh với hiệu ứng | ✅ Hoàn thành |
| Facebook | Liên kết trực tiếp tới fanpage Facebook chính thức | ✅ Hoàn thành |
| YouTube | Liên kết kênh YouTube chính thức của viện | ✅ Hoàn thành |
| Zalo OA | Liên kết Zalo Official Account để chat trực tiếp | ✅ Hoàn thành |

### 3.6 Tài khoản bệnh nhân (Patient Portal)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Đăng nhập bằng số điện thoại + OTP | Không cần mật khẩu, bảo mật qua mã OTP 6 số | ✅ Hoàn thành (backend + frontend) |
| Xem lịch sử đặt lịch | Tra cứu tất cả lịch hẹn đã đặt, trạng thái, kết quả — từ Oracle W_HEN/W_HENCT | ✅ Hoàn thành (backend) |
| Hủy lịch hẹn trực tuyến | Hủy lịch trực tiếp từ tài khoản, cập nhật W_HEN.DONE = 2 trong HIS | ✅ Hoàn thành (backend) |
| Cập nhật thông tin cá nhân | Họ tên, email, địa chỉ, ngày sinh | ✅ Hoàn thành (backend) |

### 3.7 Đặc điểm kỹ thuật phục vụ người bệnh

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **Hỗ trợ 3 ngôn ngữ** | Việt / Anh / Trung — chuyển ngôn ngữ bằng 1 click | ✅ Hoàn thành |
| **Responsive mobile** | Tối ưu cho điện thoại di động (>70% lượt truy cập) | ✅ Hoàn thành |
| **PWA — Cài như app** | Người dùng có thể cài website lên màn hình chính điện thoại | ✅ Hoàn thành |
| **Hoạt động offline** | Các trang đã xem được lưu cache, xem lại khi mất mạng | ✅ Hoàn thành |
| **Trang 404 thân thiện** | Hướng dẫn người dùng khi vào nhầm đường dẫn | ✅ Hoàn thành |

---

## 4. Tính năng hiện tại — Hệ thống quản trị nội bộ (Admin)

> **Truy cập:** `/admin` — yêu cầu tài khoản nội bộ, phân quyền theo chức danh

### 4.1 Quản lý nội dung (CMS)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **Soạn thảo bài viết** | Editor rich-text đầy đủ: ảnh, video embed, bảng, code block, heading | ✅ Hoàn thành |
| **SEO tích hợp** | Meta title, meta description, từ khóa, Open Graph image cho mỗi bài | ✅ Hoàn thành |
| **Lên lịch xuất bản** | Đặt giờ cụ thể để bài tự động được đăng — không cần trực tiếp | ✅ Hoàn thành |
| **Trạng thái bài viết** | Nháp / Chờ duyệt / Đã xuất bản / Đã lên lịch | ✅ Hoàn thành |
| **Lịch sử phiên bản** | Xem và khôi phục bất kỳ phiên bản nào trước đó của bài viết | ✅ Hoàn thành |
| **Nhân bản bài viết** | Sao chép bài viết làm mẫu, chỉnh sửa nhanh cho bài mới | ✅ Hoàn thành |
| **File đính kèm** | Đính kèm PDF, Word, Excel vào bài viết (quyết định, thông báo, tài liệu y tế) | ✅ Hoàn thành |
| **Danh mục động** | Tạo, sửa, xóa danh mục bài viết tùy ý — không cần lập trình | ✅ Hoàn thành |
| **Tags & Từ khóa** | Gán nhãn bài viết để tìm kiếm và phân loại | ✅ Hoàn thành |
| **Phân trang quản lý** | Danh sách bài viết phân trang, tìm kiếm, lọc theo trạng thái | ✅ Hoàn thành |
| **Bài viết nổi bật** | Đánh dấu bài được hiển thị ưu tiên trên trang chủ | ✅ Hoàn thành |

### 4.2 Quản lý Media

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Upload hình ảnh | Hỗ trợ JPG, PNG, WebP — tự động tối ưu chất lượng | ✅ Hoàn thành |
| Upload tài liệu | PDF, Word, Excel, PowerPoint | ✅ Hoàn thành |
| Thư viện media | Xem toàn bộ file đã tải lên, thống kê dung lượng theo loại | ✅ Hoàn thành |
| Thống kê lưu trữ | Số lượng file, tổng dung lượng, phân loại theo định dạng | ✅ Hoàn thành |

### 4.3 Quản lý Bác sĩ

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Danh sách bác sĩ từ HIS | Đồng bộ dữ liệu bác sĩ từ Oracle HIS | ✅ Hoàn thành |
| Chỉnh sửa thông tin web | Cập nhật tiểu sử, chuyên môn, ảnh đại diện riêng cho website | ✅ Hoàn thành |
| Đánh dấu bác sĩ nổi bật | Ưu tiên hiển thị trên trang chủ và trang bác sĩ | ✅ Hoàn thành |

### 4.4 Quản lý Lịch hẹn

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Danh sách lịch hẹn | Xem tất cả lịch hẹn từ website, phân trang, tìm kiếm | ✅ Hoàn thành |
| Thông tin chi tiết | Tên bệnh nhân, điện thoại, chuyên khoa, bác sĩ, ngày giờ, triệu chứng | ✅ Hoàn thành |
| Cập nhật trạng thái | Xác nhận / Hủy / Hoàn thành lịch hẹn | ✅ Hoàn thành |
| Xuất dữ liệu | Dữ liệu kết nối với Oracle HIS | ✅ Hoàn thành |

### 4.5 Thống kê & Phân tích (Analytics)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Tổng lượt xem bài viết | Thống kê tổng lượt xem toàn bộ bài đã đăng | ✅ Hoàn thành |
| Top 10 bài được đọc nhiều | Bảng xếp hạng với thanh tiến trình trực quan | ✅ Hoàn thành |
| Thống kê lịch hẹn | Số lượng lịch hẹn, phân theo 30 ngày gần nhất | ✅ Hoàn thành |
| Thống kê media | Dung lượng lưu trữ, số file, phân loại | ✅ Hoàn thành |
| Trạng thái bài viết | Số bài đã xuất bản / nháp / đã lên lịch | ✅ Hoàn thành |
| **Biểu đồ xu hướng lịch hẹn** | Biểu đồ đường 14 ngày gần nhất (Recharts LineChart) | ✅ Hoàn thành (18/05) |
| **Biểu đồ top bài viết** | Biểu đồ cột ngang 8 bài đọc nhiều nhất (BarChart) | ✅ Hoàn thành (18/05) |
| **Biểu đồ trạng thái bài** | Biểu đồ tròn phân bổ đã xuất bản / nháp / lên lịch (PieChart) | ✅ Hoàn thành (18/05) |

### 4.6 Quản lý Người dùng Hệ thống

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Tạo tài khoản quản trị | Tạo tài khoản cho biên tập viên, quản lý | ✅ Hoàn thành |
| Phân quyền theo vai trò | super_admin / admin / editor / moderator / viewer — RBAC đầy đủ, áp dụng trên tất cả CMS routes | ✅ Hoàn thành |
| Xem danh sách quản trị viên | Thông tin, vai trò, ngày tạo | ✅ Hoàn thành |
| Quản lý bệnh nhân | Danh sách tài khoản bệnh nhân đã đăng ký | ✅ Hoàn thành |

### 4.7 Vận hành & Giám sát hệ thống

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **System Logs Viewer** | Xem log hoạt động hệ thống ngay trong giao diện admin | ✅ Hoàn thành |
| **Health Check API** | Endpoint kiểm tra trạng thái hệ thống tự động | ✅ Hoàn thành |
| **Graceful Shutdown** | Hệ thống tắt an toàn, không mất dữ liệu đang xử lý | ✅ Hoàn thành |
| Rate Limiting | Giới hạn request chống tấn công (1000 req/15 phút) | ✅ Hoàn thành |
| XSS Protection | Lọc và làm sạch nội dung người dùng nhập | ✅ Hoàn thành |
| **Sao lưu tự động hàng ngày** | Backup SQLite lúc 2h sáng, giữ 30 ngày, gửi báo cáo email | ✅ Hoàn thành (18/05) |
| **CI/CD tự động** | GitHub Actions kiểm tra TypeScript + build Docker trước khi deploy | ✅ Hoàn thành (18/05) |

### 4.8 Đánh giá bác sĩ (Admin)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **Danh sách đánh giá** | Xem tất cả đánh giá từ bệnh nhân, lọc theo chờ duyệt / đã duyệt | ✅ Hoàn thành (18/05) |
| **Duyệt / Từ chối đánh giá** | Admin xem xét và quyết định hiển thị từng đánh giá | ✅ Hoàn thành (18/05) |
| **Xóa đánh giá** | Xóa đánh giá không phù hợp | ✅ Hoàn thành (18/05) |

---

## 5. Tính năng hiện tại — Tích hợp kỹ thuật

### 5.1 Kết nối Oracle HIS

Hệ thống website kết nối **trực tiếp** với cơ sở dữ liệu Oracle HIS đang vận hành tại viện:

| Chức năng | Mô tả |
|---|---|
| Đọc danh sách bác sĩ | Tên, ảnh, chuyên khoa từ MEDI schema — JOIN DMPHAI (giới tính chuẩn), NHOMNV (chức danh nhóm) |
| Đọc danh sách chuyên khoa | Đồng bộ chuyên khoa từ hệ thống HIS |
| Ghi lịch hẹn mới | Lịch đặt từ website được ghi vào bảng W_HEN của HIS |
| Đọc lịch sử khám | Lịch sử khám từ HIS hiển thị trong tài khoản bệnh nhân |
| Đọc giá dịch vụ | Bảng giá BHYT và dịch vụ đồng bộ từ HIS |

### 5.2 SEO & Tìm kiếm Google

| Tính năng | Mô tả |
|---|---|
| Sơ đồ website tự động | `sitemap.xml` cập nhật khi có bài viết mới |
| Chuẩn JSON-LD | MedicalOrganization, Physician, Article — Google hiểu nội dung y tế |
| Open Graph Image động | Ảnh preview tự động cho mỗi bài khi chia sẻ Facebook/Zalo |
| Meta SEO đầy đủ | Title, description, keywords cho mỗi trang |
| robots.txt | Hướng dẫn Google index đúng trang |

### 5.3 Bảo mật

| Tính năng | Mô tả |
|---|---|
| JWT Authentication | Token xác thực tách biệt cho admin và bệnh nhân |
| OTP qua SMS | Mã 6 số qua ESMS.vn cho bệnh nhân đăng nhập |
| Rate Limiting chống tấn công | Giới hạn request theo IP |
| Sanitize HTML | Lọc code độc hại trong nội dung |
| Parameterized Queries | Chống SQL injection khi truy vấn Oracle |

---

## 6. Kế hoạch phát triển — Nhóm Bệnh nhân & Lâm sàng

> *Ưu tiên cao nhất — trực tiếp nâng cao chất lượng phục vụ bệnh nhân*

### 6.1 Thông báo xác nhận & Nhắc lịch hẹn
**Mức độ ưu tiên: Rất cao | Dự kiến: Quý 3/2026**

Sau khi bệnh nhân đặt lịch, hệ thống tự động:

| Kênh | Nội dung | Thời điểm |
|---|---|---|
| **Zalo (ZNS)** | Xác nhận lịch hẹn: tên bác sĩ, chuyên khoa, ngày giờ | Ngay sau khi đặt lịch |
| **Email** | Thư xác nhận đầy đủ thông tin + hướng dẫn chuẩn bị | Ngay sau khi đặt lịch |
| **Zalo (ZNS)** | Nhắc nhở lịch hẹn ngày mai | Trước 24 giờ |
| **SMS** | Nhắc lịch (dự phòng nếu không có Zalo) | Trước 2 giờ |

*Lợi ích: Giảm 30–40% tỷ lệ vắng hẹn (no-show), giảm tải gọi điện nhắc lịch thủ công.*

### 6.2 Tài khoản bệnh nhân hoàn chỉnh (Patient Portal)
**Mức độ ưu tiên: Rất cao | Dự kiến: Quý 3/2026**

| Tính năng | Mô tả |
|---|---|
| Đăng nhập OTP (hoàn thiện) | Luồng nhập OTP hoàn chỉnh, không cần mật khẩu |
| Lịch sử đặt lịch | Xem tất cả lịch hẹn đã đặt, trạng thái, kết quả |
| Hủy lịch online | Hủy lịch hẹn trực tiếp, không cần gọi điện |
| Thông tin cá nhân | Cập nhật họ tên, email, địa chỉ, bảo hiểm y tế |
| Lịch sử khám từ HIS | Xem lại các lần đã khám tại viện từ hệ thống HIS |

### 6.3 Tra cứu kết quả cận lâm sàng
**Mức độ ưu tiên: Cao | Dự kiến: Quý 4/2026**

Bệnh nhân đăng nhập tài khoản → xem kết quả trực tiếp từ HIS:

| Loại kết quả | Mô tả |
|---|---|
| **Kết quả xét nghiệm** | Công thức máu, sinh hóa, vi sinh, xét nghiệm chuyên sâu |
| **Kết quả chẩn đoán hình ảnh** | Siêu âm, X-quang, CT, MRI — tên file kết quả + ghi chú bác sĩ |
| **Đơn thuốc** | Danh sách thuốc đã kê, liều dùng, hướng dẫn |
| **Phiếu điều trị** | Tóm tắt mỗi lần khám, chẩn đoán, phương pháp điều trị |
| **Lịch tái khám** | Ngày hẹn tái khám tiếp theo do bác sĩ chỉ định |

*Lợi ích: Bệnh nhân không cần quay lại viện chỉ để nhận kết quả — tiết kiệm thời gian, giảm ùn tắc.*

### 6.4 QR Code Check-in tự động
**Mức độ ưu tiên: Cao | Dự kiến: Quý 3/2026**

| Bước | Mô tả |
|---|---|
| 1. Đặt lịch | Bệnh nhân đặt lịch online |
| 2. Nhận QR | Nhận mã QR qua Zalo/Email |
| 3. Đến viện | Quét QR tại terminal ở lễ tân |
| 4. Check-in | Màn hình hiện: "Xin chào [Tên]! Số thứ tự: 042 — Phòng: 203 — Bác sĩ: ThS. Nguyễn Văn A" |
| 5. Chờ khám | Ngồi chờ, không cần xếp hàng đăng ký |

*Lợi ích: Giảm 5–8 phút thủ tục/bệnh nhân, giải phóng nhân lực lễ tân.*

### 6.5 Lịch khám theo giờ thực (Real-time Availability)
**Mức độ ưu tiên: Cao | Dự kiến: Quý 3/2026**

| Tính năng | Mô tả |
|---|---|
| Hiển thị slot còn trống | Màu xanh (còn chỗ) / Vàng (gần đầy) / Đỏ (hết chỗ) |
| Cập nhật tự động | Mỗi 60 giây đồng bộ với HIS |
| Ngăn đặt trùng | Kiểm tra tại API layer trước khi ghi vào HIS |
| Ước tính thời gian chờ | Hiển thị "Dự kiến chờ khoảng 30 phút" |

### 6.6 Đánh giá bác sĩ sau khám ✅ **HOÀN THÀNH** (18/05/2026)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Link đánh giá kèm xác nhận lịch | Liên kết đánh giá được gửi kèm trong email/Zalo xác nhận | ✅ Hoàn thành |
| Form đánh giá bệnh nhân | 5 sao + nhận xét tự do; trang `/danh-gia/[token]` | ✅ Hoàn thành |
| Ngăn đánh giá trùng | Mỗi lịch hẹn chỉ được đánh giá 1 lần | ✅ Hoàn thành |
| Duyệt trước khi đăng | Admin xem xét và phê duyệt tại `/admin/reviews` | ✅ Hoàn thành |
| Hiển thị trên trang bác sĩ | Rating trung bình + nhận xét đã duyệt | 🔄 Chưa tích hợp vào UI bác sĩ |

### 6.7 Kiểm tra Bảo hiểm Y tế (BHYT)
**Mức độ ưu tiên: Trung bình-Cao | Dự kiến: Quý 1/2027**

| Phương án | Mô tả |
|---|---|
| **OCR quét thẻ BHYT** | Camera chụp thẻ → AI nhận dạng số thẻ, tên, ngày sinh, hạn dùng |
| **Kết nối API BHXH** | Nhập CCCD/số thẻ → tra cứu thông tin BHYT từ cổng BHXH VN |

*Lợi ích: 85% bệnh nhân tại viện có BHYT — tự kiểm tra giảm 5–10 phút thủ tục đăng ký.*

### 6.8 Khám trực tuyến (Telemedicine)
**Mức độ ưu tiên: Trung bình | Dự kiến: Quý 2/2027**

| Tính năng | Mô tả |
|---|---|
| Đặt lịch khám online | Chọn option "Khám qua video" khi đặt lịch |
| Phòng khám ảo | Kết nối video bảo mật giữa bác sĩ và bệnh nhân (không ghi hình) |
| Ghi chú sau khám | Bác sĩ điền chẩn đoán và hướng điều trị |
| Phù hợp với YHCT | Tư vấn châm cứu, dinh dưỡng YHCT, theo dõi điều trị — không cần khám vật lý |

*Đặc biệt phù hợp cho bệnh nhân tái khám, bệnh nhân ở xa, người cao tuổi khó đi lại.*

### 6.9 Cổng cận lâm sàng & Đơn thuốc y khoa (Patient Lab Results Portal) — Đồng phát triển
**Mức độ ưu tiên: Đặc biệt cao | Dự kiến: Quý 4/2026 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

Cho phép bệnh nhân đăng nhập tài khoản để tra cứu và xem nhanh các kết quả chuyên sâu từ hệ thống HIS:
* **Kết quả xét nghiệm:** Các chỉ số hóa sinh, huyết học, miễn dịch kèm dải tham chiếu chuẩn.
* **Chẩn đoán hình ảnh (PACS):** Kết quả X-quang, Siêu âm, CT, MRI gồm bản tả chẩn đoán và file ảnh trực quan.
* **Toa thuốc điện tử:** Đơn thuốc chi tiết kèm liều dùng sinh động và hướng dẫn uống thuốc từ bác sĩ.
* **Bảo mật tối cao:** Áp dụng mã hóa dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và xác thực hai lớp (2FA/OTP).

### 6.10 Kênh Bệnh án điện tử bảo mật cao (EMR Secure Channel) — Đồng phát triển
**Mức độ ưu tiên: Đặc biệt cao | Dự kiến: Quý 2/2027 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

Hướng tới bệnh viện không giấy tờ, cung cấp hồ sơ bệnh án số hóa chính thống:
* **Số hóa hồ sơ bệnh án:** Kết xuất định dạng XML/JSON chuẩn đầu ra tương thích BHXH quốc gia.
* **Tích hợp chữ ký số:** Áp dụng chữ ký số cá nhân của bác sĩ và con dấu số pháp lý của Viện.
* **Bảo mật y tế:** Áp dụng tiêu chuẩn bảo mật dữ liệu cấp độ 3 và mã hóa đầu cuối.

---

## 7. Kế hoạch phát triển — Nhóm Vận hành & Quản lý

### 7.1 Hệ thống thông báo nội bộ cho Admin

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **Email thông báo lịch hẹn mới** | Admin nhận email ngay khi có lịch hẹn mới từ website | ✅ Hoàn thành (18/05) |
| **Email báo cáo backup** | Gửi kết quả sao lưu thành công/thất bại mỗi ngày | ✅ Hoàn thành (18/05) |
| Cảnh báo lỗi hệ thống | Email khi có lỗi nghiêm trọng (cần Sentry) | 🔄 Kế hoạch Quý 3/2026 |
| Báo cáo tổng hợp hàng tuần | Lịch hẹn, bài viết, lượt xem qua email | 🔄 Kế hoạch Quý 4/2026 |

### 7.2 Hoàn thiện Phân quyền (RBAC)
**Dự kiến: Quý 3/2026**

| Vai trò | Quyền hạn |
|---|---|
| **super_admin** | Toàn quyền — cấu hình hệ thống, quản lý user |
| **admin** | Quản lý nội dung, lịch hẹn, media, bác sĩ |
| **editor** | Soạn và sửa bài viết, không được xuất bản |
| **moderator** | Duyệt và xuất bản bài viết, không xóa được |
| **viewer** | Chỉ xem báo cáo, analytics |

### 7.3 Portal Bác sĩ & Điều dưỡng
**Dự kiến: Quý 4/2026**

| Màn hình | Mô tả |
|---|---|
| `/doctor/dashboard` | Lịch hẹn hôm nay và trong tuần |
| `/doctor/patients` | Danh sách bệnh nhân đã khám |
| `/doctor/schedule` | Đăng ký ngày nghỉ, điều chỉnh lịch làm việc |
| `/doctor/profile` | Cập nhật tiểu sử, chuyên môn, ảnh |
| Điều dưỡng: check-in bệnh nhân | Quét QR hoặc tìm theo tên → check-in thủ công |

*Lợi ích: Bác sĩ tự quản lý lịch, không phụ thuộc admin — giảm tải văn phòng.*

### 7.4 Sao lưu dữ liệu tự động ✅ **HOÀN THÀNH** (18/05/2026)

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Sao lưu hàng ngày lúc 2:00 sáng | Tự động sao lưu cơ sở dữ liệu CMS | ✅ Hoàn thành |
| Giữ 30 ngày gần nhất | Tự động xóa file backup cũ hơn 30 ngày | ✅ Hoàn thành |
| Email báo cáo | Gửi email xác nhận sau mỗi lần backup thành công/thất bại | ✅ Hoàn thành |
| Lưu Google Drive | Upload backup lên cloud storage | 🔄 Kế hoạch Quý 4/2026 |

### 7.5 Bulk Actions — Thao tác hàng loạt
**Dự kiến: Quý 3/2026**

| Tính năng | Mô tả |
|---|---|
| Chọn nhiều bài viết | Checkbox chọn hàng loạt |
| Xuất bản hàng loạt | Publish nhiều bài cùng lúc |
| Xóa hàng loạt | Chuyển nhiều bài vào thùng rác |
| Export CSV | Xuất danh sách bài viết hoặc lịch hẹn ra Excel |

### 7.6 Analytics nâng cao

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **Biểu đồ đường xu hướng lịch hẹn** | Recharts LineChart — 14 ngày gần nhất | ✅ Hoàn thành (18/05) |
| **Biểu đồ cột top bài viết** | Recharts BarChart — top 8 bài đọc nhiều | ✅ Hoàn thành (18/05) |
| **Biểu đồ tròn trạng thái bài** | Recharts PieChart — đã xuất bản / nháp / lên lịch | ✅ Hoàn thành (18/05) |
| Phễu đặt lịch | Tỷ lệ chuyển đổi: Vào trang → Chọn bác sĩ → Điền form → Đặt thành công | 🔄 Kế hoạch Quý 4/2026 |
| Analytics người dùng | Tích hợp Plausible Analytics (bảo vệ quyền riêng tư) | 🔄 Kế hoạch Quý 4/2026 |
| Export báo cáo | Xuất báo cáo thống kê ra PDF/Excel hàng tháng | 🔄 Kế hoạch Quý 1/2027 |

### 7.7 Gói khám sức khỏe Doanh nghiệp (B2B)
**Dự kiến: Quý 1/2027**

| Tính năng | Mô tả |
|---|---|
| Trang gói doanh nghiệp | Mô tả các gói khám: Cơ bản / Nâng cao / VIP |
| Form đăng ký đoàn | Tên công ty, số lượng nhân viên, ngày khám dự kiến |
| Upload danh sách | Upload file Excel danh sách nhân viên cần khám |
| Quản lý đơn hàng B2B | Admin theo dõi hợp đồng khám doanh nghiệp riêng biệt |
| Thông báo sales team | Email tự động gửi đến bộ phận kinh doanh khi có đăng ký |

### 7.8 Thuật toán Đặt lịch khám đa kênh phức tạp (Multi-channel Complex Scheduling Engine) — Đồng phát triển
**Mức độ ưu tiên: Đặc biệt cao | Dự kiến: Quý 3/2026 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

* **Bộ phân bổ và kiểm soát chỗ trống (Clinic Availability Engine):** Đồng bộ hóa các nguồn đặt lịch (Call Center, Website, App, Walk-ins) thời gian thực với CSDL Core HIS Oracle.
* **Cơ chế Khóa slot tạm thời (Optimistic Session Locking):** Tạm giữ chỗ trong vòng 5-10 phút tại API layer khi bệnh nhân thao tác thanh toán, tự động giải phóng slot nếu quá thời gian hoặc thanh toán lỗi để tối ưu tài nguyên phòng khám.

### 7.9 Phân hệ Quản lý điều hành & Văn bản CMS (Operations CMS) — Đồng phát triển
**Mức độ ưu tiên: Cao | Dự kiến: Quý 4/2026 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

* **Quản lý văn bản pháp quy:** Đăng tải, phân loại thông tư, chỉ thị hành chính nội bộ của Viện.
* **Phân quyền theo phòng ban:** RBAC nâng rộng, giới hạn quyền đọc tài liệu mật hoặc báo cáo chuyên sâu theo chức vụ.
* **Full-text Search:** Tìm kiếm văn bản nhanh dựa trên nội dung tệp đính kèm.

### 7.10 Tách biệt bố cục Subsites (Sub-portals Layouts) — Đồng phát triển
**Mức độ ưu tiên: Cao | Dự kiến: Quý 3/2026 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

Tổ chức lại trải nghiệm người dùng thành các cổng giao diện độc lập chia sẻ chung cơ sở dữ liệu:
* **Cổng Khám chữa bệnh & Dịch vụ:** Bảng giá y tế, đặt hẹn nhanh, lịch trực bác sĩ công khai.
* **News Center:** Tin bài y học cổ truyền, công trình nghiên cứu khoa học, truyền thông y tế.
* **Kênh Hỏi & Đăng (Q&A Interactive Forum):** Người bệnh đặt câu hỏi ẩn danh, admin điều phối đến bác sĩ chuyên khoa duyệt và phản hồi tương tác trực tiếp.

### 7.11 Cổng mua sắm dược phẩm theo đơn trực tuyến (Pharmacy E-Commerce) — Đồng phát triển
**Mức độ ưu tiên: Cao | Dự kiến: Quý 2/2027 | Phối hợp cùng đối tác (ODH & Hải Nhân)**

* **Tải lên toa thuốc:** Cho phép người bệnh chụp ảnh đơn thuốc của Viện để đặt mua online.
* **Kiểm duyệt nghiệp vụ:** Khoa Dược duyệt đơn trên Admin Dashboard, kiểm tra tồn kho HIS và định giá.
* **Thanh toán VietQR:** Tự động gửi liên kết thanh toán VietQR động sau khi dược sĩ duyệt đơn hàng.

---

## 8. Kế hoạch phát triển — Nhóm Cộng đồng & Phát triển thương hiệu

### 8.1 Nội dung chuyên sâu về Dược liệu & YHCT
**Dự kiến: Quý 3/2026**

| Tính năng | Mô tả |
|---|---|
| 200+ dược liệu chi tiết | Tên Hán-Việt, tên khoa học, tác dụng, chống chỉ định, liều dùng |
| Ảnh thực vật | Ảnh chụp thực tế dược liệu, bộ phận dùng |
| Bài thuốc cổ phương | Bài thuốc phối hợp, gia giảm liều, phương pháp bào chế |
| Tương tác dược liệu | Cảnh báo khi kết hợp các vị thuốc có tương tác |
| Tra cứu theo triệu chứng | Nhập triệu chứng → gợi ý dược liệu phù hợp |

### 8.2 Thư viện video Y học cổ truyền
**Dự kiến: Quý 4/2026**

| Tính năng | Mô tả |
|---|---|
| Tích hợp video YouTube | Nhúng video từ kênh YouTube chính thức vào website |
| Video hướng dẫn châm cứu | Giải thích các huyệt vị phổ biến |
| Video bài tập YHCT | Dưỡng sinh, khí công, xoa bóp tự chăm sóc |
| Playlist theo chủ đề | Phân loại theo chuyên khoa, mức độ |

### 8.3 SEO & Tìm kiếm hoàn thiện

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| **FAQPage Schema** | Google hiển thị FAQ trực tiếp trong kết quả tìm kiếm | ✅ Hoàn thành (18/05) |
| **BreadcrumbList Schema** | Đường dẫn trang rõ ràng trên Google (tin tức, giới thiệu, liên hệ, bài viết) | ✅ Hoàn thành (18/05) |
| hreflang 3 ngôn ngữ | Google hiển thị đúng ngôn ngữ theo vị trí người dùng | 🔄 Kế hoạch Quý 3/2026 |
| Canonical URL | Tránh nội dung trùng lặp ảnh hưởng SEO | 🔄 Kế hoạch Quý 3/2026 |
| Lighthouse Score ≥ 90 | Điểm hiệu suất web tốt giúp Google ưu tiên | 🔄 Kế hoạch sau go-live |

### 8.4 AI Chatbot nâng cao
**Dự kiến: Quý 4/2026 — Quý 1/2027**

| Tính năng | Mô tả |
|---|---|
| **Sàng lọc triệu chứng (Pre-triage)** | Bệnh nhân mô tả triệu chứng → AI gợi ý chuyên khoa phù hợp → chuyển thẳng sang đặt lịch |
| **Tự động học từ CMS** | Mỗi bài viết mới được xuất bản → chatbot cập nhật kiến thức tự động |
| **Câu hỏi thường gặp thông minh** | Chatbot phân tích các câu hỏi phổ biến → tự gợi ý bổ sung FAQ |
| **Hỗ trợ đa ngôn ngữ** | Chatbot trả lời cả Việt / Anh / Trung |

### 8.5 Ứng dụng di động (Mobile App)
**Dự kiến: Quý 2–3/2027 (sau khi Patient Portal web ổn định)**

| Tính năng | Mô tả |
|---|---|
| Đặt lịch khám | Toàn bộ luồng đặt lịch tối ưu cho điện thoại |
| QR Check-in | Mã QR ngay trong app, không cần in |
| Push Notification | Nhắc lịch hẹn qua thông báo điện thoại |
| Xem kết quả xét nghiệm | Kết quả cận lâm sàng từ HIS |
| AI Chatbot | Hỏi đáp ngay trong app |
| Bác sĩ nổi bật | Tìm bác sĩ, đọc tiểu sử |
| Tin tức YHCT | Cập nhật tin tức y tế mới nhất |
| Đăng nhập sinh trắc học | Face ID, vân tay |

---

## 9. Kế hoạch phát triển — Nhóm Hạ tầng & Kỹ thuật

### 9.1 Hạ tầng Production

| Hạng mục | Mô tả | Trạng thái |
|---|---|---|
| **Docker Compose** | Đóng gói toàn bộ hệ thống (backend :4000, frontend :3000), triển khai nhất quán | ✅ Hoàn thành (18/05) |
| **Nginx Reverse Proxy** | Định tuyến lưu lượng, hỗ trợ SSL | ✅ Hoàn thành (18/05) |
| **CI/CD GitHub Actions** | Kiểm tra TypeScript + build Docker tự động khi push code | ✅ Hoàn thành (18/05) |
| Cloudflare CDN + WAF | Tăng tốc tải trang, bảo vệ DDoS, firewall ứng dụng web | 🔄 Cần cấu hình sau khi có domain |
| SSL/HTTPS Let's Encrypt | Chứng chỉ bảo mật tự động gia hạn miễn phí | 🔄 Cần server production |
| Giám sát uptime 24/7 | UptimeRobot cảnh báo khi hệ thống ngừng hoạt động | 🔄 Kế hoạch Quý 3/2026 |
| Theo dõi lỗi | Sentry — phát hiện và báo cáo lỗi tự động | 🔄 Kế hoạch Quý 3/2026 |

### 9.2 Hiệu suất

| Hạng mục | Mô tả | Dự kiến |
|---|---|---|
| Redis Cache | Cache kết quả query Oracle (giảm từ 1-2 giây xuống < 100ms) | Quý 4/2026 |
| Tối ưu ảnh Sharp API | Tự động resize và nén ảnh theo thiết bị người dùng | Quý 3/2026 |
| Infinite scroll | Danh sách 253+ bác sĩ cuộn vô tận, không phân trang | Quý 3/2026 |
| PostgreSQL migration | Nâng cấp database CMS từ SQLite lên PostgreSQL | Quý 1/2027 |

---

## 10. Tóm tắt lộ trình theo thời gian

```
ĐÃ HOÀN THÀNH (tính đến 18/05/2026)
├── ✅ Thông báo email + Zalo ZNS + SMS xác nhận đặt lịch (đã wired, cần credentials)
├── ✅ Hệ thống đánh giá bác sĩ (API + trang bệnh nhân + trang admin duyệt)
├── ✅ Sao lưu tự động hàng ngày lúc 2h sáng + báo cáo email
├── ✅ Biểu đồ Analytics (LineChart xu hướng + BarChart top bài + PieChart trạng thái)
├── ✅ FAQPage JSON-LD + BreadcrumbList JSON-LD (SEO)
├── ✅ Docker Compose + Nginx + GitHub Actions CI/CD
└── ✅ Link đánh giá bác sĩ tự động kèm xác nhận lịch hẹn

2026 — Quý 3 (Ưu tiên cao nhất — CẦN LÀM TRƯỚC GO-LIVE)
├── Tài khoản bệnh nhân (Patient Portal) hoàn thiện — luồng OTP end-to-end
├── Lịch khám thời gian thực (slot availability) — slot xanh/vàng/đỏ
├── QR Code Check-in tại lễ tân
├── Phân quyền RBAC hoàn chỉnh (wiring vào routes)
├── Hạ tầng production: Cloudflare CDN, SSL, UptimeRobot, Sentry
├── Hiển thị đánh giá bác sĩ trên trang bác sĩ (phần còn lại)
├── Đồng bộ Đặt lịch đa kênh phức tạp (Optimistic Session Locking) [Đồng phát triển]
└── Tái cấu trúc Bố cục Subsites (Main Medical, News, Q&A) [Đồng phát triển]

2026 — Quý 4
├── Tra cứu kết quả xét nghiệm & chẩn đoán hình ảnh PACS/LIS [Đồng phát triển]
├── Phân hệ Quản lý điều hành & Văn bản CMS (Operations CMS) [Đồng phát triển]
├── Portal Bác sĩ & Điều dưỡng
├── AI Chatbot nâng cao (sàng lọc triệu chứng)
├── Thư viện dược liệu 200+ vị
├── hreflang 3 ngôn ngữ + Canonical URL
└── Plausible Analytics + Phễu đặt lịch

2027 — Quý 1
├── Kiểm tra Bảo hiểm Y tế (BHYT / CCCD)
├── Gói khám doanh nghiệp (B2B)
├── Nâng cấp database PostgreSQL
└── Báo cáo thống kê tự động hàng tháng

2027 — Quý 2–3
├── Khám trực tuyến (Telemedicine / Video tư vấn)
├── Kênh Bệnh án điện tử bảo mật cao (EMR Secure Channel) [Đồng phát triển]
├── Cổng mua sắm dược phẩm theo toa trực tuyến [Đồng phát triển]
├── Ứng dụng di động iOS & Android
└── AI tương tác dược liệu & bài thuốc
```

---

## PHỤ LỤC — Bảng tổng hợp nhanh

### Tình trạng hiện tại (21/05/2026)

| Nhóm tính năng | Số tính năng hoàn thành | Tổng | Ghi chú |
|---|---|---|---|
| Cổng thông tin công khai | 38 | 40 | Bài thuốc cổ phương đang bổ sung nội dung |
| Hệ thống đặt lịch & dịch vụ | 17 | 18 | Patient Portal frontend còn OTP flow |
| Hệ thống quản trị Admin | 40 | 40 | ✅ Hoàn thành 100% (đã vá lỗi bảo mật cookie & đồng bộ xác thực ngày 21/05/2026) |
| Tích hợp kỹ thuật | 17 | 18 | Zalo ZNS + FAQPage + BreadcrumbList + GitHub Actions done |
| **Tổng cộng** | **112** | **116** | **↑ Đã sửa lỗi xác thực cookie & đồng bộ hoàn toàn** |

### Điểm số cập nhật (21/05/2026)

| Chiều đánh giá | 13/05 | 18/05 | **21/05 (Hiện tại)** | Mục tiêu |
|---|---|---|---|---|
| Trải nghiệm người bệnh | 8.0 | 8.7 | **8.8 / 10** | 10 / 10 |
| Hệ thống quản trị nội bộ | 7.5 | 8.5 | **9.0 / 10** | 10 / 10 |
| Tích hợp kỹ thuật & Hạ tầng | 6.0 | 8.5 | **8.9 / 10** | 10 / 10 |
| **Tổng thể** | 7.7 | 8.6 | **8.9 / 10** | 10 / 10 |

### Những gì còn cần để go-live

| Hạng mục | Mô tả | Ưu tiên |
|---------|-------|---------|
| Credentials thật | SMTP Gmail App Password, ESMS.vn API Key, Zalo OA Token | 🔴 Bắt buộc |
| Server production | IP/domain vienydhdt.gov.vn, cài Docker, mở port 80/443 | 🔴 Bắt buộc |
| Kiểm tra kết nối nội mạng | Server web → server phần mềm bệnh viện thông suốt | 🔴 Bắt buộc |
| SSL/HTTPS | Cấp chứng chỉ Let's Encrypt cho domain | 🔴 Bắt buộc |
| Test OTP thực tế | Bệnh nhân đặt lịch, nhận SMS/Zalo thực tế | 🟡 Cần trước go-live |
| Ảnh và nội dung bác sĩ | Ảnh đại diện, tiểu sử cho bác sĩ nổi bật | 🟡 Cần trước go-live |

### Changelog phiên bản 1.4 (21/05/2026)

| Thay đổi / Tính năng mới | Mô tả | Nhóm đối tượng |
|---|---|---|
| **Đặc tả Đồng phát triển** | Phác thảo chi tiết 6 phân hệ nâng cao phối hợp kỹ thuật cùng đối tác (ODH & Hải Nhân) | Toàn hệ thống |
| **Đồng bộ đặt lịch đa kênh** | Cơ chế khóa slot (Optimistic Session Locking) tích hợp HIS Oracle | Quản lý & Vận hành |
| **Cổng cận lâm sàng & EMR** | Giao diện tra cứu xét nghiệm, chẩn đoán hình ảnh PACS và bệnh án điện tử ký số | Người bệnh & Lâm sàng |
| **Operations CMS** | Phân hệ quản lý văn bản điều hành, thông báo hành chính và phân quyền nội bộ | Quản lý & Vận hành |
| **Tách biệt bố cục Subsites** | Tổ chức lại cấu trúc trang web thành Cổng khám chữa bệnh, News Center và Hỏi đáp y khoa | Người bệnh & Cộng đồng |
| **Mua thuốc trực tuyến** | Quy trình khoa Dược duyệt toa thuốc y khoa tải lên và gửi thanh toán VietQR | Người bệnh & Vận hành |

### Changelog phiên bản 1.3 (21/05/2026)

| Thay đổi | Mô tả | Mức độ |
|---|---|---|
| **Fix Cookie `secure` flag** | Sửa lỗi cookie `auth_token` bị `secure: true` trên HTTP → trình duyệt từ chối lưu → admin portal không truy cập được sau đăng nhập | 🔴 CRITICAL |
| **Thống nhất xác thực admin** | 3 trang Analytics, Reviews, Media đã sử dụng sai `localStorage.getItem("admin_token")` → chuyển sang `getAuthToken()` Server Action đọc cookie nhất quán | 🔴 CRITICAL |
| **Thêm `sameSite: "lax"`** | Cookie `auth_token` thêm thuộc tính `sameSite` rõ ràng cho an toàn cross-origin | 🟡 Security |

**Files đã sửa:**

| File | Thay đổi |
|------|---------|
| `vien-ydh-frontend/src/services/auth.ts` | Cookie `secure` chỉ bật khi `NEXT_PUBLIC_SITE_URL` là HTTPS, thêm `sameSite: "lax"` |
| `vien-ydh-frontend/src/app/admin/(dashboard)/analytics/page.tsx` | `localStorage` → `getAuthToken()` Server Action |
| `vien-ydh-frontend/src/app/admin/(dashboard)/reviews/page.tsx` | `localStorage` → `getAuthToken()` Server Action |
| `vien-ydh-frontend/src/app/admin/(dashboard)/media/page.tsx` | `localStorage` → `getAuthToken()` Server Action |

### Changelog phiên bản 1.2 (18/05/2026)

| Tính năng mới | Mô tả |
|---|---|
| Analytics Recharts | Biểu đồ đường + cột + tròn trong trang thống kê admin |
| Hệ thống đánh giá bác sĩ | API, trang bệnh nhân `/danh-gia/[token]`, trang admin duyệt `/admin/reviews` |
| Sao lưu tự động | `backup.ts` chạy 2h sáng, giữ 30 ngày, báo cáo email |
| Zalo ZNS wired | Thông báo ZNS được gắn vào luồng xác nhận lịch hẹn |
| Link đánh giá tự động | Email xác nhận kèm link đánh giá bác sĩ |
| FAQPage JSON-LD | Schema Google cho trang FAQ |
| BreadcrumbList JSON-LD | Schema breadcrumb cho tin-tức, giới-thiệu, liên-hệ, bài viết |
| GitHub Actions CI/CD | TypeScript check + Docker build tự động |
| Docker/Nginx hoàn thiện | Port thống nhất 4000, healthcheck đúng `/health` |

### Changelog phiên bản 1.1 (17/05/2026)

| File | Thay đổi |
|------|---------|
| `backend/src/modules/doctors/doctors.service.ts` | Fix JOIN bảng bác sĩ, chuyên khoa đúng cấu trúc HIS |
| `backend/src/modules/auth/auth.middleware.ts` | Thêm requireAnyAdmin, requireMinRole; RBAC nâng cấp |
| `backend/src/modules/cms/cms.router.ts` | Áp dụng RBAC chi tiết theo loại hành động |
| `docs/MEETING_PREP_20260520.md` | **MỚI** — Tài liệu chuẩn bị họp đối tác 20/05/2026 |

---

*Tài liệu này được xây dựng trên cơ sở phân tích toàn bộ source code, cơ sở dữ liệu và quy trình vận hành thực tế của hệ thống.*  
*Cập nhật định kỳ mỗi sprint (2 tuần/lần).*
