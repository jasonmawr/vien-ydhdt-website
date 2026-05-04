import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Các ngôn ngữ được hỗ trợ
export const locales = ["vi", "en", "zh"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "vi";

// Kiểm tra locale hợp lệ
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Server-side config — "without i18n routing" mode
// Locale được xác định từ cookie NEXT_LOCALE, không dùng URL prefix
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale: Locale =
    cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
