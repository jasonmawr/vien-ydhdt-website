"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Globe,
  Video,
  ArrowUpRight,
  Sparkles,
  Activity,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Stethoscope,
  Microscope,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DoctorDTO, getAllDoctors } from "@/services/api"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function HospitalLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const [featuredDoctors, setFeaturedDoctors] = useState<DoctorDTO[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docs = await getAllDoctors();
        // Lấy 8 bác sĩ đầu tiên làm featured
        setFeaturedDoctors(docs.slice(0, 8));
      } catch (err) {
        console.error("Failed to load featured doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${scrollY > 50 ? "shadow-md" : ""}`}
      >
        <div className="container-site flex h-16 items-center justify-between border-x border-stone-100">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg"
              >
                <Leaf className="h-6 w-6 text-white" />
              </motion.div>
              <div className="leading-tight">
                <span className="font-bold text-lg text-primary-900 block">Viện Y Dược Học</span>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Dân Tộc TP.HCM</span>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/gioi-thieu" className="text-sm font-semibold text-stone-700 transition-colors hover:text-primary-600">
              Giới Thiệu
            </Link>
            <Link href="/dat-lich" className="text-sm font-semibold text-stone-700 transition-colors hover:text-primary-600">
              Đặt Lịch Khám
            </Link>
            <Link href="/tin-tuc" className="text-sm font-semibold text-stone-700 transition-colors hover:text-primary-600">
              Tin Tức
            </Link>
            <Link href="/bang-gia" className="text-sm font-semibold text-stone-700 transition-colors hover:text-primary-600">
              Bảng Giá
            </Link>
            <Link href="/lien-he" className="text-sm font-semibold text-stone-700 transition-colors hover:text-primary-600">
              Liên Hệ
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:0964392632">
              <Button variant="outline" size="sm" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50">
                0964 392 632
              </Button>
            </a>
            <Link href="/dat-lich">
              <Button size="sm" className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md">
                Đặt Lịch Khám
              </Button>
            </Link>
          </div>
          <button className="flex md:hidden text-stone-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Mở menu</span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white md:hidden"
        >
          <div className="container-site flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg text-primary-900">Viện Y Dược Học</span>
              </Link>
            </div>
            <button onClick={toggleMenu} className="text-stone-700">
              <X className="h-6 w-6" />
              <span className="sr-only">Đóng menu</span>
            </button>
          </div>
          <motion.nav
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container-site grid gap-3 pb-8 pt-6"
          >
            {[
              { href: "/gioi-thieu", label: "Giới Thiệu" },
              { href: "/dat-lich", label: "Đặt Lịch Khám" },
              { href: "/tin-tuc", label: "Tin Tức" },
              { href: "/bang-gia", label: "Bảng Giá Dịch Vụ" },
              { href: "/tra-cuu", label: "Tra Cứu Lịch Khám" },
              { href: "/lien-he", label: "Liên Hệ" }
            ].map((item, index) => (
              <motion.div key={index} variants={itemFadeIn}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-lg font-semibold text-stone-800 hover:bg-stone-100 hover:text-primary-600 transition-colors"
                  onClick={toggleMenu}
                >
                  {item.label}
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </Link>
              </motion.div>
            ))}
            <motion.div variants={itemFadeIn} className="flex flex-col gap-3 pt-6 px-2">
              <a href="tel:0964392632" className="w-full">
                <Button variant="outline" className="w-full rounded-xl border-primary-200 text-primary-700 h-12 text-base font-semibold">
                  Gọi: 0964 392 632
                </Button>
              </a>
              <Link href="/dat-lich" onClick={toggleMenu} className="w-full">
                <Button className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white h-12 text-base font-semibold">
                  Đặt Lịch Khám
                </Button>
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="container-site px-4 md:px-6 border border-stone-200/60 rounded-3xl bg-gradient-to-br from-white to-stone-50/50 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1fr_450px] lg:gap-12 xl:grid-cols-[1fr_650px] items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-col justify-center space-y-6 py-10"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full bg-primary-50 border border-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-primary-500" />
                    Chăm sóc sức khỏe toàn diện
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl text-stone-900 leading-[1.1]"
                  >
                    Kết hợp tinh hoa <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-primary-600 to-teal-500 bg-clip-text text-transparent">
                      Y học cổ truyền & Hiện đại
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-stone-600 md:text-xl leading-relaxed"
                  >
                    Đơn vị khám chữa bệnh uy tín hàng đầu khu vực phía Nam. Chúng tôi cam kết mang lại sự an tâm và hiệu quả điều trị tối ưu cho mọi bệnh nhân.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <Link href="/dat-lich">
                    <Button size="lg" className="rounded-xl group bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 text-base h-14 px-8">
                      Đặt Lịch Khám Ngay
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-primary-700 text-base h-14 px-8">
                    Tìm Hiểu Thêm
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center relative"
              >
                <div className="absolute inset-0 bg-primary-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50"></div>
                <div className="relative h-[400px] w-full md:h-[500px] lg:h-[550px] xl:h-[600px] overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white">
                  <Image
                    src="/images/hero_medicine.png"
                    alt="Khuôn viên Viện Y Dược Học Dân Tộc"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-16 md:py-24 lg:py-32 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container-site px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-full bg-primary-50 border border-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700 uppercase tracking-widest"
                >
                  Chuyên Khoa Mũi Nhọn
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-stone-900"
                >
                  Các Dịch Vụ Nổi Bật
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[800px] text-stone-600 md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed"
                >
                  Chúng tôi cung cấp các phương pháp điều trị tiên tiến, kết hợp ưu điểm của Y học cổ truyền và công nghệ hiện đại.
                </motion.p>
              </div>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid max-w-6xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: <Activity className="h-8 w-8 text-primary-600" />,
                  title: "Châm Cứu - Phục Hồi",
                  description: "Điều trị hiệu quả các chứng đau thần kinh tọa, thoái hóa cột sống, và phục hồi chức năng sau tai biến.",
                },
                {
                  icon: <Stethoscope className="h-8 w-8 text-primary-600" />,
                  title: "Khám Tổng Quát",
                  description: "Đánh giá tình trạng sức khỏe toàn diện với sự hỗ trợ của các trang thiết bị chẩn đoán hiện đại.",
                },
                {
                  icon: <Leaf className="h-8 w-8 text-primary-600" />,
                  title: "Dược Liệu YHCT",
                  description: "Sử dụng các bài thuốc Nam, thuốc Bắc nguồn gốc rõ ràng, đạt tiêu chuẩn chất lượng cao.",
                },
                {
                  icon: <HeartPulse className="h-8 w-8 text-primary-600" />,
                  title: "Vật Lý Trị Liệu",
                  description: "Các bài tập vận động, kéo giãn cột sống, siêu âm trị liệu giúp phục hồi cơ xương khớp.",
                },
                {
                  icon: <Microscope className="h-8 w-8 text-primary-600" />,
                  title: "Cận Lâm Sàng",
                  description: "Hệ thống xét nghiệm sinh hóa, huyết học, X-Quang, Siêu âm màu chuẩn xác và nhanh chóng.",
                },
                {
                  icon: <ShieldCheck className="h-8 w-8 text-primary-600" />,
                  title: "Cấy Chỉ Trị Liệu",
                  description: "Phương pháp đột phá ứng dụng chỉ tự tiêu vào huyệt đạo, mang lại tác dụng điều trị kéo dài.",
                },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative overflow-hidden rounded-[2rem] border border-stone-200 p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary-200 bg-white"
                >
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary-50 group-hover:bg-primary-100 transition-all duration-500 transform group-hover:scale-150"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-inner">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">{service.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{service.description}</p>
                  </div>
                  <div className="relative z-10 mt-8 flex items-center justify-between">
                    <Link href="#" className="text-sm font-bold text-primary-600 uppercase tracking-wide hover:text-primary-800 transition-colors">
                      Tìm hiểu thêm
                    </Link>
                    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <ArrowRight className="h-5 w-5 text-primary-600" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Portfolio/Work Bento Grid */}
        <section id="work" className="w-full py-16 md:py-24 lg:py-32 bg-stone-50">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container-site px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-full bg-primary-50 border border-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700 uppercase tracking-widest"
                >
                  Hoạt Động & Cơ Sở
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-stone-900"
                >
                  Không Gian Khám Chữa Bệnh
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[800px] text-stone-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  Môi trường điều trị xanh mát, thanh tịnh mang đậm bản sắc Y học Cổ truyền.
                </motion.p>
              </div>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid max-w-7xl gap-4 py-12 md:grid-cols-4 md:grid-rows-2 lg:gap-6"
            >
              {/* Bento Grid Items */}
              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-[2rem] md:col-span-2 md:row-span-2 h-[400px] md:h-auto shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none"></div>
                <Image
                  src="/images/zen_garden.png"
                  alt="Vườn Y Đạo"
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                  <h3 className="text-2xl font-bold mb-2 !text-white drop-shadow-md">Vườn Y Đạo Tượng Danh Y</h3>
                  <p className="!text-white/90 text-lg mb-6 drop-shadow-md">Khuôn viên lưu giữ tinh hoa y học truyền thống Việt Nam</p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className="rounded-xl bg-white/20 backdrop-blur-md border-white/40 text-white hover:bg-white hover:text-stone-900 transition-colors"
                    >
                      Khám phá thêm <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-[2rem] h-[250px] shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none"></div>
                <Image
                  src="/images/acupuncture_room.png"
                  alt="Khu vực điều trị"
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <h3 className="text-xl font-bold !text-white drop-shadow-md">Khu Vực Phục Hồi</h3>
                  <p className="text-sm !text-white/90 drop-shadow-md">Yên tĩnh và chuyên biệt</p>
                </div>
              </motion.div>
              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-[2rem] h-[250px] shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none"></div>
                <Image
                  src="/images/herbal_medicine.png"
                  alt="Cơ sở vật chất"
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <h3 className="text-xl font-bold !text-white drop-shadow-md">Cảnh Quan Thiên Nhiên</h3>
                  <p className="text-sm !text-white/90 drop-shadow-md">Không gian xanh hỗ trợ chữa lành</p>
                </div>
              </motion.div>
              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-[2rem] md:col-span-2 h-[250px] shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none"></div>
                <Image
                  src="/images/clinic_room.png"
                  alt="Hoạt động khám bệnh"
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <h3 className="text-xl font-bold !text-white drop-shadow-md">Phòng Chẩn Trị</h3>
                  <p className="text-sm !text-white/90 drop-shadow-md">Trang thiết bị hiện đại, sạch sẽ</p>
                </div>
              </motion.div>
            </motion.div>
            <div className="flex justify-center pb-10 mt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="rounded-xl group bg-primary-600 text-white hover:bg-primary-700 h-14 px-8 text-base shadow-lg">
                  Xem Tất Cả Hình Ảnh
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-16 md:py-24 lg:py-32 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container-site grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2 rounded-[3rem] bg-stone-50 border border-stone-200 overflow-hidden shadow-sm"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 p-8 lg:p-12"
            >
              <div className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-800 uppercase tracking-widest">Liên Hệ & Đặt Lịch</div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight text-stone-900">Sẵn sàng chăm sóc<br/>sức khỏe cho bạn</h2>
              <p className="max-w-[600px] text-stone-600 md:text-xl/relaxed">
                Đội ngũ bác sĩ và nhân viên y tế của Viện Y Dược Học Dân Tộc luôn sẵn lòng hỗ trợ. Hãy để lại thông tin hoặc gọi điện trực tiếp.
              </p>
              <div className="mt-10 space-y-6">
                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white transition-colors">
                  <div className="rounded-xl bg-primary-100 p-3 shadow-sm">
                    <MapPin className="h-6 w-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">Địa chỉ</h3>
                    <p className="text-stone-600 mt-1">273 - 275 Nguyễn Văn Trỗi, Phường 10, Quận Phú Nhuận, TP.HCM</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white transition-colors">
                  <div className="rounded-xl bg-primary-100 p-3 shadow-sm">
                    <Mail className="h-6 w-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">Email</h3>
                    <p className="text-stone-600 mt-1">v.ydhdt@tphcm.gov.vn</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white transition-colors">
                  <div className="rounded-xl bg-primary-100 p-3 shadow-sm">
                    <Phone className="h-6 w-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">Hotline tư vấn</h3>
                    <p className="text-primary-700 font-semibold mt-1 text-lg">0964 392 632</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 lg:p-12 h-full flex flex-col justify-center items-center text-center border-l border-stone-200"
            >
              <div className="h-20 w-20 rounded-full bg-primary-50 flex items-center justify-center mb-6 text-primary-600 shadow-inner">
                <Sparkles className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-bold text-stone-900 mb-4">Đặt Lịch Nhanh Chóng</h3>
              <p className="text-stone-600 mb-8 max-w-md">
                Hệ thống đặt lịch trực tuyến mới cho phép bạn chọn ngày giờ, bác sĩ yêu thích và thanh toán ngay lập tức chỉ với vài thao tác.
              </p>
              
              <Link href="/dat-lich" className="w-full max-w-sm">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full rounded-2xl bg-primary-600 hover:bg-primary-700 h-16 text-lg font-bold shadow-xl shadow-primary-500/30">
                    Bắt Đầu Đặt Lịch
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </motion.div>
              </Link>
              
              <div className="flex items-center gap-4 mt-8 text-sm text-stone-500 font-medium">
                <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500"/> Xác nhận tức thì</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500"/> Không chờ đợi</div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-stone-900 text-stone-300 pt-16">
        <div className="container-site grid gap-10 px-4 md:px-6 lg:grid-cols-4 border-b border-stone-800 pb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-xl text-white block">Viện Y Dược Học</span>
                <span className="text-sm font-semibold text-primary-400 uppercase tracking-widest">Dân Tộc TP.HCM</span>
              </div>
            </Link>
            <p className="text-stone-400 leading-relaxed">
              Kế thừa tinh hoa Y học cổ truyền Việt Nam, kết hợp cùng các phương pháp điều trị hiện đại nhằm mang lại sức khỏe tốt nhất cho cộng đồng.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Video className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:ml-12">
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Chuyên Khoa & Dịch Vụ</h3>
              <nav className="flex flex-col space-y-4">
                <Link href="/dat-lich" className="text-stone-400 hover:text-primary-400 transition-colors">Khám Bệnh Ban Đầu</Link>
                <Link href="/tra-cuu" className="text-stone-400 hover:text-primary-400 transition-colors">Tra Cứu Lịch Sử Khám</Link>
                <Link href="/dat-lich" className="text-stone-400 hover:text-primary-400 transition-colors">Đặt Lịch Cấy Chỉ</Link>
                <Link href="/bang-gia" className="text-stone-400 hover:text-primary-400 transition-colors">Bảng Giá Dịch Vụ</Link>
              </nav>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:ml-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Thông Tin Phụ Trợ</h3>
              <nav className="flex flex-col space-y-4">
                <Link href="/gioi-thieu" className="text-stone-400 hover:text-primary-400 transition-colors">Đào Tạo - Chỉ Đạo Tuyến</Link>
                <Link href="/tin-tuc" className="text-stone-400 hover:text-primary-400 transition-colors">Nghiên Cứu Khoa Học</Link>
                <Link href="/duoc-lieu" className="text-stone-400 hover:text-primary-400 transition-colors">Sản Phẩm Thuốc YHCT</Link>
                <Link href="/tin-tuc" className="text-stone-400 hover:text-primary-400 transition-colors">Tin Tức Hoạt Động</Link>
              </nav>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Bản Tin Sức Khỏe</h3>
            <p className="text-stone-400">
              Đăng ký email để nhận các lời khuyên chăm sóc sức khỏe bằng Đông Y hữu ích nhất.
            </p>
            <form className="flex flex-col gap-3 mt-2">
              <Input type="email" placeholder="Nhập địa chỉ email..." className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 h-12 rounded-xl focus-visible:ring-primary-500" />
              <Button type="button" className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold h-12">
                Đăng Ký
              </Button>
            </form>
          </div>
        </div>
        
        <div className="container-site py-6 flex flex-col md:flex-row items-center justify-between text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} Viện Y Dược Học Dân Tộc TP.HCM. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/lien-he" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link href="/lien-he" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
