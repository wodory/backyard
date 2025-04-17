**목표:** `/auth/error` 페이지에서 `useSearchParams` 사용으로 인한 빌드 오류 해결

**대상 파일:**

1.  `src/app/auth/error/page.tsx` (수정 필요)
2.  (신규 생성) `src/components/auth/AuthErrorDisplay.tsx` (가칭, 또는 다른 적절한 이름)

---

**Tasklist:**

1.  **클라이언트 컴포넌트 생성:**
    *   **작업:** `src/components/auth/` 디렉토리(또는 적절한 위치)에 `AuthErrorDisplay.tsx` (또는 유사한 이름) 파일을 새로 생성합니다.
    *   **내용:** 파일 최상단에 `'use client';` 지시문을 추가하여 클라이언트 컴포넌트로 만듭니다.

2.  **`useSearchParams` 로직 이동:**
    *   **작업:** 기존 `src/app/auth/error/page.tsx` 파일에서 다음 로직들을 **새로 만든 `AuthErrorDisplay.tsx` 컴포넌트 안으로 이동**시킵니다.
        *   `import { useSearchParams } from 'next/navigation'`
        *   `import { useEffect, useState } from 'react'`
        *   `const searchParams = useSearchParams()` 호출 부분
        *   `useState`를 사용하여 `error`와 `description` 상태를 관리하는 부분
        *   `useEffect`를 사용하여 `searchParams`에서 오류 정보를 읽어와 상태를 업데이트하는 부분
        *   오류 메시지를 정의하는 `ERROR_MESSAGES` 객체 (또는 별도 파일로 분리 후 import)
    *   **목표:** `AuthErrorDisplay.tsx` 컴포넌트가 URL 파라미터를 읽고 해당 오류 메시지를 결정하도록 합니다.

3.  **오류 표시 UI 이동:**
    *   **작업:** `src/app/auth/error/page.tsx`에서 실제 오류 메시지(`ERROR_MESSAGES[error]`, `description`)를 표시하는 JSX 부분을 **`AuthErrorDisplay.tsx` 컴포넌트의 `return` 문 안으로 이동**시킵니다.
    *   **목표:** `AuthErrorDisplay` 컴포넌트가 파라미터 기반의 동적 콘텐츠 렌더링을 담당하도록 합니다. `Link` 컴포넌트 등 필요한 import도 함께 이동합니다.

4.  **기존 페이지 컴포넌트 수정 (`src/app/auth/error/page.tsx`):**
    *   **작업:**
        *   2, 3번 단계에서 이동시킨 `useSearchParams`, `useState`, `useEffect` 관련 코드와 오류 메시지 표시 JSX를 **삭제**합니다.
        *   파일 상단에서 `import { Suspense } from 'react'`를 추가합니다.
        *   새로 만든 `AuthErrorDisplay` 컴포넌트를 import 합니다.
        *   `return` 문 내부에서, 이전에 오류 메시지를 표시하던 자리에 `<Suspense>` 컴포넌트로 `AuthErrorDisplay` 컴포넌트를 감싸줍니다.
    *   **예시 구조:**
        ```tsx
        // src/app/auth/error/page.tsx
        import { Suspense } from 'react';
        import Link from 'next/link'; // Link는 페이지 구조상 필요할 수 있음
        import AuthErrorDisplay from '@/components/auth/AuthErrorDisplay'; // 경로는 실제 위치에 맞게 수정

        export default function AuthErrorPage() {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
              <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">인증 오류</h1>
                  {/* Suspense로 감싸기 */}
                  <Suspense fallback={<LoadingFallback />}>
                    <AuthErrorDisplay />
                  </Suspense>
                  {/* Link 버튼 등 정적 UI는 여기에 유지 가능 */}
                  {/* ... (로그인 페이지로 돌아가기 등 버튼) ... */}
                </div>
              </div>
            </div>
          );
        }

        // Suspense Fallback 컴포넌트 정의
        function LoadingFallback() {
          return <p className="text-gray-500">오류 정보 로딩 중...</p>;
        }
        ```

5.  **Suspense Fallback UI 정의:**
    *   **작업:** `AuthErrorPage` 컴포넌트 내 또는 별도 파일에 `Suspense`의 `fallback` prop으로 전달할 로딩 상태 UI(예: `LoadingFallback` 컴포넌트)를 간단하게 정의합니다. 이는 클라이언트에서 `AuthErrorDisplay` 컴포넌트가 렌더링될 때까지 잠시 표시됩니다.

6.  **(선택 사항) 타입 및 상수 분리:**
    *   **작업:** `ERROR_MESSAGES` 객체를 `src/lib/constants.ts` 또는 별도의 `src/config/authErrors.ts` 같은 파일로 분리하여 관리하는 것을 고려합니다.

7.  **로컬 빌드 확인:**
    *   **작업:** 수정을 완료한 후, 로컬 환경에서 `yarn build` 또는 `npm run build` 명령어를 실행하여 빌드가 성공적으로 완료되는지 확인합니다. 오류가 발생하지 않아야 합니다.

8.  **기능 확인:**
    *   **작업:** 로컬 개발 서버(`yarn dev` 또는 `npm run dev`)를 실행하고, 브라우저에서 `/auth/error?error=invalid_callback` 와 같이 직접 URL 파라미터를 추가하여 접속했을 때 해당 오류 메시지가 정상적으로 표시되는지 확인합니다.
