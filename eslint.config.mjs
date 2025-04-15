import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": ["error", {
        groups: [
          "builtin",   // Node.js 내장 모듈
          "external",  // React, Next, 기타 외부 패키지
          "internal",  // @/components, @/lib 같은 절대경로 import
          ["parent", "sibling", "index"], // 상대 경로
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "next/**",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["react", "next"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      }],
    },
  },
  {
    files: [
      "**/*.test.ts", // .test.ts 파일
      "**/*.test.tsx", // .test.tsx 파일
      "src/tests/**/*", // src/tests 디렉토리 내 모든 파일 (필요시)
      "vitest/**/*", // vitest 설정 파일 등 (필요시)
      // 필요에 따라 다른 테스트 관련 파일 패턴 추가
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 'any' 타입 사용 허용
      // 테스트 환경에서만 완화하고 싶은 다른 규칙들도 여기에 추가 가능
      // 예: "@typescript-eslint/no-unsafe-assignment": "warn",
      // 예: "@typescript-eslint/no-non-null-assertion": "off",
    }
  },
];

export default eslintConfig;
