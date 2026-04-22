import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới Thiệu - Viện Y Dược Học Dân Tộc",
  description: "Viện Y Dược Học Dân Tộc tự hào là đơn vị đầu ngành trong lĩnh vực Y học cổ truyền tại TP.HCM, kết hợp hài hòa tinh hoa y học dân tộc và y học hiện đại.",
};

export default function GioiThieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
