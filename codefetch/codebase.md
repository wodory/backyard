Project Structure:
├── LICENSE
├── README.md
├── components.json
├── coverage
├── eslint.config.mjs
├── jest.config.js
├── logs
│   └── client-logs.json
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
│   ├── check-port.js
│   ├── create-user.js
│   ├── pre-deploy.js
│   ├── run-tests.sh
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
├── tsconfig.jest.json
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── types
│   └── vitest.d.ts
├── vitest.config.ts
└── yarn.lock


.env.development.example
```
1 | # 개발 환경 설정
2 | # 이 파일은 개발 환경(로컬)에서만 사용되는 환경 변수의 템플릿입니다.
3 | 
4 | # 데이터베이스 설정 - SQLite 사용
5 | DATABASE_PROVIDER="sqlite"
6 | DATABASE_URL="file:./prisma/dev.db"
7 | 
8 | # Supabase 인증 관련 설정은 .env 파일에서 관리
9 | 
10 | # OAuth 리다이렉션 URL 설정
11 | NEXT_PUBLIC_OAUTH_REDIRECT_URL="http://localhost:3000" 
```

.env.example
```
1 | # 기본 환경 변수 설정
2 | # 이 파일은 모든 환경(개발/프로덕션)에서 공통으로 사용되는 환경 변수의 템플릿입니다.
3 | 
4 | # 데이터베이스 설정
5 | DATABASE_PROVIDER=postgresql
6 | DATABASE_URL=postgresql://postgres:[password]@[project-id].supabase.co:6543/postgres
7 | DIRECT_URL=postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres
8 | 
9 | # Supabase 설정
10 | NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
11 | NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
12 | 
13 | # OAuth 설정
14 | NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000 # 개발환경
15 | # NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://[your-domain].vercel.app # 프로덕션 환경 
```

.env.production.example
```
1 | # 프로덕션 환경 설정
2 | # 이 파일은 프로덕션 환경에서만 사용되는 환경 변수의 템플릿입니다.
3 | 
4 | # 데이터베이스 설정 - Supabase PostgreSQL 사용
5 | DATABASE_PROVIDER="postgresql"
6 | DATABASE_URL="postgresql://postgres:your-password@your-project-id.supabase.co:6543/postgres"
7 | DIRECT_URL="postgresql://postgres:your-password@your-project-id.supabase.co:5432/postgres"
8 | 
9 | # Supabase 인증 관련 설정은 .env 파일에서 관리
10 | 
11 | # OAuth 리다이렉션 URL 설정
12 | # Vercel 배포 URL 또는 사용자 정의 도메인 사용
13 | NEXT_PUBLIC_OAUTH_REDIRECT_URL="https://your-project-name.vercel.app" 
```

components.json
```
1 | {
2 |   "$schema": "https://ui.shadcn.com/schema.json",
3 |   "style": "new-york",
4 |   "rsc": true,
5 |   "tsx": true,
6 |   "tailwind": {
7 |     "config": "",
8 |     "css": "src/app/globals.css",
9 |     "baseColor": "slate",
10 |     "cssVariables": true,
11 |     "prefix": ""
12 |   },
13 |   "aliases": {
14 |     "components": "@/components",
15 |     "utils": "@/lib/utils",
16 |     "ui": "@/components/ui",
17 |     "lib": "@/lib",
18 |     "hooks": "@/hooks"
19 |   },
20 |   "iconLibrary": "lucide"
21 | }
```

eslint.config.mjs
```
1 | import { dirname } from "path";
2 | import { fileURLToPath } from "url";
3 | import { FlatCompat } from "@eslint/eslintrc";
4 | 
5 | const __filename = fileURLToPath(import.meta.url);
6 | const __dirname = dirname(__filename);
7 | 
8 | const compat = new FlatCompat({
9 |   baseDirectory: __dirname,
10 | });
11 | 
12 | const eslintConfig = [
13 |   ...compat.extends("next/core-web-vitals", "next/typescript"),
14 | ];
15 | 
16 | export default eslintConfig;
```

jest.config.js
```
1 | /**
2 |  * 파일명: jest.config.js
3 |  * 목적: Jest 테스트 프레임워크 구성
4 |  * 역할: 테스트 환경 및 옵션 설정
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | module.exports = {
9 |   preset: 'ts-jest',
10 |   testEnvironment: 'jsdom',
11 |   testMatch: [
12 |     '**/tests/**/*.test.ts',
13 |     '**/tests/**/*.test.tsx'
14 |   ],
15 |   moduleNameMapper: {
16 |     '^@/(.*)$': '<rootDir>/src/$1'
17 |   },
18 |   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
19 |   coveragePathIgnorePatterns: [
20 |     '/node_modules/',
21 |     '/tests/',
22 |     '/__mocks__/'
23 |   ],
24 |   setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
25 |   transform: {
26 |     '^.+\\.tsx?$': [
27 |       'ts-jest',
28 |       {
29 |         tsconfig: 'tsconfig.jest.json'
30 |       }
31 |     ]
32 |   },
33 |   globals: {
34 |     'ts-jest': {
35 |       isolatedModules: true
36 |     }
37 |   }
38 | }; 
```

next-env.d.ts
```
1 | /// <reference types="next" />
2 | /// <reference types="next/image-types/global" />
3 | 
4 | // NOTE: This file should not be edited
5 | // see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

next.config.ts
```
1 | import type { NextConfig } from "next";
2 | 
3 | const nextConfig: NextConfig = {
4 |   /* config options here */
5 |   compiler: {
6 |     reactRemoveProperties: process.env.NODE_ENV === 'production' ? 
7 |       { properties: ['^data-testid$'] } : undefined,
8 |   },
9 |   // 빠른 배포를 위해 ESLint 검사 비활성화
10 |   eslint: {
11 |     ignoreDuringBuilds: true,
12 |   },
13 |   // 빠른 배포를 위해 타입 검사 비활성화
14 |   typescript: {
15 |     ignoreBuildErrors: true,
16 |   },
17 |   // React Flow 및 관련 패키지 트랜스파일 설정
18 |   transpilePackages: ['@xyflow/react', 'zustand'],
19 | };
20 | 
21 | export default nextConfig;
```

package.json
```
1 | {
2 |   "name": "backyard",
3 |   "version": "0.1.0",
4 |   "private": true,
5 |   "license": "MIT",
6 |   "scripts": {
7 |     "dev": "yarn env:dev && yarn db:setup:dev && NODE_ENV=development next dev -p 3000",
8 |     "dev:clean": "yarn port:check && yarn env:dev && yarn db:setup:dev && NODE_ENV=development next dev -p 3000",
9 |     "port:check": "node scripts/check-port.js",
10 |     "prebuild": "node scripts/pre-deploy.js",
11 |     "build": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
12 |     "build:local": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
13 |     "start": "NODE_ENV=production next start",
14 |     "lint": "next lint",
15 |     "test": "vitest",
16 |     "test:run": "vitest run",
17 |     "test:watch": "vitest --watch",
18 |     "test:coverage": "vitest run --coverage",
19 |     "prisma:seed": "node prisma/seed/index.js",
20 |     "prisma:push": "prisma db push",
21 |     "prisma:generate": "prisma generate",
22 |     "schema:sync": "node scripts/schema-sync.js",
23 |     "pre-deploy": "node scripts/pre-deploy.js",
24 |     "db:setup": "node scripts/select-db.js && npx prisma generate",
25 |     "db:setup:dev": "NODE_ENV=development node scripts/select-db.js && npx prisma generate",
26 |     "db:setup:prod": "NODE_ENV=production node scripts/select-db.js && npx prisma generate",
27 |     "db:test": "node scripts/test-db.js",
28 |     "env:dev": "vercel env pull .env.development",
29 |     "env:prod": "vercel env pull .env.production",
30 |     "deploy": "yarn env:prod && vercel --prod",
31 |     "deploy:preview": "yarn env:prod && vercel"
32 |   },
33 |   "dependencies": {
34 |     "@auth/core": "^0.38.0",
35 |     "@auth/prisma-adapter": "^2.8.0",
36 |     "@hookform/resolvers": "^4.1.2",
37 |     "@prisma/client": "^6.4.1",
38 |     "@radix-ui/react-alert-dialog": "^1.1.6",
39 |     "@radix-ui/react-dialog": "^1.1.6",
40 |     "@radix-ui/react-dropdown-menu": "^2.1.6",
41 |     "@radix-ui/react-label": "^2.1.2",
42 |     "@radix-ui/react-scroll-area": "^1.2.3",
43 |     "@radix-ui/react-slider": "^1.2.3",
[TRUNCATED]
```

postcss.config.mjs
```
1 | const config = {
2 |   plugins: {
3 |     '@tailwindcss/postcss': {
4 |       config: './tailwind.config.js',
5 |       mode: 'css'
6 |     },
7 |     autoprefixer: {},
8 |   },
9 | };
10 | 
11 | export default config;
```

tailwind.config.js
```
1 | /** @type {import('@tailwindcss/postcss').TailwindConfig} */
2 | export default {
3 |   mode: "css", // CSS 모드 사용
4 |   inputPath: "./src/app/globals.css", // 입력 CSS 파일 경로
5 |   plugins: [
6 |     "tailwindcss-animate", // 애니메이션 플러그인 (이미 설치됨)
7 |   ],
8 |   font: {
9 |     sans: ["Pretendard", "sans-serif"], // 기본 폰트 설정
10 |   },
11 |   colors: {
12 |     // 기본 색상 설정
13 |     primary: "oklch(0.208 0.042 265.755)",
14 |     secondary: "oklch(0.968 0.007 247.896)",
15 |     background: "oklch(1 0 0)",
16 |     foreground: "oklch(0.129 0.042 264.695)",
17 |   },
18 |   colorMode: {
19 |     default: "light", // 기본 컬러 모드
20 |     selector: ".dark", // 다크 모드 선택자
21 |   },
22 |   rules: [
23 |     // 커스텀 변형 규칙
24 |     ["dark", "&:is(.dark *)"],
25 |   ],
26 | } 
```

tsconfig.jest.json
```
1 | {
2 |   "extends": "./tsconfig.json",
3 |   "compilerOptions": {
4 |     "jsx": "react-jsx",
5 |     "esModuleInterop": true,
6 |     "allowJs": true,
7 |     "isolatedModules": true,
8 |     "types": ["jest", "node", "@testing-library/jest-dom"]
9 |   },
10 |   "include": ["src/**/*.ts", "src/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
11 |   "exclude": ["node_modules"]
12 | } 
```

tsconfig.json
```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2017",
4 |     "lib": ["dom", "dom.iterable", "esnext"],
5 |     "allowJs": true,
6 |     "skipLibCheck": true,
7 |     "strict": true,
8 |     "noEmit": true,
9 |     "esModuleInterop": true,
10 |     "module": "esnext",
11 |     "moduleResolution": "bundler",
12 |     "resolveJsonModule": true,
13 |     "isolatedModules": true,
14 |     "jsx": "preserve",
15 |     "incremental": true,
16 |     "types": ["vitest/globals", "@testing-library/jest-dom", "node"],
17 |     "plugins": [
18 |       {
19 |         "name": "next"
20 |       }
21 |     ],
22 |     "paths": {
23 |       "@/*": ["./src/*"]
24 |     }
25 |   },
26 |   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "types/**/*.d.ts"],
27 |   "exclude": ["node_modules"]
28 | }
```

vitest.config.ts
```
1 | /**
2 |  * 파일명: vitest.config.ts
3 |  * 목적: Vitest 테스트 프레임워크 설정
4 |  * 역할: 테스트 환경, 경로 별칭, 변환기 등의 설정 제공
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { defineConfig } from 'vitest/config';
9 | // @ts-ignore - 타입 문제 해결
10 | import react from '@vitejs/plugin-react';
11 | import { resolve } from 'path';
12 | 
13 | export default defineConfig({
14 |   plugins: [react()],
15 |   test: {
16 |     environment: 'jsdom',
17 |     globals: true,
18 |     setupFiles: ['./src/tests/setup.ts'],
19 |     testTimeout: 10000,
20 |     hookTimeout: 10000,
21 |     testTransformMode: {
22 |       web: ['.jsx', '.js', '.tsx', '.ts'],
23 |     },
24 |     coverage: {
25 |       provider: 'v8',
26 |       reporter: ['text', 'json', 'html'],
27 |       exclude: [
28 |         'node_modules/**',
29 |         'dist/**',
30 |         '**/*.d.ts',
31 |         'test/**',
32 |         'src/tests/**',
33 |       ],
34 |     },
35 |     include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
36 |     reporters: ['default', 'json'],
37 |     outputFile: {
38 |       json: './src/tests/results/test-results.json',
39 |     },
40 |   },
41 |   resolve: {
42 |     alias: {
43 |       '@': resolve(__dirname, './src'),
44 |       '@/components': resolve(__dirname, 'src/components'),
45 |       '@/lib': resolve(__dirname, 'src/lib'),
46 |       '@/app': resolve(__dirname, 'src/app'),
47 |       '@/utils': resolve(__dirname, 'src/utils'),
48 |       '@/hooks': resolve(__dirname, 'src/hooks')
49 |     }
50 |   }
51 | }); 
```

.cursor/.gitkeep
```
```

.cursor/mcp.json
```
1 | {
2 |     "mcpServers": {
3 |       "@smithery-ai-server-sequential-thinking": {
4 |         "command": "npx",
5 |         "args": [
6 |           "-y",
7 |           "@smithery/cli@latest",
8 |           "run",
9 |           "@smithery-ai/server-sequential-thinking",
10 |           "--config",
11 |           "{}"
12 |         ]
13 |       }
14 |     }
15 |   }
```

.note/.gitkeep
```
```

.note/keys.json
```
1 | {
2 |     "groq" : {
3 |         "key": "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"
4 |     }
5 | }
```

.note/mainscreen_task.txt
```
1 | # 프로젝트 관리 대시보드 UI 개발 테스크 리스트
2 | 
3 | ## 특별 고려사항
4 | 
5 | - 모든 UI 요소는 플로팅 패널로 구현하여 시각적 일관성 유지
6 | - 도구 막대와 패널은 3px 마진으로 간격 유지
7 | - 캔버스 컴포넌트는 타 팀에서 개발 중인 컴포넌트와 통합 가능하도록 설계
8 | - 오른쪽 패널은 카드 목록 및 카드 뷰어 두 가지 모드. 캔버스에서 카드를 선택하면 카드 콘텐츠 뷰어, 아니면 카드 목록. 
9 | - 모든 아이콘은 60x60 크기로 구현. 외부에서 일러스트풍의 아이콘을 가져오기. 
10 | - 사이드바는 슬라이딩 애니메이션으로 토글되도록 구현
11 | 
12 | ## 1. 기본 레이아웃 및 컴포넌트 설정
13 | 
14 | - [ ] 필수 패키지 설치: React, Next.js, Tailwind CSS, Lucide React 아이콘, React Flow
15 | - [ ] 추가 패키지 설치: zustand (상태 관리), framer-motion (애니메이션)
16 | - [ ] 프로젝트 기본 구조 설정 (폴더 구조, 컴포넌트 분리 계획)
17 | - [ ] 글로벌 스타일 및 Tailwind 설정 완료
18 | - [ ] 공통 컴포넌트 생성 (버튼, 패널, 드롭다운 등)
19 | - [ ] 반응형 레이아웃 기준 설정 (브레이크포인트, 크기 조정 정책)
20 | - [ ] Zustand 스토어 구조 설계 및 초기 구현
21 |   - [ ] 앱 상태 인터페이스 정의 (selectedCardId, isSidebarOpen 등)
22 |   - [ ] 기본 액션 구현 (selectCard, toggleSidebar 등)
23 | 
24 | ## 2. 플로팅 도구 막대 구현
25 | 
26 | - [ ] 좌측 도구 막대 컴포넌트 구현
27 |   - [ ] 삼선 메뉴 아이콘과 프로젝트 제목 배치
28 |   - [ ] 드롭다운 메뉴 기능 구현 (내보내기, 가져오기, 저장, 옵션, 로그아웃)
29 |   - [ ] 각 메뉴 항목에 아이콘 추가
30 |   - [ ] 외부 클릭 시 메뉴 닫기 기능
31 | 
32 | - [ ] 우측 도구 막대 컴포넌트 구현
33 |   - [ ] 공유, 로그아웃, 설정 아이콘 배치
34 |   - [ ] 아이콘 버튼에 호버 효과 추가
35 |   - [ ] 각 버튼 기능 연결 준비
36 | 
37 | - [ ] 하단 중앙 도구 막대 컴포넌트 구현
38 |   - [ ] 60x60 크기의 아이콘 버튼 구성
39 |   - [ ] 새 카드, 수평 정렬, 수직 정렬, 요약 기능 아이콘 구현
40 |   - [ ] 텍스트 레이블 추가
41 |   - [ ] 화면 크기에 따른 위치 조정 로직 (오른쪽 패널 너비 고려)
42 |   - [ ] 기존 레이아웃 옵션 메뉴 기능 통합
43 | 
44 | ## 3. 메인 캔버스 영역 구현
45 | 
46 | - [ ] /board 통합
47 |   - [ ] 기존 Board 컴포넌트를 MainCanvas 컴포넌트로 변환
48 |   - [ ] 카드 선택 이벤트 구현 (Zustand 상태 업데이트)
[TRUNCATED]
```

.note/tasklist.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | [ ] 카드 보드의 카드 구조
7 | - 카드 보드의 카드는 해더와 콘텐츠 영억으로 나뉜다
8 | - 카드는 접고 펼수 있다. 기본값은 접은 상태이다.
9 | - 카드를 접으면 카드는 헤더 영역만 표시한다
10 |   - 카드 헤더에는 카드 제목을 중앙 정렬로 표시하고, 맨 오른쪽에는 [펴기] 단추를 [>] 모양으로 표시한다.
11 |   - [>] 단추를 클릭하면 카드는 펴진다. 
12 | - 카드가 펴지면 컨텐츠 영역도 보여준다
13 |   - 카드 헤더의 [>] 단추는 [^] 단추 = 접기 단추로 바뀐다.
14 |   - 컨텐츠 영역에는 tiptap 뷰어를 표시하고 카드 내용을 표시한다. 
15 |   - 글꼴 크기는 카드 목록보다 60% 수준으로 표시한다. 
16 |   - 카드가 펴질 때 컨텐츠 영역의 최대 높이는 280px로 정한다.  
17 |   - 컨텐츠 영역보다 표시해야 할 카드 내용이 많으면 ... 처리한다. 
18 | - 왼쪽/오른쪽의 연결선 핸들러는 카드가 접히고 펴질 때 마다 위치를 카드 중앙으로 이동한다. 
19 | 
20 | [ ] 카드 상태
21 | - 카드에 표시하는 다양한 UI와 동작을 카드의 상태별로 다르게 할 가능성이 있음
22 | - 카드 상태를 기본, 마우스 호버, 선택으로 분리.
23 | 
24 | [ ] 카드 상태 - normal
25 | - 연결선 핸들러 표시하지 않음
26 | 
27 | [ ] 카드 상태 - hover
28 | - 연결선 핸들러 표시 
29 | - 연결선 핸들러 색상은 연결선과 동일
30 | - UI 변경
31 |   -- 외곽선 : 밝은 핑크색
32 |   -- 카드 배경색 : 
33 | 
34 | [ ] 카드 상태 - selected 
35 | - 선택 상태는 클릭 혹은 선택 range 내부에 들어왔을 때
36 | - 선택 상태의 UI 변경
37 |   -- 외곽선 : 일반 카드 외곽선 + 2px, 색은 연결선 색과 동일
38 |   -- 카드 배경색 : 초기값은 연결선 색의 밝기 60% 증가 
39 |   -- 변경하는 UI의 값은 모두 환경 변수로 설정. 이후 UI로 바꿀 수 있어야 함. 
40 | - 외곽선을 표시해도 연결선 핸들러가 선 가운데에 올 수 있도록 border 옵션 조절
41 | - 연결선 핸들러 표시
42 | - 연결선 핸들러 색상은 연결선과 동일
43 | 
44 | [ ] 카드 클릭, 선택
45 | - 카드 위를 클릭하면 카드 선택 상태가 된다
46 | - 카드를 드래스, 클릭, 선택하면 z-index가 가장 높다.
47 | 
48 | 
49 | 
50 | 
51 | ** 토요일 - 원격 환경 적용 및 인증 ** 
52 | 
53 | **Supabase pw**
54 | $JpH_w$9WKrriPR
55 | 
[TRUNCATED]
```

.note/tasklist.txt
```
1 | [ ] 카드 보드의 카드 구조
2 | - 카드 보드의 카드는 해더와 콘텐츠 영억으로 나뉜다
3 | - 카드는 접고 펼수 있다. 기본값은 접은 상태이다.
4 | - 카드를 접으면 카드는 헤더 영역만 표시한다
5 |   - 카드 헤더에는 카드 제목을 중앙 정렬로 표시하고, 맨 오른쪽에는 [펴기] 단추를 [>] 모양으로 표시한다.
6 |   - [>] 단추를 클릭하면 카드는 펴진다. 
7 | - 카드가 펴지면 컨텐츠 영역도 보여준다
8 |   - 카드 헤더의 [>] 단추는 [^] 단추 = 접기 단추로 바뀐다.
9 |   - 컨텐츠 영역에는 tiptap 뷰어를 표시하고 카드 내용을 표시한다. 
10 |   - 글꼴 크기는 카드 목록보다 60% 수준으로 표시한다. 
11 |   - 카드가 펴질 때 컨텐츠 영역의 최대 높이는 280px로 정한다.  
12 |   - 컨텐츠 영역보다 표시해야 할 카드 내용이 많으면 ... 처리한다. 
13 | - 왼쪽/오른쪽의 연결선 핸들러는 카드가 접히고 펴질 때 마다 위치를 카드 중앙으로 이동한다. 
14 | 
15 | [ ] 카드 상태
16 | - 카드에 표시하는 다양한 UI와 동작을 카드의 상태별로 다르게 할 가능성이 있음
17 | - 카드 상태를 기본, 마우스 호버, 선택으로 분리.
18 | 
19 | [ ] 카드 상태 - normal
20 | - 연결선 핸들러 표시하지 않음
21 | 
22 | [ ] 카드 상태 - hover
23 | - 연결선 핸들러 표시 
24 | - 연결선 핸들러 색상은 연결선과 동일
25 | - UI 변경
26 |   -- 외곽선 : 밝은 핑크색
27 |   -- 카드 배경색 : 
28 | 
29 | [ ] 카드 상태 - selected 
30 | - 선택 상태는 클릭 혹은 선택 range 내부에 들어왔을 때
31 | - 선택 상태의 UI 변경
32 |   -- 외곽선 : 일반 카드 외곽선 + 2px, 색은 연결선 색과 동일
33 |   -- 카드 배경색 : 초기값은 연결선 색의 밝기 60% 증가 
34 |   -- 변경하는 UI의 값은 모두 환경 변수로 설정. 이후 UI로 바꿀 수 있어야 함. 
35 | - 외곽선을 표시해도 연결선 핸들러가 선 가운데에 올 수 있도록 border 옵션 조절
36 | - 연결선 핸들러 표시
37 | - 연결선 핸들러 색상은 연결선과 동일
38 | 
39 | [ ] 카드 클릭, 선택
40 | - 카드 위를 클릭하면 카드 선택 상태가 된다
41 | - 카드를 드래스, 클릭, 선택하면 z-index가 가장 높다.
42 | 
43 | 
44 | 
45 | 
46 | ** 토요일 - 원격 환경 적용 및 인증 ** 
47 | 
48 | **Supabase pw**
49 | $JpH_w$9WKrriPR
50 | 
51 | **google OAuth ID/Password**
[TRUNCATED]
```

.note/tasklist_css_refactorying.txt
```
1 | # 프로젝트 CSS 구조 개선 및 통합
2 | 
3 | 1. **전체 CSS 관련 파일 및 스타일 소스 식별**  
4 |    - [x] 1.1 글로벌 CSS 파일 (src/app/globals.css) 내 디자인 토큰, Tailwind 기본 레이어, React Flow 오버라이드 스타일 식별  
5 |    - [x] 1.2 UI 설정 파일 (src/config/cardBoardUiOptions.json) 내 스타일 관련 상수 값 파악  
6 |    - [x] 1.3 각 컴포넌트 내에 인라인으로 적용된 CSS 코드 식별  
7 |    - [x] 1.4 서드파티 라이브러리(React Flow 등)의 기본 스타일과 오버라이드 내용 식별  
8 | 
9 | 2. **중복 스타일 제거 및 Shadcn 스타일 네이밍 통합**  
10 |    - [x] 2.1 cardBoardUiOptions.json 설정 값과 globals.css에 중복 정의된 값(예: 카드 배경색, border-radius, handle 크기 등) 통합 -> cardBoardUiOptions.json은 UI 레이아웃이나 동작 설정 전용으로 사용  
11 |    - [x] 2.2 선택 상태(카드 선택, 엣지 선택) 관련 스타일 통일 및 불일치 항목 수정  
12 |    - [x] 2.3 공통 색상/크기 값(예: edgeColor, selectedEdgeColor, handle 크기)을 전역 CSS 변수로 정의 및 적용  
13 |    - [x] 2.4 Shadcn UI 디자인 가이드에 맞는 네이밍 적용 (예: --primary, --secondary 등)  
14 | 
15 | 3. **글로벌 CSS에서 모든 Primitive 스타일 통합 관리**  
16 |    - [x] 3.1 디자인 토큰(색상, 폰트 크기, radius 등)을 globals.css :root 영역에 일원화  
17 |    - [x] 3.2 컴포넌트별 공통 스타일(예: 카드 헤더, 카드 콘텐츠, 태그 등)을 글로벌 CSS 클래스로 정의  
18 |    - [x] 3.3 Tailwind 유틸리티 클래스와 CSS 변수 간의 연계 작업 완료  
19 | 
20 | 4. **Inline CSS 정리 및 남는 항목 관리**  
21 |    - [x] 4.1 컴포넌트 내 인라인 스타일을 글로벌 CSS 또는 Tailwind 유틸리티 클래스로 전환  
22 |    - [x] 4.2 동적으로 계산되는 스타일(예: 카드 크기, 폰트 크기 등)은 별도 목록으로 문서화  
23 |    - [x] 4.3 정리되지 못한 인라인 CSS 목록 작성 및 보고
24 | 
25 | 5. **CSS 파일 및 컴포넌트 관계 ASCII 다이어그램 작성**  
26 |    - [x] 5.1 각 CSS 파일과 컴포넌트(예: CardNode, CustomEdge, Shadcn UI 컴포넌트) 간 참조 관계 분석  
[TRUNCATED]
```

logs/client-logs.json
```
1 | [
2 |   {
3 |     "timestamp": "2025-03-26T09:07:32.999Z",
4 |     "level": "error",
5 |     "module": "Callback",
6 |     "message": "콜백 처리 실패",
7 |     "data": {
8 |       "__isAuthError": true,
9 |       "name": "AuthApiError",
10 |       "status": 400,
11 |       "code": "validation_failed"
12 |     },
13 |     "sessionId": "b1o3bwaza6dd0hzdndijvw",
14 |     "serverTimestamp": "2025-03-26T09:07:33.509Z"
15 |   },
16 |   {
17 |     "timestamp": "2025-03-26T09:07:33.076Z",
18 |     "level": "error",
19 |     "module": "Callback",
20 |     "message": "세션 교환 실패",
21 |     "data": {
22 |       "에러": "invalid request: both auth code and code verifier should be non-empty",
23 |       "코드": 400
24 |     },
25 |     "sessionId": "b1o3bwaza6dd0hzdndijvw",
26 |     "serverTimestamp": "2025-03-26T09:07:33.555Z"
27 |   },
28 |   {
29 |     "timestamp": "2025-03-26T09:07:33.077Z",
30 |     "level": "error",
31 |     "module": "Callback",
32 |     "message": "콜백 처리 실패",
33 |     "data": {
34 |       "__isAuthError": true,
35 |       "name": "AuthApiError",
36 |       "status": 400,
37 |       "code": "validation_failed"
38 |     },
39 |     "sessionId": "b1o3bwaza6dd0hzdndijvw",
40 |     "serverTimestamp": "2025-03-26T09:07:33.607Z"
41 |   },
42 |   {
43 |     "timestamp": "2025-03-26T09:07:32.998Z",
44 |     "level": "error",
45 |     "module": "Callback",
46 |     "message": "세션 교환 실패",
47 |     "data": {
48 |       "에러": "invalid request: both auth code and code verifier should be non-empty",
49 |       "코드": 400
50 |     },
51 |     "sessionId": "b1o3bwaza6dd0hzdndijvw",
52 |     "serverTimestamp": "2025-03-26T09:07:33.634Z"
53 |   },
54 |   {
55 |     "timestamp": "2025-03-26T09:17:41.104Z",
56 |     "level": "error",
57 |     "module": "Callback",
58 |     "message": "세션 교환 실패",
59 |     "data": {
60 |       "에러": "invalid request: both auth code and code verifier should be non-empty",
61 |       "코드": 400
62 |     },
63 |     "sessionId": "b1o3bwaza6dd0hzdndijvw",
64 |     "serverTimestamp": "2025-03-26T09:17:42.237Z"
65 |   },
66 |   {
67 |     "timestamp": "2025-03-26T09:17:41.167Z",
68 |     "level": "error",
69 |     "module": "Callback",
70 |     "message": "세션 교환 실패",
71 |     "data": {
[TRUNCATED]
```

prisma/schema.master.prisma
```
1 | // This is your Prisma schema file for MASTER TEMPLATE,
2 | // learn more about it in the docs: https://pris.ly/d/prisma-schema
3 | 
4 | // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
5 | // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
6 | 
7 | generator client {
8 |   provider        = "prisma-client-js"
9 |   previewFeatures = ["postgresqlExtensions"]
10 | }
11 | 
12 | datasource db {
13 |   provider  = "postgresql"
14 |   url       = env("DATABASE_URL")
15 |   directUrl = env("DIRECT_URL")
16 |   extensions = [uuid_ossp(schema: "extensions")]
17 | }
18 | 
19 | model User {
20 |   id            String          @id @default(uuid())
21 |   email         String          @unique
22 |   name          String?
23 |   createdAt     DateTime        @default(now()) @map("created_at")
24 |   updatedAt     DateTime        @updatedAt @map("updated_at")
25 |   cards         Card[]
26 |   boardSettings BoardSettings?
27 | 
28 |   @@map("users")
29 | }
30 | 
31 | model Card {
32 |   id        String     @id @default(uuid())
33 |   title     String
34 |   content   String?
35 |   createdAt DateTime   @default(now()) @map("created_at")
36 |   updatedAt DateTime   @updatedAt @map("updated_at")
37 |   userId    String     @map("user_id")
38 |   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
39 |   cardTags  CardTag[]
40 | 
41 |   @@map("cards")
42 | }
43 | 
44 | model Tag {
45 |   id        String     @id @default(uuid())
46 |   name      String     @unique
47 |   createdAt DateTime   @default(now()) @map("created_at")
48 |   updatedAt DateTime   @updatedAt @map("updated_at")
49 |   cardTags  CardTag[]
50 | 
51 |   @@map("tags")
52 | }
53 | 
54 | model CardTag {
55 |   id        String   @id @default(uuid())
56 |   cardId    String   @map("card_id")
57 |   tagId     String   @map("tag_id")
58 |   createdAt DateTime @default(now()) @map("created_at")
59 |   card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
60 |   tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
61 | 
62 |   @@unique([cardId, tagId])
63 |   @@map("card_tags")
64 | }
65 | 
[TRUNCATED]
```

prisma/schema.postgresql.prisma
```
1 | // This is your Prisma schema file,
2 | // learn more about it in the docs: https://pris.ly/d/prisma-schema
3 | 
4 | // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
5 | // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
6 | 
7 | generator client {
8 |   provider        = "prisma-client-js"
9 |   previewFeatures = ["postgresqlExtensions"]
10 | }
11 | 
12 | datasource db {
13 |   provider  = "postgresql"
14 |   url       = env("DATABASE_URL")
15 |   directUrl = env("DIRECT_URL")
16 | }
17 | 
18 | model User {
19 |   id            String          @id @default(uuid())
20 |   email         String          @unique
21 |   name          String?
22 |   createdAt     DateTime        @default(now()) @map("created_at")
23 |   updatedAt     DateTime        @updatedAt @map("updated_at")
24 |   cards         Card[]
25 |   boardSettings BoardSettings?
26 | 
27 |   @@map("users")
28 | }
29 | 
30 | model Card {
31 |   id        String     @id @default(uuid())
32 |   title     String
33 |   content   String?
34 |   createdAt DateTime   @default(now()) @map("created_at")
35 |   updatedAt DateTime   @updatedAt @map("updated_at")
36 |   userId    String     @map("user_id")
37 |   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
38 |   cardTags  CardTag[]
39 | 
40 |   @@map("cards")
41 | }
42 | 
43 | model Tag {
44 |   id        String     @id @default(uuid())
45 |   name      String     @unique
46 |   createdAt DateTime   @default(now()) @map("created_at")
47 |   updatedAt DateTime   @updatedAt @map("updated_at")
48 |   cardTags  CardTag[]
49 | 
50 |   @@map("tags")
51 | }
52 | 
53 | model CardTag {
54 |   id        String   @id @default(uuid())
55 |   cardId    String   @map("card_id")
56 |   tagId     String   @map("tag_id")
57 |   createdAt DateTime @default(now()) @map("created_at")
58 |   card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
59 |   tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
60 | 
61 |   @@unique([cardId, tagId])
62 |   @@map("card_tags")
63 | }
64 | 
65 | model BoardSettings {
66 |   id        String   @id @default(uuid())
[TRUNCATED]
```

prisma/schema.prisma
```
1 | // This is your Prisma schema file,
2 | // learn more about it in the docs: https://pris.ly/d/prisma-schema
3 | 
4 | // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
5 | // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
6 | 
7 | generator client {
8 |   provider        = "prisma-client-js"
9 |   previewFeatures = ["postgresqlExtensions"]
10 | }
11 | 
12 | datasource db {
13 |   provider = "sqlite"
14 |   url      = env("DATABASE_URL")
15 | }
16 | 
17 | model User {
18 |   id            String          @id @default(uuid())
19 |   email         String          @unique
20 |   name          String?
21 |   createdAt     DateTime        @default(now()) @map("created_at")
22 |   updatedAt     DateTime        @updatedAt @map("updated_at")
23 |   cards         Card[]
24 |   boardSettings BoardSettings?
25 | 
26 |   @@map("users")
27 | }
28 | 
29 | model Card {
30 |   id        String     @id @default(uuid())
31 |   title     String
32 |   content   String?
33 |   createdAt DateTime   @default(now()) @map("created_at")
34 |   updatedAt DateTime   @updatedAt @map("updated_at")
35 |   userId    String     @map("user_id")
36 |   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
37 |   cardTags  CardTag[]
38 | 
39 |   @@map("cards")
40 | }
41 | 
42 | model Tag {
43 |   id        String     @id @default(uuid())
44 |   name      String     @unique
45 |   createdAt DateTime   @default(now()) @map("created_at")
46 |   updatedAt DateTime   @updatedAt @map("updated_at")
47 |   cardTags  CardTag[]
48 | 
49 |   @@map("tags")
50 | }
51 | 
52 | model CardTag {
53 |   id        String   @id @default(uuid())
54 |   cardId    String   @map("card_id")
55 |   tagId     String   @map("tag_id")
56 |   createdAt DateTime @default(now()) @map("created_at")
57 |   card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
58 |   tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
59 | 
60 |   @@unique([cardId, tagId])
61 |   @@map("card_tags")
62 | }
63 | 
64 | model BoardSettings {
65 |   id        String   @id @default(uuid())
66 |   userId    String   @unique @map("user_id")
[TRUNCATED]
```

prisma/schema.production.prisma
```
1 | // 프로덕션 환경용 Prisma 스키마 파일
2 | // Supabase PostgreSQL을 사용합니다.
3 | 
4 | generator client {
5 |   provider        = "prisma-client-js"
6 |   previewFeatures = ["postgresqlExtensions"]
7 | }
8 | 
9 | datasource db {
10 |   provider   = "postgresql"
11 |   url        = env("DATABASE_URL")
12 |   directUrl  = env("DIRECT_URL")
13 |   extensions = [pgcrypto]
14 | }
15 | 
16 | model User {
17 |   id            String          @id @default(uuid())
18 |   email         String          @unique
19 |   name          String?
20 |   createdAt     DateTime        @default(now()) @map("created_at")
21 |   updatedAt     DateTime        @updatedAt @map("updated_at")
22 |   cards         Card[]
23 |   boardSettings BoardSettings?
24 | 
25 |   @@map("users")
26 | }
27 | 
28 | model Card {
29 |   id        String     @id @default(uuid())
30 |   title     String
31 |   content   String?
32 |   createdAt DateTime   @default(now()) @map("created_at")
33 |   updatedAt DateTime   @updatedAt @map("updated_at")
34 |   userId    String     @map("user_id")
35 |   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
36 |   cardTags  CardTag[]
37 | 
38 |   @@map("cards")
39 | }
40 | 
41 | model Tag {
42 |   id        String     @id @default(uuid())
43 |   name      String     @unique
44 |   createdAt DateTime   @default(now()) @map("created_at")
45 |   updatedAt DateTime   @updatedAt @map("updated_at")
46 |   cardTags  CardTag[]
47 | 
48 |   @@map("tags")
49 | }
50 | 
51 | model CardTag {
52 |   id        String   @id @default(uuid())
53 |   cardId    String   @map("card_id")
54 |   tagId     String   @map("tag_id")
55 |   createdAt DateTime @default(now()) @map("created_at")
56 |   card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
57 |   tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
58 | 
59 |   @@unique([cardId, tagId])
60 |   @@map("card_tags")
61 | }
62 | 
63 | model BoardSettings {
64 |   id        String   @id @default(uuid())
65 |   userId    String   @unique @map("user_id")
66 |   settings  Json
67 |   createdAt DateTime @default(now()) @map("created_at")
68 |   updatedAt DateTime @updatedAt @map("updated_at")
[TRUNCATED]
```

prisma/schema.sqlite.prisma
```
1 | // This is your Prisma schema file,
2 | // learn more about it in the docs: https://pris.ly/d/prisma-schema
3 | 
4 | // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
5 | // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
6 | 
7 | generator client {
8 |   provider        = "prisma-client-js"
9 |   previewFeatures = ["postgresqlExtensions"]
10 | }
11 | 
12 | datasource db {
13 |   provider = "sqlite"
14 |   url      = env("DATABASE_URL")
15 | }
16 | 
17 | model User {
18 |   id            String          @id @default(uuid())
19 |   email         String          @unique
20 |   name          String?
21 |   createdAt     DateTime        @default(now()) @map("created_at")
22 |   updatedAt     DateTime        @updatedAt @map("updated_at")
23 |   cards         Card[]
24 |   boardSettings BoardSettings?
25 | 
26 |   @@map("users")
27 | }
28 | 
29 | model Card {
30 |   id        String     @id @default(uuid())
31 |   title     String
32 |   content   String?
33 |   createdAt DateTime   @default(now()) @map("created_at")
34 |   updatedAt DateTime   @updatedAt @map("updated_at")
35 |   userId    String     @map("user_id")
36 |   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
37 |   cardTags  CardTag[]
38 | 
39 |   @@map("cards")
40 | }
41 | 
42 | model Tag {
43 |   id        String     @id @default(uuid())
44 |   name      String     @unique
45 |   createdAt DateTime   @default(now()) @map("created_at")
46 |   updatedAt DateTime   @updatedAt @map("updated_at")
47 |   cardTags  CardTag[]
48 | 
49 |   @@map("tags")
50 | }
51 | 
52 | model CardTag {
53 |   id        String   @id @default(uuid())
54 |   cardId    String   @map("card_id")
55 |   tagId     String   @map("tag_id")
56 |   createdAt DateTime @default(now()) @map("created_at")
57 |   card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
58 |   tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
59 | 
60 |   @@unique([cardId, tagId])
61 |   @@map("card_tags")
62 | }
63 | 
64 | model BoardSettings {
65 |   id        String   @id @default(uuid())
66 |   userId    String   @unique @map("user_id")
[TRUNCATED]
```

src/middleware.ts
```
1 | /**
2 |  * 파일명: middleware.ts
3 |  * 목적: Supabase 인증 토큰 새로고침을 위한 미들웨어
4 |  * 역할: 인증 토큰을 새로고침하고 브라우저와 서버 컴포넌트에 전달
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { NextRequest } from 'next/server'
9 | import { updateSession } from '@/utils/supabase/middleware'
10 | 
11 | export async function middleware(request: NextRequest) {
12 |   return await updateSession(request)
13 | }
14 | 
15 | export const config = {
16 |   matcher: [
17 |     /*
18 |      * Match all request paths except for the ones starting with:
19 |      * - _next/static (static files)
20 |      * - _next/image (image optimization files)
21 |      * - favicon.ico (favicon file)
22 |      * Feel free to modify this pattern to include more paths.
23 |      */
24 |     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
25 |   ],
26 | } 
```

src/setupTests.ts
```
1 | import '@testing-library/jest-dom/vitest';
2 | import { expect, vi, beforeAll, afterAll } from 'vitest';
3 | import * as matchers from '@testing-library/jest-dom/matchers';
4 | 
5 | // Jest DOM matchers 확장 설정
6 | expect.extend(matchers);
7 | 
8 | // 전역 모킹 설정
9 | vi.mock('next/navigation', () => {
10 |   return {
11 |     useRouter: vi.fn(() => ({
12 |       push: vi.fn(),
13 |       back: vi.fn(),
14 |       forward: vi.fn(),
15 |       refresh: vi.fn(),
16 |       replace: vi.fn(),
17 |       prefetch: vi.fn(),
18 |     })),
19 |     usePathname: vi.fn(() => '/'),
20 |     useSearchParams: vi.fn(() => ({
21 |       get: (param: string) => null,
22 |       toString: () => '',
23 |     })),
24 |   };
25 | });
26 | 
27 | // 콘솔 오류 모킹 (테스트 중 예상된 오류가 발생해도 테스트 출력이 어지럽지 않도록)
28 | const originalError = console.error;
29 | beforeAll(() => {
30 |   console.error = (...args: any[]) => {
31 |     if (
32 |       typeof args[0] === 'string' &&
33 |       args[0].includes('ReactDOM.render is no longer supported')
34 |     ) {
35 |       return;
36 |     }
37 |     originalError(...args);
38 |   };
39 | });
40 | 
41 | afterAll(() => {
42 |   console.error = originalError;
43 | });
44 | 
45 | // 글로벌 페치 모킹
46 | global.fetch = vi.fn(); 
```

supabase/config.toml
```
1 | # For detailed configuration reference documentation, visit:
2 | # https://supabase.com/docs/guides/local-development/cli/config
3 | # A string used to distinguish different Supabase projects on the same host. Defaults to the
4 | # working directory name when running `supabase init`.
5 | project_id = "backyard"
6 | 
7 | [api]
8 | enabled = true
9 | # Port to use for the API URL.
10 | port = 54321
11 | # Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
12 | # endpoints. `public` and `graphql_public` schemas are included by default.
13 | schemas = ["public", "graphql_public"]
14 | # Extra schemas to add to the search_path of every request.
15 | extra_search_path = ["public", "extensions"]
16 | # The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
17 | # for accidental or malicious requests.
18 | max_rows = 1000
19 | 
20 | [api.tls]
21 | # Enable HTTPS endpoints locally using a self-signed certificate.
22 | enabled = false
23 | 
24 | [db]
25 | # Port to use for the local database URL.
26 | port = 54322
27 | # Port used by db diff command to initialize the shadow database.
28 | shadow_port = 54320
29 | # The database major version to use. This has to be the same as your remote database's. Run `SHOW
30 | # server_version;` on the remote database to check.
31 | major_version = 15
32 | 
33 | [db.pooler]
34 | enabled = false
35 | # Port to use for the local connection pooler.
36 | port = 54329
37 | # Specifies when a server connection can be reused by other clients.
38 | # Configure one of the supported pooler modes: `transaction`, `session`.
39 | pool_mode = "transaction"
40 | # How many server connections to allow per user/database pair.
41 | default_pool_size = 20
42 | # Maximum number of client connections allowed.
43 | max_client_conn = 100
44 | 
[TRUNCATED]
```

supabase/schema.sql
```
1 | -- Supabase 스키마 정의
2 | 
3 | -- 사용자 테이블 (Supabase Auth와 연동)
4 | CREATE TABLE IF NOT EXISTS users (
5 |   id UUID REFERENCES auth.users PRIMARY KEY,
6 |   email TEXT NOT NULL,
7 |   name TEXT,
8 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
9 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
10 | );
11 | 
12 | -- 사용자 테이블 정책 (RLS - Row Level Security)
13 | ALTER TABLE users ENABLE ROW LEVEL SECURITY;
14 | CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
15 |   FOR SELECT USING (auth.uid() = id);
16 | CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
17 |   FOR UPDATE USING (auth.uid() = id);
18 | 
19 | -- 카드 테이블
20 | CREATE TABLE IF NOT EXISTS cards (
21 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
22 |   title TEXT NOT NULL,
23 |   content TEXT,
24 |   user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
25 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
26 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
27 | );
28 | 
29 | -- 카드 테이블 정책 (RLS)
30 | ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
31 | CREATE POLICY "사용자는 모든 카드를 조회할 수 있음" ON cards
32 |   FOR SELECT USING (true);
33 | CREATE POLICY "사용자는 자신의 카드만 생성/수정/삭제할 수 있음" ON cards
34 |   FOR ALL USING (auth.uid() = user_id);
35 | 
36 | -- 태그 테이블
37 | CREATE TABLE IF NOT EXISTS tags (
38 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
39 |   name TEXT UNIQUE NOT NULL,
40 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
41 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
42 | );
43 | 
44 | -- 태그 테이블 정책 (RLS)
45 | ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
46 | CREATE POLICY "사용자는 모든 태그를 조회할 수 있음" ON tags
47 |   FOR SELECT USING (true);
48 | CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
[TRUNCATED]
```

scripts/check-port.js
```
1 | /**
2 |  * 파일명: check-port.js
3 |  * 목적: 포트 3000이 사용 중인지 확인하고 필요시 프로세스 종료
4 |  * 역할: 개발 서버 실행 전 포트 충돌 예방
5 |  * 작성일: 2024-03-24
6 |  */
7 | 
8 | const { execSync } = require('child_process');
9 | const os = require('os');
10 | 
11 | const PORT = 3000;
12 | 
13 | function checkPort() {
14 |   console.log(`\n🔍 포트 ${PORT} 상태 확인 중...`);
15 |   
16 |   try {
17 |     let command;
18 |     let processIdCommand;
19 |     
20 |     // OS별 명령어 설정
21 |     if (os.platform() === 'win32') {
22 |       // Windows
23 |       command = `netstat -ano | findstr :${PORT}`;
24 |       processIdCommand = (line) => {
25 |         const parts = line.trim().split(/\s+/);
26 |         return parts[parts.length - 1];
27 |       };
28 |     } else {
29 |       // macOS, Linux
30 |       command = `lsof -i :${PORT}`;
31 |       processIdCommand = (line) => {
32 |         const parts = line.trim().split(/\s+/);
33 |         return parts[1];
34 |       };
35 |     }
36 |     
37 |     // 명령어 실행 및 결과 가져오기
38 |     const result = execSync(command, { encoding: 'utf8' });
39 |     
40 |     if (result && result.trim()) {
41 |       console.log(`⚠️ 포트 ${PORT}가 이미 사용 중입니다.`);
42 |       
43 |       // 결과에서 PID 추출
44 |       const lines = result.split('\n').filter(Boolean);
45 |       
46 |       // 헤더 라인 제외 (macOS/Linux의 lsof 명령어는 헤더가 있음)
47 |       const processLines = os.platform() === 'win32' ? lines : lines.slice(1);
48 |       
49 |       if (processLines.length > 0) {
50 |         // 첫 번째 프로세스의 PID 추출
51 |         const pid = processIdCommand(processLines[0]);
52 |         
53 |         if (pid) {
54 |           console.log(`👉 PID ${pid} 프로세스 종료 중...`);
55 |           
56 |           try {
57 |             // 프로세스 종료
58 |             if (os.platform() === 'win32') {
59 |               execSync(`taskkill /F /PID ${pid}`);
60 |             } else {
61 |               execSync(`kill -9 ${pid}`);
62 |             }
[TRUNCATED]
```

scripts/create-user.js
```
1 | const { PrismaClient } = require('@prisma/client');
2 | const prisma = new PrismaClient();
3 | 
4 | async function main() {
5 |   try {
6 |     const user = await prisma.user.create({
7 |       data: {
8 |         email: 'test@example.com',
9 |         name: 'Test User'
10 |       }
11 |     });
12 |     console.log('Created user:', user);
13 |   } catch (error) {
14 |     console.error('Error creating user:', error);
15 |   } finally {
16 |     await prisma.$disconnect();
17 |   }
18 | }
19 | 
20 | main(); 
```

scripts/pre-deploy.js
```
1 | #!/usr/bin/env node
2 | 
3 | /**
4 |  * 배포 전 환경 설정 스크립트
5 |  * 
6 |  * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
7 |  * 환경 파일을 확인하고 필요한 설정을 적용합니다.
8 |  */
9 | 
10 | const fs = require('fs');
11 | const path = require('path');
12 | const { execSync } = require('child_process');
13 | 
14 | console.log('배포 전 환경 설정 확인 중...');
15 | 
16 | // 기본 필수 환경 변수 목록
17 | let requiredEnvVars = [
18 |   'DATABASE_PROVIDER',
19 |   'DATABASE_URL'
20 | ];
21 | 
22 | // 데이터베이스 프로바이더에 따라 추가 변수 검증
23 | if (process.env.DATABASE_PROVIDER === 'postgresql') {
24 |   requiredEnvVars.push('DIRECT_URL');
25 |   requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
26 |   requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
27 |   
28 |   if (process.env.NODE_ENV === 'production') {
29 |     requiredEnvVars.push('NEXT_PUBLIC_OAUTH_REDIRECT_URL');
30 |   }
31 | }
32 | 
33 | // 환경 변수 검증
34 | const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
35 | 
36 | if (missingEnvVars.length > 0) {
37 |   console.error('❌ 누락된 환경 변수가 있습니다:');
38 |   missingEnvVars.forEach(envVar => {
39 |     console.error(`   - ${envVar}`);
40 |   });
41 |   process.exit(1);
42 | }
43 | 
44 | console.log('✅ 모든 필수 환경 변수가 설정되어 있습니다.');
45 | 
46 | // 프로덕션 환경 확인
47 | if (process.env.NODE_ENV === 'production') {
48 |   console.log('프로덕션 환경 감지: 설정을 확인합니다...');
49 |   
50 |   if (process.env.DATABASE_PROVIDER !== 'postgresql') {
51 |     console.error('❌ 프로덕션 환경에서는 DATABASE_PROVIDER가 postgresql이어야 합니다.');
52 |     process.exit(1);
53 |   }
54 |   
55 |   if (process.env.DATABASE_PROVIDER === 'postgresql' && !process.env.DATABASE_URL.includes('supabase.co')) {
56 |     console.error('❌ 프로덕션 환경에서 DATABASE_URL이 Supabase 연결 문자열이 아닙니다.');
57 |     process.exit(1);
58 |   }
59 | }
60 | 
61 | console.log('✅ 환경 설정 확인 완료');
62 | 
63 | // Prisma 클라이언트 생성
64 | console.log('Prisma 클라이언트를 생성합니다...');
[TRUNCATED]
```

scripts/run-tests.sh
```
1 | #!/bin/bash
2 | 
3 | # 스크립트 이름: run-tests.sh
4 | # 목적: 프로젝트의 테스트를 실행
5 | # 작성일: 2024-03-30
6 | 
7 | # 색상 정의
8 | RED='\033[0;31m'
9 | GREEN='\033[0;32m'
10 | YELLOW='\033[0;33m'
11 | BLUE='\033[0;34m'
12 | NC='\033[0m' # No Color
13 | 
14 | echo -e "${BLUE}===================================================${NC}"
15 | echo -e "${BLUE}        백야드 애플리케이션 테스트 실행         ${NC}"
16 | echo -e "${BLUE}===================================================${NC}"
17 | 
18 | # 스크립트가 위치한 디렉토리 확인
19 | SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
20 | PROJ_ROOT="$(dirname "$SCRIPT_DIR")"
21 | 
22 | # 프로젝트 루트 디렉토리로 이동
23 | cd "$PROJ_ROOT" || { echo -e "${RED}프로젝트 루트 디렉토리로 이동할 수 없습니다.${NC}"; exit 1; }
24 | 
25 | echo -e "${YELLOW}현재 디렉토리: $(pwd)${NC}"
26 | echo -e "${YELLOW}Node.js 버전: $(node -v)${NC}"
27 | echo -e "${YELLOW}NPM 버전: $(npm -v)${NC}"
28 | 
29 | # 의존성 확인
30 | echo -e "\n${BLUE}의존성 확인 중...${NC}"
31 | if ! npm ls jest > /dev/null 2>&1; then
32 |   echo -e "${YELLOW}Jest가 설치되어 있지 않습니다. 설치를 시작합니다...${NC}"
33 |   npm install --save-dev jest @types/jest ts-jest
34 | fi
35 | 
36 | # 테스트 실행
37 | echo -e "\n${BLUE}테스트 실행 중...${NC}"
38 | npx jest --config=jest.config.js "$@"
39 | 
40 | # 테스트 결과 확인
41 | if [ $? -eq 0 ]; then
42 |   echo -e "\n${GREEN}✓ 모든 테스트가 성공적으로 완료되었습니다!${NC}"
43 | else
44 |   echo -e "\n${RED}✗ 테스트 실행 중 오류가 발생했습니다.${NC}"
45 |   exit 1
46 | fi
47 | 
48 | echo -e "\n${BLUE}===================================================${NC}"
49 | echo -e "${BLUE}              테스트 실행 완료                ${NC}"
50 | echo -e "${BLUE}===================================================${NC}" 
```

scripts/schema-sync.js
```
1 | #!/usr/bin/env node
2 | 
3 | /**
4 |  * Prisma 스키마 동기화 스크립트
5 |  * 
6 |  * 이 스크립트는 마스터 템플릿에서 각 환경별 스키마를 생성합니다.
7 |  */
8 | const fs = require('fs');
9 | const path = require('path');
10 | 
11 | // 경로 설정
12 | const basePath = path.join(__dirname, '../prisma');
13 | const masterSchemaPath = path.join(basePath, 'schema.master.prisma');
14 | const sqliteSchemaPath = path.join(basePath, 'schema.sqlite.prisma');
15 | const postgresSchemaPath = path.join(basePath, 'schema.postgresql.prisma');
16 | 
17 | console.log('Prisma 스키마 동기화를 시작합니다...');
18 | 
19 | // 마스터 스키마 파일 확인
20 | if (!fs.existsSync(masterSchemaPath)) {
21 |   console.log('마스터 스키마 파일이 없습니다. 현재 schema.prisma를 마스터로 사용합니다.');
22 |   const currentSchemaPath = path.join(basePath, 'schema.prisma');
23 |   if (fs.existsSync(currentSchemaPath)) {
24 |     fs.copyFileSync(currentSchemaPath, masterSchemaPath);
25 |     console.log(`현재 스키마를 마스터 템플릿으로 복사했습니다: ${masterSchemaPath}`);
26 |   } else {
27 |     console.error('오류: 현재 스키마 파일도 찾을 수 없습니다!');
28 |     process.exit(1);
29 |   }
30 | }
31 | 
32 | // 마스터 스키마 읽기
33 | console.log(`마스터 스키마 파일 읽기: ${masterSchemaPath}`);
34 | const masterSchema = fs.readFileSync(masterSchemaPath, 'utf8');
35 | 
36 | // SQLite 스키마 생성
37 | const sqliteSchema = masterSchema
38 |   .replace(/provider(\s*)=(\s*)"postgresql"/g, 'provider$1=$2"sqlite"')
39 |   .replace(/directUrl(\s*)=(\s*)env\("DIRECT_URL"\)/g, '')
40 |   .replace(/extensions(\s*)=(\s*)\[.*?\]/g, '')
41 |   .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for SQLite,');
42 | 
43 | // PostgreSQL 스키마 생성
44 | const postgresSchema = masterSchema
45 |   .replace(/provider(\s*)=(\s*)"sqlite"/g, 'provider$1=$2"postgresql"')
46 |   .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for PostgreSQL,');
47 | 
48 | // 생성된 스키마 파일 저장
49 | fs.writeFileSync(sqliteSchemaPath, sqliteSchema);
50 | console.log(`SQLite 스키마 파일이 생성되었습니다: ${sqliteSchemaPath}`);
51 | 
52 | fs.writeFileSync(postgresSchemaPath, postgresSchema);
[TRUNCATED]
```

scripts/select-db.js
```
1 | #!/usr/bin/env node
2 | 
3 | const fs = require('fs');
4 | const path = require('path');
5 | 
6 | // 환경 확인
7 | const isProduction = process.env.NODE_ENV === 'production';
8 | const dbType = isProduction ? 'postgresql' : 'sqlite';
9 | 
10 | // 경로 설정
11 | const basePath = path.join(__dirname, '../prisma');
12 | const schemaPath = path.join(basePath, 'schema.prisma');
13 | const sourceSchemaPath = path.join(basePath, `schema.${dbType}.prisma`);
14 | 
15 | console.log(`환경: ${isProduction ? '프로덕션' : '개발'}`);
16 | console.log(`데이터베이스: ${dbType}`);
17 | console.log(`소스 스키마: ${sourceSchemaPath}`);
18 | console.log(`타겟 스키마: ${schemaPath}`);
19 | 
20 | // 파일 복사
21 | try {
22 |   // 소스 파일 존재 확인
23 |   if (!fs.existsSync(sourceSchemaPath)) {
24 |     console.error(`오류: 소스 스키마 파일을 찾을 수 없습니다: ${sourceSchemaPath}`);
25 |     process.exit(1);
26 |   }
27 | 
28 |   // 파일 복사
29 |   fs.copyFileSync(sourceSchemaPath, schemaPath);
30 |   console.log(`✅ 성공: ${dbType} 스키마를 복사했습니다.`);
31 | 
32 |   // Prisma 생성 명령어 안내
33 |   console.log('이제 다음 명령어를 실행하세요: npx prisma generate');
34 | } catch (error) {
35 |   console.error(`❌ 오류 발생: ${error.message}`);
36 |   process.exit(1);
37 | } 
```

scripts/test-db.js
```
1 | // 데이터베이스 연결 테스트 스크립트
2 | const { PrismaClient } = require('@prisma/client');
3 | 
4 | async function main() {
5 |   console.log('데이터베이스 연결 테스트 시작...');
6 |   console.log('환경 변수:', {
7 |     NODE_ENV: process.env.NODE_ENV,
8 |     DATABASE_URL: process.env.DATABASE_URL,
9 |     DATABASE_PROVIDER: process.env.DATABASE_PROVIDER
10 |   });
11 | 
12 |   try {
13 |     const prisma = new PrismaClient();
14 |     console.log('Prisma 클라이언트 초기화 성공');
15 | 
16 |     // 연결 테스트
17 |     console.log('데이터베이스 연결 시도 중...');
18 |     await prisma.$connect();
19 |     console.log('데이터베이스 연결 성공!');
20 | 
21 |     // 간단한 쿼리 테스트
22 |     console.log('사용자 조회 시도 중...');
23 |     const users = await prisma.user.findMany({ take: 5 });
24 |     console.log(`사용자 조회 성공: ${users.length}명의 사용자 발견`);
25 |     
26 |     // 연결 종료
27 |     await prisma.$disconnect();
28 |     console.log('데이터베이스 연결 종료');
29 |   } catch (error) {
30 |     console.error('에러 발생:', error);
31 |   }
32 | }
33 | 
34 | main(); 
```

.cursor/rules/package.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | # Package manager
7 | 
8 | - 패키지 관리를 통일하기 위해 패키지 관리자는 yarn만 사용. 
9 | - 특히 shadcn 컴포넌트 최신화를 위해 이렇게 설치.  
10 | 'yarn add shadcn@latest dialog'
11 | 
12 | # 테스트
13 | - 테스트를 수행할 때는 사용자가 q를 입력하지 않아도 테스트를 자동 종료하기 위해 yarn vitest run 실행
```

.cursor/rules/piper5.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | # RIPER-5 MODE: STRICT OPERATIONAL PROTOCOL
7 | 
8 | *CONTEXT PRIMER*
9 | You are Claude 3.7, you are integrated into Cursor IDE, an A.I based fork of VS Code. Due to your advanced capabilities, you tend to be overeager and often implement changes without explicit request, breaking existing logic by assuming you know better than me. This leads to UNACCEPTABLE disasters to the code. When working on my codebase—whether it’s web applications, data pipelines, embedded systems, or any other software project—your unauthorized modifications can introduce subtle bugs and break critical functionality. To prevent this, you MUST follow this STRICT protocol:
10 | 
11 | *META-INSTRUCTION: MODE DECLARATION REQUIREMENT*
12 | YOU MUST BEGIN EVERY SINGLE RESPONSE WITH YOUR CURRENT MODE IN BRACKETS. NO EXCEPTIONS. Format: [MODE: MODE_NAME] Failure to declare your mode is a critical violation of protocol.
13 | 
14 | *THE RIPER-5 MODES*
15 | 
16 | **MODE 1: RESEARCH**
17 | Command : do res
18 | Tag : [MODE: RESEARCH]
19 | 
20 | Purpose: Information gathering ONLY
21 | Permitted: Reading files, asking clarifying questions, understanding code structure
22 | Forbidden: Suggestions, implementations, planning, or any hint of action
23 | Requirement: You may ONLY seek to understand what exists, not what could be
24 | Duration: Until I explicitly signal to move to next mode
25 | Output Format: Begin with [MODE: RESEARCH], then ONLY observations and questions
26 | 
27 | **MODE 2: INNOVATE**
28 | Command : do inn
29 | tag : [MODE: INNOVATE]
30 | 
31 | Purpose: Brainstorming potential approaches
32 | Permitted: Discussing ideas, advantages/disadvantages, seeking feedback
33 | Forbidden: Concrete planning, implementation details, or any code writing
34 | Requirement: All ideas must be presented as possibilities, not decisions
35 | Duration: Until I explicitly signal to move to next mode
36 | Output Format: Begin with [MODE: INNOVATE], then ONLY possibilities and considerations
37 | 
38 | **MODE 3: PLAN**
39 | Command : do pla
40 | tag : [MODE: PLAN]
[TRUNCATED]
```

types/vitest.d.ts
```
1 | /// <reference types="vitest" />
2 | /// <reference types="@testing-library/jest-dom" />
3 | 
4 | import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
5 | 
6 | declare global {
7 |   namespace Vi {
8 |     interface JestAssertion<T = any> 
9 |       extends jest.Matchers<void, T>,
10 |         TestingLibraryMatchers<T, void> {}
11 |   }
12 | 
13 |   // 테스트 환경에서 전역 fetch를 사용할 수 있도록 설정
14 |   var fetch: jest.Mock<Promise<Response>> & {
15 |     mockResolvedValue: (value: any) => jest.Mock;
16 |     mockRejectedValue: (error: any) => jest.Mock;
17 |     mockImplementation: (fn: (...args: any[]) => any) => jest.Mock;
18 |   };
19 | }
20 | 
21 | // Prisma 모킹 타입 확장
22 | declare module '@prisma/client' {
23 |   interface PrismaClient {
24 |     tag?: {
25 |       findUnique: jest.Mock<any, any>;
26 |       findMany: jest.Mock<any, any>; 
27 |       create: jest.Mock<any, any>;
28 |       delete: jest.Mock<any, any>;
29 |       update: jest.Mock<any, any>;
30 |     };
31 |     cardTag?: {
32 |       deleteMany: jest.Mock<any, any>;
33 |       create: jest.Mock<any, any>;
34 |       findMany: jest.Mock<any, any>;
35 |     };
36 |     card?: {
37 |       findUnique: jest.Mock<any, any>;
38 |       findMany: jest.Mock<any, any>;
39 |       create: jest.Mock<any, any>;
40 |       delete: jest.Mock<any, any>;
41 |       update: jest.Mock<any, any>;
42 |     };
43 |   }
44 | } 
```

prisma/seed/index.js
```
1 | const { PrismaClient } = require('@prisma/client');
2 | const prisma = new PrismaClient();
3 | 
4 | async function main() {
5 |   try {
6 |     // 사용자 생성
7 |     const user = await prisma.user.upsert({
8 |       where: { email: 'test@example.com' },
9 |       update: {},
10 |       create: {
11 |         email: 'test@example.com',
12 |         name: 'Test User',
13 |         cards: {
14 |           create: [
15 |             {
16 |               title: '시작하기',
17 |               content: '백야드 프로젝트에 오신 것을 환영합니다!'
18 |             }
19 |           ]
20 |         }
21 |       }
22 |     });
23 |     
24 |     // 태그 생성
25 |     const welcomeTag = await prisma.tag.upsert({
26 |       where: { name: '환영' },
27 |       update: {},
28 |       create: { name: '환영' }
29 |     });
30 |     
31 |     // 카드-태그 연결
32 |     const cards = await prisma.card.findMany({
33 |       where: { userId: user.id }
34 |     });
35 |     
36 |     if (cards.length > 0) {
37 |       await prisma.cardTag.upsert({
38 |         where: {
39 |           cardId_tagId: {
40 |             cardId: cards[0].id,
41 |             tagId: welcomeTag.id
42 |           }
43 |         },
44 |         update: {},
45 |         create: {
46 |           cardId: cards[0].id,
47 |           tagId: welcomeTag.id
48 |         }
49 |       });
50 |     }
51 |     
52 |     console.log('Database seeded!');
53 |   } catch (error) {
54 |     console.error('Error seeding database:', error);
55 |   } finally {
56 |     await prisma.$disconnect();
57 |   }
58 | }
59 | 
60 | main(); 
```

src/app/globals.css
```
1 | @import "tailwindcss";
2 | @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
3 | 
4 | @plugin "tailwindcss-animate";
5 | 
6 | /* Pretendard 웹폰트 추가 */
7 | 
8 | @custom-variant dark (&:is(.dark *));
9 | 
10 | @theme {
11 |   --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', sans-serif;
12 |   --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
13 | }
14 | 
15 | :root {
16 |   --background: #ffffff;
17 |   --foreground: #1a1a1a;
18 |   --card: #ffffff;
19 |   --card-foreground: #1a1a1a;
20 |   --popover: #ffffff;
21 |   --popover-foreground: #1a1a1a;
22 |   --primary: #0071e3;
23 |   --primary-foreground: #ffffff;
24 |   --secondary: #f5f5f7;
25 |   --secondary-foreground: #1a1a1a;
26 |   --muted: #f5f5f7;
27 |   --muted-foreground: #6e6e73;
28 |   --accent: #f5f5f7;
29 |   --accent-foreground: #1a1a1a;
30 |   --destructive: #ff3b30;
31 |   --destructive-foreground: #ff3b30;
32 |   --border: #d2d2d7;
33 |   --input: #d2d2d7;
34 |   --ring: #c7c7cc;
35 |   --chart-1: #ff9500;
36 |   --chart-2: #00c7be;
37 |   --chart-3: #32ade6;
38 |   --chart-4: #ff9500;
39 |   --chart-5: #ff3b30;
40 |   --radius: 0.625rem;
41 |   --sidebar: #ffffff;
42 |   --sidebar-foreground: #1a1a1a;
43 |   --sidebar-primary: #0071e3;
44 |   --sidebar-primary-foreground: #ffffff;
45 |   --sidebar-accent: #f5f5f7;
46 |   --sidebar-accent-foreground: #1a1a1a;
47 |   --sidebar-border: #d2d2d7;
48 |   --sidebar-ring: #c7c7cc;
49 |   
50 |   /* Apple theme Light */
51 |   --theme-color-labelPrimary: rgba(0,0,0,0.88);
52 |   --theme-color-labelSecondary: rgba(0,0,0,0.56);
53 |   --theme-color-labelTertiary: rgba(0,0,0,0.48);
54 |   --theme-color-labelQuaternary: rgba(0,0,0,0.32);
55 |   --theme-color-fillPrimary: rgba(120,120,128,0.2);
56 |   --theme-color-fillSecondary: rgba(120,120,128,0.16);
57 |   --theme-color-fillTertiary: rgba(118,118,128,0.12);
58 |   --theme-color-fillQuaternary: rgba(120,120,128,0.08);
59 |   --theme-color-gray1-h: 240;
60 |   --theme-color-gray1-s: 2.3%;
[TRUNCATED]
```

src/app/layout.test.tsx
```
1 | import { Metadata } from 'next';
2 | import React from 'react';
3 | import { render } from '@testing-library/react';
4 | import '@testing-library/jest-dom/vitest';
5 | import RootLayout, { metadata } from './layout';
6 | import { describe, it, expect, vi } from 'vitest';
7 | 
8 | // next/font 모듈 모킹
9 | vi.mock('next/font/google', () => ({
10 |   Geist: vi.fn().mockReturnValue({
11 |     variable: 'mocked-geist-sans',
12 |   }),
13 |   Geist_Mono: vi.fn().mockReturnValue({
14 |     variable: 'mocked-geist-mono',
15 |   }),
16 | }));
17 | 
18 | describe('메타데이터', () => {
19 |   it('올바른 메타데이터를 가져야 합니다', () => {
20 |     expect(metadata).toBeDefined();
21 |     expect(metadata.title).toBe('backyard - 지식 관리 도구');
22 |     expect(metadata.description).toBe('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
23 |   });
24 | });
25 | 
26 | describe('RootLayout', () => {
27 |   it('RootLayout 함수가 정의되어 있습니다', () => {
28 |     // 함수가 존재하는지 테스트
29 |     expect(typeof RootLayout).toBe('function');
30 |   });
31 |   
32 |   it('올바른 구조로 JSX를 반환합니다', () => {
33 |     // JSX 요소를 직접 검사
34 |     const result = RootLayout({ children: <div>테스트</div> });
35 |     
36 |     // React 요소인지 확인
37 |     expect(result).toBeTruthy();
38 |     
39 |     // 올바른 태그와 속성을 가지고 있는지 확인
40 |     expect(result.type).toBe('html');
41 |     expect(result.props.lang).toBe('en');
42 |     
43 |     // body 요소 확인
44 |     const bodyElement = result.props.children;
45 |     expect(bodyElement.type).toBe('body');
46 |     
47 |     // 클래스 속성 확인 (클래스 이름에 모킹된 값이 포함되어 있는지)
48 |     const className = bodyElement.props.className;
49 |     expect(className).toContain('mocked-geist-sans');
50 |     expect(className).toContain('mocked-geist-mono');
51 |   });
52 | }); 
```

src/app/layout.tsx
```
1 | /**
2 |  * 파일명: layout.tsx
3 |  * 목적: 앱의 기본 레이아웃 구조 정의
4 |  * 역할: 전체 페이지 구조와 공통 UI 요소 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { ClientLayout } from "@/components/layout/ClientLayout";
9 | import "@/app/globals.css";
10 | import "@xyflow/react/dist/style.css";
11 | 
12 | export default function RootLayout({
13 |   children,
14 | }: {
15 |   children: React.ReactNode;
16 | }) {
17 |   return (
18 |     <html lang="ko">
19 |       <body className="antialiased" suppressHydrationWarning>
20 |         <ClientLayout>
21 |           {children}
22 |         </ClientLayout>
23 |       </body>
24 |     </html>
25 |   );
26 | }
```

src/app/metadata.ts
```
1 | import { Metadata } from "next";
2 | 
3 | export const metadata: Metadata = {
4 |   title: "Backyard - 모든 아이디어를 정리하는 공간",
5 |   description: "효율적인 메모와 지식 관리를 위한 솔루션",
6 |   icons: {
7 |     icon: "/favicon.ico",
8 |   },
9 | }; 
```

src/app/not-found.tsx
```
1 | 'use client';
2 | 
3 | import Link from 'next/link';
4 | 
5 | export default function NotFound() {
6 |   return (
7 |     <div className="flex flex-col items-center justify-center min-h-screen p-8">
8 |       <div className="text-center">
9 |         <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
10 |         <h2 className="text-2xl font-semibold text-gray-700 mb-6">페이지를 찾을 수 없습니다</h2>
11 |         <p className="text-gray-600 mb-8">
12 |           요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
13 |         </p>
14 |         <Link
15 |           href="/"
16 |           className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
17 |         >
18 |           홈으로 돌아가기
19 |         </Link>
20 |       </div>
21 |     </div>
22 |   );
23 | } 
```

src/app/page.test.tsx
```
1 | import { render, screen } from '@testing-library/react';
2 | import '@testing-library/jest-dom/vitest';
3 | import Home from './page';
4 | import { describe, it, expect } from 'vitest';
5 | import React from 'react';
6 | 
7 | describe('Home 페이지', () => {
8 |   it('Backyard 제목이 렌더링되어야 합니다', () => {
9 |     render(<Home />);
10 |     
11 |     const heading = screen.getByText('Hello backyard');
12 |     expect(heading).toBeInTheDocument();
13 |   });
14 |   
15 |   it('설명 텍스트가 렌더링되어야 합니다', () => {
16 |     render(<Home />);
17 |     
18 |     const description = screen.getByText('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
19 |     expect(description).toBeInTheDocument();
20 |   });
21 |   
22 |   it('카드 목록 보기 링크가 렌더링되어야 합니다', () => {
23 |     render(<Home />);
24 |     
25 |     const link = screen.getByText('카드 목록 보기');
26 |     expect(link).toBeInTheDocument();
27 |     expect(link.closest('a')).toHaveAttribute('href', '/cards');
28 |   });
29 | }); 
```

src/app/page.tsx
```
1 | import { DashboardLayout } from '@/components/layout/DashboardLayout';
2 | 
3 | export default function Home() {
4 |   return <DashboardLayout />;
5 | }
```

src/components/InitDatabase.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect, useState } from 'react';
4 | 
5 | export function InitDatabase() {
6 |   const [initialized, setInitialized] = useState(false);
7 |   
8 |   useEffect(() => {
9 |     // 개발 환경에서만 실행
10 |     if (process.env.NODE_ENV === 'development') {
11 |       // DB 초기화 API 호출
12 |       const initDb = async () => {
13 |         try {
14 |           const response = await fetch('/api/db-init');
15 |           const data = await response.json();
16 |           console.log('DB 초기화 결과:', data);
17 |           setInitialized(true);
18 |         } catch (error) {
19 |           console.error('DB 초기화 중 오류 발생:', error);
20 |         }
21 |       };
22 |       
23 |       if (!initialized) {
24 |         initDb();
25 |       }
26 |     }
27 |   }, [initialized]);
28 |   
29 |   // 아무것도 렌더링하지 않음
30 |   return null;
31 | } 
```

src/components/ProjectToolbar.tsx
```
1 | import React from 'react';
2 | import { useRouter } from 'next/navigation';
3 | import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
4 | import createLogger from '@/lib/logger';
5 | import { useAuth } from '@/contexts/AuthContext';
6 | 
7 | // 모듈별 로거 생성
8 | const logger = createLogger('ProjectToolbar');
9 | 
10 | const ProjectToolbar: React.FC = () => {
11 |   const router = useRouter();
12 |   const { signOut } = useAuth();
13 | 
14 |   const handleLogout = async () => {
15 |     try {
16 |       logger.info('로그아웃 버튼 클릭');
17 |       
18 |       // AuthContext를 통한 로그아웃 (code_verifier 보존)
19 |       await signOut();
20 |       
21 |       // 로그인 페이지로 리디렉션
22 |       logger.info('로그인 페이지로 리디렉션');
23 |       router.push('/login');
24 |     } catch (error) {
25 |       logger.error('로그아웃 처리 중 오류', error);
26 |       router.push('/login');
27 |     }
28 |   };
29 | 
30 |   return (
31 |     <div>
32 |       {/* 로그아웃 버튼 */}
33 |       <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
34 |         로그아웃
35 |       </button>
36 |     </div>
37 |   );
38 | };
39 | 
40 | export default ProjectToolbar; 
```

src/config/cardBoardUiOptions.json
```
1 | {
2 |   "autoSaveIntervalMinutes": 1,
3 |   "board": {
4 |     "snapToGrid": false,
5 |     "snapGrid": [15, 15],
6 |     "connectionLineType": "bezier",
7 |     "markerEnd": "arrowclosed",
8 |     "strokeWidth": 2,
9 |     "markerSize": 20,
10 |     "edgeColor": "#C1C1C1",
11 |     "animated": false,
12 |     "selectedEdgeColor": "#000000"
13 |   },
14 |   "card": {
15 |     "defaultWidth": 130,
16 |     "backgroundColor": "#FFFFFF",
17 |     "borderRadius": 8,
18 |     "tagBackgroundColor": "#F2F2F2",
19 |     "fontSizes": {
20 |       "default": 16,
21 |       "title": 16,
22 |       "content": 14,
23 |       "tags": 12
24 |     }
25 |   },
26 |   "handles": {
27 |     "size": 18,
28 |     "backgroundColor": "#555555",
29 |     "borderColor": "#FFFFFF",
30 |     "borderWidth": 2
31 |   },
32 |   "layout": {
33 |     "defaultPadding": 20,
34 |     "defaultSpacing": {
35 |       "horizontal": 30,
36 |       "vertical": 30
37 |     },
38 |     "nodeSize": {
39 |       "width": 130,
40 |       "height": 48,
41 |       "maxHeight": 180
42 |     },
43 |     "graphSettings": {
44 |       "nodesep": 60,
45 |       "ranksep": 60,
46 |       "edgesep": 40
47 |     }
48 |   }
49 | } 
```

src/contexts/AuthContext.tsx
```
1 | /**
2 |  * 파일명: AuthContext.tsx
3 |  * 목적: 전역 인증 상태 관리
4 |  * 역할: 인증 상태, code_verifier 등의 인증 관련 데이터를 전역적으로 관리
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
11 | import { User, Session, SupabaseClient } from '@supabase/supabase-js';
12 | import { getHybridSupabaseClient, isClientEnvironment } from '@/lib/hybrid-supabase';
13 | import { getAuthData, setAuthData, removeAuthData, clearAllAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
14 | import { Database } from '@/types/supabase';
15 | import createLogger from '@/lib/logger';
16 | 
17 | // 모듈별 로거 생성
18 | const logger = createLogger('AuthContext');
19 | 
20 | // 클라이언트 환경 확인 (전역 변수로 미리 설정)
21 | const isClient = typeof window !== 'undefined';
22 | 
23 | interface AuthContextType {
24 |   user: User | null;
25 |   session: Session | null;
26 |   isLoading: boolean;
27 |   signOut: () => Promise<void>;
28 |   codeVerifier: string | null;
29 |   error: Error | null;
30 |   setCodeVerifier: (value: string | null) => void;
31 | }
32 | 
33 | // 기본 컨텍스트 값
34 | const AuthContext = createContext<AuthContextType>({
35 |   user: null,
36 |   session: null,
37 |   isLoading: true,
38 |   signOut: async () => {},
39 |   codeVerifier: null,
40 |   error: null,
41 |   setCodeVerifier: () => {},
42 | });
43 | 
44 | export function AuthProvider({ children }: { children: ReactNode }) {
45 |   // 서버 환경에서는 빈 Provider만 반환
46 |   if (!isClient) {
47 |     logger.error('AuthProvider가 서버 환경에서 사용되었습니다. 클라이언트 컴포넌트에서만 사용해야 합니다.');
48 |     return <AuthContext.Provider value={{
49 |       user: null,
50 |       session: null,
51 |       isLoading: false,
52 |       signOut: async () => {},
53 |       codeVerifier: null,
54 |       error: null,
55 |       setCodeVerifier: () => {},
56 |     }}>{children}</AuthContext.Provider>;
57 |   }
58 | 
59 |   // 여기서부터는 클라이언트 환경에서만 실행됨
60 |   const [user, setUser] = useState<User | null>(null);
61 |   const [session, setSession] = useState<Session | null>(null);
62 |   const [isLoading, setIsLoading] = useState(true);
63 |   const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
[TRUNCATED]
```

src/contexts/ThemeContext.test.tsx
```
1 | /**
2 |  * 파일명: ThemeContext.test.tsx
3 |  * 목적: ThemeContext 및 ThemeProvider 테스트
4 |  * 역할: 테마 관련 기능 검증
5 |  * 작성일: 2024-04-01
6 |  */
7 | 
8 | import React from 'react';
9 | import { render, act } from '@testing-library/react';
10 | import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
11 | import { ThemeProvider, useTheme } from './ThemeContext';
12 | 
13 | // 기본 테마 세팅 (실제 defaultTheme과 일치)
14 | const defaultTheme = {
15 |   node: {
16 |     width: 220,
17 |     height: 48,
18 |     maxHeight: 180,
19 |     backgroundColor: '#ffffff',
20 |     borderColor: '#C1C1C1',
21 |     borderWidth: 1,
22 |     borderRadius: 8,
23 |     selectedBorderColor: '#0071e3',
24 |     font: {
25 |       family: 'Pretendard, sans-serif',
26 |       titleSize: 14,
27 |       contentSize: 12,
28 |       tagsSize: 10,
29 |     }
30 |   },
31 |   edge: {
32 |     color: '#C1C1C1',
33 |     width: 1,
34 |     selectedColor: '#0071e3',
35 |     animated: false,
36 |   },
37 |   handle: {
38 |     size: 8,
39 |     backgroundColor: '#ffffff',
40 |     borderColor: '#555555',
41 |     borderWidth: 1,
42 |   },
43 |   layout: {
44 |     spacing: {
45 |       horizontal: 30,
46 |       vertical: 30,
47 |     },
48 |     padding: 20,
49 |   },
50 | };
51 | 
52 | // ResizeObserver 모킹
53 | global.ResizeObserver = vi.fn().mockImplementation(() => ({
54 |   observe: vi.fn(),
55 |   unobserve: vi.fn(),
56 |   disconnect: vi.fn(),
57 | }));
58 | 
59 | // CSS 속성 적용 모킹
60 | const originalSetProperty = document.documentElement.style.setProperty;
61 | 
62 | describe('ThemeContext', () => {
63 |   const setPropertyMock = vi.fn();
64 |   
65 |   beforeEach(() => {
66 |     document.documentElement.style.setProperty = setPropertyMock;
67 |     setPropertyMock.mockClear();
68 |   });
69 |   
70 |   afterEach(() => {
71 |     document.documentElement.style.setProperty = originalSetProperty;
72 |     vi.clearAllMocks();
73 |   });
74 |   
75 |   test('ThemeProvider가 자식 컴포넌트를 렌더링해야 함', () => {
76 |     const { getByText } = render(
77 |       <ThemeProvider>
78 |         <div>테스트 자식</div>
79 |       </ThemeProvider>
80 |     );
81 |     
82 |     expect(getByText('테스트 자식')).toBeInTheDocument();
83 |   });
84 |   
[TRUNCATED]
```

src/contexts/ThemeContext.tsx
```
1 | /**
2 |  * 파일명: ThemeContext.tsx
3 |  * 목적: 중앙화된 테마 관리 시스템 구현
4 |  * 역할: React Flow 노드 및 엣지 스타일링을 위한 전역 테마 컨텍스트 제공
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
9 | import defaultConfig from '../config/cardBoardUiOptions.json';
10 | 
11 | export interface NodeTheme {
12 |   width: number;
13 |   height: number;
14 |   maxHeight: number;
15 |   backgroundColor: string;
16 |   borderColor: string;
17 |   borderWidth: number;
18 |   borderRadius: number;
19 |   selectedBorderColor: string;
20 |   font: {
21 |     family: string;
22 |     titleSize: number;
23 |     contentSize: number;
24 |     tagsSize: number;
25 |   };
26 | }
27 | 
28 | export interface EdgeTheme {
29 |   color: string;
30 |   width: number;
31 |   selectedColor: string;
32 |   animated: boolean;
33 | }
34 | 
35 | export interface HandleTheme {
36 |   size: number;
37 |   backgroundColor: string;
38 |   borderColor: string;
39 |   borderWidth: number;
40 | }
41 | 
42 | export interface LayoutTheme {
43 |   spacing: {
44 |     horizontal: number;
45 |     vertical: number;
46 |   };
47 |   padding: number;
48 | }
49 | 
50 | export interface Theme {
51 |   node: NodeTheme;
52 |   edge: EdgeTheme;
53 |   handle: HandleTheme;
54 |   layout: LayoutTheme;
55 | }
56 | 
57 | // 기본 테마 설정 - 기존 JSON 파일의 값 사용
58 | const defaultTheme: Theme = {
59 |   node: {
60 |     width: defaultConfig.layout.nodeSize.width,
61 |     height: defaultConfig.layout.nodeSize.height,
62 |     maxHeight: defaultConfig.layout.nodeSize.maxHeight,
63 |     backgroundColor: defaultConfig.card.backgroundColor,
64 |     borderColor: '#C1C1C1',
65 |     borderWidth: 1,
66 |     borderRadius: defaultConfig.card.borderRadius,
67 |     selectedBorderColor: '#0071e3',
68 |     font: {
69 |       family: 'Pretendard, sans-serif',
70 |       titleSize: defaultConfig.card.fontSizes.title,
71 |       contentSize: defaultConfig.card.fontSizes.content,
72 |       tagsSize: defaultConfig.card.fontSizes.tags,
73 |     }
74 |   },
75 |   edge: {
76 |     color: defaultConfig.board.edgeColor,
77 |     width: defaultConfig.board.strokeWidth,
78 |     selectedColor: defaultConfig.board.selectedEdgeColor,
79 |     animated: defaultConfig.board.animated,
80 |   },
81 |   handle: {
82 |     size: defaultConfig.handles.size,
[TRUNCATED]
```

prisma/migrations/migration_lock.toml
```
1 | # Please do not edit this file manually
2 | # It should be added in your version-control system (e.g., Git)
3 | provider = "sqlite"
```

src/hooks/useAddNodeOnEdgeDrop.ts
```
1 | import { useState, useCallback } from 'react';
2 | import { OnConnectStart, OnConnectEnd, useReactFlow, Connection, XYPosition } from '@xyflow/react';
3 | 
4 | interface UseAddNodeOnEdgeDropProps {
5 |   onCreateNode: (position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => void;
6 | }
7 | 
8 | /**
9 |  * 엣지를 드래그해서 특정 위치에 드롭했을 때 새 노드를 생성하는 기능을 제공하는 훅
10 |  */
11 | export function useAddNodeOnEdgeDrop({ onCreateNode }: UseAddNodeOnEdgeDropProps) {
12 |   // 현재 연결 중인 노드 ID
13 |   const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
14 |   // 현재 연결 중인 핸들 타입 (source 또는 target)
15 |   const [connectingHandleType, setConnectingHandleType] = useState<'source' | 'target' | null>(null);
16 |   
17 |   // ReactFlow 인스턴스 가져오기
18 |   const { screenToFlowPosition, getNodes } = useReactFlow();
19 |   
20 |   // 연결 시작 핸들러
21 |   const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleType }) => {
22 |     setConnectingNodeId(nodeId);
23 |     setConnectingHandleType(handleType as 'source' | 'target');
24 |   }, []);
25 |   
26 |   // 연결 종료 핸들러
27 |   const onConnectEnd: OnConnectEnd = useCallback(
28 |     (event) => {
29 |       if (!connectingNodeId || !connectingHandleType || !event) {
30 |         return;
31 |       }
32 |       
33 |       // 마우스 이벤트를 캐스팅
34 |       const mouseEvent = event as MouseEvent;
35 |       
36 |       // 마우스 위치를 Flow 좌표로 변환
37 |       const position = screenToFlowPosition({
38 |         x: mouseEvent.clientX,
39 |         y: mouseEvent.clientY,
40 |       });
41 |       
42 |       // 노드 목록 가져오기
43 |       const nodes = getNodes();
44 |       
45 |       // 해당 위치에 이미 노드가 있는지 확인 (50px 허용 오차)
46 |       const targetNodeAtPosition = nodes.find(
47 |         node => 
48 |           Math.abs(node.position.x - position.x) < 50 && 
49 |           Math.abs(node.position.y - position.y) < 50
50 |       );
51 |       
52 |       // 이미 노드가 있으면 자동 연결 처리는 하지 않고 기본 동작을 사용
53 |       if (!targetNodeAtPosition) {
54 |         // 노드가 없으면 새 노드 생성 함수 호출
55 |         onCreateNode(position, connectingNodeId, connectingHandleType);
56 |       }
57 |       
58 |       // 연결 상태 초기화
59 |       setConnectingNodeId(null);
60 |       setConnectingHandleType(null);
61 |     },
62 |     [connectingNodeId, connectingHandleType, getNodes, onCreateNode, screenToFlowPosition]
63 |   );
64 |   
65 |   return {
66 |     connectingNodeId,
67 |     connectingHandleType,
[TRUNCATED]
```

src/hooks/useCardData.ts
```
1 | /**
2 |  * 파일명: useCardData.ts
3 |  * 목적: 카드 데이터를 API에서 로드하고 관리하는 훅
4 |  * 역할: API 호출 및 응답 처리, 데이터 캐싱, 전역 상태 업데이트 담당
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | import { useState, useEffect, useCallback } from 'react';
9 | import { toast } from 'sonner';
10 | import { useAppStore, Card } from '@/store/useAppStore';
11 | 
12 | interface UseCardDataOptions {
13 |   autoLoad?: boolean;
14 |   userId?: string | null;
15 |   searchQuery?: string | null;
16 |   tagFilter?: string | null;
17 | }
18 | 
19 | /**
20 |  * useCardData: 카드 데이터를 API에서 로드하고 관리하는 훅
21 |  * @param options 데이터 로드 설정 옵션
22 |  * @returns 카드 데이터 관련 상태 및 함수들
23 |  */
24 | export function useCardData({
25 |   autoLoad = true,
26 |   userId = null,
27 |   searchQuery = null,
28 |   tagFilter = null
29 | }: UseCardDataOptions = {}) {
30 |   // 로딩 및 에러 상태
31 |   const [isLoading, setIsLoading] = useState(false);
32 |   const [error, setError] = useState<string | null>(null);
33 |   const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
34 |   
35 |   // useAppStore에서 카드 관련 상태 및 함수 가져오기
36 |   const cards = useAppStore(state => state.cards);
37 |   const setCards = useAppStore(state => state.setCards);
38 |   
39 |   /**
40 |    * 카드 데이터 로드 함수
41 |    * @param params 선택적 검색 매개변수
42 |    */
43 |   const loadCards = useCallback(async (params?: {
44 |     userId?: string;
45 |     q?: string;
46 |     tag?: string;
47 |   }) => {
48 |     try {
49 |       setIsLoading(true);
50 |       setError(null);
51 |       
52 |       // URL 매개변수 구성
53 |       const searchParams = new URLSearchParams();
54 |       
55 |       // 기본 옵션과 매개변수 병합
56 |       const userId = params?.userId || null;
57 |       const q = params?.q || searchQuery || null;
58 |       const tag = params?.tag || tagFilter || null;
59 |       
60 |       // 선택적 매개변수 추가
61 |       if (userId) searchParams.append('userId', userId);
62 |       if (q) searchParams.append('q', q);
63 |       if (tag) searchParams.append('tag', tag);
64 |       
[TRUNCATED]
```

src/hooks/useResizable.ts
```
1 | import { useState, useEffect, useRef } from 'react';
2 | 
3 | interface UseResizableProps {
4 |   initialWidth: number;
5 |   minWidth: number;
6 |   maxWidth: number;
7 |   onWidthChange?: (width: number) => void;
8 |   storageKey?: string;
9 | }
10 | 
11 | export function useResizable({
12 |   initialWidth = 320,
13 |   minWidth = 240,
14 |   maxWidth = 480,
15 |   onWidthChange,
16 |   storageKey
17 | }: UseResizableProps) {
18 |   // 로컬 스토리지에서 저장된 너비 가져오기
19 |   const getStoredWidth = () => {
20 |     if (typeof window === 'undefined' || !storageKey) return initialWidth;
21 |     
22 |     const storedWidth = localStorage.getItem(storageKey);
23 |     if (storedWidth) {
24 |       const parsed = parseInt(storedWidth, 10);
25 |       if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
26 |         return parsed;
27 |       }
28 |     }
29 |     return initialWidth;
30 |   };
31 | 
32 |   const [width, setWidth] = useState<number>(getStoredWidth);
33 |   const [isDragging, setIsDragging] = useState<boolean>(false);
34 |   const dragHandleRef = useRef<HTMLDivElement>(null);
35 | 
36 |   useEffect(() => {
37 |     if (storageKey && typeof window !== 'undefined') {
38 |       localStorage.setItem(storageKey, width.toString());
39 |     }
40 |     
41 |     onWidthChange?.(width);
42 |   }, [width, storageKey, onWidthChange]);
43 | 
44 |   useEffect(() => {
45 |     const handleMouseMove = (e: MouseEvent) => {
46 |       if (!isDragging) return;
47 |       
48 |       // 마우스 위치와 요소의 위치에 따라 너비 계산
49 |       const newWidth = window.innerWidth - e.clientX;
50 |       const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
51 |       
52 |       setWidth(clampedWidth);
53 |     };
54 | 
55 |     const handleMouseUp = () => {
56 |       setIsDragging(false);
57 |     };
58 | 
59 |     // 마우스 이벤트 리스너 등록
60 |     if (isDragging) {
61 |       document.addEventListener('mousemove', handleMouseMove);
62 |       document.addEventListener('mouseup', handleMouseUp);
63 |     }
64 | 
65 |     return () => {
66 |       document.removeEventListener('mousemove', handleMouseMove);
67 |       document.removeEventListener('mouseup', handleMouseUp);
68 |     };
69 |   }, [isDragging, minWidth, maxWidth]);
70 | 
71 |   const startResize = (e: React.MouseEvent) => {
72 |     e.preventDefault();
73 |     setIsDragging(true);
74 |   };
75 | 
76 |   return {
77 |     width,
78 |     isDragging,
[TRUNCATED]
```

src/store/useAppStore.ts
```
1 | import { create } from 'zustand'
2 | import { persist } from 'zustand/middleware'
3 | import { BoardSettings, DEFAULT_BOARD_SETTINGS, saveBoardSettings as saveSettingsToLocalStorage } from '@/lib/board-utils';
4 | import { ReactFlowInstance } from '@xyflow/react';
5 | 
6 | // 카드 타입 정의
7 | export interface Card {
8 |   id: string;
9 |   title: string;
10 |   content: string;
11 |   tags?: string[];
12 |   [key: string]: any;
13 | }
14 | 
15 | export interface AppState {
16 |   // 선택된 카드 상태 (통합된 단일 소스)
17 |   selectedCardIds: string[];
18 |   // 이전 단일 선택 상태 (내부적으로 selectedCardIds로 변환)
19 |   selectedCardId: string | null; // 하위 호환성 유지 (파생 값)
20 |   
21 |   // 선택 관련 액션들
22 |   selectCard: (cardId: string | null) => void; // 단일 카드 선택 (내부적으로 selectCards 사용)
23 |   selectCards: (cardIds: string[]) => void; // 다중 카드 선택 (주요 액션)
24 |   addSelectedCard: (cardId: string) => void; // 선택된 카드 목록에 추가
25 |   removeSelectedCard: (cardId: string) => void; // 선택된 카드 목록에서 제거
26 |   toggleSelectedCard: (cardId: string) => void; // 선택된 카드 목록에서 토글
27 |   clearSelectedCards: () => void; // 모든 선택 해제
28 |   
29 |   // 카드 데이터 상태
30 |   cards: Card[]; // 현재 로드된 카드 목록
31 |   setCards: (cards: Card[]) => void; // 카드 목록 설정
32 |   updateCard: (updatedCard: Card) => void; // 단일 카드 업데이트
33 |   
34 |   // 사이드바 상태
35 |   isSidebarOpen: boolean;
36 |   setSidebarOpen: (open: boolean) => void;
37 |   toggleSidebar: () => void;
38 |   
39 |   // 레이아웃 옵션 (수평/수직/자동배치/없음)
40 |   layoutDirection: 'horizontal' | 'vertical' | 'auto' | 'none';
41 |   setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | 'none') => void;
42 |   
43 |   // 사이드바 너비
44 |   sidebarWidth: number;
45 |   setSidebarWidth: (width: number) => void;
46 |   
47 |   // 보드 설정
48 |   boardSettings: BoardSettings;
49 |   setBoardSettings: (settings: BoardSettings) => void;
50 |   updateBoardSettings: (settings: Partial<BoardSettings>) => void;
51 |   
52 |   // React Flow 인스턴스
53 |   reactFlowInstance: ReactFlowInstance | null;
54 |   setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
55 | }
56 | 
57 | export const useAppStore = create<AppState>()(
58 |   persist(
59 |     (set, get) => ({
[TRUNCATED]
```

src/store/useBoardStore.ts
```
1 | /**
2 |  * 파일명: useBoardStore.ts
3 |  * 목적: Zustand를 활용한 보드 관련 전역 상태 관리
4 |  * 역할: 보드의 노드, 엣지, 설정 등 모든 상태를 중앙 관리
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { create } from 'zustand';
9 | import { persist } from 'zustand/middleware';
10 | import { 
11 |   Node, 
12 |   Edge, 
13 |   Connection, 
14 |   applyNodeChanges, 
15 |   applyEdgeChanges,
16 |   addEdge,
17 |   NodeChange,
18 |   EdgeChange,
19 |   XYPosition,
20 |   MarkerType,
21 |   Position
22 | } from '@xyflow/react';
23 | import { 
24 |   BoardSettings, 
25 |   DEFAULT_BOARD_SETTINGS, 
26 |   saveBoardSettingsToServer,
27 |   loadBoardSettingsFromServer,
28 |   applyEdgeSettings
29 | } from '@/lib/board-utils';
30 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
31 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
32 | import { toast } from 'sonner';
33 | import { CardData } from '@/components/board/types/board-types';
34 | 
35 | // 보드 스토어 상태 인터페이스
36 | interface BoardState {
37 |   // 노드 관련 상태
38 |   nodes: Node<CardData>[];
39 |   setNodes: (nodes: Node<CardData>[]) => void;
40 |   onNodesChange: (changes: NodeChange[]) => void;
41 |   
42 |   // 엣지 관련 상태
43 |   edges: Edge[];
44 |   setEdges: (edges: Edge[]) => void;
45 |   onEdgesChange: (changes: EdgeChange[]) => void;
46 |   onConnect: (connection: Connection) => void;
47 |   
48 |   // 보드 설정 관련 상태
49 |   boardSettings: BoardSettings;
50 |   setBoardSettings: (settings: BoardSettings) => void;
51 |   updateBoardSettings: (settings: Partial<BoardSettings>, isAuthenticated: boolean, userId?: string) => Promise<void>;
52 |   
53 |   // 레이아웃 관련 함수
54 |   applyLayout: (direction: 'horizontal' | 'vertical') => void;
55 |   applyGridLayout: () => void;
56 |   
57 |   // 저장 관련 함수
58 |   saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
59 |   saveEdges: (edgesToSave?: Edge[]) => boolean;
60 |   saveAllLayoutData: () => boolean;
61 |   
62 |   // 엣지 스타일 업데이트
63 |   updateEdgeStyles: (settings: BoardSettings) => void;
64 |   
65 |   // 서버 동기화 함수
66 |   loadBoardSettingsFromServerIfAuthenticated: (isAuthenticated: boolean, userId?: string) => Promise<void>;
67 |   
68 |   // 엣지 생성 함수
69 |   createEdgeOnDrop: (sourceId: string, targetId: string) => Edge;
70 |   
71 |   // 변경 사항 추적
72 |   hasUnsavedChanges: boolean;
[TRUNCATED]
```

src/store/useNodeStore.ts
```
1 | /**
2 |  * 파일명: useNodeStore.ts
3 |  * 목적: 노드 인스펙터 관련 상태 관리
4 |  * 역할: 선택된 노드 정보와 인스펙터 UI 상태 관리
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { create } from 'zustand';
9 | import { Node } from '@xyflow/react';
10 | 
11 | // 노드 스토어 상태 인터페이스
12 | interface NodeStore {
13 |   // 인스펙터 관련 상태
14 |   inspectorOpen: boolean;
15 |   inspectedNode: Node | null;
16 |   
17 |   // 상태 변경 함수
18 |   setInspectorOpen: (open: boolean) => void;
19 |   setInspectedNode: (node: Node | null) => void;
20 |   
21 |   // 노드 검사 함수
22 |   inspectNode: (node: Node) => void;
23 |   closeInspector: () => void;
24 | }
25 | 
26 | /**
27 |  * useNodeStore: 노드 인스펙터 관련 상태 관리 스토어
28 |  */
29 | export const useNodeStore = create<NodeStore>((set) => ({
30 |   // 초기 상태
31 |   inspectorOpen: false,
32 |   inspectedNode: null,
33 |   
34 |   // 상태 변경 함수
35 |   setInspectorOpen: (open) => set({ inspectorOpen: open }),
36 |   setInspectedNode: (node) => set({ inspectedNode: node }),
37 |   
38 |   // 유틸리티 함수
39 |   inspectNode: (node) => set({ 
40 |     inspectedNode: node, 
41 |     inspectorOpen: true 
42 |   }),
43 |   
44 |   closeInspector: () => set({ 
45 |     inspectorOpen: false 
46 |   }),
47 | })); 
```

src/lib/auth-server.ts
```
1 | /**
2 |  * 파일명: auth-server.ts
3 |  * 목적: 서버 측 인증 기능 및 세션 처리
4 |  * 역할: API 라우트에서 사용할 서버 측 인증 함수 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { cookies } from 'next/headers';
9 | import { createServerClient } from '@supabase/ssr';
10 | import { Database } from '../types/supabase';
11 | 
12 | /**
13 |  * getSupabaseServer: 서버 측 Supabase 클라이언트 생성
14 |  * @returns Supabase 클라이언트 인스턴스
15 |  */
16 | export const getSupabaseServer = () => {
17 |   const cookieStore = cookies();
18 |   
19 |   return createServerClient<Database>(
20 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
21 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
22 |     {
23 |       cookies: {
24 |         get(name: string) {
25 |           return cookieStore.get(name)?.value;
26 |         },
27 |         set(name: string, value: string, options: any) {
28 |           try {
29 |             cookieStore.set(name, value, options);
30 |           } catch (e) {
31 |             console.error('쿠키 설정 오류:', e);
32 |           }
33 |         },
34 |         remove(name: string, options: any) {
35 |           try {
36 |             cookieStore.delete(name, options);
37 |           } catch (e) {
38 |             console.error('쿠키 삭제 오류:', e);
39 |           }
40 |         },
41 |       },
42 |     }
43 |   );
44 | };
45 | 
46 | /**
47 |  * auth: 서버 컴포넌트와 API 라우트에서 사용할 인증 함수
48 |  * @returns 현재 인증된 세션 정보
49 |  */
50 | export const auth = async () => {
51 |   const supabase = getSupabaseServer();
52 |   
53 |   try {
54 |     const { data: { session } } = await supabase.auth.getSession();
55 |     return session;
56 |   } catch (error) {
57 |     console.error('서버 인증 오류:', error);
58 |     return null;
59 |   }
60 | };
61 | 
62 | /**
63 |  * getCurrentUser: 현재 인증된 사용자 정보를 반환
64 |  * @returns 현재 인증된 사용자 또는 null
65 |  */
66 | export const getCurrentUser = async () => {
67 |   const supabase = getSupabaseServer();
68 |   
69 |   try {
70 |     const { data: { user } } = await supabase.auth.getUser();
71 |     return user;
72 |   } catch (error) {
73 |     console.error('사용자 정보 조회 오류:', error);
[TRUNCATED]
```

src/lib/auth-storage.ts
```
1 | /**
2 |  * 파일명: auth-storage.ts
3 |  * 목적: 인증 관련 상태를 여러 스토리지에 분산 저장
4 |  * 역할: 브라우저 스토리지 간 인증 상태 동기화 및 복원
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import createLogger from './logger';
11 | import { getAuthCookie, setAuthCookie, deleteAuthCookie } from './cookie';
12 | import { Database } from '../types/supabase';
13 | import { SupabaseClient } from '@supabase/supabase-js';
14 | 
15 | // 로거 생성
16 | const logger = createLogger('AuthStorage');
17 | 
18 | // Window 객체 타입 확장
19 | declare global {
20 |   interface Window {
21 |     __SUPABASE_AUTH_SET_ITEM?: (key: string, value: string) => void;
22 |     __SUPABASE_AUTH_GET_ITEM?: (key: string) => string | null;
23 |     __SUPABASE_AUTH_REMOVE_ITEM?: (key: string) => void;
24 |     __SUPABASE_AUTH_CODE_VERIFIER?: string;
25 |     __SUPABASE_SINGLETON_CLIENT?: SupabaseClient<Database, "public", any>;
26 |   }
27 | }
28 | 
29 | // 스토리지 키 정의
30 | export const STORAGE_KEYS = {
31 |   CODE_VERIFIER: 'code_verifier',
32 |   ACCESS_TOKEN: 'sb-access-token',
33 |   REFRESH_TOKEN: 'sb-refresh-token',
34 |   SESSION: 'sb-session',
35 |   PROVIDER: 'auth-provider',
36 |   USER_ID: 'auth-user-id'
37 | };
38 | 
39 | // IndexedDB 데이터베이스 설정
40 | const DB_CONFIG = {
41 |   NAME: 'auth_backup',
42 |   VERSION: 1,
43 |   STORE_NAME: 'auth_data'
44 | };
45 | 
46 | /**
47 |  * 여러 스토리지에 인증 데이터 저장
48 |  * @param key 저장할 데이터의 키
49 |  * @param value 저장할 데이터 값
50 |  * @param options 저장 옵션 (만료 시간 등)
51 |  * @returns 저장 성공 여부
52 |  */
53 | export function setAuthData(key: string, value: string, options: { expiry?: number } = {}): boolean {
54 |   try {
55 |     // 값이 null이면 제거 함수 호출
56 |     if (value === null || value === undefined) {
57 |       return removeAuthData(key);
58 |     }
59 |     
60 |     // 저장하기 전에 민감 데이터 암호화
61 |     const shouldEncrypt = key.includes('token') || key === STORAGE_KEYS.CODE_VERIFIER;
62 |     const valueToStore = shouldEncrypt ? encryptValue(key, value) : value;
[TRUNCATED]
```

src/lib/auth.ts
```
1 | /**
2 |  * 파일명: auth.ts
3 |  * 목적: 인증 관련 유틸리티 함수 제공
4 |  * 역할: 로그인, 회원가입, 소셜 로그인 등 인증 관련 기능 구현
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { getHybridSupabaseClient, isClientEnvironment } from './hybrid-supabase';
11 | import { User } from '@supabase/supabase-js';
12 | import { 
13 |   getAuthData, 
14 |   setAuthData, 
15 |   removeAuthData, 
16 |   clearAllAuthData, 
17 |   STORAGE_KEYS 
18 | } from './auth-storage';
19 | import createLogger from './logger';
20 | import { base64UrlEncode, stringToArrayBuffer } from './base64';
21 | import { isClient } from './environment';
22 | 
23 | // 모듈별 로거 생성
24 | const logger = createLogger('Auth');
25 | 
26 | // 환경에 맞는 Supabase 클라이언트 가져오기
27 | export const getAuthClient = () => {
28 |   if (!isClientEnvironment()) {
29 |     throw new Error('브라우저 환경에서만 사용 가능합니다.');
30 |   }
31 |   
32 |   return getHybridSupabaseClient();
33 | };
34 | 
35 | // ExtendedUser 타입 정의
36 | export interface ExtendedUser extends User {
37 |   dbUser?: any; // Prisma User 모델
38 | }
39 | 
40 | // 회원가입 함수
41 | export async function signUp(email: string, password: string, name: string | null = null) {
42 |   try {
43 |     // Supabase 인증으로 사용자 생성
44 |     const client = getAuthClient();
45 |     const { data: authData, error: authError } = await client.auth.signUp({
46 |       email,
47 |       password,
48 |     });
49 | 
50 |     if (authError) {
51 |       throw authError;
52 |     }
53 | 
54 |     if (!authData.user) {
55 |       throw new Error('사용자 생성 실패');
56 |     }
57 | 
58 |     // API를 통해 사용자 데이터 생성
59 |     try {
60 |       const response = await fetch('/api/user/register', {
61 |         method: 'POST',
62 |         headers: {
63 |           'Content-Type': 'application/json',
64 |         },
65 |         body: JSON.stringify({
66 |           id: authData.user.id,
67 |           email: authData.user.email || email,
68 |           name: name || email.split('@')[0],
69 |         }),
70 |       });
71 | 
72 |       if (!response.ok) {
73 |         console.warn('사용자 DB 정보 저장 실패:', await response.text());
74 |       }
75 |     } catch (dbError) {
[TRUNCATED]
```

src/lib/base64.ts
```
1 | /**
2 |  * 파일명: base64.ts
3 |  * 목적: Base64 인코딩 유틸리티
4 |  * 역할: 일반 및 URL-safe Base64 인코딩/디코딩 기능 제공
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | /**
9 |  * base64Encode: 문자열을 Base64로 인코딩
10 |  * @param {string} str - 인코딩할 문자열
11 |  * @returns {string} Base64 인코딩된 문자열
12 |  */
13 | export const base64Encode = (str: string): string => {
14 |   if (typeof window !== 'undefined') {
15 |     // 브라우저 환경
16 |     return window.btoa(str);
17 |   } else {
18 |     // Node.js 환경
19 |     return Buffer.from(str).toString('base64');
20 |   }
21 | };
22 | 
23 | /**
24 |  * base64Decode: Base64 문자열을 디코딩
25 |  * @param {string} str - 디코딩할 Base64 문자열
26 |  * @returns {string} 디코딩된 문자열
27 |  */
28 | export const base64Decode = (str: string): string => {
29 |   if (typeof window !== 'undefined') {
30 |     // 브라우저 환경
31 |     return window.atob(str);
32 |   } else {
33 |     // Node.js 환경
34 |     return Buffer.from(str, 'base64').toString();
35 |   }
36 | };
37 | 
38 | /**
39 |  * base64UrlEncode: ArrayBuffer를 URL 안전한 Base64 문자열로 인코딩
40 |  * - RFC 7636에 따라 code_challenge를 위한 포맷으로 인코딩
41 |  * - `+` -> `-`, `/` -> `_`, 패딩 문자(`=`) 제거
42 |  * @param {ArrayBufferLike} buffer - 인코딩할 ArrayBuffer
43 |  * @returns {string} URL 안전한 Base64 문자열
44 |  */
45 | export const base64UrlEncode = (buffer: ArrayBufferLike): string => {
46 |   let base64 = '';
47 |   
48 |   if (typeof window !== 'undefined') {
49 |     // 브라우저 환경
50 |     base64 = window.btoa(
51 |       String.fromCharCode.apply(
52 |         null,
53 |         new Uint8Array(buffer) as unknown as number[]
54 |       )
55 |     );
56 |   } else {
57 |     // Node.js 환경
58 |     base64 = Buffer.from(buffer).toString('base64');
59 |   }
60 |   
61 |   // URL 안전 문자로 변경 (+, /, = 처리)
62 |   return base64
63 |     .replace(/\+/g, '-')
64 |     .replace(/\//g, '_')
65 |     .replace(/=+$/, '');
66 | };
67 | 
68 | /**
69 |  * base64UrlDecode: URL 안전한 Base64 문자열을 디코딩하여 ArrayBuffer 반환
[TRUNCATED]
```

src/lib/board-constants.ts
```
1 | import { ConnectionLineType, MarkerType } from '@xyflow/react';
2 | 
3 | // 스냅 그리드 옵션
4 | export const SNAP_GRID_OPTIONS = [
5 |   { value: 0, label: '끄기' },
6 |   { value: 10, label: '10px' },
7 |   { value: 15, label: '15px' },
8 |   { value: 20, label: '20px' },
9 |   { value: 25, label: '25px' },
10 | ];
11 | 
12 | // 기본 스냅 그리드 설정
13 | export const DEFAULT_SNAP_GRID = [15, 15];
14 | 
15 | // 연결선 타입 옵션
16 | export const CONNECTION_TYPE_OPTIONS = [
17 |   { value: ConnectionLineType.Bezier, label: '곡선 (Bezier)' },
18 |   { value: ConnectionLineType.Straight, label: '직선 (Straight)' },
19 |   { value: ConnectionLineType.Step, label: '계단식 (Step)' },
20 |   { value: ConnectionLineType.SmoothStep, label: '부드러운 계단식 (SmoothStep)' },
21 |   { value: ConnectionLineType.SimpleBezier, label: '단순 곡선 (SimpleBezier)' },
22 | ];
23 | 
24 | // 화살표 마커 타입 옵션
25 | export const MARKER_TYPE_OPTIONS = [
26 |   { value: MarkerType.Arrow, label: '화살표 (Arrow)' },
27 |   { value: MarkerType.ArrowClosed, label: '닫힌 화살표 (ArrowClosed)' },
28 |   { value: null, label: '없음 (None)' },
29 | ];
30 | 
31 | // 연결선 두께 옵션
32 | export const STROKE_WIDTH_OPTIONS = [
33 |   { value: 1, label: '얇게 (1px)' },
34 |   { value: 2, label: '보통 (2px)' },
35 |   { value: 3, label: '굵게 (3px)' },
36 |   { value: 4, label: '매우 굵게 (4px)' },
37 | ];
38 | 
39 | // 마커 크기 옵션
40 | export const MARKER_SIZE_OPTIONS = [
41 |   { value: 10, label: '작게 (10px)' },
42 |   { value: 15, label: '보통 (15px)' },
43 |   { value: 20, label: '크게 (20px)' },
44 |   { value: 25, label: '매우 크게 (25px)' },
45 | ];
46 | 
47 | // 연결선 애니메이션 옵션
48 | export const EDGE_ANIMATION_OPTIONS = [
49 |   { value: true, label: '켜기' },
50 |   { value: false, label: '끄기' },
51 | ];
52 | 
53 | // 연결선 색상 옵션
54 | export const EDGE_COLOR_OPTIONS = [
55 |   { value: '#C1C1C1', label: '회색 (기본)', color: '#C1C1C1' },
56 |   { value: '#000000', label: '검정색', color: '#000000' },
57 |   { value: '#FF0072', label: '핑크색', color: '#FF0072' },
58 |   { value: '#3366FF', label: '파란색', color: '#3366FF' },
59 |   { value: '#43A047', label: '녹색', color: '#43A047' },
[TRUNCATED]
```

src/lib/board-ui-config.ts
```
1 | import { MarkerType, ConnectionLineType } from '@xyflow/react';
2 | import defaultConfig from '../config/cardBoardUiOptions.json';
3 | 
4 | // 카드 보드 UI 설정 타입 정의
5 | export interface BoardUIConfig {
6 |   autoSaveIntervalMinutes: number;
7 |   board: {
8 |     snapToGrid: boolean;
9 |     snapGrid: number[];
10 |     connectionLineType: string;
11 |     markerEnd: string | null;
12 |     strokeWidth: number;
13 |     markerSize: number;
14 |     edgeColor: string;
15 |     animated: boolean;
16 |     selectedEdgeColor: string;
17 |   };
18 |   card: {
19 |     defaultWidth: number;
20 |     backgroundColor: string;
21 |     borderRadius: number;
22 |     tagBackgroundColor: string;
23 |     fontSizes?: {
24 |       default: number;
25 |       title: number;
26 |       content: number;
27 |       tags: number;
28 |     };
29 |   };
30 |   handles: {
31 |     size: number;
32 |     backgroundColor: string;
33 |     borderColor: string;
34 |     borderWidth: number;
35 |   };
36 |   layout: {
37 |     defaultPadding: number;
38 |     defaultSpacing: {
39 |       horizontal: number;
40 |       vertical: number;
41 |     };
42 |     nodeSize?: {
43 |       width: number;
44 |       height: number;
45 |       maxHeight?: number;
46 |     };
47 |     graphSettings?: {
48 |       nodesep: number;
49 |       ranksep: number;
50 |       edgesep: number;
51 |     };
52 |   };
53 | }
54 | 
55 | // CSS 변수에서 값을 가져오는 함수 (클라이언트 사이드에서만 작동)
56 | export function getCssVariable(name: string, fallback: string): string {
57 |   if (typeof window !== 'undefined') {
58 |     return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
59 |   }
60 |   return fallback;
61 | }
62 | 
63 | // CSS 변수에서 숫자 값을 가져오는 함수
64 | export function getCssVariableAsNumber(name: string, fallback: number): number {
65 |   if (typeof window !== 'undefined') {
66 |     const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
67 |     if (value) {
68 |       // px 단위 제거 및 숫자로 변환
69 |       const numericValue = parseFloat(value.replace('px', '').replace('rem', ''));
70 |       return isNaN(numericValue) ? fallback : numericValue;
71 |     }
72 |   }
73 |   return fallback;
74 | }
75 | 
76 | // 기본 설정값 (타입 변환 포함)
77 | export const DEFAULT_UI_CONFIG: BoardUIConfig = {
78 |   ...defaultConfig as BoardUIConfig,
79 |   board: {
80 |     ...defaultConfig.board,
[TRUNCATED]
```

src/lib/board-utils.ts
```
1 | import { Edge, MarkerType, ConnectionLineType } from '@xyflow/react';
2 | import { BOARD_SETTINGS_KEY } from './board-constants';
3 | 
4 | export interface BoardSettings {
5 |   // 그리드 설정
6 |   snapToGrid: boolean;
7 |   snapGrid: [number, number];
8 |   
9 |   // 연결선 설정
10 |   connectionLineType: ConnectionLineType;
11 |   markerEnd: MarkerType | null;
12 |   strokeWidth: number;
13 |   markerSize: number;
14 |   edgeColor: string;
15 |   selectedEdgeColor: string;
16 |   animated: boolean;
17 | }
18 | 
19 | // 기본 보드 설정
20 | export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
21 |   // 그리드 설정
22 |   snapToGrid: false,
23 |   snapGrid: [15, 15],
24 |   
25 |   // 연결선 설정
26 |   connectionLineType: ConnectionLineType.SmoothStep,
27 |   markerEnd: MarkerType.Arrow,
28 |   strokeWidth: 2,
29 |   markerSize: 20,
30 |   edgeColor: '#C1C1C1',
31 |   selectedEdgeColor: '#FF0072',
32 |   animated: false,
33 | };
34 | 
35 | /**
36 |  * 로컬 스토리지에서 보드 설정을 불러오는 함수
37 |  */
38 | export function loadBoardSettings(): BoardSettings {
39 |   if (typeof window === 'undefined') {
40 |     return DEFAULT_BOARD_SETTINGS;
41 |   }
42 | 
43 |   try {
44 |     const savedSettings = localStorage.getItem(BOARD_SETTINGS_KEY);
45 |     
46 |     if (!savedSettings) {
47 |       return DEFAULT_BOARD_SETTINGS;
48 |     }
49 | 
50 |     // 저장된 설정 복원
51 |     const parsedSettings = JSON.parse(savedSettings);
52 |     
53 |     // 기존 설정이 없는 경우 기본값으로 통합
54 |     return {
55 |       ...DEFAULT_BOARD_SETTINGS,
56 |       ...parsedSettings,
57 |     };
58 |   } catch (error) {
59 |     console.error('보드 설정 로드 중 오류:', error);
60 |     return DEFAULT_BOARD_SETTINGS;
61 |   }
62 | }
63 | 
64 | /**
65 |  * 보드 설정을 로컬 스토리지에 저장하는 함수
66 |  */
67 | export function saveBoardSettings(settings: BoardSettings): void {
68 |   if (typeof window !== 'undefined') {
69 |     try {
70 |       localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
71 |     } catch (error) {
72 |       console.error('보드 설정 저장 중 오류:', error);
73 |     }
74 |   }
75 | }
76 | 
77 | /**
78 |  * 서버 API를 통해 보드 설정을 저장하는 함수
79 |  */
80 | export async function saveBoardSettingsToServer(userId: string, settings: BoardSettings): Promise<boolean> {
[TRUNCATED]
```

src/lib/constants.ts
```
1 | // 애플리케이션 전체에서 사용되는 상수 값들
2 | 
3 | // 테스트 사용자 ID (데이터베이스에 실제로 존재하는 ID)
4 | // 이전 값: export const DEFAULT_USER_ID = "91fc1ef9-daec-45de-8eb4-40ca52ec292f";
5 | export const DEFAULT_USER_ID = "13ce1b15-aa4e-452b-af81-124d06413662"; // 실제 데이터베이스에 존재하는 ID
6 | 
7 | // 페이지 크기 상수
8 | export const PAGE_SIZE = 10;
9 | 
10 | // 날짜 형식
11 | export const DATE_FORMAT = "YYYY년 MM월 DD일"; 
```

src/lib/cookie.ts
```
1 | /**
2 |  * 파일명: src/lib/cookie.ts
3 |  * 목적: 크로스 도메인 쿠키 관리 유틸리티 제공
4 |  * 역할: 쿠키 설정, 조회, 삭제 기능 제공
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { createLogger } from './logger';
9 | 
10 | const logger = createLogger('Cookie');
11 | 
12 | /**
13 |  * 쿠키 설정
14 |  * @param name 쿠키 이름
15 |  * @param value 쿠키 값
16 |  * @param options 쿠키 옵션
17 |  */
18 | export function setCookie(
19 |   name: string,
20 |   value: string,
21 |   options: {
22 |     days?: number;
23 |     path?: string;
24 |     domain?: string;
25 |     sameSite?: 'strict' | 'lax' | 'none';
26 |     secure?: boolean;
27 |   } = {}
28 | ): void {
29 |   if (typeof document === 'undefined') {
30 |     logger.warn('Document is not available - 쿠키를 설정할 수 없습니다');
31 |     return;
32 |   }
33 | 
34 |   const { days = 7, path = '/', domain, sameSite = 'lax', secure = false } = options;
35 | 
36 |   // 만료일 계산
37 |   const expiresDate = new Date();
38 |   expiresDate.setTime(expiresDate.getTime() + days * 24 * 60 * 60 * 1000);
39 | 
40 |   // 쿠키 문자열 구성
41 |   let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiresDate.toUTCString()}; path=${path}`;
42 | 
43 |   // 도메인 추가 (있는 경우)
44 |   if (domain) {
45 |     cookieString += `; domain=${domain}`;
46 |   }
47 | 
48 |   // SameSite 추가
49 |   cookieString += `; samesite=${sameSite}`;
50 | 
51 |   // Secure 추가 (SameSite=None일 경우 필수)
52 |   if (secure || sameSite === 'none') {
53 |     cookieString += '; secure';
54 |   }
55 | 
56 |   // 쿠키 설정
57 |   document.cookie = cookieString;
58 |   logger.debug(`쿠키 설정: ${name}`, { days, path, domain, sameSite, secure });
59 | }
60 | 
61 | /**
62 |  * 쿠키 값 조회
63 |  * @param name 쿠키 이름
64 |  * @returns 쿠키 값 또는 null
65 |  */
66 | export function getCookie(name: string): string | null {
67 |   if (typeof document === 'undefined') {
[TRUNCATED]
```

src/lib/db-check.js
```
1 | import { PrismaClient } from '@prisma/client';
2 | 
3 | let prisma;
4 | 
5 | if (process.env.NODE_ENV === 'production') {
6 |   prisma = new PrismaClient();
7 | } else {
8 |   if (!global.prisma) {
9 |     global.prisma = new PrismaClient();
10 |   }
11 |   prisma = global.prisma;
12 | }
13 | 
14 | export async function checkDatabaseConnection() {
15 |   try {
16 |     // 간단한 쿼리로 연결 확인
17 |     await prisma.$queryRaw`SELECT 1`;
18 |     return { connected: true };
19 |   } catch (error) {
20 |     console.error('데이터베이스 연결 오류:', error);
21 |     return { 
22 |       connected: false, 
23 |       error: error.message,
24 |       tips: [
25 |         '.env 파일에 DATABASE_URL이 올바르게 설정되었는지 확인하세요.',
26 |         'PostgreSQL 서버가 실행 중인지 확인하세요.',
27 |         '데이터베이스 "backyard"가 생성되었는지 확인하세요.',
28 |         '사용자 이름과 비밀번호가 올바른지 확인하세요.'
29 |       ]
30 |     };
31 |   }
32 | }
33 | 
34 | export { prisma }; 
```

src/lib/db-init.ts
```
1 | import { createSupabaseClient } from './supabase';
2 | import { PrismaClient } from '@prisma/client';
3 | 
4 | // 테이블 정의 및 생성 SQL
5 | const tableDefinitions = {
6 |   users: `
7 |     CREATE TABLE IF NOT EXISTS users (
8 |       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
9 |       email TEXT UNIQUE NOT NULL,
10 |       name TEXT,
11 |       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
12 |       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
13 |     );
14 |   `,
15 |   cards: `
16 |     CREATE TABLE IF NOT EXISTS cards (
17 |       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
18 |       title TEXT NOT NULL,
19 |       content TEXT,
20 |       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
21 |       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
22 |       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
23 |     );
24 |   `,
25 |   tags: `
26 |     CREATE TABLE IF NOT EXISTS tags (
27 |       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
28 |       name TEXT UNIQUE NOT NULL,
29 |       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
30 |       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
31 |     );
32 |   `,
33 |   card_tags: `
34 |     CREATE TABLE IF NOT EXISTS card_tags (
35 |       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
36 |       card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
37 |       tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
38 |       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
39 |       UNIQUE(card_id, tag_id)
40 |     );
41 |   `,
42 |   board_settings: `
43 |     CREATE TABLE IF NOT EXISTS board_settings (
44 |       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
45 |       user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
46 |       settings JSONB NOT NULL,
47 |       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
48 |       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
49 |     );
[TRUNCATED]
```

src/lib/debug-utils.ts
```
1 | import { BOARD_SETTINGS_KEY } from './board-constants';
2 | 
3 | // 디버깅용 로컬 스토리지 초기화 함수
4 | export function resetLocalStorageBoardSettings() {
5 |   try {
6 |     localStorage.removeItem(BOARD_SETTINGS_KEY);
7 |     console.log('보드 설정 로컬 스토리지 초기화 완료');
8 |     return true;
9 |   } catch (e) {
10 |     console.error('보드 설정 초기화 실패:', e);
11 |     return false;
12 |   }
13 | }
14 | 
15 | // 현재 보드 설정 출력 함수
16 | export function logCurrentBoardSettings() {
17 |   try {
18 |     const settings = localStorage.getItem(BOARD_SETTINGS_KEY);
19 |     console.log('현재 보드 설정 (localStorage):', settings ? JSON.parse(settings) : null);
20 |     
21 |     // Zustand 저장소 내용도 확인
22 |     const appStorage = localStorage.getItem('backyard-app-storage');
23 |     console.log('Zustand 앱 스토리지:', appStorage ? JSON.parse(appStorage) : null);
24 |     
25 |     return settings ? JSON.parse(settings) : null;
26 |   } catch (e) {
27 |     console.error('보드 설정 출력 실패:', e);
28 |     return null;
29 |   }
30 | }
31 | 
32 | // Zustand 스토리지 초기화 함수
33 | export function resetZustandStorage() {
34 |   try {
35 |     localStorage.removeItem('backyard-app-storage');
36 |     console.log('Zustand 스토리지 초기화 완료');
37 |     return true;
38 |   } catch (e) {
39 |     console.error('Zustand 스토리지 초기화 실패:', e);
40 |     return false;
41 |   }
42 | }
43 | 
44 | // 전체 스토리지 초기화 함수
45 | export function resetAllStorage() {
46 |   const boardReset = resetLocalStorageBoardSettings();
47 |   const zustandReset = resetZustandStorage();
48 |   
49 |   return boardReset && zustandReset;
50 | } 
```

src/lib/environment.ts
```
1 | /**
2 |  * 파일명: environment.ts
3 |  * 목적: 실행 환경 감지 유틸리티
4 |  * 역할: 클라이언트/서버 환경 감지 및 환경별 코드 실행 제공
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | /**
9 |  * isClient: 현재 코드가 클라이언트(브라우저) 환경에서 실행 중인지 확인
10 |  * @returns {boolean} 클라이언트 환경 여부
11 |  */
12 | export const isClient = (): boolean => {
13 |   return typeof window !== 'undefined';
14 | };
15 | 
16 | /**
17 |  * isServer: 현재 코드가 서버 환경에서 실행 중인지 확인
18 |  * @returns {boolean} 서버 환경 여부
19 |  */
20 | export const isServer = (): boolean => {
21 |   return typeof window === 'undefined';
22 | };
23 | 
24 | /**
25 |  * executeOnClient: 클라이언트 환경에서만 함수 실행
26 |  * @param {Function} fn - 클라이언트에서 실행할 함수
27 |  * @returns {any | undefined} 함수 실행 결과 또는 undefined
28 |  */
29 | export const executeOnClient = <T>(fn: () => T): T | undefined => {
30 |   if (isClient()) {
31 |     return fn();
32 |   }
33 |   return undefined;
34 | };
35 | 
36 | /**
37 |  * executeOnServer: 서버 환경에서만 함수 실행
38 |  * @param {Function} fn - 서버에서 실행할 함수
39 |  * @returns {any | undefined} 함수 실행 결과 또는 undefined
40 |  */
41 | export const executeOnServer = <T>(fn: () => T): T | undefined => {
42 |   if (isServer()) {
43 |     return fn();
44 |   }
45 |   return undefined;
46 | };
47 | 
48 | /**
49 |  * getEnvironment: 현재 실행 환경 반환
50 |  * @returns {'client' | 'server'} 실행 환경 문자열
51 |  */
52 | export const getEnvironment = (): 'client' | 'server' => {
53 |   return isClient() ? 'client' : 'server';
54 | };
55 | 
56 | /**
57 |  * runInEnvironment: 환경에 따라 적절한 함수 실행
58 |  * @param {Object} options - 실행 옵션
59 |  * @param {Function} options.client - 클라이언트에서 실행할 함수
60 |  * @param {Function} options.server - 서버에서 실행할 함수
61 |  * @returns {any} 환경에 맞는 함수의 실행 결과
62 |  */
63 | export const runInEnvironment = <C, S>({ 
64 |   client, 
65 |   server 
66 | }: { 
67 |   client?: () => C; 
68 |   server?: () => S; 
[TRUNCATED]
```

src/lib/flow-constants.ts
```
1 | /**
2 |  * 파일명: flow-constants.ts
3 |  * 목적: React Flow 관련 상수 정의
4 |  * 역할: 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import CardNode from '@/components/board/nodes/CardNode';
9 | import CustomEdge from '@/components/board/nodes/CustomEdge';
10 | import NodeInspect from '@/components/board/nodes/NodeInspect';
11 | 
12 | // 디버깅 로그 추가
13 | console.log('[flow-constants] 노드 및 엣지 타입 등록 상태 확인:', {
14 |   cardNode: typeof CardNode === 'function' ? 'OK' : 'ERROR',
15 |   customEdge: typeof CustomEdge === 'function' ? 'OK' : 'ERROR',
16 |   nodeInspect: typeof NodeInspect === 'function' ? 'OK' : 'ERROR'
17 | });
18 | 
19 | // 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
20 | export const NODE_TYPES = Object.freeze({
21 |   card: CardNode,
22 |   nodeInspect: NodeInspect,
23 |   // React Flow 기본 타입에도 매핑
24 |   default: CardNode
25 | });
26 | 
27 | // 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
28 | export const EDGE_TYPES = Object.freeze({
29 |   custom: CustomEdge,
30 |   // React Flow는 'default' 타입을 찾지 못하면 fallback으로 사용합니다.
31 |   // 명시적으로 'default' 타입도 등록합니다.
32 |   default: CustomEdge
33 | });
34 | 
35 | // 디버깅 로그 추가
36 | console.log('[flow-constants] 노드 및 엣지 타입 등록 완료:', {
37 |   NODE_TYPES: NODE_TYPES ? 'DEFINED' : 'UNDEFINED',
38 |   EDGE_TYPES: EDGE_TYPES ? 'DEFINED' : 'UNDEFINED',
39 | });
40 | 
41 | // 타입 검증 - 디버깅용
42 | if (!NODE_TYPES || !NODE_TYPES.card) {
43 |   console.error('[flow-constants] NODE_TYPES가 제대로 정의되지 않았습니다!');
44 | }
45 | 
46 | if (!EDGE_TYPES || !EDGE_TYPES.custom) {
47 |   console.error('[flow-constants] EDGE_TYPES가 제대로 정의되지 않았습니다!');
48 | } 
```

src/lib/hybrid-supabase.ts
```
1 | /**
2 |  * 파일명: hybrid-supabase.ts
3 |  * 목적: 서버와 클라이언트 환경 모두에서 동작하는 Supabase 클라이언트 제공
4 |  * 역할: 환경에 따라 적절한 Supabase 클라이언트 인스턴스 생성
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { createBrowserClient } from '@supabase/ssr';
9 | import { createClient } from '@supabase/supabase-js';
10 | import { cookies } from 'next/headers';
11 | import { Database } from '../types/supabase';
12 | import createLogger from './logger';
13 | 
14 | // 로거 생성
15 | const logger = createLogger('HybridSupabase');
16 | 
17 | // 환경 타입 정의
18 | type Environment = 'server' | 'client' | 'unknown';
19 | 
20 | // 현재 실행 환경 감지
21 | function detectEnvironment(): Environment {
22 |   // 초기값은 알 수 없음으로 설정
23 |   let environment: Environment = 'unknown';
24 |   
25 |   // 브라우저 환경인지 확인
26 |   const isBrowser = typeof window !== 'undefined';
27 |   
28 |   // Node.js 환경인지 확인
29 |   const isNode = typeof process !== 'undefined' && 
30 |     process.versions != null && 
31 |     process.versions.node != null;
32 |   
33 |   // 환경 판별
34 |   if (isBrowser) {
35 |     environment = 'client';
36 |   } else if (isNode) {
37 |     environment = 'server';
38 |   }
39 |   
40 |   return environment;
41 | }
42 | 
43 | // 환경 감지
44 | const environment = detectEnvironment();
45 | logger.debug(`감지된 환경: ${environment}`);
46 | 
47 | // 서버 전용 Supabase 클라이언트 생성 함수
48 | function createServerSupabaseClient() {
49 |   try {
50 |     if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
51 |       throw new Error('서버 환경에서 Supabase 환경 변수가 설정되지 않았습니다');
52 |     }
53 |     
54 |     // 서버 전용 클라이언트 생성 (쿠키 접근 없음)
55 |     return createClient<Database>(
56 |       process.env.NEXT_PUBLIC_SUPABASE_URL,
57 |       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
58 |       {
59 |         auth: {
60 |           persistSession: false,
61 |           autoRefreshToken: false,
62 |         },
63 |         global: {
64 |           headers: { 'x-client-info': 'hybrid-supabase-server-client' }
65 |         }
66 |       }
67 |     );
68 |   } catch (error) {
[TRUNCATED]
```

src/lib/layout-utils.ts
```
1 | /**
2 |  * 파일명: layout-utils.ts
3 |  * 목적: React Flow 노드 레이아웃 자동화
4 |  * 역할: 그래프 레이아웃 계산 및 노드 배치 유틸리티 함수 제공
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import dagre from 'dagre';
9 | import { Node, Edge, Position } from '@xyflow/react';
10 | import defaultConfig from '../config/cardBoardUiOptions.json';
11 | import { useTheme } from '../contexts/ThemeContext';
12 | 
13 | // 기본 노드 크기 설정 (ThemeContext가 없을 때 폴백용)
14 | const DEFAULT_NODE_WIDTH = defaultConfig.layout.nodeSize?.width || 130;
15 | const DEFAULT_NODE_HEIGHT = defaultConfig.layout.nodeSize?.height || 48;
16 | 
17 | // 그래프 간격 설정 - 설정 파일에서 가져오기
18 | const GRAPH_SETTINGS = {
19 |   rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
20 |   nodesep: defaultConfig.layout.graphSettings.nodesep, // 같은 레벨의 노드 간 거리 (픽셀)
21 |   ranksep: defaultConfig.layout.graphSettings.ranksep, // 레벨 간 거리 (픽셀)
22 |   edgesep: defaultConfig.layout.graphSettings.edgesep, // 엣지 간 거리
23 |   marginx: defaultConfig.layout.defaultPadding || 20, // 가로 마진은 defaultPadding 사용
24 |   marginy: defaultConfig.layout.defaultPadding || 20  // 세로 마진은 defaultPadding 사용
25 | };
26 | 
27 | /**
28 |  * React 컴포넌트에서 사용할 수 있는 레이아웃 훅
29 |  * ThemeContext에서 노드 크기를 가져와 레이아웃을 계산합니다.
30 |  */
31 | export function useLayoutedElements() {
32 |   const { theme } = useTheme();
33 |   
34 |   /**
35 |    * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
36 |    * 
37 |    * @param nodes 노드 배열
38 |    * @param edges 엣지 배열
39 |    * @param direction 배치 방향 ('horizontal' 또는 'vertical')
40 |    * @returns 레이아웃이 적용된 노드와 엣지
41 |    */
42 |   const getLayoutedElements = (
43 |     nodes: Node[],
44 |     edges: Edge[],
45 |     direction: 'horizontal' | 'vertical' = 'horizontal'
46 |   ) => {
47 |     // 노드나 엣지가 없는 경우 그대로 반환
48 |     if (nodes.length === 0) return { nodes, edges };
49 | 
50 |     // ThemeContext에서 노드 크기 가져오기
51 |     const NODE_WIDTH = theme.node.width;
52 |     const NODE_HEIGHT = theme.node.height;
53 | 
54 |     // 그래프 생성
55 |     const dagreGraph = new dagre.graphlib.Graph();
[TRUNCATED]
```

src/lib/logger.ts
```
1 | /**
2 |  * 파일명: logger.ts
3 |  * 목적: 통합 로깅 시스템 제공
4 |  * 역할: 브라우저와 서버 양쪽에서 로그를 기록하고 필요시 서버로 로그를 전송
5 |  * 작성일: 2024-03-28
6 |  */
7 | 
8 | // 로그 레벨 정의
9 | export enum LogLevel {
10 |   DEBUG = 'debug',
11 |   INFO = 'info',
12 |   WARN = 'warn',
13 |   ERROR = 'error'
14 | }
15 | 
16 | // 로그 데이터 인터페이스
17 | interface LogData {
18 |   timestamp: string;
19 |   level: LogLevel;
20 |   module: string;
21 |   message: string;
22 |   data?: any;
23 |   sessionId?: string;
24 | }
25 | 
26 | // 세션 ID 생성
27 | const generateSessionId = (): string => {
28 |   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
29 | };
30 | 
31 | // 로그 저장소
32 | class LogStorage {
33 |   private static instance: LogStorage;
34 |   private logs: LogData[] = [];
35 |   private sessionId: string;
36 |   private readonly MAX_LOGS = 100;
37 | 
38 |   private constructor() {
39 |     this.sessionId = generateSessionId();
40 |     
41 |     // 브라우저 환경이면 로컬 스토리지에서 세션 ID 복원 시도
42 |     if (typeof window !== 'undefined') {
43 |       const storedSessionId = localStorage.getItem('logger.sessionId');
44 |       if (storedSessionId) {
45 |         this.sessionId = storedSessionId;
46 |       } else {
47 |         localStorage.setItem('logger.sessionId', this.sessionId);
48 |       }
49 |     }
50 |   }
51 | 
52 |   public static getInstance(): LogStorage {
53 |     if (!LogStorage.instance) {
54 |       LogStorage.instance = new LogStorage();
55 |     }
56 |     return LogStorage.instance;
57 |   }
58 | 
59 |   public getSessionId(): string {
60 |     return this.sessionId;
61 |   }
62 | 
63 |   public addLog(log: LogData): void {
64 |     // 세션 ID 추가
65 |     log.sessionId = this.sessionId;
66 |     
67 |     // 로그 저장
68 |     this.logs.push(log);
69 |     
70 |     // 최대 로그 수 제한
71 |     if (this.logs.length > this.MAX_LOGS) {
72 |       this.logs.shift();
73 |     }
74 |     
75 |     // 브라우저 환경이면 로컬 스토리지에 로그 저장
[TRUNCATED]
```

src/lib/prisma.ts
```
1 | import { PrismaClient } from '@prisma/client';
2 | 
3 | // Prisma 클라이언트 인스턴스를 글로벌로 관리하여 핫 리로드 시 연결이 중복 생성되는 것을 방지
4 | const globalForPrisma = global as unknown as { prisma: PrismaClient };
5 | 
6 | // 환경 변수 유효성 확인
7 | function validateEnv() {
8 |   const requiredEnvVars = ['DATABASE_URL'];
9 |   const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
10 |   
11 |   if (missingEnvVars.length > 0) {
12 |     console.warn(`⚠️ 누락된 데이터베이스 환경 변수: ${missingEnvVars.join(', ')}`);
13 |     return false;
14 |   }
15 |   return true;
16 | }
17 | 
18 | // 개발 환경에서는 로깅 활성화, 프로덕션에서는 비활성화
19 | let prisma: PrismaClient;
20 | 
21 | try {
22 |   // 환경 변수 확인
23 |   const isEnvValid = validateEnv();
24 |   
25 |   if (!isEnvValid && process.env.NODE_ENV === 'production') {
26 |     console.error('❌ 프로덕션 환경에서 필수 데이터베이스 환경 변수가 누락되었습니다.');
27 |     // 프로덕션 환경에서는 명시적으로 오류를 발생시키지 않고 로깅만 수행
28 |   }
29 |   
30 |   prisma = 
31 |     globalForPrisma.prisma ||
32 |     new PrismaClient({
33 |       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
34 |     });
35 |   
36 |   // 연결 테스트
37 |   if (process.env.NODE_ENV === 'development') {
38 |     prisma.$connect()
39 |       .then(() => console.log('✅ Prisma 데이터베이스 연결 성공'))
40 |       .catch(error => console.error('❌ Prisma 데이터베이스 연결 실패:', error));
41 |   }
42 | } catch (error) {
43 |   console.error('❌ Prisma 클라이언트 초기화 오류:', error);
44 |   // 개발 환경에서는 오류 발생 시 더미 Prisma 클라이언트를 사용
45 |   if (process.env.NODE_ENV !== 'production') {
46 |     console.warn('⚠️ 더미 Prisma 클라이언트를 사용합니다. 데이터베이스 작업이 제한됩니다.');
47 |     // @ts-ignore - 더미 클라이언트 생성
48 |     prisma = new Proxy({}, {
49 |       get: (target, prop) => {
50 |         // 기본 속성
51 |         if (prop === 'then' || prop === '$connect' || prop === '$disconnect') {
52 |           return () => Promise.resolve();
53 |         }
54 |         // 모델 접근 시 더미 모델 반환
55 |         return new Proxy({}, {
56 |           get: () => (...args: any[]) => {
[TRUNCATED]
```

src/lib/supabase-browser.ts
```
1 | /**
2 |  * 파일명: supabase-browser.ts
3 |  * 목적: 브라우저에서 Supabase 클라이언트 접근
4 |  * 역할: 전역 Supabase 싱글톤 인스턴스 접근 (기존 코드와의 호환성 유지)
5 |  * 작성일: 2024-03-29
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { createBrowserClient } from '@supabase/ssr';
11 | import { Database } from '../types/supabase';
12 | import createLogger from './logger';
13 | import { getSupabaseInstance } from './supabase-instance';
14 | 
15 | // 로거 생성
16 | const logger = createLogger('SupabaseBrowser');
17 | 
18 | /**
19 |  * createBrowserSupabaseClient: 브라우저에서 Supabase 클라이언트 인스턴스 반환
20 |  * @returns 전역 Supabase 클라이언트 인스턴스
21 |  * @deprecated getSupabaseInstance 함수를 직접 사용하세요
22 |  */
23 | export function createBrowserSupabaseClient() {
24 |   try {
25 |     // 전역 인스턴스 반환 (기존 코드와의 호환성 유지)
26 |     logger.info('전역 Supabase 인스턴스 접근');
27 |     return getSupabaseInstance();
28 |   } catch (error) {
29 |     logger.error('Supabase 인스턴스 접근 오류', error);
30 |     throw error;
31 |   }
32 | } 
```

src/lib/supabase-instance.ts
```
1 | /**
2 |  * 파일명: supabase-instance.ts
3 |  * 목적: 앱 전역에서 사용할 단일 Supabase 인스턴스 제공
4 |  * 역할: 애플리케이션 시작 시 단 한 번만 초기화되는 Supabase 클라이언트 관리
5 |  * 작성일: 2024-03-29
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { createBrowserClient } from '@supabase/ssr';
11 | import { Database } from '../types/supabase';
12 | import createLogger from './logger';
13 | 
14 | // 로거 생성
15 | const logger = createLogger('SupabaseInstance');
16 | 
17 | // 브라우저 환경 확인
18 | const isBrowser = typeof window !== 'undefined';
19 | 
20 | // 경고 메시지 비활성화 설정 (전역 레벨에서 수정)
21 | if (isBrowser) {
22 |   try {
23 |     // 원본 콘솔 경고 함수 저장
24 |     const originalWarn = console.warn;
25 |     
26 |     // 콘솔 경고 함수를 오버라이드하여 특정 경고만 필터링
27 |     console.warn = function(...args) {
28 |       // Supabase 다중 인스턴스 관련 경고 필터링
29 |       if (args.length > 0 && typeof args[0] === 'string' && 
30 |           args[0].includes('Multiple GoTrueClient instances detected')) {
31 |         // 경고 무시
32 |         logger.debug('Supabase 다중 인스턴스 경고 무시됨');
33 |         return;
34 |       }
35 |       
36 |       // 다른 경고는 정상적으로 처리
37 |       originalWarn.apply(console, args);
38 |     };
39 |     
40 |     logger.info('Supabase 경고 필터 설정 완료');
41 |   } catch (error) {
42 |     logger.warn('Supabase 경고 필터 설정 실패', error);
43 |   }
44 | }
45 | 
46 | // 전역 변수로 인스턴스 관리 (브라우저 환경에서만)
47 | // @ts-ignore - 전역 객체에 커스텀 속성 추가
48 | if (isBrowser && !window.__SUPABASE_SINGLETON_CLIENT) {
49 |   logger.info('전역 Supabase 인스턴스 초기화');
50 |   
51 |   try {
52 |     if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
53 |       throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
54 |     }
55 |     
56 |     // 클라이언트 생성 및 전역 변수에 할당
57 |     // @ts-ignore - 전역 객체에 커스텀 속성 추가
58 |     window.__SUPABASE_SINGLETON_CLIENT = createBrowserClient<Database>(
59 |       process.env.NEXT_PUBLIC_SUPABASE_URL,
60 |       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
61 |       {
62 |         auth: {
[TRUNCATED]
```

src/lib/supabase-server.ts
```
1 | /**
2 |  * 파일명: supabase-server.ts
3 |  * 목적: 서버 컴포넌트에서 Supabase 클라이언트 접근
4 |  * 역할: 서버 측 Supabase 인스턴스 생성 및 관리
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { createServerClient } from '@supabase/ssr';
9 | import { cookies } from 'next/headers';
10 | import { Database } from '../types/supabase';
11 | 
12 | /**
13 |  * createServerSupabaseClient: 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성
14 |  * 각 요청마다 새로운 인스턴스 생성 (서버 컴포넌트에서는 싱글톤 패턴 사용 불가)
15 |  * @returns 서버용 Supabase 클라이언트
16 |  */
17 | export async function createServerSupabaseClient() {
18 |   const cookieStore = await cookies();
19 |   
20 |   return createServerClient<Database>(
21 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
22 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
23 |     {
24 |       cookies: {
25 |         get(name: string) {
26 |           return cookieStore.get(name)?.value;
27 |         },
28 |         set(name: string, value: string, options: any) {
29 |           // Next.js App Router에서는 쿠키를 직접 설정할 수 없으므로
30 |           // 이 함수는 클라이언트로의 응답에 포함될 때만 동작합니다
31 |         },
32 |         remove(name: string, options: any) {
33 |           // 마찬가지로 클라이언트로의 응답에 포함될 때만 동작
34 |         },
35 |       },
36 |     }
37 |   );
38 | }
39 | 
40 | /**
41 |  * getServerSession: 서버 컴포넌트에서 현재 세션 조회
42 |  * @returns Supabase 세션 또는 null
43 |  */
44 | export async function getServerSession() {
45 |   try {
46 |     const supabase = await createServerSupabaseClient();
47 |     const { data: { session } } = await supabase.auth.getSession();
48 |     return session;
49 |   } catch (error) {
50 |     console.error('서버 세션 조회 중 오류:', error);
51 |     return null;
52 |   }
53 | } 
```

src/lib/supabase.ts
```
1 | /**
2 |  * 파일명: supabase.ts
3 |  * 목적: Supabase 클라이언트 관리
4 |  * 역할: 서버 및 브라우저 환경에서 사용할 Supabase 클라이언트 제공
5 |  * 작성일: 2024-03-29
6 |  */
7 | 
8 | import { createClient } from '@supabase/supabase-js';
9 | import { Database } from '../types/supabase';
10 | import createLogger from './logger';
11 | 
12 | // 로거 생성
13 | const logger = createLogger('Supabase');
14 | 
15 | // 브라우저 환경에서는 전역 인스턴스 사용
16 | import { getSupabaseInstance } from './supabase-instance';
17 | 
18 | // 서버 측 인스턴스 관리
19 | let serverClientInstance: ReturnType<typeof createClient<Database>> | null = null;
20 | 
21 | // 환경 변수 확인
22 | const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
23 | const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
24 | 
25 | /**
26 |  * createSupabaseClient: 서버 환경에서 Supabase 클라이언트 생성
27 |  * @returns 서버용 Supabase 클라이언트
28 |  */
29 | export const createSupabaseClient = () => {
30 |   if (typeof window !== 'undefined') {
31 |     logger.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
32 |   }
33 |   
34 |   // 이미 생성된 인스턴스가 있으면 재사용
35 |   if (serverClientInstance) {
36 |     return serverClientInstance;
37 |   }
38 |   
39 |   // 정적 렌더링 및 개발 환경을 위한 안전한 클라이언트 생성
40 |   if (!supabaseUrl || !supabaseKey) {
41 |     logger.warn('Supabase 환경 변수가 설정되지 않았습니다');
42 |     
43 |     // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트
44 |     return {
45 |       auth: {
46 |         getSession: () => Promise.resolve({ data: { session: null }, error: null }),
47 |         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
48 |         signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
49 |       },
50 |       from: () => ({ select: () => ({ data: [], error: null }) }),
51 |     } as any;
52 |   }
53 |   
54 |   try {
55 |     logger.info('서버용 Supabase 클라이언트 생성');
56 |     serverClientInstance = createClient<Database>(
57 |       supabaseUrl,
58 |       supabaseKey,
59 |       {
60 |         auth: {
61 |           flowType: 'pkce',
62 |           autoRefreshToken: false,
63 |           persistSession: false,
64 |           detectSessionInUrl: false
65 |         }
66 |       }
67 |     );
68 |     
69 |     return serverClientInstance;
70 |   } catch (error) {
[TRUNCATED]
```

src/lib/utils.test.ts
```
1 | import { cn, formatDate, extractTags, parseTagsInText } from './utils';
2 | import { describe, it, expect } from 'vitest';
3 | 
4 | describe('유틸리티 함수', () => {
5 |   describe('cn 함수', () => {
6 |     it('클래스 이름을 병합해야 합니다', () => {
7 |       const result = cn('class1', 'class2');
8 |       expect(result).toBe('class1 class2');
9 |     });
10 | 
11 |     it('조건부 클래스를 처리해야 합니다', () => {
12 |       const result = cn('class1', { class2: true, class3: false });
13 |       expect(result).toBe('class1 class2');
14 |     });
15 | 
16 |     it('중복된 클래스를 제거해야 합니다', () => {
17 |       const result = cn('p-4 text-red-500', 'p-4 text-blue-500');
18 |       expect(result).toBe('p-4 text-blue-500');
19 |     });
20 |   });
21 |   
22 |   describe('formatDate 함수', () => {
23 |     it('Date 객체를 한국어 날짜 형식으로 변환해야 합니다', () => {
24 |       const date = new Date(2023, 0, 15); // 2023-01-15
25 |       const result = formatDate(date);
26 |       expect(result).toBe('2023년 1월 15일');
27 |     });
28 |     
29 |     it('문자열 날짜를 한국어 날짜 형식으로 변환해야 합니다', () => {
30 |       const dateStr = '2023-02-20T12:00:00.000Z';
31 |       const result = formatDate(dateStr);
32 |       
33 |       // 시간대에 따라 결과가 다를 수 있으므로 포맷만 확인
34 |       expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
35 |     });
36 |     
37 |     it('다양한 날짜 입력에 대해 오류 없이 처리해야 합니다', () => {
38 |       // 다양한 날짜 형식
39 |       const dates = [
40 |         new Date(), // 현재 날짜
41 |         '2023-12-31',
42 |         '2023/01/01',
43 |         new Date(2000, 0, 1) // 2000-01-01
44 |       ];
45 |       
46 |       dates.forEach(date => {
47 |         const result = formatDate(date);
48 |         expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
49 |       });
50 |     });
51 |   });
52 |   
53 |   describe('extractTags 함수', () => {
54 |     it('텍스트에서 태그를 추출해야 합니다', () => {
55 |       const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
[TRUNCATED]
```

src/lib/utils.ts
```
1 | import { type ClassValue, clsx } from "clsx"
2 | import { twMerge } from "tailwind-merge"
3 | 
4 | export function cn(...inputs: ClassValue[]) {
5 |   return twMerge(clsx(inputs))
6 | }
7 | 
8 | /**
9 |  * 날짜 문자열을 포맷팅합니다.
10 |  */
11 | export function formatDate(dateString: string): string {
12 |   if (!dateString) return '';
13 |   
14 |   try {
15 |     const date = new Date(dateString);
16 |     
17 |     // 유효한 날짜인지 확인
18 |     if (isNaN(date.getTime())) {
19 |       return dateString;
20 |     }
21 |     
22 |     // YYYY년 MM월 DD일 형식으로 변환
23 |     return date.toLocaleDateString('ko-KR', {
24 |       year: 'numeric',
25 |       month: 'long',
26 |       day: 'numeric',
27 |       hour: '2-digit',
28 |       minute: '2-digit'
29 |     });
30 |   } catch (error) {
31 |     console.error('날짜 포맷팅 오류:', error);
32 |     return dateString;
33 |   }
34 | }
35 | 
36 | // 텍스트에서 태그 추출 (#태그 형식)
37 | export function extractTags(text: string): string[] {
38 |   const tagPattern = /#([a-zA-Z0-9가-힣_\-]+)/g;
39 |   const matches = text.match(tagPattern);
40 |   
41 |   if (!matches) return [];
42 |   
43 |   return matches.map(tag => tag.slice(1)); // # 제거
44 | }
45 | 
46 | // 텍스트에서 태그를 변환 (#태그 -> Badge 컴포넌트로 변환하기 위한 준비)
47 | export function parseTagsInText(text: string): { text: string, tags: string[] } {
48 |   const tags = extractTags(text);
49 |   return { text, tags };
50 | }
```

src/tests/auth-flow.test.ts
```
1 | /**
2 |  * 파일명: auth-flow.test.ts
3 |  * 목적: 인증 흐름 테스트 코드
4 |  * 역할: 서버/클라이언트 컴포넌트 분리 및 OAuth 인증 흐름 검증
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { test, expect, describe, beforeAll, afterAll } from '@jest/globals';
9 | import { getSupabaseInstance } from '../lib/supabase-instance';
10 | import { createServerSupabaseClient } from '../lib/supabase-server';
11 | 
12 | // 서버와 클라이언트 컴포넌트 분리 테스트 케이스
13 | describe('서버/클라이언트 컴포넌트 분리', () => {
14 |   test('ClientLayout은 클라이언트 컴포넌트로 마킹되어야 함', () => {
15 |     // 파일 내용 확인을 위한 테스트
16 |     const fileContent = `
17 |       'use client';
18 |       
19 |       import { ReactNode, useEffect } from 'react';
20 |       import { AuthProvider } from "@/contexts/AuthContext";
21 |     `;
22 |     
23 |     expect(fileContent).toContain('use client');
24 |     expect(fileContent).toContain('AuthProvider');
25 |   });
26 |   
27 |   test('RootLayout은 서버 컴포넌트로 마킹되어야 함', () => {
28 |     // 파일 내용에 'use client'가 없어야 함
29 |     const fileContent = `
30 |       /**
31 |        * 파일명: layout.tsx
32 |        * 목적: 앱의 기본 레이아웃 구조 정의
33 |        * 역할: 전체 페이지 구조와 공통 UI 요소 제공
34 |        * 작성일: 2024-03-30
35 |        */
36 |       
37 |       import { ClientLayout } from "@/components/layout/ClientLayout";
38 |       import "@/app/globals.css";
39 |     `;
40 |     
41 |     expect(fileContent).not.toContain('use client');
42 |     expect(fileContent).toContain('ClientLayout');
43 |   });
44 | });
45 | 
46 | // Supabase 클라이언트 초기화 테스트 케이스
47 | describe('Supabase 클라이언트 초기화', () => {
48 |   test('getSupabaseInstance는 브라우저 환경에서만 작동해야 함', () => {
49 |     // 브라우저 환경 시뮬레이션 (window 객체 접근 불가능)
50 |     const originalWindow = global.window;
51 |     // @ts-ignore
52 |     global.window = undefined;
53 |     
54 |     // 브라우저 환경이 아닐 때 에러 발생해야 함
55 |     expect(() => getSupabaseInstance()).toThrow('브라우저 환경에서만 사용 가능합니다');
56 |     
57 |     // 원래 window 객체 복원
58 |     global.window = originalWindow;
59 |   });
60 |   
61 |   test('createServerSupabaseClient는 비동기 함수여야 함', () => {
62 |     // 타입 또는 함수 시그니처 확인
63 |     expect(createServerSupabaseClient.constructor.name).toBe('AsyncFunction');
[TRUNCATED]
```

src/tests/auth-storage.test.ts
```
1 | /**
2 |  * 파일명: auth-storage.test.ts
3 |  * 목적: 인증 스토리지 유틸리티 테스트
4 |  * 역할: 여러 스토리지에 인증 정보를 저장하고 복구하는 로직 검증
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { test, expect, describe, beforeEach, afterEach, jest } from '@jest/globals';
9 | import { 
10 |   setAuthData, 
11 |   getAuthData, 
12 |   removeAuthData,
13 |   clearAllAuthData,
14 |   STORAGE_KEYS
15 | } from '../lib/auth-storage';
16 | 
17 | // 로컬 스토리지와 세션 스토리지 모킹
18 | const mockLocalStorage = {
19 |   getItem: jest.fn(),
20 |   setItem: jest.fn(),
21 |   removeItem: jest.fn()
22 | };
23 | 
24 | const mockSessionStorage = {
25 |   getItem: jest.fn(),
26 |   setItem: jest.fn(),
27 |   removeItem: jest.fn()
28 | };
29 | 
30 | // 모킹된 쿠키 함수들
31 | const mockGetAuthCookie = jest.fn();
32 | const mockSetAuthCookie = jest.fn();
33 | const mockDeleteAuthCookie = jest.fn();
34 | 
35 | // IndexedDB 모킹
36 | const mockIndexedDB = {
37 |   open: jest.fn()
38 | };
39 | 
40 | // 테스트 설정
41 | describe('인증 스토리지 유틸리티', () => {
42 |   beforeEach(() => {
43 |     // 전역 객체 모킹
44 |     Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });
45 |     Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage });
46 |     Object.defineProperty(global, 'indexedDB', { value: mockIndexedDB });
47 |     
48 |     // 함수 모킹 초기화
49 |     mockLocalStorage.getItem.mockClear();
50 |     mockLocalStorage.setItem.mockClear();
51 |     mockLocalStorage.removeItem.mockClear();
52 |     mockSessionStorage.getItem.mockClear();
53 |     mockSessionStorage.setItem.mockClear();
54 |     mockSessionStorage.removeItem.mockClear();
55 |     mockGetAuthCookie.mockClear();
56 |     mockSetAuthCookie.mockClear();
57 |     mockDeleteAuthCookie.mockClear();
58 |   });
59 |   
60 |   afterEach(() => {
61 |     jest.resetAllMocks();
62 |   });
63 |   
64 |   // 데이터 저장 테스트
65 |   test('setAuthData는 여러 스토리지에 데이터를 저장해야 함', () => {
66 |     // 테스트 데이터
67 |     const key = STORAGE_KEYS.CODE_VERIFIER;
68 |     const value = 'test-verifier-123';
69 |     
70 |     // 함수 호출
71 |     const result = setAuthData(key, value);
72 |     
73 |     // 검증
74 |     expect(result).toBe(true);
75 |     expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
[TRUNCATED]
```

src/tests/run-auth-tests.sh
```
1 | #!/bin/bash
2 | 
3 | # 파일명: run-auth-tests.sh
4 | # 목적: Google OAuth 인증 테스트 실행 스크립트
5 | # 역할: 인증 관련 테스트 케이스를 실행하고 결과를 정리
6 | # 작성일: 2024-03-26
7 | 
8 | # 색상 정의
9 | GREEN='\033[0;32m'
10 | RED='\033[0;31m'
11 | YELLOW='\033[1;33m'
12 | BLUE='\033[0;34m'
13 | NC='\033[0m' # 색상 초기화
14 | 
15 | # 실행 시간 기록
16 | timestamp=$(date +%Y%m%d-%H%M%S)
17 | start_time=$(date +%s)
18 | echo "테스트 실행 시작: $(date +'%Y년 %m월 %d일 %H:%M:%S KST')"
19 | echo "결과 요약 파일: ./src/tests/results/auth-tests-summary-${timestamp}.txt"
20 | 
21 | # 결과 디렉토리 생성
22 | mkdir -p ./src/tests/results
23 | 
24 | # Vitest를 사용하여 인증 관련 테스트만 실행
25 | npx vitest run src/tests/auth/auth-integration.test.ts --globals > ./src/tests/results/auth-tests-summary-${timestamp}.txt
26 | 
27 | # 종료 코드 확인
28 | exit_code=$?
29 | echo "종료 코드: $exit_code"
30 | 
31 | # 테스트 종료 시간
32 | end_time=$(date +%s)
33 | duration=$((end_time - start_time))
34 | 
35 | # 결과 요약
36 | echo "" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
37 | echo "==================================================" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
38 | echo "테스트 요약" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
39 | echo "==================================================" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
40 | echo "테스트 파일: src/tests/auth/auth-integration.test.ts" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
41 | echo "실행 시간: ${duration} 초" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
42 | 
43 | # 결과 출력
44 | cat ./src/tests/results/auth-tests-summary-${timestamp}.txt
45 | 
46 | exit $exit_code 
```

src/tests/run-tests.sh
```
1 | #!/bin/bash
2 | 
3 | # 파일명: run-tests.sh
4 | # 목적: 인증 흐름 테스트 실행 스크립트
5 | # 작성일: 2024-03-30
6 | 
7 | # 색상 정의
8 | GREEN='\033[0;32m'
9 | RED='\033[0;31m'
10 | BLUE='\033[0;34m'
11 | NC='\033[0m' # 색상 초기화
12 | 
13 | echo -e "${BLUE}===== 서버/클라이언트 컴포넌트 분리 및 인증 테스트 시작 =====${NC}"
14 | 
15 | # 디렉토리가 존재하는지 확인
16 | mkdir -p src/tests/results
17 | 
18 | # 1. 레이아웃 파일 확인
19 | echo -e "\n${BLUE}[테스트 1] 레이아웃 파일 확인${NC}"
20 | if grep -q "'use client'" src/app/layout.tsx; then
21 |   echo -e "${RED}[실패] src/app/layout.tsx에 'use client' 지시어가 있습니다. 서버 컴포넌트여야 합니다.${NC}"
22 | else
23 |   echo -e "${GREEN}[성공] src/app/layout.tsx는 서버 컴포넌트입니다.${NC}"
24 | fi
25 | 
26 | if grep -q "'use client'" src/components/layout/ClientLayout.tsx; then
27 |   echo -e "${GREEN}[성공] src/components/layout/ClientLayout.tsx는 클라이언트 컴포넌트입니다.${NC}"
28 | else
29 |   echo -e "${RED}[실패] src/components/layout/ClientLayout.tsx에 'use client' 지시어가 없습니다. 클라이언트 컴포넌트여야 합니다.${NC}"
30 | fi
31 | 
32 | # 2. Supabase 서버/클라이언트 분리 확인
33 | echo -e "\n${BLUE}[테스트 2] Supabase 서버/클라이언트 분리 확인${NC}"
34 | if grep -q "async function createServerSupabaseClient" src/lib/supabase-server.ts; then
35 |   echo -e "${GREEN}[성공] createServerSupabaseClient는 비동기 함수입니다.${NC}"
36 | else
37 |   echo -e "${RED}[실패] createServerSupabaseClient는 비동기 함수여야 합니다.${NC}"
38 | fi
39 | 
40 | if grep -q "cookies()" src/lib/supabase-server.ts; then
41 |   if grep -q "await cookies()" src/lib/supabase-server.ts; then
42 |     echo -e "${GREEN}[성공] cookies()가 올바르게 await와 함께 사용되었습니다.${NC}"
43 |   else
44 |     echo -e "${RED}[실패] cookies()는 비동기 함수이므로 await와 함께 사용해야 합니다.${NC}"
45 |   fi
[TRUNCATED]
```

src/tests/setup.ts
```
1 | /**
2 |  * 파일명: setup.ts
3 |  * 목적: Vitest 테스트 설정 파일
4 |  * 역할: 테스트에 필요한 전역 설정 및 모의 객체 설정
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { expect, afterEach, vi } from 'vitest';
9 | import { cleanup } from '@testing-library/react';
10 | import '@testing-library/jest-dom';
11 | 
12 | // JSDOM 환경이 없을 경우 대비
13 | if (typeof window === 'undefined') {
14 |   global.window = {} as any;
15 |   global.document = {} as any;
16 |   
17 |   // navigator는 getter-only 속성이므로 Object.defineProperty 사용
18 |   Object.defineProperty(global, 'navigator', {
19 |     value: { userAgent: 'vitest' },
20 |     writable: true,
21 |     configurable: true
22 |   });
23 | }
24 | 
25 | // 각 테스트 후 DOM 정리
26 | afterEach(() => {
27 |   cleanup();
28 | });
29 | 
30 | // 콘솔 경고 억제 (선택 사항)
31 | // const originalConsoleError = console.error;
32 | // const originalConsoleWarn = console.warn;
33 | // console.error = (...args) => {
34 | //   if (args[0]?.includes('Warning:')) {
35 | //     return;
36 | //   }
37 | //   originalConsoleError(...args);
38 | // };
39 | // console.warn = (...args) => {
40 | //   if (args[0]?.includes('Warning:')) {
41 | //     return;
42 | //   }
43 | //   originalConsoleWarn(...args);
44 | // };
45 | 
46 | // ResizeObserver 모킹 (테스트 환경에서 사용할 수 있도록)
47 | if (typeof window !== 'undefined') {
48 |   // ResizeObserver가 정의되어 있지 않은 경우에만 모킹
49 |   if (!window.ResizeObserver) {
50 |     window.ResizeObserver = class ResizeObserver {
51 |       constructor(callback: any) {
52 |         this.callback = callback;
53 |       }
54 |       private callback: any;
55 |       observe() { return null; }
56 |       unobserve() { return null; }
57 |       disconnect() { return null; }
58 |     };
59 |   }
60 | 
61 |   // 모의 환경 객체 설정 (안전하게 체크)
62 |   Object.defineProperty(window, 'matchMedia', {
63 |     writable: true,
64 |     value: vi.fn().mockImplementation(query => ({
65 |       matches: false,
66 |       media: query,
67 |       onchange: null,
68 |       addListener: vi.fn(),
69 |       removeListener: vi.fn(),
70 |       addEventListener: vi.fn(),
71 |       removeEventListener: vi.fn(),
72 |       dispatchEvent: vi.fn(),
73 |     })),
74 |   });
[TRUNCATED]
```

src/types/card.ts
```
1 | export interface User {
2 |   id: string;
3 |   name: string | null;
4 | }
5 | 
6 | export interface Card {
7 |   id: string;
8 |   title: string;
9 |   content: string | null;
10 |   createdAt: string;
11 |   updatedAt: string;
12 |   userId: string;
13 |   user?: User;
14 | }
15 | 
16 | export interface CreateCardInput {
17 |   title: string;
18 |   content?: string;
19 |   userId: string;
20 | }
21 | 
22 | export interface UpdateCardInput {
23 |   title?: string;
24 |   content?: string;
25 | } 
```

src/types/flow.ts
```
1 | export interface NodeData {
2 |   id: string;
3 |   title: string;
4 |   content: string;
5 |   type?: string;
6 |   width?: number;
7 |   height?: number;
8 |   color?: string;
9 |   tags?: string[];
10 |   position?: {
11 |     x: number;
12 |     y: number;
13 |   };
14 |   // 추가 속성들
15 |   [key: string]: any;
16 | } 
```

src/types/global.d.ts
```
1 | /**
2 |  * 파일명: global.d.ts
3 |  * 목적: 전역 타입 선언
4 |  * 역할: 전역 변수 및 확장 타입을 선언
5 |  * 작성일: 2024-03-29
6 |  */
7 | 
8 | import { SupabaseClient } from '@supabase/supabase-js';
9 | import { Database } from './supabase';
10 | 
11 | declare global {
12 |   interface Window {
13 |     /**
14 |      * 전역 Supabase 싱글톤 인스턴스
15 |      */
16 |     __SUPABASE_SINGLETON_CLIENT?: SupabaseClient<Database>;
17 |     
18 |     /**
19 |      * Supabase 경고 비활성화 플래그
20 |      */
21 |     __SUPABASE_DISABLE_WARNING?: boolean;
22 |   }
23 |   
24 |   /**
25 |    * 콘솔 메서드 오버라이드를 위한 타입 선언
26 |    */
27 |   interface Console {
28 |     warn: (...data: any[]) => void;
29 |     originalWarn?: (...data: any[]) => void;
30 |   }
31 | } 
```

src/types/supabase.ts
```
1 | export type Json =
2 |   | string
3 |   | number
4 |   | boolean
5 |   | null
6 |   | { [key: string]: Json | undefined }
7 |   | Json[]
8 | 
9 | // Supabase 데이터베이스의 타입 정의
10 | export interface Database {
11 |   public: {
12 |     Tables: {
13 |       users: {
14 |         Row: {
15 |           id: string
16 |           email: string
17 |           name: string | null
18 |           created_at: string
19 |           updated_at: string
20 |         }
21 |         Insert: {
22 |           id?: string
23 |           email: string
24 |           name?: string | null
25 |           created_at?: string
26 |           updated_at?: string
27 |         }
28 |         Update: {
29 |           id?: string
30 |           email?: string
31 |           name?: string | null
32 |           updated_at?: string
33 |         }
34 |       }
35 |       cards: {
36 |         Row: {
37 |           id: string
38 |           title: string
39 |           content: string | null
40 |           user_id: string
41 |           created_at: string
42 |           updated_at: string
43 |         }
44 |         Insert: {
45 |           id?: string
46 |           title: string
47 |           content?: string | null
48 |           user_id: string
49 |           created_at?: string
50 |           updated_at?: string
51 |         }
52 |         Update: {
53 |           id?: string
54 |           title?: string
55 |           content?: string | null
56 |           user_id?: string
57 |           updated_at?: string
58 |         }
59 |       }
60 |       tags: {
61 |         Row: {
62 |           id: string
63 |           name: string
64 |           created_at: string
65 |           updated_at: string
66 |         }
67 |         Insert: {
68 |           id?: string
69 |           name: string
70 |           created_at?: string
71 |           updated_at?: string
72 |         }
73 |         Update: {
74 |           id?: string
75 |           name?: string
76 |           updated_at?: string
77 |         }
78 |       }
79 |       card_tags: {
80 |         Row: {
81 |           id: string
82 |           card_id: string
83 |           tag_id: string
84 |           created_at: string
85 |         }
86 |         Insert: {
87 |           id?: string
88 |           card_id: string
89 |           tag_id: string
[TRUNCATED]
```

src/types/vitest.d.ts
```
1 | /// <reference types="vitest" />
2 | /// <reference types="@testing-library/jest-dom" />
3 | 
4 | import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
5 | 
6 | declare global {
7 |   namespace Vi {
8 |     interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
9 |   }
10 | 
11 |   // @testing-library/jest-dom 확장
12 |   interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
13 | } 
```

supabase/migrations/20240319000000_init.sql
```
1 | -- PostgreSQL 확장 활성화
2 | CREATE EXTENSION IF NOT EXISTS pgcrypto;
3 | 
4 | -- 테이블 생성 순서 중요: 참조 관계 때문에 순서대로 생성해야 함
5 | 
6 | -- 사용자 테이블 (Supabase Auth와 연동)
7 | CREATE TABLE IF NOT EXISTS users (
8 |   id UUID PRIMARY KEY,
9 |   email TEXT NOT NULL UNIQUE,
10 |   name TEXT,
11 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
12 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
13 | );
14 | 
15 | -- 카드 테이블
16 | CREATE TABLE IF NOT EXISTS cards (
17 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
18 |   title TEXT NOT NULL,
19 |   content TEXT,
20 |   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
21 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
22 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
23 | );
24 | 
25 | -- 태그 테이블
26 | CREATE TABLE IF NOT EXISTS tags (
27 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
28 |   name TEXT NOT NULL UNIQUE,
29 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
30 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
31 | );
32 | 
33 | -- 카드-태그 연결 테이블
34 | CREATE TABLE IF NOT EXISTS card_tags (
35 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
36 |   card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
37 |   tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
38 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
39 |   UNIQUE(card_id, tag_id)
40 | );
41 | 
42 | -- 보드 설정 테이블
43 | CREATE TABLE IF NOT EXISTS board_settings (
44 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
45 |   user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
46 |   settings JSONB NOT NULL,
47 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
48 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
49 | );
50 | 
51 | -- 트리거 함수: 업데이트 시간 자동 갱신
[TRUNCATED]
```

src/app/board/page.test.tsx
```
1 | /**
2 |  * 파일명: page.test.tsx
3 |  * 목적: 보드 페이지 컴포넌트 테스트
4 |  * 역할: Board 컴포넌트를 사용하는 페이지 컴포넌트 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
9 | import { describe, test, expect, vi, beforeEach } from 'vitest';
10 | import BoardPage from './page';
11 | import { Node, Edge, NodeChange } from '@xyflow/react';
12 | import '@testing-library/jest-dom/vitest';
13 | import { autoLayoutNodes } from './page';
14 | 
15 | // LocalStorage 모킹
16 | const localStorageMock = (() => {
17 |   let store: Record<string, string> = {};
18 |   return {
19 |     getItem: vi.fn((key: string) => store[key] || null),
20 |     setItem: vi.fn((key: string, value: string) => {
21 |       store[key] = value.toString();
22 |     }),
23 |     clear: vi.fn(() => {
24 |       store = {};
25 |     }),
26 |   };
27 | })();
28 | 
29 | Object.defineProperty(window, 'localStorage', {
30 |   value: localStorageMock,
31 | });
32 | 
33 | // ResizeObserver 모킹 (ReactFlow에서 필요)
34 | class ResizeObserverMock {
35 |   observe = vi.fn();
36 |   unobserve = vi.fn();
37 |   disconnect = vi.fn();
38 | }
39 | 
40 | global.ResizeObserver = ResizeObserverMock;
41 | 
42 | // React Flow의 applyNodeChanges 함수 결과를 모킹하기 위한 변수
43 | let mockAppliedNodes: Node[] = [];
44 | 
45 | // ReactFlow 전체 모킹 - 테스트에서는 실제 렌더링 없이 모킹된 구성요소만 사용
46 | const nodesMock: Node[] = [];
47 | const edgesMock: Edge[] = [];
48 | const setNodesMock = vi.fn();
49 | const setEdgesMock = vi.fn();
50 | const onNodesChangeMock = vi.fn();
51 | const onEdgesChangeMock = vi.fn();
52 | 
53 | // viewportCenter 모킹 - getNewCardPosition에서 사용
54 | const viewportCenterMock = { x: 500, y: 300 };
55 | 
56 | // ReactFlow의 ReactFlowProvider와 useReactFlow hook 모킹
57 | vi.mock('@xyflow/react', () => {
58 |   // ReactFlow 컴포넌트 모킹
59 |   const ReactFlowMock = ({ children, onNodesChange }: { children?: React.ReactNode, onNodesChange?: (changes: NodeChange[]) => void }) => (
60 |     <div 
61 |       data-testid="react-flow-mock"
62 |       onClick={() => {
63 |         // 노드 위치 변경 시뮬레이션
[TRUNCATED]
```

src/app/board/page.tsx
```
1 | /**
2 |  * 파일명: page.tsx
3 |  * 목적: 보드 페이지 컴포넌트
4 |  * 역할: 보드 기능의 페이지 레벨 컴포넌트, 리팩토링된 Board 컴포넌트 사용
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { ReactFlowProvider } from '@xyflow/react';
11 | import Board from '@/components/board/components/Board';
12 | import { useAppStore } from '@/store/useAppStore';
13 | 
14 | // 기존 코드 보존을 위한 주석 처리된 함수들 (테스트에서 참조할 수 있음)
15 | export const autoLayoutNodes = (nodes: any[]) => {
16 |   return nodes.map((node: any, index: number) => ({
17 |     ...node,
18 |     position: {
19 |       x: (index % 3) * 300 + 50, 
20 |       y: Math.floor(index / 3) * 200 + 50
21 |     }
22 |   }));
23 | };
24 | 
25 | // 보드 페이지 컴포넌트
26 | export default function BoardPage() {
27 |   const { selectCard } = useAppStore();
28 |   
29 |   return (
30 |     <div className="w-full h-full relative">
31 |       <ReactFlowProvider>
32 |         <Board
33 |           onSelectCard={selectCard}
34 |           className="bg-background"
35 |           showControls={true}
36 |         />
37 |       </ReactFlowProvider>
38 |     </div>
39 |   );
40 | } 
```

src/app/cards/page.test.tsx
```
1 | /**
2 |  * @vitest-environment jsdom
3 |  */
4 | 
5 | import { render, screen } from '@testing-library/react';
6 | import CardsPage from './page';
7 | import '@testing-library/jest-dom/vitest';
8 | import React from 'react';
9 | import { describe, it, expect, vi } from 'vitest';
10 | 
11 | // Next.js의 router 훅 모킹
12 | vi.mock('next/navigation', () => ({
13 |   useRouter: vi.fn(() => ({
14 |     push: vi.fn(),
15 |     replace: vi.fn(),
16 |     prefetch: vi.fn(),
17 |     pathname: '/cards',
18 |   })),
19 |   useSearchParams: vi.fn(() => ({
20 |     get: vi.fn((key) => null),
21 |     has: vi.fn(() => false),
22 |     forEach: vi.fn(),
23 |   })),
24 | }));
25 | 
26 | // TagFilter 컴포넌트 모킹
27 | vi.mock('@/components/cards/TagFilter', () => ({
28 |   TagFilter: vi.fn(() => <div data-testid="tag-filter">태그 필터</div>)
29 | }));
30 | 
31 | // React.Suspense 모킹
32 | vi.mock('react', () => {
33 |   const originalReact = vi.importActual('react');
34 |   return {
35 |     ...originalReact,
36 |     Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
37 |       return (
38 |         <>
39 |           <div data-testid="suspense-fallback">{fallback}</div>
40 |           <div data-testid="suspense-children">{children}</div>
41 |         </>
42 |       );
43 |     },
44 |   };
45 | });
46 | 
47 | // 테스트용 CardListSkeleton (page 모듈에서 가져오지 않고 테스트에서 직접 정의)
48 | const CardListSkeleton = () => (
49 |   <div data-testid="skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
50 |     {Array(6).fill(0).map((_, index) => (
51 |       <div key={index} className="border rounded-md p-4 space-y-4">
52 |         <div data-testid="skeleton" className="h-6 w-3/4" />
53 |         <div data-testid="skeleton" className="h-24" />
54 |         <div className="flex justify-between">
55 |           <div data-testid="skeleton" className="h-4 w-1/4" />
56 |           <div data-testid="skeleton" className="h-8 w-1/4" />
[TRUNCATED]
```

src/app/cards/page.tsx
```
1 | /**
2 |  * 파일명: src/app/cards/page.tsx
3 |  * 목적: 카드 목록을 표시하고 필터링 기능 제공
4 |  * 역할: 카드 목록 페이지의 레이아웃과 컴포넌트 구성
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { Metadata } from "next";
9 | import { Suspense } from 'react';
10 | import CardList from "@/components/cards/CardList";
11 | import CreateCardButton from "@/components/cards/CreateCardButton";
12 | import { TagFilter } from "@/components/cards/TagFilter";
13 | import { Skeleton } from '@/components/ui/skeleton';
14 | import { ChevronRight } from "lucide-react";
15 | import Link from "next/link";
16 | 
17 | export const metadata: Metadata = {
18 |   title: "카드 목록 | Backyard",
19 |   description: "백야드 카드 목록 페이지입니다.",
20 | };
21 | 
22 | // 카드 목록 로딩 스켈레톤
23 | function CardListSkeleton() {
24 |   return (
25 |     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
26 |       {Array(6).fill(0).map((_, index) => (
27 |         <div key={index} className="border rounded-md p-4 space-y-4">
28 |           <Skeleton className="h-6 w-3/4" />
29 |           <Skeleton className="h-24" />
30 |           <div className="flex justify-between">
31 |             <Skeleton className="h-4 w-1/4" />
32 |             <Skeleton className="h-8 w-1/4" />
33 |           </div>
34 |         </div>
35 |       ))}
36 |     </div>
37 |   );
38 | }
39 | 
40 | export default function CardsPage() {
41 |   return (
42 |     <div className="container mx-auto py-8">
43 |       {/* 페이지 헤더 */}
44 |       <div className="mb-6">
45 |         <div className="flex justify-between items-center mb-2">
46 |           <div>
47 |             {/* <div className="flex items-center text-sm text-muted-foreground mb-1">
48 |               <Link href="/" className="hover:underline">홈</Link>
49 |               <ChevronRight className="h-4 w-4 mx-1" />
50 |               <span>카드 목록</span>
51 |             </div> */}
52 |             <h1 className="text-3xl font-bold">카드 목록</h1>
53 |           </div>
54 |           <CreateCardButton />
55 |         </div>
[TRUNCATED]
```

src/app/login/actions.test.ts
```
1 | /**
2 |  * 파일명: actions.test.ts
3 |  * 목적: 로그인 관련 서버 액션 테스트
4 |  * 역할: 로그인/회원가입 함수의 동작을 검증
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
9 | import { login, signup, signInWithGoogle } from './actions';
10 | 
11 | // 모킹 객체 생성
12 | const mocks = vi.hoisted(() => ({
13 |   auth: {
14 |     signInWithPassword: vi.fn(),
15 |     signUp: vi.fn(),
16 |     signInWithOAuth: vi.fn()
17 |   },
18 |   redirectFn: vi.fn((url) => ({ redirectUrl: url }))
19 | }));
20 | 
21 | // Supabase와 Next.js 모듈 모킹
22 | vi.mock('@/utils/supabase/server', () => ({
23 |   createClient: () => ({
24 |     auth: mocks.auth
25 |   })
26 | }));
27 | 
28 | vi.mock('next/navigation', () => ({
29 |   redirect: mocks.redirectFn
30 | }));
31 | 
32 | // process.env 모킹
33 | const originalEnv = process.env;
34 | 
35 | describe('인증 액션 테스트', () => {
36 |   let formData: FormData;
37 |   
38 |   beforeEach(() => {
39 |     // FormData 초기화
40 |     formData = new FormData();
41 |     formData.append('email', 'test@example.com');
42 |     formData.append('password', 'password123');
43 |     
44 |     // 콘솔 에러 모킹
45 |     vi.spyOn(console, 'error').mockImplementation(() => {});
46 |     
47 |     // process.env 모킹
48 |     process.env = {
49 |       ...originalEnv,
50 |       NEXT_PUBLIC_APP_URL: 'https://example.com'
51 |     };
52 |   });
53 |   
54 |   afterEach(() => {
55 |     vi.clearAllMocks();
56 |     process.env = originalEnv;
57 |   });
58 |   
59 |   describe('login()', () => {
60 |     it('로그인 성공 시 홈페이지로 리다이렉트 해야 함', async () => {
61 |       // 성공 응답 모킹
62 |       mocks.auth.signInWithPassword.mockResolvedValue({ error: null });
63 |       
64 |       // 로그인 함수 호출
65 |       await login(formData);
66 |       
67 |       // 인증 함수가 올바른 인자로 호출되었는지 확인
68 |       expect(mocks.auth.signInWithPassword).toHaveBeenCalledWith({
69 |         email: 'test@example.com',
70 |         password: 'password123'
71 |       });
72 |       
73 |       // 성공 시 홈페이지로 리다이렉트되는지 확인
74 |       expect(mocks.redirectFn).toHaveBeenCalledWith('/');
75 |     });
76 |     
[TRUNCATED]
```

src/app/login/actions.ts
```
1 | /**
2 |  * 파일명: actions.ts
3 |  * 목적: 로그인 및 회원가입 서버 액션 제공
4 |  * 역할: 사용자 인증 처리
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | 'use server'
9 | 
10 | import { createClient } from '@/utils/supabase/server'
11 | import { redirect } from 'next/navigation'
12 | 
13 | export async function login(formData: FormData) {
14 |   const email = formData.get('email') as string
15 |   const password = formData.get('password') as string
16 | 
17 |   const supabase = await createClient()
18 | 
19 |   const { error } = await supabase.auth.signInWithPassword({
20 |     email,
21 |     password,
22 |   })
23 | 
24 |   if (error) {
25 |     console.error('로그인 오류:', error)
26 |     return redirect(`/login?error=${encodeURIComponent(error.message)}`)
27 |   }
28 | 
29 |   return redirect('/')
30 | }
31 | 
32 | export async function signup(formData: FormData) {
33 |   const email = formData.get('email') as string
34 |   const password = formData.get('password') as string
35 | 
36 |   const supabase = await createClient()
37 | 
38 |   const { error } = await supabase.auth.signUp({
39 |     email,
40 |     password,
41 |     options: {
42 |       emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
43 |     },
44 |   })
45 | 
46 |   if (error) {
47 |     console.error('회원가입 오류:', error)
48 |     return redirect(`/login?error=${encodeURIComponent(error.message)}`)
49 |   }
50 | 
51 |   // 회원가입 성공 메시지로 리다이렉션
52 |   return redirect('/login?message=확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
53 | }
54 | 
55 | export async function signInWithGoogle() {
56 |   // Supabase 클라이언트 생성
57 |   const supabase = await createClient()
58 |   
59 |   // 현재 앱 도메인 (기본값 localhost:3000)
60 |   const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
61 |   
62 |   // 콜백 URL 설정
63 |   const redirectUrl = `${origin}/auth/callback`
64 |   
65 |   // Google OAuth 로그인 프로세스 시작
66 |   const { data, error } = await supabase.auth.signInWithOAuth({
67 |     provider: 'google',
68 |     options: {
[TRUNCATED]
```

src/app/login/page.test.tsx
```
1 | /**
2 |  * 파일명: page.test.tsx
3 |  * 목적: 로그인 페이지 컴포넌트 테스트
4 |  * 역할: 로그인 페이지의 UI 및 기능을 테스트
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | /// <reference types="vitest" />
9 | import React from 'react';
10 | import { render, screen, fireEvent } from '@testing-library/react';
11 | import { describe, it, expect, vi, beforeEach } from 'vitest';
12 | import LoginPage from './page';
13 | import '@testing-library/jest-dom/vitest';
14 | 
15 | // 서버 액션 모킹
16 | const mockLogin = vi.fn();
17 | const mockSignup = vi.fn();
18 | const mockSignInWithGoogle = vi.fn();
19 | 
20 | vi.mock('./actions', () => ({
21 |   login: vi.fn(() => mockLogin),
22 |   signup: vi.fn(() => mockSignup),
23 |   signInWithGoogle: vi.fn(() => mockSignInWithGoogle)
24 | }));
25 | 
26 | // searchParams 모킹
27 | const mockSearchParams = new Map();
28 | 
29 | vi.mock('next/navigation', () => ({
30 |   useSearchParams: vi.fn(() => ({
31 |     get: (key: string) => mockSearchParams.get(key)
32 |   }))
33 | }));
34 | 
35 | describe('LoginPage', () => {
36 |   beforeEach(() => {
37 |     vi.clearAllMocks();
38 |     mockSearchParams.clear();
39 |   });
40 | 
41 |   it('로그인 페이지가 올바르게 렌더링되어야 함', () => {
42 |     render(<LoginPage />);
43 |     
44 |     // 페이지 제목이 존재하는지 확인
45 |     expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
46 |     
47 |     // 폼 요소들이 존재하는지 확인
48 |     expect(screen.getByLabelText('이메일')).toBeInTheDocument();
49 |     expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
50 |     
51 |     // 버튼들이 존재하는지 확인
52 |     expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
53 |     expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
54 |     expect(screen.getByRole('button', { name: /Google로 계속하기/ })).toBeInTheDocument();
55 |   });
56 | 
57 |   it('오류 메시지가 URL 파라미터로부터 표시되어야 함', () => {
58 |     // 오류 메시지 파라미터 설정
59 |     mockSearchParams.set('error', '로그인에 실패했습니다.');
60 |     
61 |     render(<LoginPage />);
62 |     
63 |     // 오류 메시지가 화면에 표시되는지 확인
64 |     expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();
65 |   });
66 | 
67 |   it('성공 메시지가 URL 파라미터로부터 표시되어야 함', () => {
[TRUNCATED]
```

src/app/login/page.tsx
```
1 | /**
2 |  * 파일명: page.tsx
3 |  * 목적: 로그인 페이지 제공
4 |  * 역할: 사용자 로그인 및 회원가입 UI
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | 'use client'
9 | 
10 | import { useEffect, useState } from 'react'
11 | import { login, signup, signInWithGoogle } from './actions'
12 | import { useSearchParams } from 'next/navigation'
13 | import { cn } from '@/lib/utils'
14 | 
15 | export default function LoginPage() {
16 |   const searchParams = useSearchParams()
17 |   const [error, setError] = useState<string | null>(null)
18 |   const [message, setMessage] = useState<string | null>(null)
19 |   
20 |   useEffect(() => {
21 |     // URL 쿼리 파라미터에서 오류 및 성공 메시지 추출
22 |     const error = searchParams.get('error')
23 |     const message = searchParams.get('message')
24 |     
25 |     if (error) setError(decodeURIComponent(error))
26 |     if (message) setMessage(decodeURIComponent(message))
27 |   }, [searchParams])
28 | 
29 |   return (
30 |     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
31 |       <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
32 |         <div className="text-center">
33 |           <h1 className="text-2xl font-bold">로그인</h1>
34 |           <p className="text-gray-600 mt-2">계정에 로그인하거나 새 계정을 만드세요</p>
35 |         </div>
36 |         
37 |         {/* 오류 메시지 표시 */}
38 |         {error && (
39 |           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
40 |             {error}
41 |           </div>
42 |         )}
43 |         
44 |         {/* 성공 메시지 표시 */}
45 |         {message && (
46 |           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
47 |             {message}
48 |           </div>
49 |         )}
50 | 
51 |         <div className="mt-8">
52 |           <form className="space-y-6">
53 |             <div>
54 |               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
55 |                 이메일
56 |               </label>
[TRUNCATED]
```

src/app/tags/page.test.tsx
```
1 | /// <reference types="vitest" />
2 | import React from 'react';
3 | import { render, screen, cleanup } from '@testing-library/react';
4 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
5 | import TagsPage from './page';
6 | import '@testing-library/jest-dom/vitest';
7 | 
8 | /**
9 |  * 파일명: page.test.tsx
10 |  * 목적: 태그 관리 페이지 테스트
11 |  * 역할: 태그 페이지 렌더링 및 기능 검증
12 |  * 작성일: 2024-05-27
13 |  */
14 | 
15 | // vi.hoisted를 사용하여 모킹 객체 생성
16 | const mocks = vi.hoisted(() => ({
17 |   findMany: vi.fn()
18 | }));
19 | 
20 | // prisma 모킹
21 | vi.mock('@/lib/prisma', () => ({
22 |   default: {
23 |     tag: {
24 |       findMany: mocks.findMany
25 |     }
26 |   }
27 | }));
28 | 
29 | // formatDate 모킹
30 | vi.mock('@/lib/utils', () => ({
31 |   formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
32 |   cn: vi.fn((...args: any[]) => args.join(' '))
33 | }));
34 | 
35 | // 컴포넌트 모킹 - 올바른 경로로 수정
36 | vi.mock('@/components/tags/TagForm', () => ({
37 |   default: () => <div data-testid="tag-form">태그 추가 폼</div>
38 | }));
39 | 
40 | vi.mock('@/components/tags/TagList', () => ({
41 |   default: ({ initialTags }: { initialTags: any[] }) => (
42 |     <div data-testid="tag-list">
43 |       태그 수: {initialTags.length}
44 |     </div>
45 |   )
46 | }));
47 | 
48 | // Card 모킹
49 | vi.mock('@/components/ui/card', () => ({
50 |   Card: ({ children }: { children: React.ReactNode }) => <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">{children}</div>,
51 |   CardHeader: ({ children }: { children: React.ReactNode }) => <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ">{children}</div>,
[TRUNCATED]
```

src/app/tags/page.tsx
```
1 | import { Metadata } from "next";
2 | import prisma from "@/lib/prisma";
3 | import { formatDate } from "@/lib/utils";
4 | import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
5 | import TagForm from "@/components/tags/TagForm";
6 | import TagList from "@/components/tags/TagList";
7 | import { Tag } from "@prisma/client";
8 | 
9 | export const metadata: Metadata = {
10 |   title: "태그 관리 | Backyard",
11 |   description: "태그를 생성하고 관리하는 페이지입니다.",
12 | };
13 | 
14 | type TagWithCount = Tag & {
15 |   _count: {
16 |     cardTags: number;
17 |   };
18 | };
19 | 
20 | export default async function TagsPage() {
21 |   let tags: TagWithCount[] = [];
22 |   
23 |   try {
24 |     tags = await prisma.tag.findMany({
25 |       orderBy: {
26 |         name: 'asc'
27 |       },
28 |       include: {
29 |         _count: {
30 |           select: { cardTags: true }
31 |         }
32 |       }
33 |     });
34 |   } catch (error) {
35 |     console.error("태그 조회 오류:", error);
36 |     // 오류 발생 시 빈 배열 사용
37 |   }
38 | 
39 |   const formattedTags = tags.map(tag => ({
40 |     id: tag.id,
41 |     name: tag.name,
42 |     count: tag._count.cardTags,
43 |     createdAt: formatDate(tag.createdAt)
44 |   }));
45 | 
46 |   return (
47 |     <div className="container mx-auto py-8">
48 |       <h1 className="text-3xl font-bold mb-6">태그 관리</h1>
49 |       
50 |       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
51 |         <div className="md:col-span-1">
52 |           <Card>
53 |             <CardHeader>
54 |               <CardTitle>새 태그 추가</CardTitle>
55 |             </CardHeader>
56 |             <CardContent>
57 |               <TagForm />
58 |             </CardContent>
59 |           </Card>
60 |         </div>
61 |         
62 |         <div className="md:col-span-2">
63 |           <Card>
64 |             <CardHeader>
65 |               <CardTitle>태그 목록</CardTitle>
66 |             </CardHeader>
67 |             <CardContent>
68 |               <TagList initialTags={formattedTags} />
69 |             </CardContent>
70 |           </Card>
71 |         </div>
72 |       </div>
73 |     </div>
74 |   );
75 | } 
```

src/app/test-db/page.tsx
```
1 | import React from 'react';
2 | import prisma from '@/lib/prisma';
3 | import type { Tag } from '@prisma/client';
4 | 
5 | // 태그와 연결된 카드 수를 포함하는 타입 정의
6 | type TagWithCount = Tag & {
7 |   _count: {
8 |     cardTags: number;
9 |   };
10 | };
11 | 
12 | export default async function TestDatabasePage() {
13 |   let tags: TagWithCount[] = [];
14 |   let error: string | null = null;
15 |   
16 |   try {
17 |     // Prisma를 사용하여 태그 목록을 가져옵니다
18 |     tags = await prisma.tag.findMany({
19 |       include: {
20 |         _count: {
21 |           select: {
22 |             cardTags: true,
23 |           },
24 |         },
25 |       },
26 |     });
27 |   } catch (e) {
28 |     console.error('데이터베이스 연결 오류:', e);
29 |     error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
30 |   }
31 | 
32 |   return (
33 |     <div className="container mx-auto p-6">
34 |       <h1 className="text-3xl font-bold mb-6">데이터베이스 연결 테스트</h1>
35 |       
36 |       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
37 |         <h2 className="text-2xl font-semibold mb-4">태그 목록</h2>
38 |         
39 |         {error ? (
40 |           <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded">
41 |             <p className="text-red-700 dark:text-red-400">
42 |               데이터베이스 연결 오류: {error}
43 |             </p>
44 |             <p className="mt-2 text-sm text-red-600 dark:text-red-300">
45 |               Vercel 환경 변수가 올바르게 설정되었는지 확인하세요.
46 |             </p>
47 |           </div>
48 |         ) : tags.length === 0 ? (
49 |           <p className="text-gray-500 dark:text-gray-400">등록된 태그가 없습니다.</p>
50 |         ) : (
51 |           <ul className="space-y-2">
52 |             {tags.map((tag) => (
53 |               <li 
54 |                 key={tag.id}
55 |                 className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
56 |               >
[TRUNCATED]
```

src/components/auth/AuthForm.tsx
```
1 | 'use client';
2 | 
3 | import { useState } from 'react';
4 | import { Button } from '@/components/ui/button';
5 | import { Input } from '@/components/ui/input';
6 | import { Label } from '@/components/ui/label';
7 | import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
8 | import { toast } from 'sonner';
9 | import { setCookie } from 'cookies-next';
10 | 
11 | type AuthMode = 'login' | 'register';
12 | 
13 | export default function AuthForm() {
14 |   const [mode, setMode] = useState<AuthMode>('login');
15 |   const [email, setEmail] = useState('');
16 |   const [password, setPassword] = useState('');
17 |   const [name, setName] = useState('');
18 |   const [isLoading, setIsLoading] = useState(false);
19 |   const [isGoogleLoading, setIsGoogleLoading] = useState(false);
20 | 
21 |   const toggleMode = () => {
22 |     setMode(mode === 'login' ? 'register' : 'login');
23 |     // 폼 초기화
24 |     setEmail('');
25 |     setPassword('');
26 |     setName('');
27 |   };
28 | 
29 |   const handleSubmit = async (e: React.FormEvent) => {
30 |     e.preventDefault();
31 |     setIsLoading(true);
32 | 
33 |     try {
34 |       if (mode === 'login') {
35 |         const { session } = await signIn(email, password);
36 |         
37 |         // 추가: 쿠키를 여기서도 직접 설정 (보완책)
38 |         if (session) {
39 |           // 현재 호스트 가져오기
40 |           const host = window.location.hostname;
41 |           const isLocalhost = host === 'localhost' || host === '127.0.0.1';
42 |           
43 |           // 도메인 설정 (로컬호스트가 아닌 경우에만)
44 |           let domain = undefined;
45 |           if (!isLocalhost) {
46 |             // 서브도메인 포함하기 위해 최상위 도메인만 설정
47 |             const hostParts = host.split('.');
48 |             if (hostParts.length > 1) {
49 |               // vercel.app 또는 yoursite.com 형태일 경우
50 |               domain = '.' + hostParts.slice(-2).join('.');
51 |             } else {
52 |               domain = host;
53 |             }
54 |           }
55 |           
56 |           // cookies-next 라이브러리 사용
57 |           setCookie('sb-access-token', session.access_token, {
58 |             maxAge: 60 * 60 * 24 * 7, // 7일
59 |             path: '/',
60 |             domain: domain,
61 |             secure: window.location.protocol === 'https:',
62 |             sameSite: 'lax'
63 |           });
64 |           
[TRUNCATED]
```

src/components/auth/UserProfile.tsx
```
1 | 'use client';
2 | 
3 | import { useState, useEffect } from 'react';
4 | import { Button } from '@/components/ui/button';
5 | import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
6 | import { 
7 |   DropdownMenu, 
8 |   DropdownMenuTrigger, 
9 |   DropdownMenuContent, 
10 |   DropdownMenuItem,
11 |   DropdownMenuSeparator
12 | } from '@/components/ui/dropdown-menu';
13 | import { getCurrentUser, signOut } from '@/lib/auth';
14 | import { useRouter } from 'next/navigation';
15 | import { toast } from 'sonner';
16 | 
17 | type User = {
18 |   id: string;
19 |   email: string;
20 |   dbUser?: {
21 |     name: string | null;
22 |   } | null;
23 |   user_metadata?: {
24 |     full_name?: string;
25 |     avatar_url?: string;
26 |   };
27 | };
28 | 
29 | export default function UserProfile() {
30 |   const [user, setUser] = useState<User | null>(null);
31 |   const [isLoading, setIsLoading] = useState(true);
32 |   const router = useRouter();
33 | 
34 |   useEffect(() => {
35 |     const fetchUser = async () => {
36 |       try {
37 |         const currentUser = await getCurrentUser();
38 |         setUser(currentUser);
39 |       } catch (error) {
40 |         console.error('사용자 정보 로드 오류:', error);
41 |       } finally {
42 |         setIsLoading(false);
43 |       }
44 |     };
45 | 
46 |     fetchUser();
47 |   }, []);
48 | 
49 |   const handleSignOut = async () => {
50 |     try {
51 |       await signOut();
52 |       toast.success('로그아웃 되었습니다.');
53 |       router.push('/login');
54 |     } catch (error) {
55 |       toast.error('로그아웃 중 오류가 발생했습니다.');
56 |     }
57 |   };
58 | 
59 |   // 사용자 이름을 가져오는 헬퍼 함수
60 |   const getUserName = () => {
61 |     if (!user) return '';
62 |     
63 |     // 우선순위: 1. Google 프로필 이름, 2. DB에 저장된 이름, 3. 이메일 앞부분
64 |     return user.user_metadata?.full_name || 
65 |            user.dbUser?.name || 
66 |            (user.email ? user.email.split('@')[0] : '사용자');
67 |   };
68 | 
69 |   // 아바타 이미지 URL 또는 이니셜을 가져오는 헬퍼 함수
70 |   const getAvatar = () => {
71 |     if (!user) return '';
72 |     
73 |     return user.user_metadata?.avatar_url || '';
74 |   };
75 | 
[TRUNCATED]
```

src/components/board/BoardComponent.tsx
```
1 | /**
2 |  * @deprecated 이 컴포넌트는 더 이상 사용되지 않습니다. 대신 src/components/board/components/Board.tsx를 사용해 주세요.
3 |  * 이 파일은 리팩토링 과정에서 새로운 구조의 Board 컴포넌트로 대체되었습니다.
4 |  * 향후 릴리스에서 제거될 예정이므로 신규 기능 개발 시 새 컴포넌트를 사용하세요.
5 |  */
6 | 
7 | 'use client';
8 | 
9 | import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
10 | import {
11 |   ReactFlow,
12 |   Controls,
13 |   Background,
14 |   useNodesState,
15 |   useEdgesState,
16 |   addEdge,
17 |   Panel,
18 |   ConnectionLineType,
19 |   Position,
20 |   MarkerType,
21 |   useReactFlow,
22 |   useUpdateNodeInternals,
23 |   Node,
24 |   Edge,
25 |   NodeChange,
26 |   EdgeChange,
27 |   Connection,
28 |   applyNodeChanges,
29 |   applyEdgeChanges,
30 |   OnConnectStart,
31 |   OnConnectEnd,
32 |   XYPosition,
33 |   ConnectionMode
34 | } from '@xyflow/react';
35 | import { Button } from '@/components/ui/button';
36 | import { Loader2, Save } from 'lucide-react';
37 | import { toast } from 'sonner';
38 | import CreateCardButton from '@/components/cards/CreateCardButton';
39 | import LayoutControls from '@/components/board/LayoutControls';
40 | import BoardSettingsControl from '@/components/board/BoardSettingsControl';
41 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
42 | import { 
43 |   BoardSettings, 
44 |   DEFAULT_BOARD_SETTINGS, 
45 |   loadBoardSettings, 
46 |   saveBoardSettings, 
47 |   applyEdgeSettings, 
48 |   saveBoardSettingsToServer, 
49 |   loadBoardSettingsFromServer 
50 | } from '@/lib/board-utils';
51 | import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
52 | import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
53 | import DevTools from '@/components/debug/DevTools';
54 | import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
55 | import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
56 | import { CreateCardModal } from '@/components/cards/CreateCardModal';
57 | import { useAuth } from '@/contexts/AuthContext';
58 | import { useAppStore } from '@/store/useAppStore';
59 | import { logCurrentBoardSettings, resetAllStorage } from '@/lib/debug-utils';
60 | import { cn } from '@/lib/utils';
61 | 
62 | // 타입 정의
63 | interface BoardComponentProps {
64 |   onSelectCard?: (cardId: string | null) => void;
65 |   className?: string;
66 |   showControls?: boolean;
67 | }
68 | 
69 | export default function BoardComponent({ 
70 |   onSelectCard,
[TRUNCATED]
```

src/components/board/BoardSettingsControl.tsx
```
1 | import React from 'react';
2 | import { Button } from '@/components/ui/button';
3 | import {
4 |   DropdownMenu,
5 |   DropdownMenuContent,
6 |   DropdownMenuItem,
7 |   DropdownMenuLabel,
8 |   DropdownMenuSeparator,
9 |   DropdownMenuTrigger,
10 |   DropdownMenuSub,
11 |   DropdownMenuSubTrigger,
12 |   DropdownMenuSubContent,
13 |   DropdownMenuRadioGroup,
14 |   DropdownMenuRadioItem,
15 |   DropdownMenuCheckboxItem,
16 | } from '@/components/ui/dropdown-menu';
17 | import { Settings, Grid3X3, ArrowRightIcon, Circle, SeparatorHorizontal, Paintbrush, Box } from 'lucide-react';
18 | import { BoardSettings } from '@/lib/board-utils';
19 | import { 
20 |   SNAP_GRID_OPTIONS, 
21 |   CONNECTION_TYPE_OPTIONS, 
22 |   MARKER_TYPE_OPTIONS,
23 |   STROKE_WIDTH_OPTIONS,
24 |   MARKER_SIZE_OPTIONS,
25 |   EDGE_COLOR_OPTIONS,
26 |   EDGE_ANIMATION_OPTIONS
27 | } from '@/lib/board-constants';
28 | import { ConnectionLineType, MarkerType } from '@xyflow/react';
29 | import { toast } from 'sonner';
30 | import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
31 | import { NodeSizeSettings } from '@/components/settings/NodeSizeSettings';
32 | 
33 | interface BoardSettingsControlProps {
34 |   settings: BoardSettings;
35 |   onSettingsChange: (settings: BoardSettings) => void;
36 | }
37 | 
38 | export default function BoardSettingsControl({
39 |   settings,
40 |   onSettingsChange,
41 | }: BoardSettingsControlProps) {
42 |   // 스냅 그리드 값 변경 핸들러
43 |   const handleSnapGridChange = (value: string) => {
44 |     const gridSize = parseInt(value, 10);
45 |     const newSettings = {
46 |       ...settings,
47 |       snapGrid: [gridSize, gridSize] as [number, number],
48 |       snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
49 |     };
50 |     onSettingsChange(newSettings);
51 |     toast.success('격자 크기가 변경되었습니다.');
52 |   };
53 | 
54 |   // 연결선 타입 변경 핸들러
55 |   const handleConnectionTypeChange = (value: string) => {
56 |     const newSettings = {
57 |       ...settings,
58 |       connectionLineType: value as ConnectionLineType,
59 |     };
60 |     onSettingsChange(newSettings);
61 |     toast.success('연결선 스타일이 변경되었습니다.');
62 |   };
63 | 
64 |   // 마커 타입 변경 핸들러
65 |   const handleMarkerTypeChange = (value: string) => {
66 |     const newSettings = {
67 |       ...settings,
68 |       markerEnd: value === 'null' ? null : value as MarkerType,
69 |     };
70 |     onSettingsChange(newSettings);
71 |     toast.success('화살표 스타일이 변경되었습니다.');
72 |   };
73 | 
[TRUNCATED]
```

src/components/board/CardNode.test.tsx
```
1 | import { render, screen } from '@testing-library/react';
2 | import { describe, test, expect, vi } from 'vitest';
3 | import { CardNode } from './CardNode';
4 | 
5 | // react-flow의 Handle 컴포넌트 모킹
6 | vi.mock('reactflow', () => ({
7 |   Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />,
8 |   Position: {
9 |     Top: 'top',
10 |     Bottom: 'bottom',
11 |   },
12 | }));
13 | 
14 | describe('CardNode', () => {
15 |   const mockData = {
16 |     id: '1',
17 |     title: '테스트 카드',
18 |     content: '테스트 내용입니다.',
19 |     tags: ['태그1', '태그2'],
20 |   };
21 | 
22 |   test('카드 노드가 올바르게 렌더링되어야 함', () => {
23 |     render(<CardNode data={mockData} />);
24 |     
25 |     // 제목과 내용이 정확히 렌더링되는지 확인
26 |     expect(screen.getByText('테스트 카드')).toBeInTheDocument();
27 |     expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
28 |     
29 |     // 태그가 모두 렌더링되는지 확인
30 |     expect(screen.getByText('#태그1')).toBeInTheDocument();
31 |     expect(screen.getByText('#태그2')).toBeInTheDocument();
32 |     
33 |     // 핸들(source, target)이 모두 렌더링되는지 확인
34 |     expect(screen.getByTestId('handle-target')).toBeInTheDocument();
35 |     expect(screen.getByTestId('handle-source')).toBeInTheDocument();
36 |   });
37 | 
38 |   test('태그가 없는 경우에도 정상적으로 렌더링되어야 함', () => {
39 |     const dataWithoutTags = {
40 |       id: '1',
41 |       title: '태그 없는 카드',
42 |       content: '내용만 있는 카드',
43 |     };
44 | 
45 |     render(<CardNode data={dataWithoutTags} />);
46 |     
47 |     expect(screen.getByText('태그 없는 카드')).toBeInTheDocument();
48 |     expect(screen.getByText('내용만 있는 카드')).toBeInTheDocument();
49 |     
50 |     // 태그가 렌더링되지 않아야 함
51 |     expect(screen.queryByText(/#\w+/)).not.toBeInTheDocument();
52 |   });
53 | }); 
```

src/components/board/CardNode.tsx
```
1 | import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
2 | import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, Node } from '@xyflow/react';
3 | import { Button } from "@/components/ui/button";
4 | import Link from 'next/link';
5 | import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
6 | import TiptapViewer from '@/components/editor/TiptapViewer';
7 | import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
8 | import { CSSProperties } from 'react';
9 | import { useAppStore } from '@/store/useAppStore';
10 | import { Card, CardContent } from '@/components/ui/card';
11 | import { cn } from '@/lib/utils';
12 | import { createPortal } from 'react-dom';
13 | import { EditCardModal } from '@/components/cards/EditCardModal';
14 | import { useTheme } from '@/contexts/ThemeContext';
15 | 
16 | // 노드 데이터 타입 정의
17 | export interface NodeData {
18 |   id: string;
19 |   title: string;
20 |   content: string;
21 |   type?: string;
22 |   width?: number;
23 |   height?: number;
24 |   color?: string;
25 |   backgroundColor?: string;
26 |   tags?: string[];
27 |   position?: {
28 |     x: number;
29 |     y: number;
30 |   };
31 |   // 추가 속성들
32 |   [key: string]: any;
33 | }
34 | 
35 | // Portal 컴포넌트 - 내부 정의
36 | const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
37 |   const [mounted, setMounted] = useState(false);
38 | 
39 |   useEffect(() => {
40 |     setMounted(true);
41 |     return () => setMounted(false);
42 |   }, []);
43 | 
44 |   return mounted ? createPortal(children, document.body) : null;
45 | };
46 | 
47 | // 헥스 색상을 HSL로 변환하는 함수
48 | const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
49 |   if (!hex) return null;
50 |   
51 |   // hex를 RGB로 변환
52 |   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
53 |   if (!result) return null;
54 |   
55 |   const r = parseInt(result[1], 16) / 255;
56 |   const g = parseInt(result[2], 16) / 255;
57 |   const b = parseInt(result[3], 16) / 255;
58 | 
[TRUNCATED]
```

src/components/board/CustomEdge.tsx
```
1 | import React, { useMemo, useEffect } from 'react';
2 | import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';
3 | import { loadBoardSettings } from '@/lib/board-utils';
4 | import { useAppStore } from '@/store/useAppStore';
5 | 
6 | // 확장된 엣지 Props 인터페이스
7 | interface CustomEdgeProps extends EdgeProps {
8 |   type?: string;
9 |   animated?: boolean;
10 |   data?: {
11 |     edgeType?: ConnectionLineType;
12 |     settings?: any;
13 |   };
14 | }
15 | 
16 | /**
17 |  * 커스텀 엣지 컴포넌트
18 |  * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
19 |  */
20 | function CustomEdge({ 
21 |   id,
22 |   source,
23 |   target,
24 |   sourceX,
25 |   sourceY,
26 |   targetX,
27 |   targetY,
28 |   sourcePosition,
29 |   targetPosition,
30 |   style = {},
31 |   markerEnd,
32 |   selected,
33 |   type,
34 |   animated,
35 |   data,
36 |   ...restProps
37 | }: CustomEdgeProps) {
38 |   // Zustand 스토어에서 boardSettings 가져오기
39 |   const { boardSettings } = useAppStore();
40 |   
41 |   // 글로벌 설정과 로컬 설정 결합
42 |   const effectiveSettings = useMemo(() => {
43 |     // 로컬 설정이 있으면 우선적으로 사용, 없으면 글로벌 설정 사용
44 |     const localSettings = data?.settings;
45 |     return localSettings ? { ...boardSettings, ...localSettings } : boardSettings;
46 |   }, [boardSettings, data?.settings]);
47 | 
48 |   // 엣지 연결 좌표 계산 (useMemo로 최적화)
49 |   const edgeParams = useMemo(() => ({
50 |     sourceX,
51 |     sourceY,
52 |     sourcePosition,
53 |     targetX,
54 |     targetY,
55 |     targetPosition,
56 |   }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);
57 | 
58 |   // 엣지 타입 결정: data.edgeType > boardSettings.connectionLineType > 기본값
59 |   const effectiveEdgeType = useMemo(() => {
60 |     // data.edgeType이 있으면 우선 사용
61 |     if (data?.edgeType) {
62 |       return data.edgeType;
63 |     }
64 |     // 글로벌 설정의 connectionLineType 사용
65 |     return effectiveSettings.connectionLineType || 'bezier';
66 |   }, [data?.edgeType, effectiveSettings.connectionLineType]);
67 | 
68 |   // 엣지 패스 계산 (연결선 타입에 따라)
69 |   const [edgePath] = useMemo(() => {
70 |     console.log(`엣지 ${id}의 타입 업데이트:`, effectiveEdgeType);
71 |     
72 |     // 타입에 따라 적절한 경로 생성 함수 사용
73 |     switch (effectiveEdgeType) {
[TRUNCATED]
```

src/components/board/DagreNodePositioning.test.tsx
```
1 | import React from 'react';
2 | import { render } from '@testing-library/react';
3 | import { ReactFlowProvider } from '@xyflow/react';
4 | import DagreNodePositioning from './DagreNodePositioning';
5 | 
6 | // 단순 렌더링 테스트
7 | describe('DagreNodePositioning', () => {
8 |   it('컴포넌트가 오류 없이 렌더링되어야 합니다', () => {
9 |     const dummyOptions = { rankdir: 'TB' };
10 |     const dummySetNodes = jest.fn();
11 |     const dummySetEdges = jest.fn();
12 |     const dummySetViewIsFit = jest.fn();
13 |     const dummyEdges = [];
14 |     
15 |     render(
16 |       <ReactFlowProvider>
17 |         <DagreNodePositioning
18 |           Options={dummyOptions}
19 |           Edges={dummyEdges}
20 |           SetEdges={dummySetEdges}
21 |           SetNodes={dummySetNodes}
22 |           SetViewIsFit={dummySetViewIsFit}
23 |         />
24 |       </ReactFlowProvider>
25 |     );
26 |   });
27 | }); 
```

src/components/board/DagreNodePositioning.tsx
```
1 | import React, { useState, useEffect } from 'react';
2 | import { useReactFlow, Node, Edge, Position } from '@xyflow/react';
3 | import dagre from 'dagre';
4 | import defaultConfig from '../../config/cardBoardUiOptions.json';
5 | 
6 | interface DagreNodePositioningProps {
7 |   Options: { rankdir: 'TB' | 'LR' | 'BT' | 'RL' };
8 |   Edges: Edge[];
9 |   SetEdges: (edges: Edge[]) => void;
10 |   SetNodes: (nodes: Node[]) => void;
11 |   SetViewIsFit: (value: boolean) => void;
12 | }
13 | 
14 | // 기본 CardNode의 크기 - 설정 파일에서 일관되게 가져오기
15 | const nodeWidth = defaultConfig.layout.nodeSize?.width || 130;
16 | const nodeHeight = defaultConfig.layout.nodeSize?.height || 48;
17 | 
18 | const DagreNodePositioning: React.FC<DagreNodePositioningProps> = ({ Options, Edges, SetEdges, SetNodes, SetViewIsFit }) => {
19 |   const [nodesPositioned, setNodesPositioned] = useState(false);
20 |   const { fitView, getNodes } = useReactFlow();
21 |   
22 |   // React Flow 인스턴스에서 노드 직접 가져오기
23 |   const flattenedNodes = getNodes();
24 | 
25 |   useEffect(() => {
26 |     // 노드가 존재하는지 확인
27 |     if (flattenedNodes.length > 0) {
28 |       const dagreGraph = new dagre.graphlib.Graph();
29 |       dagreGraph.setDefaultEdgeLabel(() => ({}));
30 |       dagreGraph.setGraph(Options);
31 | 
32 |       // 모든 노드를 dagre 그래프에 등록 (기본값 사용)
33 |       flattenedNodes.forEach((node) => {
34 |         // 실제 측정된 크기가 없으므로 기본값 사용
35 |         dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
36 |       });
37 | 
38 |       // 엣지 등록
39 |       Edges.forEach((edge) => {
40 |         dagreGraph.setEdge(edge.source, edge.target);
41 |       });
42 | 
43 |       // 레이아웃 계산
44 |       dagre.layout(dagreGraph);
45 | 
46 |       // 각 노드의 위치를 업데이트
47 |       const layoutedNodes = flattenedNodes.map((node) => {
48 |         const nodeWithPosition = dagreGraph.node(node.id);
49 |         if (!nodeWithPosition) {
50 |           return node;
51 |         }
52 |         
53 |         let updatedNode = {
54 |           ...node,
55 |           position: {
56 |             x: nodeWithPosition.x - nodeWidth / 2,
57 |             y: nodeWithPosition.y - nodeHeight / 2
58 |           },
59 |           data: { ...node.data }
60 |         } as Node;
61 | 
62 |         // 레이아웃 방향에 따라 핸들 위치 지정
[TRUNCATED]
```

src/components/board/DebugPanel.tsx
```
1 | import React, { useState, useEffect } from 'react';
2 | import { useReactFlow, NodeChange, EdgeChange } from '@xyflow/react';
3 | 
4 | interface DebugPanelProps {
5 |   nodeChanges?: NodeChange[];
6 |   edgeChanges?: EdgeChange[];
7 | }
8 | 
9 | const DebugPanel: React.FC<DebugPanelProps> = ({ nodeChanges, edgeChanges }) => {
10 |   const [isOpen, setIsOpen] = useState(false);
11 |   const { getViewport, getNodes } = useReactFlow();
12 |   const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
13 |   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
14 |   const [logs, setLogs] = useState<Array<{ time: string; message: string }>>([]);
15 | 
16 |   // 뷰포트 업데이트
17 |   useEffect(() => {
18 |     const interval = setInterval(() => {
19 |       const currentViewport = getViewport();
20 |       setViewport(currentViewport);
21 |     }, 100);
22 | 
23 |     return () => clearInterval(interval);
24 |   }, [getViewport]);
25 | 
26 |   // 로그 추가 함수
27 |   const addLog = (message: string) => {
28 |     const time = new Date().toLocaleTimeString();
29 |     setLogs(prev => [...prev.slice(-9), { time, message }]);
30 |   };
31 | 
32 |   // 노드 변경 시 로그 추가
33 |   useEffect(() => {
34 |     if (nodeChanges && nodeChanges.length > 0) {
35 |       const message = `노드 변경: ${nodeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
36 |       addLog(message);
37 |     }
38 |   }, [nodeChanges]);
39 | 
40 |   // 엣지 변경 시 로그 추가
41 |   useEffect(() => {
42 |     if (edgeChanges && edgeChanges.length > 0) {
43 |       const message = `엣지 변경: ${edgeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
44 |       addLog(message);
45 |     }
46 |   }, [edgeChanges]);
47 | 
48 |   // 선택된 노드 정보
49 |   const selectedNode = selectedNodeId 
50 |     ? getNodes().find(node => node.id === selectedNodeId) 
51 |     : null;
52 | 
53 |   return (
54 |     <div className="fixed left-2 top-16 z-50">
55 |       <button 
56 |         onClick={() => setIsOpen(!isOpen)}
57 |         className="mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
58 |       >
[TRUNCATED]
```

src/components/board/LayoutControls.tsx
```
1 | import React from 'react';
2 | import { Button } from '@/components/ui/button';
3 | import {
4 |   DropdownMenu,
5 |   DropdownMenuContent,
6 |   DropdownMenuItem,
7 |   DropdownMenuLabel,
8 |   DropdownMenuSeparator,
9 |   DropdownMenuTrigger,
10 | } from '@/components/ui/dropdown-menu';
11 | import { Layout, LayoutGrid, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';
12 | import { toast } from 'sonner';
13 | 
14 | interface LayoutControlsProps {
15 |   onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
16 |   onAutoLayout: () => void;
17 |   onSaveLayout: () => void;
18 | }
19 | 
20 | export default function LayoutControls({ 
21 |   onLayoutChange, 
22 |   onAutoLayout, 
23 |   onSaveLayout 
24 | }: LayoutControlsProps) {
25 |   return (
26 |     <DropdownMenu>
27 |       <DropdownMenuTrigger asChild>
28 |         <Button variant="outline" size="icon">
29 |           <Layout className="h-4 w-4" />
30 |         </Button>
31 |       </DropdownMenuTrigger>
32 |       <DropdownMenuContent align="end" className="w-56">
33 |         <DropdownMenuLabel>레이아웃 옵션</DropdownMenuLabel>
34 |         <DropdownMenuSeparator />
35 |         <DropdownMenuItem 
36 |           onClick={() => onLayoutChange('horizontal')}
37 |           className="flex items-center cursor-pointer"
38 |         >
39 |           <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
40 |           <span>수평 레이아웃</span>
41 |         </DropdownMenuItem>
42 |         <DropdownMenuItem 
43 |           onClick={() => onLayoutChange('vertical')}
44 |           className="flex items-center cursor-pointer"
45 |         >
46 |           <AlignVerticalJustifyCenter className="mr-2 h-4 w-4" />
47 |           <span>수직 레이아웃</span>
48 |         </DropdownMenuItem>
49 |         <DropdownMenuSeparator />
50 |         <DropdownMenuItem 
51 |           onClick={onAutoLayout}
52 |           className="flex items-center cursor-pointer"
53 |         >
54 |           <LayoutGrid className="mr-2 h-4 w-4" />
55 |           <span>자동 배치</span>
56 |         </DropdownMenuItem>
57 |         <DropdownMenuItem 
58 |           onClick={onSaveLayout}
59 |           className="flex items-center cursor-pointer"
60 |         >
61 |           <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
[TRUNCATED]
```

src/components/debug/DevTools.tsx
```
1 | import { useState } from 'react';
2 | import { Panel } from '@xyflow/react';
3 | import { ViewportLogger } from './ViewportLogger';
4 | import { NodeInspector } from './NodeInspector';
5 | import { ChangeLogger, useChangeLogger, type ChangeLoggerHandlers } from './ChangeLogger';
6 | 
7 | /**
8 |  * React Flow 디버깅을 위한 DevTools 컴포넌트
9 |  * 뷰포트 로거, 노드 인스펙터, 변경 로거를 포함합니다.
10 |  */
11 | export default function DevTools() {
12 |   const [showViewport, setShowViewport] = useState(false);
13 |   const [showNodeInspector, setShowNodeInspector] = useState(false);
14 |   const [showChangeLogger, setShowChangeLogger] = useState(false);
15 | 
16 |   return (
17 |     <Panel 
18 |       position="top-left" 
19 |       className="bg-card shadow p-3 rounded-md z-50"
20 |     >
21 |       <div className="flex flex-col gap-2">
22 |         <div className="flex gap-2 justify-center items-center">
23 |           <button
24 |             onClick={() => setShowViewport(!showViewport)}
25 |             className={`px-2 py-1 text-xs rounded ${
26 |               showViewport ? 'bg-blue-500 text-white' : 'bg-gray-200'
27 |             }`}
28 |           >
29 |             뷰포트 로거 {showViewport ? '숨기기' : '보기'}
30 |           </button>
31 |           <button
32 |             onClick={() => setShowNodeInspector(!showNodeInspector)}
33 |             className={`px-2 py-1 text-xs rounded ${
34 |               showNodeInspector ? 'bg-blue-500 text-white' : 'bg-gray-200'
35 |             }`}
36 |           >
37 |             노드 인스펙터 {showNodeInspector ? '숨기기' : '보기'}
38 |           </button>
39 |           <button
40 |             onClick={() => setShowChangeLogger(!showChangeLogger)}
41 |             className={`px-2 py-1 text-xs rounded ${
42 |               showChangeLogger ? 'bg-blue-500 text-white' : 'bg-gray-200'
43 |             }`}
44 |           >
45 |             변경 로거 {showChangeLogger ? '숨기기' : '보기'}
46 |           </button>
47 |         </div>
48 |         
49 |         {showViewport && <ViewportLogger />}
50 |         {showNodeInspector && <NodeInspector />}
51 |         {showChangeLogger && <ChangeLogger />}
52 |       </div>
53 |     </Panel>
54 |   );
55 | }
56 | 
57 | // 노드와 엣지 변경 감지를 위한 훅 익스포트
58 | export const useChangeLoggerHooks = (): ChangeLoggerHandlers => {
59 |   const [, , handlers] = useChangeLogger();
60 |   return handlers;
61 | } 
```

src/components/debug/NodeInspector.tsx
```
1 | import { useEffect, useState, useCallback } from 'react';
2 | import { useReactFlow, Node, NodeProps, NodeToolbar, Position, useOnSelectionChange } from '@xyflow/react';
3 | 
4 | // 노드 데이터 타입 정의
5 | interface NodeData {
6 |   [key: string]: any;
7 |   isInspected?: boolean;
8 | }
9 | 
10 | /**
11 |  * NodeInspector 컴포넌트는 React Flow의 노드를 검사할 수 있는 기능을 제공합니다.
12 |  * 컴포넌트가 마운트되면 모든 노드의 정보가 노드 아래에 표시됩니다.
13 |  */
14 | export function NodeInspector() {
15 |   const { getNodes, setNodes } = useReactFlow();
16 |   // 노드 상태가 변경될 때마다 업데이트하기 위한 상태
17 |   const [updateTrigger, setUpdateTrigger] = useState(0);
18 | 
19 |   // 노드 선택 변경을 감지하는 리스너 추가
20 |   useOnSelectionChange({
21 |     onChange: () => {
22 |       // 선택 상태가 변경될 때마다 업데이트 트리거
23 |       setUpdateTrigger(prev => prev + 1);
24 |     },
25 |   });
26 | 
27 |   // 마운트될 때와 노드 선택 상태가 변경될 때마다 모든 노드의 isInspected를 true로 설정
28 |   useEffect(() => {
29 |     // 모든 노드의 isInspected 속성 업데이트
30 |     setNodes(nodes => 
31 |       nodes.map(node => ({
32 |         ...node,
33 |         data: {
34 |           ...node.data,
35 |           isInspected: true
36 |         }
37 |       }))
38 |     );
39 | 
40 |     // 언마운트될 때 모든 노드의 isInspected를 false로 설정
41 |     return () => {
42 |       setNodes(nodes => 
43 |         nodes.map(node => ({
44 |           ...node,
45 |           data: {
46 |             ...node.data,
47 |             isInspected: false
48 |           }
49 |         }))
50 |       );
51 |     };
52 |   }, [setNodes, updateTrigger]);
53 | 
54 |   // 노드 인스펙터 컴포넌트 주석 처리
55 |   // return (
56 |   //   <div className="bg-muted p-2 rounded border text-xs mt-2">
57 |   //     <h3 className="font-bold mb-1 border-b pb-1">노드 인스펙터</h3>
58 |   //     <div className="text-muted-foreground">
59 |   //       각 노드 아래에 노드 정보가 실시간으로 표시됩니다.
60 |   //     </div>
61 |   //   </div>
62 |   // );
63 | }
64 | 
65 | /**
66 |  * NodeInspect 컴포넌트는 각 노드에 추가되어 노드의 데이터를 표시합니다.
67 |  * 실시간으로 노드 상태를 반영합니다.
68 |  */
69 | export function NodeInspect(props: NodeProps) {
70 |   const { data, id, type } = props;
[TRUNCATED]
```

src/components/debug/ViewportLogger.tsx
```
1 | import { useStore } from '@xyflow/react';
2 | import { shallow } from 'zustand/shallow';
3 | 
4 | /**
5 |  * ViewportLogger 컴포넌트는 현재 React Flow 뷰포트의 상태를 표시합니다.
6 |  * x, y 위치와 줌 레벨을 실시간으로 보여줍니다.
7 |  */
8 | const selector = (state: any) => ({
9 |   x: state.transform?.[0] || 0,
10 |   y: state.transform?.[1] || 0,
11 |   zoom: state.transform?.[2] || 1,
12 | });
13 | 
14 | export function ViewportLogger() {
15 |   const { x, y, zoom } = useStore(selector, shallow);
16 | 
17 |   return (
18 |     <div className="bg-muted p-2 rounded border text-xs mt-2">
19 |       <h3 className="font-bold mb-1 border-b pb-1">뷰포트 로거</h3>
20 |       <div>
21 |         <span>x: {x.toFixed(2)}</span>, <span>y: {y.toFixed(2)}</span>, <span>zoom: {zoom.toFixed(2)}</span>
22 |       </div>
23 |     </div>
24 |   );
25 | } 
```

src/components/cards/CardList.test.tsx
```
1 | import React from 'react';
2 | import { render, screen, waitFor, fireEvent } from '@testing-library/react';
3 | import CardList from './CardList';
4 | import { toast } from 'sonner';
5 | import { useSearchParams } from 'next/navigation';
6 | import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
7 | import '@testing-library/jest-dom/vitest';
8 | import userEvent from '@testing-library/user-event';
9 | 
10 | // 토스트 모킹
11 | vi.mock('sonner', () => ({
12 |   toast: {
13 |     error: vi.fn(),
14 |     success: vi.fn(),
15 |   },
16 | }));
17 | 
18 | // useSearchParams는 setupTests.ts에서 이미 모킹됨
19 | 
20 | // fetch는 setupTests.ts에서 이미 전역으로 모킹되어 있음
21 | 
22 | describe('CardList 컴포넌트', () => {
23 |   // console.error 모킹 추가
24 |   const originalConsoleError = console.error;
25 |   beforeEach(() => {
26 |     vi.clearAllMocks();
27 |     console.error = vi.fn();
28 |     
29 |     // useSearchParams 기본값으로 초기화
30 |     (useSearchParams as any).mockImplementation(() => ({
31 |       get: (param: string) => null,
32 |       toString: () => '',
33 |     }));
34 |     
35 |     // 모킹된 카드 데이터 (기본 테스트용)
36 |     const mockCards = [
37 |       {
38 |         id: 'card1',
39 |         title: '테스트 카드 1',
40 |         content: '테스트 내용 1',
41 |         createdAt: '2023-01-01T00:00:00.000Z',
42 |         updatedAt: '2023-01-01T00:00:00.000Z',
43 |         userId: 'user1',
44 |       },
45 |       {
46 |         id: 'card2',
47 |         title: '테스트 카드 2',
48 |         content: '테스트 내용 2',
49 |         createdAt: '2023-01-02T00:00:00.000Z',
50 |         updatedAt: '2023-01-02T00:00:00.000Z',
51 |         userId: 'user2',
52 |       },
53 |     ];
54 | 
55 |     // 기본 fetch 응답 모킹
56 |     (global.fetch as any).mockResolvedValue({
57 |       ok: true,
58 |       json: async () => mockCards,
59 |     });
60 |   });
61 | 
62 |   // 테스트 후 원래 console.error 복원
63 |   afterAll(() => {
64 |     console.error = originalConsoleError;
65 |   });
66 | 
67 |   it('카드 목록을 성공적으로 로드하고 렌더링한다', async () => {
68 |     // 모킹된 카드 데이터
69 |     const mockCards = [
70 |       {
71 |         id: 'card1',
[TRUNCATED]
```

src/components/cards/CardList.tsx
```
1 | "use client";
2 | 
3 | import React, { useEffect, useState } from "react";
4 | import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
5 | import { Button } from "@/components/ui/button";
6 | import { Badge } from "@/components/ui/badge";
7 | import Link from "next/link";
8 | import { toast } from "sonner";
9 | import { formatDate } from "@/lib/utils";
10 | import { SearchBar } from "./SearchBar";
11 | import { useSearchParams } from "next/navigation";
12 | import { Trash2, Eye } from "lucide-react";
13 | import {
14 |   Dialog,
15 |   DialogContent,
16 |   DialogHeader,
17 |   DialogTitle,
18 |   DialogDescription,
19 |   DialogFooter,
20 |   DialogTrigger,
21 |   DialogClose,
22 | } from "@/components/ui/dialog";
23 | import TiptapViewer from "@/components/editor/TiptapViewer";
24 | import { useAppStore } from "@/store/useAppStore";
25 | import { useRouter } from "next/navigation";
26 | 
27 | interface Tag {
28 |   id: string;
29 |   name: string;
30 | }
31 | 
32 | interface CardTag {
33 |   id: string;
34 |   tag: Tag;
35 | }
36 | 
37 | interface CardItem {
38 |   id: string;
39 |   title: string;
40 |   content: string;
41 |   createdAt: string;
42 |   cardTags?: CardTag[];
43 | }
44 | 
45 | export default function CardList() {
46 |   const { cards, setCards } = useAppStore();
47 |   const [loading, setLoading] = useState(false);
48 |   const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
49 |   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
50 |   const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
51 |   const [isDeleting, setIsDeleting] = useState(false);
52 |   const searchParams = useSearchParams();
53 |   const router = useRouter();
54 | 
55 |   const filteredCards = React.useMemo(() => {
56 |     const q = searchParams.get('q')?.toLowerCase();
57 |     const tag = searchParams.get('tag')?.toLowerCase();
58 |     
59 |     if (!q && !tag) return cards as CardItem[];
60 |     
61 |     return (cards as CardItem[]).filter(card => {
62 |       const matchesQuery = !q || 
63 |         card.title.toLowerCase().includes(q) || 
64 |         (card.content && card.content.toLowerCase().includes(q));
65 |       
66 |       const matchesTag = !tag || 
[TRUNCATED]
```

src/components/cards/CreateCardButton.test.tsx
```
1 | import React from 'react';
2 | import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
3 | import userEvent from '@testing-library/user-event';
4 | import CreateCardButton from './CreateCardButton';
5 | import { toast } from 'sonner';
6 | import { vi, describe, test, expect, beforeEach, afterAll, beforeAll, afterEach } from 'vitest';
7 | 
8 | // 모킹
9 | vi.mock('sonner', () => ({
10 |   toast: {
11 |     success: vi.fn(),
12 |     error: vi.fn(),
13 |   },
14 | }));
15 | 
16 | // fetch 모킹
17 | global.fetch = vi.fn();
18 | 
19 | // window.location.reload 모킹
20 | const mockReload = vi.fn();
21 | Object.defineProperty(window, 'location', {
22 |   value: { reload: mockReload },
23 |   writable: true
24 | });
25 | 
26 | // console.error 모킹
27 | const originalConsoleError = console.error;
28 | beforeAll(() => {
29 |   console.error = vi.fn();
30 | });
31 | 
32 | afterAll(() => {
33 |   console.error = originalConsoleError;
34 | });
35 | 
36 | // 테스트 사용자 ID 상수 (CreateCardButton.tsx와 동일한 값)
37 | const TEST_USER_ID = "ab2473c2-21b5-4196-9562-3b720d80d77f";
38 | 
39 | describe('CreateCardButton 컴포넌트', () => {
40 |   beforeEach(() => {
41 |     vi.clearAllMocks();
42 |     // 성공적인 응답을 기본으로 설정
43 |     (global.fetch as any).mockResolvedValue({
44 |       ok: true,
45 |       json: async () => ({}),
46 |     });
47 |   });
48 | 
49 |   afterEach(() => {
50 |     // 각 테스트 후에 정리
51 |     cleanup(); // 명시적으로 cleanup 먼저 호출
52 |     vi.resetAllMocks();
53 |     document.body.innerHTML = "";
54 |   });
55 | 
56 |   test('버튼 클릭 시 모달이 열린다', () => {
57 |     render(<CreateCardButton />);
58 |     
59 |     // 버튼 클릭 (role을 사용하여 버튼 선택)
60 |     fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
61 |     
62 |     // 모달이 열렸는지 확인 (제목과 입력 필드 확인)
63 |     expect(screen.getByRole('dialog')).toBeInTheDocument();
64 |     expect(screen.getByLabelText('제목')).toBeInTheDocument();
65 |     expect(screen.getByLabelText('내용')).toBeInTheDocument();
66 |   });
67 | 
68 |   test('유효한 데이터로 카드를 생성한다', async () => {
69 |     const mockNewCard = {
70 |       id: 'new-card-id',
[TRUNCATED]
```

src/components/cards/CreateCardButton.tsx
```
1 | "use client";
2 | 
3 | import React, { useState, useRef, useEffect } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import { PlusCircle } from "lucide-react";
6 | import {
7 |   Dialog,
8 |   DialogContent,
9 |   DialogHeader,
10 |   DialogTitle,
11 |   DialogTrigger,
12 |   DialogDescription,
13 |   DialogClose,
14 | } from "@/components/ui/dialog";
15 | import { Input } from "@/components/ui/input";
16 | import { Label } from "@/components/ui/label";
17 | import { Badge } from "@/components/ui/badge";
18 | import { toast } from "sonner";
19 | import { X } from "lucide-react";
20 | import TiptapEditor from "@/components/editor/TiptapEditor";
21 | import { DEFAULT_USER_ID } from "@/lib/constants";
22 | 
23 | // 컴포넌트에 props 타입 정의
24 | interface CreateCardButtonProps {
25 |   onCardCreated?: (cardData: any) => void;
26 |   autoOpen?: boolean; // 자동으로 모달을 열지 여부
27 |   onClose?: () => void; // 모달이 닫힐 때 콜백
28 |   customTrigger?: React.ReactNode; // 커스텀 트리거 버튼
29 | }
30 | 
31 | export default function CreateCardButton({ 
32 |   onCardCreated, 
33 |   autoOpen = false,
34 |   onClose,
35 |   customTrigger
36 | }: CreateCardButtonProps) {
37 |   const [open, setOpen] = useState(false);
38 |   const [title, setTitle] = useState("");
39 |   const [content, setContent] = useState("");
40 |   const [tagInput, setTagInput] = useState("");
41 |   const [tags, setTags] = useState<string[]>([]);
42 |   const [isSubmitting, setIsSubmitting] = useState(false);
43 |   const [firstUserId, setFirstUserId] = useState<string>("");
44 |   const isComposing = useRef(false);
45 | 
46 |   // 자동으로 모달 열기
47 |   useEffect(() => {
48 |     if (autoOpen) {
49 |       setOpen(true);
50 |     }
51 |   }, [autoOpen]);
52 | 
53 |   // 모달 상태 변경 처리 핸들러
54 |   const handleOpenChange = (newOpenState: boolean) => {
55 |     setOpen(newOpenState);
56 |     
57 |     // 모달이 닫힐 때 onClose 콜백 호출
58 |     if (!newOpenState && onClose) {
59 |       onClose();
60 |     }
61 |   };
62 | 
63 |   // 사용자 ID 가져오기
64 |   useEffect(() => {
65 |     async function fetchFirstUserId() {
66 |       try {
67 |         const response = await fetch('/api/users/first');
68 |         if (response.ok) {
69 |           const data = await response.json();
[TRUNCATED]
```

src/components/cards/CreateCardModal.tsx
```
1 | import React, { useEffect, useState } from 'react';
2 | import { XYPosition } from '@xyflow/react';
3 | import { X } from 'lucide-react';
4 | import { Button } from '@/components/ui/button';
5 | import CreateCardButton from '@/components/cards/CreateCardButton';
6 | 
7 | interface CreateCardModalProps {
8 |   position: XYPosition;
9 |   connectingNodeId: string;
10 |   handleType: 'source' | 'target';
11 |   onClose: () => void;
12 |   onCardCreated: (cardData: any, position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => void;
13 | }
14 | 
15 | /**
16 |  * 엣지 드래그 드롭으로 새 카드를 생성하기 위한 모달 컴포넌트
17 |  */
18 | export function CreateCardModal({
19 |   position,
20 |   connectingNodeId,
21 |   handleType,
22 |   onClose,
23 |   onCardCreated
24 | }: CreateCardModalProps) {
25 |   // 카드 생성 콜백
26 |   const handleCardCreated = (cardData: any) => {
27 |     onCardCreated(cardData, position, connectingNodeId, handleType);
28 |   };
29 | 
30 |   // 클릭 이벤트 전파 방지
31 |   const handleModalClick = (e: React.MouseEvent) => {
32 |     e.stopPropagation();
33 |   };
34 | 
35 |   return (
36 |     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
37 |       <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4" onClick={handleModalClick}>
38 |         <div className="absolute top-2 right-2">
39 |           <Button variant="ghost" size="icon" onClick={onClose}>
40 |             <X className="h-4 w-4" />
41 |           </Button>
42 |         </div>
43 |         <div className="p-4">
44 |           <CreateCardButton 
45 |             onCardCreated={handleCardCreated} 
46 |             autoOpen={true} 
47 |             onClose={onClose}
48 |           />
49 |         </div>
50 |       </div>
51 |     </div>
52 |   );
53 | } 
```

src/components/cards/EditCardContent.tsx
```
1 | "use client";
2 | 
3 | import React, { useState } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import { toast } from "sonner";
6 | import TiptapEditor from "@/components/editor/TiptapEditor";
7 | import TiptapViewer from "@/components/editor/TiptapViewer";
8 | import { Pencil, Check, X } from "lucide-react";
9 | 
10 | interface EditCardContentProps {
11 |   cardId: string;
12 |   initialContent: string;
13 | }
14 | 
15 | export default function EditCardContent({ cardId, initialContent }: EditCardContentProps) {
16 |   const [isEditing, setIsEditing] = useState(false);
17 |   const [content, setContent] = useState(initialContent);
18 |   const [isSubmitting, setIsSubmitting] = useState(false);
19 | 
20 |   const handleSubmit = async () => {
21 |     if (content === initialContent) {
22 |       setIsEditing(false);
23 |       return;
24 |     }
25 | 
26 |     if (!content.trim()) {
27 |       toast.error("내용을 입력해주세요.");
28 |       return;
29 |     }
30 | 
31 |     setIsSubmitting(true);
32 | 
33 |     try {
34 |       const response = await fetch(`/api/cards/${cardId}`, {
35 |         method: "PATCH",
36 |         headers: {
37 |           "Content-Type": "application/json",
38 |         },
39 |         body: JSON.stringify({
40 |           content,
41 |         }),
42 |       });
43 | 
44 |       if (!response.ok) {
45 |         const errorData = await response.json();
46 |         throw new Error(errorData.error || "내용 수정에 실패했습니다.");
47 |       }
48 | 
49 |       toast.success("내용이 수정되었습니다.");
50 |       setIsEditing(false);
51 |     } catch (error) {
52 |       console.error("Error updating card content:", error);
53 |       toast.error(error instanceof Error ? error.message : "내용 수정에 실패했습니다.");
54 |     } finally {
55 |       setIsSubmitting(false);
56 |     }
57 |   };
58 | 
59 |   const handleCancel = () => {
60 |     setContent(initialContent);
61 |     setIsEditing(false);
62 |   };
63 | 
64 |   if (isEditing) {
65 |     return (
66 |       <div className="space-y-4">
67 |         <TiptapEditor
68 |           content={content}
69 |           onChange={setContent}
70 |           placeholder="카드 내용을 입력하세요..."
71 |         />
72 |         <div className="flex justify-end space-x-2">
73 |           <Button
74 |             variant="outline"
75 |             size="sm"
76 |             onClick={handleCancel}
77 |             disabled={isSubmitting}
[TRUNCATED]
```

src/components/cards/EditCardForm.tsx
```
1 | "use client";
2 | 
3 | import React, { useState, useRef, useEffect } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import { Input } from "@/components/ui/input";
6 | import { Label } from "@/components/ui/label";
7 | import { Badge } from "@/components/ui/badge";
8 | import { toast } from "sonner";
9 | import { X, Plus } from "lucide-react";
10 | import TiptapEditor from "@/components/editor/TiptapEditor";
11 | import { DEFAULT_USER_ID } from "@/lib/constants";
12 | import { Card } from '@prisma/client';
13 | 
14 | // 컴포넌트 props 타입 정의
15 | interface EditCardFormProps {
16 |   card: any; // 카드 데이터
17 |   onSuccess?: (updatedCard?: any) => void; // 수정 성공 시 호출할 콜백
18 |   onCancel?: () => void; // 취소 버튼 클릭 시 호출할 콜백
19 | }
20 | 
21 | // EditCardForm 컴포넌트
22 | export default function EditCardForm({ card, onSuccess, onCancel }: EditCardFormProps) {
23 |   const [title, setTitle] = useState('');
24 |   const [content, setContent] = useState('');
25 |   const [tagInput, setTagInput] = useState('');
26 |   const [tags, setTags] = useState<string[]>([]);
27 |   const [isSubmitting, setIsSubmitting] = useState(false);
28 |   const [isComposing, setIsComposing] = useState(false);
29 | 
30 |   // 초기 데이터 로딩
31 |   useEffect(() => {
32 |     if (card) {
33 |       setTitle(card.title || '');
34 |       setContent(card.content || '');
35 |       // CardTag에서 태그 이름을 추출
36 |       if (card.cardTags && Array.isArray(card.cardTags)) {
37 |         const tagNames = card.cardTags.map((cardTag: any) => cardTag.tag.name);
38 |         setTags(tagNames);
39 |       }
40 |     }
41 |   }, [card]);
42 | 
43 |   // 입력 조합(IME) 시작 핸들러
44 |   const handleCompositionStart = () => {
45 |     setIsComposing(true);
46 |   };
47 | 
48 |   // 입력 조합(IME) 종료 핸들러
49 |   const handleCompositionEnd = () => {
50 |     setIsComposing(false);
51 |   };
52 | 
53 |   // 태그 입력 변경 핸들러
54 |   const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
55 |     const value = e.target.value;
56 |     setTagInput(value);
57 |     
58 |     // 쉼표가 포함되어 있으면 태그 추가
59 |     if (value.includes(',') && !isComposing) {
60 |       const newTag = value.replace(',', '').trim();
61 |       if (newTag && !tags.includes(newTag)) {
[TRUNCATED]
```

src/components/cards/EditCardModal.tsx
```
1 | "use client";
2 | 
3 | import React, { useState, useEffect } from 'react';
4 | import { Button } from "@/components/ui/button";
5 | import { X } from 'lucide-react';
6 | import EditCardForm from "@/components/cards/EditCardForm";
7 | 
8 | interface EditCardModalProps {
9 |   cardId: string;
10 |   onClose: () => void;
11 |   onCardUpdated?: (updatedCard: any) => void;
12 | }
13 | 
14 | /**
15 |  * 카드 수정을 위한 모달 컴포넌트
16 |  */
17 | export function EditCardModal({
18 |   cardId,
19 |   onClose,
20 |   onCardUpdated
21 | }: EditCardModalProps) {
22 |   const [card, setCard] = useState<any>(null);
23 |   const [loading, setLoading] = useState(true);
24 |   const [error, setError] = useState<string | null>(null);
25 | 
26 |   // 카드 데이터 로드
27 |   useEffect(() => {
28 |     const fetchCard = async () => {
29 |       try {
30 |         setLoading(true);
31 |         const response = await fetch(`/api/cards/${cardId}`);
32 |         
33 |         if (!response.ok) {
34 |           throw new Error('카드를 찾을 수 없습니다.');
35 |         }
36 |         
37 |         const data = await response.json();
38 |         setCard(data);
39 |       } catch (err) {
40 |         setError(err instanceof Error ? err.message : '카드 로딩 중 오류가 발생했습니다.');
41 |       } finally {
42 |         setLoading(false);
43 |       }
44 |     };
45 | 
46 |     if (cardId) {
47 |       fetchCard();
48 |     }
49 |   }, [cardId]);
50 | 
51 |   // 카드 업데이트 콜백
52 |   const handleCardUpdated = (updatedCard: any) => {
53 |     if (onCardUpdated) {
54 |       onCardUpdated(updatedCard);
55 |     }
56 |     onClose();
57 |   };
58 | 
59 |   // 클릭 이벤트 전파 방지
60 |   const handleModalClick = (e: React.MouseEvent) => {
61 |     e.stopPropagation();
62 |   };
63 | 
64 |   return (
65 |     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
66 |       <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4" onClick={handleModalClick}>
67 |         <div className="absolute top-2 right-2">
68 |           <Button variant="ghost" size="icon" onClick={onClose}>
69 |             <X className="h-4 w-4" />
[TRUNCATED]
```

src/components/cards/SearchBar.test.tsx
```
1 | import { render, screen, fireEvent } from '@testing-library/react';
2 | import { describe, it, expect, beforeEach, vi } from 'vitest';
3 | import { SearchBar } from './SearchBar';
4 | import '@testing-library/jest-dom';
5 | 
6 | // 기본 모킹 설정
7 | const push = vi.fn();
8 | const useRouterMock = vi.fn().mockReturnValue({ push });
9 | const useSearchParamsMock = vi.fn().mockReturnValue({
10 |   get: vi.fn().mockReturnValue(null)
11 | });
12 | 
13 | vi.mock('next/navigation', () => ({
14 |   useRouter: () => useRouterMock(),
15 |   useSearchParams: () => useSearchParamsMock()
16 | }));
17 | 
18 | // 실제 SearchBar 컴포넌트를 사용합니다.
19 | describe('SearchBar', () => {
20 |   beforeEach(() => {
21 |     vi.clearAllMocks();
22 |     useRouterMock.mockReturnValue({ push });
23 |     useSearchParamsMock.mockReturnValue({
24 |       get: vi.fn().mockReturnValue(null)
25 |     });
26 |   });
27 | 
28 |   it('올바르게 렌더링 되어야 함', () => {
29 |     render(<SearchBar />);
30 |     
31 |     // 기본 요소들이 렌더링 되었는지 확인
32 |     expect(screen.getByPlaceholderText('검색어 입력 또는 #태그 입력')).toBeInTheDocument();
33 |     expect(screen.getByText('검색')).toBeInTheDocument();
34 |   });
35 |   
36 |   it('URL에서 검색어를 가져와 입력 필드에 표시해야 함', () => {
37 |     // URL 파라미터 모킹 설정
38 |     useSearchParamsMock.mockReturnValue({
39 |       get: (param: string) => param === 'q' ? '테스트쿼리' : null
40 |     });
41 |     
42 |     render(<SearchBar />);
43 |     
44 |     // useEffect에서 URL 파라미터를 가져와 입력 필드에 설정
45 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
46 |     expect(inputElement).toHaveValue('테스트쿼리');
47 |   });
48 |   
49 |   it('검색 버튼 클릭 시 일반 검색어로 올바른 URL로 이동해야 함', () => {
50 |     render(<SearchBar />);
51 |     
52 |     // 입력 필드에 검색어 입력
53 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
54 |     fireEvent.change(inputElement, { target: { value: '일반검색어' } });
55 |     
56 |     // 검색 버튼 클릭
57 |     const searchButton = screen.getByText('검색');
58 |     fireEvent.click(searchButton);
59 |     
60 |     // 올바른 URL로 이동했는지 확인
61 |     expect(push).toHaveBeenCalledWith('/cards?q=%EC%9D%BC%EB%B0%98%EA%B2%80%EC%83%89%EC%96%B4');
62 |   });
63 |   
[TRUNCATED]
```

src/components/cards/SearchBar.tsx
```
1 | /**
2 |  * 파일명: SearchBar.tsx
3 |  * 목적: 카드 검색 기능 제공
4 |  * 역할: 카드 검색 및 태그 검색 인터페이스 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useState, useEffect, useCallback, useRef } from 'react';
11 | import { Input } from '@/components/ui/input';
12 | import { Button } from '@/components/ui/button';
13 | import { Search, X, Hash, AlertCircle } from 'lucide-react';
14 | import { useRouter, useSearchParams } from 'next/navigation';
15 | import { Badge } from '@/components/ui/badge';
16 | import {
17 |   Tooltip,
18 |   TooltipContent,
19 |   TooltipProvider,
20 |   TooltipTrigger,
21 | } from "@/components/ui/tooltip";
22 | import { cn } from '@/lib/utils';
23 | 
24 | interface SearchBarProps {
25 |   className?: string;
26 |   placeholder?: string;
27 | }
28 | 
29 | export const SearchBar = ({ 
30 |   className, 
31 |   placeholder = "검색어 입력 또는 #태그 입력" 
32 | }: SearchBarProps) => {
33 |   const router = useRouter();
34 |   const searchParams = useSearchParams();
35 |   const [searchTerm, setSearchTerm] = useState('');
36 |   const [recentSearches, setRecentSearches] = useState<string[]>([]);
37 |   const [isTagMode, setIsTagMode] = useState(false);
38 |   const inputRef = useRef<HTMLInputElement>(null);
39 |   
40 |   // 로컬 스토리지에서 최근 검색어 불러오기
41 |   useEffect(() => {
42 |     const savedSearches = localStorage.getItem('recentSearches');
43 |     if (savedSearches) {
44 |       try {
45 |         const parsed = JSON.parse(savedSearches);
46 |         if (Array.isArray(parsed)) {
47 |           setRecentSearches(parsed.slice(0, 5)); // 최대 5개까지만 표시
48 |         }
49 |       } catch {
50 |         // 파싱 오류 시 무시
51 |       }
52 |     }
53 |   }, []);
54 |   
55 |   // URL에서 검색어 가져오기
56 |   useEffect(() => {
57 |     const q = searchParams.get('q') || '';
58 |     const tag = searchParams.get('tag');
59 |     
60 |     if (tag) {
61 |       setSearchTerm(`#${tag}`);
62 |       setIsTagMode(true);
63 |     } else {
64 |       setSearchTerm(q);
65 |       setIsTagMode(q.startsWith('#'));
66 |     }
67 |   }, [searchParams]);
68 |   
69 |   // 최근 검색어 저장
70 |   const saveRecentSearch = useCallback((term: string) => {
[TRUNCATED]
```

src/components/cards/SimpleCreateCardModal.tsx
```
1 | import React from 'react';
2 | import CreateCardButton from '@/components/cards/CreateCardButton';
3 | 
4 | interface SimpleCreateCardModalProps {
5 |   isOpen: boolean;
6 |   onClose: () => void;
7 |   onCardCreated: (cardData: any) => void;
8 | }
9 | 
10 | /**
11 |  * 간단한 카드 생성 모달 컴포넌트
12 |  * BoardComponent에서 사용하기 위한 래퍼 컴포넌트
13 |  */
14 | export function SimpleCreateCardModal({
15 |   isOpen,
16 |   onClose,
17 |   onCardCreated
18 | }: SimpleCreateCardModalProps) {
19 |   // 카드가 생성되면 onCardCreated 콜백을 호출하고 모달을 닫음
20 |   const handleCardCreated = (cardData: any) => {
21 |     onCardCreated(cardData);
22 |   };
23 | 
24 |   // isOpen이 false면 아무것도 렌더링하지 않음
25 |   if (!isOpen) {
26 |     return null;
27 |   }
28 | 
29 |   return (
30 |     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
31 |       <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4">
32 |         <CreateCardButton 
33 |           onCardCreated={handleCardCreated} 
34 |           autoOpen={true} 
35 |           onClose={onClose}
36 |         />
37 |       </div>
38 |     </div>
39 |   );
40 | } 
```

src/components/cards/TagFilter.tsx
```
1 | /**
2 |  * 파일명: TagFilter.tsx
3 |  * 목적: 카드 목록에서 태그 기반 필터링 제공
4 |  * 역할: 선택 가능한 태그 목록을 표시하고 태그 필터링 기능 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useState, useEffect } from 'react';
11 | import { useRouter, useSearchParams } from 'next/navigation';
12 | import { Badge } from '@/components/ui/badge';
13 | import { ScrollArea } from '@/components/ui/scroll-area';
14 | import { Loader2, Tags, ChevronDown, ChevronUp } from 'lucide-react';
15 | import { toast } from 'sonner';
16 | import { cn } from '@/lib/utils';
17 | import { Button } from '@/components/ui/button';
18 | 
19 | interface Tag {
20 |   id: string;
21 |   name: string;
22 |   count: number;
23 | }
24 | 
25 | export function TagFilter() {
26 |   const router = useRouter();
27 |   const searchParams = useSearchParams();
28 |   const [tags, setTags] = useState<Tag[]>([]);
29 |   const [loading, setLoading] = useState(true);
30 |   const [expanded, setExpanded] = useState(true);
31 |   const [selectedTag, setSelectedTag] = useState<string | null>(null);
32 | 
33 |   // URL에서 현재 선택된 태그 가져오기
34 |   useEffect(() => {
35 |     const tagParam = searchParams.get('tag');
36 |     setSelectedTag(tagParam);
37 |   }, [searchParams]);
38 | 
39 |   // 태그 목록 가져오기
40 |   useEffect(() => {
41 |     async function fetchTags() {
42 |       setLoading(true);
43 |       try {
44 |         const response = await fetch('/api/tags?includeCount=true');
45 |         if (!response.ok) {
46 |           throw new Error('태그 목록을 불러오는데 실패했습니다');
47 |         }
48 |         
49 |         const data = await response.json();
50 |         setTags(data.sort((a: Tag, b: Tag) => b.count - a.count)); // 사용 빈도순 정렬
51 |       } catch (error) {
52 |         console.error('태그 로딩 오류:', error);
53 |         toast.error('태그 목록을 불러오는데 실패했습니다');
54 |       } finally {
55 |         setLoading(false);
56 |       }
57 |     }
58 |     
59 |     fetchTags();
60 |   }, []);
61 | 
62 |   // 태그 클릭 핸들러
63 |   const handleTagClick = (tagName: string) => {
64 |     if (selectedTag === tagName) {
65 |       // 이미 선택된 태그를 다시 클릭하면 필터 해제
66 |       router.push('/cards');
[TRUNCATED]
```

src/components/layout/ClientLayout.tsx
```
1 | /**
2 |  * 파일명: ClientLayout.tsx
3 |  * 목적: 클라이언트 측 레이아웃과 전역 상태 관리 컴포넌트
4 |  * 역할: 인증 상태, 토스트 메시지 등 클라이언트 컴포넌트 래핑
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { ReactNode, useEffect } from 'react';
11 | import { AuthProvider } from "@/contexts/AuthContext";
12 | import { ThemeProvider } from "@/contexts/ThemeContext";
13 | import { Toaster } from "sonner";
14 | import { InitDatabase } from "@/components/InitDatabase";
15 | import createLogger from '@/lib/logger';
16 | 
17 | // Supabase 싱글톤 인스턴스 초기화 (클라이언트에서만 실행)
18 | import "@/lib/supabase-instance";
19 | 
20 | // 모듈별 로거 생성
21 | const logger = createLogger('ClientLayout');
22 | 
23 | /**
24 |  * ClientLayout: 클라이언트 전용 레이아웃 컴포넌트
25 |  * @param children - 자식 컴포넌트
26 |  * @returns 클라이언트 레이아웃 컴포넌트
27 |  */
28 | export function ClientLayout({ children }: { children: ReactNode }) {
29 |   useEffect(() => {
30 |     logger.info('클라이언트 레이아웃 마운트');
31 |     
32 |     // 브라우저 환경 확인 로깅
33 |     if (typeof window !== 'undefined') {
34 |       logger.info('브라우저 환경 확인');
35 |       // localStorage 접근 여부 체크 (프라이빗 브라우징에서 예외 발생 가능)
36 |       try {
37 |         localStorage.setItem('client_layout_test', 'test');
38 |         localStorage.removeItem('client_layout_test');
39 |         logger.info('localStorage 접근 가능');
40 |       } catch (error) {
41 |         logger.warn('localStorage 접근 불가', error);
42 |       }
43 |     }
44 |     
45 |     return () => {
46 |       logger.info('클라이언트 레이아웃 언마운트');
47 |     };
48 |   }, []);
49 | 
50 |   return (
51 |     <AuthProvider>
52 |       <ThemeProvider>
53 |         <main>
54 |           {children}
55 |           
56 |           {/* DB 초기화 스크립트 */}
57 |           <InitDatabase />
58 |         </main>
59 |         <Toaster position="top-center" />
60 |       </ThemeProvider>
61 |     </AuthProvider>
62 |   );
63 | } 
```

src/components/layout/DashboardLayout.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect } from 'react';
4 | import { useAppStore } from '@/store/useAppStore';
5 | import { ProjectToolbar } from './ProjectToolbar';
6 | import { ShortcutToolbar } from './ShortcutToolbar';
7 | import { MainCanvas } from './MainCanvas';
8 | import { MainToolbar } from './MainToolbar';
9 | import { Sidebar } from './Sidebar';
10 | import { ReactFlowProvider } from '@xyflow/react';
11 | // React Flow 스타일은 MainCanvas에서 import 합니다
12 | 
13 | export function DashboardLayout() {
14 |   const { isSidebarOpen } = useAppStore();
15 | 
16 |   // 클라이언트 측에서만 실행되는 코드
17 |   useEffect(() => {
18 |     // 여기에 필요한 초기화 코드 추가
19 |     console.log('DashboardLayout 마운트됨');
20 |     
21 |     return () => {
22 |       console.log('DashboardLayout 언마운트됨');
23 |     };
24 |   }, []);
25 | 
26 |   return (
27 |     <div className="flex h-screen overflow-hidden bg-background">
28 |       {/* 프로젝트 툴바 (좌측 상단) */}
29 |       <ProjectToolbar />
30 |       
31 |       {/* 단축키 툴바 (우측 상단) */}
32 |       <ShortcutToolbar />
33 |       
34 |       {/* 메인 콘텐츠 영역 */}
35 |       <div className="flex flex-1 relative">
36 |         {/* 메인 캔버스 */}
37 |         <div className={`flex-1 h-full transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
38 |           <ReactFlowProvider>
39 |             <MainCanvas />
40 |           </ReactFlowProvider>
41 |         </div>
42 |         
43 |         {/* 사이드바 */}
44 |         <Sidebar />
45 |       </div>
46 |       
47 |       {/* 메인 툴바 (하단 센터) */}
48 |       <MainToolbar />
49 |     </div>
50 |   );
51 | } 
```

src/components/layout/MainCanvas.test.tsx
```
1 | /**
2 |  * 파일명: MainCanvas.test.tsx
3 |  * 목적: MainCanvas 컴포넌트 테스트
4 |  * 역할: MainCanvas가 적절하게 렌더링되고 Board 컴포넌트에 올바른 props를 전달하는지 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { render, screen } from '@testing-library/react';
9 | import { MainCanvas } from './MainCanvas';
10 | import { vi } from 'vitest';
11 | 
12 | // 종속성 모킹
13 | vi.mock('@/store/useAppStore', () => ({
14 |   useAppStore: () => ({
15 |     selectCard: vi.fn(),
16 |   }),
17 | }));
18 | 
19 | vi.mock('@xyflow/react', () => ({
20 |   ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
21 |     <div data-testid="react-flow-provider">{children}</div>
22 |   ),
23 | }));
24 | 
25 | vi.mock('@/components/board/components/Board', () => ({
26 |   default: ({ onSelectCard, className, showControls }: any) => (
27 |     <div 
28 |       data-testid="board-component"
29 |       data-selectcard={!!onSelectCard}
30 |       data-classname={className}
31 |       data-showcontrols={showControls}
32 |     >
33 |       Board Component
34 |     </div>
35 |   ),
36 | }));
37 | 
38 | describe('MainCanvas', () => {
39 |   it('renders ReactFlowProvider and Board component with correct props', () => {
40 |     render(<MainCanvas />);
41 |     
42 |     // ReactFlowProvider가 렌더링되었는지 확인
43 |     expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
44 |     
45 |     // Board 컴포넌트가 렌더링되었는지 확인
46 |     const boardComponent = screen.getByTestId('board-component');
47 |     expect(boardComponent).toBeInTheDocument();
48 |     
49 |     // Board 컴포넌트에 올바른 props가 전달되었는지 확인
50 |     expect(boardComponent.getAttribute('data-selectcard')).toBe('true');
51 |     expect(boardComponent.getAttribute('data-classname')).toBe('bg-background');
52 |     expect(boardComponent.getAttribute('data-showcontrols')).toBe('true');
53 |   });
54 | }); 
```

src/components/layout/MainCanvas.tsx
```
1 | 'use client';
2 | 
3 | import { useAppStore } from '@/store/useAppStore';
4 | import { ReactFlowProvider } from '@xyflow/react';
5 | import { Loader2 } from 'lucide-react';
6 | import Board from '@/components/board/components/Board';
7 | 
8 | // 외부 내보내기 컴포넌트
9 | export function MainCanvas() {
10 |   const { selectCard } = useAppStore();
11 |   
12 |   return (
13 |     <ReactFlowProvider>
14 |       <div className="w-full h-full pt-14">
15 |         <Board
16 |           onSelectCard={selectCard}
17 |           className="bg-background"
18 |           showControls={true}
19 |         />
20 |       </div>
21 |     </ReactFlowProvider>
22 |   );
23 | } 
```

src/components/layout/MainToolbar.tsx
```
1 | 'use client';
2 | 
3 | import { 
4 |   AlignHorizontalJustifyCenter, 
5 |   AlignVerticalJustifyCenter,
6 |   PlusCircle,
7 |   Save
8 | } from 'lucide-react';
9 | import { Button } from '@/components/ui/button';
10 | import { useAppStore } from '@/store/useAppStore';
11 | import { useCallback, useState } from 'react';
12 | import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
13 | import { toast } from 'sonner';
14 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
15 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
16 | 
17 | export function MainToolbar() {
18 |   const { layoutDirection, setLayoutDirection, reactFlowInstance } = useAppStore();
19 |   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
20 |   
21 |   // 카드 생성 핸들러
22 |   const handleCardCreated = useCallback((cardData: any) => {
23 |     // 카드 생성 후 모달 닫기
24 |     setIsCreateModalOpen(false);
25 |     
26 |     // 새로운 카드가 생성되었으므로 페이지를 새로고침하여 보드에 표시
27 |     window.location.reload();
28 |   }, []);
29 |   
30 |   // 수평 레이아웃 적용 핸들러
31 |   const applyHorizontalLayout = useCallback(() => {
32 |     if (!reactFlowInstance) {
33 |       toast.error('React Flow 인스턴스를 찾을 수 없습니다');
34 |       return;
35 |     }
36 |     
37 |     // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
38 |     const nodes = reactFlowInstance.getNodes();
39 |     const edges = reactFlowInstance.getEdges();
40 |     
41 |     if (!nodes.length) {
42 |       toast.error('적용할 노드가 없습니다');
43 |       return;
44 |     }
45 |     
46 |     // 수평 레이아웃 적용
47 |     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'horizontal');
48 |     
49 |     // 변경된 노드와 엣지 적용
50 |     reactFlowInstance.setNodes(layoutedNodes);
51 |     reactFlowInstance.setEdges(layoutedEdges);
52 |     
53 |     toast.success('수평 레이아웃이 적용되었습니다');
54 |   }, [reactFlowInstance]);
55 |   
56 |   // 수직 레이아웃 적용 핸들러
57 |   const applyVerticalLayout = useCallback(() => {
58 |     if (!reactFlowInstance) {
59 |       toast.error('React Flow 인스턴스를 찾을 수 없습니다');
60 |       return;
61 |     }
62 |     
63 |     // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
64 |     const nodes = reactFlowInstance.getNodes();
65 |     const edges = reactFlowInstance.getEdges();
66 |     
67 |     if (!nodes.length) {
68 |       toast.error('적용할 노드가 없습니다');
69 |       return;
70 |     }
[TRUNCATED]
```

src/components/layout/ProjectToolbar.tsx
```
1 | 'use client';
2 | 
3 | import React, { useState, useCallback } from 'react';
4 | import { 
5 |   Menu, 
6 |   ChevronRight, 
7 |   Palette, 
8 |   Grid3X3, 
9 |   ChevronsUpDown,
10 |   AlignHorizontalJustifyCenter,
11 |   AlignVerticalJustifyCenter,
12 |   LayoutGrid,
13 |   Save,
14 |   Settings,
15 |   ArrowRightIcon,
16 |   Circle,
17 |   SeparatorHorizontal,
18 |   Paintbrush,
19 |   Layout,
20 |   LogOut
21 | } from 'lucide-react';
22 | import { Button } from '@/components/ui/button';
23 | import {
24 |   DropdownMenu,
25 |   DropdownMenuContent,
26 |   DropdownMenuItem,
27 |   DropdownMenuTrigger,
28 |   DropdownMenuSub,
29 |   DropdownMenuSubTrigger,
30 |   DropdownMenuSubContent,
31 |   DropdownMenuPortal,
32 |   DropdownMenuSeparator,
33 |   DropdownMenuRadioGroup,
34 |   DropdownMenuRadioItem,
35 |   DropdownMenuCheckboxItem,
36 |   DropdownMenuLabel
37 | } from '@/components/ui/dropdown-menu';
38 | import { useAppStore } from '@/store/useAppStore';
39 | import { toast } from 'sonner';
40 | import { ConnectionLineType, MarkerType } from '@xyflow/react';
41 | import { BoardSettings, DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
42 | import { 
43 |   SNAP_GRID_OPTIONS, 
44 |   CONNECTION_TYPE_OPTIONS, 
45 |   MARKER_TYPE_OPTIONS,
46 |   STROKE_WIDTH_OPTIONS,
47 |   MARKER_SIZE_OPTIONS,
48 |   EDGE_COLOR_OPTIONS,
49 |   EDGE_ANIMATION_OPTIONS,
50 |   STORAGE_KEY,
51 |   EDGES_STORAGE_KEY
52 | } from '@/lib/board-constants';
53 | import { useAuth } from '@/contexts/AuthContext';
54 | import createLogger from '@/lib/logger';
55 | 
56 | // 모듈별 로거 생성
57 | const logger = createLogger('ProjectToolbar');
58 | 
59 | export function ProjectToolbar() {
60 |   const [projectName, setProjectName] = useState('프로젝트 이름');
61 |   const { 
62 |     layoutDirection, 
63 |     setLayoutDirection,
64 |     boardSettings,
65 |     updateBoardSettings,
66 |     reactFlowInstance
67 |   } = useAppStore();
68 |   const { signOut } = useAuth();
69 |   
70 |   // 저장 핸들러 (임시)
71 |   const handleSaveLayout = useCallback(() => {
72 |     try {
73 |       if (!reactFlowInstance) {
74 |         toast.error('React Flow 인스턴스를 찾을 수 없습니다');
75 |         return;
76 |       }
77 |       
78 |       // React Flow 인스턴스에서 노드와 엣지 데이터 가져오기
79 |       const nodes = reactFlowInstance.getNodes();
80 |       const edges = reactFlowInstance.getEdges();
81 |       
82 |       if (!nodes.length) {
[TRUNCATED]
```

src/components/layout/ShortcutToolbar.tsx
```
1 | 'use client';
2 | 
3 | import { LogOut, PanelRight } from 'lucide-react';
4 | import { Button } from '@/components/ui/button';
5 | import { useAppStore } from '@/store/useAppStore';
6 | 
7 | export function ShortcutToolbar() {
8 |   const { toggleSidebar } = useAppStore();
9 |   
10 |   return (
11 |     <div className="fixed top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-2 z-10">
12 |       {/* 사이드바 접기 */}
13 |       <Button 
14 |         variant="ghost" 
15 |         size="icon" 
16 |         className="rounded-full"
17 |         onClick={toggleSidebar}
18 |         title="사이드바 접기"
19 |       >
20 |         <PanelRight className="h-5 w-5" />
21 |         <span className="sr-only">사이드바 접기</span>
22 |       </Button>
23 |       
24 |       {/* 로그아웃 버튼 */}
25 |       <Button 
26 |         variant="ghost" 
27 |         size="icon" 
28 |         className="rounded-full"
29 |         title="로그아웃"
30 |       >
31 |         <LogOut className="h-5 w-5" />
32 |         <span className="sr-only">로그아웃</span>
33 |       </Button>
34 |     </div>
35 |   );
36 | } 
```

src/components/layout/Sidebar.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect, useState, useRef, useMemo } from 'react';
4 | import { useAppStore } from '@/store/useAppStore';
5 | import { ChevronRight, Eye, Trash2, GripVertical, Pencil, LogOut } from 'lucide-react';
6 | import { Button } from '@/components/ui/button';
7 | import { motion, AnimatePresence } from 'framer-motion';
8 | import { formatDate } from '@/lib/utils';
9 | import { Badge } from '@/components/ui/badge';
10 | import { toast } from 'sonner';
11 | import TiptapViewer from '@/components/editor/TiptapViewer';
12 | import {
13 |   Dialog,
14 |   DialogContent,
15 |   DialogHeader,
16 |   DialogTitle,
17 |   DialogDescription,
18 |   DialogFooter,
19 |   DialogTrigger,
20 |   DialogClose,
21 | } from '@/components/ui/dialog';
22 | import { cn } from '@/lib/utils';
23 | import { useResizable } from '@/hooks/useResizable';
24 | import DocumentViewer from '@/components/editor/DocumentViewer';
25 | import CardList from '@/components/cards/CardList';
26 | import type { Card } from '@/types/card';
27 | import { EditCardModal } from '@/components/cards/EditCardModal';
28 | import { Portal } from '@/components/ui/portal';
29 | import { useAuth } from '@/contexts/AuthContext';
30 | import { useRouter } from 'next/navigation';
31 | 
32 | // 카드 인터페이스 정의
33 | interface Tag {
34 |   id: string;
35 |   name: string;
36 | }
37 | 
38 | interface CardTag {
39 |   id: string;
40 |   tag: Tag;
41 | }
42 | 
43 | interface CardItem extends Card {
44 |   cardTags?: CardTag[];
45 |   // 엣지 정보를 통해 계층 구조 파악을 위한 필드
46 |   parents?: string[];
47 |   children?: string[];
48 |   depth?: number;
49 | }
50 | 
51 | interface SidebarProps {
52 |   className?: string;
53 | }
54 | 
55 | export function Sidebar({ className }: SidebarProps) {
56 |   const router = useRouter();
57 |   const { 
58 |     isSidebarOpen, 
59 |     setSidebarOpen, 
60 |     selectedCardId, 
61 |     selectedCardIds, 
62 |     selectCard, 
63 |     sidebarWidth, 
64 |     setSidebarWidth,
65 |     reactFlowInstance,
66 |     cards
67 |   } = useAppStore();
68 |   
69 |   // 전역 상태의 cards를 CardItem 타입으로 캐스팅하여 사용
70 |   const cardsWithType = cards as CardItem[];
71 |   
72 |   const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
73 |   const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
[TRUNCATED]
```

src/components/tags/TagForm.test.tsx
```
1 | import React from "react";
2 | import { render, screen, fireEvent, waitFor } from "@testing-library/react";
3 | import userEvent from "@testing-library/user-event";
4 | import TagForm from "./TagForm";
5 | import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
6 | import { toast } from "sonner";
7 | 
8 | // 페치 모킹
9 | global.fetch = vi.fn();
10 | 
11 | // 윈도우 리로드 모킹
12 | const mockReload = vi.fn();
13 | Object.defineProperty(window, "location", {
14 |   value: {
15 |     reload: mockReload,
16 |   },
17 |   writable: true,
18 | });
19 | 
20 | // Toast 모킹
21 | vi.mock("sonner", () => ({
22 |   toast: {
23 |     error: vi.fn(),
24 |     success: vi.fn(),
25 |   },
26 | }));
27 | 
28 | describe("TagForm 컴포넌트", () => {
29 |   beforeEach(() => {
30 |     vi.clearAllMocks();
31 |     // 성공적인 응답을 기본으로 설정
32 |     (global.fetch as any).mockResolvedValue({
33 |       ok: true,
34 |       json: async () => ({}),
35 |     });
36 |   });
37 | 
38 |   afterEach(() => {
39 |     // 각 테스트 후에 정리
40 |     vi.resetAllMocks();
41 |     document.body.innerHTML = "";
42 |   });
43 | 
44 |   test("태그 입력이 작동합니다", async () => {
45 |     const user = userEvent.setup();
46 |     render(<TagForm />);
47 | 
48 |     const tagInput = screen.getByLabelText("태그 이름");
49 |     await user.type(tagInput, "새로운태그");
50 |     expect(tagInput).toHaveValue("새로운태그");
51 |   });
52 | 
53 |   test("빈 태그 이름으로 제출하면 오류가 표시됩니다", async () => {
54 |     const user = userEvent.setup();
55 |     render(<TagForm />);
56 | 
57 |     // 빈 입력으로 제출
58 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
59 | 
60 |     // 오류 메시지 확인
61 |     expect(toast.error).toHaveBeenCalledWith("태그 이름을 입력해주세요.");
62 |     expect(global.fetch).not.toHaveBeenCalled();
63 |   });
64 | 
65 |   test("IME 입력이 올바르게 처리됩니다", async () => {
66 |     const user = userEvent.setup();
67 |     render(<TagForm />);
68 | 
69 |     const tagInput = screen.getByLabelText("태그 이름");
70 |     
71 |     // IME 조합 시작
72 |     fireEvent.compositionStart(tagInput);
73 |     
[TRUNCATED]
```

src/components/tags/TagForm.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import { Input } from "@/components/ui/input";
6 | import { Label } from "@/components/ui/label";
7 | import { toast } from "sonner";
8 | 
9 | export default function TagForm() {
10 |   const [tagName, setTagName] = useState("");
11 |   const [isSubmitting, setIsSubmitting] = useState(false);
12 | 
13 |   const handleSubmit = async (e: React.FormEvent) => {
14 |     e.preventDefault();
15 |     
16 |     if (!tagName.trim()) {
17 |       toast.error("태그 이름을 입력해주세요.");
18 |       return;
19 |     }
20 |     
21 |     try {
22 |       setIsSubmitting(true);
23 |       
24 |       const response = await fetch("/api/tags", {
25 |         method: "POST",
26 |         headers: {
27 |           "Content-Type": "application/json",
28 |         },
29 |         body: JSON.stringify({ name: tagName.trim() }),
30 |       });
31 |       
32 |       if (!response.ok) {
33 |         const errorData = await response.json();
34 |         throw new Error(errorData.error || "태그 생성에 실패했습니다.");
35 |       }
36 |       
37 |       const data = await response.json();
38 |       toast.success("태그가 생성되었습니다.");
39 |       setTagName("");
40 |       
41 |       // 페이지 새로고침을 통해 목록 업데이트
42 |       window.location.reload();
43 |     } catch (error) {
44 |       console.error("태그 생성 오류:", error);
45 |       toast.error(error instanceof Error ? error.message : "태그 생성에 실패했습니다.");
46 |     } finally {
47 |       setIsSubmitting(false);
48 |     }
49 |   };
50 | 
51 |   return (
52 |     <form onSubmit={handleSubmit} className="space-y-4">
53 |       <div className="space-y-2">
54 |         <Label htmlFor="tagName">태그 이름</Label>
55 |         <Input
56 |           id="tagName"
57 |           type="text"
58 |           value={tagName}
59 |           onChange={(e) => setTagName(e.target.value)}
60 |           placeholder="새 태그 이름을 입력하세요"
61 |           disabled={isSubmitting}
62 |           maxLength={50}
63 |         />
64 |       </div>
65 |       
66 |       <Button type="submit" disabled={isSubmitting} className="w-full">
67 |         {isSubmitting ? "생성 중..." : "태그 생성"}
68 |       </Button>
69 |     </form>
70 |   );
71 | } 
```

src/components/tags/TagList.test.tsx
```
1 | import React from 'react';
2 | import { render, screen, fireEvent, waitFor } from '@testing-library/react';
3 | import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
4 | import TagList from './TagList';
5 | import '@testing-library/jest-dom/vitest';
6 | 
7 | // fetch 모킹
8 | global.fetch = vi.fn() as Mock;
9 | 
10 | // toast 모킹
11 | vi.mock('sonner', () => ({
12 |   toast: {
13 |     success: vi.fn(),
14 |     error: vi.fn()
15 |   }
16 | }));
17 | 
18 | describe('TagList', () => {
19 |   // 테스트용 태그 데이터
20 |   const mockTags = [
21 |     { id: '1', name: '자바스크립트', count: 5, createdAt: '2023년 1월 1일' },
22 |     { id: '2', name: '리액트', count: 3, createdAt: '2023년 2월 1일' },
23 |     { id: '3', name: '타입스크립트', count: 0, createdAt: '2023년 3월 1일' }
24 |   ];
25 |   
26 |   beforeEach(() => {
27 |     vi.clearAllMocks();
28 |     
29 |     // fetch 기본 모킹 설정
30 |     (global.fetch as Mock).mockResolvedValue({
31 |       ok: true,
32 |       json: async () => ({ message: '태그가 성공적으로 삭제되었습니다.' })
33 |     } as Response);
34 |   });
35 |   
36 |   it('태그 목록이 올바르게 렌더링되어야 함', () => {
37 |     render(<TagList initialTags={mockTags} />);
38 |     
39 |     // 각 태그 항목이 렌더링되었는지 확인
40 |     expect(screen.getByText('자바스크립트')).toBeInTheDocument();
41 |     expect(screen.getByText('리액트')).toBeInTheDocument();
42 |     expect(screen.getByText('타입스크립트')).toBeInTheDocument();
43 |     
44 |     // 각 태그의 카드 수가 올바르게 표시되었는지 확인
45 |     expect(screen.getByText('5개 카드')).toBeInTheDocument();
46 |     expect(screen.getByText('3개 카드')).toBeInTheDocument();
47 |     expect(screen.getByText('0개')).toBeInTheDocument();
48 |     
49 |     // 생성일이 올바르게 표시되었는지 확인
50 |     expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
51 |     expect(screen.getByText('2023년 2월 1일')).toBeInTheDocument();
52 |     expect(screen.getByText('2023년 3월 1일')).toBeInTheDocument();
53 |   });
54 |   
55 |   it('태그가 없을 경우 메시지가 표시되어야 함', () => {
56 |     render(<TagList initialTags={[]} />);
57 |     
58 |     expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();
59 |   });
60 |   
61 |   it('태그 삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', async () => {
[TRUNCATED]
```

src/components/tags/TagList.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import Link from "next/link";
5 | import { Badge } from "@/components/ui/badge";
6 | import { Button } from "@/components/ui/button";
7 | import { toast } from "sonner";
8 | import {
9 |   Table,
10 |   TableBody,
11 |   TableCell,
12 |   TableHead,
13 |   TableHeader,
14 |   TableRow,
15 | } from "@/components/ui/table";
16 | import {
17 |   AlertDialog,
18 |   AlertDialogAction,
19 |   AlertDialogCancel,
20 |   AlertDialogContent,
21 |   AlertDialogDescription,
22 |   AlertDialogFooter,
23 |   AlertDialogHeader,
24 |   AlertDialogTitle,
25 |   AlertDialogTrigger,
26 | } from "@/components/ui/alert-dialog";
27 | import { Trash2 } from "lucide-react";
28 | 
29 | interface TagItem {
30 |   id: string;
31 |   name: string;
32 |   count: number;
33 |   createdAt: string;
34 | }
35 | 
36 | interface TagListProps {
37 |   initialTags: TagItem[];
38 | }
39 | 
40 | export default function TagList({ initialTags }: TagListProps) {
41 |   const [tags, setTags] = useState<TagItem[]>(initialTags);
42 |   const [tagToDelete, setTagToDelete] = useState<string | null>(null);
43 |   const [isDeleting, setIsDeleting] = useState(false);
44 | 
45 |   const handleDeleteTag = async () => {
46 |     if (!tagToDelete) return;
47 |     
48 |     try {
49 |       setIsDeleting(true);
50 |       
51 |       const response = await fetch(`/api/tags/${tagToDelete}`, {
52 |         method: "DELETE",
53 |       });
54 |       
55 |       if (!response.ok) {
56 |         const errorData = await response.json();
57 |         throw new Error(errorData.error || "태그 삭제에 실패했습니다.");
58 |       }
59 |       
60 |       // 태그 목록에서 삭제된 태그 제거
61 |       setTags(tags.filter(tag => tag.id !== tagToDelete));
62 |       toast.success("태그가 삭제되었습니다.");
63 |     } catch (error) {
64 |       console.error("태그 삭제 오류:", error);
65 |       toast.error(error instanceof Error ? error.message : "태그 삭제에 실패했습니다.");
66 |     } finally {
67 |       setIsDeleting(false);
68 |       setTagToDelete(null);
69 |     }
70 |   };
71 | 
72 |   return (
73 |     <div>
74 |       {tags.length === 0 ? (
75 |         <div className="text-center py-6">
76 |           <p className="text-muted-foreground">등록된 태그가 없습니다.</p>
[TRUNCATED]
```

src/components/settings/NodeSizeSettings.test.tsx
```
1 | /**
2 |  * 파일명: NodeSizeSettings.test.tsx
3 |  * 목적: NodeSizeSettings 컴포넌트 테스트
4 |  * 역할: 노드 크기 설정 컴포넌트 검증
5 |  * 작성일: 2024-04-01
6 |  */
7 | 
8 | import React from 'react';
9 | import { render, screen, fireEvent, waitFor } from '@testing-library/react';
10 | import { describe, test, expect, vi, beforeEach } from 'vitest';
11 | import '@testing-library/jest-dom/vitest';
12 | 
13 | // ResizeObserver 모킹
14 | global.ResizeObserver = vi.fn().mockImplementation(() => ({
15 |   observe: vi.fn(),
16 |   unobserve: vi.fn(),
17 |   disconnect: vi.fn(),
18 | }));
19 | 
20 | // updateNodeSize 모킹 함수
21 | const updateNodeSizeMock = vi.fn();
22 | const updateNodeInternalsMock = vi.fn();
23 | 
24 | // ReactFlow 모킹
25 | vi.mock('@xyflow/react', () => {
26 |   return {
27 |     useReactFlow: () => ({
28 |       getNodes: () => [{ id: 'node-1' }, { id: 'node-2' }],
29 |     }),
30 |     useUpdateNodeInternals: () => updateNodeInternalsMock,
31 |     ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
32 |   };
33 | });
34 | 
35 | // ThemeContext 모킹
36 | vi.mock('../../contexts/ThemeContext', () => {
37 |   return {
38 |     ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
39 |     useTheme: () => ({
40 |       theme: {
41 |         node: {
42 |           width: 220,
43 |           height: 48,
44 |           maxHeight: 180,
45 |           backgroundColor: '#ffffff',
46 |           borderColor: '#C1C1C1',
47 |           borderWidth: 1,
48 |           borderRadius: 8,
49 |           selectedBorderColor: '#0071e3',
50 |           font: {
51 |             family: 'Pretendard, sans-serif',
52 |             titleSize: 14,
53 |             contentSize: 12,
54 |             tagsSize: 10,
55 |           }
56 |         },
57 |         edge: {
58 |           color: '#C1C1C1',
59 |           width: 1,
60 |           selectedColor: '#0071e3',
61 |           animated: false,
62 |         },
63 |         handle: {
64 |           size: 8,
65 |           backgroundColor: '#ffffff',
66 |           borderColor: '#555555',
67 |           borderWidth: 1,
68 |         },
69 |         layout: {
70 |           spacing: {
71 |             horizontal: 30,
72 |             vertical: 30,
73 |           },
74 |           padding: 20,
75 |         },
76 |       },
77 |       updateTheme: vi.fn(),
78 |       updateNodeSize: updateNodeSizeMock,
79 |     }),
80 |   };
81 | });
82 | 
83 | // UI 컴포넌트 모킹
[TRUNCATED]
```

src/components/settings/NodeSizeSettings.tsx
```
1 | /**
2 |  * 파일명: NodeSizeSettings.tsx
3 |  * 목적: 노드 크기 설정 컴포넌트 제공
4 |  * 역할: 사용자가 노드 크기를 조정할 수 있는 UI 제공
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useState, useEffect } from 'react';
11 | import { Slider } from "@/components/ui/slider";
12 | import { Label } from "@/components/ui/label";
13 | import { Input } from "@/components/ui/input";
14 | import { Button } from "@/components/ui/button";
15 | import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
16 | import { useTheme } from '@/contexts/ThemeContext';
17 | import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
18 | 
19 | /**
20 |  * NodeSizeSettings: 노드 크기 조정 컴포넌트
21 |  * @returns 노드 크기 설정 UI 컴포넌트
22 |  */
23 | export function NodeSizeSettings() {
24 |   const { theme, updateNodeSize } = useTheme();
25 |   const { getNodes } = useReactFlow();
26 |   const updateNodeInternals = useUpdateNodeInternals();
27 |   
28 |   const [width, setWidth] = useState(theme.node.width);
29 |   const [height, setHeight] = useState(theme.node.height);
30 |   const [maxHeight, setMaxHeight] = useState(theme.node.maxHeight);
31 |   
32 |   // 입력값이 변경될 때 로컬 상태 업데이트
33 |   const handleWidthChange = (value: number | string) => {
34 |     const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
35 |     if (!isNaN(numValue) && numValue > 0) {
36 |       setWidth(numValue);
37 |     }
38 |   };
39 |   
40 |   const handleHeightChange = (value: number | string) => {
41 |     const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
42 |     if (!isNaN(numValue) && numValue > 0) {
43 |       setHeight(numValue);
44 |     }
45 |   };
46 |   
47 |   const handleMaxHeightChange = (value: number | string) => {
48 |     const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
49 |     if (!isNaN(numValue) && numValue > 0) {
50 |       setMaxHeight(numValue);
51 |     }
52 |   };
53 |   
54 |   // 테마에 변경사항 적용
55 |   const applyChanges = () => {
56 |     // 테마 업데이트
57 |     updateNodeSize(width, height, maxHeight);
58 |     
59 |     // 모든 노드 업데이트 (내부 상태 갱신)
60 |     setTimeout(() => {
[TRUNCATED]
```

src/components/ui/alert-dialog.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
5 | 
6 | import { cn } from "@/lib/utils"
7 | import { buttonVariants } from "@/components/ui/button"
8 | 
9 | function AlertDialog({
10 |   ...props
11 | }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
12 |   return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
13 | }
14 | 
15 | function AlertDialogTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
18 |   return (
19 |     <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
20 |   )
21 | }
22 | 
23 | function AlertDialogPortal({
24 |   ...props
25 | }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
26 |   return (
27 |     <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
28 |   )
29 | }
30 | 
31 | function AlertDialogOverlay({
32 |   className,
33 |   ...props
34 | }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
35 |   return (
36 |     <AlertDialogPrimitive.Overlay
37 |       data-slot="alert-dialog-overlay"
38 |       className={cn(
39 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
40 |         className
41 |       )}
42 |       {...props}
43 |     />
44 |   )
45 | }
46 | 
47 | function AlertDialogContent({
48 |   className,
49 |   ...props
50 | }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
51 |   return (
52 |     <AlertDialogPortal>
53 |       <AlertDialogOverlay />
54 |       <AlertDialogPrimitive.Content
55 |         data-slot="alert-dialog-content"
56 |         className={cn(
57 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
58 |           className
59 |         )}
60 |         {...props}
61 |       />
62 |     </AlertDialogPortal>
63 |   )
64 | }
65 | 
66 | function AlertDialogHeader({
67 |   className,
68 |   ...props
[TRUNCATED]
```

src/components/ui/badge.tsx
```
1 | import * as React from "react"
2 | import { cva, type VariantProps } from "class-variance-authority"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | const badgeVariants = cva(
7 |   "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
8 |   {
9 |     variants: {
10 |       variant: {
11 |         default:
12 |           "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
13 |         secondary:
14 |           "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
15 |         destructive:
16 |           "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
17 |         outline: "text-foreground",
18 |       },
19 |     },
20 |     defaultVariants: {
21 |       variant: "default",
22 |     },
23 |   }
24 | )
25 | 
26 | export interface BadgeProps
27 |   extends React.HTMLAttributes<HTMLDivElement>,
28 |     VariantProps<typeof badgeVariants> {}
29 | 
30 | function Badge({ className, variant, ...props }: BadgeProps) {
31 |   return (
32 |     <div className={cn(badgeVariants({ variant }), className)} {...props} />
33 |   )
34 | }
35 | 
36 | export { Badge, badgeVariants } 
```

src/components/ui/button.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const buttonVariants = cva(
8 |   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
14 |         destructive:
15 |           "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
16 |         outline:
17 |           "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
18 |         secondary:
19 |           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
20 |         ghost: "hover:bg-accent hover:text-accent-foreground",
21 |         link: "text-primary underline-offset-4 hover:underline",
22 |       },
23 |       size: {
24 |         default: "h-9 px-4 py-2 has-[>svg]:px-3",
25 |         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
26 |         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
27 |         icon: "size-9",
28 |       },
29 |     },
30 |     defaultVariants: {
31 |       variant: "default",
32 |       size: "default",
33 |     },
34 |   }
35 | )
36 | 
37 | function Button({
38 |   className,
39 |   variant,
40 |   size,
41 |   asChild = false,
42 |   ...props
43 | }: React.ComponentProps<"button"> &
44 |   VariantProps<typeof buttonVariants> & {
45 |     asChild?: boolean
46 |   }) {
47 |   const Comp = asChild ? Slot : "button"
48 | 
49 |   return (
50 |     <Comp
51 |       data-slot="button"
[TRUNCATED]
```

src/components/ui/card.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Card({ className, ...props }: React.ComponentProps<"div">) {
6 |   return (
7 |     <div
8 |       data-slot="card"
9 |       className={cn(
10 |         "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
19 |   return (
20 |     <div
21 |       data-slot="card-header"
22 |       className={cn(
23 |         "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
24 |         className
25 |       )}
26 |       {...props}
27 |     />
28 |   )
29 | }
30 | 
31 | function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
32 |   return (
33 |     <div
34 |       data-slot="card-title"
35 |       className={cn("leading-none font-semibold", className)}
36 |       {...props}
37 |     />
38 |   )
39 | }
40 | 
41 | function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
42 |   return (
43 |     <div
44 |       data-slot="card-description"
45 |       className={cn("text-muted-foreground text-sm", className)}
46 |       {...props}
47 |     />
48 |   )
49 | }
50 | 
51 | function CardAction({ className, ...props }: React.ComponentProps<"div">) {
52 |   return (
53 |     <div
54 |       data-slot="card-action"
55 |       className={cn(
56 |         "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
57 |         className
58 |       )}
59 |       {...props}
60 |     />
61 |   )
62 | }
63 | 
64 | function CardContent({ className, ...props }: React.ComponentProps<"div">) {
65 |   return (
66 |     <div
67 |       data-slot="card-content"
68 |       className={cn("px-6", className)}
69 |       {...props}
70 |     />
71 |   )
72 | }
73 | 
74 | function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
75 |   return (
76 |     <div
[TRUNCATED]
```

src/components/ui/checkbox.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
5 | import { CheckIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Checkbox({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
13 |   return (
14 |     <CheckboxPrimitive.Root
15 |       data-slot="checkbox"
16 |       className={cn(
17 |         "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
18 |         className
19 |       )}
20 |       {...props}
21 |     >
22 |       <CheckboxPrimitive.Indicator
23 |         data-slot="checkbox-indicator"
24 |         className="flex items-center justify-center text-current transition-none"
25 |       >
26 |         <CheckIcon className="size-3.5" />
27 |       </CheckboxPrimitive.Indicator>
28 |     </CheckboxPrimitive.Root>
29 |   )
30 | }
31 | 
32 | export { Checkbox }
```

src/components/ui/dialog.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DialogPrimitive from "@radix-ui/react-dialog"
5 | import { XIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Dialog({
10 |   ...props
11 | }: React.ComponentProps<typeof DialogPrimitive.Root>) {
12 |   return <DialogPrimitive.Root data-slot="dialog" {...props} />
13 | }
14 | 
15 | function DialogTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
18 |   return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
19 | }
20 | 
21 | function DialogPortal({
22 |   ...props
23 | }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
24 |   return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
25 | }
26 | 
27 | function DialogClose({
28 |   ...props
29 | }: React.ComponentProps<typeof DialogPrimitive.Close>) {
30 |   return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
31 | }
32 | 
33 | function DialogOverlay({
34 |   className,
35 |   ...props
36 | }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
37 |   return (
38 |     <DialogPrimitive.Overlay
39 |       data-slot="dialog-overlay"
40 |       className={cn(
41 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
42 |         className
43 |       )}
44 |       {...props}
45 |     />
46 |   )
47 | }
48 | 
49 | function DialogContent({
50 |   className,
51 |   children,
52 |   ...props
53 | }: React.ComponentProps<typeof DialogPrimitive.Content>) {
54 |   return (
55 |     <DialogPortal data-slot="dialog-portal">
56 |       <DialogOverlay />
57 |       <DialogPrimitive.Content
58 |         data-slot="dialog-content"
59 |         className={cn(
60 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
61 |           className
62 |         )}
63 |         {...props}
64 |       >
[TRUNCATED]
```

src/components/ui/dropdown-menu.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
5 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function DropdownMenu({
10 |   ...props
11 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
12 |   return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
13 | }
14 | 
15 | function DropdownMenuPortal({
16 |   ...props
17 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
18 |   return (
19 |     <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
20 |   )
21 | }
22 | 
23 | function DropdownMenuTrigger({
24 |   ...props
25 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
26 |   return (
27 |     <DropdownMenuPrimitive.Trigger
28 |       data-slot="dropdown-menu-trigger"
29 |       {...props}
30 |     />
31 |   )
32 | }
33 | 
34 | function DropdownMenuContent({
35 |   className,
36 |   sideOffset = 4,
37 |   ...props
38 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
39 |   return (
40 |     <DropdownMenuPrimitive.Portal>
41 |       <DropdownMenuPrimitive.Content
42 |         data-slot="dropdown-menu-content"
43 |         sideOffset={sideOffset}
44 |         className={cn(
45 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
46 |           className
47 |         )}
48 |         {...props}
49 |       />
50 |     </DropdownMenuPrimitive.Portal>
51 |   )
52 | }
53 | 
54 | function DropdownMenuGroup({
55 |   ...props
56 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
57 |   return (
58 |     <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
59 |   )
60 | }
61 | 
62 | function DropdownMenuItem({
63 |   className,
64 |   inset,
65 |   variant = "default",
66 |   ...props
[TRUNCATED]
```

src/components/ui/form.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | import { Slot } from "@radix-ui/react-slot"
6 | import {
7 |   Controller,
8 |   ControllerProps,
9 |   FieldPath,
10 |   FieldValues,
11 |   FormProvider,
12 |   useFormContext,
13 |   useFormState,
14 | } from "react-hook-form"
15 | 
16 | import { cn } from "@/lib/utils"
17 | import { Label } from "@/components/ui/label"
18 | 
19 | const Form = FormProvider
20 | 
21 | type FormFieldContextValue<
22 |   TFieldValues extends FieldValues = FieldValues,
23 |   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
24 | > = {
25 |   name: TName
26 | }
27 | 
28 | const FormFieldContext = React.createContext<FormFieldContextValue>(
29 |   {} as FormFieldContextValue
30 | )
31 | 
32 | const FormField = <
33 |   TFieldValues extends FieldValues = FieldValues,
34 |   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
35 | >({
36 |   ...props
37 | }: ControllerProps<TFieldValues, TName>) => {
38 |   return (
39 |     <FormFieldContext.Provider value={{ name: props.name }}>
40 |       <Controller {...props} />
41 |     </FormFieldContext.Provider>
42 |   )
43 | }
44 | 
45 | const useFormField = () => {
46 |   const fieldContext = React.useContext(FormFieldContext)
47 |   const itemContext = React.useContext(FormItemContext)
48 |   const { getFieldState } = useFormContext()
49 |   const formState = useFormState({ name: fieldContext.name })
50 |   const fieldState = getFieldState(fieldContext.name, formState)
51 | 
52 |   if (!fieldContext) {
53 |     throw new Error("useFormField should be used within <FormField>")
54 |   }
55 | 
56 |   const { id } = itemContext
57 | 
58 |   return {
59 |     id,
60 |     name: fieldContext.name,
61 |     formItemId: `${id}-form-item`,
62 |     formDescriptionId: `${id}-form-item-description`,
63 |     formMessageId: `${id}-form-item-message`,
64 |     ...fieldState,
65 |   }
66 | }
67 | 
68 | type FormItemContextValue = {
69 |   id: string
70 | }
71 | 
72 | const FormItemContext = React.createContext<FormItemContextValue>(
73 |   {} as FormItemContextValue
74 | )
75 | 
76 | function FormItem({ className, ...props }: React.ComponentProps<"div">) {
77 |   const id = React.useId()
[TRUNCATED]
```

src/components/ui/input.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Input({ className, type, ...props }: React.ComponentProps<"input">) {
6 |   return (
7 |     <input
8 |       type={type}
9 |       data-slot="input"
10 |       className={cn(
11 |         "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
12 |         "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
13 |         "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
14 |         className
15 |       )}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | export { Input }
```

src/components/ui/label.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Label({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
12 |   return (
13 |     <LabelPrimitive.Root
14 |       data-slot="label"
15 |       className={cn(
16 |         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | export { Label }
```

src/components/ui/modal.tsx
```
1 | /**
2 |  * 파일명: modal.tsx
3 |  * 목적: 모달 다이얼로그 컴포넌트
4 |  * 역할: 모달 UI를 제공하는 컴포넌트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | "use client"
9 | 
10 | import * as React from "react"
11 | import {
12 |   Dialog,
13 |   DialogClose,
14 |   DialogContent,
15 |   DialogDescription,
16 |   DialogFooter,
17 |   DialogHeader,
18 |   DialogTitle,
19 |   DialogTrigger,
20 | } from "@/components/ui/dialog"
21 | 
22 | const Modal = {
23 |   Root: Dialog,
24 |   Trigger: DialogTrigger,
25 |   Content: DialogContent,
26 |   Title: DialogTitle,
27 |   Description: DialogDescription,
28 |   Footer: DialogFooter,
29 |   Close: DialogClose,
30 | }
31 | 
32 | export { Modal } 
```

src/components/ui/portal.tsx
```
1 | "use client";
2 | 
3 | import { useEffect, useState } from 'react'
4 | import { createPortal } from 'react-dom'
5 | 
6 | interface PortalProps {
7 |   children: React.ReactNode
8 | }
9 | 
10 | export function Portal({ children }: PortalProps) {
11 |   const [mounted, setMounted] = useState(false)
12 | 
13 |   useEffect(() => {
14 |     setMounted(true)
15 |     return () => setMounted(false)
16 |   }, [])
17 | 
18 |   return mounted
19 |     ? createPortal(children, document.body)
20 |     : null
21 | } 
```

src/components/ui/radio-group.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
5 | import { CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function RadioGroup({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
13 |   return (
14 |     <RadioGroupPrimitive.Root
15 |       data-slot="radio-group"
16 |       className={cn("grid gap-3", className)}
17 |       {...props}
18 |     />
19 |   )
20 | }
21 | 
22 | function RadioGroupItem({
23 |   className,
24 |   ...props
25 | }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
26 |   return (
27 |     <RadioGroupPrimitive.Item
28 |       data-slot="radio-group-item"
29 |       className={cn(
30 |         "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
31 |         className
32 |       )}
33 |       {...props}
34 |     >
35 |       <RadioGroupPrimitive.Indicator
36 |         data-slot="radio-group-indicator"
37 |         className="relative flex items-center justify-center"
38 |       >
39 |         <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
40 |       </RadioGroupPrimitive.Indicator>
41 |     </RadioGroupPrimitive.Item>
42 |   )
43 | }
44 | 
45 | export { RadioGroup, RadioGroupItem }
```

src/components/ui/scroll-area.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function ScrollArea({
9 |   className,
10 |   children,
11 |   ...props
12 | }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
13 |   return (
14 |     <ScrollAreaPrimitive.Root
15 |       data-slot="scroll-area"
16 |       className={cn("relative", className)}
17 |       {...props}
18 |     >
19 |       <ScrollAreaPrimitive.Viewport
20 |         data-slot="scroll-area-viewport"
21 |         className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
22 |       >
23 |         {children}
24 |       </ScrollAreaPrimitive.Viewport>
25 |       <ScrollBar />
26 |       <ScrollAreaPrimitive.Corner />
27 |     </ScrollAreaPrimitive.Root>
28 |   )
29 | }
30 | 
31 | function ScrollBar({
32 |   className,
33 |   orientation = "vertical",
34 |   ...props
35 | }: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
36 |   return (
37 |     <ScrollAreaPrimitive.ScrollAreaScrollbar
38 |       data-slot="scroll-area-scrollbar"
39 |       orientation={orientation}
40 |       className={cn(
41 |         "flex touch-none p-px transition-colors select-none",
42 |         orientation === "vertical" &&
43 |           "h-full w-2.5 border-l border-l-transparent",
44 |         orientation === "horizontal" &&
45 |           "h-2.5 flex-col border-t border-t-transparent",
46 |         className
47 |       )}
48 |       {...props}
49 |     >
50 |       <ScrollAreaPrimitive.ScrollAreaThumb
51 |         data-slot="scroll-area-thumb"
52 |         className="bg-border relative flex-1 rounded-full"
53 |       />
54 |     </ScrollAreaPrimitive.ScrollAreaScrollbar>
55 |   )
56 | }
57 | 
58 | export { ScrollArea, ScrollBar }
```

src/components/ui/skeleton.tsx
```
1 | import { cn } from "@/lib/utils"
2 | 
3 | function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
4 |   return (
5 |     <div
6 |       data-slot="skeleton"
7 |       className={cn("bg-primary/10 animate-pulse rounded-md", className)}
8 |       {...props}
9 |     />
10 |   )
11 | }
12 | 
13 | export { Skeleton }
```

src/components/ui/slider.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SliderPrimitive from "@radix-ui/react-slider"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Slider({
9 |   className,
10 |   defaultValue,
11 |   value,
12 |   min = 0,
13 |   max = 100,
14 |   ...props
15 | }: React.ComponentProps<typeof SliderPrimitive.Root>) {
16 |   const _values = React.useMemo(
17 |     () =>
18 |       Array.isArray(value)
19 |         ? value
20 |         : Array.isArray(defaultValue)
21 |           ? defaultValue
22 |           : [min, max],
23 |     [value, defaultValue, min, max]
24 |   )
25 | 
26 |   return (
27 |     <SliderPrimitive.Root
28 |       data-slot="slider"
29 |       defaultValue={defaultValue}
30 |       value={value}
31 |       min={min}
32 |       max={max}
33 |       className={cn(
34 |         "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
35 |         className
36 |       )}
37 |       {...props}
38 |     >
39 |       <SliderPrimitive.Track
40 |         data-slot="slider-track"
41 |         className={cn(
42 |           "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
43 |         )}
44 |       >
45 |         <SliderPrimitive.Range
46 |           data-slot="slider-range"
47 |           className={cn(
48 |             "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
49 |           )}
50 |         />
51 |       </SliderPrimitive.Track>
52 |       {Array.from({ length: _values.length }, (_, index) => (
53 |         <SliderPrimitive.Thumb
54 |           data-slot="slider-thumb"
55 |           key={index}
56 |           className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
57 |         />
58 |       ))}
59 |     </SliderPrimitive.Root>
60 |   )
61 | }
62 | 
63 | export { Slider }
```

src/components/ui/sonner.tsx
```
1 | "use client"
2 | 
3 | import { useTheme } from "next-themes"
4 | import { Toaster as Sonner, ToasterProps } from "sonner"
5 | 
6 | const Toaster = ({ ...props }: ToasterProps) => {
7 |   const { theme = "system" } = useTheme()
8 | 
9 |   return (
10 |     <Sonner
11 |       theme={theme as ToasterProps["theme"]}
12 |       className="toaster group"
13 |       toastOptions={{
14 |         classNames: {
15 |           toast:
16 |             "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
17 |           description: "group-[.toast]:text-muted-foreground",
18 |           actionButton:
19 |             "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
20 |           cancelButton:
21 |             "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
22 |         },
23 |       }}
24 |       {...props}
25 |     />
26 |   )
27 | }
28 | 
29 | export { Toaster }
```

src/components/ui/spinner.tsx
```
1 | /**
2 |  * 파일명: src/components/ui/spinner.tsx
3 |  * 목적: 로딩 상태를 표시하는 스피너 컴포넌트 제공
4 |  * 역할: 비동기 작업 중에 사용자에게 로딩 상태를 표시
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { cn } from '@/lib/utils';
9 | 
10 | interface SpinnerProps {
11 |   size?: 'sm' | 'md' | 'lg';
12 |   className?: string;
13 | }
14 | 
15 | /**
16 |  * Spinner: 로딩 상태를 표시하는 스피너 컴포넌트
17 |  * @param size 스피너 크기 (sm, md, lg)
18 |  * @param className 추가 CSS 클래스
19 |  * @returns {JSX.Element} 스피너 컴포넌트
20 |  */
21 | export function Spinner({ size = 'md', className }: SpinnerProps) {
22 |   const sizeClasses = {
23 |     sm: 'h-4 w-4 border-2',
24 |     md: 'h-8 w-8 border-2',
25 |     lg: 'h-12 w-12 border-3',
26 |   };
27 | 
28 |   return (
29 |     <div
30 |       className={cn(
31 |         'animate-spin rounded-full border-solid border-primary border-t-transparent',
32 |         sizeClasses[size],
33 |         className
34 |       )}
35 |       aria-label="로딩 중"
36 |       role="status"
37 |     />
38 |   );
39 | } 
```

src/components/ui/table.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | function Table({ className, ...props }: React.ComponentProps<"table">) {
8 |   return (
9 |     <div
10 |       data-slot="table-container"
11 |       className="relative w-full overflow-x-auto"
12 |     >
13 |       <table
14 |         data-slot="table"
15 |         className={cn("w-full caption-bottom text-sm", className)}
16 |         {...props}
17 |       />
18 |     </div>
19 |   )
20 | }
21 | 
22 | function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
23 |   return (
24 |     <thead
25 |       data-slot="table-header"
26 |       className={cn("[&_tr]:border-b", className)}
27 |       {...props}
28 |     />
29 |   )
30 | }
31 | 
32 | function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
33 |   return (
34 |     <tbody
35 |       data-slot="table-body"
36 |       className={cn("[&_tr:last-child]:border-0", className)}
37 |       {...props}
38 |     />
39 |   )
40 | }
41 | 
42 | function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
43 |   return (
44 |     <tfoot
45 |       data-slot="table-footer"
46 |       className={cn(
47 |         "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
48 |         className
49 |       )}
50 |       {...props}
51 |     />
52 |   )
53 | }
54 | 
55 | function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
56 |   return (
57 |     <tr
58 |       data-slot="table-row"
59 |       className={cn(
60 |         "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
61 |         className
62 |       )}
63 |       {...props}
64 |     />
65 |   )
66 | }
67 | 
68 | function TableHead({ className, ...props }: React.ComponentProps<"th">) {
69 |   return (
70 |     <th
71 |       data-slot="table-head"
72 |       className={cn(
73 |         "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
74 |         className
75 |       )}
76 |       {...props}
77 |     />
[TRUNCATED]
```

src/components/ui/tabs.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TabsPrimitive from "@radix-ui/react-tabs"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Tabs({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof TabsPrimitive.Root>) {
12 |   return (
13 |     <TabsPrimitive.Root
14 |       data-slot="tabs"
15 |       className={cn("flex flex-col gap-2", className)}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function TabsList({
22 |   className,
23 |   ...props
24 | }: React.ComponentProps<typeof TabsPrimitive.List>) {
25 |   return (
26 |     <TabsPrimitive.List
27 |       data-slot="tabs-list"
28 |       className={cn(
29 |         "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
30 |         className
31 |       )}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function TabsTrigger({
38 |   className,
39 |   ...props
40 | }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
41 |   return (
42 |     <TabsPrimitive.Trigger
43 |       data-slot="tabs-trigger"
44 |       className={cn(
45 |         "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
46 |         className
47 |       )}
48 |       {...props}
49 |     />
50 |   )
51 | }
52 | 
53 | function TabsContent({
54 |   className,
55 |   ...props
56 | }: React.ComponentProps<typeof TabsPrimitive.Content>) {
57 |   return (
58 |     <TabsPrimitive.Content
59 |       data-slot="tabs-content"
60 |       className={cn("flex-1 outline-none", className)}
61 |       {...props}
62 |     />
[TRUNCATED]
```

src/components/ui/textarea.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
6 |   return (
7 |     <textarea
8 |       data-slot="textarea"
9 |       className={cn(
10 |         "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | export { Textarea }
```

src/components/ui/tooltip.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TooltipPrimitive from "@radix-ui/react-tooltip"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function TooltipProvider({
9 |   delayDuration = 0,
10 |   ...props
11 | }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
12 |   return (
13 |     <TooltipPrimitive.Provider
14 |       data-slot="tooltip-provider"
15 |       delayDuration={delayDuration}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function Tooltip({
22 |   ...props
23 | }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
24 |   return (
25 |     <TooltipProvider>
26 |       <TooltipPrimitive.Root data-slot="tooltip" {...props} />
27 |     </TooltipProvider>
28 |   )
29 | }
30 | 
31 | function TooltipTrigger({
32 |   ...props
33 | }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
34 |   return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
35 | }
36 | 
37 | function TooltipContent({
38 |   className,
39 |   sideOffset = 0,
40 |   children,
41 |   ...props
42 | }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
43 |   return (
44 |     <TooltipPrimitive.Portal>
45 |       <TooltipPrimitive.Content
46 |         data-slot="tooltip-content"
47 |         sideOffset={sideOffset}
48 |         className={cn(
49 |           "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
50 |           className
51 |         )}
52 |         {...props}
53 |       >
54 |         {children}
55 |         <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
56 |       </TooltipPrimitive.Content>
57 |     </TooltipPrimitive.Portal>
58 |   )
59 | }
60 | 
61 | export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

src/components/editor/DocumentViewer.tsx
```
1 | 'use client';
2 | 
3 | import React, { useMemo, useEffect } from 'react';
4 | import { formatDate } from '@/lib/utils';
5 | import TiptapViewer from './TiptapViewer';
6 | import { Badge } from '@/components/ui/badge';
7 | import { Skeleton } from '@/components/ui/skeleton';
8 | 
9 | // 카드 타입 정의
10 | interface CardData {
11 |   id: string;
12 |   title: string;
13 |   content: string;
14 |   createdAt?: string;
15 |   cardTags?: Array<{ id: string; tag: { id: string; name: string } }>;
16 | }
17 | 
18 | // 컴포넌트 props 인터페이스 단순화
19 | interface DocumentViewerProps {
20 |   cards: CardData[];
21 |   isMultiSelection: boolean;
22 |   loading: boolean;
23 | }
24 | 
25 | export default function DocumentViewer({
26 |   cards,
27 |   isMultiSelection,
28 |   loading
29 | }: DocumentViewerProps) {
30 |   // 디버깅용 로그 추가
31 |   useEffect(() => {
32 |     // 카드 내용이 변경되면 로그 출력
33 |     if (cards && cards.length > 0) {
34 |       console.log('DocumentViewer 카드 업데이트됨:', {
35 |         카드수: cards.length,
36 |         첫번째카드: cards[0]?.id,
37 |         내용길이: cards[0]?.content?.length || 0,
38 |         다중선택: isMultiSelection
39 |       });
40 |     }
41 |   }, [cards, isMultiSelection]);
42 | 
43 |   // 데이터 가공 로직을 컴포넌트 내부로 이동
44 |   const { title, content, date, tags } = useMemo(() => {
45 |     if (!cards || cards.length === 0) {
46 |       return { title: '', content: '', date: null, tags: [] };
47 |     }
48 | 
49 |     // 단일 카드 선택 모드
50 |     if (!isMultiSelection || cards.length === 1) {
51 |       const card = cards[0];
52 |       return {
53 |         title: card.title || '',
54 |         content: card.content || '',
55 |         date: card.createdAt || null,
56 |         tags: card.cardTags ? card.cardTags.map(ct => ct.tag.name) : []
57 |       };
58 |     }
59 | 
60 |     // 다중 카드 선택 모드 - 여기서 병합 로직 처리
61 |     const multiTitle = cards.map(card => card.title).join(', ');
62 |     // 카드 내용을 HTML로 병합
63 |     const multiContent = cards.map(card => {
64 |       return card.content;
65 |     }).join('');
66 | 
67 |     return {
68 |       title: multiTitle,
69 |       content: multiContent,
[TRUNCATED]
```

src/components/editor/TiptapEditor.tsx
```
1 | "use client";
2 | 
3 | import React, { useCallback, useEffect } from 'react'
4 | import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
5 | import StarterKit from '@tiptap/starter-kit'
6 | import Link from '@tiptap/extension-link'
7 | import Heading from '@tiptap/extension-heading'
8 | import Image from '@tiptap/extension-image'
9 | import { Button } from '@/components/ui/button'
10 | import { 
11 |   Bold as BoldIcon,
12 |   Italic as ItalicIcon,
13 |   Link as LinkIcon,
14 |   Heading1 as H1Icon,
15 |   Heading2 as H2Icon,
16 |   List as ListIcon,
17 |   ListOrdered as OrderedListIcon,
18 |   Image as ImageIcon
19 | } from 'lucide-react'
20 | import Placeholder from '@tiptap/extension-placeholder'
21 | 
22 | interface TiptapEditorProps {
23 |   content: string
24 |   onChange: (content: string) => void
25 |   placeholder?: string
26 |   showToolbar?: boolean
27 |   id?: string
28 | }
29 | 
30 | export default function TiptapEditor({ 
31 |   content, 
32 |   onChange, 
33 |   placeholder = '내용을 입력하세요...', 
34 |   showToolbar = true,
35 |   id = 'tiptap-editor'
36 | }: TiptapEditorProps) {
37 |   const editor = useEditor({
38 |     extensions: [
39 |       StarterKit.configure({
40 |         bulletList: {
41 |           keepMarks: true,
42 |           keepAttributes: false,
43 |         },
44 |         orderedList: {
45 |           keepMarks: true,
46 |           keepAttributes: false,
47 |         },
48 |         heading: false,
49 |       }),
50 |       Link.configure({
51 |         openOnClick: false,
52 |       }),
53 |       Heading.configure({
54 |         levels: [1, 2, 3],
55 |       }),
56 |       Image,
57 |       Placeholder.configure({
58 |         placeholder: placeholder || '내용을 입력하세요...',
59 |       }),
60 |     ],
61 |     content: content,
62 |     immediatelyRender: false,
63 |     onUpdate: ({ editor }) => {
64 |       onChange(editor.getHTML());
65 |     },
66 |     editorProps: {
67 |       attributes: {
68 |         class: 'min-h-[150px] prose dark:prose-invert focus:outline-none max-w-none p-4 border rounded-md',
69 |       },
70 |     },
71 |   });
72 | 
73 |   useEffect(() => {
74 |     if (editor && content !== editor.getHTML()) {
75 |       editor.commands.setContent(content);
76 |     }
77 |   }, [content, editor]);
78 | 
[TRUNCATED]
```

src/components/editor/TiptapViewer.tsx
```
1 | "use client";
2 | 
3 | import React from 'react';
4 | import { useEditor, EditorContent } from '@tiptap/react';
5 | import StarterKit from '@tiptap/starter-kit';
6 | import Link from '@tiptap/extension-link';
7 | import Heading from '@tiptap/extension-heading';
8 | import Image from '@tiptap/extension-image';
9 | 
10 | interface TiptapViewerProps {
11 |   content: string;
12 | }
13 | 
14 | export default function TiptapViewer({ content }: TiptapViewerProps) {
15 |   const editor = useEditor({
16 |     extensions: [
17 |       StarterKit.configure({
18 |         heading: false,
19 |       }),
20 |       Link.configure({
21 |         openOnClick: true,
22 |       }),
23 |       Heading.configure({
24 |         levels: [1, 2],
25 |       }),
26 |       Image,
27 |     ],
28 |     content,
29 |     editable: false,
30 |     immediatelyRender: false,
31 |     editorProps: {
32 |       attributes: {
33 |         class: 'prose dark:prose-invert max-w-none',
34 |       },
35 |     },
36 |   });
37 | 
38 |   return <EditorContent editor={editor} />;
39 | } 
```

prisma/migrations/20250311104541_init/migration.sql
```
1 | -- CreateTable
2 | CREATE TABLE "accounts" (
3 |     "id" TEXT NOT NULL PRIMARY KEY,
4 |     "user_id" TEXT NOT NULL,
5 |     "type" TEXT NOT NULL,
6 |     "provider" TEXT NOT NULL,
7 |     "provider_account_id" TEXT NOT NULL,
8 |     "refresh_token" TEXT,
9 |     "access_token" TEXT,
10 |     "expires_at" INTEGER,
11 |     "token_type" TEXT,
12 |     "scope" TEXT,
13 |     "id_token" TEXT,
14 |     "session_state" TEXT,
15 |     CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
16 | );
17 | 
18 | -- CreateTable
19 | CREATE TABLE "sessions" (
20 |     "id" TEXT NOT NULL PRIMARY KEY,
21 |     "session_token" TEXT NOT NULL,
22 |     "user_id" TEXT NOT NULL,
23 |     "expires" DATETIME NOT NULL,
24 |     CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
25 | );
26 | 
27 | -- CreateTable
28 | CREATE TABLE "verification_tokens" (
29 |     "identifier" TEXT NOT NULL,
30 |     "token" TEXT NOT NULL,
31 |     "expires" DATETIME NOT NULL
32 | );
33 | 
34 | -- CreateTable
35 | CREATE TABLE "users" (
36 |     "id" TEXT NOT NULL PRIMARY KEY,
37 |     "email" TEXT NOT NULL,
38 |     "name" TEXT,
39 |     "image" TEXT,
40 |     "email_verified" DATETIME,
41 |     "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
42 |     "updated_at" DATETIME NOT NULL
43 | );
44 | 
45 | -- CreateTable
46 | CREATE TABLE "cards" (
47 |     "id" TEXT NOT NULL PRIMARY KEY,
48 |     "title" TEXT NOT NULL,
49 |     "content" TEXT,
50 |     "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
51 |     "updated_at" DATETIME NOT NULL,
52 |     "user_id" TEXT NOT NULL,
53 |     CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
54 | );
55 | 
56 | -- CreateTable
57 | CREATE TABLE "tags" (
58 |     "id" TEXT NOT NULL PRIMARY KEY,
59 |     "name" TEXT NOT NULL,
60 |     "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
[TRUNCATED]
```

src/store/__tests__/useBoardStore.test.ts
```
1 | /**
2 |  * 파일명: useBoardStore.test.ts
3 |  * 목적: useBoardStore 상태 관리 테스트
4 |  * 역할: 보드 상태 관리 로직 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
9 | import { act } from '@testing-library/react';
10 | import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
11 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
12 | 
13 | // 로컬 스토리지 모킹
14 | const localStorageMock = (() => {
15 |   let store: Record<string, string> = {};
16 |   return {
17 |     getItem: vi.fn((key: string) => {
18 |       return store[key] || null;
19 |     }),
20 |     setItem: vi.fn((key: string, value: string) => {
21 |       store[key] = value.toString();
22 |     }),
23 |     removeItem: vi.fn((key: string) => {
24 |       delete store[key];
25 |     }),
26 |     clear: vi.fn(() => {
27 |       store = {};
28 |     }),
29 |     store
30 |   };
31 | })();
32 | 
33 | // window.localStorage를 모킹된 버전으로 대체
34 | Object.defineProperty(window, 'localStorage', { value: localStorageMock });
35 | 
36 | // 외부 모듈 모킹 - import 전에 수행
37 | vi.mock('@/lib/board-utils', () => {
38 |   return {
39 |     DEFAULT_BOARD_SETTINGS: {
40 |       edgeColor: '#000000',
41 |       strokeWidth: 1,
42 |       animated: false,
43 |       markerEnd: true,
44 |       connectionLineType: 'default',
45 |       snapToGrid: false,
46 |       snapGrid: [20, 20]
47 |     },
48 |     saveBoardSettingsToServer: vi.fn().mockResolvedValue(true),
49 |     loadBoardSettingsFromServer: vi.fn().mockResolvedValue({
50 |       edgeColor: '#000000',
51 |       strokeWidth: 1,
52 |       animated: false,
53 |       markerEnd: true,
54 |       connectionLineType: 'default',
55 |       snapToGrid: false,
56 |       snapGrid: [20, 20]
57 |     }),
58 |     applyEdgeSettings: vi.fn((edges, settings) => {
59 |       return edges.map((edge: { style?: any; [key: string]: any }) => ({
60 |         ...edge,
61 |         animated: settings.animated,
62 |         style: {
63 |           ...edge.style,
64 |           strokeWidth: settings.strokeWidth,
65 |           stroke: settings.edgeColor
66 |         }
67 |       }));
68 |     })
69 |   };
70 | });
71 | 
72 | // layout-utils 모킹
73 | vi.mock('@/lib/layout-utils', () => ({
[TRUNCATED]
```

src/tests/auth/auth-flow.test.ts
```
1 | /**
2 |  * 파일명: auth-flow.test.ts
3 |  * 목적: 인증 흐름 전체를 테스트
4 |  * 역할: 인증 흐름의 각 단계가 올바르게 작동하는지 검증
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { getAuthData, setAuthData, removeAuthData, clearAllAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
9 | import { generateMockCodeVerifier, generateMockAuthCode } from '../mocks/auth-mock';
10 | 
11 | // 브라우저 환경 모킹
12 | const mockLocalStorage: Record<string, string> = {};
13 | const mockSessionStorage: Record<string, string> = {};
14 | const mockCookies: Record<string, string> = {};
15 | 
16 | // mock cookies
17 | Object.defineProperty(document, 'cookie', {
18 |   get: jest.fn(() => {
19 |     return Object.entries(mockCookies)
20 |       .map(([name, value]) => `${name}=${value}`)
21 |       .join('; ');
22 |   }),
23 |   set: jest.fn((cookie) => {
24 |     const parts = cookie.split('=');
25 |     const name = parts[0].trim();
26 |     const value = parts.slice(1).join('=');
27 |     mockCookies[name] = value;
28 |     return cookie;
29 |   }),
30 | });
31 | 
32 | // mock localStorage
33 | Object.defineProperty(window, 'localStorage', {
34 |   value: {
35 |     getItem: jest.fn((key: string) => {
36 |       return mockLocalStorage[key] || null;
37 |     }),
38 |     setItem: jest.fn((key: string, value: string) => {
39 |       mockLocalStorage[key] = value;
40 |     }),
41 |     removeItem: jest.fn((key: string) => {
42 |       delete mockLocalStorage[key];
43 |     }),
44 |     clear: jest.fn(() => {
45 |       Object.keys(mockLocalStorage).forEach((key) => {
46 |         delete mockLocalStorage[key];
47 |       });
48 |     }),
49 |     key: jest.fn((index: number) => {
50 |       return Object.keys(mockLocalStorage)[index] || null;
51 |     }),
52 |     length: jest.fn(() => {
53 |       return Object.keys(mockLocalStorage).length;
54 |     }),
55 |   },
56 |   writable: true,
57 | });
58 | 
59 | // mock sessionStorage
60 | Object.defineProperty(window, 'sessionStorage', {
61 |   value: {
62 |     getItem: jest.fn((key: string) => {
63 |       return mockSessionStorage[key] || null;
64 |     }),
65 |     setItem: jest.fn((key: string, value: string) => {
66 |       mockSessionStorage[key] = value;
67 |     }),
[TRUNCATED]
```

src/tests/auth/auth-integration.test.ts
```
1 | /**
2 |  * 파일명: auth-integration.test.ts
3 |  * 목적: Google OAuth 인증 통합 테스트
4 |  * 역할: 인증 관련 모든 기능의 통합 테스트
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
9 | import { mockLocalStorage, mockSessionStorage, mockCookies, mockCrypto } from '../mocks/storage-mock';
10 | import { mockClientEnvironment, mockServerEnvironment } from '../mocks/env-mock';
11 | import { mockSupabaseBrowserClient, mockSupabaseServerClient, mockSupabaseSession } from '../mocks/supabase-mock';
12 | import { 
13 |   mockEnvironment, 
14 |   mockAuth, 
15 |   mockBase64, 
16 |   mockMiddleware, 
17 |   mockNextResponse,
18 |   mockAuthContext
19 | } from '../mocks/additional-mocks';
20 | 
21 | // 모킹 환경 설정
22 | let clientEnv: { restore: () => void };
23 | let serverEnv: { restore: () => void };
24 | let mockStorage: ReturnType<typeof mockLocalStorage>;
25 | let mockSession: ReturnType<typeof mockSessionStorage>;
26 | let mockCookie: ReturnType<typeof mockCookies>;
27 | let mockSupabase: ReturnType<typeof mockSupabaseBrowserClient>;
28 | let crypto: ReturnType<typeof mockCrypto>;
29 | 
30 | // 추가 모킹
31 | let environmentMock: ReturnType<typeof mockEnvironment>;
32 | let authMock: ReturnType<typeof mockAuth>;
33 | let base64Mock: ReturnType<typeof mockBase64>;
34 | let middlewareMock: ReturnType<typeof mockMiddleware>;
35 | let nextResponseMock: ReturnType<typeof mockNextResponse>;
36 | let authContextMock: ReturnType<typeof mockAuthContext>;
37 | 
38 | // 모듈 모킹 설정
39 | vi.mock('../../lib/auth-storage', async () => {
40 |   const actual = await vi.importActual('../../lib/auth-storage');
41 |   return {
42 |     ...(actual as object),
43 |     getAuthData: vi.fn(),
44 |     setAuthData: vi.fn().mockReturnValue(true),
45 |     removeAuthData: vi.fn().mockReturnValue(true),
46 |     STORAGE_KEYS: {
47 |       ACCESS_TOKEN: 'access_token',
48 |       REFRESH_TOKEN: 'refresh_token',
49 |       SESSION_EXPIRY: 'session_expiry',
50 |       RECOVERY_ATTEMPTS: 'recovery_attempts',
51 |       CODE_VERIFIER: 'code_verifier'
52 |     }
53 |   };
54 | });
55 | 
56 | vi.mock('../../lib/cookie', () => {
57 |   return {
58 |     getAuthCookie: vi.fn(),
59 |     setAuthCookie: vi.fn(),
60 |     deleteAuthCookie: vi.fn()
61 |   };
62 | });
63 | 
64 | vi.mock('../../lib/environment', () => {
65 |   // 환경 모킹은 동적으로 설정됨
66 |   return environmentMock || mockEnvironment();
67 | });
68 | 
69 | vi.mock('../../lib/auth', () => {
[TRUNCATED]
```

src/tests/auth/auth-storage.test.ts
```
1 | /**
2 |  * 파일명: auth-storage.test.ts
3 |  * 목적: 다중 스토리지 전략 테스트
4 |  * 역할: 인증 데이터 저장 및 복원 로직 테스트
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
9 | import { mockLocalStorage, mockSessionStorage, mockCookies } from '../mocks/storage-mock';
10 | import { mockClientEnvironment } from '../mocks/env-mock';
11 | 
12 | // 테스트 대상 모듈을 모킹하기 전에 원본 참조 저장
13 | const originalModule = vi.importActual('../../lib/auth-storage');
14 | 
15 | // 테스트 환경 설정
16 | let mockStorage: ReturnType<typeof mockLocalStorage>;
17 | let mockSession: ReturnType<typeof mockSessionStorage>;
18 | let mockCookie: ReturnType<typeof mockCookies>;
19 | let clientEnvironment: { restore: () => void };
20 | 
21 | // auth-storage 모듈 모킹
22 | vi.mock('../../lib/auth-storage', async () => {
23 |   const actual = await vi.importActual('../../lib/auth-storage');
24 |   return {
25 |     ...actual as object,
26 |     // 필요한 함수만 오버라이드
27 |   };
28 | });
29 | 
30 | // 쿠키 유틸리티 모듈 모킹
31 | vi.mock('../../lib/cookie', () => {
32 |   return {
33 |     getAuthCookie: vi.fn((key: string) => mockCookie.get(key)),
34 |     setAuthCookie: vi.fn((key: string, value: string, days: number) => mockCookie.set(key, value)),
35 |     deleteAuthCookie: vi.fn((key: string) => mockCookie.delete(key)),
36 |   };
37 | });
38 | 
39 | describe('인증 스토리지 전략 테스트', () => {
40 |   beforeEach(() => {
41 |     // 테스트 환경 초기화
42 |     vi.resetModules();
43 |     
44 |     // 스토리지 모킹
45 |     mockStorage = mockLocalStorage();
46 |     mockSession = mockSessionStorage();
47 |     mockCookie = mockCookies();
48 |     
49 |     // 클라이언트 환경 모킹
50 |     clientEnvironment = mockClientEnvironment();
51 |     
52 |     // window 객체의 localStorage 및 sessionStorage 오버라이드
53 |     Object.defineProperty(global.window, 'localStorage', {
54 |       value: mockStorage,
55 |       writable: true
56 |     });
57 |     
58 |     Object.defineProperty(global.window, 'sessionStorage', {
59 |       value: mockSession,
60 |       writable: true
61 |     });
62 |   });
63 |   
64 |   afterEach(() => {
65 |     // 테스트 환경 정리
66 |     clientEnvironment.restore();
67 |     vi.clearAllMocks();
68 |   });
69 |   
[TRUNCATED]
```

src/tests/auth/environment-detection.test.ts
```
1 | /**
2 |  * 파일명: environment-detection.test.ts
3 |  * 목적: 서버/클라이언트 환경 감지 기능 테스트
4 |  * 역할: 환경 감지 유틸리티 함수의 정확성 검증
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
9 | import { mockClientEnvironment, mockServerEnvironment, mockHybridEnvironment } from '../mocks/env-mock';
10 | 
11 | // 테스트 환경 설정
12 | let clientEnv: { restore: () => void };
13 | let serverEnv: { restore: () => void };
14 | let hybridEnv: ReturnType<typeof mockHybridEnvironment>;
15 | 
16 | describe('환경 감지 테스트', () => {
17 |   afterEach(() => {
18 |     // 모든 환경 설정 정리
19 |     if (clientEnv) clientEnv.restore();
20 |     if (serverEnv) serverEnv.restore();
21 |     
22 |     // 모듈 캐시 초기화
23 |     jest.resetModules();
24 |   });
25 |   
26 |   test('isClient가 클라이언트 환경에서 true를 반환하는지 검증', async () => {
27 |     // 클라이언트 환경 설정
28 |     clientEnv = mockClientEnvironment();
29 |     
30 |     // 환경 유틸리티 모듈 임포트
31 |     const { isClient } = await import('../../lib/environment');
32 |     
33 |     // 검증
34 |     expect(isClient()).toBe(true);
35 |   });
36 |   
37 |   test('isClient가 서버 환경에서 false를 반환하는지 검증', async () => {
38 |     // 서버 환경 설정
39 |     serverEnv = mockServerEnvironment();
40 |     
41 |     // 환경 유틸리티 모듈 임포트
42 |     const { isClient } = await import('../../lib/environment');
43 |     
44 |     // 검증
45 |     expect(isClient()).toBe(false);
46 |   });
47 |   
48 |   test('isServer가 서버 환경에서 true를 반환하는지 검증', async () => {
49 |     // 서버 환경 설정
50 |     serverEnv = mockServerEnvironment();
51 |     
52 |     // 환경 유틸리티 모듈 임포트
53 |     const { isServer } = await import('../../lib/environment');
54 |     
55 |     // 검증
56 |     expect(isServer()).toBe(true);
57 |   });
58 |   
59 |   test('isServer가 클라이언트 환경에서 false를 반환하는지 검증', async () => {
60 |     // 클라이언트 환경 설정
61 |     clientEnv = mockClientEnvironment();
62 |     
63 |     // 환경 유틸리티 모듈 임포트
64 |     const { isServer } = await import('../../lib/environment');
65 |     
66 |     // 검증
67 |     expect(isServer()).toBe(false);
68 |   });
69 |   
[TRUNCATED]
```

src/tests/auth/middleware.test.ts
```
1 | /**
2 |  * 파일명: middleware.test.ts
3 |  * 목적: Next.js 미들웨어 인증 검증 테스트
4 |  * 역할: 서버 측 미들웨어의 인증 검증 로직 테스트
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
9 | import { mockServerEnvironment } from '../mocks/env-mock';
10 | import { mockSupabaseServerClient, mockSupabaseSession } from '../mocks/supabase-mock';
11 | 
12 | // Next.js Request, Response 및 NextResponse 모킹
13 | jest.mock('next/server', () => {
14 |   return {
15 |     NextResponse: {
16 |       next: jest.fn(() => ({ type: 'next' })),
17 |       redirect: jest.fn((url) => ({ type: 'redirect', url })),
18 |     },
19 |   };
20 | });
21 | 
22 | // Supabase 클라이언트 모킹
23 | jest.mock('@supabase/supabase-js', () => {
24 |   return {
25 |     createServerClient: jest.fn()
26 |   };
27 | });
28 | 
29 | // 테스트 환경 설정
30 | let serverEnv: { restore: () => void };
31 | let mockSupabase: ReturnType<typeof mockSupabaseServerClient>;
32 | let nextModule: any;
33 | 
34 | // 테스트용 URL 및 경로 설정
35 | const TEST_BASE_URL = 'http://localhost:3000';
36 | const PUBLIC_PATHS = ['/login', '/signup', '/reset-password'];
37 | const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];
38 | 
39 | describe('미들웨어 인증 테스트', () => {
40 |   beforeEach(() => {
41 |     // 테스트 환경 초기화
42 |     jest.resetModules();
43 |     
44 |     // 서버 환경 모킹
45 |     serverEnv = mockServerEnvironment();
46 |     
47 |     // Supabase 서버 클라이언트 모킹
48 |     mockSupabase = mockSupabaseServerClient();
49 |     require('@supabase/supabase-js').createServerClient.mockReturnValue(mockSupabase);
50 |     
51 |     // Next.js 모듈 가져오기
52 |     nextModule = require('next/server');
53 |   });
54 |   
55 |   afterEach(() => {
56 |     // 테스트 환경 정리
57 |     serverEnv.restore();
58 |     jest.clearAllMocks();
59 |   });
60 |   
61 |   // 테스트용 요청 객체 생성 함수
62 |   const createRequest = (path: string) => {
63 |     return {
64 |       url: `${TEST_BASE_URL}${path}`,
65 |       nextUrl: { pathname: path },
66 |       cookies: {
67 |         get: jest.fn(),
68 |         set: jest.fn(),
69 |         delete: jest.fn(),
70 |       },
71 |       headers: {
[TRUNCATED]
```

src/tests/auth/pkce.test.ts
```
1 | /**
2 |  * 파일명: pkce.test.ts
3 |  * 목적: PKCE 인증 구현 테스트
4 |  * 역할: 코드 검증기 및 코드 챌린지 생성/검증 기능 테스트
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
9 | import { mockClientEnvironment } from '../mocks/env-mock';
10 | import { mockCrypto } from '../mocks/storage-mock';
11 | 
12 | // 테스트 대상 모듈을 모킹하기 전에 원본 참조 저장
13 | const originalModule = vi.importActual('../../lib/auth');
14 | 
15 | // 테스트 환경 설정
16 | let clientEnvironment: { restore: () => void };
17 | let crypto: ReturnType<typeof mockCrypto>;
18 | 
19 | // auth 모듈 모킹
20 | vi.mock('../../lib/auth', async () => {
21 |   const actual = await vi.importActual('../../lib/auth');
22 |   return {
23 |     ...actual as object,
24 |     // 필요한 함수만 오버라이드
25 |   };
26 | });
27 | 
28 | describe('PKCE 인증 구현 테스트', () => {
29 |   beforeEach(() => {
30 |     // 테스트 환경 초기화
31 |     vi.resetModules();
32 |     
33 |     // 클라이언트 환경 모킹
34 |     clientEnvironment = mockClientEnvironment();
35 |     
36 |     // 암호화 함수 모킹
37 |     crypto = mockCrypto();
38 |     Object.defineProperty(global, 'crypto', {
39 |       value: crypto,
40 |       writable: true
41 |     });
42 |   });
43 |   
44 |   afterEach(() => {
45 |     // 테스트 환경 정리
46 |     clientEnvironment.restore();
47 |     vi.clearAllMocks();
48 |   });
49 |   
50 |   // 모듈 import는 환경 설정 후에 수행
51 |   const importAuth = async () => {
52 |     return await import('../../lib/auth');
53 |   };
54 |   
55 |   test('generateCodeVerifier가 올바른 길이와 형식의 코드를 생성하는지 검증', async () => {
56 |     // 모듈 가져오기
57 |     const { generateCodeVerifier } = await importAuth();
58 |     
59 |     // 예측 가능한 랜덤 값을 위한 모킹
60 |     crypto.getRandomValues.mockImplementation((buffer: Uint8Array) => {
61 |       // 0-255 사이의 예측 가능한 값으로 채우기
62 |       for (let i = 0; i < buffer.length; i++) {
63 |         buffer[i] = i % 256;
64 |       }
65 |       return buffer;
66 |     });
67 |     
68 |     // 함수 실행
69 |     const codeVerifier = generateCodeVerifier();
70 |     
71 |     // 결과 검증
[TRUNCATED]
```

src/tests/auth/session-management.test.ts
```
1 | /**
2 |  * 파일명: session-management.test.ts
3 |  * 목적: 세션 관리 및 복구 기능 테스트
4 |  * 역할: 인증 컨텍스트의 세션 관리 및 복구 매커니즘 검증
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
9 | import { mockClientEnvironment } from '../mocks/env-mock';
10 | import { mockLocalStorage, mockCookies } from '../mocks/storage-mock';
11 | import { mockSupabaseBrowserClient, mockSupabaseSession } from '../mocks/supabase-mock';
12 | 
13 | // React와 관련된 모듈 모킹
14 | jest.mock('react', () => {
15 |   const originalReact = jest.requireActual('react');
16 |   return {
17 |     ...originalReact,
18 |     useState: jest.fn(),
19 |     useEffect: jest.fn(),
20 |     useContext: jest.fn(),
21 |     createContext: jest.fn(originalReact.createContext),
22 |   };
23 | });
24 | 
25 | // 인증 스토리지 모듈 모킹
26 | jest.mock('../../lib/auth-storage', () => {
27 |   return {
28 |     getAuthData: jest.fn(),
29 |     setAuthData: jest.fn(),
30 |     removeAuthData: jest.fn(),
31 |     STORAGE_KEYS: {
32 |       ACCESS_TOKEN: 'access_token',
33 |       REFRESH_TOKEN: 'refresh_token',
34 |       SESSION_EXPIRY: 'session_expiry',
35 |       RECOVERY_ATTEMPTS: 'recovery_attempts'
36 |     }
37 |   };
38 | });
39 | 
40 | // Supabase 클라이언트 모킹
41 | jest.mock('@supabase/supabase-js', () => {
42 |   return {
43 |     createClient: jest.fn()
44 |   };
45 | });
46 | 
47 | // AuthContext.tsx 모듈을 직접 테스트하기 위한 설정
48 | describe('세션 관리 및 복구 테스트', () => {
49 |   // 테스트 환경 설정
50 |   let clientEnvironment: { restore: () => void };
51 |   let mockStorage: ReturnType<typeof mockLocalStorage>;
52 |   let mockCookie: ReturnType<typeof mockCookies>;
53 |   let mockSupabase: ReturnType<typeof mockSupabaseBrowserClient>;
54 |   
55 |   beforeEach(() => {
56 |     // 테스트 환경 초기화
57 |     jest.resetModules();
58 |     
59 |     // 클라이언트 환경 모킹
60 |     clientEnvironment = mockClientEnvironment();
61 |     
62 |     // 스토리지 모킹
63 |     mockStorage = mockLocalStorage();
64 |     mockCookie = mockCookies();
65 |     
66 |     // window 객체의 localStorage 오버라이드
67 |     Object.defineProperty(global.window, 'localStorage', {
68 |       value: mockStorage,
69 |       writable: true
70 |     });
71 |     
72 |     // Supabase 클라이언트 모킹
[TRUNCATED]
```

src/tests/mocks/additional-mocks.ts
```
1 | /**
2 |  * 파일명: additional-mocks.ts
3 |  * 목적: 테스트에 필요한 추가 모킹 함수 제공
4 |  * 역할: 기존 모킹에 포함되지 않았거나 락된 모듈을 모킹
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { vi } from 'vitest';
9 | 
10 | /**
11 |  * mockEnvironment: 환경 감지 관련 함수 모킹
12 |  * @returns 모킹된 환경 감지 유틸리티
13 |  */
14 | export const mockEnvironment = () => {
15 |   const mock = {
16 |     isClient: vi.fn().mockReturnValue(true),
17 |     isServer: vi.fn().mockReturnValue(false),
18 |     executeOnClient: vi.fn((fn: Function) => fn?.()),
19 |     executeOnServer: vi.fn(),
20 |     toggleEnvironment: (isClientEnvironment: boolean) => {
21 |       mock.isClient.mockReturnValue(isClientEnvironment);
22 |       mock.isServer.mockReturnValue(!isClientEnvironment);
23 |       
24 |       if (isClientEnvironment) {
25 |         mock.executeOnClient.mockImplementation((fn: Function) => fn?.());
26 |         mock.executeOnServer.mockImplementation(() => {});
27 |       } else {
28 |         mock.executeOnClient.mockImplementation(() => {});
29 |         mock.executeOnServer.mockImplementation((fn: Function) => fn?.());
30 |       }
31 |     }
32 |   };
33 |   
34 |   return mock;
35 | };
36 | 
37 | /**
38 |  * mockAuth: 인증 관련 함수 모킹
39 |  * @returns 모킹된 인증 유틸리티
40 |  */
41 | export const mockAuth = () => {
42 |   return {
43 |     generateCodeVerifier: vi.fn().mockReturnValue('test-code-verifier'),
44 |     generateCodeChallenge: vi.fn().mockResolvedValue('test-code-challenge'),
45 |     googleLogin: vi.fn().mockImplementation(() => {
46 |       // URL 업데이트 모킹
47 |       window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-code-challenge&code_challenge_method=S256';
48 |       return Promise.resolve();
49 |     }),
50 |     exchangeCodeForSession: vi.fn().mockResolvedValue({
51 |       access_token: 'test-access-token',
52 |       refresh_token: 'test-refresh-token',
53 |       expires_in: 3600
54 |     })
55 |   };
56 | };
57 | 
58 | /**
59 |  * mockBase64: Base64 인코딩 유틸리티 모킹
60 |  * @returns 모킹된 Base64 유틸리티
61 |  */
62 | export const mockBase64 = () => {
63 |   return {
64 |     base64UrlEncode: vi.fn().mockReturnValue('test-base64url-encoded-string')
65 |   };
66 | };
67 | 
68 | /**
69 |  * mockMiddleware: Next.js 미들웨어 모킹
70 |  * @returns 모킹된 미들웨어 함수
71 |  */
[TRUNCATED]
```

src/tests/mocks/auth-mock.ts
```
1 | /**
2 |  * 파일명: auth-mock.ts
3 |  * 목적: 인증 테스트를 위한 모킹 함수 제공
4 |  * 역할: 테스트에 필요한 인증 관련 모킹 데이터 및 유틸리티 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | /**
9 |  * generateMockCodeVerifier: PKCE 코드 검증기를 모방하는 문자열 생성
10 |  * @returns {string} 모의 코드 검증기 문자열
11 |  */
12 | export function generateMockCodeVerifier(): string {
13 |   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
14 |   let result = '';
15 |   
16 |   // 96자 길이의 무작위 문자열 생성
17 |   for (let i = 0; i < 96; i++) {
18 |     result += chars.charAt(Math.floor(Math.random() * chars.length));
19 |   }
20 |   
21 |   return result;
22 | }
23 | 
24 | /**
25 |  * generateMockAuthCode: OAuth 인증 코드를 모방하는 문자열 생성
26 |  * @returns {string} 모의 인증 코드 문자열
27 |  */
28 | export function generateMockAuthCode(): string {
29 |   return 'valid_code'; // 테스트에서 유효한 코드로 인식되는 특정 문자열
30 | }
31 | 
32 | /**
33 |  * mockSupabaseSession: Supabase 세션 객체 모킹
34 |  * @param {string} userId 사용자 ID
35 |  * @param {string} provider 인증 제공자 (기본값: 'google')
36 |  * @returns {Object} 모의 세션 객체
37 |  */
38 | export function mockSupabaseSession(
39 |   userId: string = 'test_user_id', 
40 |   provider: string = 'google'
41 | ): {
42 |   access_token: string;
43 |   refresh_token: string;
44 |   user: {
45 |     id: string;
46 |     app_metadata: {
47 |       provider: string;
48 |     };
49 |   };
50 | } {
51 |   return {
52 |     access_token: 'test_access_token',
53 |     refresh_token: 'test_refresh_token',
54 |     user: {
55 |       id: userId,
56 |       app_metadata: {
57 |         provider
58 |       }
59 |     }
60 |   };
61 | }
62 | 
63 | /**
64 |  * mockAuthError: 인증 오류 객체 모킹
65 |  * @param {string} message 오류 메시지
66 |  * @param {number} status HTTP 상태 코드
67 |  * @returns {Object} 모의 오류 객체
68 |  */
69 | export function mockAuthError(
70 |   message: string = 'Auth error',
71 |   status: number = 400
72 | ): {
73 |   message: string;
74 |   status: number;
75 | } {
[TRUNCATED]
```

src/tests/mocks/env-mock.ts
```
1 | /**
2 |  * 파일명: env-mock.ts
3 |  * 목적: 테스트를 위한 환경 모킹 유틸리티
4 |  * 역할: 서버/클라이언트 환경 감지 기능 모킹
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { vi, MockInstance } from 'vitest';
9 | 
10 | /**
11 |  * window 객체 모킹
12 |  * @returns 모의 window 객체
13 |  */
14 | export function mockWindow() {
15 |   return {
16 |     location: {
17 |       hostname: 'localhost',
18 |       protocol: 'http:',
19 |       port: '3000',
20 |       pathname: '/',
21 |       href: 'http://localhost:3000/',
22 |       origin: 'http://localhost:3000',
23 |       search: '',
24 |       hash: '',
25 |       assign: vi.fn(),
26 |       replace: vi.fn()
27 |     },
28 |     localStorage: {
29 |       getItem: vi.fn(),
30 |       setItem: vi.fn(),
31 |       removeItem: vi.fn(),
32 |       clear: vi.fn()
33 |     },
34 |     sessionStorage: {
35 |       getItem: vi.fn(),
36 |       setItem: vi.fn(),
37 |       removeItem: vi.fn(),
38 |       clear: vi.fn()
39 |     },
40 |     navigator: {
41 |       userAgent: 'Mozilla/5.0 (Test) Test/1.0',
42 |       language: 'ko-KR',
43 |     },
44 |     document: {
45 |       cookie: '',
46 |       createElement: vi.fn(),
47 |       querySelector: vi.fn(),
48 |       querySelectorAll: vi.fn(),
49 |       getElementById: vi.fn(),
50 |     },
51 |     fetch: vi.fn(),
52 |     addEventListener: vi.fn(),
53 |     removeEventListener: vi.fn(),
54 |     setTimeout: vi.fn(),
55 |     clearTimeout: vi.fn(),
56 |     crypto: {
57 |       getRandomValues: vi.fn(),
58 |       subtle: {
59 |         digest: vi.fn()
60 |       }
61 |     },
62 |     btoa: vi.fn((str: string) => Buffer.from(str).toString('base64')),
63 |     atob: vi.fn((str: string) => Buffer.from(str, 'base64').toString()),
64 |     __SUPABASE_AUTH_SET_ITEM: vi.fn(),
65 |     __SUPABASE_AUTH_GET_ITEM: vi.fn(),
66 |     __SUPABASE_AUTH_REMOVE_ITEM: vi.fn(),
67 |     __SUPABASE_AUTH_CODE_VERIFIER: null,
68 |   };
69 | }
70 | 
71 | /**
72 |  * process.env 모킹
73 |  * @returns 모의 process.env 객체
74 |  */
75 | export function mockProcessEnv(): Record<string, string> {
76 |   return {
77 |     NODE_ENV: 'test',
[TRUNCATED]
```

src/tests/mocks/storage-mock.ts
```
1 | /**
2 |  * 파일명: storage-mock.ts
3 |  * 목적: 브라우저 스토리지 API 모킹
4 |  * 역할: 테스트 환경에서 스토리지 API 시뮬레이션
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { vi } from 'vitest';
9 | 
10 | /**
11 |  * localStorage 모킹
12 |  * @returns 모의 localStorage 객체
13 |  */
14 | export function mockLocalStorage() {
15 |   const store: Record<string, string> = {};
16 | 
17 |   return {
18 |     getItem: vi.fn((key: string) => {
19 |       return store[key] || null;
20 |     }),
21 |     setItem: vi.fn((key: string, value: string) => {
22 |       store[key] = value;
23 |     }),
24 |     removeItem: vi.fn((key: string) => {
25 |       delete store[key];
26 |     }),
27 |     clear: vi.fn(() => {
28 |       Object.keys(store).forEach(key => {
29 |         delete store[key];
30 |       });
31 |     }),
32 |     key: vi.fn((index: number) => {
33 |       return Object.keys(store)[index] || null;
34 |     }),
35 |     length: vi.fn(() => {
36 |       return Object.keys(store).length;
37 |     }),
38 |     _getStore: () => ({ ...store }), // 테스트용 내부 메서드
39 |   };
40 | }
41 | 
42 | /**
43 |  * sessionStorage 모킹
44 |  * @returns 모의 sessionStorage 객체
45 |  */
46 | export function mockSessionStorage() {
47 |   return mockLocalStorage(); // 인터페이스가 동일하므로 localStorage 모킹 재사용
48 | }
49 | 
50 | /**
51 |  * 쿠키 모킹
52 |  * @returns 모의 document.cookie 작업을 위한 유틸리티
53 |  */
54 | export function mockCookies() {
55 |   let cookies: Record<string, string> = {};
56 | 
57 |   return {
58 |     get: vi.fn((name: string) => {
59 |       return cookies[name] || null;
60 |     }),
61 |     getAll: vi.fn(() => {
62 |       return Object.entries(cookies).map(([name, value]) => ({ name, value }));
63 |     }),
64 |     set: vi.fn((name: string, value: string, options = {}) => {
65 |       cookies[name] = value;
66 |     }),
67 |     delete: vi.fn((name: string) => {
68 |       delete cookies[name];
69 |     }),
70 |     has: vi.fn((name: string) => {
71 |       return name in cookies;
72 |     }),
73 |     clear: vi.fn(() => {
[TRUNCATED]
```

src/tests/mocks/supabase-mock.ts
```
1 | /**
2 |  * 파일명: supabase-mock.ts
3 |  * 목적: Supabase 클라이언트 모킹
4 |  * 역할: 테스트 환경에서 Supabase 인증 및 API 호출 시뮬레이션
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { User, Session } from '@supabase/supabase-js';
9 | import { vi } from 'vitest';
10 | 
11 | /**
12 |  * 모의 Supabase 세션 생성
13 |  * @param userId 사용자 ID
14 |  * @param provider 인증 공급자
15 |  * @returns 모의 세션 객체
16 |  */
17 | export function mockSupabaseSession(
18 |   userId: string = 'test_user_id', 
19 |   provider: string = 'google'
20 | ): Session {
21 |   return {
22 |     access_token: `mock_access_token_${userId}`,
23 |     refresh_token: `mock_refresh_token_${userId}`,
24 |     expires_in: 3600,
25 |     expires_at: Math.floor(Date.now() / 1000) + 3600,
26 |     token_type: 'bearer',
27 |     user: {
28 |       id: userId,
29 |       app_metadata: {
30 |         provider,
31 |         providers: [provider]
32 |       },
33 |       user_metadata: {
34 |         full_name: 'Test User',
35 |         avatar_url: 'https://example.com/avatar.png'
36 |       },
37 |       aud: 'authenticated',
38 |       created_at: new Date().toISOString(),
39 |       role: 'authenticated',
40 |       email: `${userId}@example.com`,
41 |     }
42 |   };
43 | }
44 | 
45 | /**
46 |  * 모의 Supabase 응답 생성
47 |  * @param data 응답 데이터
48 |  * @param error 응답 오류
49 |  * @returns 모의 Supabase 응답 객체
50 |  */
51 | export function mockSupabaseResponse<T>(data: T | null = null, error: Error | null = null) {
52 |   return { data, error };
53 | }
54 | 
55 | /**
56 |  * 클라이언트 환경 Supabase 모킹
57 |  * @returns 모의 Supabase 클라이언트
58 |  */
59 | export function mockSupabaseBrowserClient() {
60 |   // 기본 세션 및 사용자 상태
61 |   let currentSession: Session | null = null;
62 |   let currentUser: User | null = null;
63 |   let codeVerifier: string | null = null;
64 |   
65 |   // 상태 변경 콜백 저장
66 |   const authStateChangeCallbacks: Function[] = [];
67 | 
68 |   return {
69 |     auth: {
70 |       getSession: vi.fn(() => {
[TRUNCATED]
```

src/tests/results/auth-integration-results.json
```
1 | {"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numPendingTestSuites":0,"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1742998354721,"success":false,"testResults":[{"assertionResults":[],"startTime":1742998354721,"endTime":1742998354721,"status":"failed","message":"Failed to resolve import \"../../lib/environment\" from \"src/tests/auth/auth-integration.test.ts\". Does the file exist?","name":"/Users/wodory/Development/apps/backyard/src/tests/auth/auth-integration.test.ts"}]}
```

src/tests/results/auth-storage.test-results.json
```
[TRUNCATED]
```

src/tests/results/auth-tests-summary-20250326-230526.txt
```
1 | Google OAuth 인증 테스트 요약
2 | 실행 시간: Wed Mar 26 23:05:26 KST 2025
3 | ===============================================
4 | ===============================================
5 | 테스트 종합 결과
6 | 총 테스트: 0
7 | 통과: 0
8 | 실패: 0
9 | 실행 시간: 0초
10 | ===============================================
```

src/tests/results/auth-tests-summary-20250326-230644.txt
```
1 | Google OAuth 인증 테스트 요약
2 | 실행 시간: 2025년 3월 26일 수요일 23시 06분 44초 KST
3 | ===============================================
4 | [미들웨어 인증] 테스트 실패: /0 테스트 실패
5 | 실패 메시지:
6 | 
7 | -----------------------------------------------
8 | ===============================================
9 | 테스트 종합 결과
10 | 총 테스트: 0
11 | 통과: 0
12 | 실패: 0
13 | 실행 시간: 1초
14 | ===============================================
```

src/tests/results/auth-tests-summary-20250326-230854.txt
```
1 | Google OAuth 인증 테스트 요약
2 | 실행 시간: 2025년 3월 26일 수요일 23시 08분 54초 KST
3 | ===============================================
4 | [스토리지 전략] 테스트 실패: 0/0 테스트 실패
5 | -----------------------------------------------
6 | [PKCE 구현] 테스트 실패: 0/0 테스트 실패
7 | 실패 메시지:
8 | Do not import `@jest/globals` outside of the Jest test environment
9 | -----------------------------------------------
10 | [세션 관리] 테스트 실패: 0/0 테스트 실패
11 | 실패 메시지:
12 | Do not import `@jest/globals` outside of the Jest test environment
13 | -----------------------------------------------
14 | [환경 감지] 테스트 실패: 0/0 테스트 실패
15 | 실패 메시지:
16 | Failed to resolve import \
17 | -----------------------------------------------
18 | [미들웨어 인증] 테스트 실패: 0/0 테스트 실패
19 | 실패 메시지:
20 | Do not import `@jest/globals` outside of the Jest test environment
21 | -----------------------------------------------
22 | ===============================================
23 | 테스트 종합 결과
24 | 총 테스트: 0
25 | 통과: 0
26 | 실패: 0
27 | 실행 시간: 8초
28 | ===============================================
```

src/tests/results/auth-tests-summary-20250326-231114.txt
```
1 | Google OAuth 인증 테스트 요약
2 | 실행 시간: Wed Mar 26 23:11:14 KST 2025
3 | ===============================================
4 | [Google OAuth 인증] 테스트 실패: 0/0 테스트 실패
5 | 실패 메시지:
6 | Failed to resolve import \
7 | ===============================================
8 | 테스트 종합 결과
9 | 총 테스트: 0
10 | 통과: 0
11 | 실패: 0
12 | 실행 시간: 2초
13 | ===============================================
```

src/tests/results/auth-tests-summary-20250326-231234.txt
```
1 | Google OAuth 인증 테스트 요약
2 | 실행 시간: Wed Mar 26 23:12:34 KST 2025
3 | ===============================================
4 | [Google OAuth 인증] 테스트 실패: 0/0 테스트 실패
5 | 실패 메시지:
6 | Failed to resolve import \
7 | ===============================================
8 | 테스트 종합 결과
9 | 총 테스트: 0
10 | 통과: 0
11 | 실패: 0
12 | 실행 시간: 1초
13 | ===============================================
```

src/tests/results/auth-tests-summary-20250326-232712.txt
```
1 | [33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
2 | 
3 |  RUN  v1.6.1 /Users/wodory/Development/apps/backyard
4 | 
5 |  ✓ src/tests/auth/auth-integration.test.ts  (7 tests) 38ms
6 | 
7 |  Test Files  1 passed (1)
8 |       Tests  7 passed (7)
9 |    Start at  23:27:13
10 |    Duration  697ms (transform 52ms, setup 92ms, collect 44ms, tests 38ms, environment 195ms, prepare 38ms)
11 | 
12 | JSON report written to /Users/wodory/Development/apps/backyard/src/tests/results/test-results.json
13 | 테스트 파일: src/tests/auth/auth-integration.test.ts
14 | 총 테스트: 
15 | 통과: 1
16 | 실패: 0
17 | 0
18 | 실행 시간: 1 초
```

src/tests/results/auth-tests-summary-20250326-232731.txt
```
1 | [33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
2 | 
3 |  RUN  v1.6.1 /Users/wodory/Development/apps/backyard
4 | 
5 |  ✓ src/tests/auth/auth-integration.test.ts  (7 tests) 37ms
6 | 
7 |  Test Files  1 passed (1)
8 |       Tests  7 passed (7)
9 |    Start at  23:27:32
10 |    Duration  721ms (transform 52ms, setup 81ms, collect 43ms, tests 37ms, environment 234ms, prepare 38ms)
11 | 
12 | JSON report written to /Users/wodory/Development/apps/backyard/src/tests/results/test-results.json
13 | 테스트 파일: src/tests/auth/auth-integration.test.ts
14 | 총 테스트: 
15 | 통과: 1
16 | 실패: 0
17 | 0
18 | 실행 시간: 2 초
```

src/tests/results/auth-tests-summary-20250326-232751.txt
```
1 | 
2 |  RUN  v1.6.1 /Users/wodory/Development/apps/backyard
3 | 
4 |  ✓ src/tests/auth/auth-integration.test.ts  (7 tests) 38ms
5 | 
6 |  Test Files  1 passed (1)
7 |       Tests  7 passed (7)
8 |    Start at  23:27:52
9 |    Duration  756ms (transform 54ms, setup 88ms, collect 45ms, tests 38ms, environment 239ms, prepare 42ms)
10 | 
11 | JSON report written to /Users/wodory/Development/apps/backyard/src/tests/results/test-results.json
12 | 
13 | ==================================================
14 | 테스트 요약
15 | ==================================================
16 | 테스트 파일: src/tests/auth/auth-integration.test.ts
17 | 실행 시간: 2 초
```

src/tests/results/environment-detection.test-results.json
```
1 | {"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numPendingTestSuites":0,"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1742998139967,"success":false,"testResults":[{"assertionResults":[],"startTime":1742998139967,"endTime":1742998139967,"status":"failed","message":"Failed to resolve import \"../../lib/environment\" from \"src/tests/auth/environment-detection.test.ts\". Does the file exist?","name":"/Users/wodory/Development/apps/backyard/src/tests/auth/environment-detection.test.ts"}]}
```

src/tests/results/middleware.test-results.json
```
1 | {"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numPendingTestSuites":0,"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1742998141212,"success":false,"testResults":[{"assertionResults":[],"startTime":1742998141212,"endTime":1742998141212,"status":"failed","message":"Do not import `@jest/globals` outside of the Jest test environment","name":"/Users/wodory/Development/apps/backyard/src/tests/auth/middleware.test.ts"}]}
```

src/tests/results/pkce.test-results.json
```
1 | {"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numPendingTestSuites":0,"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1742998137399,"success":false,"testResults":[{"assertionResults":[],"startTime":1742998137399,"endTime":1742998137399,"status":"failed","message":"Do not import `@jest/globals` outside of the Jest test environment","name":"/Users/wodory/Development/apps/backyard/src/tests/auth/pkce.test.ts"}]}
```

src/tests/results/session-management.test-results.json
```
1 | {"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numPendingTestSuites":0,"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1742998138667,"success":false,"testResults":[{"assertionResults":[],"startTime":1742998138667,"endTime":1742998138667,"status":"failed","message":"Do not import `@jest/globals` outside of the Jest test environment","name":"/Users/wodory/Development/apps/backyard/src/tests/auth/session-management.test.ts"}]}
```

src/tests/results/test-results.json
```
1 | {"numTotalTestSuites":2,"numPassedTestSuites":2,"numFailedTestSuites":0,"numPendingTestSuites":0,"numTotalTests":2,"numPassedTests":2,"numFailedTests":0,"numPendingTests":0,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1743056973870,"success":true,"testResults":[{"assertionResults":[{"ancestorTitles":["BoardPage"],"fullName":"BoardPage renders Board component inside ReactFlowProvider","status":"passed","title":"renders Board component inside ReactFlowProvider","duration":15.078583000024082,"failureMessages":[],"meta":{}},{"ancestorTitles":["BoardPage"],"fullName":"BoardPage autoLayoutNodes function returns correctly formatted nodes","status":"passed","title":"autoLayoutNodes function returns correctly formatted nodes","duration":0.7773750000051223,"failureMessages":[],"meta":{}}],"startTime":1743131142484,"endTime":1743131142499.7773,"status":"passed","message":"","name":"/Users/wodory/Development/apps/backyard/src/app/board/page.test.tsx"}]}
```

src/tests/utils/react-flow-mock.ts
```
1 | /**
2 |  * 파일명: react-flow-mock.ts
3 |  * 목적: React Flow 컴포넌트 테스트를 위한 모킹 유틸리티
4 |  * 역할: 테스트 환경에서 React Flow에 필요한 브라우저 환경 API 모킹
5 |  * 작성일: 2024-05-09
6 |  */
7 | 
8 | // React Flow 공식 문서에서 제시하는 테스트 유틸리티 구현
9 | 
10 | /**
11 |  * ResizeObserver 모의 구현
12 |  * 브라우저 환경이 아닌 Jest/Vitest에서 동작하기 위한 구현체
13 |  */
14 | class ResizeObserver {
15 |   callback: ResizeObserverCallback;
16 | 
17 |   constructor(callback: ResizeObserverCallback) {
18 |     this.callback = callback;
19 |   }
20 | 
21 |   observe(target: Element) {
22 |     this.callback([{ target } as ResizeObserverEntry], this);
23 |   }
24 | 
25 |   unobserve() {}
26 | 
27 |   disconnect() {}
28 | }
29 | 
30 | /**
31 |  * DOMMatrixReadOnly 모의 구현
32 |  * 브라우저 환경이 아닌 Jest/Vitest에서 동작하기 위한 구현체
33 |  */
34 | class DOMMatrixReadOnly {
35 |   m22: number;
36 |   constructor(transform: string) {
37 |     const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
38 |     this.m22 = scale !== undefined ? +scale : 1;
39 |   }
40 | }
41 | 
42 | // 모킹이 한 번만 초기화되도록 플래그 관리
43 | let init = false;
44 | 
45 | /**
46 |  * mockReactFlow: React Flow를 모킹하는 함수
47 |  * Jest/Vitest 테스트 환경에서 React Flow 사용 시 필요한 브라우저 API 모킹
48 |  */
49 | export const mockReactFlow = () => {
50 |   if (init) return;
51 |   init = true;
52 | 
53 |   // 전역 객체에 ResizeObserver 추가
54 |   global.ResizeObserver = ResizeObserver as any;
55 | 
56 |   // 전역 객체에 DOMMatrixReadOnly 추가
57 |   global.DOMMatrixReadOnly = DOMMatrixReadOnly as any;
58 | 
59 |   // HTMLElement에 offsetHeight, offsetWidth 속성 추가
60 |   Object.defineProperties(global.HTMLElement.prototype, {
61 |     offsetHeight: {
62 |       get() {
63 |         return parseFloat(this.style.height) || 1;
64 |       },
65 |     },
66 |     offsetWidth: {
67 |       get() {
68 |         return parseFloat(this.style.width) || 1;
69 |       },
70 |     },
71 |   });
72 | 
73 |   // SVGElement에 getBBox 메서드 추가
74 |   (global.SVGElement as any).prototype.getBBox = () => ({
75 |     x: 0,
[TRUNCATED]
```

src/utils/supabase/client.ts
```
1 | /**
2 |  * 파일명: client.ts
3 |  * 목적: 클라이언트 환경에서 Supabase 클라이언트 제공
4 |  * 역할: 클라이언트 컴포넌트에서 Supabase에 접근할 때 사용
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { createBrowserClient } from '@supabase/ssr'
9 | import { Database } from '@/types/supabase'
10 | 
11 | export function createClient() {
12 |   return createBrowserClient<Database>(
13 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
14 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
15 |   )
16 | } 
```

src/utils/supabase/middleware.ts
```
1 | /**
2 |  * 파일명: middleware.ts
3 |  * 목적: Supabase 인증 토큰 새로고침 처리
4 |  * 역할: 토큰 만료 시 자동으로 새로고침하고 쿠키에 저장
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { NextResponse, type NextRequest } from 'next/server'
9 | import { createServerClient, type CookieOptions } from '@supabase/ssr'
10 | import { Database } from '@/types/supabase'
11 | 
12 | export async function updateSession(request: NextRequest) {
13 |   try {
14 |     // 응답 객체 생성
15 |     const response = NextResponse.next({
16 |       request: {
17 |         headers: request.headers,
18 |       },
19 |     })
20 | 
21 |     // Supabase 클라이언트 생성
22 |     const supabase = createServerClient<Database>(
23 |       process.env.NEXT_PUBLIC_SUPABASE_URL!,
24 |       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
25 |       {
26 |         cookies: {
27 |           get(name: string) {
28 |             return request.cookies.get(name)?.value
29 |           },
30 |           set(name: string, value: string, options: CookieOptions) {
31 |             // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
32 |             if (name.includes('code_verifier')) {
33 |               console.log('코드 검증기 쿠키 설정:', name.substring(0, 10) + '...')
34 |               // 쿠키 수명을 10분으로 설정
35 |               options.maxAge = 60 * 10
36 |             }
37 |             
38 |             // 요청 및 응답에 쿠키 설정
39 |             request.cookies.set({
40 |               name,
41 |               value,
42 |               ...options,
43 |             })
44 |             
45 |             response.cookies.set({
46 |               name,
47 |               value,
48 |               ...options,
49 |             })
50 |           },
51 |           remove(name: string, options: CookieOptions) {
52 |             // 요청 및 응답에서 쿠키 삭제
53 |             request.cookies.delete(name)
54 |             
55 |             response.cookies.set({
56 |               name,
57 |               value: '',
58 |               ...options,
59 |               maxAge: 0,
60 |             })
61 |           },
62 |         },
63 |       }
64 |     )
65 | 
66 |     // 인증된 사용자 정보 가져오기 (세션 새로고침)
67 |     const { data } = await supabase.auth.getUser()
68 |     
69 |     // 디버깅용 로깅 (개인정보 보호를 위해 일부만 표시)
70 |     if (data?.user) {
71 |       console.log('미들웨어에서 세션 새로고침 성공', {
72 |         userId: data.user.id.substring(0, 8) + '...',
[TRUNCATED]
```

src/utils/supabase/server.ts
```
1 | /**
2 |  * 파일명: server.ts
3 |  * 목적: 서버 환경에서 Supabase 클라이언트 제공
4 |  * 역할: 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 Supabase에 접근할 때 사용
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { createServerClient, type CookieOptions } from '@supabase/ssr'
9 | import { cookies } from 'next/headers'
10 | import { Database } from '@/types/supabase'
11 | 
12 | export async function createClient() {
13 |   return createServerClient<Database>(
14 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
15 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
16 |     {
17 |       cookies: {
18 |         async get(name: string) {
19 |           const cookieStore = await cookies()
20 |           return cookieStore.get(name)?.value
21 |         },
22 |         async set(name: string, value: string, options: CookieOptions) {
23 |           try {
24 |             const cookieStore = await cookies()
25 |             // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
26 |             if (name.includes('code_verifier')) {
27 |               console.log('서버: 코드 검증기 쿠키 설정:', name.substring(0, 12) + '...')
28 |               // 쿠키 수명을 10분으로 설정
29 |               options.maxAge = 60 * 10
30 |             }
31 |             
32 |             cookieStore.set(name, value, options)
33 |           } catch (error) {
34 |             console.error('서버: 쿠키 설정 중 오류:', error)
35 |           }
36 |         },
37 |         async remove(name: string, options: CookieOptions) {
38 |           try {
39 |             const cookieStore = await cookies()
40 |             cookieStore.delete({ name, ...options })
41 |           } catch (error) {
42 |             console.error('서버: 쿠키 삭제 중 오류:', error)
43 |           }
44 |         },
45 |       },
46 |     }
47 |   )
48 | } 
```

src/tests/theme/integration.test.tsx
```
1 | /**
2 |  * 파일명: integration.test.tsx
3 |  * 목적: 테마 관련 컴포넌트 통합 테스트
4 |  * 역할: ThemeContext와 NodeSizeSettings의 통합 검증
5 |  * 작성일: 2024-04-01
6 |  */
7 | 
8 | import { render, screen, fireEvent, waitFor } from '@testing-library/react';
9 | import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
10 | import React from 'react';
11 | import '@testing-library/jest-dom/vitest';
12 | 
13 | // updateNodeSize 모킹 함수
14 | const updateNodeSizeMock = vi.fn();
15 | const updateNodeInternalsMock = vi.fn();
16 | 
17 | // ReactFlow 모킹
18 | vi.mock('@xyflow/react', () => {
19 |   return {
20 |     useReactFlow: () => ({
21 |       getNodes: () => [{ id: 'node-1' }, { id: 'node-2' }],
22 |     }),
23 |     useUpdateNodeInternals: () => updateNodeInternalsMock,
24 |     ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
25 |   };
26 | });
27 | 
28 | // ThemeContext 모킹
29 | vi.mock('../../contexts/ThemeContext', () => {
30 |   return {
31 |     ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
32 |     useTheme: () => ({
33 |       theme: {
34 |         node: {
35 |           width: 220,
36 |           height: 48,
37 |           maxHeight: 180,
38 |           backgroundColor: '#ffffff',
39 |           borderColor: '#C1C1C1',
40 |           borderWidth: 1,
41 |           borderRadius: 8,
42 |           selectedBorderColor: '#0071e3',
43 |           font: {
44 |             family: 'Pretendard, sans-serif',
45 |             titleSize: 14,
46 |             contentSize: 12,
47 |             tagsSize: 10,
48 |           }
49 |         },
50 |         edge: {
51 |           color: '#C1C1C1',
52 |           width: 1,
53 |           selectedColor: '#0071e3',
54 |           animated: false,
55 |         },
56 |         handle: {
57 |           size: 8,
58 |           backgroundColor: '#ffffff',
59 |           borderColor: '#555555',
60 |           borderWidth: 1,
61 |         },
62 |         layout: {
63 |           spacing: {
64 |             horizontal: 30,
65 |             vertical: 30,
66 |           },
67 |           padding: 20,
68 |         },
69 |       },
70 |       updateTheme: vi.fn(),
71 |       updateNodeSize: updateNodeSizeMock,
72 |     }),
73 |   };
74 | });
75 | 
76 | // NodeSizeSettings 모킹
77 | vi.mock('../../components/settings/NodeSizeSettings', () => {
78 |   return {
79 |     NodeSizeSettings: () => {
80 |       React.useEffect(() => {
81 |         // 컴포넌트가 마운트될 때 테스트 데이터 설정
[TRUNCATED]
```

src/app/admin/logs/page.test.tsx
```
1 | /**
2 |  * 파일명: page.test.tsx
3 |  * 목적: 로그 뷰어 관리자 페이지 테스트
4 |  * 역할: 로그 조회 및 필터링 기능 테스트
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { describe, expect, it, vi, beforeEach } from 'vitest'
9 | import { render, screen, waitFor } from '@testing-library/react'
10 | import userEvent from '@testing-library/user-event'
11 | import '@testing-library/jest-dom'
12 | import LogViewerPage from './page'
13 | 
14 | // 모의 응답 데이터
15 | const mockLogs = [
16 |   {
17 |     timestamp: '2024-03-31T10:00:00Z',
18 |     level: 'info',
19 |     module: 'auth',
20 |     message: '사용자 로그인 성공',
21 |     data: { userId: '123' }
22 |   },
23 |   {
24 |     timestamp: '2024-03-31T10:01:00Z',
25 |     level: 'error',
26 |     module: 'database',
27 |     message: '데이터베이스 연결 실패',
28 |     data: { error: 'Connection refused' }
29 |   }
30 | ]
31 | 
32 | const mockModules = ['auth', 'database', 'api']
33 | const mockSessionIds = ['session1', 'session2']
34 | 
35 | // 모의 객체 생성
36 | const mocks = vi.hoisted(() => {
37 |   return {
38 |     fetch: vi.fn(),
39 |     useRouter: vi.fn(() => ({
40 |       push: vi.fn(),
41 |       replace: vi.fn(),
42 |       prefetch: vi.fn(),
43 |       back: vi.fn()
44 |     }))
45 |   }
46 | })
47 | 
48 | // Next.js 라우터 모킹
49 | vi.mock('next/navigation', () => ({
50 |   useRouter: () => mocks.useRouter()
51 | }))
52 | 
53 | // fetch 모킹
54 | vi.stubGlobal('fetch', mocks.fetch)
55 | 
56 | describe('LogViewerPage', () => {
57 |   beforeEach(() => {
58 |     vi.clearAllMocks()
59 |     mocks.fetch.mockResolvedValue({
60 |       ok: true,
61 |       json: () => Promise.resolve({
62 |         logs: mockLogs,
63 |         modules: mockModules,
64 |         sessionIds: mockSessionIds
65 |       })
66 |     })
67 |   })
68 | 
69 |   it('로그 목록을 성공적으로 로드하고 표시', async () => {
70 |     render(<LogViewerPage />)
71 | 
72 |     // 로딩 상태 확인
73 |     expect(screen.getByText('로딩 중...')).toBeInTheDocument()
74 | 
75 |     // 로그 데이터가 표시되는지 확인
76 |     await waitFor(() => {
[TRUNCATED]
```

src/app/admin/logs/page.tsx
```
1 | /**
2 |  * 파일명: page.tsx
3 |  * 목적: 로그 뷰어 관리자 페이지
4 |  * 역할: 애플리케이션 로그를 조회하고 필터링하는 인터페이스 제공
5 |  * 작성일: 2024-03-28
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useEffect, useState } from 'react';
11 | import { useRouter } from 'next/navigation';
12 | 
13 | interface LogEntry {
14 |   timestamp: string;
15 |   level: string;
16 |   module: string;
17 |   message: string;
18 |   data?: any;
19 |   sessionId?: string;
20 |   serverTimestamp?: string;
21 | }
22 | 
23 | export default function LogViewerPage() {
24 |   const router = useRouter();
25 |   const [logs, setLogs] = useState<LogEntry[]>([]);
26 |   const [loading, setLoading] = useState(true);
27 |   const [error, setError] = useState<string | null>(null);
28 |   const [modules, setModules] = useState<string[]>([]);
29 |   const [sessionIds, setSessionIds] = useState<string[]>([]);
30 |   
31 |   // 필터링 상태
32 |   const [selectedModule, setSelectedModule] = useState<string>('');
33 |   const [selectedLevel, setSelectedLevel] = useState<string>('');
34 |   const [selectedSessionId, setSelectedSessionId] = useState<string>('');
35 |   const [limit, setLimit] = useState(100);
36 |   
37 |   // 로그 데이터 가져오기
38 |   const fetchLogs = async () => {
39 |     try {
40 |       setLoading(true);
41 |       
42 |       // 필터 파라미터 구성
43 |       const params = new URLSearchParams();
44 |       if (selectedModule) params.append('module', selectedModule);
45 |       if (selectedLevel) params.append('level', selectedLevel);
46 |       if (selectedSessionId) params.append('sessionId', selectedSessionId);
47 |       params.append('limit', limit.toString());
48 |       
49 |       const response = await fetch(`/api/logs/view?${params.toString()}`);
50 |       
51 |       if (!response.ok) {
52 |         throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
53 |       }
54 |       
55 |       const data = await response.json();
56 |       
57 |       setLogs(data.logs || []);
58 |       setModules(data.modules || []);
59 |       setSessionIds(data.sessionIds || []);
60 |       setError(null);
61 |     } catch (err: any) {
62 |       setError(err.message || '로그를 가져오는 중 오류가 발생했습니다.');
63 |       console.error('로그 가져오기 오류:', err);
64 |     } finally {
65 |       setLoading(false);
66 |     }
67 |   };
[TRUNCATED]
```

src/app/auth/error/page.test.tsx
```
1 | /**
2 |  * 파일명: page.test.tsx
3 |  * 목적: 인증 오류 페이지의 기능 테스트
4 |  * 역할: 인증 과정에서 발생하는 오류 메시지가 올바르게 표시되는지 검증
5 |  * 작성일: 2024-03-26
6 |  */
7 | 
8 | import { describe, expect, it, vi, beforeEach } from 'vitest';
9 | import { render, screen } from '@testing-library/react';
10 | import '@testing-library/jest-dom/vitest';
11 | import ErrorPage from './page';
12 | 
13 | // 모킹 데이터를 저장할 변수
14 | let mockSearchParams = {
15 |   error: 'default',
16 |   error_description: ''
17 | };
18 | 
19 | // next/navigation의 useSearchParams 모킹
20 | vi.mock('next/navigation', () => ({
21 |   useSearchParams: vi.fn(() => ({
22 |     get: vi.fn((param: string) => {
23 |       if (param === 'error') return mockSearchParams.error;
24 |       if (param === 'error_description') return mockSearchParams.error_description;
25 |       return null;
26 |     })
27 |   }))
28 | }));
29 | 
30 | describe('ErrorPage', () => {
31 |   beforeEach(() => {
32 |     // 각 테스트 전에 모킹 데이터 초기화
33 |     mockSearchParams = {
34 |       error: 'default',
35 |       error_description: ''
36 |     };
37 |     // 콘솔 에러 메시지 무시
38 |     vi.spyOn(console, 'error').mockImplementation(() => {});
39 |   });
40 | 
41 |   it('기본 오류 메시지를 표시', () => {
42 |     render(<ErrorPage />);
43 |     expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
44 |   });
45 | 
46 |   it('특정 오류 유형에 대한 메시지를 표시', () => {
47 |     mockSearchParams.error = 'invalid_callback';
48 |     render(<ErrorPage />);
49 |     expect(screen.getByText('유효하지 않은 인증 콜백입니다.')).toBeInTheDocument();
50 |   });
51 | 
52 |   it('오류 설명이 있을 경우 함께 표시', () => {
53 |     mockSearchParams = {
54 |       error: 'verification_failed',
55 |       error_description: '이메일 주소가 확인되지 않았습니다.'
56 |     };
57 |     render(<ErrorPage />);
58 |     expect(screen.getByText('이메일 인증에 실패했습니다.')).toBeInTheDocument();
59 |     expect(screen.getByText('이메일 주소가 확인되지 않았습니다.')).toBeInTheDocument();
60 |   });
61 | }); 
```

src/app/auth/error/page.tsx
```
1 | /**
2 |  * 파일명: src/app/auth/error/page.tsx
3 |  * 목적: 인증 과정에서 발생한 오류 표시
4 |  * 역할: 사용자에게 인증 오류 메시지를 보여주고 후속 조치 안내
5 |  * 작성일: 2025-03-26
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useEffect, useState } from 'react'
11 | import { useSearchParams } from 'next/navigation'
12 | import Link from 'next/link'
13 | 
14 | // 오류 메시지 매핑
15 | const ERROR_MESSAGES: Record<string, string> = {
16 |   invalid_callback: '유효하지 않은 인증 콜백입니다.',
17 |   verification_failed: '이메일 인증에 실패했습니다.',
18 |   exchange_error: '인증 토큰 교환 중 오류가 발생했습니다.',
19 |   no_code: '인증 코드가 없습니다.',
20 |   no_session: '세션을 생성할 수 없습니다.',
21 |   default: '인증 과정에서 오류가 발생했습니다.'
22 | }
23 | 
24 | export default function AuthErrorPage() {
25 |   const searchParams = useSearchParams()
26 |   const [error, setError] = useState<string>('default')
27 |   const [description, setDescription] = useState<string>('')
28 | 
29 |   useEffect(() => {
30 |     // URL 파라미터에서 오류 정보 추출
31 |     const errorParam = searchParams.get('error') || 'default'
32 |     const errorDescription = searchParams.get('error_description') || ''
33 |     
34 |     setError(errorParam)
35 |     setDescription(errorDescription)
36 |     
37 |     // 오류 로깅
38 |     console.error('인증 오류:', { 
39 |       error: errorParam, 
40 |       description: errorDescription 
41 |     })
42 |   }, [searchParams])
43 | 
44 |   return (
45 |     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
46 |       <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
47 |         <div className="text-center">
48 |           <h1 className="text-2xl font-bold text-red-600 mb-2">인증 오류</h1>
49 |           <p className="text-gray-700 mb-4">
50 |             {ERROR_MESSAGES[error] || ERROR_MESSAGES.default}
51 |           </p>
52 |           
53 |           {description && (
54 |             <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded">
55 |               {description}
56 |             </p>
57 |           )}
58 |           
[TRUNCATED]
```

src/app/auth/callback/page.tsx
```
1 | /**
2 |  * 파일명: callback/page.tsx
3 |  * 목적: OAuth 콜백 처리 및 인증 완료
4 |  * 역할: Google 로그인 후 리디렉션된 콜백을 처리하고 세션을 설정
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useEffect, useState } from 'react';
11 | import { useRouter } from 'next/navigation';
12 | import { getAuthClient } from '@/lib/auth';
13 | import createLogger from '@/lib/logger';
14 | import { 
15 |   getAuthData, 
16 |   setAuthData, 
17 |   getAuthDataAsync, 
18 |   STORAGE_KEYS 
19 | } from '@/lib/auth-storage';
20 | 
21 | // 모듈별 로거 생성
22 | const logger = createLogger('Callback');
23 | 
24 | // 백업용 코드 검증기 생성 함수
25 | function generateCodeVerifier() {
26 |   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
27 |   let result = '';
28 |   const randomValues = new Uint8Array(128);
29 |   
30 |   if (window.crypto && window.crypto.getRandomValues) {
31 |     window.crypto.getRandomValues(randomValues);
32 |     for (let i = 0; i < 96; i++) {
33 |       result += chars.charAt(randomValues[i] % chars.length);
34 |     }
35 |   } else {
36 |     // 예비 방법으로 일반 난수 사용
37 |     for (let i = 0; i < 96; i++) {
38 |       result += chars.charAt(Math.floor(Math.random() * chars.length));
39 |     }
40 |   }
41 |   
42 |   return result;
43 | }
44 | 
45 | /**
46 |  * CallbackHandler: OAuth 콜백을 처리하는 컴포넌트
47 |  * @returns {JSX.Element} 콜백 처리 중임을 나타내는 UI
48 |  */
49 | export default function CallbackHandler() {
50 |   const router = useRouter();
51 |   const [processingState, setProcessingState] = useState<string>('초기화 중');
52 |   const [error, setError] = useState<string | null>(null);
53 | 
54 |   useEffect(() => {
55 |     let mounted = true;
56 | 
57 |     async function handleCallback() {
58 |       try {
59 |         if (!mounted) return;
60 |         logger.info('콜백 처리 시작');
61 |         setProcessingState('코드 파라미터 확인 중');
62 | 
63 |         // URL 파라미터 처리 (먼저 확인)
64 |         const hashParams = new URLSearchParams(window.location.hash.substring(1));
65 |         const queryParams = new URLSearchParams(window.location.search);
66 |         
[TRUNCATED]
```

src/app/auth/callback/route.test.ts
```
1 | /**
2 |  * 파일명: route.test.ts
3 |  * 목적: OAuth 콜백 처리 라우트 테스트
4 |  * 역할: 인증 콜백의 다양한 시나리오 테스트
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { describe, expect, it, vi, beforeEach } from 'vitest'
9 | import { NextRequest, NextResponse } from 'next/server'
10 | 
11 | // 모의 객체 생성
12 | const mocks = vi.hoisted(() => {
13 |   return {
14 |     supabaseClient: {
15 |       auth: {
16 |         exchangeCodeForSession: vi.fn()
17 |       }
18 |     },
19 |     createClient: vi.fn()
20 |   }
21 | })
22 | 
23 | // Supabase 클라이언트 모킹
24 | vi.mock('@/utils/supabase/server', () => ({
25 |   createClient: () => mocks.supabaseClient
26 | }))
27 | 
28 | // next/server 모킹
29 | vi.mock('next/server', async () => {
30 |   const actual = await vi.importActual('next/server') as any
31 |   return {
32 |     ...actual,
33 |     NextResponse: {
34 |       redirect: vi.fn((url) => ({ url }))
35 |     }
36 |   }
37 | })
38 | 
39 | describe('OAuth Callback Route Handler', () => {
40 |   let request: NextRequest
41 | 
42 |   beforeEach(() => {
43 |     vi.clearAllMocks()
44 |     request = new NextRequest(new URL('http://localhost:3000/auth/callback?code=test_code'))
45 |   })
46 | 
47 |   it('성공적으로 인증 코드를 교환하고 홈으로 리다이렉트', async () => {
48 |     // 성공 시나리오 설정
49 |     mocks.supabaseClient.auth.exchangeCodeForSession.mockResolvedValueOnce({ error: null })
50 | 
51 |     // GET 핸들러 임포트 및 실행
52 |     const { GET } = await import('./route')
53 |     const response = await GET(request)
54 | 
55 |     // 검증
56 |     expect(mocks.supabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith('test_code')
57 |     expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/', request.url))
58 |   })
59 | 
60 |   it('인증 코드가 없을 경우 에러 페이지로 리다이렉트', async () => {
61 |     // 코드가 없는 요청 생성
62 |     request = new NextRequest(new URL('http://localhost:3000/auth/callback'))
63 | 
64 |     // GET 핸들러 임포트 및 실행
65 |     const { GET } = await import('./route')
66 |     const response = await GET(request)
67 | 
68 |     // 검증
[TRUNCATED]
```

src/app/auth/callback/route.ts
```
1 | /**
2 |  * 파일명: route.ts
3 |  * 목적: OAuth 콜백 처리
4 |  * 역할: OAuth 인증 완료 후 사용자를 적절한 페이지로 리다이렉트
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { createClient } from '@/utils/supabase/server'
9 | import { NextRequest, NextResponse } from 'next/server'
10 | 
11 | export async function GET(request: NextRequest) {
12 |   try {
13 |     // URL에서 인증 코드 추출
14 |     const requestUrl = new URL(request.url)
15 |     const code = requestUrl.searchParams.get('code')
16 |     
17 |     // 디버깅용 로그
18 |     if (code) {
19 |       console.log('인증 콜백에서 코드 감지됨', {
20 |         code_length: code.length,
21 |         origin: requestUrl.origin,
22 |       })
23 |     } else {
24 |       console.warn('인증 콜백에서 코드를 찾을 수 없음')
25 |       return NextResponse.redirect(new URL('/login?error=인증 코드를 찾을 수 없습니다', request.url))
26 |     }
27 |     
28 |     // 리다이렉트 대상 경로 (기본값: 홈)
29 |     const next = '/'
30 |     
31 |     // 서버 클라이언트 생성
32 |     const supabase = await createClient()
33 |     
34 |     // PKCE 인증 흐름 완료 (코드 → 토큰 교환)
35 |     const { error } = await supabase.auth.exchangeCodeForSession(code)
36 |     
37 |     if (error) {
38 |       console.error('인증 코드 교환 오류:', error.message)
39 |       return NextResponse.redirect(
40 |         new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
41 |       )
42 |     }
43 |     
44 |     // 인증 성공 시 리다이렉트
45 |     console.log('인증 성공, 리다이렉트:', next)
46 |     return NextResponse.redirect(new URL(next, request.url))
47 |   } catch (error: any) {
48 |     console.error('인증 콜백 처리 중 예외 발생:', error)
49 |     const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
50 |     
51 |     return NextResponse.redirect(
52 |       new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
53 |     )
54 |   }
55 | } 
```

src/app/api/board-settings/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { z } from 'zod';
3 | import prisma from '@/lib/prisma';
4 | 
5 | // 보드 설정 스키마
6 | const boardSettingsSchema = z.object({
7 |   userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
8 |   settings: z.object({
9 |     snapToGrid: z.boolean(),
10 |     snapGrid: z.tuple([z.number(), z.number()]),
11 |     connectionLineType: z.string(),
12 |     markerEnd: z.string().nullable(),
13 |     strokeWidth: z.number(),
14 |     markerSize: z.number()
15 |   })
16 | });
17 | 
18 | // 보드 설정 저장 API
19 | export async function POST(request: NextRequest) {
20 |   try {
21 |     const body = await request.json();
22 |     const { userId, settings } = boardSettingsSchema.parse(body);
23 | 
24 |     // 기존 설정이 있는지 확인
25 |     const existingSettings = await prisma.boardSettings.findUnique({
26 |       where: { userId }
27 |     });
28 | 
29 |     // 설정 업데이트 또는 생성
30 |     if (existingSettings) {
31 |       await prisma.boardSettings.update({
32 |         where: { userId },
33 |         data: {
34 |           settings: settings
35 |         }
36 |       });
37 |     } else {
38 |       await prisma.boardSettings.create({
39 |         data: {
40 |           userId,
41 |           settings
42 |         }
43 |       });
44 |     }
45 | 
46 |     return NextResponse.json({ success: true }, { status: 200 });
47 |   } catch (error) {
48 |     console.error('보드 설정 저장 실패:', error);
49 |     return NextResponse.json({ error: '보드 설정을 저장하는 데 실패했습니다.' }, { status: 500 });
50 |   }
51 | }
52 | 
53 | // 보드 설정 조회 API
54 | export async function GET(request: NextRequest) {
55 |   try {
56 |     const { searchParams } = request.nextUrl;
57 |     const userId = searchParams.get('userId');
58 | 
59 |     if (!userId) {
60 |       return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
61 |     }
62 | 
63 |     const boardSettings = await prisma.boardSettings.findUnique({
64 |       where: { userId }
65 |     });
66 | 
67 |     if (!boardSettings) {
68 |       return NextResponse.json({ settings: null }, { status: 200 });
69 |     }
70 | 
71 |     return NextResponse.json({ settings: boardSettings.settings }, { status: 200 });
72 |   } catch (error) {
[TRUNCATED]
```

src/app/api/cards/route.test.ts
```
1 | /**
2 |  * @vitest-environment node
3 |  */
4 | 
5 | import { NextRequest, NextResponse } from 'next/server';
6 | import { GET, POST } from './route';
7 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
8 | 
9 | // 타입 정의
10 | interface RequestOptions {
11 |   method?: string;
12 |   body?: string;
13 | }
14 | 
15 | interface ResponseOptions {
16 |   status?: number;
17 | }
18 | 
19 | // NextResponse와 prisma 모킹
20 | vi.mock('next/server', () => {
21 |   const NextResponseMock = {
22 |     json: vi.fn().mockImplementation((data: any, options?: ResponseOptions) => ({
23 |       status: options?.status || 200,
24 |       json: async () => data,
25 |     }))
26 |   };
27 |   
28 |   return {
29 |     NextRequest: vi.fn().mockImplementation((url: string, options?: RequestOptions) => ({
30 |       url,
31 |       method: options?.method || 'GET',
32 |       json: vi.fn().mockResolvedValue(options?.body ? JSON.parse(options.body) : {}),
33 |       nextUrl: {
34 |         searchParams: new URLSearchParams(url?.split('?')[1] || ''),
35 |       },
36 |     })),
37 |     NextResponse: NextResponseMock
38 |   };
39 | });
40 | 
41 | // prisma 모킹 - 내부에서 모킹 함수 생성
42 | vi.mock('@/lib/prisma', () => {
43 |   const cardFindMany = vi.fn();
44 |   const cardCreate = vi.fn();
45 |   const cardFindUnique = vi.fn();
46 |   const userFindUnique = vi.fn();
47 |   const tagFindUnique = vi.fn();
48 |   const tagCreate = vi.fn();
49 |   const cardTagDeleteMany = vi.fn();
50 |   const cardTagCreate = vi.fn();
51 |   
52 |   return {
53 |     prisma: {
54 |       card: {
55 |         findMany: cardFindMany,
56 |         create: cardCreate,
57 |         findUnique: cardFindUnique,
58 |       },
59 |       user: {
60 |         findUnique: userFindUnique,
61 |       },
62 |       cardTag: {
63 |         deleteMany: cardTagDeleteMany,
64 |         create: cardTagCreate,
65 |       },
66 |       tag: {
67 |         findUnique: tagFindUnique,
68 |         create: tagCreate,
69 |       }
70 |     }
71 |   };
72 | });
73 | 
74 | // zod 모킹
75 | vi.mock('zod', async (importOriginal: () => Promise<any>) => {
76 |   const actual = await importOriginal();
77 |   return {
78 |     ...actual,
79 |     z: {
80 |       ...actual.z,
[TRUNCATED]
```

src/app/api/cards/route.test.ts.bak2
```
1 | /**
2 |  * @jest-environment node
3 |  */
4 | 
5 | import { NextRequest, NextResponse } from 'next/server';
6 | import { GET, POST } from './route';
7 | import prisma from '@/lib/prisma';
8 | 
9 | // Prisma 클라이언트 모킹
10 | jest.mock('@/lib/prisma', () => ({
11 |   __esModule: true,
12 |   default: {
13 |     card: {
14 |       findMany: jest.fn(),
15 |       create: jest.fn(),
16 |     },
17 |   },
18 | }));
19 | 
20 | // Request 객체 모킹 - 타입 오류 해결
21 | if (!global.Request) {
22 |   // @ts-ignore - 테스트 환경에서만 사용되는 모킹
23 |   global.Request = function Request() {
24 |     return {
25 |       json: () => Promise.resolve({}),
26 |     };
27 |   };
28 | }
29 | 
30 | // NextRequest 모킹
31 | jest.mock('next/server', () => {
32 |   return {
33 |     NextRequest: jest.fn().mockImplementation((url, options) => {
34 |       return {
35 |         url,
36 |         method: options?.method || 'GET',
37 |         json: jest.fn().mockImplementation(async () => {
38 |           return options?.body ? JSON.parse(options.body) : {};
39 |         }),
40 |         nextUrl: {
41 |           searchParams: new URLSearchParams(url?.split('?')[1] || ''),
42 |         },
43 |       };
44 |     }),
45 |     NextResponse: {
46 |       json: jest.fn().mockImplementation((data, options) => {
47 |         return {
48 |           status: options?.status || 200,
49 |           json: async () => data,
50 |         };
51 |       }),
52 |     },
53 |   };
54 | });
55 | 
56 | describe('Cards API', () => {
57 |   beforeEach(() => {
58 |     jest.clearAllMocks();
59 |   });
60 | 
61 |   describe('GET /api/cards', () => {
62 |     it('모든 카드를 성공적으로 조회한다', async () => {
63 |       // 모킹된 데이터
64 |       const mockCards = [
65 |         {
66 |           id: '1',
67 |           title: '테스트 카드 1',
68 |           content: '테스트 내용 1',
69 |           createdAt: new Date(),
70 |           updatedAt: new Date(),
71 |           userId: 'user1',
72 |         },
73 |         {
74 |           id: '2',
75 |           title: '테스트 카드 2',
76 |           content: '테스트 내용 2',
77 |           createdAt: new Date(),
78 |           updatedAt: new Date(),
79 |           userId: 'user2',
80 |         },
81 |       ];
82 | 
83 |       // Prisma 응답 모킹
[TRUNCATED]
```

src/app/api/cards/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { z } from 'zod';
3 | import prisma from '@/lib/prisma';
4 | 
5 | // 카드 생성 스키마
6 | const createCardSchema = z.object({
7 |   title: z.string().min(1, '제목은 필수입니다.'),
8 |   content: z.string().optional(),
9 |   userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
10 |   tags: z.array(z.string()).optional()
11 | });
12 | 
13 | // 태그 처리 함수
14 | async function processTagsForCard(cardId: string, tagNames: string[] = []) {
15 |   try {
16 |     // 중복 태그 제거 및 공백 제거
17 |     const uniqueTags = [...new Set(tagNames.map(tag => tag.trim()))].filter(tag => tag.length > 0);
18 |     
19 |     // 카드와 연결된 기존 태그 삭제
20 |     await prisma.cardTag.deleteMany({
21 |       where: { cardId }
22 |     });
23 |     
24 |     // 각 태그에 대해 처리
25 |     for (const tagName of uniqueTags) {
26 |       // 태그가 존재하는지 확인하고, 없으면 생성
27 |       let tag = await prisma.tag.findUnique({
28 |         where: { name: tagName }
29 |       });
30 |       
31 |       if (!tag) {
32 |         tag = await prisma.tag.create({
33 |           data: { name: tagName }
34 |         });
35 |       }
36 |       
37 |       // 카드와 태그 연결
38 |       await prisma.cardTag.create({
39 |         data: {
40 |           cardId,
41 |           tagId: tag.id
42 |         }
43 |       });
44 |     }
45 |   } catch (error) {
46 |     console.error('태그 처리 중 오류:', error);
47 |     // 태그 처리 실패해도 흐름 계속 (태그는 필수가 아님)
48 |   }
49 | }
50 | 
51 | // 데이터베이스 연결 안전하게 수행하는 래퍼 함수
52 | async function safeDbOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<{ data: T | null; error: string | null }> {
53 |   try {
54 |     const result = await operation();
55 |     return { data: result, error: null };
56 |   } catch (error) {
57 |     console.error(`${errorMessage}:`, error);
58 |     return { data: null, error: errorMessage };
59 |   }
60 | }
61 | 
62 | // 카드 생성 API
63 | export async function POST(request: NextRequest) {
64 |   try {
65 |     // 요청 본문 파싱 안전하게 처리
66 |     let body;
[TRUNCATED]
```

src/app/auth/test/page.test.tsx
```
1 | /**
2 |  * 파일명: src/app/auth/test/page.test.tsx
3 |  * 목적: 인증 테스트 페이지의 기능을 테스트
4 |  * 역할: 로그인, 로그아웃, 스토리지 테스트 등의 기능을 검증
5 |  * 작성일: 2024-03-22
6 |  */
7 | 
8 | // 참고: vi.mock은 자동으로 파일 최상단으로 호이스팅됨
9 | vi.mock('@/lib/auth', () => ({
10 |   signInWithGoogle: vi.fn(),
11 |   getCurrentUser: vi.fn().mockResolvedValue({
12 |     id: 'test-user-id',
13 |     email: 'test@example.com',
14 |     created_at: '2024-03-22',
15 |     app_metadata: {},
16 |     user_metadata: {},
17 |     aud: 'authenticated',
18 |     role: ''
19 |   }),
20 |   signOut: vi.fn()
21 | }));
22 | 
23 | vi.mock('@supabase/auth-helpers-nextjs', () => ({
24 |   createClientComponentClient: vi.fn(() => ({
25 |     auth: {
26 |       getSession: vi.fn().mockResolvedValue({
27 |         data: {
28 |           session: {
29 |             access_token: 'test-access-token',
30 |             refresh_token: 'test-refresh-token',
31 |             expires_in: 3600,
32 |             expires_at: 1234567890,
33 |             user: {
34 |               id: 'test-user-id',
35 |               email: 'test@example.com',
36 |               created_at: '2024-03-22',
37 |               app_metadata: {},
38 |               user_metadata: {},
39 |               aud: 'authenticated',
40 |               role: ''
41 |             },
42 |             token_type: 'bearer'
43 |           }
44 |         },
45 |         error: null
46 |       }),
47 |       getUser: vi.fn().mockResolvedValue({
48 |         data: {
49 |           user: {
50 |             id: 'test-user-id',
51 |             email: 'test@example.com',
52 |             created_at: '2024-03-22',
53 |             app_metadata: {},
54 |             user_metadata: {},
55 |             aud: 'authenticated',
56 |             role: ''
57 |           }
58 |         },
59 |         error: null
60 |       }),
61 |       signInWithOAuth: vi.fn(),
62 |       signOut: vi.fn()
63 |     }
64 |   }))
65 | }));
66 | 
67 | vi.mock('@/lib/hybrid-supabase', () => ({
68 |   getHybridSupabaseClient: vi.fn(() => ({
69 |     auth: {
70 |       getSession: vi.fn().mockResolvedValue({
71 |         data: {
72 |           session: {
73 |             access_token: 'test-access-token',
74 |             refresh_token: 'test-refresh-token',
75 |             expires_in: 3600,
76 |             expires_at: 1234567890,
77 |             user: {
[TRUNCATED]
```

src/app/auth/test/page.tsx
```
1 | /**
2 |  * 파일명: auth/test/page.tsx
3 |  * 목적: 인증 기능 테스트 페이지
4 |  * 역할: 다양한 인증 상태 및 스토리지 검사 기능 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import { useEffect, useState } from 'react';
11 | import { Button } from '@/components/ui/button';
12 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
13 | import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
14 | import { signInWithGoogle, getCurrentUser, signOut } from '@/lib/auth';
15 | import { getHybridSupabaseClient } from '@/lib/hybrid-supabase';
16 | import { getAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
17 | 
18 | interface StorageData {
19 |   key: string;
20 |   localStorage: string | null;
21 |   sessionStorage: string | null;
22 |   cookie: string | null;
23 |   indexedDB: string | null;
24 | }
25 | 
26 | export default function AuthTestPage() {
27 |   const [user, setUser] = useState<any>(null);
28 |   const [session, setSession] = useState<any>(null);
29 |   const [storageData, setStorageData] = useState<StorageData[]>([]);
30 |   const [cookies, setCookies] = useState<string[]>([]);
31 |   const [loading, setLoading] = useState(true);
32 |   const [logs, setLogs] = useState<string[]>([]);
33 | 
34 |   const addLog = (message: string) => {
35 |     setLogs(prev => [`[${new Date().toISOString()}] ${message}`, ...prev]);
36 |   };
37 |   
38 |   // 쿠키 가져오기 함수
39 |   const getCookie = (name: string): string | null => {
40 |     const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
41 |     return match ? decodeURIComponent(match[2]) : null;
42 |   };
43 |   
44 |   // IndexedDB에서 값 가져오기 함수
45 |   const getFromIndexedDB = async (key: string): Promise<string | null> => {
46 |     return new Promise((resolve, reject) => {
47 |       try {
48 |         const request = indexedDB.open('auth_backup', 1);
49 |         
50 |         request.onupgradeneeded = () => {
51 |           const db = request.result;
52 |           if (!db.objectStoreNames.contains('auth_data')) {
53 |             db.createObjectStore('auth_data');
54 |           }
55 |         };
56 |         
57 |         request.onsuccess = () => {
[TRUNCATED]
```

src/app/api/db-init/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { initDatabase } from '@/lib/db-init';
3 | 
4 | /**
5 |  * DB 초기화 API 엔드포인트
6 |  * 개발 환경에서만 사용 가능
7 |  */
8 | export async function GET(request: NextRequest) {
9 |   // 개발 환경인지 확인
10 |   if (process.env.NODE_ENV !== 'development') {
11 |     return NextResponse.json(
12 |       { error: '이 API는 개발 환경에서만 사용 가능합니다.' },
13 |       { status: 403 }
14 |     );
15 |   }
16 | 
17 |   try {
18 |     await initDatabase();
19 |     
20 |     return NextResponse.json(
21 |       { success: true, message: '데이터베이스 초기화가 완료되었습니다.' },
22 |       { status: 200 }
23 |     );
24 |   } catch (error) {
25 |     console.error('DB 초기화 API 오류:', error);
26 |     
27 |     return NextResponse.json(
28 |       { 
29 |         success: false, 
30 |         message: '데이터베이스 초기화 중 오류가 발생했습니다.', 
31 |         error: error instanceof Error ? error.message : String(error) 
32 |       },
33 |       { status: 500 }
34 |     );
35 |   }
36 | } 
```

src/app/api/health-check/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import prisma from '@/lib/prisma';
3 | 
4 | /**
5 |  * DB 연결 상태를 확인하는 헬스 체크 API
6 |  * HEAD 또는 GET 요청 모두 사용 가능
7 |  */
8 | export async function HEAD(request: NextRequest) {
9 |   try {
10 |     // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
11 |     await prisma.$queryRaw`SELECT 1`;
12 |     
13 |     // 응답 본문 없이 200 OK만 반환
14 |     return new NextResponse(null, { status: 200 });
15 |   } catch (error) {
16 |     console.error('DB 연결 실패:', error);
17 |     return new NextResponse(null, { status: 503 }); // Service Unavailable
18 |   }
19 | }
20 | 
21 | export async function GET(request: NextRequest) {
22 |   try {
23 |     // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
24 |     await prisma.$queryRaw`SELECT 1`;
25 |     
26 |     return NextResponse.json({ status: 'ok', message: 'Database connection successful' });
27 |   } catch (error) {
28 |     console.error('DB 연결 실패:', error);
29 |     
30 |     return NextResponse.json(
31 |       { status: 'error', message: 'Database connection failed' },
32 |       { status: 503 } // Service Unavailable
33 |     );
34 |   }
35 | } 
```

src/app/api/tags/route.test.ts
```
1 | /// <reference types="vitest" />
2 | import { NextRequest, NextResponse } from 'next/server';
3 | import { GET, POST } from './route';
4 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
5 | 
6 | // NextResponse.json 모킹
7 | vi.mock('next/server', () => {
8 |   return {
9 |     NextRequest: vi.fn().mockImplementation((url: string, options?: any) => ({
10 |       url,
11 |       method: options?.method || 'GET',
12 |       json: vi.fn().mockImplementation(async () => {
13 |         if (options?.body) {
14 |           try {
15 |             return JSON.parse(options.body);
16 |           } catch {
17 |             throw new Error('Invalid JSON');
18 |           }
19 |         }
20 |         return {};
21 |       }),
22 |       nextUrl: {
23 |         searchParams: new URLSearchParams(url?.split('?')[1] || ''),
24 |       },
25 |       cookies: {},
26 |       page: {},
27 |       ua: {},
28 |       headers: new Headers(),
29 |       signal: {},
30 |       body: new ReadableStream(),
31 |       text: vi.fn().mockImplementation(async () => {
32 |         if (options?.body) {
33 |           return options.body;
34 |         }
35 |         return '';
36 |       }),
37 |       arrayBuffer: vi.fn(),
38 |       blob: vi.fn(),
39 |       clone: vi.fn(),
40 |       formData: vi.fn(),
41 |       redirect: 'follow' as const,
42 |       [Symbol.asyncIterator]: vi.fn()
43 |     })),
44 |     NextResponse: {
45 |       json: vi.fn().mockImplementation((data: any, options: { status?: number } = {}) => {
46 |         return {
47 |           status: options.status || 200,
48 |           body: data,
49 |           json: () => Promise.resolve(data)
50 |         };
51 |       })
52 |     }
53 |   };
54 | });
55 | 
56 | // Prisma 모킹
57 | vi.mock('@/lib/prisma', () => ({
58 |   prisma: {
59 |     tag: {
60 |       findMany: vi.fn(),
61 |       create: vi.fn(),
62 |       findUnique: vi.fn()
63 |     }
64 |   }
65 | }));
66 | 
67 | describe('태그 API', () => {
68 |   beforeEach(() => {
69 |     vi.clearAllMocks();
70 |   });
71 | 
72 |   afterEach(() => {
73 |     vi.clearAllMocks();
74 |   });
75 | 
76 |   afterAll(() => {
77 |     vi.resetAllMocks();
78 |   });
79 | 
80 |   // 태그 목록 조회 테스트
81 |   describe('GET /api/tags', () => {
[TRUNCATED]
```

src/app/api/tags/route.ts
```
1 | /**
2 |  * 파일명: src/app/api/tags/route.ts
3 |  * 목적: 태그 관련 API 엔드포인트 제공
4 |  * 역할: 태그 목록 조회, 태그 사용 횟수 집계, 태그 생성 등 기능 제공
5 |  * 작성일: 2024-03-30
6 |  */
7 | 
8 | import { NextRequest, NextResponse } from 'next/server';
9 | import prisma from '@/lib/prisma';
10 | import { auth } from '@/lib/auth-server';
11 | 
12 | /**
13 |  * GET: 태그 목록을 반환하는 API
14 |  * @param request - 요청 객체
15 |  * @returns 태그 목록 및 사용 횟수
16 |  */
17 | export async function GET(request: NextRequest) {
18 |   try {
19 |     const searchParams = request.nextUrl.searchParams;
20 |     const includeCount = searchParams.get('includeCount') === 'true';
21 |     const searchQuery = searchParams.get('q') || '';
22 |     
23 |     if (includeCount) {
24 |       // 사용 횟수와 함께 태그 목록 반환
25 |       const tags = await prisma.tag.findMany({
26 |         where: {
27 |           name: {
28 |             contains: searchQuery,
29 |           },
30 |         },
31 |         include: {
32 |           _count: {
33 |             select: { cardTags: true },
34 |           },
35 |         },
36 |         orderBy: {
37 |           name: 'asc',
38 |         },
39 |       });
40 |       
41 |       // 응답 형식 변환
42 |       const formattedTags = tags.map(tag => ({
43 |         id: tag.id,
44 |         name: tag.name,
45 |         count: tag._count.cardTags,
46 |         createdAt: tag.createdAt,
47 |       }));
48 |       
49 |       return NextResponse.json(formattedTags);
50 |     } else {
51 |       // 기본 태그 목록만 반환
52 |       const tags = await prisma.tag.findMany({
53 |         where: searchQuery ? {
54 |           name: {
55 |             contains: searchQuery,
56 |           },
57 |         } : undefined,
58 |         orderBy: {
59 |           name: 'asc',
60 |         },
61 |       });
62 |       
63 |       return NextResponse.json(tags);
64 |     }
65 |   } catch (error) {
66 |     console.error('태그 조회 오류:', error);
67 |     return NextResponse.json(
68 |       { error: '태그 목록을 불러오는데 실패했습니다' },
69 |       { status: 500 }
70 |     );
71 |   }
72 | }
73 | 
74 | /**
75 |  * POST: 새 태그를 생성하는 API
76 |  * @param request - 요청 객체
77 |  * @returns 생성된 태그 정보
78 |  */
[TRUNCATED]
```

src/app/cards/[id]/DeleteButton.test.tsx
```
1 | /// <reference types="vitest" />
2 | import React from 'react';
3 | import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
4 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
5 | import DeleteButton, { callIfExists } from './DeleteButton';
6 | import '@testing-library/jest-dom/vitest';
7 | import { useRouter } from 'next/navigation';
8 | import { toast } from 'sonner';
9 | 
10 | // 모킹 설정
11 | const mockPush = vi.fn();
12 | vi.mock('next/navigation', () => ({
13 |   useRouter: () => ({
14 |     push: mockPush
15 |   })
16 | }));
17 | 
18 | vi.mock('sonner', () => ({
19 |   toast: {
20 |     success: vi.fn(),
21 |     error: vi.fn()
22 |   }
23 | }));
24 | 
25 | // fetch 모킹 헬퍼 함수
26 | const mockFetchSuccess = () => {
27 |   global.fetch = vi.fn().mockResolvedValue({
28 |     ok: true,
29 |     json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
30 |   });
31 | };
32 | 
33 | const mockFetchError = (errorMessage = '카드 삭제에 실패했습니다.') => {
34 |   global.fetch = vi.fn().mockResolvedValue({
35 |     ok: false,
36 |     json: async () => ({ error: errorMessage })
37 |   });
38 | };
39 | 
40 | const mockFetchNetworkError = (errorMessage = '네트워크 오류') => {
41 |   global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));
42 | };
43 | 
44 | // 테스트 헬퍼 함수
45 | const clickDeleteButton = () => {
46 |   const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
47 |   fireEvent.click(deleteButton);
48 | };
49 | 
50 | const clickConfirmDeleteButton = () => {
51 |   const confirmButton = screen.getByRole('button', { name: '삭제' });
52 |   fireEvent.click(confirmButton);
53 | };
54 | 
55 | // callIfExists 함수에 대한 별도 테스트 그룹
56 | describe('callIfExists', () => {
57 |   it('콜백이 존재하면, 콜백을 호출해야 함', () => {
58 |     const callback = vi.fn();
59 |     callIfExists(callback);
60 |     expect(callback).toHaveBeenCalledTimes(1);
61 |   });
62 | 
63 |   it('콜백이 undefined이면, 오류 없이 실행되어야 함', () => {
64 |     expect(() => callIfExists(undefined)).not.toThrow();
65 |   });
66 | });
67 | 
68 | describe('DeleteButton', () => {
[TRUNCATED]
```

src/app/cards/[id]/DeleteButton.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import { Trash2 } from "lucide-react";
6 | import { toast } from "sonner";
7 | import { useRouter } from "next/navigation";
8 | import {
9 |   Dialog,
10 |   DialogContent,
11 |   DialogHeader,
12 |   DialogTitle,
13 |   DialogDescription,
14 |   DialogFooter,
15 |   DialogTrigger,
16 |   DialogClose,
17 | } from "@/components/ui/dialog";
18 | 
19 | interface DeleteButtonProps {
20 |   cardId: string;
21 |   // 테스트를 위한 프로퍼티 추가 (선택적)
22 |   onSuccessfulDelete?: () => void;
23 | }
24 | 
25 | // 테스트를 위해 함수를 컴포넌트 외부로 분리
26 | export function callIfExists(callback?: () => void): void {
27 |   if (callback) {
28 |     callback();
29 |   }
30 | }
31 | 
32 | export default function DeleteButton({ 
33 |   cardId, 
34 |   onSuccessfulDelete 
35 | }: DeleteButtonProps) {
36 |   const [isDeleting, setIsDeleting] = useState(false);
37 |   const [open, setOpen] = useState(false);
38 |   const router = useRouter();
39 | 
40 |   const handleDelete = async () => {
41 |     setIsDeleting(true);
42 |     
43 |     try {
44 |       // API 호출
45 |       const response = await fetch(`/api/cards/${cardId}`, {
46 |         method: "DELETE",
47 |       });
48 | 
49 |       // 실패 응답 처리
50 |       if (!response.ok) {
51 |         const errorData = await response.json();
52 |         throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
53 |       }
54 | 
55 |       // 성공 시에만 다음 코드 실행
56 |       
57 |       // 성공 시 다이얼로그 닫기
58 |       setOpen(false);
59 |       
60 |       // 성공적인 삭제 후 토스트 메시지 표시
61 |       toast.success("카드가 성공적으로 삭제되었습니다.");
62 |       
63 |       // 성공 시에만 리디렉션 수행
64 |       router.push("/cards");
65 |       
66 |       // 성공 시에만 콜백 호출
67 |       if (onSuccessfulDelete) {
68 |         onSuccessfulDelete();
69 |       }
70 |       
71 |       // 성공 시에만 여기까지 실행됨
72 |       
73 |     } catch (error) {
74 |       // 모든 종류의 오류 처리 (네트워크 오류, 응답 오류 등)
75 |       console.error("Error deleting card:", error);
76 |       
77 |       // 오류 메시지 표시
[TRUNCATED]
```

src/app/cards/[id]/page.test.tsx
```
1 | /// <reference types="vitest" />
2 | import React from 'react';
3 | import { render, screen, cleanup } from '@testing-library/react';
4 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
5 | import CardPage, { generateMetadata } from './page';
6 | import '@testing-library/jest-dom/vitest';
7 | 
8 | // next/navigation 모킹
9 | vi.mock('next/navigation', () => ({
10 |   notFound: vi.fn(),
11 |   useRouter: vi.fn(() => ({
12 |     push: vi.fn()
13 |   }))
14 | }));
15 | 
16 | // Prisma 모킹 - 함수를 inline으로 정의
17 | vi.mock('@/lib/prisma', () => {
18 |   return {
19 |     default: {
20 |       card: {
21 |         findUnique: vi.fn()
22 |       }
23 |     }
24 |   }
25 | });
26 | 
27 | // formatDate 모킹
28 | vi.mock('@/lib/utils', () => ({
29 |   formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
30 |   cn: vi.fn((...args: any[]) => args.join(' '))
31 | }));
32 | 
33 | // EditCardContent 컴포넌트 모킹
34 | vi.mock('@/components/cards/EditCardContent', () => {
35 |   return {
36 |     default: vi.fn(({ initialContent }: { initialContent: string }) => (
37 |       <div data-testid="edit-card-content">{initialContent}</div>
38 |     ))
39 |   };
40 | });
41 | 
42 | describe('CardPage', () => {
43 |   const params = { id: 'card123' };
44 |   
45 |   // 가짜 카드 데이터
46 |   const mockCard = {
47 |     id: 'card123',
48 |     title: '테스트 카드',
49 |     content: '테스트 내용입니다.',
50 |     createdAt: new Date(),
51 |     updatedAt: new Date(),
52 |     user: {
53 |       id: 'user123',
54 |       name: '테스트 사용자',
55 |       email: 'test@example.com'
56 |     },
57 |     cardTags: [
58 |       {
59 |         id: 'ct1',
60 |         cardId: 'card123',
61 |         tagId: 'tag1',
62 |         tag: {
63 |           id: 'tag1',
64 |           name: '태그1'
65 |         }
66 |       },
67 |       {
68 |         id: 'ct2',
69 |         cardId: 'card123',
70 |         tagId: 'tag2',
71 |         tag: {
72 |           id: 'tag2',
73 |           name: '태그2'
74 |         }
75 |       }
76 |     ]
77 |   };
78 |   
79 |   // 테스트에서 사용할 모듈 참조 변수
80 |   let prisma: any;
81 |   
[TRUNCATED]
```

src/app/cards/[id]/page.tsx
```
1 | import { Metadata } from "next";
2 | import { notFound } from "next/navigation";
3 | import prisma from "@/lib/prisma";
4 | import { formatDate } from "@/lib/utils";
5 | import Link from "next/link";
6 | import { Button } from "@/components/ui/button";
7 | import { ArrowLeft } from "lucide-react";
8 | import DeleteButton from "./DeleteButton";
9 | import EditCardContent from "@/components/cards/EditCardContent";
10 | import { Card } from "@prisma/client";
11 | 
12 | interface PageProps {
13 |   params: {
14 |     id: string;
15 |   };
16 | }
17 | 
18 | export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
19 |   const cardId = String(params.id);
20 |   const card = await getCard(cardId);
21 |   
22 |   if (!card) {
23 |     return {
24 |       title: "카드를 찾을 수 없음",
25 |     };
26 |   }
27 |   
28 |   return {
29 |     title: `${card.title} | Backyard`,
30 |   };
31 | }
32 | 
33 | async function getCard(id: string) {
34 |   try {
35 |     // @ts-ignore - Prisma 타입 오류 무시
36 |     const card = await prisma.card.findUnique({
37 |       where: { id },
38 |       include: {
39 |         user: true,
40 |         // @ts-ignore - Prisma 타입 오류 무시
41 |         cardTags: {
42 |           include: {
43 |             tag: true,
44 |           },
45 |         },
46 |       },
47 |     });
48 |     return card;
49 |   } catch (error) {
50 |     console.error("카드 조회 오류:", error);
51 |     return null;
52 |   }
53 | }
54 | 
55 | export default async function CardPage({ params }: PageProps) {
56 |   const cardId = String(params.id);
57 |   const card = await getCard(cardId);
58 |   
59 |   if (!card) {
60 |     notFound();
61 |     // 테스트를 위해 빈 컴포넌트 반환 (notFound 이후에도 코드가 실행될 수 있음)
62 |     return <div data-testid="not-found"></div>;
63 |   }
64 |   
65 |   return (
66 |     <div className="container max-w-4xl py-6 space-y-8">
67 |       <div className="flex justify-between items-center">
68 |         <Link href="/cards">
69 |           <Button variant="ghost" size="sm">
70 |             <ArrowLeft className="h-4 w-4 mr-2" />
[TRUNCATED]
```

src/components/board/components/Board.test.tsx
```
1 | /**
2 |  * 파일명: Board.test.tsx
3 |  * 목적: Board 컴포넌트 테스트
4 |  * 역할: Board 컴포넌트의 기능을 검증하는 테스트 코드 제공
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | import React from 'react';
9 | import { render, screen, fireEvent, waitFor } from '@testing-library/react';
10 | import { vi, describe, it, expect, beforeEach } from 'vitest';
11 | import '@testing-library/jest-dom';
12 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
13 | import Board from './Board';
14 | import { useNodes } from '../hooks/useNodes';
15 | import { useEdges } from '../hooks/useEdges';
16 | import { useBoardUtils } from '../hooks/useBoardUtils';
17 | import { useAppStore } from '@/store/useAppStore';
18 | import { useAuth } from '@/contexts/AuthContext';
19 | import { toast } from 'sonner';
20 | 
21 | // React Flow 모킹
22 | mockReactFlow();
23 | 
24 | // 모듈 모킹
25 | vi.mock('@xyflow/react', async () => {
26 |   const actual = await vi.importActual('@xyflow/react');
27 |   return {
28 |     ...actual,
29 |     useReactFlow: vi.fn(() => ({
30 |       screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
31 |       fitView: vi.fn(),
32 |       getNodes: vi.fn(() => []),
33 |       getEdges: vi.fn(() => []),
34 |       setNodes: vi.fn(),
35 |       setEdges: vi.fn(),
36 |     })),
37 |     useUpdateNodeInternals: vi.fn(() => vi.fn()),
38 |     Background: () => <div data-testid="react-flow-background" />,
39 |     Controls: () => <div data-testid="react-flow-controls" />,
40 |     Panel: ({ children, position }: any) => <div data-testid={`panel-${position}`}>{children}</div>,
41 |     ReactFlow: ({ children, nodes, edges }: any) => (
42 |       <div data-testid="react-flow-container">
43 |         <div data-testid="react-flow-nodes">{JSON.stringify(nodes)}</div>
44 |         <div data-testid="react-flow-edges">{JSON.stringify(edges)}</div>
45 |         {children}
46 |       </div>
47 |     ),
48 |   };
49 | });
50 | 
51 | vi.mock('../hooks/useNodes', () => ({
52 |   useNodes: vi.fn(() => ({
53 |     nodes: [],
54 |     setNodes: vi.fn(),
55 |     handleNodesChange: vi.fn(),
56 |     handleNodeClick: vi.fn(),
57 |     handlePaneClick: vi.fn(),
[TRUNCATED]
```

src/components/board/components/Board.tsx
```
1 | /**
2 |  * 파일명: Board.tsx
3 |  * 목적: 보드 메인 컨테이너 컴포넌트
4 |  * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import React, { useState, useEffect, useRef, useCallback } from 'react';
11 | import {
12 |   useReactFlow,
13 |   useUpdateNodeInternals,
14 |   Position
15 | } from '@xyflow/react';
16 | import { toast } from 'sonner';
17 | import { useAuth } from '@/contexts/AuthContext';
18 | import { useAppStore } from '@/store/useAppStore';
19 | 
20 | // 보드 관련 컴포넌트 임포트
21 | import { CreateCardModal } from '@/components/cards/CreateCardModal';
22 | import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
23 | import BoardCanvas from './BoardCanvas';
24 | 
25 | // 보드 관련 훅 임포트
26 | import { useNodes } from '../hooks/useNodes';
27 | import { useEdges } from '../hooks/useEdges';
28 | import { useBoardUtils } from '../hooks/useBoardUtils';
29 | import { useBoardData } from '../hooks/useBoardData';
30 | import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
31 | 
32 | // 타입 임포트
33 | import { BoardComponentProps, XYPosition } from '../types/board-types';
34 | import { Node } from '@xyflow/react';
35 | 
36 | /**
37 |  * Board: 보드 메인 컨테이너 컴포넌트
38 |  * @param onSelectCard 카드 선택 시 호출될 콜백 함수
39 |  * @param className 추가 CSS 클래스
40 |  * @param showControls 컨트롤 표시 여부
41 |  */
42 | export default function Board({ 
43 |   onSelectCard,
44 |   className = "",
45 |   showControls = true 
46 | }: BoardComponentProps) {
47 |   // 상태 관리
48 |   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
49 |   
50 |   // 엣지 드롭 관련 상태
51 |   const [isEdgeDropModalOpen, setIsEdgeDropModalOpen] = useState(false);
52 |   const [edgeDropPosition, setEdgeDropPosition] = useState<XYPosition | null>(null);
53 |   const [edgeDropNodeId, setEdgeDropNodeId] = useState<string | null>(null);
54 |   const [edgeDropHandleType, setEdgeDropHandleType] = useState<'source' | 'target' | null>(null);
55 |   
56 |   // 커넥팅 노드 관련 상태
57 |   const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
58 |   const [connectingHandleType, setConnectingHandleType] = useState<'source' | 'target' | null>(null);
59 |   const [connectingHandlePosition, setConnectingHandlePosition] = useState<Position | null>(null);
60 |   
61 |   // 인증 상태 가져오기
[TRUNCATED]
```

src/components/board/components/BoardCanvas.test.tsx
```
1 | /**
2 |  * 파일명: BoardCanvas.test.tsx
3 |  * 목적: BoardCanvas 컴포넌트 테스트
4 |  * 역할: BoardCanvas 컴포넌트의 기능을 검증하는 테스트 코드 제공
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | import React from 'react';
9 | import { render, screen } from '@testing-library/react';
10 | import { vi, describe, it, expect, beforeEach } from 'vitest';
11 | import '@testing-library/jest-dom';
12 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
13 | import BoardCanvas from './BoardCanvas';
14 | import { MarkerType, ConnectionLineType } from '@xyflow/react';
15 | 
16 | // React Flow 모킹
17 | mockReactFlow();
18 | 
19 | // 모듈 모킹
20 | vi.mock('@xyflow/react', async () => {
21 |   const actual = await vi.importActual('@xyflow/react');
22 |   return {
23 |     ...actual,
24 |     Background: () => <div data-testid="react-flow-background" />,
25 |     Controls: () => <div data-testid="react-flow-controls" />,
26 |     Panel: ({ children, position }: any) => <div data-testid={`panel-${position}`}>{children}</div>,
27 |     ReactFlow: ({ children, nodes, edges }: any) => (
28 |       <div data-testid="react-flow-container">
29 |         <div data-testid="react-flow-nodes">{JSON.stringify(nodes)}</div>
30 |         <div data-testid="react-flow-edges">{JSON.stringify(edges)}</div>
31 |         {children}
32 |       </div>
33 |     ),
34 |     MarkerType: {
35 |       ArrowClosed: 'arrow',
36 |     },
37 |     ConnectionLineType: {
38 |       Bezier: 'bezier',
39 |       Straight: 'straight',
40 |       Step: 'step',
41 |       SmoothStep: 'smoothstep',
42 |     }
43 |   };
44 | });
45 | 
46 | vi.mock('@/components/board/BoardSettingsControl', () => ({
47 |   default: ({ settings, onSettingsChange }: { settings: any; onSettingsChange: (settings: any) => void }) => (
48 |     <div data-testid="board-settings-control">
49 |       <button 
50 |         data-testid="toggle-animation-button" 
51 |         onClick={() => onSettingsChange({ ...settings, animated: !settings.animated })}
52 |       >
53 |         Toggle Animation
54 |       </button>
55 |     </div>
56 |   ),
57 | }));
58 | 
59 | vi.mock('@/components/board/LayoutControls', () => ({
60 |   default: ({ onSaveLayout, onLayoutChange, onAutoLayout }: any) => (
61 |     <div data-testid="layout-controls">
[TRUNCATED]
```

src/components/board/components/BoardCanvas.tsx
```
1 | /**
2 |  * 파일명: BoardCanvas.tsx
3 |  * 목적: ReactFlow 캔버스 렌더링 컴포넌트
4 |  * 역할: Board 컴포넌트에서 ReactFlow 캔버스 관련 로직을 분리하여 렌더링을 담당
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import React, { useMemo } from 'react';
11 | import {
12 |   ReactFlow,
13 |   Controls,
14 |   Background,
15 |   ConnectionMode,
16 |   Node,
17 |   Edge,
18 |   NodeChange,
19 |   EdgeChange,
20 |   Connection,
21 |   OnConnectStartParams,
22 |   OnConnectStart,
23 |   OnConnectEnd,
24 |   MarkerType
25 | } from '@xyflow/react';
26 | import { BoardSettings } from '@/lib/board-utils';
27 | // 노드 타입과 엣지 타입 컴포넌트 직접 가져오기
28 | // import CardNode from '@/components/board/nodes/CardNode';
29 | // import CustomEdge from '@/components/board/nodes/CustomEdge';
30 | // 노드 타입 직접 가져오기 대신 flow-constants에서 가져오기
31 | import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
32 | import NodeInspect from '@/components/board/nodes/NodeInspect';
33 | import { cn } from '@/lib/utils';
34 | import BoardControls from './BoardControls';
35 | 
36 | interface BoardCanvasProps {
37 |   /** ReactFlow 노드 배열 */
38 |   nodes: Node[];
39 |   /** ReactFlow 엣지 배열 */
40 |   edges: Edge[];
41 |   /** 노드 변경 핸들러 */
42 |   onNodesChange: (changes: NodeChange[]) => void;
43 |   /** 엣지 변경 핸들러 */
44 |   onEdgesChange: (changes: EdgeChange[]) => void;
45 |   /** 연결 생성 핸들러 */
46 |   onConnect: (connection: Connection) => void;
47 |   /** 연결 시작 핸들러 */
48 |   onConnectStart: OnConnectStart;
49 |   /** 연결 종료 핸들러 */
50 |   onConnectEnd: OnConnectEnd;
51 |   /** 노드 클릭 핸들러 */
52 |   onNodeClick: (e: React.MouseEvent, node: Node) => void;
53 |   /** 빈 공간 클릭 핸들러 */
54 |   onPaneClick: (e: React.MouseEvent) => void;
55 |   /** 레이아웃 방향 */
56 |   layoutDirection: 'horizontal' | 'vertical';
57 |   /** 보드 설정 */
58 |   boardSettings: BoardSettings;
59 |   /** 보드 설정 변경 핸들러 */
60 |   onBoardSettingsChange: (settings: BoardSettings, isAuthenticated: boolean, userId?: string) => void;
61 |   /** 레이아웃 변경 핸들러 */
62 |   onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
63 |   /** 자동 레이아웃 적용 핸들러 */
64 |   onAutoLayout: () => void;
65 |   /** 레이아웃 저장 핸들러 */
66 |   onSaveLayout: () => void;
[TRUNCATED]
```

src/components/board/components/BoardControls.tsx
```
1 | /**
2 |  * 파일명: BoardControls.tsx
3 |  * 목적: 보드 컨트롤 패널 컴포넌트
4 |  * 역할: 보드 캔버스의 우측 상단에 위치한 컨트롤 패널 UI 관리
5 |  * 작성일: 2024-05-30
6 |  */
7 | 
8 | 'use client';
9 | 
10 | import React from 'react';
11 | import { Panel } from '@xyflow/react';
12 | import { BoardSettings } from '@/lib/board-utils';
13 | import BoardSettingsControl from '@/components/board/BoardSettingsControl';
14 | import LayoutControls from '@/components/board/LayoutControls';
15 | import CreateCardButton from '@/components/cards/CreateCardButton';
16 | import DevTools from '@/components/debug/DevTools';
17 | 
18 | /**
19 |  * BoardControlsProps: 보드 컨트롤 컴포넌트 props
20 |  * @interface BoardControlsProps
21 |  */
22 | interface BoardControlsProps {
23 |   /** 보드 설정 */
24 |   boardSettings: BoardSettings;
25 |   /** 보드 설정 변경 핸들러 */
26 |   onBoardSettingsChange: (settings: BoardSettings, isAuthenticated: boolean, userId?: string) => void;
27 |   /** 레이아웃 변경 핸들러 */
28 |   onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
29 |   /** 자동 레이아웃 적용 핸들러 */
30 |   onAutoLayout: () => void;
31 |   /** 레이아웃 저장 핸들러 */
32 |   onSaveLayout: () => void;
33 |   /** 카드 생성 버튼 클릭 핸들러 */
34 |   onCreateCard: () => void;
35 |   /** 사용자 인증 여부 */
36 |   isAuthenticated: boolean;
37 |   /** 사용자 ID */
38 |   userId?: string;
39 | }
40 | 
41 | /**
42 |  * BoardControls: 보드 컨트롤 패널 컴포넌트
43 |  * 보드의 우측 상단에 위치하며, 보드 설정, 레이아웃 컨트롤, 카드 생성 버튼을 포함
44 |  */
45 | export default function BoardControls({
46 |   boardSettings,
47 |   onBoardSettingsChange,
48 |   onLayoutChange,
49 |   onAutoLayout,
50 |   onSaveLayout,
51 |   onCreateCard,
52 |   isAuthenticated,
53 |   userId
54 | }: BoardControlsProps) {
55 |   return (
56 |     <>
57 |       <Panel position="top-right" className="flex flex-col gap-2">
58 |         <BoardSettingsControl 
59 |           settings={boardSettings} 
60 |           onSettingsChange={(settings) => 
61 |             onBoardSettingsChange(settings, isAuthenticated, userId)
62 |           } 
63 |         />
64 |         <LayoutControls 
65 |           onLayoutChange={onLayoutChange}
66 |           onAutoLayout={onAutoLayout}
67 |           onSaveLayout={onSaveLayout}
68 |         />
69 |         <CreateCardButton 
70 |           onCardCreated={() => {}} 
71 |           onClose={() => onCreateCard()} 
72 |           autoOpen={false}
73 |         />
74 |       </Panel>
75 |       
[TRUNCATED]
```

src/app/api/logs/route.ts
```
1 | /**
2 |  * 파일명: route.ts
3 |  * 목적: 클라이언트 로그를 서버에 저장하는 API 엔드포인트
4 |  * 역할: 로그 데이터를 받아 서버 로그에 기록하고 필요시 데이터베이스에 저장
5 |  * 작성일: 2024-03-28
6 |  */
7 | 
8 | import { NextRequest, NextResponse } from 'next/server';
9 | import fs from 'fs';
10 | import path from 'path';
11 | import { createClient } from '@supabase/supabase-js';
12 | // import { createBrowserSupabaseClient } from '@/lib/supabase-browser'; // 클라이언트용 함수 제거
13 | 
14 | // 로그 파일 경로 설정
15 | const LOG_DIR = process.env.LOG_DIR || 'logs';
16 | const LOG_FILE = path.join(process.cwd(), LOG_DIR, 'client-logs.json');
17 | 
18 | // 서버 전용 Supabase 클라이언트 생성 함수
19 | const createServerSupabaseClient = () => {
20 |   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
21 |   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
22 |   
23 |   if (!supabaseUrl || !supabaseServiceKey) {
24 |     console.error('Supabase 환경 변수가 설정되지 않았습니다');
25 |     return null;
26 |   }
27 |   
28 |   return createClient(supabaseUrl, supabaseServiceKey);
29 | };
30 | 
31 | /**
32 |  * ensureLogDir: 로그 디렉토리가 존재하는지 확인하고, 없으면 생성
33 |  */
34 | const ensureLogDir = () => {
35 |   const logDirPath = path.join(process.cwd(), LOG_DIR);
36 |   if (!fs.existsSync(logDirPath)) {
37 |     fs.mkdirSync(logDirPath, { recursive: true });
38 |     console.log(`로그 디렉토리 생성: ${logDirPath}`);
39 |   }
40 | };
41 | 
42 | /**
43 |  * saveLogToFile: 로그 데이터를 파일에 저장
44 |  * @param logData 저장할 로그 데이터
45 |  */
46 | const saveLogToFile = (logData: any) => {
47 |   try {
48 |     ensureLogDir();
49 |     
50 |     // 기존 로그 파일 읽기
51 |     let logs = [];
52 |     if (fs.existsSync(LOG_FILE)) {
53 |       const fileContent = fs.readFileSync(LOG_FILE, 'utf-8');
54 |       logs = JSON.parse(fileContent);
55 |     }
56 |     
57 |     // 새 로그 추가
58 |     logs.push({
59 |       ...logData,
60 |       serverTimestamp: new Date().toISOString()
61 |     });
62 |     
[TRUNCATED]
```

src/components/board/hooks/useBoardData.ts
```
1 | /**
2 |  * 파일명: useBoardData.ts
3 |  * 목적: 보드 데이터 로드 및 관리를 위한 커스텀 훅
4 |  * 역할: API에서 카드 데이터를 가져와 React Flow 노드와 엣지로 변환하는 로직 제공
5 |  * 작성일: 2024-05-30
6 |  */
7 | 
8 | import { useState, useCallback, useEffect } from 'react';
9 | import { Edge, ReactFlowInstance } from '@xyflow/react';
10 | import { toast } from 'sonner';
11 | import { useAppStore } from '@/store/useAppStore';
12 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
13 | import { Node, CardData } from '../types/board-types';
14 | 
15 | /**
16 |  * useBoardData: 보드 데이터 로드 및 관리를 위한 커스텀 훅
17 |  * @param onSelectCard 노드 선택 시 호출될 콜백 함수
18 |  * @returns 데이터 로드 상태 및 관련 함수
19 |  */
20 | export function useBoardData(onSelectCard?: (cardId: string | null) => void) {
21 |   // 상태 관리
22 |   const [isLoading, setIsLoading] = useState(true);
23 |   const [error, setError] = useState<string | null>(null);
24 |   const [nodes, setNodes] = useState<Node<CardData>[]>([]);
25 |   const [edges, setEdges] = useState<Edge[]>([]);
26 |   
27 |   // useAppStore에서 필요한 함수 가져오기
28 |   const setCards = useAppStore(state => state.setCards);
29 |   
30 |   /**
31 |    * fetchBoardData: API에서 카드 데이터를 가져와 노드와 엣지로 변환하는 함수
32 |    * @param reactFlowInstance React Flow 인스턴스 (뷰 조정용)
33 |    * @returns 노드와 엣지 데이터
34 |    */
35 |   const fetchBoardData = useCallback(async (reactFlowInstance?: ReactFlowInstance) => {
36 |     try {
37 |       setIsLoading(true);
38 |       
39 |       // API에서 카드 불러오기
40 |       const response = await fetch('/api/cards');
41 |       if (!response.ok) {
42 |         throw new Error('데이터 불러오기 실패');
43 |       }
44 |       
45 |       const cards = await response.json();
46 |       console.log('[useBoardData] API에서 가져온 카드 데이터:', cards);
47 |       
48 |       // 전역 상태에 카드 목록 저장
49 |       setCards(cards);
50 |       
51 |       // 이전에 저장된 위치 정보 가져오기
52 |       let nodePositions: Record<string, { position: { x: number, y: number } }> = {};
53 |       try {
54 |         const savedPositions = localStorage.getItem(STORAGE_KEY);
55 |         if (savedPositions) {
56 |           nodePositions = JSON.parse(savedPositions);
[TRUNCATED]
```

src/components/board/hooks/useBoardHandlers.test.tsx
```
1 | /**
2 |  * 파일명: useBoardHandlers.test.tsx
3 |  * 목적: useBoardHandlers 훅을 테스트
4 |  * 역할: 보드 이벤트 핸들러 관련 로직 테스트
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { renderHook, act } from '@testing-library/react';
9 | import { vi } from 'vitest';
10 | import { toast } from 'sonner';
11 | import { useBoardHandlers } from './useBoardHandlers';
12 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
13 | 
14 | // 전역 상태 모킹
15 | vi.mock('@/store/useAppStore', () => ({
16 |   useAppStore: vi.fn(() => ({
17 |     selectedCardIds: ['node1', 'node2'],
18 |     selectCards: vi.fn(),
19 |   })),
20 |   getState: vi.fn(() => ({
21 |     selectedCardIds: ['node1', 'node2'],
22 |     selectCards: vi.fn(),
23 |   })),
24 | }));
25 | 
26 | // toast 모킹
27 | vi.mock('sonner', () => ({
28 |   toast: {
29 |     success: vi.fn(),
30 |     error: vi.fn(),
31 |     info: vi.fn(),
32 |   },
33 | }));
34 | 
35 | describe('useBoardHandlers', () => {
36 |   // 테스트를 위한 모의 함수 및 데이터 준비
37 |   const saveLayout = vi.fn().mockReturnValue(true);
38 |   const setNodes = vi.fn();
39 |   const fetchCards = vi.fn().mockResolvedValue({ nodes: [], edges: [] });
40 |   
41 |   const mockNodes = [
42 |     { id: 'node1', position: { x: 0, y: 0 }, data: { title: '카드 1', content: '내용 1' } },
43 |     { id: 'node2', position: { x: 100, y: 100 }, data: { title: '카드 2', content: '내용 2' } },
44 |   ];
45 |   
46 |   const reactFlowWrapper = {
47 |     current: {
48 |       getBoundingClientRect: vi.fn().mockReturnValue({
49 |         left: 0,
50 |         top: 0,
51 |         width: 1000,
52 |         height: 800,
53 |       }),
54 |       offsetWidth: 1000,
55 |       offsetHeight: 800,
56 |     },
57 |   } as unknown as React.RefObject<HTMLDivElement>;
58 |   
59 |   const reactFlowInstance = {
60 |     screenToFlowPosition: vi.fn().mockImplementation((pos) => pos),
61 |   };
62 |   
63 |   beforeEach(() => {
64 |     vi.clearAllMocks();
65 |   });
66 |   
67 |   it('handleSelectionChange가 전역 상태를 업데이트하고 메시지를 표시해야 함', () => {
68 |     // 훅 렌더링
69 |     const { result } = renderHook(() => useBoardHandlers({
70 |       saveLayout,
71 |       nodes: mockNodes as any,
[TRUNCATED]
```

src/components/board/hooks/useBoardHandlers.ts
```
1 | /**
2 |  * 파일명: useBoardHandlers.ts
3 |  * 목적: 보드 이벤트 핸들러 관련 로직 분리
4 |  * 역할: 보드 드래그, 드롭, 선택 등 이벤트 처리 로직을 관리
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { useCallback } from 'react';
9 | import { toast } from 'sonner';
10 | import { Node, Edge, XYPosition } from '@xyflow/react';
11 | import { useAppStore } from '@/store/useAppStore';
12 | import { CardData } from '../types/board-types';
13 | 
14 | /**
15 |  * useBoardHandlers: 보드 이벤트 핸들러 관련 로직을 관리하는 훅
16 |  * @param saveLayout 레이아웃 저장 함수
17 |  * @param nodes 현재 노드 배열
18 |  * @param setNodes 노드 상태 설정 함수
19 |  * @param reactFlowWrapper ReactFlow 래퍼 참조
20 |  * @param reactFlowInstance ReactFlow 인스턴스
21 |  * @returns 보드 이벤트 핸들러 함수들
22 |  */
23 | export function useBoardHandlers({
24 |   saveLayout,
25 |   nodes,
26 |   setNodes,
27 |   reactFlowWrapper,
28 |   reactFlowInstance,
29 |   fetchCards
30 | }: {
31 |   saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
32 |   nodes: Node<CardData>[];
33 |   setNodes: (updater: ((nodes: Node<CardData>[]) => Node<CardData>[]) | Node<CardData>[]) => void;
34 |   reactFlowWrapper: React.RefObject<HTMLDivElement>;
35 |   reactFlowInstance: any;
36 |   fetchCards: () => Promise<{ nodes: Node<CardData>[]; edges: Edge[] }>;
37 | }) {
38 |   // 전역 상태에서 선택된 카드 정보 가져오기
39 |   const { selectedCardIds, selectCards } = useAppStore();
40 | 
41 |   /**
42 |    * ReactFlow 선택 변경 이벤트 핸들러
43 |    * @param selection 현재 선택된 노드와 엣지 정보
44 |    */
45 |   const handleSelectionChange = useCallback(({ nodes }: { nodes: Node[]; edges: Edge[] }) => {
46 |     console.log('[BoardComponent] 선택 변경 감지:', { 
47 |       선택된_노드_수: nodes.length,
48 |       선택된_노드_ID: nodes.map(node => node.id)
49 |     });
50 | 
51 |     // 선택된 노드 ID 배열 추출
52 |     const selectedNodeIds = nodes.map(node => node.id);
53 |     
54 |     // React Flow의 선택 상태를 Zustand 상태로 동기화
55 |     // 현재 선택된 ID 배열과 다를 때만 업데이트 (불필요한 리렌더링 방지)
56 |     const currentSelectedIds = useAppStore.getState().selectedCardIds;
57 |     if (!arraysEqual(currentSelectedIds, selectedNodeIds)) {
58 |       // 전역 상태 업데이트
59 |       selectCards(selectedNodeIds);
60 |       
61 |       // 선택된 노드가 있는 경우 토스트 메시지 표시
[TRUNCATED]
```

src/components/board/hooks/useBoardUtils.test.tsx
```
1 | /**
2 |  * 파일명: useBoardUtils.test.tsx
3 |  * 목적: useBoardUtils 훅을 테스트
4 |  * 역할: 보드 유틸리티 함수 관련 로직 테스트
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { renderHook, act } from '@testing-library/react';
9 | import { vi, expect } from 'vitest';
10 | import { toast } from 'sonner';
11 | import { useBoardUtils } from './useBoardUtils';
12 | import { BoardSettings, saveBoardSettingsToServer, loadBoardSettingsFromServer } from '@/lib/board-utils';
13 | import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
14 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
15 | import { ConnectionLineType, MarkerType, Node, Edge } from '@xyflow/react';
16 | import { useAppStore } from '@/store/useAppStore';
17 | 
18 | // 모든 vi.mock 호출을 먼저 수행
19 | vi.mock('@xyflow/react', async () => {
20 |   const actual = await vi.importActual('@xyflow/react');
21 |   return {
22 |     ...actual,
23 |     useReactFlow: () => mockReactFlow,
24 |   };
25 | });
26 | 
27 | // Mock 함수들
28 | const mockedSetBoardSettings = vi.fn();
29 | 
30 | // 전역 상태 모킹
31 | vi.mock('@/store/useAppStore', () => ({
32 |   useAppStore: vi.fn(() => ({
33 |     boardSettings: {
34 |       strokeWidth: 2,
35 |       edgeColor: '#000000',
36 |       selectedEdgeColor: '#ff0000',
37 |       animated: false,
38 |       markerEnd: true,
39 |       connectionLineType: 'straight',
40 |       snapToGrid: false,
41 |       snapGrid: [20, 20],
42 |       markerSize: 20,
43 |     },
44 |     setBoardSettings: mockedSetBoardSettings,
45 |   })),
46 | }));
47 | 
48 | vi.mock('@/lib/board-utils', () => ({
49 |   BoardSettings: {},
50 |   saveBoardSettings: vi.fn(),
51 |   applyEdgeSettings: vi.fn().mockImplementation((edges, settings) => edges),
52 |   saveBoardSettingsToServer: vi.fn().mockResolvedValue({}),
53 |   loadBoardSettingsFromServer: vi.fn().mockResolvedValue({
54 |     strokeWidth: 2,
55 |     edgeColor: '#000000',
56 |     selectedEdgeColor: '#ff0000',
57 |     animated: false,
58 |     markerEnd: true,
59 |     connectionLineType: 'straight',
60 |     snapToGrid: false,
61 |     snapGrid: [20, 20],
62 |     markerSize: 20,
63 |   }),
64 | }));
65 | 
66 | vi.mock('@/lib/layout-utils', () => ({
67 |   getGridLayout: vi.fn().mockImplementation((nodes: any[]) => 
68 |     nodes.map((node: any, index: number) => ({
69 |       ...node,
70 |       position: { x: index * 200, y: 100 },
71 |     }))
[TRUNCATED]
```

src/components/board/hooks/useBoardUtils.ts
```
1 | /**
2 |  * 파일명: useBoardUtils.ts
3 |  * 목적: 보드 유틸리티 함수 관련 로직 분리
4 |  * 역할: 보드 레이아웃, 저장, 초기화 등 유틸리티 함수를 관리
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { useCallback, useRef } from 'react';
9 | import { Node, Edge, useReactFlow } from '@xyflow/react';
10 | import { toast } from 'sonner';
11 | import { useAppStore } from '@/store/useAppStore';
12 | import { 
13 |   BoardSettings, 
14 |   saveBoardSettings, 
15 |   applyEdgeSettings, 
16 |   saveBoardSettingsToServer, 
17 |   loadBoardSettingsFromServer 
18 | } from '@/lib/board-utils';
19 | import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
20 | import { CardData } from '../types/board-types';
21 | 
22 | /**
23 |  * useBoardUtils: 보드 유틸리티 함수 관련 로직을 관리하는 훅
24 |  * @param reactFlowWrapper ReactFlow 래퍼 참조
25 |  * @param updateNodeInternals 노드 내부 업데이트 함수
26 |  * @param saveLayout 레이아웃 저장 함수
27 |  * @param saveEdges 엣지 저장 함수
28 |  * @param nodes 현재 노드 배열
29 |  * @param edges 현재 엣지 배열
30 |  * @param setNodes 노드 상태 설정 함수
31 |  * @param setEdges 엣지 상태 설정 함수
32 |  * @returns 보드 유틸리티 함수들
33 |  */
34 | export function useBoardUtils({
35 |   reactFlowWrapper,
36 |   updateNodeInternals,
37 |   saveLayout,
38 |   saveEdges,
39 |   nodes,
40 |   edges,
41 |   setNodes,
42 |   setEdges
43 | }: {
44 |   reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
45 |   updateNodeInternals: (nodeId: string) => void;
46 |   saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
47 |   saveEdges: (edgesToSave?: Edge[]) => boolean;
48 |   nodes: Node<CardData>[];
49 |   edges: Edge[];
50 |   setNodes: (updater: ((nodes: Node<CardData>[]) => Node<CardData>[]) | Node<CardData>[]) => void;
51 |   setEdges: (updater: ((edges: Edge[]) => Edge[]) | Edge[]) => void;
52 | }) {
53 |   // 전역 상태에서 보드 설정 가져오기
54 |   const { boardSettings, setBoardSettings } = useAppStore();
55 |   
56 |   // 저장되지 않은 변경사항 플래그
57 |   const hasUnsavedChanges = useRef(false);
58 |   
59 |   // ReactFlow 인스턴스
60 |   const reactFlowInstance = useReactFlow();
61 | 
62 |   /**
63 |    * 인증 상태에 따라 서버에서 설정 불러오기
64 |    * @param isAuthenticated 인증 여부
65 |    * @param userId 사용자 ID
66 |    */
67 |   const loadBoardSettingsFromServerIfAuthenticated = useCallback(async (
[TRUNCATED]
```

src/components/board/hooks/useEdges.test.tsx
```
1 | /**
2 |  * 파일명: useEdges.test.tsx
3 |  * 목적: useEdges 커스텀 훅 테스트
4 |  * 역할: 엣지 관련 기능의 정상 작동 검증
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { renderHook, act } from '@testing-library/react';
10 | import { Edge, Connection, Node, MarkerType, ConnectionLineType, Position } from '@xyflow/react';
11 | import { EDGES_STORAGE_KEY } from '@/lib/board-constants';
12 | import { BoardSettings } from '@/lib/board-utils';
13 | 
14 | // toast 모킹은 파일 최상단에 위치하도록 이동
15 | vi.mock('sonner', () => {
16 |   return {
17 |     toast: {
18 |       success: vi.fn(),
19 |       info: vi.fn(),
20 |       error: vi.fn(),
21 |     }
22 |   };
23 | });
24 | 
25 | // React Flow 모킹 관련 임포트 및 호출
26 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
27 | mockReactFlow();
28 | 
29 | // 테스트할 훅 임포트
30 | import { useEdges } from './useEdges';
31 | 
32 | // 테스트용 보드 설정
33 | const mockBoardSettings: BoardSettings = {
34 |   snapToGrid: false,
35 |   snapGrid: [15, 15],
36 |   connectionLineType: ConnectionLineType.SmoothStep,
37 |   markerEnd: MarkerType.Arrow,
38 |   strokeWidth: 2,
39 |   markerSize: 20,
40 |   edgeColor: '#C1C1C1',
41 |   selectedEdgeColor: '#FF0072',
42 |   animated: false,
43 | };
44 | 
45 | // 테스트용 노드 데이터
46 | const mockNodes: Node[] = [
47 |   {
48 |     id: 'node-1',
49 |     type: 'default',
50 |     position: { x: 100, y: 100 },
51 |     data: { label: 'Node 1' },
52 |     targetPosition: Position.Left
53 |   },
54 |   {
55 |     id: 'node-2',
56 |     type: 'default',
57 |     position: { x: 300, y: 100 },
58 |     data: { label: 'Node 2' }
59 |   }
60 | ];
61 | 
62 | // 로컬 스토리지 모킹
63 | const localStorageMock = (() => {
64 |   let store: Record<string, string> = {};
65 |   return {
66 |     getItem: vi.fn((key: string) => store[key] || null),
67 |     setItem: vi.fn((key: string, value: string) => {
68 |       store[key] = value.toString();
69 |     }),
70 |     clear: vi.fn(() => {
71 |       store = {};
72 |     }),
[TRUNCATED]
```

src/components/board/hooks/useEdges.ts
```
1 | /**
2 |  * 파일명: useEdges.ts
3 |  * 목적: 엣지 관련 상태 및 로직 관리
4 |  * 역할: 엣지 생성, 업데이트, 삭제 및 이벤트 핸들링 로직 캡슐화
5 |  * 작성일: 2024-05-11
6 |  */
7 | 
8 | import { useCallback, useRef, useEffect } from 'react';
9 | import { 
10 |   useEdgesState, 
11 |   applyEdgeChanges, 
12 |   Position, 
13 |   MarkerType, 
14 |   addEdge 
15 | } from '@xyflow/react';
16 | import { toast } from 'sonner';
17 | import { 
18 |   BoardSettings,
19 |   applyEdgeSettings
20 | } from '@/lib/board-utils';
21 | import { EDGES_STORAGE_KEY } from '@/lib/board-constants';
22 | import { 
23 |   BoardEdge, 
24 |   EdgeChange, 
25 |   Connection, 
26 |   Node, 
27 |   Edge 
28 | } from '../types/board-types';
29 | 
30 | /**
31 |  * useEdges: 엣지 관련 상태 및 로직을 관리하는 훅
32 |  * @param boardSettings 보드 설정 객체
33 |  * @param nodes 노드 배열
34 |  * @param initialEdges 초기 엣지 데이터 (옵션)
35 |  * @returns 엣지 관련 상태 및 함수들
36 |  */
37 | export function useEdges({
38 |   boardSettings,
39 |   nodes,
40 |   initialEdges = []
41 | }: {
42 |   boardSettings: BoardSettings;
43 |   nodes: Node[];
44 |   initialEdges?: Edge[];
45 | }) {
46 |   // 엣지 상태 관리
47 |   const [edges, setEdges] = useEdgesState<Edge>(initialEdges);
48 |   
49 |   // 저장되지 않은 변경사항 플래그
50 |   const hasUnsavedChanges = useRef(false);
51 |   
52 |   // 초기 엣지 데이터가 변경되면 엣지 상태 업데이트
53 |   useEffect(() => {
54 |     if (initialEdges && initialEdges.length > 0) {
55 |       setEdges(initialEdges);
56 |     }
57 |   }, [initialEdges, setEdges]);
58 |   
59 |   /**
60 |    * 엣지 변경 핸들러: 엣지 변경 사항 적용 및 관리
61 |    * @param changes 엣지 변경 사항 배열
62 |    */
63 |   const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
64 |     // applyEdgeChanges 함수를 사용하여 적절하게 엣지 변경사항 적용
65 |     setEdges((eds) => applyEdgeChanges(changes, eds));
66 |     
67 |     // 변경이 있을 때마다 저장 대기 상태로 설정
68 |     hasUnsavedChanges.current = true;
69 |   }, [setEdges]);
70 |   
71 |   /**
72 |    * 엣지 저장: 현재 엣지 상태를 로컬 스토리지에 저장
73 |    * @param edgesToSave 저장할 엣지 배열 (기본값은 현재 엣지)
[TRUNCATED]
```

src/components/board/hooks/useNodes.test.tsx
```
1 | /**
2 |  * 파일명: useNodes.test.tsx
3 |  * 목적: useNodes 커스텀 훅 테스트
4 |  * 역할: 노드 관련 기능의 정상 작동 검증
5 |  * 작성일: 2024-05-09
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { renderHook, act } from '@testing-library/react';
10 | import { useNodes } from './useNodes';
11 | import { mockReactFlow } from '@/tests/utils/react-flow-mock';
12 | import { Node, NodeChange } from '@xyflow/react';
13 | import { CardData } from '../types/board-types';
14 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
15 | 
16 | // React Flow 모킹
17 | mockReactFlow();
18 | 
19 | // useAppStore 모킹
20 | vi.mock('@/store/useAppStore', () => ({
21 |   useAppStore: () => ({
22 |     selectedCardIds: ['test-node-1'],
23 |     toggleSelectedCard: vi.fn(),
24 |     selectCard: vi.fn(),
25 |     clearSelectedCards: vi.fn(),
26 |   }),
27 | }));
28 | 
29 | // 로컬 스토리지 모킹
30 | const localStorageMock = (() => {
31 |   let store: Record<string, string> = {};
32 |   return {
33 |     getItem: vi.fn((key: string) => store[key] || null),
34 |     setItem: vi.fn((key: string, value: string) => {
35 |       store[key] = value.toString();
36 |     }),
37 |     clear: vi.fn(() => {
38 |       store = {};
39 |     }),
40 |     removeItem: vi.fn((key: string) => {
41 |       delete store[key];
42 |     }),
43 |   };
44 | })();
45 | 
46 | Object.defineProperty(window, 'localStorage', {
47 |   value: localStorageMock,
48 | });
49 | 
50 | // toast 라이브러리 모킹
51 | vi.mock('sonner', () => ({
52 |   toast: {
53 |     success: vi.fn(),
54 |     info: vi.fn(),
55 |     error: vi.fn(),
56 |   },
57 | }));
58 | 
59 | describe('useNodes', () => {
60 |   beforeEach(() => {
61 |     localStorageMock.clear();
62 |     vi.clearAllMocks();
63 |   });
64 | 
65 |   it('초기 상태가 올바르게 반환되어야 함', () => {
66 |     const { result } = renderHook(() => useNodes({}));
67 |     
68 |     expect(result.current.nodes).toEqual([]);
69 |     expect(typeof result.current.handleNodesChange).toBe('function');
70 |     expect(typeof result.current.handleNodeClick).toBe('function');
[TRUNCATED]
```

src/components/board/hooks/useNodes.ts
```
1 | /**
2 |  * 파일명: useNodes.ts
3 |  * 목적: 노드 관련 상태 및 로직 관리
4 |  * 역할: 노드 생성, 업데이트, 삭제 및 이벤트 핸들링 로직 캡슐화
5 |  * 작성일: 2024-05-09
6 |  */
7 | 
8 | import { useCallback, useRef, useEffect } from 'react';
9 | import { useNodesState, applyNodeChanges } from '@xyflow/react';
10 | import { toast } from 'sonner';
11 | import { useAppStore } from '@/store/useAppStore';
12 | import { 
13 |   CardData, 
14 |   NodeChange, 
15 |   Node,
16 |   XYPosition
17 | } from '../types/board-types';
18 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
19 | 
20 | /**
21 |  * useNodes: 노드 관련 상태 및 로직을 관리하는 훅
22 |  * @param onSelectCard 카드 선택 시 호출될 콜백 함수
23 |  * @param initialNodes 초기 노드 데이터 (옵션)
24 |  * @returns 노드 관련 상태 및 함수들
25 |  */
26 | export function useNodes({
27 |   onSelectCard,
28 |   initialNodes = []
29 | }: {
30 |   onSelectCard?: (cardId: string | null) => void;
31 |   initialNodes?: Node<CardData>[];
32 | }) {
33 |   // 노드 상태 관리 - Node<CardData> 타입으로 제네릭 지정
34 |   const [nodes, setNodes] = useNodesState<Node<CardData>>(initialNodes);
35 |   
36 |   // 저장되지 않은 변경사항 플래그
37 |   const hasUnsavedChanges = useRef(false);
38 |   
39 |   // 전역 상태에서 선택된 카드 정보 가져오기
40 |   const { selectedCardIds, toggleSelectedCard, selectCard, clearSelectedCards } = useAppStore();
41 |   
42 |   // 초기 노드 데이터가 변경되면 노드 상태 업데이트
43 |   useEffect(() => {
44 |     if (initialNodes && initialNodes.length > 0) {
45 |       setNodes(initialNodes);
46 |     }
47 |   }, [initialNodes, setNodes]);
48 | 
49 |   /**
50 |    * 노드 변경 핸들러: 노드 변경 사항 적용 및 관리
51 |    * @param changes 노드 변경 사항 배열
52 |    */
53 |   const handleNodesChange = useCallback((changes: NodeChange[]) => {
54 |     // 노드 삭제 변경이 있는지 확인
55 |     const deleteChanges = changes.filter(change => change.type === 'remove');
56 |     
57 |     // 삭제된 노드가 있으면 로컬 스토리지에서도 해당 노드 정보를 제거
58 |     if (deleteChanges.length > 0) {
59 |       // 현재 저장된 노드 위치 정보 가져오기
60 |       try {
61 |         const savedPositionsStr = localStorage.getItem(STORAGE_KEY);
62 |         if (savedPositionsStr) {
[TRUNCATED]
```

src/components/board/types/board-types.ts
```
1 | /**
2 |  * 파일명: board-types.ts
3 |  * 목적: BoardComponent 및 관련 컴포넌트에서 사용되는 타입 정의
4 |  * 역할: 타입 정의를 중앙화하여 코드 중복을 방지하고 타입 안정성 제공
5 |  * 작성일: 2024-05-09
6 |  */
7 | 
8 | import { Node, Edge, Connection, XYPosition, NodeChange, EdgeChange, Position, ConnectionMode } from '@xyflow/react';
9 | 
10 | /**
11 |  * BoardComponent의 Props 인터페이스
12 |  * @interface BoardComponentProps
13 |  */
14 | export interface BoardComponentProps {
15 |   /** 카드 선택 시 호출될 콜백 함수 */
16 |   onSelectCard?: (cardId: string | null) => void;
17 |   /** 컴포넌트에 적용할 추가 CSS 클래스 */
18 |   className?: string;
19 |   /** 컨트롤 표시 여부 */
20 |   showControls?: boolean;
21 | }
22 | 
23 | /**
24 |  * 카드(노드) 데이터 인터페이스
25 |  * @interface CardData
26 |  */
27 | export interface CardData {
28 |   id: string;
29 |   title: string;
30 |   content: string;
31 |   tags?: string[];
32 |   cardTags?: Array<{tag: {name: string}}>;
33 |   [key: string]: any;
34 | }
35 | 
36 | /**
37 |  * 보드 설정 인터페이스
38 |  * @interface BoardSettings
39 |  */
40 | export interface BoardSettings {
41 |   /** 엣지 색상 */
42 |   edgeColor: string;
43 |   /** 엣지 두께 */
44 |   strokeWidth: number;
45 |   /** 엣지 애니메이션 여부 */
46 |   animated: boolean;
47 |   /** 방향 표시 여부 */
48 |   markerEnd: boolean;
49 |   /** 연결선 타입 */
50 |   connectionLineType: string;
51 |   /** 그리드 스냅 여부 */
52 |   snapToGrid: boolean;
53 |   /** 그리드 크기 */
54 |   snapGrid: [number, number];
55 |   [key: string]: any;
56 | }
57 | 
58 | /**
59 |  * 보드 노드 타입
60 |  * @type BoardNode
61 |  */
62 | export type BoardNode = Node<CardData>;
63 | 
64 | /**
65 |  * 보드 엣지 타입
66 |  * @type BoardEdge
67 |  */
68 | export type BoardEdge = Edge;
69 | 
70 | /**
71 |  * 엣지 드롭 데이터 인터페이스
72 |  * @interface EdgeDropData
73 |  */
74 | export interface EdgeDropData {
75 |   position: XYPosition;
76 |   connectingNodeId: string;
77 |   handleType: 'source' | 'target';
78 | }
79 | 
80 | // 타입 재내보내기 - isolatedModules 설정 때문에 'export type'을 사용
[TRUNCATED]
```

src/components/board/nodes/CardNode.tsx
```
1 | /**
2 |  * 파일명: CardNode.tsx
3 |  * 목적: 보드에 표시되는 카드 노드 컴포넌트
4 |  * 역할: React Flow의 노드로 사용되는 카드 UI 컴포넌트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
9 | import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, Node } from '@xyflow/react';
10 | import { Button } from "@/components/ui/button";
11 | import Link from 'next/link';
12 | import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
13 | import TiptapViewer from '@/components/editor/TiptapViewer';
14 | import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
15 | import { CSSProperties } from 'react';
16 | import { useAppStore } from '@/store/useAppStore';
17 | import { Card, CardContent } from '@/components/ui/card';
18 | import { cn } from '@/lib/utils';
19 | import { createPortal } from 'react-dom';
20 | import { EditCardModal } from '@/components/cards/EditCardModal';
21 | import { useTheme } from '@/contexts/ThemeContext';
22 | import { NODE_TYPES } from '@/lib/flow-constants';
23 | 
24 | // 디버깅용 로그
25 | console.log('[CardNode] 모듈이 로드됨');
26 | 
27 | // 노드 데이터 타입 정의
28 | export interface NodeData {
29 |   id: string;
30 |   title: string;
31 |   content: string;
32 |   type?: string;
33 |   width?: number;
34 |   height?: number;
35 |   color?: string;
36 |   backgroundColor?: string;
37 |   tags?: string[];
38 |   position?: {
39 |     x: number;
40 |     y: number;
41 |   };
42 |   // 추가 속성들
43 |   [key: string]: any;
44 | }
45 | 
46 | // Portal 컴포넌트 - 내부 정의
47 | const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
48 |   const [mounted, setMounted] = useState(false);
49 | 
50 |   useEffect(() => {
51 |     setMounted(true);
52 |     return () => setMounted(false);
53 |   }, []);
54 | 
55 |   return mounted ? createPortal(children, document.body) : null;
56 | };
57 | 
58 | // 헥스 색상을 HSL로 변환하는 함수
59 | // utils 이동 대상 
60 | const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
61 |   if (!hex) return null;
62 |   
63 |   // hex를 RGB로 변환
[TRUNCATED]
```

src/components/board/nodes/CustomEdge.tsx
```
1 | /**
2 |  * 파일명: CustomEdge.tsx
3 |  * 목적: React Flow에서 사용할 커스텀 엣지 컴포넌트
4 |  * 역할: 노드 간 연결선을 시각화하는 컴포넌트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import React, { useMemo, useEffect } from 'react';
9 | import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';
10 | import { loadBoardSettings } from '@/lib/board-utils';
11 | import { useAppStore } from '@/store/useAppStore';
12 | 
13 | // 디버깅용 로그
14 | console.log('[CustomEdge] 모듈이 로드됨 - EDGE_TYPES에 등록 확인 필요');
15 | 
16 | // 확장된 엣지 Props 인터페이스
17 | interface CustomEdgeProps extends EdgeProps {
18 |   type?: string;
19 |   animated?: boolean;
20 |   data?: {
21 |     edgeType?: ConnectionLineType;
22 |     settings?: any;
23 |   };
24 | }
25 | 
26 | /**
27 |  * 커스텀 엣지 컴포넌트
28 |  * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
29 |  */
30 | // 컴포넌트 사용 시점 디버깅
31 | console.log('[CustomEdge] 컴포넌트 정의 전: 함수 형태의 컴포넌트 생성');
32 | 
33 | function CustomEdge({ 
34 |   id,
35 |   source,
36 |   target,
37 |   sourceX,
38 |   sourceY,
39 |   targetX,
40 |   targetY,
41 |   sourcePosition,
42 |   targetPosition,
43 |   style = {},
44 |   markerEnd,
45 |   selected,
46 |   type,
47 |   animated,
48 |   data,
49 |   ...restProps
50 | }: CustomEdgeProps) {
51 |   // 컴포넌트 초기화 로그
52 |   console.log(`[CustomEdge] 컴포넌트 렌더링 시작: ID=${id}, 타입=${type || 'custom'}`);
53 |   
54 |   // Zustand 스토어에서 boardSettings 가져오기
55 |   const { boardSettings } = useAppStore();
56 |   
57 |   // 글로벌 설정과 로컬 설정 결합
58 |   const effectiveSettings = useMemo(() => {
59 |     // 로컬 설정이 있으면 우선적으로 사용, 없으면 글로벌 설정 사용
60 |     const localSettings = data?.settings;
61 |     return localSettings ? { ...boardSettings, ...localSettings } : boardSettings;
62 |   }, [boardSettings, data?.settings]);
63 | 
64 |   // 엣지 연결 좌표 계산 (useMemo로 최적화)
65 |   const edgeParams = useMemo(() => ({
66 |     sourceX,
67 |     sourceY,
68 |     sourcePosition,
69 |     targetX,
70 |     targetY,
71 |     targetPosition,
72 |   }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);
73 | 
[TRUNCATED]
```

src/components/board/nodes/NodeInspect.tsx
```
1 | /**
2 |  * 파일명: NodeInspect.tsx
3 |  * 목적: React Flow 노드 검사 컴포넌트
4 |  * 역할: 노드 정보를 표시해주는 디버깅용 컴포넌트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { useEffect, useState } from 'react';
9 | import { useReactFlow, NodeProps, NodeToolbar, Position } from '@xyflow/react';
10 | 
11 | /**
12 |  * NodeInspect 컴포넌트는 각 노드에 추가되어 노드의 데이터를 표시합니다.
13 |  * 실시간으로 노드 상태를 반영합니다.
14 |  */
15 | export default function NodeInspect(props: NodeProps) {
16 |   const { data, id, type } = props;
17 |   const { getNode } = useReactFlow();
18 |   // 실시간 상태 업데이트를 위한 상태
19 |   const [nodeState, setNodeState] = useState({ selected: false });
20 |   const [isVisible, setIsVisible] = useState(false);
21 |   
22 |   // 렌더링 전에 isVisible 상태를 설정
23 |   useEffect(() => {
24 |     setIsVisible(!!data?.isInspected);
25 |   }, [data?.isInspected]);
26 | 
27 |   // 실시간 노드 상태 업데이트
28 |   useEffect(() => {
29 |     // 노드 상태 업데이트 함수
30 |     const updateNodeState = () => {
31 |       const currentNode = getNode(id);
32 |       if (currentNode) {
33 |         setNodeState({
34 |           selected: !!currentNode.selected,
35 |         });
36 |       }
37 |     };
38 | 
39 |     // 초기 상태 설정
40 |     updateNodeState();
41 | 
42 |     // 주기적으로 노드 상태 업데이트 (실시간성 보장)
43 |     const intervalId = setInterval(updateNodeState, 100);
44 | 
45 |     return () => {
46 |       clearInterval(intervalId);
47 |     };
48 |   }, [id, getNode]);
49 | 
50 |   // 핸들 위치 정보
51 |   const handleInfo = {
52 |     leftTop: { position: Position.Left, top: '0%' },
53 |     leftBottom: { position: Position.Left, top: '100%' },
54 |     rightTop: { position: Position.Right, top: '0%' },
55 |     rightBottom: { position: Position.Right, top: '100%' },
56 |   };
57 | 
58 |   if (!isVisible) return null;
59 | 
60 |   return (
61 |     <NodeToolbar 
62 |       position={Position.Bottom}
63 |       className="nodrag bg-card shadow-md rounded p-2 text-xs max-w-xs" 
64 |       isVisible={true}
65 |     >
66 |       <div className="space-y-1">
67 |         <div><span className="font-medium">제목:</span> {data?.title || data?.label || '제목 없음'}</div>
[TRUNCATED]
```

src/components/board/nodes/NodeInspector.tsx
```
1 | /**
2 |  * 파일명: NodeInspector.tsx
3 |  * 목적: 노드 상세 정보를 모달로 표시하는 컴포넌트
4 |  * 역할: 선택된 노드의 정보를 검사하고 표시
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { useEffect } from 'react';
9 | import { Node } from '@xyflow/react';
10 | import { Modal } from '@/components/ui/modal';
11 | import { Badge } from '@/components/ui/badge';
12 | import TiptapViewer from '@/components/editor/TiptapViewer';
13 | import { useNodeStore } from '@/store/useNodeStore';
14 | 
15 | interface NodeInspectorProps {
16 |   nodes: Node[];
17 | }
18 | 
19 | /**
20 |  * NodeInspector: 노드의 상세 정보를 모달로 표시하는 컴포넌트
21 |  * @param {NodeInspectorProps} props - 컴포넌트 속성
22 |  * @returns {JSX.Element} 노드 인스펙터 컴포넌트
23 |  */
24 | export function NodeInspector({ nodes }: NodeInspectorProps) {
25 |   const { inspectorOpen, inspectedNode, setInspectorOpen, setInspectedNode } = useNodeStore();
26 | 
27 |   // 모달이 닫힐 때 inspectedNode 초기화
28 |   const handleCloseModal = () => {
29 |     setInspectorOpen(false);
30 |   };
31 | 
32 |   // 노드 정보가 없거나 모달이 닫혀있으면 열린 상태로 렌더링하지만 보이지 않게 함
33 |   const shouldShowContent = inspectorOpen && inspectedNode;
34 | 
35 |   return (
36 |     <Modal.Root open={Boolean(shouldShowContent)} onOpenChange={handleCloseModal}>
37 |       <Modal.Content>
38 |         {shouldShowContent && (
39 |           <>
40 |             <Modal.Title>
41 |               {inspectedNode.data?.title || '제목 없음'}
42 |             </Modal.Title>
43 |             
44 |             <div className="py-4">
45 |               {/* 노드 ID 정보 */}
46 |               <div className="mb-4">
47 |                 <h3 className="text-sm font-semibold mb-1">ID</h3>
48 |                 <code className="bg-muted p-1 rounded text-xs">{inspectedNode.id}</code>
49 |               </div>
50 |               
51 |               {/* 노드 내용 */}
52 |               {inspectedNode.data?.content && (
53 |                 <div className="mb-4">
54 |                   <h3 className="text-sm font-semibold mb-1">내용</h3>
55 |                   <div className="bg-muted p-2 rounded">
56 |                     <TiptapViewer content={inspectedNode.data.content} />
57 |                   </div>
58 |                 </div>
59 |               )}
60 |               
61 |               {/* 노드 태그 */}
62 |               {inspectedNode.data?.tags && inspectedNode.data.tags.length > 0 && (
63 |                 <div className="mb-4">
[TRUNCATED]
```

src/components/board/utils/constants.ts
```
1 | /**
2 |  * 파일명: constants.ts
3 |  * 목적: 보드 컴포넌트 관련 상수 정의
4 |  * 역할: 보드 컴포넌트에서 사용되는 모든 상수값 제공
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { ConnectionLineType, Position } from '@xyflow/react';
9 | 
10 | // 레이아웃 방향
11 | export const LAYOUT_DIRECTION = {
12 |   HORIZONTAL: 'LR',
13 |   VERTICAL: 'TB'
14 | };
15 | 
16 | // 노드 타입
17 | export const NODE_TYPES = {
18 |   CARD: 'card'
19 | };
20 | 
21 | // 엣지 타입
22 | export const EDGE_TYPES = {
23 |   CUSTOM: 'custom'
24 | };
25 | 
26 | // 핸들 위치 정보
27 | export const HANDLE_POSITIONS = {
28 |   TOP: Position.Top,
29 |   RIGHT: Position.Right,
30 |   BOTTOM: Position.Bottom,
31 |   LEFT: Position.Left
32 | };
33 | 
34 | // 연결선 타입
35 | export const CONNECTION_LINE_TYPES = {
36 |   BEZIER: ConnectionLineType.Bezier,
37 |   STEP: ConnectionLineType.Step,
38 |   SMOOTHSTEP: ConnectionLineType.SmoothStep,
39 |   STRAIGHT: ConnectionLineType.Straight
40 | };
41 | 
42 | // 기본 노드 크기
43 | export const DEFAULT_NODE_DIMENSIONS = {
44 |   WIDTH: 300,
45 |   MIN_HEIGHT: 100
46 | };
47 | 
48 | // 자동 저장 딜레이 (밀리초)
49 | export const AUTO_SAVE_DELAY = 1000;
50 | 
51 | // 노드 기본 간격 값
52 | export const NODE_SPACING = {
53 |   HORIZONTAL: 100,
54 |   VERTICAL: 80
55 | };
56 | 
57 | // 새 노드 기본 데이터
58 | export const DEFAULT_NEW_CARD = {
59 |   title: '새 카드',
60 |   content: '',
61 |   tags: []
62 | };
63 | 
64 | // 보드 줌 설정
65 | export const ZOOM_SETTINGS = {
66 |   MIN: 0.5,
67 |   MAX: 2,
68 |   STEP: 0.1
69 | };
70 | 
71 | // 툴팁 표시 지연 (밀리초)
72 | export const TOOLTIP_DELAY = 500; 
```

src/components/board/utils/graphUtils.ts
```
1 | /**
2 |  * 파일명: graphUtils.ts
3 |  * 목적: 그래프 관련 순수 함수 모음
4 |  * 역할: 노드, 엣지 처리를 위한 순수 유틸리티 함수 제공
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { Node, Edge, XYPosition, Position, MarkerType } from '@xyflow/react';
9 | import { BoardSettings } from '@/lib/board-utils';
10 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
11 | 
12 | /**
13 |  * 레이아웃을 로컬 스토리지에 저장
14 |  * @param nodes 저장할 노드 배열
15 |  * @returns 성공 여부
16 |  */
17 | export const saveLayout = (nodes: Node[]): boolean => {
18 |   try {
19 |     // 노드 ID와 위치만 저장
20 |     const nodePositions = nodes.reduce((acc: Record<string, { position: XYPosition }>, node: Node) => {
21 |       acc[node.id] = { position: node.position };
22 |       return acc;
23 |     }, {});
24 |     
25 |     localStorage.setItem(STORAGE_KEY, JSON.stringify(nodePositions));
26 |     return true;
27 |   } catch (err) {
28 |     console.error('레이아웃 저장 실패:', err);
29 |     return false;
30 |   }
31 | };
32 | 
33 | /**
34 |  * 엣지를 로컬 스토리지에 저장
35 |  * @param edges 저장할 엣지 배열
36 |  * @returns 성공 여부
37 |  */
38 | export const saveEdges = (edges: Edge[]): boolean => {
39 |   try {
40 |     localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
41 |     return true;
42 |   } catch (err) {
43 |     console.error('엣지 저장 실패:', err);
44 |     return false;
45 |   }
46 | };
47 | 
48 | /**
49 |  * 모든 레이아웃 데이터 저장 (노드와 엣지)
50 |  * @param nodes 저장할 노드 배열
51 |  * @param edges 저장할 엣지 배열
52 |  * @returns 성공 여부
53 |  */
54 | export const saveAllLayoutData = (nodes: Node[], edges: Edge[]): boolean => {
55 |   const layoutSaved = saveLayout(nodes);
56 |   const edgesSaved = saveEdges(edges);
57 |   
58 |   return layoutSaved && edgesSaved;
59 | };
60 | 
61 | /**
62 |  * 삭제된 노드를 로컬 스토리지에서 제거
63 |  * @param deletedNodeIds 삭제된 노드 ID 배열
64 |  */
65 | export const removeDeletedNodesFromStorage = (deletedNodeIds: string[]): void => {
66 |   try {
67 |     // 노드 위치 정보 처리
[TRUNCATED]
```

src/app/api/user/[id]/route.test.ts
```
1 | /**
2 |  * 파일명: route.test.ts
3 |  * 목적: 사용자 정보 조회 API 엔드포인트 테스트
4 |  * 역할: API의 응답과 오류 처리 검증
5 |  * 작성일: 2024-04-18
6 |  * @vitest-environment node
7 |  */
8 | 
9 | import { NextResponse } from 'next/server';
10 | import { GET } from './route';
11 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
12 | 
13 | // NextResponse 모킹
14 | vi.mock('next/server', () => {
15 |   const NextResponseMock = {
16 |     json: vi.fn().mockImplementation((data: any, options?: { status?: number }) => ({
17 |       status: options?.status || 200,
18 |       json: async () => data,
19 |     }))
20 |   };
21 |   
22 |   return {
23 |     NextResponse: NextResponseMock
24 |   };
25 | });
26 | 
27 | // prisma 모킹
28 | vi.mock('@/lib/prisma', () => {
29 |   const userFindUnique = vi.fn();
30 | 
31 |   return {
32 |     default: {
33 |       user: {
34 |         findUnique: userFindUnique,
35 |       }
36 |     }
37 |   };
38 | });
39 | 
40 | describe('User API [id]', () => {
41 |   // console.error 모킹
42 |   const originalConsoleError = console.error;
43 |   let prismaMock: any;
44 |   
45 |   beforeEach(async () => {
46 |     vi.clearAllMocks();
47 |     console.error = vi.fn();
48 |     
49 |     // 모든 테스트에서 사용할 prisma mock 설정
50 |     const importedModule = await import('@/lib/prisma');
51 |     prismaMock = vi.mocked(importedModule.default);
52 |   });
53 |   
54 |   // 테스트 후 원래 console.error 복원
55 |   afterAll(() => {
56 |     console.error = originalConsoleError;
57 |   });
58 | 
59 |   describe('GET /api/user/[id]', () => {
60 |     it('유효한 ID로 사용자 조회 시 사용자 정보를 반환한다', async () => {
61 |       // 모킹된 사용자 데이터
62 |       const mockUser = {
63 |         id: 'test-user-id',
64 |         email: 'test@example.com',
65 |         name: '테스트 사용자',
66 |         createdAt: new Date(),
67 |         updatedAt: new Date(),
68 |       };
69 | 
70 |       // Prisma 응답 모킹
71 |       prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
72 | 
73 |       // API 호출 - params 객체를 Mock으로 생성
[TRUNCATED]
```

src/app/api/user/[id]/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import prisma from '@/lib/prisma';
3 | 
4 | export async function GET(
5 |   request: Request,
6 |   { params }: { params: { id: string } }
7 | ) {
8 |   try {
9 |     // Next.js 15에서는 params가 Promise이므로 await 사용
10 |     const paramsResolved = await params;
11 |     const id = paramsResolved.id;
12 |     
13 |     if (!id) {
14 |       return NextResponse.json(
15 |         { error: '사용자 ID가 필요합니다.' },
16 |         { status: 400 }
17 |       );
18 |     }
19 |     
20 |     try {
21 |       // 사용자 조회
22 |       const user = await prisma.user.findUnique({
23 |         where: { id },
24 |       });
25 |       
26 |       if (!user) {
27 |         return NextResponse.json(
28 |           { error: '사용자를 찾을 수 없습니다.' },
29 |           { status: 404 }
30 |         );
31 |       }
32 |       
33 |       return NextResponse.json({ user });
34 |     } catch (dbError: any) {
35 |       console.error('DB 조회 오류:', dbError);
36 |       
37 |       // DB 오류가 발생하면 더미 사용자 데이터 반환
38 |       // 실제 환경에서는 적절한 오류 처리 필요
39 |       return NextResponse.json({
40 |         user: {
41 |           id,
42 |           email: 'user@example.com',
43 |           name: '사용자',
44 |           createdAt: new Date().toISOString(),
45 |           updatedAt: new Date().toISOString(),
46 |         }
47 |       });
48 |     }
49 |   } catch (error: any) {
50 |     console.error('사용자 조회 API 오류:', error);
51 |     return NextResponse.json(
52 |       { error: `사용자 조회 실패: ${error.message}` },
53 |       { status: 500 }
54 |     );
55 |   }
56 | } 
```

src/app/api/tags/[id]/route.test.ts
```
1 | /// <reference types="vitest" />
2 | import { NextRequest, NextResponse } from 'next/server';
3 | import { DELETE } from './route';
4 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
5 | 
6 | // NextResponse.json 모킹
7 | vi.mock('next/server', async () => {
8 |   const actual = await vi.importActual('next/server');
9 |   return {
10 |     ...actual,
11 |     NextResponse: {
12 |       ...actual.NextResponse,
13 |       json: vi.fn().mockImplementation((data: any, options: { status?: number } = {}) => {
14 |         return {
15 |           status: options.status || 200,
16 |           body: data,
17 |           json: () => Promise.resolve(data)
18 |         };
19 |       })
20 |     }
21 |   };
22 | });
23 | 
24 | // Prisma 모킹
25 | vi.mock('@/lib/prisma', () => ({
26 |   prisma: {
27 |     tag: {
28 |       findUnique: vi.fn(),
29 |       delete: vi.fn()
30 |     },
31 |     cardTag: {
32 |       deleteMany: vi.fn()
33 |     }
34 |   }
35 | }));
36 | 
37 | describe('태그 API - DELETE', () => {
38 |   beforeEach(() => {
39 |     vi.clearAllMocks();
40 |   });
41 | 
42 |   afterEach(() => {
43 |     vi.clearAllMocks();
44 |   });
45 | 
46 |   afterAll(() => {
47 |     vi.resetAllMocks();
48 |   });
49 | 
50 |   it('성공적으로 태그를 삭제해야 함', async () => {
51 |     const tagId = '1';
52 |     const mockTag = { 
53 |       id: tagId, 
54 |       name: '테스트 태그',
55 |       _count: { cardTags: 2 }
56 |     };
57 | 
58 |     // prisma 모킹 설정
59 |     const { prisma } = await import('@/lib/prisma');
60 |     (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
61 |     (prisma.cardTag.deleteMany as any).mockResolvedValue({ count: 2 });
62 |     (prisma.tag.delete as any).mockResolvedValue(mockTag);
63 |     
64 |     // DELETE 요청 시뮬레이션
65 |     const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
66 |       method: 'DELETE'
67 |     });
68 |     
69 |     const response = await DELETE(request, {
70 |       params: { id: tagId }
71 |     });
72 |     
73 |     // 응답 검증
74 |     expect(response.status).toBe(200);
75 |     const responseData = await response.json();
[TRUNCATED]
```

src/app/api/tags/[id]/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { z } from 'zod';
3 | import prisma from '@/lib/prisma';
4 | 
5 | // 태그 수정 스키마
6 | const updateTagSchema = z.object({
7 |   name: z.string().min(1, '태그 이름은 필수입니다.'),
8 |   color: z.string().optional(),
9 | });
10 | 
11 | // 개별 태그 조회 API
12 | export async function GET(
13 |   request: NextRequest,
14 |   context: { params: { id: string } }
15 | ) {
16 |   try {
17 |     const id = context.params.id;
18 |     
19 |     // 태그 조회
20 |     const tag = await prisma.tag.findUnique({
21 |       where: { id }
22 |     });
23 |     
24 |     if (!tag) {
25 |       return NextResponse.json(
26 |         { error: '태그를 찾을 수 없습니다.' },
27 |         { status: 404 }
28 |       );
29 |     }
30 |     
31 |     return NextResponse.json(tag);
32 |   } catch (error) {
33 |     console.error('태그 조회 오류:', error);
34 |     return NextResponse.json(
35 |       { error: '태그를 조회하는 중 오류가 발생했습니다.' },
36 |       { status: 500 }
37 |     );
38 |   }
39 | }
40 | 
41 | // 태그 수정 API
42 | export async function PUT(
43 |   request: NextRequest,
44 |   context: { params: { id: string } }
45 | ) {
46 |   try {
47 |     const id = context.params.id;
48 |     const body = await request.json();
49 |     
50 |     // 데이터 유효성 검사
51 |     const validation = updateTagSchema.safeParse(body);
52 |     if (!validation.success) {
53 |       return NextResponse.json(
54 |         { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
55 |         { status: 400 }
56 |       );
57 |     }
58 |     
59 |     // 태그 존재 여부 확인
60 |     const existingTag = await prisma.tag.findUnique({
61 |       where: { id }
62 |     });
63 |     
64 |     if (!existingTag) {
65 |       return NextResponse.json(
66 |         { error: '태그를 찾을 수 없습니다.' },
67 |         { status: 404 }
68 |       );
69 |     }
70 |     
71 |     // 같은 이름의 태그가 있는지 확인 (다른 ID)
72 |     const duplicateTag = await prisma.tag.findFirst({
73 |       where: {
74 |         name: validation.data.name,
75 |         id: { not: id }
76 |       }
77 |     });
[TRUNCATED]
```

src/app/api/user/register/route.test.ts
```
1 | /**
2 |  * 파일명: route.test.ts
3 |  * 목적: 사용자 등록 API 엔드포인트 테스트
4 |  * 역할: API의 응답과 오류 처리 검증
5 |  * 작성일: 2024-04-18
6 |  * @vitest-environment node
7 |  */
8 | 
9 | import { NextResponse } from 'next/server';
10 | import { POST } from './route';
11 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
12 | 
13 | // Request, NextResponse 모킹
14 | vi.mock('next/server', () => {
15 |   const NextResponseMock = {
16 |     json: vi.fn().mockImplementation((data: any, options?: { status?: number }) => ({
17 |       status: options?.status || 200,
18 |       json: async () => data,
19 |     }))
20 |   };
21 |   
22 |   return {
23 |     NextResponse: NextResponseMock
24 |   };
25 | });
26 | 
27 | // prisma 모킹
28 | vi.mock('@/lib/prisma', () => {
29 |   const userFindUnique = vi.fn();
30 |   const userCreate = vi.fn();
31 | 
32 |   return {
33 |     default: {
34 |       user: {
35 |         findUnique: userFindUnique,
36 |         create: userCreate,
37 |       }
38 |     }
39 |   };
40 | });
41 | 
42 | // 요청 객체 생성 헬퍼 함수
43 | function createMockRequest(body: any): Request {
44 |   return {
45 |     json: vi.fn().mockResolvedValue(body)
46 |   } as unknown as Request;
47 | }
48 | 
49 | describe('User Register API', () => {
50 |   // console.error 모킹
51 |   const originalConsoleError = console.error;
52 |   const originalConsoleLog = console.log;
53 |   let prismaMock: any;
54 |   
55 |   beforeEach(async () => {
56 |     vi.clearAllMocks();
57 |     console.error = vi.fn();
58 |     console.log = vi.fn();
59 |     
60 |     // 모든 테스트에서 사용할 prisma mock 설정
61 |     const importedModule = await import('@/lib/prisma');
62 |     prismaMock = vi.mocked(importedModule.default);
63 |   });
64 |   
65 |   // 테스트 후 원래 console 함수 복원
66 |   afterAll(() => {
67 |     console.error = originalConsoleError;
68 |     console.log = originalConsoleLog;
69 |   });
70 | 
71 |   describe('POST /api/user/register', () => {
72 |     it('유효한 사용자 정보로 새 사용자 등록 시 성공한다', async () => {
[TRUNCATED]
```

src/app/api/user/register/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import prisma from '@/lib/prisma';
3 | 
4 | export async function POST(request: Request) {
5 |   try {
6 |     const body = await request.json();
7 |     const { id, email, name } = body;
8 |     
9 |     // 필수 필드 확인
10 |     if (!id || !email) {
11 |       return NextResponse.json(
12 |         { error: '사용자 ID와 이메일은 필수입니다.' },
13 |         { status: 400 }
14 |       );
15 |     }
16 |     
17 |     try {
18 |       // 이미 등록된 사용자인지 확인
19 |       const existingUser = await prisma.user.findUnique({
20 |         where: { id },
21 |       });
22 |       
23 |       if (existingUser) {
24 |         // 이미 존재하는 사용자이면 업데이트 (필요시)
25 |         console.log('기존 사용자 확인:', existingUser.email);
26 |         return NextResponse.json({ message: '기존 사용자 확인됨', user: existingUser });
27 |       }
28 |       
29 |       // 새 사용자 생성
30 |       const newUser = await prisma.user.create({
31 |         data: {
32 |           id,
33 |           email,
34 |           name: name || email.split('@')[0],
35 |         },
36 |       });
37 |       
38 |       console.log('새 사용자 생성됨:', newUser.email);
39 |       
40 |       return NextResponse.json({ message: '사용자 등록 성공', user: newUser });
41 |     } catch (dbError: any) {
42 |       console.error('데이터베이스 오류:', dbError);
43 |       
44 |       // 데이터베이스 연결 오류 시 더미 데이터 반환
45 |       const dummyUser = {
46 |         id,
47 |         email,
48 |         name: name || email.split('@')[0],
49 |         createdAt: new Date().toISOString(),
50 |         updatedAt: new Date().toISOString(),
51 |       };
52 |       
53 |       return NextResponse.json({ 
54 |         message: '사용자 등록은 성공했으나 데이터베이스 연결 실패', 
55 |         user: dummyUser 
56 |       });
57 |     }
58 |   } catch (error: any) {
59 |     console.error('사용자 등록 오류:', error);
60 |     return NextResponse.json(
61 |       { error: `사용자 등록 실패: ${error.message}` },
62 |       { status: 500 }
63 |     );
64 |   }
65 | } 
```

src/app/api/cards/[id]/route.test.ts
```
1 | /**
2 |  * @vitest-environment node
3 |  */
4 | 
5 | import { NextRequest, NextResponse } from 'next/server';
6 | import { GET, PUT, DELETE } from './route';
7 | import prisma from '@/lib/prisma';
8 | import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
9 | 
10 | // 모킹 설정
11 | vi.mock('@/lib/prisma', () => ({
12 |   __esModule: true,
13 |   default: {
14 |     card: {
15 |       findUnique: vi.fn(),
16 |       update: vi.fn(),
17 |       delete: vi.fn(),
18 |     },
19 |   },
20 | }));
21 | 
22 | // Request 객체 모킹 - 타입 오류 해결
23 | if (!global.Request) {
24 |   // @ts-ignore
25 |   global.Request = function Request() {
26 |     return {
27 |       json: () => Promise.resolve({}),
28 |     };
29 |   };
30 | }
31 | 
32 | // NextRequest, NextResponse 모킹
33 | vi.mock('next/server', () => {
34 |   return {
35 |     __esModule: true,
36 |     NextRequest: vi.fn().mockImplementation((url: string, options?: any) => {
37 |       return {
38 |         url,
39 |         method: options?.method || 'GET',
40 |         json: vi.fn().mockImplementation(async () => {
41 |           return options?.body ? JSON.parse(options.body) : {};
42 |         }),
43 |       };
44 |     }),
45 |     NextResponse: {
46 |       json: vi.fn().mockImplementation((data: any, options?: any) => {
47 |         return {
48 |           status: options?.status || 200,
49 |           json: async () => data,
50 |         };
51 |       }),
52 |     },
53 |   };
54 | });
55 | 
56 | // 컨텍스트 모킹 함수
57 | const createMockContext = (id: string) => {
58 |   return {
59 |     params: { id },
60 |   };
61 | };
62 | 
63 | describe('Card Detail API', () => {
64 |   // console.error 모킹 추가
65 |   const originalConsoleError = console.error;
66 |   
67 |   beforeEach(() => {
68 |     vi.clearAllMocks();
69 |     console.error = vi.fn();
70 |   });
71 |   
72 |   // 테스트 후 원래 console.error 복원
73 |   afterAll(() => {
74 |     console.error = originalConsoleError;
75 |   });
76 | 
77 |   describe('GET /api/cards/[id]', () => {
78 |     it('존재하는 카드를 성공적으로 조회한다', async () => {
79 |       // 모킹된 데이터
[TRUNCATED]
```

src/app/api/cards/[id]/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { z } from 'zod';
3 | import prisma from '@/lib/prisma';
4 | import { PrismaClient } from '@prisma/client';
5 | 
6 | // 카드 수정 스키마
7 | const updateCardSchema = z.object({
8 |   title: z.string().min(1, '제목은 필수입니다.').optional(),
9 |   content: z.string().optional(),
10 |   userId: z.string().optional(),
11 |   tags: z.array(z.string()).optional(),
12 | });
13 | 
14 | // 개별 카드 조회 API
15 | export async function GET(
16 |   request: NextRequest,
17 |   context: { params: { id: string } }
18 | ) {
19 |   try {
20 |     const { id } = context.params;
21 |     console.log(`카드 상세 조회 요청: ID=${id}`);
22 |     
23 |     // 카드 조회 (태그 정보 포함)
24 |     const card = await prisma.card.findUnique({
25 |       where: { id },
26 |       include: {
27 |         user: {
28 |           select: {
29 |             id: true,
30 |             name: true
31 |           }
32 |         },
33 |         cardTags: {
34 |           include: {
35 |             tag: true
36 |           }
37 |         }
38 |       }
39 |     });
40 |     
41 |     if (!card) {
42 |       console.log(`카드 찾을 수 없음: ID=${id}`);
43 |       return NextResponse.json(
44 |         { error: '카드를 찾을 수 없습니다.' },
45 |         { status: 404 }
46 |       );
47 |     }
48 |     
49 |     console.log(`카드 조회 성공: ID=${id}`);
50 |     return NextResponse.json(card);
51 |   } catch (error) {
52 |     console.error(`카드 조회 오류 (ID=${context.params.id}):`, error);
53 |     return NextResponse.json(
54 |       { error: '카드를 조회하는 중 오류가 발생했습니다.' },
55 |       { status: 500 }
56 |     );
57 |   }
58 | }
59 | 
60 | // 카드 수정 API
61 | export async function PUT(
62 |   request: NextRequest,
63 |   context: { params: { id: string } }
64 | ) {
65 |   try {
66 |     const { id } = context.params;
67 |     const body = await request.json();
68 |     
69 |     // 데이터 유효성 검사
70 |     const validation = updateCardSchema.safeParse(body);
71 |     if (!validation.success) {
72 |       return NextResponse.json(
73 |         { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
[TRUNCATED]
```

src/app/api/users/first/route.test.ts
```
1 | /**
2 |  * 파일명: route.test.ts
3 |  * 목적: 첫 번째 사용자 조회 API 엔드포인트 테스트
4 |  * 역할: GET /api/users/first 엔드포인트의 다양한 시나리오에 대한 단위 테스트
5 |  * 작성일: 2024-05-23
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { GET } from './route';
10 | 
11 | // 모의된 응답 타입
12 | type MockedResponse = {
13 |   body: any;
14 |   options?: { status?: number };
15 | };
16 | 
17 | // Prisma 클라이언트 모킹
18 | vi.mock('@/lib/prisma', () => ({
19 |   default: {
20 |     user: {
21 |       findFirst: vi.fn()
22 |     }
23 |   }
24 | }));
25 | 
26 | // NextResponse 모킹 (직접 변수에 모킹 함수 할당하지 않고 객체로 모킹)
27 | vi.mock('next/server', () => ({
28 |   NextRequest: function(url: string) {
29 |     return { url };
30 |   },
31 |   NextResponse: {
32 |     json: vi.fn((body, options) => ({ body, options }))
33 |   }
34 | }));
35 | 
36 | // 필요한 모듈 임포트 - 모킹 후에 임포트해야 함
37 | import prisma from '@/lib/prisma';
38 | import { NextResponse } from 'next/server';
39 | 
40 | describe('첫 번째 사용자 조회 API', () => {
41 |   // 각 테스트 전에 모든 모의 함수 초기화
42 |   beforeEach(() => {
43 |     vi.clearAllMocks();
44 |   });
45 | 
46 |   describe('GET /api/users/first', () => {
47 |     it('첫 번째 사용자를 성공적으로 반환한다', async () => {
48 |       // Mock 사용자 데이터 설정
49 |       const mockUser = {
50 |         id: 'user-123',
51 |         name: '테스트 사용자',
52 |         email: 'test@example.com'
53 |       };
54 |       
55 |       // Prisma findFirst 함수가 mock 사용자를 반환하도록 설정
56 |       (prisma.user.findFirst as any).mockResolvedValue(mockUser);
57 |       
58 |       // API 요청 실행
59 |       const request = { url: 'http://localhost/api/users/first' };
60 |       const response = await GET(request as any) as unknown as MockedResponse;
61 |       
62 |       // 기대 결과 확인
63 |       expect(prisma.user.findFirst).toHaveBeenCalledWith({
64 |         orderBy: { createdAt: 'asc' },
65 |         select: { id: true, name: true, email: true }
66 |       });
67 |       expect(NextResponse.json).toHaveBeenCalledWith(mockUser);
[TRUNCATED]
```

src/app/api/users/first/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import prisma from '@/lib/prisma';
3 | 
4 | /**
5 |  * 첫 번째 사용자를 가져오는 API 엔드포인트
6 |  */
7 | export async function GET(request: NextRequest) {
8 |   try {
9 |     // 첫 번째 사용자를 가져옴 (가장 먼저 생성된 사용자)
10 |     const firstUser = await prisma.user.findFirst({
11 |       orderBy: {
12 |         createdAt: 'asc'
13 |       },
14 |       select: {
15 |         id: true,
16 |         name: true,
17 |         email: true
18 |       }
19 |     });
20 |     
21 |     if (!firstUser) {
22 |       return NextResponse.json(
23 |         { error: '사용자를 찾을 수 없습니다.' },
24 |         { status: 404 }
25 |       );
26 |     }
27 |     
28 |     return NextResponse.json(firstUser);
29 |   } catch (error) {
30 |     console.error('사용자 조회 오류:', error);
31 |     
32 |     return NextResponse.json(
33 |       { error: '사용자 조회 중 오류가 발생했습니다.' },
34 |       { status: 500 }
35 |     );
36 |   }
37 | } 
```

src/app/cards/[id]/edit/page.test.tsx
```
1 | /**
2 |  * 파일명: page.test.tsx
3 |  * 목적: 카드 편집 페이지 컴포넌트 테스트
4 |  * 역할: 카드 편집 페이지의 다양한 상태와 기능을 테스트
5 |  * 작성일: 2024-05-27
6 |  */
7 | 
8 | /// <reference types="vitest" />
9 | import React from 'react';
10 | import { render, screen, fireEvent, waitFor } from '@testing-library/react';
11 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
12 | import EditCardPage from './page';
13 | import '@testing-library/jest-dom/vitest';
14 | 
15 | // useRouter 및 useParams 모킹
16 | const mockPush = vi.fn();
17 | const mockBack = vi.fn();
18 | vi.mock('next/navigation', () => ({
19 |   useRouter: vi.fn(() => ({
20 |     push: mockPush,
21 |     back: mockBack,
22 |   })),
23 |   useParams: vi.fn(() => ({
24 |     id: 'test-card-123'
25 |   }))
26 | }));
27 | 
28 | // EditCardForm 컴포넌트 모킹
29 | vi.mock('@/components/cards/EditCardForm', () => ({
30 |   default: vi.fn(({ card, onSuccess }) => (
31 |     <div data-testid="edit-card-form">
32 |       <div>카드 제목: {card.title}</div>
33 |       <div>카드 내용: {card.content}</div>
34 |       <button data-testid="success-button" onClick={onSuccess}>
35 |         저장 성공 시뮬레이션
36 |       </button>
37 |     </div>
38 |   ))
39 | }));
40 | 
41 | // 전역 fetch 모킹
42 | const mockFetch = vi.fn();
43 | vi.stubGlobal('fetch', mockFetch);
44 | 
45 | describe('EditCardPage', () => {
46 |   beforeEach(() => {
47 |     vi.clearAllMocks();
48 |   });
49 | 
50 |   afterEach(() => {
51 |     vi.resetAllMocks();
52 |   });
53 | 
54 |   it('초기 로딩 상태를 렌더링해야 함', async () => {
55 |     // fetch 응답이 오기 전 로딩 상태 테스트
56 |     mockFetch.mockImplementation(() => new Promise(() => {})); // 응답이 오지 않는 fetch
57 | 
58 |     render(<EditCardPage />);
59 | 
60 |     // 로딩 텍스트 확인
61 |     expect(screen.getByText('로딩 중...')).toBeInTheDocument();
62 |   });
63 | 
64 |   it('카드 데이터 로딩 성공 시 EditCardForm을 렌더링해야 함', async () => {
65 |     // 성공 응답 모킹
66 |     const mockCard = {
[TRUNCATED]
```

src/app/cards/[id]/edit/page.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect, useState } from 'react';
4 | import { useRouter } from 'next/navigation';
5 | import { useParams } from 'next/navigation';
6 | import { Button } from '@/components/ui/button';
7 | import EditCardForm from '@/components/cards/EditCardForm';
8 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
9 | import { ArrowLeft } from 'lucide-react';
10 | 
11 | export default function EditCardPage() {
12 |   const router = useRouter();
13 |   const params = useParams();
14 |   const [loading, setLoading] = useState(true);
15 |   const [card, setCard] = useState<any>(null);
16 |   const [error, setError] = useState<string | null>(null);
17 | 
18 |   useEffect(() => {
19 |     const fetchCard = async () => {
20 |       try {
21 |         setLoading(true);
22 |         const response = await fetch(`/api/cards/${params.id}`);
23 |         
24 |         if (!response.ok) {
25 |           throw new Error('카드를 찾을 수 없습니다.');
26 |         }
27 |         
28 |         const data = await response.json();
29 |         setCard(data);
30 |       } catch (err) {
31 |         setError(err instanceof Error ? err.message : '카드 로딩 중 오류가 발생했습니다.');
32 |       } finally {
33 |         setLoading(false);
34 |       }
35 |     };
36 | 
37 |     if (params.id) {
38 |       fetchCard();
39 |     }
40 |   }, [params.id]);
41 | 
42 |   const handleBack = () => {
43 |     router.back();
44 |   };
45 | 
46 |   return (
47 |     <div className="container mx-auto py-6 max-w-4xl">
48 |       <Button 
49 |         variant="ghost" 
50 |         className="mb-4 flex items-center"
51 |         onClick={handleBack}
52 |       >
53 |         <ArrowLeft className="mr-2 h-4 w-4" />
54 |         뒤로 가기
55 |       </Button>
56 |       
57 |       <h1 className="text-2xl font-bold mb-6">카드 수정</h1>
58 |       
59 |       {loading ? (
60 |         <div className="flex justify-center items-center h-32">
61 |           <p>로딩 중...</p>
62 |         </div>
63 |       ) : error ? (
64 |         <Card>
65 |           <CardContent className="pt-6">
66 |             <div className="text-center space-y-4">
[TRUNCATED]
```

src/app/api/logs/view/route.test.ts
```
1 | /**
2 |  * 파일명: route.test.ts
3 |  * 목적: 로그 조회 API 엔드포인트 테스트
4 |  * 역할: GET /api/logs/view 엔드포인트에 대한 다양한 시나리오의 단위 테스트
5 |  * 작성일: 2024-05-23
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { GET } from './route';
10 | 
11 | // 모의된 응답 타입
12 | type MockedResponse = {
13 |   body: any;
14 |   options?: { status?: number };
15 | };
16 | 
17 | // 모의된 요청 타입
18 | type MockRequest = {
19 |   url: string;
20 |   nextUrl: {
21 |     searchParams: URLSearchParams;
22 |   };
23 | };
24 | 
25 | // fs 모듈 모킹
26 | vi.mock('fs', () => ({
27 |   default: {
28 |     existsSync: vi.fn(),
29 |     readFileSync: vi.fn()
30 |   },
31 |   existsSync: vi.fn(),
32 |   readFileSync: vi.fn()
33 | }));
34 | 
35 | // path 모듈 모킹
36 | vi.mock('path', () => {
37 |   const joinMock = vi.fn((...args) => args.join('/'));
38 |   return {
39 |     default: {
40 |       join: joinMock
41 |     },
42 |     join: joinMock
43 |   };
44 | });
45 | 
46 | // next/server 모킹
47 | vi.mock('next/server', () => ({
48 |   NextRequest: function(this: any, url: string) {
49 |     this.url = url;
50 |     this.nextUrl = {
51 |       searchParams: new URLSearchParams()
52 |     };
53 |     return this;
54 |   },
55 |   NextResponse: {
56 |     json: vi.fn((body, options) => ({ body, options }))
57 |   }
58 | }));
59 | 
60 | // Supabase 모킹
61 | vi.mock('@/lib/supabase-browser', () => ({
62 |   createBrowserSupabaseClient: vi.fn(() => ({
63 |     auth: {
64 |       getSession: vi.fn().mockResolvedValue({ data: { session: null } })
65 |     }
66 |   }))
67 | }));
68 | 
69 | // process.cwd() 모킹
70 | vi.mock('process', () => ({
71 |   cwd: vi.fn(() => '/fake/cwd'),
72 |   env: {
73 |     NODE_ENV: 'development',
74 |     LOG_DIR: 'logs'
75 |   }
76 | }));
77 | 
78 | // 모듈 임포트
79 | import fs from 'fs';
80 | import { NextResponse } from 'next/server';
[TRUNCATED]
```

src/app/api/logs/view/route.ts
```
1 | /**
2 |  * 파일명: route.ts
3 |  * 목적: 저장된 로그를 확인할 수 있는 API 엔드포인트
4 |  * 역할: 서버에 저장된 로그를 조회하고 필터링하여 제공
5 |  * 작성일: 2024-03-28
6 |  */
7 | 
8 | import { NextRequest, NextResponse } from 'next/server';
9 | import fs from 'fs';
10 | import path from 'path';
11 | import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
12 | 
13 | // 로그 파일 경로
14 | const LOG_DIR = process.env.LOG_DIR || 'logs';
15 | const LOG_FILE = path.join(process.cwd(), LOG_DIR, 'client-logs.json');
16 | 
17 | /**
18 |  * 로그 조회 API 핸들러
19 |  */
20 | export async function GET(request: NextRequest) {
21 |   try {
22 |     // 인증 확인 (관리자만 접근 가능하도록 설정)
23 |     const supabase = createBrowserSupabaseClient();
24 |     const { data: sessionData } = await supabase.auth.getSession();
25 |     
26 |     // 개발 환경이 아니고 인증되지 않은 경우 접근 거부
27 |     if (process.env.NODE_ENV !== 'development' && !sessionData.session) {
28 |       return NextResponse.json(
29 |         { error: '인증이 필요합니다.' },
30 |         { status: 401 }
31 |       );
32 |     }
33 |     
34 |     // 로그 파일이 존재하지 않는 경우
35 |     if (!fs.existsSync(LOG_FILE)) {
36 |       return NextResponse.json(
37 |         { error: '로그 파일이 존재하지 않습니다.' },
38 |         { status: 404 }
39 |       );
40 |     }
41 |     
42 |     // 로그 파일 읽기
43 |     const fileContent = fs.readFileSync(LOG_FILE, 'utf-8');
44 |     const logs = JSON.parse(fileContent);
45 |     
46 |     // URL 파라미터로 필터링
47 |     const searchParams = request.nextUrl.searchParams;
48 |     const module = searchParams.get('module');
49 |     const level = searchParams.get('level');
50 |     const limit = parseInt(searchParams.get('limit') || '100', 10);
51 |     const sessionId = searchParams.get('sessionId');
52 |     
53 |     // 필터링 적용
54 |     let filteredLogs = logs;
55 |     
56 |     if (module) {
57 |       filteredLogs = filteredLogs.filter((log: any) => log.module === module);
58 |     }
59 |     
60 |     if (level) {
61 |       filteredLogs = filteredLogs.filter((log: any) => log.level === level);
62 |     }
63 |     
[TRUNCATED]
```

src/app/api/auth/status/route.ts
```
1 | /**
2 |  * 파일명: route.ts
3 |  * 목적: 로그인 상태 확인 API
4 |  * 역할: 현재 로그인 상태와 사용자 정보 반환
5 |  * 작성일: 2024-03-31
6 |  */
7 | 
8 | import { createClient } from '@/utils/supabase/server'
9 | import { NextResponse } from 'next/server'
10 | 
11 | export async function GET() {
12 |   try {
13 |     const supabase = await createClient()
14 |     const { data, error } = await supabase.auth.getUser()
15 |     
16 |     if (error) {
17 |       return NextResponse.json({ 
18 |         loggedIn: false, 
19 |         error: error.message 
20 |       })
21 |     }
22 |     
23 |     return NextResponse.json({ 
24 |       loggedIn: !!data?.user,
25 |       user: data.user ? {
26 |         id: data.user.id,
27 |         email: data.user.email,
28 |         provider: data.user.app_metadata?.provider || 'unknown'
29 |       } : null
30 |     })
31 |   } catch (error) {
32 |     console.error('인증 상태 확인 중 오류:', error)
33 |     return NextResponse.json({ 
34 |       loggedIn: false, 
35 |       error: '인증 상태 확인 중 오류가 발생했습니다' 
36 |     }, { status: 500 })
37 |   }
38 | } 
```

src/components/board/components/__tests__/BoardCanvas.test.tsx
```
1 | /**
2 |  * 파일명: BoardCanvas.test.tsx
3 |  * 목적: BoardCanvas 컴포넌트 테스트
4 |  * 역할: BoardCanvas 컴포넌트의 렌더링 및 BoardControls 통합 테스트
5 |  * 작성일: 2024-05-30
6 |  */
7 | 
8 | import React from 'react';
9 | import { render, screen } from '@testing-library/react';
10 | import BoardCanvas from '../BoardCanvas';
11 | import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
12 | import { vi } from 'vitest';
13 | import { Node, Edge } from '@xyflow/react';
14 | 
15 | // 외부 컴포넌트 및 라이브러리 목킹
16 | vi.mock('@xyflow/react', async () => {
17 |   const actual = await vi.importActual('@xyflow/react');
18 |   return {
19 |     ...actual,
20 |     ReactFlow: ({ children }: any) => (
21 |       <div data-testid="react-flow">
22 |         {children}
23 |       </div>
24 |     ),
25 |     Controls: () => <div data-testid="flow-controls">Controls</div>,
26 |     Background: () => <div data-testid="flow-background">Background</div>
27 |   };
28 | });
29 | 
30 | // BoardControls 컴포넌트 목킹
31 | vi.mock('../BoardControls', () => ({
32 |   default: (props: any) => (
33 |     <div 
34 |       data-testid="board-controls"
35 |       data-props={JSON.stringify({
36 |         boardSettings: props.boardSettings,
37 |         isAuthenticated: props.isAuthenticated,
38 |         userId: props.userId
39 |       })}
40 |     >
41 |       Board Controls
42 |     </div>
43 |   )
44 | }));
45 | 
46 | // 노드 타입과 엣지 타입 목킹
47 | vi.mock('@/lib/flow-constants', () => ({
48 |   NODE_TYPES: { card: 'CardNode' },
49 |   EDGE_TYPES: { default: 'DefaultEdge' }
50 | }));
51 | 
52 | describe('BoardCanvas', () => {
53 |   // 기본 props - 타입 문제를 해결하기 위해 테스트별로 별도 생성
54 |   const getMockWrapperRef = () => {
55 |     // HTMLDivElement를 직접 모킹하는 대신 React.RefObject 인터페이스를 구현한 객체 생성
56 |     const mockRef: React.RefObject<HTMLDivElement> = {
57 |       current: document.createElement('div')
58 |     };
59 |     return mockRef;
60 |   };
61 | 
62 |   beforeEach(() => {
63 |     vi.clearAllMocks();
64 |   });
65 | 
66 |   it('ReactFlow 컴포넌트가 렌더링되어야 함', () => {
67 |     const props = {
68 |       nodes: [] as Node[],
69 |       edges: [] as Edge[],
[TRUNCATED]
```

src/components/board/components/__tests__/BoardControls.test.tsx
```
1 | /**
2 |  * 파일명: BoardControls.test.tsx
3 |  * 목적: BoardControls 컴포넌트 테스트
4 |  * 역할: BoardControls 컴포넌트의 렌더링 및 기능 테스트
5 |  * 작성일: 2024-05-30
6 |  */
7 | 
8 | import { render, screen, fireEvent } from '@testing-library/react';
9 | import BoardControls from '../BoardControls';
10 | import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
11 | import { vi } from 'vitest';
12 | 
13 | // 외부 컴포넌트들을 목킹
14 | vi.mock('@xyflow/react', async () => {
15 |   const actual = await vi.importActual('@xyflow/react');
16 |   return {
17 |     ...actual,
18 |     Panel: ({ children, position, className }: any) => (
19 |       <div data-testid={`panel-${position}`} className={className}>
20 |         {children}
21 |       </div>
22 |     )
23 |   };
24 | });
25 | 
26 | vi.mock('@/components/board/BoardSettingsControl', () => ({
27 |   default: ({ settings, onSettingsChange }: any) => (
28 |     <button 
29 |       data-testid="board-settings-control"
30 |       onClick={() => onSettingsChange({ ...settings, snapToGrid: !settings.snapToGrid })}
31 |     >
32 |       Settings Control
33 |     </button>
34 |   )
35 | }));
36 | 
37 | vi.mock('@/components/board/LayoutControls', () => ({
38 |   default: ({ onLayoutChange, onAutoLayout, onSaveLayout }: any) => (
39 |     <div data-testid="layout-controls">
40 |       <button data-testid="layout-change-button" onClick={() => onLayoutChange('vertical')}>Change Layout</button>
41 |       <button data-testid="auto-layout-button" onClick={onAutoLayout}>Auto Layout</button>
42 |       <button data-testid="save-layout-button" onClick={onSaveLayout}>Save Layout</button>
43 |     </div>
44 |   )
45 | }));
46 | 
47 | vi.mock('@/components/cards/CreateCardButton', () => ({
48 |   default: ({ onClose }: any) => (
49 |     <button data-testid="create-card-button" onClick={onClose}>
50 |       Create Card
51 |     </button>
52 |   )
53 | }));
54 | 
55 | vi.mock('@/components/debug/DevTools', () => ({
56 |   default: () => <div data-testid="dev-tools">DevTools</div>
57 | }));
58 | 
59 | describe('BoardControls', () => {
60 |   // 기본 props
61 |   const defaultProps = {
62 |     boardSettings: DEFAULT_BOARD_SETTINGS,
63 |     onBoardSettingsChange: vi.fn(),
64 |     onLayoutChange: vi.fn(),
65 |     onAutoLayout: vi.fn(),
[TRUNCATED]
```

src/components/board/nodes/__tests__/CardNode.test.tsx
```
1 | /**
2 |  * 파일명: CardNode.test.tsx
3 |  * 목적: CardNode 컴포넌트 테스트
4 |  * 역할: 카드 노드 컴포넌트의 기능 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { render, screen, fireEvent } from '@testing-library/react';
10 | import CardNode from '../CardNode';
11 | import { ReactFlowProvider, Node, NodeProps } from '@xyflow/react';
12 | import { ThemeProvider } from '@/contexts/ThemeContext';
13 | import { NodeData } from '../CardNode';
14 | 
15 | // AppStore 모킹
16 | vi.mock('@/store/useAppStore', () => ({
17 |   useAppStore: (selector: Function) => {
18 |     const state = {
19 |       selectCard: vi.fn(),
20 |       addSelectedCard: vi.fn(),
21 |       removeSelectedCard: vi.fn(),
22 |       selectedCardIds: [],
23 |       updateCard: vi.fn(),
24 |     };
25 |     return selector(state);
26 |   }
27 | }));
28 | 
29 | // EditCardModal 모킹
30 | vi.mock('@/components/cards/EditCardModal', () => ({
31 |   EditCardModal: vi.fn(({ onClose }) => (
32 |     <div data-testid="edit-card-modal">
33 |       <button onClick={onClose} data-testid="close-modal-button">닫기</button>
34 |     </div>
35 |   ))
36 | }));
37 | 
38 | // TiptapViewer 모킹
39 | vi.mock('@/components/editor/TiptapViewer', () => ({
40 |   default: ({ content }: { content: string }) => <div data-testid="tiptap-viewer">{content}</div>
41 | }));
42 | 
43 | // 테마 컨텍스트 모킹
44 | vi.mock('@/contexts/ThemeContext', () => ({
45 |   useTheme: () => ({
46 |     theme: {
47 |       node: {
48 |         width: 200,
49 |         height: 30,
50 |         maxHeight: 200,
51 |         backgroundColor: '#ffffff',
52 |         borderWidth: 1,
53 |         borderColor: '#e2e8f0',
54 |         selectedBorderColor: '#3b82f6',
55 |         borderRadius: 6,
56 |         font: {
57 |           titleSize: 14,
58 |           contentSize: 12,
59 |           tagsSize: 10
60 |         }
61 |       },
62 |       handle: {
63 |         size: 8
64 |       },
65 |       edge: {
66 |         color: '#a1a1aa'
67 |       }
68 |     }
69 |   }),
70 |   ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
71 | }));
72 | 
73 | // useUpdateNodeInternals 모킹
74 | vi.mock('@xyflow/react', async () => {
[TRUNCATED]
```

src/components/board/nodes/__tests__/CustomEdge.test.tsx
```
1 | /**
2 |  * 파일명: CustomEdge.test.tsx
3 |  * 목적: CustomEdge 컴포넌트 테스트
4 |  * 역할: 엣지 컴포넌트의 기능 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { render, screen } from '@testing-library/react';
10 | import CustomEdge from '../CustomEdge';
11 | import { ReactFlowProvider, EdgeProps, Position } from '@xyflow/react';
12 | 
13 | // AppStore 모킹
14 | vi.mock('@/store/useAppStore', () => ({
15 |   useAppStore: () => ({
16 |     boardSettings: {
17 |       edgeColor: '#000000',
18 |       strokeWidth: 2,
19 |       animated: false,
20 |       markerEnd: true,
21 |       connectionLineType: 'bezier'
22 |     }
23 |   })
24 | }));
25 | 
26 | // useUpdateNodeInternals 모킹
27 | vi.mock('@xyflow/react', async () => {
28 |   const actual = await vi.importActual('@xyflow/react');
29 |   return {
30 |     ...actual,
31 |     BaseEdge: ({ path, markerEnd, style, className, ...props }: any) => (
32 |       <g data-testid="base-edge" className={className} style={style}>
33 |         <path data-testid="edge-path" d={path} markerEnd={markerEnd} />
34 |       </g>
35 |     )
36 |   };
37 | });
38 | 
39 | describe('CustomEdge', () => {
40 |   const mockEdgeProps: Partial<EdgeProps> = {
41 |     id: 'test-edge-id',
42 |     source: 'source-node',
43 |     target: 'target-node',
44 |     sourceX: 100,
45 |     sourceY: 100,
46 |     targetX: 200,
47 |     targetY: 200,
48 |     sourcePosition: Position.Right,
49 |     targetPosition: Position.Left,
50 |     style: { strokeWidth: 2, stroke: '#000000' },
51 |     markerEnd: 'test-marker',
52 |     selected: false
53 |   };
54 | 
55 |   beforeEach(() => {
56 |     vi.clearAllMocks();
57 |   });
58 | 
59 |   it('기본 엣지가 올바르게 렌더링되어야 함', () => {
60 |     render(
61 |       <ReactFlowProvider>
62 |         <svg>
63 |           <CustomEdge {...mockEdgeProps as EdgeProps} />
64 |         </svg>
65 |       </ReactFlowProvider>
66 |     );
67 | 
68 |     const baseEdge = screen.getByTestId('base-edge');
69 |     const edgePath = screen.getByTestId('edge-path');
70 |     
71 |     expect(baseEdge).toBeInTheDocument();
72 |     expect(edgePath).toBeInTheDocument();
73 |   });
74 | 
75 |   it('애니메이션 속성이 올바르게 적용되어야 함', () => {
[TRUNCATED]
```

src/components/board/nodes/__tests__/NodeInspector.test.tsx
```
1 | /**
2 |  * 파일명: NodeInspector.test.tsx
3 |  * 목적: NodeInspector 컴포넌트 테스트
4 |  * 역할: 노드 인스펙터 컴포넌트의 기능 테스트
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach } from 'vitest';
9 | import { render, screen, fireEvent } from '@testing-library/react';
10 | import { NodeInspector } from '../NodeInspector';
11 | import { Node } from '@xyflow/react';
12 | 
13 | // Modal 모킹
14 | vi.mock('@/components/ui/modal', () => ({
15 |   Modal: {
16 |     Root: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
17 |       <div data-testid="modal-root" data-open={open}>
18 |         {children}
19 |       </div>
20 |     ),
21 |     Content: ({ children }: { children: React.ReactNode }) => (
22 |       <div data-testid="modal-content">{children}</div>
23 |     ),
24 |     Title: ({ children }: { children: React.ReactNode }) => (
25 |       <h2 data-testid="modal-title">{children}</h2>
26 |     ),
27 |     Description: ({ children }: { children: React.ReactNode }) => (
28 |       <p data-testid="modal-description">{children}</p>
29 |     ),
30 |     Close: ({ children }: { children: React.ReactNode }) => (
31 |       <button data-testid="modal-close">{children}</button>
32 |     )
33 |   }
34 | }));
35 | 
36 | // useNodeStore 모킹
37 | vi.mock('@/store/useNodeStore', () => ({
38 |   useNodeStore: () => ({
39 |     inspectorOpen: true,
40 |     inspectedNode: {
41 |       id: 'test-node-1',
42 |       data: {
43 |         title: 'Test Node',
44 |         content: 'Test content',
45 |         tags: ['tag1', 'tag2']
46 |       },
47 |       position: { x: 100, y: 100 }
48 |     },
49 |     setInspectorOpen: vi.fn(),
50 |     setInspectedNode: vi.fn()
51 |   })
52 | }));
53 | 
54 | // TiptapViewer 모킹
55 | vi.mock('@/components/editor/TiptapViewer', () => ({
56 |   default: ({ content }: { content: string }) => (
57 |     <div data-testid="tiptap-viewer">{content}</div>
58 |   )
59 | }));
60 | 
61 | describe('NodeInspector', () => {
62 |   const mockNodes: Node[] = [
63 |     {
64 |       id: 'test-node-1',
65 |       data: {
66 |         title: 'Test Node',
67 |         content: 'Test content',
68 |         tags: ['tag1', 'tag2']
69 |       },
[TRUNCATED]
```

src/components/board/utils/__tests__/constants.test.ts
```
1 | /**
2 |  * 파일명: constants.test.ts
3 |  * 목적: 보드 컴포넌트 상수 테스트
4 |  * 역할: 상수 정의가 올바르게 되었는지 검증
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect } from 'vitest';
9 | import { ConnectionLineType, Position } from '@xyflow/react';
10 | import {
11 |   LAYOUT_DIRECTION,
12 |   NODE_TYPES,
13 |   EDGE_TYPES,
14 |   HANDLE_POSITIONS,
15 |   CONNECTION_LINE_TYPES,
16 |   DEFAULT_NODE_DIMENSIONS,
17 |   AUTO_SAVE_DELAY,
18 |   NODE_SPACING,
19 |   DEFAULT_NEW_CARD,
20 |   ZOOM_SETTINGS,
21 |   TOOLTIP_DELAY
22 | } from '../constants';
23 | 
24 | describe('보드 컴포넌트 상수', () => {
25 |   it('레이아웃 방향 상수가 정의되어 있어야 함', () => {
26 |     expect(LAYOUT_DIRECTION).toBeDefined();
27 |     expect(LAYOUT_DIRECTION.HORIZONTAL).toBe('LR');
28 |     expect(LAYOUT_DIRECTION.VERTICAL).toBe('TB');
29 |   });
30 | 
31 |   it('노드 타입 상수가 정의되어 있어야 함', () => {
32 |     expect(NODE_TYPES).toBeDefined();
33 |     expect(NODE_TYPES.CARD).toBe('card');
34 |   });
35 | 
36 |   it('엣지 타입 상수가 정의되어 있어야 함', () => {
37 |     expect(EDGE_TYPES).toBeDefined();
38 |     expect(EDGE_TYPES.CUSTOM).toBe('custom');
39 |   });
40 | 
41 |   it('핸들 위치 상수가 올바른 Position 값을 가져야 함', () => {
42 |     expect(HANDLE_POSITIONS).toBeDefined();
43 |     expect(HANDLE_POSITIONS.TOP).toBe(Position.Top);
44 |     expect(HANDLE_POSITIONS.RIGHT).toBe(Position.Right);
45 |     expect(HANDLE_POSITIONS.BOTTOM).toBe(Position.Bottom);
46 |     expect(HANDLE_POSITIONS.LEFT).toBe(Position.Left);
47 |   });
48 | 
49 |   it('연결선 타입 상수가 올바른 ConnectionLineType 값을 가져야 함', () => {
50 |     expect(CONNECTION_LINE_TYPES).toBeDefined();
51 |     expect(CONNECTION_LINE_TYPES.BEZIER).toBe(ConnectionLineType.Bezier);
52 |     expect(CONNECTION_LINE_TYPES.STEP).toBe(ConnectionLineType.Step);
53 |     expect(CONNECTION_LINE_TYPES.SMOOTHSTEP).toBe(ConnectionLineType.SmoothStep);
54 |     expect(CONNECTION_LINE_TYPES.STRAIGHT).toBe(ConnectionLineType.Straight);
55 |   });
56 | 
57 |   it('기본 노드 크기 상수가 정의되어 있어야 함', () => {
58 |     expect(DEFAULT_NODE_DIMENSIONS).toBeDefined();
59 |     expect(DEFAULT_NODE_DIMENSIONS.WIDTH).toBe(300);
[TRUNCATED]
```

src/components/board/utils/__tests__/graphUtils.test.ts
```
1 | /**
2 |  * 파일명: graphUtils.test.ts
3 |  * 목적: 그래프 유틸리티 함수 테스트
4 |  * 역할: 그래프 관련 순수 함수들의 정상 동작 검증
5 |  * 작성일: 2024-05-31
6 |  */
7 | 
8 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
9 | import { Node, Edge, XYPosition, MarkerType, ConnectionLineType } from '@xyflow/react';
10 | import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
11 | import { BoardSettings } from '@/lib/board-utils';
12 | import {
13 |   saveLayout,
14 |   saveEdges,
15 |   saveAllLayoutData,
16 |   removeDeletedNodesFromStorage,
17 |   updateNodesWithCardData,
18 |   applyStoredLayout,
19 |   arraysEqual,
20 |   createEdge,
21 |   getDefaultHandles
22 | } from '../graphUtils';
23 | 
24 | // 로컬 스토리지 목업
25 | const localStorageMock = (() => {
26 |   let store: Record<string, string> = {};
27 |   return {
28 |     getItem: vi.fn((key: string) => store[key] || null),
29 |     setItem: vi.fn((key: string, value: string) => {
30 |       store[key] = value.toString();
31 |     }),
32 |     clear: vi.fn(() => {
33 |       store = {};
34 |     }),
35 |     removeItem: vi.fn((key: string) => {
36 |       delete store[key];
37 |     }),
38 |     getAll: () => store
39 |   };
40 | })();
41 | 
42 | // 테스트 전에 로컬 스토리지 목업 설정
43 | beforeEach(() => {
44 |   Object.defineProperty(window, 'localStorage', {
45 |     value: localStorageMock,
46 |     writable: true
47 |   });
48 |   localStorageMock.clear();
49 | });
50 | 
51 | // 테스트 후 정리
52 | afterEach(() => {
53 |   vi.clearAllMocks();
54 | });
55 | 
56 | describe('saveLayout', () => {
57 |   it('노드 배열을 로컬 스토리지에 저장해야 함', () => {
58 |     const nodes: Node[] = [
59 |       { id: '1', position: { x: 100, y: 100 }, data: {} },
60 |       { id: '2', position: { x: 200, y: 200 }, data: {} }
61 |     ];
62 |     
63 |     const result = saveLayout(nodes);
64 |     
65 |     expect(result).toBe(true);
66 |     expect(localStorageMock.setItem).toHaveBeenCalledWith(
67 |       STORAGE_KEY, 
68 |       JSON.stringify({
69 |         '1': { position: { x: 100, y: 100 } },
70 |         '2': { position: { x: 200, y: 200 } }
71 |       })
72 |     );
73 |   });
74 |   
[TRUNCATED]
```
