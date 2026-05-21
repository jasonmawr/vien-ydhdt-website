import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Khám Chữa Bệnh - Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Thông tin dịch vụ khám chữa bệnh Y học cổ truyền tại Viện Y Dược Học Dân Tộc TP.HCM.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
