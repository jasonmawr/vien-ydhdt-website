"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientAccountPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("patient_token") : null;
    if (token) {
      router.replace("/tai-khoan/lich-hen");
    } else {
      router.replace("/tai-khoan/dang-nhap");
    }
  }, [router]);
  return null;
}
