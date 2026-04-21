import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientName, patientPhone, patientDob, patientGender, departmentId, doctorId, appointmentDate, appointmentTime, symptoms } = body;

    if (!patientName || !patientPhone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Proxy sang Backend Oracle API
    const backendRes = await fetch(`${BACKEND_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, patientPhone, patientDob, patientGender, departmentId, doctorId, appointmentDate, appointmentTime, symptoms }),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Lỗi proxy appointments POST:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/appointments?limit=100`, {
      cache: "no-store",
    });
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi proxy appointments GET:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
