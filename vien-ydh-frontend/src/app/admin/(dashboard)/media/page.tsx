"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Upload, Trash2, Copy, RefreshCw, Image, FileText, Film,
  FileSpreadsheet, FileArchive, HardDrive, Search, Filter, X, Check
} from "lucide-react";
import { getAuthToken } from "@/services/auth";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  type: string;
  ext: string;
  createdAt: string;
}

interface Stats {
  totalFiles: number;
  totalSizeMb: string;
  byType: Record<string, { count: number; size: number }>;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <Image className="w-5 h-5 text-blue-500" />,
  video: <Film className="w-5 h-5 text-purple-500" />,
  pdf:   <FileText className="w-5 h-5 text-red-500" />,
  word:  <FileText className="w-5 h-5 text-blue-700" />,
  excel: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
  other: <FileArchive className="w-5 h-5 text-stone-400" />,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<string>("");

  // Fetch token once on mount
  useEffect(() => {
    getAuthToken().then(t => { tokenRef.current = t || ""; });
  }, []);

  async function getToken() {
    if (!tokenRef.current) {
      tokenRef.current = await getAuthToken() || "";
    }
    return tokenRef.current;
  }

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [filesRes, statsRes] = await Promise.all([
        fetch(`${API}/api/upload/list`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/upload/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const filesData = await filesRes.json();
      const statsData = await statsRes.json();
      if (filesData.success) setFiles(filesData.data);
      if (statsData.success) setStats(statsData.data);
    } catch {
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(fileList).forEach(f => formData.append("files", f));

    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã tải lên ${fileList.length} file thành công`);
        loadMedia();
      } else {
        toast.error(data.error || "Lỗi tải lên");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename: string) {
    if (!confirm(`Xóa file "${filename}"?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/upload/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa file");
        setFiles(prev => prev.filter(f => f.filename !== filename));
        setSelected(prev => { const s = new Set(prev); s.delete(filename); return s; });
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} file đã chọn?`)) return;
    for (const filename of selected) {
      await handleDelete(filename);
    }
    setSelected(new Set());
  }

  function copyUrl(url: string, filename: string) {
    const fullUrl = `${API}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(filename);
    toast.success("Đã copy URL");
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = files.filter(f => {
    const matchSearch = !search || f.filename.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = ["all", ...Array.from(new Set(files.map(f => f.type)))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Thư viện Media</h1>
          <p className="text-stone-500 text-sm mt-1">Quản lý tất cả file đã tải lên</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#109173] hover:bg-[#0d7a61] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Tải lên
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
        />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
              <HardDrive className="w-4 h-4" /> Tổng file
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalFiles}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
              <HardDrive className="w-4 h-4" /> Dung lượng
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalSizeMb} MB</div>
          </div>
          {Object.entries(stats.byType).slice(0, 2).map(([type, info]) => (
            <div key={type} className="bg-white rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 text-stone-500 text-sm mb-1 capitalize">
                {TYPE_ICONS[type] || TYPE_ICONS.other} {type}
              </div>
              <div className="text-2xl font-bold text-stone-800">{info.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Zone */}
      <div
        className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center mb-6 hover:border-[#109173] hover:bg-emerald-50/30 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <p className="text-stone-600 font-medium">Kéo thả file vào đây hoặc click để chọn</p>
        <p className="text-stone-400 text-xs mt-1">Hỗ trợ: JPG, PNG, GIF, WEBP, PDF, DOC, XLS (tối đa 50MB)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm file..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#109173]"
          />
        </div>
        <div className="flex gap-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                typeFilter === t ? "bg-[#109173] text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {t === "all" ? "Tất cả" : t}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa {selected.size} file
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-[#109173]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Chưa có file nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(file => (
            <div
              key={file.filename}
              className={`group bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
                selected.has(file.filename) ? "border-[#109173] ring-2 ring-[#109173]/20" : "border-stone-100"
              }`}
            >
              {/* Thumbnail / Preview */}
              <div
                className="relative aspect-square bg-stone-50 cursor-pointer"
                onClick={() => setSelected(prev => {
                  const s = new Set(prev);
                  if (s.has(file.filename)) s.delete(file.filename);
                  else s.add(file.filename);
                  return s;
                })}
              >
                {file.type === "image" ? (
                  <img
                    src={`${API}${file.url}`}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="scale-150">{TYPE_ICONS[file.type] || TYPE_ICONS.other}</div>
                  </div>
                )}
                {selected.has(file.filename) && (
                  <div className="absolute inset-0 bg-[#109173]/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#109173] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-stone-700 font-medium truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{formatBytes(file.size)}</p>
              </div>

              {/* Actions */}
              <div className="flex border-t border-stone-50">
                <button
                  onClick={() => copyUrl(file.url, file.filename)}
                  className="flex-1 py-1.5 text-xs text-stone-500 hover:text-[#109173] hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
                  title="Copy URL"
                >
                  {copied === file.filename ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleDelete(file.filename)}
                  className="flex-1 py-1.5 text-xs text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                  title="Xóa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
