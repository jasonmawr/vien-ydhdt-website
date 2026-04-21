/**
 * @file vietinbank.service.ts
 * @description Xử lý giao tiếp với API sinh mã QR và IPN của VietinBank.
 * Tất cả thông tin nhạy cảm (keys, secrets) được đọc từ biến môi trường .env,
 * KHÔNG hardcode trong source code.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface CreatePaymentParams {
  amount: number;
  orderId: string;
  orderInfo: string;
}

export interface PaymentIPNPayload {
  orderId: string;
  amount: number;
  transactionId: string;
  status: string;
  signature: string;
}

const VIETINBANK_API_URL = "https://api.vietinbank.vn/vtb/public/vietqr/v1/generator";

/**
 * Sinh mã QR thanh toán thông qua VietinBank API.
 * Tất cả thông tin xác thực được đọc từ process.env (file .env).
 */
export async function generateVietinBankQR(params: CreatePaymentParams): Promise<string> {
  console.log("[Payment] Đang sinh mã QR VietinBank cho giao dịch:", params.orderId);

  const clientId = process.env.VIETINBANK_CLIENT_ID;
  const clientSecret = process.env.VIETINBANK_CLIENT_SECRET;
  const providerId = process.env.VIETINBANK_PROVIDER_ID;
  const merchantId = process.env.VIETINBANK_MERCHANT_ID;

  if (!clientId || !clientSecret) {
    console.warn("⚠ Thiếu VIETINBANK_CLIENT_ID hoặc VIETINBANK_CLIENT_SECRET trong .env! Sử dụng QR giả lập.");
    return buildFallbackQR(params);
  }

  try {
    const requestBody = {
      providerId: providerId,
      merchantId: merchantId,
      amount: params.amount,
      billNumber: params.orderId,
      description: params.orderInfo,
    };

    const response = await fetch(VIETINBANK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ibm-client-id": clientId,
        "x-ibm-client-secret": clientSecret,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json() as { qrCode?: string; [key: string]: any };

    if (!response.ok) {
      console.error("[Payment] Lỗi từ API VietinBank:", data);
      throw new Error("Lỗi gọi API ngân hàng");
    }

    if (data && data.qrCode) {
      return data.qrCode;
    }

    return buildFallbackQR(params);
  } catch (error) {
    console.error("[Payment] Exception khi gọi VietinBank API:", error);
    return buildFallbackQR(params);
  }
}

/**
 * Xác thực chữ ký IPN (Webhook) gửi từ VietinBank.
 * Sử dụng chứng chỉ PRD_VIETINBANK_NOTIFYTRANS_CERT.cer1 (nằm trong thư mục docs).
 */
export function verifyIPNSignature(payload: any, signature: string, certPath?: string): boolean {
  try {
    const dataToVerify = JSON.stringify(payload);

    // Đọc certificate từ file .cer1 trong thư mục docs (không hardcode)
    const defaultCertPath = path.resolve(
      __dirname, "../../../docs/VietQRConnection/PRD_VIETINBANK_NOTIFYTRANS_CERT.cer1"
    );
    const resolvedPath = certPath || process.env.VIETINBANK_CERT_PATH || defaultCertPath;

    if (!fs.existsSync(resolvedPath)) {
      console.warn("[Payment] Không tìm thấy file chứng chỉ VietinBank tại:", resolvedPath);
      // Trong môi trường Dev, chấp nhận mọi IPN
      return process.env.NODE_ENV !== "production";
    }

    const cert = fs.readFileSync(resolvedPath, "utf-8");
    const verify = crypto.createVerify("SHA256");
    verify.update(dataToVerify);
    verify.end();

    return verify.verify(cert, signature, "base64");
  } catch (error) {
    console.error("[Payment] Lỗi khi verify IPN signature:", error);
    // Trong môi trường Dev, chấp nhận
    return process.env.NODE_ENV !== "production";
  }
}

/**
 * Tạo QR giả lập (Fallback) khi chưa kết nối được VietinBank API thật.
 * Sử dụng VietQR.io public API để render QR image.
 */
function buildFallbackQR(params: CreatePaymentParams): string {
  const bankAccount = process.env.VIETINBANK_ACCOUNT || "113366668888";
  return `https://img.vietqr.io/image/vietinbank-${bankAccount}-compact2.jpg?amount=${params.amount}&addInfo=${encodeURIComponent(params.orderInfo)}&accountName=${encodeURIComponent("VIEN Y DUOC HOC DAN TOC")}`;
}
