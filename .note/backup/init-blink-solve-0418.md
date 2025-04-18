**중요 제약 조건:**

1.  **문제 해결 집중:** 제시된 문제(UI 깜빡임) 해결에만 집중하고, 관련 없는 코드 개선이나 리팩토링은 수행하지 마세요.
2.  **기존 아키텍처 유지:** 현재 프로젝트는 Zustand 상태 관리와 액션 기반 커맨드 패턴, MSW 테스트 환경을 사용합니다. 이 구조를 반드시 유지해야 합니다. 제공된 `.cursor/.rules` 폴더의 규칙을 준수해 주세요.
3.  **단계별 작업 및 검증:** 각 Task는 작은 단위로 구성되어 있으며, 하나의 Task 완료 후에는 앱이 정상적으로 실행되고 버그가 없는 상태여야 합니다.

---

**Tasklist:**

**Task 1: 루트 페이지(`/`) 서버 측 인증 확인 및 리디렉션 구현**

*   **목표:** 앱의 메인 진입점인 루트 페이지(`/`) 접근 시, 서버 레벨에서 사용자의 인증 상태를 확인하고 인증되지 않은 경우 즉시 로그인 페이지(`/login`)로 리디렉션하여 보호된 UI(DashboardLayout)가 렌더링되는 것을 방지합니다.
*   **수정 대상 파일:** `src/app/page.tsx`
*   **수행 작업:**
    1.  `src/app/page.tsx` 파일을 엽니다.
    2.  `Home` 함수를 `async` 함수로 변경합니다.
        ```diff
        - export default function Home() {
        + export default async function Home() {
        ```
    3.  필요한 모듈을 import 합니다.
        ```javascript
        import { redirect } from 'next/navigation';
        import { auth } from '@/lib/auth-server'; // 서버 측 인증 헬퍼 import
        import { DashboardLayout } from '@/components/layout/DashboardLayout'; // 기존 import 유지
        ```
    4.  `Home` 함수 최상단에서 `auth()` 함수를 호출하여 세션 정보를 가져옵니다.
        ```javascript
        const session = await auth();
        ```
    5.  세션이 없는 경우(사용자가 인증되지 않은 경우), `/login` 페이지로 리디렉션하는 로직을 추가합니다.
        ```javascript
        if (!session) {
          redirect('/login');
        }
        ```
    6.  세션이 있는 경우에만 기존의 `DashboardLayout` 컴포넌트를 반환하도록 합니다.
        ```javascript
        return <DashboardLayout />;
        ```
    7.  최종 코드는 아래와 유사한 형태가 됩니다:
        ```typescript
        import { redirect } from 'next/navigation';
        import { auth } from '@/lib/auth-server';
        import { DashboardLayout } from '@/components/layout/DashboardLayout';

        export default async function Home() {
          const session = await auth(); // 세션 확인

          if (!session) { // 세션 없으면 로그인 페이지로 리디렉션
            redirect('/login');
          }

          // 세션 있으면 대시보드 렌더링
          return <DashboardLayout />;
        }
        ```
*   **변경 범위 제한:** 오직 `src/app/page.tsx` 파일만 수정합니다. 다른 파일(예: `ProtectedLayout`)은 변경하지 마세요.
*   **사용자 확인 사항:**
    1.  코드 변경 후 앱을 다시 빌드하고 실행합니다 (`yarn dev`).
    2.  로그아웃 상태인지 확인합니다 (브라우저 개발자 도구에서 Supabase 관련 쿠키 삭제 또는 시크릿 모드 사용).
    3.  브라우저에서 앱의 루트 주소 (`http://localhost:3000`)로 접속합니다.
    4.  **결과 확인:** 대시보드 UI가 전혀 보이지 않고 **즉시** 로그인 페이지 (`/login`)로 리디렉션되는지 확인합니다. 브라우저 개발자 도구의 네트워크 탭에서 루트 주소 요청 시 307 리디렉션 응답이 오는지 확인하면 더 좋습니다.

**Task 2: Zustand 스토어 Hydration 로직 정리**

*   **목표:** `useAppStore`의 `onRehydrateStorage` 콜백 함수 내에서 불필요하게 사용자 인증 상태를 확인하고 로그인 페이지로 리디렉션하는 로직을 제거하여, 하이드레이션 과정의 오류(`AuthSessionMissingError`)를 없애고 관심사를 분리합니다.
*   **수정 대상 파일:** `src/store/useAppStore.ts`
*   **수행 작업:**
    1.  `src/store/useAppStore.ts` 파일을 엽니다.
    2.  `persist` 미들웨어의 `onRehydrateStorage` 콜백 함수를 찾습니다. (대략 748 라인 근처)
    3.  해당 함수 내에서 `getCurrentUser()`를 호출하는 부분과, 그 결과를 바탕으로 `if (!currentUser)` 조건을 확인하여 `router.push('/login')`을 실행하는 블록을 찾습니다.
        ```typescript
        // 아래와 유사한 블록을 찾습니다 (정확한 코드는 다를 수 있음)
        try {
            const currentUser = await getCurrentUser(); // 이 호출과
            console.log('[인증 상태] 현재 사용자:', currentUser ? currentUser.email : '없음');
            set({ currentUser: currentUser });

            if (!currentUser) { // <<--- 이 조건 블록 전체를 제거합니다.
                console.log('[AppStore] 로그아웃 상태에서 로그인 페이지로 리다이렉션');
                // window.location.href = '/login'; // router.push 대신 직접 리디렉션 시도 -> beforeunload 경고 발생 가능성
                // router.push('/login');
                // alert('[AppStore] 로그인되지 않은 상태입니다. 로그인 페이지로 이동합니다.');
            }
        } catch (error) {
            console.error('[인증 상태] 사용자 정보 로드 실패:', error);
            set({ currentUser: null });
        }
        ```
    4.  위에서 설명한 `getCurrentUser()` 호출 및 `if (!currentUser)` 조건 블록 전체를 **삭제**합니다. `onRehydrateStorage` 함수 자체나 다른 로직은 그대로 둡니다.
*   **변경 범위 제한:** 오직 `src/store/useAppStore.ts` 파일의 `onRehydrateStorage` 함수 내부 로직만 수정합니다. 다른 상태나 액션은 변경하지 마세요.
*   **사용자 확인 사항:**
    1.  Task 1 완료 후 코드 변경을 적용하고 앱을 다시 빌드하고 실행합니다 (`yarn dev`).
    2.  로그아웃 상태에서 앱의 루트 주소 (`http://localhost:3000`)로 접속합니다.
    3.  **결과 확인:**
        *   앱은 Task 1에서 구현한 대로 여전히 즉시 로그인 페이지로 리디렉션되어야 합니다.
        *   브라우저 개발자 도구의 콘솔을 열어, 이전에 발생했던 `AuthSessionMissingError: Auth session missing!` 오류 메시지가 더 이상 나타나지 않는지 확인합니다.
        *   콘솔 로그에서 `[AppStore] 로그아웃 상태에서 로그인 페이지로 리다이렉션` 같은 메시지가 더 이상 출력되지 않는지 확인합니다.

---

**작업 완료 후:**

위 Task 1과 Task 2가 모두 성공적으로 완료되면, 로그아웃 상태에서 앱 접근 시 UI 깜빡임 현상이 해결되고 콘솔 오류도 사라져야 합니다. Agent는 각 Task 완료 후 코드가 컴파일되고 실행 가능한 상태인지 확인해 주세요.