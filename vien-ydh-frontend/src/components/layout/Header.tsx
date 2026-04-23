'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ChevronDown, Calendar, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const TOP_NAV_ITEMS = [
  { label: 'Người bệnh & Cộng đồng', href: '/' },
  { label: 'Chuyên gia y tế', href: '/chuyen-gia-y-te' },
  { label: 'Đấu thầu', href: '/dau-thau' },
  { label: 'Liên hệ', href: '/lien-he' },
];

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Giới thiệu',
    href: '/gioi-thieu',
    children: [
      { label: 'Giới thiệu chung', href: '/gioi-thieu/chung' },
      { label: 'Chức năng - Nhiệm vụ', href: '/gioi-thieu/chuc-nang' },
      { label: 'Lịch sử hình thành và phát triển', href: '/gioi-thieu/lich-su' },
      { label: 'Sơ đồ tổ chức', href: '/gioi-thieu/so-do' },
      { label: 'Thành tích đạt được', href: '/gioi-thieu/thanh-tich' },
    ],
  },
  {
    label: 'Tin tức',
    href: '/tin-tuc',
    children: [
      { label: 'Thông tin trong nước', href: '/tin-tuc/trong-nuoc' },
      { label: 'Thông tin Viện', href: '/tin-tuc/vien' },
      { label: 'Thông báo', href: '/tin-tuc/thong-bao' },
      { label: 'Hợp tác quốc tế', href: '/tin-tuc/quoc-te' },
    ],
  },
  {
    label: 'Khám chữa bệnh',
    href: '/kham-chua-benh',
    children: [
      { label: 'Gương mặt tiêu biểu', href: '/kham-chua-benh/guong-mat-tieu-bieu' },
      { label: 'Dịch vụ khám', href: '/dich-vu' },
    ]
  },
  {
    label: 'Sản phẩm thuốc',
    href: '/thuoc-yhct',
    children: [
      { label: 'Thuốc do viện sản xuất', href: '/thuoc-yhct/do-vien-san-xuat' },
      { label: 'Thuốc liên doanh liên kết', href: '/thuoc-yhct/lien-doanh' },
    ],
  },
  {
    label: 'Đào tạo - Chỉ đạo tuyến',
    href: '/dao-tao',
    children: [
      { label: 'Chỉ đạo tuyến', href: '/dao-tao/chi-dao-tuyen' },
      { label: 'Đào tạo liên tục', href: '/dao-tao/lien-tuc' },
      { label: 'Cơ sở thực hành', href: '/dao-tao/co-so-thuc-hanh' },
    ]
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
      role="banner"
    >
      {/* ── Tier 1: Top Bar ── */}
      <div className="hidden lg:block bg-primary-900 text-primary-50 py-1.5 text-sm">
        <div className="container-site flex items-center justify-between">
          <div className="flex items-center gap-6">
            {TOP_NAV_ITEMS.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={cn(
                  "hover:text-white transition-colors relative",
                  idx === 0 && "font-semibold text-white after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-accent-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:0964392632" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-4 w-4" />
              <span>Hotline: 0964 392 632</span>
            </a>
            <div className="h-4 w-px bg-primary-700"></div>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Globe className="h-4 w-4" />
              <span>VN</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Main Bar ── */}
      <div className="bg-white">
        <div className="container-site">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Viện Y Dược Học Dân Tộc — Về trang chủ"
            >
              <div className="relative flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center transition-transform group-hover:scale-105 overflow-hidden shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Logo Viện"
                  fill
                  sizes="(max-width: 1024px) 48px, 64px"
                  className="object-contain"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-medium text-gray-500 lg:text-xs">VIỆN Y DƯỢC</p>
                <p className="font-sans text-sm font-bold text-primary-800 lg:text-lg">
                  Học Dân Tộc TP.HCM
                </p>
              </div>
            </Link>

            {/* Nav Desktop */}
            <nav
              className="hidden items-center gap-1 xl:gap-2 lg:flex"
              aria-label="Điều hướng chính"
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {MAIN_NAV_ITEMS.map((item) => (
                <div
                  key={item.href}
                  className="relative group h-20 flex items-center"
                  onMouseEnter={() => item.children && setActiveDropdown(item.href)}
                >
                  {item.children ? (
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-[15px] font-semibold transition-all rounded-md",
                        activeDropdown === item.href
                          ? "text-primary-700 bg-primary-50"
                          : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                      )}
                      aria-expanded={activeDropdown === item.href}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeDropdown === item.href && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="px-3 py-2 text-[15px] font-semibold text-gray-700 transition-all hover:text-primary-700 hover:bg-gray-50 rounded-md"
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.href && (
                    <div className="absolute left-0 top-[70px] w-64 bg-white rounded-b-xl shadow-card-premium border-t-2 border-primary-500 py-3 z-50 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
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

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search Toggle */}
              <div className="relative hidden md:block" ref={searchRef}>
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 w-64 animate-scale-in">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-10 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      autoFocus
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Mở tìm kiếm"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* CTA */}
              <Link
                href="/tra-cuu"
                className="hidden xl:inline-flex items-center px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Tra cứu lịch
              </Link>
              <Link
                href="/dat-lich"
                className="hidden sm:inline-flex btn-accent !px-5 !py-2.5"
              >
                Đặt lịch khám
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full lg:hidden transition-colors",
                  isMenuOpen ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Expand */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 outline-none focus:border-primary-500"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-[64px] bg-white border-t border-gray-100 transition-all duration-300 lg:hidden overflow-y-auto max-h-[calc(100vh-64px)] z-40',
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="bg-primary-50 px-4 py-3 flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {TOP_NAV_ITEMS.map((item, idx) => (
            <Link key={idx} href={item.href} className="text-sm font-semibold text-primary-800">
              {item.label}
            </Link>
          ))}
        </div>
        <nav className="container-site py-2 space-y-1">
          {MAIN_NAV_ITEMS.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.href ? null : item.href)}
                    className="flex w-full items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 border-b border-gray-50"
                  >
                    {item.label}
                    <ChevronDown className={cn('h-5 w-5 transition-transform text-gray-400', activeDropdown === item.href && 'rotate-180')} />
                  </button>
                  {activeDropdown === item.href && (
                    <div className="bg-gray-50 px-4 py-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2.5 text-[15px] text-gray-600 hover:text-primary-700"
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
                  className="block px-4 py-3 text-base font-semibold text-gray-800 border-b border-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="p-4 space-y-3">
            <Link
              href="/dat-lich"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-base font-semibold text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Đặt lịch khám ngay
            </Link>
            <a
              href="tel:0964392632"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-base font-semibold text-primary-800"
            >
              <Phone className="h-5 w-5" />
              Hotline: 0964 392 632
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
