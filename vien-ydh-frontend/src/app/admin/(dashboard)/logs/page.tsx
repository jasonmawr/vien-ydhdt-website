"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, FileText, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getLogs } from "@/services/api";
import { getAuthToken } from "@/services/auth";

interface LogData {
  files: string[];
  content: string;
  currentFile: string | null;
}

export default function SystemLogsPage() {
  const [data, setData] = useState<LogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const contentEndRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async (filename?: string) => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      const res = await getLogs(token, filename);
      if (res) {
        setData(res);
        if (!selectedFile && res.currentFile) {
          setSelectedFile(res.currentFile);
        }
        
        // Auto scroll to bottom
        setTimeout(() => {
          if (contentEndRef.current) {
            contentEndRef.current.scrollTop = contentEndRef.current.scrollHeight;
          }
        }, 100);
      } else {
        toast.error("Không thể tải logs");
      }
    } catch (err) {
      toast.error("Lỗi kết nối API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownload = () => {
    if (!data?.content) return;
    const blob = new Blob([data.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.currentFile || "system-log.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            System Logs (Hệ thống)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Giám sát hoạt động Backend và theo dõi lỗi API</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedFile}
            onChange={(e) => {
              setSelectedFile(e.target.value);
              fetchLogs(e.target.value);
            }}
            className="border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            {data?.files.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <button
            onClick={() => fetchLogs(selectedFile)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          <button
            onClick={handleDownload}
            disabled={!data?.content}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Tải về
          </button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
        <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 text-xs font-mono text-gray-400">{data?.currentFile || 'No file selected'}</span>
        </div>
        
        <pre 
          ref={contentEndRef}
          className="p-4 text-sm font-mono text-gray-300 overflow-y-auto max-h-[600px] whitespace-pre-wrap"
          style={{ minHeight: '400px' }}
        >
          {isLoading && !data?.content ? (
            <div className="flex items-center justify-center h-full text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Đang tải logs...
            </div>
          ) : data?.content ? (
            data.content
          ) : (
            <div className="text-gray-500 italic">Không có dữ liệu log cho ngày này.</div>
          )}
        </pre>
      </div>
    </div>
  );
}
