import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Đội Ngũ Bác Sĩ - Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Đội ngũ hơn 253 bác sĩ, chuyên gia y học cổ truyền hàng đầu tại Viện Y Dược Học Dân Tộc TP.HCM.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <BreadcrumbJsonLd items={[
        { name: "Trang chủ", url: "/" },
        { name: "Đội ngũ bác sĩ", url: "/bac-si" },
      ]} />
      {children}
    </PageLayout>
  );
}
