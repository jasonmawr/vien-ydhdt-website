import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/admin/login");
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && !isAuthPage) {
    if (!token) {
      // Chuyển hướng người dùng về trang đăng nhập nếu chưa có token
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthPage && token) {
    // Nếu đã đăng nhập mà vào lại trang login thì đưa về dashboard
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// Cấu hình áp dụng middleware cho các route bắt đầu bằng /admin
export const config = {
  matcher: ["/admin/:path*"],
};
