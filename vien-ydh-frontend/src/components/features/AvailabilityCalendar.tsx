"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, AlertCircle } from "lucide-react";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface SlotInfo {
  available: number;
  total: number;
  status: "open" | "limited" | "full";
}

interface AvailabilityCalendarProps {
  doctorId?: string;
  date: string;
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  open:    "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
  limited: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
  full:    "bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-60",
};

export default function AvailabilityCalendar({ doctorId, date, selectedTime, onSelectTime }: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<Record<string, SlotInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadAvailability = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ date });
      if (doctorId && doctorId !== "any") params.set("doctorId", doctorId);
      const res = await fetch(`${API}/api/booking/availability?${params}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [doctorId, date]);

  useEffect(() => {
    loadAvailability();
    // Auto-refresh mỗi 60 giây
    const interval = setInterval(loadAvailability, 60000);
    return () => clearInterval(interval);
  }, [loadAvailability]);

  const morningSlots = Object.entries(slots).filter(([t]) => {
    const h = parseInt(t.split(":")[0]);
    return h >= 6 && h < 12;
  });

  const afternoonSlots = Object.entries(slots).filter(([t]) => {
    const h = parseInt(t.split(":")[0]);
    return h >= 13;
  });

  if (!date) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#109173]" />
          Chọn giờ khám
        </h3>
        <button onClick={loadAvailability} className="text-stone-400 hover:text-stone-600 transition-colors" title="Làm mới">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && Object.keys(slots).length === 0 ? (
        <div className="flex justify-center py-6">
          <RefreshCw className="w-5 h-5 animate-spin text-[#109173]" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Không thể tải lịch trống. Vui lòng chọn giờ thủ công bên dưới.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Buổi sáng */}
          {morningSlots.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Buổi sáng</p>
              <div className="grid grid-cols-4 gap-2">
                {morningSlots.map(([time, info]) => (
                  <button
                    key={time}
                    onClick={() => info.status !== "full" && onSelectTime(time)}
                    disabled={info.status === "full"}
                    className={`
                      relative px-2 py-2.5 border rounded-xl text-xs font-semibold transition-all
                      ${STATUS_STYLE[info.status]}
                      ${selectedTime === time ? "ring-2 ring-[#109173] ring-offset-1 bg-[#109173]! border-[#109173]! text-white!" : ""}
                    `}
                  >
                    <div className="text-sm font-bold">{time}</div>
                    <div className={`text-xs mt-0.5 ${selectedTime === time ? "text-white/80" : ""}`}>
                      {info.status === "full" ? "Hết chỗ" : `${info.available} chỗ`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buổi chiều */}
          {afternoonSlots.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Buổi chiều</p>
              <div className="grid grid-cols-4 gap-2">
                {afternoonSlots.map(([time, info]) => (
                  <button
                    key={time}
                    onClick={() => info.status !== "full" && onSelectTime(time)}
                    disabled={info.status === "full"}
                    className={`
                      relative px-2 py-2.5 border rounded-xl text-xs font-semibold transition-all
                      ${STATUS_STYLE[info.status]}
                      ${selectedTime === time ? "ring-2 ring-[#109173] ring-offset-1 bg-[#109173]! border-[#109173]! text-white!" : ""}
                    `}
                  >
                    <div className="text-sm font-bold">{time}</div>
                    <div className={`text-xs mt-0.5 ${selectedTime === time ? "text-white/80" : ""}`}>
                      {info.status === "full" ? "Hết chỗ" : `${info.available} chỗ`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 text-xs text-stone-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block"></span>Còn chỗ</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block"></span>Sắp đầy</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-100 border border-stone-300 inline-block"></span>Hết chỗ</span>
          </div>
        </div>
      )}
    </div>
  );
}
