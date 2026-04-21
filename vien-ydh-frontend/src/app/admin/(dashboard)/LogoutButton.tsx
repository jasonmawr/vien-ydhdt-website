"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
      title="Đăng xuất"
    >
      <LogOut size={18} />
      <span className="hidden sm:inline">Đăng xuất</span>
    </button>
  );
}
