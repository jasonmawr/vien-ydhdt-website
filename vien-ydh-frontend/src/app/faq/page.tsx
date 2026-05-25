"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Search, MessageCircle, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Đặt lịch khám",
    items: [
      {
        q: "Làm sao đặt lịch khám tại Viện?",
        a: "Bạn có thể đặt lịch qua 3 cách: (1) Đặt online tại mục 'Đặt lịch' trên website; (2) Gọi hotline 0964 392 632; (3) Đến trực tiếp tại quầy tiếp đón 273 - 275 Nguyễn Văn Trỗi, Quận Phú Nhuận.",
      },
      {
        q: "Đặt lịch trước có được ưu tiên không?",
        a: "Có. Bệnh nhân đặt lịch trước sẽ được xếp vào khung giờ cố định, không cần chờ xếp số như đến trực tiếp. Thời gian chờ trung bình dưới 15 phút.",
      },
      {
        q: "Có thể hủy hoặc đổi lịch đã đặt không?",
        a: "Được. Vui lòng liên hệ hotline 0964 392 632 trước ít nhất 2 tiếng so với giờ hẹn để hủy hoặc dời lịch. Không có phí hủy.",
      },
      {
        q: "Đặt lịch cho người thân có được không?",
        a: "Được. Khi đặt lịch, hãy điền đầy đủ thông tin của người sẽ đến khám (họ tên, ngày sinh, số điện thoại liên lạc).",
      },
    ],
  },
  {
    category: "Bảo hiểm y tế",
    items: [
      {
        q: "Viện có khám BHYT không?",
        a: "Có. Viện Y Dược Học Dân Tộc là cơ sở y tế thuộc Sở Y tế TP.HCM, được phép tiếp nhận BHYT đúng tuyến và trái tuyến theo quy định.",
      },
      {
        q: "BHYT trái tuyến thanh toán bao nhiêu %?",
        a: "Tại tuyến tỉnh/thành phố, BHYT trái tuyến thanh toán 60% chi phí trong phạm vi được hưởng. Mang theo thẻ BHYT còn hạn khi đến khám.",
      },
      {
        q: "Cần mang giấy tờ gì khi khám BHYT?",
        a: "Cần mang: Thẻ BHYT còn hạn, CMND/CCCD hoặc hộ chiếu. Trẻ em dưới 6 tuổi cần giấy khai sinh hoặc sổ hộ khẩu.",
      },
    ],
  },
  {
    category: "Khám & Điều trị",
    items: [
      {
        q: "Thời gian một buổi khám mất bao lâu?",
        a: "Trung bình 30–60 phút cho lần khám đầu (bao gồm hỏi bệnh, khám lâm sàng, chỉ định xét nghiệm nếu cần). Tái khám thường 20–30 phút.",
      },
      {
        q: "Viện có chụp X-quang, siêu âm không?",
        a: "Có. Viện có đầy đủ thiết bị cận lâm sàng: xét nghiệm máu, sinh hóa, tổng phân tích nước tiểu, X-Quang kỹ thuật số, siêu âm màu, điện tim ECG.",
      },
      {
        q: "Thuốc thang lấy ngay trong ngày không?",
        a: "Đối với đơn thuốc đơn giản, bạn có thể nhận thuốc trong ngày. Thuốc thang đặc biệt theo cổ phương cần bào chế trước 1–2 ngày.",
      },
      {
        q: "Có thể xin tái khám bác sĩ cũ không?",
        a: "Được. Khi đặt lịch tái khám, hãy chọn đúng bác sĩ đã khám lần trước để đảm bảo tính liên tục điều trị.",
      },
    ],
  },
  {
    category: "Chi phí & Thanh toán",
    items: [
      {
        q: "Chi phí khám dịch vụ là bao nhiêu?",
        a: "Phí khám dịch vụ theo bảng giá được Sở Y tế phê duyệt. Xem chi tiết tại trang Bảng giá hoặc gọi hotline để được tư vấn cụ thể.",
      },
      {
        q: "Thanh toán bằng những hình thức nào?",
        a: "Viện chấp nhận: Tiền mặt, chuyển khoản ngân hàng, thẻ ATM nội địa, thẻ tín dụng Visa/Mastercard, ví điện tử MoMo, ZaloPay.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-stone-900 text-base leading-snug">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-primary-500 shrink-0 mt-0.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pb-5 text-stone-600 text-sm leading-relaxed pr-8">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [dynamicQnas, setDynamicQnas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/qna")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setDynamicQnas(json.data);
        }
      })
      .catch(err => console.error("Error fetching dynamic Q&As:", err));
  }, []);

  // Kết hợp danh sách FAQ tĩnh và động
  const mergedFaqs = FAQS.map(cat => {
    const matchedDynamics = dynamicQnas
      .filter(q => q.subject === cat.category)
      .map(q => ({ q: q.message, a: q.answer }));
    return {
      ...cat,
      items: [...cat.items, ...matchedDynamics]
    };
  });

  const standardCategories = FAQS.map(c => c.category);
  const otherDynamics = dynamicQnas
    .filter(q => !standardCategories.includes(q.subject))
    .map(q => ({ q: q.message, a: q.answer }));

  const finalFaqs = [...mergedFaqs];
  if (otherDynamics.length > 0) {
    finalFaqs.push({
      category: "Giải đáp từ Bác sĩ Chuyên khoa",
      items: otherDynamics
    });
  }

  const filtered = finalFaqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-24">
        <div className="container-site px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <MessageCircle className="h-4 w-4 text-teal-300" />
            Hỏi & Đáp
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Câu Hỏi Thường Gặp</h1>
          <p className="text-white/80 text-lg mb-8">
            Giải đáp nhanh các thắc mắc về dịch vụ khám chữa bệnh tại Viện Y Dược Học Dân Tộc.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
            <Input
              placeholder="Tìm câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base focus-visible:ring-white/40"
            />
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <div className="container-site px-4 py-14 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-stone-600">Không tìm thấy câu hỏi phù hợp</p>
            <Button variant="ghost" className="mt-3 text-primary-600" onClick={() => setSearch("")}>
              Xóa tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-lg font-bold text-primary-700 mb-2 pb-2 border-b-2 border-primary-100">
                  {cat.category}
                </h2>
                <div className="bg-white rounded-2xl border border-stone-100 px-6 divide-y divide-stone-100">
                  {cat.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-12 bg-primary-50 rounded-3xl border border-primary-100 p-8 text-center">
          <MessageCircle className="h-10 w-10 text-primary-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-stone-900 mb-2">Chưa tìm được câu trả lời?</h3>
          <p className="text-stone-500 mb-6 text-sm">Liên hệ trực tiếp với chúng tôi qua hotline hoặc chatbot AI ngay trên trang này.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="tel:0964392632">
              <Button className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold">
                <Phone className="mr-2 h-4 w-4" /> Gọi Hotline
              </Button>
            </a>
            <Link href="/lien-he">
              <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50">
                Gửi câu hỏi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
