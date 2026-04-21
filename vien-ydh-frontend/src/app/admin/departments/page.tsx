import { prisma } from "@/lib/prisma";

export default async function AdminDepartmentsPage() {
  const departments = await prisma.department.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Quản Lý Chuyên Khoa</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Thêm Khoa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Tên Khoa</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold">Số Bác Sĩ</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                <td className="p-4 font-medium text-stone-900">{dept.name}</td>
                <td className="p-4 text-stone-600">{dept.slug}</td>
                <td className="p-4 text-stone-600">{dept.doctorCount}</td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-stone-500">
                  Chưa có chuyên khoa nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
