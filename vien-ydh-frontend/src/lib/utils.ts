/**
 * @file utils.ts
 * @description Tập hợp các hàm tiện ích dùng xuyên suốt dự án.
 * SSOT: Định nghĩa tại đây, import nơi cần dùng.
 *
 * @example
 * import { cn, formatDate, formatCurrency } from "@/lib/utils";
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─────────────────────────────────────────────────────────────
// 1. cn() — Merge className có điều kiện (clsx + tailwind-merge)
// ─────────────────────────────────────────────────────────────
/**
 * Kết hợp nhiều className lại với nhau, xử lý conflict của Tailwind CSS.
 * @example cn("text-lg", isActive && "font-bold", "text-primary-800")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────
// 2. Định dạng ngày tháng theo chuẩn Việt Nam
// ─────────────────────────────────────────────────────────────
/**
 * Định dạng ngày theo chuẩn Việt Nam: "Thứ Ba, 19 tháng 4, 2026"
 * @param date - Chuỗi ISO 8601 hoặc đối tượng Date
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Định dạng ngày ngắn: "19/04/2026"
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

/**
 * Định dạng giờ: "08:30 SA"
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// ─────────────────────────────────────────────────────────────
// 3. Định dạng số / tiền tệ
// ─────────────────────────────────────────────────────────────
/**
 * Định dạng số tiền VND: "150.000 đ"
 * @param amount - Số tiền (đơn vị: đồng)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────
// 4. Xử lý chuỗi
// ─────────────────────────────────────────────────────────────
/**
 * Truncate chuỗi nếu vượt quá maxLength ký tự
 * @example truncate("Bài viết dài...", 50) => "Bài viết dà..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Chuyển đổi chuỗi thành slug URL (có hỗ trợ tiếng Việt cơ bản)
 * @example slugify("Hà Thủ Ô") => "ha-thu-o"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─────────────────────────────────────────────────────────────
// 5. Tiện ích UI
// ─────────────────────────────────────────────────────────────
/**
 * Tạo mảng số nguyên từ start đến end (inclusive)
 * Hữu ích để render skeleton loading hay pagination
 * @example range(1, 5) => [1, 2, 3, 4, 5]
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
