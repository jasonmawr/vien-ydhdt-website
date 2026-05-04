import type { Metadata } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
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
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: "https://vienydhdt.gov.vn",
      siteName: t('siteName'),
      title: t('ogTitle'),
      description: t('ogDescription'),
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

  return (
    <html lang={locale} className={`${merriweather.variable} ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#fbf9f6] antialiased">
        <main id="main-content" className="flex-1" role="main">
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
