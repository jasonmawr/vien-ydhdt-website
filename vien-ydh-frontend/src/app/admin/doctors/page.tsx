import { prisma } from "@/lib/prisma";

export default async function AdminDoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    include: { department: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Quản Lý Bác Sĩ</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Thêm Bác Sĩ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Tên Bác Sĩ</th>
              <th className="p-4 font-semibold">Học Vị</th>
              <th className="p-4 font-semibold">Chuyên Khoa</th>
              <th className="p-4 font-semibold">Kinh Nghiệm</th>
              <th className="p-4 font-semibold text-center">Nổi Bật</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                <td className="p-4 font-medium text-stone-900">{doc.fullName}</td>
                <td className="p-4 text-stone-600">{doc.degree}</td>
                <td className="p-4 text-stone-600">{doc.department?.name}</td>
                <td className="p-4 text-stone-600">{doc.experience} năm</td>
                <td className="p-4 text-center">
                  {doc.isFeatured ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Có</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không</span>
                  )}
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">
                  Chưa có bác sĩ nào trong cơ sở dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
