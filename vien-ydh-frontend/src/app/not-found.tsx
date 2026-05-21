import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Phone, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Logo */}
        <div className="relative h-20 w-20 mb-8">
          <Image src="/images/logo.png" alt="Logo Viện" fill className="object-contain" />
        </div>

        {/* 404 display */}
        <div className="relative mb-6">
          <span className="text-[160px] md:text-[200px] font-extrabold text-stone-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-3xl px-8 py-4 shadow-lg border border-stone-200">
              <p className="text-2xl md:text-3xl font-extrabold text-stone-800">Trang không tồn tại</p>
            </div>
          </div>
        </div>

        <p className="text-stone-500 text-lg max-w-md mb-10 leading-relaxed">
          Trang bạn đang tìm không còn tồn tại hoặc đã được chuyển sang địa chỉ khác.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/">
            <Button className="rounded-xl bg-primary-600 hover:bg-primary-700 h-12 px-6 font-semibold">
              <Home className="mr-2 h-5 w-5" />
              Về Trang Chủ
            </Button>
          </Link>
          <Link href="/dat-lich">
            <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 h-12 px-6 font-semibold">
              <Calendar className="mr-2 h-5 w-5" />
              Đặt Lịch Khám
            </Button>
          </Link>
          <Link href="/tim-kiem">
            <Button variant="outline" className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 h-12 px-6 font-semibold">
              <Search className="mr-2 h-5 w-5" />
              Tìm Kiếm
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 max-w-lg w-full shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5">Liên kết nhanh</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/gioi-thieu", label: "Giới Thiệu" },
              { href: "/tin-tuc", label: "Tin Tức" },
              { href: "/bang-gia", label: "Bảng Giá" },
              { href: "/duoc-lieu", label: "Dược Liệu" },
              { href: "/bac-si", label: "Đội Ngũ Bác Sĩ" },
              { href: "/lien-he", label: "Liên Hệ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 bg-stone-50 hover:bg-primary-50 hover:text-primary-700 transition-colors border border-stone-200 hover:border-primary-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Hotline */}
        <div className="mt-8 flex items-center gap-2 text-stone-500 text-sm">
          <Phone className="h-4 w-4 text-primary-500" />
          <span>Cần hỗ trợ? Gọi hotline:</span>
          <a href="tel:0964392632" className="font-bold text-primary-600 hover:underline">0964 392 632</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
