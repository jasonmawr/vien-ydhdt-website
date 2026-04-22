"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type ExamPricingDTO, getExamPricing } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function BangGiaPage() {
  const [pricingData, setPricingData] = useState<ExamPricingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getExamPricing()
      .then(setPricingData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPricing = pricingData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24">
      <div className="container-site px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-stone-900 flex items-center gap-3"
            >
              <div className="p-3 bg-primary-100 rounded-2xl text-primary-600">
                <Receipt className="h-8 w-8" />
              </div>
              Bảng Giá Dịch Vụ Khám Bệnh
            </motion.h1>
            <p className="text-stone-500 mt-2 ml-14">
              Bảng giá được cập nhật trực tiếp từ hệ thống bệnh viện (HIS).
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
            <Input 
              type="text"
              placeholder="Tìm theo tên dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white border-stone-200"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-100/50 text-stone-900 font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 rounded-tl-3xl">Mã DV</th>
                  <th className="px-6 py-4">Tên Dịch Vụ</th>
                  <th className="px-6 py-4 text-right">Giá BHYT</th>
                  <th className="px-6 py-4 text-right">Giá Dịch Vụ</th>
                  <th className="px-6 py-4 text-right">Khám Yêu Cầu</th>
                  <th className="px-6 py-4 text-right rounded-tr-3xl">Khám Chuyên Gia</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredPricing.length > 0 ? (
                  filteredPricing.map((item, idx) => (
                    <tr key={item.code} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-stone-500">{item.code}</td>
                      <td className="px-6 py-4 font-medium text-stone-900">{item.name}</td>
                      <td className="px-6 py-4 text-right text-primary-700 font-semibold">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceBHYT)}
                      </td>
                      <td className="px-6 py-4 text-right text-stone-700">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceService)}
                      </td>
                      <td className="px-6 py-4 text-right text-stone-700">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceRequest)}
                      </td>
                      <td className="px-6 py-4 text-right text-stone-700">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceExpert)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                      Không tìm thấy dịch vụ nào phù hợp với từ khóa "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-stone-50 p-6 flex gap-3 text-stone-600 text-sm border-t border-stone-100">
            <Info className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <p>
              <strong>Lưu ý:</strong> Bảng giá mang tính chất tham khảo và có thể thay đổi theo quy định hiện hành của Bộ Y Tế. Đối với bệnh nhân có BHYT, mức hưởng sẽ phụ thuộc vào mã quyền lợi trên thẻ và tình trạng trái tuyến/đúng tuyến.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
