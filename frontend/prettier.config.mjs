// 파일 목적: Prettier 코드 포맷터 설정
// 주요 기능: 일관된 코드 스타일 - 탭너비 2, 세미콜론, 큰따옴표
// 사용 방법: prettier --write . 명령으로 포맷팅

/** @type {import("prettier").Config} */
const config = {
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 100,
};

export default config;
