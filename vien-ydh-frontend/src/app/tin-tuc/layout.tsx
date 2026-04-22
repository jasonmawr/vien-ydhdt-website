import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tin Tức & Y Khoa - Viện Y Dược Học Dân Tộc",
  description: "Cập nhật các bản tin y khoa, nghiên cứu khoa học, hoạt động của Viện Y Dược Học Dân Tộc TP.HCM.",
};

export default function TinTucLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
