# 🏥 Viện Y Dược Học Dân Tộc — Website Chính Thức

Website chính thức của **Viện Y Dược Học Dân Tộc**, được xây dựng trên nền tảng Next.js hiện đại, tối ưu SEO và trải nghiệm người dùng cao.

## 📁 Cấu Trúc Workspace

```
vien-ydhdt-website/
├── docs/                    ← Toàn bộ tài liệu dự án
│   ├── project/             ← Tài liệu cốt lõi (PRD, Architecture, Rules, Master Plan)
│   ├── flows/               ← Tài liệu luồng nghiệp vụ
│   ├── adr/                 ← Architecture Decision Records
│   ├── api/                 ← Tài liệu API
│   └── DEPENDENCIES.md      ← Danh sách thư viện
├── vien-ydh-frontend/       ← Source code Next.js
└── README.md                ← File này
```

## 📄 Tài Liệu Quan Trọng

| Tài liệu | Mô tả |
|---|---|
| [📋 Master Plan](./docs/project/MASTER_PLAN.md) | Lộ trình thực thi, tiến độ từng Phase |
| [📐 Architecture](./docs/project/ARCHITECTURE.md) | Kiến trúc hệ thống & cấu trúc thư mục |
| [📝 PRD](./docs/project/PROJECT_PRD.md) | Product Requirements — màu sắc, tính năng |
| [⚖️ Rules](./docs/project/Rules.md) | Quy tắc bắt buộc cho AI Agent & Developer |
| [📦 Dependencies](./docs/DEPENDENCIES.md) | Danh sách thư viện đang sử dụng |

## 🚀 Chạy Local

```bash
cd vien-ydh-frontend
npm install
npm run dev
```

Truy cập tại: **http://localhost:3000**

## 🎨 Design System

| Vai trò | Màu | Hex |
|---|---|---|
| Màu chủ đạo (Primary) | Xanh Thảo Dược | `#065f46` |
| Màu điểm nhấn (Accent) | Vàng Kim Loại | `#d97706` |
| Màu nền (Background) | Giấy Dó | `#fbf9f6` |

**Font:** Merriweather (tiêu đề) + Plus Jakarta Sans (nội dung)

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React Context + Zustand (khi cần)

---

> **Lưu ý:** Mọi tài liệu kỹ thuật đều nằm trong `/docs/`. Không tạo file `.md` tại thư mục gốc ngoại trừ file này.
