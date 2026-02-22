// 파일 목적: ESLint 설정 - Next.js 권장 규칙 적용
// 주요 기능: next/core-web-vitals, TypeScript 지원
// 사용 방법: eslint . 명령으로 실행

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
