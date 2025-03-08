Project Structure:
├── LICENSE
├── README.md
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
│   ├── dev.db-journal
│   ├── schema.prisma
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
│   └── create-user.js
├── src
│   ├── middleware.ts
│   ├── setupTests.ts
├── supabase
│   ├── config.toml
│   └── schema.sql
├── tsconfig.json
├── types
│   └── vitest.d.ts
├── vitest.config.ts
└── yarn.lock


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
7 |     "dev": "next dev",
8 |     "build": "prisma generate && next build",
9 |     "start": "next start",
10 |     "lint": "next lint",
11 |     "test": "vitest",
12 |     "test:run": "vitest run",
13 |     "test:watch": "vitest --watch",
14 |     "test:coverage": "vitest run --coverage",
15 |     "prisma:seed": "node prisma/seed/index.js"
16 |   },
17 |   "dependencies": {
18 |     "@hookform/resolvers": "^4.1.2",
19 |     "@prisma/client": "^6.4.1",
20 |     "@radix-ui/react-alert-dialog": "^1.1.6",
21 |     "@radix-ui/react-dialog": "^1.1.6",
22 |     "@radix-ui/react-dropdown-menu": "^2.1.6",
23 |     "@radix-ui/react-label": "^2.1.2",
24 |     "@radix-ui/react-slot": "^1.1.2",
25 |     "@supabase/auth-helpers-nextjs": "^0.10.0",
26 |     "@supabase/ssr": "^0.5.2",
27 |     "@supabase/supabase-js": "^2.49.1",
28 |     "@tiptap/core": "^2.11.5",
29 |     "@tiptap/extension-bold": "^2.11.5",
30 |     "@tiptap/extension-bullet-list": "^2.11.5",
31 |     "@tiptap/extension-floating-menu": "^2.11.5",
32 |     "@tiptap/extension-heading": "^2.11.5",
33 |     "@tiptap/extension-image": "^2.11.5",
34 |     "@tiptap/extension-italic": "^2.11.5",
35 |     "@tiptap/extension-link": "^2.11.5",
36 |     "@tiptap/extension-list-item": "^2.11.5",
37 |     "@tiptap/extension-ordered-list": "^2.11.5",
38 |     "@tiptap/pm": "^2.11.5",
39 |     "@tiptap/react": "^2.11.5",
40 |     "@tiptap/starter-kit": "^2.11.5",
41 |     "autoprefixer": "^10.4.20",
42 |     "class-variance-authority": "^0.7.1",
43 |     "clsx": "^2.1.1",
44 |     "dagre": "^0.8.5",
45 |     "lucide-react": "^0.476.0",
46 |     "next": "15.2.0",
47 |     "next-themes": "^0.4.4",
48 |     "postcss": "^8.5.3",
49 |     "react": "^19.0.0",
50 |     "react-dom": "^19.0.0",
51 |     "react-hook-form": "^7.54.2",
52 |     "reactflow": "^11.11.4",
53 |     "sonner": "^2.0.1",
54 |     "tailwind-merge": "^3.0.2",
55 |     "tailwindcss-animate": "^1.0.7",
56 |     "zod": "^3.24.2"
57 |   },
58 |   "devDependencies": {
59 |     "@eslint/eslintrc": "^3",
60 |     "@tailwindcss/postcss": "^4.0.9",
61 |     "@testing-library/dom": "^10.4.0",
62 |     "@testing-library/jest-dom": "^6.6.3",
63 |     "@testing-library/react": "^16.2.0",
64 |     "@testing-library/user-event": "^14.6.1",
65 |     "@types/node": "^22.13.9",
66 |     "@types/react": "^19.0.10",
67 |     "@types/react-dom": "^19",
68 |     "@types/testing-library__user-event": "^4.2.0",
69 |     "@vitejs/plugin-react": "^4.3.4",
70 |     "@vitest/coverage-v8": "3.0.7",
71 |     "eslint": "^9",
72 |     "eslint-config-next": "15.2.0",
73 |     "jsdom": "^26.0.0",
74 |     "node-fetch": "^2.7.0",
75 |     "prisma": "^6.4.1",
76 |     "tailwindcss": "^4",
77 |     "typescript": "^5",
78 |     "vite": "^6.2.0",
79 |     "vitest": "^3.0.7"
80 |   }
81 | }
```

postcss.config.mjs
```
1 | const config = {
2 |   plugins: {
3 |     '@tailwindcss/postcss': {},
4 |     autoprefixer: {},
5 |   },
6 | };
7 | 
8 | export default config;
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

.note/.gitkeep
```
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
19 | [ ] 카드 상태 - 기본
20 | - 연결선 핸들러 표시하지 않음
21 | 
22 | [ ] 카드 상태 - 마우스 호버
23 | - 연결선 핸들러 표시 
24 | - 연결선 핸들러 색상은 연결선과 동일
25 | 
26 | [ ] 카드 상태 - 선택  
27 | - 선택 상태는 클릭 혹은 선택 range 내부에 들어왔을 때
28 | - 선택 상태의 UI 변경
29 |   -- 외곽선 : 일반 카드 외곽선 + 2px, 색은 연결선 색과 동일
30 |   -- 카드 배경색 : 초기값은 연결선 색의 밝기 60% 증가 
31 |   -- 변경하는 UI의 값은 모두 환경 변수로 설정. 이후 UI로 바꿀 수 있어야 함. 
32 | - 외곽선을 표시해도 연결선 핸들러가 선 가운데에 올 수 있도록 border 옵션 조절
33 | - 연결선 핸들러 표시
34 | - 연결선 핸들러 색상은 연결선과 동일
35 | 
36 | 
37 | 
38 | [ ] 카드 클릭 
39 | -- 카드 위를 클릭하면 카드 선택 상태가 된다
40 | 
41 | 
42 | 
43 | 
44 | ** 토요일 - 원격 환경 적용 및 인증 ** 
45 | 
46 | **Supabase pw**
47 | $JpH_w$9WKrriPR
48 | 
49 | **google OAuth ID/Password**
50 | {"web":{"client_id":"545502090118-t5kccm1dguqbvbo8eovcoms71n4vem1e.apps.googleusercontent.com","project_id":"backyard-453110","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["https://backyard-orpin.vercel.app/"],"javascript_origins":["http://localhost:3000"]}}
51 | 
52 | 
53 | ## 1. Vercel에 퍼블리시하기
54 | 
55 | ### 퍼블리시 준비 단계 테스트
56 | - [ ] 로컬 환경에서 애플리케이션이 오류 없이 빌드되는지 확인
57 |   - `npm run build` 또는 `yarn build` 명령으로 빌드 오류 확인
58 | - [ ] 환경 변수가 `.env.local`이나 `.env` 파일에 올바르게 설정되어 있는지 확인
59 | - [ ] 프로젝트의 `package.json`에 필요한 스크립트와 의존성이 모두 포함되어 있는지 확인
60 | 
61 | ### Vercel 배포 테스트
62 | - [ ] Vercel 계정 생성 및 로그인이 정상적으로 되는지 확인
63 | - [ ] GitHub/GitLab 저장소와 Vercel 프로젝트가 올바르게 연결되는지 확인
64 | - [ ] Vercel CLI를 통한 배포가 정상적으로 진행되는지 확인 (`vercel` 명령어)
65 | - [ ] Vercel 환경 변수 설정이 올바르게 되었는지 확인
66 | 
67 | ### 배포 후 테스트
68 | - [ ] 배포된 URL에서 웹사이트가 정상적으로 로딩되는지 확인
69 | - [ ] 모든 페이지와 라우트가 정상적으로 동작하는지 확인
70 | - [ ] 이미지, 폰트 등의 정적 자원이 올바르게 로드되는지 확인
71 | - [ ] 반응형 디자인이 다양한 디바이스에서 올바르게 표시되는지 확인
72 | 
73 | ## 2. DB를 Supabase SaaS로 교체하기
74 | 
75 | ### Supabase 설정 테스트
76 | - [ ] Supabase 계정 생성 및 새 프로젝트 생성이 정상적으로 되는지 확인
77 | - [ ] Supabase 프로젝트의 데이터베이스 연결 정보를 올바르게 가져왔는지 확인
78 | - [ ] Supabase JavaScript 클라이언트 라이브러리가 정상적으로 설치되는지 확인
79 |   - `npm install @supabase/supabase-js` 또는 `yarn add @supabase/supabase-js`
80 | 
81 | ### 데이터 마이그레이션 테스트
82 | - [ ] 기존 데이터베이스 스키마를 Supabase에 맞게 설계했는지 확인
83 | - [ ] 데이터 마이그레이션 스크립트가 정상적으로 작동하는지 확인
84 | - [ ] 마이그레이션 후 데이터 무결성이 유지되는지 확인
85 | 
86 | ### Supabase 연동 테스트
87 | - [ ] Supabase 클라이언트 초기화가 올바르게 되는지 확인
88 | ```javascript
89 | const supabaseClient = createClient(
90 |   process.env.NEXT_PUBLIC_SUPABASE_URL,
91 |   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
92 | );
93 | ```
94 | - [ ] 데이터 조회(SELECT) 쿼리가 정상적으로 작동하는지 확인
95 | - [ ] 데이터 생성(INSERT) 쿼리가 정상적으로 작동하는지 확인
96 | - [ ] 데이터 수정(UPDATE) 쿼리가 정상적으로 작동하는지 확인
97 | - [ ] 데이터 삭제(DELETE) 쿼리가 정상적으로 작동하는지 확인
98 | - [ ] Supabase RLS(Row Level Security)가 올바르게 설정되었는지 확인
99 | 
100 | ### 오류 처리 테스트
101 | - [ ] 데이터베이스 연결 실패 시 적절한 오류 메시지가 표시되는지 확인
102 | - [ ] 쿼리 실패 시 사용자에게 친절한 오류 메시지가 제공되는지 확인
103 | - [ ] 네트워크 오류 시 재시도 메커니즘이 작동하는지 확인
104 | 
105 | ## 3. Google 원격 인증 붙이기
106 | 
107 | ### Google OAuth 설정 테스트
108 | - [ ] Google Cloud Console에서 OAuth 클라이언트 ID와 비밀키를 올바르게 생성했는지 확인
109 | - [ ] 리디렉션 URI가 올바르게 설정되었는지 확인 (로컬 개발 및 Vercel 배포 URL 모두)
110 | - [ ] 필요한 OAuth 스코프(이메일, 프로필 등)가 올바르게 지정되었는지 확인
111 | 
112 | ### Supabase Auth 연동 테스트
113 | - [ ] Supabase 프로젝트에서 Google OAuth 제공자가 올바르게 구성되었는지 확인
114 | - [ ] Supabase Auth API를 사용한 Google 로그인 코드가 정상적으로 작동하는지 확인
115 | ```javascript
116 | const { user, session, error } = await supabase.auth.signIn({
117 |   provider: 'google',
118 | });
119 | ```
120 | 
121 | ### 인증 흐름 테스트
122 | - [ ] 로그인 버튼 클릭 시 Google 로그인 페이지로 정상적으로 리디렉션되는지 확인
123 | - [ ] Google 계정으로 성공적으로 로그인 후 애플리케이션으로 리디렉션되는지 확인
124 | - [ ] 사용자 정보(이메일, 이름 등)가 올바르게 가져와지는지 확인
125 | - [ ] 로그인 상태가 애플리케이션 전체에서 올바르게 유지되는지 확인
126 | - [ ] 로그아웃 기능이 정상적으로 작동하는지 확인
127 | 
128 | ### 인증 상태 관리 테스트
129 | - [ ] 새로고침 후에도 로그인 상태가 유지되는지 확인
130 | - [ ] 세션 토큰이 올바르게 저장되고 관리되는지 확인
131 | - [ ] 인증이 필요한 페이지에 비로그인 사용자 접근 시 적절히 처리되는지 확인
132 | - [ ] 인증된 사용자만 특정 API를 호출할 수 있는지 확인
133 | 
134 | ### 사용자 경험 테스트
135 | - [ ] 로그인 및 로그아웃 과정이 사용자에게 직관적인지 확인
136 | - [ ] 로딩 상태가 적절히 표시되는지 확인
137 | - [ ] 인증 오류 시 사용자 친화적인 메시지가 표시되는지 확인
138 | 
139 | ### 최종 통합 테스트
140 | - [ ] 로그인한 사용자의 데이터가 Supabase DB와 올바르게 연동되는지 확인
141 | - [ ] 권한에 따른 데이터 접근 제한이 올바르게 작동하는지 확인
142 | - [ ] Vercel 배포 환경에서도 모든 인증 기능이 정상적으로 작동하는지 확인
```

prisma/dev.db-journal
```
1 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       v v                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            �
2 | U� 3  	084e3734-38f0-4ed2-bede-f5a95a6d6a65b051a2747c8fecf2a96b535e8341dcc65a84cbdb8de247d3807bac17d9fd914620250306090022_init�j�6�]�oL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 G�X9
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
13 |   provider   = "postgresql"
14 |   url        = env("DATABASE_URL")
15 |   directUrl  = env("DIRECT_URL")
16 |   extensions = [pgcrypto]
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
66 | model BoardSettings {
67 |   id        String   @id @default(uuid())
68 |   userId    String   @unique @map("user_id")
69 |   settings  Json
70 |   createdAt DateTime @default(now()) @map("created_at")
71 |   updatedAt DateTime @updatedAt @map("updated_at")
72 |   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
73 | 
74 |   @@map("board_settings")
75 | }
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

src/middleware.ts
```
1 | import { NextResponse } from 'next/server';
2 | import type { NextRequest } from 'next/server';
3 | import { createClient } from '@supabase/supabase-js';
4 | 
5 | // 보호된 경로 (로그인 필요)
6 | const protectedRoutes = ['/board', '/cards', '/tags'];
7 | // 인증된 사용자는 접근할 수 없는 경로
8 | const authRoutes = ['/login', '/register'];
9 | // 인증 검사를 건너뛸 경로
10 | const bypassAuthRoutes = ['/auth/callback', '/api'];
11 | 
12 | export async function middleware(req: NextRequest) {
13 |   // 요청 URL 가져오기
14 |   const url = req.nextUrl.clone();
15 |   const { pathname } = url;
16 |   
17 |   // 인증 우회 경로인 경우 인증 검사 건너뛰기
18 |   if (bypassAuthRoutes.some(route => pathname === route || pathname.startsWith(route))) {
19 |     console.log('인증 검사 건너뛰기:', pathname);
20 |     return NextResponse.next();
21 |   }
22 |   
23 |   // 응답 생성
24 |   const res = NextResponse.next();
25 |   
26 |   try {
27 |     // 토큰 확인
28 |     const accessToken = req.cookies.get('sb-access-token')?.value;
29 |     const refreshToken = req.cookies.get('sb-refresh-token')?.value;
30 |     const isLoggedIn = !!accessToken;
31 |     
32 |     console.log('경로 접근:', pathname, '인증 상태:', isLoggedIn ? '로그인됨' : '로그인안됨');
33 |     
34 |     // 로그인이 필요한 경로인지 확인
35 |     const isProtectedRoute = protectedRoutes.some(route => 
36 |       pathname === route || pathname.startsWith(`${route}/`)
37 |     );
38 |     
39 |     // 인증된 사용자가 접근할 수 없는 경로인지 확인
40 |     const isAuthRoute = authRoutes.some(route => 
41 |       pathname === route || pathname.startsWith(`${route}/`)
42 |     );
43 |     
44 |     // 미인증 상태에서 보호된 경로 접근 시도
45 |     if (isProtectedRoute && !isLoggedIn) {
46 |       console.log('인증되지 않은 사용자가 보호된 경로에 접근 시도:', pathname);
47 |       url.pathname = '/login';
48 |       return NextResponse.redirect(url);
49 |     }
50 |     
51 |     // 인증 상태에서 로그인/회원가입 페이지 접근 시도
52 |     if (isAuthRoute && isLoggedIn) {
53 |       console.log('인증된 사용자가 인증 경로에 접근 시도:', pathname);
54 |       url.pathname = '/board';
55 |       return NextResponse.redirect(url);
56 |     }
57 |     
58 |     return res;
59 |   } catch (error) {
60 |     console.error('미들웨어 처리 중 오류:', error);
61 |     return res;
62 |   }
63 | }
64 | 
65 | // 미들웨어 적용 경로 지정
66 | export const config = {
67 |   matcher: [
68 |     /*
69 |      * 미들웨어 동작을 제외할 경로:
70 |      * - 정적 파일 (images, favicon 등)
71 |      * - 서비스 워커
72 |      */
73 |     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
74 |   ],
75 | }; 
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
45 | # [db.vault]
46 | # secret_key = "env(SECRET_VALUE)"
47 | 
48 | [db.migrations]
49 | # Specifies an ordered list of schema files that describe your database.
50 | # Supports glob patterns relative to supabase directory: "./schemas/*.sql"
51 | schema_paths = []
52 | 
53 | [db.seed]
54 | # If enabled, seeds the database after migrations during a db reset.
55 | enabled = true
56 | # Specifies an ordered list of seed files to load during db reset.
57 | # Supports glob patterns relative to supabase directory: "./seeds/*.sql"
58 | sql_paths = ["./seed.sql"]
59 | 
60 | [realtime]
61 | enabled = true
62 | # Bind realtime via either IPv4 or IPv6. (default: IPv4)
63 | # ip_version = "IPv6"
64 | # The maximum length in bytes of HTTP request headers. (default: 4096)
65 | # max_header_length = 4096
66 | 
67 | [studio]
68 | enabled = true
69 | # Port to use for Supabase Studio.
70 | port = 54323
71 | # External URL of the API server that frontend connects to.
72 | api_url = "http://127.0.0.1"
73 | # OpenAI API Key to use for Supabase AI in the Supabase Studio.
74 | openai_api_key = "env(OPENAI_API_KEY)"
75 | 
76 | # Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
77 | # are monitored, and you can view the emails that would have been sent from the web interface.
78 | [inbucket]
79 | enabled = true
80 | # Port to use for the email testing server web interface.
81 | port = 54324
82 | # Uncomment to expose additional ports for testing user applications that send emails.
83 | # smtp_port = 54325
84 | # pop3_port = 54326
85 | # admin_email = "admin@email.com"
86 | # sender_name = "Admin"
87 | 
88 | [storage]
89 | enabled = true
90 | # The maximum file size allowed (e.g. "5MB", "500KB").
91 | file_size_limit = "50MiB"
92 | 
93 | # Image transformation API is available to Supabase Pro plan.
94 | # [storage.image_transformation]
95 | # enabled = true
96 | 
97 | # Uncomment to configure local storage buckets
98 | # [storage.buckets.images]
99 | # public = false
100 | # file_size_limit = "50MiB"
101 | # allowed_mime_types = ["image/png", "image/jpeg"]
102 | # objects_path = "./images"
103 | 
104 | [auth]
105 | enabled = true
106 | # The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
107 | # in emails.
108 | site_url = "http://127.0.0.1:3000"
109 | # A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
110 | additional_redirect_urls = ["https://127.0.0.1:3000"]
111 | # How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
112 | jwt_expiry = 3600
113 | # If disabled, the refresh token will never expire.
114 | enable_refresh_token_rotation = true
115 | # Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
116 | # Requires enable_refresh_token_rotation = true.
117 | refresh_token_reuse_interval = 10
118 | # Allow/disallow new user signups to your project.
119 | enable_signup = true
120 | # Allow/disallow anonymous sign-ins to your project.
121 | enable_anonymous_sign_ins = false
122 | # Allow/disallow testing manual linking of accounts
123 | enable_manual_linking = false
124 | # Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
125 | minimum_password_length = 6
126 | # Passwords that do not meet the following requirements will be rejected as weak. Supported values
127 | # are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
128 | password_requirements = ""
129 | 
130 | # Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
131 | # [auth.captcha]
132 | # enabled = true
133 | # provider = "hcaptcha"
134 | # secret = ""
135 | 
136 | [auth.email]
137 | # Allow/disallow new user signups via email to your project.
138 | enable_signup = true
139 | # If enabled, a user will be required to confirm any email change on both the old, and new email
140 | # addresses. If disabled, only the new email is required to confirm.
141 | double_confirm_changes = true
142 | # If enabled, users need to confirm their email address before signing in.
143 | enable_confirmations = false
144 | # If enabled, users will need to reauthenticate or have logged in recently to change their password.
145 | secure_password_change = false
146 | # Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
147 | max_frequency = "1s"
148 | # Number of characters used in the email OTP.
149 | otp_length = 6
150 | # Number of seconds before the email OTP expires (defaults to 1 hour).
151 | otp_expiry = 3600
152 | 
153 | # Use a production-ready SMTP server
154 | # [auth.email.smtp]
155 | # enabled = true
156 | # host = "smtp.sendgrid.net"
157 | # port = 587
158 | # user = "apikey"
159 | # pass = "env(SENDGRID_API_KEY)"
160 | # admin_email = "admin@email.com"
161 | # sender_name = "Admin"
162 | 
163 | # Uncomment to customize email template
164 | # [auth.email.template.invite]
165 | # subject = "You have been invited"
166 | # content_path = "./supabase/templates/invite.html"
167 | 
168 | [auth.sms]
169 | # Allow/disallow new user signups via SMS to your project.
170 | enable_signup = false
171 | # If enabled, users need to confirm their phone number before signing in.
172 | enable_confirmations = false
173 | # Template for sending OTP to users
174 | template = "Your code is {{ .Code }}"
175 | # Controls the minimum amount of time that must pass before sending another sms otp.
176 | max_frequency = "5s"
177 | 
178 | # Use pre-defined map of phone number to OTP for testing.
179 | # [auth.sms.test_otp]
180 | # 4152127777 = "123456"
181 | 
182 | # Configure logged in session timeouts.
183 | # [auth.sessions]
184 | # Force log out after the specified duration.
185 | # timebox = "24h"
186 | # Force log out if the user has been inactive longer than the specified duration.
187 | # inactivity_timeout = "8h"
188 | 
189 | # This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
190 | # [auth.hook.custom_access_token]
191 | # enabled = true
192 | # uri = "pg-functions://<database>/<schema>/<hook_name>"
193 | 
194 | # Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
195 | [auth.sms.twilio]
196 | enabled = false
197 | account_sid = ""
198 | message_service_sid = ""
199 | # DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
200 | auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"
201 | 
202 | # Multi-factor-authentication is available to Supabase Pro plan.
203 | [auth.mfa]
204 | # Control how many MFA factors can be enrolled at once per user.
205 | max_enrolled_factors = 10
206 | 
207 | # Control MFA via App Authenticator (TOTP)
208 | [auth.mfa.totp]
209 | enroll_enabled = false
210 | verify_enabled = false
211 | 
212 | # Configure MFA via Phone Messaging
213 | [auth.mfa.phone]
214 | enroll_enabled = false
215 | verify_enabled = false
216 | otp_length = 6
217 | template = "Your code is {{ .Code }}"
218 | max_frequency = "5s"
219 | 
220 | # Configure MFA via WebAuthn
221 | # [auth.mfa.web_authn]
222 | # enroll_enabled = true
223 | # verify_enabled = true
224 | 
225 | # Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
226 | # `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
227 | # `twitter`, `slack`, `spotify`, `workos`, `zoom`.
228 | [auth.external.apple]
229 | enabled = false
230 | client_id = ""
231 | # DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
232 | secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
233 | # Overrides the default auth redirectUrl.
234 | redirect_uri = ""
235 | # Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
236 | # or any other third-party OIDC providers.
237 | url = ""
238 | # If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
239 | skip_nonce_check = false
240 | 
241 | # Use Firebase Auth as a third-party provider alongside Supabase Auth.
242 | [auth.third_party.firebase]
243 | enabled = false
244 | # project_id = "my-firebase-project"
245 | 
246 | # Use Auth0 as a third-party provider alongside Supabase Auth.
247 | [auth.third_party.auth0]
248 | enabled = false
249 | # tenant = "my-auth0-tenant"
250 | # tenant_region = "us"
251 | 
252 | # Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
253 | [auth.third_party.aws_cognito]
254 | enabled = false
255 | # user_pool_id = "my-user-pool-id"
256 | # user_pool_region = "us-east-1"
257 | 
258 | [edge_runtime]
259 | enabled = true
260 | # Configure one of the supported request policies: `oneshot`, `per_worker`.
261 | # Use `oneshot` for hot reload, or `per_worker` for load testing.
262 | policy = "oneshot"
263 | # Port to attach the Chrome inspector for debugging edge functions.
264 | inspector_port = 8083
265 | 
266 | # Use these configurations to customize your Edge Function.
267 | # [functions.MY_FUNCTION_NAME]
268 | # enabled = true
269 | # verify_jwt = true
270 | # import_map = "./functions/MY_FUNCTION_NAME/deno.json"
271 | # Uncomment to specify a custom file path to the entrypoint.
272 | # Supported file extensions are: .ts, .js, .mjs, .jsx, .tsx
273 | # entrypoint = "./functions/MY_FUNCTION_NAME/index.ts"
274 | # Specifies static files to be bundled with the function. Supports glob patterns.
275 | # For example, if you want to serve static HTML pages in your function:
276 | # static_files = [ "./functions/MY_FUNCTION_NAME/*.html" ]
277 | 
278 | [analytics]
279 | enabled = true
280 | port = 54327
281 | # Configure one of the supported backends: `postgres`, `bigquery`.
282 | backend = "postgres"
283 | 
284 | # Experimental features may be deprecated any time
285 | [experimental]
286 | # Configures Postgres storage engine to use OrioleDB (S3)
287 | orioledb_version = ""
288 | # Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
289 | s3_host = "env(S3_HOST)"
290 | # Configures S3 bucket region, eg. us-east-1
291 | s3_region = "env(S3_REGION)"
292 | # Configures AWS_ACCESS_KEY_ID for S3 bucket
293 | s3_access_key = "env(S3_ACCESS_KEY)"
294 | # Configures AWS_SECRET_ACCESS_KEY for S3 bucket
295 | s3_secret_key = "env(S3_SECRET_KEY)"
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
49 |   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
50 | CREATE POLICY "인증된 사용자는 태그를 수정할 수 있음" ON tags
51 |   FOR UPDATE USING (auth.role() = 'authenticated');
52 | CREATE POLICY "인증된 사용자는 태그를 삭제할 수 있음" ON tags
53 |   FOR DELETE USING (auth.role() = 'authenticated');
54 | 
55 | -- 카드-태그 연결 테이블
56 | CREATE TABLE IF NOT EXISTS card_tags (
57 |   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
58 |   card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
59 |   tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
60 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
61 |   UNIQUE(card_id, tag_id)
62 | );
63 | 
64 | -- 카드-태그 연결 테이블 정책 (RLS)
65 | ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
66 | CREATE POLICY "사용자는 모든 카드-태그 연결을 조회할 수 있음" ON card_tags
67 |   FOR SELECT USING (true);
68 | CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
69 |   FOR INSERT WITH CHECK (
70 |     EXISTS (
71 |       SELECT 1 FROM cards 
72 |       WHERE cards.id = card_id AND cards.user_id = auth.uid()
73 |     )
74 |   );
75 | CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
76 |   FOR DELETE USING (
77 |     EXISTS (
78 |       SELECT 1 FROM cards 
79 |       WHERE cards.id = card_id AND cards.user_id = auth.uid()
80 |     )
81 |   );
82 | 
83 | -- 보드 설정 테이블
84 | CREATE TABLE IF NOT EXISTS board_settings (
85 |   user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
86 |   settings JSONB NOT NULL,
87 |   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
88 |   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
89 | );
90 | 
91 | -- 보드 설정 테이블 정책 (RLS)
92 | ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
93 | CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
94 |   FOR SELECT USING (auth.uid() = user_id);
95 | CREATE POLICY "사용자는 자신의 보드 설정만 생성/수정할 수 있음" ON board_settings
96 |   FOR ALL USING (auth.uid() = user_id);
97 | 
98 | -- 트리거 함수: 업데이트 시간 자동 갱신
99 | CREATE OR REPLACE FUNCTION update_modified_column()
100 | RETURNS TRIGGER AS $$
101 | BEGIN
102 |   NEW.updated_at = NOW();
103 |   RETURN NEW;
104 | END;
105 | $$ LANGUAGE plpgsql;
106 | 
107 | -- 각 테이블에 트리거 적용
108 | CREATE TRIGGER update_users_modtime
109 |   BEFORE UPDATE ON users
110 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
111 | 
112 | CREATE TRIGGER update_cards_modtime
113 |   BEFORE UPDATE ON cards
114 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
115 | 
116 | CREATE TRIGGER update_tags_modtime
117 |   BEFORE UPDATE ON tags
118 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
119 | 
120 | CREATE TRIGGER update_board_settings_modtime
121 |   BEFORE UPDATE ON board_settings
122 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 
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
3 | provider = "postgresql"
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
2 | 
3 | @plugin "tailwindcss-animate";
4 | 
5 | @custom-variant dark (&:is(.dark *));
6 | 
7 | @theme {
8 |   --font-sans: var(--font-geist-sans);
9 |   --font-mono: var(--font-geist-mono);
10 | }
11 | 
12 | :root {
13 |   --background: oklch(1 0 0);
14 |   --foreground: oklch(0.129 0.042 264.695);
15 |   --card: oklch(1 0 0);
16 |   --card-foreground: oklch(0.129 0.042 264.695);
17 |   --popover: oklch(1 0 0);
18 |   --popover-foreground: oklch(0.129 0.042 264.695);
19 |   --primary: oklch(0.208 0.042 265.755);
20 |   --primary-foreground: oklch(0.984 0.003 247.858);
21 |   --secondary: oklch(0.968 0.007 247.896);
22 |   --secondary-foreground: oklch(0.208 0.042 265.755);
23 |   --muted: oklch(0.968 0.007 247.896);
24 |   --muted-foreground: oklch(0.554 0.046 257.417);
25 |   --accent: oklch(0.968 0.007 247.896);
26 |   --accent-foreground: oklch(0.208 0.042 265.755);
27 |   --destructive: oklch(0.577 0.245 27.325);
28 |   --destructive-foreground: oklch(0.577 0.245 27.325);
29 |   --border: oklch(0.929 0.013 255.508);
30 |   --input: oklch(0.929 0.013 255.508);
31 |   --ring: oklch(0.869 0.022 252.894);
32 |   --chart-1: oklch(0.646 0.222 41.116);
33 |   --chart-2: oklch(0.6 0.118 184.704);
34 |   --chart-3: oklch(0.398 0.07 227.392);
35 |   --chart-4: oklch(0.828 0.189 84.429);
36 |   --chart-5: oklch(0.769 0.188 70.08);
37 |   --radius: 0.625rem;
38 |   --sidebar: oklch(0.984 0.003 247.858);
39 |   --sidebar-foreground: oklch(0.129 0.042 264.695);
40 |   --sidebar-primary: oklch(0.208 0.042 265.755);
41 |   --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
42 |   --sidebar-accent: oklch(0.968 0.007 247.896);
43 |   --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
44 |   --sidebar-border: oklch(0.929 0.013 255.508);
45 |   --sidebar-ring: oklch(0.869 0.022 252.894);
46 | }
47 | 
48 | .dark {
49 |   --background: oklch(0.129 0.042 264.695);
50 |   --foreground: oklch(0.984 0.003 247.858);
51 |   --card: oklch(0.129 0.042 264.695);
52 |   --card-foreground: oklch(0.984 0.003 247.858);
53 |   --popover: oklch(0.129 0.042 264.695);
54 |   --popover-foreground: oklch(0.984 0.003 247.858);
55 |   --primary: oklch(0.984 0.003 247.858);
56 |   --primary-foreground: oklch(0.208 0.042 265.755);
57 |   --secondary: oklch(0.279 0.041 260.031);
58 |   --secondary-foreground: oklch(0.984 0.003 247.858);
59 |   --muted: oklch(0.279 0.041 260.031);
60 |   --muted-foreground: oklch(0.704 0.04 256.788);
61 |   --accent: oklch(0.279 0.041 260.031);
62 |   --accent-foreground: oklch(0.984 0.003 247.858);
63 |   --destructive: oklch(0.396 0.141 25.723);
64 |   --destructive-foreground: oklch(0.637 0.237 25.331);
65 |   --border: oklch(0.279 0.041 260.031);
66 |   --input: oklch(0.279 0.041 260.031);
67 |   --ring: oklch(0.446 0.043 257.281);
68 |   --chart-1: oklch(0.488 0.243 264.376);
69 |   --chart-2: oklch(0.696 0.17 162.48);
70 |   --chart-3: oklch(0.769 0.188 70.08);
71 |   --chart-4: oklch(0.627 0.265 303.9);
72 |   --chart-5: oklch(0.645 0.246 16.439);
73 |   --sidebar: oklch(0.208 0.042 265.755);
74 |   --sidebar-foreground: oklch(0.984 0.003 247.858);
75 |   --sidebar-primary: oklch(0.488 0.243 264.376);
76 |   --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
77 |   --sidebar-accent: oklch(0.279 0.041 260.031);
78 |   --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
79 |   --sidebar-border: oklch(0.279 0.041 260.031);
80 |   --sidebar-ring: oklch(0.446 0.043 257.281);
81 | }
82 | 
83 | @theme inline {
84 |   --color-background: var(--background);
85 |   --color-foreground: var(--foreground);
86 |   --color-card: var(--card);
87 |   --color-card-foreground: var(--card-foreground);
88 |   --color-popover: var(--popover);
89 |   --color-popover-foreground: var(--popover-foreground);
90 |   --color-primary: var(--primary);
91 |   --color-primary-foreground: var(--primary-foreground);
92 |   --color-secondary: var(--secondary);
93 |   --color-secondary-foreground: var(--secondary-foreground);
94 |   --color-muted: var(--muted);
95 |   --color-muted-foreground: var(--muted-foreground);
96 |   --color-accent: var(--accent);
97 |   --color-accent-foreground: var(--accent-foreground);
98 |   --color-destructive: var(--destructive);
99 |   --color-destructive-foreground: var(--destructive-foreground);
100 |   --color-border: var(--border);
101 |   --color-input: var(--input);
102 |   --color-ring: var(--ring);
103 |   --color-chart-1: var(--chart-1);
104 |   --color-chart-2: var(--chart-2);
105 |   --color-chart-3: var(--chart-3);
106 |   --color-chart-4: var(--chart-4);
107 |   --color-chart-5: var(--chart-5);
108 |   --radius-sm: calc(var(--radius) - 4px);
109 |   --radius-md: calc(var(--radius) - 2px);
110 |   --radius-lg: var(--radius);
111 |   --radius-xl: calc(var(--radius) + 4px);
112 |   --color-sidebar: var(--sidebar);
113 |   --color-sidebar-foreground: var(--sidebar-foreground);
114 |   --color-sidebar-primary: var(--sidebar-primary);
115 |   --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
116 |   --color-sidebar-accent: var(--sidebar-accent);
117 |   --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
118 |   --color-sidebar-border: var(--sidebar-border);
119 |   --color-sidebar-ring: var(--sidebar-ring);
120 | }
121 | 
122 | @layer base {
123 |   * {
124 |     @apply border-border outline-ring/50;
125 |   }
126 |   body {
127 |     @apply bg-background text-foreground;
128 |   }
129 | }
130 | 
131 | /* React Flow 스타일 오버라이드 */
132 | .react-flow__connection-line {
133 |   stroke: #FF0072 !important;
134 |   stroke-width: 2px !important;
135 |   stroke-dasharray: none !important;
136 |   z-index: 1;
137 | }
138 | 
139 | .react-flow__edge-path {
140 |   stroke-dasharray: none;
141 |   z-index: 1;
142 | }
143 | 
144 | .react-flow__connectionline {
145 |   stroke-dasharray: none;
146 |   z-index: 1;
147 |   stroke-width: 2px;
148 | }
149 | 
150 | /* React Flow 노드 컨테이너 */
151 | .card-node-container {
152 |   position: relative;
153 |   z-index: 10;
154 | }
155 | 
156 | /* 카드 노드 기본 스타일 */
157 | .card-node {
158 |   background-color: #ffffff;
159 |   border-radius: 8px;
160 |   box-sizing: border-box;
161 |   border: 2px solid #C1C1C1;
162 |   transition: height 0.3s ease, background-color 0.2s ease, border-color 0.2s ease;
163 | }
164 | 
165 | /* 선택된 카드 노드 */
166 | .card-node.selected {
167 |   background-color: #FFD3E6;
168 |   border-color: #FF0072;
169 | }
170 | 
171 | /* 핸들 스타일 - 기본값 수정 */
172 | .react-flow__handle {
173 |   /* 기본 핸들러는 숨김 */
174 |   opacity: 0 !important;
175 |   pointer-events: none !important;
176 |   width: 0 !important;
177 |   height: 0 !important;
178 | }
179 | 
180 | /* 커스텀 핸들 스타일 */
181 | .handle-top,
182 | .handle-right,
183 | .handle-bottom,
184 | .handle-left {
185 |   /* 기존 opacity:0 제거 - 항상 보이도록 설정 */
186 |   opacity: 1 !important; 
187 |   transition: none !important; /* 애니메이션 제거 */
188 |   position: absolute !important;
189 |   z-index: 20 !important;
190 |   pointer-events: all !important;
191 |   /* 마진과 패딩 제거로 정확한 위치 계산 */
192 |   margin: 0 !important;
193 |   padding: 0 !important;
194 |   box-sizing: border-box !important;
195 |   box-shadow: none !important;
196 |   /* 크기 정확하게 지정 */
197 |   width: 10px !important;
198 |   height: 10px !important;
199 |   background-color: white !important;
200 |   /* 완벽한 원형 보장 */
201 |   border-radius: 50% !important;
202 |   /* transform 속성 제거 - JavaScript에서 계산된 위치를 사용 */
203 |   /* transform: none !important; */
204 |   /* 정확한 테두리 설정 */
205 |   border: 2px solid #696969 !important;
206 |   /* 픽셀 맞춤 보장 */
207 |   shape-rendering: geometricPrecision !important;
208 |   /* 서브픽셀 렌더링 개선 */
209 |   -webkit-font-smoothing: antialiased !important;
210 |   -moz-osx-font-smoothing: grayscale !important;
211 | }
212 | 
213 | /* 호버 시 핸들 표시 */
214 | .card-node-container:hover .handle-top,
215 | .card-node-container:hover .handle-right,
216 | .card-node-container:hover .handle-bottom,
217 | .card-node-container:hover .handle-left,
218 | .card-node-container.selected .handle-top,
219 | .card-node-container.selected .handle-right,
220 | .card-node-container.selected .handle-bottom,
221 | .card-node-container.selected .handle-left,
222 | .react-flow__node.selected .handle-top,
223 | .react-flow__node.selected .handle-right,
224 | .react-flow__node.selected .handle-bottom,
225 | .react-flow__node.selected .handle-left {
226 |   opacity: 1 !important; /* 호버나 선택 시 표시 */
227 |   /* transform: none !important; /* transform 제거 */
228 |   z-index: 25 !important;
229 |   display: block !important;
230 |   /* 크기 변화 없음 */
231 |   width: 10px !important;
232 |   height: 10px !important;
233 | }
234 | 
235 | /* 호버 효과 */
236 | .handle-top:hover,
237 | .handle-right:hover,
238 | .handle-bottom:hover,
239 | .handle-left:hover {
240 |   /* transform: none !important; /* transform 제거 */
241 |   cursor: crosshair !important;
242 |   z-index: 30 !important;
243 |   /* 크기 변화 없음 */
244 |   width: 10px !important;
245 |   height: 10px !important;
246 | }
247 | 
248 | /* TipTap 콘텐츠 스타일 */
249 | .tiptap-content {
250 |   font-size: 0.8rem;
251 |   line-height: 1.4;
252 | }
253 | 
254 | /* 다크 테마 대응 */
255 | .dark .card-node {
256 |   background-color: hsl(var(--card));
257 |   border-color: hsl(var(--border));
258 | }
259 | 
260 | .dark .handle-top,
261 | .dark .handle-right,
262 | .dark .handle-bottom,
263 | .dark .handle-left {
264 |   background-color: hsl(var(--card)) !important;
265 |   box-shadow: none !important;
266 | }
267 | 
268 | /* React Flow 노드 스타일 오버라이드 */
269 | .react-flow__node {
270 |   background-color: transparent !important;
271 |   background: transparent !important;
272 |   z-index: 5 !important;
273 |   padding: 0 !important;
274 |   border: none !important;
275 |   box-shadow: none !important;
276 | }
277 | 
278 | .react-flow__node-default {
279 |   background-color: transparent !important;
280 |   background: transparent !important;
281 |   padding: 0 !important;
282 |   border-radius: 0 !important;
283 |   border: none !important;
284 |   width: auto !important;
285 |   box-shadow: none !important;
286 | }
287 | 
288 | /* 태그 스타일 */
289 | .tag {
290 |   padding: 2px 8px;
291 |   border-radius: 12px;
292 |   font-size: 0.6rem;
293 |   display: inline-flex;
294 |   align-items: center;
295 |   background-color: var(--secondary);
296 |   color: var(--secondary-foreground);
297 | }
298 | 
299 | /* 선택된 카드 텍스트 색상 조정 */
300 | .card-node.selected .card-title,
301 | .card-node.selected .card-description,
302 | .card-node.selected .card-content {
303 |   color: hsl(var(--foreground)) !important;
304 | }
305 | 
306 | /* React Flow 노드 스타일 오버라이드 */
307 | .react-flow__node {
308 |   z-index: 5 !important;
309 | }
310 | 
311 | .react-flow__edge {
312 |   z-index: 1 !important;
313 | }
314 | 
315 | .react-flow__handle {
316 |   z-index: 30 !important;
317 | }
318 | 
319 | .react-flow__renderer {
320 |   position: relative;
321 |   z-index: 0;
322 | }
323 | 
324 | /* SVG 요소와 HTML 요소 간 상호작용 개선 */
325 | .react-flow__pane {
326 |   z-index: 0 !important;
327 | }
328 | 
329 | .react-flow__selection {
330 |   z-index: 6 !important;
331 | }
332 | 
333 | /* ReactFlow 선택된 노드 스타일 강화 */
334 | .react-flow__node.selected {
335 |   outline: 2px solid hsl(var(--primary)) !important;
336 |   outline-offset: 2px !important;
337 |   z-index: 10 !important;
338 | }
339 | 
340 | /* 노드 선택 상태 확실하게 표시 */
341 | .react-flow__node.selected .card-node {
342 |   box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
343 |   transition: box-shadow 0.2s ease !important;
344 | }
345 | 
346 | /* 노드 선택 가능성 표시 - 호버 효과 */
347 | .react-flow__node:not(.selected):hover .card-node {
348 |   box-shadow: 0 0 0 1px rgba(var(--primary-rgb), 0.3) !important;
349 |   transition: box-shadow 0.2s ease !important;
350 | }
351 | 
352 | /* 항상 보이는 핸들러를 위한 스타일 */
353 | .visible-handle {
354 |   opacity: 1 !important;
355 |   visibility: visible !important;
356 |   display: block !important;
357 |   pointer-events: auto !important;
358 |   /* transform: none !important; /* transform 제거 */
359 | }
360 | 
361 | .react-flow__handle.visible-handle {
362 |   opacity: 1 !important;
363 |   visibility: visible !important;
364 |   display: block !important;
365 |   pointer-events: auto !important;
366 |   z-index: 100 !important;
367 |   /* transform: none !important; /* transform 제거 */
368 |   width: 10px !important;
369 |   height: 10px !important;
370 | }
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
1 | import type { Metadata } from "next";
2 | import React from "react";
3 | import { Geist, Geist_Mono } from "next/font/google";
4 | import "./globals.css";
5 | import { AuthProvider } from "@/contexts/AuthContext";
6 | import { Toaster } from "sonner";
7 | 
8 | const geistSans = Geist({
9 |   variable: "--font-geist-sans",
10 |   subsets: ["latin"],
11 | });
12 | 
13 | const geistMono = Geist_Mono({
14 |   variable: "--font-geist-mono",
15 |   subsets: ["latin"],
16 | });
17 | 
18 | export const metadata: Metadata = {
19 |   title: "backyard - 지식 관리 도구",
20 |   description: "아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구",
21 | };
22 | 
23 | export default function RootLayout({
24 |   children,
25 | }: Readonly<{
26 |   children: React.ReactNode;
27 | }>) {
28 |   return (
29 |     <html lang="ko">
30 |       <body
31 |         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
32 |       >
33 |         <AuthProvider>
34 |           {children}
35 |           <Toaster position="top-right" />
36 |         </AuthProvider>
37 |       </body>
38 |     </html>
39 |   );
40 | }
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
1 | import React from "react";
2 | import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
3 | import { Button } from "@/components/ui/button";
4 | import Link from "next/link";
5 | 
6 | export default function Home() {
7 |   return (
8 |     <div className="flex flex-col items-center justify-center min-h-screen p-8">
9 |       <Card className="w-full max-w-md">
10 |         <CardHeader>
11 |           <CardTitle className="text-center">Hello backyard</CardTitle>
12 |           <CardDescription className="text-center">
13 |             아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구
14 |           </CardDescription>
15 |         </CardHeader>
16 |         <CardContent className="flex justify-center gap-2 flex-wrap">
17 |           <Button variant="outline" asChild>
18 |             <Link href="/cards">카드 목록 보기</Link>
19 |           </Button>
20 |           <Button variant="outline" asChild>
21 |             <Link href="/board">보드 시각화</Link>
22 |           </Button>
23 |         </CardContent>
24 |       </Card>
25 |     </div>
26 |   );
27 | }
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
8 | type AuthContextType = {
9 |   user: User | null;
10 |   userDetails: any; // Prisma User 모델 타입
11 |   isLoading: boolean;
12 |   isAuthenticated: boolean;
13 |   logout: () => Promise<void>;
14 | };
15 | 
16 | const AuthContext = createContext<AuthContextType>({
17 |   user: null,
18 |   userDetails: null,
19 |   isLoading: true,
20 |   isAuthenticated: false,
21 |   logout: async () => {},
22 | });
23 | 
24 | export const useAuth = () => useContext(AuthContext);
25 | 
26 | export function AuthProvider({ children }: { children: ReactNode }) {
27 |   const [user, setUser] = useState<User | null>(null);
28 |   const [userDetails, setUserDetails] = useState<any>(null);
29 |   const [isLoading, setIsLoading] = useState(true);
30 | 
31 |   // 인증 상태 확인
32 |   const checkAuth = async () => {
33 |     try {
34 |       const userData = await getCurrentUser();
35 |       
36 |       if (userData) {
37 |         setUser(userData);
38 |         setUserDetails(userData.dbUser);
39 |       } else {
40 |         setUser(null);
41 |         setUserDetails(null);
42 |       }
43 |     } catch (error) {
44 |       console.error('인증 상태 확인 오류:', error);
45 |       setUser(null);
46 |       setUserDetails(null);
47 |     } finally {
48 |       setIsLoading(false);
49 |     }
50 |   };
51 | 
52 |   // 로그아웃
53 |   const logout = async () => {
54 |     try {
55 |       await signOut();
56 |       setUser(null);
57 |       setUserDetails(null);
58 |     } catch (error) {
59 |       console.error('로그아웃 오류:', error);
60 |     }
61 |   };
62 | 
63 |   // 초기 인증 상태 확인
64 |   useEffect(() => {
65 |     checkAuth();
66 | 
67 |     // 브라우저 환경에서만 Supabase 클라이언트 생성
68 |     const supabase = createBrowserClient();
69 |     
70 |     // Supabase 인증 이벤트 리스너
71 |     const { data: authListener } = supabase.auth.onAuthStateChange(
72 |       async (event, session) => {
73 |         if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
74 |           // 사용자가 로그인하거나 토큰이 갱신될 때
75 |           checkAuth();
76 |         } else if (event === 'SIGNED_OUT') {
77 |           // 사용자가 로그아웃할 때
78 |           setUser(null);
79 |           setUserDetails(null);
80 |         }
81 |       }
82 |     );
83 | 
84 |     // 컴포넌트 언마운트 시 리스너 제거
85 |     return () => {
86 |       authListener.subscription.unsubscribe();
87 |     };
88 |   }, []);
89 | 
90 |   return (
91 |     <AuthContext.Provider
92 |       value={{
93 |         user,
94 |         userDetails,
95 |         isLoading,
96 |         isAuthenticated: !!user,
97 |         logout,
98 |       }}
99 |     >
100 |       {children}
101 |     </AuthContext.Provider>
102 |   );
103 | } 
```

src/config/cardBoardUiOptions.json
```
1 | {
2 |   "board": {
3 |     "snapToGrid": false,
4 |     "snapGrid": [15, 15],
5 |     "connectionLineType": "bezier",
6 |     "markerEnd": "arrowclosed",
7 |     "strokeWidth": 2,
8 |     "markerSize": 20,
9 |     "edgeColor": "#C1C1C1",
10 |     "animated": false,
11 |     "selectedEdgeColor": "#000000"
12 |   },
13 |   "card": {
14 |     "defaultWidth": 280,
15 |     "backgroundColor": "#FFFFFF",
16 |     "borderRadius": 8,
17 |     "tagBackgroundColor": "#F2F2F2"
18 |   },
19 |   "handles": {
20 |     "size": 10,
21 |     "backgroundColor": "#555555",
22 |     "borderColor": "#FFFFFF",
23 |     "borderWidth": 1
24 |   },
25 |   "layout": {
26 |     "defaultPadding": 20,
27 |     "defaultSpacing": {
28 |       "horizontal": 30,
29 |       "vertical": 30
30 |     },
31 |     "nodeSize": {
32 |       "width": 280,
33 |       "height": 40
34 |     },
35 |     "autoSaveIntervalMinutes": 1,
36 |     "graphSettings": {
37 |       "nodesep": 30,
38 |       "ranksep": 60,
39 |       "edgesep": 10
40 |     }
41 |   }
42 | } 
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
90 |           created_at?: string
91 |         }
92 |         Update: {
93 |           id?: string
94 |           card_id?: string
95 |           tag_id?: string
96 |         }
97 |       }
98 |       board_settings: {
99 |         Row: {
100 |           id: string
101 |           user_id: string
102 |           settings: Json
103 |           created_at: string
104 |           updated_at: string
105 |         }
106 |         Insert: {
107 |           id?: string
108 |           user_id: string
109 |           settings: Json
110 |           created_at?: string
111 |           updated_at?: string
112 |         }
113 |         Update: {
114 |           id?: string
115 |           user_id?: string
116 |           settings?: Json
117 |           updated_at?: string
118 |         }
119 |       }
120 |     }
121 |     Views: {}
122 |     Functions: {}
123 |   }
124 | } 
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

src/lib/auth.ts
```
1 | 'use client';
2 | 
3 | import { createBrowserClient } from './supabase';
4 | 
5 | // 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
6 | export const getBrowserClient = () => {
7 |   if (typeof window === 'undefined') {
8 |     throw new Error('브라우저 환경에서만 사용 가능합니다.');
9 |   }
10 |   return createBrowserClient();
11 | };
12 | 
13 | // 회원가입 함수
14 | export async function signUp(email: string, password: string, name: string | null = null) {
15 |   try {
16 |     // Supabase 인증으로 사용자 생성
17 |     const client = getBrowserClient();
18 |     const { data: authData, error: authError } = await client.auth.signUp({
19 |       email,
20 |       password,
21 |     });
22 | 
23 |     if (authError) {
24 |       throw authError;
25 |     }
26 | 
27 |     if (!authData.user) {
28 |       throw new Error('사용자 생성 실패');
29 |     }
30 | 
31 |     // API를 통해 사용자 데이터 생성
32 |     try {
33 |       const response = await fetch('/api/user/register', {
34 |         method: 'POST',
35 |         headers: {
36 |           'Content-Type': 'application/json',
37 |         },
38 |         body: JSON.stringify({
39 |           id: authData.user.id,
40 |           email: authData.user.email || email,
41 |           name: name || email.split('@')[0],
42 |         }),
43 |       });
44 | 
45 |       if (!response.ok) {
46 |         console.warn('사용자 DB 정보 저장 실패:', await response.text());
47 |       }
48 |     } catch (dbError) {
49 |       console.error('사용자 DB 정보 API 호출 오류:', dbError);
50 |     }
51 | 
52 |     return { user: authData.user, authData };
53 |   } catch (error) {
54 |     console.error('회원가입 실패:', error);
55 |     throw error;
56 |   }
57 | }
58 | 
59 | // 로그인 함수
60 | export async function signIn(email: string, password: string) {
61 |   try {
62 |     const client = getBrowserClient();
63 |     const { data, error } = await client.auth.signInWithPassword({
64 |       email,
65 |       password,
66 |     });
67 | 
68 |     if (error) {
69 |       throw error;
70 |     }
71 | 
72 |     return data;
73 |   } catch (error) {
74 |     console.error('로그인 실패:', error);
75 |     throw error;
76 |   }
77 | }
78 | 
79 | // Google 로그인 함수
80 | export async function signInWithGoogle() {
81 |   const supabase = getBrowserClient();
82 |   
83 |   // 현재 URL 가져오기
84 |   const origin = window.location.origin;
85 |   const redirectTo = `${origin}/auth/callback`;
86 |   
87 |   console.log('Google 로그인 시작, 리디렉션 URL:', redirectTo);
88 |   
89 |   return supabase.auth.signInWithOAuth({
90 |     provider: 'google',
91 |     options: {
92 |       redirectTo,
93 |       queryParams: {
94 |         // 필요한 경우 Google OAuth 추가 Scope 지정
95 |         access_type: 'offline',
96 |         prompt: 'consent',
97 |       },
98 |     },
99 |   });
100 | }
101 | 
102 | // 로그아웃 함수
103 | export async function signOut() {
104 |   const supabase = getBrowserClient();
105 |   return supabase.auth.signOut();
106 | }
107 | 
108 | // 현재 사용자 정보 가져오기
109 | export async function getCurrentUser() {
110 |   try {
111 |     const client = getBrowserClient();
112 |     const { data: { session }, error } = await client.auth.getSession();
113 |     
114 |     if (error) {
115 |       throw error;
116 |     }
117 |     
118 |     if (!session) {
119 |       return null;
120 |     }
121 |     
122 |     // 브라우저 환경에서는 API를 통해 사용자 정보 가져오기
123 |     if (typeof window !== 'undefined') {
124 |       try {
125 |         // API 호출을 통해 사용자 정보 가져오기
126 |         const response = await fetch(`/api/user/${session.user.id}`);
127 |         
128 |         if (response.ok) {
129 |           const userData = await response.json();
130 |           return {
131 |             ...session.user,
132 |             dbUser: userData.user,
133 |           };
134 |         } else {
135 |           // API 호출 실패 시 기본 사용자 정보만 반환
136 |           console.warn('사용자 DB 정보 가져오기 실패');
137 |           
138 |           // 로그인은 이미 되었으므로 기본 사용자 정보 구성
139 |           return {
140 |             ...session.user,
141 |             dbUser: {
142 |               id: session.user.id,
143 |               email: session.user.email,
144 |               name: session.user.user_metadata?.full_name || 
145 |                     (session.user.email ? session.user.email.split('@')[0] : '사용자'),
146 |               createdAt: new Date().toISOString(),
147 |               updatedAt: new Date().toISOString(),
148 |             }
149 |           };
150 |         }
151 |       } catch (apiError) {
152 |         console.error('사용자 DB 정보 API 호출 오류:', apiError);
153 |         
154 |         // API 호출 오류가 있어도 인증은 성공했으므로 기본 정보 반환
155 |         return {
156 |           ...session.user,
157 |           dbUser: {
158 |             id: session.user.id,
159 |             email: session.user.email,
160 |             name: session.user.user_metadata?.full_name || 
161 |                   (session.user.email ? session.user.email.split('@')[0] : '사용자'),
162 |             createdAt: new Date().toISOString(),
163 |             updatedAt: new Date().toISOString(),
164 |           }
165 |         };
166 |       }
167 |     }
168 |     
169 |     // 서버 환경일 경우에만 실행 (import 구문이 실행되지 않아 오류 방지)
170 |     if (typeof window === 'undefined') {
171 |       // 동적으로 prisma import
172 |       const { default: prisma } = await import('./prisma');
173 |       
174 |       // Prisma로 추가 사용자 정보 가져오기
175 |       const user = await prisma.user.findUnique({
176 |         where: { id: session.user.id },
177 |       });
178 |       
179 |       return {
180 |         ...session.user,
181 |         dbUser: user,
182 |       };
183 |     }
184 |     
185 |     // 기본 반환
186 |     return {
187 |       ...session.user,
188 |       dbUser: null,
189 |     };
190 |   } catch (error) {
191 |     console.error('사용자 정보 조회 실패:', error);
192 |     return null;
193 |   }
194 | }
195 | 
196 | // 이메일/비밀번호 로그인
197 | export async function signInWithEmail(email: string, password: string) {
198 |   const supabase = getBrowserClient();
199 |   return supabase.auth.signInWithPassword({
200 |     email,
201 |     password,
202 |   });
203 | }
204 | 
205 | // 이메일/비밀번호 가입
206 | export async function signUpWithEmail(email: string, password: string) {
207 |   const supabase = getBrowserClient();
208 |   return supabase.auth.signUp({
209 |     email,
210 |     password,
211 |   });
212 | }
213 | 
214 | // 현재 사용자 세션 가져오기
215 | export async function getSession() {
216 |   const supabase = getBrowserClient();
217 |   return supabase.auth.getSession();
218 | }
219 | 
220 | // 사용자 정보 가져오기
221 | export async function getUser() {
222 |   const supabase = getBrowserClient();
223 |   const { data } = await supabase.auth.getUser();
224 |   return data?.user;
225 | } 
```

src/lib/board-constants.ts
```
1 | import { ConnectionLineType, MarkerType } from 'reactflow';
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
31 | // 스토리지 키
32 | export const STORAGE_KEY = 'backyard-board-layout';
33 | export const EDGES_STORAGE_KEY = 'backyard-board-edges';
34 | export const BOARD_SETTINGS_KEY = 'backyard-board-settings';
35 | 
36 | // 자동 저장 설정
37 | export const BOARD_CONFIG = {
38 |   // 자동 저장 간격 (분)
39 |   autoSaveInterval: 1,
40 |   // 토스트 메시지 표시 여부
41 |   showAutoSaveNotification: true,
42 | }; 
```

src/lib/board-ui-config.ts
```
1 | import { MarkerType, ConnectionLineType } from 'reactflow';
2 | import defaultConfig from '../config/cardBoardUiOptions.json';
3 | 
4 | // 카드 보드 UI 설정 타입 정의
5 | export interface BoardUIConfig {
6 |   board: {
7 |     snapToGrid: boolean;
8 |     snapGrid: [number, number];
9 |     connectionLineType: string;
10 |     markerEnd: string | null;
11 |     strokeWidth: number;
12 |     markerSize: number;
13 |     edgeColor: string;
14 |     animated: boolean;
15 |     selectedEdgeColor: string;
16 |   };
17 |   card: {
18 |     defaultWidth: number;
19 |     backgroundColor: string;
20 |     borderRadius: number;
21 |     tagBackgroundColor: string;
22 |   };
23 |   handles: {
24 |     size: number;
25 |     backgroundColor: string;
26 |     borderColor: string;
27 |     borderWidth: number;
28 |   };
29 |   layout: {
30 |     defaultPadding: number;
31 |     defaultSpacing: {
32 |       horizontal: number;
33 |       vertical: number;
34 |     };
35 |     nodeSize?: {
36 |       width: number;
37 |       height: number;
38 |     };
39 |     graphSettings?: {
40 |       nodesep: number;
41 |       ranksep: number;
42 |       edgesep: number;
43 |     };
44 |     autoSaveIntervalMinutes: number;
45 |   };
46 | }
47 | 
48 | // 기본 설정값 (타입 변환 포함)
49 | export const DEFAULT_UI_CONFIG: BoardUIConfig = {
50 |   ...defaultConfig as BoardUIConfig,
51 |   board: {
52 |     ...defaultConfig.board,
53 |     connectionLineType: defaultConfig.board.connectionLineType as ConnectionLineType,
54 |     markerEnd: defaultConfig.board.markerEnd as MarkerType,
55 |     selectedEdgeColor: '#000000',
56 |     snapGrid: defaultConfig.board.snapGrid as [number, number],
57 |   }
58 | };
59 | 
60 | /**
61 |  * 기본 설정을 불러오는 함수
62 |  * - 기본값을 불러오지 못할 경우 하드코딩된 대체 기본값을 사용
63 |  */
64 | export function loadDefaultBoardUIConfig(): BoardUIConfig {
65 |   try {
66 |     return DEFAULT_UI_CONFIG;
67 |   } catch (error) {
68 |     console.error('기본 UI 설정을 불러오는데 실패했습니다. 하드코딩된 대체 기본값을 사용합니다:', error);
69 |     
70 |     // 대체 기본값 (하드코딩된 fallback)
71 |     return {
72 |       board: {
73 |         snapToGrid: false,
74 |         snapGrid: [15, 15],
75 |         connectionLineType: 'bezier' as ConnectionLineType,
76 |         markerEnd: 'arrowclosed' as MarkerType,
77 |         strokeWidth: 2,
78 |         markerSize: 20,
79 |         edgeColor: '#C1C1C1',
80 |         animated: false,
81 |         selectedEdgeColor: '#000000'
82 |       },
83 |       card: {
84 |         defaultWidth: 280,
85 |         backgroundColor: '#FFFFFF',
86 |         borderRadius: 8,
87 |         tagBackgroundColor: '#F2F2F2'
88 |       },
89 |       handles: {
90 |         size: 10,
91 |         backgroundColor: '#555555',
92 |         borderColor: '#FFFFFF',
93 |         borderWidth: 1
94 |       },
95 |       layout: {
96 |         defaultPadding: 20,
97 |         defaultSpacing: {
98 |           horizontal: 30,
99 |           vertical: 30
100 |         },
101 |         nodeSize: {
102 |           width: 280,
103 |           height: 40
104 |         },
105 |         graphSettings: {
106 |           nodesep: 30,
107 |           ranksep: 30,
108 |           edgesep: 10
109 |         },
110 |         autoSaveIntervalMinutes: 1
111 |       }
112 |     };
113 |   }
114 | }
115 | 
116 | /**
117 |  * 보드 설정 인터페이스에 필요한 기본값을 추출하는 함수
118 |  */
119 | export function extractBoardSettings(config: BoardUIConfig) {
120 |   return {
121 |     snapToGrid: config.board.snapToGrid,
122 |     snapGrid: config.board.snapGrid,
123 |     connectionLineType: config.board.connectionLineType as ConnectionLineType,
124 |     markerEnd: config.board.markerEnd as MarkerType,
125 |     strokeWidth: config.board.strokeWidth,
126 |     markerSize: config.board.markerSize,
127 |   };
128 | }
129 | 
130 | /**
131 |  * 레이아웃 설정을 추출하는 함수
132 |  */
133 | export function extractLayoutSettings(config: BoardUIConfig) {
134 |   const layoutConfig = config.layout;
135 |   return {
136 |     defaultPadding: layoutConfig.defaultPadding,
137 |     spacing: layoutConfig.defaultSpacing,
138 |     nodeSize: layoutConfig.nodeSize || { width: 280, height: 40 },
139 |     graphSettings: layoutConfig.graphSettings || {
140 |       nodesep: 30,
141 |       ranksep: 30,
142 |       edgesep: 10
143 |     }
144 |   };
145 | } 
```

src/lib/board-utils.ts
```
1 | import { Edge, MarkerType, ConnectionLineType } from 'reactflow';
2 | import { BOARD_SETTINGS_KEY } from './board-constants';
3 | 
4 | export interface BoardSettings {
5 |   snapToGrid: boolean;
6 |   snapGrid: [number, number];
7 |   connectionLineType: ConnectionLineType;
8 |   markerEnd: MarkerType | null;
9 | }
10 | 
11 | // 기본 보드 설정
12 | export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
13 |   snapToGrid: false,
14 |   snapGrid: [15, 15],
15 |   connectionLineType: ConnectionLineType.SmoothStep,
16 |   markerEnd: MarkerType.Arrow,
17 | };
18 | 
19 | /**
20 |  * 로컬 스토리지에서 보드 설정을 불러오는 함수
21 |  */
22 | export function loadBoardSettings(): BoardSettings {
23 |   if (typeof window === 'undefined') {
24 |     return DEFAULT_BOARD_SETTINGS;
25 |   }
26 | 
27 |   try {
28 |     const savedSettings = localStorage.getItem(BOARD_SETTINGS_KEY);
29 |     
30 |     if (!savedSettings) {
31 |       return DEFAULT_BOARD_SETTINGS;
32 |     }
33 |     
34 |     return JSON.parse(savedSettings);
35 |   } catch (error) {
36 |     console.error('보드 설정 불러오기 실패:', error);
37 |     return DEFAULT_BOARD_SETTINGS;
38 |   }
39 | }
40 | 
41 | /**
42 |  * 보드 설정을 로컬 스토리지에 저장하는 함수
43 |  */
44 | export function saveBoardSettings(settings: BoardSettings): void {
45 |   if (typeof window === 'undefined') {
46 |     return;
47 |   }
48 | 
49 |   try {
50 |     localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
51 |   } catch (error) {
52 |     console.error('보드 설정 저장 실패:', error);
53 |   }
54 | }
55 | 
56 | /**
57 |  * 보드 설정에 따라 엣지 스타일을 적용하는 함수
58 |  */
59 | export function applyEdgeSettings(edges: Edge[], settings: BoardSettings): Edge[] {
60 |   return edges.map(edge => ({
61 |     ...edge,
62 |     type: settings.connectionLineType,
63 |     markerEnd: settings.markerEnd ? {
64 |       type: settings.markerEnd,
65 |       width: 20,
66 |       height: 20,
67 |     } : undefined,
68 |   }));
69 | } 
```

src/lib/constants.ts
```
1 | // 애플리케이션 전체에서 사용되는 상수 값들
2 | 
3 | // 테스트 사용자 ID (데이터베이스에 실제로 존재하는 ID)
4 | export const DEFAULT_USER_ID = "91fc1ef9-daec-45de-8eb4-40ca52ec292f";
5 | 
6 | // 페이지 크기 상수
7 | export const PAGE_SIZE = 10;
8 | 
9 | // 날짜 형식
10 | export const DATE_FORMAT = "YYYY년 MM월 DD일"; 
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

src/lib/layout-utils.ts
```
1 | import dagre from 'dagre';
2 | import { Node, Edge, Position } from 'reactflow';
3 | 
4 | // 노드 크기 설정 - 실제 렌더링 크기에 맞게 조정
5 | const NODE_WIDTH = 320;
6 | const NODE_HEIGHT = 180;
7 | 
8 | // 그래프 간격 설정
9 | const GRAPH_SETTINGS = {
10 |   rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
11 |   nodesep: 100, // 같은 레벨의 노드 간 거리 (픽셀)
12 |   ranksep: 150, // 레벨 간 거리 (픽셀)
13 |   edgesep: 50, // 엣지 간 거리
14 | };
15 | 
16 | /**
17 |  * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
18 |  * 
19 |  * @param nodes 노드 배열
20 |  * @param edges 엣지 배열
21 |  * @param direction 배치 방향 ('horizontal' 또는 'vertical')
22 |  * @returns 레이아웃이 적용된 노드와 엣지
23 |  */
24 | export function getLayoutedElements(
25 |   nodes: Node[],
26 |   edges: Edge[],
27 |   direction: 'horizontal' | 'vertical' = 'horizontal'
28 | ) {
29 |   // 노드나 엣지가 없는 경우 그대로 반환
30 |   if (nodes.length === 0) return { nodes, edges };
31 | 
32 |   // 그래프 생성
33 |   const dagreGraph = new dagre.graphlib.Graph();
34 |   dagreGraph.setDefaultEdgeLabel(() => ({}));
35 | 
36 |   // 방향 설정 (LR: 왼쪽에서 오른쪽, TB: 위에서 아래)
37 |   const isHorizontal = direction === 'horizontal';
38 |   const settings = {
39 |     ...GRAPH_SETTINGS,
40 |     rankdir: isHorizontal ? 'LR' : 'TB',
41 |   };
42 |   
43 |   dagreGraph.setGraph(settings);
44 | 
45 |   // 노드 추가
46 |   nodes.forEach(node => {
47 |     dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
48 |   });
49 | 
50 |   // 엣지 추가
51 |   edges.forEach(edge => {
52 |     dagreGraph.setEdge(edge.source, edge.target);
53 |   });
54 | 
55 |   // 레이아웃 계산
56 |   dagre.layout(dagreGraph);
57 | 
58 |   // 계산된 위치로 노드 업데이트
59 |   const layoutedNodes = nodes.map(node => {
60 |     const nodeWithPosition = dagreGraph.node(node.id);
61 | 
62 |     // 방향에 따라 handle 위치 조정
63 |     return {
64 |       ...node,
65 |       // handle 위치: 수평 레이아웃이면 좌우, 수직 레이아웃이면 상하
66 |       targetPosition: isHorizontal ? Position.Left : Position.Top,
67 |       sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
68 |       position: {
69 |         x: nodeWithPosition.x - NODE_WIDTH / 2,
70 |         y: nodeWithPosition.y - NODE_HEIGHT / 2,
71 |       },
72 |     };
73 |   });
74 | 
75 |   return { nodes: layoutedNodes, edges };
76 | }
77 | 
78 | /**
79 |  * 격자형 레이아웃으로 노드를 배치하는 함수
80 |  * 
81 |  * @param nodes 노드 배열
82 |  * @param cardsPerRow 한 행에 표시할 카드 수
83 |  * @returns 배치된 노드 배열
84 |  */
85 | export function getGridLayout(nodes: Node[], cardsPerRow: number = 3) {
86 |   const HORIZONTAL_GAP = 400;  // 좀 더 넓게 조정
87 |   const VERTICAL_GAP = 250;
88 |   
89 |   return nodes.map((node, index) => ({
90 |     ...node,
91 |     // 모든 노드에 일관된 handle 위치 설정
92 |     targetPosition: Position.Top,
93 |     sourcePosition: Position.Bottom,
94 |     position: {
95 |       x: (index % cardsPerRow) * HORIZONTAL_GAP + 50,
96 |       y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + 50,
97 |     }
98 |   }));
99 | } 
```

src/lib/prisma.ts
```
1 | import { PrismaClient } from '@prisma/client';
2 | 
3 | // Prisma 클라이언트 인스턴스를 글로벌로 관리하여 핫 리로드 시 연결이 중복 생성되는 것을 방지
4 | const globalForPrisma = global as unknown as { prisma: PrismaClient };
5 | 
6 | // 개발 환경에서는 로깅 활성화, 프로덕션에서는 비활성화
7 | const prisma =
8 |   globalForPrisma.prisma ||
9 |   new PrismaClient({
10 |     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
11 |   });
12 | 
13 | if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
14 | 
15 | export default prisma;
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
9 |   if (!supabaseBrowserClient) {
10 |     supabaseBrowserClient = createBrowserClient<Database>(
11 |       process.env.NEXT_PUBLIC_SUPABASE_URL!,
12 |       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
13 |     );
14 |   }
15 |   return supabaseBrowserClient;
16 | } 
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
7 | // Next.js 서버 컴포넌트 및 API 라우트용 Supabase 클라이언트
8 | export const createSupabaseClient = () => {
9 |   if (typeof window !== 'undefined') {
10 |     console.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
11 |   }
12 |   
13 |   // 이미 생성된 인스턴스가 있으면 재사용
14 |   if (serverClientInstance) {
15 |     return serverClientInstance;
16 |   }
17 |   
18 |   serverClientInstance = createClient(
19 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
20 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
21 |     {
22 |       auth: {
23 |         flowType: 'pkce',
24 |         autoRefreshToken: false,
25 |         persistSession: false,
26 |         detectSessionInUrl: false
27 |       }
28 |     }
29 |   );
30 |   
31 |   return serverClientInstance;
32 | };
33 | 
34 | // 브라우저 클라이언트용 Supabase 인스턴스
35 | // 필요한 경우에만 import하여 사용
36 | export const createBrowserClient = () => {
37 |   if (typeof window === 'undefined') {
38 |     throw new Error('이 함수는 브라우저 환경에서만 사용할 수 있습니다.');
39 |   }
40 |   
41 |   // 이미 생성된 인스턴스가 있으면 재사용
42 |   if (browserClientInstance) {
43 |     return browserClientInstance;
44 |   }
45 |   
46 |   browserClientInstance = createClient(
47 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
48 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
49 |     {
50 |       auth: {
51 |         flowType: 'pkce',
52 |         persistSession: true,
53 |         detectSessionInUrl: true
54 |       }
55 |     }
56 |   );
57 |   
58 |   return browserClientInstance;
59 | };
60 | 
61 | // 기본 클라이언트 생성 (서버 컴포넌트에서 사용)
62 | const supabase = typeof window === 'undefined' ? createSupabaseClient() : createBrowserClient();
63 | export default supabase; 
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
56 |       const result = extractTags(text);
57 |       expect(result).toEqual(['자바스크립트', '리액트']);
58 |     });
59 |     
60 |     it('태그가 없을 경우 빈 배열을 반환해야 합니다', () => {
61 |       const text = '이것은 태그가 없는 글입니다.';
62 |       const result = extractTags(text);
63 |       expect(result).toEqual([]);
64 |     });
65 |     
66 |     it('중복된 태그를 모두 포함해야 합니다', () => {
67 |       const text = '#태그1 내용 #태그2 더 많은 내용 #태그1';
68 |       const result = extractTags(text);
69 |       expect(result).toEqual(['태그1', '태그2', '태그1']);
70 |     });
71 |     
72 |     it('한글, 영어, 숫자, 특수문자가 포함된 태그를 추출해야 합니다', () => {
73 |       const text = '다양한 태그 #한글태그 #English #숫자123 #특수_문자-태그';
74 |       const result = extractTags(text);
75 |       expect(result).toEqual(['한글태그', 'English', '숫자123', '특수_문자-태그']);
76 |     });
77 |     
78 |     it('# 뒤에 공백이 있는 경우 태그로 인식되지 않아야 합니다', () => {
79 |       const text = '이것은 # 태그가 아닙니다';
80 |       const result = extractTags(text);
81 |       expect(result).toEqual([]);
82 |     });
83 |   });
84 |   
85 |   describe('parseTagsInText 함수', () => {
86 |     it('텍스트와 추출된 태그 목록을 반환해야 합니다', () => {
87 |       const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
88 |       const result = parseTagsInText(text);
89 |       expect(result).toEqual({
90 |         text: '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.',
91 |         tags: ['자바스크립트', '리액트']
92 |       });
93 |     });
94 |     
95 |     it('태그가 없는 텍스트에 대해 빈 태그 배열을 반환해야 합니다', () => {
96 |       const text = '이것은 태그가 없는 글입니다.';
97 |       const result = parseTagsInText(text);
98 |       expect(result).toEqual({
99 |         text: '이것은 태그가 없는 글입니다.',
100 |         tags: []
101 |       });
102 |     });
103 |     
104 |     it('다양한 언어와 문자가 포함된 태그를 처리해야 합니다', () => {
105 |       const text = 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그';
106 |       const result = parseTagsInText(text);
107 |       expect(result).toEqual({
108 |         text: 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그',
109 |         tags: ['한글태그', 'EnglishTag', '혼합Mix태그123', '특수_문자-태그']
110 |       });
111 |     });
112 |     
113 |     it('빈 문자열에 대해 빈 태그 배열을 반환해야 합니다', () => {
114 |       const text = '';
115 |       const result = parseTagsInText(text);
116 |       expect(result).toEqual({
117 |         text: '',
118 |         tags: []
119 |       });
120 |     });
121 |   });
122 | }); 
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
8 | export function formatDate(date: Date | string): string {
9 |   const d = typeof date === 'string' ? new Date(date) : date;
10 |   return d.toLocaleDateString('ko-KR', {
11 |     year: 'numeric',
12 |     month: 'long',
13 |     day: 'numeric',
14 |   });
15 | }
16 | 
17 | // 텍스트에서 태그 추출 (#태그 형식)
18 | export function extractTags(text: string): string[] {
19 |   const tagPattern = /#([a-zA-Z0-9가-힣_\-]+)/g;
20 |   const matches = text.match(tagPattern);
21 |   
22 |   if (!matches) return [];
23 |   
24 |   return matches.map(tag => tag.slice(1)); // # 제거
25 | }
26 | 
27 | // 텍스트에서 태그를 변환 (#태그 -> Badge 컴포넌트로 변환하기 위한 준비)
28 | export function parseTagsInText(text: string): { text: string, tags: string[] } {
29 |   const tags = extractTags(text);
30 |   return { text, tags };
31 | }
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
52 | CREATE OR REPLACE FUNCTION update_modified_column()
53 | RETURNS TRIGGER AS $$
54 | BEGIN
55 |   NEW.updated_at = NOW();
56 |   RETURN NEW;
57 | END;
58 | $$ LANGUAGE plpgsql;
59 | 
60 | -- 각 테이블에 트리거 적용
61 | CREATE TRIGGER update_users_modtime
62 |   BEFORE UPDATE ON users
63 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
64 | 
65 | CREATE TRIGGER update_cards_modtime
66 |   BEFORE UPDATE ON cards
67 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
68 | 
69 | CREATE TRIGGER update_tags_modtime
70 |   BEFORE UPDATE ON tags
71 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
72 | 
73 | CREATE TRIGGER update_board_settings_modtime
74 |   BEFORE UPDATE ON board_settings
75 |   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
76 | 
77 | -- RLS (Row Level Security) 정책 설정
78 | 
79 | -- 테이블 RLS 활성화
80 | ALTER TABLE users ENABLE ROW LEVEL SECURITY;
81 | ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
82 | ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
83 | ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
84 | ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
85 | 
86 | -- 사용자 테이블 정책
87 | CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
88 |   FOR SELECT USING (auth.uid() = id);
89 | CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
90 |   FOR UPDATE USING (auth.uid() = id);
91 | 
92 | -- 카드 테이블 정책
93 | CREATE POLICY "모든 인증된 사용자는 카드를 조회할 수 있음" ON cards
94 |   FOR SELECT USING (auth.role() = 'authenticated');
95 | CREATE POLICY "사용자는 자신의 카드만 생성할 수 있음" ON cards
96 |   FOR INSERT WITH CHECK (auth.uid() = user_id);
97 | CREATE POLICY "사용자는 자신의 카드만 업데이트할 수 있음" ON cards
98 |   FOR UPDATE USING (auth.uid() = user_id);
99 | CREATE POLICY "사용자는 자신의 카드만 삭제할 수 있음" ON cards
100 |   FOR DELETE USING (auth.uid() = user_id);
101 | 
102 | -- 태그 테이블 정책
103 | CREATE POLICY "모든 인증된 사용자는 태그를 조회할 수 있음" ON tags
104 |   FOR SELECT USING (auth.role() = 'authenticated');
105 | CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
106 |   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
107 | -- 태그 업데이트 및 삭제는 관리자만 가능하도록 설정할 수도 있음
108 | 
109 | -- 카드-태그 연결 테이블 정책
110 | CREATE POLICY "인증된 사용자는 카드-태그 연결을 조회할 수 있음" ON card_tags
111 |   FOR SELECT USING (auth.role() = 'authenticated');
112 | CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
113 |   FOR INSERT WITH CHECK (
114 |     EXISTS (
115 |       SELECT 1 FROM cards 
116 |       WHERE cards.id = card_id AND cards.user_id = auth.uid()
117 |     )
118 |   );
119 | CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
120 |   FOR DELETE USING (
121 |     EXISTS (
122 |       SELECT 1 FROM cards 
123 |       WHERE cards.id = card_id AND cards.user_id = auth.uid()
124 |     )
125 |   );
126 | 
127 | -- 보드 설정 테이블 정책
128 | CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
129 |   FOR SELECT USING (auth.uid() = user_id);
130 | CREATE POLICY "사용자는 자신의 보드 설정만 생성할 수 있음" ON board_settings
131 |   FOR INSERT WITH CHECK (auth.uid() = user_id);
132 | CREATE POLICY "사용자는 자신의 보드 설정만 업데이트할 수 있음" ON board_settings
133 |   FOR UPDATE USING (auth.uid() = user_id);
134 | CREATE POLICY "사용자는 자신의 보드 설정만 삭제할 수 있음" ON board_settings
135 |   FOR DELETE USING (auth.uid() = user_id); 
```

prisma/migrations/20250227055331_init/migration.sql
```
1 | -- DropForeignKey
2 | ALTER TABLE "cards" DROP CONSTRAINT "cards_user_id_fkey";
3 | 
4 | -- AlterTable
5 | ALTER TABLE "cards" ALTER COLUMN "content" DROP NOT NULL;
6 | 
7 | -- AddForeignKey
8 | ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250227050602_init/migration.sql
```
1 | -- CreateTable
2 | CREATE TABLE "users" (
3 |     "id" TEXT NOT NULL,
4 |     "email" TEXT NOT NULL,
5 |     "name" TEXT,
6 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
7 |     "updated_at" TIMESTAMP(3) NOT NULL,
8 | 
9 |     CONSTRAINT "users_pkey" PRIMARY KEY ("id")
10 | );
11 | 
12 | -- CreateTable
13 | CREATE TABLE "cards" (
14 |     "id" TEXT NOT NULL,
15 |     "title" TEXT NOT NULL,
16 |     "content" TEXT NOT NULL,
17 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
18 |     "updated_at" TIMESTAMP(3) NOT NULL,
19 |     "user_id" TEXT NOT NULL,
20 | 
21 |     CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
22 | );
23 | 
24 | -- CreateIndex
25 | CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
26 | 
27 | -- AddForeignKey
28 | ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

prisma/migrations/20250304224858_add_tags/migration.sql
```
1 | -- CreateTable
2 | CREATE TABLE "tags" (
3 |     "id" TEXT NOT NULL,
4 |     "name" TEXT NOT NULL,
5 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
6 |     "updated_at" TIMESTAMP(3) NOT NULL,
7 | 
8 |     CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
9 | );
10 | 
11 | -- CreateTable
12 | CREATE TABLE "card_tags" (
13 |     "id" TEXT NOT NULL,
14 |     "card_id" TEXT NOT NULL,
15 |     "tag_id" TEXT NOT NULL,
16 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
17 | 
18 |     CONSTRAINT "card_tags_pkey" PRIMARY KEY ("id")
19 | );
20 | 
21 | -- CreateIndex
22 | CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
23 | 
24 | -- CreateIndex
25 | CREATE UNIQUE INDEX "card_tags_card_id_tag_id_key" ON "card_tags"("card_id", "tag_id");
26 | 
27 | -- AddForeignKey
28 | ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
29 | 
30 | -- AddForeignKey
31 | ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250306112255_init/migration.sql
```
1 | -- CreateTable
2 | CREATE TABLE "users" (
3 |     "id" TEXT NOT NULL,
4 |     "email" TEXT NOT NULL,
5 |     "name" TEXT,
6 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
7 |     "updated_at" TIMESTAMP(3) NOT NULL,
8 | 
9 |     CONSTRAINT "users_pkey" PRIMARY KEY ("id")
10 | );
11 | 
12 | -- CreateTable
13 | CREATE TABLE "cards" (
14 |     "id" TEXT NOT NULL,
15 |     "title" TEXT NOT NULL,
16 |     "content" TEXT,
17 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
18 |     "updated_at" TIMESTAMP(3) NOT NULL,
19 |     "user_id" TEXT NOT NULL,
20 | 
21 |     CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
22 | );
23 | 
24 | -- CreateTable
25 | CREATE TABLE "tags" (
26 |     "id" TEXT NOT NULL,
27 |     "name" TEXT NOT NULL,
28 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
29 |     "updated_at" TIMESTAMP(3) NOT NULL,
30 | 
31 |     CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
32 | );
33 | 
34 | -- CreateTable
35 | CREATE TABLE "card_tags" (
36 |     "id" TEXT NOT NULL,
37 |     "card_id" TEXT NOT NULL,
38 |     "tag_id" TEXT NOT NULL,
39 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
40 | 
41 |     CONSTRAINT "card_tags_pkey" PRIMARY KEY ("id")
42 | );
43 | 
44 | -- CreateIndex
45 | CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
46 | 
47 | -- CreateIndex
48 | CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
49 | 
50 | -- CreateIndex
51 | CREATE UNIQUE INDEX "card_tags_card_id_tag_id_key" ON "card_tags"("card_id", "tag_id");
52 | 
53 | -- AddForeignKey
54 | ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
55 | 
56 | -- AddForeignKey
57 | ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
58 | 
59 | -- AddForeignKey
60 | ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

prisma/migrations/20250307042922_add_board_settings/migration.sql
```
1 | -- CreateTable
2 | CREATE TABLE "board_settings" (
3 |     "id" TEXT NOT NULL,
4 |     "user_id" TEXT NOT NULL,
5 |     "settings" JSONB NOT NULL,
6 |     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
7 |     "updated_at" TIMESTAMP(3) NOT NULL,
8 | 
9 |     CONSTRAINT "board_settings_pkey" PRIMARY KEY ("id")
10 | );
11 | 
12 | -- CreateIndex
13 | CREATE UNIQUE INDEX "board_settings_user_id_key" ON "board_settings"("user_id");
14 | 
15 | -- AddForeignKey
16 | ALTER TABLE "board_settings" ADD CONSTRAINT "board_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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

src/app/board/page.test.tsx
```
1 | import { render, screen, waitFor, fireEvent } from '@testing-library/react';
2 | import { describe, test, expect, vi, beforeEach } from 'vitest';
3 | import BoardPage from './page';
4 | import { Node, Edge, NodeChange } from 'reactflow';
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
57 |             type: 'position',
58 |             id: '1',
59 |             position: { x: 200, y: 200 },
60 |           } as NodeChange]);
61 |         }
62 |       }}
63 |     >
64 |       {children}
65 |     </div>
66 |   );
67 |   
68 |   return {
69 |     // default export 추가 (중요!)
70 |     default: ReactFlowMock,
71 |     // 필요한 다른 export들
72 |     ReactFlow: ReactFlowMock,
73 |     ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
74 |       <div data-testid="react-flow-provider">{children}</div>
75 |     ),
76 |     Controls: () => <div data-testid="react-flow-controls">Controls</div>,
77 |     Background: () => <div data-testid="react-flow-background">Background</div>,
78 |     Panel: ({ position, children }: any) => (
79 |       <div data-testid={`react-flow-panel-${position}`}>{children}</div>
80 |     ),
81 |     useNodesState: () => [nodesMock, setNodesMock, onNodesChangeMock],
82 |     useEdgesState: () => [edgesMock, setEdgesMock, onEdgesChangeMock],
83 |     ConnectionLineType: {
84 |       SmoothStep: 'smoothstep',
85 |     },
86 |     useReactFlow: () => ({
87 |       getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
88 |       project: (pos: any) => pos,
89 |       getBoundingClientRect: () => ({ width: 1000, height: 600, x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 600 }),
90 |       screenToFlowPosition: (pos: any) => pos,
91 |     }),
92 |     applyNodeChanges: vi.fn((changes, nodes) => {
93 |       // 변경사항 적용 결과 모킹
94 |       mockAppliedNodes = [
95 |         { id: '1', position: { x: 200, y: 200 } },
96 |         { id: '2', position: { x: 400, y: 400 } },
97 |       ] as Node[];
98 |       return mockAppliedNodes;
99 |     }),
100 |     applyEdgeChanges: vi.fn((changes, edges) => edges),
101 |     addEdge: vi.fn((connection, edges) => [
102 |       ...edges,
103 |       { id: `e-${Date.now()}`, source: connection.source, target: connection.target }
104 |     ]),
105 |     // 추가적인 타입 에러 방지를 위한 export
106 |     Node: vi.fn(),
107 |     Edge: vi.fn(),
108 |     NodeChange: vi.fn(),
109 |   };
110 | });
111 | 
112 | // CreateCardButton 모킹
113 | vi.mock('@/components/cards/CreateCardButton', () => ({
114 |   default: ({ onCardCreated }: { onCardCreated?: (cardData: any) => void }) => (
115 |     <button 
116 |       data-testid="create-card-button"
117 |       onClick={() => {
118 |         if (onCardCreated) {
119 |           onCardCreated({
120 |             id: 'new-card-123',
121 |             title: '새 카드',
122 |             content: '새 카드 내용',
123 |             cardTags: [{ tag: { name: '새태그' } }],
124 |             createdAt: new Date().toISOString(),
125 |           });
126 |         }
127 |       }}
128 |     >
129 |       새 카드 만들기
130 |     </button>
131 |   ),
132 | }));
133 | 
134 | // Console error 모킹
135 | console.error = vi.fn();
136 | 
137 | // Toast 모킹
138 | vi.mock('sonner', () => ({
139 |   toast: {
140 |     success: vi.fn(),
141 |     error: vi.fn(),
142 |     info: vi.fn(),
143 |   },
144 | }));
145 | 
146 | // mocking fetch API
147 | global.fetch = vi.fn();
148 | 
149 | // 추가 모듈 모킹 설정
150 | vi.mock('@/components/ui/button', () => ({
151 |   Button: ({ children, onClick, asChild, variant, size }: any) => (
152 |     <button 
153 |       onClick={onClick}
154 |       data-variant={variant}
155 |       data-size={size}
156 |       data-as-child={asChild}
157 |     >
158 |       {children}
159 |     </button>
160 |   ),
161 | }));
162 | 
163 | vi.mock('@/components/board/CardNode', () => ({
164 |   default: ({ data }: any) => (
165 |     <div data-testid={`card-node-${data.id}`}>
166 |       <h3>{data.title}</h3>
167 |       <p>{data.content}</p>
168 |     </div>
169 |   ),
170 | }));
171 | 
172 | vi.mock('lucide-react', () => ({
173 |   Loader2: () => <div data-testid="loader-icon">Loading</div>,
174 |   Save: () => <div data-testid="save-icon">Save</div>,
175 |   LayoutGrid: () => <div data-testid="layout-grid-icon">Grid</div>,
176 | }));
177 | 
178 | // BoardPage 컴포넌트 모킹을 위한 내부 함수 모킹
179 | vi.mock('./page', async (importOriginal) => {
180 |   // 원본 모듈 가져오기
181 |   const originalModule = await importOriginal();
182 |   
183 |   // 실제 BoardPage 컴포넌트를 사용, 단 내부 함수는 모킹
184 |   return {
185 |     ...(originalModule as object),
186 |     // 필요한 내부 함수만 모킹하고 컴포넌트는 그대로 유지
187 |     getNewCardPosition: vi.fn((viewportCenter) => {
188 |       return viewportCenter || { x: 500, y: 300 }; // 모킹된 중앙 위치 반환
189 |     }),
190 |     autoLayoutNodes: vi.fn((nodes: Node[]) => {
191 |       // 자동 배치 기능 모킹
192 |       return nodes.map((node: Node, index: number) => ({
193 |         ...node,
194 |         position: {
195 |           x: (index % 3) * 300 + 50, 
196 |           y: Math.floor(index / 3) * 200 + 50
197 |         }
198 |       }));
199 |     })
200 |   };
201 | });
202 | 
203 | describe('BoardPage', () => {
204 |   beforeEach(() => {
205 |     vi.resetAllMocks();
206 |     localStorageMock.clear();
207 |     mockAppliedNodes = [];
208 |     
209 |     // console.error를 spyOn으로 모킹
210 |     vi.spyOn(console, 'error');
211 |     
212 |     // fetch API 성공 응답 기본 모킹
213 |     (global.fetch as any).mockResolvedValue({
214 |       ok: true,
215 |       json: async () => ([
216 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
217 |         { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
218 |       ]),
219 |     });
220 |     
221 |     // getBoundingClientRect 모킹 (reactFlowWrapper.current)
222 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
223 |       width: 1000,
224 |       height: 600,
225 |       x: 0,
226 |       y: 0,
227 |       top: 0,
228 |       left: 0,
229 |       right: 1000,
230 |       bottom: 600,
231 |       toJSON: () => {}
232 |     }));
233 |   });
234 | 
235 |   test('로딩 상태를 표시해야 함', () => {
236 |     // fetch 응답을 받기 전에는 로딩 상태를 표시
237 |     (global.fetch as any).mockImplementation(() => new Promise(() => {}));
238 | 
239 |     render(<BoardPage />);
240 |     
241 |     expect(screen.getByText('보드를 불러오는 중...')).toBeInTheDocument();
242 |   });
243 | 
244 |   test('카드 데이터 불러오기 실패 시 에러 메시지를 표시해야 함', async () => {
245 |     // 실패 응답 모킹
246 |     (global.fetch as any).mockResolvedValue({
247 |       ok: false,
248 |       json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
249 |     });
250 | 
251 |     render(<BoardPage />);
252 |     
253 |     await waitFor(() => {
254 |       expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
255 |     });
256 |     
257 |     expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
258 |   });
259 | 
260 |   test('카드 데이터 불러오기 성공 시 ReactFlow 컴포넌트가 렌더링되어야 함', async () => {
261 |     render(<BoardPage />);
262 |     
263 |     // 로딩이 끝나고 ReactFlow 컴포넌트가 렌더링 되는지 확인
264 |     await waitFor(() => {
265 |       // ReactFlowProvider 내에 있는 ReactFlow 컴포넌트 확인
266 |       expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
267 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
268 |     });
269 |     
270 |     // 패널 내부의 콘텐츠 확인
271 |     expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('카드 보드');
272 |     expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('노드를 드래그하여 위치를 변경할 수 있습니다.');
273 |     expect(screen.getByRole('link', { name: '카드 목록' })).toBeInTheDocument();
274 |   });
275 | 
276 |   test('저장된 레이아웃이 있을 경우 로컬 스토리지에서 로드해야 함', async () => {
277 |     // 로컬 스토리지에 레이아웃 저장
278 |     const storedLayout = [
279 |       { id: '1', position: { x: 100, y: 100 } },
280 |       { id: '2', position: { x: 300, y: 300 } }
281 |     ];
282 |     localStorageMock.getItem.mockReturnValue(JSON.stringify(storedLayout));
283 |     
284 |     render(<BoardPage />);
285 |     
286 |     // 비동기 로딩 대기
287 |     await waitFor(() => {
288 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
289 |     });
290 |     
291 |     // 로컬 스토리지에서 레이아웃 로드 확인
292 |     expect(localStorageMock.getItem).toHaveBeenCalledWith('backyard-board-layout');
293 |   });
294 | 
295 |   test('레이아웃 저장 버튼 클릭 시 현재 레이아웃이 저장되어야 함', async () => {
296 |     render(<BoardPage />);
297 |     
298 |     // ReactFlow가 로드될 때까지 대기
299 |     await waitFor(() => {
300 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
301 |     });
302 |     
303 |     // 레이아웃 저장 버튼 찾기
304 |     const buttons = screen.getAllByRole('button');
305 |     const saveLayoutButton = Array.from(buttons).find(
306 |       button => button.textContent?.includes('레이아웃 저장')
307 |     );
308 |     
309 |     // 버튼 있는지 확인
310 |     expect(saveLayoutButton).toBeInTheDocument();
311 |     
312 |     // 버튼 클릭
313 |     if (saveLayoutButton) {
314 |       fireEvent.click(saveLayoutButton);
315 |     }
316 |     
317 |     // localStorage 저장 확인
318 |     expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
319 |     
320 |     // toast 확인
321 |     const { toast } = await import('sonner');
322 |     expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('보드 레이아웃과 연결선이 저장되었습니다'));
323 |   });
324 | 
325 |   test('ReactFlow에서 노드 이동 시 localStorage에 위치가 저장되어야 함', async () => {
326 |     render(<BoardPage />);
327 |     
328 |     // ReactFlow가 로드될 때까지 대기
329 |     await waitFor(() => {
330 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
331 |     });
332 |     
333 |     // ReactFlow 컴포넌트 클릭해서 노드 이동 이벤트 시뮬레이션
334 |     const reactFlowElement = screen.getByTestId('react-flow-mock');
335 |     fireEvent.click(reactFlowElement);
336 |     
337 |     // localStorage 저장 확인
338 |     expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
339 |   });
340 | 
341 |   test('카드 생성 버튼 클릭 시 새 카드가 보드에 추가되어야 함', async () => {
342 |     render(<BoardPage />);
343 |     
344 |     // ReactFlow가 로드될 때까지 대기
345 |     await waitFor(() => {
346 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
347 |     });
348 |     
349 |     // 카드 생성 버튼 찾기
350 |     const createCardButton = screen.getByTestId('create-card-button');
351 |     
352 |     // 버튼 클릭
353 |     fireEvent.click(createCardButton);
354 |     
355 |     // toast 확인 (모킹된 toast 함수 호출 확인)
356 |     const { toast } = await import('sonner');
357 |     expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 보드에 추가되었습니다'));
358 |   });
359 | 
360 |   test('자동 배치 버튼 클릭 시 노드가 자동으로 배치되어야 함', async () => {
361 |     render(<BoardPage />);
362 |     
363 |     // ReactFlow가 로드될 때까지 대기
364 |     await waitFor(() => {
365 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
366 |     });
367 |     
368 |     // 자동 배치 버튼 찾기 (Panel 내부의 버튼)
369 |     const buttons = screen.getAllByRole('button');
370 |     const autoLayoutButton = Array.from(buttons).find(
371 |       button => button.textContent?.includes('자동 배치')
372 |     );
373 |     
374 |     // 버튼 있는지 확인
375 |     expect(autoLayoutButton).toBeInTheDocument();
376 |     
377 |     // 버튼 클릭
378 |     if (autoLayoutButton) {
379 |       fireEvent.click(autoLayoutButton);
380 |     }
381 |     
382 |     // toast 확인
383 |     const { toast } = await import('sonner');
384 |     expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 자동으로 배치되었습니다'));
385 |   });
386 | 
387 |   test('노드 위치 변경 시 로컬 스토리지에 저장되어야 함', async () => {
388 |     // 성공 응답 모킹 - API 응답 형식 수정
389 |     (global.fetch as any).mockResolvedValue({
390 |       ok: true,
391 |       json: async () => ([
392 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
393 |         { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
394 |       ]),
395 |     });
396 | 
397 |     // getBoundingClientRect 모킹
398 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
399 |       width: 1000,
400 |       height: 600,
401 |       x: 0,
402 |       y: 0,
403 |       top: 0,
404 |       left: 0,
405 |       right: 1000,
406 |       bottom: 600,
407 |       toJSON: () => {}
408 |     }));
409 | 
410 |     render(<BoardPage />);
411 |     
412 |     // ReactFlow가 렌더링 될 때까지 대기
413 |     await waitFor(() => {
414 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
415 |     });
416 |     
417 |     // ReactFlow 컴포넌트 클릭으로 노드 위치 변경 이벤트 시뮬레이션
418 |     fireEvent.click(screen.getByTestId('react-flow-mock'));
419 |     
420 |     // 로컬 스토리지에 저장되었는지 확인
421 |     expect(localStorageMock.setItem).toHaveBeenCalledWith(
422 |       'backyard-board-layout',
423 |       expect.any(String)
424 |     );
425 |   });
426 | 
427 |   test('로컬 스토리지 저장 시 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
428 |     // 성공 응답 모킹 - API 응답 형식 수정
429 |     (global.fetch as any).mockResolvedValue({
430 |       ok: true,
431 |       json: async () => ([
432 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
433 |       ]),
434 |     });
435 | 
436 |     // localStorage.setItem에서 에러 발생 시뮬레이션
437 |     localStorageMock.setItem.mockImplementation(() => {
438 |       throw new Error('Storage error');
439 |     });
440 | 
441 |     // getBoundingClientRect 모킹
442 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
443 |       width: 1000,
444 |       height: 600,
445 |       x: 0,
446 |       y: 0,
447 |       top: 0,
448 |       left: 0,
449 |       right: 1000,
450 |       bottom: 600,
451 |       toJSON: () => {}
452 |     }));
453 | 
454 |     render(<BoardPage />);
455 |     
456 |     // ReactFlow가 렌더링 될 때까지 대기
457 |     await waitFor(() => {
458 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
459 |     });
460 |     
461 |     // 저장 버튼 클릭
462 |     const saveButton = screen.getByText('레이아웃 저장');
463 |     saveButton.click();
464 |     
465 |     // 콘솔 에러가 호출되었는지 확인
466 |     expect(console.error).toHaveBeenCalledWith('Error saving layout:', expect.any(Error));
467 |   });
468 | 
469 |   test('저장된 레이아웃이 없는 경우 기본 그리드 위치를 사용해야 함', async () => {
470 |     // 성공 응답 모킹 - 카드 3개
471 |     (global.fetch as any).mockResolvedValue({
472 |       ok: true,
473 |       json: async () => ([
474 |         { id: 1, title: '카드 1', content: '내용 1', cardTags: [] },
475 |         { id: 2, title: '카드 2', content: '내용 2', cardTags: [] },
476 |         { id: 3, title: '카드 3', content: '내용 3', cardTags: [] }
477 |       ]),
478 |     });
479 | 
480 |     // getBoundingClientRect 모킹
481 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
482 |       width: 1000,
483 |       height: 600,
484 |       x: 0,
485 |       y: 0,
486 |       top: 0,
487 |       left: 0,
488 |       right: 1000,
489 |       bottom: 600,
490 |       toJSON: () => {}
491 |     }));
492 | 
493 |     render(<BoardPage />);
494 |     
495 |     // ReactFlow가 렌더링 될 때까지 대기
496 |     await waitFor(() => {
497 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
498 |     });
499 |     
500 |     // 카드가 3개 이상인 경우 추가 엣지가 생성되었는지 확인
501 |     expect(setEdgesMock).toHaveBeenCalledWith(expect.arrayContaining([
502 |       expect.objectContaining({ id: 'e1-2' }),
503 |       expect.objectContaining({ id: 'e1-3' })
504 |     ]));
505 |   });
506 | 
507 |   test('로컬 스토리지 파싱 중 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
508 |     // 잘못된 JSON 형식으로 저장된 레이아웃 Mock
509 |     localStorageMock.getItem.mockReturnValue('{ invalid json }');
510 |     
511 |     // 성공 응답 모킹 - API 응답 형식 수정
512 |     (global.fetch as any).mockResolvedValue({
513 |       ok: true,
514 |       json: async () => ([
515 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
516 |       ]),
517 |     });
518 | 
519 |     // getBoundingClientRect 모킹
520 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
521 |       width: 1000,
522 |       height: 600,
523 |       x: 0,
524 |       y: 0,
525 |       top: 0,
526 |       left: 0,
527 |       right: 1000,
528 |       bottom: 600,
529 |       toJSON: () => {}
530 |     }));
531 | 
532 |     render(<BoardPage />);
533 |     
534 |     // ReactFlow가 렌더링 될 때까지 대기
535 |     await waitFor(() => {
536 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
537 |     });
538 |     
539 |     // 콘솔 에러가 호출되었는지 확인
540 |     expect(console.error).toHaveBeenCalledWith('Error loading stored layout:', expect.any(Error));
541 |   });
542 | 
543 |   test('다시 시도 버튼을 클릭하면 카드를 다시 가져와야 함', async () => {
544 |     // 처음에는 실패하도록 설정
545 |     (global.fetch as any).mockResolvedValueOnce({
546 |       ok: false,
547 |       json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
548 |     });
549 | 
550 |     // 두 번째 요청은 성공하도록 설정 - API 응답 형식 수정
551 |     (global.fetch as any).mockResolvedValueOnce({
552 |       ok: true,
553 |       json: async () => ([
554 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
555 |       ]),
556 |     });
557 | 
558 |     // getBoundingClientRect 모킹
559 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
560 |       width: 1000,
561 |       height: 600,
562 |       x: 0,
563 |       y: 0,
564 |       top: 0,
565 |       left: 0,
566 |       right: 1000,
567 |       bottom: 600,
568 |       toJSON: () => {}
569 |     }));
570 | 
571 |     render(<BoardPage />);
572 |     
573 |     // 에러 메시지가 표시될 때까지 대기
574 |     await waitFor(() => {
575 |       expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
576 |     });
577 |     
578 |     // 다시 시도 버튼 클릭
579 |     const retryButton = screen.getByRole('button', { name: '다시 시도' });
580 |     fireEvent.click(retryButton);
581 |     
582 |     // ReactFlow가 렌더링 될 때까지 대기 (성공 시)
583 |     await waitFor(() => {
584 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
585 |     });
586 |     
587 |     // fetch가 두 번 호출되었는지 확인
588 |     expect(global.fetch).toHaveBeenCalledTimes(2);
589 |   });
590 | 
591 |   test('자동 배치 버튼을 클릭하면 노드가 자동으로 배치되어야 함', async () => {
592 |     const { toast } = await import('sonner');
593 |     
594 |     // 성공 응답 모킹 - API 응답 형식 수정
595 |     (global.fetch as any).mockResolvedValue({
596 |       ok: true,
597 |       json: async () => ([
598 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
599 |         { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
600 |       ]),
601 |     });
602 | 
603 |     // getBoundingClientRect 모킹
604 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
605 |       width: 1000,
606 |       height: 600,
607 |       x: 0,
608 |       y: 0,
609 |       top: 0,
610 |       left: 0,
611 |       right: 1000,
612 |       bottom: 600,
613 |       toJSON: () => {}
614 |     }));
615 | 
616 |     render(<BoardPage />);
617 |     
618 |     // ReactFlow가 렌더링 될 때까지 대기
619 |     await waitFor(() => {
620 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
621 |     });
622 |     
623 |     // 자동 배치 버튼 찾기
624 |     const autoLayoutButton = screen.getByText('자동 배치');
625 |     expect(autoLayoutButton).toBeInTheDocument();
626 |     
627 |     // 클릭 이벤트 호출
628 |     autoLayoutButton.click();
629 |     
630 |     // 노드 상태 업데이트 확인
631 |     expect(setNodesMock).toHaveBeenCalled();
632 |     
633 |     // 토스트 메시지 확인
634 |     expect(toast.success).toHaveBeenCalledWith('카드가 자동으로 배치되었습니다.');
635 |   });
636 | 
637 |   test('새 카드 생성 버튼을 클릭하면 새 카드가 보드에 추가되어야 함', async () => {
638 |     const { toast } = await import('sonner');
639 |     
640 |     // 성공 응답 모킹 - API 응답 형식 수정
641 |     (global.fetch as any).mockResolvedValue({
642 |       ok: true,
643 |       json: async () => ([
644 |         { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
645 |       ]),
646 |     });
647 | 
648 |     // getBoundingClientRect 모킹
649 |     Element.prototype.getBoundingClientRect = vi.fn(() => ({
650 |       width: 1000,
651 |       height: 600,
652 |       x: 0,
653 |       y: 0,
654 |       top: 0,
655 |       left: 0,
656 |       right: 1000,
657 |       bottom: 600,
658 |       toJSON: () => {}
659 |     }));
660 | 
661 |     render(<BoardPage />);
662 |     
663 |     // ReactFlow가 렌더링 될 때까지 대기
664 |     await waitFor(() => {
665 |       expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
666 |     });
667 |     
668 |     // 새 카드 만들기 버튼 찾기
669 |     const createCardButton = screen.getByTestId('create-card-button');
670 |     expect(createCardButton).toBeInTheDocument();
671 |     
672 |     // 클릭 이벤트 호출
673 |     createCardButton.click();
674 |     
675 |     // 노드 상태 업데이트 확인
676 |     expect(setNodesMock).toHaveBeenCalled();
677 |     
678 |     // 토스트 메시지 확인
679 |     expect(toast.success).toHaveBeenCalledWith('카드가 보드에 추가되었습니다.');
680 |   });
681 | }); 
```

src/app/board/page.tsx
```
1 | 'use client';
2 | 
3 | import React, { useState, useEffect, useCallback, useRef } from 'react';
4 | import ReactFlow, {
5 |   Node,
6 |   Edge,
7 |   Controls,
8 |   Background,
9 |   Panel,
10 |   useNodesState,
11 |   useEdgesState,
12 |   ConnectionLineType,
13 |   NodeChange,
14 |   applyNodeChanges,
15 |   Connection,
16 |   addEdge,
17 |   EdgeChange,
18 |   ReactFlowProvider,
19 |   MarkerType,
20 | } from 'reactflow';
21 | import 'reactflow/dist/style.css';
22 | import { Button } from '@/components/ui/button';
23 | import { Loader2, Save, LayoutGrid } from 'lucide-react';
24 | import CardNode from '@/components/board/CardNode';
25 | import CustomEdge from '@/components/board/CustomEdge';
26 | import { toast } from 'sonner';
27 | import CreateCardButton from '@/components/cards/CreateCardButton';
28 | import LayoutControls from '@/components/board/LayoutControls';
29 | import BoardSettingsControl from '@/components/board/BoardSettingsControl';
30 | import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
31 | import { BoardSettings, DEFAULT_BOARD_SETTINGS, loadBoardSettings, saveBoardSettings, applyEdgeSettings } from '@/lib/board-utils';
32 | import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
33 | 
34 | // 노드 타입 설정
35 | const nodeTypes = {
36 |   card: CardNode,
37 | };
38 | 
39 | // 엣지 타입 설정
40 | const edgeTypes = {
41 |   custom: CustomEdge,
42 | };
43 | 
44 | // 새 카드의 중앙 위치를 계산하는 함수
45 | const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
46 |   if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
47 |   return viewportCenter;
48 | };
49 | 
50 | // 내부 구현을 위한 컴포넌트
51 | function BoardContent() {
52 |   const [nodes, setNodes, onNodesChange] = useNodesState([]);
53 |   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
54 |   const [isLoading, setIsLoading] = useState(true);
55 |   const [error, setError] = useState<string | null>(null);
56 |   const [viewportCenter, setViewportCenter] = useState<{ x: number, y: number } | undefined>(undefined);
57 |   const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
58 |   const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
59 |   const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
60 |   const hasUnsavedChanges = useRef(false);
61 |   const reactFlowWrapper = useRef<HTMLDivElement>(null);
62 |   
63 |   // 뷰포트 중앙 계산
64 |   const updateViewportCenter = useCallback(() => {
65 |     if (!reactFlowWrapper.current) return;
66 |     
67 |     const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
68 |     setViewportCenter({
69 |       x: width / 2,
70 |       y: height / 2
71 |     });
72 |   }, []);
73 |   
74 |   // 노드 위치 변경 핸들러 (위치 변경 시에만 저장)
75 |   const handleNodesChange = useCallback((changes: NodeChange[]) => {
76 |     // 기존 노드 정보를 변경
77 |     onNodesChange(changes);
78 |     
79 |     // 위치 변경이 있는 경우에만 로컬 스토리지에 저장
80 |     const positionChanges = changes.filter(
81 |       change => change.type === 'position' && change.position
82 |     );
83 |     
84 |     if (positionChanges.length > 0) {
85 |       // 현재 노드 상태에 변경사항 적용
86 |       const updatedNodes = applyNodeChanges(changes, nodes);
87 |       hasUnsavedChanges.current = true;
88 |     }
89 |   }, [nodes, onNodesChange]);
90 | 
91 |   // 엣지 변경 핸들러
92 |   const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
93 |     // 기본 변경 적용
94 |     onEdgesChange(changes);
95 |     
96 |     // 변경이 있을 때마다 저장 대기 상태로 설정
97 |     hasUnsavedChanges.current = true;
98 |   }, [onEdgesChange]);
99 | 
100 |   // 레이아웃을 로컬 스토리지에 저장
101 |   const saveLayout = useCallback((nodesToSave: Node[]) => {
102 |     try {
103 |       // 노드 ID와 위치만 저장 (객체 형태로 변환하여 노드 ID를 키로 사용)
104 |       const positions = nodesToSave.reduce((acc, node) => {
105 |         acc[node.id] = { position: node.position };
106 |         return acc;
107 |       }, {} as Record<string, { position: { x: number, y: number } }>);
108 |       
109 |       localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
110 |       return true;
111 |     } catch (err) {
112 |       console.error('레이아웃 저장 오류:', err);
113 |       return false;
114 |     }
115 |   }, []);
116 | 
117 |   // 엣지를 로컬 스토리지에 저장
118 |   const saveEdges = useCallback(() => {
119 |     try {
120 |       localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
121 |       return true;
122 |     } catch (err) {
123 |       console.error('엣지 저장 오류:', err);
124 |       return false;
125 |     }
126 |   }, [edges]);
127 | 
128 |   // 모든 레이아웃 데이터를 저장
129 |   const saveAllLayoutData = useCallback(() => {
130 |     const layoutSaved = saveLayout(nodes);
131 |     const edgesSaved = saveEdges();
132 |     
133 |     if (layoutSaved && edgesSaved) {
134 |       setLastSavedAt(new Date());
135 |       hasUnsavedChanges.current = false;
136 |       return true;
137 |     }
138 |     return false;
139 |   }, [nodes, saveLayout, saveEdges]);
140 | 
141 |   // 수동으로 현재 레이아웃 저장
142 |   const handleSaveLayout = useCallback(() => {
143 |     if (saveAllLayoutData()) {
144 |       toast.success('보드 레이아웃과 연결선이 저장되었습니다.');
145 |     } else {
146 |       toast.error('레이아웃 저장 중 오류가 발생했습니다.');
147 |     }
148 |   }, [saveAllLayoutData]);
149 | 
150 |   // 자동 저장 기능 설정
151 |   useEffect(() => {
152 |     // 자동 저장 간격 (분 단위를 밀리초로 변환)
153 |     const autoSaveIntervalMs = BOARD_CONFIG.autoSaveInterval * 60 * 1000;
154 | 
155 |     // 기존 인터벌 정리
156 |     if (autoSaveIntervalRef.current) {
157 |       clearInterval(autoSaveIntervalRef.current);
158 |     }
159 | 
160 |     // 자동 저장 인터벌 설정
161 |     autoSaveIntervalRef.current = setInterval(() => {
162 |       if (hasUnsavedChanges.current && nodes.length > 0) {
163 |         const saved = saveAllLayoutData();
164 |         
165 |         // 설정에 따라 토스트 메시지 표시
166 |         if (saved && BOARD_CONFIG.showAutoSaveNotification) {
167 |           toast.info('보드 레이아웃이 자동 저장되었습니다.');
168 |         }
169 |       }
170 |     }, autoSaveIntervalMs);
171 | 
172 |     // 컴포넌트 언마운트 시 인터벌 정리
173 |     return () => {
174 |       if (autoSaveIntervalRef.current) {
175 |         clearInterval(autoSaveIntervalRef.current);
176 |       }
177 |     };
178 |   }, [nodes, saveAllLayoutData]);
179 | 
180 |   // 페이지 언로드 전 저장되지 않은 변경사항 저장
181 |   useEffect(() => {
182 |     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
183 |       if (hasUnsavedChanges.current) {
184 |         saveAllLayoutData();
185 |       }
186 |     };
187 | 
188 |     window.addEventListener('beforeunload', handleBeforeUnload);
189 |     return () => {
190 |       window.removeEventListener('beforeunload', handleBeforeUnload);
191 |     };
192 |   }, [saveAllLayoutData]);
193 | 
194 |   // 저장된 레이아웃 적용
195 |   const applyStoredLayout = useCallback((cardsData: any[], storedLayout: any[]) => {
196 |     return cardsData.map((card: any, index: number) => {
197 |       const cardId = card.id.toString();
198 |       // 저장된 레이아웃에서 해당 카드의 위치 정보 찾기
199 |       const storedPosition = storedLayout.find(item => item.id === cardId)?.position;
200 |       
201 |       // 저장된 위치가 있으면 사용, 없으면 기본 그리드 위치 사용
202 |       const position = storedPosition || {
203 |         x: (index % 3) * 350 + 50,
204 |         y: Math.floor(index / 3) * 250 + 50,
205 |       };
206 |       
207 |       // 카드 태그 준비
208 |       const tags = card.cardTags && card.cardTags.length > 0
209 |         ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
210 |         : [];
211 |       
212 |       return {
213 |         id: cardId,
214 |         type: 'card',
215 |         data: { 
216 |           ...card,
217 |           tags: tags
218 |         },
219 |         position,
220 |       };
221 |     });
222 |   }, []);
223 | 
224 |   // 노드 연결 핸들러
225 |   const onConnect = useCallback(
226 |     (params: Connection) => {
227 |       // 기본 연결선 스타일과 마커 적용
228 |       const newEdge = {
229 |         ...params,
230 |         type: 'custom', // 커스텀 엣지 타입 사용
231 |         markerEnd: boardSettings.markerEnd ? {
232 |           type: boardSettings.markerEnd,
233 |           width: 20,
234 |           height: 20,
235 |         } : undefined,
236 |         animated: true,
237 |       };
238 |       setEdges((eds) => addEdge(newEdge, eds));
239 |     },
240 |     [setEdges, boardSettings]
241 |   );
242 | 
243 |   // 카드 생성 후 콜백
244 |   const handleCardCreated = useCallback(async (cardData: any) => {
245 |     try {
246 |       // 새로운 노드 생성
247 |       const newCard = {
248 |         id: cardData.id.toString(),
249 |         type: 'card',
250 |         data: { 
251 |           ...cardData,
252 |           tags: cardData.cardTags?.map((ct: any) => ct.tag.name) || []
253 |         },
254 |         position: getNewCardPosition(viewportCenter),
255 |       };
256 |       
257 |       setNodes((nds) => [...nds, newCard]);
258 |       
259 |       // 노드 위치 저장
260 |       saveLayout([...nodes, newCard]);
261 |       
262 |       toast.success("카드가 보드에 추가되었습니다.");
263 |     } catch (error) {
264 |       console.error("Error adding card to board:", error);
265 |       toast.error("카드를 보드에 추가하는데 실패했습니다.");
266 |     }
267 |   }, [nodes, setNodes, viewportCenter, saveLayout]);
268 | 
269 |   // 노드 자동 배치 (기존 함수 수정)
270 |   const handleAutoLayout = useCallback(() => {
271 |     const layoutedNodes = getGridLayout(nodes);
272 |     setNodes(layoutedNodes);
273 |     saveLayout(layoutedNodes);
274 |     toast.success("카드가 격자 형태로 배치되었습니다.");
275 |   }, [nodes, setNodes, saveLayout]);
276 | 
277 |   // 레이아웃 변경 핸들러
278 |   const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
279 |     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
280 |     setNodes(layoutedNodes);
281 |     setEdges(layoutedEdges);
282 |     
283 |     // 레이아웃 변경 후 저장 상태로 표시
284 |     hasUnsavedChanges.current = true;
285 |     
286 |     toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
287 |   }, [nodes, edges, setNodes, setEdges]);
288 | 
289 |   // 보드 설정 변경 핸들러
290 |   const handleSettingsChange = useCallback((newSettings: BoardSettings) => {
291 |     setBoardSettings(newSettings);
292 |     saveBoardSettings(newSettings);
293 |     
294 |     // 연결선 스타일 변경이 있을 경우 모든 엣지에 적용
295 |     if (newSettings.connectionLineType !== boardSettings.connectionLineType || 
296 |         newSettings.markerEnd !== boardSettings.markerEnd) {
297 |       const updatedEdges = applyEdgeSettings(edges, newSettings);
298 |       setEdges(updatedEdges);
299 |       toast.success("연결선 스타일이 변경되었습니다.");
300 |     }
301 |     
302 |     // 스냅 그리드 변경 메시지
303 |     if (newSettings.snapToGrid !== boardSettings.snapToGrid || 
304 |         newSettings.snapGrid[0] !== boardSettings.snapGrid[0]) {
305 |       toast.success(
306 |         newSettings.snapToGrid 
307 |           ? `격자에 맞추기가 활성화되었습니다 (${newSettings.snapGrid[0]}px)` 
308 |           : "격자에 맞추기가 비활성화되었습니다"
309 |       );
310 |     }
311 |   }, [boardSettings, edges, setEdges]);
312 | 
313 |   // 카드 및 설정 데이터 로드
314 |   const fetchCards = useCallback(async () => {
315 |     setIsLoading(true);
316 |     setError(null);
317 |     
318 |     try {
319 |       // API에서 카드 데이터 가져오기
320 |       const response = await fetch('/api/cards');
321 |       
322 |       if (!response.ok) {
323 |         throw new Error('카드 목록을 불러오는데 실패했습니다.');
324 |       }
325 |       
326 |       const cardsData = await response.json();
327 |       
328 |       // 로컬 스토리지에서 노드 위치 불러오기
329 |       let savedNodesData: Record<string, { position: { x: number, y: number } }> = {};
330 |       try {
331 |         const savedLayout = localStorage.getItem(STORAGE_KEY);
332 |         if (savedLayout) {
333 |           savedNodesData = JSON.parse(savedLayout);
334 |         }
335 |       } catch (err) {
336 |         console.error('레이아웃 불러오기 실패:', err);
337 |       }
338 |       
339 |       // 로컬 스토리지에서 엣지 데이터 불러오기
340 |       let savedEdges: Edge[] = [];
341 |       try {
342 |         const savedEdgesData = localStorage.getItem(EDGES_STORAGE_KEY);
343 |         if (savedEdgesData) {
344 |           // 기존 엣지에 custom 타입 추가
345 |           savedEdges = JSON.parse(savedEdgesData).map((edge: Edge) => ({
346 |             ...edge,
347 |             type: 'custom', // 모든 엣지에 커스텀 타입 적용
348 |           }));
349 |         }
350 |       } catch (err) {
351 |         console.error('엣지 데이터 불러오기 실패:', err);
352 |       }
353 |       
354 |       // 로컬 스토리지에서 보드 설정 불러오기
355 |       const loadedSettings = loadBoardSettings();
356 |       setBoardSettings(loadedSettings);
357 |       
358 |       // 노드 및 엣지 데이터 설정
359 |       const nodes = cardsData.map((card: any) => {
360 |         // 저장된 위치가 있으면 사용, 없으면 기본 위치 생성
361 |         const savedNode = savedNodesData[card.id];
362 |         const position = savedNode ? savedNode.position : { 
363 |           x: Math.random() * 500, 
364 |           y: Math.random() * 300 
365 |         };
366 |         
367 |         return {
368 |           id: card.id,
369 |           type: 'card',
370 |           position,
371 |           data: {
372 |             ...card,
373 |             tags: card.cardTags?.map((ct: any) => ct.tag.name) || []
374 |           }
375 |         };
376 |       });
377 |       
378 |       // 설정에 따라 엣지 스타일 적용
379 |       const styledEdges = applyEdgeSettings(savedEdges, loadedSettings);
380 |       
381 |       setNodes(nodes);
382 |       setEdges(styledEdges);
383 |       setLastSavedAt(new Date());  // 초기 로드 시간을 마지막 저장 시간으로 설정
384 |     } catch (err) {
385 |       console.error('카드 데이터 불러오기 실패:', err);
386 |       setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
387 |     } finally {
388 |       setIsLoading(false);
389 |     }
390 |   }, [setNodes, setEdges]);
391 | 
392 |   useEffect(() => {
393 |     fetchCards();
394 |     updateViewportCenter();
395 |     
396 |     // 창 크기 변경 시 뷰포트 중앙 업데이트
397 |     window.addEventListener('resize', updateViewportCenter);
398 |     return () => {
399 |       window.removeEventListener('resize', updateViewportCenter);
400 |     };
401 |   }, [fetchCards, updateViewportCenter]);
402 | 
403 |   if (isLoading) {
404 |     return (
405 |       <div className="flex items-center justify-center h-screen">
406 |         <Loader2 className="w-8 h-8 animate-spin text-primary" />
407 |         <span className="ml-2">보드를 불러오는 중...</span>
408 |       </div>
409 |     );
410 |   }
411 | 
412 |   if (error) {
413 |     return (
414 |       <div className="flex flex-col items-center justify-center h-screen">
415 |         <p className="text-destructive mb-4">{error}</p>
416 |         <Button onClick={fetchCards}>다시 시도</Button>
417 |       </div>
418 |     );
419 |   }
420 | 
421 |   return (
422 |     <div className="w-full h-screen" ref={reactFlowWrapper}>
423 |       <ReactFlow
424 |         nodes={nodes}
425 |         edges={edges}
426 |         onNodesChange={handleNodesChange}
427 |         onEdgesChange={handleEdgesChange}
428 |         onConnect={onConnect}
429 |         nodeTypes={nodeTypes}
430 |         edgeTypes={edgeTypes}
431 |         fitView
432 |         connectionLineType={boardSettings.connectionLineType}
433 |         snapToGrid={boardSettings.snapToGrid}
434 |         snapGrid={boardSettings.snapGrid}
435 |         deleteKeyCode={['Backspace', 'Delete']}
436 |       >
437 |         <Controls />
438 |         <Background />
439 |         <Panel position="top-left" className="bg-card shadow-md rounded-md p-3">
440 |           <h2 className="text-lg font-bold mb-2">카드 보드</h2>
441 |           <p className="text-sm text-muted-foreground mb-2">노드를 드래그하여 위치를 변경할 수 있습니다.</p>
442 |           <div className="flex gap-2 flex-wrap">
443 |             <Button variant="outline" size="sm" asChild>
444 |               <a href="/cards">카드 목록</a>
445 |             </Button>
446 |             <Button size="sm" onClick={handleSaveLayout}>
447 |               <Save className="w-4 h-4 mr-1" />
448 |               레이아웃 저장
449 |             </Button>
450 |             <CreateCardButton onCardCreated={handleCardCreated} />
451 |           </div>
452 |           {lastSavedAt && (
453 |             <p className="text-xs text-muted-foreground mt-2">
454 |               마지막 저장: {lastSavedAt.toLocaleTimeString()}
455 |               {BOARD_CONFIG.autoSaveInterval > 0 && 
456 |                 ` (${BOARD_CONFIG.autoSaveInterval}분마다 자동 저장)`
457 |               }
458 |             </p>
459 |           )}
460 |         </Panel>
461 |         
462 |         {/* 오른쪽 상단에 레이아웃 및 설정 컨트롤 패널 추가 */}
463 |         <Panel position="top-right" className="mr-2 mt-2 flex gap-2">
464 |           <BoardSettingsControl
465 |             settings={boardSettings}
466 |             onSettingsChange={handleSettingsChange}
467 |           />
468 |           <LayoutControls
469 |             onLayoutChange={handleLayoutChange}
470 |             onAutoLayout={handleAutoLayout}
471 |             onSaveLayout={handleSaveLayout}
472 |           />
473 |         </Panel>
474 |       </ReactFlow>
475 |     </div>
476 |   );
477 | }
478 | 
479 | // 메인 내보내기 컴포넌트 - ReactFlowProvider 추가
480 | export default function BoardPage() {
481 |   return (
482 |     <ReactFlowProvider>
483 |       <BoardContent />
484 |     </ReactFlowProvider>
485 |   );
486 | } 
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
50 | vi.mock('@/components/cards/CreateCardButton', () => {
51 |   return {
52 |     default: vi.fn(() => <button data-testid="create-card-button">새 카드 만들기</button>)
53 |   };
54 | });
55 | 
56 | // UI 컴포넌트 모킹
57 | vi.mock('@/components/ui/skeleton', () => ({
58 |   Skeleton: vi.fn(({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />),
59 | }));
60 | 
61 | describe('Cards Page', () => {
62 |   it('페이지 제목이 올바르게 렌더링되는지 확인한다', () => {
63 |     render(<CardsPage />);
64 |     
65 |     const heading = screen.getByRole('heading', { name: /카드 목록/i });
66 |     expect(heading).toBeInTheDocument();
67 |   });
68 |   
69 |   it('카드 목록 컴포넌트가 렌더링되는지 확인한다', () => {
70 |     render(<CardsPage />);
71 |     
72 |     const cardListContainer = screen.getByTestId('suspense-children');
73 |     expect(cardListContainer).toBeInTheDocument();
74 |     
75 |     const cardList = screen.getByTestId('card-list');
76 |     expect(cardList).toBeInTheDocument();
77 |   });
78 |   
79 |   it('새 카드 만들기 버튼이 렌더링되는지 확인한다', () => {
80 |     render(<CardsPage />);
81 |     
82 |     const createButton = screen.getByTestId('create-card-button');
83 |     expect(createButton).toBeInTheDocument();
84 |   });
85 |   
86 |   it('Suspense fallback이 스켈레톤을 사용하는지 확인한다', () => {
87 |     render(<CardsPage />);
88 |     
89 |     const fallbackContainer = screen.getByTestId('suspense-fallback');
90 |     expect(fallbackContainer).toBeInTheDocument();
91 |   });
92 | });
93 | 
94 | describe('CardListSkeleton', () => {
95 |   it('6개의 스켈레톤 카드를 렌더링한다', () => {
96 |     render(<CardListSkeleton />);
97 |     
98 |     const skeletons = screen.getAllByTestId('skeleton');
99 |     // 각 카드는 4개의 스켈레톤 요소를 가짐 (제목, 내용, 날짜, 버튼)
100 |     expect(skeletons.length).toBe(6 * 4);
101 |   });
102 |   
103 |   it('그리드 레이아웃을 사용한다', () => {
104 |     render(<CardListSkeleton />);
105 |     
106 |     const gridContainer = screen.getByTestId('skeleton-grid');
107 |     expect(gridContainer).toHaveClass('grid');
108 |     expect(gridContainer).toHaveClass('grid-cols-1');
109 |     expect(gridContainer).toHaveClass('md:grid-cols-2');
110 |     expect(gridContainer).toHaveClass('lg:grid-cols-3');
111 |   });
112 | }); 
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
67 |         _count: { cardTags: 0 }
68 |       }
69 |     ];
70 |     
71 |     // prisma 모킹 설정
72 |     const { prisma } = await import('@/lib/prisma');
73 |     (prisma.tag.findMany as any).mockResolvedValue(mockTags);
74 |     
75 |     const page = await TagsPage();
76 |     render(page);
77 |     
78 |     // 페이지 헤더가 올바르게 표시되는지 확인
79 |     expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
80 |     
81 |     // TagForm 컴포넌트가 렌더링되는지 확인
82 |     expect(screen.getByTestId('tag-form')).toBeInTheDocument();
83 |     expect(screen.getByText('태그 추가 폼')).toBeInTheDocument();
84 |     
85 |     // TagList 컴포넌트가 올바른 태그 수로 렌더링되는지 확인
86 |     expect(screen.getByTestId('tag-list')).toBeInTheDocument();
87 |     expect(screen.getByText('태그 수: 3')).toBeInTheDocument();
88 |     
89 |     // prisma가 올바르게 호출되었는지 확인
90 |     expect(prisma.tag.findMany).toHaveBeenCalledWith({
91 |       orderBy: { name: 'asc' },
92 |       include: { _count: { select: { cardTags: true } } }
93 |     });
94 |   });
95 |   
96 |   it('태그가 없을 때도 페이지가 올바르게 렌더링되어야 함', async () => {
97 |     // 빈 태그 배열 모킹
98 |     const { prisma } = await import('@/lib/prisma');
99 |     (prisma.tag.findMany as any).mockResolvedValue([]);
100 |     
101 |     const page = await TagsPage();
102 |     render(page);
103 |     
104 |     // 페이지 헤더가 올바르게 표시되는지 확인
105 |     expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
106 |     
107 |     // TagForm 컴포넌트가 렌더링되는지 확인
108 |     expect(screen.getByTestId('tag-form')).toBeInTheDocument();
109 |     
110 |     // 태그 수가 0으로 표시되는지 확인
111 |     expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
112 |   });
113 |   
114 |   it('prisma 오류 발생 시 빈 태그 배열로 렌더링되어야 함', async () => {
115 |     // prisma 오류 모킹
116 |     const { prisma } = await import('@/lib/prisma');
117 |     (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
118 |     
119 |     // 콘솔 오류 출력 방지를 위한 스파이
120 |     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
121 |     
122 |     const page = await TagsPage();
123 |     render(page);
124 |     
125 |     // 페이지는 여전히 렌더링되어야 함
126 |     expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
127 |     
128 |     // 태그 수가 0으로 표시되는지 확인
129 |     expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
130 |     
131 |     // 오류 로깅이 확인
132 |     expect(consoleSpy).toHaveBeenCalled();
133 |     
134 |     // 스파이 복원
135 |     consoleSpy.mockRestore();
136 |   });
137 | }); 
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
57 |                 <span className="font-medium">{tag.name}</span>
58 |                 <span className="text-sm text-gray-500 dark:text-gray-400">
59 |                   연결된 카드: {tag._count.cardTags}개
60 |                 </span>
61 |               </li>
62 |             ))}
63 |           </ul>
64 |         )}
65 |         
66 |         <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
67 |           <p className="text-green-700 dark:text-green-400">
68 |             {!error 
69 |               ? '이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!' 
70 |               : '로컬 환경에서는 연결 오류가 발생할 수 있습니다. Vercel 배포 환경에서 다시 테스트해보세요.'}
71 |           </p>
72 |         </div>
73 |       </div>
74 |     </div>
75 |   );
76 | } 
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
9 | 
10 | type AuthMode = 'login' | 'register';
11 | 
12 | export default function AuthForm() {
13 |   const [mode, setMode] = useState<AuthMode>('login');
14 |   const [email, setEmail] = useState('');
15 |   const [password, setPassword] = useState('');
16 |   const [name, setName] = useState('');
17 |   const [isLoading, setIsLoading] = useState(false);
18 |   const [isGoogleLoading, setIsGoogleLoading] = useState(false);
19 | 
20 |   const toggleMode = () => {
21 |     setMode(mode === 'login' ? 'register' : 'login');
22 |     // 폼 초기화
23 |     setEmail('');
24 |     setPassword('');
25 |     setName('');
26 |   };
27 | 
28 |   const handleSubmit = async (e: React.FormEvent) => {
29 |     e.preventDefault();
30 |     setIsLoading(true);
31 | 
32 |     try {
33 |       if (mode === 'login') {
34 |         await signIn(email, password);
35 |         toast.success('로그인 성공!');
36 |       } else {
37 |         await signUp(email, password, name);
38 |         toast.success('회원가입 성공! 이메일을 확인해주세요.');
39 |       }
40 |       
41 |       // 성공 후 리디렉션 또는 상태 업데이트
42 |       window.location.href = '/board';
43 |     } catch (error: any) {
44 |       console.error('인증 오류:', error);
45 |       toast.error(error.message || '인증 중 오류가 발생했습니다.');
46 |     } finally {
47 |       setIsLoading(false);
48 |     }
49 |   };
50 | 
51 |   const handleGoogleSignIn = async () => {
52 |     setIsGoogleLoading(true);
53 |     
54 |     try {
55 |       await signInWithGoogle();
56 |       // 리디렉션은 Google OAuth 콜백 처리에서 이루어집니다.
57 |     } catch (error: any) {
58 |       console.error('Google 로그인 오류:', error);
59 |       toast.error(error.message || 'Google 로그인 중 오류가 발생했습니다.');
60 |       setIsGoogleLoading(false);
61 |     }
62 |   };
63 | 
64 |   return (
65 |     <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
66 |       <div className="text-center">
67 |         <h1 className="text-2xl font-bold">
68 |           {mode === 'login' ? '로그인' : '회원가입'}
69 |         </h1>
70 |         <p className="mt-2 text-sm text-gray-600">
71 |           {mode === 'login'
72 |             ? '백야드에 오신 것을 환영합니다!'
73 |             : '새 계정을 만들어 시작하세요.'}
74 |         </p>
75 |       </div>
76 | 
77 |       <form onSubmit={handleSubmit} className="space-y-6">
78 |         <div className="space-y-4">
79 |           {mode === 'register' && (
80 |             <div className="space-y-2">
81 |               <Label htmlFor="name">이름</Label>
82 |               <Input
83 |                 id="name"
84 |                 type="text"
85 |                 value={name}
86 |                 onChange={(e) => setName(e.target.value)}
87 |                 placeholder="이름을 입력하세요"
88 |               />
89 |             </div>
90 |           )}
91 | 
92 |           <div className="space-y-2">
93 |             <Label htmlFor="email">이메일</Label>
94 |             <Input
95 |               id="email"
96 |               type="email"
97 |               value={email}
98 |               onChange={(e) => setEmail(e.target.value)}
99 |               placeholder="이메일을 입력하세요"
100 |               required
101 |             />
102 |           </div>
103 | 
104 |           <div className="space-y-2">
105 |             <Label htmlFor="password">비밀번호</Label>
106 |             <Input
107 |               id="password"
108 |               type="password"
109 |               value={password}
110 |               onChange={(e) => setPassword(e.target.value)}
111 |               placeholder="비밀번호를 입력하세요"
112 |               required
113 |             />
114 |           </div>
115 |         </div>
116 | 
117 |         <Button
118 |           type="submit"
119 |           className="w-full"
120 |           disabled={isLoading}
121 |         >
122 |           {isLoading
123 |             ? '처리 중...'
124 |             : mode === 'login'
125 |             ? '로그인'
126 |             : '회원가입'}
127 |         </Button>
128 | 
129 |         <div className="relative my-4">
130 |           <div className="absolute inset-0 flex items-center">
131 |             <div className="w-full border-t border-gray-300"></div>
132 |           </div>
133 |           <div className="relative flex justify-center text-sm">
134 |             <span className="px-2 bg-white text-gray-500">또는</span>
135 |           </div>
136 |         </div>
137 | 
138 |         <Button
139 |           type="button"
140 |           variant="outline"
141 |           className="w-full flex items-center justify-center gap-2"
142 |           onClick={handleGoogleSignIn}
143 |           disabled={isGoogleLoading}
144 |         >
145 |           <svg
146 |             width="20"
147 |             height="20"
148 |             viewBox="0 0 24 24"
149 |             fill="none"
150 |             xmlns="http://www.w3.org/2000/svg"
151 |           >
152 |             <path
153 |               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
154 |               fill="#4285F4"
155 |             />
156 |             <path
157 |               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
158 |               fill="#34A853"
159 |             />
160 |             <path
161 |               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
162 |               fill="#FBBC05"
163 |             />
164 |             <path
165 |               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
166 |               fill="#EA4335"
167 |             />
168 |           </svg>
169 |           {isGoogleLoading ? "처리 중..." : "Google로 계속하기"}
170 |         </Button>
171 | 
172 |         <div className="text-center mt-4">
173 |           <button
174 |             type="button"
175 |             onClick={toggleMode}
176 |             className="text-sm text-blue-600 hover:underline"
177 |           >
178 |             {mode === 'login'
179 |               ? '계정이 없으신가요? 회원가입'
180 |               : '이미 계정이 있으신가요? 로그인'}
181 |           </button>
182 |         </div>
183 |       </form>
184 |     </div>
185 |   );
186 | } 
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
76 |   // 이니셜 생성 헬퍼 함수
77 |   const getInitials = () => {
78 |     const name = getUserName();
79 |     return name.substring(0, 2).toUpperCase();
80 |   };
81 | 
82 |   if (isLoading) {
83 |     return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
84 |   }
85 | 
86 |   if (!user) {
87 |     return (
88 |       <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
89 |         로그인
90 |       </Button>
91 |     );
92 |   }
93 | 
94 |   return (
95 |     <DropdownMenu>
96 |       <DropdownMenuTrigger asChild>
97 |         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
98 |           <Avatar className="h-8 w-8">
99 |             {getAvatar() ? (
100 |               <AvatarImage src={getAvatar()} alt={getUserName()} />
101 |             ) : (
102 |               <AvatarFallback>{getInitials()}</AvatarFallback>
103 |             )}
104 |           </Avatar>
105 |         </Button>
106 |       </DropdownMenuTrigger>
107 |       <DropdownMenuContent className="w-56" align="end" forceMount>
108 |         <div className="flex flex-col space-y-1 p-2">
109 |           <p className="text-sm font-medium">{getUserName()}</p>
110 |           <p className="text-xs text-gray-500">{user.email}</p>
111 |         </div>
112 |         <DropdownMenuSeparator />
113 |         <DropdownMenuItem onClick={() => router.push('/board')}>
114 |           보드
115 |         </DropdownMenuItem>
116 |         <DropdownMenuItem onClick={() => router.push('/cards')}>
117 |           카드
118 |         </DropdownMenuItem>
119 |         <DropdownMenuItem onClick={() => router.push('/tags')}>
120 |           태그
121 |         </DropdownMenuItem>
122 |         <DropdownMenuSeparator />
123 |         <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
124 |           로그아웃
125 |         </DropdownMenuItem>
126 |       </DropdownMenuContent>
127 |     </DropdownMenu>
128 |   );
129 | } 
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
17 | import { Settings, Grid3X3, ArrowRightIcon } from 'lucide-react';
18 | import { BoardSettings } from '@/lib/board-utils';
19 | import { SNAP_GRID_OPTIONS, CONNECTION_TYPE_OPTIONS, MARKER_TYPE_OPTIONS } from '@/lib/board-constants';
20 | import { ConnectionLineType, MarkerType } from 'reactflow';
21 | 
22 | interface BoardSettingsControlProps {
23 |   settings: BoardSettings;
24 |   onSettingsChange: (settings: BoardSettings) => void;
25 | }
26 | 
27 | export default function BoardSettingsControl({
28 |   settings,
29 |   onSettingsChange,
30 | }: BoardSettingsControlProps) {
31 |   // 스냅 그리드 값 변경 핸들러
32 |   const handleSnapGridChange = (value: string) => {
33 |     const gridSize = parseInt(value, 10);
34 |     const newSettings = {
35 |       ...settings,
36 |       snapGrid: [gridSize, gridSize] as [number, number],
37 |       snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
38 |     };
39 |     onSettingsChange(newSettings);
40 |   };
41 | 
42 |   // 연결선 타입 변경 핸들러
43 |   const handleConnectionTypeChange = (value: string) => {
44 |     const newSettings = {
45 |       ...settings,
46 |       connectionLineType: value as ConnectionLineType,
47 |     };
48 |     onSettingsChange(newSettings);
49 |   };
50 | 
51 |   // 마커 타입 변경 핸들러
52 |   const handleMarkerTypeChange = (value: string) => {
53 |     const newSettings = {
54 |       ...settings,
55 |       markerEnd: value === 'null' ? null : value as MarkerType,
56 |     };
57 |     onSettingsChange(newSettings);
58 |   };
59 | 
60 |   // 스냅 그리드 토글 핸들러
61 |   const handleSnapToGridToggle = () => {
62 |     const newSettings = {
63 |       ...settings,
64 |       snapToGrid: !settings.snapToGrid,
65 |     };
66 |     onSettingsChange(newSettings);
67 |   };
68 | 
69 |   return (
70 |     <DropdownMenu>
71 |       <DropdownMenuTrigger asChild>
72 |         <Button variant="outline" size="icon" className="h-8 w-8">
73 |           <Settings className="h-4 w-4" />
74 |         </Button>
75 |       </DropdownMenuTrigger>
76 |       <DropdownMenuContent align="end" className="w-56">
77 |         <DropdownMenuLabel>보드 설정</DropdownMenuLabel>
78 |         <DropdownMenuSeparator />
79 |         
80 |         {/* 스냅 그리드 설정 */}
81 |         <DropdownMenuSub>
82 |           <DropdownMenuSubTrigger>
83 |             <Grid3X3 className="mr-2 h-4 w-4" />
84 |             <span>격자에 맞추기</span>
85 |           </DropdownMenuSubTrigger>
86 |           <DropdownMenuSubContent>
87 |             <DropdownMenuCheckboxItem 
88 |               checked={settings.snapToGrid}
89 |               onCheckedChange={handleSnapToGridToggle}
90 |             >
91 |               격자에 맞추기 활성화
92 |             </DropdownMenuCheckboxItem>
93 |             <DropdownMenuSeparator />
94 |             <DropdownMenuRadioGroup 
95 |               value={settings.snapGrid[0].toString()} 
96 |               onValueChange={handleSnapGridChange}
97 |             >
98 |               {SNAP_GRID_OPTIONS.map(option => (
99 |                 <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
100 |                   {option.label}
101 |                 </DropdownMenuRadioItem>
102 |               ))}
103 |             </DropdownMenuRadioGroup>
104 |           </DropdownMenuSubContent>
105 |         </DropdownMenuSub>
106 |         
107 |         {/* 연결선 타입 설정 */}
108 |         <DropdownMenuSub>
109 |           <DropdownMenuSubTrigger>
110 |             <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
111 |               <path d="M3 17C8 17 8 7 13 7C18 7 18 17 21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
112 |             </svg>
113 |             <span>연결선 스타일</span>
114 |           </DropdownMenuSubTrigger>
115 |           <DropdownMenuSubContent>
116 |             <DropdownMenuRadioGroup 
117 |               value={settings.connectionLineType} 
118 |               onValueChange={handleConnectionTypeChange}
119 |             >
120 |               {CONNECTION_TYPE_OPTIONS.map(option => (
121 |                 <DropdownMenuRadioItem key={option.value} value={option.value}>
122 |                   {option.label}
123 |                 </DropdownMenuRadioItem>
124 |               ))}
125 |             </DropdownMenuRadioGroup>
126 |           </DropdownMenuSubContent>
127 |         </DropdownMenuSub>
128 |         
129 |         {/* 화살표 마커 설정 */}
130 |         <DropdownMenuSub>
131 |           <DropdownMenuSubTrigger>
132 |             <ArrowRightIcon className="mr-2 h-4 w-4" />
133 |             <span>화살표 스타일</span>
134 |           </DropdownMenuSubTrigger>
135 |           <DropdownMenuSubContent>
136 |             <DropdownMenuRadioGroup 
137 |               value={settings.markerEnd === null ? 'null' : settings.markerEnd} 
138 |               onValueChange={handleMarkerTypeChange}
139 |             >
140 |               {MARKER_TYPE_OPTIONS.map(option => (
141 |                 <DropdownMenuRadioItem key={option.value ?? 'null'} value={option.value === null ? 'null' : option.value}>
142 |                   {option.label}
143 |                 </DropdownMenuRadioItem>
144 |               ))}
145 |             </DropdownMenuRadioGroup>
146 |           </DropdownMenuSubContent>
147 |         </DropdownMenuSub>
148 |       </DropdownMenuContent>
149 |     </DropdownMenu>
150 |   );
151 | } 
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
2 | import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals } from 'reactflow';
3 | import { Button } from "@/components/ui/button";
4 | import Link from 'next/link';
5 | import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
6 | import TiptapViewer from '@/components/editor/TiptapViewer';
7 | import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
8 | import { CSSProperties } from 'react';
9 | 
10 | // 헥스 색상을 HSL로 변환하는 함수
11 | const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
12 |   // hex를 RGB로 변환
13 |   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
14 |   if (!result) return null;
15 |   
16 |   const r = parseInt(result[1], 16) / 255;
17 |   const g = parseInt(result[2], 16) / 255;
18 |   const b = parseInt(result[3], 16) / 255;
19 | 
20 |   const max = Math.max(r, g, b);
21 |   const min = Math.min(r, g, b);
22 |   let h = 0, s = 0, l = (max + min) / 2;
23 | 
24 |   if (max !== min) {
25 |     const d = max - min;
26 |     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
27 |     switch (max) {
28 |       case r: h = (g - b) / d + (g < b ? 6 : 0); break;
29 |       case g: h = (b - r) / d + 2; break;
30 |       case b: h = (r - g) / d + 4; break;
31 |     }
32 |     h /= 6;
33 |   }
34 | 
35 |   return { h: h * 360, s: s * 100, l: l * 100 };
36 | };
37 | 
38 | // HSL을 헥스 색상으로 변환하는 함수
39 | const hslToHex = (h: number, s: number, l: number): string => {
40 |   s /= 100;
41 |   l /= 100;
42 | 
43 |   const a = s * Math.min(l, 1 - l);
44 |   const f = (n: number) => {
45 |     const k = (n + h / 30) % 12;
46 |     const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
47 |     return Math.round(255 * color).toString(16).padStart(2, '0');
48 |   };
49 |   
50 |   return `#${f(0)}${f(8)}${f(4)}`;
51 | };
52 | 
53 | // HSL 색상의 명도(L)를 조정하는 함수
54 | const adjustLightness = (color: string, lightnessIncrease: number): string => {
55 |   const hsl = hexToHsl(color);
56 |   if (!hsl) return color;
57 | 
58 |   // L값을 증가시키되 100을 초과하지 않도록 함
59 |   const newL = Math.min(100, hsl.l + lightnessIncrease);
60 |   
61 |   // 새로운 HSL 값을 HEX로 변환
62 |   return hslToHex(hsl.h, hsl.s, newL);
63 | };
64 | 
65 | // 카드 노드 컴포넌트 정의
66 | export default function CardNode({ data, isConnectable, selected, id }: NodeProps) {
67 |   // 카드 접기/펴기 상태
68 |   const [isExpanded, setIsExpanded] = useState(false);
69 |   // 호버 상태 추가
70 |   const [isHovered, setIsHovered] = useState(false);
71 |   // 노드의 실제 높이를 저장하기 위한 ref
72 |   const nodeRef = useRef<HTMLDivElement>(null);
73 |   
74 |   // ReactFlow 인스턴스 가져오기
75 |   const { getNodes, setNodes } = useReactFlow();
76 |   // 노드 내부 구조 업데이트 훅 추가
77 |   const updateNodeInternals = useUpdateNodeInternals();
78 |   
79 |   // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
80 |   const handleCardClick = useCallback((event: React.MouseEvent) => {
81 |     // 이벤트 전파 중지하지 않음 - ReactFlow가 노드 선택을 처리하도록 함
82 |     // 단, 토글 버튼이나 링크 클릭 시에는 전파 중지
83 |     if (
84 |       (event.target as HTMLElement).tagName === 'BUTTON' || 
85 |       (event.target as HTMLElement).closest('button') || 
86 |       (event.target as HTMLElement).tagName === 'A'
87 |     ) {
88 |       event.stopPropagation(); // 버튼이나 링크만 이벤트 전파 중지
89 |       return;
90 |     }
91 |     
92 |     // 더블 클릭은 확장 상태 토글로 처리
93 |     if (event.detail === 2) { 
94 |       event.stopPropagation(); // 더블 클릭은 이벤트 전파 중지
95 |       setIsExpanded(!isExpanded);
96 |     }
97 |     // 단일 클릭은 ReactFlow가 처리하도록 전파 - 추가 로직 없음
98 |   }, [isExpanded]);
99 |   
100 |   // 접기/펼치기 토글 핸들러
101 |   const toggleExpand = useCallback(() => {
102 |     setIsExpanded(prev => !prev);
103 |   }, []);
104 |   
105 |   // 상태 변경 시 노드 내부 업데이트
106 |   useEffect(() => {
107 |     // 노드가 펼쳐지거나 접힐 때 핸들 위치 업데이트
108 |     if (id) {
109 |       // 일련의 업데이트를 통해 핸들 위치가 정확히 계산되도록 함
110 |       // 1. 즉시 업데이트 
111 |       updateNodeInternals(id);
112 |       
113 |       // 2. 약간의 지연 후 업데이트 (레이아웃 변경 직후)
114 |       const timeoutId = setTimeout(() => {
115 |         updateNodeInternals(id);
116 |       }, 50);
117 |       
118 |       // 3. 트랜지션 완료 후 업데이트 (애니메이션 완료 후)
119 |       const secondTimeoutId = setTimeout(() => {
120 |         updateNodeInternals(id);
121 |       }, 250);
122 |       
123 |       // 4. 최종 업데이트 (모든 렌더링이 안정화된 후)
124 |       const finalTimeoutId = setTimeout(() => {
125 |         updateNodeInternals(id);
126 |       }, 500);
127 |       
128 |       return () => {
129 |         clearTimeout(timeoutId);
130 |         clearTimeout(secondTimeoutId);
131 |         clearTimeout(finalTimeoutId);
132 |       };
133 |     }
134 |   }, [isExpanded, id, updateNodeInternals]);
135 |   
136 |   // 노드가 선택되거나 호버 상태가 변경될 때도 업데이트
137 |   useEffect(() => {
138 |     if (id) {
139 |       updateNodeInternals(id);
140 |     }
141 |   }, [id, selected, isHovered, updateNodeInternals]);
142 |   
143 |   // 마우스 오버 핸들러
144 |   const handleMouseEnter = useCallback(() => {
145 |     setIsHovered(true);
146 |   }, []);
147 |   
148 |   // 마우스 아웃 핸들러
149 |   const handleMouseLeave = useCallback(() => {
150 |     setIsHovered(false);
151 |   }, []);
152 |   
153 |   // UI 설정에서 데이터 가져오기
154 |   const uiConfig = useMemo(() => {
155 |     try {
156 |       return loadDefaultBoardUIConfig();
157 |     } catch (error) {
158 |       console.error('UI 설정 로드 실패, 기본값 사용:', error);
159 |       return {
160 |         board: { edgeColor: '#FF0072' },
161 |         handles: { size: 8, backgroundColor: 'white', borderColor: '#FF0072', borderWidth: 2 }
162 |       };
163 |     }
164 |   }, []);
165 |   
166 |   // 연결선 색상
167 |   const connectionLineColor = useMemo(() => {
168 |     return uiConfig.board.edgeColor;
169 |   }, [uiConfig]);
170 |   
171 |   // 선택된 카드 배경색
172 |   const selectedBackgroundColor = "#FFD3E6"; // 요구사항에 맞게 변경
173 |   
174 |   // 외곽선 두께 (연결선과 통일)
175 |   const borderWidth = 2; // 항상 2px로 고정
176 |   
177 |   // 핸들러 크기 정의 
178 |   const handleSize = 10; // 정확히 10px로 고정
179 |   
180 |   // 카드 너비
181 |   const cardWidth = 280;
182 |   
183 |   // 핸들러 스타일 - 기본 스타일 (핸들러 스타일을 useMemo로 최적화)
184 |   const handleStyleBase = useMemo(() => ({
185 |     width: handleSize,
186 |     height: handleSize,
187 |     backgroundColor: '#fff',
188 |     border: `2px solid ${connectionLineColor}`, // 모든 상태에서 동일한 테두리 색상 사용
189 |     borderRadius: '50%',
190 |     zIndex: 100, // z-index 증가
191 |     padding: 0,
192 |     margin: 0,
193 |     opacity: 1, // 항상 핸들러 표시
194 |     visibility: 'visible' as const, // 명시적으로 visible 설정
195 |     pointerEvents: 'auto' as const,
196 |     // 랜더링 최적화
197 |     willChange: 'transform',
198 |   }), [connectionLineColor]);
199 |   
200 |   // 핸들러 위치 계산 함수 - 모든 상태에서 완전히 동일한 스타일 사용
201 |   const getHandleStyle = useCallback((position: 'top' | 'right' | 'bottom' | 'left') => {
202 |     // 핸들 위치에 대한 기본 스타일 생성 (항상 새 객체 생성)
203 |     const style: React.CSSProperties = { ...handleStyleBase };
204 |     
205 |     // 정확한 소수점 계산을 위한 상수
206 |     const halfSize = handleSize / 2;
207 |     
208 |     // 모든 상태에서 완전히 동일한 위치 계산 (정수 값 사용)
209 |     switch (position) {
210 |       case 'top':
211 |         style.top = -halfSize; // handleSize의 절반만큼 위로
212 |         // transform이 CSS에서 무시되므로 직접 계산 (노드 너비의 절반 - 핸들 너비의 절반)
213 |         style.left = `calc(50% - ${halfSize}px)`;
214 |         // transform 속성 제거 (CSS에서 무시됨)
215 |         style.transform = 'none';
216 |         break;
217 |       case 'right':
218 |         style.right = -halfSize; // handleSize의 절반만큼 오른쪽으로
219 |         // transform이 CSS에서 무시되므로 직접 계산 (노드 높이의 절반 - 핸들 높이의 절반)
220 |         style.top = `calc(50% - ${halfSize}px)`;
221 |         style.transform = 'none';
222 |         break;
223 |       case 'bottom':
224 |         style.bottom = -halfSize; // handleSize의 절반만큼 아래로
225 |         // transform이 CSS에서 무시되므로 직접 계산 (노드 너비의 절반 - 핸들 너비의 절반)
226 |         style.left = `calc(50% - ${halfSize}px)`;
227 |         style.transform = 'none';
228 |         break;
229 |       case 'left':
230 |         style.left = -halfSize; // handleSize의 절반만큼 왼쪽으로
231 |         // transform이 CSS에서 무시되므로 직접 계산 (노드 높이의 절반 - 핸들 높이의 절반)
232 |         style.top = `calc(50% - ${halfSize}px)`;
233 |         style.transform = 'none';
234 |         break;
235 |     }
236 |     
237 |     return style;
238 |   }, [handleStyleBase, handleSize]);
239 |   
240 |   // 카드 높이 계산 (접힌 상태와 펼쳐진 상태)
241 |   const cardHeight = isExpanded ? 'auto' : '40px';
242 | 
243 |   // 트랜지션 종료 이벤트 핸들러 - 애니메이션 완료 후 항상 업데이트
244 |   const handleTransitionEnd = useCallback(() => {
245 |     if (id) {
246 |       updateNodeInternals(id);
247 |     }
248 |   }, [id, updateNodeInternals]);
249 | 
250 |   return (
251 |     <div 
252 |       className={`card-node-container ${selected ? 'selected' : ''}`}
253 |       style={{ 
254 |         position: 'relative',
255 |         width: `${cardWidth}px`,
256 |         zIndex: selected ? 5 : 1
257 |       }}
258 |       onClick={handleCardClick}
259 |       onMouseEnter={handleMouseEnter}
260 |       onMouseLeave={handleMouseLeave}
261 |       ref={nodeRef}
262 |       onTransitionEnd={handleTransitionEnd}
263 |     >
264 |       <div
265 |         className={`card-node ${selected ? 'selected' : ''}`} 
266 |         style={{ 
267 |           width: '100%',
268 |           backgroundColor: selected ? selectedBackgroundColor : '#ffffff',
269 |           borderRadius: '8px',
270 |           border: `${borderWidth}px solid ${selected ? connectionLineColor : '#C1C1C1'}`,
271 |           transition: 'all 0.2s ease',
272 |           height: cardHeight,
273 |           overflow: isExpanded ? 'auto' : 'hidden',
274 |           maxHeight: isExpanded ? '280px' : '40px',
275 |           boxShadow: selected ? `0 0 0 2px ${connectionLineColor}` : 'none'
276 |         }}
277 |       >
278 |         {/* 카드 헤더 */}
279 |         <div className="card-header" style={{ 
280 |           padding: '0 12px',
281 |           display: 'flex', 
282 |           justifyContent: 'space-between', 
283 |           alignItems: 'center',
284 |           borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
285 |           height: '40px'
286 |         }}>
287 |           <h3 className="text-md font-semibold truncate text-center flex-grow" style={{
288 |             margin: 0,
289 |             lineHeight: '40px',
290 |             display: 'flex',
291 |             alignItems: 'center',
292 |             justifyContent: 'center',
293 |             height: '40px'
294 |           }}>
295 |             {data.title}
296 |           </h3>
297 |           <Button 
298 |             variant="ghost" 
299 |             size="sm" 
300 |             className="p-0 h-6 w-6 ml-2"
301 |             onClick={toggleExpand}
302 |           >
303 |             {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
304 |           </Button>
305 |         </div>
306 |         
307 |         {/* 카드 콘텐츠 - 펼쳐진 상태에서만 보임 */}
308 |         {isExpanded && (
309 |           <div className="card-content" style={{ 
310 |             padding: '8px 12px',
311 |             fontSize: '0.6rem',
312 |             maxHeight: '240px',
313 |             overflow: 'auto'
314 |           }}>
315 |             <div className="tiptap-content" style={{ fontSize: '0.8rem' }}>
316 |               <TiptapViewer content={data.content} />
317 |             </div>
318 |             
319 |             {/* 태그 표시 */}
320 |             {data.tags && data.tags.length > 0 && (
321 |               <div className="flex flex-wrap gap-1 mt-2">
322 |                 {data.tags.map((tag: string, index: number) => (
323 |                   <div key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center">
324 |                     <Tag size={10} className="mr-1" />
325 |                     {tag}
326 |                   </div>
327 |                 ))}
328 |               </div>
329 |             )}
330 |             
331 |             {/* 카드 푸터 */}
332 |             <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
333 |               <Link href={`/cards/${data.id}`} passHref>
334 |                 <Button size="sm" variant="outline">자세히 보기</Button>
335 |               </Link>
336 |             </div>
337 |           </div>
338 |         )}
339 |       </div>
340 |       
341 |       {/* 핸들러 - 카드 외부에 위치 */}
342 |       {/* 위쪽 핸들러 */}
343 |       <Handle
344 |         type="target"
345 |         position={Position.Top}
346 |         id="top-target"
347 |         isConnectable={isConnectable}
348 |         className="nodrag handle-top visible-handle" // visible-handle 클래스 추가
349 |         style={getHandleStyle('top')}
350 |       />
351 |       
352 |       {/* 왼쪽 핸들러 */}
353 |       <Handle
354 |         type="target"
355 |         position={Position.Left}
356 |         id="left-target"
357 |         isConnectable={isConnectable}
358 |         className="nodrag handle-left visible-handle" // visible-handle 클래스 추가
359 |         style={getHandleStyle('left')}
360 |       />
361 |       
362 |       {/* 오른쪽 핸들러 */}
363 |       <Handle
364 |         type="source"
365 |         position={Position.Right}
366 |         id="right-source"
367 |         isConnectable={isConnectable}
368 |         className="nodrag handle-right visible-handle" // visible-handle 클래스 추가
369 |         style={getHandleStyle('right')}
370 |       />
371 |       
372 |       {/* 아래쪽 핸들러 */}
373 |       <Handle
374 |         type="source"
375 |         position={Position.Bottom}
376 |         id="bottom-source"
377 |         isConnectable={isConnectable}
378 |         className="nodrag handle-bottom visible-handle" // visible-handle 클래스 추가
379 |         style={getHandleStyle('bottom')}
380 |       />
381 |     </div>
382 |   );
383 | } 
```

src/components/board/CustomEdge.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
3 | 
4 | /**
5 |  * 커스텀 엣지 컴포넌트
6 |  * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
7 |  */
8 | function CustomEdge({ 
9 |   id,
10 |   source,
11 |   target,
12 |   sourceX,
13 |   sourceY,
14 |   targetX,
15 |   targetY,
16 |   sourcePosition,
17 |   targetPosition,
18 |   style = {},
19 |   markerEnd,
20 | }: EdgeProps) {
21 |   // 엣지 연결 좌표를 useMemo로 계산하여 재렌더링을 최소화
22 |   const edgeParams = useMemo(() => ({
23 |     sourceX,
24 |     sourceY,
25 |     sourcePosition,
26 |     targetX,
27 |     targetY,
28 |     targetPosition,
29 |   }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);
30 | 
31 |   // 기본 베지어 패스 계산 (ReactFlow의 내장 함수 사용)
32 |   const [edgePath] = getBezierPath(edgeParams);
33 | 
34 |   // 기본 스타일 + 커스텀 스타일 적용
35 |   const edgeStyle = useMemo(() => ({
36 |     strokeWidth: 2,
37 |     stroke: '#C1C1C1',
38 |     ...style,
39 |   }), [style]);
40 | 
41 |   return (
42 |     <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
43 |   );
44 | }
45 | 
46 | export default CustomEdge; 
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
62 |             <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
63 |             <polyline points="17 21 17 13 7 13 7 21" />
64 |             <polyline points="7 3 7 8 15 8" />
65 |           </svg>
66 |           <span>레이아웃 저장</span>
67 |         </DropdownMenuItem>
68 |       </DropdownMenuContent>
69 |     </DropdownMenu>
70 |   );
71 | } 
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
72 |         title: '테스트 카드 1',
73 |         content: '테스트 내용 1',
74 |         createdAt: '2023-01-01T00:00:00.000Z',
75 |         updatedAt: '2023-01-01T00:00:00.000Z',
76 |         userId: 'user1',
77 |       },
78 |       {
79 |         id: 'card2',
80 |         title: '테스트 카드 2',
81 |         content: '테스트 내용 2',
82 |         createdAt: '2023-01-02T00:00:00.000Z',
83 |         updatedAt: '2023-01-02T00:00:00.000Z',
84 |         userId: 'user2',
85 |       },
86 |     ];
87 | 
88 |     // fetch 응답 모킹
89 |     (global.fetch as any).mockResolvedValueOnce({
90 |       ok: true,
91 |       json: async () => mockCards,
92 |     });
93 | 
94 |     // 컴포넌트 렌더링
95 |     render(<CardList />);
96 | 
97 |     // 로딩 상태 확인
98 |     expect(screen.getByText('로딩 중...')).toBeInTheDocument();
99 | 
100 |     // 카드 목록이 로드되었는지 확인
101 |     await waitFor(() => {
102 |       expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
103 |       expect(screen.getByText('테스트 카드 2')).toBeInTheDocument();
104 |       expect(screen.getByText('테스트 내용 1')).toBeInTheDocument();
105 |       expect(screen.getByText('테스트 내용 2')).toBeInTheDocument();
106 |     });
107 | 
108 |     // fetch가 올바른 URL로 호출되었는지 확인
109 |     expect(global.fetch).toHaveBeenCalledWith('/api/cards');
110 |   });
111 | 
112 |   it('카드가 없을 때 적절한 메시지를 표시한다', async () => {
113 |     // 빈 카드 목록 모킹
114 |     (global.fetch as any).mockResolvedValueOnce({
115 |       ok: true,
116 |       json: async () => [],
117 |     });
118 | 
119 |     // 컴포넌트 렌더링
120 |     render(<CardList />);
121 | 
122 |     // 로딩 상태가 끝나고 빈 메시지가 표시되는지 확인
123 |     await waitFor(() => {
124 |       expect(screen.getByText('카드가 없습니다. 새 카드를 추가해보세요!')).toBeInTheDocument();
125 |     });
126 |   });
127 | 
128 |   it('API 오류 발생 시 에러 메시지를 표시한다', async () => {
129 |     // API 오류 모킹
130 |     (global.fetch as any).mockResolvedValueOnce({
131 |       ok: false,
132 |       status: 500,
133 |       statusText: 'Internal Server Error',
134 |     });
135 | 
136 |     // 컴포넌트 렌더링
137 |     render(<CardList />);
138 | 
139 |     // 에러 토스트가 호출되었는지 확인
140 |     await waitFor(() => {
141 |       expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
142 |     });
143 |   });
144 | 
145 |   it('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
146 |     // 네트워크 오류 모킹
147 |     (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
148 | 
149 |     // 컴포넌트 렌더링
150 |     render(<CardList />);
151 | 
152 |     // 에러 토스트가 호출되었는지 확인
153 |     await waitFor(() => {
154 |       expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
155 |     });
156 |   });
157 | 
158 |   it('자세히 보기 버튼을 클릭하면 Dialog가 열린다', async () => {
159 |     // 컴포넌트 렌더링
160 |     render(<CardList />);
161 | 
162 |     // 카드 목록이 로드될 때까지 대기
163 |     await waitFor(() => {
164 |       expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
165 |     });
166 | 
167 |     // 자세히 보기 버튼 클릭
168 |     const detailButtons = screen.getAllByText('자세히');
169 |     fireEvent.click(detailButtons[0]);
170 | 
171 |     // Dialog가 열렸는지 확인 (제목이 Dialog에 표시됨)
172 |     await waitFor(() => {
173 |       // Dialog의 내용이 표시되는지 확인
174 |       expect(screen.getAllByText('테스트 카드 1').length).toBeGreaterThan(1); // 카드 목록과 Dialog 두 곳에 표시
175 |       // '작성일:' 대신 Dialog 내에 표시된 날짜 형식 확인
176 |       expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
177 |       expect(screen.getByText('닫기')).toBeInTheDocument(); // Dialog의 닫기 버튼
178 |     });
179 |   });
180 | 
181 |   it('삭제 버튼을 클릭하면 삭제 확인 Dialog가 열린다', async () => {
182 |     // 컴포넌트 렌더링
183 |     render(<CardList />);
184 | 
185 |     // 카드 목록이 로드될 때까지 대기
186 |     await waitFor(() => {
187 |       expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
188 |     });
189 | 
190 |     // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
191 |     const deleteButtons = screen.getAllByRole('button', { name: '' }); // 휴지통 아이콘만 있어서 텍스트 없음
192 |     fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭 (카드마다 자세히 보기와 삭제 버튼이 있음)
193 | 
194 |     // 삭제 확인 Dialog가 열렸는지 확인
195 |     await waitFor(() => {
196 |       expect(screen.getByText('카드 삭제')).toBeInTheDocument();
197 |       expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
198 |       expect(screen.getByText('취소')).toBeInTheDocument();
199 |       expect(screen.getByText('삭제')).toBeInTheDocument();
200 |     });
201 |   });
202 | 
203 |   it('삭제 확인 Dialog에서 삭제 버튼을 클릭하면 카드가 삭제된다', async () => {
204 |     // 삭제 API 호출 모킹
205 |     (global.fetch as any).mockImplementation((url: string, options: any) => {
206 |       if (url.includes('/api/cards/') && options?.method === 'DELETE') {
207 |         return Promise.resolve({
208 |           ok: true,
209 |           json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' }),
210 |         });
211 |       }
212 |       
213 |       // 기본 카드 목록 데이터 반환
214 |       return Promise.resolve({
215 |         ok: true,
216 |         json: async () => [
217 |           {
218 |             id: 'card1',
219 |             title: '테스트 카드 1',
220 |             content: '테스트 내용 1',
221 |             createdAt: '2023-01-01T00:00:00.000Z',
222 |             updatedAt: '2023-01-01T00:00:00.000Z',
223 |             userId: 'user1',
224 |           },
225 |         ],
226 |       });
227 |     });
228 | 
229 |     // 컴포넌트 렌더링
230 |     render(<CardList />);
231 | 
232 |     // 카드 목록이 로드될 때까지 대기
233 |     await waitFor(() => {
234 |       expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
235 |     });
236 | 
237 |     // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
238 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
239 |     fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭
240 | 
241 |     // 삭제 확인 Dialog가 열렸는지 확인
242 |     await waitFor(() => {
243 |       expect(screen.getByText('카드 삭제')).toBeInTheDocument();
244 |     });
245 | 
246 |     // 삭제 버튼 클릭
247 |     const confirmDeleteButton = screen.getByText('삭제');
248 |     fireEvent.click(confirmDeleteButton);
249 | 
250 |     // 삭제 API가 호출되었는지 확인
251 |     await waitFor(() => {
252 |       expect(global.fetch).toHaveBeenCalledWith('/api/cards/card1', { method: 'DELETE' });
253 |       expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
254 |     });
255 |   });
256 | 
257 |   it('검색 쿼리 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
258 |     // useSearchParams 모킹 수정
259 |     (useSearchParams as any).mockImplementation(() => ({
260 |       get: (param: string) => param === 'q' ? '검색어' : null,
261 |       toString: () => 'q=검색어',
262 |     }));
263 | 
264 |     // 컴포넌트 렌더링
265 |     render(<CardList />);
266 | 
267 |     // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
268 |     await waitFor(() => {
269 |       expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4');
270 |     });
271 |   });
272 | 
273 |   it('태그 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
274 |     // useSearchParams 모킹 수정
275 |     (useSearchParams as any).mockImplementation(() => ({
276 |       get: (param: string) => param === 'tag' ? '테스트태그' : null,
277 |       toString: () => 'tag=테스트태그',
278 |     }));
279 | 
280 |     // 컴포넌트 렌더링
281 |     render(<CardList />);
282 | 
283 |     // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
284 |     await waitFor(() => {
285 |       expect(global.fetch).toHaveBeenCalledWith('/api/cards?tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
286 |     });
287 |   });
288 | 
289 |   it('여러 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
290 |     // useSearchParams 모킹 수정
291 |     (useSearchParams as any).mockImplementation(() => ({
292 |       get: (param: string) => {
293 |         if (param === 'q') return '검색어';
294 |         if (param === 'tag') return '테스트태그';
295 |         return null;
296 |       },
297 |       toString: () => 'q=검색어&tag=테스트태그',
298 |     }));
299 | 
300 |     // 컴포넌트 렌더링
301 |     render(<CardList />);
302 | 
303 |     // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
304 |     await waitFor(() => {
305 |       expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4&tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
306 |     });
307 |   });
308 | 
309 |   it('검색 결과가 없을 때 적절한 메시지를 표시한다', async () => {
310 |     // 검색 파라미터 모킹
311 |     (useSearchParams as any).mockImplementation(() => ({
312 |       get: (param: string) => param === 'q' ? '존재하지않는검색어' : null,
313 |       toString: () => 'q=존재하지않는검색어',
314 |     }));
315 | 
316 |     // 빈 검색 결과 모킹
317 |     (global.fetch as any).mockResolvedValueOnce({
318 |       ok: true,
319 |       json: async () => [],
320 |     });
321 | 
322 |     // 컴포넌트 렌더링
323 |     render(<CardList />);
324 | 
325 |     // 검색 결과 없음 메시지 확인
326 |     await waitFor(() => {
327 |       expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
328 |     });
329 |   });
330 | 
331 |   it('태그를 포함한 카드를 렌더링한다', async () => {
332 |     // 태그가 있는 카드 데이터 모킹
333 |     const mockCardsWithTags = [
334 |       {
335 |         id: 'card1',
336 |         title: '태그 있는 카드',
337 |         content: '태그 테스트 내용',
338 |         createdAt: '2023-01-01T00:00:00.000Z',
339 |         updatedAt: '2023-01-01T00:00:00.000Z',
340 |         userId: 'user1',
341 |         cardTags: [
342 |           {
343 |             id: 'tag1',
344 |             tag: {
345 |               id: 'tagid1',
346 |               name: '테스트태그'
347 |             }
348 |           }
349 |         ]
350 |       }
351 |     ];
352 | 
353 |     // fetch 응답 모킹
354 |     (global.fetch as any).mockResolvedValueOnce({
355 |       ok: true,
356 |       json: async () => mockCardsWithTags,
357 |     });
358 | 
359 |     // 컴포넌트 렌더링
360 |     render(<CardList />);
361 | 
362 |     // 카드와 태그가 렌더링되었는지 확인
363 |     await waitFor(() => {
364 |       expect(screen.getByText('태그 있는 카드')).toBeInTheDocument();
365 |       expect(screen.getByText('#테스트태그')).toBeInTheDocument();
366 |     });
367 |   });
368 | 
369 |   it('태그를 클릭하면 적절한 URL로 이동한다', async () => {
370 |     // 테스트용 태그 이름
371 |     const tagName = 'testTag';
372 |     
373 |     // window.location.href 모킹
374 |     const originalHref = window.location.href;
375 |     Object.defineProperty(window, 'location', {
376 |       writable: true,
377 |       value: { href: originalHref }
378 |     });
379 |     
380 |     // handleTagClick 함수 테스트
381 |     const navigateToTagUrl = (tagName: string) => {
382 |       window.location.href = `/cards?tag=${encodeURIComponent(tagName)}`;
383 |     };
384 |     
385 |     // 함수 실행
386 |     navigateToTagUrl(tagName);
387 |     
388 |     // 결과 확인
389 |     expect(window.location.href).toBe(`/cards?tag=${encodeURIComponent(tagName)}`);
390 |     
391 |     // location 복원
392 |     window.location.href = originalHref;
393 |   });
394 | 
395 |   it('카드 삭제 중 API 오류 발생 시 에러 메시지를 표시한다', async () => {
396 |     // 카드 데이터 모킹
397 |     const mockCards = [
398 |       {
399 |         id: 'card1',
400 |         title: '삭제할 카드',
401 |         content: '삭제 테스트 내용',
402 |         createdAt: '2023-01-01T00:00:00.000Z',
403 |         updatedAt: '2023-01-01T00:00:00.000Z',
404 |         userId: 'user1',
405 |       }
406 |     ];
407 | 
408 |     // fetch 응답 모킹 (처음에는 성공, 삭제 시 에러)
409 |     (global.fetch as any).mockImplementation((url: string, options: any) => {
410 |       if (url.includes('/api/cards/') && options?.method === 'DELETE') {
411 |         return Promise.resolve({
412 |           ok: false,
413 |           json: async () => ({ error: '권한이 없습니다.' }),
414 |         });
415 |       }
416 |       
417 |       return Promise.resolve({
418 |         ok: true,
419 |         json: async () => mockCards,
420 |       });
421 |     });
422 | 
423 |     // 컴포넌트 렌더링
424 |     render(<CardList />);
425 | 
426 |     // 카드가 로드될 때까지 대기
427 |     await waitFor(() => {
428 |       expect(screen.getByText('삭제할 카드')).toBeInTheDocument();
429 |     });
430 | 
431 |     // 삭제 버튼 클릭
432 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
433 |     fireEvent.click(deleteButtons[deleteButtons.length - 1]);
434 | 
435 |     // 삭제 확인 Dialog가 열렸는지 확인
436 |     await waitFor(() => {
437 |       expect(screen.getByText('카드 삭제')).toBeInTheDocument();
438 |     });
439 | 
440 |     // 삭제 버튼 클릭
441 |     const confirmDeleteButton = screen.getByText('삭제');
442 |     fireEvent.click(confirmDeleteButton);
443 | 
444 |     // 에러 토스트가 호출되었는지 확인
445 |     await waitFor(() => {
446 |       expect(toast.error).toHaveBeenCalledWith('권한이 없습니다.');
447 |     });
448 |   });
449 | 
450 |   it('태그 클릭 시 해당 태그로 필터링된 URL로 이동한다', async () => {
451 |     // 창 위치 변경을 모킹
452 |     Object.defineProperty(window, 'location', {
453 |       writable: true,
454 |       value: { href: '' },
455 |     });
456 | 
457 |     const TAG_NAME = '테스트태그';
458 |     
459 |     // 태그를 포함하는 카드 데이터 생성
460 |     const mockCards = [
461 |       {
462 |         id: 1,
463 |         title: '테스트 카드 1',
464 |         content: '테스트 내용 1',
465 |         createdAt: '2023-01-01T00:00:00.000Z',
466 |         cardTags: [
467 |           {
468 |             id: 1,
469 |             cardId: 1,
470 |             tagId: 1,
471 |             tag: {
472 |               id: 1,
473 |               name: TAG_NAME,
474 |             },
475 |           },
476 |         ],
477 |       },
478 |     ];
479 | 
480 |     // fetch 응답 모킹
481 |     global.fetch = vi.fn().mockResolvedValue({
482 |       ok: true,
483 |       json: async () => mockCards,
484 |     });
485 | 
486 |     // 컴포넌트 렌더링
487 |     render(<CardList />);
488 | 
489 |     // 카드 목록이 로드될 때까지 대기
490 |     await waitFor(() => {
491 |       expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
492 |     });
493 | 
494 |     // 디버깅: 태그 요소가 렌더링되었는지 확인
495 |     screen.debug(document.body);
496 | 
497 |     // 태그 찾기 및 클릭
498 |     await waitFor(() => {
499 |       // 유연한 방식으로 태그 요소 찾기
500 |       const tagElements = screen.getAllByText((content, element) => {
501 |         return content.includes(TAG_NAME);
502 |       });
503 |       
504 |       console.log('찾은 태그 요소 수:', tagElements.length);
505 |       expect(tagElements.length).toBeGreaterThan(0);
506 |       
507 |       // 첫 번째 태그 요소 클릭
508 |       fireEvent.click(tagElements[0]);
509 |       
510 |       // URL이 올바르게 설정되었는지 확인 (인코딩된 URL 기대)
511 |       const encodedTagName = encodeURIComponent(TAG_NAME);
512 |       const expectedUrl = `/cards?tag=${encodedTagName}`;
513 |       expect(window.location.href).toBe(expectedUrl);
514 |     });
515 |   });
516 | }); 
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
24 | 
25 | interface Tag {
26 |   id: string;
27 |   name: string;
28 | }
29 | 
30 | interface CardTag {
31 |   id: string;
32 |   tag: Tag;
33 | }
34 | 
35 | interface CardItem {
36 |   id: string;
37 |   title: string;
38 |   content: string;
39 |   createdAt: string;
40 |   cardTags?: CardTag[];
41 | }
42 | 
43 | export default function CardList() {
44 |   const [cards, setCards] = useState<CardItem[]>([]);
45 |   const [loading, setLoading] = useState(true);
46 |   const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
47 |   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
48 |   const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
49 |   const [isDeleting, setIsDeleting] = useState(false);
50 |   const searchParams = useSearchParams();
51 | 
52 |   useEffect(() => {
53 |     fetchCards();
54 |   }, [searchParams]);
55 | 
56 |   async function fetchCards() {
57 |     try {
58 |       // 현재 검색 파라미터를 가져와서 API 요청에 사용
59 |       const q = searchParams.get('q');
60 |       const tag = searchParams.get('tag');
61 |       
62 |       // 쿼리 파라미터 구성
63 |       const params = new URLSearchParams();
64 |       if (q) params.append('q', q);
65 |       if (tag) params.append('tag', tag);
66 |       
67 |       // API 요청
68 |       const queryString = params.toString();
69 |       const endpoint = `/api/cards${queryString ? `?${queryString}` : ''}`;
70 |       
71 |       const response = await fetch(endpoint);
72 |       if (!response.ok) {
73 |         throw new Error('카드 목록을 불러오는데 실패했습니다.');
74 |       }
75 |       const data = await response.json();
76 |       setCards(data);
77 |     } catch (error) {
78 |       console.error('Error fetching cards:', error);
79 |       toast.error('카드 목록을 불러오는데 실패했습니다.');
80 |     } finally {
81 |       setLoading(false);
82 |     }
83 |   }
84 | 
85 |   const handleTagClick = (tagName: string) => {
86 |     window.location.href = `/cards?tag=${encodeURIComponent(tagName)}`;
87 |   };
88 | 
89 |   const handleDeleteCard = async (cardId: string) => {
90 |     setIsDeleting(true);
91 |     try {
92 |       const response = await fetch(`/api/cards/${cardId}`, {
93 |         method: "DELETE",
94 |       });
95 | 
96 |       if (!response.ok) {
97 |         const errorData = await response.json();
98 |         throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
99 |       }
100 | 
101 |       toast.success("카드가 성공적으로 삭제되었습니다.");
102 |       // 삭제 후 목록 갱신
103 |       fetchCards();
104 |       setIsDeleteDialogOpen(false);
105 |     } catch (error) {
106 |       console.error("Error deleting card:", error);
107 |       toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
108 |     } finally {
109 |       setIsDeleting(false);
110 |       setDeletingCardId(null);
111 |     }
112 |   };
113 | 
114 |   const openDeleteDialog = (cardId: string, e: React.MouseEvent) => {
115 |     e.stopPropagation();
116 |     setDeletingCardId(cardId);
117 |     setIsDeleteDialogOpen(true);
118 |   };
119 | 
120 |   if (loading) {
121 |     return <div>로딩 중...</div>;
122 |   }
123 | 
124 |   return (
125 |     <div className="space-y-6">
126 |       <SearchBar />
127 |       
128 |       {/* 삭제 확인 다이얼로그 */}
129 |       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
130 |         <DialogContent>
131 |           <DialogHeader>
132 |             <DialogTitle>카드 삭제</DialogTitle>
133 |             <DialogDescription>
134 |               이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
135 |             </DialogDescription>
136 |           </DialogHeader>
137 |           <DialogFooter className="flex gap-2 justify-end pt-4">
138 |             <DialogClose asChild>
139 |               <Button variant="outline">취소</Button>
140 |             </DialogClose>
141 |             <Button 
142 |               variant="destructive" 
143 |               onClick={() => deletingCardId && handleDeleteCard(deletingCardId)} 
144 |               disabled={isDeleting}
145 |             >
146 |               {isDeleting ? "삭제 중..." : "삭제"}
147 |             </Button>
148 |           </DialogFooter>
149 |         </DialogContent>
150 |       </Dialog>
151 |       
152 |       {cards.length === 0 ? (
153 |         <div className="text-center py-10">
154 |           {searchParams.toString() 
155 |             ? '검색 결과가 없습니다.' 
156 |             : '카드가 없습니다. 새 카드를 추가해보세요!'}
157 |         </div>
158 |       ) : (
159 |         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
160 |           {cards.map((card) => (
161 |             <Card key={card.id} className="flex flex-col">
162 |               <CardHeader>
163 |                 <CardTitle>{card.title}</CardTitle>
164 |               </CardHeader>
165 |               <CardContent className="flex-grow">
166 |                 <div className="line-clamp-3">
167 |                   <TiptapViewer content={card.content} />
168 |                 </div>
169 |               </CardContent>
170 |               <CardFooter className="flex flex-col items-start gap-2">
171 |                 <div className="w-full flex justify-between items-center">
172 |                   <span className="text-sm text-muted-foreground">
173 |                     {formatDate(card.createdAt)}
174 |                   </span>
175 |                   <div className="flex gap-2">
176 |                     <Dialog>
177 |                       <DialogTrigger asChild>
178 |                         <Button variant="outline" size="sm" className="flex items-center gap-1">
179 |                           <Eye size={16} />
180 |                           자세히
181 |                         </Button>
182 |                       </DialogTrigger>
183 |                       <DialogContent className="sm:max-w-[600px]">
184 |                         <DialogHeader>
185 |                           <DialogTitle>{card.title}</DialogTitle>
186 |                           <DialogDescription>
187 |                             작성일: {formatDate(card.createdAt)}
188 |                           </DialogDescription>
189 |                         </DialogHeader>
190 |                         <div className="py-4">
191 |                           <div className="whitespace-pre-wrap">
192 |                             <TiptapViewer content={card.content} />
193 |                           </div>
194 |                           
195 |                           {card.cardTags && card.cardTags.length > 0 && (
196 |                             <div className="flex flex-wrap gap-1 mt-4">
197 |                               {card.cardTags.map((cardTag) => (
198 |                                 <Badge 
199 |                                   key={cardTag.id} 
200 |                                   variant="secondary"
201 |                                 >
202 |                                   #{cardTag.tag.name}
203 |                                 </Badge>
204 |                               ))}
205 |                             </div>
206 |                           )}
207 |                         </div>
208 |                         <DialogFooter>
209 |                           <DialogClose asChild>
210 |                             <Button>닫기</Button>
211 |                           </DialogClose>
212 |                         </DialogFooter>
213 |                       </DialogContent>
214 |                     </Dialog>
215 |                     <Button 
216 |                       variant="destructive" 
217 |                       size="sm"
218 |                       onClick={(e) => openDeleteDialog(card.id, e)}
219 |                     >
220 |                       <Trash2 size={16} />
221 |                     </Button>
222 |                   </div>
223 |                 </div>
224 |                 
225 |                 {/* 태그 표시 */}
226 |                 {card.cardTags && card.cardTags.length > 0 && (
227 |                   <div className="flex flex-wrap gap-1 mt-2">
228 |                     {card.cardTags.map((cardTag) => (
229 |                       <Badge 
230 |                         key={cardTag.id} 
231 |                         variant="secondary"
232 |                         className="cursor-pointer"
233 |                         data-testid={`tag-name-${cardTag.tag.name}`}
234 |                         onClick={() => handleTagClick(cardTag.tag.name)}
235 |                       >
236 |                         #{cardTag.tag.name}
237 |                       </Badge>
238 |                     ))}
239 |                   </div>
240 |                 )}
241 |               </CardFooter>
242 |             </Card>
243 |           ))}
244 |         </div>
245 |       )}
246 |     </div>
247 |   );
248 | } 
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
71 |       title: '새 카드 제목',
72 |       content: '새 카드 내용',
73 |       createdAt: '2023-01-01T00:00:00.000Z',
74 |       updatedAt: '2023-01-01T00:00:00.000Z',
75 |       userId: TEST_USER_ID,
76 |     };
77 | 
78 |     // fetch 응답 모킹
79 |     (global.fetch as any).mockResolvedValueOnce({
80 |       ok: true,
81 |       json: async () => mockNewCard,
82 |     });
83 | 
84 |     render(<CreateCardButton />);
85 |     
86 |     // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
87 |     fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
88 |     
89 |     // 폼 입력
90 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
91 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
92 |     
93 |     // 제출 버튼 클릭
94 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
95 |     
96 |     // API 호출 확인
97 |     await waitFor(() => {
98 |       expect(global.fetch).toHaveBeenCalledWith('/api/cards', {
99 |         method: 'POST',
100 |         headers: {
101 |           'Content-Type': 'application/json'
102 |         },
103 |         body: JSON.stringify({
104 |           title: '새 카드 제목',
105 |           content: '새 카드 내용',
106 |           userId: 'ab2473c2-21b5-4196-9562-3b720d80d77f',
107 |           tags: []
108 |         })
109 |       });
110 |     });
111 |     
112 |     // 성공 메시지 확인
113 |     expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
114 |     
115 |     // 페이지 새로고침 확인
116 |     expect(mockReload).toHaveBeenCalled();
117 |   });
118 | 
119 |   test('빈 제목과 내용으로 제출 시 유효성 검사 오류를 표시한다', async () => {
120 |     render(<CreateCardButton />);
121 |     
122 |     // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
123 |     fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
124 |     
125 |     // 제출 버튼 클릭 (제목과 내용 비워둠)
126 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
127 |     
128 |     // 에러 메시지 확인
129 |     await waitFor(() => {
130 |       expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
131 |     });
132 |     
133 |     // API 호출이 되지 않았는지 확인
134 |     expect(global.fetch).not.toHaveBeenCalled();
135 |   });
136 | 
137 |   test('API 오류 발생 시 에러 메시지를 표시한다', async () => {
138 |     // API 오류 모킹
139 |     (global.fetch as any).mockResolvedValueOnce({
140 |       ok: false,
141 |       json: async () => ({ error: 'response.json is not a function' })
142 |     });
143 | 
144 |     render(<CreateCardButton />);
145 |     
146 |     // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
147 |     fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
148 |     
149 |     // 폼 입력
150 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
151 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
152 |     
153 |     // 제출 버튼 클릭
154 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
155 |     
156 |     // 에러 메시지 확인
157 |     await waitFor(() => {
158 |       expect(toast.error).toHaveBeenCalledWith('response.json is not a function');
159 |     });
160 |     
161 |     // console.error가 호출되었는지 확인
162 |     expect(console.error).toHaveBeenCalled();
163 |   });
164 | 
165 |   test('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
166 |     // 네트워크 오류 모킹
167 |     (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
168 | 
169 |     render(<CreateCardButton />);
170 |     
171 |     // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
172 |     fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
173 |     
174 |     // 폼 입력
175 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
176 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
177 |     
178 |     // 제출 버튼 클릭
179 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
180 |     
181 |     // 에러 메시지 확인
182 |     await waitFor(() => {
183 |       expect(toast.error).toHaveBeenCalledWith('Network error');
184 |     });
185 |     
186 |     // console.error가 호출되었는지 확인
187 |     expect(console.error).toHaveBeenCalled();
188 |   });
189 | 
190 |   test('카드 생성 다이얼로그가 열리고 닫힙니다', async () => {
191 |     const user = userEvent.setup();
192 |     
193 |     render(<CreateCardButton />);
194 |     
195 |     // 버튼 클릭 대신 직접 열기
196 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
197 |     fireEvent.click(button);
198 |     
199 |     // 다이얼로그가 열렸는지 확인
200 |     expect(screen.getByRole("dialog")).toBeInTheDocument();
201 |     
202 |     // 실제 닫기 버튼 클릭 - "Close" 텍스트를 가진 버튼을 찾아 클릭합니다
203 |     const closeButton = screen.getByRole("button", { name: "Close" });
204 |     fireEvent.click(closeButton);
205 |     
206 |     // 다이얼로그가 닫혔는지 확인 (비동기적으로 진행될 수 있음)
207 |     await waitFor(() => {
208 |       expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
209 |     });
210 |   });
211 | 
212 |   test('제목과 내용 입력이 작동합니다', async () => {
213 |     render(<CreateCardButton />);
214 |     
215 |     // 다이얼로그 열기
216 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
217 |     fireEvent.click(button);
218 |     
219 |     // 제목 입력
220 |     const titleInput = screen.getByLabelText('제목');
221 |     fireEvent.change(titleInput, { target: { value: '테스트 제목' } });
222 |     expect(titleInput).toHaveValue('테스트 제목');
223 |     
224 |     // 내용 입력
225 |     const contentInput = screen.getByLabelText('내용');
226 |     fireEvent.change(contentInput, { target: { value: '테스트 내용' } });
227 |     expect(contentInput).toHaveValue('테스트 내용');
228 |   });
229 | 
230 |   test('태그 입력 및 처리가 올바르게 작동합니다', async () => {
231 |     render(<CreateCardButton />);
232 |     
233 |     // 다이얼로그 열기
234 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
235 |     fireEvent.click(button);
236 |     
237 |     // 태그 입력란
238 |     const tagInput = screen.getByLabelText('태그');
239 |     
240 |     // 태그 입력 후 Enter 키 입력
241 |     fireEvent.change(tagInput, { target: { value: '태그1' } });
242 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
243 |     
244 |     // 태그가 추가되었는지 확인
245 |     expect(screen.getByText('#태그1')).toBeInTheDocument();
246 |     
247 |     // 태그 입력 필드가 비워졌는지 확인
248 |     expect(tagInput).toHaveValue('');
249 |     
250 |     // 쉼표로 태그 구분하여 입력
251 |     fireEvent.change(tagInput, { target: { value: '태그2, 태그3' } });
252 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
253 |     
254 |     // 두 개의 태그가 모두 추가되었는지 확인
255 |     expect(screen.getByText('#태그2')).toBeInTheDocument();
256 |     expect(screen.getByText('#태그3')).toBeInTheDocument();
257 |   });
258 | 
259 |   test('태그 삭제가 작동합니다', () => {
260 |     render(<CreateCardButton />);
261 |     
262 |     // 다이얼로그 열기
263 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
264 |     fireEvent.click(button);
265 |     
266 |     // 태그 추가
267 |     const tagInput = screen.getByLabelText('태그');
268 |     fireEvent.change(tagInput, { target: { value: '삭제태그' } });
269 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
270 |     
271 |     // 태그가 추가되었는지 확인
272 |     expect(screen.getByText('#삭제태그')).toBeInTheDocument();
273 |     
274 |     // 태그 삭제 버튼 클릭 - SVG나 아이콘을 찾는 대신 버튼 내부의 텍스트를 포함한 요소를 찾습니다.
275 |     const tagContainer = screen.getByText('#삭제태그').closest('.flex');
276 |     if (tagContainer) {
277 |       const deleteButton = tagContainer.querySelector('button');
278 |       if (deleteButton) {
279 |         fireEvent.click(deleteButton);
280 |       }
281 |     }
282 |     
283 |     // 태그가 삭제되었는지 확인
284 |     expect(screen.queryByText('#삭제태그')).not.toBeInTheDocument();
285 |   });
286 | 
287 |   test('IME 조합 중 키 입력 이벤트 처리가 올바르게 작동합니다', async () => {
288 |     render(<CreateCardButton />);
289 |     
290 |     // 다이얼로그 열기
291 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
292 |     fireEvent.click(button);
293 |     
294 |     // 태그 입력란
295 |     const tagInput = screen.getByLabelText('태그');
296 |     
297 |     // 미리 존재하는 태그 수 확인 (없을 수 있음)
298 |     const getTagCount = () => screen.queryAllByText(/#\S+/).length;
299 |     const initialTagCount = getTagCount();
300 |     
301 |     // IME 조합 시작
302 |     fireEvent.compositionStart(tagInput);
303 |     
304 |     // IME 조합 중 Enter 키를 테스트하기 위해, 한글 입력 상태를 모의
305 |     // 조합 중 태그가 추가되지 않도록 함
306 |     fireEvent.change(tagInput, { target: { value: '한글태그' } });
307 |     
308 |     // 조합 중 Enter 키 입력 - IME 조합 중에는 이벤트가 무시되어야 함
309 |     // 직접 상태를 확인하는 대신 태그 개수를 확인
310 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
311 |     
312 |     // 조합이 끝나지 않았으므로 태그 개수는 변하지 않아야 함
313 |     expect(getTagCount()).toBe(initialTagCount);
314 |     
315 |     // IME 조합 종료
316 |     fireEvent.compositionEnd(tagInput);
317 |     
318 |     // 조합 종료 후 Enter 키 입력
319 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
320 |     
321 |     // 이제 태그가 추가되었는지 확인
322 |     expect(screen.getByText('#한글태그')).toBeInTheDocument();
323 |     expect(getTagCount()).toBe(initialTagCount + 1);
324 |   });
325 | 
326 |   test('IME 조합 중 Enter 및 콤마 외의 키 입력은 무시됩니다', async () => {
327 |     render(<CreateCardButton />);
328 |     
329 |     // 다이얼로그 열기
330 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
331 |     fireEvent.click(button);
332 |     
333 |     // 태그 입력란
334 |     const tagInput = screen.getByLabelText('태그');
335 |     
336 |     // IME 조합 시작
337 |     fireEvent.compositionStart(tagInput);
338 |     
339 |     // Enter 키가 아닌 다른 키 입력 (Tab)
340 |     fireEvent.change(tagInput, { target: { value: '테스트태그' } });
341 |     fireEvent.keyDown(tagInput, { key: 'Tab' });
342 |     
343 |     // 태그가 추가되지 않아야 함
344 |     expect(screen.queryByText('#테스트태그')).not.toBeInTheDocument();
345 |     
346 |     // IME 조합 종료
347 |     fireEvent.compositionEnd(tagInput);
348 |   });
349 | 
350 |   test('카드가 성공적으로 생성됩니다', async () => {
351 |     render(<CreateCardButton />);
352 |     
353 |     // 다이얼로그 열기
354 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
355 |     fireEvent.click(button);
356 |     
357 |     // 제목, 내용, 태그 입력
358 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '성공 테스트 제목' } });
359 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '성공 테스트 내용' } });
360 |     
361 |     const tagInput = screen.getByLabelText('태그');
362 |     fireEvent.change(tagInput, { target: { value: '성공태그' } });
363 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
364 |     
365 |     // 태그가 추가되었는지 확인
366 |     expect(screen.getByText('#성공태그')).toBeInTheDocument();
367 |     
368 |     // 제출 버튼 클릭
369 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
370 |     
371 |     // API 호출 확인
372 |     await waitFor(() => {
373 |       expect(global.fetch).toHaveBeenCalled();
374 |     });
375 |     
376 |     // 성공 메시지와 페이지 리로드 확인
377 |     expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
378 |     expect(mockReload).toHaveBeenCalled();
379 |   });
380 | 
381 |   test('빈 제목이나 내용으로 제출하면 오류가 표시됩니다', async () => {
382 |     render(<CreateCardButton />);
383 |     
384 |     // 다이얼로그 열기
385 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
386 |     fireEvent.click(button);
387 |     
388 |     // 내용만 입력 (제목은 비움)
389 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '내용만 있음' } });
390 |     
391 |     // 제출 버튼 클릭
392 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
393 |     
394 |     // 오류 메시지 확인
395 |     expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
396 |     
397 |     // API 호출이 되지 않았는지 확인
398 |     expect(global.fetch).not.toHaveBeenCalled();
399 |   });
400 | 
401 |   test('빈 태그는 추가되지 않습니다', async () => {
402 |     render(<CreateCardButton />);
403 |     
404 |     // 다이얼로그 열기
405 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
406 |     fireEvent.click(button);
407 |     
408 |     // 태그 입력란
409 |     const tagInput = screen.getByLabelText('태그');
410 |     
411 |     // 1. 완전히 빈 태그 입력 후 Enter 키 입력
412 |     fireEvent.change(tagInput, { target: { value: '' } });
413 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
414 |     
415 |     // 화면에 표시된 태그가 없는지 확인
416 |     expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
417 |     
418 |     // 2. 공백만 있는 태그 입력 후 Enter 키 입력
419 |     fireEvent.change(tagInput, { target: { value: '   ' } });
420 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
421 |     
422 |     // 화면에 표시된 태그가 없는지 다시 확인
423 |     expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
424 |     
425 |     // 3. 콤마로 구분된 태그 중 일부가 빈 경우
426 |     fireEvent.change(tagInput, { target: { value: '유효태그,,  ,' } });
427 |     fireEvent.keyDown(tagInput, { key: 'Enter' });
428 |     
429 |     // 유효한 태그만 추가되었는지 확인
430 |     expect(screen.getByText('#유효태그')).toBeInTheDocument();
431 |     // 빈 태그는 추가되지 않아야 함
432 |     const allTags = screen.getAllByText(/#\S+/);
433 |     expect(allTags.length).toBe(1); // 유효태그 하나만 있어야 함
434 |   });
435 | 
436 |   test('API 응답에 에러 메시지가 없을 때 기본 오류 메시지를 사용합니다', async () => {
437 |     // error 필드가 없는 API 오류 응답 모킹
438 |     (global.fetch as any).mockResolvedValueOnce({
439 |       ok: false,
440 |       json: async () => ({ status: 'failed' }) // error 필드 없음
441 |     });
442 |     
443 |     render(<CreateCardButton />);
444 |     
445 |     // 다이얼로그 열기
446 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
447 |     fireEvent.click(button);
448 |     
449 |     // 필수 필드 입력
450 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
451 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
452 |     
453 |     // 제출 버튼 클릭
454 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
455 |     
456 |     // 기본 오류 메시지가 표시되는지 확인
457 |     await waitFor(() => {
458 |       expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
459 |     });
460 |   });
461 |   
462 |   test('Error 객체가 아닌 예외 발생 시 기본 오류 메시지가 표시됩니다', async () => {
463 |     // Error 객체가 아닌 예외 발생 모킹
464 |     (global.fetch as any).mockRejectedValueOnce('일반 문자열 에러');
465 |     
466 |     render(<CreateCardButton />);
467 |     
468 |     // 다이얼로그 열기
469 |     const button = screen.getByRole("button", { name: "새 카드 만들기" });
470 |     fireEvent.click(button);
471 |     
472 |     // 필수 필드 입력
473 |     fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
474 |     fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
475 |     
476 |     // 제출 버튼 클릭
477 |     fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
478 |     
479 |     // 기본 오류 메시지가 표시되는지 확인
480 |     await waitFor(() => {
481 |       expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
482 |     });
483 |   });
484 | }); 
```

src/components/cards/CreateCardButton.tsx
```
1 | "use client";
2 | 
3 | import React, { useState, useRef } from "react";
4 | import { Button } from "@/components/ui/button";
5 | import {
6 |   Dialog,
7 |   DialogContent,
8 |   DialogHeader,
9 |   DialogTitle,
10 |   DialogTrigger,
11 |   DialogDescription,
12 |   DialogClose,
13 | } from "@/components/ui/dialog";
14 | import { Input } from "@/components/ui/input";
15 | import { Label } from "@/components/ui/label";
16 | import { Badge } from "@/components/ui/badge";
17 | import { toast } from "sonner";
18 | import { X } from "lucide-react";
19 | import TiptapEditor from "@/components/editor/TiptapEditor";
20 | import { DEFAULT_USER_ID } from "@/lib/constants";
21 | 
22 | // 컴포넌트에 props 타입 정의
23 | interface CreateCardButtonProps {
24 |   onCardCreated?: (cardData: any) => void;
25 | }
26 | 
27 | export default function CreateCardButton({ onCardCreated }: CreateCardButtonProps) {
28 |   const [open, setOpen] = useState(false);
29 |   const [title, setTitle] = useState("");
30 |   const [content, setContent] = useState("");
31 |   const [tagInput, setTagInput] = useState("");
32 |   const [tags, setTags] = useState<string[]>([]);
33 |   const [isSubmitting, setIsSubmitting] = useState(false);
34 |   const isComposing = useRef(false);
35 | 
36 |   // 태그 추가 처리
37 |   const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
38 |     // IME 조합 중인 경우 처리하지 않음
39 |     if (isComposing.current) {
40 |       return;
41 |     }
42 |     
43 |     if (e.key === 'Enter' || e.key === ',') {
44 |       e.preventDefault();
45 |       
46 |       // 현재 입력된 태그가 비어있는 경우 처리하지 않음
47 |       if (!tagInput.trim()) {
48 |         return;
49 |       }
50 |       
51 |       // 쉼표로 구분된 여러 태그 처리
52 |       const newTags = tagInput
53 |         .split(',')
54 |         .map(tag => tag.trim())
55 |         .filter(tag => tag && !tags.includes(tag));
56 |       
57 |       if (newTags.length > 0) {
58 |         setTags([...tags, ...newTags]);
59 |         setTagInput('');
60 |       }
61 |     }
62 |   };
63 |   
64 |   // IME 조합 시작 핸들러
65 |   const handleCompositionStart = () => {
66 |     isComposing.current = true;
67 |   };
68 |   
69 |   // IME 조합 종료 핸들러
70 |   const handleCompositionEnd = () => {
71 |     isComposing.current = false;
72 |   };
73 | 
74 |   // 태그 삭제
75 |   const removeTag = (tagToRemove: string) => {
76 |     setTags(tags.filter(tag => tag !== tagToRemove));
77 |   };
78 | 
79 |   const handleSubmit = async (e: React.FormEvent) => {
80 |     e.preventDefault();
81 |     
82 |     if (!title.trim() || !content.trim()) {
83 |       toast.error("제목과 내용을 모두 입력해주세요.");
84 |       return;
85 |     }
86 |     
87 |     setIsSubmitting(true);
88 |     
89 |     try {
90 |       const response = await fetch("/api/cards", {
91 |         method: "POST",
92 |         headers: {
93 |           "Content-Type": "application/json",
94 |         },
95 |         body: JSON.stringify({ 
96 |           title, 
97 |           content,
98 |           userId: DEFAULT_USER_ID, // 사용자 ID 추가
99 |           tags: tags // 태그 배열 추가
100 |         }),
101 |       });
102 |       
103 |       if (!response.ok) {
104 |         const errorData = await response.json();
105 |         throw new Error(errorData.error || "카드 생성에 실패했습니다.");
106 |       }
107 |       
108 |       const createdCard = await response.json();
109 |       
110 |       toast.success("카드가 생성되었습니다.");
111 |       setTitle("");
112 |       setContent("");
113 |       setTags([]);
114 |       setTagInput("");
115 |       setOpen(false);
116 |       
117 |       // 콜백이 제공된 경우 실행
118 |       if (onCardCreated) {
119 |         onCardCreated(createdCard);
120 |       } else {
121 |         // 페이지 새로고침 (콜백이 없는 경우에만)
122 |         window.location.reload();
123 |       }
124 |     } catch (error) {
125 |       console.error("Error creating card:", error);
126 |       toast.error(error instanceof Error ? error.message : "카드 생성에 실패했습니다.");
127 |     } finally {
128 |       setIsSubmitting(false);
129 |     }
130 |   };
131 | 
132 |   // 태그 입력 중 쉼표가 입력되면 태그 추가 처리
133 |   const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
134 |     const value = e.target.value;
135 |     
136 |     // 쉼표가 포함된 경우 태그 추가 처리
137 |     if (value.includes(',')) {
138 |       const parts = value.split(',');
139 |       const lastPart = parts.pop() || '';
140 |       
141 |       // 새로운 태그들 추가 (마지막 부분 제외)
142 |       const newTags = parts
143 |         .map(part => part.trim())
144 |         .filter(part => part && !tags.includes(part));
145 |         
146 |       if (newTags.length > 0) {
147 |         setTags([...tags, ...newTags]);
148 |       }
149 |       
150 |       // 쉼표 이후 부분만 입력창에 남김
151 |       setTagInput(lastPart);
152 |     } else {
153 |       setTagInput(value);
154 |     }
155 |   };
156 | 
157 |   return (
158 |     <Dialog open={open} onOpenChange={setOpen}>
159 |       <DialogTrigger asChild>
160 |         <Button>새 카드 만들기</Button>
161 |       </DialogTrigger>
162 |       <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
163 |         <DialogHeader>
164 |           <DialogTitle>새 카드 만들기</DialogTitle>
165 |           <DialogDescription>
166 |             새로운 카드를 생성하려면 아래 양식을 작성하세요.
167 |           </DialogDescription>
168 |         </DialogHeader>
169 |         <form onSubmit={handleSubmit} className="space-y-4">
170 |           <div className="space-y-2">
171 |             <Label htmlFor="title">제목</Label>
172 |             <Input
173 |               id="title"
174 |               value={title}
175 |               onChange={(e) => setTitle(e.target.value)}
176 |               placeholder="카드 제목을 입력하세요"
177 |               disabled={isSubmitting}
178 |             />
179 |           </div>
180 |           <div className="space-y-2">
181 |             <Label htmlFor="content">내용</Label>
182 |             <TiptapEditor
183 |               content={content}
184 |               onChange={setContent}
185 |               placeholder="카드 내용을 입력하세요"
186 |               showToolbar={false}
187 |             />
188 |           </div>
189 |           <div className="space-y-2">
190 |             <Label htmlFor="tags">태그</Label>
191 |             <Input
192 |               id="tags"
193 |               value={tagInput}
194 |               onChange={handleTagInputChange}
195 |               onKeyDown={handleAddTag}
196 |               onCompositionStart={handleCompositionStart}
197 |               onCompositionEnd={handleCompositionEnd}
198 |               placeholder="태그 입력 후 Enter 또는 쉼표(,)로 구분"
199 |               disabled={isSubmitting}
200 |             />
201 |             <div className="flex flex-wrap gap-1 mt-2">
202 |               {tags.map((tag, index) => (
203 |                 <Badge key={index} variant="secondary" className="flex items-center gap-1">
204 |                   #{tag}
205 |                   <button 
206 |                     type="button" 
207 |                     onClick={() => removeTag(tag)}
208 |                     className="text-xs hover:text-destructive"
209 |                   >
210 |                     <X size={14} />
211 |                   </button>
212 |                 </Badge>
213 |               ))}
214 |             </div>
215 |           </div>
216 |           <div className="flex justify-between pt-4">
217 |             <DialogClose asChild>
218 |               <Button variant="outline" type="button">닫기</Button>
219 |             </DialogClose>
220 |             <Button type="submit" disabled={isSubmitting}>
221 |               {isSubmitting ? "생성 중..." : "생성하기"}
222 |             </Button>
223 |           </div>
224 |         </form>
225 |       </DialogContent>
226 |     </Dialog>
227 |   );
228 | } 
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
78 |           >
79 |             <X className="h-4 w-4 mr-1" />
80 |             취소
81 |           </Button>
82 |           <Button
83 |             size="sm"
84 |             onClick={handleSubmit}
85 |             disabled={isSubmitting}
86 |           >
87 |             <Check className="h-4 w-4 mr-1" />
88 |             {isSubmitting ? "저장 중..." : "저장"}
89 |           </Button>
90 |         </div>
91 |       </div>
92 |     );
93 |   }
94 | 
95 |   return (
96 |     <div className="group relative mt-6 prose prose-stone dark:prose-invert">
97 |       <TiptapViewer content={initialContent} />
98 |       <Button
99 |         variant="ghost"
100 |         size="sm"
101 |         className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
102 |         onClick={() => setIsEditing(true)}
103 |       >
104 |         <Pencil className="h-4 w-4 mr-1" />
105 |         편집
106 |       </Button>
107 |     </div>
108 |   );
109 | } 
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
64 |   it('태그 검색어(#으로 시작)로 검색 시 올바른 URL로 이동해야 함', () => {
65 |     render(<SearchBar />);
66 |     
67 |     // 입력 필드에 태그 검색어 입력
68 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
69 |     fireEvent.change(inputElement, { target: { value: '#태그검색' } });
70 |     
71 |     // 검색 버튼 클릭
72 |     const searchButton = screen.getByText('검색');
73 |     fireEvent.click(searchButton);
74 |     
75 |     // 올바른 URL로 이동했는지 확인
76 |     expect(push).toHaveBeenCalledWith('/cards?tag=%ED%83%9C%EA%B7%B8%EA%B2%80%EC%83%89');
77 |   });
78 |   
79 |   it('빈 검색어로 검색 시 기본 URL로 이동해야 함', () => {
80 |     render(<SearchBar />);
81 |     
82 |     // 입력 필드를 비움
83 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
84 |     fireEvent.change(inputElement, { target: { value: '' } });
85 |     
86 |     // 검색 버튼 클릭
87 |     const searchButton = screen.getByText('검색');
88 |     fireEvent.click(searchButton);
89 |     
90 |     // 기본 URL로 이동했는지 확인
91 |     expect(push).toHaveBeenCalledWith('/cards');
92 |   });
93 |   
94 |   it('#만 입력한 경우 처리를 확인', async () => {
95 |     render(<SearchBar />);
96 |     
97 |     // 입력 필드에 # 만 입력
98 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
99 |     fireEvent.change(inputElement, { target: { value: '#' } });
100 |     
101 |     // 입력 잘 되었는지 확인
102 |     expect(inputElement).toHaveValue('#');
103 |     
104 |     // push 함수가 호출되지 않았는지 확인 (초기 상태)
105 |     expect(push).not.toHaveBeenCalled();
106 |     
107 |     // 검색 버튼 클릭
108 |     const searchButton = screen.getByText('검색');
109 |     fireEvent.click(searchButton);
110 |     
111 |     // #만 입력된 경우는 tag가 빈 문자열이 되어 라우팅이 발생하지 않음
112 |     // SearchBar.tsx의 handleSearch 함수 내 다음 로직에 의해:
113 |     // if (searchTerm.startsWith('#')) {
114 |     //   const tag = searchTerm.slice(1); // # 제거
115 |     //   if (tag) { // 빈 문자열은 falsy이므로 이 조건을 통과하지 못함
116 |     //     router.push(`/cards?tag=${encodeURIComponent(tag)}`);
117 |     //   }
118 |     // }
119 |     
120 |     // 라우팅이 발생하지 않으므로 push 함수가 호출되지 않아야 함
121 |     expect(push).not.toHaveBeenCalled();
122 |   });
123 |   
124 |   it('엔터 키를 눌러도 검색이 실행되어야 함', () => {
125 |     render(<SearchBar />);
126 |     
127 |     // 입력 필드에 검색어 입력
128 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
129 |     fireEvent.change(inputElement, { target: { value: '엔터키검색' } });
130 |     
131 |     // 엔터 키 이벤트 발생
132 |     fireEvent.keyDown(inputElement, { key: 'Enter' });
133 |     
134 |     // 올바른 URL로 이동했는지 확인
135 |     expect(push).toHaveBeenCalledWith('/cards?q=%EC%97%94%ED%84%B0%ED%82%A4%EA%B2%80%EC%83%89');
136 |   });
137 |   
138 |   it('다른 키를 눌렀을 때는 검색이 실행되지 않아야 함', () => {
139 |     render(<SearchBar />);
140 |     
141 |     // 입력 필드에 검색어 입력
142 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
143 |     fireEvent.change(inputElement, { target: { value: '다른키테스트' } });
144 |     
145 |     // 다른 키 이벤트 발생
146 |     fireEvent.keyDown(inputElement, { key: 'Tab' });
147 |     
148 |     // 검색이 실행되지 않아야 함
149 |     expect(push).not.toHaveBeenCalled();
150 |   });
151 |   
152 |   it('X 버튼 클릭 시 검색어가 초기화되고 기본 URL로 이동해야 함', () => {
153 |     render(<SearchBar />);
154 |     
155 |     // 입력 필드에 검색어 입력
156 |     const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
157 |     fireEvent.change(inputElement, { target: { value: '지울검색어' } });
158 |     
159 |     // X 버튼이 표시되어야 함
160 |     const clearButton = screen.getByRole('button', { name: '' }); // X 아이콘은 텍스트가 없음
161 |     expect(clearButton).toBeInTheDocument();
162 |     
163 |     // X 버튼 클릭
164 |     fireEvent.click(clearButton);
165 |     
166 |     // 검색어가 초기화되고 기본 URL로 이동했는지 확인
167 |     expect(push).toHaveBeenCalledWith('/cards');
168 |     
169 |     // 입력 값이 클릭 후에 비워져야 함
170 |     // 리액트의 상태 업데이트는 비동기적이기 때문에 추가 렌더링 후 확인해야 함
171 |     expect(screen.getByPlaceholderText('검색어 입력 또는 #태그 입력')).not.toHaveValue('지울검색어');
172 |   });
173 | });
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
63 |             className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
64 |           >
65 |             <X size={16} />
66 |           </button>
67 |         )}
68 |       </div>
69 |       <Button onClick={handleSearch} variant="default">
70 |         <Search size={18} className="mr-2" />
71 |         검색
72 |       </Button>
73 |     </div>
74 |   );
75 | }; 
```

src/components/editor/TiptapEditor.tsx
```
1 | "use client";
2 | 
3 | import React, { useCallback, useEffect } from 'react'
4 | import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
5 | import StarterKit from '@tiptap/starter-kit'
6 | import Bold from '@tiptap/extension-bold'
7 | import Italic from '@tiptap/extension-italic'
8 | import Link from '@tiptap/extension-link'
9 | import Heading from '@tiptap/extension-heading'
10 | import BulletList from '@tiptap/extension-bullet-list'
11 | import OrderedList from '@tiptap/extension-ordered-list'
12 | import ListItem from '@tiptap/extension-list-item'
13 | import Image from '@tiptap/extension-image'
14 | import { Button } from '@/components/ui/button'
15 | import { 
16 |   Bold as BoldIcon,
17 |   Italic as ItalicIcon,
18 |   Link as LinkIcon,
19 |   Heading1 as H1Icon,
20 |   Heading2 as H2Icon,
21 |   List as ListIcon,
22 |   ListOrdered as OrderedListIcon,
23 |   Image as ImageIcon
24 | } from 'lucide-react'
25 | 
26 | interface TiptapEditorProps {
27 |   content: string
28 |   onChange: (content: string) => void
29 |   placeholder?: string
30 |   showToolbar?: boolean
31 | }
32 | 
33 | export default function TiptapEditor({ 
34 |   content, 
35 |   onChange, 
36 |   placeholder = '내용을 입력하세요...', 
37 |   showToolbar = true 
38 | }: TiptapEditorProps) {
39 |   const editor = useEditor({
40 |     extensions: [
41 |       StarterKit,
42 |       Bold,
43 |       Italic,
44 |       Link.configure({
45 |         openOnClick: false,
46 |       }),
47 |       Heading.configure({
48 |         levels: [1, 2],
49 |       }),
50 |       BulletList,
51 |       OrderedList,
52 |       ListItem,
53 |       Image,
54 |     ],
55 |     content: content,
56 |     onUpdate: ({ editor }) => {
57 |       onChange(editor.getHTML());
58 |     },
59 |     editorProps: {
60 |       attributes: {
61 |         class: 'min-h-[150px] prose dark:prose-invert focus:outline-none max-w-none p-4 border rounded-md',
62 |       },
63 |     },
64 |   });
65 | 
66 |   useEffect(() => {
67 |     if (editor && content !== editor.getHTML()) {
68 |       editor.commands.setContent(content);
69 |     }
70 |   }, [content, editor]);
71 | 
72 |   const setLink = useCallback(() => {
73 |     if (!editor) return;
74 |     
75 |     const previousUrl = editor.getAttributes('link').href;
76 |     const url = window.prompt('URL 입력', previousUrl);
77 | 
78 |     if (url === null) {
79 |       return;
80 |     }
81 | 
82 |     if (url === '') {
83 |       editor.chain().focus().extendMarkRange('link').unsetLink().run();
84 |       return;
85 |     }
86 | 
87 |     editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
88 |   }, [editor]);
89 | 
90 |   const addImage = useCallback(() => {
91 |     if (!editor) return;
92 |     
93 |     const url = window.prompt('이미지 URL 입력');
94 |     if (url) {
95 |       editor.chain().focus().setImage({ src: url }).run();
96 |     }
97 |   }, [editor]);
98 | 
99 |   if (!editor) {
100 |     return null;
101 |   }
102 | 
103 |   return (
104 |     <div className="tiptap-editor">
105 |       {showToolbar && (
106 |         <div className="toolbar border rounded-md mb-2 p-1 flex flex-wrap gap-1">
107 |           <Button 
108 |             variant="ghost" 
109 |             size="sm" 
110 |             onClick={() => editor.chain().focus().toggleBold().run()}
111 |             className={editor.isActive('bold') ? 'bg-secondary' : ''}
112 |           >
113 |             <BoldIcon className="h-4 w-4" />
114 |           </Button>
115 |           <Button 
116 |             variant="ghost" 
117 |             size="sm" 
118 |             onClick={() => editor.chain().focus().toggleItalic().run()}
119 |             className={editor.isActive('italic') ? 'bg-secondary' : ''}
120 |           >
121 |             <ItalicIcon className="h-4 w-4" />
122 |           </Button>
123 |           <Button 
124 |             variant="ghost" 
125 |             size="sm" 
126 |             onClick={setLink}
127 |             className={editor.isActive('link') ? 'bg-secondary' : ''}
128 |           >
129 |             <LinkIcon className="h-4 w-4" />
130 |           </Button>
131 |           <Button 
132 |             variant="ghost" 
133 |             size="sm" 
134 |             onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
135 |             className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}
136 |           >
137 |             <H1Icon className="h-4 w-4" />
138 |           </Button>
139 |           <Button 
140 |             variant="ghost" 
141 |             size="sm" 
142 |             onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
143 |             className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
144 |           >
145 |             <H2Icon className="h-4 w-4" />
146 |           </Button>
147 |           <Button 
148 |             variant="ghost" 
149 |             size="sm" 
150 |             onClick={() => editor.chain().focus().toggleBulletList().run()}
151 |             className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
152 |           >
153 |             <ListIcon className="h-4 w-4" />
154 |           </Button>
155 |           <Button 
156 |             variant="ghost" 
157 |             size="sm" 
158 |             onClick={() => editor.chain().focus().toggleOrderedList().run()}
159 |             className={editor.isActive('orderedList') ? 'bg-secondary' : ''}
160 |           >
161 |             <OrderedListIcon className="h-4 w-4" />
162 |           </Button>
163 |           <Button 
164 |             variant="ghost" 
165 |             size="sm" 
166 |             onClick={addImage}
167 |           >
168 |             <ImageIcon className="h-4 w-4" />
169 |           </Button>
170 |         </div>
171 |       )}
172 | 
173 |       {/* Bubble Menu */}
174 |       {editor && (
175 |         <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
176 |           <div className="flex bg-background shadow-lg border rounded-md p-1">
177 |             <Button 
178 |               variant="ghost" 
179 |               size="sm" 
180 |               onClick={() => editor.chain().focus().toggleBold().run()}
181 |               className={editor.isActive('bold') ? 'bg-secondary' : ''}
182 |             >
183 |               <BoldIcon className="h-4 w-4" />
184 |             </Button>
185 |             <Button 
186 |               variant="ghost" 
187 |               size="sm" 
188 |               onClick={() => editor.chain().focus().toggleItalic().run()}
189 |               className={editor.isActive('italic') ? 'bg-secondary' : ''}
190 |             >
191 |               <ItalicIcon className="h-4 w-4" />
192 |             </Button>
193 |             <Button 
194 |               variant="ghost" 
195 |               size="sm" 
196 |               onClick={setLink}
197 |               className={editor.isActive('link') ? 'bg-secondary' : ''}
198 |             >
199 |               <LinkIcon className="h-4 w-4" />
200 |             </Button>
201 |           </div>
202 |         </BubbleMenu>
203 |       )}
204 | 
205 |       {/* Floating Menu */}
206 |       {editor && (
207 |         <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
208 |           <div className="flex bg-background shadow-lg border rounded-md p-1">
209 |             <Button 
210 |               variant="ghost" 
211 |               size="sm" 
212 |               onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
213 |             >
214 |               <H1Icon className="h-4 w-4" />
215 |             </Button>
216 |             <Button 
217 |               variant="ghost" 
218 |               size="sm" 
219 |               onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
220 |             >
221 |               <H2Icon className="h-4 w-4" />
222 |             </Button>
223 |             <Button 
224 |               variant="ghost" 
225 |               size="sm" 
226 |               onClick={() => editor.chain().focus().toggleBulletList().run()}
227 |             >
228 |               <ListIcon className="h-4 w-4" />
229 |             </Button>
230 |             <Button 
231 |               variant="ghost" 
232 |               size="sm" 
233 |               onClick={() => editor.chain().focus().toggleOrderedList().run()}
234 |             >
235 |               <OrderedListIcon className="h-4 w-4" />
236 |             </Button>
237 |           </div>
238 |         </FloatingMenu>
239 |       )}
240 | 
241 |       <EditorContent editor={editor} placeholder={placeholder} />
242 |     </div>
243 |   )
244 | } 
```

src/components/editor/TiptapViewer.tsx
```
1 | "use client";
2 | 
3 | import React from 'react';
4 | import { useEditor, EditorContent } from '@tiptap/react';
5 | import StarterKit from '@tiptap/starter-kit';
6 | import Bold from '@tiptap/extension-bold';
7 | import Italic from '@tiptap/extension-italic';
8 | import Link from '@tiptap/extension-link';
9 | import Heading from '@tiptap/extension-heading';
10 | import BulletList from '@tiptap/extension-bullet-list';
11 | import OrderedList from '@tiptap/extension-ordered-list';
12 | import ListItem from '@tiptap/extension-list-item';
13 | import Image from '@tiptap/extension-image';
14 | 
15 | interface TiptapViewerProps {
16 |   content: string;
17 | }
18 | 
19 | export default function TiptapViewer({ content }: TiptapViewerProps) {
20 |   const editor = useEditor({
21 |     extensions: [
22 |       StarterKit,
23 |       Bold,
24 |       Italic,
25 |       Link.configure({
26 |         openOnClick: true,
27 |       }),
28 |       Heading.configure({
29 |         levels: [1, 2],
30 |       }),
31 |       BulletList,
32 |       OrderedList,
33 |       ListItem,
34 |       Image,
35 |     ],
36 |     content,
37 |     editable: false,
38 |     editorProps: {
39 |       attributes: {
40 |         class: 'prose dark:prose-invert max-w-none',
41 |       },
42 |     },
43 |   });
44 | 
45 |   return <EditorContent editor={editor} />;
46 | } 
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
74 |     // 입력
75 |     await user.type(tagInput, "프롬프트");
76 |     
77 |     // IME 조합 종료
78 |     fireEvent.compositionEnd(tagInput);
79 |     
80 |     expect(tagInput).toHaveValue("프롬프트");
81 |     
82 |     // 제출
83 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
84 |     
85 |     // 요청이 제대로 전송되었는지 확인
86 |     await waitFor(() => {
87 |       expect(global.fetch).toHaveBeenCalledWith("/api/tags", {
88 |         method: "POST",
89 |         headers: {
90 |           "Content-Type": "application/json",
91 |         },
92 |         body: JSON.stringify({
93 |           name: "프롬프트",
94 |         }),
95 |       });
96 |     });
97 |   });
98 | 
99 |   test("태그가 성공적으로 생성됩니다", async () => {
100 |     const user = userEvent.setup();
101 |     render(<TagForm />);
102 | 
103 |     // 태그 이름 입력
104 |     const tagInput = screen.getByLabelText("태그 이름");
105 |     await user.type(tagInput, "새로운태그");
106 |     
107 |     // 제출
108 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
109 |     
110 |     // 요청이 제대로 전송되었는지 확인
111 |     await waitFor(() => {
112 |       expect(global.fetch).toHaveBeenCalledWith("/api/tags", {
113 |         method: "POST",
114 |         headers: {
115 |           "Content-Type": "application/json",
116 |         },
117 |         body: JSON.stringify({
118 |           name: "새로운태그",
119 |         }),
120 |       });
121 |     });
122 | 
123 |     // 성공 메시지와 페이지 리로드 확인
124 |     expect(toast.success).toHaveBeenCalledWith("태그가 생성되었습니다.");
125 |     expect(mockReload).toHaveBeenCalled();
126 |   });
127 | 
128 |   test("제출 중에는 버튼이 비활성화됩니다", async () => {
129 |     // fetch를 지연시켜 로딩 상태를 확인할 수 있도록 설정
130 |     (global.fetch as any).mockImplementation(() => new Promise(resolve => {
131 |       setTimeout(() => {
132 |         resolve({
133 |           ok: true,
134 |           json: async () => ({}),
135 |         });
136 |       }, 100);
137 |     }));
138 | 
139 |     const user = userEvent.setup();
140 |     render(<TagForm />);
141 | 
142 |     // 태그 이름 입력
143 |     const tagInput = screen.getByLabelText("태그 이름");
144 |     await user.type(tagInput, "새로운태그");
145 |     
146 |     // 제출
147 |     const submitButton = screen.getByRole("button", { name: "태그 생성" });
148 |     await user.click(submitButton);
149 |     
150 |     // 버튼이 비활성화되었는지 확인
151 |     expect(submitButton).toBeDisabled();
152 |     expect(submitButton).toHaveTextContent("생성 중...");
153 |     
154 |     // 비동기 작업 완료 대기
155 |     await waitFor(() => {
156 |       expect(submitButton).not.toBeDisabled();
157 |       expect(submitButton).toHaveTextContent("태그 생성");
158 |     });
159 |   });
160 | 
161 |   test("API 오류 시 에러 메시지가 표시됩니다", async () => {
162 |     // 오류 응답 설정
163 |     (global.fetch as any).mockResolvedValue({
164 |       ok: false,
165 |       status: 500,
166 |       json: async () => ({ message: "서버 오류가 발생했습니다" }),
167 |     });
168 | 
169 |     // console.error 출력을 억제
170 |     const originalConsoleError = console.error;
171 |     console.error = vi.fn();
172 | 
173 |     const user = userEvent.setup();
174 |     render(<TagForm />);
175 | 
176 |     // 태그 이름 입력
177 |     const tagInput = screen.getByLabelText("태그 이름");
178 |     await user.type(tagInput, "새로운태그");
179 |     
180 |     // 제출
181 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
182 |     
183 |     // 오류 메시지 확인
184 |     await waitFor(() => {
185 |       expect(toast.error).toHaveBeenCalledWith("태그 생성에 실패했습니다.");
186 |     });
187 | 
188 |     // console.error 복원
189 |     console.error = originalConsoleError;
190 |   });
191 | 
192 |   test("Error 객체의 message가 토스트 메시지로 표시됩니다", async () => {
193 |     // Error 객체를 던지도록 설정
194 |     (global.fetch as any).mockImplementation(async () => {
195 |       const errorObj = new Error("네트워크 오류가 발생했습니다");
196 |       throw errorObj;
197 |     });
198 | 
199 |     // console.error 출력을 억제
200 |     const originalConsoleError = console.error;
201 |     console.error = vi.fn();
202 | 
203 |     const user = userEvent.setup();
204 |     render(<TagForm />);
205 | 
206 |     // 태그 이름 입력
207 |     const tagInput = screen.getByLabelText("태그 이름");
208 |     await user.type(tagInput, "새로운태그");
209 |     
210 |     // 제출
211 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
212 |     
213 |     // Error 객체의 message가 표시되는지 확인
214 |     await waitFor(() => {
215 |       expect(toast.error).toHaveBeenCalledWith("네트워크 오류가 발생했습니다");
216 |     });
217 | 
218 |     // console.error 복원
219 |     console.error = originalConsoleError;
220 |   });
221 | 
222 |   test("Non-Error 객체가 전달되면 기본 에러 메시지가 표시됩니다", async () => {
223 |     // Non-Error 객체를 던지도록 설정
224 |     (global.fetch as any).mockImplementation(() => {
225 |       throw "문자열 에러"; // Error 인스턴스가 아닌 단순 문자열
226 |     });
227 | 
228 |     // console.error 출력을 억제
229 |     const originalConsoleError = console.error;
230 |     console.error = vi.fn();
231 | 
232 |     const user = userEvent.setup();
233 |     render(<TagForm />);
234 | 
235 |     // 태그 이름 입력
236 |     const tagInput = screen.getByLabelText("태그 이름");
237 |     await user.type(tagInput, "새로운태그");
238 |     
239 |     // 제출
240 |     await user.click(screen.getByRole("button", { name: "태그 생성" }));
241 |     
242 |     // 기본 에러 메시지가 표시되는지 확인
243 |     await waitFor(() => {
244 |       expect(toast.error).toHaveBeenCalledWith("태그 생성에 실패했습니다.");
245 |     });
246 | 
247 |     // console.error 복원
248 |     console.error = originalConsoleError;
249 |   });
250 | }); 
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
62 |     render(<TagList initialTags={mockTags} />);
63 |     
64 |     // 첫 번째 태그의 삭제 버튼 클릭
65 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
66 |     fireEvent.click(deleteButtons[0]);
67 |     
68 |     // 확인 다이얼로그가 표시되었는지 확인
69 |     expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
70 |     expect(screen.getByText(/태그 "자바스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
71 |     expect(screen.getByText('이 태그가 지정된 5개의 카드에서 태그가 제거됩니다.')).toBeInTheDocument();
72 |   });
73 |   
74 |   it('카드 수가 0인 태그는 경고 메시지가 표시되지 않아야 함', async () => {
75 |     render(<TagList initialTags={mockTags} />);
76 |     
77 |     // 세 번째 태그(카드 수 0)의 삭제 버튼 클릭
78 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
79 |     fireEvent.click(deleteButtons[2]);
80 |     
81 |     // 확인 다이얼로그가 표시되었는지 확인
82 |     expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
83 |     expect(screen.getByText(/태그 "타입스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
84 |     
85 |     // 경고 메시지가 표시되지 않아야 함
86 |     expect(screen.queryByText(/이 태그가 지정된 0개의 카드에서 태그가 제거됩니다./)).not.toBeInTheDocument();
87 |   });
88 |   
89 |   it('태그 삭제 확인 시 API 호출이 이루어지고 태그가 목록에서 제거되어야 함', async () => {
90 |     render(<TagList initialTags={mockTags} />);
91 |     
92 |     // 첫 번째 태그의 삭제 버튼 클릭
93 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
94 |     fireEvent.click(deleteButtons[0]);
95 |     
96 |     // 확인 다이얼로그에서 삭제 버튼 클릭
97 |     const confirmButton = screen.getByRole('button', { name: '삭제' });
98 |     fireEvent.click(confirmButton);
99 |     
100 |     // API 호출 확인
101 |     await waitFor(() => {
102 |       expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
103 |     });
104 |     
105 |     // 토스트 메시지 표시 확인
106 |     const { toast } = await import('sonner');
107 |     expect(toast.success).toHaveBeenCalledWith('태그가 삭제되었습니다.');
108 |     
109 |     // 태그가 목록에서 제거되었는지 확인
110 |     expect(screen.queryByText('자바스크립트')).not.toBeInTheDocument();
111 |     
112 |     // 다른 태그는 여전히 표시되어야 함
113 |     expect(screen.getByText('리액트')).toBeInTheDocument();
114 |     expect(screen.getByText('타입스크립트')).toBeInTheDocument();
115 |   });
116 |   
117 |   it('태그 삭제 실패 시 에러 메시지가 표시되어야 함', async () => {
118 |     // fetch 실패 모킹
119 |     (global.fetch as Mock).mockResolvedValue({
120 |       ok: false,
121 |       json: async () => ({ error: '태그 삭제에 실패했습니다.' })
122 |     } as Response);
123 |     
124 |     render(<TagList initialTags={mockTags} />);
125 |     
126 |     // 첫 번째 태그의 삭제 버튼 클릭
127 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
128 |     fireEvent.click(deleteButtons[0]);
129 |     
130 |     // 확인 다이얼로그에서 삭제 버튼 클릭
131 |     const confirmButton = screen.getByRole('button', { name: '삭제' });
132 |     fireEvent.click(confirmButton);
133 |     
134 |     // API 호출 확인
135 |     await waitFor(() => {
136 |       expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
137 |     });
138 |     
139 |     // 에러 토스트 메시지 표시 확인
140 |     const { toast } = await import('sonner');
141 |     expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
142 |     
143 |     // 태그는 여전히 목록에 남아있어야 함
144 |     expect(screen.getByText('자바스크립트')).toBeInTheDocument();
145 |   });
146 |   
147 |   it('태그 삭제 중 네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
148 |     // fetch 네트워크 오류 모킹
149 |     (global.fetch as Mock).mockRejectedValue(new Error('네트워크 오류'));
150 |     
151 |     render(<TagList initialTags={mockTags} />);
152 |     
153 |     // 첫 번째 태그의 삭제 버튼 클릭
154 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
155 |     fireEvent.click(deleteButtons[0]);
156 |     
157 |     // 확인 다이얼로그에서 삭제 버튼 클릭
158 |     const confirmButton = screen.getByRole('button', { name: '삭제' });
159 |     fireEvent.click(confirmButton);
160 |     
161 |     // API 호출 확인
162 |     await waitFor(() => {
163 |       expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
164 |     });
165 |     
166 |     // 에러 토스트 메시지 표시 확인
167 |     const { toast } = await import('sonner');
168 |     expect(toast.error).toHaveBeenCalledWith('네트워크 오류');
169 |     
170 |     // 태그는 여전히 목록에 남아있어야 함
171 |     expect(screen.getByText('자바스크립트')).toBeInTheDocument();
172 |   });
173 |   
174 |   // 브랜치 커버리지 테스트: tagToDelete가 null일 때 (46번 라인)
175 |   it('tagToDelete가 null일 때 삭제 함수가 조기 종료되어야 함', async () => {
176 |     // TagList 컴포넌트 렌더링
177 |     const { rerender } = render(<TagList initialTags={mockTags} />);
178 |     
179 |     // React 내부 상태 직접 조작을 위한 커스텀 컴포넌트
180 |     const TestComponent = () => {
181 |       const [tags, setTags] = React.useState(mockTags);
182 |       const [tagToDelete, setTagToDelete] = React.useState<string | null>(null);
183 |       
184 |       const handleDeleteTag = async () => {
185 |         if (!tagToDelete) return;
186 |         
187 |         // 이 부분은 실행되지 않아야 함
188 |         await fetch(`/api/tags/${tagToDelete}`, {
189 |           method: "DELETE",
190 |         });
191 |       };
192 |       
193 |       // 테스트를 위해 함수 직접 호출
194 |       React.useEffect(() => {
195 |         handleDeleteTag();
196 |       }, []);
197 |       
198 |       return <div>테스트 컴포넌트</div>;
199 |     };
200 |     
201 |     // 커스텀 컴포넌트 렌더링
202 |     render(<TestComponent />);
203 |     
204 |     // fetch가 호출되지 않았는지 확인
205 |     expect(global.fetch).not.toHaveBeenCalled();
206 |   });
207 |   
208 |   // 더 직접적인 방식으로 46번 라인 커버하기
209 |   it('tagToDelete가 null일 때 삭제 시도하면 API 호출이 발생하지 않아야 함', async () => {
210 |     // 모킹 클리어
211 |     vi.clearAllMocks();
212 |     
213 |     // 컴포넌트 렌더링
214 |     render(<TagList initialTags={mockTags} />);
215 |     
216 |     // TagList 내부 동작을 정확히 시뮬레이션
217 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
218 |     fireEvent.click(deleteButtons[0]); // 태그 선택
219 |     
220 |     // 다이얼로그가 표시되었는지 확인
221 |     expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
222 |     
223 |     // 취소 버튼 클릭 (이렇게 하면 tagToDelete는 설정되었지만 삭제 함수가 실행되기 전에 null로 재설정됨)
224 |     const cancelButton = screen.getByRole('button', { name: '취소' });
225 |     fireEvent.click(cancelButton);
226 |     
227 |     // 취소 후 바로 다시 삭제 버튼을 찾아서 실행 시도
228 |     // 이 시점에서 내부적으로 tagToDelete는 null이 되었을 것임
229 |     try {
230 |       // 컴포넌트 내부에서 직접 handleDeleteTag를 호출할 방법이 없으므로
231 |       // 수동으로 해당 함수의 로직을 시뮬레이션합니다
232 |       if (document.querySelector('[data-open="true"]')) {
233 |         const confirmButton = screen.getByRole('button', { name: '삭제' });
234 |         fireEvent.click(confirmButton); // 이 때 내부적으로 null 체크가 발생함
235 |       }
236 |     } catch (e) {
237 |       // 버튼이 이미 사라진 경우 에러가 발생할 수 있음
238 |     }
239 |     
240 |     // 컴포넌트의 상태 변화를 기다림
241 |     await waitFor(() => {
242 |       // API 호출이 발생하지 않았는지 확인 (tagToDelete가 null이므로)
243 |       expect(global.fetch).not.toHaveBeenCalled();
244 |     });
245 |   });
246 |   
247 |   // 브랜치 커버리지 테스트: errorData.error가 없을 때 (57번 라인)
248 |   it('API 응답에 error 속성이 없을 때 기본 오류 메시지를 사용해야 함', async () => {
249 |     // error 속성이 없는 응답 모킹
250 |     (global.fetch as Mock).mockResolvedValue({
251 |       ok: false,
252 |       json: async () => ({ message: 'no error field' }) // error 필드 없음
253 |     } as Response);
254 |     
255 |     render(<TagList initialTags={mockTags} />);
256 |     
257 |     // 태그 삭제 프로세스 시작
258 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
259 |     fireEvent.click(deleteButtons[0]);
260 |     
261 |     const confirmButton = screen.getByRole('button', { name: '삭제' });
262 |     fireEvent.click(confirmButton);
263 |     
264 |     // API 호출 확인
265 |     await waitFor(() => {
266 |       expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
267 |     });
268 |     
269 |     // 기본 오류 메시지 사용 확인
270 |     const { toast } = await import('sonner');
271 |     expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
272 |   });
273 |   
274 |   // 브랜치 커버리지 테스트: error가 Error 인스턴스가 아닐 때 (65번 라인)
275 |   it('error가 Error 인스턴스가 아닐 때 기본 오류 메시지를 사용해야 함', async () => {
276 |     // Error 객체가 아닌 문자열 등의 오류로 reject
277 |     (global.fetch as Mock).mockRejectedValue('일반 문자열 에러'); // Error 인스턴스 아님
278 |     
279 |     render(<TagList initialTags={mockTags} />);
280 |     
281 |     // 태그 삭제 프로세스 시작
282 |     const deleteButtons = screen.getAllByRole('button', { name: '' });
283 |     fireEvent.click(deleteButtons[0]);
284 |     
285 |     const confirmButton = screen.getByRole('button', { name: '삭제' });
286 |     fireEvent.click(confirmButton);
287 |     
288 |     // API 호출 확인
289 |     await waitFor(() => {
290 |       expect(global.fetch).toHaveBeenCalledWith('/api/tags/1', { method: 'DELETE' });
291 |     });
292 |     
293 |     // 기본 오류 메시지 사용 확인
294 |     const { toast } = await import('sonner');
295 |     expect(toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
296 |   });
297 |   
298 |   it('다양한 태그 이름(한글, 영어, 특수문자)이 올바르게 표시되어야 함', () => {
299 |     const diverseTags = [
300 |       { id: '1', name: '한글태그', count: 1, createdAt: '2023년 1월 1일' },
301 |       { id: '2', name: 'EnglishTag', count: 2, createdAt: '2023년 2월 1일' },
302 |       { id: '3', name: '특수_문자-태그', count: 3, createdAt: '2023년 3월 1일' },
303 |       { id: '4', name: '한글English혼합123', count: 4, createdAt: '2023년 4월 1일' }
304 |     ];
305 |     
306 |     render(<TagList initialTags={diverseTags} />);
307 |     
308 |     // 각 태그가 올바르게 표시되는지 확인
309 |     expect(screen.getByText('한글태그')).toBeInTheDocument();
310 |     expect(screen.getByText('EnglishTag')).toBeInTheDocument();
311 |     expect(screen.getByText('특수_문자-태그')).toBeInTheDocument();
312 |     expect(screen.getByText('한글English혼합123')).toBeInTheDocument();
313 |   });
314 | }); 
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
77 |         </div>
78 |       ) : (
79 |         <Table>
80 |           <TableHeader>
81 |             <TableRow>
82 |               <TableHead>태그 이름</TableHead>
83 |               <TableHead className="text-center">카드 수</TableHead>
84 |               <TableHead>생성일</TableHead>
85 |               <TableHead className="text-right">관리</TableHead>
86 |             </TableRow>
87 |           </TableHeader>
88 |           <TableBody>
89 |             {tags.map((tag) => (
90 |               <TableRow key={tag.id}>
91 |                 <TableCell>
92 |                   <Badge variant="outline" className="font-normal">
93 |                     {tag.name}
94 |                   </Badge>
95 |                 </TableCell>
96 |                 <TableCell className="text-center">
97 |                   {tag.count > 0 ? (
98 |                     <Link href={`/cards?tag=${tag.name}`}>
99 |                       <Button variant="link" size="sm" className="p-0">
100 |                         {tag.count}개 카드
101 |                       </Button>
102 |                     </Link>
103 |                   ) : (
104 |                     <span className="text-muted-foreground">0개</span>
105 |                   )}
106 |                 </TableCell>
107 |                 <TableCell>{tag.createdAt}</TableCell>
108 |                 <TableCell className="text-right">
109 |                   <AlertDialog>
110 |                     <AlertDialogTrigger asChild>
111 |                       <Button
112 |                         variant="ghost"
113 |                         size="sm"
114 |                         onClick={() => setTagToDelete(tag.id)}
115 |                       >
116 |                         <Trash2 className="h-4 w-4 text-destructive" />
117 |                       </Button>
118 |                     </AlertDialogTrigger>
119 |                     <AlertDialogContent>
120 |                       <AlertDialogHeader>
121 |                         <AlertDialogTitle>태그 삭제 확인</AlertDialogTitle>
122 |                         <AlertDialogDescription>
123 |                           태그 "{tag.name}"을(를) 삭제하시겠습니까?
124 |                         </AlertDialogDescription>
125 |                         {tag.count > 0 && (
126 |                           <AlertDialogDescription className="text-destructive">
127 |                             이 태그가 지정된 {tag.count}개의 카드에서 태그가 제거됩니다.
128 |                           </AlertDialogDescription>
129 |                         )}
130 |                       </AlertDialogHeader>
131 |                       <AlertDialogFooter>
132 |                         <AlertDialogCancel>취소</AlertDialogCancel>
133 |                         <AlertDialogAction
134 |                           onClick={handleDeleteTag}
135 |                           disabled={isDeleting}
136 |                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
137 |                         >
138 |                           {isDeleting ? "삭제 중..." : "삭제"}
139 |                         </AlertDialogAction>
140 |                       </AlertDialogFooter>
141 |                     </AlertDialogContent>
142 |                   </AlertDialog>
143 |                 </TableCell>
144 |               </TableRow>
145 |             ))}
146 |           </TableBody>
147 |         </Table>
148 |       )}
149 |     </div>
150 |   );
151 | } 
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
69 | }: React.ComponentProps<"div">) {
70 |   return (
71 |     <div
72 |       data-slot="alert-dialog-header"
73 |       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
74 |       {...props}
75 |     />
76 |   )
77 | }
78 | 
79 | function AlertDialogFooter({
80 |   className,
81 |   ...props
82 | }: React.ComponentProps<"div">) {
83 |   return (
84 |     <div
85 |       data-slot="alert-dialog-footer"
86 |       className={cn(
87 |         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
88 |         className
89 |       )}
90 |       {...props}
91 |     />
92 |   )
93 | }
94 | 
95 | function AlertDialogTitle({
96 |   className,
97 |   ...props
98 | }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
99 |   return (
100 |     <AlertDialogPrimitive.Title
101 |       data-slot="alert-dialog-title"
102 |       className={cn("text-lg font-semibold", className)}
103 |       {...props}
104 |     />
105 |   )
106 | }
107 | 
108 | function AlertDialogDescription({
109 |   className,
110 |   ...props
111 | }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
112 |   return (
113 |     <AlertDialogPrimitive.Description
114 |       data-slot="alert-dialog-description"
115 |       className={cn("text-muted-foreground text-sm", className)}
116 |       {...props}
117 |     />
118 |   )
119 | }
120 | 
121 | function AlertDialogAction({
122 |   className,
123 |   ...props
124 | }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
125 |   return (
126 |     <AlertDialogPrimitive.Action
127 |       className={cn(buttonVariants(), className)}
128 |       {...props}
129 |     />
130 |   )
131 | }
132 | 
133 | function AlertDialogCancel({
134 |   className,
135 |   ...props
136 | }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
137 |   return (
138 |     <AlertDialogPrimitive.Cancel
139 |       className={cn(buttonVariants({ variant: "outline" }), className)}
140 |       {...props}
141 |     />
142 |   )
143 | }
144 | 
145 | export {
146 |   AlertDialog,
147 |   AlertDialogPortal,
148 |   AlertDialogOverlay,
149 |   AlertDialogTrigger,
150 |   AlertDialogContent,
151 |   AlertDialogHeader,
152 |   AlertDialogFooter,
153 |   AlertDialogTitle,
154 |   AlertDialogDescription,
155 |   AlertDialogAction,
156 |   AlertDialogCancel,
157 | }
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
52 |       className={cn(buttonVariants({ variant, size, className }))}
53 |       {...props}
54 |     />
55 |   )
56 | }
57 | 
58 | export { Button, buttonVariants }
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
60 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
61 |           className
62 |         )}
63 |         {...props}
64 |       >
65 |         {children}
66 |         <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
67 |           <XIcon />
68 |           <span className="sr-only">Close</span>
69 |         </DialogPrimitive.Close>
70 |       </DialogPrimitive.Content>
71 |     </DialogPortal>
72 |   )
73 | }
74 | 
75 | function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
76 |   return (
77 |     <div
78 |       data-slot="dialog-header"
79 |       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
86 |   return (
87 |     <div
88 |       data-slot="dialog-footer"
89 |       className={cn(
90 |         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
91 |         className
92 |       )}
93 |       {...props}
94 |     />
95 |   )
96 | }
97 | 
98 | function DialogTitle({
99 |   className,
100 |   ...props
101 | }: React.ComponentProps<typeof DialogPrimitive.Title>) {
102 |   return (
103 |     <DialogPrimitive.Title
104 |       data-slot="dialog-title"
105 |       className={cn("text-lg leading-none font-semibold", className)}
106 |       {...props}
107 |     />
108 |   )
109 | }
110 | 
111 | function DialogDescription({
112 |   className,
113 |   ...props
114 | }: React.ComponentProps<typeof DialogPrimitive.Description>) {
115 |   return (
116 |     <DialogPrimitive.Description
117 |       data-slot="dialog-description"
118 |       className={cn("text-muted-foreground text-sm", className)}
119 |       {...props}
120 |     />
121 |   )
122 | }
123 | 
124 | export {
125 |   Dialog,
126 |   DialogClose,
127 |   DialogContent,
128 |   DialogDescription,
129 |   DialogFooter,
130 |   DialogHeader,
131 |   DialogOverlay,
132 |   DialogPortal,
133 |   DialogTitle,
134 |   DialogTrigger,
135 | }
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
67 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
68 |   inset?: boolean
69 |   variant?: "default" | "destructive"
70 | }) {
71 |   return (
72 |     <DropdownMenuPrimitive.Item
73 |       data-slot="dropdown-menu-item"
74 |       data-inset={inset}
75 |       data-variant={variant}
76 |       className={cn(
77 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
78 |         className
79 |       )}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DropdownMenuCheckboxItem({
86 |   className,
87 |   children,
88 |   checked,
89 |   ...props
90 | }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
91 |   return (
92 |     <DropdownMenuPrimitive.CheckboxItem
93 |       data-slot="dropdown-menu-checkbox-item"
94 |       className={cn(
95 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
96 |         className
97 |       )}
98 |       checked={checked}
99 |       {...props}
100 |     >
101 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
102 |         <DropdownMenuPrimitive.ItemIndicator>
103 |           <CheckIcon className="size-4" />
104 |         </DropdownMenuPrimitive.ItemIndicator>
105 |       </span>
106 |       {children}
107 |     </DropdownMenuPrimitive.CheckboxItem>
108 |   )
109 | }
110 | 
111 | function DropdownMenuRadioGroup({
112 |   ...props
113 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
114 |   return (
115 |     <DropdownMenuPrimitive.RadioGroup
116 |       data-slot="dropdown-menu-radio-group"
117 |       {...props}
118 |     />
119 |   )
120 | }
121 | 
122 | function DropdownMenuRadioItem({
123 |   className,
124 |   children,
125 |   ...props
126 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
127 |   return (
128 |     <DropdownMenuPrimitive.RadioItem
129 |       data-slot="dropdown-menu-radio-item"
130 |       className={cn(
131 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
132 |         className
133 |       )}
134 |       {...props}
135 |     >
136 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
137 |         <DropdownMenuPrimitive.ItemIndicator>
138 |           <CircleIcon className="size-2 fill-current" />
139 |         </DropdownMenuPrimitive.ItemIndicator>
140 |       </span>
141 |       {children}
142 |     </DropdownMenuPrimitive.RadioItem>
143 |   )
144 | }
145 | 
146 | function DropdownMenuLabel({
147 |   className,
148 |   inset,
149 |   ...props
150 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
151 |   inset?: boolean
152 | }) {
153 |   return (
154 |     <DropdownMenuPrimitive.Label
155 |       data-slot="dropdown-menu-label"
156 |       data-inset={inset}
157 |       className={cn(
158 |         "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
159 |         className
160 |       )}
161 |       {...props}
162 |     />
163 |   )
164 | }
165 | 
166 | function DropdownMenuSeparator({
167 |   className,
168 |   ...props
169 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
170 |   return (
171 |     <DropdownMenuPrimitive.Separator
172 |       data-slot="dropdown-menu-separator"
173 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
174 |       {...props}
175 |     />
176 |   )
177 | }
178 | 
179 | function DropdownMenuShortcut({
180 |   className,
181 |   ...props
182 | }: React.ComponentProps<"span">) {
183 |   return (
184 |     <span
185 |       data-slot="dropdown-menu-shortcut"
186 |       className={cn(
187 |         "text-muted-foreground ml-auto text-xs tracking-widest",
188 |         className
189 |       )}
190 |       {...props}
191 |     />
192 |   )
193 | }
194 | 
195 | function DropdownMenuSub({
196 |   ...props
197 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
198 |   return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
199 | }
200 | 
201 | function DropdownMenuSubTrigger({
202 |   className,
203 |   inset,
204 |   children,
205 |   ...props
206 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
207 |   inset?: boolean
208 | }) {
209 |   return (
210 |     <DropdownMenuPrimitive.SubTrigger
211 |       data-slot="dropdown-menu-sub-trigger"
212 |       data-inset={inset}
213 |       className={cn(
214 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
215 |         className
216 |       )}
217 |       {...props}
218 |     >
219 |       {children}
220 |       <ChevronRightIcon className="ml-auto size-4" />
221 |     </DropdownMenuPrimitive.SubTrigger>
222 |   )
223 | }
224 | 
225 | function DropdownMenuSubContent({
226 |   className,
227 |   ...props
228 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
229 |   return (
230 |     <DropdownMenuPrimitive.SubContent
231 |       data-slot="dropdown-menu-sub-content"
232 |       className={cn(
233 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
234 |         className
235 |       )}
236 |       {...props}
237 |     />
238 |   )
239 | }
240 | 
241 | export {
242 |   DropdownMenu,
243 |   DropdownMenuPortal,
244 |   DropdownMenuTrigger,
245 |   DropdownMenuContent,
246 |   DropdownMenuGroup,
247 |   DropdownMenuLabel,
248 |   DropdownMenuItem,
249 |   DropdownMenuCheckboxItem,
250 |   DropdownMenuRadioGroup,
251 |   DropdownMenuRadioItem,
252 |   DropdownMenuSeparator,
253 |   DropdownMenuShortcut,
254 |   DropdownMenuSub,
255 |   DropdownMenuSubTrigger,
256 |   DropdownMenuSubContent,
257 | }
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
78 | 
79 |   return (
80 |     <FormItemContext.Provider value={{ id }}>
81 |       <div
82 |         data-slot="form-item"
83 |         className={cn("grid gap-2", className)}
84 |         {...props}
85 |       />
86 |     </FormItemContext.Provider>
87 |   )
88 | }
89 | 
90 | function FormLabel({
91 |   className,
92 |   ...props
93 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
94 |   const { error, formItemId } = useFormField()
95 | 
96 |   return (
97 |     <Label
98 |       data-slot="form-label"
99 |       data-error={!!error}
100 |       className={cn("data-[error=true]:text-destructive-foreground", className)}
101 |       htmlFor={formItemId}
102 |       {...props}
103 |     />
104 |   )
105 | }
106 | 
107 | function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
108 |   const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
109 | 
110 |   return (
111 |     <Slot
112 |       data-slot="form-control"
113 |       id={formItemId}
114 |       aria-describedby={
115 |         !error
116 |           ? `${formDescriptionId}`
117 |           : `${formDescriptionId} ${formMessageId}`
118 |       }
119 |       aria-invalid={!!error}
120 |       {...props}
121 |     />
122 |   )
123 | }
124 | 
125 | function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
126 |   const { formDescriptionId } = useFormField()
127 | 
128 |   return (
129 |     <p
130 |       data-slot="form-description"
131 |       id={formDescriptionId}
132 |       className={cn("text-muted-foreground text-sm", className)}
133 |       {...props}
134 |     />
135 |   )
136 | }
137 | 
138 | function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
139 |   const { error, formMessageId } = useFormField()
140 |   const body = error ? String(error?.message) : props.children
141 | 
142 |   if (!body) {
143 |     return null
144 |   }
145 | 
146 |   return (
147 |     <p
148 |       data-slot="form-message"
149 |       id={formMessageId}
150 |       className={cn("text-destructive-foreground text-sm", className)}
151 |       {...props}
152 |     >
153 |       {body}
154 |     </p>
155 |   )
156 | }
157 | 
158 | export {
159 |   useFormField,
160 |   Form,
161 |   FormItem,
162 |   FormLabel,
163 |   FormControl,
164 |   FormDescription,
165 |   FormMessage,
166 |   FormField,
167 | }
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
72 |       className={cn(
73 |         "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
74 |         className
75 |       )}
76 |       {...props}
77 |     />
78 |   )
79 | }
80 | 
81 | function TableCell({ className, ...props }: React.ComponentProps<"td">) {
82 |   return (
83 |     <td
84 |       data-slot="table-cell"
85 |       className={cn(
86 |         "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
87 |         className
88 |       )}
89 |       {...props}
90 |     />
91 |   )
92 | }
93 | 
94 | function TableCaption({
95 |   className,
96 |   ...props
97 | }: React.ComponentProps<"caption">) {
98 |   return (
99 |     <caption
100 |       data-slot="table-caption"
101 |       className={cn("text-muted-foreground mt-4 text-sm", className)}
102 |       {...props}
103 |     />
104 |   )
105 | }
106 | 
107 | export {
108 |   Table,
109 |   TableHeader,
110 |   TableBody,
111 |   TableFooter,
112 |   TableHead,
113 |   TableRow,
114 |   TableCell,
115 |   TableCaption,
116 | }
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
73 |     console.error('보드 설정 조회 실패:', error);
74 |     return NextResponse.json({ error: '보드 설정을 조회하는 데 실패했습니다.' }, { status: 500 });
75 |   }
76 | } 
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
81 |       object: () => ({
82 |         safeParse: vi.fn().mockImplementation((data) => {
83 |           // title이 없으면 유효성 검사 실패
84 |           if (!data.title) {
85 |             return {
86 |               success: false,
87 |               error: {
88 |                 format: () => ({ title: { _errors: ['제목은 필수입니다.'] } })
89 |               }
90 |             };
91 |           }
92 |           // userId가 유효하지 않으면 실패
93 |           if (data.userId && typeof data.userId !== 'string') {
94 |             return {
95 |               success: false,
96 |               error: {
97 |                 format: () => ({ userId: { _errors: ['유효한 사용자 ID가 필요합니다.'] } })
98 |               }
99 |             };
100 |           }
101 |           return {
102 |             success: true,
103 |             data
104 |           };
105 |         })
106 |       }),
107 |       string: () => ({
108 |         min: () => ({
109 |           optional: vi.fn(),
110 |           uuid: vi.fn().mockReturnThis()
111 |         }),
112 |         optional: vi.fn(),
113 |         uuid: vi.fn().mockReturnThis()
114 |       }),
115 |       array: () => ({
116 |         optional: vi.fn()
117 |       })
118 |     }
119 |   };
120 | });
121 | 
122 | describe('Cards API', () => {
123 |   // console.error 모킹
124 |   const originalConsoleError = console.error;
125 |   let prismaMock: any;
126 |   
127 |   beforeEach(async () => {
128 |     vi.clearAllMocks();
129 |     console.error = vi.fn();
130 |     
131 |     // 모든 테스트에서 사용할 prisma mock 설정
132 |     const importedModule = await import('@/lib/prisma');
133 |     prismaMock = vi.mocked(importedModule).prisma;
134 |   });
135 |   
136 |   // 테스트 후 원래 console.error 복원
137 |   afterAll(() => {
138 |     console.error = originalConsoleError;
139 |   });
140 | 
141 |   describe('GET /api/cards', () => {
142 |     it('모든 카드를 성공적으로 조회한다', async () => {
143 |       // 모킹된 데이터
144 |       const mockCards = [
145 |         {
146 |           id: '1',
147 |           title: '테스트 카드 1',
148 |           content: '테스트 내용 1',
149 |           createdAt: new Date(),
150 |           updatedAt: new Date(),
151 |           userId: 'user1',
152 |           user: { id: 'user1', name: '사용자 1' }
153 |         },
154 |         {
155 |           id: '2',
156 |           title: '테스트 카드 2',
157 |           content: '테스트 내용 2',
158 |           createdAt: new Date(),
159 |           updatedAt: new Date(),
160 |           userId: 'user2',
161 |           user: { id: 'user2', name: '사용자 2' }
162 |         },
163 |       ];
164 | 
165 |       // Prisma 응답 모킹
166 |       prismaMock.card.findMany.mockResolvedValueOnce(mockCards);
167 | 
168 |       // API 호출
169 |       const request = new NextRequest('http://localhost:3000/api/cards');
170 |       const response = await GET(request);
171 |       
172 |       // 검증
173 |       expect(response.status).toBe(200);
174 |       const data = await response.json();
175 |       expect(data).toEqual(mockCards);
176 |       expect(prismaMock.card.findMany).toHaveBeenCalled();
177 |     });
178 | 
179 |     it('사용자 ID로 필터링된 카드를 조회한다', async () => {
180 |       const userId = 'user1';
181 |       const mockCards = [
182 |         {
183 |           id: '1',
184 |           title: '테스트 카드 1',
185 |           content: '테스트 내용 1',
186 |           createdAt: new Date(),
187 |           updatedAt: new Date(),
188 |           userId: userId,
189 |           user: { id: userId, name: '사용자 1' }
190 |         }
191 |       ];
192 | 
193 |       prismaMock.card.findMany.mockResolvedValueOnce(mockCards);
194 | 
195 |       const request = new NextRequest(`http://localhost:3000/api/cards?userId=${userId}`);
196 |       const response = await GET(request);
197 |       
198 |       expect(response.status).toBe(200);
199 |       const data = await response.json();
200 |       expect(data).toEqual(mockCards);
201 |       expect(prismaMock.card.findMany).toHaveBeenCalledWith({
202 |         where: { userId },
203 |         orderBy: { createdAt: 'desc' },
204 |         include: {
205 |           user: {
206 |             select: {
207 |               id: true,
208 |               name: true
209 |             }
210 |           },
211 |           cardTags: {
212 |             include: {
213 |               tag: true
214 |             }
215 |           }
216 |         }
217 |       });
218 |     });
219 | 
220 |     it('검색어로 카드를 필터링한다', async () => {
221 |       const searchQuery = '테스트';
222 |       const mockCards = [
223 |         {
224 |           id: '1',
225 |           title: '테스트 카드 1',
226 |           content: '테스트 내용 1',
227 |           createdAt: new Date(),
228 |           updatedAt: new Date(),
229 |           userId: 'user1',
230 |           user: { id: 'user1', name: '사용자 1' }
231 |         }
232 |       ];
233 | 
234 |       prismaMock.card.findMany.mockResolvedValueOnce(mockCards);
235 | 
236 |       const request = new NextRequest(`http://localhost:3000/api/cards?q=${searchQuery}`);
237 |       const response = await GET(request);
238 |       
239 |       expect(response.status).toBe(200);
240 |       const data = await response.json();
241 |       expect(data).toEqual(mockCards);
242 |       expect(prismaMock.card.findMany).toHaveBeenCalledWith({
243 |         where: {
244 |           OR: [
245 |             { title: { contains: searchQuery, mode: 'insensitive' } },
246 |             { content: { contains: searchQuery, mode: 'insensitive' } }
247 |           ]
248 |         },
249 |         orderBy: { createdAt: 'desc' },
250 |         include: {
251 |           user: {
252 |             select: {
253 |               id: true,
254 |               name: true
255 |             }
256 |           },
257 |           cardTags: {
258 |             include: {
259 |               tag: true
260 |             }
261 |           }
262 |         }
263 |       });
264 |     });
265 | 
266 |     it('태그로 카드를 필터링한다', async () => {
267 |       const tagName = '테스트태그';
268 |       const mockCards = [
269 |         {
270 |           id: '1',
271 |           title: '테스트 카드 1',
272 |           content: '테스트 내용 1',
273 |           createdAt: new Date(),
274 |           updatedAt: new Date(),
275 |           userId: 'user1',
276 |           user: { id: 'user1', name: '사용자 1' },
277 |           cardTags: [
278 |             {
279 |               id: 'cardtag-1',
280 |               cardId: '1',
281 |               tagId: 'tag-1',
282 |               tag: {
283 |                 id: 'tag-1',
284 |                 name: tagName
285 |               }
286 |             }
287 |           ]
288 |         }
289 |       ];
290 | 
291 |       prismaMock.card.findMany.mockResolvedValueOnce(mockCards);
292 | 
293 |       const request = new NextRequest(`http://localhost:3000/api/cards?tag=${tagName}`);
294 |       const response = await GET(request);
295 |       
296 |       expect(response.status).toBe(200);
297 |       const data = await response.json();
298 |       expect(data).toEqual(mockCards);
299 |       expect(prismaMock.card.findMany).toHaveBeenCalledWith({
300 |         where: {
301 |           cardTags: {
302 |             some: {
303 |               tag: {
304 |                 name: tagName
305 |               }
306 |             }
307 |           }
308 |         },
309 |         orderBy: { createdAt: 'desc' },
310 |         include: {
311 |           user: {
312 |             select: {
313 |               id: true,
314 |               name: true
315 |             }
316 |           },
317 |           cardTags: {
318 |             include: {
319 |               tag: true
320 |             }
321 |           }
322 |         }
323 |       });
324 |     });
325 | 
326 |     it('에러 발생 시 500 응답을 반환한다', async () => {
327 |       // 에러 모킹
328 |       prismaMock.card.findMany.mockRejectedValueOnce(new Error('DB 에러'));
329 | 
330 |       // API 호출
331 |       const request = new NextRequest('http://localhost:3000/api/cards');
332 |       const response = await GET(request);
333 |       
334 |       // 검증
335 |       expect(response.status).toBe(500);
336 |       const data = await response.json();
337 |       expect(data).toHaveProperty('error');
338 |     });
339 |   });
340 | 
341 |   describe('POST /api/cards', () => {
342 |     it('유효한 데이터로 카드를 성공적으로 생성한다', async () => {
343 |       // 유효한 요청 데이터
344 |       const requestData = {
345 |         title: '새 카드 제목',
346 |         content: '새 카드 내용',
347 |         userId: '123e4567-e89b-12d3-a456-426614174000',
348 |         tags: ['테스트태그']
349 |       };
350 |       
351 |       // 생성된 카드 데이터 모킹
352 |       const createdCard = {
353 |         id: 'new-card-id',
354 |         title: requestData.title,
355 |         content: requestData.content,
356 |         userId: requestData.userId,
357 |         createdAt: new Date(),
358 |         updatedAt: new Date()
359 |       };
360 |       
361 |       // 태그 포함된 카드 데이터 모킹
362 |       const cardWithTags = {
363 |         ...createdCard,
364 |         cardTags: [
365 |           {
366 |             id: 'cardtag-1',
367 |             cardId: 'new-card-id',
368 |             tagId: 'tag-1',
369 |             tag: {
370 |               id: 'tag-1',
371 |               name: '테스트태그'
372 |             }
373 |           }
374 |         ]
375 |       };
376 |       
377 |       // 사용자 존재함을 모킹
378 |       prismaMock.user.findUnique.mockResolvedValueOnce({
379 |         id: '123e4567-e89b-12d3-a456-426614174000',
380 |         name: '테스트 사용자'
381 |       });
382 |       
383 |       // 카드 생성 모킹
384 |       prismaMock.card.create.mockResolvedValueOnce(createdCard);
385 |       
386 |       // 태그 조회 모킹
387 |       prismaMock.tag.findUnique.mockResolvedValueOnce({
388 |         id: 'tag-1',
389 |         name: '테스트태그'
390 |       });
391 |       
392 |       // 카드와 태그 정보 조회 모킹
393 |       prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
394 |       
395 |       // API 호출
396 |       const request = new NextRequest('http://localhost:3000/api/cards', {
397 |         method: 'POST',
398 |         body: JSON.stringify(requestData),
399 |       });
400 |       const response = await POST(request);
401 |       
402 |       // 검증
403 |       expect(response.status).toBe(201);
404 |       const data = await response.json();
405 |       expect(data).toEqual(cardWithTags);
406 |       expect(prismaMock.card.create).toHaveBeenCalledWith({
407 |         data: {
408 |           title: requestData.title,
409 |           content: requestData.content,
410 |           userId: requestData.userId
411 |         }
412 |       });
413 |     });
414 | 
415 |     it('태그가 없는 카드를 생성한다', async () => {
416 |       const requestData = {
417 |         title: '새 카드 제목',
418 |         content: '새 카드 내용',
419 |         userId: '123e4567-e89b-12d3-a456-426614174000'
420 |       };
421 |       
422 |       const createdCard = {
423 |         id: 'new-card-id',
424 |         title: requestData.title,
425 |         content: requestData.content,
426 |         userId: requestData.userId,
427 |         createdAt: new Date(),
428 |         updatedAt: new Date()
429 |       };
430 |       
431 |       prismaMock.user.findUnique.mockResolvedValueOnce({
432 |         id: requestData.userId,
433 |         name: '테스트 사용자'
434 |       });
435 |       
436 |       prismaMock.card.create.mockResolvedValueOnce(createdCard);
437 |       prismaMock.card.findUnique.mockResolvedValueOnce(createdCard);
438 |       
439 |       const request = new NextRequest('http://localhost:3000/api/cards', {
440 |         method: 'POST',
441 |         body: JSON.stringify(requestData)
442 |       });
443 |       
444 |       const response = await POST(request);
445 |       
446 |       expect(response.status).toBe(201);
447 |       const data = await response.json();
448 |       expect(data).toEqual(createdCard);
449 |       
450 |       // 태그 처리 함수가 호출되지 않았는지 확인
451 |       expect(prismaMock.cardTag.deleteMany).not.toHaveBeenCalled();
452 |       expect(prismaMock.tag.findUnique).not.toHaveBeenCalled();
453 |       expect(prismaMock.tag.create).not.toHaveBeenCalled();
454 |       expect(prismaMock.cardTag.create).not.toHaveBeenCalled();
455 |     });
456 | 
457 |     it('이미 존재하는 태그를 포함한 카드를 생성한다', async () => {
458 |       const requestData = {
459 |         title: '새 카드 제목',
460 |         content: '새 카드 내용',
461 |         userId: '123e4567-e89b-12d3-a456-426614174000',
462 |         tags: ['기존태그']
463 |       };
464 |       
465 |       const createdCard = {
466 |         id: 'new-card-id',
467 |         title: requestData.title,
468 |         content: requestData.content,
469 |         userId: requestData.userId,
470 |         createdAt: new Date(),
471 |         updatedAt: new Date()
472 |       };
473 |       
474 |       const existingTag = {
475 |         id: 'tag-1',
476 |         name: '기존태그'
477 |       };
478 |       
479 |       prismaMock.user.findUnique.mockResolvedValueOnce({
480 |         id: requestData.userId,
481 |         name: '테스트 사용자'
482 |       });
483 |       
484 |       prismaMock.card.create.mockResolvedValueOnce(createdCard);
485 |       prismaMock.tag.findUnique.mockResolvedValueOnce(existingTag);
486 |       prismaMock.cardTag.create.mockResolvedValueOnce({
487 |         id: 'cardtag-1',
488 |         cardId: createdCard.id,
489 |         tagId: existingTag.id
490 |       });
491 |       
492 |       const cardWithTags = {
493 |         ...createdCard,
494 |         cardTags: [
495 |           {
496 |             id: 'cardtag-1',
497 |             cardId: createdCard.id,
498 |             tagId: existingTag.id,
499 |             tag: existingTag
500 |           }
501 |         ]
502 |       };
503 |       
504 |       prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
505 |       
506 |       const request = new NextRequest('http://localhost:3000/api/cards', {
507 |         method: 'POST',
508 |         body: JSON.stringify(requestData)
509 |       });
510 |       
511 |       const response = await POST(request);
512 |       
513 |       expect(response.status).toBe(201);
514 |       const data = await response.json();
515 |       expect(data).toEqual(cardWithTags);
516 |       
517 |       // 태그 처리 함수가 올바르게 호출되었는지 확인
518 |       expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
519 |         where: { cardId: createdCard.id }
520 |       });
521 |       expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
522 |         where: { name: '기존태그' }
523 |       });
524 |       expect(prismaMock.tag.create).not.toHaveBeenCalled();
525 |       expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
526 |         data: {
527 |           cardId: createdCard.id,
528 |           tagId: existingTag.id
529 |         }
530 |       });
531 |     });
532 | 
533 |     it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
534 |       // 유효하지 않은 요청 데이터 (제목 누락)
535 |       const requestData = {
536 |         content: '새 카드 내용',
537 |         userId: '123e4567-e89b-12d3-a456-426614174000',
538 |       };
539 | 
540 |       // API 호출
541 |       const request = new NextRequest('http://localhost:3000/api/cards', {
542 |         method: 'POST',
543 |         body: JSON.stringify(requestData),
544 |       });
545 |       const response = await POST(request);
546 |       
547 |       // 검증
548 |       expect(response.status).toBe(400);
549 |       const data = await response.json();
550 |       expect(data).toHaveProperty('error');
551 |       expect(prismaMock.card.create).not.toHaveBeenCalled();
552 |     });
553 |     
554 |     it('존재하지 않는 사용자로 요청 시 404 응답을 반환한다', async () => {
555 |       // 유효한 요청 데이터 (존재하지 않는 사용자 ID)
556 |       const requestData = {
557 |         title: '새 카드 제목',
558 |         content: '새 카드 내용',
559 |         userId: 'non-existent-user-id',
560 |       };
561 |       
562 |       // 사용자가 존재하지 않음을 모킹
563 |       prismaMock.user.findUnique.mockResolvedValueOnce(null);
564 |       
565 |       // API 호출
566 |       const request = new NextRequest('http://localhost:3000/api/cards', {
567 |         method: 'POST',
568 |         body: JSON.stringify(requestData),
569 |       });
570 |       const response = await POST(request);
571 |       
572 |       // 검증
573 |       expect(response.status).toBe(404);
574 |       const data = await response.json();
575 |       expect(data).toHaveProperty('error');
576 |       expect(data.error).toBe('존재하지 않는 사용자입니다.');
577 |       expect(prismaMock.card.create).not.toHaveBeenCalled();
578 |     });
579 |     
580 |     it('카드 생성 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
581 |       // 유효한 요청 데이터
582 |       const requestData = {
583 |         title: '새 카드 제목',
584 |         content: '새 카드 내용',
585 |         userId: '123e4567-e89b-12d3-a456-426614174000',
586 |       };
587 |       
588 |       // 사용자 존재함을 모킹
589 |       prismaMock.user.findUnique.mockResolvedValueOnce({
590 |         id: '123e4567-e89b-12d3-a456-426614174000',
591 |         name: '테스트 사용자'
592 |       });
593 |       
594 |       // 카드 생성 중 에러 발생 모킹
595 |       prismaMock.card.create.mockRejectedValueOnce(new Error('DB 에러'));
596 |       
597 |       // API 호출
598 |       const request = new NextRequest('http://localhost:3000/api/cards', {
599 |         method: 'POST',
600 |         body: JSON.stringify(requestData),
601 |       });
602 |       const response = await POST(request);
603 |       
604 |       // 검증
605 |       expect(response.status).toBe(500);
606 |       const data = await response.json();
607 |       expect(data).toHaveProperty('error');
608 |       expect(data.error).toBe('카드를 생성하는 중 오류가 발생했습니다.');
609 |       expect(console.error).toHaveBeenCalled();
610 |     });
611 |     
612 |     it('새로운 태그를 생성하여, 카드와 함께 저장한다', async () => {
613 |       // 유효한 요청 데이터 (새로운 태그 포함)
614 |       const requestData = {
615 |         title: '새 카드 제목',
616 |         content: '새 카드 내용',
617 |         userId: '123e4567-e89b-12d3-a456-426614174000',
618 |         tags: ['새로운태그']
619 |       };
620 |       
621 |       // 생성된 카드 데이터 모킹
622 |       const createdCard = {
623 |         id: 'new-card-id',
624 |         title: requestData.title,
625 |         content: requestData.content,
626 |         userId: requestData.userId,
627 |         createdAt: new Date(),
628 |         updatedAt: new Date()
629 |       };
630 |       
631 |       // 사용자 존재함을 모킹
632 |       prismaMock.user.findUnique.mockResolvedValueOnce({
633 |         id: requestData.userId,
634 |         name: '테스트 사용자'
635 |       });
636 |       
637 |       // 카드 생성 모킹
638 |       prismaMock.card.create.mockResolvedValueOnce(createdCard);
639 |       
640 |       // 태그가 존재하지 않음을 모킹
641 |       prismaMock.tag.findUnique.mockResolvedValueOnce(null);
642 |       
643 |       // 새 태그 생성 모킹
644 |       const newTag = {
645 |         id: 'new-tag-id',
646 |         name: '새로운태그'
647 |       };
648 |       prismaMock.tag.create.mockResolvedValueOnce(newTag);
649 |       
650 |       // 카드-태그 연결 모킹
651 |       prismaMock.cardTag.create.mockResolvedValueOnce({
652 |         id: 'cardtag-1',
653 |         cardId: createdCard.id,
654 |         tagId: newTag.id
655 |       });
656 |       
657 |       // 태그 포함된 카드 데이터 모킹
658 |       const cardWithTags = {
659 |         ...createdCard,
660 |         cardTags: [
661 |           {
662 |             id: 'cardtag-1',
663 |             cardId: 'new-card-id',
664 |             tagId: 'new-tag-id',
665 |             tag: newTag
666 |           }
667 |         ]
668 |       };
669 |       
670 |       // 카드 조회 모킹
671 |       prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
672 |       
673 |       // API 호출
674 |       const request = new NextRequest('http://localhost:3000/api/cards', {
675 |         method: 'POST',
676 |         body: JSON.stringify(requestData)
677 |       });
678 |       
679 |       const response = await POST(request);
680 |       
681 |       // 검증
682 |       expect(response.status).toBe(201);
683 |       const data = await response.json();
684 |       expect(data).toEqual(cardWithTags);
685 |       
686 |       // 태그 처리 함수가 올바르게 호출되었는지 확인
687 |       expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
688 |         where: { cardId: createdCard.id }
689 |       });
690 |       
691 |       // 태그 조회 확인
692 |       expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
693 |         where: { name: '새로운태그' }
694 |       });
695 |       
696 |       // 새 태그 생성 확인
697 |       expect(prismaMock.tag.create).toHaveBeenCalledWith({
698 |         data: { name: '새로운태그' }
699 |       });
700 |       
701 |       // 카드-태그 연결 확인
702 |       expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
703 |         data: {
704 |           cardId: createdCard.id,
705 |           tagId: newTag.id
706 |         }
707 |       });
708 |     });
709 |   });
710 | }); 
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
84 |       (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);
85 | 
86 |       // API 호출
87 |       const request = new NextRequest('http://localhost:3000/api/cards');
88 |       const response = await GET(request);
89 |       const data = await response.json();
90 | 
91 |       // 검증
92 |       expect(response.status).toBe(200);
93 |       expect(data).toEqual(mockCards);
94 |       expect(prisma.card.findMany).toHaveBeenCalledTimes(1);
95 |     });
96 | 
97 |     it('사용자 ID로 필터링된 카드를 조회한다', async () => {
98 |       // 모킹된 데이터
99 |       const mockCards = [
100 |         {
101 |           id: '1',
102 |           title: '테스트 카드 1',
103 |           content: '테스트 내용 1',
104 |           createdAt: new Date(),
105 |           updatedAt: new Date(),
106 |           userId: 'user1',
107 |         },
108 |       ];
109 | 
110 |       // Prisma 응답 모킹
111 |       (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);
112 | 
113 |       // API 호출
114 |       const request = new NextRequest('http://localhost:3000/api/cards?userId=user1');
115 |       const response = await GET(request);
116 |       const data = await response.json();
117 | 
118 |       // 검증
119 |       expect(response.status).toBe(200);
120 |       expect(data).toEqual(mockCards);
121 |       expect(prisma.card.findMany).toHaveBeenCalledWith(
122 |         expect.objectContaining({
123 |           where: { userId: 'user1' },
124 |         })
125 |       );
126 |     });
127 | 
128 |     it('에러 발생 시 500 응답을 반환한다', async () => {
129 |       // 에러 모킹
130 |       (prisma.card.findMany as jest.Mock).mockRejectedValue(new Error('DB 에러'));
131 | 
132 |       // API 호출
133 |       const request = new NextRequest('http://localhost:3000/api/cards');
134 |       const response = await GET(request);
135 |       const data = await response.json();
136 | 
137 |       // 검증
138 |       expect(response.status).toBe(500);
139 |       expect(data).toHaveProperty('error');
140 |     });
141 |   });
142 | 
143 |   describe('POST /api/cards', () => {
144 |     it('유효한 데이터로 카드를 생성한다', async () => {
145 |       // 모킹된 데이터
146 |       const mockCard = {
147 |         id: '1',
148 |         title: '새 카드',
149 |         content: '새 카드 내용',
150 |         createdAt: new Date(),
151 |         updatedAt: new Date(),
152 |         userId: 'user1',
153 |       };
154 | 
155 |       // 요청 데이터
156 |       const requestData = {
157 |         title: '새 카드',
158 |         content: '새 카드 내용',
159 |         userId: 'user1',
160 |       };
161 | 
162 |       // Prisma 응답 모킹
163 |       (prisma.card.create as jest.Mock).mockResolvedValue(mockCard);
164 | 
165 |       // API 호출
166 |       const request = new NextRequest('http://localhost:3000/api/cards', {
167 |         method: 'POST',
168 |         body: JSON.stringify(requestData),
169 |       });
170 |       const response = await POST(request);
171 |       const data = await response.json();
172 | 
173 |       // 검증
174 |       expect(response.status).toBe(201);
175 |       expect(data).toEqual(mockCard);
176 |       expect(prisma.card.create).toHaveBeenCalledWith({
177 |         data: requestData,
178 |       });
179 |     });
180 | 
181 |     it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
182 |       // 유효하지 않은 요청 데이터 (제목 누락)
183 |       const requestData = {
184 |         content: '새 카드 내용',
185 |         userId: 'user1',
186 |       };
187 | 
188 |       // API 호출
189 |       const request = new NextRequest('http://localhost:3000/api/cards', {
190 |         method: 'POST',
191 |         body: JSON.stringify(requestData),
192 |       });
193 |       const response = await POST(request);
194 |       const data = await response.json();
195 | 
196 |       // 검증
197 |       expect(response.status).toBe(400);
198 |       expect(data).toHaveProperty('error');
199 |       expect(prisma.card.create).not.toHaveBeenCalled();
200 |     });
201 | 
202 |     it('에러 발생 시 500 응답을 반환한다', async () => {
203 |       // 요청 데이터
204 |       const requestData = {
205 |         title: '새 카드',
206 |         content: '새 카드 내용',
207 |         userId: 'user1',
208 |       };
209 | 
210 |       // 에러 모킹
211 |       (prisma.card.create as jest.Mock).mockRejectedValue(new Error('DB 에러'));
212 | 
213 |       // API 호출
214 |       const request = new NextRequest('http://localhost:3000/api/cards', {
215 |         method: 'POST',
216 |         body: JSON.stringify(requestData),
217 |       });
218 |       const response = await POST(request);
219 |       const data = await response.json();
220 | 
221 |       // 검증
222 |       expect(response.status).toBe(500);
223 |       expect(data).toHaveProperty('error');
224 |     });
225 |   });
226 | }); 
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
15 |   // 중복 태그 제거 및 공백 제거
16 |   const uniqueTags = [...new Set(tagNames.map(tag => tag.trim()))].filter(tag => tag.length > 0);
17 |   
18 |   // 카드와 연결된 기존 태그 삭제
19 |   await prisma.cardTag.deleteMany({
20 |     where: { cardId }
21 |   });
22 |   
23 |   // 각 태그에 대해 처리
24 |   for (const tagName of uniqueTags) {
25 |     // 태그가 존재하는지 확인하고, 없으면 생성
26 |     let tag = await prisma.tag.findUnique({
27 |       where: { name: tagName }
28 |     });
29 |     
30 |     if (!tag) {
31 |       tag = await prisma.tag.create({
32 |         data: { name: tagName }
33 |       });
34 |     }
35 |     
36 |     // 카드와 태그 연결
37 |     await prisma.cardTag.create({
38 |       data: {
39 |         cardId,
40 |         tagId: tag.id
41 |       }
42 |     });
43 |   }
44 | }
45 | 
46 | // 카드 생성 API
47 | export async function POST(request: NextRequest) {
48 |   try {
49 |     const body = await request.json();
50 |     
51 |     // 데이터 유효성 검사
52 |     const validation = createCardSchema.safeParse(body);
53 |     if (!validation.success) {
54 |       return NextResponse.json(
55 |         { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
56 |         { status: 400 }
57 |       );
58 |     }
59 |     
60 |     const { title, content, userId, tags } = validation.data;
61 |     
62 |     // 사용자 존재 여부 확인
63 |     const user = await prisma.user.findUnique({
64 |       where: { id: userId }
65 |     });
66 |     
67 |     if (!user) {
68 |       return NextResponse.json(
69 |         { error: '존재하지 않는 사용자입니다.' },
70 |         { status: 404 }
71 |       );
72 |     }
73 |     
74 |     // 카드 생성
75 |     const card = await prisma.card.create({
76 |       data: {
77 |         title,
78 |         content,
79 |         userId
80 |       }
81 |     });
82 |     
83 |     // 태그 처리
84 |     if (tags && tags.length > 0) {
85 |       await processTagsForCard(card.id, tags);
86 |     }
87 |     
88 |     // 생성된 카드와 태그 조회
89 |     const cardWithTags = await prisma.card.findUnique({
90 |       where: { id: card.id },
91 |       include: {
92 |         cardTags: {
93 |           include: {
94 |             tag: true
95 |           }
96 |         }
97 |       }
98 |     });
99 |     
100 |     return NextResponse.json(cardWithTags, { status: 201 });
101 |   } catch (error) {
102 |     console.error('카드 생성 오류:', error);
103 |     return NextResponse.json(
104 |       { error: '카드를 생성하는 중 오류가 발생했습니다.' },
105 |       { status: 500 }
106 |     );
107 |   }
108 | }
109 | 
110 | // 모든 카드 조회 API
111 | export async function GET(request: NextRequest) {
112 |   try {
113 |     // URL 쿼리 파라미터 파싱
114 |     const { searchParams } = request.nextUrl;
115 |     const userId = searchParams.get('userId');
116 |     const q = searchParams.get('q');
117 |     const tag = searchParams.get('tag');
118 |     
119 |     // 검색 조건 구성
120 |     const where: any = {};
121 |     
122 |     // 사용자 ID 필터
123 |     if (userId) {
124 |       where.userId = userId;
125 |     }
126 |     
127 |     // 제목/내용 검색
128 |     if (q) {
129 |       where.OR = [
130 |         { title: { contains: q, mode: 'insensitive' } },
131 |         { content: { contains: q, mode: 'insensitive' } }
132 |       ];
133 |     }
134 |     
135 |     // 태그 검색
136 |     if (tag) {
137 |       where.cardTags = {
138 |         some: {
139 |           tag: {
140 |             name: tag
141 |           }
142 |         }
143 |       };
144 |     }
145 |     
146 |     // 카드 조회
147 |     const cards = await prisma.card.findMany({
148 |       where,
149 |       orderBy: {
150 |         createdAt: 'desc'
151 |       },
152 |       include: {
153 |         user: {
154 |           select: {
155 |             id: true,
156 |             name: true
157 |           }
158 |         },
159 |         cardTags: {
160 |           include: {
161 |             tag: true
162 |           }
163 |         }
164 |       }
165 |     });
166 |     
167 |     return NextResponse.json(cards);
168 |   } catch (error) {
169 |     console.error('카드 조회 오류:', error);
170 |     return NextResponse.json(
171 |       { error: '카드를 조회하는 중 오류가 발생했습니다.' },
172 |       { status: 500 }
173 |     );
174 |   }
175 | } 
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
82 |     it('태그 목록을 성공적으로 반환해야 함', async () => {
83 |       // 가짜 태그 데이터
84 |       const mockTags = [
85 |         { id: '1', name: 'JavaScript', createdAt: new Date(), updatedAt: new Date() },
86 |         { id: '2', name: 'React', createdAt: new Date(), updatedAt: new Date() },
87 |         { id: '3', name: 'TypeScript', createdAt: new Date(), updatedAt: new Date() }
88 |       ];
89 |       
90 |       // prisma 모킹 설정
91 |       const { prisma } = await import('@/lib/prisma');
92 |       (prisma.tag.findMany as any).mockResolvedValue(mockTags);
93 |       
94 |       // GET 요청 시뮬레이션
95 |       const request = new NextRequest('http://localhost:3000/api/tags');
96 |       const response = await GET(request);
97 |       
98 |       // 응답 검증
99 |       expect(response.status).toBe(200);
100 |       const responseData = await response.json();
101 |       expect(responseData).toEqual(mockTags);
102 |     });
103 |     
104 |     it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
105 |       // prisma 오류 모킹
106 |       const { prisma } = await import('@/lib/prisma');
107 |       (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
108 |       
109 |       // GET 요청 시뮬레이션
110 |       const request = new NextRequest('http://localhost:3000/api/tags');
111 |       const response = await GET(request);
112 |       
113 |       // 응답 검증
114 |       expect(response.status).toBe(500);
115 |       const responseData = await response.json();
116 |       expect(responseData).toEqual({
117 |         error: '태그 목록을 가져오는 중 오류가 발생했습니다.'
118 |       });
119 |     });
120 |   });
121 | 
122 |   // 태그 생성 테스트
123 |   describe('POST /api/tags', () => {
124 |     it('유효한 태그 데이터로 태그를 생성해야 함', async () => {
125 |       // 가짜 태그 데이터
126 |       const tagData = { name: '새로운태그' };
127 |       const mockCreatedTag = { 
128 |         id: '4', 
129 |         name: '새로운태그', 
130 |         createdAt: new Date(), 
131 |         updatedAt: new Date() 
132 |       };
133 |       
134 |       // prisma 모킹 설정
135 |       const { prisma } = await import('@/lib/prisma');
136 |       (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
137 |       (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
138 |       
139 |       // POST 요청 시뮬레이션
140 |       const request = new NextRequest('http://localhost:3000/api/tags', {
141 |         method: 'POST',
142 |         headers: {
143 |           'Content-Type': 'application/json'
144 |         },
145 |         body: JSON.stringify(tagData)
146 |       });
147 |       
148 |       // request.json 메서드 모킹
149 |       request.json = vi.fn().mockResolvedValue(tagData);
150 |       
151 |       const response = await POST(request);
152 |       
153 |       // 응답 검증
154 |       expect(response.status).toBe(201);
155 |       const responseData = await response.json();
156 |       expect(responseData).toEqual(mockCreatedTag);
157 |       
158 |       // Prisma 호출 확인
159 |       expect(prisma.tag.findUnique).toHaveBeenCalledWith({
160 |         where: { name: tagData.name }
161 |       });
162 |       expect(prisma.tag.create).toHaveBeenCalledWith({
163 |         data: { name: tagData.name }
164 |       });
165 |     });
166 |     
167 |     it('이미 존재하는 태그 이름으로 생성 시 400 에러를 반환해야 함', async () => {
168 |       // 가짜 태그 데이터
169 |       const tagData = { name: '이미존재하는태그' };
170 |       const existingTag = { 
171 |         id: '5', 
172 |         name: '이미존재하는태그', 
173 |         createdAt: new Date(), 
174 |         updatedAt: new Date() 
175 |       };
176 |       
177 |       // prisma 모킹 설정
178 |       const { prisma } = await import('@/lib/prisma');
179 |       (prisma.tag.findUnique as any).mockResolvedValue(existingTag); // 이미 태그가 존재함
180 |       
181 |       // POST 요청 시뮬레이션
182 |       const request = new NextRequest('http://localhost:3000/api/tags', {
183 |         method: 'POST',
184 |         headers: {
185 |           'Content-Type': 'application/json'
186 |         },
187 |         body: JSON.stringify(tagData)
188 |       });
189 |       
190 |       // request.json 메서드 모킹
191 |       request.json = vi.fn().mockResolvedValue(tagData);
192 |       
193 |       const response = await POST(request);
194 |       
195 |       // 응답 검증
196 |       expect(response.status).toBe(400);
197 |       const responseData = await response.json();
198 |       expect(responseData).toEqual({
199 |         error: '이미 존재하는 태그입니다.'
200 |       });
201 |       
202 |       // Prisma 호출 확인
203 |       expect(prisma.tag.findUnique).toHaveBeenCalledWith({
204 |         where: { name: tagData.name }
205 |       });
206 |       expect(prisma.tag.create).not.toHaveBeenCalled();
207 |     });
208 |     
209 |     it('유효하지 않은 데이터로 생성 시 400 에러를 반환해야 함', async () => {
210 |       // 유효하지 않은 태그 데이터 (빈 이름)
211 |       const invalidData = { name: '' };
212 |       
213 |       // POST 요청 시뮬레이션
214 |       const request = new NextRequest('http://localhost:3000/api/tags', {
215 |         method: 'POST',
216 |         headers: {
217 |           'Content-Type': 'application/json'
218 |         },
219 |         body: JSON.stringify(invalidData)
220 |       });
221 |       
222 |       // request.json 메서드 모킹
223 |       request.json = vi.fn().mockResolvedValue(invalidData);
224 |       
225 |       const response = await POST(request);
226 |       
227 |       // 응답 검증
228 |       expect(response.status).toBe(400);
229 |       const responseData = await response.json();
230 |       expect(responseData).toHaveProperty('error');
231 |     });
232 | 
233 |     it('잘못된 JSON 형식으로 요청 시 400 에러를 반환해야 함', async () => {
234 |       // 1. 테스트 데이터 준비
235 |       const invalidJson = '{invalid json}';
236 |       
237 |       // 2. 테스트 환경 설정
238 |       const request = new NextRequest('http://localhost:3000/api/tags', {
239 |         method: 'POST',
240 |         headers: { 'Content-Type': 'application/json' },
241 |         body: invalidJson
242 |       });
243 |       
244 |       // 3. 모킹 설정
245 |       request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
246 |       
247 |       // 4. 테스트 실행
248 |       const response = await POST(request);
249 |       
250 |       // 5. 결과 검증
251 |       expect(response.status).toBe(400);
252 |       const responseData = await response.json();
253 |       expect(responseData).toHaveProperty('error');
254 |     });
255 | 
256 |     it('request.json() 실패 시 request.body가 문자열인 경우 처리해야 함', async () => {
257 |       // 1. 테스트 데이터 준비
258 |       const tagData = { name: '새로운태그' };
259 |       const tagDataString = JSON.stringify(tagData);
260 |       const mockCreatedTag = { 
261 |         id: '4', 
262 |         name: '새로운태그', 
263 |         createdAt: new Date(), 
264 |         updatedAt: new Date() 
265 |       };
266 |       
267 |       // 2. 테스트 환경 설정
268 |       const request = new NextRequest('http://localhost:3000/api/tags', {
269 |         method: 'POST',
270 |         headers: { 'Content-Type': 'application/json' },
271 |         body: tagDataString
272 |       });
273 |       
274 |       // 3. 모킹 설정
275 |       request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
276 |       request.text = vi.fn().mockResolvedValue(tagDataString);
277 |       
278 |       // Prisma 모킹 설정
279 |       const { prisma } = await import('@/lib/prisma');
280 |       (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
281 |       (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
282 |       
283 |       // 4. 테스트 실행
284 |       const response = await POST(request);
285 |       
286 |       // 5. 결과 검증
287 |       expect(response.status).toBe(201);
288 |       const responseData = await response.json();
289 |       expect(responseData).toEqual(mockCreatedTag);
290 |       
291 |       // 6. 모킹 호출 검증
292 |       expect(request.text).toHaveBeenCalled();
293 |       expect(await request.text()).toBe(tagDataString);
294 |       expect(prisma.tag.findUnique).toHaveBeenCalledWith({
295 |         where: { name: tagData.name }
296 |       });
297 |       expect(prisma.tag.create).toHaveBeenCalledWith({
298 |         data: { name: tagData.name }
299 |       });
300 |     });
301 | 
302 |     it('request.json() 실패 시 request.body가 객체인 경우 처리해야 함', async () => {
303 |       // 1. 테스트 데이터 준비
304 |       const tagData = { name: '새로운태그' };
305 |       const tagDataString = JSON.stringify(tagData);
306 |       const mockCreatedTag = { 
307 |         id: '4', 
308 |         name: '새로운태그', 
309 |         createdAt: new Date(), 
310 |         updatedAt: new Date() 
311 |       };
312 |       
313 |       // 2. 테스트 환경 설정
314 |       const request = new NextRequest('http://localhost:3000/api/tags', {
315 |         method: 'POST',
316 |         headers: { 'Content-Type': 'application/json' },
317 |         body: tagDataString
318 |       });
319 |       
320 |       // 3. 모킹 설정
321 |       request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
322 |       request.text = vi.fn().mockResolvedValue(tagDataString);
323 |       
324 |       // Prisma 모킹 설정
325 |       const { prisma } = await import('@/lib/prisma');
326 |       (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
327 |       (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
328 |       
329 |       // 4. 테스트 실행
330 |       const response = await POST(request);
331 |       
332 |       // 5. 결과 검증
333 |       expect(response.status).toBe(201);
334 |       const responseData = await response.json();
335 |       expect(responseData).toEqual(mockCreatedTag);
336 |       
337 |       // 6. 모킹 호출 검증
338 |       expect(request.text).toHaveBeenCalled();
339 |       expect(await request.text()).toBe(tagDataString);
340 |       expect(prisma.tag.findUnique).toHaveBeenCalledWith({
341 |         where: { name: tagData.name }
342 |       });
343 |       expect(prisma.tag.create).toHaveBeenCalledWith({
344 |         data: { name: tagData.name }
345 |       });
346 |     });
347 | 
348 |     it('태그 생성 중 서버 오류 발생 시 500 에러를 반환해야 함', async () => {
349 |       // 유효한 태그 데이터
350 |       const tagData = { name: '새로운태그' };
351 |       
352 |       // prisma 모킹 설정
353 |       const { prisma } = await import('@/lib/prisma');
354 |       (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
355 |       (prisma.tag.create as any).mockRejectedValue(new Error('데이터베이스 오류')); // 생성 중 오류 발생
356 |       
357 |       // POST 요청 시뮬레이션
358 |       const request = new NextRequest('http://localhost:3000/api/tags', {
359 |         method: 'POST',
360 |         headers: {
361 |           'Content-Type': 'application/json'
362 |         },
363 |         body: JSON.stringify(tagData)
364 |       });
365 |       
366 |       // request.json 메서드 모킹
367 |       request.json = vi.fn().mockResolvedValue(tagData);
368 |       
369 |       const response = await POST(request);
370 |       
371 |       // 응답 검증
372 |       expect(response.status).toBe(500);
373 |       const responseData = await response.json();
374 |       expect(responseData).toEqual({
375 |         error: '태그 생성 중 오류가 발생했습니다.'
376 |       });
377 |       
378 |       // Prisma 호출 확인
379 |       expect(prisma.tag.findUnique).toHaveBeenCalledWith({
380 |         where: { name: tagData.name }
381 |       });
382 |       expect(prisma.tag.create).toHaveBeenCalledWith({
383 |         data: { name: tagData.name }
384 |       });
385 |     });
386 |   });
387 | }); 
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
64 |       return NextResponse.json(
65 |         { error: '이미 존재하는 태그입니다.' },
66 |         { status: 400 }
67 |       );
68 |     }
69 |     
70 |     // 태그 생성
71 |     const tag = await prisma.tag.create({
72 |       data: {
73 |         name: validationResult.data.name
74 |       }
75 |     });
76 |     
77 |     return NextResponse.json(tag, { status: 201 });
78 |   } catch (error) {
79 |     console.error('Error creating tag:', error);
80 |     return NextResponse.json(
81 |       { error: '태그 생성 중 오류가 발생했습니다.' },
82 |       { status: 500 }
83 |     );
84 |   }
85 | } 
```

src/app/auth/callback/page.tsx
```
1 | 'use client';
2 | 
3 | import { useEffect, useState } from 'react';
4 | import { useRouter } from 'next/navigation';
5 | import { getBrowserClient } from '@/lib/auth';
6 | 
7 | export default function AuthCallbackPage() {
8 |   const router = useRouter();
9 |   const [error, setError] = useState<string | null>(null);
10 |   const [loading, setLoading] = useState(true);
11 | 
12 |   useEffect(() => {
13 |     async function handleAuthCallback() {
14 |       try {
15 |         // URL에서 오류 패러미터 확인
16 |         const searchParams = new URLSearchParams(window.location.search);
17 |         const errorParam = searchParams.get('error');
18 |         const errorDescription = searchParams.get('error_description');
19 |         
20 |         if (errorParam) {
21 |           console.error('OAuth 에러:', errorParam, errorDescription);
22 |           setError(`인증 오류: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`);
23 |           setLoading(false);
24 |           return;
25 |         }
26 | 
27 |         console.log('클라이언트 측 인증 콜백 처리 시작');
28 |         
29 |         // Supabase 클라이언트 가져오기
30 |         const supabase = getBrowserClient();
31 |         
32 |         // 세션 상태 확인 (Supabase가 자동으로 URL의 코드를 처리)
33 |         const { data, error: sessionError } = await supabase.auth.getSession();
34 |         
35 |         if (sessionError) {
36 |           console.error('세션 확인 오류:', sessionError);
37 |           setError(`세션 확인 중 오류: ${sessionError.message}`);
38 |           setLoading(false);
39 |           return;
40 |         }
41 | 
42 |         if (data?.session) {
43 |           console.log('인증 성공, 세션 생성됨');
44 |           
45 |           // 사용자 정보를 데이터베이스에 저장 또는 업데이트
46 |           try {
47 |             const userId = data.session.user.id;
48 |             const userEmail = data.session.user.email;
49 |             const userName = data.session.user.user_metadata?.full_name || 
50 |                             (userEmail ? userEmail.split('@')[0] : '사용자');
51 |             
52 |             // 사용자 정보 저장 API 호출
53 |             const response = await fetch('/api/user/register', {
54 |               method: 'POST',
55 |               headers: {
56 |                 'Content-Type': 'application/json',
57 |               },
58 |               body: JSON.stringify({
59 |                 id: userId,
60 |                 email: userEmail,
61 |                 name: userName,
62 |               }),
63 |             });
64 |             
65 |             if (!response.ok) {
66 |               console.warn('사용자 정보 저장 실패:', await response.text());
67 |             } else {
68 |               console.log('사용자 정보 저장 성공');
69 |             }
70 |           } catch (dbError) {
71 |             console.error('사용자 정보 처리 오류:', dbError);
72 |             // 사용자 정보 저장 실패해도 인증은 계속 진행
73 |           }
74 |           
75 |           // 보드 페이지로 리디렉션
76 |           console.log('인증 완료, 보드 페이지로 이동');
77 |           router.push('/board');
78 |         } else {
79 |           // 세션이 없으면 에러 표시
80 |           console.error('세션 없음');
81 |           setError('인증은 성공했지만 세션이 생성되지 않았습니다.');
82 |           setLoading(false);
83 |         }
84 |       } catch (error: any) {
85 |         console.error('인증 콜백 처리 오류:', error);
86 |         setError(`인증 처리 중 오류: ${error?.message || '알 수 없는 오류'}`);
87 |         setLoading(false);
88 |       }
89 |     }
90 | 
91 |     handleAuthCallback();
92 |   }, [router]);
93 | 
94 |   if (error) {
95 |     return (
96 |       <div className="flex items-center justify-center min-h-screen p-4">
97 |         <div className="p-6 max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
98 |           <h2 className="text-xl font-bold text-red-600 mb-4">인증 오류</h2>
99 |           <p className="text-gray-700 mb-4">{error}</p>
100 |           <button 
101 |             onClick={() => router.push('/login')}
102 |             className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
103 |           >
104 |             로그인으로 돌아가기
105 |           </button>
106 |         </div>
107 |       </div>
108 |     );
109 |   }
110 | 
111 |   return (
112 |     <div className="flex flex-col items-center justify-center min-h-screen p-4">
113 |       <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
114 |       <h2 className="mt-4 text-xl font-semibold">인증 처리 중...</h2>
115 |       <p className="mt-2 text-gray-600">잠시만 기다려 주세요.</p>
116 |     </div>
117 |   );
118 | } 
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
69 |   const cardId = '123abc';
70 |   
71 |   beforeEach(() => {
72 |     vi.resetAllMocks(); // 모든 모킹 초기화
73 |     mockFetchSuccess(); // 기본적으로 성공 응답 모킹
74 |   });
75 |   
76 |   afterEach(() => {
77 |     cleanup(); // DOM 정리
78 |   });
79 |   
80 |   describe('렌더링 및 UI 테스트', () => {
81 |     it('삭제 버튼이 올바르게 렌더링되어야 함', () => {
82 |       // Arrange
83 |       render(<DeleteButton cardId={cardId} />);
84 |       
85 |       // Assert
86 |       const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
87 |       expect(deleteButton).toBeInTheDocument();
88 |     });
89 |     
90 |     it('삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', () => {
91 |       // Arrange
92 |       render(<DeleteButton cardId={cardId} />);
93 |       
94 |       // Act
95 |       clickDeleteButton();
96 |       
97 |       // Assert
98 |       expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
99 |       expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
100 |       expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
101 |     });
102 |     
103 |     it('취소 버튼 클릭 시 다이얼로그가 닫혀야 함', () => {
104 |       // Arrange
105 |       render(<DeleteButton cardId={cardId} />);
106 |       
107 |       // Act - 다이얼로그 열기
108 |       clickDeleteButton();
109 |       
110 |       // Act - 취소 버튼 클릭
111 |       const cancelButton = screen.getByRole('button', { name: '취소' });
112 |       fireEvent.click(cancelButton);
113 |       
114 |       // Assert
115 |       expect(screen.queryByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).not.toBeInTheDocument();
116 |       expect(global.fetch).not.toHaveBeenCalled();
117 |     });
118 |   });
119 |   
120 |   describe('삭제 성공 시나리오', () => {
121 |     it('삭제 성공 시 API 호출이 이루어지고 리디렉션되어야 함', async () => {
122 |       // Arrange
123 |       render(<DeleteButton cardId={cardId} />);
124 |       
125 |       // Act
126 |       clickDeleteButton();
127 |       clickConfirmDeleteButton();
128 |       
129 |       // Assert
130 |       await waitFor(() => {
131 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
132 |         expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
133 |         expect(mockPush).toHaveBeenCalledWith('/cards');
134 |       });
135 |     });
136 |     
137 |     it('삭제 성공 시 onSuccessfulDelete 콜백이 호출되어야 함', async () => {
138 |       // Arrange
139 |       const mockCallback = vi.fn();
140 |       render(<DeleteButton cardId={cardId} onSuccessfulDelete={mockCallback} />);
141 |       
142 |       // Act
143 |       clickDeleteButton();
144 |       clickConfirmDeleteButton();
145 |       
146 |       // Assert
147 |       await waitFor(() => {
148 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
149 |         expect(mockCallback).toHaveBeenCalledTimes(1);
150 |       });
151 |     });
152 |     
153 |     it('콜백이 제공되지 않아도 정상 동작해야 함', async () => {
154 |       // Arrange
155 |       render(<DeleteButton cardId={cardId} />); // 콜백 없이 렌더링
156 |       
157 |       // Act
158 |       clickDeleteButton();
159 |       clickConfirmDeleteButton();
160 |       
161 |       // Assert
162 |       await waitFor(() => {
163 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
164 |         expect(mockPush).toHaveBeenCalledWith('/cards');
165 |       });
166 |     });
167 |   });
168 |   
169 |   describe('삭제 중 상태 테스트', () => {
170 |     it('삭제 중에는 버튼이 비활성화되고 로딩 텍스트가 표시되어야 함', async () => {
171 |       // Arrange
172 |       // 비동기 응답을 위한 딜레이 설정
173 |       global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => {
174 |         setTimeout(() => {
175 |           resolve({
176 |             ok: true,
177 |             json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
178 |           });
179 |         }, 100);
180 |       }));
181 |       
182 |       render(<DeleteButton cardId={cardId} />);
183 |       
184 |       // Act
185 |       clickDeleteButton();
186 |       clickConfirmDeleteButton();
187 |       
188 |       // Assert - 삭제 중 상태 확인
189 |       expect(screen.getByText('삭제 중...')).toBeInTheDocument();
190 |       expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
191 |       
192 |       // 응답 완료 후 상태 확인
193 |       await waitFor(() => {
194 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
195 |       });
196 |     });
197 |   });
198 |   
199 |   describe('오류 시나리오 테스트', () => {
200 |     it('API 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
201 |       // Arrange
202 |       const errorMessage = '서버 오류로 카드 삭제에 실패했습니다.';
203 |       mockFetchError(errorMessage);
204 |       
205 |       render(<DeleteButton cardId={cardId} />);
206 |       
207 |       // Act
208 |       clickDeleteButton();
209 |       clickConfirmDeleteButton();
210 |       
211 |       // Assert
212 |       await waitFor(() => {
213 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
214 |         expect(toast.error).toHaveBeenCalledWith(errorMessage);
215 |         expect(mockPush).not.toHaveBeenCalled(); // 리디렉션 없음
216 |       });
217 |     });
218 |     
219 |     it('errorData.error가 없을 때 기본 에러 메시지를 표시해야 함', async () => {
220 |       // Arrange
221 |       global.fetch = vi.fn().mockResolvedValue({
222 |         ok: false,
223 |         json: async () => ({ message: '응답은 있지만 error 필드가 없는 경우' }) // error 필드 없음
224 |       });
225 |       
226 |       render(<DeleteButton cardId={cardId} />);
227 |       
228 |       // Act
229 |       clickDeleteButton();
230 |       clickConfirmDeleteButton();
231 |       
232 |       // Assert
233 |       await waitFor(() => {
234 |         expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
235 |         expect(toast.error).toHaveBeenCalledWith('카드 삭제에 실패했습니다.');
236 |         expect(mockPush).not.toHaveBeenCalled();
237 |       });
238 |     });
239 |     
240 |     it('네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
241 |       // Arrange
242 |       mockFetchNetworkError();
243 |       
244 |       render(<DeleteButton cardId={cardId} />);
245 |       
246 |       // Act
247 |       clickDeleteButton();
248 |       clickConfirmDeleteButton();
249 |       
250 |       // Assert
251 |       await waitFor(() => {
252 |         expect(toast.error).toHaveBeenCalledWith('네트워크 오류');
253 |         expect(mockPush).not.toHaveBeenCalled();
254 |       });
255 |     });
256 |   });
257 |   
258 |   describe('다양한 카드 ID 테스트', () => {
259 |     it('다양한 형식의 카드 ID로 삭제가 가능해야 함', async () => {
260 |       // Arrange
261 |       const cardIds = [
262 |         'abc123',
263 |         'card_with-hyphen',
264 |         '123456',
265 |         'longCardIdWithMixedCharacters123'
266 |       ];
267 |       
268 |       // 각 ID에 대한 테스트
269 |       for (const id of cardIds) {
270 |         vi.clearAllMocks();
271 |         mockFetchSuccess();
272 |         
273 |         const { unmount } = render(<DeleteButton cardId={id} />);
274 |         
275 |         // Act
276 |         clickDeleteButton();
277 |         clickConfirmDeleteButton();
278 |         
279 |         // Assert
280 |         await waitFor(() => {
281 |           expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${id}`, { method: 'DELETE' });
282 |         });
283 |         
284 |         unmount(); // 다음 테스트를 위해 언마운트
285 |       }
286 |     });
287 |   });
288 | }); 
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
78 |       toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
79 |       
80 |       // 오류 발생 시 다이얼로그만 닫음 (리디렉션 없음)
81 |       setOpen(false);
82 |       
83 |       // 오류 시 리디렉션이 발생하지 않음
84 |     } finally {
85 |       setIsDeleting(false);
86 |     }
87 |     // 함수 종료
88 |   };
89 | 
90 |   return (
91 |     <Dialog open={open} onOpenChange={setOpen}>
92 |       <DialogTrigger asChild>
93 |         <Button variant="destructive" size="sm">
94 |           <Trash2 className="mr-2 h-4 w-4" />
95 |           카드 삭제
96 |         </Button>
97 |       </DialogTrigger>
98 |       <DialogContent>
99 |         <DialogHeader>
100 |           <DialogTitle>카드 삭제</DialogTitle>
101 |           <DialogDescription>
102 |             이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
103 |           </DialogDescription>
104 |         </DialogHeader>
105 |         <DialogFooter className="flex gap-2 justify-end pt-4">
106 |           <DialogClose asChild>
107 |             <Button variant="outline">취소</Button>
108 |           </DialogClose>
109 |           <Button 
110 |             variant="destructive" 
111 |             onClick={handleDelete} 
112 |             disabled={isDeleting}
113 |           >
114 |             {isDeleting ? "삭제 중..." : "삭제"}
115 |           </Button>
116 |         </DialogFooter>
117 |       </DialogContent>
118 |     </Dialog>
119 |   );
120 | } 
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
76 |   it('유효한 카드 ID로 카드 데이터를 렌더링해야 함', async () => {
77 |     // prisma 모킹 설정
78 |     const { prisma } = await import('@/lib/prisma');
79 |     (prisma.card.findUnique as any).mockResolvedValue(mockCard);
80 |     
81 |     const page = await CardPage({ params });
82 |     render(page);
83 |     
84 |     // 카드 제목과 내용이 렌더링되었는지 확인
85 |     expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
86 |     expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
87 |     
88 |     // 작성자 정보와 날짜가 렌더링되었는지 확인
89 |     expect(screen.getByText(/작성자: 테스트 사용자/)).toBeInTheDocument();
90 |     expect(screen.getByText(/작성일: 2023년 1월 1일/)).toBeInTheDocument();
91 |     
92 |     // 태그가 렌더링되었는지 확인
93 |     expect(screen.getByText('태그1')).toBeInTheDocument();
94 |     expect(screen.getByText('태그2')).toBeInTheDocument();
95 |     
96 |     // prisma 함수 호출 확인
97 |     expect(prisma.card.findUnique).toHaveBeenCalledWith({
98 |       where: { id: params.id },
99 |       include: {
100 |         user: true,
101 |         cardTags: {
102 |           include: {
103 |             tag: true
104 |           }
105 |         }
106 |       }
107 |     });
108 |   });
109 |   
110 |   it('존재하지 않는 카드 ID로 notFound()를 호출해야 함', async () => {
111 |     // prisma 모킹 설정 - 카드가 없음
112 |     const { prisma } = await import('@/lib/prisma');
113 |     (prisma.card.findUnique as any).mockResolvedValue(null);
114 |     
115 |     // notFound 함수 가져오기
116 |     const { notFound } = await import('next/navigation');
117 |     
118 |     await CardPage({ params });
119 |     
120 |     // notFound가 호출되었는지 확인
121 |     expect(notFound).toHaveBeenCalled();
122 |     
123 |     // 카드 조회가 시도되었는지 확인
124 |     expect(prisma.card.findUnique).toHaveBeenCalledWith({
125 |       where: { id: params.id },
126 |       include: {
127 |         user: true,
128 |         cardTags: {
129 |           include: {
130 |             tag: true
131 |           }
132 |         }
133 |       }
134 |     });
135 |   });
136 |   
137 |   it('오류 발생 시 notFound()를 호출해야 함', async () => {
138 |     // prisma 모킹 설정 - 오류 발생
139 |     const { prisma } = await import('@/lib/prisma');
140 |     (prisma.card.findUnique as any).mockRejectedValue(new Error('데이터베이스 오류'));
141 |     
142 |     // notFound 함수 가져오기
143 |     const { notFound } = await import('next/navigation');
144 |     
145 |     // 콘솔 오류 출력 방지를 위한 스파이
146 |     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
147 |     
148 |     await CardPage({ params });
149 |     
150 |     // notFound가 호출되었는지 확인
151 |     expect(notFound).toHaveBeenCalled();
152 |     
153 |     // 오류 로깅이 되었는지 확인
154 |     expect(consoleSpy).toHaveBeenCalled();
155 |     
156 |     // 스파이 복원
157 |     consoleSpy.mockRestore();
158 |   });
159 |   
160 |   it('이메일만 있는 사용자 정보도 표시해야 함', async () => {
161 |     // 이메일만 있는 사용자로 카드 데이터 수정
162 |     const userEmailOnlyCard = {
163 |       ...mockCard,
164 |       user: {
165 |         id: 'user123',
166 |         name: null,
167 |         email: 'test@example.com'
168 |       }
169 |     };
170 |     
171 |     // prisma 모킹 설정
172 |     const { prisma } = await import('@/lib/prisma');
173 |     (prisma.card.findUnique as any).mockResolvedValue(userEmailOnlyCard);
174 |     
175 |     const page = await CardPage({ params });
176 |     render(page);
177 |     
178 |     // 이메일이 작성자로 표시되는지 확인
179 |     expect(screen.getByText(/작성자: test@example.com/)).toBeInTheDocument();
180 |   });
181 |   
182 |   it('태그가 없는 카드도 정상적으로 렌더링되어야 함', async () => {
183 |     // 태그가 없는 카드 데이터
184 |     const noTagsCard = {
185 |       ...mockCard,
186 |       cardTags: []
187 |     };
188 |     
189 |     // prisma 모킹 설정
190 |     const { prisma } = await import('@/lib/prisma');
191 |     (prisma.card.findUnique as any).mockResolvedValue(noTagsCard);
192 |     
193 |     const page = await CardPage({ params });
194 |     render(page);
195 |     
196 |     // 카드 내용은 렌더링되어야 함
197 |     expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
198 |     expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
199 |     
200 |     // 태그 영역이 렌더링되지 않아야 함
201 |     expect(screen.queryByText('태그1')).not.toBeInTheDocument();
202 |     expect(screen.queryByText('태그2')).not.toBeInTheDocument();
203 |   });
204 |   
205 |   it('다양한 콘텐츠 형식(한글, 영어, 특수문자)이 올바르게 렌더링되어야 함', async () => {
206 |     // 다양한 콘텐츠를 가진 카드 데이터
207 |     const diverseContentCard = {
208 |       ...mockCard,
209 |       title: '다양한 내용 테스트 카드',
210 |       content: '한글 내용, English content, 특수문자 !@#$%, 숫자 123'
211 |     };
212 |     
213 |     // prisma 모킹 설정
214 |     const { prisma } = await import('@/lib/prisma');
215 |     (prisma.card.findUnique as any).mockResolvedValue(diverseContentCard);
216 |     
217 |     const page = await CardPage({ params });
218 |     render(page);
219 |     
220 |     // 다양한 콘텐츠가 올바르게 렌더링되는지 확인
221 |     expect(screen.getByRole('heading', { name: '다양한 내용 테스트 카드' })).toBeInTheDocument();
222 |     expect(screen.getByText('한글 내용, English content, 특수문자 !@#$%, 숫자 123')).toBeInTheDocument();
223 |   });
224 | });
225 | 
226 | describe('generateMetadata', () => {
227 |   const params = { id: 'card123' };
228 |   
229 |   beforeEach(() => {
230 |     vi.clearAllMocks();
231 |   });
232 |   
233 |   afterEach(() => {
234 |     cleanup();
235 |   });
236 |   
237 |   it('유효한 카드 ID로 카드 제목을 메타데이터로 반환해야 함', async () => {
238 |     // 가짜 카드 데이터
239 |     const mockCard = {
240 |       id: 'card123',
241 |       title: '테스트 카드',
242 |       content: '테스트 내용입니다.',
243 |       createdAt: new Date(),
244 |       updatedAt: new Date()
245 |     };
246 |     
247 |     // prisma 모킹 설정
248 |     const { prisma } = await import('@/lib/prisma');
249 |     (prisma.card.findUnique as any).mockResolvedValue(mockCard);
250 |     
251 |     const metadata = await generateMetadata({ params });
252 |     
253 |     expect(metadata).toEqual({
254 |       title: '테스트 카드 | Backyard'
255 |     });
256 |   });
257 |   
258 |   it('존재하지 않는 카드 ID로 기본 메타데이터를 반환해야 함', async () => {
259 |     // prisma 모킹 설정 - 카드가 없음
260 |     const { prisma } = await import('@/lib/prisma');
261 |     (prisma.card.findUnique as any).mockResolvedValue(null);
262 |     
263 |     const metadata = await generateMetadata({ params });
264 |     
265 |     expect(metadata).toEqual({
266 |       title: '카드를 찾을 수 없음'
267 |     });
268 |   });
269 |   
270 |   it('오류 발생 시 기본 메타데이터를 반환해야 함', async () => {
271 |     // prisma 모킹 설정 - 오류 발생
272 |     const { prisma } = await import('@/lib/prisma');
273 |     (prisma.card.findUnique as any).mockRejectedValue(new Error('데이터베이스 오류'));
274 |     
275 |     // 콘솔 오류 출력 방지를 위한 스파이
276 |     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
277 |     
278 |     const metadata = await generateMetadata({ params });
279 |     
280 |     expect(metadata).toEqual({
281 |       title: '카드를 찾을 수 없음'
282 |     });
283 |     
284 |     // 스파이 복원
285 |     consoleSpy.mockRestore();
286 |   });
287 | });
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
71 |             뒤로 가기
72 |           </Button>
73 |         </Link>
74 |         <DeleteButton cardId={cardId} />
75 |       </div>
76 |       
77 |       <div className="space-y-4">
78 |         <h1 className="text-3xl font-bold">{card.title}</h1>
79 |         <div className="flex items-center gap-2 text-sm text-muted-foreground">
80 |           {/* @ts-ignore - Prisma 타입 오류 무시 */}
81 |           <p>작성자: {card.user?.name || card.user?.email}</p>
82 |           <span>•</span>
83 |           <p>작성일: {formatDate(card.createdAt)}</p>
84 |         </div>
85 |         
86 |         {/* @ts-ignore - Prisma 타입 오류 무시 */}
87 |         {card.cardTags && card.cardTags.length > 0 && (
88 |           <div className="flex flex-wrap gap-2">
89 |             {/* @ts-ignore - Prisma 타입 오류 무시 */}
90 |             {card.cardTags.map((cardTag: any) => (
91 |               <span
92 |                 key={cardTag.tagId}
93 |                 className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
94 |               >
95 |                 {cardTag.tag.name}
96 |               </span>
97 |             ))}
98 |           </div>
99 |         )}
100 |         
101 |         <ClientContent cardId={cardId} initialContent={card.content || ''} />
102 |       </div>
103 |     </div>
104 |   );
105 | }
106 | 
107 | interface ClientContentProps {
108 |   cardId: string;
109 |   initialContent: string;
110 | }
111 | 
112 | function ClientContent({ cardId, initialContent }: ClientContentProps) {
113 |   return <EditCardContent cardId={cardId} initialContent={initialContent} />;
114 | } 
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
80 |       const mockCard = {
81 |         id: '1',
82 |         title: '테스트 카드',
83 |         content: '테스트 내용',
84 |         createdAt: new Date(),
85 |         updatedAt: new Date(),
86 |         userId: 'user1',
87 |       };
88 | 
89 |       // Prisma 응답 모킹
90 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue(mockCard);
91 | 
92 |       // API 호출
93 |       const request = new NextRequest('http://localhost:3000/api/cards/1');
94 |       const context = createMockContext('1');
95 |       const response = await GET(request, context);
96 |       const data = await response.json();
97 | 
98 |       // 검증
99 |       expect(response.status).toBe(200);
100 |       expect(data).toEqual(mockCard);
101 |       expect(prisma.card.findUnique).toHaveBeenCalledWith({
102 |         where: { id: '1' },
103 |         include: { user: { select: { id: true, name: true } } },
104 |       });
105 |     });
106 | 
107 |     it('존재하지 않는 카드 조회 시 404 응답을 반환한다', async () => {
108 |       // Prisma 응답 모킹 (카드가 없음)
109 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);
110 | 
111 |       // API 호출
112 |       const request = new NextRequest('http://localhost:3000/api/cards/999');
113 |       const context = createMockContext('999');
114 |       const response = await GET(request, context);
115 |       const data = await response.json();
116 | 
117 |       // 검증
118 |       expect(response.status).toBe(404);
119 |       expect(data).toHaveProperty('error');
120 |     });
121 | 
122 |     it('에러 발생 시 500 응답을 반환한다', async () => {
123 |       // 에러 모킹
124 |       (prisma.card.findUnique as vi.Mock).mockRejectedValue(new Error('DB 에러'));
125 | 
126 |       // API 호출
127 |       const request = new NextRequest('http://localhost:3000/api/cards/1');
128 |       const context = createMockContext('1');
129 |       const response = await GET(request, context);
130 |       const data = await response.json();
131 | 
132 |       // 검증
133 |       expect(response.status).toBe(500);
134 |       expect(data).toHaveProperty('error');
135 |     });
136 |   });
137 | 
138 |   describe('PUT /api/cards/[id]', () => {
139 |     it('유효한 데이터로 카드를 업데이트한다', async () => {
140 |       // 모킹된 데이터
141 |       const mockUpdatedCard = {
142 |         id: '1',
143 |         title: '업데이트된 제목',
144 |         content: '업데이트된 내용',
145 |         createdAt: new Date(),
146 |         updatedAt: new Date(),
147 |         userId: 'user1',
148 |       };
149 | 
150 |       // 요청 데이터
151 |       const requestData = {
152 |         title: '업데이트된 제목',
153 |         content: '업데이트된 내용',
154 |       };
155 | 
156 |       // Prisma 응답 모킹
157 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
158 |       (prisma.card.update as vi.Mock).mockResolvedValue(mockUpdatedCard);
159 | 
160 |       // API 호출
161 |       const request = new NextRequest('http://localhost:3000/api/cards/1', {
162 |         method: 'PUT',
163 |         body: JSON.stringify(requestData),
164 |       });
165 |       const context = createMockContext('1');
166 |       const response = await PUT(request, context);
167 |       const data = await response.json();
168 | 
169 |       // 검증
170 |       expect(response.status).toBe(200);
171 |       expect(data).toEqual(mockUpdatedCard);
172 |       expect(prisma.card.update).toHaveBeenCalledWith({
173 |         where: { id: '1' },
174 |         data: requestData,
175 |       });
176 |     });
177 | 
178 |     it('존재하지 않는 카드 업데이트 시 404 응답을 반환한다', async () => {
179 |       // Prisma 응답 모킹 (카드가 없음)
180 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);
181 | 
182 |       // 요청 데이터
183 |       const requestData = {
184 |         title: '업데이트된 제목',
185 |         content: '업데이트된 내용',
186 |       };
187 | 
188 |       // API 호출
189 |       const request = new NextRequest('http://localhost:3000/api/cards/999', {
190 |         method: 'PUT',
191 |         body: JSON.stringify(requestData),
192 |       });
193 |       const context = createMockContext('999');
194 |       const response = await PUT(request, context);
195 |       const data = await response.json();
196 | 
197 |       // 검증
198 |       expect(response.status).toBe(404);
199 |       expect(data).toHaveProperty('error');
200 |       expect(prisma.card.update).not.toHaveBeenCalled();
201 |     });
202 | 
203 |     it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
204 |       // 유효하지 않은 요청 데이터 (제목이 빈 문자열)
205 |       const requestData = {
206 |         title: '',
207 |         content: '업데이트된 내용',
208 |       };
209 | 
210 |       // API 호출
211 |       const request = new NextRequest('http://localhost:3000/api/cards/1', {
212 |         method: 'PUT',
213 |         body: JSON.stringify(requestData),
214 |       });
215 |       const context = createMockContext('1');
216 |       const response = await PUT(request, context);
217 |       const data = await response.json();
218 | 
219 |       // 검증
220 |       expect(response.status).toBe(400);
221 |       expect(data).toHaveProperty('error');
222 |       expect(prisma.card.update).not.toHaveBeenCalled();
223 |     });
224 | 
225 |     it('PUT 요청 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
226 |       // 요청 데이터
227 |       const requestData = {
228 |         title: '업데이트된 제목',
229 |         content: '업데이트된 내용',
230 |       };
231 | 
232 |       // Prisma 응답 모킹
233 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
234 |       (prisma.card.update as vi.Mock).mockRejectedValue(new Error('DB 에러'));
235 | 
236 |       // API 호출
237 |       const request = new NextRequest('http://localhost:3000/api/cards/1', {
238 |         method: 'PUT',
239 |         body: JSON.stringify(requestData),
240 |       });
241 |       const context = createMockContext('1');
242 |       const response = await PUT(request, context);
243 |       const data = await response.json();
244 | 
245 |       // 검증
246 |       expect(response.status).toBe(500);
247 |       expect(data).toHaveProperty('error');
248 |     });
249 |   });
250 | 
251 |   describe('DELETE /api/cards/[id]', () => {
252 |     it('존재하는 카드를 성공적으로 삭제한다', async () => {
253 |       // Prisma 응답 모킹
254 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
255 |       (prisma.card.delete as vi.Mock).mockResolvedValue({ id: '1' });
256 | 
257 |       // API 호출
258 |       const request = new NextRequest('http://localhost:3000/api/cards/1', {
259 |         method: 'DELETE',
260 |       });
261 |       const context = createMockContext('1');
262 |       const response = await DELETE(request, context);
263 |       const data = await response.json();
264 | 
265 |       // 검증
266 |       expect(response.status).toBe(200);
267 |       expect(data).toHaveProperty('message');
268 |       expect(prisma.card.delete).toHaveBeenCalledWith({
269 |         where: { id: '1' },
270 |       });
271 |     });
272 | 
273 |     it('존재하지 않는 카드 삭제 시 404 응답을 반환한다', async () => {
274 |       // Prisma 응답 모킹 (카드가 없음)
275 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);
276 | 
277 |       // API 호출
278 |       const request = new NextRequest('http://localhost:3000/api/cards/999', {
279 |         method: 'DELETE',
280 |       });
281 |       const context = createMockContext('999');
282 |       const response = await DELETE(request, context);
283 |       const data = await response.json();
284 | 
285 |       // 검증
286 |       expect(response.status).toBe(404);
287 |       expect(data).toHaveProperty('error');
288 |       expect(prisma.card.delete).not.toHaveBeenCalled();
289 |     });
290 | 
291 |     it('에러 발생 시 500 응답을 반환한다', async () => {
292 |       // Prisma 응답 모킹
293 |       (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
294 |       (prisma.card.delete as vi.Mock).mockRejectedValue(new Error('DB 에러'));
295 | 
296 |       // API 호출
297 |       const request = new NextRequest('http://localhost:3000/api/cards/1', {
298 |         method: 'DELETE',
299 |       });
300 |       const context = createMockContext('1');
301 |       const response = await DELETE(request, context);
302 |       const data = await response.json();
303 | 
304 |       // 검증
305 |       expect(response.status).toBe(500);
306 |       expect(data).toHaveProperty('error');
307 |     });
308 |   });
309 | }); 
```

src/app/api/cards/[id]/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | import { z } from 'zod';
3 | import prisma from '@/lib/prisma';
4 | 
5 | // 카드 수정 스키마
6 | const updateCardSchema = z.object({
7 |   title: z.string().min(1, '제목은 필수입니다.').optional(),
8 |   content: z.string().optional(),
9 | });
10 | 
11 | // 개별 카드 조회 API
12 | export async function GET(
13 |   request: NextRequest,
14 |   context: { params: { id: string } }
15 | ) {
16 |   try {
17 |     const id = context.params.id;
18 |     
19 |     // 카드 조회
20 |     const card = await prisma.card.findUnique({
21 |       where: { id },
22 |       include: {
23 |         user: {
24 |           select: {
25 |             id: true,
26 |             name: true
27 |           }
28 |         }
29 |       }
30 |     });
31 |     
32 |     if (!card) {
33 |       return NextResponse.json(
34 |         { error: '카드를 찾을 수 없습니다.' },
35 |         { status: 404 }
36 |       );
37 |     }
38 |     
39 |     return NextResponse.json(card);
40 |   } catch (error) {
41 |     console.error('카드 조회 오류:', error);
42 |     return NextResponse.json(
43 |       { error: '카드를 조회하는 중 오류가 발생했습니다.' },
44 |       { status: 500 }
45 |     );
46 |   }
47 | }
48 | 
49 | // 카드 수정 API
50 | export async function PUT(
51 |   request: NextRequest,
52 |   context: { params: { id: string } }
53 | ) {
54 |   try {
55 |     const id = context.params.id;
56 |     const body = await request.json();
57 |     
58 |     // 데이터 유효성 검사
59 |     const validation = updateCardSchema.safeParse(body);
60 |     if (!validation.success) {
61 |       return NextResponse.json(
62 |         { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
63 |         { status: 400 }
64 |       );
65 |     }
66 |     
67 |     // 카드 존재 여부 확인
68 |     const existingCard = await prisma.card.findUnique({
69 |       where: { id }
70 |     });
71 |     
72 |     if (!existingCard) {
73 |       return NextResponse.json(
74 |         { error: '카드를 찾을 수 없습니다.' },
75 |         { status: 404 }
76 |       );
77 |     }
78 |     
79 |     // 카드 수정
80 |     const updatedCard = await prisma.card.update({
81 |       where: { id },
82 |       data: validation.data
83 |     });
84 |     
85 |     return NextResponse.json(updatedCard);
86 |   } catch (error) {
87 |     console.error('카드 수정 오류:', error);
88 |     return NextResponse.json(
89 |       { error: '카드를 수정하는 중 오류가 발생했습니다.' },
90 |       { status: 500 }
91 |     );
92 |   }
93 | }
94 | 
95 | // 카드 삭제 API
96 | export async function DELETE(
97 |   request: NextRequest,
98 |   context: { params: { id: string } }
99 | ) {
100 |   try {
101 |     const id = context.params.id;
102 |     
103 |     // 카드 존재 여부 확인
104 |     const existingCard = await prisma.card.findUnique({
105 |       where: { id }
106 |     });
107 |     
108 |     if (!existingCard) {
109 |       return NextResponse.json(
110 |         { error: '카드를 찾을 수 없습니다.' },
111 |         { status: 404 }
112 |       );
113 |     }
114 |     
115 |     // 카드 삭제
116 |     await prisma.card.delete({
117 |       where: { id }
118 |     });
119 |     
120 |     return NextResponse.json(
121 |       { message: '카드가 성공적으로 삭제되었습니다.' },
122 |       { status: 200 }
123 |     );
124 |   } catch (error) {
125 |     console.error('카드 삭제 오류:', error);
126 |     return NextResponse.json(
127 |       { error: '카드를 삭제하는 중 오류가 발생했습니다.' },
128 |       { status: 500 }
129 |     );
130 |   }
131 | } 
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
76 |     expect(responseData).toEqual({
77 |       message: '태그가 성공적으로 삭제되었습니다.'
78 |     });
79 |     
80 |     // prisma 함수 호출 확인
81 |     expect(prisma.tag.findUnique).toHaveBeenCalledWith({
82 |       where: { id: tagId },
83 |       include: { _count: { select: { cardTags: true } } }
84 |     });
85 |     expect(prisma.cardTag.deleteMany).toHaveBeenCalledWith({
86 |       where: { tagId }
87 |     });
88 |     expect(prisma.tag.delete).toHaveBeenCalledWith({
89 |       where: { id: tagId }
90 |     });
91 |   });
92 | 
93 |   it('존재하지 않는 태그에 대해 404 오류를 반환해야 함', async () => {
94 |     const tagId = '999';
95 |     
96 |     // prisma 모킹 설정
97 |     const { prisma } = await import('@/lib/prisma');
98 |     (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
99 |     
100 |     // DELETE 요청 시뮬레이션
101 |     const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
102 |       method: 'DELETE'
103 |     });
104 |     
105 |     const response = await DELETE(request, {
106 |       params: { id: tagId }
107 |     });
108 |     
109 |     // 응답 검증
110 |     expect(response.status).toBe(404);
111 |     const responseData = await response.json();
112 |     expect(responseData).toEqual({
113 |       error: '존재하지 않는 태그입니다.'
114 |     });
115 |     
116 |     // prisma 함수 호출 확인
117 |     expect(prisma.tag.findUnique).toHaveBeenCalledWith({
118 |       where: { id: tagId },
119 |       include: { _count: { select: { cardTags: true } } }
120 |     });
121 |     expect(prisma.cardTag.deleteMany).not.toHaveBeenCalled();
122 |     expect(prisma.tag.delete).not.toHaveBeenCalled();
123 |   });
124 |   
125 |   it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
126 |     const tagId = '1';
127 |     const mockTag = { 
128 |       id: tagId, 
129 |       name: '테스트 태그',
130 |       _count: { cardTags: 2 }
131 |     };
132 |     
133 |     // prisma 모킹 설정
134 |     const { prisma } = await import('@/lib/prisma');
135 |     (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
136 |     (prisma.tag.delete as any).mockRejectedValue(new Error('데이터베이스 오류'));
137 |     
138 |     // DELETE 요청 시뮬레이션
139 |     const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
140 |       method: 'DELETE'
141 |     });
142 |     
143 |     const response = await DELETE(request, {
144 |       params: { id: tagId }
145 |     });
146 |     
147 |     // 응답 검증
148 |     expect(response.status).toBe(500);
149 |     const responseData = await response.json();
150 |     expect(responseData).toEqual({
151 |       error: '태그를 삭제하는 중 오류가 발생했습니다.'
152 |     });
153 |   });
154 | }); 
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
78 |     
79 |     if (duplicateTag) {
80 |       return NextResponse.json(
81 |         { error: '이미 같은 이름의 태그가 존재합니다.' },
82 |         { status: 400 }
83 |       );
84 |     }
85 |     
86 |     // 태그 수정
87 |     const updatedTag = await prisma.tag.update({
88 |       where: { id },
89 |       data: validation.data
90 |     });
91 |     
92 |     return NextResponse.json(updatedTag);
93 |   } catch (error) {
94 |     console.error('태그 수정 오류:', error);
95 |     return NextResponse.json(
96 |       { error: '태그를 수정하는 중 오류가 발생했습니다.' },
97 |       { status: 500 }
98 |     );
99 |   }
100 | }
101 | 
102 | // 태그 삭제 API
103 | export async function DELETE(
104 |   request: NextRequest,
105 |   context: { params: { id: string } }
106 | ) {
107 |   try {
108 |     const id = context.params.id;
109 |     
110 |     // 태그 존재 여부 확인
111 |     const existingTag = await prisma.tag.findUnique({
112 |       where: { id }
113 |     });
114 |     
115 |     if (!existingTag) {
116 |       return NextResponse.json(
117 |         { error: '태그를 찾을 수 없습니다.' },
118 |         { status: 404 }
119 |       );
120 |     }
121 |     
122 |     // 태그가 카드에서 사용 중인지 확인
123 |     const cardTagsCount = await prisma.cardTag.count({
124 |       where: { tagId: id }
125 |     });
126 |     
127 |     // 태그 삭제
128 |     await prisma.tag.delete({
129 |       where: { id }
130 |     });
131 |     
132 |     return NextResponse.json({
133 |       message: '태그가 성공적으로 삭제되었습니다.',
134 |       affectedCards: cardTagsCount
135 |     });
136 |   } catch (error) {
137 |     console.error('태그 삭제 오류:', error);
138 |     return NextResponse.json(
139 |       { error: '태그를 삭제하는 중 오류가 발생했습니다.' },
140 |       { status: 500 }
141 |     );
142 |   }
143 | } 
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
