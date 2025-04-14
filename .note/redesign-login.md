**로그인 페이지 수동 통합**

**목표:** 사용자가 `./note/landing-page`에 다운로드한 v0 로그인 컴포넌트 코드를 프로젝트에 통합하고, `src/components/login/loginForm.tsx` 파일을 생성하며, `app/login` 경로에서 이 컴포넌트를 렌더링하고, 기존 Supabase 서버 액션(`src/app/login/actions.ts`)과 연결합니다.

**사전 조건:**
*   사용자는 v0.dev 웹사이트에서 생성된 로그인 컴포넌트 관련 파일들(tsx, css 등)을 `./note/landing-page` 디렉토리 안에 다운로드했습니다.
*   `shadcn. ` CLI가 프로젝트에 설정되어 있습니다.
*   프로젝트 구조는 제공된 `landing-page` 이미지와 유사합니다.
*   Supabase 인증을 위한 서버 액션 (`src/app/login/actions.ts`)이 존재해야 합니다.

**Phase 1: v0 코드 분석, 파일 이동 및 종속성 설치**

*   **Task 1.1 (AI 작업): 다운로드된 파일 목록 확인**
    *   **Action:** `./note/landing-page` 디렉토리 내에 있는 **모든 `.tsx` 파일** 목록을 확인하고 보고합니다.
    *   **Verification:** 사용자는 AI가 보고한 목록이 실제 다운로드한 `.tsx` 파일과 일치하는지 확인합니다.
    *   **Rules:** `[file-discovery]`
    *   **Expected Result:** v0 로그인 관련 컴포넌트 파일 후보 목록을 확보합니다.

*   **Task 1.2 (AI 작업): 메인 로그인 UI 컴포넌트 파일 식별**
    *   **Action:** Task 1.1에서 확인된 `.tsx` 파일들의 내용을 분석하여, 이메일/비밀번호 입력 필드, 로그인 버튼, Google 로그인 버튼 등 핵심 로그인 UI를 포함하는 **주요 컴포넌트 파일**이 어떤 것인지 식별하고 그 파일명을 보고합니다.
    *   **Verification:** 사용자는 AI가 식별한 파일이 실제 로그인 UI를 담고 있는 메인 파일인지 확인합니다.
    *   **Rules:** `[code-analysis]`, `[component-identification]`
    *   **Expected Result:** 통합할 메인 v0 컴포넌트 파일의 원본 파일명을 알 수 있습니다.

*   **Task 1.3 (AI 작업): 필요한 shadcn/ui 컴포넌트 및 아이콘 식별**
    *   **Action:** Task 1.2에서 식별된 **메인 컴포넌트 파일**의 코드를 분석하여, 해당 코드에서 사용된 **모든 shadcn/ui 컴포넌트** 목록(예: `Button`, `Input`, `Label`)과 **아이콘 라이브러리**(예: `lucide-react`) 및 아이콘 이름 목록을 정확히 식별하여 보고합니다.
    *   **Verification:** 사용자는 AI가 보고한 컴포넌트/아이콘 목록이 실제 코드 내용과 일치하는지 확인합니다.
    *   **Rules:** `[code-analysis]`, `[dependency-identification]`
    *   **Expected Result:** 프로젝트에 추가해야 할 shadcn/ui 컴포넌트 및 아이콘 목록이 명확해집니다.

*   **Task 1.4 (사용자 작업): 식별된 shadcn/ui 컴포넌트 설치**
    *   **사용자 지시:** AI Agent가 Task 1.3에서 보고한 각 shadcn/ui 컴포넌트 이름에 대해, 프로젝트 루트 디렉토리에서 `npx shadcn-ui@latest add <component-name>` 명령어를 실행하세요. 아이콘 라이브러리(예: `lucide-react`)가 이미 설치되어 있는지 확인하고, 없다면 `yarn add lucide-react` (또는 npm/pnpm 사용) 명령어로 설치하세요.
    *   **AI 검증 대기:** 사용자가 필요한 모든 컴포넌트 설치를 완료할 때까지 대기합니다.

*   **Task 1.5 (AI 작업): 컴포넌트 파일 복사 및 이름 변경**
    *   **Action:**
        1.  `src/components/login` 디렉토리가 없으면 생성합니다.
        2.  Task 1.2에서 식별된 메인 컴포넌트 파일을 `./note/landing-page` 디렉토리에서 `src/components/login/loginForm.tsx` 경로로 **복사**합니다.
    *   **Verification:** `src/components/login/loginForm.tsx` 파일이 성공적으로 생성되고, 그 내용이 원본 v0 컴포넌트 파일과 동일한지 확인합니다.
    *   **Rules:** `[file-structure]`, `[file-copying]`
    *   **Expected Result:** v0 로그인 컴포넌트 코드가 지정된 경로와 이름으로 프로젝트에 복사됩니다.

*   **Task 1.6 (AI 작업): 'use client' 및 내보내기(export) 확인/수정**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** 파일 내용을 확인하여 다음을 수행합니다.
        1.  파일 최상단에 `'use client';` 지시어가 없으면 추가합니다.
        2.  메인 컴포넌트 함수가 `export default function ...` 형태로 되어있는지 확인하고, 만약 함수 이름이 다르거나 `export default`가 없다면 `export default function LoginForm() { ... }` 형태로 수정합니다.
    *   **Verification:** 수정된 파일 내용을 확인합니다. `'use client'` 지시어와 `export default function LoginForm` 선언이 있는지 확인합니다.
    *   **Rules:** `[client-component]`, `[code-correction]`
    *   **Expected Result:** 컴포넌트가 클라이언트 컴포넌트로 명시되고 올바르게 내보내집니다.

*   **Task 1.7 (AI 작업): Import 경로 자동 수정**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** 컴포넌트 코드 내의 모든 shadcn/ui 컴포넌트 및 아이콘 라이브러리 import 경로를 프로젝트 표준 경로(예: `@/components/ui/button`, `lucide-react`)로 자동으로 수정합니다. React 등 기본 라이브러리 import도 확인합니다.
    *   **Verification:** 수정된 파일 내용을 확인합니다. 모든 import 경로가 올바른지, 타입 검사 시 import 관련 오류가 없는지 확인합니다.
    *   **Rules:** `[import-paths]`, `[code-correction]`
    *   **Expected Result:** `loginForm.tsx`가 프로젝트의 UI 컴포넌트를 올바르게 참조합니다.

**Phase 2: 로그인 페이지 라우트 생성 및 렌더링**

*   **Task 2.1 (사용자 작업): 로그인 라우트 디렉토리 및 페이지 파일 생성 확인**
    *   **사용자 지시:** `src/app/login` 디렉토리와 그 안에 `page.tsx` 파일이 존재하는지 확인하고, 없다면 생성하세요.
    *   **AI 검증 대기:** 사용자가 파일 생성을 완료할 때까지 대기합니다.

*   **Task 2.2 (AI 작업): 로그인 페이지에서 `LoginForm` 렌더링**
    *   **File:** `src/app/login/page.tsx`
    *   **Action:** 파일 내용을 다음 구조로 작성하거나 수정합니다. `LoginForm` 컴포넌트를 import하고 렌더링합니다.
        ```typescript
        'use client';

        import React from 'react';
        import LoginForm from '@/components/login/loginForm'; // Task 1.5에서 생성/수정한 컴포넌트

        export default function LoginPage() {
          return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4"> {/* 스타일링은 필요에 따라 조정 */}
              <LoginForm />
            </div>
          );
        }
        ```
    *   **Verification:** 개발 서버 실행 후 브라우저에서 `/login` 경로로 접근했을 때, v0 로그인 UI가 렌더링되는지 확인합니다. 브라우저 콘솔에 렌더링 오류가 없는지 확인합니다.
    *   **Rules:** `[file-creation]`, `[react-component-structure]`, `[client-component]`, `[react-rendering]`
    *   **Expected Result:** `/login` 페이지에 v0 로그인 UI가 표시됩니다.

**Phase 3: 기능 연결 (상태 관리 및 서버 액션 연동)**

*   **Task 3.1 (AI 작업): 필요한 훅 및 서버 액션 Import**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** 파일 상단에 다음 import 구문들을 추가하거나 필요에 따라 수정합니다.
        ```typescript
        import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
        import { login, signInWithGoogle } from '@/app/login/actions'; // 서버 액션 import
        import { useSearchParams } from 'next/navigation'; // 에러/메시지 표시 위해 추가
        // import { toast } from 'sonner'; // 필요시 활성화
        ```
    *   **Verification:** import 구문들이 올바르게 추가되었는지, 경로가 정확한지 확인합니다. 타입 검사 시 오류가 없는지 확인합니다.
    *   **Rules:** `[import-paths]`
    *   **Expected Result:** `LoginForm` 컴포넌트에서 상태 관리, 라우팅 훅, 서버 액션 사용 준비가 완료됩니다.

*   **Task 3.2 (AI 작업): 상태 변수 및 `useEffect` 추가**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** `LoginForm` 컴포넌트 함수 본문 상단에 이메일, 비밀번호, 로딩 상태, 오류/메시지 상태를 위한 `useState` 훅과 URL 파라미터 처리를 위한 `useEffect` 훅을 추가합니다.
        ```typescript
        export default function LoginForm() {
          const [email, setEmail] = useState('');
          const [password, setPassword] = useState('');
          const [isEmailPending, setIsEmailPending] = useState(false); // 이메일 로그인 로딩
          const [isGooglePending, setIsGooglePending] = useState(false); // Google 로그인 로딩
          const searchParams = useSearchParams();
          const [error, setError] = useState<string | null>(null);
          const [message, setMessage] = useState<string | null>(null);

          useEffect(() => {
            const errorParam = searchParams.get('error');
            const messageParam = searchParams.get('message');
            if (errorParam) setError(decodeURIComponent(errorParam));
            if (messageParam) setMessage(decodeURIComponent(messageParam));
          }, [searchParams]);

          // ... (컴포넌트의 나머지 로직 및 return 문) ...
        }
        ```
    *   **Verification:** `useState`, `useSearchParams`, `useEffect` 훅이 올바르게 추가되었는지 확인합니다.
    *   **Rules:** `[state-management]`, `[react-hooks]`
    *   **Expected Result:** 이메일, 비밀번호, 로딩, 오류/메시지 상태 변수가 생성됩니다.

*   **Task 3.3 (AI 작업): 입력 필드와 상태 연결**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** 컴포넌트의 JSX 내부에서 이메일과 비밀번호 `<input>` 요소 (또는 shadcn/ui `<Input>`)를 찾아 `value`와 `onChange` prop을 추가하여 Task 3.2에서 생성한 `email`, `password` 상태와 연결하고, 로딩 상태에 따라 `disabled` 속성을 추가합니다.
        ```jsx
        // 예시: 이메일 Input
        <Input
          id="email" /* 또는 v0 코드의 id */
          type="email"
          placeholder="m@example.com" /* 또는 v0 코드의 placeholder */
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isEmailPending || isGooglePending}
        />
        // 예시: 비밀번호 Input
        <Input
          id="password" /* 또는 v0 코드의 id */
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isEmailPending || isGooglePending}
        />
        ```
    *   **Verification:** `/login` 페이지에서 이메일/비밀번호 입력 시 입력 필드의 값이 변경되는지 확인합니다.
    *   **Rules:** `[event-handling]`, `[state-binding]`
    *   **Expected Result:** UI 입력 필드와 React 상태가 연결됩니다.

*   **Task 3.4 (AI 작업): 이메일 로그인 핸들러 구현 및 연결**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** `handleEmailLogin` 함수를 컴포넌트 내부에 구현하고, 이메일/비밀번호 로그인 `<form>` 요소에 `onSubmit={handleEmailLogin}`을 추가하거나, 로그인 버튼의 `onClick` 핸들러로 연결합니다. 로딩 상태(`isEmailPending`)를 관리하고 `login` 서버 액션을 호출합니다.
        ```typescript
        const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          setError(null);
          setMessage(null);
          setIsEmailPending(true);
          const formData = new FormData();
          formData.append('email', email);
          formData.append('password', password);
          try {
            await login(formData);
          } catch (err) {
             console.error("Login action failed:", err);
             setError("로그인 처리 중 오류가 발생했습니다.");
          } finally {
             setIsEmailPending(false);
          }
        };

        // JSX 내에서:
        // <form onSubmit={handleEmailLogin}> ...
        //   <Button type="submit" disabled={isEmailPending || isGooglePending}>
        //     {isEmailPending ? '로그인 중...' : '로그인'}
        //   </Button>
        // </form>
        // 또는 로그인 버튼에 onClick={handleEmailLogin} 및 disabled 속성 추가
        ```
    *   **Verification:** 이메일/비밀번호 입력 후 로그인 버튼 클릭 시 `handleEmailLogin` 함수가 실행되고, 버튼이 비활성화되며, `login` 서버 액션이 호출되는지 확인합니다.
    *   **Rules:** `[event-handling]`, `[server-action-usage]`, `[async-handling]`
    *   **Expected Result:** 이메일 로그인이 서버 액션과 연결됩니다.

*   **Task 3.5 (AI 작업): Google 로그인 핸들러 구현 및 연결**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** `handleGoogleLogin` 함수를 컴포넌트 내부에 구현하고, Google 로그인 버튼에 `onClick={handleGoogleLogin}`을 추가합니다. 로딩 상태(`isGooglePending`)를 관리하고 `signInWithGoogle` 서버 액션을 호출합니다.
        ```typescript
         const handleGoogleLogin = async () => {
           setError(null);
           setMessage(null);
           setIsGooglePending(true);
           try {
              await signInWithGoogle();
           } catch (err) {
              console.error("Google Sign in action failed:", err);
              setError("Google 로그인 처리 중 오류가 발생했습니다.");
           } finally {
              // 페이지 이동이 발생하므로 일반적으로 false로 설정할 필요 없음
              // setIsGooglePending(false);
           }
         };

         // JSX 내에서:
         // <Button variant="outline" onClick={handleGoogleLogin} disabled={isEmailPending || isGooglePending}>
         //    <IconGoogle className="mr-2 h-4 w-4" /> {/* 아이콘 이름 확인 필요 */}
         //    {isGooglePending ? '진행 중...' : 'Google 계정으로 로그인'}
         // </Button>
        ```
    *   **Verification:** Google 로그인 버튼 클릭 시 `handleGoogleLogin` 함수가 실행되고, 버튼이 비활성화되며, `signInWithGoogle` 서버 액션이 호출되는지 확인합니다. Google OAuth 페이지로 리디렉션되는지 확인합니다.
    *   **Rules:** `[event-handling]`, `[server-action-usage]`, `[async-handling]`
    *   **Expected Result:** Google 로그인이 서버 액션과 연결됩니다.

*   **Task 3.6 (AI 작업): 오류 및 메시지 표시 UI 추가**
    *   **File:** `src/components/login/loginForm.tsx`
    *   **Action:** 컴포넌트 JSX 내 적절한 위치(예: 폼 상단)에 `error` 및 `message` 상태를 기반으로 조건부 렌더링을 사용하여 메시지를 표시하는 코드를 추가합니다.
        ```jsx
        return (
          <div className="w-full max-w-md"> {/* 예시 래퍼 */}
            {/* 오류 메시지 표시 */}
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            {/* 성공 메시지 표시 */}
            {message && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
                {message}
              </div>
            )}

            {/* 기존 v0 컴포넌트 JSX */}
            {/* ... (Input, Button 등) ... */}
          </div>
        );
        ```
    *   **Verification:** 서버 액션 실패 후 `/login` 페이지에 오류 메시지가 표시되는지, 또는 회원가입 후 성공 메시지가 표시되는지 확인합니다.
    *   **Rules:** `[conditional-rendering]`, `[error-display]`
    *   **Expected Result:** 서버 액션 결과에 따른 피드백 메시지가 사용자에게 표시됩니다.

**Phase 4: 최종 검증**

*   **Task 4.1 (AI 작업 + 사용자 작업): 개발 서버 재시작 및 페이지 접근**
    *   **Action (AI):** 개발 서버를 재시작하라는 메시지를 표시합니다.
    *   **Action (사용자):** 터미널에서 `yarn dev` (또는 해당 명령)를 실행하여 개발 서버를 재시작합니다.
    *   **Action (사용자):** 브라우저에서 `/login` 경로로 접근합니다.
    *   **Verification:** 페이지가 오류 없이 렌더링되고 v0 컴포넌트 UI가 올바르게 표시되는지 확인합니다. 브라우저 콘솔에 오류가 없는지 확인합니다.
    *   **Rules:** `[dev-server]`, `[rendering-verification]`
    *   **Expected Result:** 통합된 로그인 페이지가 성공적으로 로드됩니다.

*   **Task 4.2 (사용자 작업): 이메일/비밀번호 로그인 E2E 테스트**
    *   **Action:** 유효한 Supabase 사용자 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭합니다. 잘못된 정보도 입력하여 테스트합니다.
    *   **Verification:** 로그인 성공 시 홈페이지(`/`)로 리디렉션되는지 확인합니다. 잘못된 정보 입력 시 오류 메시지가 표시되는지 확인합니다. Supabase 관련 쿠키가 설정되는지 브라우저 개발자 도구에서 확인합니다.
    *   **Rules:** `[e2e-verification]`, `[auth-flow]`
    *   **Expected Result:** 이메일/비밀번호 로그인이 정상적으로 작동합니다.

*   **Task 4.3 (사용자 작업): Google 로그인 E2E 테스트**
    *   **Action:** "Google로 로그인" 버튼을 클릭하고 Google 인증 과정을 진행합니다.
    *   **Verification:** Google 로그인 성공 후 홈페이지(`/`)로 리디렉션되는지 확인합니다. Supabase 관련 쿠키가 설정되는지 확인합니다.
    *   **Rules:** `[e2e-verification]`, `[auth-flow]`, `[oauth]`
    *   **Expected Result:** Google OAuth 로그인이 정상적으로 작동합니다.

---