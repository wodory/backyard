##  Tasklis

**목표:** NextAuth.js 제거 및 Supabase/ssr 로그인/아웃 구현으로 Google OAuth 로그아웃 기능 정상화 및 CSRF 토큰 오류 해결

1. **Supabase 로그아웃 함수 구현** (`src/lib/auth.ts` 수정) – *[auth-supabase-logout]*  
   - **변경 지침:** `src/lib/auth.ts` 파일에 **`signOut` 함수**를 구현하거나 보완합니다. 파일 하단부에 다른 인증 함수(`signIn`, `signUp`, `signInWithGoogle` 등)와 유사한 형태로 추가하세요. 예:  
     ```ts
     import { deleteCookie } from 'cookies-next';  // (필요 시 추가)
     
     /**
      * signOut: 현재 사용자 Supabase 세션 종료
      * @returns Promise<void>
      */
     export async function signOut(): Promise<void> {
       const supabase = await createClient();
       const { error } = await supabase.auth.signOut();
       if (error) {
         logger.error('로그아웃 실패:', error);
         throw error;
       }
       // 로컬 세션 스토리지 정리 (persistSession 사용 시)
       supabase.auth.getSession(); // 세션 초기화 트리거 (필요에 따라)
       // 설정했던 쿠키 삭제
       deleteCookie('sb-access-token');
       deleteCookie('sb-refresh-token');
       // (또는 setCookie로 만료시키는 방법도 가능)
       logger.info('사용자 로그아웃 완료');
     }
     ```  
     *함수 시그니처:* `async function signOut(): Promise<void>` – 파라미터 없음, 반환 타입 `void` (Promise).  
     *Import:* `cookies-next` 라이브러리의 `deleteCookie` 함수를 사용할 경우 상단에 import 문 추가. 또한 Supabase 클라이언트 생성에 필요한 `createClient` 함수와 로깅 유틸 `logger`를 기존과 동일하게 활용합니다.  
   - **적용 규칙 키워드:** [auth-supabase-logout] (Supabase 인증 세션 종료 로직 구현).  
   - **예상 결과:** 이제 클라이언트에서 `signOut()`을 호출하면 **Supabase 세션이 해제**되고, 우리가 수동으로 설정했던 인증 쿠키(`sb-access-token`, `sb-refresh-token`)도 삭제됩니다. NextAuth의 `/api/auth/signout` 경로를 거치지 않으므로 CSRF 토큰 오류 없이 로그아웃이 이루어집니다. 즉, **콘솔에 더 이상 `/api/auth/csrf 404` 오류가 발생하지 않고**, `signOut()` 호출 후에는 정상적으로 `/login` 페이지로 리다이렉트됩니다. 또한 Supabase 세션 토큰이 제거되어 **서버 측 `getCurrentUser()` 등이 null을 반환**하게 되므로, 완전한 로그아웃 상태가 유지됩니다 ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)) ([Supabase Auth: SSO,  Mobile, and Server-side support](https://supabase.com/blog/supabase-auth-sso-pkce#:~:text=Many%20developers%20today%20are%20using,over%20the%20next%20few%20weeks)).  
   - **선행 테스트 강화:** 수정 전후에 **통합 시나리오 테스트**를 준비합니다. 예를 들어: *“사용자가 Google OAuth로 로그인한 뒤 로그아웃 버튼을 클릭하면, 사용자 세션이 사라지고 로그인 페이지로 이동한다.”*라는 end-to-end 흐름을 테스트하세요. 구체적으로, 테스트 코드에서 로그인 후 `/api/auth/status` 등을 호출해 `loggedIn: true`를 확인하고, `handleSignOut` 실행 후에는 다시 해당 API가 `loggedIn: false`를 응답하는지 검증해야 합니다. 또한 쿠키가 삭제되었는지 (`document.cookie`에 `sb-access-token` 키가 존재하지 않는지) 확인하는 테스트를 추가해 **세션 정리 여부를 검증**합니다.

2. **NextAuth `signOut` 호출 제거** (`AuthTestPage` 및 관련 부분 수정) – *[auth-remove-nextauth]*  
   - **변경 지침:** NextAuth의 `signOut` 함수를 호출하는 모든 클라이언트 코드 경로를 Supabase 방식으로 변경합니다. 우선 `src/app/auth/test/page.tsx` (AuthTestPage 컴포넌트)에서 다음을 수정합니다:  
     - 상단 import 문에서 `signOut`를 `next-auth/react`로부터 가져오는 부분을 제거하거나 대체합니다. 대신 우리 `lib/auth`의 `signOut` 함수를 import 하세요. 예: `import { signOut } from '@/lib/auth';`  
     - `handleLogout` 이벤트 핸들러를 수정하여 **우리의 signOut 함수를 호출**하도록 합니다. 예:  
       ```tsx
       const handleLogout = async () => {
         try {
           await signOut();
           alert('로그아웃 성공');
         } catch (e) {
           console.error('로그아웃 오류:', e);
         }
       };
       ```  
       (실제 UI에서는 `toast.success` 등을 사용할 수 있습니다. 테스트 용도의 AuthTestPage이므로 간단히 표시)  
     - 유사하게, NextAuth의 `useSession` 훅을 통해 세션을 확인하던 로직도 Supabase `AuthContext` 또는 `getCurrentUser` 결과로 대체할 수 있습니다. 다만 이 페이지는 테스트 목적이므로 최소한 **로그아웃만 Supabase 경로로 변경**해도 이번 이슈는 해결됩니다.  
   - **적용 규칙 키워드:** [auth-remove-nextauth] (NextAuth 의존성 제거 및 Supabase 대체).  
   - **예상 결과:** AuthTestPage의 “로그아웃 테스트” 버튼 클릭 시 더 이상 NextAuth의 `/api/auth/csrf`를 호출하지 않고, 앞서 구현한 Supabase `signOut()`이 실행됩니다. 따라서 **콘솔 오류 없이 로그아웃**이 이루어지며, 필요에 따라 수동 새로고침이나 세션 상태 확인으로 로그아웃이 성공했음을 확인할 수 있습니다. NextAuth의 `useSession` 대신 Supabase 세션을 사용하도록 수정했다면, 로그인 후 AuthTestPage에 진입했을 때 세션 객체를 올바르게 인식하는지도 확인해야 합니다. (참고: NextAuth 제거로 인한 UI 변화는 이 테스트 페이지에 한정되며, 본 애플리케이션의 일반 로그인/로그아웃 흐름에는 영향이 없습니다.)  
   - **선행 테스트 강화:** AuthTestPage 관련 테스트(`AuthTestPage.test.tsx` 등)가 존재한다면, **시나리오를 Supabase 기반으로 수정**해야 합니다. 예를 들어, 기존에 `useSession`을 mokcing하여 “로그인 상태일 때 로그아웃 버튼이 보여야 한다” 등을 확인했다면, 이제는 우리 `AuthContext`나 `getCurrentUser()`를 기반으로 한 조건을 테스트해야 합니다. 또한 “로그아웃 버튼 클릭 시 `signOut` 함수가 호출된다”는 규칙은 그대로 유지하되, **mock을 NextAuth 대신 우리의 `signOut` 함수로 교체**하여 테스트를 업데이트합니다 ([company.md](file://file-Wd762EAu7Zh6M5MpSFaNou#:~:text=51%20,signOut%20%3D%20createSuccessSignOutMock%28%29%3B%2054)). 이를 통해 NextAuth 제거 후에도 테스트가 통과하도록 하고, 실제 동작도 검증합니다.

3. **NextAuth 라우트 설정 정리 혹은 추가 구현** (선택: 프로젝트 방향에 따른 처리) – *[authjs-route-handler]*  
   - **변경 지침:** 만약 프로젝트에서 NextAuth를 **완전히 제거**할 계획이라면, 불필요한 NextAuth 설정과 의존성을 정리합니다. `next-auth` 패키지를 `package.json`에서 제거하고, 관련 환경변수(NEXTAUTH_URL, NEXTAUTH_SECRET 등)가 설정되어 있었다면 정리합니다. 반대로, NextAuth를 **계속 사용할 필요가 있다면** (예: 다른 OAuth 제공자 추가 등), `/app/api/auth/[...nextauth]/route.ts` 라우트 핸들러를 구현해야 합니다 ([Initialization | NextAuth.js](https://next-auth.js.org/configuration/initialization#:~:text=%2Fapp%2Fapi%2Fauth%2F)). 예:  
     ```ts
     // 파일: src/app/api/auth/[...nextauth]/route.ts
     import NextAuth from "next-auth";
     import GoogleProvider from "next-auth/providers/google";
     import { SupabaseAdapter } from "@next-auth/supabase-adapter"; // (필요 시 Supabase adapter)
     import { PrismaAdapter } from "@next-auth/prisma-adapter";    // (다른 DB 사용 시)
     
     const handler = NextAuth({
       providers: [
         GoogleProvider({
           clientId: process.env.GOOGLE_CLIENT_ID!,
           clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
           authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } }
         })
       ],
       secret: process.env.NEXTAUTH_SECRET,
       // adapter: SupabaseAdapter(...) 또는 PrismaAdapter(...) 등 (옵션)
     });
     export { handler as GET, handler as POST };
     ```  
     이로써 NextAuth의 모든 기본 경로 (`/api/auth/*`)가 활성화되어 CSRF 토큰 API도 동작하게 됩니다 ([Initialization | NextAuth.js](https://next-auth.js.org/configuration/initialization#:~:text=In%20Next,called%20Catch%20all%20API%20routes)) ([Initialization | NextAuth.js](https://next-auth.js.org/configuration/initialization#:~:text=%2Fapp%2Fapi%2Fauth%2F)). **주의:** Supabase와 NextAuth를 함께 쓰는 경우 adapter 설정이나 JWT 세션 전략 등을 신중히 결정해야 합니다. Supabase Auth 자체를 사용 중이라면 NextAuth 세션을 굳이 유지할 필요는 없으므로, 이 프로젝트에서는 NextAuth보다는 Supabase 방식에 통일하는 편이 단순합니다.  
   - **적용 규칙 키워드:** [authjs-route-handler] (NextAuth 경로 설정 추가 또는 NextAuth 제거).  
   - **예상 결과:** 
     - **NextAuth 제거 시:** 불필요한 코드가 사라지고 번들 크기가 약간 줄며, **오류 발생 가능성이 있는 이중 경로**가 정리됩니다. Supabase를 통한 OAuth 흐름이 유일한 인증 경로가 되어 일관성이 높아집니다. 모든 OAuth 로그인/로그아웃은 이제 Supabase 클라이언트를 통해 이뤄지므로, 이전 Company 버전과 동일한 동작을 일관되게 재현할 수 있습니다.  
     - **NextAuth 유지 시:** `/api/auth/csrf` 및 `/api/auth/signout` 경로가 정상적으로 응답하게 되므로 NextAuth `signOut()` 호출 시 오류가 사라집니다. CSRF 토큰이 발급되어 로그아웃 POST 요청이 성공하며, NextAuth가 관리하는 세션 쿠키도 삭제됩니다 ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=The%20,api%2Fauth%2Fcsrf)) ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=The%20CSRF%20token%20returned%20by,submissions%20to%20any%20API%20endpoint)). 다만 이 경우 현재 프로젝트의 Supabase 세션(cookie)과 NextAuth 세션(cookie)이 혼재될 수 있으므로, **동시 사용에 따른 충돌**이 없도록 해야 합니다. (예: Supabase Auth와 NextAuth 세션 간 싱크를 맞추거나, 하나만 사용하도록 결정)  
   - **선행 테스트 강화:** 이 Task는 선택적인 방향이므로, **프로젝트 결정에 따른 테스트 시나리오**를 재정의해야 합니다. NextAuth를 제거했다면 NextAuth 관련 모든 테스트(mocking 등)를 삭제하거나 대체하고, **Supabase 흐름에 대한 테스트 케이스**(OAuth 로그인부터 콜백 처리, 로그아웃까지)를 통합적으로 점검합니다. 반대로 NextAuth를 유지했다면, **NextAuth와 Supabase가 모두 동작하는 시나리오**를 테스트해야 합니다. 예컨대, NextAuth 세션 쿠키와 Supabase 쿠키가 모두 존재할 때 `getCurrentUser()` (Supabase 기반)와 `useSession()` (NextAuth 기반)이 일관된 사용자 정보를 가리키는지 확인하는 통합 테스트가 필요합니다. 또한 `/api/auth/*` 경로가 정상 작동하는지 NextAuth의 `getSession()` 또는 REST API를 통해 검증하는 것도 좋습니다 ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=,api%2Fauth%2Fcallback%2Fgoogle)) ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)).

4. **로그아웃 후 상태 검증 및 리다이렉션 확인** – *[auth-logout-verification]*  
   - **변경 지침:** 로그아웃 기능 수정 후, **사용자 경험 측면의 검증**을 수행합니다. 코드 수정 자체는 없지만, Task 1~3 적용 결과를 확인하는 추가 조치로서, 다음을 점검하세요:
     - 로그아웃 버튼 클릭 후 **`/login` 페이지로 리다이렉션**이 항상 이루어지는지 확인하고, 필요하다면 `signOut()` 함수 내부 또는 호출부에 명시적인 `router.push('/login')`를 유지하거나 추가합니다 (현재 UserProfile의 `handleSignOut`에는 이미 포함됨 ([now.md](file://file-ChJ98kCpFF6wjnM93GhfoB#:~:text=49%20,))). NextAuth `signOut({ redirect: false })` 같은 옵션을 썼었다면 이제 불필요하므로 제거합니다.  
     - 로그아웃 후 애플리케이션 상태를 초기화해야 하는 부분이 있다면 처리합니다. 예를 들어 전역 상태 관리(Zustand 등)에 사용자 정보가 캐시되어 있다면, 로그아웃 시 해당 스토어를 reset하거나 `user: null`로 갱신합니다. 이 프로젝트에서는 `useAppStore`에서 `signOut`을 모킹하는 테스트가 있었으므로 ([company.md](file://file-Wd762EAu7Zh6M5MpSFaNou#:~:text=20%20,23)), 실제 구현에서도 전역 상태 동기화를 고려합니다.  
   - **적용 규칙 키워드:** [auth-logout-verification] (로그아웃 후 상태/리다이렉트 검증 강화).  
   - **예상 결과:** 사용자가 로그아웃할 때 **항상 로그인 화면으로 이동**하게 되어 UX 혼선을 방지합니다. 또한 로그아웃 직후 `AuthContext`의 사용자 상태값이 `null`로 설정되고, 보호된 페이지 접근 시 `unauthenticated` 플로우가 제대로 작동하게 됩니다. 예를 들어, 로그아웃 후 `/profile` 등에 접근하면 `middleware`나 해당 페이지에서 로그인 페이지로 다시 보내는 로직이 정상 동작할 것입니다. Company 버전에서 기대했던 로그아웃 후 처리와 동일하게, Now 버전에서도 **완전한 로그아웃 사이클**(세션 만료 → 클라이언트 상태 초기화 → 리다이렉트)이 구현됩니다.  
   - **선행 테스트 강화:** *통합 테스트*로 **로그아웃 후 상태**를 검증합니다. 시나리오: “로그인한 사용자가 로그아웃하면, 애플리케이션의 사용자 상태가 초기화되고 보호된 페이지에 접근할 수 없다.” 이를 자동화하려면, 테스트 코드에서 로그인 후 전역 상태(`AuthContext` 혹은 Zustand store의 user 등)를 확인하고, `handleSignOut()` 호출 후 잠시 기다린 뒤 다시 상태를 확인합니다. 기대값은 `user === null` (또는 세션 없음)입니다. 또한 `window.location.pathname`이 `/login`으로 변경되었는지도 체크합니다. 필요하면 Jest의 `mockRouter` 등을 활용해 `router.push` 호출 여부를 확인할 수 있습니다. 이러한 테스트를 통해 **로그아웃 기능의 끝단까지 검증**함으로써, 남은 Edge case(예: 네트워크 단절 시 처리, 이미 세션 없음 상태에서의 로그아웃 호출 등)도 추가로 보완할 수 있습니다.

## 참고 자료 및 근거

- NextAuth (Auth.js) **공식 문서:** 로그아웃 REST API가 CSRF 토큰을 요구함 ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)) ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)), App Router 사용 시 `/app/api/auth/[...nextauth]/route.ts`로 초기화해야 함 ([Initialization | NextAuth.js](https://next-auth.js.org/configuration/initialization#:~:text=%2Fapp%2Fapi%2Fauth%2F)). 해당 문서에서 CSRF 토큰 엔드포인트(`GET /api/auth/csrf`)가 **서명된 쿠키 방식으로 토큰을 제공**하며 모든 인증 경로에 CSRF 보호가 적용된다고 설명합니다 ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)). 이번 이슈는 이 경로가 없었기 때문에 발생했습니다.

- NextAuth **GitHub 논의:** NextAuth 클라이언트 `signOut()` 구현은 `fetch('/api/auth/csrf')` 후 `fetch('/api/auth/signout', { method: 'POST', body: { csrfToken } })` 순으로 동작함을 보여줍니다 ([Is it possible to sign in a user with a REST API call when using Credentials provider? · nextauthjs next-auth · Discussion #6011 · GitHub](https://github.com/nextauthjs/next-auth/discussions/6011#:~:text=const%20signOut%20%3D%20async%20,%7D%29%2C%20%7D%29)). 이를 통해 `/api/auth/csrf` 404가 곧바로 로그아웃 실패로 이어짐을 알 수 있습니다. Company 버전에서는 이 시퀀스가 정상 수행되었겠지만 Now 버전에선 첫 단계에서 막힌 것입니다.

- **Supabase OAuth PKCE 흐름:** Supabase 공식 블로그와 개발자 가이드에서 PKCE 기반 OAuth 로그인 과정을 다룹니다 ([Supabase Auth: SSO,  Mobile, and Server-side support](https://supabase.com/blog/supabase-auth-sso-pkce#:~:text=Many%20developers%20today%20are%20using,over%20the%20next%20few%20weeks)) ([Supabase Auth: SSO,  Mobile, and Server-side support](https://supabase.com/blog/supabase-auth-sso-pkce#:~:text=Introducing%20PKCE)). 현재 코드가 구현한 `signInWithOAuth` + `exchangeCodeForSession` 패턴은 이러한 PKCE 보안 흐름을 구현한 것으로, Company/Now 모두 동일합니다. 즉, **로그인 자체는 Supabase 방식이 잘 구현**되어 있었으며, **로그아웃만 NextAuth 호출을 잔존**시킨 것이 오류 원인입니다. Supabase 측 문서에서도 OAuth 로그인을 처리할 땐 redirect URL을 허용 목록에 추가하고, 클라이언트에서 받은 `code`를 서버에서 교환(exchange)해야 함을 강조하고 있습니다 ([company.md](file://file-Wd762EAu7Zh6M5MpSFaNou#:~:text=61%20,redirectTo%3A%20redirectUrl)) ([now.md](file://file-ChJ98kCpFF6wjnM93GhfoB#:~:text=75%20,%21data.session%29)). Now 버전의 `AuthService.handleCallback` 구현이 바로 그것을 수행하고 있었으므로 로그인 부분은 문제가 없습니다.

- **유사 사례 블로그 (Velog):** NextAuth 사용 중 배포 환경에서 `/api/auth/csrf` 404로 로그아웃이 안 되는 문제를 다룬 포스트 ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=%EA%B0%9C%EB%B0%9C%20%EB%B2%84%EC%A0%84%EC%97%90%EC%84%9C%EB%8A%94%20%EC%9E%98%20%EB%90%98%EB%8A%94%20%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83%2C,%EC%BD%98%EC%86%94%EC%97%90%20%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%20%EA%B8%B0%EB%A1%9D%EC%9D%B4%20%EB%90%98%EA%B3%A0%20%EC%9E%88%EB%8B%A4)) ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=%EA%B2%B0%EA%B5%AD%20,%EC%97%90%EB%9F%AC%EA%B0%80%20%EB%B0%9C%EC%83%9D%ED%95%9C%EB%8B%A4))가 있습니다. 해당 사례에서는 **App Router 외부에 잘못 만든 `api/` 폴더** 때문에 NextAuth 라우트가 충돌난 것이 원인이었고, 이를 삭제하여 해결했습니다 ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=Image)). 우리 프로젝트의 맥락은 다르지만 **증상과 해결 방향이 유사**합니다. 핵심은 NextAuth 경로가 제대로 인식되지 않으면 CSRF 토큰이 “실종”되어 로그아웃/소셜 로그인에 문제가 생긴다는 점이며 ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=%EA%B7%B8%EB%9E%98%EB%8F%84%20%EB%8B%A4%ED%96%89%EC%9D%B8%20%EA%B2%83%EC%9D%80%20%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83%EC%9D%84%20%ED%96%88%EC%9D%84,%EC%BD%98%EC%86%94%EC%97%90%20%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%20%EA%B8%B0%EB%A1%9D%EC%9D%B4%20%EB%90%98%EA%B3%A0%20%EC%9E%88%EB%8B%A4)) ([배포하면 나타나는 next-auth 에러](https://velog.io/@s0zzang/%EB%B0%B0%ED%8F%AC%ED%95%98%EB%A9%B4-%EB%82%98%ED%83%80%EB%82%98%EB%8A%94-next-auth-%EC%97%90%EB%9F%AC#:~:text=signIn%20%ED%95%A8%EC%88%98%20%EB%82%B4%20CSRF%20signOut,%ED%95%A8%EC%88%98%20%EB%82%B4%20CSRF%20ImageImage)), 해결을 위해 NextAuth 라우트 정합성을 맞추거나 NextAuth를 사용하지 않도록 해야 한다는 것입니다. 우리는 후자를 선택하여 Supabase 단일 경로로 정리하기로 했습니다.

- **Dev.to 튜토리얼:** Next.js 13에서 Supabase와 Google OAuth를 통합하는 방법을 소개한 글 ([How to add Google oAuth in Nextjs with Supabase Auth | Login with Google - DEV Community](https://dev.to/thatanjan/how-to-add-google-oauth-in-nextjs-with-supabase-auth-login-with-google-2fcb#:~:text=,This%20is%20the%20redirect%20uri)) ([company.md](file://file-Wd762EAu7Zh6M5MpSFaNou#:~:text=65%20,))은, **서버 액션을 통한 `signInWithGoogle` 구현과 `/auth/callback` 처리**를 다루고 있습니다. 현재 프로젝트의 Company/Now 코드와 거의 동일한 접근을 취하고 있어 참고했습니다. 이 튜토리얼에 따르면, 클라이언트에서 서버 액션을 호출해 Supabase OAuth 로그인을 시작하고(`signInWithOAuth`), Supabase로부터 받은 redirect URL로 보낸 뒤, 콜백에서 코드를 받아 세션을 교환하는 흐름이 권장됩니다. 우리 코드도 `login/actions.ts`와 `useAuthCallback` 훅으로 이러한 흐름을 구현했고 ([company.md](file://file-Wd762EAu7Zh6M5MpSFaNou#:~:text=55%20,origin%7D%2Fauth%2Fcallback%60%2064)) ([now.md](file://file-ChJ98kCpFF6wjnM93GhfoB#:~:text=76%20,error%3A%20error%3F.message%2C%20status)), 잘 동작하고 있었습니다. 따라서 **로그아웃 또한 Supabase 권장 방식**(클라이언트에서 `supabase.auth.signOut()` 수행 후 애플리케이션 상태 정리)으로 통일하는 것이 합리적입니다.

- **Auth.js 이슈 트래커:** Auth.js (NextAuth v5) 관련 이슈에서도 App Router 사용 시 **`[...nextauth]` 라우트 설정 누락으로 인한 404**가 빈번히 언급됩니다 ([Is there a way to make NextAuth use the /src/app directory](https://stackoverflow.com/questions/78101488/is-there-a-way-to-make-nextauth-use-the-src-app-directory#:~:text=directory%20stackoverflow,exports%20GET%20and%20POST%20functions)). NextAuth 유지 시 이번 Tasklist의 3번처럼 route handler를 작성해야 함이 강조되고 있습니다. 하지만 Auth.js v5에서는 Supabase와의 직접적인 통합보다는 **Auth Helpers를 사용한 Supabase Auth 직접 구현**이 더 일반적입니다. Supabase Auth Helpers (Next.js용) 최신 버전이 PKCE를 공식 지원하기 때문에, 이 프로젝트처럼 Supabase 자체로 OAuth를 처리하는 쪽이 구현 난이도가 낮고, 이번 수정 역시 그 방향을 따릅니다 ([Supabase Auth: SSO,  Mobile, and Server-side support](https://supabase.com/blog/supabase-auth-sso-pkce#:~:text=Migrating%20to%20PKCE%20on%20the,client)).

以上의 분석과 단계별 수정 방안을 통해, **현재 버전의 Google OAuth 로그아웃 문제를 근본적으로 해결**할 수 있습니다. 수정 후에는 로그아웃 시 `/api/auth/csrf` 오류가 발생하지 않으며, 사용자 세션이 완전히 종료되고 예상대로 리다이렉트되는지 종합적으로 테스트해야 합니다. 이번 개선으로 인증 로직의 일관성과 신뢰성이 높아지고, Company 버전과 동일한 수준으로 안정화될 것입니다.  ([REST API | NextAuth.js](https://next-auth.js.org/getting-started/rest-api#post-apiauthsignout#:~:text=)) ([Is it possible to sign in a user with a REST API call when using Credentials provider? · nextauthjs next-auth · Discussion #6011 · GitHub](https://github.com/nextauthjs/next-auth/discussions/6011#:~:text=const%20signOut%20%3D%20async%20,%7D%29%2C%20%7D%29))