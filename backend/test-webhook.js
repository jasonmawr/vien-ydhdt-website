const crypto = require('crypto');
const http = require('http');

const orderId = process.argv[2];
if (!orderId) {
  console.log("❌ Lỗi: Cần truyền orderId.");
  console.log("👉 Ví dụ: node test-webhook.js VTB-1714781234-abcd");
  process.exit(1);
}

const payload = {
  orderId: orderId,
  status: "SUCCESS",
  amount: 150000,
  transactionId: "VTB-TEST-001"
};

const payloadString = JSON.stringify(payload);
// Sử dụng secret "draft" mặc định nếu trong file .env không set VIETINBANK_SECRET
const signature = crypto.createHmac('sha256', "draft").update(payloadString).digest('hex');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/payment/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': signature
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`✅ Đã gửi Webhook giả lập tới Backend. HTTP Status: ${res.statusCode}`);
    console.log(`📩 Response: ${data}`);
    console.log(`👉 Hãy quay lại trình duyệt xem Frontend đã tự nhảy sang màn hình chốt vé chưa nhé!`);
  });
});

req.on('error', (e) => {
  console.error(`❌ Lỗi kết nối tới Backend: ${e.message}`);
});

req.write(payloadString);
req.end();
