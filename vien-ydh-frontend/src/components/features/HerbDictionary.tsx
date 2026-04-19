"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Beaker } from "lucide-react";
import { HERBS_DATA } from "@/services/mockData";
import { cn } from "@/lib/utils";

// Lấy danh sách các danh mục duy nhất từ dữ liệu mock
const categories = ["Tất cả", ...Array.from(new Set(HERBS_DATA.map((herb) => herb.category)))];

export default function HerbDictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredHerbs = useMemo(() => {
    return HERBS_DATA.filter((herb) => {
      const matchesSearch = 
        herb.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        herb.latinName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "Tất cả" || herb.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="animate-fade-in-up">
      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#065f46] focus:bg-white focus:ring-1 focus:ring-[#065f46] transition-all"
            placeholder="Tìm theo tên tiếng Việt hoặc tên Latin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Tìm kiếm dược liệu"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="h-5 w-5 text-gray-400 shrink-0 mr-2" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-[#065f46] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredHerbs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHerbs.map((herb, index) => (
            <div 
              key={herb.id} 
              className="card group overflow-hidden bg-white border border-gray-100 flex flex-col h-full animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={herb.imageUrl}
                  alt={herb.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <span className="badge-primary shadow-md">{herb.category}</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-xl font-bold text-[#1a1a1a] mb-1">
                  {herb.name}
                </h3>
                <p className="text-sm italic text-gray-500 mb-4 font-serif">
                  {herb.latinName}
                </p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1">
                  {herb.description}
                </p>
                
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Beaker className="h-3 w-3 text-[#d97706]" />
                    Công dụng chính
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {herb.benefits.slice(0, 3).map((benefit) => (
                      <span key={benefit} className="inline-flex items-center rounded-md bg-[#fbf9f6] px-2 py-1 text-xs font-medium text-[#d97706] ring-1 ring-inset ring-[#d97706]/20">
                        {benefit}
                      </span>
                    ))}
                    {herb.benefits.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        +{herb.benefits.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Beaker className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy dược liệu</h3>
          <p className="text-gray-500">Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
        </div>
      )}
    </div>
  );
}
