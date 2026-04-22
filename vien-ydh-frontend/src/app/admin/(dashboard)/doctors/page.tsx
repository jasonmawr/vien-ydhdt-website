"use client";

import { useEffect, useState } from "react";
import { Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getHISDoctors } from "@/services/api";

interface Doctor {
  MABS: string;
  HOTEN: string;
  NHOM: string;
  TENNHOM: string;
  TENKP: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await getHISDoctors();
      setDoctors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = doctors.filter(d => 
    d.HOTEN?.toLowerCase().includes(search.toLowerCase()) || 
    d.MABS?.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Hồ sơ Bác sĩ (Dual-DB)</h2>
          <p className="text-stone-500 text-sm">Cập nhật Avatar, tiểu sử cho bác sĩ (Dữ liệu nền tự động đồng bộ từ HIS).</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
          <Input 
            placeholder="Tìm kiếm tên hoặc mã bác sĩ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-lg bg-stone-50 border-stone-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-stone-900 font-semibold border-y border-stone-200">
            <tr>
              <th className="px-4 py-3">Mã BS (HIS)</th>
              <th className="px-4 py-3">Họ Tên</th>
              <th className="px-4 py-3">Chuyên Khoa</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10">Đang tải dữ liệu từ HIS...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map(doc => (
                <tr key={doc.MABS} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-4 font-mono text-stone-500">{doc.MABS}</td>
                  <td className="px-4 py-4 font-bold text-stone-900">{doc.HOTEN}</td>
                  <td className="px-4 py-4">{doc.TENKP || doc.TENNHOM}</td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/admin/doctors/${doc.MABS}`}>
                      <Button variant="outline" size="sm" className="h-8 text-primary-600 hover:text-primary-700">
                        <Edit size={14} className="mr-2" /> Chỉnh sửa Web Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-stone-500">Không tìm thấy bác sĩ.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
