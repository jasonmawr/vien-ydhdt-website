/**
 * @file herbs-static.ts
 * @description Dữ liệu dược liệu tĩnh — Kiến thức Y học cổ truyền không thay đổi.
 * Source: Dược điển Việt Nam, các tài liệu Y học chính thức.
 * Trong tương lai có thể được thay bằng API từ Oracle nếu có bảng DMDL.
 */

export interface Herb {
  id: string;
  name: string;
  latinName: string;
  category: string;
  description: string;
  benefits: string[];
  imageUrl: string;
}

export const HERBS_DATA: Herb[] = [
  {
    id: "curcuma-longa",
    name: "Nghệ Vàng",
    latinName: "Curcuma longa L.",
    category: "Tiêu hóa",
    description: "Nghệ là vị thuốc quý trong Y học cổ truyền, có tác dụng chữa đau dạ dày, viêm loét dạ dày tá tràng, bảo vệ gan, kháng viêm và chống oxy hóa mạnh.",
    benefits: ["Bảo vệ dạ dày", "Kháng viêm", "Giải độc gan", "Chống oxy hóa"],
    imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "zingiber-officinale",
    name: "Gừng",
    latinName: "Zingiber officinale Rosc.",
    category: "Tiêu hóa",
    description: "Gừng tươi và gừng khô (Can khương) là vị thuốc phổ biến trong Y học cổ truyền, dùng ôn trung tán hàn, chữa nôn mửa, cảm lạnh, đau bụng.",
    benefits: ["Trị buồn nôn", "Ôn tỳ vị", "Giảm đau", "Trị cảm lạnh"],
    imageUrl: "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "panax-ginseng",
    name: "Nhân Sâm",
    latinName: "Panax ginseng C.A.Mey.",
    category: "Bổ dưỡng",
    description: "Nhân Sâm là vị thuốc bổ khí hàng đầu trong Đông y. Tăng cường miễn dịch, cải thiện trí nhớ, tăng sinh lực, chống mệt mỏi.",
    benefits: ["Đại bổ nguyên khí", "Tăng miễn dịch", "Cải thiện trí nhớ", "Chống mệt mỏi"],
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "coptis-chinensis",
    name: "Hoàng Liên",
    latinName: "Coptis chinensis Franch.",
    category: "Kháng khuẩn",
    description: "Hoàng Liên có tính đắng, hàn; thanh nhiệt, táo thấp, tả hỏa, giải độc. Dùng điều trị viêm ruột, kiết lỵ, viêm dạ dày, mất ngủ.",
    benefits: ["Thanh nhiệt", "Kháng khuẩn", "Điều trị kiết lỵ", "An thần"],
    imageUrl: "https://images.unsplash.com/photo-1591084728795-1149f32d9866?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "lycium-barbarum",
    name: "Câu Kỷ Tử",
    latinName: "Lycium barbarum L.",
    category: "Bổ dưỡng",
    description: "Câu Kỷ Tử bổ can thận, dưỡng huyết sáng mắt. Chứa nhiều chất chống oxy hóa, bổ dưỡng toàn thân, cải thiện thị lực.",
    benefits: ["Bổ thận", "Dưỡng can", "Sáng mắt", "Chống lão hóa"],
    imageUrl: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ganoderma-lucidum",
    name: "Linh Chi",
    latinName: "Ganoderma lucidum (Leyss.) Karst.",
    category: "Miễn dịch",
    description: "Linh Chi là dược liệu quý, tăng cường miễn dịch, hỗ trợ điều trị ung thư, bảo vệ gan, điều chỉnh huyết áp và lipid máu.",
    benefits: ["Tăng miễn dịch", "Bảo vệ gan", "Điều hòa huyết áp", "Chống khối u"],
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "astragalus-membranaceus",
    name: "Hoàng Kỳ",
    latinName: "Astragalus membranaceus (Fisch.) Bunge",
    category: "Miễn dịch",
    description: "Hoàng Kỳ bổ khí, cố biểu, trợ dương, lợi thủy. Tăng cường miễn dịch, kháng viêm, cải thiện chức năng tim mạch.",
    benefits: ["Bổ khí", "Tăng miễn dịch", "Kháng viêm", "Bảo vệ tim"],
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "angelica-sinensis",
    name: "Đương Quy",
    latinName: "Angelica sinensis (Oliv.) Diels",
    category: "Phụ khoa",
    description: "Đương Quy bổ huyết, hoạt huyết, điều kinh. Là vị thuốc hàng đầu cho phụ nữ: điều trị kinh nguyệt không đều, thiếu máu, đau bụng kinh.",
    benefits: ["Bổ huyết", "Điều kinh", "Giảm đau bụng kinh", "Hoạt huyết"],
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "cinnamon",
    name: "Quế Chi",
    latinName: "Cinnamomum cassia (Nees) Nees ex Bl.",
    category: "Tim mạch",
    description: "Quế Chi ôn kinh thông mạch, tán hàn chỉ thống. Dùng điều trị đau bụng lạnh, tứ chi lạnh giá, đau khớp, cải thiện tuần hoàn máu.",
    benefits: ["Ôn kinh", "Thông mạch", "Trị đau khớp", "Cải thiện tuần hoàn"],
    imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "chrysanthemum",
    name: "Cúc Hoa",
    latinName: "Chrysanthemum morifolium Ramat.",
    category: "Thần kinh",
    description: "Cúc Hoa sơ phong thanh nhiệt, giải độc, sáng mắt. Trị đau đầu, chóng mặt, mắt đỏ đau, cao huyết áp.",
    benefits: ["Sơ phong thanh nhiệt", "Giảm đau đầu", "Sáng mắt", "Hạ huyết áp"],
    imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "schisandra",
    name: "Ngũ Vị Tử",
    latinName: "Schisandra chinensis (Turcz.) Baill.",
    category: "Thần kinh",
    description: "Ngũ Vị Tử thu liễm, bổ thận, an thần. Cải thiện giấc ngủ, giảm lo lắng, bảo vệ gan, tăng cường chức năng nhận thức.",
    benefits: ["An thần", "Bổ thận", "Cải thiện giấc ngủ", "Bảo vệ gan"],
    imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rehmannia",
    name: "Sinh Địa",
    latinName: "Rehmannia glutinosa (Gaertn.) Libosch.",
    category: "Bổ dưỡng",
    description: "Sinh Địa thanh nhiệt lương huyết, dưỡng âm sinh tân. Điều trị tiểu đường, sốt cao, ho ra máu, huyết áp cao.",
    benefits: ["Lương huyết", "Dưỡng âm", "Hỗ trợ tiểu đường", "Hạ huyết áp"],
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
  },
];
