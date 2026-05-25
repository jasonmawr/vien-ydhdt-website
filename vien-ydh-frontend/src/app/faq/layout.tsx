import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp | Viện Y Dược Học Dân Tộc TP.HCM",
  description: "Giải đáp các câu hỏi thường gặp về đặt lịch khám, bảo hiểm y tế, chi phí và quy trình khám chữa bệnh tại Viện Y Dược Học Dân Tộc TP.HCM.",
  alternates: { canonical: "https://vienydhdt.gov.vn/faq" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Làm sao đặt lịch khám tại Viện?", acceptedAnswer: { "@type": "Answer", text: "Đặt online tại website, gọi hotline 0964 392 632, hoặc đến trực tiếp 273 - 275 Nguyễn Văn Trỗi, Quận Phú Nhuận." } },
    { "@type": "Question", name: "Đặt lịch trước có được ưu tiên không?", acceptedAnswer: { "@type": "Answer", text: "Có. Bệnh nhân đặt lịch trước được xếp vào khung giờ cố định, thời gian chờ trung bình dưới 15 phút." } },
    { "@type": "Question", name: "Viện có khám BHYT không?", acceptedAnswer: { "@type": "Answer", text: "Có. Viện là cơ sở y tế thuộc Sở Y tế TP.HCM, tiếp nhận BHYT đúng tuyến và trái tuyến theo quy định." } },
    { "@type": "Question", name: "BHYT trái tuyến thanh toán bao nhiêu %?", acceptedAnswer: { "@type": "Answer", text: "Tuyến tỉnh/thành phố: BHYT trái tuyến thanh toán 60% chi phí trong phạm vi được hưởng." } },
    { "@type": "Question", name: "Có thể hủy hoặc đổi lịch đã đặt không?", acceptedAnswer: { "@type": "Answer", text: "Được. Liên hệ hotline 0964 392 632 trước ít nhất 2 tiếng. Không có phí hủy." } },
    { "@type": "Question", name: "Thanh toán bằng hình thức nào?", acceptedAnswer: { "@type": "Answer", text: "Tiền mặt, chuyển khoản, thẻ ATM, Visa/Mastercard, MoMo, ZaloPay." } },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}