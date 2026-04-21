import { Router, type Request, type Response } from "express";
import { createHisPatient, createHisAdmission, pushToDoctorQueue } from "../his/his-integration.service";
import { verifyIPNSignature, generateVietinBankQR } from "./vietinbank.service";
import { v4 as uuidv4 } from "uuid";

export const paymentRouter = Router();

// POST /api/payment/generate-qr (Tạo mã QR thanh toán)
paymentRouter.post("/generate-qr", async (req: Request, res: Response) => {
  try {
    const { amount, orderInfo } = req.body;
    
    // Tạo orderId nội bộ (có thể lưu vào DB ở bước này trạng thái PENDING)
    const orderId = `VTB-${Date.now()}-${uuidv4().substring(0, 4)}`;

    const qrCodeUrl = await generateVietinBankQR({
      amount: Number(amount) || 150000,
      orderId,
      orderInfo: orderInfo || `Thanh toan kham benh ${orderId}`,
    });

    res.json({ success: true, data: { qrCodeUrl, orderId } });
  } catch (err) {
    console.error("[Payment] Generate QR Error:", err);
    res.status(500).json({ success: false, error: "Không thể tạo mã QR" });
  }
});

// POST /api/payment/webhook (IPN VietinBank gọi về khi KH quét mã thành công)
paymentRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    console.log("[Webhook] Nhận thông báo thanh toán từ VietinBank:", payload);

    // 1. Kiểm tra chữ ký an toàn
    const signature = typeof req.headers["x-signature"] === "string" ? req.headers["x-signature"] : "";
    const isValid = verifyIPNSignature(payload, signature, process.env.VIETINBANK_SECRET || "draft");
    if (!isValid) {
      res.status(400).json({ code: "01", message: "Sai chữ ký bảo mật" });
      return;
    }

    if (payload.status === "SUCCESS") {
      // 2. Lấy thông tin order từ DB (chờ xử lý)
      // Giả sử lấy được thông tin bệnh nhân từ orderId
      const fakePatientData = {
        fullName: "Bệnh nhân từ Webhook",
        phone: "090000000",
      };

      // 3. ĐẨY BỆNH NHÂN VÀO HIS THEO LUỒNG CHUẨN
      console.log(`[Webhook] Thanh toán thành công. Bắt đầu đẩy dữ liệu vào HIS...`);
      
      const patientId = await createHisPatient(fakePatientData);
      const admissionId = await createHisAdmission({
        patientId,
        departmentId: "KHOA_KHAM_BENH",
        amount: payload.amount
      });
      await pushToDoctorQueue(admissionId, "BS_CHIDINH");

      console.log(`[Webhook] Tích hợp HIS hoàn tất cho giao dịch: ${payload.orderId}`);

      // 4. Bắn Socket/SSE cho Frontend biết để cập nhật giao diện
      // TODO: Tích hợp Socket.io
    }

    res.status(200).json({ code: "00", message: "Confirm Success" });
  } catch (err) {
    console.error("[Webhook] Lỗi xử lý:", err);
    res.status(500).json({ code: "99", message: "Lỗi nội bộ" });
  }
});
