import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Tìm Kiếm - Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Tìm kiếm thông tin bác sĩ, dịch vụ y tế, tin tức sức khỏe tại Viện Y Dược Học Dân Tộc TP.HCM.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
