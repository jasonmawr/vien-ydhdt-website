import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Chuyên Khoa - Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Khám phá các chuyên khoa Y học cổ truyền tại Viện Y Dược Học Dân Tộc TP.HCM: Châm cứu, Vật lý trị liệu, Phụ khoa, Dinh dưỡng và nhiều dịch vụ khác.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
