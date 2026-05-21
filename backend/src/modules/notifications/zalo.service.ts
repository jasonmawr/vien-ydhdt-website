/**
 * @file zalo.service.ts
 * @description Module tích hợp gửi thông báo qua Zalo ZNS (Zalo Notification Service)
 * Dùng để gửi tin nhắn thông báo STT, Mã Phiếu cho bệnh nhân sau khi thanh toán thành công.
 */

interface ZNSTemplateData {
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  department_name: string;
  stt: number;
  appointment_id: string; // Mã phiếu (VD: WEB-12345)
}

/**
 * Hàm gửi tin nhắn ZNS cho bệnh nhân.
 * 
 * @param phone Số điện thoại bệnh nhân (sẽ được tự động convert sang đầu 84)
 * @param data Các thông tin cần điền vào Template ZNS
 * @returns boolean Báo hiệu gửi thành công hay thất bại
 */
export async function sendZaloNotification(phone: string, data: ZNSTemplateData): Promise<boolean> {
  try {
    // 1. Lấy cấu hình từ biến môi trường
    const ZALO_APP_ID = process.env.ZALO_APP_ID;
    const ZALO_ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN;
    const ZALO_TEMPLATE_ID = process.env.ZALO_TEMPLATE_ID;

    if (!ZALO_ACCESS_TOKEN || !ZALO_TEMPLATE_ID) {
      console.warn("[Zalo ZNS] Thiếu cấu hình Zalo trong file .env. Bỏ qua bước gửi tin nhắn.");
      return false;
    }

    // 2. Chuyển đổi SĐT về chuẩn quốc tế (Zalo yêu cầu 849xxx thay vì 09xxx)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "84" + formattedPhone.substring(1);
    }

    console.log(`[Zalo ZNS] Đang gửi thông báo STT (${data.stt}) cho SĐT: ${formattedPhone}`);

    // 3. Gọi API của Zalo ZNS
    const response = await fetch("https://business.openapi.zalo.me/message/template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ZALO_ACCESS_TOKEN
      },
      body: JSON.stringify({
        phone: formattedPhone,
        template_id: ZALO_TEMPLATE_ID,
        template_data: data
      })
    });

    const result = (await response.json()) as any;

    if (result.error === 0) {
      console.log(`[Zalo ZNS] Gửi tin nhắn thành công! Mã tracking: ${result.data?.msg_id}`);
      return true;
    } else {
      console.error("[Zalo ZNS] Gửi tin nhắn thất bại:", result.message, result);
      return false;
    }
  } catch (error) {
    console.error("[Zalo ZNS] Lỗi hệ thống khi gọi API Zalo:", error);
    return false;
  }
}
