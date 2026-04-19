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

## **PHASE 3: XÂY DỰNG TRANG CHỦ & MOCK DATA**

* \[x\] 1\. Định nghĩa các Interfaces trong /lib/types.ts (Doctor, Article, Herb). SSOT chuẩn. *(Hoàn thành sớm trong Phase 1)*
* \[ \] 2\. Viết file /services/mockData.ts chứa dữ liệu giả cho Bác sĩ, Tin tức, Dược liệu.
* \[ \] 3\. Code HeroSection.tsx: Banner chính với câu khẩu hiệu và nút Call-to-action.
* \[ \] 4\. Code FeaturedServices.tsx: 3-4 khối dịch vụ chính (Khám bệnh, Dược liệu, Nghiên cứu).
* \[ \] 5\. Code FeaturedDoctors.tsx: Grid hiển thị các bác sĩ tiêu biểu.
* \[ \] 6\. Ráp tất cả vào /src/app/page.tsx để hoàn thiện Trang chủ.

## **PHASE 4: TÍNH NĂNG CỐT LÕI (CÁC TRANG CON)**

* \[ \] 1\. Xây dựng trang Từ Điển Dược Liệu (/duoc-lieu/page.tsx): Có ô tìm kiếm, hiển thị danh sách dạng lưới.
* \[ \] 2\. Xây dựng trang Đặt Lịch Khám (/dat-lich/page.tsx): Form nhập liệu UI gọn gàng, validation cơ bản.

## **GHI CHÚ CUỐI NGÀY (HANDOVER)**

**Cập nhật: 2026-04-19 23:02 (GMT+7)**

**Phase 1 & Phase 2 đã HOÀN THÀNH:**
- Phase 1: Next.js 16, TypeScript strict, Tailwind CSS v4, design system, utils.ts, types.ts.
- Phase 2: Header.tsx (responsive, dropdown, sticky scroll), Footer.tsx (4 cột, Google Maps), tích hợp layout.tsx.
- Lưu ý: lucide-react v1.8 không có Facebook/Youtube icon — dùng Share2/Play thay thế.
- 0 TypeScript errors sau cả hai phase.

**Tiếp theo:** Phase 3 — mockData.ts + HeroSection + FeaturedServices + FeaturedDoctors + page.tsx.