"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MapPin, Mail, Clock, MessageSquare, ChevronRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const contactItems = [
  {
    icon: MapPin,
    title: "Địa chỉ",
    lines: ["273 - 275 Nguyễn Văn Trỗi, Phường 10", "Quận Phú Nhuận, TP. Hồ Chí Minh"],
    action: { label: "Chỉ Đường", href: "https://maps.google.com/?q=273+Nguyen+Van+Troi+Phu+Nhuan+HCMC" },
  },
  {
    icon: Phone,
    title: "Điện thoại & Hotline",
    lines: ["Hotline: 0964 392 632", "Cấp cứu: 0964 392 632"],
    action: { label: "Gọi Ngay", href: "tel:0964392632" },
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["v.ydhdt@tphcm.gov.vn", "hotro@vienydhdt.gov.vn"],
    action: { label: "Gửi Email", href: "mailto:v.ydhdt@tphcm.gov.vn" },
  },
  {
    icon: Clock,
    title: "Giờ Khám Bệnh",
    lines: ["Thứ 2 – Thứ 6: 7:00 – 17:00", "Thứ 7: 7:00 – 12:00", "Chủ nhật: Nghỉ"],
    action: { label: "Đặt Lịch", href: "/dat-lich" },
  },
];

export default function LienHePage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <MessageSquare className="h-4 w-4 text-teal-300" />
              Liên hệ & Hỗ trợ
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-white/80 text-xl leading-relaxed">
              Đội ngũ tư vấn viên sẵn sàng hỗ trợ bạn 24/7. Gửi câu hỏi hoặc đặt lịch hẹn ngay hôm nay.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 -mt-8">
        <div className="container-site px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactItems.map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-md border border-stone-100 hover:shadow-xl hover:border-primary-100 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
                  <item.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg mb-3">{item.title}</h3>
                {item.lines.map(line => (
                  <p key={line} className="text-stone-600 text-sm leading-relaxed">{line}</p>
                ))}
                <a href={item.action.href} target={item.action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-primary-600 font-semibold text-sm hover:text-primary-800 transition-colors">
                  {item.action.label} <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-white rounded-3xl shadow-md border border-stone-100 p-10">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Gửi Tin Nhắn</h2>
              <p className="text-stone-500 mb-8">Điền thông tin và chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Gửi Thành Công!</h3>
                  <p className="text-stone-600">Cảm ơn bạn đã liên hệ. Viện sẽ phản hồi sớm nhất có thể.</p>
                  <Button className="mt-6 rounded-xl" onClick={() => setSubmitted(false)}>Gửi tin nhắn khác</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-stone-700 mb-1.5 block">Họ và tên *</label>
                      <Input required placeholder="Nhập họ và tên" className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-stone-700 mb-1.5 block">Số điện thoại *</label>
                      <Input required type="tel" placeholder="Nhập số điện thoại" className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">Email</label>
                    <Input type="email" placeholder="Nhập địa chỉ email" className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">Chủ đề</label>
                    <select className="flex h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Đặt lịch khám</option>
                      <option>Hỏi về dịch vụ</option>
                      <option>Tra cứu kết quả khám</option>
                      <option>Góp ý chất lượng dịch vụ</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">Nội dung *</label>
                    <Textarea required placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..." className="min-h-[140px] rounded-xl bg-stone-50 border-stone-200 resize-none" />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl bg-primary-600 hover:bg-primary-700 font-bold text-base">
                    {isSubmitting ? "Đang gửi..." : "Gửi Tin Nhắn"}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Map */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.6, delay: 0.2 } } }}>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Bản Đồ Chỉ Đường</h2>
              <div className="rounded-3xl overflow-hidden shadow-md border border-stone-100 mb-6" style={{ height: 420 }}>
                <iframe
                  title="Bản đồ Viện Y Dược Học Dân Tộc"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5124!2d106.6802!3d10.7999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529b77b0c6d03%3A0x19a43d7e4a218e46!2sVi%E1%BB%87n%20Y%20D%C6%B0%E1%BB%A3c%20H%E1%BB%8Dc%20D%C3%A2n%20T%E1%BB%99c!5e0!3m2!1svi!2svn!4v1713744000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="https://maps.google.com/?q=273+Nguyen+Van+Troi+Phu+Nhuan+HCMC" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-primary-200 text-primary-700">
                    <Navigation className="mr-2 h-4 w-4" /> Chỉ Đường Google Maps
                  </Button>
                </a>
                <Link href="/dat-lich">
                  <Button className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700">
                    Đặt Lịch Khám Ngay
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
