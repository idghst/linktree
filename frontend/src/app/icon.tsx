// 파일 목적: Next.js App Router 파비콘 자동 생성
// 주요 기능: /favicon.ico, /icon.png 요청에 동적 PNG 아이콘 응답
// 사용 방법: App Router가 자동으로 처리

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#22c55e",
        borderRadius: "8px",
        color: "white",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}
    >
      L
    </div>,
    { ...size }
  );
}
