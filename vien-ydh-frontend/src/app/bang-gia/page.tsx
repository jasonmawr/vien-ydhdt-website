"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type ExamPricingDTO, getExamPricing } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function BangGiaPage() {
  const t = useTranslations('pricing');
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
              {t('title')}
            </motion.h1>
            <p className="text-stone-500 mt-2 ml-14">
              {t('subtitle')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
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
                  <th className="px-6 py-4 rounded-tl-3xl">{t('table.code')}</th>
                  <th className="px-6 py-4">{t('table.service')}</th>
                  <th className="px-6 py-4 text-right">{t('table.bhyt')}</th>
                  <th className="px-6 py-4 text-right">{t('table.serviceFee')}</th>
                  <th className="px-6 py-4 text-right">{t('table.request')}</th>
                  <th className="px-6 py-4 text-right rounded-tr-3xl">{t('table.expert')}</th>
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
                      {t('noResults', { searchTerm })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 p-6 flex gap-3 text-stone-600 text-sm border-t border-stone-100">
            <Info className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <p>
              <strong>{t('note.title')}</strong> {t('note.text')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
