/**
 * @file appointments.types.ts
 * @description Types cho module Đặt lịch khám (ghi mới vào Oracle)
 */

export interface CreateAppointmentDTO {
  patientName: string;
  patientPhone: string;
  patientDob?: string;
  patientGender?: string;
  departmentId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  symptoms?: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    patientName: string;
    patientPhone: string;
    status: string;
    createdAt: string;
  };
}
