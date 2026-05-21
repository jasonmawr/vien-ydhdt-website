import Link from "next/link";
import { FileText, Download, Calendar, Phone, Mail, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const BIDS = [
  {
    id: "TB-2025-012",
    title: "Mua sắm thuốc và vật tư y tế năm 2025",
    status: "Đang mở thầu",
    deadline: "30/06/2025",
    value: "Theo dự toán được duyệt",
    statusColor: "text-green-700 bg-green-50 border-green-200",
  },
  {
    id: "TB-2025-009",
    title: "Cung cấp dịch vụ bảo trì thiết bị y tế",
    status: "Đang mở thầu",
    deadline: "15/06/2025",
    value: "Theo hợp đồng",
    statusColor: "text-green-700 bg-green-50 border-green-200",
  },
  {
    id: "TB-2025-006",
    title: "Mua sắm dược liệu phục vụ điều trị năm 2025",
    status: "Đã đóng thầu",
    deadline: "30/04/2025",
    value: "Đã công bố kết quả",
    statusColor: "text-stone-600 bg-stone-100 border-stone-200",
  },
  {
    id: "TB-2024-018",
    title: "Nâng cấp hệ thống phần mềm quản lý bệnh viện",
    status: "Đã chọn nhà thầu",
    deadline: "15/12/2024",
    value: "Đã ký hợp đồng",
    statusColor: "text-blue-700 bg-blue-50 border-blue-200",
  },
];

export default function DauThauPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-24">
        <div className="container-site px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <FileText className="h-4 w-4 text-teal-300" />
            Thông tin đấu thầu
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Đấu Thầu & Mua Sắm</h1>
          <p className="text-white/80 text-lg">
            Thông báo mời thầu, kết quả lựa chọn nhà thầu và thông tin mua sắm công khai theo quy định của Luật Đấu thầu.
          </p>
        </div>
      </section>

      {/* Notice board */}
      <section className="py-14">
        <div className="container-site px-4">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Thông Báo Mời Thầu</h2>
              <p className="text-stone-500 text-sm mt-1">Cập nhật các gói thầu hiện hành</p>
            </div>
            <Link href="https://muasamcong.mpi.gov.vn" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50">
                <ExternalLink className="mr-2 h-4 w-4" />
                Hệ thống mua sắm công
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {BIDS.map((bid) => (
              <div key={bid.id} className="bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-xs font-bold text-stone-400 font-mono">{bid.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bid.statusColor}`}>
                        {bid.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 mb-2">{bid.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Hạn nộp: {bid.deadline}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        {bid.value}
                      </span>
                    </div>
                  </div>
                  {bid.status === "Đang mở thầu" && (
                    <Button size="sm" variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 shrink-0">
                      <Download className="mr-1.5 h-4 w-4" />
                      Tải hồ sơ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
            <strong>Lưu ý:</strong> Tất cả thông tin đấu thầu chính thức được đăng tải trên Hệ thống mua sắm công quốc gia tại{" "}
            <a href="https://muasamcong.mpi.gov.vn" className="underline font-bold" target="_blank" rel="noopener noreferrer">
              muasamcong.mpi.gov.vn
            </a>. Thông tin trên trang này chỉ mang tính tham khảo.
          </div>
        </div>
      </section>

      {/* Contact for bidding */}
      <section className="py-14 bg-white">
        <div className="container-site px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">Liên Hệ Phòng Kế Hoạch – Tài Chính</h2>
            <p className="text-stone-500 mb-8">
              Để biết thêm thông tin chi tiết về các gói thầu, hồ sơ yêu cầu và quy trình tham dự, vui lòng liên hệ trực tiếp.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
              {[
                { icon: Phone, label: "Điện thoại", value: "028 3844 3047" },
                { icon: Mail, label: "Email", value: "v.ydhdt@tphcm.gov.vn" },
                { icon: Clock, label: "Giờ làm việc", value: "Thứ 2 – Thứ 6, 8:00 – 16:00" },
                { icon: FileText, label: "Địa chỉ", value: "273-275 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-stone-50 rounded-xl p-4">
                  <Icon className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase">{label}</p>
                    <p className="text-stone-700 font-medium text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/lien-he">
              <Button className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 px-8">
                Gửi Yêu Cầu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
