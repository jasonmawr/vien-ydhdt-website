"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function TraCuuPage() {
  const t = useTranslations('search');
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24">
      <div className="container-site px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
        >
          {/* Header */}
          <div className="bg-primary-600 p-8 text-center md:p-12">
            <h1 className="text-3xl font-bold text-white mb-4">{t('title')}</h1>
            <p className="text-primary-100 max-w-lg mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Search Box */}
          <div className="p-8 md:p-12 -mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto border border-stone-100">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
                  <Input
                    type="tel"
                    placeholder={t('placeholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-14 rounded-xl bg-stone-50 border-stone-200 text-lg focus-visible:ring-primary-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !phone}
                  className="h-14 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-base font-bold shadow-md shadow-primary-500/20"
                >
                  {isSearching ? t('searching') : t('button')}
                </Button>
              </form>
            </div>

            {/* Results Area */}
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-8"
              >
                {/* Result Block 1 */}
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary-600" /> {t('upcomingAppointments')}
                  </h3>
                  <div
                    className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => toast.info(t('featureComingSoon', { item: t('viewDetails').toLowerCase() }))}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-3 uppercase tracking-wider">
                          {t('confirmed')}
                        </div>
                        <h4 className="font-bold text-stone-900 text-lg">{t('examType', { type: 'Y học cổ truyền' })}</h4>
                        <p className="text-stone-500 mt-1">Bác sĩ: BS.CKII. Bùi Nguyễn Y Châu</p>
                        <p className="text-primary-700 font-semibold mt-2">08:00 - Thứ Tư, 25/04/2026</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-stone-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Result Block 2 */}
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary-600" /> {t('medicalHistory')}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-stone-900">{t('examType', { type: 'Phục hồi chức năng' })}</h4>
                        <p className="text-sm text-stone-500 mt-1">{t('examDate', { date: '10/02/2026' })}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-300"
                        onClick={() => toast.info(t('featureComingSoon', { item: t('viewDetails').toLowerCase() }))}
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
}
