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
17 | };
18 | 
19 | export default nextConfig;
```

package.json
```
1 | {
2 |   "name": "backyard",
3 |   "version": "0.1.0",
4 |   "private": true,
5 |   "license": "MIT",
6 |   "scripts": {
7 |     "dev": "yarn env:dev && yarn db:setup:dev && NODE_ENV=development next dev",
8 |     "prebuild": "node scripts/pre-deploy.js",
9 |     "build": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
10 |     "build:local": "NODE_ENV=production yarn db:setup:prod && prisma generate && next build",
11 |     "start": "NODE_ENV=production next start",
12 |     "lint": "next lint",
13 |     "test": "vitest",
14 |     "test:run": "vitest run",
15 |     "test:watch": "vitest --watch",
16 |     "test:coverage": "vitest run --coverage",
17 |     "prisma:seed": "node prisma/seed/index.js",
18 |     "prisma:push": "prisma db push",
19 |     "prisma:generate": "prisma generate",
20 |     "schema:sync": "node scripts/schema-sync.js",
21 |     "pre-deploy": "node scripts/pre-deploy.js",
22 |     "db:setup": "node scripts/select-db.js && npx prisma generate",
23 |     "db:setup:dev": "NODE_ENV=development node scripts/select-db.js && npx prisma generate",
24 |     "db:setup:prod": "NODE_ENV=production node scripts/select-db.js && npx prisma generate",
25 |     "db:test": "node scripts/test-db.js",
26 |     "env:dev": "vercel env pull .env.development",
27 |     "env:prod": "vercel env pull .env.production",
28 |     "deploy": "yarn env:prod && vercel --prod",
29 |     "deploy:preview": "yarn env:prod && vercel"
30 |   },
31 |   "dependencies": {
32 |     "@auth/core": "^0.38.0",
33 |     "@auth/prisma-adapter": "^2.8.0",
34 |     "@hookform/resolvers": "^4.1.2",
35 |     "@prisma/client": "^6.4.1",
36 |     "@radix-ui/react-alert-dialog": "^1.1.6",
37 |     "@radix-ui/react-dialog": "^1.1.6",
38 |     "@radix-ui/react-dropdown-menu": "^2.1.6",
39 |     "@radix-ui/react-label": "^2.1.2",
40 |     "@radix-ui/react-slot": "^1.1.2",
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
1 | import { defineConfig } from 'vitest/config';
2 | // @ts-ignore - 타입 문제 해결
3 | import react from '@vitejs/plugin-react';
4 | import path from 'path';
5 | 
6 | export default defineConfig({
7 |   plugins: [react()],
8 |   test: {
9 |     environment: 'jsdom',
10 |     setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],
11 |     include: ['**/*.test.{ts,tsx}'],
12 |     globals: true,
13 |     server: {
14 |       deps: {
15 |         inline: [
16 |           '@testing-library/jest-dom',
17 |           '@testing-library/user-event',
18 |           '@testing-library/react'
19 |         ]
20 |       }
21 |     },
22 |     coverage: {
23 |       reporter: ['text', 'html'],
24 |       exclude: [
25 |         'node_modules/**',
26 |         '**/.next/**',
27 |         '**/scripts/**',
28 |         '**/eslint.config.mjs',
29 |         '**/next.config.ts',
30 |         '**/postcss.config.mjs',
31 |         '**/next-env.d.ts',
32 |         '**/vitest.config.ts',
33 |         '**/src/components/ui/**', // shadcn UI 컴포넌트 제외
34 |         '**/jest.setup.js',
35 |         '**/jest.config.js',
36 |         '**/tailwind.config.js',
37 |         '**/src/lib/prisma.ts' // Prisma 클라이언트 설정 파일 제외
38 |       ],
39 |       include: ['src/**/*.{ts,tsx}'],
40 |       all: true,
41 |       thresholds: {
42 |         lines: 0,
43 |         functions: 0,
44 |         branches: 0,
45 |         statements: 0
46 |       }
47 |     }
48 |   },
49 |   resolve: {
50 |     alias: {
51 |       '@': path.resolve(__dirname, 'src'),
52 |       '@/components': path.resolve(__dirname, 'src/components'),
53 |       '@/lib': path.resolve(__dirname, 'src/lib'),
54 |       '@/app': path.resolve(__dirname, 'src/app'),
55 |       '@/utils': path.resolve(__dirname, 'src/utils'),
56 |       '@/hooks': path.resolve(__dirname, 'src/hooks')
57 |     }
58 |   }
59 | }); 
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
[TRUNCATED]
```

.note/tasklist_css_refactorying.txt
```
1 | # 프로젝트 CSS 구조 개선 및 통합
2 | 
3 | 1. **전체 CSS 관련 파일 및 스타일 소스 식별**  
4 |    - [ ] 1.1 글로벌 CSS 파일 (src/app/globals.css) 내 디자인 토큰, Tailwind 기본 레이어, React Flow 오버라이드 스타일 식별  
5 |    - [ ] 1.2 UI 설정 파일 (src/config/cardBoardUiOptions.json) 내 스타일 관련 상수 값 파악  
6 |    - [ ] 1.3 각 컴포넌트 내에 인라인으로 적용된 CSS 코드 식별  
7 |    - [ ] 1.4 서드파티 라이브러리(React Flow 등)의 기본 스타일과 오버라이드 내용 식별  
8 | 
9 | 2. **중복 스타일 제거 및 Shadcn 스타일 네이밍 통합**  
10 |    - [ ] 2.1 cardBoardUiOptions.json 설정 값과 globals.css에 중복 정의된 값(예: 카드 배경색, border-radius, handle 크기 등) 통합 -> cardBoardUiOptions.json은 UI 레이아웃이나 동작 설정 전용으로 사용  
11 |    - [ ] 2.2 선택 상태(카드 선택, 엣지 선택) 관련 스타일 통일 및 불일치 항목 수정  
12 |    - [ ] 2.3 공통 색상/크기 값(예: edgeColor, selectedEdgeColor, handle 크기)을 전역 CSS 변수로 정의 및 적용  
13 |    - [ ] 2.4 Shadcn UI 디자인 가이드에 맞는 네이밍 적용 (예: --primary, --secondary 등)  
14 | 
15 | 3. **글로벌 CSS에서 모든 Primitive 스타일 통합 관리**  
16 |    - [ ] 3.1 디자인 토큰(색상, 폰트 크기, radius 등)을 globals.css :root 영역에 일원화  
17 |    - [ ] 3.2 컴포넌트별 공통 스타일(예: 카드 헤더, 카드 콘텐츠, 태그 등)을 글로벌 CSS 클래스로 정의  
18 |    - [ ] 3.3 Tailwind 유틸리티 클래스와 CSS 변수 간의 연계 작업 완료  
19 | 
20 | 4. **Inline CSS 정리 및 남는 항목 관리**  
21 |    - [ ] 4.1 컴포넌트 내 인라인 스타일을 글로벌 CSS 또는 Tailwind 유틸리티 클래스로 전환  
22 |    - [ ] 4.2 동적으로 계산되는 스타일(예: 카드 크기, 폰트 크기 등)은 별도 목록으로 문서화  
23 |    - [ ] 4.3 정리되지 못한 인라인 CSS 목록 작성 및 보고
24 | 
25 | 5. **CSS 파일 및 컴포넌트 관계 ASCII 다이어그램 작성**  
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
[TRUNCATED]
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

src/middleware.ts
```
1 | import { NextResponse } from 'next/server';
2 | import type { NextRequest } from 'next/server';
3 | import { createServerClient } from '@supabase/ssr';
4 | 
5 | // 보호된 경로 (로그인 필요)
6 | const protectedRoutes = ['/board', '/cards', '/tags'];
7 | // 인증된 사용자는 접근할 수 없는 경로
8 | const authRoutes = ['/login', '/register'];
9 | // 인증 검사를 건너뛸 경로
10 | const bypassAuthRoutes = ['/login', '/register', '/auth/callback', '/api/auth'];
11 | 
12 | export async function middleware(request: NextRequest) {
13 |   console.log('미들웨어 실행:', request.nextUrl.pathname);
14 |   
15 |   // 응답 객체 준비
16 |   let response = NextResponse.next({
17 |     request: {
18 |       headers: request.headers,
19 |     },
20 |   });
21 |   
22 |   // 쿠키 확인 디버깅
23 |   const cookies = request.cookies;
24 |   const accessToken = cookies.get('sb-access-token')?.value;
25 |   const refreshToken = cookies.get('sb-refresh-token')?.value;
26 |   
27 |   console.log('인증 상태 확인:', {
28 |     path: request.nextUrl.pathname,
29 |     액세스토큰: accessToken ? '존재함' : '없음',
30 |     리프레시토큰: refreshToken ? '존재함' : '없음',
31 |     모든쿠키: Array.from(cookies.getAll()).map(c => c.name)
32 |   });
33 |   
34 |   // 환경 변수 확인
35 |   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
36 |   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
37 |   
38 |   if (!supabaseUrl || !supabaseKey) {
39 |     console.warn('미들웨어: Supabase 환경 변수가 설정되지 않았습니다.');
40 |     return response;
41 |   }
42 |   
43 |   try {
44 |     // OAuth 콜백 경로인 경우 우회
45 |     if (request.nextUrl.pathname === '/auth/callback') {
46 |       console.log('콜백 처리 감지 - 미들웨어 우회');
47 |       return response;
48 |     }
49 |     
50 |     // 루트 경로에서 code 파라미터가 있는 경우 (링크를 통한 접근)
51 |     if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
52 |       const code = request.nextUrl.searchParams.get('code');
[TRUNCATED]
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

prisma/migrations/migration_lock.toml
```
1 | # Please do not edit this file manually
2 | # It should be added in your version-control system (e.g., Git)
3 | provider = "sqlite"
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
16 |   --background: oklch(1 0 0);
17 |   --foreground: oklch(0.129 0.042 264.695);
18 |   --card: oklch(1 0 0);
19 |   --card-foreground: oklch(0.129 0.042 264.695);
20 |   --popover: oklch(1 0 0);
21 |   --popover-foreground: oklch(0.129 0.042 264.695);
22 |   --primary: oklch(0.208 0.042 265.755);
23 |   --primary-foreground: oklch(0.984 0.003 247.858);
24 |   --secondary: oklch(0.968 0.007 247.896);
25 |   --secondary-foreground: oklch(0.208 0.042 265.755);
26 |   --muted: oklch(0.968 0.007 247.896);
27 |   --muted-foreground: oklch(0.554 0.046 257.417);
28 |   --accent: oklch(0.968 0.007 247.896);
29 |   --accent-foreground: oklch(0.208 0.042 265.755);
30 |   --destructive: oklch(0.577 0.245 27.325);
31 |   --destructive-foreground: oklch(0.577 0.245 27.325);
32 |   --border: oklch(0.929 0.013 255.508);
33 |   --input: oklch(0.929 0.013 255.508);
34 |   --ring: oklch(0.869 0.022 252.894);
35 |   --chart-1: oklch(0.646 0.222 41.116);
36 |   --chart-2: oklch(0.6 0.118 184.704);
37 |   --chart-3: oklch(0.398 0.07 227.392);
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
1 | 'use client';
2 | 
3 | import { AuthProvider } from "@/contexts/AuthContext";
4 | import { Toaster } from "sonner";
5 | import { InitDatabase } from "@/components/InitDatabase";
6 | import "@/app/globals.css";
7 | // reactflow 스타일 버그 픽스 
8 | // import "@xyflow/react/dist/style.css";
9 | 
10 | export default function RootLayout({
11 |   children,
12 | }: {
13 |   children: React.ReactNode;
14 | }) {
15 |   return (
16 |     <html lang="ko">
17 |       <body className="antialiased" suppressHydrationWarning>
18 |         <AuthProvider>
19 |           <main>
20 |             {children}
21 |             
22 |             {/* DB 초기화 스크립트 */}
23 |             <InitDatabase />
24 |           </main>
25 |           <Toaster position="top-center" />
26 |         </AuthProvider>
27 |       </body>
28 |     </html>
29 |   );
30 | }
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
27 |     "size": 12,
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
1 | 'use client';
2 | 
3 | import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
4 | import { User } from '@supabase/supabase-js';
5 | import { getCurrentUser, signOut } from '@/lib/auth';
6 | import { createBrowserClient } from '@/lib/supabase';
7 | 
8 | // 확장된 사용자 타입 정의
9 | export interface ExtendedUser extends User {
10 |   dbUser?: any; // Prisma User 모델
11 | }
12 | 
13 | type AuthContextType = {
14 |   user: ExtendedUser | null;
15 |   userDetails: any; // Prisma User 모델 타입
16 |   isLoading: boolean;
17 |   isAuthenticated: boolean;
18 |   logout: () => Promise<void>;
19 | };
20 | 
21 | const AuthContext = createContext<AuthContextType>({
22 |   user: null,
23 |   userDetails: null,
24 |   isLoading: true,
25 |   isAuthenticated: false,
26 |   logout: async () => {},
27 | });
28 | 
29 | export const useAuth = () => useContext(AuthContext);
30 | 
31 | export function AuthProvider({ children }: { children: ReactNode }) {
32 |   const [user, setUser] = useState<ExtendedUser | null>(null);
33 |   const [userDetails, setUserDetails] = useState<any>(null);
34 |   const [isLoading, setIsLoading] = useState(true);
35 | 
36 |   // 사용자 데이터베이스 동기화 함수
37 |   const syncUserWithDatabase = async (supabaseUser: User) => {
38 |     try {
39 |       if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
40 |         console.warn('사용자 동기화 실패: 유효하지 않은 사용자 데이터');
41 |         return null;
42 |       }
43 | 
44 |       // 타임아웃 설정
45 |       const controller = new AbortController();
46 |       const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
47 | 
48 |       try {
49 |         // 로컬 데이터베이스에 사용자 등록/확인
50 |         const response = await fetch('/api/user/register', {
51 |           method: 'POST',
52 |           headers: { 'Content-Type': 'application/json' },
53 |           body: JSON.stringify({
54 |             id: supabaseUser.id,
55 |             email: supabaseUser.email,
56 |             name: supabaseUser.user_metadata?.full_name || 
57 |                   supabaseUser.user_metadata?.name || 
[TRUNCATED]
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
[TRUNCATED]
```

src/lib/auth.ts
```
1 | 'use client';
2 | 
3 | import { createBrowserClient } from './supabase';
4 | import { deleteCookie } from 'cookies-next';
5 | import { User } from '@supabase/supabase-js';
6 | 
7 | // 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
8 | export const getBrowserClient = () => {
9 |   if (typeof window === 'undefined') {
10 |     throw new Error('브라우저 환경에서만 사용 가능합니다.');
11 |   }
12 |   
13 |   // createBrowserSupabaseClient 대신 createBrowserClient 사용
14 |   return createBrowserClient();
15 | };
16 | 
17 | // ExtendedUser 타입 정의
18 | export interface ExtendedUser extends User {
19 |   dbUser?: any; // Prisma User 모델
20 | }
21 | 
22 | // 회원가입 함수
23 | export async function signUp(email: string, password: string, name: string | null = null) {
24 |   try {
25 |     // Supabase 인증으로 사용자 생성
26 |     const client = getBrowserClient();
27 |     const { data: authData, error: authError } = await client.auth.signUp({
28 |       email,
29 |       password,
30 |     });
31 | 
32 |     if (authError) {
33 |       throw authError;
34 |     }
35 | 
36 |     if (!authData.user) {
37 |       throw new Error('사용자 생성 실패');
38 |     }
39 | 
40 |     // API를 통해 사용자 데이터 생성
41 |     try {
42 |       const response = await fetch('/api/user/register', {
43 |         method: 'POST',
44 |         headers: {
45 |           'Content-Type': 'application/json',
46 |         },
47 |         body: JSON.stringify({
48 |           id: authData.user.id,
49 |           email: authData.user.email || email,
50 |           name: name || email.split('@')[0],
51 |         }),
52 |       });
53 | 
54 |       if (!response.ok) {
55 |         console.warn('사용자 DB 정보 저장 실패:', await response.text());
56 |       }
57 |     } catch (dbError) {
58 |       console.error('사용자 DB 정보 API 호출 오류:', dbError);
59 |     }
60 | 
61 |     return { user: authData.user, authData };
62 |   } catch (error) {
63 |     console.error('회원가입 실패:', error);
64 |     throw error;
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

src/lib/flow-constants.ts
```
1 | /**
2 |  * React Flow 관련 상수 정의
3 |  * 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
4 |  */
5 | 
6 | import CardNode from '@/components/board/CardNode';
7 | import CustomEdge from '@/components/board/CustomEdge';
8 | import { NodeInspect } from '@/components/debug/NodeInspector';
9 | 
10 | // 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
11 | export const NODE_TYPES = Object.freeze({
12 |   card: CardNode,
13 |   nodeInspect: NodeInspect,
14 | });
15 | 
16 | // 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
17 | export const EDGE_TYPES = Object.freeze({
18 |   custom: CustomEdge,
19 | }); 
```

src/lib/layout-utils.ts
```
1 | import dagre from 'dagre';
2 | import { Node, Edge, Position } from '@xyflow/react';
3 | import defaultConfig from '../config/cardBoardUiOptions.json';
4 | 
5 | // 노드 크기 설정 - 설정 파일에서 일관되게 가져오기
6 | const NODE_WIDTH = defaultConfig.layout.nodeSize?.width || 130; // layout.nodeSize에서 가져오기
7 | const NODE_HEIGHT = defaultConfig.layout.nodeSize?.height || 48;
8 | 
9 | // 그래프 간격 설정 - 설정 파일에서 가져오기
10 | const GRAPH_SETTINGS = {
11 |   rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
12 |   nodesep: defaultConfig.layout.graphSettings.nodesep, // 같은 레벨의 노드 간 거리 (픽셀)
13 |   ranksep: defaultConfig.layout.graphSettings.ranksep, // 레벨 간 거리 (픽셀)
14 |   edgesep: defaultConfig.layout.graphSettings.edgesep, // 엣지 간 거리
15 |   marginx: defaultConfig.layout.defaultPadding || 20, // 가로 마진은 defaultPadding 사용
16 |   marginy: defaultConfig.layout.defaultPadding || 20  // 세로 마진은 defaultPadding 사용
17 | };
18 | 
19 | /**
20 |  * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
21 |  * 
22 |  * @param nodes 노드 배열
23 |  * @param edges 엣지 배열
24 |  * @param direction 배치 방향 ('horizontal' 또는 'vertical')
25 |  * @returns 레이아웃이 적용된 노드와 엣지
26 |  */
27 | export function getLayoutedElements(
28 |   nodes: Node[],
29 |   edges: Edge[],
30 |   direction: 'horizontal' | 'vertical' = 'horizontal'
31 | ) {
32 |   // 노드나 엣지가 없는 경우 그대로 반환
33 |   if (nodes.length === 0) return { nodes, edges };
34 | 
35 |   // 그래프 생성
36 |   const dagreGraph = new dagre.graphlib.Graph();
37 |   dagreGraph.setDefaultEdgeLabel(() => ({}));
38 | 
39 |   // 방향 설정 (LR: 왼쪽에서 오른쪽, TB: 위에서 아래)
40 |   const isHorizontal = direction === 'horizontal';
41 |   const settings = {
42 |     ...GRAPH_SETTINGS,
43 |     rankdir: isHorizontal ? 'LR' : 'TB',
44 |   };
45 |   
46 |   dagreGraph.setGraph(settings);
47 | 
48 |   // 노드 추가
49 |   nodes.forEach(node => {
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
[TRUNCATED]
```

src/lib/supabase-browser.ts
```
1 | 'use client';
2 | 
3 | import { createBrowserClient } from '@supabase/ssr';
4 | import { Database } from '../types/supabase';
5 | 
6 | let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;
7 | 
8 | export function createBrowserSupabaseClient() {
9 |   // 이미 생성된 클라이언트가 있으면 재사용
10 |   if (supabaseBrowserClient) {
11 |     return supabaseBrowserClient;
12 |   }
13 |   
14 |   // 디버깅: 로컬 스토리지 상태 확인
15 |   if (typeof window !== 'undefined') {
16 |     const verifier = localStorage.getItem('supabase.auth.code_verifier');
17 |     console.log('[Supabase] 클라이언트 생성 전 code_verifier 상태:', 
18 |       verifier ? `존재함 (길이: ${verifier.length})` : '없음');
19 |     
20 |     // 로컬 스토리지의 모든 키 출력 (디버깅용)
21 |     console.log('[Supabase] 로컬 스토리지 키:', 
22 |       Object.keys(localStorage).filter(key => key.startsWith('supabase')));
23 |   }
24 |   
25 |   // 공식 문서에 따른 기본 설정으로 클라이언트 생성
26 |   supabaseBrowserClient = createBrowserClient<Database>(
27 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
28 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
29 |     {
30 |       auth: {
31 |         persistSession: true,
32 |         detectSessionInUrl: true,
33 |         autoRefreshToken: true
34 |       }
35 |     }
36 |   );
37 |   
38 |   console.log('[Supabase] 브라우저 클라이언트 생성 완료');
39 |   
40 |   // 디버깅: 클라이언트 생성 후 로컬 스토리지 상태 확인
41 |   if (typeof window !== 'undefined') {
42 |     const verifier = localStorage.getItem('supabase.auth.code_verifier');
43 |     console.log('[Supabase] 클라이언트 생성 후 code_verifier 상태:', 
44 |       verifier ? `존재함 (길이: ${verifier.length})` : '없음');
45 |   }
46 |   
47 |   return supabaseBrowserClient;
48 | } 
```

src/lib/supabase-server.ts
```
1 | import { createServerClient } from '@supabase/ssr';
2 | import { cookies } from 'next/headers';
3 | import { Database } from '../types/supabase';
4 | 
5 | export async function createServerSupabaseClient() {
6 |   const cookieStore = cookies();
7 |   
8 |   return createServerClient<Database>(
9 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
10 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
11 |     {
12 |       cookies: {
13 |         get(name: string) {
14 |           return cookieStore.get(name)?.value;
15 |         },
16 |         set(name: string, value: string, options: any) {
17 |           cookieStore.set(name, value, options);
18 |         },
19 |         remove(name: string, options: any) {
20 |           cookieStore.set(name, '', { ...options, maxAge: 0 });
21 |         },
22 |       },
23 |     }
24 |   );
25 | } 
```

src/lib/supabase.ts
```
1 | import { createClient } from '@supabase/supabase-js';
2 | 
3 | // 싱글톤 인스턴스를 위한 변수
4 | let browserClientInstance: ReturnType<typeof createClient> | null = null;
5 | let serverClientInstance: ReturnType<typeof createClient> | null = null;
6 | 
7 | // 환경 변수 확인
8 | const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
9 | const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
10 | 
11 | // Next.js 서버 컴포넌트 및 API 라우트용 Supabase 클라이언트
12 | export const createSupabaseClient = () => {
13 |   if (typeof window !== 'undefined') {
14 |     console.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
15 |   }
16 |   
17 |   // 이미 생성된 인스턴스가 있으면 재사용
18 |   if (serverClientInstance) {
19 |     return serverClientInstance;
20 |   }
21 |   
22 |   // 정적 렌더링 및 개발 환경을 위한 안전한 클라이언트 생성
23 |   if (!supabaseUrl || !supabaseKey) {
24 |     console.warn('Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인하세요.');
25 |     
26 |     // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트
27 |     return {
28 |       auth: {
29 |         getSession: () => Promise.resolve({ data: { session: null }, error: null }),
30 |         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
31 |         signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
32 |       },
33 |       from: () => ({ select: () => ({ data: [], error: null }) }),
34 |     } as any;
35 |   }
36 |   
37 |   try {
38 |     serverClientInstance = createClient(
39 |       supabaseUrl,
40 |       supabaseKey,
41 |       {
42 |         auth: {
43 |           flowType: 'pkce',
44 |           autoRefreshToken: false,
45 |           persistSession: false,
46 |           detectSessionInUrl: false
47 |         }
48 |       }
49 |     );
50 |     
51 |     return serverClientInstance;
52 |   } catch (error) {
53 |     console.error('Supabase 서버 클라이언트 생성 실패:', error);
54 |     return {
55 |       auth: {
56 |         getSession: () => Promise.resolve({ data: { session: null }, error: null }),
57 |         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
58 |       },
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
16 |   // 선택된 카드 상태
17 |   selectedCardId: string | null; // 이전 단일 선택 방식 (하위 호환성 유지)
18 |   selectCard: (cardId: string | null) => void; // 이전 단일 선택 방식 (하위 호환성 유지)
19 |   
20 |   // 다중 선택 카드 상태
21 |   selectedCardIds: string[];
22 |   selectCards: (cardIds: string[]) => void;
23 |   addSelectedCard: (cardId: string) => void;
24 |   removeSelectedCard: (cardId: string) => void;
25 |   toggleSelectedCard: (cardId: string) => void;
26 |   clearSelectedCards: () => void;
27 |   
28 |   // 카드 데이터 상태
29 |   cards: Card[]; // 현재 로드된 카드 목록
30 |   setCards: (cards: Card[]) => void; // 카드 목록 설정
31 |   updateCard: (updatedCard: Card) => void; // 단일 카드 업데이트
32 |   
33 |   // 사이드바 상태
34 |   isSidebarOpen: boolean;
35 |   setSidebarOpen: (open: boolean) => void;
36 |   toggleSidebar: () => void;
37 |   
38 |   // 레이아웃 옵션 (수평/수직/자동배치/없음)
39 |   layoutDirection: 'horizontal' | 'vertical' | 'auto' | 'none';
40 |   setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | 'none') => void;
41 |   
42 |   // 사이드바 너비
43 |   sidebarWidth: number;
44 |   setSidebarWidth: (width: number) => void;
45 |   
46 |   // 보드 설정
47 |   boardSettings: BoardSettings;
48 |   setBoardSettings: (settings: BoardSettings) => void;
49 |   updateBoardSettings: (settings: Partial<BoardSettings>) => void;
50 |   
51 |   // React Flow 인스턴스
52 |   reactFlowInstance: ReactFlowInstance | null;
53 |   setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
54 | }
55 | 
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
[TRUNCATED]
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
[TRUNCATED]
```

src/app/board/page.test.tsx
```
1 | import { render, screen, waitFor, fireEvent } from '@testing-library/react';
2 | import { describe, test, expect, vi, beforeEach } from 'vitest';
3 | import BoardPage from './page';
4 | import { Node, Edge, NodeChange } from '@xyflow/react';
5 | 
6 | // LocalStorage 모킹
7 | const localStorageMock = (() => {
8 |   let store: Record<string, string> = {};
9 |   return {
10 |     getItem: vi.fn((key: string) => store[key] || null),
11 |     setItem: vi.fn((key: string, value: string) => {
12 |       store[key] = value.toString();
13 |     }),
14 |     clear: vi.fn(() => {
15 |       store = {};
16 |     }),
17 |   };
18 | })();
19 | 
20 | Object.defineProperty(window, 'localStorage', {
21 |   value: localStorageMock,
22 | });
23 | 
24 | // ResizeObserver 모킹 (ReactFlow에서 필요)
25 | class ResizeObserverMock {
26 |   observe = vi.fn();
27 |   unobserve = vi.fn();
28 |   disconnect = vi.fn();
29 | }
30 | 
31 | global.ResizeObserver = ResizeObserverMock;
32 | 
33 | // React Flow의 applyNodeChanges 함수 결과를 모킹하기 위한 변수
34 | let mockAppliedNodes: Node[] = [];
35 | 
36 | // ReactFlow 전체 모킹 - 테스트에서는 실제 렌더링 없이 모킹된 구성요소만 사용
37 | const nodesMock: Node[] = [];
38 | const edgesMock: Edge[] = [];
39 | const setNodesMock = vi.fn();
40 | const setEdgesMock = vi.fn();
41 | const onNodesChangeMock = vi.fn();
42 | const onEdgesChangeMock = vi.fn();
43 | 
44 | // viewportCenter 모킹 - getNewCardPosition에서 사용
45 | const viewportCenterMock = { x: 500, y: 300 };
46 | 
47 | // ReactFlow의 ReactFlowProvider와 useReactFlow hook 모킹
48 | vi.mock('reactflow', () => {
49 |   // ReactFlow 컴포넌트 모킹
50 |   const ReactFlowMock = ({ children, onNodesChange }: { children?: React.ReactNode, onNodesChange?: (changes: NodeChange[]) => void }) => (
51 |     <div 
52 |       data-testid="react-flow-mock"
53 |       onClick={() => {
54 |         // 노드 위치 변경 시뮬레이션
55 |         if (onNodesChange) {
56 |           onNodesChange([{
[TRUNCATED]
```

src/app/board/page.tsx
```
1 | 'use client';
2 | 
3 | import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
4 | import {
5 |   ReactFlow,
6 |   Controls,
7 |   Background,
8 |   useNodesState,
9 |   useEdgesState,
10 |   addEdge,
11 |   Panel,
12 |   ConnectionLineType,
13 |   Position,
14 |   MarkerType,
15 |   useReactFlow,
16 |   useUpdateNodeInternals,
17 |   Node,
18 |   Edge,
19 |   ReactFlowProvider,
20 |   NodeChange,
21 |   EdgeChange,
22 |   Connection,
23 |   applyNodeChanges,
24 |   OnConnectStart,
25 |   OnConnectEnd,
26 |   XYPosition
27 | } from '@xyflow/react';
28 | // reactflow 스타일 버그 픽스 
29 | // import '@xyflow/react/dist/style.css';
30 | import { Button } from '@/components/ui/button';
31 | import { Loader2, Save, LayoutGrid } from 'lucide-react';
32 | import { toast } from 'sonner';
33 | import CreateCardButton from '@/components/cards/CreateCardButton';
34 | import LayoutControls from '@/components/board/LayoutControls';
35 | import BoardSettingsControl from '@/components/board/BoardSettingsControl';
36 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
37 | import { 
38 |   BoardSettings, 
39 |   DEFAULT_BOARD_SETTINGS, 
40 |   loadBoardSettings, 
41 |   saveBoardSettings, 
42 |   applyEdgeSettings, 
43 |   saveBoardSettingsToServer, 
44 |   loadBoardSettingsFromServer 
45 | } from '@/lib/board-utils';
46 | import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
47 | import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
48 | import DevTools, { useChangeLoggerHooks } from '@/components/debug/DevTools';
49 | import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
50 | import { CreateCardModal } from '@/components/cards/CreateCardModal';
51 | import { useAuth } from '@/contexts/AuthContext';
52 | 
53 | // 새 카드의 중앙 위치를 계산하는 함수
54 | const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
55 |   if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
56 |   return viewportCenter;
57 | };
58 | 
59 | // 내부 구현을 위한 컴포넌트
60 | function BoardContent() {
61 |   const [nodes, setNodes, onNodesChange] = useNodesState([]);
62 |   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
[TRUNCATED]
```

src/app/login/page.tsx
```
1 | import AuthForm from "@/components/auth/AuthForm";
2 | 
3 | export default function LoginPage() {
4 |   return (
5 |     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
6 |       <AuthForm />
7 |     </div>
8 |   );
9 | } 
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
11 | // React.Suspense 모킹
12 | vi.mock('react', () => {
13 |   const originalReact = vi.importActual('react');
14 |   return {
15 |     ...originalReact,
16 |     Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
17 |       return (
18 |         <>
19 |           <div data-testid="suspense-fallback">{fallback}</div>
20 |           <div data-testid="suspense-children">{children}</div>
21 |         </>
22 |       );
23 |     },
24 |   };
25 | });
26 | 
27 | // 테스트용 CardListSkeleton (page 모듈에서 가져오지 않고 테스트에서 직접 정의)
28 | const CardListSkeleton = () => (
29 |   <div data-testid="skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
30 |     {Array(6).fill(0).map((_, index) => (
31 |       <div key={index} className="border rounded-md p-4 space-y-4">
32 |         <div data-testid="skeleton" className="h-6 w-3/4" />
33 |         <div data-testid="skeleton" className="h-24" />
34 |         <div className="flex justify-between">
35 |           <div data-testid="skeleton" className="h-4 w-1/4" />
36 |           <div data-testid="skeleton" className="h-8 w-1/4" />
37 |         </div>
38 |       </div>
39 |     ))}
40 |   </div>
41 | );
42 | 
43 | // Suspense 내부 컴포넌트 모킹
44 | vi.mock('@/components/cards/CardList', () => {
45 |   return {
46 |     default: vi.fn(() => <div data-testid="card-list">카드 목록 컴포넌트</div>)
47 |   };
48 | });
49 | 
[TRUNCATED]
```

src/app/cards/page.tsx
```
1 | import { Metadata } from "next";
2 | import { Suspense } from 'react';
3 | import CardList from "../../components/cards/CardList";
4 | import CreateCardButton from "../../components/cards/CreateCardButton";
5 | import { Skeleton } from '@/components/ui/skeleton';
6 | 
7 | export const metadata: Metadata = {
8 |   title: "카드 목록 | Backyard",
9 |   description: "백야드 카드 목록 페이지입니다.",
10 | };
11 | 
12 | // 카드 목록 로딩 스켈레톤
13 | function CardListSkeleton() {
14 |   return (
15 |     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
16 |       {Array(6).fill(0).map((_, index) => (
17 |         <div key={index} className="border rounded-md p-4 space-y-4">
18 |           <Skeleton className="h-6 w-3/4" />
19 |           <Skeleton className="h-24" />
20 |           <div className="flex justify-between">
21 |             <Skeleton className="h-4 w-1/4" />
22 |             <Skeleton className="h-8 w-1/4" />
23 |           </div>
24 |         </div>
25 |       ))}
26 |     </div>
27 |   );
28 | }
29 | 
30 | export default function CardsPage() {
31 |   return (
32 |     <div className="container mx-auto py-8">
33 |       <div className="flex justify-between items-center mb-6">
34 |         <h1 className="text-3xl font-bold">카드 목록</h1>
35 |         <CreateCardButton />
36 |       </div>
37 |       
38 |       <Suspense fallback={<CardListSkeleton />}>
39 |         <CardList />
40 |       </Suspense>
41 |     </div>
42 |   );
43 | } 
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
8 | // prisma 모킹
9 | vi.mock('@/lib/prisma', () => ({
10 |   prisma: {
11 |     tag: {
12 |       findMany: vi.fn()
13 |     }
14 |   }
15 | }));
16 | 
17 | // formatDate 모킹
18 | vi.mock('@/lib/utils', () => ({
19 |   formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
20 |   cn: vi.fn((...args: any[]) => args.join(' '))
21 | }));
22 | 
23 | // TagForm 및 TagList 컴포넌트 모킹
24 | vi.mock('@/components/tags/TagForm', () => ({
25 |   default: () => <div data-testid="tag-form">태그 추가 폼</div>
26 | }));
27 | 
28 | vi.mock('@/components/tags/TagList', () => ({
29 |   default: ({ initialTags }: { initialTags: any[] }) => (
30 |     <div data-testid="tag-list">
31 |       태그 수: {initialTags.length}
32 |     </div>
33 |   )
34 | }));
35 | 
36 | describe('TagsPage', () => {
37 |   beforeEach(() => {
38 |     vi.clearAllMocks();
39 |   });
40 |   
41 |   afterEach(() => {
42 |     cleanup();
43 |   });
44 |   
45 |   it('태그 관리 페이지가 올바르게 렌더링되어야 함', async () => {
46 |     // 가짜 태그 데이터
47 |     const mockTags = [
48 |       { 
49 |         id: '1', 
50 |         name: '자바스크립트', 
51 |         createdAt: new Date(),
52 |         updatedAt: new Date(),
53 |         _count: { cardTags: 5 }
54 |       },
55 |       { 
56 |         id: '2', 
57 |         name: '리액트', 
58 |         createdAt: new Date(),
59 |         updatedAt: new Date(),
60 |         _count: { cardTags: 3 }
61 |       },
62 |       { 
63 |         id: '3', 
64 |         name: '타입스크립트', 
65 |         createdAt: new Date(),
66 |         updatedAt: new Date(),
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
[TRUNCATED]
```

src/components/board/BoardComponent.tsx
```
1 | 'use client';
2 | 
3 | import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
4 | import {
5 |   ReactFlow,
6 |   Controls,
7 |   Background,
8 |   useNodesState,
9 |   useEdgesState,
10 |   addEdge,
11 |   Panel,
12 |   ConnectionLineType,
13 |   Position,
14 |   MarkerType,
15 |   useReactFlow,
16 |   useUpdateNodeInternals,
17 |   Node,
18 |   Edge,
19 |   NodeChange,
20 |   EdgeChange,
21 |   Connection,
22 |   applyNodeChanges,
23 |   applyEdgeChanges,
24 |   OnConnectStart,
25 |   OnConnectEnd,
26 |   XYPosition
27 | } from '@xyflow/react';
28 | import { Button } from '@/components/ui/button';
29 | import { Loader2, Save } from 'lucide-react';
30 | import { toast } from 'sonner';
31 | import CreateCardButton from '@/components/cards/CreateCardButton';
32 | import LayoutControls from '@/components/board/LayoutControls';
33 | import BoardSettingsControl from '@/components/board/BoardSettingsControl';
34 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
35 | import { 
36 |   BoardSettings, 
37 |   DEFAULT_BOARD_SETTINGS, 
38 |   loadBoardSettings, 
39 |   saveBoardSettings, 
40 |   applyEdgeSettings, 
41 |   saveBoardSettingsToServer, 
42 |   loadBoardSettingsFromServer 
43 | } from '@/lib/board-utils';
44 | import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
45 | import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
46 | import DevTools from '@/components/debug/DevTools';
47 | import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
48 | import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
49 | import { CreateCardModal } from '@/components/cards/CreateCardModal';
50 | import { useAuth } from '@/contexts/AuthContext';
51 | import { useAppStore } from '@/store/useAppStore';
52 | import { logCurrentBoardSettings, resetAllStorage } from '@/lib/debug-utils';
53 | import { cn } from '@/lib/utils';
54 | 
55 | // 타입 정의
56 | interface BoardComponentProps {
57 |   onSelectCard?: (cardId: string | null) => void;
58 |   className?: string;
59 |   showControls?: boolean;
60 | }
61 | 
62 | export default function BoardComponent({ 
63 |   onSelectCard,
64 |   className = "",
65 |   showControls = true 
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
17 | import { Settings, Grid3X3, ArrowRightIcon, Circle, SeparatorHorizontal, Paintbrush } from 'lucide-react';
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
30 | 
31 | interface BoardSettingsControlProps {
32 |   settings: BoardSettings;
33 |   onSettingsChange: (settings: BoardSettings) => void;
34 | }
35 | 
36 | export default function BoardSettingsControl({
37 |   settings,
38 |   onSettingsChange,
39 | }: BoardSettingsControlProps) {
40 |   // 스냅 그리드 값 변경 핸들러
41 |   const handleSnapGridChange = (value: string) => {
42 |     const gridSize = parseInt(value, 10);
43 |     const newSettings = {
44 |       ...settings,
45 |       snapGrid: [gridSize, gridSize] as [number, number],
46 |       snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
47 |     };
48 |     onSettingsChange(newSettings);
49 |     toast.success('격자 크기가 변경되었습니다.');
50 |   };
51 | 
52 |   // 연결선 타입 변경 핸들러
53 |   const handleConnectionTypeChange = (value: string) => {
54 |     const newSettings = {
55 |       ...settings,
56 |       connectionLineType: value as ConnectionLineType,
57 |     };
58 |     onSettingsChange(newSettings);
59 |     toast.success('연결선 스타일이 변경되었습니다.');
60 |   };
61 | 
62 |   // 마커 타입 변경 핸들러
63 |   const handleMarkerTypeChange = (value: string) => {
64 |     const newSettings = {
65 |       ...settings,
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
14 | 
15 | // 노드 데이터 타입 정의
16 | export interface NodeData {
17 |   id: string;
18 |   title: string;
19 |   content: string;
20 |   type?: string;
21 |   width?: number;
22 |   height?: number;
23 |   color?: string;
24 |   backgroundColor?: string;
25 |   tags?: string[];
26 |   position?: {
27 |     x: number;
28 |     y: number;
29 |   };
30 |   // 추가 속성들
31 |   [key: string]: any;
32 | }
33 | 
34 | // Portal 컴포넌트 - 내부 정의
35 | const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
36 |   const [mounted, setMounted] = useState(false);
37 | 
38 |   useEffect(() => {
39 |     setMounted(true);
40 |     return () => setMounted(false);
41 |   }, []);
42 | 
43 |   return mounted ? createPortal(children, document.body) : null;
44 | };
45 | 
46 | // 헥스 색상을 HSL로 변환하는 함수
47 | const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
48 |   if (!hex) return null;
49 |   
50 |   // hex를 RGB로 변환
51 |   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
52 |   if (!result) return null;
53 |   
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
[TRUNCATED]
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
25 | 
26 | interface Tag {
27 |   id: string;
28 |   name: string;
29 | }
30 | 
31 | interface CardTag {
32 |   id: string;
33 |   tag: Tag;
34 | }
35 | 
36 | interface CardItem {
37 |   id: string;
38 |   title: string;
39 |   content: string;
40 |   createdAt: string;
41 |   cardTags?: CardTag[];
42 | }
43 | 
44 | export default function CardList() {
45 |   const { cards, setCards } = useAppStore();
46 |   const [loading, setLoading] = useState(false);
47 |   const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
48 |   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
49 |   const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
50 |   const [isDeleting, setIsDeleting] = useState(false);
51 |   const searchParams = useSearchParams();
52 | 
53 |   const filteredCards = React.useMemo(() => {
54 |     const q = searchParams.get('q')?.toLowerCase();
55 |     const tag = searchParams.get('tag')?.toLowerCase();
56 |     
57 |     if (!q && !tag) return cards as CardItem[];
58 |     
59 |     return (cards as CardItem[]).filter(card => {
60 |       const matchesQuery = !q || 
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
[TRUNCATED]
```

src/components/cards/SearchBar.tsx
```
1 | 'use client';
2 | 
3 | import { useState, useEffect } from 'react';
4 | import { Input } from '@/components/ui/input';
5 | import { Button } from '@/components/ui/button';
6 | import { Search, X } from 'lucide-react';
7 | import { useRouter, useSearchParams } from 'next/navigation';
8 | 
9 | export const SearchBar = () => {
10 |   const router = useRouter();
11 |   const searchParams = useSearchParams();
12 |   const [searchTerm, setSearchTerm] = useState('');
13 |   
14 |   // URL에서 검색어 가져오기
15 |   useEffect(() => {
16 |     const q = searchParams.get('q') || '';
17 |     setSearchTerm(q);
18 |   }, [searchParams]);
19 |   
20 |   // 검색 실행
21 |   const handleSearch = () => {
22 |     // 태그 검색과 일반 검색 분리
23 |     // #으로 시작하는 검색어는 태그 검색으로 처리
24 |     if (searchTerm.startsWith('#')) {
25 |       const tag = searchTerm.slice(1); // # 제거
26 |       if (tag) {
27 |         router.push(`/cards?tag=${encodeURIComponent(tag)}`);
28 |       }
29 |     } else if (searchTerm) {
30 |       router.push(`/cards?q=${encodeURIComponent(searchTerm)}`);
31 |     } else {
32 |       router.push('/cards');
33 |     }
34 |   };
35 |   
36 |   // 엔터 키 처리
37 |   const handleKeyDown = (e: React.KeyboardEvent) => {
38 |     if (e.key === 'Enter') {
39 |       handleSearch();
40 |     }
41 |   };
42 |   
43 |   // 검색어 초기화
44 |   const clearSearch = () => {
45 |     setSearchTerm('');
46 |     router.push('/cards');
47 |   };
48 |   
49 |   return (
50 |     <div className="w-full flex gap-2 mb-4">
51 |       <div className="relative flex-1">
52 |         <Input
53 |           type="text"
54 |           placeholder="검색어 입력 또는 #태그 입력"
55 |           value={searchTerm}
56 |           onChange={(e) => setSearchTerm(e.target.value)}
57 |           onKeyDown={handleKeyDown}
58 |           className="pr-8"
59 |         />
60 |         {searchTerm && (
61 |           <button
62 |             onClick={clearSearch}
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

src/components/layout/MainCanvas.tsx
```
1 | 'use client';
2 | 
3 | import { useAppStore } from '@/store/useAppStore';
4 | import { ReactFlowProvider } from '@xyflow/react';
5 | import { Loader2 } from 'lucide-react';
6 | import BoardComponent from '@/components/board/BoardComponent';
7 | import '@xyflow/react/dist/style.css';
8 | 
9 | // 외부 내보내기 컴포넌트
10 | export function MainCanvas() {
11 |   const { selectCard } = useAppStore();
12 |   
13 |   return (
14 |     <ReactFlowProvider>
15 |       <div className="w-full h-full pt-14">
16 |         <BoardComponent
17 |           onSelectCard={selectCard}
18 |           className="bg-background"
19 |           showControls={true}
20 |         />
21 |       </div>
22 |     </ReactFlowProvider>
23 |   );
24 | } 
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
19 |   Layout
20 | } from 'lucide-react';
21 | import { Button } from '@/components/ui/button';
22 | import {
23 |   DropdownMenu,
24 |   DropdownMenuContent,
25 |   DropdownMenuItem,
26 |   DropdownMenuTrigger,
27 |   DropdownMenuSub,
28 |   DropdownMenuSubTrigger,
29 |   DropdownMenuSubContent,
30 |   DropdownMenuPortal,
31 |   DropdownMenuSeparator,
32 |   DropdownMenuRadioGroup,
33 |   DropdownMenuRadioItem,
34 |   DropdownMenuCheckboxItem,
35 |   DropdownMenuLabel
36 | } from '@/components/ui/dropdown-menu';
37 | import { useAppStore } from '@/store/useAppStore';
38 | import { toast } from 'sonner';
39 | import { ConnectionLineType, MarkerType } from '@xyflow/react';
40 | import { BoardSettings, DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
41 | import { 
42 |   SNAP_GRID_OPTIONS, 
43 |   CONNECTION_TYPE_OPTIONS, 
44 |   MARKER_TYPE_OPTIONS,
45 |   STROKE_WIDTH_OPTIONS,
46 |   MARKER_SIZE_OPTIONS,
47 |   EDGE_COLOR_OPTIONS,
48 |   EDGE_ANIMATION_OPTIONS,
49 |   STORAGE_KEY,
50 |   EDGES_STORAGE_KEY
51 | } from '@/lib/board-constants';
52 | 
53 | export function ProjectToolbar() {
54 |   const [projectName, setProjectName] = useState('프로젝트 이름');
55 |   const { 
56 |     layoutDirection, 
57 |     setLayoutDirection,
58 |     boardSettings,
59 |     updateBoardSettings,
60 |     reactFlowInstance
61 |   } = useAppStore();
62 |   
63 |   // 저장 핸들러 (임시)
64 |   const handleSaveLayout = useCallback(() => {
65 |     try {
66 |       if (!reactFlowInstance) {
67 |         toast.error('React Flow 인스턴스를 찾을 수 없습니다');
68 |         return;
69 |       }
70 |       
71 |       // React Flow 인스턴스에서 노드와 엣지 데이터 가져오기
72 |       const nodes = reactFlowInstance.getNodes();
73 |       const edges = reactFlowInstance.getEdges();
74 |       
75 |       if (!nodes.length) {
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
5 | import { ChevronRight, Eye, Trash2, GripVertical, Pencil } from 'lucide-react';
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
29 | 
30 | // 카드 인터페이스 정의
31 | interface Tag {
32 |   id: string;
33 |   name: string;
34 | }
35 | 
36 | interface CardTag {
37 |   id: string;
38 |   tag: Tag;
39 | }
40 | 
41 | interface CardItem extends Card {
42 |   cardTags?: CardTag[];
43 |   // 엣지 정보를 통해 계층 구조 파악을 위한 필드
44 |   parents?: string[];
45 |   children?: string[];
46 |   depth?: number;
47 | }
48 | 
49 | interface SidebarProps {
50 |   className?: string;
51 | }
52 | 
53 | export function Sidebar({ className }: SidebarProps) {
54 |   const { 
55 |     isSidebarOpen, 
56 |     setSidebarOpen, 
57 |     selectedCardId, 
58 |     selectedCardIds, 
59 |     selectCard, 
60 |     sidebarWidth, 
61 |     setSidebarWidth,
62 |     reactFlowInstance,
63 |     cards
64 |   } = useAppStore();
65 |   
66 |   // 전역 상태의 cards를 CardItem 타입으로 캐스팅하여 사용
67 |   const cardsWithType = cards as CardItem[];
68 |   
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
22 |       className={cn("flex flex-col gap-1.5 px-6", className)}
23 |       {...props}
24 |     />
25 |   )
26 | }
27 | 
28 | function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
29 |   return (
30 |     <div
31 |       data-slot="card-title"
32 |       className={cn("leading-none font-semibold", className)}
33 |       {...props}
34 |     />
35 |   )
36 | }
37 | 
38 | function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
39 |   return (
40 |     <div
41 |       data-slot="card-description"
42 |       className={cn("text-muted-foreground text-sm", className)}
43 |       {...props}
44 |     />
45 |   )
46 | }
47 | 
48 | function CardContent({ className, ...props }: React.ComponentProps<"div">) {
49 |   return (
50 |     <div
51 |       data-slot="card-content"
52 |       className={cn("px-6", className)}
53 |       {...props}
54 |     />
55 |   )
56 | }
57 | 
58 | function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
59 |   return (
60 |     <div
61 |       data-slot="card-footer"
62 |       className={cn("flex items-center px-6", className)}
63 |       {...props}
64 |     />
65 |   )
66 | }
67 | 
68 | export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
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
41 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
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
[TRUNCATED]
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
[TRUNCATED]
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
[TRUNCATED]
```

src/app/api/tags/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import prisma from '@/lib/prisma';
3 | import { z } from 'zod';
4 | 
5 | // 태그 스키마 정의
6 | const tagSchema = z.object({
7 |   name: z.string().min(1, '태그 이름은 필수입니다.').max(50, '태그 이름은 50자 이하여야 합니다.')
8 | });
9 | 
10 | // 태그 목록 조회
11 | export async function GET(request: NextRequest) {
12 |   try {
13 |     const tags = await prisma.tag.findMany({
14 |       orderBy: { name: 'asc' }
15 |     });
16 |     
17 |     return NextResponse.json(tags);
18 |   } catch (error) {
19 |     console.error('Error fetching tags:', error);
20 |     return NextResponse.json(
21 |       { error: '태그 목록을 가져오는 중 오류가 발생했습니다.' },
22 |       { status: 500 }
23 |     );
24 |   }
25 | }
26 | 
27 | // 태그 생성
28 | export async function POST(request: NextRequest) {
29 |   try {
30 |     // 요청 데이터 추출
31 |     let body;
32 |     try {
33 |       body = await request.json();
34 |     } catch (error) {
35 |       // request.json()이 실패하면 request.text()를 사용
36 |       const text = await request.text();
37 |       try {
38 |         body = JSON.parse(text);
39 |       } catch {
40 |         // JSON 파싱에 실패하면 빈 객체 반환
41 |         return NextResponse.json(
42 |           { error: '잘못된 JSON 형식입니다.' },
43 |           { status: 400 }
44 |         );
45 |       }
46 |     }
47 |     
48 |     // 태그 데이터 유효성 검사
49 |     const validationResult = tagSchema.safeParse(body);
50 |     if (!validationResult.success) {
51 |       console.error('Validation error:', validationResult.error);
52 |       return NextResponse.json(
53 |         { error: validationResult.error.errors },
54 |         { status: 400 }
55 |       );
56 |     }
57 |     
58 |     // 태그 중복 확인
59 |     const existingTag = await prisma.tag.findUnique({
60 |       where: { name: validationResult.data.name }
61 |     });
62 |     
63 |     if (existingTag) {
[TRUNCATED]
```

src/app/auth/callback/page.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect, useState, Suspense } from 'react';
4 | import { useRouter, useSearchParams } from 'next/navigation';
5 | import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
6 | 
7 | // 실제 콜백 처리를 담당하는 컴포넌트
8 | function CallbackHandler() {
9 |   const router = useRouter();
10 |   const searchParams = useSearchParams();
11 |   const [error, setError] = useState<string | null>(null);
12 |   const [loading, setLoading] = useState(true);
13 |   
14 |   useEffect(() => {
15 |     const handleCallback = async () => {
16 |       try {
17 |         const code = searchParams.get('code');
18 |         
19 |         console.log('[Callback] 인증 콜백 처리 시작');
20 |         
21 |         // 디버깅: 로컬 스토리지 상태 확인
22 |         if (typeof window !== 'undefined') {
23 |           const verifier = localStorage.getItem('supabase.auth.code_verifier');
24 |           const backupVerifier = sessionStorage.getItem('auth.code_verifier.backup');
25 |           
26 |           console.log('[Callback] 로컬 스토리지 상태:', {
27 |             code: code ? `${code.substring(0, 10)}...` : '없음',
28 |             code_verifier: verifier ? `${verifier.substring(0, 5)}...${verifier.substring(verifier.length - 5)} (길이: ${verifier.length})` : '없음',
29 |             backup_verifier: backupVerifier ? `${backupVerifier.substring(0, 5)}...${backupVerifier.substring(backupVerifier.length - 5)} (길이: ${backupVerifier.length})` : '없음',
30 |             localStorage_keys: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
31 |             sessionStorage_keys: Object.keys(sessionStorage)
32 |           });
33 |           
34 |           // 백업에서 복원 시도
35 |           if (!verifier && backupVerifier) {
36 |             console.log('[Callback] 백업에서 code_verifier 복원 시도');
37 |             localStorage.setItem('supabase.auth.code_verifier', backupVerifier);
38 |           }
39 |         }
40 |         
41 |         if (!code) {
42 |           console.error('[Callback] 인증 코드가 없습니다.');
43 |           setError('인증 코드가 없습니다.');
44 |           router.push('/login?error=missing_code');
45 |           return;
46 |         }
47 |         
48 |         // Supabase 클라이언트 생성
49 |         const supabase = createBrowserSupabaseClient();
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
8 | // notFound 및 useRouter 모킹
9 | vi.mock('next/navigation', () => ({
10 |   notFound: vi.fn(),
11 |   useRouter: vi.fn(() => ({
12 |     push: vi.fn()
13 |   }))
14 | }));
15 | 
16 | // prisma 모킹
17 | vi.mock('@/lib/prisma', () => ({
18 |   prisma: {
19 |     card: {
20 |       findUnique: vi.fn()
21 |     }
22 |   }
23 | }));
24 | 
25 | // formatDate 모킹
26 | vi.mock('@/lib/utils', () => ({
27 |   formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
28 |   cn: vi.fn((...args: any[]) => args.join(' '))
29 | }));
30 | 
31 | describe('CardPage', () => {
32 |   const params = { id: 'card123' };
33 |   
34 |   // 가짜 카드 데이터
35 |   const mockCard = {
36 |     id: 'card123',
37 |     title: '테스트 카드',
38 |     content: '테스트 내용입니다.',
39 |     createdAt: new Date(),
40 |     updatedAt: new Date(),
41 |     user: {
42 |       id: 'user123',
43 |       name: '테스트 사용자',
44 |       email: 'test@example.com'
45 |     },
46 |     cardTags: [
47 |       {
48 |         id: 'ct1',
49 |         cardId: 'card123',
50 |         tagId: 'tag1',
51 |         tag: {
52 |           id: 'tag1',
53 |           name: '태그1'
54 |         }
55 |       },
56 |       {
57 |         id: 'ct2',
58 |         cardId: 'card123',
59 |         tagId: 'tag2',
60 |         tag: {
61 |           id: 'tag2',
62 |           name: '태그2'
63 |         }
64 |       }
65 |     ]
66 |   };
67 |   
68 |   beforeEach(() => {
69 |     vi.clearAllMocks();
70 |   });
71 |   
72 |   afterEach(() => {
73 |     cleanup();
74 |   });
75 |   
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
[TRUNCATED]
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
[TRUNCATED]
```
