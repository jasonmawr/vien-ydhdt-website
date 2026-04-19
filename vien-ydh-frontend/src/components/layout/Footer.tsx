/**
 * @file Footer.tsx
 * @description Footer chính của website Viện Y Dược Học Dân Tộc.
 *
 * Tính năng:
 * - Thông tin liên hệ đầy đủ (địa chỉ, điện thoại, email, giờ làm việc)
 * - Liên kết nhanh đến các trang chính
 * - Bản đồ Google Maps nhúng (iframe)
 * - Mạng xã hội
 * - Dòng copyright
 *
 * Server Component — không cần 'use client'
 *
 * @example
 * // Trong layout.tsx:
 * import Footer from "@/components/layout/Footer";
 * <Footer />
 */

import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Share2,
  Play,
  Leaf,
  ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Cấu hình liên kết Footer — SSOT
// ─────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  thongTin: [
    { label: 'Về Viện', href: '/gioi-thieu/ve-vien' },
    { label: 'Lịch sử hình thành', href: '/gioi-thieu/lich-su' },
    { label: 'Sứ mệnh & Tầm nhìn', href: '/gioi-thieu/su-menh' },
    { label: 'Cơ cấu tổ chức', href: '/gioi-thieu/co-cau' },
    { label: 'Thành tích & Giải thưởng', href: '/gioi-thieu/thanh-tich' },
  ],
  dichVu: [
    { label: 'Đặt lịch khám', href: '/dat-lich' },
    { label: 'Đội ngũ bác sĩ', href: '/bac-si' },
    { label: 'Chuyên khoa', href: '/chuyen-khoa' },
    { label: 'Từ điển Dược liệu', href: '/duoc-lieu' },
    { label: 'Tin tức & Nghiên cứu', href: '/tin-tuc' },
  ],
  hotro: [
    { label: 'Câu hỏi thường gặp', href: '/faq' },
    { label: 'Quy định khám bệnh', href: '/quy-dinh' },
    { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
    { label: 'Liên hệ', href: '/lien-he' },
  ],
};

const WORKING_HOURS = [
  { day: 'Thứ Hai – Thứ Sáu', time: '07:00 – 17:00' },
  { day: 'Thứ Bảy', time: '07:00 – 11:30' },
  { day: 'Chủ Nhật', time: 'Nghỉ' },
];

// ─────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#064e3b] text-white" role="contentinfo">

      {/* ── Phần nội dung chính ── */}
      <div className="container-site py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* ── Cột 1: Thông tin Viện ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link
              href="/"
              className="mb-5 flex items-center gap-3 group"
              aria-label="Viện Y Dược Học Dân Tộc — Về trang chủ"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                <Leaf className="h-6 w-6 text-[#6ee7b7]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60">VIỆN</p>
                <p
                  className="text-base font-bold text-white"
                  style={{ fontFamily: 'var(--font-merriweather)' }}
                >
                  Y Dược Học Dân Tộc
                </p>
              </div>
            </Link>

            <p className="mb-6 text-sm leading-relaxed text-white/70">
              Đơn vị nghiên cứu và điều trị hàng đầu về Y học Cổ truyền Việt Nam,
              với hơn 50 năm kinh nghiệm chăm sóc sức khỏe cộng đồng bằng phương pháp
              dân tộc kết hợp y học hiện đại.
            </p>

            {/* Mạng xã hội */}
            <div className="flex gap-3" aria-label="Mạng xã hội">
              <a
                href="https://facebook.com/vienydhdt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#1877f2] hover:text-white"
                aria-label="Trang Facebook của Viện Y Dược Học Dân Tộc (mở tab mới)"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://youtube.com/@vienydhdt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#ff0000] hover:text-white"
                aria-label="Kênh YouTube của Viện Y Dược Học Dân Tộc (mở tab mới)"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* ── Cột 2: Về chúng tôi ── */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#6ee7b7]">
              Về chúng tôi
            </h3>
            <ul className="space-y-3" role="list">
              {FOOTER_LINKS.thongTin.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                  >
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#6ee7b7]/50" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột 3: Dịch vụ & Hỗ trợ ── */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#6ee7b7]">
              Dịch vụ
            </h3>
            <ul className="mb-8 space-y-3" role="list">
              {FOOTER_LINKS.dichVu.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                  >
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#6ee7b7]/50" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#6ee7b7]">
              Hỗ trợ
            </h3>
            <ul className="space-y-3" role="list">
              {FOOTER_LINKS.hotro.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                  >
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#6ee7b7]/50" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột 4: Liên hệ & Giờ làm việc ── */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#6ee7b7]">
              Liên hệ
            </h3>
            <address className="not-italic">
              <ul className="space-y-4">
                <li>
                  <a
                    href="https://maps.google.com/?q=273+Nguyễn+Văn+Trỗi,+Phường+10,+Phú+Nhuận,+TP.HCM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                    aria-label="Xem địa chỉ trên Google Maps (mở tab mới)"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                    <span>
                      273 Nguyễn Văn Trỗi, Phường 10,<br />
                      Quận Phú Nhuận, TP. Hồ Chí Minh
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href="tel:02838554269"
                    className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                    aria-label="Gọi điện cho Viện: 028 3855 4269"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                    028 3855 4269
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:contact@vienydhdt.gov.vn"
                    className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-[#6ee7b7]"
                    aria-label="Gửi email đến Viện Y Dược Học Dân Tộc"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                    contact@vienydhdt.gov.vn
                  </a>
                </li>

                <li>
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                    <div>
                      <p className="mb-2 text-sm font-semibold text-white/90">Giờ làm việc:</p>
                      <ul className="space-y-1.5" role="list">
                        {WORKING_HOURS.map((item) => (
                          <li key={item.day} className="flex justify-between gap-4 text-sm text-white/70">
                            <span>{item.day}</span>
                            <span className={item.time === 'Nghỉ' ? 'text-red-400' : 'text-[#6ee7b7]'}>
                              {item.time}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              </ul>
            </address>
          </div>
        </div>
      </div>

      {/* ── Bản đồ Google Maps ── */}
      <div className="border-t border-white/10">
        <div className="container-site py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Bản đồ chỉ đường
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0!2d106.6833!3d10.8028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVmnhu4duIFkgROaw4bujYyBIb2MgRMOibiBU4buJYw!5e0!3m2!1svi!2svn!4v1"
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ vị trí Viện Y Dược Học Dân Tộc"
              aria-label="Bản đồ Google Maps chỉ đường đến Viện Y Dược Học Dân Tộc"
            />
          </div>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            © {currentYear} Viện Y Dược Học Dân Tộc. Bảo lưu mọi quyền.
          </p>
          <p className="text-xs text-white/40">
            Được xây dựng với ❤️ — Phục vụ sức khỏe cộng đồng Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
