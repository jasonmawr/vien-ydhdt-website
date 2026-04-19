import type { Doctor, Herb, Article, Department, HospitalStat } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// THỐNG KÊ TỔNG QUAN
// ─────────────────────────────────────────────────────────────
export const STATS_DATA: HospitalStat[] = [
  { label: "Năm kinh nghiệm", value: "45+", icon: "Award" },
  { label: "Bác sĩ chuyên khoa", value: "120+", icon: "Users" },
  { label: "Bệnh nhân mỗi năm", value: "300K+", icon: "HeartPulse" },
  { label: "Giường bệnh", value: "500", icon: "Bed" },
];

// ─────────────────────────────────────────────────────────────
// CHUYÊN KHOA
// ─────────────────────────────────────────────────────────────
export const DEPARTMENTS_DATA: Department[] = [
  {
    id: "khoa-noi-thong-hop",
    name: "Khoa Nội tổng hợp",
    slug: "khoa-noi-tong-hop",
    description: "Khám và điều trị các bệnh lý nội khoa mãn tính bằng sự kết hợp giữa Y học cổ truyền và Y học hiện đại.",
    icon: "Stethoscope",
    doctorCount: 25,
  },
  {
    id: "khoa-cham-cuu",
    name: "Khoa Châm cứu - Vật lý trị liệu",
    slug: "khoa-cham-cuu-vat-ly-tri-lieu",
    description: "Điều trị hiệu quả các chứng đau nhức xương khớp, phục hồi chức năng sau tai biến mạch máu não.",
    icon: "Activity",
    doctorCount: 18,
  },
  {
    id: "khoa-duong-sinh",
    name: "Khoa Dưỡng sinh",
    slug: "khoa-duong-sinh",
    description: "Cung cấp các phương pháp tập luyện, xoa bóp, bấm huyệt giúp nâng cao thể trạng, phòng chống bệnh tật.",
    icon: "Heart",
    doctorCount: 12,
  },
  {
    id: "khoa-kham-benh",
    name: "Khoa Khám bệnh",
    slug: "khoa-kham-benh",
    description: "Tiếp nhận, tư vấn và phân luồng bệnh nhân đến đúng các chuyên khoa phù hợp để điều trị tốt nhất.",
    icon: "ClipboardPlus",
    doctorCount: 30,
  },
];

// ─────────────────────────────────────────────────────────────
// ĐỘI NGŨ BÁC SĨ (MOCK)
// ─────────────────────────────────────────────────────────────
export const DOCTORS_DATA: Doctor[] = [
  {
    id: "bs-nguyen-van-an",
    slug: "nguyen-van-an",
    fullName: "Nguyễn Văn An",
    degree: "PGS.TS",
    specialty: "Nội khoa - Y học cổ truyền",
    departmentId: "khoa-noi-thong-hop",
    bio: "Phó Giáo sư Tiến sĩ Nguyễn Văn An có hơn 30 năm kinh nghiệm trong lĩnh vực Y học cổ truyền, chuyên điều trị các bệnh lý về tim mạch và tiêu hóa.",
    experience: 30,
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e410f624c427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    schedule: {
      monday: ["08:00", "09:30", "14:00", "15:30"],
      wednesday: ["08:00", "10:00", "14:00", "16:00"],
      friday: ["08:00", "09:00", "15:00"],
    },
    consultFee: 150000,
    rating: 4.9,
    reviewCount: 342,
    isFeatured: true,
  },
  {
    id: "bs-tran-thi-mai",
    slug: "tran-thi-mai",
    fullName: "Trần Thị Mai",
    degree: "BS.CKII",
    specialty: "Châm cứu - Phục hồi chức năng",
    departmentId: "khoa-cham-cuu",
    bio: "Bác sĩ Chuyên khoa II Trần Thị Mai là chuyên gia hàng đầu về châm cứu, đặc biệt mát tay với các ca phục hồi di chứng tai biến.",
    experience: 25,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    schedule: {
      tuesday: ["07:30", "09:00", "13:30", "15:00"],
      thursday: ["07:30", "10:00", "13:30"],
      saturday: ["08:00", "10:00"],
    },
    consultFee: 150000,
    rating: 4.8,
    reviewCount: 215,
    isFeatured: true,
  },
  {
    id: "bs-le-hoang-nam",
    slug: "le-hoang-nam",
    fullName: "Lê Hoàng Nam",
    degree: "ThS.BS",
    specialty: "Dưỡng sinh - Xoa bóp bấm huyệt",
    departmentId: "khoa-duong-sinh",
    bio: "Thạc sĩ Bác sĩ Lê Hoàng Nam nổi bật với phương pháp kết hợp khí công dưỡng sinh và xoa bóp trị liệu chứng mất ngủ mãn tính.",
    experience: 15,
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    schedule: {
      monday: ["13:00", "14:30", "16:00"],
      wednesday: ["08:00", "09:30", "13:00", "15:00"],
      friday: ["08:00", "10:00", "14:00"],
    },
    consultFee: 100000,
    rating: 4.7,
    reviewCount: 156,
    isFeatured: false,
  },
  {
    id: "bs-pham-thi-thu",
    slug: "pham-thi-thu",
    fullName: "Phạm Thị Thu",
    degree: "TS.BS",
    specialty: "Da liễu - Y học cổ truyền",
    departmentId: "khoa-noi-thong-hop",
    bio: "Tiến sĩ Bác sĩ Phạm Thị Thu áp dụng các bài thuốc thảo dược tự nhiên để điều trị tận gốc các bệnh da liễu khó chữa.",
    experience: 20,
    imageUrl: "https://images.unsplash.com/photo-1594824406283-49298514995f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    schedule: {
      tuesday: ["08:00", "09:00", "10:00"],
      thursday: ["13:30", "14:30", "15:30", "16:30"],
      friday: ["08:00", "09:00"],
    },
    consultFee: 150000,
    rating: 4.9,
    reviewCount: 289,
    isFeatured: true,
  }
];

// ─────────────────────────────────────────────────────────────
// TỪ ĐIỂN DƯỢC LIỆU (MOCK)
// ─────────────────────────────────────────────────────────────
export const HERBS_DATA: Herb[] = [
  {
    id: "herb-ha-thu-o-do",
    slug: "ha-thu-o-do",
    name: "Hà Thủ Ô Đỏ",
    latinName: "Polygonum multiflorum Thunb.",
    category: "Bổ huyết",
    description: "Rễ củ phơi khô của cây Hà thủ ô đỏ. Là vị thuốc quý giúp bồi bổ khí huyết, làm đen râu tóc, kéo dài tuổi thọ.",
    benefits: ["Bổ gan thận", "Ích tinh huyết", "Làm đen râu tóc", "Chống oxy hóa"],
    usage: "Dùng 10-20g dạng thuốc sắc, thường chế với đậu đen để giảm độc tính và tăng tác dụng bổ.",
    caution: "Người tỳ vị hư hàn, tiêu chảy không nên dùng. Kiêng ăn hành, tỏi, củ cải khi uống.",
    imageUrl: "https://images.unsplash.com/photo-1615560965611-e4088a5ea79c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
  },
  {
    id: "herb-nhan-sam",
    slug: "nhan-sam",
    name: "Nhân Sâm",
    latinName: "Panax ginseng C.A. Mey.",
    category: "Bổ khí",
    description: "Rễ phơi hoặc sấy khô của cây Nhân sâm. Vị thuốc bổ đứng đầu trong các loại thảo dược Đông y.",
    benefits: ["Đại bổ nguyên khí", "Sinh tân chỉ khát", "An thần", "Tăng cường sinh lực"],
    usage: "Dùng 2-6g mỗi ngày, có thể hãm trà, nhai ngậm, thái lát ngâm mật ong hoặc hầm gà.",
    caution: "Không dùng cho người bị cảm mạo, sốt, cao huyết áp. Không uống trà, ăn củ cải khi dùng sâm.",
    imageUrl: "https://images.unsplash.com/photo-1596431267597-9e32a4e98f02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
  },
  {
    id: "herb-kim-ngan-hoa",
    slug: "kim-ngan-hoa",
    name: "Kim Ngân Hoa",
    latinName: "Lonicera japonica Thunb.",
    category: "Thanh nhiệt",
    description: "Nụ hoa phơi khô của cây Kim ngân. Được mệnh danh là 'kháng sinh tự nhiên' của Y học cổ truyền.",
    benefits: ["Thanh nhiệt giải độc", "Kháng khuẩn", "Chống viêm", "Trị mụn nhọt, rôm sảy"],
    usage: "Dùng 10-15g/ngày sắc uống hoặc hãm trà. Có thể nấu nước tắm trị viêm da.",
    caution: "Người tỳ vị hư hàn, đang tiêu chảy không nên dùng.",
    imageUrl: "https://images.unsplash.com/photo-1629853909772-2f3b925b3e6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
  }
];

// ─────────────────────────────────────────────────────────────
// TIN TỨC & BÀI VIẾT (MOCK)
// ─────────────────────────────────────────────────────────────
export const ARTICLES_DATA: Article[] = [
  {
    id: "article-1",
    slug: "loi-ich-cua-cham-cuu-trong-dieu-tri-mat-ngu",
    title: "Lợi ích tuyệt vời của châm cứu trong điều trị chứng mất ngủ mãn tính",
    excerpt: "Châm cứu không chỉ giúp giảm đau mà còn là phương pháp hiệu quả giúp điều hòa hệ thần kinh, cải thiện chất lượng giấc ngủ một cách tự nhiên và an toàn.",
    content: "<p>Nội dung chi tiết về châm cứu...</p>", // Rút gọn cho mock
    category: "Hướng dẫn sức khỏe",
    author: "Lê Hoàng Nam",
    authorTitle: "ThS.BS",
    publishedAt: "2026-04-15T08:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1512102422744-88f553dd4364?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readingTime: 5,
    tags: ["Châm cứu", "Mất ngủ", "Trị liệu"],
    isFeatured: true,
    viewCount: 1250,
  },
  {
    id: "article-2",
    slug: "ung-dung-thuoc-nam-dieu-tri-da-day",
    title: "Ứng dụng các vị thuốc nam trong điều trị viêm loét dạ dày - tá tràng",
    excerpt: "Nghiên cứu mới nhất về hiệu quả của việc kết hợp chè dây, lá khôi tía và nghệ vàng trong phác đồ điều trị bệnh lý dạ dày tại Viện.",
    content: "<p>Nội dung bài nghiên cứu...</p>",
    category: "Nghiên cứu khoa học",
    author: "Nguyễn Văn An",
    authorTitle: "PGS.TS",
    publishedAt: "2026-04-10T09:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readingTime: 8,
    tags: ["Dạ dày", "Thuốc nam", "Nghiên cứu"],
    isFeatured: true,
    viewCount: 890,
  },
  {
    id: "article-3",
    slug: "mua-lanh-va-benh-xuong-khop",
    title: "Cẩm nang chăm sóc xương khớp cho người cao tuổi khi thời tiết chuyển mùa",
    excerpt: "Thời tiết lạnh làm giảm lưu thông máu, gây đau nhức khớp. Tìm hiểu ngay các phương pháp ngâm chân thảo dược và xoa bóp tại nhà.",
    content: "<p>Nội dung cẩm nang...</p>",
    category: "Sức khỏe & Đời sống",
    author: "Trần Thị Mai",
    authorTitle: "BS.CKII",
    publishedAt: "2026-04-05T14:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1505934333218-8feeaebfacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readingTime: 6,
    tags: ["Xương khớp", "Người cao tuổi", "Phòng bệnh"],
    isFeatured: false,
    viewCount: 2100,
  }
];
