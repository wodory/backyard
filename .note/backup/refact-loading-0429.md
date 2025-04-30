## Tasklist: 통합 로딩 UI 구현 (Orbiting Circles)

**규칙:** `Tasklist Micro-Compose` 및 `Three-Layer-Standard` 적용

**목표:** 앱 초기화 시 표시되는 여러 로딩 인디케이터를 Magic UI의 `OrbitingCircles`를 사용한 단일 전역 로더로 통합하여 사용자 경험을 개선한다. 로딩 상태는 `useAppStore`에서 중앙 관리한다.

**선행 작업:**

*   **[Safety Net]** 현재 코드 상태에서 앱 로딩 및 아이디어맵 초기 표시 관련 테스트(통합/E2E) 확인.

**Phase 1: 전역 로딩 상태 및 UI 컴포넌트 준비**

1.  **Task 1.1:** `useAppStore` (`uiSlice`)에 전역 초기화 로딩 상태 추가
    *   **파일:** `src/store/uiSlice.ts`
    *   **지침:**
        *   `UiState` 인터페이스에 `isAppInitializing: boolean;` 상태와 `setAppInitializing: (initializing: boolean) => void;` 액션을 추가합니다.
        *   `createUiSlice` 함수 내부에 초기 상태 `isAppInitializing: true` (앱 시작 시 기본 로딩 상태) 와 액션 구현 `setAppInitializing: (initializing) => set({ isAppInitializing: initializing })` 을 추가합니다.
        *   **AppState 타입 업데이트:** `src/store/useAppStore.ts`의 `AppState` 타입 정의에 `UiState`가 포함되어 있는지 확인하고, 필요시 `isAppInitializing` 타입을 추가합니다.
    *   **규칙:** `[zustand-action-msw]` (액션 추가), `[store-pure-ui]`
    *   **예상 결과:** `useAppStore`에 앱 초기화 로딩 상태(`isAppInitializing`)와 이를 제어하는 액션(`setAppInitializing`)이 추가됨.
    *   **테스트 시나리오:** (단위 테스트) `useAppStore.getState().setAppInitializing(false)` 호출 후 `useAppStore.getState().isAppInitializing`이 `false`인지 확인.

2.  **Task 1.2:** 필요한 라이브러리 설치
    *   **파일:** 터미널
    *   **지침:** (이 부분은 이미 내가 끝냈음.)
    *   **예상 결과:** 필요한 의존성 설치 완료.

3.  **Task 1.3:** 전역 로딩 UI 컴포넌트 생성 (`AppLoader`)
    *   **파일:** `src/components/ui/AppLoader.tsx` (신규 생성)
    *   **지침:**
        *   Magic UI의 `OrbitingCircles` 컴포넌트 문서를 참조하여 컴포넌트를 구현합니다. ([https://magicui.design/docs/components/orbiting-circles](https://magicui.design/docs/components/orbiting-circles))
        *   `lucide-react`에서 `FileText`, `Paperclip`, `Folder`, `Network` 아이콘을 가져와 사용합니다. (아이콘은 자유롭게 선택 가능)
        *   로더가 화면 전체를 덮고 중앙에 표시되도록 스타일링합니다. (예: `fixed inset-0 flex items-center justify-center bg-background z-50`)
        *   내부 `OrbitingCircles` 컴포넌트의 크기, 색상, 속도 등은 적절히 조정합니다.
    *   **함수 시그니처:** `export function AppLoader(): JSX.Element;`
    *   **코드 예시:**
        ```typescript
        // src/components/ui/AppLoader.tsx
        'use client'; // Magic UI 컴포넌트는 클라이언트 컴포넌트일 수 있음

        import { FileText, Folder, Network, Paperclip } from "lucide-react";
        import OrbitingCircles from "@/components/magicui/orbiting-circles"; // 실제 경로 확인 필요
        import { cn } from "@/lib/utils";

        export function AppLoader() {
          return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]"> {/* z-index 높게 설정 */}
              <div className="relative flex h-[500px] w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg">
                {/* Inner Circles */}
                <OrbitingCircles
                  className="size-[60px] border-none bg-transparent"
                  duration={20}
                  delay={20}
                  radius={80}
                >
                  <FileText className="size-6 text-primary" />
                </OrbitingCircles>
                <OrbitingCircles
                  className="size-[60px] border-none bg-transparent"
                  duration={20}
                  delay={10}
                  radius={80}
                  reverse
                >
                  <Folder className="size-6 text-primary" />
                </OrbitingCircles>

                {/* Outer Circles */}
                <OrbitingCircles
                  className="size-[140px] border-none bg-transparent"
                  radius={190}
                  duration={20}
                  delay={0} // 즉시 시작하도록 delay 조정
                  reverse
                >
                  <Paperclip className="size-8 text-primary/80" />
                </OrbitingCircles>
                 <OrbitingCircles
                  className="size-[140px] border-none bg-transparent"
                  radius={190}
                  duration={20}
                  delay={5} // 약간의 딜레이
                >
                  <Network className="size-8 text-primary/80" />
                </OrbitingCircles>

                 {/* Central Icon - 앱 로고나 기본 아이콘 등 */}
                 {/* <YourAppLogoOrIcon className="size-10 text-primary" /> */}
                 <div className="text-xl font-semibold text-primary">Loading Backyard...</div>
              </div>
            </div>
          );
        }
        ```
        *   **참고:** 위 예시의 `OrbitingCircles` import 경로는 실제 설치 경로에 맞게 수정해야 합니다. Magic UI를 shadcn/ui 처럼 CLI로 추가했다면 `@/components/ui/orbiting-circles` 일 수 있습니다.
    *   **예상 결과:** 재사용 가능한 전역 로딩 UI 컴포넌트 생성 완료.

4.  **Task 1.4:** `ClientLayout`에서 로더 조건부 렌더링
    *   **파일:** `src/components/layout/ClientLayout.tsx`
    *   **지침:**
        *   `useAppStore`에서 `isAppInitializing` 상태를 가져옵니다.
        *   `AppLoader` 컴포넌트를 import 합니다.
        *   `ClientLayout`의 JSX 반환 부분에서 `isAppInitializing` 상태에 따라 조건부 렌더링을 추가합니다.
            *   `isAppInitializing`이 `true`이면 `<AppLoader />`를 렌더링합니다.
            *   `isAppInitializing`이 `false`이면 기존의 `{children}` 및 `<Toaster />` 등을 렌더링합니다.
    *   **코드 예시:**
        ```typescript
        // src/components/layout/ClientLayout.tsx
        'use client';

        import { ReactNode, useEffect } from 'react';
        import { Toaster } from "sonner";
        import { useAuth } from '@/hooks/useAuth';
        import createLogger from '@/lib/logger';
        import { useAuthStore, selectUserId } from '@/store/useAuthStore';
        import { useAppStore } from '@/store/useAppStore';
        import { AppLoader } from '@/components/ui/AppLoader'; // AppLoader import

        const logger = createLogger('ClientLayout');

        export function ClientLayout({ children }: { children: ReactNode }) {
          const { user, isLoading: isAuthLoading } = useAuth();
          const userId = useAuthStore(selectUserId);
          const fetchProjects = useAppStore(state => state.fetchProjects);
          const projectsLoaded = useAppStore(state => state.projects.length > 0);
          const isAppInitializing = useAppStore(state => state.isAppInitializing); // 로딩 상태 가져오기
          const setAppInitializing = useAppStore(state => state.setAppInitializing); // 로딩 액션 가져오기

          useEffect(() => {
            // ... (기존 useEffect 로직) ...

            // 로딩 시작/종료 로직 (Task 2.1에서 구체화)

          }, [userId, isAuthLoading, projectsLoaded, fetchProjects, setAppInitializing]);

          // **** 조건부 렌더링 추가 ****
          if (isAppInitializing) {
            return <AppLoader />; // 로딩 중이면 로더만 표시
          }

          return (
            <main> {/* 로딩 완료 후 앱 콘텐츠 렌더링 */}
              {children}
              <Toaster />
              {/* DB Init 등 다른 요소 */}
            </main>
          );
        }
        ```
    *   **규칙:** `[layer-separation]` (UI 컴포넌트가 상태에 따라 렌더링 결정)
    *   **예상 결과:** 앱 초기 로드 시 `isAppInitializing`이 `true`이므로 `AppLoader`가 표시되고, `false`로 변경되면 앱 콘텐츠가 표시됨.
    *   **테스트 시나리오:**
        1.  앱을 로드합니다.
        2.  `OrbitingCircles` 로더가 먼저 표시되는지 확인합니다. (아직 로딩 종료 로직이 없으므로 계속 표시될 수 있음)

**Phase 2: 로딩 상태 트리거 로직 통합**

1.  **Task 2.1:** `ClientLayout`에서 초기 데이터 로딩 시 `isAppInitializing` 상태 제어
    *   **파일:** `src/components/layout/ClientLayout.tsx`
    *   **지침:**
        *   Task 1.4에서 수정한 `useEffect` 훅을 다시 수정합니다.
        *   **훅 시작 시** `setAppInitializing(true)`를 호출하여 로딩 상태를 시작합니다 (초기 상태가 `true`이므로 생략 가능하나 명시적으로 추가).
        *   **인증 확인 및 필수 데이터 로딩:** `userId` 확인 후, `fetchProjects`와 `useIdeaMapSettings` (만약 ClientLayout에서 호출한다면) 등 **앱 초기화에 필수적인 비동기 작업**들을 `Promise.all` 등을 사용하여 병렬로 실행합니다.
        *   모든 필수 비동기 작업이 **성공적으로 완료된 후** (`.then()` 또는 `await Promise.all(...)` 이후) `setAppInitializing(false)`를 호출하여 로딩 상태를 종료합니다.
        *   오류 발생 시 (`.catch()` 또는 `try...catch`) 에도 `setAppInitializing(false)`를 호출하여 로더가 무한히 표시되는 것을 방지합니다.
    *   **코드 예시:**
        ```typescript
        // src/components/layout/ClientLayout.tsx
        useEffect(() => {
            let isMounted = true; // 컴포넌트 언마운트 시 상태 업데이트 방지 플래그
            const initializeApp = async () => {
                // 로딩 시작 (초기 상태가 true이므로 불필요할 수 있음)
                if(isMounted) useAppStore.getState().setAppInitializing(true);

                try {
                    // 인증 완료 및 사용자 확인 대기
                    // useAuth 훅은 내부적으로 로딩 상태를 관리하므로,
                    // isAuthLoading이 false가 되고 user가 존재할 때까지 기다리는 효과 필요.
                    // 이 useEffect는 isAuthLoading, user가 변경될 때마다 실행됨.
                    if (!isAuthLoading) {
                        if (user && userId) {
                            logger.info(`[ClientLayout] User authenticated (ID: ${userId}). Starting initial data fetch...`);

                            // 필수 초기 데이터 병렬 로드 (프로젝트, 설정 등)
                            await Promise.all([
                                // 프로젝트 로드 (이미 로드되지 않았다면)
                                (async () => {
                                    if (!projectsLoaded) {
                                        logger.debug('[ClientLayout] Fetching projects...');
                                        await fetchProjects(); // fetchProjects는 내부적으로 setActiveProject 호출 가정
                                    } else {
                                         logger.debug('[ClientLayout] Projects already loaded.');
                                         // activeProjectId 유효성 검사 및 설정 (중복될 수 있으나 안전 장치)
                                         const currentActiveId = useAppStore.getState().activeProjectId;
                                         const projects = useAppStore.getState().projects;
                                         if (currentActiveId && !projects.some(p => p.id === currentActiveId)) {
                                             useAppStore.getState().setActiveProject(projects.length > 0 ? projects[0].id : null);
                                         } else if (!currentActiveId && projects.length > 0) {
                                             useAppStore.getState().setActiveProject(projects[0].id);
                                         }
                                    }
                                })(),
                                // 설정 로드 (useIdeaMapSettings 훅은 보통 자체적으로 호출되지만,
                                // 여기서 명시적으로 완료를 기다려야 한다면 로직 추가 필요)
                                // 예: settingsQuery.refetch() 또는 settingsQuery.isSuccess 기다리기
                                // 여기서는 useIdeaMapSettings 훅이 자동으로 로드된다고 가정
                                new Promise(resolve => setTimeout(resolve, 0)) // 임시: 설정 로드 시뮬레이션
                            ]);

                            logger.info('[ClientLayout] Initial data fetch completed.');

                        } else {
                            logger.info('[ClientLayout] User not authenticated. Skipping initial data fetch.');
                            // 비로그인 상태 처리 (필요시)
                        }

                        // 모든 초기화 완료 후 로딩 종료
                        if (isMounted) {
                            useAppStore.getState().setAppInitializing(false);
                            logger.info('[ClientLayout] App initialization finished.');
                        }
                    } else {
                         logger.debug('[ClientLayout] Authentication check in progress...');
                    }

                } catch (error) {
                    logger.error('[ClientLayout] Error during app initialization:', error);
                    if (isMounted) {
                        useAppStore.getState().setAppInitializing(false); // 오류 시에도 로딩 종료
                        // 에러 상태 설정 등 추가 처리 가능
                    }
                }
            };

            initializeApp();

            return () => {
                isMounted = false; // 언마운트 시 플래그 설정
            };
        // 의존성 배열: 인증 상태, 사용자 ID, 프로젝트 로드 상태, 관련 액션
        }, [userId, isAuthLoading, user, projectsLoaded, fetchProjects]); // setActiveProject 등 직접 호출하지 않으면 의존성 제거 가능
        ```
    *   **규칙:** `[layer-separation]`
    *   **예상 결과:** 앱 로드 시 인증 확인 후 프로젝트/설정 데이터 로딩이 완료될 때까지 전역 로더가 표시되고, 완료되면 로더가 사라짐.
    *   **테스트 시나리오:**
        1.  앱을 로드합니다.
        2.  `AppLoader`가 표시되고, Network 탭에서 `/api/projects`, `/api/settings` 등의 초기 API 호출이 발생하는 것을 확인합니다.
        3.  모든 초기 API 호출이 성공적으로 완료되면 `AppLoader`가 사라지고 앱의 메인 콘텐츠(예: `DashboardLayout`)가 표시되는지 확인합니다.
        4.  Zustand DevTools에서 `isAppInitializing` 상태가 `true`에서 `false`로 변경되는 것을 확인합니다.

**Phase 3: 기존 로딩 UI 제거 및 정리**

1.  **Task 3.1:** `IdeaMap.tsx` 내부 로딩 UI 제거
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx`
    *   **지침:** `IdeaMap` 컴포넌트 내부에서 `isLoading` 상태를 확인하여 로딩 인디케이터(예: 스피너, 목업 카드 등)를 표시하는 JSX 코드를 **제거**합니다. `IdeaMap`은 이제 데이터가 준비된 후에 렌더링되거나, 렌더링되더라도 상위의 전역 로더에 의해 가려지므로 자체 로더가 필요 없습니다.
    *   **코드 예시 (제거 대상):**
        ```typescript
        // src/components/ideamap/components/IdeaMap.tsx 내부 (제거할 부분 예시)
        // if (isLoading) { // <--- 이 블록 전체 또는 내부 로딩 UI 제거
        //   return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>;
        // }
        ```
    *   **규칙:** `[layer-separation]` (UI 컴포넌트는 데이터 로딩 상태 표시에 직접 관여하지 않음)
    *   **예상 결과:** `IdeaMap` 컴포넌트에서 자체 로딩 UI가 사라짐. 앱 로딩은 전역 `AppLoader`가 전담.
    *   **테스트 시나리오:** 앱 로드 시 `IdeaMap` 컴포넌트의 로딩 UI가 더 이상 보이지 않고, 오직 `AppLoader`만 표시되다가 콘텐츠가 나타나는지 확인합니다.

2.  **Task 3.2:** `useIdeaMapData` 훅 로딩 상태 처리 검토 (선택적)
    *   **파일:** `src/hooks/useIdeaMapData.ts`
    *   **지침:** 이 훅이 반환하는 `isLoading` 상태가 여전히 필요한지 검토합니다. 전역 `isAppInitializing`으로 로딩을 처리하므로, 이 훅 자체의 `isLoading` 상태가 UI에 직접적인 영향을 주지 않는다면 반환 값에서 제거하거나 내부적으로만 사용하도록 변경할 수 있습니다. (단, `IdeaMap` 내부에서 데이터 로딩 중 빈 캔버스를 표시하는 등의 처리를 위해 유지할 수도 있음).
    *   **예상 결과:** 코드 복잡도 감소 (만약 제거한다면).

**Phase 4: 최종 테스트 및 검증**

1.  **Task 4.1:** 통합 로딩 경험 테스트
    *   **파일:** 브라우저
    *   **지침:** 앱을 여러 번 새로고침하고, 다양한 네트워크 환경(개발자 도구 Network 탭에서 속도 조절)에서 로딩 과정을 관찰합니다. `AppLoader`가 앱 초기화 완료 시점까지 일관되게 표시되고, 이후 콘텐츠로 부드럽게 전환되는지 확인합니다. 중간에 다른 로더가 깜빡이거나 나타나지 않는지 확인합니다.
    *   **예상 결과:** 사용자 경험이 개선되고 로딩 상태 전환이 자연스러워짐.

2.  **Task 4.2:** [Safety Net] 기존 테스트 재실행
    *   **파일:** 해당 테스트 파일
    *   **지침:** 모든 변경 완료 후, 기존 통합/E2E 테스트를 실행하여 기능 회귀가 없는지 최종 확인합니다. 로딩 상태 변경으로 인해 영향을 받는 테스트가 있다면 수정합니다.
    *   **예상 결과:** 모든 테스트 통과.
