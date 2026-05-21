import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content: `Khi bạn sử dụng dịch vụ của Viện Y Dược Học Dân Tộc TP.HCM, chúng tôi có thể thu thập các thông tin sau:

• Thông tin cá nhân: Họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ email khi đặt lịch khám.
• Thông tin y tế: Triệu chứng bệnh, lịch sử khám chữa bệnh để phục vụ mục đích y tế.
• Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, thời gian truy cập website để cải thiện dịch vụ.
• Thông tin thanh toán: Số đơn hàng, trạng thái giao dịch (không lưu trữ thông tin thẻ tín dụng).`,
  },
  {
    title: "2. Mục đích sử dụng thông tin",
    content: `Thông tin thu thập được sử dụng cho các mục đích:

• Xác nhận và quản lý lịch hẹn khám bệnh.
• Liên hệ nhắc nhở lịch khám, kết quả xét nghiệm.
• Cải thiện chất lượng dịch vụ y tế và trang web.
• Tuân thủ quy định pháp luật về quản lý bệnh án điện tử.
• Gửi thông tin sức khỏe hữu ích (nếu bạn đồng ý nhận).`,
  },
  {
    title: "3. Bảo mật thông tin",
    content: `Viện cam kết bảo vệ thông tin cá nhân của người bệnh:

• Dữ liệu được mã hóa SSL/TLS khi truyền qua internet.
• Thông tin y tế được lưu trữ trên hệ thống HIS nội bộ, không chia sẻ ra bên ngoài trừ khi có yêu cầu pháp lý.
• Chỉ cán bộ y tế được ủy quyền mới có quyền truy cập hồ sơ bệnh án.
• Thực hiện kiểm tra bảo mật định kỳ.`,
  },
  {
    title: "4. Chia sẻ thông tin",
    content: `Chúng tôi KHÔNG bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bên thứ ba vì mục đích thương mại.

Thông tin chỉ được chia sẻ trong các trường hợp:
• Theo yêu cầu của cơ quan nhà nước có thẩm quyền.
• Khi có sự đồng ý rõ ràng của bạn (ví dụ: chuyển viện, hội chẩn).
• Để ngăn chặn các mối đe dọa khẩn cấp đến tính mạng, sức khỏe.`,
  },
  {
    title: "5. Quyền của người dùng",
    content: `Bạn có quyền:

• Xem và yêu cầu chỉnh sửa thông tin cá nhân đang được lưu trữ.
• Yêu cầu xóa tài khoản và dữ liệu (trong giới hạn pháp luật về lưu trữ hồ sơ y tế).
• Từ chối nhận email marketing/thông báo từ Viện.
• Khiếu nại về việc xử lý dữ liệu cá nhân.

Để thực hiện các quyền trên, vui lòng liên hệ qua email: v.ydhdt@tphcm.gov.vn`,
  },
  {
    title: "6. Cookie và công nghệ theo dõi",
    content: `Website sử dụng cookie để:
• Lưu phiên đăng nhập.
• Ghi nhớ tùy chọn ngôn ngữ.
• Phân tích lưu lượng truy cập (Google Analytics ẩn danh).

Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng website có thể không hoạt động đầy đủ.`,
  },
  {
    title: "7. Thay đổi chính sách",
    content: `Chính sách bảo mật này có thể được cập nhật định kỳ để phản ánh các thay đổi về quy định pháp luật hoặc thực tiễn vận hành. Mọi thay đổi sẽ được thông báo trên trang này với ngày cập nhật rõ ràng.

Ngày cập nhật gần nhất: 01/01/2025`,
  },
];

export default function ChinhSachBaoMatPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-16">
        <div className="container-site px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <Shield className="h-4 w-4 text-teal-300" />
            Pháp lý
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Chính Sách Bảo Mật</h1>
          <p className="text-white/80">
            Viện Y Dược Học Dân Tộc TP.HCM cam kết bảo vệ quyền riêng tư và bảo mật thông tin cá nhân của người bệnh.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="container-site px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-primary-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-stone-700 font-medium">Chính sách bảo mật</span>
        </div>
      </div>

      {/* Content */}
      <div className="container-site px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 md:p-10">
          <div className="prose prose-stone max-w-none space-y-8">
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
            Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ:{" "}
            <a href="mailto:v.ydhdt@tphcm.gov.vn" className="text-primary-600 font-medium hover:underline">
              v.ydhdt@tphcm.gov.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
