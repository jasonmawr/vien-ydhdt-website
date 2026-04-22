import type { Metadata } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Viện Y Dược Học Dân Tộc | Chăm Sóc Sức Khỏe Bằng Y Học Cổ Truyền",
    template: "%s | Viện Y Dược Học Dân Tộc",
  },
  description:
    "Viện Y Dược Học Dân Tộc — Đơn vị nghiên cứu và điều trị hàng đầu về Y học Cổ truyền Việt Nam. Đặt lịch khám, tra cứu dược liệu và tìm hiểu chuyên gia uy tín.",
  keywords: [
    "Viện Y Dược Học Dân Tộc",
    "y học cổ truyền",
    "đặt lịch khám bệnh",
    "dược liệu đông y",
    "bác sĩ y học cổ truyền",
    "khám bệnh online",
  ],
  authors: [{ name: "Viện Y Dược Học Dân Tộc" }],
  creator: "Viện Y Dược Học Dân Tộc",
  metadataBase: new URL("https://vienydhdt.gov.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://vienydhdt.gov.vn",
    siteName: "Viện Y Dược Học Dân Tộc",
    title: "Viện Y Dược Học Dân Tộc | Y Học Cổ Truyền Việt Nam",
    description:
      "Khám phá dịch vụ chăm sóc sức khỏe bằng Y học Cổ truyền của Viện Y Dược Học Dân Tộc — Đặt lịch nhanh, Dược liệu chuẩn, Bác sĩ giỏi.",
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

import ChatWidget from "@/components/features/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${merriweather.variable} ${plusJakartaSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#fbf9f6] antialiased">
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
