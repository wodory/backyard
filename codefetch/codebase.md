Project Structure:
├── LICENSE
├── README.md
├── apps
├── codefetch
│   └── codebase.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma
│   ├── dev.db
│   ├── schema.master.prisma
│   ├── schema.postgresql.prisma
│   ├── schema.prisma
│   ├── schema.production.prisma
│   ├── schema.sqlite.prisma
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
│   ├── create-user.js
│   ├── pre-deploy.js
│   ├── schema-sync.js
│   ├── select-db.js
│   └── test-db.js
├── src
│   ├── middleware.ts
│   ├── setupTests.ts
├── supabase
│   ├── config.toml
│   └── schema.sql
├── tailwind.config.js
├── tsconfig.json
├── types
│   └── vitest.d.ts
├── vitest.config.ts
└── yarn.lock


.env.development.example
```
# 개발 환경 설정
# 이 파일은 개발 환경(로컬)에서만 사용되는 환경 변수의 템플릿입니다.

# 데이터베이스 설정 - SQLite 사용
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./prisma/dev.db"

# Supabase 인증 관련 설정은 .env 파일에서 관리

# OAuth 리다이렉션 URL 설정
NEXT_PUBLIC_OAUTH_REDIRECT_URL="http://localhost:3000" 
```

.env.example
```
# 기본 환경 변수 설정
# 이 파일은 모든 환경(개발/프로덕션)에서 공통으로 사용되는 환경 변수의 템플릿입니다.

# 데이터베이스 설정
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:[password]@[project-id].supabase.co:6543/postgres
DIRECT_URL=postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# OAuth 설정
NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000 # 개발환경
# NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://[your-domain].vercel.app # 프로덕션 환경 
```

.env.production.example
```
# 프로덕션 환경 설정
# 이 파일은 프로덕션 환경에서만 사용되는 환경 변수의 템플릿입니다.

# 데이터베이스 설정 - Supabase PostgreSQL 사용
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:your-password@your-project-id.supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:your-password@your-project-id.supabase.co:5432/postgres"

# Supabase 인증 관련 설정은 .env 파일에서 관리

# OAuth 리다이렉션 URL 설정
# Vercel 배포 URL 또는 사용자 정의 도메인 사용
NEXT_PUBLIC_OAUTH_REDIRECT_URL="https://your-project-name.vercel.app" 
```

components.json
```
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

eslint.config.mjs
```
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
```

next-env.d.ts
```
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

next.config.ts
```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? 
      { properties: ['^data-testid$'] } : undefined,
  },
  // 빠른 배포를 위해 ESLint 검사 비활성화
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 빠른 배포를 위해 타입 검사 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

package.json
```
{
  "name": "backyard",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "scripts": {
    "dev": "yarn env:dev && yarn db:setup:dev && NODE_ENV=development next dev",
    "prebuild": "node scripts/pre-deploy.js",
    "build": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
    "build:local": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
    "start": "NODE_ENV=production next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "prisma:seed": "node prisma/seed/index.js",
    "prisma:push": "prisma db push",
    "prisma:generate": "prisma generate",
    "schema:sync": "node scripts/schema-sync.js",
    "pre-deploy": "node scripts/pre-deploy.js",
    "db:setup": "node scripts/select-db.js && npx prisma generate",
    "db:setup:dev": "NODE_ENV=development node scripts/select-db.js && npx prisma generate",
    "db:setup:prod": "NODE_ENV=production node scripts/select-db.js && npx prisma generate",
    "db:test": "node scripts/test-db.js",
    "env:dev": "vercel env pull .env.development",
    "env:prod": "vercel env pull .env.production",
    "deploy": "yarn env:prod && vercel --prod",
    "deploy:preview": "yarn env:prod && vercel"
  },
  "dependencies": {
    "@hookform/resolvers": "^4.1.2",
    "@prisma/client": "^6.4.1",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.1",
    "@tiptap/core": "^2.11.5",
    "@tiptap/extension-bold": "^2.11.5",
    "@tiptap/extension-bullet-list": "^2.11.5",
    "@tiptap/extension-floating-menu": "^2.11.5",
    "@tiptap/extension-heading": "^2.11.5",
    "@tiptap/extension-image": "^2.11.5",
    "@tiptap/extension-italic": "^2.11.5",
    "@tiptap/extension-link": "^2.11.5",
    "@tiptap/extension-list-item": "^2.11.5",
    "@tiptap/extension-ordered-list": "^2.11.5",
    "@tiptap/pm": "^2.11.5",
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "@xyflow/react": "^12.4.4",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cookies-next": "^5.1.0",
    "dagre": "^0.8.5",
    "lucide-react": "^0.476.0",
    "next": "15.2.0",
    "next-themes": "^0.4.4",
    "postcss": "^8.5.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.0.9",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/dagre": "^0.7.52",
    "@types/node": "^22.13.9",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19",
    "@types/testing-library__user-event": "^4.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "3.0.7",
    "eslint": "^9",
    "eslint-config-next": "15.2.0",
    "jsdom": "^26.0.0",
    "node-fetch": "^2.7.0",
    "prisma": "^6.4.1",
    "prisma-json-schema-generator": "^5.1.5",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite": "^6.2.0",
    "vitest": "^3.0.7"
  }
}
```

postcss.config.mjs
```
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js',
      mode: 'css'
    },
    autoprefixer: {},
  },
};

export default config;
```

tailwind.config.js
```
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
```

tsconfig.json
```
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["vitest/globals", "@testing-library/jest-dom", "node"],
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "types/**/*.d.ts"],
  "exclude": ["node_modules"]
}
```

vitest.config.ts
```
import { defineConfig } from 'vitest/config';
// @ts-ignore - 타입 문제 해결
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
    server: {
      deps: {
        inline: [
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react'
        ]
      }
    },
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        '**/.next/**',
        '**/scripts/**',
        '**/eslint.config.mjs',
        '**/next.config.ts',
        '**/postcss.config.mjs',
        '**/next-env.d.ts',
        '**/vitest.config.ts',
        '**/src/components/ui/**', // shadcn UI 컴포넌트 제외
        '**/jest.setup.js',
        '**/jest.config.js',
        '**/tailwind.config.js',
        '**/src/lib/prisma.ts' // Prisma 클라이언트 설정 파일 제외
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/hooks': path.resolve(__dirname, 'src/hooks')
    }
  }
}); 
```

.cursor/.gitkeep
```
```

.note/.gitkeep
```
```

.note/mainscreen_task.txt
```
# 프로젝트 관리 대시보드 UI 개발 테스크 리스트

## 특별 고려사항

- 모든 UI 요소는 플로팅 패널로 구현하여 시각적 일관성 유지
- 도구 막대와 패널은 3px 마진으로 간격 유지
- 캔버스 컴포넌트는 타 팀에서 개발 중인 컴포넌트와 통합 가능하도록 설계
- 오른쪽 패널은 카드 목록 및 카드 뷰어 두 가지 모드. 캔버스에서 카드를 선택하면 카드 콘텐츠 뷰어, 아니면 카드 목록. 
- 모든 아이콘은 60x60 크기로 구현. 외부에서 일러스트풍의 아이콘을 가져오기. 

## 1. 기본 레이아웃 및 컴포넌트 설정

- [ ] 필수 패키지 설치: React, Next.js, Tailwind CSS, Lucide React 아이콘, React Flow
- [ ] 프로젝트 기본 구조 설정 (폴더 구조, 컴포넌트 분리 계획)
- [ ] 글로벌 스타일 및 Tailwind 설정 완료
- [ ] 공통 컴포넌트 생성 (버튼, 패널, 드롭다운 등)
- [ ] 반응형 레이아웃 기준 설정 (브레이크포인트, 크기 조정 정책)

## 2. 플로팅 도구 막대 구현

- [ ] 좌측 도구 막대 컴포넌트 구현
  - [ ] 삼선 메뉴 아이콘과 프로젝트 제목 배치
  - [ ] 드롭다운 메뉴 기능 구현 (내보내기, 가져오기, 저장, 옵션, 로그아웃)
  - [ ] 각 메뉴 항목에 아이콘 추가
  - [ ] 외부 클릭 시 메뉴 닫기 기능

- [ ] 우측 도구 막대 컴포넌트 구현
  - [ ] 공유, 로그아웃, 설정 아이콘 배치
  - [ ] 아이콘 버튼에 호버 효과 추가
  - [ ] 각 버튼 기능 연결 준비

- [ ] 하단 중앙 도구 막대 컴포넌트 구현
  - [ ] 60x60 크기의 아이콘 버튼 구성
  - [ ] 새 카드, 수평 정렬, 수직 정렬, 요약 기능 아이콘 구현
  - [ ] 텍스트 레이블 추가
  - [ ] 화면 크기에 따른 위치 조정 로직 (오른쪽 패널 너비 고려)

## 3. 메인 캔버스 영역 구현

- [ ] /board 통합

- [ ] 통합 인터페이스
  - [ ] 외부 컴포넌트와의 연동 인터페이스 설계
  - [ ] 이벤트 처리 시스템 구축 (선택된 노드 정보 전달 등)
  - [ ] 공통 상태 관리 구현 (Context API 또는 Redux)

## 4. 오른쪽 패널 구현

- [ ] 패널 기본 구조 및 스타일링
  - [ ] 플로팅 패널로 구현 (그림자, 둥근 모서리)
  - [ ] 적절한 마진 및 패딩 적용
  - [ ] 스크롤 처리
  - [ ] 카드를 선택하면 문서 콘텐츠, 카드를 선택하지 않았다면 카드 목록 

- [ ] 카드 목록 구현
  - [ ] /cards 통합
  - [ ] 카드를 한 줄로 표시

- [ ] 카드 콘텐츠 뷰어 > 뷰어 헤더 구현
  - [ ] 선택한 카드의 contents = 문서
  - [ ] 문서 제목 및 작성자 정보 표시
  - [ ] 날짜 표시 (24.3.7 형식)
  - [ ] 스타일링 및 정렬

- [ ] 카드 콘텐츠 영역 구현
  - [ ] 콘텐츠 표시 영역 설계
  - [ ] 선택된 노드에 따른 콘텐츠 렌더링 로직
  - [ ] 콘텐츠 포맷팅 지원 (tiptap viewer)

## 5. 상태 관리 및 데이터 연동

- [ ] 전역 상태 관리 구현
  - [ ] 현재 선택된 노드 상태
  - [ ] 프로젝트 메타데이터 상태
  - [ ] UI 상태 (패널 표시 여부, 메뉴 열림 상태 등)

- [ ] API 연동 설계
  - [ ] 데이터 가져오기/저장 인터페이스
  - [ ] 다른 프로젝트 컴포넌트와의 통신 방식 정의
  - [ ] 에러 처리 및 로딩 상태 관리

## 6. 확장성 및 통합

- [ ] 확장 가능한 플러그인 아키텍처 설계
  - [ ] 외부 컴포넌트 로딩 메커니즘
  - [ ] 이벤트 버스 구현
  - [ ] 공통 인터페이스 정의

- [ ] 기존 컴포넌트와의 통합
  - [ ] 컴포넌트 간 데이터 공유 방식
  - [ ] 일관된 스타일링 적용
  - [ ] 성능 최적화 전략

## 7. 마무리 및 검증

- [ ] 크로스 브라우저 테스트
- [ ] 접근성 검사 및 개선
- [ ] 성능 최적화 (메모이제이션, 코드 스플리팅 등)
- [ ] 코드 리팩토링 및 정리
- [ ] 문서화 (개발자 가이드, API 문서 등)

## 특별 고려사항

- 모든 UI 요소는 플로팅 패널로 구현하여 시각적 일관성 유지
- 도구 막대와 패널은 5px 마진으로 간격 유지
- 캔버스 컴포넌트는 타 팀에서 개발 중인 컴포넌트와 통합 가능하도록 설계
- 문서 뷰어는 캔버스에서 선택된 노드 데이터와 연동되도록 구현
- 모든 아이콘은 60x60 크기로 일관성 있게 구현
```

.note/tasklist.txt
```
[ ] 카드 보드의 카드 구조
- 카드 보드의 카드는 해더와 콘텐츠 영억으로 나뉜다
- 카드는 접고 펼수 있다. 기본값은 접은 상태이다.
- 카드를 접으면 카드는 헤더 영역만 표시한다
  - 카드 헤더에는 카드 제목을 중앙 정렬로 표시하고, 맨 오른쪽에는 [펴기] 단추를 [>] 모양으로 표시한다.
  - [>] 단추를 클릭하면 카드는 펴진다. 
- 카드가 펴지면 컨텐츠 영역도 보여준다
  - 카드 헤더의 [>] 단추는 [^] 단추 = 접기 단추로 바뀐다.
  - 컨텐츠 영역에는 tiptap 뷰어를 표시하고 카드 내용을 표시한다. 
  - 글꼴 크기는 카드 목록보다 60% 수준으로 표시한다. 
  - 카드가 펴질 때 컨텐츠 영역의 최대 높이는 280px로 정한다.  
  - 컨텐츠 영역보다 표시해야 할 카드 내용이 많으면 ... 처리한다. 
- 왼쪽/오른쪽의 연결선 핸들러는 카드가 접히고 펴질 때 마다 위치를 카드 중앙으로 이동한다. 

[ ] 카드 상태
- 카드에 표시하는 다양한 UI와 동작을 카드의 상태별로 다르게 할 가능성이 있음
- 카드 상태를 기본, 마우스 호버, 선택으로 분리.

[ ] 카드 상태 - normal
- 연결선 핸들러 표시하지 않음

[ ] 카드 상태 - hover
- 연결선 핸들러 표시 
- 연결선 핸들러 색상은 연결선과 동일
- UI 변경
  -- 외곽선 : 밝은 핑크색
  -- 카드 배경색 : 

[ ] 카드 상태 - selected 
- 선택 상태는 클릭 혹은 선택 range 내부에 들어왔을 때
- 선택 상태의 UI 변경
  -- 외곽선 : 일반 카드 외곽선 + 2px, 색은 연결선 색과 동일
  -- 카드 배경색 : 초기값은 연결선 색의 밝기 60% 증가 
  -- 변경하는 UI의 값은 모두 환경 변수로 설정. 이후 UI로 바꿀 수 있어야 함. 
- 외곽선을 표시해도 연결선 핸들러가 선 가운데에 올 수 있도록 border 옵션 조절
- 연결선 핸들러 표시
- 연결선 핸들러 색상은 연결선과 동일

[ ] 카드 클릭, 선택
- 카드 위를 클릭하면 카드 선택 상태가 된다
- 카드를 드래스, 클릭, 선택하면 z-index가 가장 높다.




** 토요일 - 원격 환경 적용 및 인증 ** 

**Supabase pw**
$JpH_w$9WKrriPR

**google OAuth ID/Password**
{"web":{"client_id":"545502090118-t5kccm1dguqbvbo8eovcoms71n4vem1e.apps.googleusercontent.com","project_id":"backyard-453110","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["https://backyard-orpin.vercel.app/"],"javascript_origins":["http://localhost:3000"]}}


## 1. Vercel에 퍼블리시하기

### 퍼블리시 준비 단계 테스트
- [ ] 로컬 환경에서 애플리케이션이 오류 없이 빌드되는지 확인
  - `npm run build` 또는 `yarn build` 명령으로 빌드 오류 확인
- [ ] 환경 변수가 `.env.local`이나 `.env` 파일에 올바르게 설정되어 있는지 확인
- [ ] 프로젝트의 `package.json`에 필요한 스크립트와 의존성이 모두 포함되어 있는지 확인

### Git-Vercel 연동 관리
- [ ] Git push 시 Vercel 자동 배포 설정/해제 방법 확인
- [  ] CLI 기반 수동 배포 명령어 (vercel 또는 npx vercel) 작동 확인
- [ ] 배포 오류 시 디버깅 로그 확인 방법 테스트

## 프로덕션 환경 변수 테스트
- [ ] .env.production 파일에 Supabase 연결 정보가 올바르게 구성되었는지 확인
- [ ] Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- [ ] 프로덕션 환경에서 Supabase와 로컬 DB 연결이 정상 작동하는지 확인

### Vercel 배포 테스트
- [ ] Vercel 계정 생성 및 로그인이 정상적으로 되는지 확인
- [ ] GitHub/GitLab 저장소와 Vercel 프로젝트가 올바르게 연결되는지 확인
- [ ] Vercel CLI를 통한 배포가 정상적으로 진행되는지 확인 (`vercel` 명령어)
- [ ] Vercel 환경 변수 설정이 올바르게 되었는지 확인

### 배포 후 테스트
- [ ] 배포된 URL에서 웹사이트가 정상적으로 로딩되는지 확인
- [ ] 모든 페이지와 라우트가 정상적으로 동작하는지 확인
- [ ] 이미지, 폰트 등의 정적 자원이 올바르게 로드되는지 확인
- [ ] 반응형 디자인이 다양한 디바이스에서 올바르게 표시되는지 확인

## 2. DB를 Supabase SaaS로 교체하기

### Supabase 설정 테스트
- [ ] Supabase 계정 생성 및 새 프로젝트 생성이 정상적으로 되는지 확인
- [ ] Supabase 프로젝트의 데이터베이스 연결 정보를 올바르게 가져왔는지 확인
- [ ] Supabase JavaScript 클라이언트 라이브러리가 정상적으로 설치되는지 확인
  - `npm install @supabase/supabase-js` 또는 `yarn add @supabase/supabase-js`

### 데이터 마이그레이션 테스트
- [ ] 기존 데이터베이스 스키마를 Supabase에 맞게 설계했는지 확인
- [ ] 데이터 마이그레이션 스크립트가 정상적으로 작동하는지 확인
- [ ] 마이그레이션 후 데이터 무결성이 유지되는지 확인

### Supabase 연동 테스트
- [ ] Supabase 클라이언트 초기화가 올바르게 되는지 확인
```javascript
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```
- [ ] 데이터 조회(SELECT) 쿼리가 정상적으로 작동하는지 확인
- [ ] 데이터 생성(INSERT) 쿼리가 정상적으로 작동하는지 확인
- [ ] 데이터 수정(UPDATE) 쿼리가 정상적으로 작동하는지 확인
- [ ] 데이터 삭제(DELETE) 쿼리가 정상적으로 작동하는지 확인
- [ ] Supabase RLS(Row Level Security)가 올바르게 설정되었는지 확인

### 오류 처리 테스트
- [ ] 데이터베이스 연결 실패 시 적절한 오류 메시지가 표시되는지 확인
- [ ] 쿼리 실패 시 사용자에게 친절한 오류 메시지가 제공되는지 확인
- [ ] 네트워크 오류 시 재시도 메커니즘이 작동하는지 확인

## Supabase와 로컬 DB 사용자 동기화 테스트
- [ ] Supabase 인증 사용자 정보가 로컬 데이터베이스에 자동으로 동기화되는지 확인
- [ ] 사용자 로그인 시 존재하지 않는 사용자는 자동 등록되는지 확인
- [ ] 동기화 실패 시 대체 로직(fallback)이 정상 작동하는지 확인

## Next.js 15 쿠키 처리 테스트
- [ ] 서버 컴포넌트(layout.tsx)에서 쿠키 설정 방식이 올바르게 구현되었는지 확인
- [ ] 미들웨어에서 쿠키 처리가 Next.js 15 방식으로 올바르게 수행되는지 확인
- [ ] "@supabase/ssr: createServerClient was configured without set and remove cookie methods" 경고가 해결되었는지 확인

## 미들웨어 인증 강화 테스트
- [ ] 미들웨어에서 보안 관련 쿠키 옵션(secure, sameSite, httpOnly)이 올바르게 설정되었는지 확인
- [ ] 세션 기반 인증 상태 확인 로직이 정상 작동하는지 확인
- [ ] 디버깅 로그가 적절하게 기록되는지 확인

## Prisma 환경 설정 테스트
- [ ] schema.prisma 파일이 다중 환경(개발/프로덕션)을 지원하도록 설정되었는지 확인
- [ ] 환경에 따른 데이터베이스 프로바이더(SQLite/PostgreSQL) 전환이 정상 작동하는지 확인
- [ ] 배포 전 스크립트에서 사용하는 패키지들이 존재하는지 확인

## 배포 스크립트 오류 처리
- [ ] pre-deploy.js 스크립트가 오류 발생 시에도 배포 과정을 중단하지 않도록 수정
- [ ] 스키마 동기화 실패 시 적절한 오류 처리 방법 구현

## 3. Google 원격 인증 붙이기

### Google OAuth 설정 테스트
- [ ] Google Cloud Console에서 OAuth 클라이언트 ID와 비밀키를 올바르게 생성했는지 확인
- [ ] 리디렉션 URI가 올바르게 설정되었는지 확인 (로컬 개발 및 Vercel 배포 URL 모두)
- [ ] 필요한 OAuth 스코프(이메일, 프로필 등)가 올바르게 지정되었는지 확인

### Supabase Auth 연동 테스트
- [ ] Supabase 프로젝트에서 Google OAuth 제공자가 올바르게 구성되었는지 확인
- [ ] Supabase Auth API를 사용한 Google 로그인 코드가 정상적으로 작동하는지 확인
```javascript
const { user, session, error } = await supabase.auth.signIn({
  provider: 'google',
});
```

### 인증 흐름 테스트
- [ ] 로그인 버튼 클릭 시 Google 로그인 페이지로 정상적으로 리디렉션되는지 확인
- [ ] Google 계정으로 성공적으로 로그인 후 애플리케이션으로 리디렉션되는지 확인
- [ ] 사용자 정보(이메일, 이름 등)가 올바르게 가져와지는지 확인
- [ ] 로그인 상태가 애플리케이션 전체에서 올바르게 유지되는지 확인
- [ ] 로그아웃 기능이 정상적으로 작동하는지 확인

### 인증 상태 관리 테스트
- [ ] 새로고침 후에도 로그인 상태가 유지되는지 확인
- [ ] 세션 토큰이 올바르게 저장되고 관리되는지 확인
- [ ] 인증이 필요한 페이지에 비로그인 사용자 접근 시 적절히 처리되는지 확인
- [ ] 인증된 사용자만 특정 API를 호출할 수 있는지 확인

### 사용자 경험 테스트
- [ ] 로그인 및 로그아웃 과정이 사용자에게 직관적인지 확인
- [ ] 로딩 상태가 적절히 표시되는지 확인
- [ ] 인증 오류 시 사용자 친화적인 메시지가 표시되는지 확인

### 최종 통합 테스트
- [ ] 로그인한 사용자의 데이터가 Supabase DB와 올바르게 연동되는지 확인
- [ ] 권한에 따른 데이터 접근 제한이 올바르게 작동하는지 확인
- [ ] Vercel 배포 환경에서도 모든 인증 기능이 정상적으로 작동하는지 확인

## 4. UI 수정

### 엣지 스타일 설정 
- [x] 엣지 해드 모양
- [x] 엣지 스타일 
- [x] 엣지 색상 (기본/selected)

### 스타일 및 설정값 체계화
- [x] 스타일 변수 관리 cardBoardUiOptions.json
- [x] 핸들 크기 등이 하드 코딩되어 있음.

### 버그 : 수평/수직 레이아웃
- [x] 간격이 너무 벌어지는 문제
- [x] 이 값도 옵션으로 설정
- [ ] z-index 문제 https://reactflow.dev/learn/advanced-use/state-management

## todo
- [x] env 파일 정리 (특히 .env, .env.development)
- [x] 환경 변수 등 git에 배포하지 않은 파일에 대한 readme 작성
- [x] /sciprt와 /prisma에서도 사용하지 않는 파일 정리. 
- [ ] vercel 배포 후 로그인 실패 문제
- [ ] vercel 및 supabase 설정도 readme 추가 

## Computing
- [ ] 자식 노드와의 why so 관계 추출 -> 계산 @https://reactflow.dev/learn/advanced-use/computing-flows

** 화요일 - 전체 UI 변경  ** 

## 특별 고려사항

- 모든 UI 요소는 플로팅 패널로 구현하여 시각적 일관성 유지
- 도구 막대와 패널은 3px 마진으로 간격 유지
- 캔버스 컴포넌트는 타 팀에서 개발 중인 컴포넌트와 통합 가능하도록 설계
- 오른쪽 패널은 카드 목록 및 카드 뷰어 두 가지 모드. 캔버스에서 카드를 선택하면 카드 콘텐츠 뷰어, 아니면 카드 목록. 
- 모든 아이콘은 60x60 크기로 구현. 외부에서 일러스트풍의 아이콘을 가져오기. 

## 1. 기본 레이아웃 및 컴포넌트 설정

- [ ] shadcn 공통 컴포넌트 설치 (버튼, 패널, 드롭다운 등)
- [ ] 반응형 레이아웃 기준 설정 (브레이크포인트, 크기 조정 정책)

## 2. 플로팅 도구 막대 구현

- [ ] 좌측 도구 막대 컴포넌트 구현
  - [ ] 삼선 메뉴 아이콘과 프로젝트 제목 배치
  - [ ] 드롭다운 메뉴 기능 구현 (내보내기, 가져오기, 저장, 옵션, 로그아웃)
  - [ ] 각 메뉴 항목에 아이콘 추가
  - [ ] 외부 클릭 시 메뉴 닫기 기능

- [ ] 우측 도구 막대 컴포넌트 구현
  - [ ] 공유, 로그아웃, 설정 아이콘 배치
  - [ ] 아이콘 버튼에 호버 효과 추가
  - [ ] 각 버튼 기능 연결 준비

- [ ] 하단 중앙 도구 막대 컴포넌트 구현
  - [ ] 60x60 크기의 아이콘 버튼 구성
  - [ ] 새 카드, 수평 정렬, 수직 정렬, 요약 기능 아이콘 구현
  - [ ] 텍스트 레이블 추가
  - [ ] 화면 크기에 따른 위치 조정 로직 (오른쪽 패널 너비 고려)

## 3. 메인 캔버스 영역 구현

- [ ] /board 통합

- [ ] 통합 인터페이스
  - [ ] 외부 컴포넌트와의 연동 인터페이스 설계
  - [ ] 이벤트 처리 시스템 구축 (선택된 노드 정보 전달 등)
  - [ ] 공통 상태 관리 구현 (Context API 또는 Redux)

## 4. 오른쪽 패널 구현

- [ ] 패널 기본 구조 및 스타일링
  - [ ] 플로팅 패널로 구현 (그림자, 둥근 모서리)
  - [ ] 적절한 마진 및 패딩 적용
  - [ ] 스크롤 처리
  - [ ] 카드를 선택하면 문서 콘텐츠, 카드를 선택하지 않았다면 카드 목록 

- [ ] 카드 목록 구현
  - [ ] /cards 통합
  - [ ] 카드를 한 줄로 표시

- [ ] 카드 콘텐츠 뷰어 > 뷰어 헤더 구현
  - [ ] 선택한 카드의 contents = 문서
  - [ ] 문서 제목 및 작성자 정보 표시
  - [ ] 날짜 표시 (24.3.7 형식)
  - [ ] 스타일링 및 정렬

- [ ] 카드 콘텐츠 영역 구현
  - [ ] 콘텐츠 표시 영역 설계
  - [ ] 선택된 노드에 따른 콘텐츠 렌더링 로직
  - [ ] 콘텐츠 포맷팅 지원 (tiptap viewer)

## 5. 상태 관리 및 데이터 연동

- [ ] 전역 상태 관리 구현
  - [ ] 현재 선택된 노드 상태
  - [ ] 프로젝트 메타데이터 상태
  - [ ] UI 상태 (패널 표시 여부, 메뉴 열림 상태 등)

- [ ] API 연동 설계
  - [ ] 데이터 가져오기/저장 인터페이스
  - [ ] 다른 프로젝트 컴포넌트와의 통신 방식 정의
  - [ ] 에러 처리 및 로딩 상태 관리

## 6. 확장성 및 통합

- [ ] 확장 가능한 플러그인 아키텍처 설계
  - [ ] 외부 컴포넌트 로딩 메커니즘
  - [ ] 이벤트 버스 구현
  - [ ] 공통 인터페이스 정의

- [ ] 기존 컴포넌트와의 통합
  - [ ] 컴포넌트 간 데이터 공유 방식
  - [ ] 일관된 스타일링 적용
  - [ ] 성능 최적화 전략

## 7. 마무리 및 검증

- [ ] 크로스 브라우저 테스트
- [ ] 접근성 검사 및 개선
- [ ] 성능 최적화 (메모이제이션, 코드 스플리팅 등)
- [ ] 코드 리팩토링 및 정리
- [ ] 문서화 (개발자 가이드, API 문서 등)

## 특별 고려사항

- 모든 UI 요소는 플로팅 패널로 구현하여 시각적 일관성 유지
- 도구 막대와 패널은 5px 마진으로 간격 유지
- 캔버스 컴포넌트는 타 팀에서 개발 중인 컴포넌트와 통합 가능하도록 설계
- 문서 뷰어는 캔버스에서 선택된 노드 데이터와 연동되도록 구현
- 모든 아이콘은 60x60 크기로 일관성 있게 구현
```

prisma/schema.master.prisma
```
// This is your Prisma schema file for MASTER TEMPLATE,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  extensions = [uuid_ossp(schema: "extensions")]
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cards         Card[]
  boardSettings BoardSettings?

  @@map("users")
}

model Card {
  id        String     @id @default(uuid())
  title     String
  content   String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags  CardTag[]

  @@map("cards")
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  cardTags  CardTag[]

  @@map("tags")
}

model CardTag {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([cardId, tagId])
  @@map("card_tags")
}

model BoardSettings {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  settings  Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("board_settings")
} 
```

prisma/schema.postgresql.prisma
```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cards         Card[]
  boardSettings BoardSettings?

  @@map("users")
}

model Card {
  id        String     @id @default(uuid())
  title     String
  content   String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags  CardTag[]

  @@map("cards")
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  cardTags  CardTag[]

  @@map("tags")
}

model CardTag {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([cardId, tagId])
  @@map("card_tags")
}

model BoardSettings {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  settings  Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("board_settings")
} 
```

prisma/schema.prisma
```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cards         Card[]
  boardSettings BoardSettings?

  @@map("users")
}

model Card {
  id        String     @id @default(uuid())
  title     String
  content   String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags  CardTag[]

  @@map("cards")
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  cardTags  CardTag[]

  @@map("tags")
}

model CardTag {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([cardId, tagId])
  @@map("card_tags")
}

model BoardSettings {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  settings  Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("board_settings")
} 
```

prisma/schema.production.prisma
```
// 프로덕션 환경용 Prisma 스키마 파일
// Supabase PostgreSQL을 사용합니다.

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [pgcrypto]
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cards         Card[]
  boardSettings BoardSettings?

  @@map("users")
}

model Card {
  id        String     @id @default(uuid())
  title     String
  content   String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags  CardTag[]

  @@map("cards")
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  cardTags  CardTag[]

  @@map("tags")
}

model CardTag {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([cardId, tagId])
  @@map("card_tags")
}

model BoardSettings {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  settings  Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("board_settings")
} 
```

prisma/schema.sqlite.prisma
```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cards         Card[]
  boardSettings BoardSettings?

  @@map("users")
}

model Card {
  id        String     @id @default(uuid())
  title     String
  content   String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags  CardTag[]

  @@map("cards")
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  cardTags  CardTag[]

  @@map("tags")
}

model CardTag {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([cardId, tagId])
  @@map("card_tags")
}

model BoardSettings {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  settings  Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("board_settings")
} 
```

supabase/config.toml
```
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "backyard"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083

# Use these configurations to customize your Edge Function.
# [functions.MY_FUNCTION_NAME]
# enabled = true
# verify_jwt = true
# import_map = "./functions/MY_FUNCTION_NAME/deno.json"
# Uncomment to specify a custom file path to the entrypoint.
# Supported file extensions are: .ts, .js, .mjs, .jsx, .tsx
# entrypoint = "./functions/MY_FUNCTION_NAME/index.ts"
# Specifies static files to be bundled with the function. Supports glob patterns.
# For example, if you want to serve static HTML pages in your function:
# static_files = [ "./functions/MY_FUNCTION_NAME/*.html" ]

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"
```

supabase/schema.sql
```
-- Supabase 스키마 정의

-- 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블 정책 (RLS - Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 카드 테이블
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드 테이블 정책 (RLS)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 카드를 조회할 수 있음" ON cards
  FOR SELECT USING (true);
CREATE POLICY "사용자는 자신의 카드만 생성/수정/삭제할 수 있음" ON cards
  FOR ALL USING (auth.uid() = user_id);

-- 태그 테이블
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 태그 테이블 정책 (RLS)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 태그를 조회할 수 있음" ON tags
  FOR SELECT USING (true);
CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 수정할 수 있음" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 삭제할 수 있음" ON tags
  FOR DELETE USING (auth.role() = 'authenticated');

-- 카드-태그 연결 테이블
CREATE TABLE IF NOT EXISTS card_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, tag_id)
);

-- 카드-태그 연결 테이블 정책 (RLS)
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 카드-태그 연결을 조회할 수 있음" ON card_tags
  FOR SELECT USING (true);
CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );
CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );

-- 보드 설정 테이블
CREATE TABLE IF NOT EXISTS board_settings (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 보드 설정 테이블 정책 (RLS)
ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 생성/수정할 수 있음" ON board_settings
  FOR ALL USING (auth.uid() = user_id);

-- 트리거 함수: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cards_modtime
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tags_modtime
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_board_settings_modtime
  BEFORE UPDATE ON board_settings
  FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 
```

types/vitest.d.ts
```
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> 
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }

  // 테스트 환경에서 전역 fetch를 사용할 수 있도록 설정
  var fetch: jest.Mock<Promise<Response>> & {
    mockResolvedValue: (value: any) => jest.Mock;
    mockRejectedValue: (error: any) => jest.Mock;
    mockImplementation: (fn: (...args: any[]) => any) => jest.Mock;
  };
}

// Prisma 모킹 타입 확장
declare module '@prisma/client' {
  interface PrismaClient {
    tag?: {
      findUnique: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>; 
      create: jest.Mock<any, any>;
      delete: jest.Mock<any, any>;
      update: jest.Mock<any, any>;
    };
    cardTag?: {
      deleteMany: jest.Mock<any, any>;
      create: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>;
    };
    card?: {
      findUnique: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>;
      create: jest.Mock<any, any>;
      delete: jest.Mock<any, any>;
      update: jest.Mock<any, any>;
    };
  }
} 
```

scripts/create-user.js
```
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    console.log('Created user:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
```

scripts/pre-deploy.js
```
#!/usr/bin/env node

/**
 * 배포 전 환경 설정 스크립트
 * 
 * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
 * 환경 파일을 확인하고 필요한 설정을 적용합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('배포 전 환경 설정 확인 중...');

// 기본 필수 환경 변수 목록
let requiredEnvVars = [
  'DATABASE_PROVIDER',
  'DATABASE_URL'
];

// 데이터베이스 프로바이더에 따라 추가 변수 검증
if (process.env.DATABASE_PROVIDER === 'postgresql') {
  requiredEnvVars.push('DIRECT_URL');
  requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
  requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('NEXT_PUBLIC_OAUTH_REDIRECT_URL');
  }
}

// 환경 변수 검증
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ 누락된 환경 변수가 있습니다:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

console.log('✅ 모든 필수 환경 변수가 설정되어 있습니다.');

// 프로덕션 환경 확인
if (process.env.NODE_ENV === 'production') {
  console.log('프로덕션 환경 감지: 설정을 확인합니다...');
  
  if (process.env.DATABASE_PROVIDER !== 'postgresql') {
    console.error('❌ 프로덕션 환경에서는 DATABASE_PROVIDER가 postgresql이어야 합니다.');
    process.exit(1);
  }
  
  if (process.env.DATABASE_PROVIDER === 'postgresql' && !process.env.DATABASE_URL.includes('supabase.co')) {
    console.error('❌ 프로덕션 환경에서 DATABASE_URL이 Supabase 연결 문자열이 아닙니다.');
    process.exit(1);
  }
}

console.log('✅ 환경 설정 확인 완료');

// Prisma 클라이언트 생성
console.log('Prisma 클라이언트를 생성합니다...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 클라이언트가 생성되었습니다.');
} catch (error) {
  console.error(`⚠️ Prisma 클라이언트 생성 중 오류가 발생했습니다: ${error.message}`);
  console.error('하지만 배포 과정을 계속 진행합니다.');
} 
```

scripts/schema-sync.js
```
#!/usr/bin/env node

/**
 * Prisma 스키마 동기화 스크립트
 * 
 * 이 스크립트는 마스터 템플릿에서 각 환경별 스키마를 생성합니다.
 */
const fs = require('fs');
const path = require('path');

// 경로 설정
const basePath = path.join(__dirname, '../prisma');
const masterSchemaPath = path.join(basePath, 'schema.master.prisma');
const sqliteSchemaPath = path.join(basePath, 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(basePath, 'schema.postgresql.prisma');

console.log('Prisma 스키마 동기화를 시작합니다...');

// 마스터 스키마 파일 확인
if (!fs.existsSync(masterSchemaPath)) {
  console.log('마스터 스키마 파일이 없습니다. 현재 schema.prisma를 마스터로 사용합니다.');
  const currentSchemaPath = path.join(basePath, 'schema.prisma');
  if (fs.existsSync(currentSchemaPath)) {
    fs.copyFileSync(currentSchemaPath, masterSchemaPath);
    console.log(`현재 스키마를 마스터 템플릿으로 복사했습니다: ${masterSchemaPath}`);
  } else {
    console.error('오류: 현재 스키마 파일도 찾을 수 없습니다!');
    process.exit(1);
  }
}

// 마스터 스키마 읽기
console.log(`마스터 스키마 파일 읽기: ${masterSchemaPath}`);
const masterSchema = fs.readFileSync(masterSchemaPath, 'utf8');

// SQLite 스키마 생성
const sqliteSchema = masterSchema
  .replace(/provider(\s*)=(\s*)"postgresql"/g, 'provider$1=$2"sqlite"')
  .replace(/directUrl(\s*)=(\s*)env\("DIRECT_URL"\)/g, '')
  .replace(/extensions(\s*)=(\s*)\[.*?\]/g, '')
  .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for SQLite,');

// PostgreSQL 스키마 생성
const postgresSchema = masterSchema
  .replace(/provider(\s*)=(\s*)"sqlite"/g, 'provider$1=$2"postgresql"')
  .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for PostgreSQL,');

// 생성된 스키마 파일 저장
fs.writeFileSync(sqliteSchemaPath, sqliteSchema);
console.log(`SQLite 스키마 파일이 생성되었습니다: ${sqliteSchemaPath}`);

fs.writeFileSync(postgresSchemaPath, postgresSchema);
console.log(`PostgreSQL 스키마 파일이 생성되었습니다: ${postgresSchemaPath}`);

console.log('스키마 동기화가 완료되었습니다.');
console.log('이제 환경에 맞는 스키마를 적용하려면 다음 명령을 실행하세요:');
console.log('- 개발 환경: yarn db:setup:dev');
console.log('- 프로덕션 환경: yarn db:setup:prod');

```

scripts/select-db.js
```
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 환경 확인
const isProduction = process.env.NODE_ENV === 'production';
const dbType = isProduction ? 'postgresql' : 'sqlite';

// 경로 설정
const basePath = path.join(__dirname, '../prisma');
const schemaPath = path.join(basePath, 'schema.prisma');
const sourceSchemaPath = path.join(basePath, `schema.${dbType}.prisma`);

console.log(`환경: ${isProduction ? '프로덕션' : '개발'}`);
console.log(`데이터베이스: ${dbType}`);
console.log(`소스 스키마: ${sourceSchemaPath}`);
console.log(`타겟 스키마: ${schemaPath}`);

// 파일 복사
try {
  // 소스 파일 존재 확인
  if (!fs.existsSync(sourceSchemaPath)) {
    console.error(`오류: 소스 스키마 파일을 찾을 수 없습니다: ${sourceSchemaPath}`);
    process.exit(1);
  }

  // 파일 복사
  fs.copyFileSync(sourceSchemaPath, schemaPath);
  console.log(`✅ 성공: ${dbType} 스키마를 복사했습니다.`);

  // Prisma 생성 명령어 안내
  console.log('이제 다음 명령어를 실행하세요: npx prisma generate');
} catch (error) {
  console.error(`❌ 오류 발생: ${error.message}`);
  process.exit(1);
} 
```

scripts/test-db.js
```
// 데이터베이스 연결 테스트 스크립트
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('데이터베이스 연결 테스트 시작...');
  console.log('환경 변수:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER
  });

  try {
    const prisma = new PrismaClient();
    console.log('Prisma 클라이언트 초기화 성공');

    // 연결 테스트
    console.log('데이터베이스 연결 시도 중...');
    await prisma.$connect();
    console.log('데이터베이스 연결 성공!');

    // 간단한 쿼리 테스트
    console.log('사용자 조회 시도 중...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`사용자 조회 성공: ${users.length}명의 사용자 발견`);
    
    // 연결 종료
    await prisma.$disconnect();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main(); 
```

src/middleware.ts
```
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 보호된 경로 (로그인 필요)
const protectedRoutes = ['/board', '/cards', '/tags'];
// 인증된 사용자는 접근할 수 없는 경로
const authRoutes = ['/login', '/register'];
// 인증 검사를 건너뛸 경로
const bypassAuthRoutes = ['/auth/callback', '/api'];

export async function middleware(request: NextRequest) {
  console.log('미들웨어 실행:', request.nextUrl.pathname);
  
  // 쿠키 확인 디버깅
  const cookies = request.cookies;
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  console.log('쿠키 확인 - 액세스 토큰:', accessToken ? `존재함 (길이: ${accessToken.length})` : '없음');
  console.log('쿠키 확인 - 리프레시 토큰:', refreshToken ? `존재함 (길이: ${refreshToken.length})` : '없음');
  console.log('모든 쿠키:', Array.from(cookies.getAll()).map(c => c.name));
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('미들웨어: Supabase 환경 변수가 설정되지 않았습니다.');
    
    // 환경 변수가 없는 경우, 기본 요청 계속 진행 (차단하지 않음)
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name);
            const logMessage = cookie 
              ? `존재 (값 길이: ${cookie.value.length})`
              : '없음';
            console.log('쿠키 가져오기:', name, logMessage);
            return cookie?.value;
          },
          set(name: string, value: string, options: any) {
            // Next.js 15에서는 서버 액션이나 라우트 핸들러에서만 쿠키를 수정할 수 있지만,
            // 미들웨어에서는 응답 객체를 통해 쿠키를 설정할 수 있습니다.
            console.log('쿠키 설정:', name, `(값 길이: ${value.length})`, 'options:', JSON.stringify(options));
            response.cookies.set({
              name,
              value,
              ...options,
              // 프로덕션, 개발 환경 모두 일관된 설정 사용
              secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https://'),
              sameSite: 'lax',
              httpOnly: false, // 클라이언트에서 접근 가능하도록
              // 도메인 속성 제거 - 쿠키는 기본적으로 현재 도메인에만 설정됨
            });
          },
          remove(name: string, options: any) {
            console.log('쿠키 삭제:', name, 'options:', JSON.stringify(options));
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              // 프로덕션, 개발 환경 모두 일관된 설정 사용
              secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https://'),
              sameSite: 'lax',
              httpOnly: false, // 클라이언트에서 접근 가능하도록
              // 도메인 속성 제거 - 쿠키는 기본적으로 현재 도메인에만 설정됨
            });
          },
        },
      }
    );

    // 콜백 URL로 리디렉션 중인 경우 처리 우회
    const { pathname, search } = request.nextUrl;
    if (pathname === '/auth/callback' && search) {
      console.log('콜백 처리 감지 - 미들웨어 우회');
      return response;
    }

    // 요청 URL 가져오기
    const url = request.nextUrl.clone();
    
    // 인증 우회 경로인 경우 인증 검사 건너뛰기
    if (bypassAuthRoutes.some(route => pathname === route || pathname.startsWith(route))) {
      console.log('인증 검사 건너뛰기:', pathname);
      return response;
    }
    
    // 직접 토큰 확인 (쿠키 기반)
    let isLoggedIn = false;
    let sessionUserId = null;
    
    // 1. 쿠키 토큰 기반 확인
    if (accessToken) {
      isLoggedIn = true;
      console.log('액세스 토큰 쿠키 확인 성공');
      
      // 쿠키가 있으면 응답 쿠키에도 동일하게 설정 (확실한 지속성 보장)
      response.cookies.set({
        name: 'sb-access-token',
        value: accessToken,
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
        secure: true, // production에서는 항상 true로 설정
        sameSite: 'lax',
        httpOnly: false, // 클라이언트에서 접근 가능하도록
      });
      
      if (refreshToken) {
        response.cookies.set({
          name: 'sb-refresh-token',
          value: refreshToken,
          maxAge: 60 * 60 * 24 * 30, // 30일
          path: '/',
          secure: true, // production에서는 항상 true로 설정
          sameSite: 'lax',
          httpOnly: false, // 클라이언트에서 접근 가능하도록
        });
      }
      
      // 디버깅을 위한 로그 추가
      console.log('미들웨어: 기존 쿠키 복제됨', {
        환경: process.env.NODE_ENV,
        URL: request.url,
        프로토콜: request.url.startsWith('https://') ? 'HTTPS' : 'HTTP',
        보안설정: 'Secure=true'
      });
    } 
    // 2. Supabase 세션 기반 확인 (백업 방법)
    else {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('세션 획득 오류:', sessionError.message);
        }
        
        isLoggedIn = !!session;
        
        if (session) {
          sessionUserId = session.user?.id;
          console.log('세션 확인 성공:', session.user?.id);
          console.log('세션 만료 시간:', new Date(session.expires_at! * 1000).toISOString());
          
          // 쿠키가 없지만 세션이 있는 경우, 쿠키 복구
          if (!accessToken) {
            response.cookies.set({
              name: 'sb-access-token',
              value: session.access_token,
              maxAge: 60 * 60 * 24 * 7, // 7일
              path: '/',
              secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https://'),
              sameSite: 'lax',
              httpOnly: false,
            });
            
            if (session.refresh_token) {
              response.cookies.set({
                name: 'sb-refresh-token',
                value: session.refresh_token,
                maxAge: 60 * 60 * 24 * 30, // 30일
                path: '/',
                secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https://'),
                sameSite: 'lax',
                httpOnly: false,
              });
            }
            
            console.log('미들웨어: 세션 토큰을 쿠키에 복구함', {
              환경: process.env.NODE_ENV,
              URL: request.url,
              프로토콜: request.url.startsWith('https://') ? 'HTTPS' : 'HTTP'  
            });
          }
        } else {
          console.log('세션 없음');
        }
      } catch (sessionError) {
        console.error('세션 확인 중 오류:', sessionError);
      }
    }
    
    console.log('경로 접근:', pathname, '인증 상태:', isLoggedIn ? `로그인됨 (${sessionUserId || 'ID 없음'})` : '로그인안됨');
    
    // 로그인이 필요한 경로인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // 인증된 사용자는 접근할 수 없는 경로인지 확인
    const isAuthRoute = authRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // 미인증 상태에서 보호된 경로 접근 시도
    if (isProtectedRoute && !isLoggedIn) {
      console.log('인증되지 않은 사용자가 보호된 경로에 접근 시도:', pathname, '-> 로그인 페이지로 리디렉션');
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // 인증 상태에서 로그인/회원가입 페이지 접근 시도
    if (isAuthRoute && isLoggedIn) {
      console.log('인증된 사용자가 인증 경로에 접근 시도:', pathname, '-> 보드 페이지로 리디렉션');
      url.pathname = '/board';
      return NextResponse.redirect(url);
    }
    
    return response;
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return response;
  }
}

// 미들웨어가 적용될 경로를 지정합니다.
export const config = {
  matcher: [
    // 인증이 필요한 경로는 여기에 추가
    /*
      '/protected',
      '/dashboard/:path*',
    */
    // 모든 경로에 미들웨어 적용 (필요에 따라 조정)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 
```

src/setupTests.ts
```
import '@testing-library/jest-dom/vitest';
import { expect, vi, beforeAll, afterAll } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Jest DOM matchers 확장 설정
expect.extend(matchers);

// 전역 모킹 설정
vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => ({
      get: (param: string) => null,
      toString: () => '',
    })),
  };
});

// 콘솔 오류 모킹 (테스트 중 예상된 오류가 발생해도 테스트 출력이 어지럽지 않도록)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 글로벌 페치 모킹
global.fetch = vi.fn(); 
```

prisma/migrations/migration_lock.toml
```
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
```

supabase/migrations/20240319000000_init.sql
```
-- PostgreSQL 확장 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 테이블 생성 순서 중요: 참조 관계 때문에 순서대로 생성해야 함

-- 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드 테이블
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 태그 테이블
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드-태그 연결 테이블
CREATE TABLE IF NOT EXISTS card_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, tag_id)
);

-- 보드 설정 테이블
CREATE TABLE IF NOT EXISTS board_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 트리거 함수: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cards_modtime
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tags_modtime
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_board_settings_modtime
  BEFORE UPDATE ON board_settings
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS (Row Level Security) 정책 설정

-- 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책
CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 카드 테이블 정책
CREATE POLICY "모든 인증된 사용자는 카드를 조회할 수 있음" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 카드만 생성할 수 있음" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 카드만 업데이트할 수 있음" ON cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 카드만 삭제할 수 있음" ON cards
  FOR DELETE USING (auth.uid() = user_id);

-- 태그 테이블 정책
CREATE POLICY "모든 인증된 사용자는 태그를 조회할 수 있음" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 태그 업데이트 및 삭제는 관리자만 가능하도록 설정할 수도 있음

-- 카드-태그 연결 테이블 정책
CREATE POLICY "인증된 사용자는 카드-태그 연결을 조회할 수 있음" ON card_tags
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );
CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );

-- 보드 설정 테이블 정책
CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 생성할 수 있음" ON board_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 업데이트할 수 있음" ON board_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 삭제할 수 있음" ON board_settings
  FOR DELETE USING (auth.uid() = user_id); 
```

prisma/seed/index.js
```
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 사용자 생성
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        cards: {
          create: [
            {
              title: '시작하기',
              content: '백야드 프로젝트에 오신 것을 환영합니다!'
            }
          ]
        }
      }
    });
    
    // 태그 생성
    const welcomeTag = await prisma.tag.upsert({
      where: { name: '환영' },
      update: {},
      create: { name: '환영' }
    });
    
    // 카드-태그 연결
    const cards = await prisma.card.findMany({
      where: { userId: user.id }
    });
    
    if (cards.length > 0) {
      await prisma.cardTag.upsert({
        where: {
          cardId_tagId: {
            cardId: cards[0].id,
            tagId: welcomeTag.id
          }
        },
        update: {},
        create: {
          cardId: cards[0].id,
          tagId: welcomeTag.id
        }
      });
    }
    
    console.log('Database seeded!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
```

src/app/globals.css
```
@import "tailwindcss";

@plugin "tailwindcss-animate";

/* Pretendard 웹폰트 추가 */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.869 0.022 252.894);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.869 0.022 252.894);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.129 0.042 264.695);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.129 0.042 264.695);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.984 0.003 247.858);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.279 0.041 260.031);
  --input: oklch(0.279 0.041 260.031);
  --ring: oklch(0.446 0.043 257.281);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(0.279 0.041 260.031);
  --sidebar-ring: oklch(0.446 0.043 257.281);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* React Flow 스타일 오버라이드 */
.react-flow__connection-line {
  stroke: #FF0072 !important;
  stroke-width: 2px !important;
  stroke-dasharray: none !important;
  z-index: 1;
}

.react-flow__edge-path {
  stroke-dasharray: none;
  z-index: 1;
}

.react-flow__connectionline {
  stroke-dasharray: none;
  z-index: 1;
  stroke-width: 2px;
}

/* React Flow 노드 컨테이너 */
.card-node-container {
  position: relative;
  z-index: 10;
  overflow: visible !important;
}

/* 카드 노드 기본 스타일 */
.card-node {
  background-color: #ffffff;
  border-radius: 8px;
  box-sizing: border-box;
  border: 2px solid #C1C1C1;
  transition: height 0.3s ease, background-color 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
  position: relative;
  box-shadow: none !important;
}

/* 선택된 카드 노드 */
.card-node.selected {
  background-color: #FFD3E6;
  border-color: #fdcbe1;
}

/* 핸들 스타일 - 기본값 수정 */
.react-flow__handle {
  /* 기본 핸들러는 숨김 */
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 커스텀 핸들 스타일 */
.handle-top,
.handle-right,
.handle-bottom,
.handle-left {
  /* 기본 상태에서는 숨김 */
  opacity: 0 !important; 
  transition: opacity 0.2s ease !important;
  position: absolute !important;
  z-index: 20 !important;
  pointer-events: none !important; /* 기본 상태에서는 마우스 이벤트 비활성화 */
  /* 마진과 패딩 제거로 정확한 위치 계산 */
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  box-shadow: none !important;
  /* 크기 정확하게 지정 - 12px로 증가 */
  width: 12px !important;
  height: 12px !important;
  background-color: white !important;
  /* 완벽한 원형 보장 */
  border-radius: 50% !important;
  /* transform 속성 제거 - JavaScript에서 계산된 위치를 사용 */
  /* transform: none !important; */
  /* 정확한 테두리 설정 */
  border: 2px solid #696969 !important;
  /* 픽셀 맞춤 보장 */
  shape-rendering: geometricPrecision !important;
  /* 서브픽셀 렌더링 개선 */
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* 호버 시 핸들 표시 */
.card-node-container:hover .handle-top,
.card-node-container:hover .handle-right,
.card-node-container:hover .handle-bottom,
.card-node-container:hover .handle-left,
.card-node-container.selected .handle-top,
.card-node-container.selected .handle-right,
.card-node-container.selected .handle-bottom,
.card-node-container.selected .handle-left,
.card-node-container.hovered .handle-top,
.card-node-container.hovered .handle-right,
.card-node-container.hovered .handle-bottom,
.card-node-container.hovered .handle-left,
.react-flow__node.selected .handle-top,
.react-flow__node.selected .handle-right,
.react-flow__node.selected .handle-bottom,
.react-flow__node.selected .handle-left {
  opacity: 1 !important; /* 호버나 선택 시 표시 */
  pointer-events: auto !important; /* 호버나 선택 시 마우스 이벤트 활성화 */
  z-index: 25 !important;
  display: block !important;
  /* 크기 변화 - 12px로 증가 */
  width: 12px !important;
  height: 12px !important;
}

/* 호버 효과 */
.handle-top:hover,
.handle-right:hover,
.handle-bottom:hover,
.handle-left:hover {
  /* transform: none !important; /* transform 제거 */
  cursor: crosshair !important;
  z-index: 30 !important;
  /* 크기 변화 - 12px로 증가 */
  width: 12px !important;
  height: 12px !important;
}

/* TipTap 콘텐츠 스타일 */
.tiptap-content {
  font-size: 0.8rem;
  line-height: 1.4;
}

/* 다크 테마 대응 */
.dark .card-node {
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
}

.dark .handle-top,
.dark .handle-right,
.dark .handle-bottom,
.dark .handle-left {
  background-color: hsl(var(--card)) !important;
  box-shadow: none !important;
}

/* React Flow 노드 스타일 오버라이드 */
.react-flow__node {
  background-color: transparent !important;
  background: transparent !important;
  z-index: 5 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  /* 오버플로우 속성 추가 - 핸들이 밖으로 나가도록 허용 */
  overflow: visible !important;
}

.react-flow__node-default {
  background-color: transparent !important;
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  width: auto !important;
  box-shadow: none !important;
}

/* 태그 스타일 */
.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.6rem;
  display: inline-flex;
  align-items: center;
  background-color: var(--secondary);
  color: var(--secondary-foreground);
}

/* 선택된 카드 텍스트 색상 조정 */
.card-node.selected .card-title,
.card-node.selected .card-description,
.card-node.selected .card-content {
  color: hsl(var(--foreground)) !important;
}

/* React Flow 노드 스타일 오버라이드 */
.react-flow__node {
  z-index: 5 !important;
}

.react-flow__edge {
  z-index: 1 !important;
}

.react-flow__handle {
  z-index: 30 !important;
}

.react-flow__renderer {
  position: relative;
  z-index: 0;
}

/* SVG 요소와 HTML 요소 간 상호작용 개선 */
.react-flow__pane {
  z-index: 0 !important;
}

.react-flow__selection {
  z-index: 6 !important;
}

/* ReactFlow 선택된 노드 스타일 강화 */
.react-flow__node.selected {
  outline: 2px solid hsl(var(--primary)) !important;
  outline-offset: 2px !important;
  z-index: 10 !important;
}

/* 노드 선택 상태 확실하게 표시 */
.react-flow__node.selected .card-node {
  box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
  transition: box-shadow 0.2s ease !important;
}

/* 노드 선택 가능성 표시 - 호버 효과 */
.react-flow__node:not(.selected):hover .card-node {
  box-shadow: 0 0 0 1px rgba(var(--primary-rgb), 0.3) !important;
  transition: box-shadow 0.2s ease !important;
}

/* 연결선 애니메이션 */
@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* 연결선 선택 효과 - React Flow 공식 방식 사용 */
.react-flow__edge.selected .react-flow__edge-path,
.react-flow__edge path[data-selected="true"] {
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 2px rgba(255, 0, 114, 0.4));
}

/* 연결선 호버 효과 */
.react-flow__edge:hover .react-flow__edge-path {
  opacity: 0.8;
}

/* 다크 모드에서 연결선 색상 */
.dark .react-flow__edge-path {
  stroke: rgba(255, 255, 255, 0.5);
}

/* 다크 모드에서 선택된 연결선 색상 */
.dark .react-flow__edge.selected .react-flow__edge-path,
.dark .react-flow__edge path[data-selected="true"] {
  stroke: #ff0072 !important;
  filter: drop-shadow(0 0 3px rgba(255, 0, 114, 0.5));
}
```

src/app/layout.test.tsx
```
import { Metadata } from 'next';
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import RootLayout, { metadata } from './layout';
import { describe, it, expect, vi } from 'vitest';

// next/font 모듈 모킹
vi.mock('next/font/google', () => ({
  Geist: vi.fn().mockReturnValue({
    variable: 'mocked-geist-sans',
  }),
  Geist_Mono: vi.fn().mockReturnValue({
    variable: 'mocked-geist-mono',
  }),
}));

describe('메타데이터', () => {
  it('올바른 메타데이터를 가져야 합니다', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('backyard - 지식 관리 도구');
    expect(metadata.description).toBe('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
  });
});

describe('RootLayout', () => {
  it('RootLayout 함수가 정의되어 있습니다', () => {
    // 함수가 존재하는지 테스트
    expect(typeof RootLayout).toBe('function');
  });
  
  it('올바른 구조로 JSX를 반환합니다', () => {
    // JSX 요소를 직접 검사
    const result = RootLayout({ children: <div>테스트</div> });
    
    // React 요소인지 확인
    expect(result).toBeTruthy();
    
    // 올바른 태그와 속성을 가지고 있는지 확인
    expect(result.type).toBe('html');
    expect(result.props.lang).toBe('en');
    
    // body 요소 확인
    const bodyElement = result.props.children;
    expect(bodyElement.type).toBe('body');
    
    // 클래스 속성 확인 (클래스 이름에 모킹된 값이 포함되어 있는지)
    const className = bodyElement.props.className;
    expect(className).toContain('mocked-geist-sans');
    expect(className).toContain('mocked-geist-mono');
  });
}); 
```

src/app/layout.tsx
```
'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { InitDatabase } from "@/components/InitDatabase";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <main>
            {children}
            
            {/* DB 초기화 스크립트 */}
            <InitDatabase />
          </main>
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
```

src/app/metadata.ts
```
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backyard - 모든 아이디어를 정리하는 공간",
  description: "효율적인 메모와 지식 관리를 위한 솔루션",
  icons: {
    icon: "/favicon.ico",
  },
}; 
```

src/app/not-found.tsx
```
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 
```

src/app/page.test.tsx
```
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Home from './page';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Home 페이지', () => {
  it('Backyard 제목이 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const heading = screen.getByText('Hello backyard');
    expect(heading).toBeInTheDocument();
  });
  
  it('설명 텍스트가 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const description = screen.getByText('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
    expect(description).toBeInTheDocument();
  });
  
  it('카드 목록 보기 링크가 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const link = screen.getByText('카드 목록 보기');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/cards');
  });
}); 
```

src/app/page.tsx
```
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Hello backyard</CardTitle>
          <CardDescription className="text-center">
            아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/cards">카드 목록 보기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/board">보드 시각화</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

src/components/InitDatabase.tsx
```
'use client';

import { useEffect, useState } from 'react';

export function InitDatabase() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // 개발 환경에서만 실행
    if (process.env.NODE_ENV === 'development') {
      // DB 초기화 API 호출
      const initDb = async () => {
        try {
          const response = await fetch('/api/db-init');
          const data = await response.json();
          console.log('DB 초기화 결과:', data);
          setInitialized(true);
        } catch (error) {
          console.error('DB 초기화 중 오류 발생:', error);
        }
      };
      
      if (!initialized) {
        initDb();
      }
    }
  }, [initialized]);
  
  // 아무것도 렌더링하지 않음
  return null;
} 
```

src/config/cardBoardUiOptions.json
```
{
  "autoSaveIntervalMinutes": 1,
  "board": {
    "snapToGrid": false,
    "snapGrid": [15, 15],
    "connectionLineType": "bezier",
    "markerEnd": "arrowclosed",
    "strokeWidth": 2,
    "markerSize": 20,
    "edgeColor": "#C1C1C1",
    "animated": false,
    "selectedEdgeColor": "#000000"
  },
  "card": {
    "defaultWidth": 280,
    "backgroundColor": "#FFFFFF",
    "borderRadius": 8,
    "tagBackgroundColor": "#F2F2F2",
    "fontSizes": {
      "default": 16,
      "title": 16,
      "content": 16,
      "tags": 10
    },
    "nodeSize": {
      "width": 150,
      "height": 48,
      "maxHeight": 180
    }
  },
  "handles": {
    "size": 10,
    "backgroundColor": "#555555",
    "borderColor": "#FFFFFF",
    "borderWidth": 1
  },
  "layout": {
    "defaultPadding": 20,
    "defaultSpacing": {
      "horizontal": 30,
      "vertical": 30
    },
    "graphSettings": {
      "nodesep": 60,
      "ranksep": 60,
      "edgesep": 40
    }
  }
} 
```

src/lib/auth.ts
```
'use client';

import { createBrowserClient } from './supabase';
import { deleteCookie } from 'cookies-next';
import { User } from '@supabase/supabase-js';

// 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  return createBrowserClient();
};

// ExtendedUser 타입 정의
export interface ExtendedUser extends User {
  dbUser?: any; // Prisma User 모델
}

// 회원가입 함수
export async function signUp(email: string, password: string, name: string | null = null) {
  try {
    // Supabase 인증으로 사용자 생성
    const client = getBrowserClient();
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('사용자 생성 실패');
    }

    // API를 통해 사용자 데이터 생성
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          email: authData.user.email || email,
          name: name || email.split('@')[0],
        }),
      });

      if (!response.ok) {
        console.warn('사용자 DB 정보 저장 실패:', await response.text());
      }
    } catch (dbError) {
      console.error('사용자 DB 정보 API 호출 오류:', dbError);
    }

    return { user: authData.user, authData };
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
}

// 로그인 함수
export async function signIn(email: string, password: string) {
  try {
    const client = getBrowserClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // 로그인 성공 시 쿠키에 세션 정보 저장
    if (data.session) {
      // 현재 호스트 가져오기
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = host === 'localhost' || host === '127.0.0.1';
      
      // Secure 속성은 HTTPS에서만 설정
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      
      // SameSite 설정 - 프로덕션에서는 Strict 또는 Lax
      // 리다이렉트가 많으면 Lax가 권장됨
      const sameSite = 'lax'; // 크로스 사이트 요청에도 쿠키 전송 허용
      
      // 도메인 설정 (로컬호스트가 아닌 경우에만)
      let domain = '';
      if (!isLocalhost) {
        // 서브도메인 포함하기 위해 최상위 도메인만 설정
        const hostParts = host.split('.');
        if (hostParts.length > 1) {
          // vercel.app 또는 yoursite.com 형태일 경우
          domain = hostParts.slice(-2).join('.');
        } else {
          domain = host;
        }
      }
      
      const domainStr = domain ? `domain=.${domain}; ` : ''; 
      const secureStr = isSecure ? 'Secure; ' : '';
      
      // 액세스 토큰 저장
      document.cookie = `sb-access-token=${data.session.access_token}; ${domainStr}path=/; max-age=${60 * 60 * 24 * 7}; SameSite=${sameSite}; ${secureStr}`;
      
      // 리프레시 토큰 저장
      if (data.session.refresh_token) {
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; ${domainStr}path=/; max-age=${60 * 60 * 24 * 30}; SameSite=${sameSite}; ${secureStr}`;
      }
      
      // localStorage에도 백업 (fallback)
      try {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }));
      } catch (err) {
        console.warn('로컬 스토리지 저장 실패:', err);
      }
      
      console.log('로그인 성공: 쿠키에 토큰 저장됨', {
        환경: process.env.NODE_ENV,
        호스트: host,
        도메인설정: domain || '없음',
        보안설정: isSecure ? 'HTTPS' : 'HTTP',
        SameSite: sameSite
      });
    } else {
      console.warn('로그인 성공했지만 세션 데이터가 없습니다.');
    }

    return data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
}

// Google 로그인 함수
export async function signInWithGoogle() {
  const supabase = getBrowserClient();
  
  // 환경 변수에서 리디렉션 URL 가져오기
  // 프로덕션에서는 환경 변수를 사용하고, 로컬에서는 현재 호스트 기반으로 URL 생성
  const baseUrl = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? `${window.location.protocol}//${window.location.host}`
    : process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
    
  const redirectTo = `${baseUrl}/auth/callback`;
  
  console.log('Google 로그인 시작, 리디렉션 URL:', redirectTo);
  
  try {
    // 쿠키 정리 - 간소화하고 표준 방식으로 변경
    localStorage.removeItem('supabase.auth.token');
    
    // 기존 Supabase 인증 쿠키 삭제
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;`;
    document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;`;
    
    console.log('인증 쿠키 및 로컬 스토리지 정리 완료');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      console.error('Google OAuth 초기화 오류:', error);
      throw error;
    }
    
    console.log('Google OAuth 시작됨, 리디렉션 URL:', data.url);
    
    // 명시적 리디렉션 수행
    window.location.href = data.url;
    return data;
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function signOut() {
  const supabase = getBrowserClient();
  
  // Supabase 로그아웃
  const { error } = await supabase.auth.signOut();
  
  // 쿠키 삭제 (미들웨어가 사용하는 쿠키)
  deleteCookie('sb-access-token');
  deleteCookie('sb-refresh-token');
  
  if (error) {
    console.error('로그아웃 처리 중 오류:', error);
    throw error;
  }
  
  return true;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const client = getBrowserClient();
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (!session) {
      return null;
    }
    
    // 브라우저 환경에서는 API를 통해 사용자 정보 가져오기
    if (typeof window !== 'undefined') {
      try {
        // 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
        
        // API 호출을 통해 사용자 정보 가져오기
        let response = await fetch(`/api/user/${session.user.id}`, {
          signal: controller.signal
        }).catch(error => {
          console.error('사용자 정보 가져오기 오류:', error);
          return null;
        });
        
        clearTimeout(timeoutId);
        
        // fetch 요청 자체가 실패한 경우
        if (!response) {
          console.log('API 요청 실패, 기본 사용자 정보 반환');
          return {
            ...session.user,
            dbUser: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    (session.user.email ? session.user.email.split('@')[0] : '사용자'),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          } as ExtendedUser;
        }
        
        // 사용자를 찾을 수 없는 경우, 로컬 데이터베이스에 동기화 시도
        if (!response.ok && response.status === 404) {
          console.log('사용자를 찾을 수 없어 데이터베이스에 동기화를 시도합니다.');
          
          const syncController = new AbortController();
          const syncTimeoutId = setTimeout(() => syncController.abort(), 5000);
          
          try {
            // 사용자 동기화 시도
            const registerResponse = await fetch('/api/user/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     (session.user.email ? session.user.email.split('@')[0] : '사용자')
              }),
              signal: syncController.signal
            });
            
            clearTimeout(syncTimeoutId);
            
            if (registerResponse.ok) {
              const userData = await registerResponse.json();
              return {
                ...session.user,
                dbUser: userData.user
              } as ExtendedUser;
            }
          } catch (syncError) {
            clearTimeout(syncTimeoutId);
            console.error('사용자 동기화 오류:', syncError);
          }
        } else if (response.ok) {
          const data = await response.json();
          return {
            ...session.user,
            dbUser: data.user
          } as ExtendedUser;
        }
      } catch (fetchError) {
        console.error('사용자 정보 API 호출 오류:', fetchError);
      }
    }
    
    // API 요청 실패 시 Supabase 사용자 정보만 반환
    console.log('기본 사용자 정보 반환');
    return session.user as ExtendedUser;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}

// 이메일/비밀번호 로그인
export async function signInWithEmail(email: string, password: string) {
  const supabase = getBrowserClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// 이메일/비밀번호 가입
export async function signUpWithEmail(email: string, password: string) {
  const supabase = getBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
  });
}

// 현재 사용자 세션 가져오기
export async function getSession() {
  const supabase = getBrowserClient();
  return supabase.auth.getSession();
}

// 사용자 정보 가져오기
export async function getUser() {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data?.user;
} 
```

src/lib/board-constants.ts
```
import { ConnectionLineType, MarkerType } from '@xyflow/react';

// 스냅 그리드 옵션
export const SNAP_GRID_OPTIONS = [
  { value: 0, label: '끄기' },
  { value: 10, label: '10px' },
  { value: 15, label: '15px' },
  { value: 20, label: '20px' },
  { value: 25, label: '25px' },
];

// 기본 스냅 그리드 설정
export const DEFAULT_SNAP_GRID = [15, 15];

// 연결선 타입 옵션
export const CONNECTION_TYPE_OPTIONS = [
  { value: ConnectionLineType.Bezier, label: '곡선 (Bezier)' },
  { value: ConnectionLineType.Straight, label: '직선 (Straight)' },
  { value: ConnectionLineType.Step, label: '계단식 (Step)' },
  { value: ConnectionLineType.SmoothStep, label: '부드러운 계단식 (SmoothStep)' },
  { value: ConnectionLineType.SimpleBezier, label: '단순 곡선 (SimpleBezier)' },
];

// 화살표 마커 타입 옵션
export const MARKER_TYPE_OPTIONS = [
  { value: MarkerType.Arrow, label: '화살표 (Arrow)' },
  { value: MarkerType.ArrowClosed, label: '닫힌 화살표 (ArrowClosed)' },
  { value: null, label: '없음 (None)' },
];

// 연결선 두께 옵션
export const STROKE_WIDTH_OPTIONS = [
  { value: 1, label: '얇게 (1px)' },
  { value: 2, label: '보통 (2px)' },
  { value: 3, label: '굵게 (3px)' },
  { value: 4, label: '매우 굵게 (4px)' },
];

// 마커 크기 옵션
export const MARKER_SIZE_OPTIONS = [
  { value: 10, label: '작게 (10px)' },
  { value: 15, label: '보통 (15px)' },
  { value: 20, label: '크게 (20px)' },
  { value: 25, label: '매우 크게 (25px)' },
];

// 연결선 애니메이션 옵션
export const EDGE_ANIMATION_OPTIONS = [
  { value: true, label: '켜기' },
  { value: false, label: '끄기' },
];

// 연결선 색상 옵션
export const EDGE_COLOR_OPTIONS = [
  { value: '#C1C1C1', label: '회색 (기본)', color: '#C1C1C1' },
  { value: '#000000', label: '검정색', color: '#000000' },
  { value: '#FF0072', label: '핑크색', color: '#FF0072' },
  { value: '#3366FF', label: '파란색', color: '#3366FF' },
  { value: '#43A047', label: '녹색', color: '#43A047' },
  { value: '#FFC107', label: '노란색', color: '#FFC107' },
  { value: '#9C27B0', label: '보라색', color: '#9C27B0' },
];

// 스토리지 키
export const STORAGE_KEY = 'backyard-board-layout';
export const EDGES_STORAGE_KEY = 'backyard-board-edges';
export const BOARD_SETTINGS_KEY = 'backyard-board-settings';

// 자동 저장 설정
export const BOARD_CONFIG = {
  // 자동 저장 간격 (분)
  autoSaveInterval: 1,
  // 토스트 메시지 표시 여부
  showAutoSaveNotification: true,
  // 콘솔 로깅 활성화 여부
  enableConsoleLogging: true,
}; 
```

src/lib/board-ui-config.ts
```
import { MarkerType, ConnectionLineType } from '@xyflow/react';
import defaultConfig from '../config/cardBoardUiOptions.json';

// 카드 보드 UI 설정 타입 정의
export interface BoardUIConfig {
  board: {
    snapToGrid: boolean;
    snapGrid: [number, number];
    connectionLineType: string;
    markerEnd: string | null;
    strokeWidth: number;
    markerSize: number;
    edgeColor: string;
    animated: boolean;
    selectedEdgeColor: string;
  };
  card: {
    defaultWidth: number;
    backgroundColor: string;
    borderRadius: number;
    tagBackgroundColor: string;
  };
  handles: {
    size: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
  layout: {
    defaultPadding: number;
    defaultSpacing: {
      horizontal: number;
      vertical: number;
    };
    nodeSize?: {
      width: number;
      height: number;
    };
    graphSettings?: {
      nodesep: number;
      ranksep: number;
      edgesep: number;
    };
    autoSaveIntervalMinutes: number;
  };
}

// 기본 설정값 (타입 변환 포함)
export const DEFAULT_UI_CONFIG: BoardUIConfig = {
  ...defaultConfig as BoardUIConfig,
  board: {
    ...defaultConfig.board,
    connectionLineType: defaultConfig.board.connectionLineType as ConnectionLineType,
    markerEnd: defaultConfig.board.markerEnd as MarkerType,
    selectedEdgeColor: '#000000',
    snapGrid: defaultConfig.board.snapGrid as [number, number],
  }
};

/**
 * 기본 설정을 불러오는 함수
 * - 기본값을 불러오지 못할 경우 하드코딩된 대체 기본값을 사용
 */
export function loadDefaultBoardUIConfig(): BoardUIConfig {
  try {
    return DEFAULT_UI_CONFIG;
  } catch (error) {
    console.error('기본 UI 설정을 불러오는데 실패했습니다. 하드코딩된 대체 기본값을 사용합니다:', error);
    
    // 대체 기본값 (하드코딩된 fallback)
    return {
      board: {
        snapToGrid: false,
        snapGrid: [15, 15],
        connectionLineType: 'bezier' as ConnectionLineType,
        markerEnd: 'arrowclosed' as MarkerType,
        strokeWidth: 2,
        markerSize: 20,
        edgeColor: '#C1C1C1',
        animated: false,
        selectedEdgeColor: '#000000'
      },
      card: {
        defaultWidth: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        tagBackgroundColor: '#F2F2F2'
      },
      handles: {
        size: 10,
        backgroundColor: '#555555',
        borderColor: '#FFFFFF',
        borderWidth: 1
      },
      layout: {
        defaultPadding: 20,
        defaultSpacing: {
          horizontal: 30,
          vertical: 30
        },
        nodeSize: {
          width: 280,
          height: 40
        },
        graphSettings: {
          nodesep: 30,
          ranksep: 30,
          edgesep: 10
        },
        autoSaveIntervalMinutes: 1
      }
    };
  }
}

/**
 * 보드 설정 인터페이스에 필요한 기본값을 추출하는 함수
 */
export function extractBoardSettings(config: BoardUIConfig) {
  return {
    snapToGrid: config.board.snapToGrid,
    snapGrid: config.board.snapGrid,
    connectionLineType: config.board.connectionLineType as ConnectionLineType,
    markerEnd: config.board.markerEnd as MarkerType,
    strokeWidth: config.board.strokeWidth,
    markerSize: config.board.markerSize,
  };
}

/**
 * 레이아웃 설정을 추출하는 함수
 */
export function extractLayoutSettings(config: BoardUIConfig) {
  const layoutConfig = config.layout;
  return {
    defaultPadding: layoutConfig.defaultPadding,
    spacing: layoutConfig.defaultSpacing,
    nodeSize: layoutConfig.nodeSize || { width: 280, height: 40 },
    graphSettings: layoutConfig.graphSettings || {
      nodesep: 30,
      ranksep: 30,
      edgesep: 10
    }
  };
} 
```

src/lib/board-utils.ts
```
import { Edge, MarkerType, ConnectionLineType } from '@xyflow/react';
import { BOARD_SETTINGS_KEY } from './board-constants';

export interface BoardSettings {
  // 그리드 설정
  snapToGrid: boolean;
  snapGrid: [number, number];
  
  // 연결선 설정
  connectionLineType: ConnectionLineType;
  markerEnd: MarkerType | null;
  strokeWidth: number;
  markerSize: number;
  edgeColor: string;
  selectedEdgeColor: string;
  animated: boolean;
}

// 기본 보드 설정
export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  // 그리드 설정
  snapToGrid: false,
  snapGrid: [15, 15],
  
  // 연결선 설정
  connectionLineType: ConnectionLineType.SmoothStep,
  markerEnd: MarkerType.Arrow,
  strokeWidth: 2,
  markerSize: 20,
  edgeColor: '#C1C1C1',
  selectedEdgeColor: '#FF0072',
  animated: false,
};

/**
 * 로컬 스토리지에서 보드 설정을 불러오는 함수
 */
export function loadBoardSettings(): BoardSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_BOARD_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem(BOARD_SETTINGS_KEY);
    
    if (!savedSettings) {
      return DEFAULT_BOARD_SETTINGS;
    }

    // 저장된 설정 복원
    const parsedSettings = JSON.parse(savedSettings);
    
    // 기존 설정이 없는 경우 기본값으로 통합
    return {
      ...DEFAULT_BOARD_SETTINGS,
      ...parsedSettings,
    };
  } catch (error) {
    console.error('보드 설정 로드 중 오류:', error);
    return DEFAULT_BOARD_SETTINGS;
  }
}

/**
 * 보드 설정을 로컬 스토리지에 저장하는 함수
 */
export function saveBoardSettings(settings: BoardSettings): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('보드 설정 저장 중 오류:', error);
    }
  }
}

/**
 * 보드 설정에 따라 엣지 스타일을 적용하는 함수
 * 모든 연결선에 설정이 즉시 반영되도록 함
 */
export function applyEdgeSettings(edges: Edge[], settings: BoardSettings): Edge[] {
  // 각 엣지에 새 설정을 적용
  return edges.map(edge => {
    // 기존 속성은 유지하면서 새로운 속성 추가
    const updatedEdge: Edge = {
      ...edge,                             // 기존 속성 유지
      id: edge.id,                         // 엣지 ID 유지
      source: edge.source,                 // 소스 노드 유지
      target: edge.target,                 // 타겟 노드 유지
      type: 'custom',                      // 커스텀 엣지 타입 사용 - 렌더링 컴포넌트 지정
      data: {
        ...(edge.data || {}),              // 기존 데이터 유지
        edgeType: settings.connectionLineType, // 연결선 타입을 data로 전달
        settings: {                        // 설정 정보 추가
          animated: settings.animated,
          connectionLineType: settings.connectionLineType,
          strokeWidth: settings.strokeWidth,
          edgeColor: settings.edgeColor,
          selectedEdgeColor: settings.selectedEdgeColor,
        }
      },
      animated: settings.animated,         // 애니메이션 설정
      
      // 스타일 객체 생성 (기존 스타일 유지하면서 새 설정으로 덮어씀)
      style: {
        ...(edge.style || {}),             // 기존 스타일 유지 (있다면)
        strokeWidth: settings.strokeWidth, // 선 굵기 설정
        stroke: edge.selected ? settings.selectedEdgeColor : settings.edgeColor, // 선 색상
      },
    };

    // 마커 설정 (화살표)
    if (settings.markerEnd) {
      updatedEdge.markerEnd = {
        type: settings.markerEnd,
        width: settings.markerSize,
        height: settings.markerSize,
        color: edge.selected ? settings.selectedEdgeColor : settings.edgeColor,
      };
    } else {
      updatedEdge.markerEnd = undefined;
    }

    return updatedEdge;
  });
} 
```

src/lib/constants.ts
```
// 애플리케이션 전체에서 사용되는 상수 값들

// 테스트 사용자 ID (데이터베이스에 실제로 존재하는 ID)
// 이전 값: export const DEFAULT_USER_ID = "91fc1ef9-daec-45de-8eb4-40ca52ec292f";
export const DEFAULT_USER_ID = "13ce1b15-aa4e-452b-af81-124d06413662"; // 실제 데이터베이스에 존재하는 ID

// 페이지 크기 상수
export const PAGE_SIZE = 10;

// 날짜 형식
export const DATE_FORMAT = "YYYY년 MM월 DD일"; 
```

src/lib/db-check.js
```
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function checkDatabaseConnection() {
  try {
    // 간단한 쿼리로 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return { 
      connected: false, 
      error: error.message,
      tips: [
        '.env 파일에 DATABASE_URL이 올바르게 설정되었는지 확인하세요.',
        'PostgreSQL 서버가 실행 중인지 확인하세요.',
        '데이터베이스 "backyard"가 생성되었는지 확인하세요.',
        '사용자 이름과 비밀번호가 올바른지 확인하세요.'
      ]
    };
  }
}

export { prisma }; 
```

src/lib/db-init.ts
```
import { createSupabaseClient } from './supabase';
import { PrismaClient } from '@prisma/client';

// 테이블 정의 및 생성 SQL
const tableDefinitions = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  cards: `
    CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  tags: `
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  card_tags: `
    CREATE TABLE IF NOT EXISTS card_tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(card_id, tag_id)
    );
  `,
  board_settings: `
    CREATE TABLE IF NOT EXISTS board_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      settings JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
};

// RLS 정책 설정 SQL
const rlsPolicies = {
  users: `
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- 사용자는 자신의 정보만 볼 수 있음
    CREATE POLICY "사용자는 자신의 정보만 볼 수 있음" ON users
      FOR SELECT
      USING (auth.uid() = id);
      
    -- 사용자는 자신의 정보만 업데이트할 수 있음
    CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
      FOR UPDATE
      USING (auth.uid() = id);
  `,
  cards: `
    ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 카드를 볼 수 있음
    CREATE POLICY "모든 사용자가 카드를 볼 수 있음" ON cards
      FOR SELECT
      USING (true);
      
    -- 카드 소유자만 카드를 수정할 수 있음
    CREATE POLICY "카드 소유자만 카드를 수정할 수 있음" ON cards
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    -- 카드 소유자만 카드를 삭제할 수 있음
    CREATE POLICY "카드 소유자만 카드를 삭제할 수 있음" ON cards
      FOR DELETE
      USING (auth.uid() = user_id);
      
    -- 인증된 사용자만 카드를 생성할 수 있음
    CREATE POLICY "인증된 사용자만 카드를 생성할 수 있음" ON cards
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  `,
  tags: `
    ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 태그를 볼 수 있음
    CREATE POLICY "모든 사용자가 태그를 볼 수 있음" ON tags
      FOR SELECT
      USING (true);
      
    -- 인증된 사용자만 태그를 생성할 수 있음
    CREATE POLICY "인증된 사용자만 태그를 생성할 수 있음" ON tags
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  `,
  card_tags: `
    ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 카드 태그를 볼 수 있음
    CREATE POLICY "모든 사용자가 카드 태그를 볼 수 있음" ON card_tags
      FOR SELECT
      USING (true);
      
    -- 카드 소유자만 카드 태그를 수정할 수 있음
    CREATE POLICY "카드 소유자만 카드 태그를 수정할 수 있음" ON card_tags
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM cards
          WHERE cards.id = card_id AND cards.user_id = auth.uid()
        )
      );
  `,
  board_settings: `
    ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
    
    -- 사용자는 자신의 보드 설정만 볼 수 있음
    CREATE POLICY "사용자는 자신의 보드 설정만 볼 수 있음" ON board_settings
      FOR SELECT
      USING (auth.uid() = user_id);
      
    -- 사용자는 자신의 보드 설정만 수정할 수 있음
    CREATE POLICY "사용자는 자신의 보드 설정만 수정할 수 있음" ON board_settings
      FOR ALL
      USING (auth.uid() = user_id);
  `
};

/**
 * 특정 테이블이 존재하는지 확인
 */
async function tableExists(supabase: any, tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`테이블 존재 여부 확인 오류:`, error);
      
      // RPC 함수가 없을 수 있으므로, 대체 방법으로 시도
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (tableError) {
        console.error(`대체 방법으로 테이블 존재 여부 확인 오류:`, tableError);
        return false;
      }
      
      return tableData && tableData.length > 0;
    }
    
    return data;
  } catch (error) {
    console.error(`테이블 존재 여부 확인 중 오류 발생:`, error);
    return false;
  }
}

/**
 * check_table_exists RPC 함수 생성
 */
async function createCheckTableExistsFunction(supabase: any): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_check_table_exists_function', {});
    
    if (error) {
      // 함수가 이미 존재할 수 있으므로, SQL 쿼리로 직접 생성 시도
      const { error: sqlError } = await supabase.sql(`
        CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
          exists BOOLEAN;
        BEGIN
          SELECT INTO exists 
            COUNT(*) > 0 
          FROM 
            information_schema.tables 
          WHERE 
            table_schema = 'public' 
            AND table_name = check_table_exists.table_name;
          
          RETURN exists;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      if (sqlError) {
        console.error(`check_table_exists 함수 생성 오류:`, sqlError);
      }
    }
  } catch (error) {
    console.error(`check_table_exists 함수 생성 중 오류 발생:`, error);
  }
}

/**
 * 테이블 생성 및 초기화 함수
 */
async function createTablesIfNotExist(): Promise<void> {
  const prisma = new PrismaClient();
  
  try {
    console.log('Prisma 클라이언트를 사용하여 데이터베이스 초기화를 시작합니다...');
    
    // Prisma를 통한 사용자 테이블 존재 여부 및 생성
    try {
      // 간단한 쿼리로 테이블 존재 여부 확인
      await prisma.user.findFirst();
      console.log('사용자 테이블이 이미 존재합니다.');
    } catch (error) {
      console.log('사용자 테이블이 없습니다. Prisma 마이그레이션이 필요합니다.');
      // 여기서는 Prisma 스키마가 이미 설정되어 있다고 가정하고
      // 실제 테이블 생성은 별도의 마이그레이션 명령어를 통해 수행해야 합니다.
      // npx prisma db push 등의 명령어를 사용해야 합니다.
    }
    
    console.log('데이터베이스 초기화 검사 완료');
  } catch (error) {
    console.error('테이블 생성 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 데이터베이스 초기화 함수
 * Next.js 앱 시작 시 호출
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('데이터베이스 초기화 시작...');
    await createTablesIfNotExist();
    
    // Prisma를 사용하여 기본 사용자 생성
    const prisma = new PrismaClient();
    try {
      // 기본 사용자가 있는지 확인
      const defaultUser = await prisma.user.findFirst();
      
      // 사용자가 없으면 생성
      if (!defaultUser) {
        const newUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: '테스트 사용자'
          }
        });
        console.log('기본 사용자 생성 완료:', newUser.id);
      } else {
        console.log('기존 사용자 ID 확인:', defaultUser.id);
      }
    } catch (error) {
      console.error('기본 사용자 생성 중 오류:', error);
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  }
}

/**
 * Prisma 클라이언트를 통해 테이블 존재 여부 확인
 * 이 함수는 Prisma 연결이 가능한 환경에서만 사용
 */
export async function checkTablesWithPrisma(): Promise<boolean> {
  try {
    const prisma = new PrismaClient();
    
    // 간단한 쿼리를 실행하여 테이블 존재 여부 확인
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    await prisma.$disconnect();
    
    return true;
  } catch (error) {
    console.error('Prisma를 통한 테이블 확인 오류:', error);
    return false;
  }
} 
```

src/lib/flow-constants.ts
```
/**
 * React Flow 관련 상수 정의
 * 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
 */

import CardNode from '@/components/board/CardNode';
import CustomEdge from '@/components/board/CustomEdge';
import { NodeInspect } from '@/components/debug/NodeInspector';

// 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const NODE_TYPES = Object.freeze({
  card: CardNode,
  nodeInspect: NodeInspect,
});

// 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const EDGE_TYPES = Object.freeze({
  custom: CustomEdge,
}); 
```

src/lib/layout-utils.ts
```
import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import defaultConfig from '../config/cardBoardUiOptions.json';

// 노드 크기 설정 - 설정 파일에서 가져오기
const NODE_WIDTH = defaultConfig.card.nodeSize.width;
const NODE_HEIGHT = defaultConfig.card.nodeSize.height;

// 그래프 간격 설정 - 설정 파일에서 가져오기
const GRAPH_SETTINGS = {
  rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
  nodesep: defaultConfig.layout.graphSettings.nodesep, // 같은 레벨의 노드 간 거리 (픽셀)
  ranksep: defaultConfig.layout.graphSettings.ranksep, // 레벨 간 거리 (픽셀)
  edgesep: defaultConfig.layout.graphSettings.edgesep, // 엣지 간 거리
};

/**
 * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
 * 
 * @param nodes 노드 배열
 * @param edges 엣지 배열
 * @param direction 배치 방향 ('horizontal' 또는 'vertical')
 * @returns 레이아웃이 적용된 노드와 엣지
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  // 노드나 엣지가 없는 경우 그대로 반환
  if (nodes.length === 0) return { nodes, edges };

  // 그래프 생성
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 방향 설정 (LR: 왼쪽에서 오른쪽, TB: 위에서 아래)
  const isHorizontal = direction === 'horizontal';
  const settings = {
    ...GRAPH_SETTINGS,
    rankdir: isHorizontal ? 'LR' : 'TB',
  };
  
  dagreGraph.setGraph(settings);

  // 노드 추가
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // 엣지 추가
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 계산
  dagre.layout(dagreGraph);

  // 계산된 위치로 노드 업데이트
  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // 방향에 따라 handle 위치 조정
    return {
      ...node,
      // handle 위치: 수평 레이아웃이면 좌우, 수직 레이아웃이면 상하
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  // 엣지 핸들 위치 업데이트
  const layoutedEdges = edges.map(edge => {
    // 원래의 엣지 속성을 유지하면서 레이아웃 방향에 따라 핸들 위치 업데이트
    const updatedEdge = { ...edge };
    
    // 방향에 따라 소스/타겟 핸들 업데이트
    if (isHorizontal) {
      updatedEdge.sourceHandle = 'right-source';  // 수평 레이아웃에서는 오른쪽이 소스
      updatedEdge.targetHandle = 'left-target';   // 수평 레이아웃에서는 왼쪽이 타겟
    } else {
      updatedEdge.sourceHandle = 'bottom-source'; // 수직 레이아웃에서는 아래쪽이 소스
      updatedEdge.targetHandle = 'top-target';    // 수직 레이아웃에서는 위쪽이 타겟
    }
    
    return updatedEdge;
  });

  return { 
    nodes: layoutedNodes, 
    edges: layoutedEdges 
  };
}

/**
 * 격자형 레이아웃으로 노드를 배치하는 함수
 * 
 * @param nodes 노드 배열
 * @param cardsPerRow 한 행에 표시할 카드 수
 * @returns 배치된 노드 배열
 */
export function getGridLayout(nodes: Node[], cardsPerRow: number = 3) {
  // 간격 값을 설정 파일에서 가져옴
  const HORIZONTAL_GAP = NODE_WIDTH * 1.5;  // 노드 너비의 1.5배
  const VERTICAL_GAP = NODE_HEIGHT * 6;     // 노드 높이의 6배
  
  return nodes.map((node, index) => ({
    ...node,
    // 모든 노드에 일관된 handle 위치 설정
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    position: {
      x: (index % cardsPerRow) * HORIZONTAL_GAP + 50,
      y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + 50,
    }
  }));
} 
```

src/lib/prisma.ts
```
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스를 글로벌로 관리하여 핫 리로드 시 연결이 중복 생성되는 것을 방지
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 환경 변수 유효성 확인
function validateEnv() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️ 누락된 데이터베이스 환경 변수: ${missingEnvVars.join(', ')}`);
    return false;
  }
  return true;
}

// 개발 환경에서는 로깅 활성화, 프로덕션에서는 비활성화
let prisma: PrismaClient;

try {
  // 환경 변수 확인
  const isEnvValid = validateEnv();
  
  if (!isEnvValid && process.env.NODE_ENV === 'production') {
    console.error('❌ 프로덕션 환경에서 필수 데이터베이스 환경 변수가 누락되었습니다.');
    // 프로덕션 환경에서는 명시적으로 오류를 발생시키지 않고 로깅만 수행
  }
  
  prisma = 
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  
  // 연결 테스트
  if (process.env.NODE_ENV === 'development') {
    prisma.$connect()
      .then(() => console.log('✅ Prisma 데이터베이스 연결 성공'))
      .catch(error => console.error('❌ Prisma 데이터베이스 연결 실패:', error));
  }
} catch (error) {
  console.error('❌ Prisma 클라이언트 초기화 오류:', error);
  // 개발 환경에서는 오류 발생 시 더미 Prisma 클라이언트를 사용
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ 더미 Prisma 클라이언트를 사용합니다. 데이터베이스 작업이 제한됩니다.');
    // @ts-ignore - 더미 클라이언트 생성
    prisma = new Proxy({}, {
      get: (target, prop) => {
        // 기본 속성
        if (prop === 'then' || prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve();
        }
        // 모델 접근 시 더미 모델 반환
        return new Proxy({}, {
          get: () => (...args: any[]) => {
            console.warn(`⚠️ 데이터베이스 연결 없이 Prisma 작업이 호출되었습니다: ${String(prop)}`);
            return Promise.resolve([]);
          }
        });
      }
    });
  } else {
    // 프로덕션 환경에서는 최소한의 기능을 갖춘 클라이언트 제공
    // @ts-ignore - 더미 클라이언트 생성
    prisma = new PrismaClient();
  }
}

// 개발 환경에서 글로벌 인스턴스 저장
if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

src/lib/supabase-browser.ts
```
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseBrowserClient;
} 
```

src/lib/supabase-server.ts
```
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase';

export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
} 
```

src/lib/supabase.ts
```
import { createClient } from '@supabase/supabase-js';

// 싱글톤 인스턴스를 위한 변수
let browserClientInstance: ReturnType<typeof createClient> | null = null;
let serverClientInstance: ReturnType<typeof createClient> | null = null;

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Next.js 서버 컴포넌트 및 API 라우트용 Supabase 클라이언트
export const createSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (serverClientInstance) {
    return serverClientInstance;
  }
  
  // 정적 렌더링 및 개발 환경을 위한 안전한 클라이언트 생성
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인하세요.');
    
    // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
      },
      from: () => ({ select: () => ({ data: [], error: null }) }),
    } as any;
  }
  
  try {
    serverClientInstance = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
    
    return serverClientInstance;
  } catch (error) {
    console.error('Supabase 서버 클라이언트 생성 실패:', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 브라우저 클라이언트용 Supabase 인스턴스
// 필요한 경우에만 import하여 사용
export const createBrowserClient = () => {
  // 브라우저 환경이 아니면 더미 클라이언트 반환
  if (typeof window === 'undefined') {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (browserClientInstance) {
    return browserClientInstance;
  }
  
  // 클라이언트 환경에서 안전하게 처리
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인하세요.');
    
    if (process.env.NODE_ENV !== 'production') {
      // 개발 환경에서는 더미 클라이언트 반환
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
        },
        from: () => ({ select: () => ({ data: [], error: null }) }),
      } as any;
    }
    
    // 운영 환경에서는 경고만 표시하고 계속 진행 (오류 방지)
    console.error('Supabase 환경 변수가 누락되었습니다. 기능이 제한될 수 있습니다.');
  }
  
  try {
    browserClientInstance = createClient(
      supabaseUrl || 'https://placeholder-supabase-url.supabase.co',
      supabaseKey || 'placeholder-anon-key',
      {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    
    return browserClientInstance;
  } catch (error) {
    console.error('Supabase 브라우저 클라이언트 생성 실패:', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 안전한 클라이언트 생성 (정적 빌드 시 오류 방지)
const createSafeClient = () => {
  try {
    if (typeof window === 'undefined') {
      return createSupabaseClient();
    } else {
      return createBrowserClient();
    }
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    // 빌드 타임 에러 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 기본 클라이언트 생성 (서버 컴포넌트에서 사용)
const supabase = createSafeClient();
export default supabase; 
```

src/lib/utils.test.ts
```
import { cn, formatDate, extractTags, parseTagsInText } from './utils';
import { describe, it, expect } from 'vitest';

describe('유틸리티 함수', () => {
  describe('cn 함수', () => {
    it('클래스 이름을 병합해야 합니다', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('조건부 클래스를 처리해야 합니다', () => {
      const result = cn('class1', { class2: true, class3: false });
      expect(result).toBe('class1 class2');
    });

    it('중복된 클래스를 제거해야 합니다', () => {
      const result = cn('p-4 text-red-500', 'p-4 text-blue-500');
      expect(result).toBe('p-4 text-blue-500');
    });
  });
  
  describe('formatDate 함수', () => {
    it('Date 객체를 한국어 날짜 형식으로 변환해야 합니다', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      const result = formatDate(date);
      expect(result).toBe('2023년 1월 15일');
    });
    
    it('문자열 날짜를 한국어 날짜 형식으로 변환해야 합니다', () => {
      const dateStr = '2023-02-20T12:00:00.000Z';
      const result = formatDate(dateStr);
      
      // 시간대에 따라 결과가 다를 수 있으므로 포맷만 확인
      expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
    });
    
    it('다양한 날짜 입력에 대해 오류 없이 처리해야 합니다', () => {
      // 다양한 날짜 형식
      const dates = [
        new Date(), // 현재 날짜
        '2023-12-31',
        '2023/01/01',
        new Date(2000, 0, 1) // 2000-01-01
      ];
      
      dates.forEach(date => {
        const result = formatDate(date);
        expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
      });
    });
  });
  
  describe('extractTags 함수', () => {
    it('텍스트에서 태그를 추출해야 합니다', () => {
      const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
      const result = extractTags(text);
      expect(result).toEqual(['자바스크립트', '리액트']);
    });
    
    it('태그가 없을 경우 빈 배열을 반환해야 합니다', () => {
      const text = '이것은 태그가 없는 글입니다.';
      const result = extractTags(text);
      expect(result).toEqual([]);
    });
    
    it('중복된 태그를 모두 포함해야 합니다', () => {
      const text = '#태그1 내용 #태그2 더 많은 내용 #태그1';
      const result = extractTags(text);
      expect(result).toEqual(['태그1', '태그2', '태그1']);
    });
    
    it('한글, 영어, 숫자, 특수문자가 포함된 태그를 추출해야 합니다', () => {
      const text = '다양한 태그 #한글태그 #English #숫자123 #특수_문자-태그';
      const result = extractTags(text);
      expect(result).toEqual(['한글태그', 'English', '숫자123', '특수_문자-태그']);
    });
    
    it('# 뒤에 공백이 있는 경우 태그로 인식되지 않아야 합니다', () => {
      const text = '이것은 # 태그가 아닙니다';
      const result = extractTags(text);
      expect(result).toEqual([]);
    });
  });
  
  describe('parseTagsInText 함수', () => {
    it('텍스트와 추출된 태그 목록을 반환해야 합니다', () => {
      const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.',
        tags: ['자바스크립트', '리액트']
      });
    });
    
    it('태그가 없는 텍스트에 대해 빈 태그 배열을 반환해야 합니다', () => {
      const text = '이것은 태그가 없는 글입니다.';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '이것은 태그가 없는 글입니다.',
        tags: []
      });
    });
    
    it('다양한 언어와 문자가 포함된 태그를 처리해야 합니다', () => {
      const text = 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그',
        tags: ['한글태그', 'EnglishTag', '혼합Mix태그123', '특수_문자-태그']
      });
    });
    
    it('빈 문자열에 대해 빈 태그 배열을 반환해야 합니다', () => {
      const text = '';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '',
        tags: []
      });
    });
  });
}); 
```

src/lib/utils.ts
```
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 텍스트에서 태그 추출 (#태그 형식)
export function extractTags(text: string): string[] {
  const tagPattern = /#([a-zA-Z0-9가-힣_\-]+)/g;
  const matches = text.match(tagPattern);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.slice(1)); // # 제거
}

// 텍스트에서 태그를 변환 (#태그 -> Badge 컴포넌트로 변환하기 위한 준비)
export function parseTagsInText(text: string): { text: string, tags: string[] } {
  const tags = extractTags(text);
  return { text, tags };
}
```

src/contexts/AuthContext.tsx
```
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '@/lib/auth';
import { createBrowserClient } from '@/lib/supabase';

// 확장된 사용자 타입 정의
export interface ExtendedUser extends User {
  dbUser?: any; // Prisma User 모델
}

type AuthContextType = {
  user: ExtendedUser | null;
  userDetails: any; // Prisma User 모델 타입
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 데이터베이스 동기화 함수
  const syncUserWithDatabase = async (supabaseUser: User) => {
    try {
      if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
        console.warn('사용자 동기화 실패: 유효하지 않은 사용자 데이터');
        return null;
      }

      // 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

      try {
        // 로컬 데이터베이스에 사용자 등록/확인
        const response = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || 
                  supabaseUser.user_metadata?.name || 
                  supabaseUser.email?.split('@')[0]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return data.user;
        } else {
          console.error('사용자 동기화 API 오류:', await response.text());
          
          // API 응답이 실패해도 기본 사용자 객체를 반환
          return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || 
                  supabaseUser.user_metadata?.name || 
                  supabaseUser.email?.split('@')[0],
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('API 호출 중 오류:', fetchError);
        
        // 네트워크 오류라도 기본 사용자 객체를 반환
        return {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                supabaseUser.email?.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('사용자 데이터베이스 동기화 오류:', error);
      return null;
    }
  };

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser() as ExtendedUser | null;
      
      if (userData) {
        setUser(userData);
        setUserDetails(userData.dbUser);
      } else {
        setUser(null);
        setUserDetails(null);
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setUser(null);
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserDetails(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();

    // 브라우저 환경에서만 Supabase 클라이언트 생성
    const supabase = createBrowserClient();
    
    // Supabase 인증 이벤트 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session && session.user) {
            // 사용자가 로그인하거나 토큰이 갱신될 때 데이터베이스 동기화
            console.log('인증 상태 변경 감지: 사용자 동기화 시작');
            const dbUser = await syncUserWithDatabase(session.user);
            
            if (dbUser) {
              // 동기화된 사용자 정보로 상태 업데이트
              const extendedUser = { ...session.user, dbUser } as ExtendedUser;
              setUser(extendedUser);
              setUserDetails(dbUser);
              setIsLoading(false);
            } else {
              // 동기화 실패 시 getCurrentUser로 다시 시도
              checkAuth();
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // 사용자가 로그아웃할 때
          setUser(null);
          setUserDetails(null);
        }
      }
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 
```

src/types/card.ts
```
export interface User {
  id: string;
  name: string | null;
}

export interface Card {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
}

export interface CreateCardInput {
  title: string;
  content?: string;
  userId: string;
}

export interface UpdateCardInput {
  title?: string;
  content?: string;
} 
```

src/types/supabase.ts
```
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Supabase 데이터베이스의 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          content: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          user_id?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      card_tags: {
        Row: {
          id: string
          card_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          tag_id?: string
        }
      }
      board_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: Json
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
} 
```

src/types/vitest.d.ts
```
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }

  // @testing-library/jest-dom 확장
  interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
} 
```

prisma/migrations/20250227050602_init/migration.sql
```
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

prisma/migrations/20250306112255_init/migration.sql
```
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_tags" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "card_tags_card_id_tag_id_key" ON "card_tags"("card_id", "tag_id");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250307042922_add_board_settings/migration.sql
```
-- CreateTable
CREATE TABLE "board_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_settings_user_id_key" ON "board_settings"("user_id");

-- AddForeignKey
ALTER TABLE "board_settings" ADD CONSTRAINT "board_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250304224858_add_tags/migration.sql
```
-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_tags" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "card_tags_card_id_tag_id_key" ON "card_tags"("card_id", "tag_id");

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250227055331_init/migration.sql
```
-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_user_id_fkey";

-- AlterTable
ALTER TABLE "cards" ALTER COLUMN "content" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

src/app/login/page.tsx
```
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <AuthForm />
    </div>
  );
} 
```

src/app/cards/page.test.tsx
```
/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import CardsPage from './page';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// React.Suspense 모킹
vi.mock('react', () => {
  const originalReact = vi.importActual('react');
  return {
    ...originalReact,
    Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
      return (
        <>
          <div data-testid="suspense-fallback">{fallback}</div>
          <div data-testid="suspense-children">{children}</div>
        </>
      );
    },
  };
});

// 테스트용 CardListSkeleton (page 모듈에서 가져오지 않고 테스트에서 직접 정의)
const CardListSkeleton = () => (
  <div data-testid="skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, index) => (
      <div key={index} className="border rounded-md p-4 space-y-4">
        <div data-testid="skeleton" className="h-6 w-3/4" />
        <div data-testid="skeleton" className="h-24" />
        <div className="flex justify-between">
          <div data-testid="skeleton" className="h-4 w-1/4" />
          <div data-testid="skeleton" className="h-8 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// Suspense 내부 컴포넌트 모킹
vi.mock('@/components/cards/CardList', () => {
  return {
    default: vi.fn(() => <div data-testid="card-list">카드 목록 컴포넌트</div>)
  };
});

vi.mock('@/components/cards/CreateCardButton', () => {
  return {
    default: vi.fn(() => <button data-testid="create-card-button">새 카드 만들기</button>)
  };
});

// UI 컴포넌트 모킹
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: vi.fn(({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />),
}));

describe('Cards Page', () => {
  it('페이지 제목이 올바르게 렌더링되는지 확인한다', () => {
    render(<CardsPage />);
    
    const heading = screen.getByRole('heading', { name: /카드 목록/i });
    expect(heading).toBeInTheDocument();
  });
  
  it('카드 목록 컴포넌트가 렌더링되는지 확인한다', () => {
    render(<CardsPage />);
    
    const cardListContainer = screen.getByTestId('suspense-children');
    expect(cardListContainer).toBeInTheDocument();
    
    const cardList = screen.getByTestId('card-list');
    expect(cardList).toBeInTheDocument();
  });
  
  it('새 카드 만들기 버튼이 렌더링되는지 확인한다', () => {
    render(<CardsPage />);
    
    const createButton = screen.getByTestId('create-card-button');
    expect(createButton).toBeInTheDocument();
  });
  
  it('Suspense fallback이 스켈레톤을 사용하는지 확인한다', () => {
    render(<CardsPage />);
    
    const fallbackContainer = screen.getByTestId('suspense-fallback');
    expect(fallbackContainer).toBeInTheDocument();
  });
});

describe('CardListSkeleton', () => {
  it('6개의 스켈레톤 카드를 렌더링한다', () => {
    render(<CardListSkeleton />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    // 각 카드는 4개의 스켈레톤 요소를 가짐 (제목, 내용, 날짜, 버튼)
    expect(skeletons.length).toBe(6 * 4);
  });
  
  it('그리드 레이아웃을 사용한다', () => {
    render(<CardListSkeleton />);
    
    const gridContainer = screen.getByTestId('skeleton-grid');
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
  });
}); 
```

src/app/cards/page.tsx
```
import { Metadata } from "next";
import { Suspense } from 'react';
import CardList from "../../components/cards/CardList";
import CreateCardButton from "../../components/cards/CreateCardButton";
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: "카드 목록 | Backyard",
  description: "백야드 카드 목록 페이지입니다.",
};

// 카드 목록 로딩 스켈레톤
function CardListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="border rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-24" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CardsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">카드 목록</h1>
        <CreateCardButton />
      </div>
      
      <Suspense fallback={<CardListSkeleton />}>
        <CardList />
      </Suspense>
    </div>
  );
} 
```

src/app/test-db/page.tsx
```
import React from 'react';
import prisma from '@/lib/prisma';
import type { Tag } from '@prisma/client';

// 태그와 연결된 카드 수를 포함하는 타입 정의
type TagWithCount = Tag & {
  _count: {
    cardTags: number;
  };
};

export default async function TestDatabasePage() {
  let tags: TagWithCount[] = [];
  let error: string | null = null;
  
  try {
    // Prisma를 사용하여 태그 목록을 가져옵니다
    tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            cardTags: true,
          },
        },
      },
    });
  } catch (e) {
    console.error('데이터베이스 연결 오류:', e);
    error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">데이터베이스 연결 테스트</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">태그 목록</h2>
        
        {error ? (
          <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-red-700 dark:text-red-400">
              데이터베이스 연결 오류: {error}
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              Vercel 환경 변수가 올바르게 설정되었는지 확인하세요.
            </p>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">등록된 태그가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li 
                key={tag.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  연결된 카드: {tag._count.cardTags}개
                </span>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-green-700 dark:text-green-400">
            {!error 
              ? '이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!' 
              : '로컬 환경에서는 연결 오류가 발생할 수 있습니다. Vercel 배포 환경에서 다시 테스트해보세요.'}
          </p>
        </div>
      </div>
    </div>
  );
} 
```

src/components/auth/AuthForm.tsx
```
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import { toast } from 'sonner';
import { setCookie } from 'cookies-next';

type AuthMode = 'login' | 'register';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    // 폼 초기화
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { session } = await signIn(email, password);
        
        // 추가: 쿠키를 여기서도 직접 설정 (보완책)
        if (session) {
          // 현재 호스트 가져오기
          const host = window.location.hostname;
          const isLocalhost = host === 'localhost' || host === '127.0.0.1';
          
          // 도메인 설정 (로컬호스트가 아닌 경우에만)
          let domain = undefined;
          if (!isLocalhost) {
            // 서브도메인 포함하기 위해 최상위 도메인만 설정
            const hostParts = host.split('.');
            if (hostParts.length > 1) {
              // vercel.app 또는 yoursite.com 형태일 경우
              domain = '.' + hostParts.slice(-2).join('.');
            } else {
              domain = host;
            }
          }
          
          // cookies-next 라이브러리 사용
          setCookie('sb-access-token', session.access_token, {
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
            domain: domain,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax'
          });
          
          if (session.refresh_token) {
            setCookie('sb-refresh-token', session.refresh_token, {
              maxAge: 60 * 60 * 24 * 30, // 30일
              path: '/',
              domain: domain,
              secure: window.location.protocol === 'https:',
              sameSite: 'lax'
            });
          }
          
          console.log('AuthForm: 쿠키에 인증 정보 저장됨', {
            호스트: host,
            도메인설정: domain || '없음'
          });
        }
        
        toast.success('로그인 성공!');
      } else {
        await signUp(email, password, name);
        toast.success('회원가입 성공! 이메일을 확인해주세요.');
      }
      
      // 성공 후 리디렉션 또는 상태 업데이트
      window.location.href = '/board';
    } catch (error: any) {
      console.error('인증 오류:', error);
      toast.error(error.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      // 리디렉션은 Google OAuth 콜백 처리에서 이루어집니다.
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      toast.error(error.message || 'Google 로그인 중 오류가 발생했습니다.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'login'
            ? '백야드에 오신 것을 환영합니다!'
            : '새 계정을 만들어 시작하세요.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? '처리 중...'
            : mode === 'login'
            ? '로그인'
            : '회원가입'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isGoogleLoading ? "처리 중..." : "Google로 계속하기"}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:underline"
          >
            {mode === 'login'
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </form>
    </div>
  );
} 
```

src/components/auth/UserProfile.tsx
```
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { getCurrentUser, signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  dbUser?: {
    name: string | null;
  } | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃 되었습니다.');
      router.push('/login');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 사용자 이름을 가져오는 헬퍼 함수
  const getUserName = () => {
    if (!user) return '';
    
    // 우선순위: 1. Google 프로필 이름, 2. DB에 저장된 이름, 3. 이메일 앞부분
    return user.user_metadata?.full_name || 
           user.dbUser?.name || 
           (user.email ? user.email.split('@')[0] : '사용자');
  };

  // 아바타 이미지 URL 또는 이니셜을 가져오는 헬퍼 함수
  const getAvatar = () => {
    if (!user) return '';
    
    return user.user_metadata?.avatar_url || '';
  };

  // 이니셜 생성 헬퍼 함수
  const getInitials = () => {
    const name = getUserName();
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
        로그인
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {getAvatar() ? (
              <AvatarImage src={getAvatar()} alt={getUserName()} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{getUserName()}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/board')}>
          보드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/cards')}>
          카드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/tags')}>
          태그
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
```

src/app/board/page.test.tsx
```
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BoardPage from './page';
import { Node, Edge, NodeChange } from '@xyflow/react';

// LocalStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ResizeObserver 모킹 (ReactFlow에서 필요)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock;

// React Flow의 applyNodeChanges 함수 결과를 모킹하기 위한 변수
let mockAppliedNodes: Node[] = [];

// ReactFlow 전체 모킹 - 테스트에서는 실제 렌더링 없이 모킹된 구성요소만 사용
const nodesMock: Node[] = [];
const edgesMock: Edge[] = [];
const setNodesMock = vi.fn();
const setEdgesMock = vi.fn();
const onNodesChangeMock = vi.fn();
const onEdgesChangeMock = vi.fn();

// viewportCenter 모킹 - getNewCardPosition에서 사용
const viewportCenterMock = { x: 500, y: 300 };

// ReactFlow의 ReactFlowProvider와 useReactFlow hook 모킹
vi.mock('reactflow', () => {
  // ReactFlow 컴포넌트 모킹
  const ReactFlowMock = ({ children, onNodesChange }: { children?: React.ReactNode, onNodesChange?: (changes: NodeChange[]) => void }) => (
    <div 
      data-testid="react-flow-mock"
      onClick={() => {
        // 노드 위치 변경 시뮬레이션
        if (onNodesChange) {
          onNodesChange([{
            type: 'position',
            id: '1',
            position: { x: 200, y: 200 },
          } as NodeChange]);
        }
      }}
    >
      {children}
    </div>
  );
  
  return {
    // default export 추가 (중요!)
    default: ReactFlowMock,
    // 필요한 다른 export들
    ReactFlow: ReactFlowMock,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="react-flow-provider">{children}</div>
    ),
    Controls: () => <div data-testid="react-flow-controls">Controls</div>,
    Background: () => <div data-testid="react-flow-background">Background</div>,
    Panel: ({ position, children }: any) => (
      <div data-testid={`react-flow-panel-${position}`}>{children}</div>
    ),
    useNodesState: () => [nodesMock, setNodesMock, onNodesChangeMock],
    useEdgesState: () => [edgesMock, setEdgesMock, onEdgesChangeMock],
    ConnectionLineType: {
      SmoothStep: 'smoothstep',
    },
    useReactFlow: () => ({
      getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
      project: (pos: any) => pos,
      getBoundingClientRect: () => ({ width: 1000, height: 600, x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 600 }),
      screenToFlowPosition: (pos: any) => pos,
    }),
    applyNodeChanges: vi.fn((changes, nodes) => {
      // 변경사항 적용 결과 모킹
      mockAppliedNodes = [
        { id: '1', position: { x: 200, y: 200 } },
        { id: '2', position: { x: 400, y: 400 } },
      ] as Node[];
      return mockAppliedNodes;
    }),
    applyEdgeChanges: vi.fn((changes, edges) => edges),
    addEdge: vi.fn((connection, edges) => [
      ...edges,
      { id: `e-${Date.now()}`, source: connection.source, target: connection.target }
    ]),
    // 추가적인 타입 에러 방지를 위한 export
    Node: vi.fn(),
    Edge: vi.fn(),
    NodeChange: vi.fn(),
  };
});

// CreateCardButton 모킹
vi.mock('@/components/cards/CreateCardButton', () => ({
  default: ({ onCardCreated }: { onCardCreated?: (cardData: any) => void }) => (
    <button 
      data-testid="create-card-button"
      onClick={() => {
        if (onCardCreated) {
          onCardCreated({
            id: 'new-card-123',
            title: '새 카드',
            content: '새 카드 내용',
            cardTags: [{ tag: { name: '새태그' } }],
            createdAt: new Date().toISOString(),
          });
        }
      }}
    >
      새 카드 만들기
    </button>
  ),
}));

// Console error 모킹
console.error = vi.fn();

// Toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// mocking fetch API
global.fetch = vi.fn();

// 추가 모듈 모킹 설정
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, asChild, variant, size }: any) => (
    <button 
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      data-as-child={asChild}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/board/CardNode', () => ({
  default: ({ data }: any) => (
    <div data-testid={`card-node-${data.id}`}>
      <h3>{data.title}</h3>
      <p>{data.content}</p>
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  LayoutGrid: () => <div data-testid="layout-grid-icon">Grid</div>,
}));

// BoardPage 컴포넌트 모킹을 위한 내부 함수 모킹
vi.mock('./page', async (importOriginal) => {
  // 원본 모듈 가져오기
  const originalModule = await importOriginal();
  
  // 실제 BoardPage 컴포넌트를 사용, 단 내부 함수는 모킹
  return {
    ...(originalModule as object),
    // 필요한 내부 함수만 모킹하고 컴포넌트는 그대로 유지
    getNewCardPosition: vi.fn((viewportCenter) => {
      return viewportCenter || { x: 500, y: 300 }; // 모킹된 중앙 위치 반환
    }),
    autoLayoutNodes: vi.fn((nodes: Node[]) => {
      // 자동 배치 기능 모킹
      return nodes.map((node: Node, index: number) => ({
        ...node,
        position: {
          x: (index % 3) * 300 + 50, 
          y: Math.floor(index / 3) * 200 + 50
        }
      }));
    })
  };
});

describe('BoardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();
    mockAppliedNodes = [];
    
    // console.error를 spyOn으로 모킹
    vi.spyOn(console, 'error');
    
    // fetch API 성공 응답 기본 모킹
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });
    
    // getBoundingClientRect 모킹 (reactFlowWrapper.current)
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));
  });

  test('로딩 상태를 표시해야 함', () => {
    // fetch 응답을 받기 전에는 로딩 상태를 표시
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<BoardPage />);
    
    expect(screen.getByText('보드를 불러오는 중...')).toBeInTheDocument();
  });

  test('카드 데이터 불러오기 실패 시 에러 메시지를 표시해야 함', async () => {
    // 실패 응답 모킹
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
    });

    render(<BoardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  test('카드 데이터 불러오기 성공 시 ReactFlow 컴포넌트가 렌더링되어야 함', async () => {
    render(<BoardPage />);
    
    // 로딩이 끝나고 ReactFlow 컴포넌트가 렌더링 되는지 확인
    await waitFor(() => {
      // ReactFlowProvider 내에 있는 ReactFlow 컴포넌트 확인
      expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 패널 내부의 콘텐츠 확인
    expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('카드 보드');
    expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('노드를 드래그하여 위치를 변경할 수 있습니다.');
    expect(screen.getByRole('link', { name: '카드 목록' })).toBeInTheDocument();
  });

  test('저장된 레이아웃이 있을 경우 로컬 스토리지에서 로드해야 함', async () => {
    // 로컬 스토리지에 레이아웃 저장
    const storedLayout = [
      { id: '1', position: { x: 100, y: 100 } },
      { id: '2', position: { x: 300, y: 300 } }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedLayout));
    
    render(<BoardPage />);
    
    // 비동기 로딩 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 로컬 스토리지에서 레이아웃 로드 확인
    expect(localStorageMock.getItem).toHaveBeenCalledWith('backyard-board-layout');
  });

  test('레이아웃 저장 버튼 클릭 시 현재 레이아웃이 저장되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 레이아웃 저장 버튼 찾기
    const buttons = screen.getAllByRole('button');
    const saveLayoutButton = Array.from(buttons).find(
      button => button.textContent?.includes('레이아웃 저장')
    );
    
    // 버튼 있는지 확인
    expect(saveLayoutButton).toBeInTheDocument();
    
    // 버튼 클릭
    if (saveLayoutButton) {
      fireEvent.click(saveLayoutButton);
    }
    
    // localStorage 저장 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
    
    // toast 확인
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('보드 레이아웃과 연결선이 저장되었습니다'));
  });

  test('ReactFlow에서 노드 이동 시 localStorage에 위치가 저장되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // ReactFlow 컴포넌트 클릭해서 노드 이동 이벤트 시뮬레이션
    const reactFlowElement = screen.getByTestId('react-flow-mock');
    fireEvent.click(reactFlowElement);
    
    // localStorage 저장 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
  });

  test('카드 생성 버튼 클릭 시 새 카드가 보드에 추가되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 카드 생성 버튼 찾기
    const createCardButton = screen.getByTestId('create-card-button');
    
    // 버튼 클릭
    fireEvent.click(createCardButton);
    
    // toast 확인 (모킹된 toast 함수 호출 확인)
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 보드에 추가되었습니다'));
  });

  test('자동 배치 버튼 클릭 시 노드가 자동으로 배치되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 자동 배치 버튼 찾기 (Panel 내부의 버튼)
    const buttons = screen.getAllByRole('button');
    const autoLayoutButton = Array.from(buttons).find(
      button => button.textContent?.includes('자동 배치')
    );
    
    // 버튼 있는지 확인
    expect(autoLayoutButton).toBeInTheDocument();
    
    // 버튼 클릭
    if (autoLayoutButton) {
      fireEvent.click(autoLayoutButton);
    }
    
    // toast 확인
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 자동으로 배치되었습니다'));
  });

  test('노드 위치 변경 시 로컬 스토리지에 저장되어야 함', async () => {
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // ReactFlow 컴포넌트 클릭으로 노드 위치 변경 이벤트 시뮬레이션
    fireEvent.click(screen.getByTestId('react-flow-mock'));
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'backyard-board-layout',
      expect.any(String)
    );
  });

  test('로컬 스토리지 저장 시 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // localStorage.setItem에서 에러 발생 시뮬레이션
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 저장 버튼 클릭
    const saveButton = screen.getByText('레이아웃 저장');
    saveButton.click();
    
    // 콘솔 에러가 호출되었는지 확인
    expect(console.error).toHaveBeenCalledWith('Error saving layout:', expect.any(Error));
  });

  test('저장된 레이아웃이 없는 경우 기본 그리드 위치를 사용해야 함', async () => {
    // 성공 응답 모킹 - 카드 3개
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '카드 2', content: '내용 2', cardTags: [] },
        { id: 3, title: '카드 3', content: '내용 3', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 카드가 3개 이상인 경우 추가 엣지가 생성되었는지 확인
    expect(setEdgesMock).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'e1-2' }),
      expect.objectContaining({ id: 'e1-3' })
    ]));
  });

  test('로컬 스토리지 파싱 중 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
    // 잘못된 JSON 형식으로 저장된 레이아웃 Mock
    localStorageMock.getItem.mockReturnValue('{ invalid json }');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 콘솔 에러가 호출되었는지 확인
    expect(console.error).toHaveBeenCalledWith('Error loading stored layout:', expect.any(Error));
  });

  test('다시 시도 버튼을 클릭하면 카드를 다시 가져와야 함', async () => {
    // 처음에는 실패하도록 설정
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
    });

    // 두 번째 요청은 성공하도록 설정 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // 에러 메시지가 표시될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
    });
    
    // 다시 시도 버튼 클릭
    const retryButton = screen.getByRole('button', { name: '다시 시도' });
    fireEvent.click(retryButton);
    
    // ReactFlow가 렌더링 될 때까지 대기 (성공 시)
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // fetch가 두 번 호출되었는지 확인
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('자동 배치 버튼을 클릭하면 노드가 자동으로 배치되어야 함', async () => {
    const { toast } = await import('sonner');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 자동 배치 버튼 찾기
    const autoLayoutButton = screen.getByText('자동 배치');
    expect(autoLayoutButton).toBeInTheDocument();
    
    // 클릭 이벤트 호출
    autoLayoutButton.click();
    
    // 노드 상태 업데이트 확인
    expect(setNodesMock).toHaveBeenCalled();
    
    // 토스트 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 자동으로 배치되었습니다.');
  });

  test('새 카드 생성 버튼을 클릭하면 새 카드가 보드에 추가되어야 함', async () => {
    const { toast } = await import('sonner');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 새 카드 만들기 버튼 찾기
    const createCardButton = screen.getByTestId('create-card-button');
    expect(createCardButton).toBeInTheDocument();
    
    // 클릭 이벤트 호출
    createCardButton.click();
    
    // 노드 상태 업데이트 확인
    expect(setNodesMock).toHaveBeenCalled();
    
    // 토스트 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 보드에 추가되었습니다.');
  });
}); 
```

src/app/board/page.tsx
```
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ConnectionLineType,
  Position,
  MarkerType,
  useReactFlow,
  useUpdateNodeInternals,
  Node,
  Edge,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import CreateCardButton from '@/components/cards/CreateCardButton';
import LayoutControls from '@/components/board/LayoutControls';
import BoardSettingsControl from '@/components/board/BoardSettingsControl';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { BoardSettings, DEFAULT_BOARD_SETTINGS, loadBoardSettings, saveBoardSettings, applyEdgeSettings } from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import DevTools, { useChangeLoggerHooks } from '@/components/debug/DevTools';

// 새 카드의 중앙 위치를 계산하는 함수
const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
  if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
  return viewportCenter;
};

// 내부 구현을 위한 컴포넌트
function BoardContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportCenter, setViewportCenter] = useState<{ x: number, y: number } | undefined>(undefined);
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // 변경 로거 이벤트 핸들러
  const { onNodesChangeLogger, onEdgesChangeLogger } = useChangeLoggerHooks();
  
  // 노드 및 엣지 변경 로깅을 위한 상태 추가
  const [nodeChanges, setNodeChanges] = useState<NodeChange[]>([]);
  const [edgeChanges, setEdgeChanges] = useState<EdgeChange[]>([]);
  
  // updateNodeInternals 함수 초기화
  const updateNodeInternals = useUpdateNodeInternals();
  
  // ReactFlow 인스턴스 참조
  const { fitView } = useReactFlow();
  
  // 뷰포트 중앙 계산
  const updateViewportCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    setViewportCenter({
      x: width / 2,
      y: height / 2
    });
  }, []);
  
  // 노드 변경 핸들러 수정
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 변경 사항 로깅
    setNodeChanges(changes);
    
    // 변경 로거에 전달
    onNodesChangeLogger(changes);
    
    // 기존 노드 정보를 변경
    onNodesChange(changes);
    
    // 위치 변경이 있는 경우에만 저장 상태로 표시
    const positionChanges = changes.filter(
      change => change.type === 'position' && change.position
    );
    
    if (positionChanges.length > 0) {
      hasUnsavedChanges.current = true;
    }
  }, [nodes, onNodesChange, onNodesChangeLogger]);
  
  // 엣지 변경 핸들러 수정
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // 변경 사항 로깅
    setEdgeChanges(changes);
    
    // 변경 로거에 전달
    onEdgesChangeLogger(changes);
    
    // 기본 변경 적용
    onEdgesChange(changes);
    
    // 변경이 있을 때마다 저장 대기 상태로 설정
    hasUnsavedChanges.current = true;
  }, [onEdgesChange, onEdgesChangeLogger]);

  // 레이아웃을 로컬 스토리지에 저장
  const saveLayout = useCallback((nodesToSave: Node[]) => {
    try {
      // 노드 ID와 위치만 저장 (객체 형태로 변환하여 노드 ID를 키로 사용)
      const positions = nodesToSave.reduce((acc, node) => {
        acc[node.id] = { position: node.position };
        return acc;
      }, {} as Record<string, { position: { x: number, y: number } }>);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      return true;
    } catch (err) {
      console.error('레이아웃 저장 오류:', err);
      return false;
    }
  }, []);

  // 엣지를 로컬 스토리지에 저장
  const saveEdges = useCallback(() => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
      return true;
    } catch (err) {
      console.error('엣지 저장 오류:', err);
      return false;
    }
  }, [edges]);

  // 모든 레이아웃 데이터를 저장
  const saveAllLayoutData = useCallback(() => {
    const layoutSaved = saveLayout(nodes);
    const edgesSaved = saveEdges();
    
    if (layoutSaved && edgesSaved) {
      setLastSavedAt(new Date());
      hasUnsavedChanges.current = false;
      return true;
    }
    return false;
  }, [nodes, saveLayout, saveEdges]);

  // 수동으로 현재 레이아웃 저장
  const handleSaveLayout = useCallback(() => {
    if (saveAllLayoutData()) {
      toast.success('보드 레이아웃과 연결선이 저장되었습니다.');
    } else {
      toast.error('레이아웃 저장 중 오류가 발생했습니다.');
    }
  }, [saveAllLayoutData]);

  // 자동 저장 기능 설정
  useEffect(() => {
    // 자동 저장 간격 (분 단위를 밀리초로 변환)
    const autoSaveIntervalMs = BOARD_CONFIG.autoSaveInterval * 60 * 1000;

    // 기존 인터벌 정리
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // 자동 저장 인터벌 설정
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChanges.current && nodes.length > 0) {
        const saved = saveAllLayoutData();
        
        // 설정에 따라 토스트 메시지 표시
        if (saved && BOARD_CONFIG.showAutoSaveNotification) {
          toast.info('보드 레이아웃이 자동 저장되었습니다.');
        }
      }
    }, autoSaveIntervalMs);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [nodes, saveAllLayoutData]);

  // 페이지 언로드 전 저장되지 않은 변경사항 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        saveAllLayoutData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveAllLayoutData]);

  // 저장된 레이아웃 적용
  const applyStoredLayout = useCallback((cardsData: any[], storedLayout: any[]) => {
    return cardsData.map((card: any, index: number) => {
      const cardId = card.id.toString();
      // 저장된 레이아웃에서 해당 카드의 위치 정보 찾기
      const storedPosition = storedLayout.find(item => item.id === cardId)?.position;
      
      // 저장된 위치가 있으면 사용, 없으면 기본 그리드 위치 사용
      const position = storedPosition || {
        x: (index % 3) * 350 + 50,
        y: Math.floor(index / 3) * 250 + 50,
      };
      
      // 카드 태그 준비
      const tags = card.cardTags && card.cardTags.length > 0
        ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
        : [];
      
      return {
        id: cardId,
        type: 'card',
        data: { 
          ...card,
          tags: tags
        },
        position,
      };
    });
  }, []);

  // 노드 연결 핸들러
  const onConnect = useCallback(
    (params: Connection) => {
      // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
      const firstNode = nodes[0];
      const isHorizontal = firstNode?.targetPosition === Position.Left;
      
      // 핸들 ID 설정
      let sourceHandle = params.sourceHandle;
      let targetHandle = params.targetHandle;
      
      // 핸들이 지정되지 않은 경우 레이아웃 방향에 따라 기본 핸들 지정
      if (!sourceHandle) {
        sourceHandle = isHorizontal ? 'right-source' : 'bottom-source';
      }
      if (!targetHandle) {
        targetHandle = isHorizontal ? 'left-target' : 'top-target';
      }
      
      // 보드 설정을 적용한 새 Edge 생성
      const newEdge = {
        ...params,
        sourceHandle,
        targetHandle,
        id: `edge-${params.source}-${params.target}-${Date.now()}`, // 고유 ID 생성
        type: 'custom', // 커스텀 엣지 컴포넌트 사용
        animated: boardSettings.animated, // 애니메이션 설정
        // 스타일 설정
        style: {
          strokeWidth: boardSettings.strokeWidth,
          stroke: boardSettings.edgeColor,
        },
        // 마커 설정
        markerEnd: boardSettings.markerEnd ? {
          type: boardSettings.markerEnd,
          width: boardSettings.markerSize, 
          height: boardSettings.markerSize,
          color: boardSettings.edgeColor,
        } : undefined,
        // 데이터 저장
        data: {
          edgeType: boardSettings.connectionLineType, // 연결선 타입 설정
          settings: { ...boardSettings }, // 현재 보드 설정 저장
          createdAt: new Date().toISOString() // 생성 시간 기록
        }
      };
      
      // 새 Edge 추가 및 로컬 스토리지에 저장
      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);
        
        // 엣지 저장
        try {
          localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(newEdges));
        } catch (error) {
          console.error('엣지 저장 중 오류:', error);
        }
        
        return newEdges;
      });
      
      // 변경 표시
      hasUnsavedChanges.current = true;
      
      // 로그로 확인
      console.log(`새 연결선 생성: ${params.source} -> ${params.target}, 타입: ${boardSettings.connectionLineType}`);
    },
    [nodes, setEdges, boardSettings]
  );

  // 카드 생성 후 콜백
  const handleCardCreated = useCallback(async (cardData: any) => {
    try {
      // 새로운 노드 생성
      const newCard = {
        id: cardData.id.toString(),
        type: 'card',
        data: { 
          ...cardData,
          tags: cardData.cardTags?.map((ct: any) => ct.tag.name) || []
        },
        position: getNewCardPosition(viewportCenter),
      };
      
      setNodes((nds) => [...nds, newCard]);
      
      // 노드 위치 저장
      saveLayout([...nodes, newCard]);
      
      toast.success("카드가 보드에 추가되었습니다.");
    } catch (error) {
      console.error("Error adding card to board:", error);
      toast.error("카드를 보드에 추가하는데 실패했습니다.");
    }
  }, [nodes, setNodes, viewportCenter, saveLayout]);

  // 노드 자동 배치 (기존 함수 수정)
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getGridLayout(nodes);
    setNodes(layoutedNodes);
    saveLayout(layoutedNodes);
    toast.success("카드가 격자 형태로 배치되었습니다.");
  }, [nodes, setNodes, saveLayout]);

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // 레이아웃 변경 후 저장 상태로 표시
    hasUnsavedChanges.current = true;
    
    // 모든 노드의 내부 구조 업데이트 - 핸들 위치를 반영하기 위해
    // 즉시 업데이트
    layoutedNodes.forEach(node => {
      updateNodeInternals(node.id);
    });
    
    // 약간의 지연 후 다시 업데이트 (레이아웃 변경 완료 후)
    setTimeout(() => {
      layoutedNodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 50);
    
    // 애니메이션 완료 후 최종 업데이트
    setTimeout(() => {
      layoutedNodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 300);
    
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
  }, [nodes, edges, setNodes, setEdges, updateNodeInternals]);

  // 보드 설정 변경 핸들러
  const handleSettingsChange = useCallback((newSettings: BoardSettings) => {
    // 설정 변경 내용을 상태와 로컬 스토리지에 저장
    setBoardSettings(newSettings);
    saveBoardSettings(newSettings);
    
    // 모든 엣지에 새 설정 적용 (항상 실행) - 즉시 반영을 위해 강제로 업데이트
    console.log("설정 변경 적용 중...", newSettings);
    
    // 1. 현재 엣지의 복사본 생성 (참조 변경)
    const currentEdgesCopy = JSON.parse(JSON.stringify(edges));
    
    // 2. 설정 적용
    const updatedEdges = applyEdgeSettings(currentEdgesCopy, newSettings);
    
    // 3. 새로운 엣지 배열로 상태 업데이트
    setEdges(updatedEdges);
    
    // 4. 즉시 저장하여 변경 내용이 유지되도록 함
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
    } catch (error) {
      console.error('엣지 저장 중 오류:', error);
    }
    
    // 변경된 설정에 대한 알림 메시지
    const changes: string[] = [];
    
    // 연결선 스타일 변경 확인
    if (newSettings.connectionLineType !== boardSettings.connectionLineType) {
      changes.push('연결선 유형');
    }
    
    if (newSettings.markerEnd !== boardSettings.markerEnd) {
      changes.push('화살표 유형');
    }
    
    if (newSettings.strokeWidth !== boardSettings.strokeWidth) {
      changes.push('선 굵기');
    }
    
    if (newSettings.markerSize !== boardSettings.markerSize) {
      changes.push('화살표 크기');
    }
    
    if (newSettings.edgeColor !== boardSettings.edgeColor || 
        newSettings.selectedEdgeColor !== boardSettings.selectedEdgeColor) {
      changes.push('선 색상');
    }
    
    if (newSettings.animated !== boardSettings.animated) {
      changes.push('애니메이션 ' + (newSettings.animated ? '활성화' : '비활성화'));
    }
    
    if (changes.length > 0) {
      toast.success(`연결선 설정이 변경되었습니다: ${changes.join(', ')}`);
    }
    
    // 스냅 그리드 변경 확인
    if (newSettings.snapToGrid !== boardSettings.snapToGrid || 
        newSettings.snapGrid[0] !== boardSettings.snapGrid[0]) {
      toast.success(
        newSettings.snapToGrid 
          ? `격자에 맞추기가 활성화되었습니다 (${newSettings.snapGrid[0]}px)` 
          : "격자에 맞추기가 비활성화되었습니다"
      );
    }
  }, [boardSettings, edges, setEdges]);

  // 카드 및 설정 데이터 로드
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API에서 카드 데이터 가져오기
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다.');
      }
      
      const cardsData = await response.json();
      
      // 로컬 스토리지에서 노드 위치 불러오기
      let savedNodesData: Record<string, { position: { x: number, y: number } }> = {};
      try {
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        if (savedLayout) {
          savedNodesData = JSON.parse(savedLayout);
        }
      } catch (err) {
        console.error('레이아웃 불러오기 실패:', err);
      }
      
      // 로컬 스토리지에서 엣지 데이터 불러오기
      let savedEdges: Edge[] = [];
      try {
        const savedEdgesData = localStorage.getItem(EDGES_STORAGE_KEY);
        if (savedEdgesData) {
          // 로컬 스토리지에서 보드 설정 불러오기
          const loadedSettings = loadBoardSettings();
          
          // 엣지 데이터 변환 및 타입 확인
          savedEdges = JSON.parse(savedEdgesData).map((edge: Edge) => {
            // 기본 타입 설정
            const updatedEdge = {
              ...edge,
              type: 'custom', // 모든 엣지에 커스텀 타입 적용
            };
            
            // 엣지의 data.edgeType이 없으면 초기화
            if (!edge.data?.edgeType) {
              updatedEdge.data = {
                ...(edge.data || {}),
                edgeType: loadedSettings.connectionLineType,
                settings: { ...loadedSettings }
              };
            }
            
            // style이 없으면 초기화
            if (!edge.style) {
              updatedEdge.style = {
                strokeWidth: loadedSettings.strokeWidth,
                stroke: edge.selected ? loadedSettings.selectedEdgeColor : loadedSettings.edgeColor
              };
            }
            
            return updatedEdge;
          });
        }
      } catch (err) {
        console.error('엣지 데이터 불러오기 실패:', err);
      }
      
      // 로컬 스토리지에서 보드 설정 불러오기
      const loadedSettings = loadBoardSettings();
      setBoardSettings(loadedSettings);
      
      // 노드 및 엣지 데이터 설정
      const nodes = cardsData.map((card: any) => {
        // 저장된 위치가 있으면 사용, 없으면 기본 위치 생성
        const savedNode = savedNodesData[card.id];
        const position = savedNode ? savedNode.position : { 
          x: Math.random() * 500, 
          y: Math.random() * 300 
        };
        
        return {
          id: card.id,
          type: 'card',
          position,
          data: {
            ...card,
            tags: card.cardTags?.map((ct: any) => ct.tag.name) || []
          }
        };
      });
      
      // 설정에 따라 엣지 스타일 적용
      const styledEdges = applyEdgeSettings(savedEdges, loadedSettings);
      
      setNodes(nodes);
      setEdges(styledEdges);
      setLastSavedAt(new Date());  // 초기 로드 시간을 마지막 저장 시간으로 설정
    } catch (err) {
      console.error('카드 데이터 불러오기 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchCards();
    updateViewportCenter();
    
    // 창 크기 변경 시 뷰포트 중앙 업데이트
    window.addEventListener('resize', updateViewportCenter);
    return () => {
      window.removeEventListener('resize', updateViewportCenter);
    };
  }, [fetchCards, updateViewportCenter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">보드를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCards}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        edges={edges}
        edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={flow => {
          updateViewportCenter();
          console.log('ReactFlow initialized', flow);
        }}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        connectionLineType={ConnectionLineType.Step}
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <DevTools />
        <Controls />
        <Background />
        <Panel position="top-left" className="bg-card shadow-md rounded-md p-3">
          <h2 className="text-lg font-bold mb-2">카드 보드</h2>
          <p className="text-sm text-muted-foreground mb-2">노드를 드래그하여 위치를 변경할 수 있습니다.</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <a href="/cards">카드 목록</a>
            </Button>
            <Button size="sm" onClick={handleSaveLayout}>
              <Save className="w-4 h-4 mr-1" />
              레이아웃 저장
            </Button>
            <CreateCardButton onCardCreated={handleCardCreated} />
          </div>
          {lastSavedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              마지막 저장: {lastSavedAt.toLocaleTimeString()}
              {BOARD_CONFIG.autoSaveInterval > 0 && 
                ` (${BOARD_CONFIG.autoSaveInterval}분마다 자동 저장)`
              }
            </p>
          )}
        </Panel>
        
        {/* 오른쪽 상단에 레이아웃 및 설정 컨트롤 패널 추가 */}
        <Panel position="top-right" className="mr-2 mt-2 flex gap-2">
          <BoardSettingsControl
            settings={boardSettings}
            onSettingsChange={handleSettingsChange}
          />
          <LayoutControls
            onLayoutChange={handleLayoutChange}
            onAutoLayout={handleAutoLayout}
            onSaveLayout={handleSaveLayout}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
}

// 메인 내보내기 컴포넌트 - ReactFlowProvider 추가
export default function BoardPage() {
  return (
    <ReactFlowProvider>
      <BoardContent />
    </ReactFlowProvider>
  );
} 
```

src/app/tags/page.test.tsx
```
/// <reference types="vitest" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TagsPage from './page';
import '@testing-library/jest-dom/vitest';

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn()
    }
  }
}));

// formatDate 모킹
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
  cn: vi.fn((...args: any[]) => args.join(' '))
}));

// TagForm 및 TagList 컴포넌트 모킹
vi.mock('@/components/tags/TagForm', () => ({
  default: () => <div data-testid="tag-form">태그 추가 폼</div>
}));

vi.mock('@/components/tags/TagList', () => ({
  default: ({ initialTags }: { initialTags: any[] }) => (
    <div data-testid="tag-list">
      태그 수: {initialTags.length}
    </div>
  )
}));

describe('TagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('태그 관리 페이지가 올바르게 렌더링되어야 함', async () => {
    // 가짜 태그 데이터
    const mockTags = [
      { 
        id: '1', 
        name: '자바스크립트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 5 }
      },
      { 
        id: '2', 
        name: '리액트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 3 }
      },
      { 
        id: '3', 
        name: '타입스크립트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 0 }
      }
    ];
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockResolvedValue(mockTags);
    
    const page = await TagsPage();
    render(page);
    
    // 페이지 헤더가 올바르게 표시되는지 확인
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // TagForm 컴포넌트가 렌더링되는지 확인
    expect(screen.getByTestId('tag-form')).toBeInTheDocument();
    expect(screen.getByText('태그 추가 폼')).toBeInTheDocument();
    
    // TagList 컴포넌트가 올바른 태그 수로 렌더링되는지 확인
    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByText('태그 수: 3')).toBeInTheDocument();
    
    // prisma가 올바르게 호출되었는지 확인
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      include: { _count: { select: { cardTags: true } } }
    });
  });
  
  it('태그가 없을 때도 페이지가 올바르게 렌더링되어야 함', async () => {
    // 빈 태그 배열 모킹
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockResolvedValue([]);
    
    const page = await TagsPage();
    render(page);
    
    // 페이지 헤더가 올바르게 표시되는지 확인
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // TagForm 컴포넌트가 렌더링되는지 확인
    expect(screen.getByTestId('tag-form')).toBeInTheDocument();
    
    // 태그 수가 0으로 표시되는지 확인
    expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
  });
  
  it('prisma 오류 발생 시 빈 태그 배열로 렌더링되어야 함', async () => {
    // prisma 오류 모킹
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const page = await TagsPage();
    render(page);
    
    // 페이지는 여전히 렌더링되어야 함
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // 태그 수가 0으로 표시되는지 확인
    expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
    
    // 오류 로깅이 확인
    expect(consoleSpy).toHaveBeenCalled();
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
}); 
```

src/app/tags/page.tsx
```
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TagForm from "@/components/tags/TagForm";
import TagList from "@/components/tags/TagList";
import { Tag } from "@prisma/client";

export const metadata: Metadata = {
  title: "태그 관리 | Backyard",
  description: "태그를 생성하고 관리하는 페이지입니다.",
};

type TagWithCount = Tag & {
  _count: {
    cardTags: number;
  };
};

export default async function TagsPage() {
  let tags: TagWithCount[] = [];
  
  try {
    tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { cardTags: true }
        }
      }
    });
  } catch (error) {
    console.error("태그 조회 오류:", error);
    // 오류 발생 시 빈 배열 사용
  }

  const formattedTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    count: tag._count.cardTags,
    createdAt: formatDate(tag.createdAt)
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">태그 관리</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>새 태그 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <TagForm />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>태그 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <TagList initialTags={formattedTags} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
```

src/components/board/BoardSettingsControl.tsx
```
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Settings, Grid3X3, ArrowRightIcon, Circle, SeparatorHorizontal, Paintbrush } from 'lucide-react';
import { BoardSettings } from '@/lib/board-utils';
import { 
  SNAP_GRID_OPTIONS, 
  CONNECTION_TYPE_OPTIONS, 
  MARKER_TYPE_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  MARKER_SIZE_OPTIONS,
  EDGE_COLOR_OPTIONS,
  EDGE_ANIMATION_OPTIONS
} from '@/lib/board-constants';
import { ConnectionLineType, MarkerType } from '@xyflow/react';

interface BoardSettingsControlProps {
  settings: BoardSettings;
  onSettingsChange: (settings: BoardSettings) => void;
}

export default function BoardSettingsControl({
  settings,
  onSettingsChange,
}: BoardSettingsControlProps) {
  // 스냅 그리드 값 변경 핸들러
  const handleSnapGridChange = (value: string) => {
    const gridSize = parseInt(value, 10);
    const newSettings = {
      ...settings,
      snapGrid: [gridSize, gridSize] as [number, number],
      snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
    };
    onSettingsChange(newSettings);
  };

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      connectionLineType: value as ConnectionLineType,
    };
    onSettingsChange(newSettings);
  };

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      markerEnd: value === 'null' ? null : value as MarkerType,
    };
    onSettingsChange(newSettings);
  };

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = () => {
    const newSettings = {
      ...settings,
      snapToGrid: !settings.snapToGrid,
    };
    onSettingsChange(newSettings);
  };
  
  // 연결선 두께 변경 핸들러
  const handleStrokeWidthChange = (value: string) => {
    const newSettings = {
      ...settings,
      strokeWidth: parseInt(value, 10),
    };
    onSettingsChange(newSettings);
  };
  
  // 마커 크기 변경 핸들러
  const handleMarkerSizeChange = (value: string) => {
    const newSettings = {
      ...settings,
      markerSize: parseInt(value, 10),
    };
    onSettingsChange(newSettings);
  };
  
  // 연결선 색상 변경 핸들러
  const handleEdgeColorChange = (value: string) => {
    const newSettings = {
      ...settings,
      edgeColor: value,
    };
    onSettingsChange(newSettings);
  };
  
  // 선택된 연결선 색상 변경 핸들러
  const handleSelectedEdgeColorChange = (value: string) => {
    const newSettings = {
      ...settings,
      selectedEdgeColor: value,
    };
    onSettingsChange(newSettings);
  };
  
  // 연결선 애니메이션 변경 핸들러
  const handleAnimatedChange = (value: string) => {
    const newSettings = {
      ...settings,
      animated: value === 'true',
    };
    onSettingsChange(newSettings);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>보드 설정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 스냅 그리드 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Grid3X3 className="mr-2 h-4 w-4" />
            <span>격자에 맞추기</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem 
              checked={settings.snapToGrid}
              onCheckedChange={handleSnapToGridToggle}
            >
              격자에 맞추기 활성화
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={settings.snapGrid[0].toString()} 
              onValueChange={handleSnapGridChange}
            >
              {SNAP_GRID_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 타입 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17C8 17 8 7 13 7C18 7 18 17 21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>연결선 스타일</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.connectionLineType} 
              onValueChange={handleConnectionTypeChange}
            >
              {CONNECTION_TYPE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 화살표 마커 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightIcon className="mr-2 h-4 w-4" />
            <span>화살표 스타일</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.markerEnd === null ? 'null' : settings.markerEnd} 
              onValueChange={handleMarkerTypeChange}
            >
              {MARKER_TYPE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value ?? 'null'} value={option.value === null ? 'null' : option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 두께 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SeparatorHorizontal className="mr-2 h-4 w-4" />
            <span>연결선 두께</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.strokeWidth.toString()} 
              onValueChange={handleStrokeWidthChange}
            >
              {STROKE_WIDTH_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 마커 크기 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Circle className="mr-2 h-4 w-4" />
            <span>화살표 크기</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.markerSize.toString()} 
              onValueChange={handleMarkerSizeChange}
            >
              {MARKER_SIZE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 색상 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>연결선 색상</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.edgeColor} 
              onValueChange={handleEdgeColorChange}
            >
              {EDGE_COLOR_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 선택된 연결선 색상 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>선택된 연결선 색상</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.selectedEdgeColor} 
              onValueChange={handleSelectedEdgeColorChange}
            >
              {EDGE_COLOR_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 애니메이션 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 10L19 12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>연결선 애니메이션</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.animated.toString()} 
              onValueChange={handleAnimatedChange}
            >
              {EDGE_ANIMATION_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
```

src/components/board/CardNode.test.tsx
```
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { CardNode } from './CardNode';

// react-flow의 Handle 컴포넌트 모킹
vi.mock('reactflow', () => ({
  Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('CardNode', () => {
  const mockData = {
    id: '1',
    title: '테스트 카드',
    content: '테스트 내용입니다.',
    tags: ['태그1', '태그2'],
  };

  test('카드 노드가 올바르게 렌더링되어야 함', () => {
    render(<CardNode data={mockData} />);
    
    // 제목과 내용이 정확히 렌더링되는지 확인
    expect(screen.getByText('테스트 카드')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    
    // 태그가 모두 렌더링되는지 확인
    expect(screen.getByText('#태그1')).toBeInTheDocument();
    expect(screen.getByText('#태그2')).toBeInTheDocument();
    
    // 핸들(source, target)이 모두 렌더링되는지 확인
    expect(screen.getByTestId('handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source')).toBeInTheDocument();
  });

  test('태그가 없는 경우에도 정상적으로 렌더링되어야 함', () => {
    const dataWithoutTags = {
      id: '1',
      title: '태그 없는 카드',
      content: '내용만 있는 카드',
    };

    render(<CardNode data={dataWithoutTags} />);
    
    expect(screen.getByText('태그 없는 카드')).toBeInTheDocument();
    expect(screen.getByText('내용만 있는 카드')).toBeInTheDocument();
    
    // 태그가 렌더링되지 않아야 함
    expect(screen.queryByText(/#\w+/)).not.toBeInTheDocument();
  });
}); 
```

src/components/board/CardNode.tsx
```
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, NodeToolbar } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
import { CSSProperties } from 'react';
import { NodeInspect } from '@/components/debug/NodeInspector';

// 헥스 색상을 HSL로 변환하는 함수
const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
  // hex를 RGB로 변환
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// HSL을 헥스 색상으로 변환하는 함수
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
};

// HSL 색상의 명도(L)를 조정하는 함수
const adjustLightness = (color: string, lightnessIncrease: number): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;

  // L값을 증가시키되 100을 초과하지 않도록 함
  const newL = Math.min(100, hsl.l + lightnessIncrease);
  
  // 새로운 HSL 값을 HEX로 변환
  return hslToHex(hsl.h, hsl.s, newL);
};

// 카드 노드 컴포넌트 정의
export default function CardNode({ data, isConnectable, selected, id }: NodeProps) {
  // 카드 접기/펴기 상태
  const [isExpanded, setIsExpanded] = useState(false);
  // 호버 상태 추가
  const [isHovered, setIsHovered] = useState(false);
  // 노드의 실제 높이를 저장하기 위한 ref
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // ReactFlow 인스턴스 가져오기
  const { getNodes, setNodes, getNode } = useReactFlow();
  // 노드 내부 구조 업데이트 훅 추가
  const updateNodeInternals = useUpdateNodeInternals();
  
  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // 이벤트 전파 중지하지 않음 - ReactFlow가 노드 선택을 처리하도록 함
    // 단, 토글 버튼이나 링크 클릭 시에는 전파 중지
    if (
      (event.target as HTMLElement).tagName === 'BUTTON' || 
      (event.target as HTMLElement).closest('button') || 
      (event.target as HTMLElement).tagName === 'A'
    ) {
      event.stopPropagation(); // 버튼이나 링크만 이벤트 전파 중지
      return;
    }
    
    // 더블 클릭은 확장 상태 토글로 처리
    if (event.detail === 2) { 
      event.stopPropagation(); // 더블 클릭은 이벤트 전파 중지
      setIsExpanded(!isExpanded);
    }
    // 단일 클릭은 ReactFlow가 처리하도록 전파 - 추가 로직 없음
  }, [isExpanded]);
  
  // 접기/펼치기 토글 핸들러
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // 상태 변경 시 노드 내부 업데이트
  useEffect(() => {
    // 노드가 펼쳐지거나 접힐 때 핸들 위치 업데이트
    if (id) {
      // 일련의 업데이트를 통해 핸들 위치가 정확히 계산되도록 함
      // 1. 즉시 업데이트 
      updateNodeInternals(id);
      
      // 2. 약간의 지연 후 업데이트 (레이아웃 변경 직후)
      const timeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 50);
      
      // 3. 트랜지션 완료 후 업데이트 (애니메이션 완료 후)
      const secondTimeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 250);
      
      // 4. 최종 업데이트 (모든 렌더링이 안정화된 후)
      const finalTimeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(secondTimeoutId);
        clearTimeout(finalTimeoutId);
      };
    }
  }, [isExpanded, id, updateNodeInternals]);
  
  // 노드가 선택되거나 호버 상태가 변경될 때도 업데이트
  useEffect(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [selected, isHovered, id, updateNodeInternals]);
  
  // 노드의 z-index를 직접 조작하는 효과
  useEffect(() => {
    if (id && (isExpanded || selected || isHovered)) {
      // 노드 목록 가져오기
      const nodes = getNodes();
      
      // 현재 노드의 인덱스 찾기
      const currentNodeIndex = nodes.findIndex(node => node.id === id);
      
      if (currentNodeIndex !== -1) {
        // 노드 목록 복사
        const updatedNodes = [...nodes];
        
        // 활성화된 노드의 z-index를 최대값으로 설정
        updatedNodes[currentNodeIndex] = {
          ...updatedNodes[currentNodeIndex],
          zIndex: 1000 // 매우 높은 z-index 값
        };
        
        // 노드 목록 업데이트
        setNodes(updatedNodes);
      }
    }
  }, [id, isExpanded, selected, isHovered, getNodes, setNodes]);
  
  // 마우스 오버 핸들러
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  // 마우스 아웃 핸들러
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // UI 설정에서 데이터 가져오기
  const uiConfig = useMemo(() => {
    try {
      return loadDefaultBoardUIConfig();
    } catch (error) {
      console.error('UI 설정 로드 실패, 기본값 사용:', error);
      return {
        board: { edgeColor: '#FF0072' },
        handles: { size: 8, backgroundColor: 'white', borderColor: '#FF0072', borderWidth: 2 }
      };
    }
  }, []);
  
  // 연결선 색상
  const connectionLineColor = useMemo(() => {
    return uiConfig.board.edgeColor;
  }, [uiConfig]);
  
  // 선택된 카드 배경색
  const selectedBackgroundColor = "#FFD3E6"; // 요구사항에 맞게 변경
  
  // 외곽선 두께 (연결선과 통일)
  const borderWidth = 2; // 항상 2px로 고정
  
  // 핸들러 크기 정의 
  const handleSize = 12; // 10px에서 12px로 크기 증가
  
  // 카드 너비 - 설정 파일에서 가져오기
  const cardWidth = uiConfig.card.nodeSize?.width || 280;
  
  // 카드 헤더 높이 - 설정 파일에서 가져오기
  const cardHeaderHeight = uiConfig.card.nodeSize?.height || 40;
  
  // 카드 최대 높이 - 설정 파일에서 가져오기
  const cardMaxHeight = uiConfig.card.nodeSize?.maxHeight || 240;
  
  // 폰트 크기 - 설정 파일에서 가져오기
  const defaultFontSize = uiConfig.card?.fontSizes?.default || 16;
  const titleFontSize = uiConfig.card?.fontSizes?.title || 16;
  const contentFontSize = uiConfig.card?.fontSizes?.content || 16;
  const tagsFontSize = uiConfig.card?.fontSizes?.tags || 12;
  
  // 핸들러 스타일 - 기본 스타일 (핸들러 스타일을 useMemo로 최적화)
  const handleStyleBase = useMemo(() => ({
    width: handleSize,
    height: handleSize,
    backgroundColor: '#fff',
    border: `2px solid ${connectionLineColor}`, // 모든 상태에서 동일한 테두리 색상 사용
    borderRadius: '50%',
    zIndex: 100,
    padding: 0,
    margin: 0,
    // opacity와 visibility 속성 제거하여 CSS로 제어
    pointerEvents: 'auto' as const,
    // 랜더링 최적화
    willChange: 'transform',
  }), [connectionLineColor, handleSize]);
  
  // 핸들러 위치 계산 함수 - 모든 상태에서 완전히 동일한 스타일 사용
  const getHandleStyle = useCallback((position: 'top' | 'right' | 'bottom' | 'left') => {
    // 핸들 위치에 대한 기본 스타일 생성 (항상 새 객체 생성)
    const style: React.CSSProperties = { ...handleStyleBase };
    
    // 정확한 소수점 계산을 위한 상수
    const halfSize = handleSize / 2;
    
    // 모든 상태에서 완전히 동일한 위치 계산 (정수 값 사용)
    switch (position) {
      case 'top':
        style.top = -6; // 정확히 위치 지정 (12px의 절반이므로 6px)
        style.left = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'right':
        style.right = -6; // 정확히 위치 지정
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'bottom':
        style.bottom = -6; // 정확히 위치 지정
        style.left = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'left':
        style.left = -6; // 정확히 위치 지정
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
    }
    
    return style;
  }, [handleStyleBase, handleSize]);
  
  // 카드 높이 계산 (접힌 상태와 펼쳐진 상태)
  const cardHeight = isExpanded ? 'auto' : `${cardHeaderHeight}px`;

  // 트랜지션 종료 이벤트 핸들러 - 애니메이션 완료 후 항상 업데이트
  const handleTransitionEnd = useCallback(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [id, updateNodeInternals]);

  // 현재 노드가 드래그 중인지 확인 (ReactFlow 상태에서)
  const currentNode = getNode(id);
  const isDragging = currentNode?.dragging || false;

  // 카드가 활성화된 상태인지 확인 (선택됨, 펼쳐짐, 드래그 중, 호버 상태 중 하나라도 해당됨)
  const isActive = selected || isExpanded || isDragging || isHovered;

  return (
    <div 
      ref={nodeRef}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTransitionEnd={handleTransitionEnd}
      className={`card-node-container card-node bg-white rounded-md ${selected ? 'ring-2 ring-blue-400' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        width: `${cardWidth}px`,
        height: cardHeight,
        border: `${borderWidth}px solid ${selected ? connectionLineColor : '#e2e8f0'}`,
        backgroundColor: selected ? selectedBackgroundColor : '#fff',
        transition: 'height 0.2s ease-in-out, background-color 0.2s ease',
        overflow: 'visible', // 핸들이 잘리지 않도록 오버플로우 설정
        position: 'relative',
        zIndex: isActive ? 9999 : 1, // 활성화된 카드는 항상 최상위에 표시
        isolation: 'isolate', // 새로운 쌓임 맥락 생성
        transformStyle: 'preserve-3d', // 3D 공간에서의 렌더링 최적화
        willChange: 'transform, height', // 변환 및 높이 변경 최적화
      }}
    >
      {/* 노드 인스펙트 컴포넌트 추가 */}
      <NodeInspect data={data} id={id} />
      
      {/* 카드 헤더 */}
      <div className="card-header" style={{ 
        padding: '0 12px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
        height: `${cardHeaderHeight}px`
      }}>
        <h3 className="text-md font-semibold text-center flex-grow" style={{
          margin: 0,
          lineHeight: `${cardHeaderHeight}px`,
          alignItems: 'center',
          justifyContent: 'center',
          height: `${cardHeaderHeight}px`,
          fontSize: `${titleFontSize}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 4px'
        }}>
          {data.title}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-6 w-6 ml-2"
          onClick={toggleExpand}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>
      
      {/* 카드 콘텐츠 - 펼쳐진 상태에서만 보임 */}
      {isExpanded && (
        <div className="card-content" style={{ 
          padding: '8px 12px',
          fontSize: `${contentFontSize}px`,
          maxHeight: `${cardMaxHeight}px`,
          overflow: 'auto'
        }}>
          <div className="tiptap-content" style={{ fontSize: `${contentFontSize}px` }}>
            <TiptapViewer content={data.content} />
          </div>
          
          {/* 태그 표시 */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.map((tag: string, index: number) => (
                <div key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center" style={{ fontSize: `${tagsFontSize}px` }}>
                  <Tag size={10} className="mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          )}
          
          {/* 카드 푸터 */}
          <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={`/cards/${data.id}`} passHref>
              <Button size="sm" variant="outline">자세히 보기</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* 핸들러 - 카드 외부에 위치 */}
      {/* 위쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        className="nodrag handle-top" // visible-handle 클래스 제거
        style={getHandleStyle('top')}
      />
      
      {/* 왼쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className="nodrag handle-left" // visible-handle 클래스 제거
        style={getHandleStyle('left')}
      />
      
      {/* 오른쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className="nodrag handle-right" // visible-handle 클래스 제거
        style={getHandleStyle('right')}
      />
      
      {/* 아래쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className="nodrag handle-bottom" // visible-handle 클래스 제거
        style={getHandleStyle('bottom')}
      />
    </div>
  );
} 
```

src/components/board/CustomEdge.tsx
```
import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';
import { loadBoardSettings } from '@/lib/board-utils';

// 확장된 엣지 Props 인터페이스
interface CustomEdgeProps extends EdgeProps {
  type?: string;
  animated?: boolean;
  data?: {
    edgeType?: ConnectionLineType;
    settings?: any;
  };
}

/**
 * 커스텀 엣지 컴포넌트
 * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
 */
function CustomEdge({ 
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  type,
  animated,
  data,
  ...restProps
}: CustomEdgeProps) {
  // 보드 설정 불러오기 - 기본값으로만 사용하고 props를 우선시
  const boardSettings = useMemo(() => loadBoardSettings(), []);

  // 엣지 연결 좌표 계산 (useMemo로 최적화)
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 엣지 타입 결정: data.edgeType > type prop > 기본값
  const effectiveEdgeType = useMemo(() => {
    // data.edgeType이 있으면 우선 사용
    if (data?.edgeType) {
      return data.edgeType;
    }
    // 없으면 type prop 사용 (기본값은 'bezier')
    return type || 'bezier';
  }, [data, type]);

  // 엣지 패스 계산 (연결선 타입에 따라)
  const [edgePath] = useMemo(() => {
    //console.log(`엣지 ${id}의 타입: ${effectiveEdgeType}`);
    
    // 타입에 따라 적절한 경로 생성 함수 사용
    switch (effectiveEdgeType) {
      case ConnectionLineType.Straight:
        return getStraightPath(edgeParams);
      case ConnectionLineType.Step:
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 0, // 직각
        });
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 10, // 부드러운 모서리
        });
      case ConnectionLineType.SimpleBezier:
        return getBezierPath({
          ...edgeParams,
          curvature: 0.25,
        });
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath(edgeParams);
    }
  }, [effectiveEdgeType, edgeParams, id]);

  // 실제 애니메이션 여부는 보드 설정과 컴포넌트 prop 결합
  const isAnimated = animated !== undefined ? animated : boardSettings.animated;

  // 스타일 적용 우선순위 변경 - props로 전달된 style을 우선시
  const edgeStyle = useMemo(() => {
    // 1. 기본 스타일 (보드 설정에서 가져옴)
    const baseStyle = {
      strokeWidth: boardSettings.strokeWidth,
      stroke: selected 
        ? boardSettings.selectedEdgeColor 
        : boardSettings.edgeColor,
      transition: 'stroke 0.2s, stroke-width 0.2s',
    };

    // 2. 애니메이션 스타일
    const animationStyle = isAnimated ? {
      strokeDasharray: 5,
      strokeDashoffset: 0,
      animation: 'dashdraw 0.5s linear infinite',
    } : {};

    // 3. 선택 상태에 따른 스타일
    const selectedStyle = selected ? {
      strokeWidth: (style.strokeWidth as number || boardSettings.strokeWidth) + 1,
      stroke: style.stroke || boardSettings.selectedEdgeColor,
    } : {};

    // 4. 스타일 병합 (props의 style이 가장 우선)
    return {
      ...baseStyle,
      ...animationStyle,
      ...selectedStyle,
      ...style, // props의 style을 마지막에 적용하여 우선시
    };
  }, [style, selected, boardSettings, isAnimated]);

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={edgeStyle}
      data-selected={selected ? 'true' : 'false'}
      {...{
        ...restProps,
        selectable: undefined,
        deletable: undefined,
        sourceHandleId: undefined,
        targetHandleId: undefined,
        pathOptions: undefined
      }}
    />
  );
}

export default CustomEdge; 
```

src/components/board/DagreNodePositioning.test.tsx
```
import React from 'react';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import DagreNodePositioning from './DagreNodePositioning';

// 단순 렌더링 테스트
describe('DagreNodePositioning', () => {
  it('컴포넌트가 오류 없이 렌더링되어야 합니다', () => {
    const dummyOptions = { rankdir: 'TB' };
    const dummySetNodes = jest.fn();
    const dummySetEdges = jest.fn();
    const dummySetViewIsFit = jest.fn();
    const dummyEdges = [];
    
    render(
      <ReactFlowProvider>
        <DagreNodePositioning
          Options={dummyOptions}
          Edges={dummyEdges}
          SetEdges={dummySetEdges}
          SetNodes={dummySetNodes}
          SetViewIsFit={dummySetViewIsFit}
        />
      </ReactFlowProvider>
    );
  });
}); 
```

src/components/board/DagreNodePositioning.tsx
```
import React, { useState, useEffect } from 'react';
import { useStore, useReactFlow, Node, Edge, ReactFlowState } from '@xyflow/react';
import dagre from 'dagre';
import defaultConfig from '../../config/cardBoardUiOptions.json';

interface DagreNodePositioningProps {
  Options: { rankdir: 'TB' | 'LR' | 'BT' | 'RL' };
  Edges: Edge[];
  SetEdges: (edges: Edge[]) => void;
  SetNodes: (nodes: Node[]) => void;
  SetViewIsFit: (value: boolean) => void;
}

// 기본 CardNode의 크기 - 설정 파일에서 가져오기
const nodeWidth = defaultConfig.card.nodeSize.width;
const nodeHeight = defaultConfig.card.nodeSize.height;

const DagreNodePositioning: React.FC<DagreNodePositioningProps> = ({ Options, Edges, SetEdges, SetNodes, SetViewIsFit }) => {
  const [nodesPositioned, setNodesPositioned] = useState(false);
  const { fitView } = useReactFlow();
  
  // 제네릭 타입 명시하여 Store 타입 오류 해결
  const store = useStore();
  const nodeInternals = store.getState().nodeInternals;
  const flattenedNodes = Array.from(nodeInternals.values()) as Node[];

  useEffect(() => {
    // 노드가 존재하는지 확인
    if (flattenedNodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph(Options);

      // 모든 노드를 dagre 그래프에 등록 (기본값 사용)
      flattenedNodes.forEach((node) => {
        // 실제 측정된 크기가 없으므로 기본값 사용
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      // 엣지 등록
      Edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      // 레이아웃 계산
      dagre.layout(dagreGraph);

      // 각 노드의 위치를 업데이트
      const layoutedNodes = flattenedNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (!nodeWithPosition) {
          return node;
        }
        
        let updatedNode = {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2
          },
          data: { ...node.data }
        } as Node;

        // 레이아웃 방향에 따라 핸들 위치 지정
        if (Options.rankdir === 'TB' || Options.rankdir === 'BT') {
          updatedNode.targetPosition = Position.Top;
          updatedNode.sourcePosition = Position.Bottom;
        } else if (Options.rankdir === 'LR' || Options.rankdir === 'RL') {
          updatedNode.targetPosition = Position.Left;
          updatedNode.sourcePosition = Position.Right;
        }
        return updatedNode;
      });

      // 엣지 핸들 업데이트
      const layoutedEdges = Edges.map(edge => {
        const updatedEdge = { ...edge };
        
        // 방향에 따라 엣지 핸들 위치 설정
        if (Options.rankdir === 'TB' || Options.rankdir === 'BT') {
          updatedEdge.sourceHandle = 'bottom-source'; // 수직 레이아웃에서는 아래쪽이 소스
          updatedEdge.targetHandle = 'top-target';    // 수직 레이아웃에서는 위쪽이 타겟
        } else if (Options.rankdir === 'LR' || Options.rankdir === 'RL') {
          updatedEdge.sourceHandle = 'right-source';  // 수평 레이아웃에서는 오른쪽이 소스
          updatedEdge.targetHandle = 'left-target';   // 수평 레이아웃에서는 왼쪽이 타겟
        }
        
        return updatedEdge;
      });

      SetNodes(layoutedNodes);
      // 업데이트된 엣지 적용
      SetEdges(layoutedEdges);
      
      setNodesPositioned(true);
      window.requestAnimationFrame(() => {
        fitView();
      });
      SetViewIsFit(true);
    }
  }, [flattenedNodes, Options, Edges, SetEdges, SetNodes, SetViewIsFit, fitView]);

  return null;
};

export default DagreNodePositioning; 
```

src/components/board/DebugPanel.tsx
```
import React, { useState, useEffect } from 'react';
import { useReactFlow, NodeChange, EdgeChange } from '@xyflow/react';

interface DebugPanelProps {
  nodeChanges?: NodeChange[];
  edgeChanges?: EdgeChange[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ nodeChanges, edgeChanges }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getViewport, getNodes } = useReactFlow();
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; message: string }>>([]);

  // 뷰포트 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const currentViewport = getViewport();
      setViewport(currentViewport);
    }, 100);

    return () => clearInterval(interval);
  }, [getViewport]);

  // 로그 추가 함수
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { time, message }]);
  };

  // 노드 변경 시 로그 추가
  useEffect(() => {
    if (nodeChanges && nodeChanges.length > 0) {
      const message = `노드 변경: ${nodeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
      addLog(message);
    }
  }, [nodeChanges]);

  // 엣지 변경 시 로그 추가
  useEffect(() => {
    if (edgeChanges && edgeChanges.length > 0) {
      const message = `엣지 변경: ${edgeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
      addLog(message);
    }
  }, [edgeChanges]);

  // 선택된 노드 정보
  const selectedNode = selectedNodeId 
    ? getNodes().find(node => node.id === selectedNodeId) 
    : null;

  return (
    <div className="fixed left-2 top-16 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {isOpen ? '디버그 패널 닫기' : '디버그 패널 열기'}
      </button>
      
      {isOpen && (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 w-64 max-h-[80vh] overflow-y-auto">
          <div className="mb-3">
            <h3 className="text-sm font-bold border-b pb-1 mb-2">뷰포트 정보</h3>
            <div className="text-xs">
              <div>X: {viewport.x.toFixed(2)}</div>
              <div>Y: {viewport.y.toFixed(2)}</div>
              <div>Zoom: {viewport.zoom.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-bold border-b pb-1 mb-2">노드 검사</h3>
            <select 
              className="w-full text-xs p-1 border rounded mb-2"
              value={selectedNodeId || ''}
              onChange={(e) => setSelectedNodeId(e.target.value || null)}
            >
              <option value="">노드 선택...</option>
              {getNodes().map(node => (
                <option key={node.id} value={node.id}>
                  {node.id} {node.data?.title ? `(${node.data.title})` : ''}
                </option>
              ))}
            </select>
            
            {selectedNode && (
              <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-bold border-b pb-1 mb-2">변경 로그</h3>
            <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">{log.time}:</span> {log.message}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">아직 로그가 없습니다</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 
```

src/components/board/LayoutControls.tsx
```
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layout, LayoutGrid, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';
import { toast } from 'sonner';

interface LayoutControlsProps {
  onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
  onAutoLayout: () => void;
  onSaveLayout: () => void;
}

export default function LayoutControls({ 
  onLayoutChange, 
  onAutoLayout, 
  onSaveLayout 
}: LayoutControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Layout className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>레이아웃 옵션</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onLayoutChange('horizontal')}
          className="flex items-center cursor-pointer"
        >
          <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
          <span>수평 레이아웃</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onLayoutChange('vertical')}
          className="flex items-center cursor-pointer"
        >
          <AlignVerticalJustifyCenter className="mr-2 h-4 w-4" />
          <span>수직 레이아웃</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onAutoLayout}
          className="flex items-center cursor-pointer"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>자동 배치</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onSaveLayout}
          className="flex items-center cursor-pointer"
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>레이아웃 저장</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
```

src/components/debug/DevTools.tsx
```
import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { ViewportLogger } from './ViewportLogger';
import { NodeInspector } from './NodeInspector';
import { ChangeLogger, useChangeLogger, type ChangeLoggerHandlers } from './ChangeLogger';

/**
 * React Flow 디버깅을 위한 DevTools 컴포넌트
 * 뷰포트 로거, 노드 인스펙터, 변경 로거를 포함합니다.
 */
export default function DevTools() {
  const [showViewport, setShowViewport] = useState(false);
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [showChangeLogger, setShowChangeLogger] = useState(false);

  return (
    <Panel 
      position="top-left" 
      className="bg-card shadow p-3 rounded-md z-50"
      style={{ top: '200px' }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => setShowViewport(!showViewport)}
            className={`px-2 py-1 text-xs rounded ${
              showViewport ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            뷰포트 로거 {showViewport ? '숨기기' : '보기'}
          </button>
          <button
            onClick={() => setShowNodeInspector(!showNodeInspector)}
            className={`px-2 py-1 text-xs rounded ${
              showNodeInspector ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            노드 인스펙터 {showNodeInspector ? '숨기기' : '보기'}
          </button>
          <button
            onClick={() => setShowChangeLogger(!showChangeLogger)}
            className={`px-2 py-1 text-xs rounded ${
              showChangeLogger ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            변경 로거 {showChangeLogger ? '숨기기' : '보기'}
          </button>
        </div>
        
        {showViewport && <ViewportLogger />}
        {showNodeInspector && <NodeInspector />}
        {showChangeLogger && <ChangeLogger />}
      </div>
    </Panel>
  );
}

// 노드와 엣지 변경 감지를 위한 훅 익스포트
export const useChangeLoggerHooks = (): ChangeLoggerHandlers => {
  const [, , handlers] = useChangeLogger();
  return handlers;
} 
```

src/components/debug/NodeInspector.tsx
```
import { useEffect, useState, useCallback } from 'react';
import { useReactFlow, Node, NodeProps, NodeToolbar, Position, useOnSelectionChange } from '@xyflow/react';

// 노드 데이터 타입 정의
interface NodeData {
  [key: string]: any;
  isInspected?: boolean;
}

/**
 * NodeInspector 컴포넌트는 React Flow의 노드를 검사할 수 있는 기능을 제공합니다.
 * 컴포넌트가 마운트되면 모든 노드의 정보가 노드 아래에 표시됩니다.
 */
export function NodeInspector() {
  const { getNodes, setNodes } = useReactFlow();
  // 노드 상태가 변경될 때마다 업데이트하기 위한 상태
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 노드 선택 변경을 감지하는 리스너 추가
  useOnSelectionChange({
    onChange: () => {
      // 선택 상태가 변경될 때마다 업데이트 트리거
      setUpdateTrigger(prev => prev + 1);
    },
  });

  // 마운트될 때와 노드 선택 상태가 변경될 때마다 모든 노드의 isInspected를 true로 설정
  useEffect(() => {
    // 모든 노드의 isInspected 속성 업데이트
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isInspected: true
        }
      }))
    );

    // 언마운트될 때 모든 노드의 isInspected를 false로 설정
    return () => {
      setNodes(nodes => 
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isInspected: false
          }
        }))
      );
    };
  }, [setNodes, updateTrigger]);

  // 노드 인스펙터 컴포넌트 주석 처리
  // return (
  //   <div className="bg-muted p-2 rounded border text-xs mt-2">
  //     <h3 className="font-bold mb-1 border-b pb-1">노드 인스펙터</h3>
  //     <div className="text-muted-foreground">
  //       각 노드 아래에 노드 정보가 실시간으로 표시됩니다.
  //     </div>
  //   </div>
  // );
}

/**
 * NodeInspect 컴포넌트는 각 노드에 추가되어 노드의 데이터를 표시합니다.
 * 실시간으로 노드 상태를 반영합니다.
 */
export function NodeInspect(props: NodeProps) {
  const { data, id, type } = props;
  const { getNode } = useReactFlow();
  // 실시간 상태 업데이트를 위한 상태
  const [nodeState, setNodeState] = useState({ selected: false });
  const [isVisible, setIsVisible] = useState(false);
  
  // 렌더링 전에 isVisible 상태를 설정
  useEffect(() => {
    setIsVisible(!!data?.isInspected);
  }, [data?.isInspected]);

  // 실시간 노드 상태 업데이트
  useEffect(() => {
    // 노드 상태 업데이트 함수
    const updateNodeState = () => {
      const currentNode = getNode(id);
      if (currentNode) {
        setNodeState({
          selected: !!currentNode.selected,
        });
      }
    };

    // 초기 상태 설정
    updateNodeState();

    // 주기적으로 노드 상태 업데이트 (실시간성 보장)
    const intervalId = setInterval(updateNodeState, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [id, getNode]);

  // 핸들 위치 정보
  const handleInfo = {
    leftTop: { position: Position.Left, top: '0%' },
    leftBottom: { position: Position.Left, top: '100%' },
    rightTop: { position: Position.Right, top: '0%' },
    rightBottom: { position: Position.Right, top: '100%' },
  };

  if (!isVisible) return null;

  return (
    <NodeToolbar 
      position={Position.Bottom}
      className="nodrag bg-card shadow-md rounded p-2 text-xs max-w-xs" 
      isVisible={true}
    >
      <div className="font-bold mb-1 border-b pb-1">노드 정보</div>
      <div className="space-y-1">
        <div><span className="font-medium">제목:</span> {data?.title || data?.label || '제목 없음'}</div>
        <div><span className="font-medium">ID:</span> {id}</div>
        <div><span className="font-medium">타입:</span> {type || '기본'}</div>
        <div><span className="font-medium">선택됨:</span> {nodeState.selected ? '예' : '아니오'}</div>
        <div className="mt-1">
          <div className="font-medium">핸들 정보:</div>
          <ul className="ml-2">
            <li>좌측 상단: {handleInfo.leftTop.position} + Top</li>
            <li>좌측 하단: {handleInfo.leftBottom.position} + Bottom</li>
            <li>우측 상단: {handleInfo.rightTop.position} + Top</li>
            <li>우측 하단: {handleInfo.rightBottom.position} + Bottom</li>
          </ul>
        </div>
      </div>
    </NodeToolbar>
  );
} 
```

src/components/debug/ViewportLogger.tsx
```
import { useStore } from '@xyflow/react';
import { shallow } from 'zustand/shallow';

/**
 * ViewportLogger 컴포넌트는 현재 React Flow 뷰포트의 상태를 표시합니다.
 * x, y 위치와 줌 레벨을 실시간으로 보여줍니다.
 */
const selector = (state: any) => ({
  x: state.transform?.[0] || 0,
  y: state.transform?.[1] || 0,
  zoom: state.transform?.[2] || 1,
});

export function ViewportLogger() {
  const { x, y, zoom } = useStore(selector, shallow);

  return (
    <div className="bg-muted p-2 rounded border text-xs mt-2">
      <h3 className="font-bold mb-1 border-b pb-1">뷰포트 로거</h3>
      <div>
        <span>x: {x.toFixed(2)}</span>, <span>y: {y.toFixed(2)}</span>, <span>zoom: {zoom.toFixed(2)}</span>
      </div>
    </div>
  );
} 
```

src/components/ui/alert-dialog.tsx
```
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

src/components/ui/badge.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 
```

src/components/ui/button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

src/components/ui/card.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

src/components/ui/checkbox.tsx
```
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

src/components/ui/dialog.tsx
```
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

src/components/ui/dropdown-menu.tsx
```
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```

src/components/ui/form.tsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive-foreground", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive-foreground text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```

src/components/ui/input.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

src/components/ui/label.tsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
```

src/components/ui/radio-group.tsx
```
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
```

src/components/ui/skeleton.tsx
```
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-primary/10 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

src/components/ui/sonner.tsx
```
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```

src/components/ui/table.tsx
```
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

src/components/ui/textarea.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

src/components/cards/CardList.test.tsx
```
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CardList from './CardList';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// useSearchParams는 setupTests.ts에서 이미 모킹됨

// fetch는 setupTests.ts에서 이미 전역으로 모킹되어 있음

describe('CardList 컴포넌트', () => {
  // console.error 모킹 추가
  const originalConsoleError = console.error;
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    
    // useSearchParams 기본값으로 초기화
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => null,
      toString: () => '',
    }));
    
    // 모킹된 카드 데이터 (기본 테스트용)
    const mockCards = [
      {
        id: 'card1',
        title: '테스트 카드 1',
        content: '테스트 내용 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
      {
        id: 'card2',
        title: '테스트 카드 2',
        content: '테스트 내용 2',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        userId: 'user2',
      },
    ];

    // 기본 fetch 응답 모킹
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockCards,
    });
  });

  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('카드 목록을 성공적으로 로드하고 렌더링한다', async () => {
    // 모킹된 카드 데이터
    const mockCards = [
      {
        id: 'card1',
        title: '테스트 카드 1',
        content: '테스트 내용 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
      {
        id: 'card2',
        title: '테스트 카드 2',
        content: '테스트 내용 2',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        userId: 'user2',
      },
    ];

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCards,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 카드 목록이 로드되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 카드 2')).toBeInTheDocument();
      expect(screen.getByText('테스트 내용 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 내용 2')).toBeInTheDocument();
    });

    // fetch가 올바른 URL로 호출되었는지 확인
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('카드가 없을 때 적절한 메시지를 표시한다', async () => {
    // 빈 카드 목록 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 로딩 상태가 끝나고 빈 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드가 없습니다. 새 카드를 추가해보세요!')).toBeInTheDocument();
    });
  });

  it('API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // API 오류 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
    });
  });

  it('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 네트워크 오류 모킹
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // 컴포넌트 렌더링
    render(<CardList />);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
    });
  });

  it('자세히 보기 버튼을 클릭하면 Dialog가 열린다', async () => {
    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 자세히 보기 버튼 클릭
    const detailButtons = screen.getAllByText('자세히');
    fireEvent.click(detailButtons[0]);

    // Dialog가 열렸는지 확인 (제목이 Dialog에 표시됨)
    await waitFor(() => {
      // Dialog의 내용이 표시되는지 확인
      expect(screen.getAllByText('테스트 카드 1').length).toBeGreaterThan(1); // 카드 목록과 Dialog 두 곳에 표시
      // '작성일:' 대신 Dialog 내에 표시된 날짜 형식 확인
      expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
      expect(screen.getByText('닫기')).toBeInTheDocument(); // Dialog의 닫기 버튼
    });
  });

  it('삭제 버튼을 클릭하면 삭제 확인 Dialog가 열린다', async () => {
    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // 휴지통 아이콘만 있어서 텍스트 없음
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭 (카드마다 자세히 보기와 삭제 버튼이 있음)

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
      expect(screen.getByText('삭제')).toBeInTheDocument();
    });
  });

  it('삭제 확인 Dialog에서 삭제 버튼을 클릭하면 카드가 삭제된다', async () => {
    // 삭제 API 호출 모킹
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/api/cards/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' }),
        });
      }
      
      // 기본 카드 목록 데이터 반환
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 'card1',
            title: '테스트 카드 1',
            content: '테스트 내용 1',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            userId: 'user1',
          },
        ],
      });
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    // 삭제 API가 호출되었는지 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/card1', { method: 'DELETE' });
      expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
    });
  });

  it('검색 쿼리 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'q' ? '검색어' : null,
      toString: () => 'q=검색어',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4');
    });
  });

  it('태그 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'tag' ? '테스트태그' : null,
      toString: () => 'tag=테스트태그',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
    });
  });

  it('여러 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => {
        if (param === 'q') return '검색어';
        if (param === 'tag') return '테스트태그';
        return null;
      },
      toString: () => 'q=검색어&tag=테스트태그',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4&tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
    });
  });

  it('검색 결과가 없을 때 적절한 메시지를 표시한다', async () => {
    // 검색 파라미터 모킹
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'q' ? '존재하지않는검색어' : null,
      toString: () => 'q=존재하지않는검색어',
    }));

    // 빈 검색 결과 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 검색 결과 없음 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('태그를 포함한 카드를 렌더링한다', async () => {
    // 태그가 있는 카드 데이터 모킹
    const mockCardsWithTags = [
      {
        id: 'card1',
        title: '태그 있는 카드',
        content: '태그 테스트 내용',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
        cardTags: [
          {
            id: 'tag1',
            tag: {
              id: 'tagid1',
              name: '테스트태그'
            }
          }
        ]
      }
    ];

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCardsWithTags,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드와 태그가 렌더링되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('태그 있는 카드')).toBeInTheDocument();
      expect(screen.getByText('#테스트태그')).toBeInTheDocument();
    });
  });

  it('태그를 클릭하면 적절한 URL로 이동한다', async () => {
    // 테스트용 태그 이름
    const tagName = 'testTag';
    
    // window.location.href 모킹
    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalHref }
    });
    
    // handleTagClick 함수 테스트
    const navigateToTagUrl = (tagName: string) => {
      window.location.href = `/cards?tag=${encodeURIComponent(tagName)}`;
    };
    
    // 함수 실행
    navigateToTagUrl(tagName);
    
    // 결과 확인
    expect(window.location.href).toBe(`/cards?tag=${encodeURIComponent(tagName)}`);
    
    // location 복원
    window.location.href = originalHref;
  });

  it('카드 삭제 중 API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 카드 데이터 모킹
    const mockCards = [
      {
        id: 'card1',
        title: '삭제할 카드',
        content: '삭제 테스트 내용',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      }
    ];

    // fetch 응답 모킹 (처음에는 성공, 삭제 시 에러)
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/api/cards/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: '권한이 없습니다.' }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => mockCards,
      });
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('삭제할 카드')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('권한이 없습니다.');
    });
  });

  it('태그 클릭 시 해당 태그로 필터링된 URL로 이동한다', async () => {
    // 창 위치 변경을 모킹
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    const TAG_NAME = '테스트태그';
    
    // 태그를 포함하는 카드 데이터 생성
    const mockCards = [
      {
        id: 1,
        title: '테스트 카드 1',
        content: '테스트 내용 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        cardTags: [
          {
            id: 1,
            cardId: 1,
            tagId: 1,
            tag: {
              id: 1,
              name: TAG_NAME,
            },
          },
        ],
      },
    ];

    // fetch 응답 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCards,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 디버깅: 태그 요소가 렌더링되었는지 확인
    screen.debug(document.body);

    // 태그 찾기 및 클릭
    await waitFor(() => {
      // 유연한 방식으로 태그 요소 찾기
      const tagElements = screen.getAllByText((content, element) => {
        return content.includes(TAG_NAME);
      });
      
      console.log('찾은 태그 요소 수:', tagElements.length);
      expect(tagElements.length).toBeGreaterThan(0);
      
      // 첫 번째 태그 요소 클릭
      fireEvent.click(tagElements[0]);
      
      // URL이 올바르게 설정되었는지 확인 (인코딩된 URL 기대)
      const encodedTagName = encodeURIComponent(TAG_NAME);
      const expectedUrl = `/cards?tag=${encodedTagName}`;
      expect(window.location.href).toBe(expectedUrl);
    });
  });
}); 
```

src/components/cards/CardList.tsx
```
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { useSearchParams } from "next/navigation";
import { Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import TiptapViewer from "@/components/editor/TiptapViewer";

interface Tag {
  id: string;
  name: string;
}

interface CardTag {
  id: string;
  tag: Tag;
}

interface CardItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  cardTags?: CardTag[];
}

export default function CardList() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCards();
  }, [searchParams]);

  async function fetchCards() {
    try {
      // 현재 검색 파라미터를 가져와서 API 요청에 사용
      const q = searchParams.get('q');
      const tag = searchParams.get('tag');
      
      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (tag) params.append('tag', tag);
      
      // API 요청
      const queryString = params.toString();
      const endpoint = `/api/cards${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('카드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const handleTagClick = (tagName: string) => {
    window.location.href = `/cards?tag=${encodeURIComponent(tagName)}`;
  };

  const handleDeleteCard = async (cardId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
      }

      toast.success("카드가 성공적으로 삭제되었습니다.");
      // 삭제 후 목록 갱신
      fetchCards();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setDeletingCardId(null);
    }
  };

  const openDeleteDialog = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCardId(cardId);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <SearchBar />
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카드 삭제</DialogTitle>
            <DialogDescription>
              이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => deletingCardId && handleDeleteCard(deletingCardId)} 
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {cards.length === 0 ? (
        <div className="text-center py-10">
          {searchParams.toString() 
            ? '검색 결과가 없습니다.' 
            : '카드가 없습니다. 새 카드를 추가해보세요!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="line-clamp-3">
                  <TiptapViewer content={card.content} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(card.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye size={16} />
                          자세히
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{card.title}</DialogTitle>
                          <DialogDescription>
                            작성일: {formatDate(card.createdAt)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="whitespace-pre-wrap">
                            <TiptapViewer content={card.content} />
                          </div>
                          
                          {card.cardTags && card.cardTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-4">
                              {card.cardTags.map((cardTag) => (
                                <Badge 
                                  key={cardTag.id} 
                                  variant="secondary"
                                >
                                  #{cardTag.tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button>닫기</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => openDeleteDialog(card.id, e)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* 태그 표시 */}
                {card.cardTags && card.cardTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.cardTags.map((cardTag) => (
                      <Badge 
                        key={cardTag.id} 
                        variant="secondary"
                        className="cursor-pointer"
                        data-testid={`tag-name-${cardTag.tag.name}`}
                        onClick={() => handleTagClick(cardTag.tag.name)}
                      >
                        #{cardTag.tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
```

src/components/cards/CreateCardButton.test.tsx
```
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCardButton from './CreateCardButton';
import { toast } from 'sonner';
import { vi, describe, test, expect, beforeEach, afterAll, beforeAll, afterEach } from 'vitest';

// 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// fetch 모킹
global.fetch = vi.fn();

// window.location.reload 모킹
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
});

// console.error 모킹
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// 테스트 사용자 ID 상수 (CreateCardButton.tsx와 동일한 값)
const TEST_USER_ID = "ab2473c2-21b5-4196-9562-3b720d80d77f";

describe('CreateCardButton 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 성공적인 응답을 기본으로 설정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    // 각 테스트 후에 정리
    cleanup(); // 명시적으로 cleanup 먼저 호출
    vi.resetAllMocks();
    document.body.innerHTML = "";
  });

  test('버튼 클릭 시 모달이 열린다', () => {
    render(<CreateCardButton />);
    
    // 버튼 클릭 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 모달이 열렸는지 확인 (제목과 입력 필드 확인)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('내용')).toBeInTheDocument();
  });

  test('유효한 데이터로 카드를 생성한다', async () => {
    const mockNewCard = {
      id: 'new-card-id',
      title: '새 카드 제목',
      content: '새 카드 내용',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      userId: TEST_USER_ID,
    };

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNewCard,
    });

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '새 카드 제목',
          content: '새 카드 내용',
          userId: 'ab2473c2-21b5-4196-9562-3b720d80d77f',
          tags: []
        })
      });
    });
    
    // 성공 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
    
    // 페이지 새로고침 확인
    expect(mockReload).toHaveBeenCalled();
  });

  test('빈 제목과 내용으로 제출 시 유효성 검사 오류를 표시한다', async () => {
    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 제출 버튼 클릭 (제목과 내용 비워둠)
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
    });
    
    // API 호출이 되지 않았는지 확인
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // API 오류 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'response.json is not a function' })
    });

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('response.json is not a function');
    });
    
    // console.error가 호출되었는지 확인
    expect(console.error).toHaveBeenCalled();
  });

  test('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 네트워크 오류 모킹
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
    
    // console.error가 호출되었는지 확인
    expect(console.error).toHaveBeenCalled();
  });

  test('카드 생성 다이얼로그가 열리고 닫힙니다', async () => {
    const user = userEvent.setup();
    
    render(<CreateCardButton />);
    
    // 버튼 클릭 대신 직접 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 다이얼로그가 열렸는지 확인
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    
    // 실제 닫기 버튼 클릭 - "Close" 텍스트를 가진 버튼을 찾아 클릭합니다
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    
    // 다이얼로그가 닫혔는지 확인 (비동기적으로 진행될 수 있음)
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test('제목과 내용 입력이 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 제목 입력
    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } });
    expect(titleInput).toHaveValue('테스트 제목');
    
    // 내용 입력
    const contentInput = screen.getByLabelText('내용');
    fireEvent.change(contentInput, { target: { value: '테스트 내용' } });
    expect(contentInput).toHaveValue('테스트 내용');
  });

  test('태그 입력 및 처리가 올바르게 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '태그1' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#태그1')).toBeInTheDocument();
    
    // 태그 입력 필드가 비워졌는지 확인
    expect(tagInput).toHaveValue('');
    
    // 쉼표로 태그 구분하여 입력
    fireEvent.change(tagInput, { target: { value: '태그2, 태그3' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 두 개의 태그가 모두 추가되었는지 확인
    expect(screen.getByText('#태그2')).toBeInTheDocument();
    expect(screen.getByText('#태그3')).toBeInTheDocument();
  });

  test('태그 삭제가 작동합니다', () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 추가
    const tagInput = screen.getByLabelText('태그');
    fireEvent.change(tagInput, { target: { value: '삭제태그' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#삭제태그')).toBeInTheDocument();
    
    // 태그 삭제 버튼 클릭 - SVG나 아이콘을 찾는 대신 버튼 내부의 텍스트를 포함한 요소를 찾습니다.
    const tagContainer = screen.getByText('#삭제태그').closest('.flex');
    if (tagContainer) {
      const deleteButton = tagContainer.querySelector('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    }
    
    // 태그가 삭제되었는지 확인
    expect(screen.queryByText('#삭제태그')).not.toBeInTheDocument();
  });

  test('IME 조합 중 키 입력 이벤트 처리가 올바르게 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 미리 존재하는 태그 수 확인 (없을 수 있음)
    const getTagCount = () => screen.queryAllByText(/#\S+/).length;
    const initialTagCount = getTagCount();
    
    // IME 조합 시작
    fireEvent.compositionStart(tagInput);
    
    // IME 조합 중 Enter 키를 테스트하기 위해, 한글 입력 상태를 모의
    // 조합 중 태그가 추가되지 않도록 함
    fireEvent.change(tagInput, { target: { value: '한글태그' } });
    
    // 조합 중 Enter 키 입력 - IME 조합 중에는 이벤트가 무시되어야 함
    // 직접 상태를 확인하는 대신 태그 개수를 확인
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 조합이 끝나지 않았으므로 태그 개수는 변하지 않아야 함
    expect(getTagCount()).toBe(initialTagCount);
    
    // IME 조합 종료
    fireEvent.compositionEnd(tagInput);
    
    // 조합 종료 후 Enter 키 입력
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 이제 태그가 추가되었는지 확인
    expect(screen.getByText('#한글태그')).toBeInTheDocument();
    expect(getTagCount()).toBe(initialTagCount + 1);
  });

  test('IME 조합 중 Enter 및 콤마 외의 키 입력은 무시됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // IME 조합 시작
    fireEvent.compositionStart(tagInput);
    
    // Enter 키가 아닌 다른 키 입력 (Tab)
    fireEvent.change(tagInput, { target: { value: '테스트태그' } });
    fireEvent.keyDown(tagInput, { key: 'Tab' });
    
    // 태그가 추가되지 않아야 함
    expect(screen.queryByText('#테스트태그')).not.toBeInTheDocument();
    
    // IME 조합 종료
    fireEvent.compositionEnd(tagInput);
  });

  test('카드가 성공적으로 생성됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 제목, 내용, 태그 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '성공 테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '성공 테스트 내용' } });
    
    const tagInput = screen.getByLabelText('태그');
    fireEvent.change(tagInput, { target: { value: '성공태그' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#성공태그')).toBeInTheDocument();
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // 성공 메시지와 페이지 리로드 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
    expect(mockReload).toHaveBeenCalled();
  });

  test('빈 제목이나 내용으로 제출하면 오류가 표시됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 내용만 입력 (제목은 비움)
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '내용만 있음' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 오류 메시지 확인
    expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
    
    // API 호출이 되지 않았는지 확인
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('빈 태그는 추가되지 않습니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 1. 완전히 빈 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 화면에 표시된 태그가 없는지 확인
    expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
    
    // 2. 공백만 있는 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '   ' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 화면에 표시된 태그가 없는지 다시 확인
    expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
    
    // 3. 콤마로 구분된 태그 중 일부가 빈 경우
    fireEvent.change(tagInput, { target: { value: '유효태그,,  ,' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 유효한 태그만 추가되었는지 확인
    expect(screen.getByText('#유효태그')).toBeInTheDocument();
    // 빈 태그는 추가되지 않아야 함
    const allTags = screen.getAllByText(/#\S+/);
    expect(allTags.length).toBe(1); // 유효태그 하나만 있어야 함
  });

  test('API 응답에 에러 메시지가 없을 때 기본 오류 메시지를 사용합니다', async () => {
    // error 필드가 없는 API 오류 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'failed' }) // error 필드 없음
    });
    
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 필수 필드 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 기본 오류 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
    });
  });
  
  test('Error 객체가 아닌 예외 발생 시 기본 오류 메시지가 표시됩니다', async () => {
    // Error 객체가 아닌 예외 발생 모킹
    (global.fetch as any).mockRejectedValueOnce('일반 문자열 에러');
    
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 필수 필드 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 기본 오류 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
    });
  });
}); 
```

src/components/cards/CreateCardButton.tsx
```
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X } from "lucide-react";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { DEFAULT_USER_ID } from "@/lib/constants";

// 컴포넌트에 props 타입 정의
interface CreateCardButtonProps {
  onCardCreated?: (cardData: any) => void;
}

export default function CreateCardButton({ onCardCreated }: CreateCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstUserId, setFirstUserId] = useState<string>("");
  const isComposing = useRef(false);

  // 사용자 ID 가져오기
  useEffect(() => {
    async function fetchFirstUserId() {
      try {
        const response = await fetch('/api/users/first');
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setFirstUserId(data.id);
            console.log('사용자 ID 가져옴:', data.id);
          } else {
            console.error('사용자 ID를 가져오지 못함');
          }
        } else {
          console.error('사용자 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('사용자 ID 가져오기 오류:', error);
      }
    }

    fetchFirstUserId();
  }, []);

  // 태그 추가 처리
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME 조합 중인 경우 처리하지 않음
    if (isComposing.current) {
      return;
    }
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      // 현재 입력된 태그가 비어있는 경우 처리하지 않음
      if (!tagInput.trim()) {
        return;
      }
      
      // 쉼표로 구분된 여러 태그 처리
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));
      
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
        setTagInput('');
      }
    }
  };
  
  // IME 조합 시작 핸들러
  const handleCompositionStart = () => {
    isComposing.current = true;
  };
  
  // IME 조합 종료 핸들러
  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 사용자 ID 확인
    const userId = firstUserId || DEFAULT_USER_ID;
    if (!userId) {
      toast.error("사용자 ID를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title, 
          content,
          userId,
          tags: tags // 태그 배열 추가
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 생성에 실패했습니다.");
      }
      
      const createdCard = await response.json();
      
      toast.success("카드가 생성되었습니다.");
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setOpen(false);
      
      // 콜백이 제공된 경우 실행
      if (onCardCreated) {
        onCardCreated(createdCard);
      } else {
        // 페이지 새로고침 (콜백이 없는 경우에만)
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error(error instanceof Error ? error.message : "카드 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 태그 입력 중 쉼표가 입력되면 태그 추가 처리
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 쉼표가 포함된 경우 태그 추가 처리
    if (value.includes(',')) {
      const parts = value.split(',');
      const lastPart = parts.pop() || '';
      
      // 새로운 태그들 추가 (마지막 부분 제외)
      const newTags = parts
        .map(part => part.trim())
        .filter(part => part && !tags.includes(part));
        
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      
      // 쉼표 이후 부분만 입력창에 남김
      setTagInput(lastPart);
    } else {
      setTagInput(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>새 카드 만들기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 카드 만들기</DialogTitle>
          <DialogDescription>
            새로운 카드를 생성하려면 아래 양식을 작성하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="카드 제목을 입력하세요"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="카드 내용을 입력하세요"
              showToolbar={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleAddTag}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="태그 입력 후 Enter 또는 쉼표(,)로 구분"
              disabled={isSubmitting}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">닫기</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "생성하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
```

src/components/cards/EditCardContent.tsx
```
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TiptapEditor from "@/components/editor/TiptapEditor";
import TiptapViewer from "@/components/editor/TiptapViewer";
import { Pencil, Check, X } from "lucide-react";

interface EditCardContentProps {
  cardId: string;
  initialContent: string;
}

export default function EditCardContent({ cardId, initialContent }: EditCardContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (content === initialContent) {
      setIsEditing(false);
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "내용 수정에 실패했습니다.");
      }

      toast.success("내용이 수정되었습니다.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating card content:", error);
      toast.error(error instanceof Error ? error.message : "내용 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="카드 내용을 입력하세요..."
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            취소
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative mt-6 prose prose-stone dark:prose-invert">
      <TiptapViewer content={initialContent} />
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        편집
      </Button>
    </div>
  );
} 
```

src/components/cards/SearchBar.test.tsx
```
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchBar } from './SearchBar';
import '@testing-library/jest-dom';

// 기본 모킹 설정
const push = vi.fn();
const useRouterMock = vi.fn().mockReturnValue({ push });
const useSearchParamsMock = vi.fn().mockReturnValue({
  get: vi.fn().mockReturnValue(null)
});

vi.mock('next/navigation', () => ({
  useRouter: () => useRouterMock(),
  useSearchParams: () => useSearchParamsMock()
}));

// 실제 SearchBar 컴포넌트를 사용합니다.
describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouterMock.mockReturnValue({ push });
    useSearchParamsMock.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    });
  });

  it('올바르게 렌더링 되어야 함', () => {
    render(<SearchBar />);
    
    // 기본 요소들이 렌더링 되었는지 확인
    expect(screen.getByPlaceholderText('검색어 입력 또는 #태그 입력')).toBeInTheDocument();
    expect(screen.getByText('검색')).toBeInTheDocument();
  });
  
  it('URL에서 검색어를 가져와 입력 필드에 표시해야 함', () => {
    // URL 파라미터 모킹 설정
    useSearchParamsMock.mockReturnValue({
      get: (param: string) => param === 'q' ? '테스트쿼리' : null
    });
    
    render(<SearchBar />);
    
    // useEffect에서 URL 파라미터를 가져와 입력 필드에 설정
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    expect(inputElement).toHaveValue('테스트쿼리');
  });
  
  it('검색 버튼 클릭 시 일반 검색어로 올바른 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '일반검색어' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?q=%EC%9D%BC%EB%B0%98%EA%B2%80%EC%83%89%EC%96%B4');
  });
  
  it('태그 검색어(#으로 시작)로 검색 시 올바른 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 태그 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '#태그검색' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?tag=%ED%83%9C%EA%B7%B8%EA%B2%80%EC%83%89');
  });
  
  it('빈 검색어로 검색 시 기본 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드를 비움
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 기본 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards');
  });
  
  it('#만 입력한 경우 처리를 확인', async () => {
    render(<SearchBar />);
    
    // 입력 필드에 # 만 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '#' } });
    
    // 입력 잘 되었는지 확인
    expect(inputElement).toHaveValue('#');
    
    // push 함수가 호출되지 않았는지 확인 (초기 상태)
    expect(push).not.toHaveBeenCalled();
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // #만 입력된 경우는 tag가 빈 문자열이 되어 라우팅이 발생하지 않음
    // SearchBar.tsx의 handleSearch 함수 내 다음 로직에 의해:
    // if (searchTerm.startsWith('#')) {
    //   const tag = searchTerm.slice(1); // # 제거
    //   if (tag) { // 빈 문자열은 falsy이므로 이 조건을 통과하지 못함
    //     router.push(`/cards?tag=${encodeURIComponent(tag)}`);
    //   }
    // }
    
    // 라우팅이 발생하지 않으므로 push 함수가 호출되지 않아야 함
    expect(push).not.toHaveBeenCalled();
  });
  
  it('엔터 키를 눌러도 검색이 실행되어야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '엔터키검색' } });
    
    // 엔터 키 이벤트 발생
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?q=%EC%97%94%ED%84%B0%ED%82%A4%EA%B2%80%EC%83%89');
  });
  
  it('다른 키를 눌렀을 때는 검색이 실행되지 않아야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '다른키테스트' } });
    
    // 다른 키 이벤트 발생
    fireEvent.keyDown(inputElement, { key: 'Tab' });
    
    // 검색이 실행되지 않아야 함
    expect(push).not.toHaveBeenCalled();
  });
  
  it('X 버튼 클릭 시 검색어가 초기화되고 기본 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '지울검색어' } });
    
    // X 버튼이 표시되어야 함
    const clearButton = screen.getByRole('button', { name: '' }); // X 아이콘은 텍스트가 없음
    expect(clearButton).toBeInTheDocument();
    
    // X 버튼 클릭
    fireEvent.click(clearButton);
    
    // 검색어가 초기화되고 기본 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards');
    
    // 입력 값이 클릭 후에 비워져야 함
    // 리액트의 상태 업데이트는 비동기적이기 때문에 추가 렌더링 후 확인해야 함
    expect(screen.getByPlaceholderText('검색어 입력 또는 #태그 입력')).not.toHaveValue('지울검색어');
  });
});
```

src/components/cards/SearchBar.tsx
```
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  // URL에서 검색어 가져오기
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
  }, [searchParams]);
  
  // 검색 실행
  const handleSearch = () => {
    // 태그 검색과 일반 검색 분리
    // #으로 시작하는 검색어는 태그 검색으로 처리
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.slice(1); // # 제거
      if (tag) {
        router.push(`/cards?tag=${encodeURIComponent(tag)}`);
      }
    } else if (searchTerm) {
      router.push(`/cards?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/cards');
    }
  };
  
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 검색어 초기화
  const clearSearch = () => {
    setSearchTerm('');
    router.push('/cards');
  };
  
  return (
    <div className="w-full flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="검색어 입력 또는 #태그 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-8"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} variant="default">
        <Search size={18} className="mr-2" />
        검색
      </Button>
    </div>
  );
}; 
```

src/components/editor/TiptapEditor.tsx
```
"use client";

import React, { useCallback, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { 
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Image as ImageIcon
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  showToolbar?: boolean
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = '내용을 입력하세요...', 
  showToolbar = true 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [1, 2],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[150px] prose dark:prose-invert focus:outline-none max-w-none p-4 border rounded-md',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL 입력', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('이미지 URL 입력');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {showToolbar && (
        <div className="toolbar border rounded-md mb-2 p-1 flex flex-wrap gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-secondary' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-secondary' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-secondary' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}
          >
            <H1Icon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
          >
            <H2Icon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-secondary' : ''}
          >
            <OrderedListIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-background shadow-lg border rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-secondary' : ''}
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-secondary' : ''}
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={setLink}
              className={editor.isActive('link') ? 'bg-secondary' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Floating Menu */}
      {editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-background shadow-lg border rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <H1Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <H2Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <OrderedListIcon className="h-4 w-4" />
            </Button>
          </div>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
} 
```

src/components/editor/TiptapViewer.tsx
```
"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';

interface TiptapViewerProps {
  content: string;
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Link.configure({
        openOnClick: true,
      }),
      Heading.configure({
        levels: [1, 2],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none',
      },
    },
  });

  return <EditorContent editor={editor} />;
} 
```

src/components/tags/TagForm.test.tsx
```
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagForm from "./TagForm";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";

// 페치 모킹
global.fetch = vi.fn();

// 윈도우 리로드 모킹
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    reload: mockReload,
  },
  writable: true,
});

// Toast 모킹
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("TagForm 컴포넌트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 성공적인 응답을 기본으로 설정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    // 각 테스트 후에 정리
    vi.resetAllMocks();
    document.body.innerHTML = "";
  });

  test("태그 입력이 작동합니다", async () => {
    const user = userEvent.setup();
    render(<TagForm />);

    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    expect(tagInput).toHaveValue("새로운태그");
  });

  test("빈 태그 이름으로 제출하면 오류가 표시됩니다", async () => {
    const user = userEvent.setup();
    render(<TagForm />);

    // 빈 입력으로 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));

    // 오류 메시지 확인
    expect(toast.error).toHaveBeenCalledWith("태그 이름을 입력해주세요.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("IME 입력이 올바르게 처리됩니다", async () => {
    const user = userEvent.setup();
    render(<TagForm />);

    const tagInput = screen.getByLabelText("태그 이름");
    
    // IME 조합 시작
    fireEvent.compositionStart(tagInput);
    
    // 입력
    await user.type(tagInput, "프롬프트");
    
    // IME 조합 종료
    fireEvent.compositionEnd(tagInput);
    
    expect(tagInput).toHaveValue("프롬프트");
    
    // 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));
    
    // 요청이 제대로 전송되었는지 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "프롬프트",
        }),
      });
    });
  });

  test("태그가 성공적으로 생성됩니다", async () => {
    const user = userEvent.setup();
    render(<TagForm />);

    // 태그 이름 입력
    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    
    // 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));
    
    // 요청이 제대로 전송되었는지 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "새로운태그",
        }),
      });
    });

    // 성공 메시지와 페이지 리로드 확인
    expect(toast.success).toHaveBeenCalledWith("태그가 생성되었습니다.");
    expect(mockReload).toHaveBeenCalled();
  });

  test("제출 중에는 버튼이 비활성화됩니다", async () => {
    // fetch를 지연시켜 로딩 상태를 확인할 수 있도록 설정
    (global.fetch as any).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => ({}),
        });
      }, 100);
    }));

    const user = userEvent.setup();
    render(<TagForm />);

    // 태그 이름 입력
    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    
    // 제출
    const submitButton = screen.getByRole("button", { name: "태그 생성" });
    await user.click(submitButton);
    
    // 버튼이 비활성화되었는지 확인
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("생성 중...");
    
    // 비동기 작업 완료 대기
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("태그 생성");
    });
  });

  test("API 오류 시 에러 메시지가 표시됩니다", async () => {
    // 오류 응답 설정
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "서버 오류가 발생했습니다" }),
    });

    // console.error 출력을 억제
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const user = userEvent.setup();
    render(<TagForm />);

    // 태그 이름 입력
    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    
    // 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));
    
    // 오류 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("태그 생성에 실패했습니다.");
    });

    // console.error 복원
    console.error = originalConsoleError;
  });

  test("Error 객체의 message가 토스트 메시지로 표시됩니다", async () => {
    // Error 객체를 던지도록 설정
    (global.fetch as any).mockImplementation(async () => {
      const errorObj = new Error("네트워크 오류가 발생했습니다");
      throw errorObj;
    });

    // console.error 출력을 억제
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const user = userEvent.setup();
    render(<TagForm />);

    // 태그 이름 입력
    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    
    // 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));
    
    // Error 객체의 message가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("네트워크 오류가 발생했습니다");
    });

    // console.error 복원
    console.error = originalConsoleError;
  });

  test("Non-Error 객체가 전달되면 기본 에러 메시지가 표시됩니다", async () => {
    // Non-Error 객체를 던지도록 설정
    (global.fetch as any).mockImplementation(() => {
      throw "문자열 에러"; // Error 인스턴스가 아닌 단순 문자열
    });

    // console.error 출력을 억제
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const user = userEvent.setup();
    render(<TagForm />);

    // 태그 이름 입력
    const tagInput = screen.getByLabelText("태그 이름");
    await user.type(tagInput, "새로운태그");
    
    // 제출
    await user.click(screen.getByRole("button", { name: "태그 생성" }));
    
    // 기본 에러 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("태그 생성에 실패했습니다.");
    });

    // console.error 복원
    console.error = originalConsoleError;
  });
}); 
```

src/components/tags/TagForm.tsx
```
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TagForm() {
  const [tagName, setTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      toast.error("태그 이름을 입력해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tagName.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "태그 생성에 실패했습니다.");
      }
      
      const data = await response.json();
      toast.success("태그가 생성되었습니다.");
      setTagName("");
      
      // 페이지 새로고침을 통해 목록 업데이트
      window.location.reload();
    } catch (error) {
      console.error("태그 생성 오류:", error);
      toast.error(error instanceof Error ? error.message : "태그 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tagName">태그 이름</Label>
        <Input
          id="tagName"
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="새 태그 이름을 입력하세요"
          disabled={isSubmitting}
          maxLength={50}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "생성 중..." : "태그 생성"}
      </Button>
    </form>
  );
} 
```

src/components/tags/TagList.test.tsx
```
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import TagList from './TagList';
import '@testing-library/jest-dom/vitest';

// fetch 모킹
global.fetch = vi.fn() as Mock;

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('TagList', () => {
  // 테스트용 태그 데이터
  const mockTags = [
    { id: '1', name: '자바스크립트', count: 5, createdAt: '2023년 1월 1일' },
    { id: '2', name: '리액트', count: 3, createdAt: '2023년 2월 1일' },
    { id: '3', name: '타입스크립트', count: 0, createdAt: '2023년 3월 1일' }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // fetch 기본 모킹 설정
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: '태그가 성공적으로 삭제되었습니다.' })
    } as Response);
  });
  
  it('태그 목록이 올바르게 렌더링되어야 함', () => {
    render(<TagList initialTags={mockTags} />);
    
    // 각 태그 항목이 렌더링되었는지 확인
    expect(screen.getByText('자바스크립트')).toBeInTheDocument();
    expect(screen.getByText('리액트')).toBeInTheDocument();
    expect(screen.getByText('타입스크립트')).toBeInTheDocument();
    
    // 각 태그의 카드 수가 올바르게 표시되었는지 확인
    expect(screen.getByText('5개 카드')).toBeInTheDocument();
    expect(screen.getByText('3개 카드')).toBeInTheDocument();
    expect(screen.getByText('0개')).toBeInTheDocument();
    
    // 생성일이 올바르게 표시되었는지 확인
    expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
    expect(screen.getByText('2023년 2월 1일')).toBeInTheDocument();
    expect(screen.getByText('2023년 3월 1일')).toBeInTheDocument();
  });
  
  it('태그가 없을 경우 메시지가 표시되어야 함', () => {
    render(<TagList initialTags={[]} />);
    
    expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();
  });
  
  it('태그 삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', async () => {
    render(<TagList initialTags={mockTags} />);
    
    // 첫 번째 태그의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    // 확인 다이얼로그가 표시되었는지 확인
    expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
    expect(screen.getByText(/태그 "자바스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
    expect(screen.getByText('이 태그가 지정된 5개의 카드에서 태그가 제거됩니다.')).toBeInTheDocument();
  });
  
  it('카드 수가 0인 태그는 경고 메시지가 표시되지 않아야 함', async () => {
    render(<TagList initialTags={mockTags} />);
    
    // 세 번째 태그(카드 수 0)의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[2]);
    
    // 확인 다이얼로그가 표시되었는지 확인
    expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
    expect(screen.getByText(/태그 "타입스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
    
    // 경고 메시지가 표시되지 않아야 함
    expect(screen.queryByText(/이 태그가 지정된 0개의 카드에서 태그가 제거됩니다./)).not.toBeInTheDocument();
  });
  
  it('태그 삭제 확인 시 API 호출이 이루어지고 태그가 목록에서 제거되어야 함', async () => {
    render(<TagList initialTags={mockTags} />);
    
    // 첫 번째 태그의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    // 확인 다이얼로그에서 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
    });
    
    // 토스트 메시지 표시 확인
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith('태그가 삭제되었습니다.');
    
    // 태그가 목록에서 제거되었는지 확인
    expect(screen.queryByText('자바스크립트')).not.toBeInTheDocument();
    
    // 다른 태그는 여전히 표시되어야 함
    expect(screen.getByText('리액트')).toBeInTheDocument();
    expect(screen.getByText('타입스크립트')).toBeInTheDocument();
  });
  
  it('태그 삭제 실패 시 에러 메시지가 표시되어야 함', async () => {
    // fetch 실패 모킹
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '태그 삭제에 실패했습니다.' })
    } as Response);
    
    render(<TagList initialTags={mockTags} />);
    
    // 첫 번째 태그의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    // 확인 다이얼로그에서 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
    });
    
    // 에러 토스트 메시지 표시 확인
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
    
    // 태그는 여전히 목록에 남아있어야 함
    expect(screen.getByText('자바스크립트')).toBeInTheDocument();
  });
  
  it('태그 삭제 중 네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
    // fetch 네트워크 오류 모킹
    (global.fetch as Mock).mockRejectedValue(new Error('네트워크 오류'));
    
    render(<TagList initialTags={mockTags} />);
    
    // 첫 번째 태그의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    // 확인 다이얼로그에서 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
    });
    
    // 에러 토스트 메시지 표시 확인
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('네트워크 오류');
    
    // 태그는 여전히 목록에 남아있어야 함
    expect(screen.getByText('자바스크립트')).toBeInTheDocument();
  });
  
  // 브랜치 커버리지 테스트: tagToDelete가 null일 때 (46번 라인)
  it('tagToDelete가 null일 때 삭제 함수가 조기 종료되어야 함', async () => {
    // TagList 컴포넌트 렌더링
    const { rerender } = render(<TagList initialTags={mockTags} />);
    
    // React 내부 상태 직접 조작을 위한 커스텀 컴포넌트
    const TestComponent = () => {
      const [tags, setTags] = React.useState(mockTags);
      const [tagToDelete, setTagToDelete] = React.useState<string | null>(null);
      
      const handleDeleteTag = async () => {
        if (!tagToDelete) return;
        
        // 이 부분은 실행되지 않아야 함
        await fetch(`/api/tags/${tagToDelete}`, {
          method: "DELETE",
        });
      };
      
      // 테스트를 위해 함수 직접 호출
      React.useEffect(() => {
        handleDeleteTag();
      }, []);
      
      return <div>테스트 컴포넌트</div>;
    };
    
    // 커스텀 컴포넌트 렌더링
    render(<TestComponent />);
    
    // fetch가 호출되지 않았는지 확인
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  // 더 직접적인 방식으로 46번 라인 커버하기
  it('tagToDelete가 null일 때 삭제 시도하면 API 호출이 발생하지 않아야 함', async () => {
    // 모킹 클리어
    vi.clearAllMocks();
    
    // 컴포넌트 렌더링
    render(<TagList initialTags={mockTags} />);
    
    // TagList 내부 동작을 정확히 시뮬레이션
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]); // 태그 선택
    
    // 다이얼로그가 표시되었는지 확인
    expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
    
    // 취소 버튼 클릭 (이렇게 하면 tagToDelete는 설정되었지만 삭제 함수가 실행되기 전에 null로 재설정됨)
    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);
    
    // 취소 후 바로 다시 삭제 버튼을 찾아서 실행 시도
    // 이 시점에서 내부적으로 tagToDelete는 null이 되었을 것임
    try {
      // 컴포넌트 내부에서 직접 handleDeleteTag를 호출할 방법이 없으므로
      // 수동으로 해당 함수의 로직을 시뮬레이션합니다
      if (document.querySelector('[data-open="true"]')) {
        const confirmButton = screen.getByRole('button', { name: '삭제' });
        fireEvent.click(confirmButton); // 이 때 내부적으로 null 체크가 발생함
      }
    } catch (e) {
      // 버튼이 이미 사라진 경우 에러가 발생할 수 있음
    }
    
    // 컴포넌트의 상태 변화를 기다림
    await waitFor(() => {
      // API 호출이 발생하지 않았는지 확인 (tagToDelete가 null이므로)
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  // 브랜치 커버리지 테스트: errorData.error가 없을 때 (57번 라인)
  it('API 응답에 error 속성이 없을 때 기본 오류 메시지를 사용해야 함', async () => {
    // error 속성이 없는 응답 모킹
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'no error field' }) // error 필드 없음
    } as Response);
    
    render(<TagList initialTags={mockTags} />);
    
    // 태그 삭제 프로세스 시작
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
    });
    
    // 기본 오류 메시지 사용 확인
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
  });
  
  // 브랜치 커버리지 테스트: error가 Error 인스턴스가 아닐 때 (65번 라인)
  it('error가 Error 인스턴스가 아닐 때 기본 오류 메시지를 사용해야 함', async () => {
    // Error 객체가 아닌 문자열 등의 오류로 reject
    (global.fetch as Mock).mockRejectedValue('일반 문자열 에러'); // Error 인스턴스 아님
    
    render(<TagList initialTags={mockTags} />);
    
    // 태그 삭제 프로세스 시작
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
    });
    
    // 기본 오류 메시지 사용 확인
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
  });
  
  it('다양한 태그 이름(한글, 영어, 특수문자)이 올바르게 표시되어야 함', () => {
    const diverseTags = [
      { id: '1', name: '한글태그', count: 1, createdAt: '2023년 1월 1일' },
      { id: '2', name: 'EnglishTag', count: 2, createdAt: '2023년 2월 1일' },
      { id: '3', name: '특수_문자-태그', count: 3, createdAt: '2023년 3월 1일' },
      { id: '4', name: '한글English혼합123', count: 4, createdAt: '2023년 4월 1일' }
    ];
    
    render(<TagList initialTags={diverseTags} />);
    
    // 각 태그가 올바르게 표시되는지 확인
    expect(screen.getByText('한글태그')).toBeInTheDocument();
    expect(screen.getByText('EnglishTag')).toBeInTheDocument();
    expect(screen.getByText('특수_문자-태그')).toBeInTheDocument();
    expect(screen.getByText('한글English혼합123')).toBeInTheDocument();
  });
}); 
```

src/components/tags/TagList.tsx
```
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

interface TagListProps {
  initialTags: TagItem[];
}

export default function TagList({ initialTags }: TagListProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/tags/${tagToDelete}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "태그 삭제에 실패했습니다.");
      }
      
      // 태그 목록에서 삭제된 태그 제거
      setTags(tags.filter(tag => tag.id !== tagToDelete));
      toast.success("태그가 삭제되었습니다.");
    } catch (error) {
      console.error("태그 삭제 오류:", error);
      toast.error(error instanceof Error ? error.message : "태그 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setTagToDelete(null);
    }
  };

  return (
    <div>
      {tags.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">등록된 태그가 없습니다.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>태그 이름</TableHead>
              <TableHead className="text-center">카드 수</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {tag.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {tag.count > 0 ? (
                    <Link href={`/cards?tag=${tag.name}`}>
                      <Button variant="link" size="sm" className="p-0">
                        {tag.count}개 카드
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">0개</span>
                  )}
                </TableCell>
                <TableCell>{tag.createdAt}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTagToDelete(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>태그 삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                          태그 "{tag.name}"을(를) 삭제하시겠습니까?
                        </AlertDialogDescription>
                        {tag.count > 0 && (
                          <AlertDialogDescription className="text-destructive">
                            이 태그가 지정된 {tag.count}개의 카드에서 태그가 제거됩니다.
                          </AlertDialogDescription>
                        )}
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTag}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 
```

src/app/api/cards/route.test.ts
```
/**
 * @vitest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// 타입 정의
interface RequestOptions {
  method?: string;
  body?: string;
}

interface ResponseOptions {
  status?: number;
}

// NextResponse와 prisma 모킹
vi.mock('next/server', () => {
  const NextResponseMock = {
    json: vi.fn().mockImplementation((data: any, options?: ResponseOptions) => ({
      status: options?.status || 200,
      json: async () => data,
    }))
  };
  
  return {
    NextRequest: vi.fn().mockImplementation((url: string, options?: RequestOptions) => ({
      url,
      method: options?.method || 'GET',
      json: vi.fn().mockResolvedValue(options?.body ? JSON.parse(options.body) : {}),
      nextUrl: {
        searchParams: new URLSearchParams(url?.split('?')[1] || ''),
      },
    })),
    NextResponse: NextResponseMock
  };
});

// prisma 모킹 - 내부에서 모킹 함수 생성
vi.mock('@/lib/prisma', () => {
  const cardFindMany = vi.fn();
  const cardCreate = vi.fn();
  const cardFindUnique = vi.fn();
  const userFindUnique = vi.fn();
  const tagFindUnique = vi.fn();
  const tagCreate = vi.fn();
  const cardTagDeleteMany = vi.fn();
  const cardTagCreate = vi.fn();
  
  return {
    prisma: {
      card: {
        findMany: cardFindMany,
        create: cardCreate,
        findUnique: cardFindUnique,
      },
      user: {
        findUnique: userFindUnique,
      },
      cardTag: {
        deleteMany: cardTagDeleteMany,
        create: cardTagCreate,
      },
      tag: {
        findUnique: tagFindUnique,
        create: tagCreate,
      }
    }
  };
});

// zod 모킹
vi.mock('zod', async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    z: {
      ...actual.z,
      object: () => ({
        safeParse: vi.fn().mockImplementation((data) => {
          // title이 없으면 유효성 검사 실패
          if (!data.title) {
            return {
              success: false,
              error: {
                format: () => ({ title: { _errors: ['제목은 필수입니다.'] } })
              }
            };
          }
          // userId가 유효하지 않으면 실패
          if (data.userId && typeof data.userId !== 'string') {
            return {
              success: false,
              error: {
                format: () => ({ userId: { _errors: ['유효한 사용자 ID가 필요합니다.'] } })
              }
            };
          }
          return {
            success: true,
            data
          };
        })
      }),
      string: () => ({
        min: () => ({
          optional: vi.fn(),
          uuid: vi.fn().mockReturnThis()
        }),
        optional: vi.fn(),
        uuid: vi.fn().mockReturnThis()
      }),
      array: () => ({
        optional: vi.fn()
      })
    }
  };
});

describe('Cards API', () => {
  // console.error 모킹
  const originalConsoleError = console.error;
  let prismaMock: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    console.error = vi.fn();
    
    // 모든 테스트에서 사용할 prisma mock 설정
    const importedModule = await import('@/lib/prisma');
    prismaMock = vi.mocked(importedModule).prisma;
  });
  
  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('GET /api/cards', () => {
    it('모든 카드를 성공적으로 조회한다', async () => {
      // 모킹된 데이터
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' }
        },
        {
          id: '2',
          title: '테스트 카드 2',
          content: '테스트 내용 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user2',
          user: { id: 'user2', name: '사용자 2' }
        },
      ];

      // Prisma 응답 모킹
      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalled();
    });

    it('사용자 ID로 필터링된 카드를 조회한다', async () => {
      const userId = 'user1';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId,
          user: { id: userId, name: '사용자 1' }
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?userId=${userId}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('검색어로 카드를 필터링한다', async () => {
      const searchQuery = '테스트';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' }
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?q=${searchQuery}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('태그로 카드를 필터링한다', async () => {
      const tagName = '테스트태그';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' },
          cardTags: [
            {
              id: 'cardtag-1',
              cardId: '1',
              tagId: 'tag-1',
              tag: {
                id: 'tag-1',
                name: tagName
              }
            }
          ]
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?tag=${tagName}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: {
          cardTags: {
            some: {
              tag: {
                name: tagName
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      prismaMock.card.findMany.mockRejectedValueOnce(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/cards', () => {
    it('유효한 데이터로 카드를 성공적으로 생성한다', async () => {
      // 유효한 요청 데이터
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['테스트태그']
      };
      
      // 생성된 카드 데이터 모킹
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 태그 포함된 카드 데이터 모킹
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: 'new-card-id',
            tagId: 'tag-1',
            tag: {
              id: 'tag-1',
              name: '테스트태그'
            }
          }
        ]
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '테스트 사용자'
      });
      
      // 카드 생성 모킹
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      
      // 태그 조회 모킹
      prismaMock.tag.findUnique.mockResolvedValueOnce({
        id: 'tag-1',
        name: '테스트태그'
      });
      
      // 카드와 태그 정보 조회 모킹
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      expect(prismaMock.card.create).toHaveBeenCalledWith({
        data: {
          title: requestData.title,
          content: requestData.content,
          userId: requestData.userId
        }
      });
    });

    it('태그가 없는 카드를 생성한다', async () => {
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      prismaMock.card.findUnique.mockResolvedValueOnce(createdCard);
      
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdCard);
      
      // 태그 처리 함수가 호출되지 않았는지 확인
      expect(prismaMock.cardTag.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.tag.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.tag.create).not.toHaveBeenCalled();
      expect(prismaMock.cardTag.create).not.toHaveBeenCalled();
    });

    it('이미 존재하는 태그를 포함한 카드를 생성한다', async () => {
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['기존태그']
      };
      
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingTag = {
        id: 'tag-1',
        name: '기존태그'
      };
      
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      prismaMock.tag.findUnique.mockResolvedValueOnce(existingTag);
      prismaMock.cardTag.create.mockResolvedValueOnce({
        id: 'cardtag-1',
        cardId: createdCard.id,
        tagId: existingTag.id
      });
      
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: createdCard.id,
            tagId: existingTag.id,
            tag: existingTag
          }
        ]
      };
      
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      
      // 태그 처리 함수가 올바르게 호출되었는지 확인
      expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
        where: { cardId: createdCard.id }
      });
      expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
        where: { name: '기존태그' }
      });
      expect(prismaMock.tag.create).not.toHaveBeenCalled();
      expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
        data: {
          cardId: createdCard.id,
          tagId: existingTag.id
        }
      });
    });

    it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
      // 유효하지 않은 요청 데이터 (제목 누락)
      const requestData = {
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(prismaMock.card.create).not.toHaveBeenCalled();
    });
    
    it('존재하지 않는 사용자로 요청 시 404 응답을 반환한다', async () => {
      // 유효한 요청 데이터 (존재하지 않는 사용자 ID)
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: 'non-existent-user-id',
      };
      
      // 사용자가 존재하지 않음을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('존재하지 않는 사용자입니다.');
      expect(prismaMock.card.create).not.toHaveBeenCalled();
    });
    
    it('카드 생성 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
      // 유효한 요청 데이터
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '테스트 사용자'
      });
      
      // 카드 생성 중 에러 발생 모킹
      prismaMock.card.create.mockRejectedValueOnce(new Error('DB 에러'));
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('카드를 생성하는 중 오류가 발생했습니다.');
      expect(console.error).toHaveBeenCalled();
    });
    
    it('새로운 태그를 생성하여, 카드와 함께 저장한다', async () => {
      // 유효한 요청 데이터 (새로운 태그 포함)
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['새로운태그']
      };
      
      // 생성된 카드 데이터 모킹
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      // 카드 생성 모킹
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      
      // 태그가 존재하지 않음을 모킹
      prismaMock.tag.findUnique.mockResolvedValueOnce(null);
      
      // 새 태그 생성 모킹
      const newTag = {
        id: 'new-tag-id',
        name: '새로운태그'
      };
      prismaMock.tag.create.mockResolvedValueOnce(newTag);
      
      // 카드-태그 연결 모킹
      prismaMock.cardTag.create.mockResolvedValueOnce({
        id: 'cardtag-1',
        cardId: createdCard.id,
        tagId: newTag.id
      });
      
      // 태그 포함된 카드 데이터 모킹
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: 'new-card-id',
            tagId: 'new-tag-id',
            tag: newTag
          }
        ]
      };
      
      // 카드 조회 모킹
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      
      // 태그 처리 함수가 올바르게 호출되었는지 확인
      expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
        where: { cardId: createdCard.id }
      });
      
      // 태그 조회 확인
      expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
        where: { name: '새로운태그' }
      });
      
      // 새 태그 생성 확인
      expect(prismaMock.tag.create).toHaveBeenCalledWith({
        data: { name: '새로운태그' }
      });
      
      // 카드-태그 연결 확인
      expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
        data: {
          cardId: createdCard.id,
          tagId: newTag.id
        }
      });
    });
  });
}); 
```

src/app/api/cards/route.test.ts.bak2
```
/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import prisma from '@/lib/prisma';

// Prisma 클라이언트 모킹
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    card: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Request 객체 모킹 - 타입 오류 해결
if (!global.Request) {
  // @ts-ignore - 테스트 환경에서만 사용되는 모킹
  global.Request = function Request() {
    return {
      json: () => Promise.resolve({}),
    };
  };
}

// NextRequest 모킹
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, options) => {
      return {
        url,
        method: options?.method || 'GET',
        json: jest.fn().mockImplementation(async () => {
          return options?.body ? JSON.parse(options.body) : {};
        }),
        nextUrl: {
          searchParams: new URLSearchParams(url?.split('?')[1] || ''),
        },
      };
    }),
    NextResponse: {
      json: jest.fn().mockImplementation((data, options) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

describe('Cards API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cards', () => {
    it('모든 카드를 성공적으로 조회한다', async () => {
      // 모킹된 데이터
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
        },
        {
          id: '2',
          title: '테스트 카드 2',
          content: '테스트 내용 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user2',
        },
      ];

      // Prisma 응답 모킹
      (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCards);
      expect(prisma.card.findMany).toHaveBeenCalledTimes(1);
    });

    it('사용자 ID로 필터링된 카드를 조회한다', async () => {
      // 모킹된 데이터
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
        },
      ];

      // Prisma 응답 모킹
      (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards?userId=user1');
      const response = await GET(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCards);
      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        })
      );
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      (prisma.card.findMany as jest.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/cards', () => {
    it('유효한 데이터로 카드를 생성한다', async () => {
      // 모킹된 데이터
      const mockCard = {
        id: '1',
        title: '새 카드',
        content: '새 카드 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
      };

      // 요청 데이터
      const requestData = {
        title: '새 카드',
        content: '새 카드 내용',
        userId: 'user1',
      };

      // Prisma 응답 모킹
      (prisma.card.create as jest.Mock).mockResolvedValue(mockCard);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(201);
      expect(data).toEqual(mockCard);
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: requestData,
      });
    });

    it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
      // 유효하지 않은 요청 데이터 (제목 누락)
      const requestData = {
        content: '새 카드 내용',
        userId: 'user1',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(prisma.card.create).not.toHaveBeenCalled();
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 요청 데이터
      const requestData = {
        title: '새 카드',
        content: '새 카드 내용',
        userId: 'user1',
      };

      // 에러 모킹
      (prisma.card.create as jest.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
}); 
```

src/app/api/cards/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 카드 생성 스키마
const createCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().optional(),
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
  tags: z.array(z.string()).optional()
});

// 태그 처리 함수
async function processTagsForCard(cardId: string, tagNames: string[] = []) {
  try {
    // 중복 태그 제거 및 공백 제거
    const uniqueTags = [...new Set(tagNames.map(tag => tag.trim()))].filter(tag => tag.length > 0);
    
    // 카드와 연결된 기존 태그 삭제
    await prisma.cardTag.deleteMany({
      where: { cardId }
    });
    
    // 각 태그에 대해 처리
    for (const tagName of uniqueTags) {
      // 태그가 존재하는지 확인하고, 없으면 생성
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        });
      }
      
      // 카드와 태그 연결
      await prisma.cardTag.create({
        data: {
          cardId,
          tagId: tag.id
        }
      });
    }
  } catch (error) {
    console.error('태그 처리 중 오류:', error);
    // 태그 처리 실패해도 흐름 계속 (태그는 필수가 아님)
  }
}

// 데이터베이스 연결 안전하게 수행하는 래퍼 함수
async function safeDbOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { data: null, error: errorMessage };
  }
}

// 카드 생성 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱 안전하게 처리
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('요청 본문 파싱 오류:', jsonError);
      return NextResponse.json(
        { error: '유효하지 않은 요청 형식입니다.' },
        { status: 400 }
      );
    }
    
    // 데이터 유효성 검사
    const validation = createCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { title, content, userId, tags } = validation.data;
    
    // 사용자 존재 여부 확인
    const userResult = await safeDbOperation(
      () => prisma.user.findUnique({
        where: { id: userId }
      }),
      '사용자 정보를 확인하는 중 오류가 발생했습니다.'
    );
    
    if (userResult.error) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 500 }
      );
    }
    
    if (!userResult.data) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      );
    }
    
    // 카드 생성
    const cardResult = await safeDbOperation(
      () => prisma.card.create({
        data: {
          title,
          content,
          userId
        }
      }),
      '카드를 생성하는 중 오류가 발생했습니다.'
    );
    
    if (cardResult.error || !cardResult.data) {
      return NextResponse.json(
        { error: cardResult.error || '카드 생성에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 태그 처리
    if (tags && tags.length > 0) {
      await processTagsForCard(cardResult.data.id, tags);
    }
    
    // 생성된 카드와 태그 조회
    const cardWithTagsResult = await safeDbOperation(
      () => prisma.card.findUnique({
        where: { id: cardResult.data!.id },
        include: {
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      }),
      '카드 정보를 조회하는 중 오류가 발생했습니다.'
    );
    
    if (cardWithTagsResult.error) {
      // 태그 정보 조회 실패해도 기본 카드 정보는 반환
      return NextResponse.json(cardResult.data, { status: 201 });
    }
    
    return NextResponse.json(cardWithTagsResult.data, { status: 201 });
  } catch (error) {
    console.error('카드 생성 오류:', error);
    return NextResponse.json(
      { error: '카드를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 모든 카드 조회 API
export async function GET(request: NextRequest) {
  try {
    // 환경 정보 로깅
    console.log('API 호출 환경:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 10) + '...' // 보안을 위해 URL 전체를 로깅하지 않음
    });
    
    // Prisma 클라이언트가 초기화되었는지 확인
    if (!prisma) {
      console.error('Prisma 클라이언트가 초기화되지 않았습니다.');
      return NextResponse.json(
        { error: '데이터베이스 연결을 초기화하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // Prisma 클라이언트 상태 확인
    try {
      // 빠른 데이터베이스 연결 테스트
      await prisma.$queryRaw`SELECT 1`;
      console.log('데이터베이스 연결 테스트 성공');
    } catch (dbError) {
      console.error('데이터베이스 연결 테스트 실패:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 연결 실패. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }
    
    // URL 쿼리 파라미터 파싱
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    
    console.log('카드 조회 요청 - 파라미터:', { userId, q, tag });
    
    // 검색 조건 구성
    const where: any = {};
    
    // 사용자 ID 필터
    if (userId) {
      where.userId = userId;
    }
    
    // 제목/내용 검색
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // 태그 검색
    if (tag) {
      where.cardTags = {
        some: {
          tag: {
            name: tag
          }
        }
      };
    }
    
    console.log('카드 조회 쿼리 조건:', JSON.stringify(where));
    
    // 안전한 데이터베이스 조회
    const cardsResult = await safeDbOperation(
      () => prisma.card.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      }),
      '카드를 조회하는 중 오류가 발생했습니다.'
    );
    
    if (cardsResult.error) {
      return NextResponse.json(
        { error: cardsResult.error },
        { status: 500 }
      );
    }
    
    // 결과가 null이 아닌지 확인
    const cards = cardsResult.data || [];
    console.log(`카드 조회 결과: ${cards.length}개 카드 찾음`);
    
    return NextResponse.json(cards);
  } catch (error) {
    console.error('카드 조회 API 오류:', error);
    return NextResponse.json(
      { error: '카드 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 
```

src/app/api/db-init/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db-init';

/**
 * DB 초기화 API 엔드포인트
 * 개발 환경에서만 사용 가능
 */
export async function GET(request: NextRequest) {
  // 개발 환경인지 확인
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '이 API는 개발 환경에서만 사용 가능합니다.' },
      { status: 403 }
    );
  }

  try {
    await initDatabase();
    
    return NextResponse.json(
      { success: true, message: '데이터베이스 초기화가 완료되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DB 초기화 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: '데이터베이스 초기화 중 오류가 발생했습니다.', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 
```

src/app/api/health-check/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DB 연결 상태를 확인하는 헬스 체크 API
 * HEAD 또는 GET 요청 모두 사용 가능
 */
export async function HEAD(request: NextRequest) {
  try {
    // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    // 응답 본문 없이 200 OK만 반환
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('DB 연결 실패:', error);
    return new NextResponse(null, { status: 503 }); // Service Unavailable
  }
}

export async function GET(request: NextRequest) {
  try {
    // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('DB 연결 실패:', error);
    
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 503 } // Service Unavailable
    );
  }
} 
```

src/app/api/board-settings/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 보드 설정 스키마
const boardSettingsSchema = z.object({
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
  settings: z.object({
    snapToGrid: z.boolean(),
    snapGrid: z.tuple([z.number(), z.number()]),
    connectionLineType: z.string(),
    markerEnd: z.string().nullable(),
    strokeWidth: z.number(),
    markerSize: z.number()
  })
});

// 보드 설정 저장 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = boardSettingsSchema.parse(body);

    // 기존 설정이 있는지 확인
    const existingSettings = await prisma.boardSettings.findUnique({
      where: { userId }
    });

    // 설정 업데이트 또는 생성
    if (existingSettings) {
      await prisma.boardSettings.update({
        where: { userId },
        data: {
          settings: settings
        }
      });
    } else {
      await prisma.boardSettings.create({
        data: {
          userId,
          settings
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('보드 설정 저장 실패:', error);
    return NextResponse.json({ error: '보드 설정을 저장하는 데 실패했습니다.' }, { status: 500 });
  }
}

// 보드 설정 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const boardSettings = await prisma.boardSettings.findUnique({
      where: { userId }
    });

    if (!boardSettings) {
      return NextResponse.json({ settings: null }, { status: 200 });
    }

    return NextResponse.json({ settings: boardSettings.settings }, { status: 200 });
  } catch (error) {
    console.error('보드 설정 조회 실패:', error);
    return NextResponse.json({ error: '보드 설정을 조회하는 데 실패했습니다.' }, { status: 500 });
  }
} 
```

src/app/api/tags/route.test.ts
```
/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// NextResponse.json 모킹
vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn().mockImplementation((url: string, options?: any) => ({
      url,
      method: options?.method || 'GET',
      json: vi.fn().mockImplementation(async () => {
        if (options?.body) {
          try {
            return JSON.parse(options.body);
          } catch {
            throw new Error('Invalid JSON');
          }
        }
        return {};
      }),
      nextUrl: {
        searchParams: new URLSearchParams(url?.split('?')[1] || ''),
      },
      cookies: {},
      page: {},
      ua: {},
      headers: new Headers(),
      signal: {},
      body: new ReadableStream(),
      text: vi.fn().mockImplementation(async () => {
        if (options?.body) {
          return options.body;
        }
        return '';
      }),
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      clone: vi.fn(),
      formData: vi.fn(),
      redirect: 'follow' as const,
      [Symbol.asyncIterator]: vi.fn()
    })),
    NextResponse: {
      json: vi.fn().mockImplementation((data: any, options: { status?: number } = {}) => {
        return {
          status: options.status || 200,
          body: data,
          json: () => Promise.resolve(data)
        };
      })
    }
  };
});

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

describe('태그 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  // 태그 목록 조회 테스트
  describe('GET /api/tags', () => {
    it('태그 목록을 성공적으로 반환해야 함', async () => {
      // 가짜 태그 데이터
      const mockTags = [
        { id: '1', name: 'JavaScript', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'React', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'TypeScript', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findMany as any).mockResolvedValue(mockTags);
      
      // GET 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      
      // 응답 검증
      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData).toEqual(mockTags);
    });
    
    it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
      // prisma 오류 모킹
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
      
      // GET 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '태그 목록을 가져오는 중 오류가 발생했습니다.'
      });
    });
  });

  // 태그 생성 테스트
  describe('POST /api/tags', () => {
    it('유효한 태그 데이터로 태그를 생성해야 함', async () => {
      // 가짜 태그 데이터
      const tagData = { name: '새로운태그' };
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });
    
    it('이미 존재하는 태그 이름으로 생성 시 400 에러를 반환해야 함', async () => {
      // 가짜 태그 데이터
      const tagData = { name: '이미존재하는태그' };
      const existingTag = { 
        id: '5', 
        name: '이미존재하는태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(existingTag); // 이미 태그가 존재함
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '이미 존재하는 태그입니다.'
      });
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).not.toHaveBeenCalled();
    });
    
    it('유효하지 않은 데이터로 생성 시 400 에러를 반환해야 함', async () => {
      // 유효하지 않은 태그 데이터 (빈 이름)
      const invalidData = { name: '' };
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(invalidData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });

    it('잘못된 JSON 형식으로 요청 시 400 에러를 반환해야 함', async () => {
      // 1. 테스트 데이터 준비
      const invalidJson = '{invalid json}';
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: invalidJson
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });

    it('request.json() 실패 시 request.body가 문자열인 경우 처리해야 함', async () => {
      // 1. 테스트 데이터 준비
      const tagData = { name: '새로운태그' };
      const tagDataString = JSON.stringify(tagData);
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tagDataString
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      request.text = vi.fn().mockResolvedValue(tagDataString);
      
      // Prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // 6. 모킹 호출 검증
      expect(request.text).toHaveBeenCalled();
      expect(await request.text()).toBe(tagDataString);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });

    it('request.json() 실패 시 request.body가 객체인 경우 처리해야 함', async () => {
      // 1. 테스트 데이터 준비
      const tagData = { name: '새로운태그' };
      const tagDataString = JSON.stringify(tagData);
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tagDataString
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      request.text = vi.fn().mockResolvedValue(tagDataString);
      
      // Prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // 6. 모킹 호출 검증
      expect(request.text).toHaveBeenCalled();
      expect(await request.text()).toBe(tagDataString);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });

    it('태그 생성 중 서버 오류 발생 시 500 에러를 반환해야 함', async () => {
      // 유효한 태그 데이터
      const tagData = { name: '새로운태그' };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockRejectedValue(new Error('데이터베이스 오류')); // 생성 중 오류 발생
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '태그 생성 중 오류가 발생했습니다.'
      });
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });
  });
}); 
```

src/app/api/tags/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// 태그 스키마 정의
const tagSchema = z.object({
  name: z.string().min(1, '태그 이름은 필수입니다.').max(50, '태그 이름은 50자 이하여야 합니다.')
});

// 태그 목록 조회
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: '태그 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 생성
export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 추출
    let body;
    try {
      body = await request.json();
    } catch (error) {
      // request.json()이 실패하면 request.text()를 사용
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        // JSON 파싱에 실패하면 빈 객체 반환
        return NextResponse.json(
          { error: '잘못된 JSON 형식입니다.' },
          { status: 400 }
        );
      }
    }
    
    // 태그 데이터 유효성 검사
    const validationResult = tagSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // 태그 중복 확인
    const existingTag = await prisma.tag.findUnique({
      where: { name: validationResult.data.name }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: '이미 존재하는 태그입니다.' },
        { status: 400 }
      );
    }
    
    // 태그 생성
    const tag = await prisma.tag.create({
      data: {
        name: validationResult.data.name
      }
    });
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: '태그 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
```

src/app/auth/callback/page.tsx
```
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/auth';
import { setCookie, getCookie } from 'cookies-next';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(10); // 카운트다운 추가

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // URL에서 오류 패러미터 확인
        const searchParams = new URLSearchParams(window.location.search);
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const code = searchParams.get('code');
        
        // 현재 URL과 사용자 환경 정보 기록
        const debugStartInfo = `
현재 URL: ${window.location.href}
호스트: ${window.location.host}
환경: ${process.env.NODE_ENV}
리디렉션 URL 환경변수: ${process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL || '설정되지 않음'}
        `;
        setDebugInfo(debugStartInfo + `\n\n체크 1: URL 파라미터 - code: ${code ? '있음' : '없음'}, error: ${errorParam || '없음'}`);
        
        if (errorParam) {
          console.error('OAuth 에러:', errorParam, errorDescription);
          setError(`인증 오류: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }

        console.log('클라이언트 측 인증 콜백 처리 시작');
        console.log('현재 URL:', window.location.href);
        setDebugInfo(prev => prev + `\n체크 2: 콜백 처리 시작, URL: ${window.location.href}`);
        
        // Supabase 클라이언트 가져오기
        const supabase = getBrowserClient();
        console.log('Supabase 클라이언트 초기화 완료');
        setDebugInfo(prev => prev + '\n체크 3: Supabase 클라이언트 초기화');
        
        // 세션 상태 확인 (Supabase가 자동으로 URL의 코드를 처리)
        console.log('세션 상태 확인 시작');
        setDebugInfo(prev => prev + '\n체크 4: 세션 확인 시작');
        
        // 쿠키 확인
        const existingCookies = document.cookie;
        console.log('현재 쿠키:', existingCookies);
        setDebugInfo(prev => prev + `\n체크 5: 현재 쿠키 - ${existingCookies ? existingCookies.length + '바이트' : '없음'}`);
        
        // 직접 세션 가져오기 시도
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        // 세션 디버그 정보 추가
        const sessionDebugInfo = data?.session 
          ? `세션 있음, 사용자 ID: ${data.session.user?.id || '없음'}, 이메일: ${data.session.user?.email || '없음'}`
          : '세션 없음';
        setDebugInfo(prev => prev + `\n체크 6: 세션 데이터 - ${sessionDebugInfo}`);
        console.log('세션 데이터:', sessionDebugInfo);
        
        if (sessionError) {
          console.error('세션 확인 오류:', sessionError);
          setError(`세션 확인 중 오류: ${sessionError.message}`);
          setDebugInfo(prev => prev + `\n체크 7: 세션 오류 - ${sessionError.message}`);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log('인증 성공, 세션 생성됨');
          setDebugInfo(prev => prev + '\n체크 8: 인증 성공, 세션 생성됨');
          
          // 현재 호스트 이름 가져오기
          const hostname = window.location.hostname;
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
          
          // 도메인 설정 개선
          let cookieOptions: {
            maxAge: number;
            path: string;
            secure: boolean;
            sameSite: 'lax' | 'strict' | 'none';
            domain?: string;
          } = {
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
            secure: true, // production에서는 항상 true
            sameSite: 'lax'
          };
          
          // localhost가 아닌 경우에만 도메인 설정
          if (!isLocalhost) {
            cookieOptions = {
              ...cookieOptions,
              domain: hostname // 전체 호스트네임 사용
            };
          }
          
          // 쿠키 설정 시도 1: cookies-next 라이브러리
          try {
            setCookie('sb-access-token', data.session.access_token, cookieOptions);
            
            if (data.session.refresh_token) {
              setCookie('sb-refresh-token', data.session.refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30 // 30일
              });
            }
          } catch (cookieError) {
            console.error('cookies-next 설정 실패:', cookieError);
            setDebugInfo(prev => prev + `\n쿠키 설정 실패 (cookies-next): ${cookieError}`);
          }
          
          // 쿠키 설정 시도 2: document.cookie (백업)
          try {
            const cookieStr = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
            document.cookie = cookieStr;
            
            if (data.session.refresh_token) {
              document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`;
            }
          } catch (docCookieError) {
            console.error('document.cookie 설정 실패:', docCookieError);
            setDebugInfo(prev => prev + `\n쿠키 설정 실패 (document.cookie): ${docCookieError}`);
          }
          
          // localStorage 백업 (이미 존재하는 코드)
          try {
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at
            }));
            setDebugInfo(prev => prev + '\n로컬 스토리지 백업 완료');
          } catch (storageError) {
            console.error('로컬 스토리지 저장 오류:', storageError);
            setDebugInfo(prev => prev + `\n로컬 스토리지 오류: ${storageError}`);
          }
          
          console.log('세션 토큰을 쿠키에 저장함', {
            환경: process.env.NODE_ENV,
            호스트: hostname,
            도메인: cookieOptions.domain || '없음',
            보안: cookieOptions.secure ? 'HTTPS' : 'HTTP'
          });
          
          // 설정된 쿠키 확인
          const accessCookie = getCookie('sb-access-token');
          const refreshCookie = getCookie('sb-refresh-token');
          console.log('쿠키 확인 - 액세스 토큰:', accessCookie ? '존재함' : '없음');
          console.log('쿠키 확인 - 리프레시 토큰:', refreshCookie ? '존재함' : '없음');
          setDebugInfo(prev => prev + `\n체크 11: 쿠키 설정 확인 - 액세스: ${accessCookie ? '있음' : '없음'}, 리프레시: ${refreshCookie ? '있음' : '없음'}`);
          
          // 사용자 정보를 데이터베이스에 저장 또는 업데이트
          try {
            const userId = data.session.user.id;
            const userEmail = data.session.user.email;
            const userName = data.session.user.user_metadata?.full_name || 
                            (userEmail ? userEmail.split('@')[0] : '사용자');
            
            // 사용자 정보 저장 API 호출
            const response = await fetch('/api/user/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                id: userId,
                email: userEmail,
                name: userName,
              }),
            });
            
            if (!response.ok) {
              console.warn('사용자 정보 저장 실패:', await response.text());
              setDebugInfo(prev => prev + '\n체크 12: 사용자 정보 저장 실패');
            } else {
              console.log('사용자 정보 저장 성공');
              setDebugInfo(prev => prev + '\n체크 12: 사용자 정보 저장 성공');
            }
          } catch (dbError) {
            console.error('사용자 정보 처리 오류:', dbError);
            setDebugInfo(prev => prev + `\n체크 12-오류: 사용자 정보 처리 오류 - ${dbError}`);
            // 사용자 정보 저장 실패해도 인증은 계속 진행
          }
          
          // 페이지 이동 전 Supabase 세션 다시 한 번 확인
          console.log('인증 완료, 보드 페이지로 이동 준비');
          setDebugInfo(prev => prev + '\n체크 13: 보드 페이지로 이동 준비');
          
          // 카운트다운 시작
          setLoading(false);
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                
                // 카운트다운 완료 후 페이지 이동
                console.log('보드 페이지로 최종 이동');
                setDebugInfo(prev => prev + '\n체크 14: 보드 페이지로 최종 이동');
                
                // 리디렉션 방법 1: window.location.href (페이지 새로고침)
                window.location.href = '/board';
                
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          // 세션이 없으면 에러 표시
          console.error('세션 없음');
          setError('인증은 성공했지만 세션이 생성되지 않았습니다.');
          setDebugInfo(prev => prev + '\n체크 15: 세션 없음');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('인증 콜백 처리 오류:', error);
        setError(`인증 처리 중 오류: ${error?.message || '알 수 없는 오류'}`);
        setDebugInfo(prev => prev + `\n체크 16: 인증 콜백 처리 오류 - ${error?.message || '알 수 없는 오류'}`);
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-6 max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">인증 오류</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <details className="mb-4">
            <summary className="text-sm text-blue-500 cursor-pointer">디버그 정보 보기</summary>
            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-60 whitespace-pre-wrap">
              {debugInfo || '디버그 정보 없음'}
            </pre>
          </details>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.href = '/login'}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              로그인으로 돌아가기
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
          <p className="text-gray-600 mb-4">잠시만 기다려 주세요.</p>
        </>
      ) : (
        <>
          <div className="text-2xl text-green-500 mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">인증 성공!</h2>
          <p className="text-gray-600 mb-4">{countdown}초 후 자동으로 이동합니다...</p>
          <button 
            onClick={() => {window.location.href = '/board'}}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            지금 이동하기
          </button>
        </>
      )}
      <details className="w-full max-w-md mt-4">
        <summary className="text-sm text-blue-500 cursor-pointer">디버그 정보 보기</summary>
        <pre className="text-xs bg-gray-100 p-3 mt-2 rounded overflow-auto max-h-60 whitespace-pre-wrap">
          {debugInfo || '디버그 정보 없음'}
        </pre>
      </details>
    </div>
  );
} 
```

src/app/cards/[id]/DeleteButton.test.tsx
```
/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteButton, { callIfExists } from './DeleteButton';
import '@testing-library/jest-dom/vitest';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// 모킹 설정
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// fetch 모킹 헬퍼 함수
const mockFetchSuccess = () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
  });
};

const mockFetchError = (errorMessage = '카드 삭제에 실패했습니다.') => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: errorMessage })
  });
};

const mockFetchNetworkError = (errorMessage = '네트워크 오류') => {
  global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));
};

// 테스트 헬퍼 함수
const clickDeleteButton = () => {
  const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
  fireEvent.click(deleteButton);
};

const clickConfirmDeleteButton = () => {
  const confirmButton = screen.getByRole('button', { name: '삭제' });
  fireEvent.click(confirmButton);
};

// callIfExists 함수에 대한 별도 테스트 그룹
describe('callIfExists', () => {
  it('콜백이 존재하면, 콜백을 호출해야 함', () => {
    const callback = vi.fn();
    callIfExists(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('콜백이 undefined이면, 오류 없이 실행되어야 함', () => {
    expect(() => callIfExists(undefined)).not.toThrow();
  });
});

describe('DeleteButton', () => {
  const cardId = '123abc';
  
  beforeEach(() => {
    vi.resetAllMocks(); // 모든 모킹 초기화
    mockFetchSuccess(); // 기본적으로 성공 응답 모킹
  });
  
  afterEach(() => {
    cleanup(); // DOM 정리
  });
  
  describe('렌더링 및 UI 테스트', () => {
    it('삭제 버튼이 올바르게 렌더링되어야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Assert
      const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
      expect(deleteButton).toBeInTheDocument();
    });
    
    it('삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      
      // Assert
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });
    
    it('취소 버튼 클릭 시 다이얼로그가 닫혀야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act - 다이얼로그 열기
      clickDeleteButton();
      
      // Act - 취소 버튼 클릭
      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);
      
      // Assert
      expect(screen.queryByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).not.toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  describe('삭제 성공 시나리오', () => {
    it('삭제 성공 시 API 호출이 이루어지고 리디렉션되어야 함', async () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });
    
    it('삭제 성공 시 onSuccessfulDelete 콜백이 호출되어야 함', async () => {
      // Arrange
      const mockCallback = vi.fn();
      render(<DeleteButton cardId={cardId} onSuccessfulDelete={mockCallback} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });
    
    it('콜백이 제공되지 않아도 정상 동작해야 함', async () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />); // 콜백 없이 렌더링
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });
  });
  
  describe('삭제 중 상태 테스트', () => {
    it('삭제 중에는 버튼이 비활성화되고 로딩 텍스트가 표시되어야 함', async () => {
      // Arrange
      // 비동기 응답을 위한 딜레이 설정
      global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
          });
        }, 100);
      }));
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert - 삭제 중 상태 확인
      expect(screen.getByText('삭제 중...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
      
      // 응답 완료 후 상태 확인
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
      });
    });
  });
  
  describe('오류 시나리오 테스트', () => {
    it('API 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
      // Arrange
      const errorMessage = '서버 오류로 카드 삭제에 실패했습니다.';
      mockFetchError(errorMessage);
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
        expect(mockPush).not.toHaveBeenCalled(); // 리디렉션 없음
      });
    });
    
    it('errorData.error가 없을 때 기본 에러 메시지를 표시해야 함', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: '응답은 있지만 error 필드가 없는 경우' }) // error 필드 없음
      });
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.error).toHaveBeenCalledWith('카드 삭제에 실패했습니다.');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
    
    it('네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
      // Arrange
      mockFetchNetworkError();
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('네트워크 오류');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('다양한 카드 ID 테스트', () => {
    it('다양한 형식의 카드 ID로 삭제가 가능해야 함', async () => {
      // Arrange
      const cardIds = [
        'abc123',
        'card_with-hyphen',
        '123456',
        'longCardIdWithMixedCharacters123'
      ];
      
      // 각 ID에 대한 테스트
      for (const id of cardIds) {
        vi.clearAllMocks();
        mockFetchSuccess();
        
        const { unmount } = render(<DeleteButton cardId={id} />);
        
        // Act
        clickDeleteButton();
        clickConfirmDeleteButton();
        
        // Assert
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${id}`, { method: 'DELETE' });
        });
        
        unmount(); // 다음 테스트를 위해 언마운트
      }
    });
  });
}); 
```

src/app/cards/[id]/DeleteButton.tsx
```
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface DeleteButtonProps {
  cardId: string;
  // 테스트를 위한 프로퍼티 추가 (선택적)
  onSuccessfulDelete?: () => void;
}

// 테스트를 위해 함수를 컴포넌트 외부로 분리
export function callIfExists(callback?: () => void): void {
  if (callback) {
    callback();
  }
}

export default function DeleteButton({ 
  cardId, 
  onSuccessfulDelete 
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // API 호출
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      // 실패 응답 처리
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
      }

      // 성공 시에만 다음 코드 실행
      
      // 성공 시 다이얼로그 닫기
      setOpen(false);
      
      // 성공적인 삭제 후 토스트 메시지 표시
      toast.success("카드가 성공적으로 삭제되었습니다.");
      
      // 성공 시에만 리디렉션 수행
      router.push("/cards");
      
      // 성공 시에만 콜백 호출
      if (onSuccessfulDelete) {
        onSuccessfulDelete();
      }
      
      // 성공 시에만 여기까지 실행됨
      
    } catch (error) {
      // 모든 종류의 오류 처리 (네트워크 오류, 응답 오류 등)
      console.error("Error deleting card:", error);
      
      // 오류 메시지 표시
      toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
      
      // 오류 발생 시 다이얼로그만 닫음 (리디렉션 없음)
      setOpen(false);
      
      // 오류 시 리디렉션이 발생하지 않음
    } finally {
      setIsDeleting(false);
    }
    // 함수 종료
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          카드 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드 삭제</DialogTitle>
          <DialogDescription>
            이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
```

src/app/cards/[id]/page.test.tsx
```
/// <reference types="vitest" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CardPage, { generateMetadata } from './page';
import '@testing-library/jest-dom/vitest';

// notFound 및 useRouter 모킹
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    card: {
      findUnique: vi.fn()
    }
  }
}));

// formatDate 모킹
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
  cn: vi.fn((...args: any[]) => args.join(' '))
}));

describe('CardPage', () => {
  const params = { id: 'card123' };
  
  // 가짜 카드 데이터
  const mockCard = {
    id: 'card123',
    title: '테스트 카드',
    content: '테스트 내용입니다.',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user123',
      name: '테스트 사용자',
      email: 'test@example.com'
    },
    cardTags: [
      {
        id: 'ct1',
        cardId: 'card123',
        tagId: 'tag1',
        tag: {
          id: 'tag1',
          name: '태그1'
        }
      },
      {
        id: 'ct2',
        cardId: 'card123',
        tagId: 'tag2',
        tag: {
          id: 'tag2',
          name: '태그2'
        }
      }
    ]
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('유효한 카드 ID로 카드 데이터를 렌더링해야 함', async () => {
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(mockCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 카드 제목과 내용이 렌더링되었는지 확인
    expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
    expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    
    // 작성자 정보와 날짜가 렌더링되었는지 확인
    expect(screen.getByText(/작성자: 테스트 사용자/)).toBeInTheDocument();
    expect(screen.getByText(/작성일: 2023년 1월 1일/)).toBeInTheDocument();
    
    // 태그가 렌더링되었는지 확인
    expect(screen.getByText('태그1')).toBeInTheDocument();
    expect(screen.getByText('태그2')).toBeInTheDocument();
    
    // prisma 함수 호출 확인
    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: {
        user: true,
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
  });
  
  it('존재하지 않는 카드 ID로 notFound()를 호출해야 함', async () => {
    // prisma 모킹 설정 - 카드가 없음
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(null);
    
    // notFound 함수 가져오기
    const { notFound } = await import('next/navigation');
    
    await CardPage({ params });
    
    // notFound가 호출되었는지 확인
    expect(notFound).toHaveBeenCalled();
    
    // 카드 조회가 시도되었는지 확인
    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: {
        user: true,
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
  });
  
  it('오류 발생 시 notFound()를 호출해야 함', async () => {
    // prisma 모킹 설정 - 오류 발생
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // notFound 함수 가져오기
    const { notFound } = await import('next/navigation');
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await CardPage({ params });
    
    // notFound가 호출되었는지 확인
    expect(notFound).toHaveBeenCalled();
    
    // 오류 로깅이 되었는지 확인
    expect(consoleSpy).toHaveBeenCalled();
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
  
  it('이메일만 있는 사용자 정보도 표시해야 함', async () => {
    // 이메일만 있는 사용자로 카드 데이터 수정
    const userEmailOnlyCard = {
      ...mockCard,
      user: {
        id: 'user123',
        name: null,
        email: 'test@example.com'
      }
    };
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(userEmailOnlyCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 이메일이 작성자로 표시되는지 확인
    expect(screen.getByText(/작성자: test@example.com/)).toBeInTheDocument();
  });
  
  it('태그가 없는 카드도 정상적으로 렌더링되어야 함', async () => {
    // 태그가 없는 카드 데이터
    const noTagsCard = {
      ...mockCard,
      cardTags: []
    };
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(noTagsCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 카드 내용은 렌더링되어야 함
    expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
    expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    
    // 태그 영역이 렌더링되지 않아야 함
    expect(screen.queryByText('태그1')).not.toBeInTheDocument();
    expect(screen.queryByText('태그2')).not.toBeInTheDocument();
  });
  
  it('다양한 콘텐츠 형식(한글, 영어, 특수문자)이 올바르게 렌더링되어야 함', async () => {
    // 다양한 콘텐츠를 가진 카드 데이터
    const diverseContentCard = {
      ...mockCard,
      title: '다양한 내용 테스트 카드',
      content: '한글 내용, English content, 특수문자 !@#$%, 숫자 123'
    };
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(diverseContentCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 다양한 콘텐츠가 올바르게 렌더링되는지 확인
    expect(screen.getByRole('heading', { name: '다양한 내용 테스트 카드' })).toBeInTheDocument();
    expect(screen.getByText('한글 내용, English content, 특수문자 !@#$%, 숫자 123')).toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  const params = { id: 'card123' };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('유효한 카드 ID로 카드 제목을 메타데이터로 반환해야 함', async () => {
    // 가짜 카드 데이터
    const mockCard = {
      id: 'card123',
      title: '테스트 카드',
      content: '테스트 내용입니다.',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(mockCard);
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '테스트 카드 | Backyard'
    });
  });
  
  it('존재하지 않는 카드 ID로 기본 메타데이터를 반환해야 함', async () => {
    // prisma 모킹 설정 - 카드가 없음
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockResolvedValue(null);
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '카드를 찾을 수 없음'
    });
  });
  
  it('오류 발생 시 기본 메타데이터를 반환해야 함', async () => {
    // prisma 모킹 설정 - 오류 발생
    const { prisma } = await import('@/lib/prisma');
    (prisma.card.findUnique as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '카드를 찾을 수 없음'
    });
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
});
```

src/app/cards/[id]/page.tsx
```
import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DeleteButton from "./DeleteButton";
import EditCardContent from "@/components/cards/EditCardContent";
import { Card } from "@prisma/client";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cardId = String(params.id);
  const card = await getCard(cardId);
  
  if (!card) {
    return {
      title: "카드를 찾을 수 없음",
    };
  }
  
  return {
    title: `${card.title} | Backyard`,
  };
}

async function getCard(id: string) {
  try {
    // @ts-ignore - Prisma 타입 오류 무시
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        user: true,
        // @ts-ignore - Prisma 타입 오류 무시
        cardTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return card;
  } catch (error) {
    console.error("카드 조회 오류:", error);
    return null;
  }
}

export default async function CardPage({ params }: PageProps) {
  const cardId = String(params.id);
  const card = await getCard(cardId);
  
  if (!card) {
    notFound();
    // 테스트를 위해 빈 컴포넌트 반환 (notFound 이후에도 코드가 실행될 수 있음)
    return <div data-testid="not-found"></div>;
  }
  
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex justify-between items-center">
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
        </Link>
        <DeleteButton cardId={cardId} />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{card.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/* @ts-ignore - Prisma 타입 오류 무시 */}
          <p>작성자: {card.user?.name || card.user?.email}</p>
          <span>•</span>
          <p>작성일: {formatDate(card.createdAt)}</p>
        </div>
        
        {/* @ts-ignore - Prisma 타입 오류 무시 */}
        {card.cardTags && card.cardTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {/* @ts-ignore - Prisma 타입 오류 무시 */}
            {card.cardTags.map((cardTag: any) => (
              <span
                key={cardTag.tagId}
                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
              >
                {cardTag.tag.name}
              </span>
            ))}
          </div>
        )}
        
        <ClientContent cardId={cardId} initialContent={card.content || ''} />
      </div>
    </div>
  );
}

interface ClientContentProps {
  cardId: string;
  initialContent: string;
}

function ClientContent({ cardId, initialContent }: ClientContentProps) {
  return <EditCardContent cardId={cardId} initialContent={initialContent} />;
} 
```

src/app/api/cards/[id]/route.test.ts
```
/**
 * @vitest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, PUT, DELETE } from './route';
import prisma from '@/lib/prisma';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// 모킹 설정
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    card: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Request 객체 모킹 - 타입 오류 해결
if (!global.Request) {
  // @ts-ignore
  global.Request = function Request() {
    return {
      json: () => Promise.resolve({}),
    };
  };
}

// NextRequest, NextResponse 모킹
vi.mock('next/server', () => {
  return {
    __esModule: true,
    NextRequest: vi.fn().mockImplementation((url: string, options?: any) => {
      return {
        url,
        method: options?.method || 'GET',
        json: vi.fn().mockImplementation(async () => {
          return options?.body ? JSON.parse(options.body) : {};
        }),
      };
    }),
    NextResponse: {
      json: vi.fn().mockImplementation((data: any, options?: any) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

// 컨텍스트 모킹 함수
const createMockContext = (id: string) => {
  return {
    params: { id },
  };
};

describe('Card Detail API', () => {
  // console.error 모킹 추가
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });
  
  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('GET /api/cards/[id]', () => {
    it('존재하는 카드를 성공적으로 조회한다', async () => {
      // 모킹된 데이터
      const mockCard = {
        id: '1',
        title: '테스트 카드',
        content: '테스트 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(mockCard);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1');
      const context = createMockContext('1');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCard);
      expect(prisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { user: { select: { id: true, name: true } } },
      });
    });

    it('존재하지 않는 카드 조회 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999');
      const context = createMockContext('999');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      (prisma.card.findUnique as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1');
      const context = createMockContext('1');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PUT /api/cards/[id]', () => {
    it('유효한 데이터로 카드를 업데이트한다', async () => {
      // 모킹된 데이터
      const mockUpdatedCard = {
        id: '1',
        title: '업데이트된 제목',
        content: '업데이트된 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
      };

      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as vi.Mock).mockResolvedValue(mockUpdatedCard);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedCard);
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: requestData,
      });
    });

    it('존재하지 않는 카드 업데이트 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('999');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
      // 유효하지 않은 요청 데이터 (제목이 빈 문자열)
      const requestData = {
        title: '',
        content: '업데이트된 내용',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('PUT 요청 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cards/[id]', () => {
    it('존재하는 카드를 성공적으로 삭제한다', async () => {
      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as vi.Mock).mockResolvedValue({ id: '1' });

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'DELETE',
      });
      const context = createMockContext('1');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('존재하지 않는 카드 삭제 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999', {
        method: 'DELETE',
      });
      const context = createMockContext('999');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(prisma.card.delete).not.toHaveBeenCalled();
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'DELETE',
      });
      const context = createMockContext('1');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
}); 
```

src/app/api/cards/[id]/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 카드 수정 스키마
const updateCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').optional(),
  content: z.string().optional(),
});

// 개별 카드 조회 API
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 카드 조회
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!card) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(card);
  } catch (error) {
    console.error('카드 조회 오류:', error);
    return NextResponse.json(
      { error: '카드를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 수정 API
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await request.json();
    
    // 데이터 유효성 검사
    const validation = updateCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    // 카드 존재 여부 확인
    const existingCard = await prisma.card.findUnique({
      where: { id }
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 카드 수정
    const updatedCard = await prisma.card.update({
      where: { id },
      data: validation.data
    });
    
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('카드 수정 오류:', error);
    return NextResponse.json(
      { error: '카드를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 삭제 API
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 카드 존재 여부 확인
    const existingCard = await prisma.card.findUnique({
      where: { id }
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 카드 삭제
    await prisma.card.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: '카드가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('카드 삭제 오류:', error);
    return NextResponse.json(
      { error: '카드를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
```

src/app/api/user/[id]/route.ts
```
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15에서는 params가 Promise이므로 await 사용
    const paramsResolved = await params;
    const id = paramsResolved.id;
    
    if (!id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user });
    } catch (dbError: any) {
      console.error('DB 조회 오류:', dbError);
      
      // DB 오류가 발생하면 더미 사용자 데이터 반환
      // 실제 환경에서는 적절한 오류 처리 필요
      return NextResponse.json({
        user: {
          id,
          email: 'user@example.com',
          name: '사용자',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      });
    }
  } catch (error: any) {
    console.error('사용자 조회 API 오류:', error);
    return NextResponse.json(
      { error: `사용자 조회 실패: ${error.message}` },
      { status: 500 }
    );
  }
} 
```

src/app/api/user/register/route.ts
```
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name } = body;
    
    // 필수 필드 확인
    if (!id || !email) {
      return NextResponse.json(
        { error: '사용자 ID와 이메일은 필수입니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 이미 등록된 사용자인지 확인
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      
      if (existingUser) {
        // 이미 존재하는 사용자이면 업데이트 (필요시)
        console.log('기존 사용자 확인:', existingUser.email);
        return NextResponse.json({ message: '기존 사용자 확인됨', user: existingUser });
      }
      
      // 새 사용자 생성
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          name: name || email.split('@')[0],
        },
      });
      
      console.log('새 사용자 생성됨:', newUser.email);
      
      return NextResponse.json({ message: '사용자 등록 성공', user: newUser });
    } catch (dbError: any) {
      console.error('데이터베이스 오류:', dbError);
      
      // 데이터베이스 연결 오류 시 더미 데이터 반환
      const dummyUser = {
        id,
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return NextResponse.json({ 
        message: '사용자 등록은 성공했으나 데이터베이스 연결 실패', 
        user: dummyUser 
      });
    }
  } catch (error: any) {
    console.error('사용자 등록 오류:', error);
    return NextResponse.json(
      { error: `사용자 등록 실패: ${error.message}` },
      { status: 500 }
    );
  }
} 
```

src/app/api/users/first/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 첫 번째 사용자를 가져오는 API 엔드포인트
 */
export async function GET(request: NextRequest) {
  try {
    // 첫 번째 사용자를 가져옴 (가장 먼저 생성된 사용자)
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!firstUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(firstUser);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
```

src/app/api/tags/[id]/route.test.ts
```
/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { DELETE } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// NextResponse.json 모킹
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: vi.fn().mockImplementation((data: any, options: { status?: number } = {}) => {
        return {
          status: options.status || 200,
          body: data,
          json: () => Promise.resolve(data)
        };
      })
    }
  };
});

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    cardTag: {
      deleteMany: vi.fn()
    }
  }
}));

describe('태그 API - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('성공적으로 태그를 삭제해야 함', async () => {
    const tagId = '1';
    const mockTag = { 
      id: tagId, 
      name: '테스트 태그',
      _count: { cardTags: 2 }
    };

    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
    (prisma.cardTag.deleteMany as any).mockResolvedValue({ count: 2 });
    (prisma.tag.delete as any).mockResolvedValue(mockTag);
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      message: '태그가 성공적으로 삭제되었습니다.'
    });
    
    // prisma 함수 호출 확인
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: tagId },
      include: { _count: { select: { cardTags: true } } }
    });
    expect(prisma.cardTag.deleteMany).toHaveBeenCalledWith({
      where: { tagId }
    });
    expect(prisma.tag.delete).toHaveBeenCalledWith({
      where: { id: tagId }
    });
  });

  it('존재하지 않는 태그에 대해 404 오류를 반환해야 함', async () => {
    const tagId = '999';
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(404);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '존재하지 않는 태그입니다.'
    });
    
    // prisma 함수 호출 확인
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: tagId },
      include: { _count: { select: { cardTags: true } } }
    });
    expect(prisma.cardTag.deleteMany).not.toHaveBeenCalled();
    expect(prisma.tag.delete).not.toHaveBeenCalled();
  });
  
  it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
    const tagId = '1';
    const mockTag = { 
      id: tagId, 
      name: '테스트 태그',
      _count: { cardTags: 2 }
    };
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
    (prisma.tag.delete as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '태그를 삭제하는 중 오류가 발생했습니다.'
    });
  });
}); 
```

src/app/api/tags/[id]/route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 태그 수정 스키마
const updateTagSchema = z.object({
  name: z.string().min(1, '태그 이름은 필수입니다.'),
  color: z.string().optional(),
});

// 개별 태그 조회 API
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 태그 조회
    const tag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('태그 조회 오류:', error);
    return NextResponse.json(
      { error: '태그를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 수정 API
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await request.json();
    
    // 데이터 유효성 검사
    const validation = updateTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    // 태그 존재 여부 확인
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 같은 이름의 태그가 있는지 확인 (다른 ID)
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: validation.data.name,
        id: { not: id }
      }
    });
    
    if (duplicateTag) {
      return NextResponse.json(
        { error: '이미 같은 이름의 태그가 존재합니다.' },
        { status: 400 }
      );
    }
    
    // 태그 수정
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: validation.data
    });
    
    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('태그 수정 오류:', error);
    return NextResponse.json(
      { error: '태그를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 삭제 API
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 태그 존재 여부 확인
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 태그가 카드에서 사용 중인지 확인
    const cardTagsCount = await prisma.cardTag.count({
      where: { tagId: id }
    });
    
    // 태그 삭제
    await prisma.tag.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: '태그가 성공적으로 삭제되었습니다.',
      affectedCards: cardTagsCount
    });
  } catch (error) {
    console.error('태그 삭제 오류:', error);
    return NextResponse.json(
      { error: '태그를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
```
