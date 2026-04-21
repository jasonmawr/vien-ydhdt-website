# **MASTER PLAN: LỘ TRÌNH THỰC THI CHO AI AGENT**

AI Agent hãy đọc kỹ file này. Khi hoàn thành xong một bước, hãy dùng tool chỉnh sửa file này và đánh dấu \[x\] vào ô trống \[ \].

## **PHASE 1: KHỞI TẠO & THIẾT LẬP NỀN TẢNG** ✅ HOÀN THÀNH

* \[x\] 1\. Khởi tạo dự án Next.js (next@16.2.4, react@19.2.4, TypeScript strict mode, Tailwind CSS v4, App Router, src-dir, import alias @/*).
* \[x\] 2\. Cấu hình Design System trong globals.css (Tailwind v4 không dùng tailwind.config.ts — config bằng @theme): Màu primary #065f46, accent #d97706, nền #fbf9f6. Font Merriweather + Plus Jakarta Sans qua next/font.
* \[x\] 3\. Cài đặt các thư viện phụ trợ: lucide-react@1.8.0, clsx@2.1.1, tailwind-merge@3.5.0.
* \[x\] 4\. Thiết lập cấu trúc thư mục chuẩn theo ARCHITECTURE.md: /components/ui, /components/layout, /components/sections, /lib, /services, /styles, /app/(home), /app/dat-lich, /app/duoc-lieu.

**Ghi chú Phase 1:**
- Tailwind CSS v4 thay đổi cách cấu hình hoàn toàn: dùng `@theme` trong CSS thay vì `tailwind.config.ts`.
- TypeScript strict: true đã được bật sẵn bởi create-next-app.
- `npx tsc --noEmit` → 0 errors sau khi hoàn thành.
- Đã tạo `/src/lib/utils.ts` (cn, formatDate, formatCurrency, slugify...) và `/src/lib/types.ts` (SSOT đầy đủ cho Doctor, Herb, Article, Appointment, Department).
- Đã tổ chức lại tài liệu vào `/docs/project/` theo Rule 13.

## **PHASE 2: XÂY DỰNG LAYOUT CHUNG (UI/UX BASE)** ✅ HOÀN THÀNH

* \[x\] 1\. Viết component Header.tsx: Responsive với hamburger menu mobile, top bar thông báo, sticky với backdrop-blur khi scroll, dropdown submenu, nút "Đặt lịch khám" nổi bật.
* \[x\] 2\. Viết component Footer.tsx: 4 cột (giới thiệu, dịch vụ, hỗ trợ, liên hệ+giờ làm việc), Google Maps nhúng, mạng xã hội, copyright bar.
* \[x\] 3\. Tích hợp Header và Footer vào /src/app/layout.tsx (main với role="main" cho a11y).

## **PHASE 3: XÂY DỰNG TRANG CHỦ & MOCK DATA** ✅ HOÀN THÀNH

* \[x\] 1\. Định nghĩa các Interfaces trong /lib/types.ts (Doctor, Article, Herb). SSOT chuẩn. *(Hoàn thành sớm trong Phase 1)*
* [x] 1. Định nghĩa các Interfaces trong /lib/types.ts (Doctor, Article, Herb). SSOT chuẩn. *(Hoàn thành sớm trong Phase 1)*
* [x] 2. Viết file /services/mockData.ts chứa dữ liệu giả cho Bác sĩ, Tin tức, Dược liệu.
* [x] 3. Code HeroSection.tsx: Banner chính với câu khẩu hiệu và nút Call-to-action.
* [x] 4. Code FeaturedServices.tsx: 3-4 khối dịch vụ chính (Khám bệnh, Dược liệu, Nghiên cứu).
* [x] 5. Code FeaturedDoctors.tsx: Grid hiển thị các bác sĩ tiêu biểu.
* [x] 6. Ráp tất cả vào /src/app/page.tsx để hoàn thiện Trang chủ.

## **PHASE 4: TÍNH NĂNG CỐT LÕI (CÁC TRANG CON)** ✅ HOÀN THÀNH

* [x] 1. Code /src/app/duoc-lieu/page.tsx: Trang danh sách dược liệu, hiển thị dạng thẻ Grid.
* [x] 2. Thêm tính năng Search & Filter (thanh tìm kiếm + bộ lọc theo Category).
* [x] 3. Code /src/app/dat-lich/page.tsx: Form đặt lịch khám đa bước (Step-by-step).
* [x] 4. Xử lý Validation form Đặt lịch: Số điện thoại VN, bắt buộc điền các field cần thiết.

## **PHASE 5: CẢI TỔ GIAO DIỆN (UI/UX REDESIGN)** ✅ HOÀN THÀNH

* [x] 1. Áp dụng kiến trúc Landing Page (Creative Agency Style).
* [x] 2. Tích hợp Framer Motion cho Scroll Animations mượt mà.
* [x] 3. Tích hợp ảnh AI (Đông y, Vườn y đạo) vào lưới Bento Grid.
* [x] 4. Hoàn thiện Header & Footer chuẩn thông tin của Viện Y Dược Học Dân Tộc.

## **PHASE 6: XÂY DỰNG BACKEND & ADMIN DASHBOARD** ✅ HOÀN THÀNH

* [x] 1. Cài đặt Prisma ORM và SQLite Database.
* [x] 2. Thiết kế Schema cốt lõi: User, Category, Post, Appointment.
* [x] 3. Xây dựng Route API `/api/appointments` nhận form liên hệ từ Landing Page.
* [x] 4. Xây dựng trang quản trị `/admin` và `/admin/appointments` lấy dữ liệu thực từ Database.
* [x] 5. Nối Form "Gửi Yêu Cầu" ở Landing Page với Database thành công.

## **PHASE 7: PHÁT TRIỂN TÍNH NĂNG TIẾP THEO (Dự kiến)**

* [ ] 1. Tính năng đăng bài viết (CMS/Tin tức) cho Admin.
* [ ] 2. Tính năng xác thực đăng nhập (NextAuth) cho màn hình Admin.
* [ ] 3. Nâng cấp Database từ SQLite sang PostgreSQL khi đưa lên môi trường thực tế.

## **GHI CHÚ (HANDOVER - 2026-04-21)**

**Toàn bộ hệ thống (Từ Phase 1 đến Phase 6) đã HOÀN THÀNH:**
- Hệ thống đã biến thành một Fullstack Web App thực sự với kiến trúc chuẩn mực.
- Cấu trúc thư mục được bảo toàn hoàn hảo.
- Database đã sẵn sàng hoạt động tại file `dev.db`.
- **Nhánh hiện tại:** Tất cả đã được gộp (Merge) vào nhánh `main` để làm nguồn duy nhất.

**Dự án đã sẵn sàng cho các yêu cầu tiếp theo của bạn!**