import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientDob,
      patientGender,
      departmentId,
      doctorId,
      appointmentDate,
      appointmentTime,
      symptoms
    } = body;

    if (!patientName || !patientPhone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        patientPhone,
        patientDob,
        patientGender,
        departmentId: departmentId || null,
        doctorId: doctorId === "any" ? null : doctorId,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
        appointmentTime,
        symptoms,
        status: "PENDING",
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo lịch khám:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        department: true,
        doctor: true
      }
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đặt lịch:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
