'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const FOOTER_LINKS = {
  veVien: [
    { labelKey: 'about.intro', href: '/gioi-thieu' },
    { labelKey: 'about.functions', href: '/chuc-nang' },
    { labelKey: 'about.structure', href: '/so-do' },
    { labelKey: 'about.news', href: '/tin-tuc' },
  ],
  chuyenKhoa: [
    { labelKey: 'footer.specialties.acupuncture', href: '/chuyen-khoa/cham-cuu' },
    { labelKey: 'footer.specialties.physio', href: '/chuyen-khoa/vat-ly-tri-lieu' },
    { labelKey: 'footer.specialties.hemorrhoids', href: '/chuyen-khoa/kham-tri' },
    { labelKey: 'footer.specialties.obesity', href: '/chuyen-khoa/beo-phi' },
    { labelKey: 'footer.specialties.acupressure', href: '/chuyen-khoa/cay-chi' },
    { labelKey: 'footer.specialties.other', href: '/dich-vu' },
  ],
  hoTro: [
    { labelKey: 'footer.support.patientInfo', href: '/thong-tin' },
    { labelKey: 'footer.support.priceList', href: '/bang-gia' },
    { labelKey: 'footer.support.faq', href: '/faq' },
    { labelKey: 'footer.support.contact', href: '/lien-he' },
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
                <div>
                  <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider">Viện</p>
                  <p className="text-lg font-bold text-white leading-tight">Y Dược Học Dân Tộc</p>
                </div>
              </Link>
              <p className="mb-6 text-[15px] leading-relaxed text-primary-100 pr-4">
                {t('description')}
              </p>

              <div className="flex gap-3">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white hover:bg-white hover:text-primary-900 transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white hover:bg-white hover:text-primary-900 transition-colors" aria-label="YouTube">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Về Viện */}
            <div className="lg:col-span-2">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('about.title')}</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.veVien.map(link => <li key={link.href}><FooterLink link={link} t={t} /></li>)}
              </ul>
            </div>

            {/* Column 3: Chuyên khoa */}
            <div className="lg:col-span-3">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('specialties.title')}</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.chuyenKhoa.map(link => <li key={link.href}><FooterLink link={link} t={t} /></li>)}
              </ul>
            </div>

            {/* Column 4: Liên hệ */}
            <div className="lg:col-span-3">
              <h3 className="mb-6 text-[15px] font-bold uppercase tracking-wider text-white">{t('contact.title')}</h3>
              <div className="space-y-4 text-[15px] text-primary-100">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>{t('address')}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:02838443047" className="hover:text-white transition-colors">{t('phone1')}</a>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:0964392632" className="hover:text-white transition-colors">{t('hotline')}</a>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="h-5 w-5 shrink-0" />
                  <a href="mailto:v.ydhdt@tphcm.gov.vn" className="hover:text-white transition-colors">{t('email')}</a>
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
