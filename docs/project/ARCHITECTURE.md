# **KIẾN TRÚC HỆ THỐNG & CẤU TRÚC THƯ MỤC**

## **1\. KIẾN TRÚC TỔNG THỂ**

Sử dụng mô hình Headless CMS / Modular Monolith:

* Frontend Client: App Next.js (Server-Side Rendering & Static Site Generation) để tối ưu SEO.  
* API Backend: (Mô phỏng dữ liệu trong Phase 1 bằng Mock Data, Phase 2 sẽ tích hợp với C\# .NET API hoặc Strapi CMS).

## **2\. CẤU TRÚC THƯ MỤC FRONTEND (NEXT.JS)**

Yêu cầu AI Agent tạo dự án Next.js theo cấu trúc chuẩn SSOT như sau:

/src  
  /app                  \# Chứa các trang (routes)  
    /(home)/page.tsx  
    /dat-lich/page.tsx  
    /duoc-lieu/page.tsx  
    /layout.tsx         \# Layout chính (chứa Header, Footer)  
  /components           \# Reusable components  
    /ui                 \# Các component cơ bản (Button, Input, Card)  
    /layout             \# Header, Footer, Sidebar  
    /sections           \# Các section lớn của trang chủ (Hero, Features)  
  /lib                  \# Utilities, Helpers  
    /utils.ts           \# Hàm hỗ trợ (format ngày, classNames...)  
    /types.ts           \# Định nghĩa Type/Interface TypeScript (SSOT)  
  /services             \# Xử lý API calls  
    /api.ts             \# Fetch data từ backend/mock data  
  /styles               \# CSS toàn cục  
    /globals.css

## **3\. QUẢN LÝ TRẠNG THÁI (STATE)**

* Hạn chế dùng Redux. Ưu tiên dùng React Context cho các state đơn giản (Dark/Light mode, User Auth) và Zustand nếu cần quản lý form đặt lịch khám phức tạp.  
* Dữ liệu fetch từ API dùng fetch của Next.js với cơ chế caching phù hợp.