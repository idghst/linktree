// 파일 목적: PostCSS 설정 - Tailwind CSS 4 처리
// 주요 기능: @tailwindcss/postcss 플러그인 등록
// 사용 방법: Next.js 빌드 시 자동 적용

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
