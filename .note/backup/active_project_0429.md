## Tasklist: 프로젝트 ID 관리 로직 중앙화 (최소 변경 버전)

**규칙:** `Tasklist Micro-Compose` 및 `Three-Layer-Standard` 적용

**목표:** `ClientLayout`에서 초기 프로젝트 로딩 및 `activeProjectId` 설정을 트리거하고, 다른 모듈은 `useAppStore`의 `activeProjectId` 상태를 참조하도록 변경하여 `onConnect` 등에서 `projectId` 누락 문제를 해결한다. UI 변경(로딩 상태 표시 등)은 최소화한다.

**선행 작업:**

*   **[Safety Net]** 현재 코드 상태에서 주요 사용자 시나리오(앱 로딩, 아이디어맵 표시, 카드/엣지 기본 인터랙션 등)를 커버하는 테스트(통합/E2E)가 준비되어 있는지 확인합니다.

**Phase 1: `ClientLayout`에서 프로젝트 로딩 트리거**

1.  **Task 1.1:** `ClientLayout.tsx`에서 `fetchProjects` 호출 로직 구현
    *   **파일:** `src/components/layout/ClientLayout.tsx`
    *   **지침:**
        *   `useAppStore`에서 `fetchProjects` 액션과 `projects` 상태를 가져옵니다. (선택자 `selectProjects` 사용 또는 `state => state.projects`)
        *   `useAuth` 훅 또는 `useAuthStore`에서 `userId`와 `isAuthLoading` 상태를 가져옵니다.
        *   `useEffect` 훅 내부 로직을 다음과 같이 수정/추가합니다:
            *   의존성 배열에 `userId`, `isAuthLoading`, `projects` (또는 `projects.length`), `fetchProjects` 를 포함합니다.
            *   `isAuthLoading`이 `false`이고 `userId`가 존재하며, **아직 프로젝트가 로드되지 않았을 때 (`projects.length === 0`)** 다음을 실행합니다:
                *   `logger.info` 또는 `console.log`로 프로젝트 로딩 시작을 기록합니다.
                *   `fetchProjects()` 액션을 호출합니다.
                *   (로딩 상태 UI는 추가하지 않음)
    *   **함수 시그니처:** 기존 `ClientLayout` 컴포넌트 내부의 `useEffect` 수정.
    *   **코드 예시:**
        ```typescript
        // src/components/layout/ClientLayout.tsx
        'use client';

        import { ReactNode, useEffect } from 'react';
        import { Toaster } from "sonner";
        import { useAuth } from '@/hooks/useAuth';
        import createLogger from '@/lib/logger';
        import { useAuthStore, selectUserId } from '@/store/useAuthStore';
        import { useAppStore } from '@/store/useAppStore'; // AppStore 훅 import

        const logger = createLogger('ClientLayout');

        export function ClientLayout({ children }: { children: ReactNode }) {
          const { user, isLoading: isAuthLoading } = useAuth(); // useAuth 사용
          const userId = useAuthStore(selectUserId);

          // **** AppStore 상태 및 액션 가져오기 ****
          const fetchProjects = useAppStore(state => state.fetchProjects);
          const projects = useAppStore(state => state.projects); // 전체 프로젝트 배열 가져오기
          const projectsLoaded = projects.length > 0; // 로드 여부 판단
          // **** /AppStore 상태 및 액션 가져오기 ****

          useEffect(() => {
            // logger.info('ClientLayout useEffect triggered', { userId, isAuthLoading, projectsLoaded });

            // 인증 완료, 사용자 존재, 프로젝트 미로드 상태일 때 fetch 호출
            if (!isAuthLoading && userId && !projectsLoaded) {
              logger.info(`[ClientLayout] User authenticated (ID: ${userId}). Fetching projects...`);
              fetchProjects().then(() => { // fetchProjects 호출
                logger.info('[ClientLayout] Project fetch initiated (check AppStore logs for completion).');
              }).catch(err => {
                 logger.error('[ClientLayout] Initial project fetch trigger failed:', err);
              });
            } else if (projectsLoaded) {
                // logger.info('[ClientLayout] Projects already loaded or loading.');
            } else if (!isAuthLoading && !userId) {
                // logger.info('[ClientLayout] User not authenticated.');
            }

          }, [userId, isAuthLoading, projectsLoaded, fetchProjects]); // projects.length 대신 projectsLoaded 사용 가능

          return (
            <main>
              {children}
              <Toaster />
              {/* DB Init 등 다른 요소 */}
            </main>
          );
        }
        ```
    *   **규칙:** `[layer-separation]`
    *   **예상 결과:** `ClientLayout` 마운트 시 사용자 인증 후, 프로젝트 데이터가 없다면 `fetchProjects` 액션이 한 번 호출됨. `fetchProjects` 내부에서 `activeProjectId` 설정 로직이 실행됨.
    *   **테스트 시나리오:**
        1.  로그인 상태로 앱을 로드합니다.
        2.  브라우저 콘솔 로그에서 `[ClientLayout] ... Fetching projects...` 와 `[AppStore] fetchProjects 시작`, `[AppStore] fetchProjects 성공 ... activeProjectId:` 로그가 순서대로 출력되는지 확인합니다.
        3.  Network 탭에서 `/api/projects` GET 요청이 발생하는지 확인합니다.
        4.  Zustand DevTools에서 `activeProjectId`가 `null`에서 실제 ID로 변경되는지 확인합니다.

**Phase 2: 하위 모듈에서 `activeProjectId` 참조**

1.  **Task 2.1:** `useIdeaMapData.ts`에서 프로젝트 로딩 로직 제거
    *   **파일:** `src/hooks/useIdeaMapData.ts`
    *   **지침:**
        *   `useIdeaMapData` 훅 내부에서 `fetchProjects()`를 호출하는 `useEffect` 로직과 관련 상태(`didFetch` ref 등)를 **완전히 제거**합니다.
        *   `useAppStore`에서는 `activeProjectId` 상태만 읽어오도록 유지합니다.
        *   훅 초반이나 `useCards`/`useEdges` 호출 전에 `activeProjectId`가 유효한 값인지 확인하는 로직은 유지하거나 강화합니다 (예: `enabled: !!userId && !!activeProjectId`).
    *   **규칙:** `[layer-separation]`
    *   **예상 결과:** `useIdeaMapData`는 프로젝트 로딩 책임이 없어지고, `ClientLayout`에서 설정된 `activeProjectId`를 참조하여 카드/엣지 데이터만 로드함.
    *   **테스트 시나리오:**
        1.  앱을 로드하고 아이디어맵 페이지로 이동합니다.
        2.  콘솔 로그에서 `fetchProjects`가 `ClientLayout`에서 한 번만 호출되고, `useIdeaMapData`에서는 호출되지 않는지 확인합니다.
        3.  `useCards`, `useEdges` 훅이 유효한 `activeProjectId`를 사용하여 실행되는지 React Query DevTools에서 확인합니다. `projectId`가 `null`이면 쿼리가 `disabled` 상태여야 합니다.
        4.  아이디어맵에 해당 프로젝트의 카드와 엣지가 정상적으로 표시되는지 확인합니다.

2.  **Task 2.2:** 다른 모듈에서 `activeProjectId` 직접 fetch 로직 확인 및 제거 (해당되는 경우)
    *   **파일:** 프로젝트 전체 검색
    *   **지침:** Task 1.1과 동일. `ClientLayout` 외 다른 곳에서 `fetchProjects`를 호출하는 불필요한 로직을 찾아 제거하고 `useAppStore`의 `activeProjectId`를 사용하도록 수정합니다.
    *   **규칙:** `[layer-separation]`
    *   **예상 결과:** 프로젝트 로딩 책임이 `ClientLayout`으로 중앙화됨.
    *   **테스트 시나리오:** 코드 검색 및 정적 분석으로 불필요한 호출이 없는지 확인.

**Phase 3: 최종 테스트 및 검증**

1.  **Task 3.1:** 엣지 생성/삭제 기능 재확인
    *   **파일:** 아이디어맵 페이지
    *   **지침:**
        *   앱 로드 후 아이디어맵에서 엣지를 생성해 봅니다.
        *   브라우저 콘솔에서 `[onConnect DEBUG] activeProjectId inside handler:` 로그에 **유효한 프로젝트 ID**가 찍히는지 확인합니다.
        *   `[IdeaMap][WARN] 엣지 생성에 필요한 정보 부족: {..., hasProjectId: true}` 와 같이 `hasProjectId`가 `true`로 나오는지 확인합니다.
        *   Network 탭에서 `/api/edges` POST 요청이 500 에러 없이 201 응답을 받는지 확인합니다.
        *   DB에 엣지가 정상적으로 생성되는지 확인합니다.
        *   엣지 삭제 기능도 유사하게 테스트합니다.
    *   **예상 결과:** `activeProjectId`가 정상적으로 전달되어 엣지 생성/삭제 시 DB 연동이 성공적으로 이루어짐. `Maximum update depth exceeded` 오류도 해결되었을 가능성이 높음 (타이밍 문제가 해결되었으므로).

2.  **Task 3.2:** [Safety Net] 기존 통합/E2E 테스트 재실행
    *   **파일:** 해당 테스트 파일
    *   **지침:** 리팩토링 완료 후, 기존 테스트를 실행하여 기능 회귀가 없는지 최종 확인합니다.
    *   **예상 결과:** 모든 테스트 통과.

---

이 수정된 Tasklist는 UI 변경 없이 최소한의 코드로 `activeProjectId` 설정 시점을 `ClientLayout`으로 옮기고, 이를 통해 하위 모듈에서 안정적으로 `activeProjectId`를 사용하도록 하는 데 집중합니다.