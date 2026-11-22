import { ImageResponse } from "next/og";

export const alt = "SaaSFounder — Crée ton SaaS avec l'IA et encaisse tes premiers paiements";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The default share image (links on WhatsApp, X, LinkedIn…), built at deploy time. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090a",
          padding: "72px 80px",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          <span>SaaSFounder</span>
          <span style={{ color: "#33f4ef" }}>.fr</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Crée ton premier SaaS</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, color: "#7a7a83" }}>
            et encaisse tes premiers revenus.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>Idée · Site · Premiers clients — avec l&apos;IA, sans savoir coder</div>
      </div>
    ),
    size
  );
}
