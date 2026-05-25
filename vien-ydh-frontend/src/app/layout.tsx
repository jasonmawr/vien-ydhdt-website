import type { Metadata } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import ChatWidget from "@/components/features/ChatWidget";
import SocialFAB from "@/components/features/SocialFAB";
import "./globals.css";

/**
 * Font Heading: Merriweather — Serif, thể hiện sự uy tín, học thuật.
 * Được load qua next/font để tối ưu LCP (không FOUT).
 */
const merriweather = Merriweather({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-merriweather",
  display: "swap",
});

/**
 * Font Body: Plus Jakarta Sans — Dễ đọc trên mọi thiết bị.
 * Hỗ trợ tiếng Việt đầy đủ.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: {
      default: t('titleDefault'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t('keywords').split(',').map((k: string) => k.trim()),
    authors: [{ name: t('siteName') }],
    creator: t('siteName'),
    metadataBase: new URL("https://vienydhdt.gov.vn"),
    icons: {
      icon: "/images/logo.png",
      shortcut: "/images/logo.png",
      apple: "/images/logo.png",
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: "https://vienydhdt.gov.vn",
      siteName: t('siteName'),
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [{ url: "https://vienydhdt.gov.vn/images/og-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ["https://vienydhdt.gov.vn/images/og-default.jpg"],
    },
    alternates: {
      canonical: "https://vienydhdt.gov.vn",
      languages: {
        "x-default": "https://vienydhdt.gov.vn",
        "vi-VN": "https://vienydhdt.gov.vn",
        "en": "https://vienydhdt.gov.vn",
        "zh-TW": "https://vienydhdt.gov.vn",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "Viện Y Dược Học Dân Tộc TP.HCM",
    alternateName: "VYDH Dân Tộc",
    url: "https://vienydhdt.gov.vn",
    logo: "https://vienydhdt.gov.vn/images/logo.png",
    telephone: "+84-964-392-632",
    email: "bvyhdt@yahoo.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "273 - 275 Nguyễn Văn Trỗi, Phường 10",
      addressLocality: "Quận Phú Nhuận",
      addressRegion: "TP.HCM",
      postalCode: "70000",
      addressCountry: "VN",
    },
    medicalSpecialty: "Traditional Medicine",
    sameAs: ["https://vienydhdt.gov.vn"],
  };

  return (
    <html lang={locale} className={`${merriweather.variable} ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a5f" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#fbf9f6] antialiased">
        <main id="main-content" className="flex-1" role="main">
          <NextIntlClientProvider messages={messages}>
            {children}
            <ChatWidget />
            <SocialFAB />
          </NextIntlClientProvider>
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
