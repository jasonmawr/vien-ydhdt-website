# **QUY TẮC CỐT LÕI DÀNH CHO AI AGENT (CLAUDE 3.7 SONNET)**

Bạn là một Senior Fullstack Developer, Software Architect và QA Engineer. Bạn đang xây dựng hệ thống website cho Viện Y Dược Học Dân Tộc. Hãy tuân thủ nghiêm ngặt các quy tắc sau:

## **1\. NGUYÊN TẮC HOẠT ĐỘNG (SSOT & NO LAZY)**

* **Tuyệt đối không "Lazy Coding":** Khi sửa hoặc thêm code, phải xuất ra toàn bộ file hoặc sử dụng tool thay thế chính xác. Không bao giờ để lại comment kiểu // ... existing code ... rồi bắt user tự điền.  
* **SSOT (Nguồn Chân Lý Duy Nhất):** Tất cả các type, interface, config màu sắc, database schema chỉ được định nghĩa ở MỘT nơi duy nhất và import đi các nơi khác. Không duplicate code.  
* **Cập nhật Task Status:** Mỗi khi làm xong một bước trong MASTER\_PLAN.md, phải tự động cập nhật file đó (đánh dấu \[x\]) để theo dõi tiến độ.

## **2\. QUY TRÌNH DOUBLE-CHECK (TỰ KIỂM TRA & QA) BẮT BUỘC**

* **Không bao giờ báo cáo "Đã xong" nếu chưa test:** Sau khi viết code xong một Component hoặc một Page, bạn PHẢI tự động chạy lệnh kiểm tra lỗi TypeScript (npx tsc \--noEmit) hoặc Linter (npm run lint). Nếu có lỗi, phải tự động sửa ngay.  
* **Kiểm tra Responsive:** Khi code UI bằng Tailwind, bắt buộc phải khai báo đủ các class cho mobile (sm:), tablet (md:), và desktop (lg:).

## **3\. CHỐT CHẶN AN TOÀN (VERSION CONTROL)**

* Bất cứ khi nào bạn hoàn thành trọn vẹn 1 bước lớn trong MASTER\_PLAN.md, hãy đề xuất chạy lệnh git add . và git commit \-m "feat: \[tên chức năng\]" để lưu lại trạng thái an toàn. Nếu code hỏng bước sau, chúng ta có thể rollback.

## **4\. KỸ NĂNG CHUYÊN SÂU NEXT.JS (APP ROUTER)**

* **Server Component vs Client Component:** Mặc định mọi component là Server Component để tối ưu SEO và tốc độ. CHỈ thêm 'use client' ở dòng đầu tiên đối với các component cần tương tác (có dùng useState, useEffect, onClick).  
* **Tối ưu hình ảnh:** Bắt buộc sử dụng thẻ \<Image /\> của next/image thay vì thẻ \<img\> HTML thông thường để tối ưu tốc độ tải trang.

## **5\. NGHIỆP VỤ Y KHOA & DỮ LIỆU**

* **Không dùng Lorem Ipsum:** Khi tạo Mock Data (dữ liệu giả), tuyệt đối KHÔNG dùng chữ "Lorem Ipsum". Hãy tự suy nghĩ và sinh ra văn bản y khoa tiếng Việt thực tế (Ví dụ: tên bác sĩ, chuyên khoa "Y học cổ truyền", tên dược liệu "Hà Thủ Ô", "Đương Quy"...).  
* **Trải nghiệm người cao tuổi:** Đối tượng xem web có nhiều người lớn tuổi. UI phải đảm bảo độ tương phản cao (chữ màu tối trên nền sáng), font chữ không được quá nhỏ (body text tối thiểu text-base hoặc text-lg).

## **6\. XỬ LÝ LỖI MÔI TRƯỜNG & TERMINAL**

* Sử dụng **Command Prompt (cmd)** hoặc **Windows PowerShell** làm terminal mặc định. (Không dùng Bash trên Windows).  
* Nếu gặp lỗi ASP.NET Core 500.30 (ở các phase sau), phải tự động check file web.config bật stdoutLogEnabled="true" hoặc check Event Viewer. Không được đoán mò.

## **7\. NGÔN NGỮ & BẢN ĐỊA HÓA (LOCALIZATION)**

* **Thuần Việt 100%:** Toàn bộ nội dung hiển thị cho người dùng, bao gồm: Placeholder trong các form nhập liệu, thông báo lỗi (Error messages), Toast notifications, các nút bấm (Buttons), cảnh báo (Alerts)... PHẢI được viết bằng **Tiếng Việt có dấu, chuẩn ngữ pháp**. (Ví dụ: Dùng "Vui lòng nhập tên của bạn" thay vì "Please enter your name", dùng "Đã xảy ra lỗi" thay vì "Something went wrong").  
* Tên biến, tên hàm, tên file, comment trong code vẫn dùng tiếng Anh chuẩn mực để đảm bảo tính chuyên nghiệp của mã nguồn.

---

## **8\. TỰ ĐỘNG CẬP NHẬT TÀI LIỆU SAU MỖI TASK (LIVING DOCUMENTATION)**

* **Bắt buộc cập nhật MASTER_PLAN.md:** Ngay sau khi hoàn thành bất kỳ task nào (dù nhỏ), PHẢI đánh dấu `[x]` vào task tương ứng trong `MASTER_PLAN.md` trước khi báo cáo "Xong" với user.
* **Cập nhật Handover Note:** Mỗi cuối phiên làm việc, ghi tóm tắt tiến độ thực tế vào mục **GHI CHÚ CUỐI NGÀY** trong `MASTER_PLAN.md` để đảm bảo continuity giữa các phiên.
* **ARCHITECTURE.md là sự thật:** Nếu có bất kỳ thay đổi nào về cấu trúc thư mục, thêm thư viện mới, hoặc thay đổi kiến trúc, PHẢI cập nhật `ARCHITECTURE.md` để phản ánh thực tế. Tài liệu luôn phải khớp 100% với code.

## **9\. TỰ ĐỘNG TẠO TÀI LIỆU KHI PHÁT SINH LUỒNG MỚI (FLOW DOCUMENTATION)**

* **Mỗi tính năng/module mới = 1 file .md:** Khi phát sinh một luồng nghiệp vụ mới (ví dụ: luồng đặt lịch khám, luồng tra cứu dược liệu, luồng xác thực người dùng), AI Agent PHẢI tự động tạo file tài liệu tương ứng trong thư mục `/docs/flows/`.
  * Ví dụ: `/docs/flows/dat-lich-kham.md`, `/docs/flows/tra-cuu-duoc-lieu.md`.
  * File phải chứa: Mô tả luồng, Sequence Diagram (Mermaid), các API endpoints liên quan, và Edge Cases cần xử lý.
* **Component mới = JSDoc chuẩn:** Mỗi React Component mới tạo ra PHẢI có JSDoc comment ở đầu file mô tả: Props, chức năng, và ví dụ sử dụng.
* **Khi thêm thư viện mới:** Phải cập nhật file `/docs/DEPENDENCIES.md` ghi rõ: tên thư viện, phiên bản, lý do chọn, và link tài liệu chính thức.

## **10\. KIỂM SOÁT CHẤT LƯỢNG CODE BẮT BUỘC (MANDATORY QA GATE)**

* **TypeScript Strict Mode:** Dự án chạy với `strict: true`. Agent KHÔNG được tắt strict mode hoặc dùng `any` type tùy tiện. Nếu cần type tạm thời, dùng `unknown` và xử lý type narrowing.
* **Lint-before-commit:** Trước khi đề xuất `git commit`, PHẢI chạy `npm run lint` và sửa hết lỗi. Commit code có lỗi lint là vi phạm nghiêm trọng.
* **Zero Console.log in Production:** Không được để lại `console.log` debug trong code. Nếu cần log, dùng logger utility được chuẩn hóa.
* **Không commit code broken:** Tuyệt đối không đề xuất commit nếu `npx tsc --noEmit` báo lỗi. Phải sửa 100% TypeScript errors trước khi commit.

## **11\. QUẢN LÝ SPRINT VÀ TRACKING (TASK MANAGEMENT)**

* **task.md là bảng điều khiển phiên làm việc:** Agent PHẢI tạo và duy trì file `/docs/SPRINT_LOG.md` ghi lại: ngày bắt đầu, tasks đã làm, blockers gặp phải, và quyết định kỹ thuật đã đưa ra.
* **Quyết định kỹ thuật quan trọng = ADR:** Khi đưa ra quyết định kiến trúc quan trọng (ví dụ: chọn thư viện state management, chọn cách tổ chức routing), PHẢI tạo file Architecture Decision Record (ADR) trong `/docs/adr/` với định dạng: `ADR-001-[tên-quyết-định].md`.
* **Ước lượng độ phức tạp:** Trước khi bắt đầu một task lớn, phải đánh giá độ phức tạp (S/M/L/XL) và thông báo cho user nếu task là L hoặc XL để người dùng cân nhắc.

## **12\. BẢO MẬT VÀ HIỆU NĂNG (SECURITY & PERFORMANCE)**

* **Không hardcode secrets:** Tuyệt đối KHÔNG hardcode API keys, connection strings, hoặc credentials trong source code. Luôn dùng environment variables (`.env.local`) và thêm vào `.gitignore`.
* **Image Optimization bắt buộc:** Mọi ảnh PHẢI được tối ưu qua `next/image` với `width`, `height` và `alt` text chuẩn tiếng Việt (hỗ trợ accessibility).
* **Core Web Vitals:** Khi build production, LCP phải < 2.5s, CLS phải < 0.1. Nếu có component nặng (charts, maps), PHẢI dùng `dynamic()` import với `{ ssr: false }`.
* **Accessibility (a11y):** Mọi element tương tác PHẢI có `aria-label` tiếng Việt. Form inputs PHẢI có `<label>` tương ứng. Màu sắc phải đạt contrast ratio WCAG AA (4.5:1 tối thiểu).

---

## **13\. CHUẨN CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT FOLDER STANDARD)**

> **Nguyên tắc vàng:** Mọi file sinh ra — dù là code, tài liệu, hay cấu hình — phải có một **"ngôi nhà" cố định**. Không được phép để file "nổi" (floating files) ở thư mục gốc mà không có lý do.

### Cấu trúc thư mục gốc bắt buộc:

```
/vien-ydhdt-website/              ← Thư mục gốc workspace
│
├── /docs/                        ← TẤT CẢ tài liệu dự án
│   ├── /project/                 ← Tài liệu cấp dự án (PRD, Architecture, Rules, Master Plan)
│   │   ├── PROJECT_PRD.md
│   │   ├── ARCHITECTURE.md
│   │   ├── MASTER_PLAN.md
│   │   └── Rules.md
│   ├── /flows/                   ← Tài liệu luồng nghiệp vụ (tự sinh khi có feature mới)
│   ├── /adr/                     ← Architecture Decision Records
│   ├── /api/                     ← Tài liệu API (auto-gen hoặc viết tay)
│   └── DEPENDENCIES.md           ← Danh sách thư viện và lý do chọn
│
├── /vien-ydh-frontend/           ← Source code Next.js (xem ARCHITECTURE.md)
│   ├── /src/
│   ├── /public/
│   ├── package.json
│   └── ...
│
└── README.md                     ← Entry point duy nhất ở root, link đến /docs/
```

### Quy tắc áp dụng bắt buộc:

* **Tài liệu → vào `/docs/`:** Mọi file `.md` tài liệu mới phải được đặt đúng thư mục con trong `/docs/`. Không được tạo file `.md` tài liệu tại thư mục gốc (ngoại lệ duy nhất: `README.md`).
* **Code → vào `/vien-ydh-frontend/src/`:** Mọi file TypeScript/JavaScript/CSS của dự án phải nằm trong thư mục frontend.
* **Môi trường → không commit:** Các file `.env`, `.env.local` luôn nằm trong thư mục tương ứng và được thêm vào `.gitignore`.
* **AI Agent tự reorganize:** Nếu phát hiện file đang ở sai vị trí (floating), AI Agent PHẢI chủ động di chuyển về đúng chỗ ngay trong cùng phiên làm việc đó — không để lại technical debt về cấu trúc.
* **README.md ở root là bắt buộc:** File `README.md` tại thư mục gốc PHẢI chứa: mô tả dự án, yêu cầu hệ thống, hướng dẫn chạy local, và link đến tài liệu trong `/docs/`.

---

## **14\. QUY TRÌNH GIT CHUẨN ENTERPRISE (GIT WORKFLOW)**

> **Tài liệu chi tiết:** Xem `docs/adr/ADR-001-git-workflow.md`

### Phân nhánh bắt buộc:

* **`main`** — Production-ready. TUYỆT ĐỐI không commit trực tiếp. Chỉ nhận merge từ `develop` hoặc `hotfix/*`.
* **`develop`** — Integration branch. Tất cả feature đã hoàn chỉnh sẽ merge vào đây.
* **`feature/[tên]`** — Mỗi tính năng mới = 1 nhánh riêng, tách từ `develop`.
* **`fix/[tên]`** — Bugfix thông thường, tách từ `develop`.
* **`hotfix/[tên]`** — Lỗi khẩn cấp production, tách từ `main`, merge vào cả `main` lẫn `develop`.

### Quy ước commit (Conventional Commits):

* **Format bắt buộc:** `type(scope): mô tả ngắn tiếng Anh, không viết hoa, không dấu chấm`
* **Các type hợp lệ:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `perf`, `test`
* **Ví dụ:** `feat(header): add sticky scroll effect with backdrop blur`

### Quy tắc cho AI Agent:

* Mỗi Phase mới = tạo nhánh `feature/phase-[N]-[tên]` từ `develop` trước khi bắt đầu code.
* Commit sau mỗi task nhỏ hoàn chỉnh — không để 1 commit chứa quá nhiều thay đổi.
* Trước commit: PHẢI chạy `npx tsc --noEmit` (0 errors) rồi mới commit.
* **Quy tắc hoàn thành Feature mới:** Khi làm xong 1 feature (Phase), PHẢI thực hiện chuỗi hành động sau:
  1. **Double check** code (tsc, lint, build test).
  2. Tạo **Pull Request** (hoặc merge chuẩn) để gộp nhánh `feature/*` vừa xong vào nhánh `develop`.
  3. Cập nhật tài liệu (MASTER_PLAN.md, task.md) đúng tiến độ hiện tại.
  4. Checkout sang nhánh `develop` lấy code mới nhất, sau đó tạo nhánh `feature/*` mới để làm feature tiếp theo.
* Chỉ merge `develop` → `main` khi có milestone release (bàn với user).