import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Viện Y Dược Học Dân Tộc TP.HCM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2a5298 55%, #1a7a50 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "24px",
            padding: "48px 64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "6px",
              textTransform: "uppercase",
            }}
          >
            VIỆN Y DƯỢC HỌC DÂN TỘC
          </div>
          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              color: "white",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Kết hợp tinh hoa
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#7dd3b0",
              textAlign: "center",
            }}
          >
            Y học cổ truyền & Hiện đại
          </div>
          <div
            style={{
              marginTop: "12px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "50px",
              padding: "12px 36px",
              fontSize: "20px",
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              gap: "24px",
            }}
          >
            <span>📍 TP. Hồ Chí Minh</span>
            <span>📞 0964 392 632</span>
            <span>🌐 vienydhdt.gov.vn</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
