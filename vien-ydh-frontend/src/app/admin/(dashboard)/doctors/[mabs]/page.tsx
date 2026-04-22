"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getWebDoctor, updateWebDoctor } from "@/services/api";

export default function EditDoctorPage({ params }: { params: Promise<{ mabs: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mabs: resolvedParams.mabs,
    avatar_url: "",
    special_titles: "",
    experience_years: "",
    bio: "<p>Tiểu sử chuyên môn của bác sĩ...</p>",
  });

  useEffect(() => {
    fetchDoctorWebProfile();
  }, [resolvedParams.mabs]);

  const fetchDoctorWebProfile = async () => {
    try {
      const data = await getWebDoctor(resolvedParams.mabs, localStorage.getItem('token') || '');
      if (data) {
        setFormData(prev => ({
          ...prev,
          avatar_url: data.avatar_url || "",
          special_titles: data.special_titles || "",
          experience_years: data.experience_years ? data.experience_years.toString() : "",
          bio: data.bio || prev.bio
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (html: string) => {
    setFormData(prev => ({ ...prev, bio: html }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      };
      await updateWebDoctor(payload, localStorage.getItem('token') || '');
      alert("Đã cập nhật hồ sơ bác sĩ thành công!");
      router.push("/admin/doctors");
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-stone-800">Hồ sơ Web Bác sĩ: <span className="text-primary-600">{resolvedParams.mabs}</span></h2>
            <p className="text-stone-500 text-sm">Các thông tin này sẽ kết hợp với dữ liệu HIS để hiển thị trên web.</p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
        >
          <Save size={16} /> Lưu Thay Đổi
        </Button>
      </div>

      <div className="space-y-8">
        <div className="flex gap-6 items-start">
          <div className="w-32 h-32 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-stone-300" />
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">URL Ảnh Đại Diện</label>
              <Input 
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Học hàm / Học vị</label>
                <Input 
                  name="special_titles"
                  value={formData.special_titles}
                  onChange={handleChange}
                  placeholder="GS.TS, PGS.TS, ThS.BS..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Số năm kinh nghiệm</label>
                <Input 
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="Ví dụ: 15" 
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Tiểu sử chuyên môn</label>
          <RichTextEditor content={formData.bio} onChange={handleEditorChange} />
        </div>
      </div>
    </div>
  );
}
