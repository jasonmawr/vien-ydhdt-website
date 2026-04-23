"use client";

import { useEffect, useState } from "react";
import { Search, Edit, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllDoctors, getDoctorImageUrl, type DoctorDTO } from "@/services/api";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await getAllDoctors();
      setDoctors(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách bác sĩ:", error);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = doctors.filter(d => 
    d.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    d.id?.toString().includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Hồ sơ Bác sĩ</h2>
          <p className="text-stone-500 text-sm">Danh sách bác sĩ từ HIS ({filtered.length} bác sĩ). Bấm "Chỉnh sửa" để cập nhật Avatar và Tiểu sử hiển thị trên Website.</p>
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
              <th className="px-4 py-3 w-16">Ảnh</th>
              <th className="px-4 py-3">Mã BS</th>
              <th className="px-4 py-3">Họ Tên</th>
              <th className="px-4 py-3">Học vị</th>
              <th className="px-4 py-3">Chuyên Khoa</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">Đang tải dữ liệu từ HIS...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map(doc => (
                <tr key={doc.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
                      <img 
                        src={getDoctorImageUrl(doc.id)} 
                        alt={doc.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-stone-400 text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>`;
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-500 text-xs">{doc.id}</td>
                  <td className="px-4 py-3 font-bold text-stone-900">{doc.fullName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-medium">{doc.degree}</span>
                  </td>
                  <td className="px-4 py-3">{doc.specialty || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/doctors/${doc.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-primary-600 hover:text-primary-700">
                        <Edit size={14} className="mr-2" /> Chỉnh sửa Web Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-500">
                  {doctors.length === 0 
                    ? "Không thể kết nối đến HIS. Đảm bảo Backend đang chạy và Oracle Database sẵn sàng." 
                    : "Không tìm thấy bác sĩ phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
