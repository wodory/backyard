**Tasklist:**

**Task 1: `AuthContext`에서 `codeVerifier` 관련 상태 및 로직 완전히 제거**

*   **목표:** `@supabase/ssr`의 쿠키 메커니즘과 충돌하거나 혼란을 야기할 수 있는 클라이언트 측 `codeVerifier` 상태 관리를 완전히 제거합니다.
*   **수정 대상 파일:** `src/contexts/AuthContext.tsx`
*   **수행 작업:**
    1.  `AuthContext.tsx` 파일을 엽니다.
    2.  `useState`를 사용하여 선언된 `codeVerifier` 상태 변수와 `setCodeVerifier` 함수를 찾습니다. (대략 57, 37, 48라인)
    3.  이 상태 변수와 설정 함수, 그리고 `AuthContextType` 인터페이스 내의 관련 타입 정의(`codeVerifier`, `setCodeVerifier`)를 **모두 삭제**합니다.
    4.  `AuthContext`의 `value` 객체에서도 `codeVerifier`와 `setCodeVerifier`를 제거합니다.
    5.  `useEffect` 내 `initializeAuth` 함수 또는 다른 곳에서 `codeVerifier` 상태를 읽거나 쓰는 모든 코드를 찾아서 삭제합니다. (예: `sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER)` 호출 및 관련 로직)
*   **변경 범위 제한:** `AuthContext.tsx` 파일 내에서 `codeVerifier`와 직접적으로 관련된 상태, 타입, 로직만 제거합니다. 다른 인증 상태(`user`, `session`, `isLoading`) 관련 로직은 유지합니다.
*   **사용자 확인 사항:**
    1.  앱을 로컬에서 실행합니다 (`yarn dev`).
    2.  콘솔에 `[CLIENT-LOG][AuthContext][warn] code_verifier를 찾을 수 없음` 경고가 더 이상 나타나지 않는지 확인합니다.
    3.  Google 로그인을 포함한 일반적인 앱 기능이 정상적으로 작동하는지 확인합니다.

**Task 2: 쿠키 옵션 재검토 및 단순화 (`domain` 속성 명시적 제거 확인)**

*   **목표:** Vercel 환경에서 쿠키 도메인 관련 문제를 피하기 위해 쿠키 옵션을 최대한 단순화하고, 특히 `domain` 속성이 설정되지 않았음을 다시 한번 확인합니다.
*   **수정 대상 파일:**
    *   `src/lib/supabase/middleware.ts`
    *   `src/lib/supabase/server.ts`
*   **수행 작업:**
    1.  두 파일 모두에서 `createServerClient`에 전달되는 `cookies` 객체 내의 `set` 및 `remove` 함수 내부를 확인합니다.
    2.  `options` 객체를 수정하는 부분에서 **`domain` 속성을 명시적으로 설정하는 코드가 없는지 재확인**합니다. 만약 있다면 반드시 제거하거나 주석 처리합니다. (이전 Task에서 수행했지만 재확인)
        ```javascript
        // 예시: set 함수 내부
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            // ... secure, sameSite, path 설정 ...

            // 아래와 같이 domain을 설정하는 코드가 없어야 함
            // delete options.domain; // 이 라인이 있거나, 애초에 domain 설정 코드가 없어야 함

            cookieStore.set({ name, value, ...options }) // options 객체에 domain이 없도록 전달
          } catch (error) { /* ... */ }
        },
        ```
    3.  `sameSite` 속성이 `'Lax'`로 설정되어 있는지 확인합니다.
    4.  `path` 속성이 `'/'`로 설정되어 있는지 확인합니다.
    5.  `secure` 속성이 프로덕션 환경(`process.env.NODE_ENV === 'production'`)에서 `true`로 설정되는지 확인합니다.
*   **변경 범위 제한:** 쿠키의 `domain` 속성 제거 확인 및 `secure`, `sameSite`, `path` 설정 확인만 수행합니다.
*   **사용자 확인 사항:**
    1.  코드 변경 사항을 커밋하고 Vercel에 다시 배포합니다.
    2.  배포된 Vercel URL에서 Google 로그인을 시도합니다.
    3.  **결과 확인:** 로그인 후 정상적으로 홈(`/`)으로 리디렉션되는지 확인합니다. 여전히 `/login`으로 돌아온다면 다음 Task로 넘어갑니다.

**Task 3: Supabase 및 Vercel 환경 변수/설정 재확인**

*   **목표:** Supabase 프로젝트 설정과 Vercel 환경 변수가 정확히 일치하는지, 특히 OAuth 관련 URL이 올바른지 확인합니다.
*   **수행 작업 (코드 변경 없음, 확인 작업):**
    1.  **Vercel 환경 변수 확인:** Vercel 프로젝트 대시보드로 이동하여 다음 환경 변수가 **Production, Preview, Development** 환경 모두에 정확히 설정되었는지 확인합니다.
        *   `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL (예: `https://<id>.supabase.co`)
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트 Anon Key
        *   `SUPABASE_SERVICE_ROLE_KEY` (있다면 서버 측 로직용)
        *   `NEXT_PUBLIC_OAUTH_REDIRECT_URL`: **Vercel 배포 URL** (예: `https://your-app-name.vercel.app` 또는 커스텀 도메인 `https://www.yourdomain.com`) - **절대 `localhost`가 아니어야 합니다.**
    2.  **Supabase 인증 설정 확인:** Supabase 프로젝트 대시보드로 이동합니다.
        *   Authentication -> Providers -> Google: 활성화되어 있는지 확인합니다.
        *   Authentication -> URL Configuration:
            *   **Site URL:** Vercel 배포 URL (`NEXT_PUBLIC_OAUTH_REDIRECT_URL`과 동일)이 등록되어 있는지 확인합니다. **정확히 일치해야 하며, 끝에 `/`가 붙거나 빠지지 않았는지 주의 깊게 확인합니다.** (예: `https://your-app-name.vercel.app` 이면 그대로 입력)
            *   **Redirect URLs:** `**` (와일드카드) 또는 **`Vercel 배포 URL/auth/callback`** (예: `https://your-app-name.vercel.app/auth/callback`) 이 목록에 포함되어 있는지 확인합니다. 여기서도 끝에 `/` 유무 등을 정확히 맞춰야 합니다.
*   **변경 범위 제한:** 코드 변경은 없습니다. Vercel 및 Supabase 대시보드 설정 확인만 합니다.
*   **사용자 확인 사항:**
    1.  모든 URL과 키가 정확히 일치하는지 확인합니다. 불일치하는 부분이 있다면 수정합니다.
    2.  설정 수정 후 Vercel 프로젝트를 **재배포(Redeploy)**합니다. (환경 변수나 Supabase 설정 변경 시 필요)
    3.  **결과 확인:** 재배포 후 Vercel URL에서 Google 로그인을 다시 시도하여 문제가 해결되었는지 확인합니다.

**Task 4: Vercel 로그에서 쿠키 진단 로그 확인 (Task 3 적용 후)**

*   **목표:** 이전 Task에서 추가한 쿠키 관련 `console.log`가 Vercel 환경의 런타임 로그에서 어떻게 출력되는지 확인하여 쿠키 전달 문제를 진단합니다.
*   **수행 작업 (코드 변경 없음, 확인 작업):**
    1.  Vercel 프로젝트 대시보드로 이동하여 'Logs' 탭을 엽니다.
    2.  배포된 앱에서 Google 로그인을 시도합니다.
    3.  실시간으로 Vercel 로그를 모니터링합니다.
    4.  **확인 사항:**
        *   로그인 시작 시 `[Middleware Cookie Set] Setting code_verifier cookie:` 로그가 출력됩니까? 쿠키 옵션(`options`)은 어떻게 설정되었습니까?
        *   Google 인증 후 `/auth/callback` 경로로 리디렉션되었을 때, **함수 로그(Function Logs)** 또는 **엣지 미들웨어 로그(Edge Middleware Logs)** 에서 `[Server Cookie Get] Getting code_verifier cookie:` 로그가 출력됩니까?
        *   만약 `[Server Cookie Get]` 로그가 출력된다면, `value`가 실제 값(`...`)으로 나옵니까, 아니면 `'Not Found'`로 나옵니까?
        *   만약 `[Server Cookie Get]` 로그 자체가 보이지 않거나 `value`가 `'Not Found'`라면, 이는 Vercel 환경에서 서버 측 라우트 핸들러가 브라우저로부터 `code_verifier` 쿠키를 받지 못하고 있다는 강력한 증거입니다. 이 경우 쿠키 속성 문제(특히 `SameSite`, `Secure`, `Path`) 또는 Vercel 환경 자체의 제약일 수 있습니다.
*   **변경 범위 제한:** 코드 변경은 없습니다. Vercel 로그 확인 및 분석만 수행합니다.
*   **사용자 확인 사항:**
    1.  로그 확인 결과를 바탕으로 문제의 원인이 쿠키 설정/전달 단계에 있는지 판단합니다.
    2.  만약 쿠키가 서버로 전달되지 않는 것이 확인되면, 쿠키 옵션(특히 `SameSite=None; Secure` 조합 시도 등)을 추가로 조정하거나, Vercel/Supabase 커뮤니티에 관련 문제를 검색/질문해야 할 수 있습니다.

---

**작업 완료 후:**

이 Tasklist를 통해 `AuthContext`의 불필요한 로직을 제거하고, `@supabase/ssr`의 쿠키 메커니즘이 Vercel 환경에서 올바르게 작동하는 데 필요한 설정들을 검증 및 조정하며, 로그를 통해 실제 쿠키 처리 과정을 추적할 수 있게 됩니다. 대부분의 경우 Task 1, 2, 3에서 문제가 해결될 가능성이 높습니다. Agent는 각 Task 완료 후 코드가 컴파일되고 실행 가능한 상태인지 확인해 주세요.