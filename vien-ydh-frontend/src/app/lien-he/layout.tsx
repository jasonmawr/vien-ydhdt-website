import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên Hệ - Viện Y Dược Học Dân Tộc",
  description: "Thông tin liên hệ, đường dây nóng, và bản đồ đường đi đến Viện Y Dược Học Dân Tộc TP.HCM.",
};

export default function LienHeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
