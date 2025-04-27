## Supabase Dev DB 도입용 코드 수정

1. **[layer=service][tag=@service-msw] Prisma 스키마 프로바이더 통일**  
   - `prisma/schema.prisma` 에서  
     ```diff
     - provider = "sqlite"
     + provider = "postgresql"
     ```  
   - `schema.sqlite.prisma` 유지, `schema.postgresql.prisma` → 복사 자동화 스크립트 수정  

2. **[layer=service][tag=@service-msw] scripts/select-db.js 단순화**  
   ```js
   /**
    * @rule   three-layer-Standard
    * @layer  service
    * @tag    @service-msw selectDb
    */
   import fs from 'fs';
   import path from 'path';

   const base = path.resolve(__dirname, '../prisma');
   // 항상 PostgreSQL 스키마 사용
   fs.copyFileSync(path.join(base, 'schema.postgresql.prisma'), path.join(base, 'schema.prisma'));
   console.log('✅ prisma/schema.prisma updated for PostgreSQL');
   ```

3. **[layer=service][tag=@service-msw] scripts/test-db.js 환경변수 분기 제거**  
   - `DATABASE_URL`만 사용하도록, SQLite 분기문 전부 삭제

4. **[layer=service][tag=@service-msw] CI/CD·pre-deploy 스크립트 갱신**  
   - `scripts/pre-deploy.js` 에서 `DATABASE_PROVIDER` 체크 시  
     - `postgresql`만 허용  
     - dev/prod env 파일 자동 로드 로직 추가  

5. **[layer=service][tag=@service-msw] src/lib/supabase/client.ts 생성**  
   ```ts
   /**
    * @rule   three-layer-Standard
    * @layer  service
    * @tag    @service-msw supabaseClient
    */
   import { createClient as _createClient } from '@supabase/supabase-js';

   export const createClient = () =>
     _createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   ```

6. **[layer=hooks][tag=@tanstack-query-msw] useAuth 훅 수정**  
   - 기존 `useAuth` 내 `createClient()` → 위 `src/lib/supabase/client.ts` 의 `createClient()` 호출하도록 변경  
   - SSR middleware (`src/middleware.ts`)도 마찬가지로 중앙화된 client 사용

7. **[layer=hooks][tag=@tanstack-mutation-msw] src/middleware.ts 환경변수 반영**  
   ```ts
   /**
    * @rule   three-layer-Standard
    * @layer  service
    * @tag    @service-msw authMiddleware
    */
   import { createServerClient } from '@supabase/ssr';

   const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

   export async function middleware(request) {
     const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, { /*...*/ });
     // ...이전 로직 그대로
   }
   ```

8. **[layer=service][tag=@service-msw] MSW 핸들러 추가**  
   - `src/tests/msw/authHandlers.ts` 생성  
     ```ts
     /**
      * @rule   three-layer-Standard
      * @layer  service
      * @tag    @service-msw auth
      */
     import { rest } from 'msw';

     export const authHandlers = [
       rest.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`, (req, res, ctx) => {
         return res(ctx.json({ access_token: 'dev-token', user: {/*…*/} }));
       }),
     ];
     ```

9. **[layer=service][tag=@service-msw] 테스트 Setup 통합**  
   - `src/tests/setup.ts` 에 `authHandlers` import & `setupServer(...authHandlers)` 포함

10. **[layer=service][tag=@service-msw] 머지 후 Mermaid 다이어그램 업데이트**  
    - `docs/architecture/dev-prod-setup.md` 생성  
    - Three-Layer SequenceDiagram으로 dev/prod env 흐름 추가  

---

이 작업 순서대로 진행하면, **dev/production** 두 개의 분리된 Free Supabase 프로젝트를 **Three-Layer-Standard** 룰에 맞춰 깔끔하게 운영할 수 있습니다.  
주니어도 쉽게 따라올 수 있도록 **단계별·역할별**로 나누었으니, 차례대로 진행해 보세요!