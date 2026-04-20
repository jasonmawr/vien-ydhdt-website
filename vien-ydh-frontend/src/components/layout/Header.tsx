'use client';

/**
 * @file Header.tsx
 * @description Thanh điều hướng chính của website Viện Y Dược Học Dân Tộc.
 *
 * Tính năng:
 * - Responsive: hamburger menu trên mobile, full nav trên desktop
 * - Sticky header với hiệu ứng backdrop blur khi scroll
 * - Nút "Đặt lịch khám" nổi bật (CTA)
 * - Logo + tên Viện
 * - Dropdown cho các mục có submenu
 *
 * @example
 * // Trong layout.tsx:
 * import Header from "@/components/layout/Header";
 * <Header />
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Cấu hình điều hướng — SSOT cho menu items
// ─────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Giới thiệu',
    href: '/gioi-thieu',
    children: [
      { label: 'Về Viện', href: '/gioi-thieu/ve-vien' },
      { label: 'Lịch sử hình thành', href: '/gioi-thieu/lich-su' },
      { label: 'Sứ mệnh & Tầm nhìn', href: '/gioi-thieu/su-menh' },
    ],
  },
  {
    label: 'Chuyên khoa',
    href: '/chuyen-khoa',
    children: [
      { label: 'Y học cổ truyền tổng hợp', href: '/chuyen-khoa/y-hoc-co-truyen' },
      { label: 'Châm cứu & Vật lý trị liệu', href: '/chuyen-khoa/cham-cuu' },
      { label: 'Dưỡng sinh & Phục hồi', href: '/chuyen-khoa/duong-sinh' },
    ],
  },
  { label: 'Đội ngũ bác sĩ', href: '/bac-si' },
  { label: 'Từ điển Dược liệu', href: '/duoc-lieu' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Liên hệ', href: '/lien-he' },
];

// ─────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect scroll để thêm hiệu ứng header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng mobile menu khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Khoá scroll body khi mobile menu mở
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <>
      {/* ── Thanh thông báo phía trên ── */}
      <div className="hidden bg-primary-800 text-white text-sm py-2 sm:block">
        <div className="container-site flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="opacity-90 truncate max-w-full">
            🌿 Chào mừng đến với Viện Y Dược Học Dân Tộc
          </span>
          <a
            href="tel:02838554269"
            className="flex items-center gap-1.5 font-semibold hover:text-[#fcd34d] transition-colors"
            aria-label="Gọi điện cho Viện Y Dược Học Dân Tộc"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            028 3855 4269
          </a>
        </div>
      </div>

      {/* ── Header chính ── */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/95 shadow-md backdrop-blur-md'
            : 'bg-white shadow-sm'
        )}
        role="banner"
      >
        <div className="container-site" ref={dropdownRef}>
          <div className="flex h-16 items-center justify-between lg:h-20">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Viện Y Dược Học Dân Tộc — Về trang chủ"
            >
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 group-hover:scale-105 overflow-hidden"
                aria-hidden="true"
              >
                <Image 
                  src="/images/logo.png" 
                  alt="Logo Viện" 
                  fill 
                  sizes="(max-width: 768px) 48px, 48px"
                  className="object-contain p-1"
                />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-medium text-[#6b7280] sm:text-sm">VIỆN</p>
                <p
                  className="font-heading text-sm font-bold text-primary-800 sm:text-base lg:text-lg"
                  style={{ fontFamily: 'var(--font-merriweather)' }}
                >
                  Y Dược Học Dân Tộc
                </p>
              </div>
            </Link>

            {/* ── Nav desktop ── */}
            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Điều hướng chính"
            >
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="relative">
                  {item.children ? (
                    // Menu có dropdown
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.href ? null : item.href)
                      }
                      className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                      aria-expanded={activeDropdown === item.href}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          activeDropdown === item.href && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown menu */}
                  {item.children && activeDropdown === item.href && (
                    <div
                      className="absolute left-0 top-full mt-1 min-w-52 rounded-xl border border-[#d1fae5] bg-white py-2 shadow-xl"
                      role="menu"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                          role="menuitem"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Nút CTA + Hamburger ── */}
            <div className="flex items-center gap-3">
              <Link
                href="/dat-lich"
                className="btn-primary hidden gap-2 py-2.5 text-sm sm:inline-flex"
                aria-label="Đặt lịch khám tại Viện Y Dược Học Dân Tộc"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Đặt lịch khám
              </Link>

              {/* Hamburger button — mobile only */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800 lg:hidden"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          id="mobile-menu"
          className={cn(
            'overflow-hidden border-t border-[#d1fae5] bg-white transition-all duration-300 ease-in-out lg:hidden',
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          )}
          aria-hidden={!isMenuOpen}
        >
          <nav
            className="container-site space-y-1 py-4"
            aria-label="Điều hướng mobile"
          >
            {NAV_ITEMS.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.href ? null : item.href)
                      }
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                      aria-expanded={activeDropdown === item.href}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          activeDropdown === item.href && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {activeDropdown === item.href && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#a7f3d0] pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2.5 text-sm text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                            onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-[#374151] transition-colors hover:bg-[#ecfdf5] hover:text-primary-800"
                    onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* CTA trong mobile menu */}
            <div className="pt-3 pb-2">
              <Link
                href="/dat-lich"
                className="btn-primary w-full justify-center"
                onClick={() => { setIsMenuOpen(false); setActiveDropdown(null); }}
                aria-label="Đặt lịch khám tại Viện Y Dược Học Dân Tộc"
              >
                <Calendar className="h-5 w-5" aria-hidden="true" />
                Đặt lịch khám ngay
              </Link>
            </div>

            <a
              href="tel:02838554269"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary-800 px-4 py-3 text-base font-medium text-primary-800 transition-colors hover:bg-[#ecfdf5]"
              aria-label="Gọi điện cho Viện Y Dược Học Dân Tộc"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              028 3855 4269
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
