import { NextRequest, NextResponse } from "next/server";

// Các ngôn ngữ hỗ trợ (match với i18n/request.ts)
const SUPPORTED_LOCALES = ["vi", "en", "zh"];

/**
 * POST /api/locale — API route to switch locale.
 * Sets cookie NEXT_LOCALE and returns success.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const locale = body.locale;

  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json(
      { error: `Invalid locale. Supported: ${SUPPORTED_LOCALES.join(", ")}` },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 năm
    sameSite: "lax",
  });

  return response;
}
