# 📋 GIT WORKFLOW — Viện Y Dược Học Dân Tộc

> **SSOT cho quy trình Git.** Mọi developer và AI Agent đều phải tuân thủ tài liệu này.

## 🌿 Chiến Lược Phân Nhánh (Branching Strategy)

Dự án sử dụng mô hình **Git Flow đơn giản hóa**, phù hợp với team nhỏ:

```
main          ← Production-ready code. Luôn deployable. KHÔNG commit trực tiếp.
│
└── develop   ← Integration branch. Tập hợp các feature đã hoàn chỉnh.
    │
    ├── feature/[tên-feature]   ← Phát triển tính năng mới
    ├── fix/[tên-bug]           ← Sửa lỗi không khẩn cấp
    └── hotfix/[tên-lỗi]        ← Sửa lỗi khẩn cấp trên production (tách từ main)
```

### Ý nghĩa các nhánh:

| Nhánh | Mục đích | Tách từ | Merge vào |
|---|---|---|---|
| `main` | Production. Chỉ nhận merge từ `develop` hoặc `hotfix/*` | — | — |
| `develop` | Nhánh tích hợp chính. Source of truth cho dev | `main` | `main` (khi release) |
| `feature/*` | Tính năng mới, 1 feature = 1 nhánh | `develop` | `develop` |
| `fix/*` | Bugfix thông thường | `develop` | `develop` |
| `hotfix/*` | Hotfix khẩn cấp trên production | `main` | `main` + `develop` |

---

## 📝 Quy Tắc Đặt Tên Nhánh

**Format:** `[loại]/[mô-tả-ngắn-gọn-dấu-gạch-ngang]`

```bash
# ✅ Đúng
feature/hero-section
feature/booking-form-step1
feature/duoc-lieu-search
fix/header-mobile-menu
fix/footer-map-embed
hotfix/booking-api-crash

# ❌ Sai
Feature/HeroSection      # Viết hoa
fix_header               # Dùng underscore
my-new-branch            # Thiếu loại prefix
feature/sua-loi-trang-chu-khong-hien-dung  # Quá dài
```

---

## 💬 Quy Ước Commit Message (Conventional Commits)

**Format:** `[type]([scope]): [mô tả ngắn tiếng Anh]`

| Type | Khi nào dùng |
|---|---|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `docs` | Cập nhật tài liệu |
| `style` | Thay đổi CSS/UI (không ảnh hưởng logic) |
| `refactor` | Tái cấu trúc code (không thêm feature, không sửa bug) |
| `test` | Thêm/sửa test |
| `chore` | Cấu hình, dependencies, tooling |
| `perf` | Cải thiện hiệu năng |

**Ví dụ chuẩn:**
```bash
feat(header): add sticky scroll effect with backdrop blur
feat(booking): implement 4-step appointment form
fix(footer): replace Facebook/Youtube icons with available lucide alternatives
docs(master-plan): mark Phase 2 as complete
style(hero): adjust CTA button spacing on mobile
chore(deps): add lucide-react, clsx, tailwind-merge
refactor(types): split BookingFormData into step-based interfaces
```

**Quy tắc mô tả commit:**
- Viết bằng **tiếng Anh**, động từ nguyên thể (add, fix, update, remove)
- Không viết hoa chữ đầu (trừ danh từ riêng)
- Không dấu chấm ở cuối
- Tối đa 72 ký tự

---

## 🔄 Quy Trình Làm Việc Tiêu Chuẩn

### Bắt đầu tính năng mới:
```bash
# 1. Luôn cập nhật develop trước
git checkout develop
git pull origin develop

# 2. Tạo nhánh feature
git checkout -b feature/ten-tinh-nang

# 3. Làm việc, commit thường xuyên
git add .
git commit -m "feat(scope): mô tả"

# 4. Khi xong, push lên remote
git push origin feature/ten-tinh-nang

# 5. Tạo Pull Request vào develop (trên GitHub/GitLab)
```

### Quy tắc trước khi merge:
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors  
- [ ] Test thủ công trên Chrome + mobile viewport
- [ ] MASTER_PLAN.md đã được cập nhật
- [ ] Không có `console.log` debug

---

## 🚫 Quy Tắc Bảo Vệ Nhánh (Branch Protection)

Cần cấu hình trên GitHub/GitLab:

**Nhánh `main`:**
- Yêu cầu Pull Request (không push trực tiếp)
- Yêu cầu ít nhất 1 approval
- Yêu cầu CI checks pass

**Nhánh `develop`:**
- Yêu cầu Pull Request từ `feature/*` hoặc `fix/*`
- CI checks phải pass (TypeScript + Lint)

---

## 📌 Quy Tắc Cho AI Agent

- Mọi tính năng mới (Phase 3+) phải được thực hiện trên nhánh `feature/*` riêng
- Commit sau mỗi task nhỏ hoàn chỉnh (không để 1 commit chứa quá nhiều thay đổi)
- KHÔNG bao giờ commit trực tiếp vào `main`
- Sau khi hoàn thành một Phase, tạo merge commit từ `develop` → `main`

---

*Tài liệu này thuộc: `/docs/adr/ADR-001-git-workflow.md`*
*Cập nhật lần cuối: 2026-04-19*
