import { prisma } from "@/lib/prisma";

export default async function AdminHerbsPage() {
  const herbs = await prisma.herb.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Quản Lý Dược Liệu</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Thêm Dược Liệu
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Tên Dược Liệu</th>
              <th className="p-4 font-semibold">Tên Khoa Học</th>
              <th className="p-4 font-semibold">Nhóm Thuốc</th>
              <th className="p-4 font-semibold text-center">Nổi Bật</th>
            </tr>
          </thead>
          <tbody>
            {herbs.map((herb) => (
              <tr key={herb.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                <td className="p-4 font-medium text-stone-900">{herb.name}</td>
                <td className="p-4 text-stone-600 italic">{herb.latinName}</td>
                <td className="p-4 text-stone-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                    {herb.category}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {herb.isFeatured ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Có</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không</span>
                  )}
                </td>
              </tr>
            ))}
            {herbs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-stone-500">
                  Chưa có dược liệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
