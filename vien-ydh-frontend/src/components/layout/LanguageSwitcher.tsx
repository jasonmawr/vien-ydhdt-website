"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = async (newLocale: string) => {
    // Gọi API route để set cookie NEXT_LOCALE
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });

    // Refresh trang để server đọc cookie mới và render đúng ngôn ngữ
    startTransition(() => {
      router.refresh();
    });
  };

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 hover:bg-white border border-gray-200 transition-colors text-sm"
        aria-label="Select language"
        disabled={isPending}
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="hidden md:inline font-medium">{currentLang.label}</span>
        {isPending && (
          <span className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLocaleChange(lang.code)}
            disabled={locale === lang.code || isPending}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
              locale === lang.code
                ? "bg-primary-50 text-primary-800 font-semibold"
                : "text-gray-700"
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {locale === lang.code && (
              <svg className="ml-auto h-4 w-4 text-primary-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
