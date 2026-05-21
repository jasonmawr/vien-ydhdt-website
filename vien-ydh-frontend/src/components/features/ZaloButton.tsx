"use client";

export default function ZaloButton() {
  const oaId = process.env.NEXT_PUBLIC_ZALO_OA_ID || "2312544761075105340";
  const href = `https://zalo.me/${oaId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
      style={{ background: "#0068FF" }}
      aria-label="Chat qua Zalo"
      title="Nhắn tin Zalo"
    >
      {/* Zalo icon SVG */}
      <svg viewBox="0 0 100 100" className="h-8 w-8 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5C25.1 5 5 25.1 5 50c0 8.3 2.3 16.1 6.3 22.8L5 95l22.7-6.3C34 92.7 41.8 95 50 95c24.9 0 45-20.1 45-45S74.9 5 50 5zm0 82c-7.8 0-15.1-2.4-21.1-6.4l-1.5-.9-14 3.9 3.9-14-1-1.5C11.4 62.1 9 55.3 9 50c0-22.6 18.4-41 41-41s41 18.4 41 41-18.4 41-41 41z"/>
        <path d="M35.5 42.5c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5v15c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V42.5zm10 0c0-1.4-1.1-2.5-2.5-2.5S40.5 41.1 40.5 42.5v9.3l-6.8-10.3c-.5-.7-1.3-1.1-2.1-1H31c-1.4 0-2.5 1.1-2.5 2.5v15c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5v-9.3l6.8 10.3c.5.7 1.3 1.1 2.1 1h.7c1.4 0 2.5-1.1 2.5-2.5V42.5zM55 40c-4.1 0-7.5 3.4-7.5 7.5v5c0 4.1 3.4 7.5 7.5 7.5s7.5-3.4 7.5-7.5v-5c0-4.1-3.4-7.5-7.5-7.5zm2.5 12.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5v-5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v5zm12.5-10h-7.5c-1.4 0-2.5 1.1-2.5 2.5v15c0 1.4 1.1 2.5 2.5 2.5H70c1.4 0 2.5-1.1 2.5-2.5S71.4 57.5 70 57.5h-5v-3.7H70c1.4 0 2.5-1.1 2.5-2.5S71.4 49 70 49h-5v-3.7H70c1.4 0 2.5-1.1 2.5-2.5S71.4 42.5 70 42.5z"/>
      </svg>
    </a>
  );
}
