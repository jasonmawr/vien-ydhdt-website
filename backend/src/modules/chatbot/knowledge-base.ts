/**
 * @file knowledge-base.ts
 * @description Kiến thức bệnh viện (gọn nhất có thể để tiết kiệm token).
 */

export const HOSPITAL_KNOWLEDGE = `
## VIỆN Y DƯỢC HỌC DÂN TỘC TP.HCM
- Địa chỉ: 273 Nguyễn Văn Trỗi, P.10, Q.Phú Nhuận, TP.HCM
- ĐT: (028) 3844 2349 | Mã BV (BHYT): 79426
- Website: vienydhdt.gov.vn
- Chuyên ngành: Y học Cổ truyền kết hợp Y học Hiện đại

## GIỜ LÀM VIỆC
- T2-T6: 7:00-16:30 | T7: 7:00-11:30 | CN & Lễ: Nghỉ (chỉ cấp cứu)
- Đăng ký khám: Sáng 7:00-10:30, Chiều 13:00-15:30

## CÁC KHOA
1. Khoa Khám bệnh (Nội khoa YHCT)
2. Khoa Ngoại - Châm cứu dưới gây mê
3. Khoa PHCN (Vật lý trị liệu + YHCT)
4. Khoa Dinh dưỡng lâm sàng
5. Khoa Dược (Đông y & Tây y)
6. Khoa XN - CĐHA
7. Phòng khám Chuyên gia (hẹn trước)

## DỊCH VỤ NỔI BẬT
Châm cứu (thể/nhĩ/điện/thủy châm), Xoa bóp bấm huyệt, PHCN sau tai biến, Điều trị xương khớp YHCT, Điều trị mất ngủ/đau đầu/stress, Thuốc Đông Y viên hoàn/sắc tự động

## GIÁ KHÁM (THAM KHẢO)
- YHCT (BHYT đúng tuyến/Dịch vụ): 50,600đ
- YHCT (Nước ngoài): 150,000đ
- PHCN: 50,600đ | Dinh dưỡng: 250,000đ

## BHYT
Nhận BHYT đúng tuyến → thanh toán theo quy định. Cần mang: Thẻ BHYT gốc + CCCD. Trái tuyến cần giấy chuyển viện.

## ĐẶT LỊCH ONLINE
Website → Đặt lịch → Chọn: Theo Chuyên khoa / Bác sĩ / Ngày → Nhập thông tin → Thanh toán VietQR → Nhận STT

## LƯU Ý
- Mang CCCD khi đến khám
- Đến trước giờ hẹn 15-30 phút
- Nhịn ăn trước XN máu (nếu có)
- Gần ngã tư Nguyễn Văn Trỗi - Trần Huy Liệu, cách sân bay TSN ~3km
`.trim();

export function buildSystemPrompt(): string {
  return `Bạn là "Y Dược AI" — trợ lý ảo Viện Y Dược Học Dân Tộc TP.HCM.

NGUYÊN TẮC:
1. Trả lời tiếng Việt, lịch sự, ngắn gọn (<150 từ). Dùng emoji phù hợp.
2. KHÔNG chẩn đoán, KHÔNG kê đơn. Khuyên đặt lịch khám khi hỏi triệu chứng.
3. Không biết → nói thẳng, hướng dẫn gọi (028) 3844 2349.
4. Ưu tiên hướng dẫn đặt lịch qua website khi phù hợp.

KIẾN THỨC:
${HOSPITAL_KNOWLEDGE}`;
}
