'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const FOOTER_LINKS = {
  veVien: [
    { labelKey: 'about.intro', href: '/gioi-thieu' },
    { labelKey: 'about.functions', href: '/gioi-thieu' },
    { labelKey: 'about.structure', href: '/gioi-thieu' },
    { labelKey: 'about.news', href: '/tin-tuc' },
  ],
  chuyenKhoa: [
    { labelKey: 'specialties.acupuncture', href: '/chuyen-khoa' },
    { labelKey: 'specialties.physio', href: '/chuyen-khoa' },
    { labelKey: 'specialties.hemorrhoids', href: '/chuyen-khoa' },
    { labelKey: 'specialties.obesity', href: '/chuyen-khoa' },
    { labelKey: 'specialties.acupressure', href: '/chuyen-khoa' },
    { labelKey: 'specialties.other', href: '/kham-chua-benh' },
  ],
  hoTro: [
    { labelKey: 'support.patientInfo', href: '/tra-cuu' },
    { labelKey: 'support.priceList', href: '/bang-gia' },
    { labelKey: 'support.faq', href: '/faq' },
    { labelKey: 'support.contact', href: '/lien-he' },
  ],
};

function FooterLink({ link, t }: { link: typeof FOOTER_LINKS.veVien[0]; t: any }) {
  return (
    <Link
      href={link.href}
      className="flex items-center gap-2 py-1.5 text-[15px] text-primary-100 transition-colors hover:text-white hover:translate-x-1 duration-200"
    >
      <ChevronRight className="h-4 w-4 opacity-50" />
      {t(link.labelKey)}
    </Link>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white" role="contentinfo">
      <div className="border-b border-primary-800">
        <div className="container-site py-12 lg:py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">

            {/* Column 1: Brand & Social */}
            <div className="lg:col-span-4">
              <Link href="/" className="mb-6 flex items-center gap-3">
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Logo Viện"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="leading-tight select-none">
                  <p className="text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {t('instituteName') || 'VIỆN Y DƯỢC HỌC DÂN TỘC'}
                  </p>
                  <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider whitespace-nowrap mt-0.5">
                    {t('instituteShort') || 'THÀNH PHỐ HỒ CHÍ MINH'}
                  </p>
                </div>
              </Link>
              <p className="mb-6 text-[15px] leading-relaxed text-primary-100 pr-4">
                {t('description')}
              </p>

              <div className="flex gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/vienyduochocdantoc"}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white hover:bg-white hover:text-primary-900 transition-colors" aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@vienyduochocdantoctpHCM"}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white hover:bg-white hover:text-primary-900 transition-colors" aria-label="YouTube"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a
                  href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_OA_ID || "0964392632"}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0068FF] text-white hover:bg-white hover:text-[#0068FF] transition-colors" aria-label="Zalo"
                >
                  <svg viewBox="0 0 100 100" className="h-5 w-5" fill="currentColor"><path d="M50 5C25.1 5 5 25.1 5 50c0 8.3 2.3 16.1 6.3 22.8L5 95l22.7-6.3C34 92.7 41.8 95 50 95c24.9 0 45-20.1 45-45S74.9 5 50 5zm15 37.5h-7.5v3.7H65c1.4 0 2.5 1.1 2.5 2.5S66.4 51.2 65 51.2h-7.5v3.8H65c1.4 0 2.5 1.1 2.5 2.5S66.4 60 65 60h-7.5c-1.4 0-2.5-1.1-2.5-2.5V42.5c0-1.4 1.1-2.5 2.5-2.5H65c1.4 0 2.5 1.1 2.5 2.5zM43 40c4.1 0 7.5 3.4 7.5 7.5v5c0 4.1-3.4 7.5-7.5 7.5s-7.5-3.4-7.5-7.5v-5C35.5 43.4 38.9 40 43 40zm0 15c1.4 0 2.5-1.1 2.5-2.5v-5c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5v5c0 1.4 1.1 2.5 2.5 2.5zm-10 5c-1.4 0-2.5-1.1-2.5-2.5v-15c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v15c0 1.4-1.1 2.5-2.5 2.5z" /></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Về Viện */}
            <div className="lg:col-span-2">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('about.title')}</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.veVien.map(link => <li key={link.labelKey}><FooterLink link={link} t={t} /></li>)}
              </ul>
            </div>

            {/* Column 3: Chuyên khoa */}
            <div className="lg:col-span-3">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('specialties.title')}</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.chuyenKhoa.map(link => <li key={link.labelKey}><FooterLink link={link} t={t} /></li>)}
              </ul>
            </div>

            {/* Column 4: Liên hệ */}
            <div className="lg:col-span-3">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('contact.title')}</h3>
              <div className="space-y-4 text-[15px] text-primary-100">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>{t('contact.address')}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:02838443047" className="hover:text-white transition-colors">{t('contact.phone1')}</a>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:0964392632" className="hover:text-white transition-colors">{t('contact.hotline')}</a>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="h-5 w-5 shrink-0" />
                  <a href="mailto:v.ydhdt@tphcm.gov.vn" className="hover:text-white transition-colors">{t('contact.email')}</a>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-primary-800">
                  <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">{t('hours.title')}</p>
                    <p>{t('hours.weekday')}</p>
                    <p>{t('hours.evening')}</p>
                    <p>{t('hours.weekend')}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="bg-primary-950">
        <div className="container-site py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-200">
          <p>© {currentYear} Viện Y Dược Học Dân Tộc. {t('rights')}</p>
          <div className="flex items-center gap-6">
            <Link href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/quy-dinh" className="hover:text-white transition-colors">{t('terms')}</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors text-primary-400">{t('adminPortal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
