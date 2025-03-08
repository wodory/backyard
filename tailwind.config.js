/** @type {import('@tailwindcss/postcss').TailwindConfig} */
export default {
  mode: "css", // CSS 모드 사용
  inputPath: "./src/app/globals.css", // 입력 CSS 파일 경로
  plugins: [
    "tailwindcss-animate", // 애니메이션 플러그인 (이미 설치됨)
  ],
  font: {
    sans: ["Pretendard", "sans-serif"], // 기본 폰트 설정
  },
  colors: {
    // 기본 색상 설정
    primary: "oklch(0.208 0.042 265.755)",
    secondary: "oklch(0.968 0.007 247.896)",
    background: "oklch(1 0 0)",
    foreground: "oklch(0.129 0.042 264.695)",
  },
  colorMode: {
    default: "light", // 기본 컬러 모드
    selector: ".dark", // 다크 모드 선택자
  },
  rules: [
    // 커스텀 변형 규칙
    ["dark", "&:is(.dark *)"],
  ],
} 