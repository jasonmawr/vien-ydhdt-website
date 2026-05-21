"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phone, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

type Step = "phone" | "otp";

export default function PatientLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(300);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("patient_token")) {
      router.replace("/tai-khoan/lich-hen");
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/patient/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mã OTP đã được gửi đến số của bạn");
        setStep("otp");
        setCountdown(60);
        setExpiresIn(data.expiresIn || 300);
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      } else {
        toast.error(data.error || "Lỗi gửi OTP");
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      handleVerifyOtp(text);
    }
  }

  async function handleVerifyOtp(code?: string) {
    const finalOtp = code || otp.join("");
    if (finalOtp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/patient/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: finalOtp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("patient_token", data.token);
        localStorage.setItem("patient_info", JSON.stringify(data.patient));
        toast.success("Đăng nhập thành công!");
        router.push("/tai-khoan/lich-hen");
      } else {
        toast.error(data.error || "Mã OTP không đúng");
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#109173] p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white font-bold text-xl">Cổng bệnh nhân</h1>
            <p className="text-white/80 text-sm mt-1">Viện Y Dược Học Dân Tộc TP.HCM</p>
          </div>

          <div className="p-8">
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <p className="text-stone-600 text-sm mb-6">
                    Nhập số điện thoại để nhận mã xác minh (OTP) qua SMS.
                  </p>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#109173] text-stone-800 placeholder-stone-300 text-lg tracking-wider"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#109173] hover:bg-[#0d7a61] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Gửi mã OTP
                </button>
                <p className="text-center text-xs text-stone-400">
                  Mã OTP có hiệu lực trong 5 phút và miễn phí
                </p>
              </form>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                  className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Đổi số điện thoại
                </button>

                <p className="text-stone-600 text-sm">
                  Đã gửi mã 6 chữ số đến <strong className="text-stone-800">{phone}</strong>.
                  Nhập mã bên dưới:
                </p>

                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-stone-200 rounded-xl focus:border-[#109173] focus:outline-none transition-colors text-stone-800"
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full bg-[#109173] hover:bg-[#0d7a61] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Xác nhận
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-stone-400">
                      Gửi lại mã sau <span className="font-semibold text-stone-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={() => { handleSendOtp({ preventDefault: () => {} } as any); }}
                      className="text-sm text-[#109173] hover:underline font-medium"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          Cần hỗ trợ? Gọi hotline{" "}
          <a href="tel:0964392632" className="text-[#109173] font-semibold">0964 392 632</a>
        </p>
      </div>
    </div>
  );
}
