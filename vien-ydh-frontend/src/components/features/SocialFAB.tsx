"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M50 5C25.1 5 5 25.1 5 50c0 8.3 2.3 16.1 6.3 22.8L5 95l22.7-6.3C34 92.7 41.8 95 50 95c24.9 0 45-20.1 45-45S74.9 5 50 5zm15 37.5h-7.5v3.7H65c1.4 0 2.5 1.1 2.5 2.5S66.4 51.2 65 51.2h-7.5v3.8H65c1.4 0 2.5 1.1 2.5 2.5S66.4 60 65 60h-7.5c-1.4 0-2.5-1.1-2.5-2.5V42.5c0-1.4 1.1-2.5 2.5-2.5H65c1.4 0 2.5 1.1 2.5 2.5zM43 40c4.1 0 7.5 3.4 7.5 7.5v5c0 4.1-3.4 7.5-7.5 7.5s-7.5-3.4-7.5-7.5v-5C35.5 43.4 38.9 40 43 40zm0 15c1.4 0 2.5-1.1 2.5-2.5v-5c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5v5c0 1.4 1.1 2.5 2.5 2.5zm-10 5c-1.4 0-2.5-1.1-2.5-2.5v-15c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v15c0 1.4-1.1 2.5-2.5 2.5z" />
    </svg>
  );
}

interface SocialItem {
  id: string;
  label: string;
  bg: string;
  Icon: () => React.JSX.Element;
}

// Ordered top→bottom in the stack: Facebook at top, Zalo closest to the toggle button
const SOCIAL_ITEMS: SocialItem[] = [
  { id: "facebook", label: "Facebook", bg: "#1877F2", Icon: FacebookIcon },
  { id: "youtube", label: "YouTube", bg: "#FF0000", Icon: YouTubeIcon },
  { id: "zalo", label: "Zalo OA", bg: "#0068FF", Icon: ZaloIcon },
];

export default function SocialFAB() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const zaloOaId = process.env.NEXT_PUBLIC_ZALO_OA_ID || "2312544761075105340";

  useEffect(() => {
    const handleChatToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsChatOpen(customEvent.detail?.isOpen ?? false);
    };
    window.addEventListener("chat-widget-toggle", handleChatToggle);
    return () => {
      window.removeEventListener("chat-widget-toggle", handleChatToggle);
    };
  }, []);

  // Ẩn trên toàn bộ trang admin hoặc trang chatbot độc lập
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chatbot")) return null;

  // Ẩn khi chatbot AI đang mở để tránh bị che khuất
  if (isChatOpen) return null;

  const getHref = (id: string): string => {
    if (id === "facebook") return "https://www.facebook.com/vienyduochocdantoc";
    if (id === "youtube") return "https://www.youtube.com/@vienyduochocdantoctpHCM";
    return `https://zalo.me/${zaloOaId}`;
  };

  return (
    <>
      {/* Click-outside backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/*
        Đặt ở bottom-24 right-5 để nhường chỗ cho ChatWidget (bottom-6 right-6, h-14=56px).
        ChatWidget chiếm 24px + 56px = 80px từ đáy → SocialFAB bắt đầu từ 96px (bottom-24).
      */}
      <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
        {/* Social items — stacked above button, animate in bottom→top order */}
        <AnimatePresence>
          {isOpen &&
            SOCIAL_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 16, scale: 0.55 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.55, transition: { duration: 0.15 } }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 28,
                  // Zalo (i=2) appears first, Facebook (i=0) appears last → bottom-to-top reveal
                  delay: (SOCIAL_ITEMS.length - 1 - i) * 0.07,
                }}
                className="flex items-center gap-2"
              >
                <span className="select-none whitespace-nowrap rounded-lg bg-white/95 px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-md backdrop-blur-sm">
                  {item.label}
                </span>
                <a
                  href={getHref(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: item.bg }}
                  aria-label={item.label}
                  onClick={() => setIsOpen(false)}
                >
                  <item.Icon />
                </a>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Main FAB toggle */}
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl ring-4 ring-primary-200"
          animate={{ rotate: isOpen ? 135 : 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          aria-label={isOpen ? "Đóng liên kết mạng xã hội" : "Xem liên kết mạng xã hội"}
          aria-expanded={isOpen}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </motion.button>
      </div>
    </>
  );
}
