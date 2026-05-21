import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Điều khoản sử dụng website",
    content: `Bằng việc truy cập và sử dụng website vienydhdt.gov.vn, bạn đồng ý tuân thủ các quy định sau:

• Sử dụng website cho mục đích hợp pháp, không vi phạm pháp luật Việt Nam.
• Không sử dụng website để phát tán thông tin sai lệch, gây hại cho cộng đồng.
• Không cố ý xâm phạm hệ thống, dữ liệu hoặc an toàn thông tin của Viện.`,
  },
  {
    title: "2. Dịch vụ đặt lịch khám trực tuyến",
    content: `Khi sử dụng dịch vụ đặt lịch khám:

• Thông tin cung cấp phải chính xác, đầy đủ và thuộc về người đặt lịch hoặc người thân được ủy quyền.
• Lịch hẹn chỉ có hiệu lực khi có xác nhận từ Viện qua SMS/email.
• Vui lòng đến đúng giờ. Trường hợp trễ quá 30 phút, lịch hẹn có thể bị hủy.
• Hủy lịch phải thông báo trước ít nhất 2 tiếng qua hotline 0964 392 632.`,
  },
  {
    title: "3. Trách nhiệm người sử dụng",
    content: `Người sử dụng dịch vụ có trách nhiệm:

• Cung cấp thông tin y tế trung thực, đầy đủ cho bác sĩ điều trị.
• Tuân thủ chỉ định điều trị, dùng thuốc đúng liều lượng và thời gian.
• Thông báo kịp thời nếu có phản ứng bất thường sau khi sử dụng thuốc hoặc điều trị.
• Thanh toán đầy đủ chi phí dịch vụ theo quy định.`,
  },
  {
    title: "4. Giới hạn trách nhiệm",
    content: `• Thông tin y tế trên website mang tính tham khảo, không thay thế tư vấn trực tiếp của bác sĩ.
• Viện không chịu trách nhiệm về các thiệt hại phát sinh từ việc sử dụng thông tin trên website mà không có chỉ định y tế.
• Kết quả điều trị phụ thuộc vào tình trạng sức khỏe, cơ địa và sự tuân thủ điều trị của từng người bệnh.`,
  },
  {
    title: "5. Quyền sở hữu trí tuệ",
    content: `Toàn bộ nội dung trên website bao gồm văn bản, hình ảnh, logo, biểu tượng, video thuộc quyền sở hữu của Viện Y Dược Học Dân Tộc TP.HCM, được bảo hộ theo Luật Sở hữu trí tuệ Việt Nam.

• Không sao chép, phân phối nội dung khi chưa có sự đồng ý bằng văn bản.
• Trích dẫn có nguồn gốc rõ ràng và đúng bối cảnh được chấp thuận.`,
  },
  {
    title: "6. Xử lý vi phạm",
    content: `Viện có quyền:
• Từ chối cung cấp dịch vụ cho trường hợp vi phạm quy định.
• Hủy lịch hẹn mà không hoàn tiền nếu người dùng cung cấp thông tin sai lệch.
• Báo cáo cơ quan chức năng nếu phát hiện hành vi vi phạm pháp luật.`,
  },
  {
    title: "7. Sửa đổi quy định",
    content: `Viện có quyền sửa đổi quy định sử dụng bất kỳ lúc nào. Mọi thay đổi sẽ được đăng tải trên trang này và có hiệu lực ngay khi đăng tải.

Ngày ban hành: 01/01/2025
Ngày cập nhật: 01/01/2025`,
  },
];

export default function QuyDinhPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-16">
        <div className="container-site px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <FileText className="h-4 w-4 text-teal-300" />
            Pháp lý
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Quy Định Sử Dụng</h1>
          <p className="text-white/80">
            Điều khoản và điều kiện sử dụng dịch vụ website Viện Y Dược Học Dân Tộc TP.HCM.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="container-site px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-primary-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-stone-700 font-medium">Quy định sử dụng</span>
        </div>
      </div>

      {/* Content */}
      <div className="container-site px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 md:p-10">
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-stone-900 mb-3">{section.title}</h2>
                <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-stone-100 text-sm text-stone-400 text-center">
            Liên hệ:{" "}
            <a href="mailto:v.ydhdt@tphcm.gov.vn" className="text-primary-600 font-medium hover:underline">
              v.ydhdt@tphcm.gov.vn
            </a>
            {" "}|{" "}
            <a href="tel:02838443047" className="text-primary-600 font-medium hover:underline">
              028 3844 3047
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
