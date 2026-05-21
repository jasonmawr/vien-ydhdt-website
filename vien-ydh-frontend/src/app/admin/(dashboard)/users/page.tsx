"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, ShieldCheck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, type AdminUserDTO } from "@/services/api";
import { getAuthToken } from "@/services/auth";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
  EDITOR: { label: "Biên tập", className: "bg-blue-100 text-blue-700" },
  MODERATOR: { label: "Kiểm duyệt", className: "bg-purple-100 text-purple-700" },
  VIEWER: { label: "Xem", className: "bg-stone-100 text-stone-600" },
};

type ModalMode = 'create' | 'edit' | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<AdminUserDTO | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "EDITOR" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const data = await getAdminUsers(token);
      setUsers(data || []);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ username: "", password: "", role: "EDITOR" });
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (user: AdminUserDTO) => {
    setForm({ username: user.username, password: "", role: user.role });
    setEditTarget(user);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSubmit = async () => {
    if (modalMode === 'create' && (!form.username || !form.password)) {
      toast.error("Vui lòng nhập đầy đủ username và mật khẩu");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");

      if (modalMode === 'create') {
        await createAdminUser({ username: form.username, password: form.password, role: form.role }, token);
        toast.success("Tạo tài khoản thành công!");
      } else if (modalMode === 'edit' && editTarget) {
        const payload: { role?: string; password?: string } = { role: form.role };
        if (form.password) payload.password = form.password;
        await updateAdminUser(editTarget.id, payload, token);
        toast.success("Cập nhật tài khoản thành công!");
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: AdminUserDTO) => {
    if (!confirm(`Xóa tài khoản "${user.username}"? Hành động này không thể hoàn tác.`)) return;
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      await deleteAdminUser(user.id, token);
      toast.success("Đã xóa tài khoản");
      fetchUsers();
    } catch {
      toast.error("Lỗi xóa tài khoản");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary-600" /> Quản lý tài khoản Admin
          </h2>
          <p className="text-stone-500 text-sm mt-1">Tạo và phân quyền tài khoản quản trị viên hệ thống.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2">
          <UserPlus size={16} /> Thêm tài khoản
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(ROLE_LABELS).map(([role, info]) => (
          <span key={role} className={`px-3 py-1 rounded-full text-xs font-semibold ${info.className}`}>
            {info.label}: {role === 'ADMIN' ? 'Toàn quyền' : role === 'EDITOR' ? 'Soạn thảo nội dung' : role === 'MODERATOR' ? 'Duyệt bài viết' : 'Xem dashboard'}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-stone-900 font-semibold border-y border-stone-200">
            <tr>
              <th className="px-4 py-3">Tên đăng nhập</th>
              <th className="px-4 py-3">Quyền</th>
              <th className="px-4 py-3 text-right">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-10">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-stone-400">Chưa có tài khoản nào.</td></tr>
            ) : (
              users.map(user => {
                const roleInfo = ROLE_LABELS[user.role] || { label: user.role, className: "bg-stone-100 text-stone-600" };
                return (
                  <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-4 font-medium text-stone-900">{user.username}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${roleInfo.className}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-xs text-stone-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-500 hover:text-blue-600" onClick={() => openEdit(user)} title="Chỉnh sửa">
                          <Edit2 size={15} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-500 hover:text-red-600" onClick={() => handleDelete(user)} title="Xóa">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-stone-800">
                {modalMode === 'create' ? 'Thêm tài khoản mới' : `Chỉnh sửa: ${editTarget?.username}`}
              </h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Tên đăng nhập</label>
                  <Input
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="username"
                    autoComplete="off"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  {modalMode === 'create' ? 'Mật khẩu' : 'Mật khẩu mới (để trống nếu không đổi)'}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Quyền hạn</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ADMIN">Admin — Toàn quyền</option>
                  <option value="EDITOR">Biên tập — Soạn thảo nội dung</option>
                  <option value="MODERATOR">Kiểm duyệt — Duyệt bài viết</option>
                  <option value="VIEWER">Xem — Chỉ đọc dashboard</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1">Hủy</Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {isSubmitting ? "Đang xử lý..." : modalMode === 'create' ? "Tạo tài khoản" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
