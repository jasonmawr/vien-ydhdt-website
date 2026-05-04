import { Router, type Request, type Response } from "express";
import { verifyIPNSignature, generateVietinBankQR } from "./vietinbank.service";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter } from "events";
import { logger } from "../../shared/logger";

export const paymentRouter = Router();

// Khởi tạo Event Emitter cho SSE
export const paymentEvents = new EventEmitter();

// GET /api/payment/events/:orderId (SSE endpoint)
paymentRouter.get("/events/:orderId", (req: Request, res: Response) => {
  const { orderId } = req.params;
  
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const onPaymentSuccess = () => {
    res.write(`data: ${JSON.stringify({ status: "SUCCESS" })}\n\n`);
  };

  paymentEvents.once(`success_${orderId}`, onPaymentSuccess);

  req.on("close", () => {
    paymentEvents.off(`success_${orderId}`, onPaymentSuccess);
  });
});

// POST /api/payment/generate-qr
paymentRouter.post("/generate-qr", async (req: Request, res: Response) => {
  try {
    const { amount, orderInfo } = req.body;
    const orderId = `VTB-${Date.now()}-${uuidv4().substring(0, 4)}`;

    const qrCodeUrl = await generateVietinBankQR({
      amount: Number(amount) || 150000,
      orderId,
      orderInfo: orderInfo || `Thanh toan kham benh ${orderId}`,
    });

    res.json({ success: true, data: { qrCodeUrl, orderId } });
  } catch (err) {
    logger.error("[Payment] Generate QR Error:", err);
    res.status(500).json({ success: false, error: "Không thể tạo mã QR" });
  }
});

// POST /api/payment/webhook
paymentRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info("[Webhook] Nhận thông báo thanh toán từ VietinBank: %o", payload);

    const signature = typeof req.headers["x-signature"] === "string" ? req.headers["x-signature"] : "";
    const isValid = verifyIPNSignature(payload, signature, process.env.VIETINBANK_SECRET || "draft");
    if (!isValid) {
      res.status(400).json({ code: "01", message: "Sai chữ ký bảo mật" });
      return;
    }

    if (payload.status === "SUCCESS") {
      logger.info(`[Webhook] Thanh toán thành công giao dịch: ${payload.orderId}. Bắn SSE Event tới Frontend...`);
      paymentEvents.emit(`success_${payload.orderId}`);
    }

    res.status(200).json({ code: "00", message: "Confirm Success" });
  } catch (err) {
    logger.error("[Webhook] Lỗi xử lý:", err);
    res.status(500).json({ code: "99", message: "Lỗi nội bộ" });
  }
});
