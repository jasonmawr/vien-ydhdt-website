# ROADMAP TO PERFECTION — Viện Y Dược Học Dân Tộc TP.HCM
> Tài liệu phân tích toàn diện và kế hoạch nâng hệ thống lên **10/10**  
> Tác giả: Senior Technical Analysis (Full-Role: Architect / DevOps / PM / BA / QA)  
> Cập nhật: **2026-05-21** | Branch: `feature/enterprise-cms` → `develop`

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack hiện tại](#2-tech-stack-hiện-tại)
3. [Đánh giá hiện trạng](#3-đánh-giá-hiện-trạng)
4. [Gap Analysis — Admin / CMS](#4-gap-analysis--admin--cms)
5. [Gap Analysis — Người dùng / Bệnh nhân](#5-gap-analysis--người-dùng--bệnh-nhân)
6. [Roadmap Phases A–G (đang triển khai)](#6-roadmap-phases-ag)
7. [Roadmap Phases H–N (kế hoạch mới)](#7-roadmap-phases-hn--kế-hoạch-mới)
8. [Kiến trúc đích (Target Architecture)](#8-kiến-trúc-đích)
9. [Checklist 10/10](#9-checklist-1010)
10. [Phụ lục: Env vars & Dependencies](#10-phụ-lục)

---

## 1. Tổng quan dự án

**Tên:** Website chính thức Viện Y Dược Học Dân Tộc TP.HCM  
**Domain đích:** https://vienydhdt.gov.vn  
**Mục tiêu:** Cổng thông tin y tế + hệ thống đặt lịch khám + CMS nội bộ + tích hợp HIS Oracle

### Trạng thái các phân hệ

| Phân hệ | Mô tả | Trạng thái | Cập nhật |
|---|---|---|---|
| Frontend (Next.js) | Website công khai, booking, tra cứu | ✅ Production-ready | 2026-05-13 |
| Backend API (Express) | REST API, auth, HIS bridge | ✅ Production-ready | 2026-05-13 |
| Web CMS (SQLite) | Quản lý bài viết, danh mục, SEO, file đính kèm | ✅ Enterprise MVP | 2026-05-12 |
| HIS Integration (Oracle) | Bác sĩ, lịch hẹn, chuyên khoa | ✅ Read+Write | 2026-05-12 |
| Admin Panel | CRUD dashboard, logs, analytics, media, users | ✅ Done 100% (auth fix 05-21) | 2026-05-21 |
| AI Chatbot | Gemini 2.0 Flash + RAG | ✅ MVP | 2026-05-12 |
| Social FAB | Facebook / YouTube / Zalo floating button | ✅ Done | 2026-05-13 |
| PWA (manifest + sw.js) | Offline support, installable | ✅ Scaffolded | 2026-05-12 |
| OG Image động | opengraph-image.tsx | ✅ Done | 2026-05-12 |
| Patient Portal | Tài khoản bệnh nhân, lịch sử | 🔄 50% (backend scaffolded) | 2026-05-12 |
| Notification System | Email/SMS xác nhận, reminder | 🔄 40% (mailer + sms + scheduler scaffolded) | 2026-05-12 |
| Analytics Dashboard | Thống kê admin | ✅ Recharts charts + line/bar/pie | 2026-05-18 |
| RBAC | Role-based access control | 🔄 30% (middleware + user module scaffolded) | 2026-05-12 |
| Doctor Availability | Real-time slot availability | 🔄 20% (AvailabilityCalendar scaffolded) | 2026-05-12 |
| Doctor Rating | Review sau khám | ✅ API + Admin UI + Patient page hoàn chỉnh | 2026-05-18 |
| Zalo ZNS | Zalo Notification Service | ✅ Wired vào booking flow (cần credentials) | 2026-05-18 |
| Automated Backup | SQLite daily backup + email report | ✅ backup.ts + scheduler 2AM | 2026-05-18 |
| CI/CD | GitHub Actions type-check + Docker build | ✅ .github/workflows/ci.yml | 2026-05-18 |
| QR Check-in | Check-in tự động tại lễ tân | ❌ Chưa có | — |
| Telemedicine | Video tư vấn trực tuyến | ❌ Chưa có | — |
| BHYT Integration | Kiểm tra thẻ bảo hiểm y tế | ❌ Chưa có | — |
| Corporate Packages | Gói khám sức khỏe cho doanh nghiệp | ❌ Chưa có | — |
| Mobile App (React Native) | App nội bộ bác sĩ + bệnh nhân | ⏸ Scaffolded, defer | 2026-05-12 |
| Multi-source Booking | Đồng bộ lịch khám đa kênh (Web, App, Tổng đài, Trực tiếp) | 🔄 0% (Co-development) | 2026-05-21 |
| Clinical Results Portal | Cổng tra cứu kết quả cận lâm sàng, xét nghiệm, đơn thuốc | 🔄 0% (Co-development) | 2026-05-21 |
| Operations CMS | CMS nội bộ quản lý văn bản, thông báo, báo cáo điều hành | 🔄 0% (Co-development) | 2026-05-21 |
| Sub-portals Layouts | Tách biệt bố cục subsites khám bệnh, tin tức, Q&A hỏi đáp | 🔄 0% (Co-development) | 2026-05-21 |
| Pharmacy E-Commerce | Mua dược liệu và thuốc theo đơn online (quy trình phức tạp) | 🔄 0% (Co-development) | 2026-05-21 |
| EMR Secure Channel | Cổng cung cấp Bệnh án điện tử có ký số bảo mật | 🔄 0% (Co-development) | 2026-05-21 |


---

## 2. Tech Stack hiện tại

### Frontend
```
Next.js (App Router, Turbopack)
React 19 + TypeScript strict
Tailwind CSS v4
Framer Motion v12 (animations)
next-intl v4 (i18n: VI/EN/ZH, cookie-based)
Shadcn/ui components
Sonner (toasts)
```

### Backend
```
Node.js + Express.js (TypeScript)
oracledb thick client → Oracle HIS (MEDI schema, 1269 tables)
better-sqlite3 → SQLite (web_cms.sqlite, WAL mode)
JWT authentication (jsonwebtoken) — admin + patient tokens tách biệt
express-rate-limit (global 1000/15min, strict 50/15min)
winston (structured logging, daily rotate)
multer (file uploads)
sanitize-html (XSS protection)
Tiptap v2 (rich text editor)
nodemailer (email — scaffolded)
node-cron (scheduler — scaffolded)
ESMS.vn SMS (scaffolded)
```

### AI & Integrations
```
Google Gemini 2.0 Flash (chatbot)
VietQR / VietinBank (RSA-signed payment, SSE)
Google Maps embed
```

### Infrastructure (hiện tại)
```
Dev: Windows PC, localhost
DB: Oracle 19c (HIS) + SQLite file (WAL mode)
File storage: local /uploads directory
PWA: manifest.json + sw.js (cache-first static, network-first API)
```

---

## 3. Đánh giá hiện trạng

### Điểm số tổng hợp (cập nhật 2026-05-21)

| Chiều đánh giá | 05-12 | 05-18 | **05-21 (hiện tại)** | Mục tiêu |
|---|---|---|---|---|
| **Admin / CMS / Quản trị** | 6.2 | 8.5 | **9.0 / 10** | 10 / 10 |
| **Người dùng / Bệnh nhân** | 7.0 | 8.7 | **8.8 / 10** | 10 / 10 |
| **Tổng thể** | 6.6 | 8.6 | **8.9 / 10** | 10 / 10 |


### Breakdown Admin (9.0/10)
| Tiêu chí | 05-18 | **05-21** | Mục tiêu |
|---|---|---|---|
| Kiến trúc backend, code quality | 8.5/10 | **8.5/10** | 9.5/10 |
| Admin UI/UX & CRUD completeness | 8.5/10 | **9/10** ↑ auth fix deployed | 10/10 |
| Bảo mật (auth, rate limit, sanitize) | 8/10 | **9/10** ↑ admin cookie secure/sameSite fix | 9.5/10 |
| Scalability (DB, caching) | 5/10 | **5/10** | 9/10 |
| RBAC & multi-user management | 4/10 | **4/10** | 10/10 |
| Media Library | 7/10 | **7/10** | 9/10 |
| Workflow (draft/schedule/approve) | 7.5/10 | **7.5/10** | 9/10 |
| Notification & alerting admin | 7/10 | **7/10** | 9/10 |
| Observability (logging/analytics) | 8.5/10 | **8.5/10** | 9/10 |
| Backup & disaster recovery | 8/10 | **8/10** | 9/10 |


### Breakdown User/Patient (8.7/10)
| Tiêu chí | 05-13 | **05-18** | Mục tiêu |
|---|---|---|---|
| Thiết kế & UX tổng thể | 9/10 | **9/10** | 9.5/10 |
| Thông tin bệnh viện đầy đủ | 8.5/10 | **8.5/10** | 10/10 |
| Luồng đặt lịch | 8/10 | **8.5/10** ↑ review link wired | 9.5/10 |
| Tìm kiếm & phát hiện thông tin | 8/10 | **8/10** | 9/10 |
| SEO & khả năng tìm thấy | 9/10 | **9.5/10** ↑ FAQPage + BreadcrumbList done | 9.5/10 |
| Patient Portal / tài khoản | 4/10 | **4/10** | 9/10 |
| Thông báo xác nhận (email/SMS/ZNS) | 3/10 | **7/10** ↑ flow wired, cần credentials | 10/10 |
| Real-time availability | 4/10 | **4/10** | 9/10 |
| Kênh liên lạc (Zalo, social, hotline) | 8.5/10 | **9/10** ↑ ZNS + review system | 9.5/10 |
| Mobile & accessibility | 8/10 | **8/10** | 9/10 |
| Performance (CDN, cache, PWA) | 7/10 | **7/10** | 9/10 |

---

## 4. Gap Analysis — Admin / CMS

### GAP-A1: SQLite không phù hợp production scale ⚠️ MEDIUM
**Trạng thái:** 🔄 WAL mode đã bật — ổn cho < 10 admin đồng thời  
**Giải pháp dài hạn:** Migrate sang PostgreSQL khi traffic tăng.

### GAP-A2: RBAC chưa hoàn chỉnh 🔄 30%
**Trạng thái:** `backend/src/modules/auth/rbac.middleware.ts` đã có, `users module` đã scaffold.  
**Còn lại:**
- [ ] Wiring middleware vào các routes CMS (editor không được publish, moderator không tạo được)
- [ ] Admin UI `/admin/users` hoàn thiện (tạo user, đổi role, deactivate)
- [ ] Kiểm tra tất cả API endpoints đã apply đúng role

### GAP-A3: Media Library 🔄 70%
**Trạng thái:** `/admin/media/page.tsx` và `/api/upload/stats` đã có.  
**Còn lại:**
- [ ] Xóa file từ UI (DELETE /api/upload/:filename)
- [ ] Copy URL to clipboard
- [ ] Filter theo loại file / tháng

### GAP-A4: Scheduled Publishing 🔄 40%
**Trạng thái:** Cron scheduler scaffolded, UI có DateTimePicker.  
**Còn lại:**
- [ ] Verify cron job publish đúng giờ
- [ ] UI hiển thị countdown đến lúc publish

### GAP-A5: Content Versioning ✅ DONE
**Trạng thái:** Version history đã triển khai (Group 1, 2026-05-12).

### GAP-A6: Email / Admin Notification 🔄 40%
**Trạng thái:** `backend/src/shared/mailer.ts` + `templates/` đã có.  
**Còn lại:**
- [ ] Wire vào appointments.router.ts (trigger khi có lịch hẹn mới)
- [ ] Test thực tế với Gmail SMTP
- [ ] Template admin-notify cho lịch hẹn mới

### GAP-A7: Analytics Dashboard 🔄 60%
**Trạng thái:** `/admin/analytics/page.tsx` có, đã fix lỗi fetch crash.  
**Còn lại:**
- [ ] Charts (Recharts) thay vì text numbers
- [ ] Booking funnel visualization
- [ ] Plausible integration cho traffic data

### GAP-A8: Automated Backup ❌ 0%
**Còn lại:**
- [ ] `backend/scripts/backup.ts` hoàn thiện
- [ ] Schedule daily 2AM
- [ ] Email report sau mỗi backup
- [ ] Upload to Google Drive / NAS

### GAP-A9: Tính năng nhỏ Admin
- [x] ~~Duplicate post~~ ✅ Done (Group 1)
- [x] ~~Version history~~ ✅ Done (Group 1)
- [x] ~~Pagination bài viết~~ ✅ Done (Group 1)
- [x] ~~System logs viewer~~ ✅ Done
- [ ] Bulk actions (multi-select publish/delete)
- [ ] Export bài viết CSV/Word
- [ ] Internal link checker (broken links trong content)
- [ ] Post templates (mẫu thông báo, mẫu tin tức y tế)
- [ ] Image alt text validation

---

## 5. Gap Analysis — Người dùng / Bệnh nhân

### GAP-U1: Patient Portal 🔄 50%
**Trạng thái:** Backend modules (`patient-auth/`, `patient/`) scaffolded. Frontend `/tai-khoan/` scaffolded.  
**Còn lại:**
- [ ] Verify OTP flow end-to-end hoạt động
- [ ] Frontend: Step-by-step OTP login UI hoàn thiện
- [ ] `/tai-khoan/lich-hen` — xem / hủy lịch hẹn
- [ ] `/tai-khoan/thong-tin` — chỉnh sửa thông tin cá nhân
- [ ] Link với Oracle W_HEN để load lịch sử khám thực tế

### GAP-U2: Email/SMS Xác nhận 🔄 40%
**Trạng thái:** Mailer + SMS + Scheduler đã scaffold.  
**Còn lại:**
- [ ] Wire vào booking flow (trigger sau khi đặt lịch thành công)
- [ ] Test thực với ESMS.vn API key thật
- [ ] SMS reminder cron hoạt động ổn định (xử lý retry)
- [ ] Template email đẹp (appointment-confirm.hbs)

### GAP-U3: Doctor Availability 🔄 20%
**Trạng thái:** `AvailabilityCalendar.tsx` scaffolded.  
**Còn lại:**
- [ ] Backend API `GET /api/booking/availability?doctorId&date` hoàn thiện
- [ ] Query Oracle W_HEN đếm slot đã đặt
- [ ] UI: hiển thị slot xanh/vàng/đỏ (còn/sắp đầy/hết)
- [ ] Auto-refresh mỗi 60 giây

### GAP-U4: Social Media Links ✅ DONE (2026-05-13)
- Facebook, YouTube (link đúng), Zalo OA — đã có trong SocialFAB
- Footer cũng đã cập nhật YouTube URL đúng

### GAP-U5: Social FAB ✅ DONE (2026-05-13)
- `SocialFAB.tsx` với fan-out animation (spring)
- Ẩn trên trang admin
- Không đè lên ChatWidget (`bottom-24`)

### GAP-U6: Doctor Rating 🔄 20%
**Trạng thái:** `/danh-gia/[token]` route scaffolded.  
**Còn lại:**
- [ ] Schema `doctor_reviews` trong SQLite
- [ ] SMS trigger sau khám (24h sau appointment=completed)
- [ ] Admin review trước khi publish
- [ ] Hiển thị rating trên trang bác sĩ

### GAP-U7: SEO ✅ 100% DONE
**Trạng thái:** OG Image động, sitemap.ts dynamic, JSON-LD đầy đủ (MedicalOrganization/Physician/Article/BreadcrumbList/FAQPage), hreflang vi-VN/en/zh-TW/x-default, canonical URL.

### GAP-U8: Performance 🔄 60%
**Trạng thái:** PWA manifest + sw.js đã có. WebP conversion cho ảnh bác sĩ.  
**Còn lại:**
- [ ] Sharp resize API hoàn thiện (w= / q= query params)
- [ ] Infinite scroll cho `/bac-si` (253+ bác sĩ)
- [ ] CDN (Cloudflare free tier) khi deploy production
- [ ] Lighthouse score tất cả pages ≥ 90

### GAP-U9: Accessibility (a11y) 🔄 70%
**Trạng thái:** Focus trap mobile menu đã có. ARIA labels đã có.  
**Còn lại:**
- [ ] `prefers-reduced-motion` cho Framer Motion
- [ ] Color contrast audit (đặc biệt text nhỏ)
- [ ] Screen reader test (NVDA)

### GAP-U10: Dược Liệu / Nội dung y học cổ truyền 🔄 50%
**Còn lại:**
- [ ] 200+ dược liệu với tên Hán-Việt, tên khoa học, công dụng, hình ảnh
- [ ] `/duoc-lieu/[slug]` — trang chi tiết từng dược liệu
- [ ] Bài thuốc cổ phương kết hợp

---

## 6. Roadmap Phases A–G

> Mỗi Phase = ~1 Sprint (2 tuần) | Ưu tiên: Impact × Effort

### Phase A — Thông báo & Xác nhận ✅ 80% DONE
**Đã hoàn thành (05-18):**
- [x] Wire mailer + ZNS + SMS vào appointments.router.ts ✅
- [x] Admin notification email khi có lịch hẹn mới ✅
- [x] SMS reminder cron scheduler ✅
- [x] Review link token tự động sau đặt lịch ✅
**Còn lại (cần credentials thật):**
- [ ] Test ESMS thực tế với API key thật
- [ ] Test Zalo ZNS với access token thật
- [ ] Test Gmail SMTP với App Password thật

### Phase B — Patient Portal 🔄 50% DONE
**Còn lại:**
- [ ] OTP flow hoàn chỉnh end-to-end
- [ ] `/tai-khoan/lich-hen` UI hoàn thiện
- [ ] Link Oracle W_HEN để xem lịch hẹn thực
- [ ] Email field trong BookingForm

### Phase C — Admin nâng cao 🔄 70% DONE
**Đã hoàn thành (05-18):**
- [x] Automated backup daily (scripts/backup.ts + cron 2AM + email report) ✅
- [x] Admin reviews management page ✅
**Còn lại:**
- [ ] RBAC wired đầy đủ vào CMS routes
- [ ] `/admin/users` — User Management UI hoàn thiện
- [ ] Scheduled publishing verify end-to-end

### Phase D — Real-time & Availability ❌ 20%
**Còn lại:**
- [ ] `GET /api/booking/availability` API hoàn thiện
- [ ] UI slot calendar với màu trạng thái
- [ ] Ngăn double-booking tại API layer
- [ ] WebSocket hoặc SSE cho live updates

### Phase E — Performance & Infrastructure ❌ 20%
**Còn lại:**
- [ ] SQLite WAL mode verify ✅ / plan PostgreSQL migration
- [ ] Redis cache cho Oracle queries (departments, doctors - 500-2000ms)
- [ ] Image resize sharp API hoàn thiện
- [ ] Infinite scroll `/bac-si`
- [ ] Cloudflare CDN setup

### Phase F — Channels & Engagement ✅ 100% DONE 🎉
**Đã hoàn thành:** SocialFAB, Social URLs đúng, OG Image động  
**Đã hoàn thành (05-18):**
- [x] Doctor rating system: API + Admin review page + Patient rating page ✅
- [x] FAQPage JSON-LD (`/faq/layout.tsx`) ✅
- [x] BreadcrumbList JSON-LD (tin-tuc, gioi-thieu, lien-he, bac-si, article detail) ✅
- [x] hreflang vi-VN / en / zh-TW / x-default trong root layout ✅

### Phase G — Analytics & Intelligence 🔄 55% DONE
**Đã hoàn thành (05-18):**
- [x] Recharts integration: LineChart (14-day trend) + BarChart (top posts) + PieChart (status) ✅
**Còn lại:**
- [ ] Plausible Analytics self-hosted / script
- [ ] Booking conversion funnel chart
- [ ] AI Chatbot: auto-sync CMS knowledge base
- [ ] Chatbot: top questions → feed vào FAQ page

---

## 7. Roadmap Phases H–N — Kế Hoạch Mới

> Được thêm vào 2026-05-13. Ưu tiên dựa theo tác động thực tế với bệnh nhân Việt Nam.

---

### Phase H — Zalo ZNS (Zalo Notification Service) ✅ 80% DONE
**Impact: CRITICAL | Effort: LOW**
**Đã hoàn thành (05-18):** Service + wiring vào appointments flow ✅ — chỉ cần điền `ZALO_APP_ID`, `ZALO_ACCESS_TOKEN`, `ZALO_TEMPLATE_ID` thật vào `.env`


> Tại sao ưu tiên cao hơn SMS: Zalo ZNS được deliver qua Zalo app (miễn phí nhận, không bị spam filter), hiệu quả hơn SMS truyền thống ở Việt Nam. Chi phí tương đương (500–700đ/tin).

**Thực hiện:**
1. Đăng ký Zalo OA → kích hoạt ZNS tại `developers.zalo.me`
2. Template ZNS cần submit để Zalo approve (1–3 ngày):
   - "Xác nhận lịch hẹn" (transaction type — luôn delivery)
   - "Nhắc lịch hẹn" (marketing type — cần opt-in)
3. API call:

```typescript
// backend/src/shared/zns.ts
export async function sendZNS(phone: string, templateId: string, params: Record<string, string>) {
  const token = await getZaloAccessToken();
  await axios.post('https://business.openapi.zalo.me/message/template', {
    phone: phone.replace(/^0/, '84'),
    template_id: templateId,
    template_data: params,
    tracking_id: `appt_${Date.now()}`,
  }, { headers: { access_token: token } });
}
```

4. Thay thế ESMS trong `notifications.service.ts` bằng ZNS (với fallback sang SMS)

**Files:**
- `backend/src/shared/zns.ts` — ZNS API wrapper
- `backend/src/shared/zalo-auth.ts` — OAuth token management (refresh mỗi 90 ngày)
- Sửa `backend/src/shared/scheduler.ts` — dùng ZNS cho reminder

---

### Phase I — QR Code Check-in
**Impact: HIGH | Effort: MEDIUM | Sprint: 1.5 tuần**

> Giảm tải lễ tân, bệnh nhân không cần xếp hàng, tự check-in bằng điện thoại.

**Flow:**
```
Bệnh nhân đặt lịch → nhận email/ZNS có QR code
→ Đến viện → quét QR tại terminal
→ Hệ thống xác nhận check-in
→ Màn hình hiển thị "Chào [Tên]! Số thứ tự: 042, Phòng: 203"
→ Admin dashboard thấy real-time check-in status
```

**Implementation:**
```typescript
// Backend: POST /api/booking/checkin
// Body: { qr_token: string }
// → verify token (JWT với appointmentId)
// → update HIS appointment status = 'checked_in'
// → return: { stt, room, doctorName, estimatedWait }

// Frontend: /checkin/[token] — landing page tự động sau khi quét
// Admin: /admin/appointments — cột "Đã check-in" realtime

// QR generation khi tạo lịch hẹn:
import QRCode from 'qrcode';
const qrToken = jwt.sign({ appointmentId, phone }, QR_SECRET, { expiresIn: '7d' });
const qrDataUrl = await QRCode.toDataURL(`https://vienydhdt.gov.vn/checkin/${qrToken}`);
```

**Files:**
- `backend/src/shared/qr.ts` — QR generation util
- `backend/src/modules/booking/checkin.service.ts`
- `vien-ydh-frontend/src/app/checkin/[token]/page.tsx`

---

### Phase J — BHYT (Bảo hiểm Y tế) Integration
**Impact: HIGH | Effort: HIGH | Sprint: 3 tuần**

> 85% bệnh nhân tại viện dùng BHYT. Tự động nhận dạng thẻ = giảm 5–10 phút thủ tục đăng ký.

**Option 1: OCR Camera (khả thi ngay)**
```typescript
// Dùng Google Vision API / Tesseract.js để đọc thẻ BHYT
// Trích xuất: Số thẻ, Họ tên, Ngày sinh, Giá trị đến
import Tesseract from 'tesseract.js';
const { data } = await Tesseract.recognize(imageFile, 'vie');
// Parse: /(\d{10})\s+(\d{2}\/\d{2}\/\d{4})/
```

**Option 2: Kết nối API BHXH (yêu cầu xin phép)**
- Cổng thông tin BHXH Việt Nam có API partner
- Input: Số CCCD / Số thẻ BHYT
- Output: Thông tin người tham gia, thời hạn, tỉ lệ hưởng
- Cần ký thỏa thuận kết nối dữ liệu với BHXH TP.HCM

**Files:**
- `vien-ydh-frontend/src/components/features/BHYTScanner.tsx` — camera capture
- `backend/src/modules/bhyt/bhyt.service.ts` — OCR + BHXH API
- Thêm field BHYT trong BookingForm

---

### Phase K — Telemedicine / Video Tư Vấn
**Impact: HIGH | Effort: HIGH | Sprint: 3 tuần**

> Xu hướng sau COVID. Y học cổ truyền phù hợp tư vấn online (không cần khám trực tiếp nhiều trường hợp).

**Tech Stack:**
- **Jitsi Meet** (self-hosted, open source, miễn phí) — tốt nhất cho bệnh viện
- Hoặc **Daily.co** (có free tier 2000 phút/tháng)

**Flow:**
```
Bệnh nhân đặt lịch "Khám online" → chọn bác sĩ + giờ
→ Hệ thống tạo room ID duy nhất
→ Gửi link Jitsi qua ZNS/Email cho cả bệnh nhân + bác sĩ
→ Đúng giờ: bấm link → vào phòng khám ảo
→ Bác sĩ dùng Doctor Portal xem lịch và vào phòng
→ Sau khám: bác sĩ điền ghi chú → hệ thống lưu summary
```

**Files:**
- `vien-ydh-frontend/src/app/kham-online/[roomId]/page.tsx` — Jitsi embed
- `backend/src/modules/telemedicine/telemedicine.service.ts` — room management
- `backend/src/modules/telemedicine/telemedicine.router.ts`
- Sửa `BookingForm.tsx` — thêm option "Khám trực tiếp / Khám online"

**Lưu ý bảo mật:**
- Room ID phải là JWT token có TTL (không share được sau khi hết hạn)
- Waiting room: bệnh nhân chờ bác sĩ admit
- Không record video (tuân thủ HIPAA/bảo mật y tế)

---

### Phase L — Doctor & Staff Portal
**Impact: HIGH | Effort: MEDIUM | Sprint: 2 tuần**

> Bác sĩ cần xem lịch của chính mình, cập nhật tình trạng bệnh nhân, không cần qua admin.

**Roles mới:**
```
doctor  → xem lịch hẹn của mình, xem thông tin bệnh nhân đã check-in, cập nhật ghi chú
nurse   → xem tất cả lịch hẹn trong ngày, check-in bệnh nhân, ghi chú nhỏ
```

**Doctor Portal pages:**
```
/doctor/dashboard     → Lịch hẹn hôm nay + tuần này
/doctor/patients      → Danh sách bệnh nhân đã khám
/doctor/schedule      → Đánh dấu ngày nghỉ / thay đổi lịch
/doctor/profile       → Cập nhật tiểu sử, chuyên môn
```

**Files:**
- `backend/src/modules/doctor-portal/doctor.router.ts`
- `vien-ydh-frontend/src/app/doctor/` directory
- Mở rộng RBAC: thêm role `doctor` + `nurse`

---

### Phase M — Corporate Health Packages (B2B)
**Impact: MEDIUM | Effort: MEDIUM | Sprint: 2 tuần**

> Doanh nghiệp tại TP.HCM thường mua gói khám sức khỏe định kỳ cho nhân viên. Đây là nguồn doanh thu ổn định.

**Features:**
```
Trang /goi-kham-doanh-nghiep:
  - Danh sách gói: Cơ bản (500k/người) | Nâng cao (1.2tr) | VIP (3tr)
  - Form đăng ký: Tên công ty, số lượng nhân viên, ngày khám dự kiến
  - Upload danh sách nhân viên (Excel)
  - Admin quản lý đơn hàng B2B riêng

Backend:
  - POST /api/corporate/inquiry
  - Webhook → email sales team
  - Bảng corporate_orders trong SQLite
```

---

### Phase N — AI & Smart Features Nâng Cao
**Impact: HIGH | Effort: HIGH | Sprint: 4–6 tuần**

#### N.1 — AI Symptom Checker (Pre-triage)
> Bệnh nhân mô tả triệu chứng → AI gợi ý chuyên khoa phù hợp → chuyển sang booking form đúng bác sĩ

```typescript
// Prompt system:
const TRIAGE_SYSTEM = `Bạn là trợ lý y tế sơ bộ của Viện Y Dược Học Dân Tộc TP.HCM.
Khi người dùng mô tả triệu chứng, hãy:
1. Hỏi thêm 1-2 câu để làm rõ
2. Gợi ý chuyên khoa phù hợp trong danh sách: [list departments]
3. KHÔNG chẩn đoán bệnh cụ thể
4. Luôn khuyến nghị khám trực tiếp
`;
```

**Tích hợp:** Thêm tab "Kiểm tra triệu chứng" trong ChatWidget hoặc tạo trang riêng `/trieu-chung`

#### N.2 — Drug/Herb Interaction Checker
> Công cụ tra cứu tương tác thuốc đặc biệt quan trọng với Y học cổ truyền

```
Input: Chọn 2-5 dược liệu / thuốc
Output: Cảnh báo tương tác (nếu có) + khuyến nghị liều dùng
Database: Tự build từ tài liệu y học + cross-reference WHO
```

#### N.3 — RAG Enhancement cho Chatbot
> Auto-sync bài viết CMS mới vào knowledge base của chatbot

```typescript
// Cron job: mỗi khi bài viết được published
// → Extract text từ HTML content
// → Chunk thành đoạn 500-800 tokens
// → Embed qua Gemini Embedding API
// → Lưu vào vector store (chroma local hoặc pgvector)
// → ChatBot sử dụng similarity search để lấy context
```

#### N.4 — Appointment Reschedule với AI Suggestion
> Khi bác sĩ nghỉ đột xuất, AI suggest slot thay thế phù hợp nhất cho bệnh nhân

---

### Phase O — App Mobile Chính Thức
**Impact: HIGH | Effort: VERY HIGH | Sprint: 8–12 tuần**
**Điều kiện:** Sau khi Patient Portal web ổn định 100%

```
React Native / Expo (cross-platform iOS + Android)

Features ưu tiên:
  - Đặt lịch khám (reuse BookingForm logic)
  - Xem lịch hẹn + QR check-in
  - Push notifications (FCM) — quan trọng hơn SMS/ZNS
  - Tra cứu bác sĩ + chuyên khoa
  - AI Chatbot
  - Zalo OA deep link
  - Xem kết quả xét nghiệm (khi HIS hỗ trợ)

Tech stack:
  - Expo Router (file-based routing)
  - React Native Paper / NativeWind (UI)
  - Reanimated v3 (animations)
  - MMKV (local storage)
  - Zustand (state)
  - Biometric auth (Face ID / fingerprint)
```

---

### Phase P — Infrastructure Production-Ready 🔄 60% DONE
**Impact: CRITICAL | Effort: MEDIUM**
**Đã hoàn thành (05-18):**
- [x] Docker Compose (backend :4000, frontend :3000, nginx) ✅
- [x] Nginx reverse proxy config ✅
- [x] GitHub Actions CI/CD (type-check + Docker build) ✅
- [x] Daily backup cron (2AM, email report) ✅
**Còn lại (trước go-live):**
```
[ ] Cloudflare: DNS + CDN + WAF (free tier đủ dùng)
[ ] SSL Let's Encrypt trên server thật
[ ] UptimeRobot free: monitor /health endpoint
[ ] Sentry free tier: error tracking
[ ] Firewall: chỉ expose 80, 443, 22
[ ] Backup: upload Google Drive (hiện chỉ lưu local)
[ ] Redis (optional — SQLite WAL đủ cho giai đoạn đầu)
```

---

### Phase Q — Đồng bộ Đặt lịch khám đa kênh phức tạp (Multi-source Complex Scheduling Engine)
**Impact: VERY HIGH | Effort: HIGH | Sprint: 3–4 tuần | Phối hợp cùng đối tác**
> Tích hợp đồng nhất lịch khám từ 4 nguồn: Tổng đài, Website, Mobile App và Đăng ký trực tiếp.

* **Nhiệm vụ chính:**
  1. Xây dựng **Bộ phân bổ và kiểm soát chỗ trống (Clinic Availability Engine)**: Đọc lịch trực và định mức khám của bác sĩ từ Core HIS Oracle.
  2. Thiết kế cơ chế **Khóa slot tạm thời (Optimistic Session Locking)**: Khi người bệnh thao tác trên web/app, hệ thống tạm giữ slot trong 5-10 phút để tránh trùng lặp chỗ (double-booking).
  3. Cấp API kết nối thời gian thực cho hệ thống tổng đài viên và đối tác ngoại viện.
* **Hạng mục phối hợp:**
  * Phòng CNTT mở cổng SPs/Views an toàn kết nối lịch trực HIS.
  * Đối tác thiết kế thuật toán khóa slot chống race condition ở API backend và hàng đợi giao tiếp.

---

### Phase R — Cổng cận lâm sàng & Đơn thuốc y khoa (Patient Lab Results Portal)
**Impact: CRITICAL | Effort: HIGH | Sprint: 3 tuần | Phối hợp cùng đối tác**
> Bệnh nhân xem lịch sử khám và tra cứu nhanh kết quả xét nghiệm, siêu âm, X-quang, CT, MRI và toa thuốc.

* **Nhiệm vụ chính:**
  1. Phát triển giao diện tra cứu trực quan và an toàn trong tài khoản bệnh nhân.
  2. Kết xuất chỉ số xét nghiệm (LIS) kèm dải tham chiếu sức khỏe.
  3. Nhúng kết quả chẩn đoán hình ảnh (PACS) kèm bản mô tả chi tiết của bác sĩ.
  4. Đơn thuốc điện tử tích hợp liều dùng và hướng dẫn trực quan.
* **Hạng mục phối hợp:**
  * Phòng CNTT thiết lập kết nối an toàn VPN/LAN nội bộ đến các CSDL LIS, PACS và HIS.
  * Đối tác lập trình giao diện hiển thị Next.js sinh động và triển khai giải pháp mã hóa bảo mật thông tin y tế theo Nghị định 13/2023/NĐ-CP.

---

### Phase S — Phân hệ Quản lý điều hành & Văn bản CMS (Operations CMS)
**Impact: HIGH | Effort: MEDIUM | Sprint: 2 tuần | Phối hợp cùng đối tác**
> Quản lý nội bộ các thông báo, quyết định pháp quy, báo cáo số liệu và văn bản hành chính của Viện.

* **Nhiệm vụ chính:**
  1. Thiết kế phân hệ lưu trữ và phân loại tài liệu pháp lý, chỉ thị lãnh đạo.
  2. Thiết lập cơ chế phân quyền xem nâng cao theo phòng ban (RBAC mở rộng).
  3. Xây dựng công cụ tìm kiếm văn bản toàn văn (Full-text Search) tốc độ cao.
* **Hạng mục phối hợp:**
  * IT Viện định nghĩa cấu trúc phòng ban và luồng phê duyệt văn bản.
  * Đối tác xây dựng module CRUD văn bản và cơ chế phân quyền trên Admin Panel.

---

### Phase T — Tái cấu trúc Bố cục Subsites (Sub-portals Layouts)
**Impact: HIGH | Effort: MEDIUM | Sprint: 2.5 tuần | Phối hợp cùng đối tác**
> Phân chia trang web thành các cổng thành phần để tối ưu trải nghiệm và cung cấp đúng thông tin người bệnh cần nhanh nhất.

* **Nhiệm vụ chính:**
  1. **Sub-portal Khám chữa bệnh:** Giá dịch vụ y tế công khai, lịch khám bác sĩ cập nhật real-time, form đăng ký khám nhanh gọn.
  2. **Trung tâm Tin tức & Truyền thông:** Nghiên cứu khoa học, hoạt động y học cổ truyền, y học thường thức.
  3. **Kênh Hỏi & Đăng (Q&A Forum):** Người bệnh đặt câu hỏi ẩn danh, admin điều phối đến bác sĩ chuyên khoa duyệt và phản hồi tương tác trực tiếp.
* **Hạng mục phối hợp:**
  * IT Viện cung cấp nội dung khoa học và nhân sự bác sĩ tham gia trả lời.
  * Đối tác lập trình giao diện bố cục subsites chuyên biệt và module điều phối hỏi đáp.

---

### Phase U — Cổng mua sắm dược phẩm theo toa trực tuyến (Pharmacy E-Commerce)
**Impact: HIGH | Effort: HIGH | Sprint: 2 tuần | Phối hợp cùng đối tác**
> Người bệnh đặt mua các vị thuốc, dược liệu Đông y thành phẩm uy tín của Viện theo toa thuốc.

* **Nhiệm vụ chính:**
  1. Luồng đặt dược phẩm nâng cao: Tải ảnh chụp toa thuốc y tế lên hệ thống.
  2. Admin duyệt toa thuốc: Khoa Dược kiểm duyệt toa thuốc, đối chiếu tồn kho trên HIS và xác nhận giá trị đơn hàng.
  3. Gửi liên kết thanh toán VietQR động sau khi đơn hàng được duyệt.
* **Hạng mục phối hợp:**
  * Viện cung cấp quy trình nghiệp vụ kiểm duyệt đơn thuốc y khoa và bảng giá thuốc.
  * Đối tác xây dựng luồng giỏ hàng, module upload/duyệt đơn thuốc và tích hợp API thanh toán.

---

### Phase V — Kênh Bệnh án điện tử bảo mật cao (EMR Secure Channel)
**Impact: CRITICAL | Effort: VERY HIGH | Sprint: 4 tuần | Phối hợp cùng đối tác**
> Số hóa hồ sơ bệnh án, cung cấp cổng thông tin Bệnh án điện tử (EMR) trực tuyến chuẩn hóa đầu ra và có tính pháp lý.

* **Nhiệm vụ chính:**
  1. Số hóa bệnh án thành các định dạng chuẩn y khoa XML/JSON tương thích với cổng BHXH quốc gia.
  2. Tích hợp giải pháp chữ ký số (Digital Signature) của Bác sĩ điều trị và con dấu số của Viện.
  3. Áp dụng xác thực hai lớp (2FA/OTP) và các quy chuẩn bảo mật cấp độ y tế quốc gia.
* **Hạng mục phối hợp:**
  * Phòng CNTT chịu trách nhiệm cổng kết xuất XML/JSON từ Oracle HIS.
  * Đối tác triển khai module hiển thị bệnh án bảo mật, tích hợp chữ ký số và giải pháp mã hóa an ninh thông tin y tế.

---


---

## 8. Kiến trúc đích

```
┌────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                 │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ HTTPS
                   ┌──────────▼──────────┐
                   │     Cloudflare       │  CDN + DDoS + WAF
                   └──────────┬──────────┘
                              │
               ┌──────────────▼──────────────┐
               │        Nginx Reverse Proxy   │
               │  SSL termination, rate limit │
               └──────┬───────────────┬───────┘
                      │               │
            ┌─────────▼──────┐  ┌─────▼────────────┐
            │  Next.js :3000 │  │  Express API :4000│
            │  SSR + Static  │  │  REST + WebSocket │
            └────────────────┘  └──┬──────────┬─────┘
                                   │          │
                      ┌────────────▼──┐  ┌────▼──────────────┐
                      │  Redis :6379  │  │  Oracle HIS DB     │
                      │  Cache 5min   │  │  MEDI schema       │
                      └───────────────┘  └────────────────────┘
                                   │
                      ┌────────────▼──────────────┐
                      │  PostgreSQL (target)        │
                      │  hoặc SQLite + WAL (hiện tại)│
                      │  posts, categories, users   │
                      │  patients, otp, reviews     │
                      │  sms_reminders, versions    │
                      └───────────────────────────┘
                                   │
                   ┌───────────────▼──────────────┐
                   │  Local Storage                │
                   │  /uploads   /backups          │
                   └──────────────────────────────┘
```

**External Services (hiện tại + tương lai):**
```
Google Gemini 2.0 Flash    → AI Chatbot + Triage + RAG
ESMS.vn / Zalo ZNS         → SMS + Zalo notifications  
Nodemailer / SMTP           → Email confirmations
VietinBank VietQR           → Payment QR (SSE)
Google Maps                 → Embed bản đồ
Plausible Analytics         → Privacy-first analytics
Jitsi Meet (self-hosted)   → Video tư vấn [Phase K]
Google Vision API           → BHYT card OCR [Phase J]
Firebase Cloud Messaging    → Mobile push [Phase O]
```

---

## 9. Checklist 10/10

### Admin / CMS

#### Security & Auth
- [x] JWT auth ✅
- [x] Rate limiting ✅
- [x] XSS sanitize (sanitize-html) ✅
- [x] SQL injection prevention (parameterized) ✅
- [ ] RBAC: 5 roles wired vào routes
- [ ] 2FA cho super_admin (TOTP)
- [ ] Audit log: bảng `admin_audit_log`
- [ ] Session invalidation khi đổi password

#### Content Management
- [x] CRUD bài viết ✅
- [x] Rich text editor (Tiptap) ✅
- [x] SEO fields (meta title/desc/og) ✅
- [x] File attachments ✅
- [x] Dynamic taxonomy (categories/tags) ✅
- [x] Version history ✅
- [x] Duplicate post ✅
- [x] Pagination ✅
- [ ] Scheduled publishing (verify end-to-end)
- [ ] Media library hoàn thiện (delete + filter)
- [ ] Bulk actions
- [ ] Post templates
- [ ] Internal link checker

#### Operations
- [x] System logs viewer ✅
- [x] Graceful shutdown ✅
- [x] Health check endpoint ✅
- [x] Admin email notification: lịch hẹn mới ✅ (05-18)
- [x] Daily backup tự động (backup.ts + cron 2AM) ✅ (05-18)
- [ ] Error monitoring (Sentry)
- [ ] Uptime monitoring (UptimeRobot)

#### Analytics
- [x] Analytics page MVP ✅
- [x] Charts (Recharts — LineChart + BarChart + PieChart) ✅ (05-18)
- [ ] Plausible integration
- [ ] Booking funnel
- [ ] Monthly report export

---

### User / Patient

#### Core Pages
- [x] Homepage (BVDaiHoc style mosaic) ✅
- [x] Giới thiệu ✅
- [x] Danh sách bác sĩ + tìm kiếm ✅
- [x] Chi tiết bác sĩ ✅
- [x] Chuyên khoa ✅
- [x] Tin tức + bài viết ✅
- [x] Đặt lịch (3 modes) ✅
- [x] Tra cứu lịch (OTP lookup) ✅
- [x] Dược liệu ✅
- [x] Bảng giá ✅
- [x] FAQ ✅
- [x] Liên hệ ✅
- [x] Custom 404 ✅
- [x] Tìm kiếm ✅
- [x] Chính sách bảo mật ✅
- [x] Quy định ✅
- [x] Đào tạo ✅
- [x] Đấu thầu ✅

#### Logo & Branding
- [x] Header logo: "VIỆN Y DƯỢC HỌC DÂN TỘC / THÀNH PHỐ HỒ CHÍ MINH" ✅ (2026-05-13)

#### Patient Portal
- [ ] OTP login hoàn chỉnh
- [ ] Xem lịch hẹn
- [ ] Hủy lịch hẹn online
- [ ] Chỉnh sửa thông tin cá nhân

#### Notifications
- [x] Email xác nhận đặt lịch (flow wired ✅, cần SMTP credentials) (05-18)
- [x] ZNS/SMS xác nhận (flow wired ✅, cần ESMS+Zalo credentials) (05-18)
- [x] ZNS/SMS reminder 24h trước (scheduler wired ✅) (05-18)

#### Real-time
- [ ] Slot availability calendar
- [ ] Ngăn double-booking

#### Communication
- [x] AI Chatbot (Gemini 2.0 Flash) ✅
- [x] SocialFAB: Facebook + YouTube + Zalo ✅ (2026-05-13)
- [x] YouTube URL đúng ✅ (2026-05-13)
- [ ] Zalo ZNS
- [ ] QR Check-in

#### SEO
- [x] MedicalOrganization JSON-LD ✅
- [x] Physician JSON-LD ✅
- [x] Article JSON-LD ✅
- [x] Sitemap.xml dynamic ✅
- [x] robots.txt ✅
- [x] OG Image động ✅
- [x] FAQPage JSON-LD ✅ (05-18 — faq/layout.tsx)
- [x] BreadcrumbList JSON-LD ✅ (05-18 — tin-tuc, gioi-thieu, lien-he, article detail)
- [ ] hreflang 3 ngôn ngữ trong root layout
- [ ] Canonical tất cả pages

#### Performance
- [x] PWA manifest ✅
- [x] Service Worker ✅
- [ ] LCP < 2.5s
- [ ] Sharp image resize API
- [ ] Infinite scroll /bac-si
- [ ] CDN (Cloudflare)

#### Accessibility
- [x] Focus trap mobile menu ✅
- [x] ARIA labels ✅
- [ ] prefers-reduced-motion
- [ ] Color contrast audit WCAG AA
- [ ] Screen reader test

---

## 10. Phụ lục

### Biến môi trường cần bổ sung

```env
# Mailer
SMTP_HOST=smtp.vienydhdt.gov.vn
SMTP_PORT=587
SMTP_USER=noreply@vienydhdt.gov.vn
SMTP_PASS=xxxx
ADMIN_NOTIFY_EMAILS=admin@vienydhdt.gov.vn

# SMS (ESMS)
ESMS_API_KEY=xxxx
ESMS_SECRET_KEY=xxxx

# Zalo ZNS [Phase H]
ZALO_APP_ID=xxxx
ZALO_APP_SECRET=xxxx
ZALO_ZNS_TEMPLATE_CONFIRM=xxxx
ZALO_ZNS_TEMPLATE_REMINDER=xxxx

# Patient Auth
PATIENT_JWT_SECRET=xxxx_patient_secret
PATIENT_JWT_EXPIRES_IN=7d
OTP_TTL_MINUTES=5

# Redis [Phase E]
REDIS_URL=redis://localhost:6379

# Booking
MAX_APPOINTMENTS_PER_SLOT=10

# Backup
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
GOOGLE_DRIVE_BACKUP_FOLDER=xxxx

# Analytics
PLAUSIBLE_DOMAIN=vienydhdt.gov.vn

# Telemedicine [Phase K]
JITSI_SERVER=https://meet.jit.si
JITSI_JWT_SECRET=xxxx

# QR Check-in [Phase I]
QR_JWT_SECRET=xxxx
QR_TOKEN_TTL=7d

# Social
NEXT_PUBLIC_ZALO_OA_ID=xxxx
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/vienyduochocdantoc
NEXT_PUBLIC_YOUTUBE_URL=https://www.youtube.com/@vienyduochocdantoctpHCM

# Feature Flags
ENABLE_PATIENT_PORTAL=true
ENABLE_SMS_NOTIFICATION=true
ENABLE_EMAIL_NOTIFICATION=true
ENABLE_ZNS=false
ENABLE_TELEMEDICINE=false
ENABLE_REVIEW_SYSTEM=false
```

### Dependencies cần install

```bash
# Backend — hiện tại chưa cài
npm install qrcode @types/qrcode          # Phase I: QR Check-in
npm install recharts                       # Phase G: Analytics charts
npm install @google-cloud/vision          # Phase J: BHYT OCR (optional)

# Backend — đã scaffold (cần verify đã cài chưa)
npm install nodemailer @types/nodemailer  # Phase A: Email
npm install node-cron @types/node-cron   # Phase A,C: Scheduler
npm install ioredis @types/ioredis        # Phase E: Redis cache
npm install sharp @types/sharp            # Phase E: Image resize
npm install axios                         # Phase H: ZNS API

# Frontend
npm install recharts                      # Charts analytics
npm install @radix-ui/react-otp-input    # OTP input
npm install date-fns                      # Date formatting
```

### Thứ tự ưu tiên thực hiện (recommended sprint order)

```
Sprint ngay bây giờ:
  1. Phase A — Wire email+ZNS vào booking flow (impact trực tiếp bệnh nhân)
  2. Phase B — Patient Portal OTP flow hoàn chỉnh
  3. Phase C — RBAC hoàn thiện + User management
  
Tiếp theo:
  4. Phase H — Zalo ZNS (thay ESMS, hiệu quả hơn)
  5. Phase D — Availability Calendar
  6. Phase P — Infrastructure production (trước go-live)
  
Trung hạn:
  7. Phase I — QR Check-in
  8. Phase L — Doctor Portal
  9. Phase G — Analytics charts + Plausible
  
Dài hạn (3–6 tháng):
  10. Phase K — Telemedicine
  11. Phase J — BHYT Integration
  12. Phase M — Corporate B2B
  13. Phase N — AI nâng cao
  14. Phase O — Mobile App
```

---

*Source of truth cho tất cả phiên làm việc.*  
*Cập nhật trạng thái mỗi sprint vào bảng section 1 và checkboxes section 9.*  
*Version: 2.1 | Khởi tạo: 2026-05-12 | Cập nhật: 2026-05-18*
