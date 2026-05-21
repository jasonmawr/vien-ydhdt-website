"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function loginAction(username: string, passwordRaw: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: passwordRaw }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Đăng nhập thất bại" };
    }

    const token = data.data.token;
    
    // Lưu token vào HTTP-Only Cookie
    // QUAN TRỌNG: Chỉ bật secure khi thực sự chạy qua HTTPS (có SSL).
    // Nếu deploy nội bộ qua HTTP (IIS/Nginx reverse proxy không có SSL),
    // secure: true sẽ khiến trình duyệt từ chối lưu cookie → không đăng nhập được.
    const isHttps = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? false;
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login Server Action Error:", error);
    return { success: false, error: "Không thể kết nối đến máy chủ" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}
