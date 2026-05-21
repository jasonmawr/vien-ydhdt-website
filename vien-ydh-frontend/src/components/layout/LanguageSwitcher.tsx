"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

interface LanguageSwitcherProps {
  align?: "top" | "bottom";
  variant?: "light" | "dark" | "transparent";
  dropdownAlign?: "left" | "right";
  compact?: boolean;
}

export default function LanguageSwitcher({
  align = "top",
  variant = "dark",
  dropdownAlign = "left",
  compact = false,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    // Gọi API route để set cookie NEXT_LOCALE
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });

    // Full page reload để mọi component (cả client lẫn server) đọc locale mới
    window.location.reload();
  };

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const buttonStyles = {
    dark: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
    light: "bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700",
    transparent: "bg-transparent hover:bg-stone-100 border border-transparent text-stone-700",
  }[variant];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center transition-colors font-medium whitespace-nowrap select-none ${
          compact
            ? `gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${buttonStyles}`
            : `gap-2 px-3 py-2 rounded-lg text-sm ${buttonStyles}`
        }`}
        aria-label="Select language"
        disabled={isLoading}
      >
        <Globe className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {compact ? (
          <span className="uppercase font-semibold tracking-wider text-[11px]">{currentLang.code}</span>
        ) : (
          <>
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline font-medium">{currentLang.label}</span>
          </>
        )}
        {isLoading && (
          <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Dropdown — mở bằng click, không phải hover */}
      {isOpen && (
        <div className={`absolute w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden ${
          align === "top" ? "bottom-full mb-2" : "top-full mt-2"
        } ${
          dropdownAlign === "right" ? "right-0" : "left-0"
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                locale === lang.code
                  ? "bg-primary-50 text-primary-800 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
              {locale === lang.code && (
                <svg className="ml-auto h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
