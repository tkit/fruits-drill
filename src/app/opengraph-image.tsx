import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ふるーつドリル - 小学生向け無料学習ドリル";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #ffe4e6, #fff1f2)", // rose-100 to rose-50
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Zen Maru Gothic", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {/* Apple Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="#e11d48" // rose-600
          stroke="#e11d48"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
      </div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: "#e11d48", // rose-600
          marginBottom: "10px",
        }}
      >
        ふるーつドリル
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#881337", // rose-900
          fontWeight: 500,
        }}
      >
        小学生向け無料学習ドリル
      </div>
    </div>,
    {
      ...size,
    }
  );
}
