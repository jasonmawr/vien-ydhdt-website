import PageLayout from "@/components/layout/PageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản bệnh nhân | Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Xem lịch hẹn, thông tin cá nhân và lịch sử khám bệnh.",
  robots: { index: false, follow: false },
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
