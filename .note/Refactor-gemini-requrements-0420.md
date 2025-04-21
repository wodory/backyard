## **Backyard 애플리케이션 아키텍처 리팩토링 Tasklist**

**문서 버전:** 1.0
**최종 수정:** 2024-04-20
**목표:** 서버 상태 관리를 TanStack Query로, 클라이언트 UI 상태 관리를 Zustand(Slice 패턴)로 분리하고, 인증 로직을 `@supabase/ssr` 중심으로 통합하여 전체 아키텍처를 개선합니다.

**주의:** 각 Task는 순서대로 진행하며, 한 Task 완료 후 반드시 **검증 단계**를 거쳐 기능 회귀나 오류가 없는지 확인합니다. AI 에이전트에게는 한 번에 하나의 Task ID만 지시합니다.

---

### **0단계: 준비 및 환경 설정**

*   **Task ID:** `PREP-001`
    *   **작업:** TanStack Query 관련 라이브러리 설치.
    *   **지침:** 터미널에서 다음 명령어를 실행합니다:
        ```bash
        npm install @tanstack/react-query @tanstack/react-query-devtools
        # 또는 yarn add @tanstack/react-query @tanstack/react-query-devtools
        ```
    *   **예상 결과:** `package.json`에 `@tanstack/react-query`와 `@tanstack/react-query-devtools`가 추가됩니다.
    *   **규칙:** N/A

*   **Task ID:** `PREP-002`
    *   **작업:** TanStack Query `QueryClientProvider` 설정.
    *   **지침:**
        1.  `src/components/providers/QueryProvider.tsx` 파일을 새로 생성합니다.
        2.  아래 코드를 `QueryProvider.tsx`에 추가합니다. (React Query DevTools 포함)
            ```typescript
            // src/components/providers/QueryProvider.tsx
            'use client';

            import React, { useState } from 'react';
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
            import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

            export default function QueryProvider({ children }: { children: React.ReactNode }) {
              const [queryClient] = useState(() => new QueryClient({
                defaultOptions: {
                  queries: {
                    staleTime: 1000 * 60 * 5, // 5 minutes
                    gcTime: 1000 * 60 * 30, // 30 minutes
                    refetchOnWindowFocus: false, // 필요에 따라 조정
                    retry: 1, // 실패 시 1번 재시도
                  },
                },
              }));

              return (
                <QueryClientProvider client={queryClient}>
                  {children}
                  <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
              );
            }
            ```
        3.  `src/app/layout.tsx` 파일을 수정하여 `ClientLayout` 컴포넌트를 `QueryProvider`로 감쌉니다.
            *   Import 문 추가: `import QueryProvider from '@/components/providers/QueryProvider';`
            *   `ClientLayout` 래핑: `<QueryProvider><ClientLayout>...</ClientLayout></QueryProvider>`
    *   **예상 결과:** 애플리케이션 최상단에 `QueryClientProvider`가 적용되고, 개발 모드에서 React Query DevTools가 활성화됩니다.
    *   **규칙:** [react-provider-setup]
    *   **검증:** 앱 실행 후 React Query DevTools 아이콘이 화면에 표시되는지 확인합니다.

### **1단계: 인증 리팩토링**

*   **Task ID:** `AUTH-001`
    *   **작업:** `lib/auth.ts`에서 localStorage/sessionStorage 기반 토큰/verifier 관리 로직 제거.
    *   **지침:**
        1.  `src/lib/auth.ts` 파일을 엽니다.
        2.  `STORAGE_KEYS` 객체에서 `CODE_VERIFIER`, `ACCESS_TOKEN`, `REFRESH_TOKEN` 관련 키 정의를 제거하거나 주석 처리합니다. (`USER_ID`, `PROVIDER`는 필요시 유지).
        3.  `signIn`, `signUp`, `signOut`, `getCurrentUser`, `signInWithGoogle` 함수 등에서 `localStorage` 또는 `sessionStorage`를 사용하여 토큰이나 `code_verifier`를 직접 읽거나 쓰는 코드를 모두 제거합니다. Supabase 클라이언트 (`createClient()`)의 `auth` 메서드 호출만 남깁니다. (예: `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser`, `signInWithOAuth`).
        4.  `generateCodeVerifier`, `generateCodeChallenge` 함수는 `signInWithGoogle` 등에서 PKCE를 위해 내부적으로 필요할 수 있으므로 유지합니다. 하지만 이 함수들이 반환한 값을 직접 `sessionStorage`에 저장하는 로직은 제거합니다. Supabase 클라이언트가 `signInWithOAuth` 호출 시 자동으로 처리합니다.
    *   **예상 결과:** `lib/auth.ts`에서 수동 토큰/verifier 관리가 제거되고, 인증 관련 작업은 Supabase 클라이언트 호출에 의존하게 됩니다.
    *   **규칙:** [supabase-ssr-auth], [remove-manual-storage]
    *   **참고:** [Supabase JS Auth Helpers - SSR](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

*   **Task ID:** `AUTH-002`
    *   **작업:** `useAuth` 훅 생성 및 `onAuthStateChange` 구독 설정.
    *   **지침:**
        1.  `src/hooks/useAuth.ts` 파일을 새로 생성합니다.
        2.  아래 코드를 `useAuth.ts`에 추가합니다.
            ```typescript
            // src/hooks/useAuth.ts
            'use client';

            import { useState, useEffect } from 'react';
            import { User } from '@supabase/supabase-js';
            import { createClient } from '@/lib/supabase/client';
            import { useAuthStore } from '@/store/useAuthStore'; // 아래 단계에서 수정될 예정

            export function useAuth() {
              const { setProfile, setLoading, setError: setAuthError } = useAuthStore(); // 아래 단계에서 수정될 예정
              const [isInitialized, setIsInitialized] = useState(false);

              useEffect(() => {
                const supabase = createClient();
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                  (event, session) => {
                    console.log('Auth state changed:', event, session);
                    const user = session?.user ?? null;
                    setProfile(user); // useAuthStore 상태 업데이트
                    setLoading(false);
                    setAuthError(null);
                    setIsInitialized(true); // 초기화 완료 표시
                  }
                );

                // 초기 세션 확인 (선택적이지만 초기 로딩 개선에 도움)
                supabase.auth.getSession().then(({ data: { session } }) => {
                  if (!isInitialized) { // onAuthStateChange가 먼저 호출되지 않은 경우
                      const user = session?.user ?? null;
                      setProfile(user);
                      setLoading(false);
                      setIsInitialized(true);
                  }
                }).catch((error) => {
                  console.error("Error fetching initial session:", error);
                  setAuthError(error instanceof Error ? error : new Error('Failed to fetch initial session'));
                  setLoading(false);
                  setIsInitialized(true);
                });


                return () => {
                  subscription.unsubscribe();
                };
              }, [setProfile, setLoading, setAuthError, isInitialized]); // isInitialized 추가

              // useAuthStore에서 상태 직접 읽기 (훅 반환값에는 포함하지 않음)
              const isLoading = useAuthStore(state => state.isLoading);
              const user = useAuthStore(state => state.profile);
              const error = useAuthStore(state => state.error);

              return { isLoading: !isInitialized || isLoading, user, error }; // 초기화 중이거나 로딩 중일 때 isLoading true
            }
            ```
    *   **예상 결과:** `useAuth` 훅이 생성되어 Supabase 인증 상태 변화를 감지하고 `useAuthStore`를 업데이트할 준비가 됩니다.
    *   **규칙:** [react-hook], [supabase-auth-listener]

*   **Task ID:** `AUTH-003`
    *   **작업:** `useAuthStore` 리팩토링 (상태 및 액션 정리).
    *   **지침:**
        1.  `src/store/useAuthStore.ts` 파일을 엽니다.
        2.  `AuthState` 인터페이스를 수정하여 `accessToken`, `refreshToken`, `codeVerifier`를 제거하고 `profile: User | null;` 을 추가합니다. `provider`도 제거합니다 (필요시 `profile.app_metadata.provider` 사용).
        3.  초기 상태에서 `accessToken`, `refreshToken`, `codeVerifier`, `provider`를 제거하고 `profile: null`을 추가합니다.
        4.  액션 정의에서 `setTokens`, `setUser`, `setCodeVerifier`, `removeCodeVerifier`를 제거합니다.
        5.  `setProfile(profile: User | null)` 액션을 새로 정의합니다: `set({ profile })`.
        6.  `clearAuth` 액션을 수정하여 `profile: null, isLoading: false, error: null`만 설정하도록 합니다.
        7.  (Optional) `persist` 미들웨어 설정을 확인합니다. 프로필 정보는 세션에서 오므로, `persist`에서 `profile`은 제외하는 것이 좋습니다 (`partialize` 옵션 사용). UI 상태(`isLoading`, `error`)만 persist 하거나 아예 제거할 수도 있습니다.
            ```typescript
            // 예시: persist 설정 수정
            persist(
              (set) => ({
                // ... 상태 정의 ...
                setProfile: (profile) => set({ profile }), // profile은 persist되지 않음
                // ... 나머지 액션 ...
              }),
              {
                name: 'auth-ui-storage', // 스토리지 키 변경 권장
                storage: createJSONStorage(() => localStorage), // 또는 sessionStorage
                partialize: (state) => ({ // persist할 상태만 선택
                  isLoading: state.isLoading,
                  error: state.error,
                  // profile은 제외
                }),
              }
            )
            ```
    *   **예상 결과:** `useAuthStore`는 인증 관련 UI 상태(`isLoading`, `error`)와 사용자 프로필 정보 캐시(`profile`)만 관리하게 됩니다. 토큰 관련 상태와 액션은 제거됩니다.
    *   **규칙:** [zustand-slice-refactor], [remove-redundant-state]

*   **Task ID:** `AUTH-004`
    *   **작업:** `AuthContext` 및 `AuthProvider` 제거.
    *   **지침:**
        1.  `src/contexts/AuthContext.tsx` 파일을 삭제합니다.
        2.  `src/components/layout/ClientLayout.tsx` 파일에서 `AuthProvider` import 및 사용 부분을 제거합니다.
        3.  프로젝트 전체에서 `useAuthContext` 또는 `AuthContext`를 사용하던 부분을 찾아 `useAuth()` 훅 (AUTH-002에서 생성) 또는 `useAuthStore()` 훅으로 대체합니다. (주로 사용자 정보나 로딩 상태 접근 시)
            *   예: `const { user, isLoading } = useAuthContext()` -> `const { user, isLoading } = useAuth()` 또는 `const user = useAuthStore(state => state.profile)`
    *   **예상 결과:** `AuthContext`가 완전히 제거되고, 인증 상태 접근은 `useAuth` 또는 `useAuthStore`를 통해 이루어집니다.
    *   **규칙:** [remove-context-api], [use-custom-hook]

*   **Task ID:** `AUTH-005`
    *   **작업:** 로그인/콜백 관련 컴포넌트 및 라우트에서 인증 로직 호출 방식 수정.
    *   **지침:**
        1.  `src/app/login/page.tsx` (또는 관련 로그인 폼 컴포넌트):
            *   Google 로그인 버튼 클릭 핸들러에서 `lib/auth.ts`의 `signInWithGoogle()`을 직접 호출하도록 수정합니다. `actions.ts` 의존성 제거.
        2.  `src/app/login/actions.ts`:
            *   `signInWithGoogle` 액션을 제거합니다.
            *   `login`, `signup` 액션은 Server Actions으로 유지하되, 내부에서 `lib/supabase/server`의 `createClient()`를 사용하여 Supabase 클라이언트를 생성하고 `signInWithPassword`, `signUp`을 호출하도록 합니다.
        3.  `src/app/auth/callback/route.ts`: 변경 필요 없음 (Supabase `exchangeCodeForSession` 사용 확인).
        4.  `src/app/auth/error/page.tsx`: `useSearchParams`를 통해 오류 정보 표시 확인.
    *   **예상 결과:** 로그인 관련 컴포넌트가 API 라우트 대신 직접 인증 함수(클라이언트 측) 또는 Server Action(서버 측)을 호출하게 됩니다.
    *   **규칙:** [use-server-action], [direct-function-call]

*   **Task ID:** `AUTH-006` (1단계 최종 검증)
    *   **작업:** 1단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 확인합니다:
        1.  구글 로그인 및 이메일/비밀번호 로그인이 정상적으로 동작하는가?
        2.  로그아웃이 정상적으로 동작하는가?
        3.  로그인 후 페이지를 새로고침해도 로그인 상태가 유지되는가?
        4.  인증이 필요한 페이지 접근 시 로그인 페이지로 리디렉션 되는가? (예: `/cards` 페이지)
        5.  로그인 상태에서 로그인 페이지 접근 시 홈(/)으로 리디렉션 되는가? (`middleware.ts` 확인)
        6.  브라우저 개발자 도구 콘솔에 인증 관련 에러가 없는가?
        7.  (Optional) React DevTools에서 `useAuthStore` 상태가 예상대로 (`profile`, `isLoading`, `error` 위주) 표시되는가?
    *   **예상 결과:** 모든 인증 관련 기능이 이전과 동일하게 또는 더 안정적으로 동작합니다.

---

### **2단계: API 서비스 계층 및 TanStack Query 적용 (Card 조회)**

*   **Task ID:** `TQ-CARD-001`
    *   **작업:** API 서비스 디렉토리 및 Card 서비스 파일 생성.
    *   **지침:**
        1.  `src/services` 디렉토리를 생성합니다.
        2.  `src/services/cardService.ts` 파일을 생성합니다.
    *   **예상 결과:** `src/services/cardService.ts` 파일이 생성됩니다.
    *   **규칙:** [service-layer-pattern]

*   **Task ID:** `TQ-CARD-002`
    *   **작업:** `cardService.ts`에 카드 조회 함수 구현.
    *   **지침:**
        1.  `src/services/cardService.ts` 파일을 엽니다.
        2.  필요한 import 추가 (`prisma`, 관련 타입 등).
        3.  `fetchCards(params: { query?: string, tag?: string, userId?: string }): Promise<Card[]>` 함수 구현:
            *   내부에서 `prisma.card.findMany`를 호출하여 조건(query, tag, userId)에 맞는 카드 목록 조회 (기존 `/api/cards` GET 로직 참고).
            *   관련된 user, cardTags 정보 포함 (include).
            *   성공 시 카드 배열 반환, 실패 시 에러 throw.
        4.  `fetchCardById(id: string): Promise<Card | null>` 함수 구현:
            *   내부에서 `prisma.card.findUnique`를 호출하여 특정 ID의 카드 조회 (기존 `/api/cards/[id]` GET 로직 참고).
            *   관련된 user, cardTags 정보 포함.
            *   성공 시 카드 객체 또는 null 반환, 실패 시 에러 throw.
    *   **예상 결과:** `cardService.ts`에 카드 조회 로직이 구현됩니다.
    *   **규칙:** [service-layer-pattern], [prisma-orm]
    *   **참고:** Prisma Client API - [findMany](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany), [findUnique](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findunique)

*   **Task ID:** `TQ-CARD-003`
    *   **작업:** `useCards` TanStack Query 훅 생성.
    *   **지침:**
        1.  `src/hooks/queries/useCards.ts` 파일을 새로 생성합니다.
        2.  아래 코드를 추가합니다.
            ```typescript
            // src/hooks/queries/useCards.ts
            import { useQuery } from '@tanstack/react-query';
            import { fetchCards } from '@/services/cardService'; // 이전 Task에서 생성
            // import { Card } from '@/types/card'; // 카드 타입 import

            interface UseCardsParams {
              query?: string;
              tag?: string;
              userId?: string;
              // 필요에 따라 페이지네이션 파라미터 추가 가능
            }

            export function useCards(params: UseCardsParams = {}) {
              const queryKey = ['cards', params]; // 쿼리 키에 파라미터 포함

              return useQuery<Card[], Error>({ // 타입 명시
                queryKey: queryKey,
                queryFn: () => fetchCards(params),
                staleTime: 1000 * 60 * 1, // 1분 동안 fresh 상태 유지 (예시)
                // gcTime: 1000 * 60 * 5, // 5분 동안 비활성 시 캐시에서 제거 (기본값 활용 가능)
                // enabled: !!params.userId // userId가 있을 때만 실행 (예시)
              });
            }
            ```
    *   **예상 결과:** 카드 목록 조회를 위한 `useCards` 훅이 생성됩니다.
    *   **규칙:** [tanstack-query-hook], [query-key-strategy]
    *   **참고:** TanStack Query - [Queries](https://tanstack.com/query/latest/docs/react/guides/queries)

*   **Task ID:** `TQ-CARD-004`
    *   **작업:** `useCard` TanStack Query 훅 생성 (개별 카드 조회).
    *   **지침:**
        1.  `src/hooks/queries/useCard.ts` 파일을 새로 생성합니다.
        2.  아래 코드를 추가합니다.
            ```typescript
            // src/hooks/queries/useCard.ts
            import { useQuery } from '@tanstack/react-query';
            import { fetchCardById } from '@/services/cardService';
            // import { Card } from '@/types/card';

            export function useCard(cardId: string | null | undefined) {
              const queryKey = ['card', cardId];

              return useQuery<Card | null, Error>({ // Card 또는 null 반환 가능성 명시
                queryKey: queryKey,
                queryFn: () => cardId ? fetchCardById(cardId) : Promise.resolve(null), // ID 없으면 null 반환
                enabled: !!cardId, // cardId가 있을 때만 쿼리 실행
                staleTime: 1000 * 60 * 5, // 5분 (예시)
              });
            }
            ```
    *   **예상 결과:** 특정 카드 조회를 위한 `useCard` 훅이 생성됩니다.
    *   **규칙:** [tanstack-query-hook], [query-key-strategy]

*   **Task ID:** `TQ-CARD-005`
    *   **작업:** `CardList` 컴포넌트 리팩토링 (useCards 훅 사용).
    *   **지침:**
        1.  `src/components/cards/CardList.tsx` 파일을 엽니다.
        2.  기존 `useEffect`와 `useState`를 사용한 카드 데이터 fetching 로직을 제거합니다.
        3.  `useCards` 훅을 import하고 호출하여 `data: cards`, `isLoading`, `error`를 가져옵니다.
            *   `useSearchParams`를 사용하여 필요한 필터 파라미터를 `useCards`에 전달합니다.
        4.  컴포넌트 반환 부분에서 `isLoading`, `error`, `cards` 상태에 따라 조건부 렌더링을 수행합니다. (로딩 스피너, 에러 메시지, 카드 목록 표시)
        5.  더 이상 필요 없는 로컬 상태 (`loading` 등) 및 관련 로직을 제거합니다.
    *   **예상 결과:** `CardList` 컴포넌트가 TanStack Query를 통해 데이터를 관리하게 되며, 코드가 간결해집니다.
    *   **규칙:** [use-query-hook], [component-refactor]

*   **Task ID:** `TQ-CARD-006`
    *   **작업:** `CardPage` 컴포넌트 리팩토링 (useCard 훅 또는 서버 컴포넌트 데이터 Fetching).
    *   **지침:**
        1.  `src/app/cards/[id]/page.tsx` 파일을 엽니다.
        2.  **옵션 A (클라이언트 컴포넌트 유지):**
            *   `'use client'` 지시어 유지.
            *   기존 `getCard` 함수 및 `async` 서버 컴포넌트 로직 제거.
            *   `useParams` 훅을 사용하여 `cardId`를 가져옵니다.
            *   `useCard(cardId)` 훅을 호출하여 `data: card`, `isLoading`, `error`를 가져옵니다.
            *   컴포넌트 반환 부분에서 `isLoading`, `error`, `card` 상태에 따라 조건부 렌더링 (로딩, 에러, 카드 상세 정보).
        3.  **옵션 B (서버 컴포넌트로 전환 - 권장):**
            *   `'use client'` 지시어 제거.
            *   컴포넌트 함수를 `async`로 변경합니다.
            *   `params` prop을 통해 `cardId`를 받습니다.
            *   컴포넌트 내부에서 `cardService.fetchCardById(cardId)`를 직접 호출하여 `card` 데이터를 가져옵니다. (Try-catch로 에러 처리)
            *   `notFound()` 함수를 사용하여 카드가 없을 경우 404 페이지 표시.
            *   가져온 `card` 데이터를 사용하여 UI 렌더링. (`EditCardContent` 등 클라이언트 컴포넌트는 그대로 유지)
    *   **예상 결과:** `CardPage`가 TanStack Query 훅 또는 서버 컴포넌트 직접 호출 방식으로 데이터를 가져오도록 수정됩니다. 옵션 B가 더 효율적입니다.
    *   **규칙:** [use-query-hook] or [server-component-fetch], [component-refactor]

*   **Task ID:** `TQ-CARD-007`
    *   **작업:** Card 조회 관련 기존 API 라우트 제거.
    *   **지침:**
        1.  `src/app/api/cards/route.ts` 파일에서 `GET` 핸들러 함수를 제거합니다. (POST는 다음 단계에서 제거)
        2.  `src/app/api/cards/[id]/route.ts` 파일에서 `GET` 핸들러 함수를 제거합니다. (PUT/DELETE는 다음 단계에서 제거)
    *   **예상 결과:** Card 조회용 API 엔드포인트가 제거됩니다.
    *   **규칙:** [remove-api-route]

*   **Task ID:** `TQ-CARD-008` (2단계 최종 검증)
    *   **작업:** 2단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 확인합니다:
        1.  카드 목록 페이지(`/cards`)가 정상적으로 로드되고 카드들이 표시되는가?
        2.  카드 상세 페이지(`/cards/[id]`)가 정상적으로 로드되고 해당 카드의 상세 정보가 표시되는가?
        3.  페이지 로딩 시 로딩 상태 UI (스피너 등)가 잠시 표시되는가?
        4.  (테스트용) API 응답을 강제로 에러로 변경했을 때 에러 메시지가 UI에 표시되는가?
        5.  브라우저 개발자 도구 네트워크 탭에서 `/api/cards` 및 `/api/cards/[id]` GET 요청이 더 이상 발생하지 않는가? (옵션 B 선택 시)
        6.  React Query DevTools에서 `['cards']`, `['card', id]` 쿼리 상태가 'success'이고 캐시된 데이터가 올바른가?
    *   **예상 결과:** 카드 조회 기능이 TanStack Query를 통해 안정적으로 동작하며, 불필요한 API 라우트가 제거됩니다.

---

### **3단계: Card 뮤테이션 적용 (Server Actions 사용)**

*   **Task ID:** `TQ-MUT-001`
    *   **작업:** `cardService.ts`에 카드 생성/수정/삭제 함수 구현.
    *   **지침:**
        1.  `src/services/cardService.ts` 파일을 엽니다.
        2.  `createCard(data: CreateCardInput): Promise<Card>` 함수 구현 (prisma.card.create 호출).
        3.  `updateCard(id: string, data: UpdateCardInput): Promise<Card>` 함수 구현 (prisma.card.update 호출).
        4.  `deleteCard(id: string): Promise<void>` 함수 구현 (prisma.card.delete 호출).
        5.  각 함수는 성공 시 결과 반환, 실패 시 에러 throw.
    *   **예상 결과:** `cardService.ts`에 카드 CUD 로직이 구현됩니다.
    *   **규칙:** [service-layer-pattern], [prisma-orm]

*   **Task ID:** `TQ-MUT-002`
    *   **작업:** Card 관련 Server Actions 생성.
    *   **지침:**
        1.  `src/actions/cardActions.ts` 파일을 새로 생성합니다.
        2.  `'use server';` 지시어를 파일 상단에 추가합니다.
        3.  필요한 import 추가 (`cardService`, 타입, `revalidatePath` 등).
        4.  `createCardAction(formData: FormData): Promise<{ success: boolean, error?: string, data?: Card }>` 구현:
            *   `formData`에서 데이터 추출 및 유효성 검사 (Zod 사용 권장).
            *   `cardService.createCard` 호출 (try-catch 사용).
            *   `revalidatePath('/cards')` 호출하여 관련 페이지 캐시 무효화.
            *   결과 객체 반환.
        5.  `updateCardAction(id: string, formData: FormData): Promise<{ success: boolean, error?: string, data?: Card }>` 구현: 유사하게 구현, `revalidatePath('/cards')` 및 `revalidatePath(/cards/${id})` 호출.
        6.  `deleteCardAction(id: string): Promise<{ success: boolean, error?: string }>` 구현: 유사하게 구현, `revalidatePath('/cards')` 호출.
    *   **예상 결과:** 카드 CUD 작업을 수행하는 Server Actions 함수들이 생성됩니다.
    *   **규칙:** [use-server-action], [server-action-validation], [cache-revalidation]
    *   **참고:** [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

*   **Task ID:** `TQ-MUT-003`
    *   **작업:** `useCreateCard`, `useUpdateCard`, `useDeleteCard` 뮤테이션 훅 생성.
    *   **지침:**
        1.  `src/hooks/mutations/useCreateCard.ts` (및 update/delete용 파일) 생성.
        2.  `useMutation` 훅을 사용하여 각 뮤테이션 구현.
            *   `mutationFn`: 이전 Task에서 만든 Server Action 함수 (`cardActions.createCardAction` 등)를 사용합니다. Server Action 자체는 Promise를 반환하므로 직접 사용 가능합니다.
            *   `onSuccess`: `queryClient.invalidateQueries({ queryKey: ['cards'] })` 등을 호출하여 관련 쿼리 캐시 무효화. 삭제의 경우 `queryClient.removeQueries({ queryKey: ['card', cardId] })`도 호출.
            *   `onError`: 에러 처리 로직 (예: toast 메시지 표시).
        3.  (Optional) 낙관적 업데이트 로직 추가 (`onMutate`, `onError` 롤백).
    *   **예상 결과:** 카드 CUD 작업을 위한 TanStack Query 뮤테이션 훅들이 생성됩니다.
    *   **규칙:** [tanstack-query-mutation], [integrate-server-action]
    *   **참고:** TanStack Query - [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

*   **Task ID:** `TQ-MUT-004`
    *   **작업:** 관련 컴포넌트에서 뮤테이션 훅 사용하도록 리팩토링.
    *   **지침:**
        1.  `CreateCardModal`: 내부 폼 제출 핸들러에서 `useCreateCard().mutate(formData)` 호출하도록 수정. 로컬 로딩/에러 상태 제거.
        2.  `EditCardForm`/`EditCardModal`: 내부 폼 제출 핸들러에서 `useUpdateCard().mutate({ id: cardId, formData })` 호출하도록 수정.
        3.  `DeleteButton`: 삭제 확인 핸들러에서 `useDeleteCard().mutate(cardId)` 호출하도록 수정.
        4.  `CardList` (필요시): 관련 뮤테이션 훅 사용.
        5.  Server Action을 직접 호출하던 로직을 모두 뮤테이션 훅 호출로 변경합니다.
    *   **예상 결과:** 컴포넌트들이 TanStack Query 뮤테이션 훅을 통해 데이터 변경 작업을 수행하게 됩니다.
    *   **규칙:** [use-mutation-hook], [component-refactor]

*   **Task ID:** `TQ-MUT-005`
    *   **작업:** Card 생성/수정/삭제 관련 기존 API 라우트 제거.
    *   **지침:**
        1.  `src/app/api/cards/route.ts` 파일에서 `POST` 핸들러 함수를 제거합니다.
        2.  `src/app/api/cards/[id]/route.ts` 파일에서 `PUT`, `DELETE` 핸들러 함수를 제거합니다.
    *   **예상 결과:** Card CUD용 API 엔드포인트가 제거됩니다.
    *   **규칙:** [remove-api-route]

*   **Task ID:** `TQ-MUT-006` (3단계 최종 검증)
    *   **작업:** 3단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 확인합니다:
        1.  카드 생성 모달에서 카드 생성 시 뮤테이션 훅 -> Server Action -> 서비스 함수 흐름으로 동작하고, 성공 후 카드 목록이 자동으로 업데이트되는가?
        2.  카드 수정 폼/모달에서 카드 수정 시 위와 동일한 흐름으로 동작하고, 성공 후 목록 및 상세 정보가 업데이트되는가?
        3.  삭제 버튼 클릭 시 위와 동일한 흐름으로 동작하고, 성공 후 목록에서 카드가 제거되는가?
        4.  (Optional) 낙관적 업데이트 설정 시 UI가 즉시 반응하고, 네트워크 에러 시 롤백되는가?
        5.  브라우저 개발자 도구 네트워크 탭에서 `/api/cards...` POST/PUT/DELETE 요청 대신 Server Action 관련 요청 (주로 POST)이 발생하는가?
        6.  React Query DevTools에서 뮤테이션 상태 및 캐시 무효화/업데이트가 정상적으로 동작하는가?
    *   **예상 결과:** 카드 CRUD 기능이 TanStack Query 뮤테이션과 Server Actions를 통해 안정적으로 동작하며, 불필요한 API 라우트가 제거됩니다.

---

### **4단계: Tag 관리 리팩토링 (Server Actions 사용)**

*   **Task ID:** `TQ-TAG-001`
    *   **작업:** Tag 관련 서비스 함수 및 Server Actions 생성.
    *   **지침:** 3단계(TQ-MUT-001, TQ-MUT-002)와 동일한 방식으로 `tagService.ts`와 `tagActions.ts` 생성 및 함수 구현 (`fetchTags`, `createTag`, `deleteTag` 등).
    *   **예상 결과:** Tag 관련 서비스 함수 및 Server Actions 생성 완료.
    *   **규칙:** [service-layer-pattern], [use-server-action]

*   **Task ID:** `TQ-TAG-002`
    *   **작업:** Tag 관련 TanStack Query 훅 생성.
    *   **지침:** 3단계(TQ-MUT-003)와 동일한 방식으로 `useTags`, `useCreateTag`, `useDeleteTag` 훅 구현.
    *   **예상 결과:** Tag 관련 TanStack Query 훅 생성 완료.
    *   **규칙:** [tanstack-query-hook], [tanstack-query-mutation]

*   **Task ID:** `TQ-TAG-003`
    *   **작업:** Tag 관련 컴포넌트 리팩토링.
    *   **지침:** 3단계(TQ-MUT-004)와 동일한 방식으로 `TagList`, `TagForm`, `TagFilter` 등에서 새로운 훅 사용하도록 수정.
    *   **예상 결과:** Tag 관련 컴포넌트가 TanStack Query 훅 사용.
    *   **규칙:** [use-query-hook], [use-mutation-hook], [component-refactor]

*   **Task ID:** `TQ-TAG-004`
    *   **작업:** Tag 관련 기존 API 라우트 제거.
    *   **지침:** 3단계(TQ-MUT-005)와 동일한 방식으로 `/api/tags`, `/api/tags/[id]` 라우트 제거.
    *   **예상 결과:** Tag 관련 API 라우트 제거 완료.
    *   **규칙:** [remove-api-route]

*   **Task ID:** `TQ-TAG-005` (4단계 최종 검증)
    *   **작업:** 4단계 리팩토링 후 기능 검증.
    *   **지침:** 3단계(TQ-MUT-006)와 유사하게 태그 목록 조회, 생성, 삭제 기능 및 UI 자동 업데이트, React Query DevTools 상태 확인. Tag 관련 API 라우트 호출 없는지 확인.
    *   **예상 결과:** 태그 관리 기능이 TanStack Query + Server Actions 기반으로 안정적으로 동작.

---

### **5단계: Zustand 스토어 리팩토링**

*   **Task ID:** `ZS-SLICE-001`
    *   **작업:** `useAppStore` 슬라이스 구조 정의 및 파일 생성.
    *   **지침:**
        1.  `src/store/slices` 디렉토리 생성.
        2.  `createUiSlice.ts`, `createCardStateSlice.ts`, `createThemeSlice.ts` 파일 생성. (WindowCommandSlice는 필요시 추가)
        3.  각 파일에 기본 슬라이스 인터페이스와 생성 함수 구조 작성 (내용은 다음 Task에서 채움).
    *   **예상 결과:** Zustand 슬라이스 파일 구조 생성.
    *   **규칙:** [zustand-slice-pattern]

*   **Task ID:** `ZS-SLICE-002`
    *   **작업:** UI 관련 상태 및 액션 `createUiSlice`로 이동.
    *   **지침:**
        1.  `src/store/slices/createUiSlice.ts` 파일 작성.
        2.  `isSidebarOpen`, `sidebarWidth` 상태 및 `setSidebarOpen`, `toggleSidebar`, `setSidebarWidth` 액션 정의.
        3.  기존 `useAppStore`에서 해당 상태/액션 로직 이동.
    *   **예상 결과:** UI 슬라이스 구현 완료.
    *   **규칙:** [zustand-slice-refactor]

*   **Task ID:** `ZS-SLICE-003`
    *   **작업:** 카드 선택/확장 상태 및 액션 `createCardStateSlice`로 이동 및 통합.
    *   **지침:**
        1.  `src/store/slices/createCardStateSlice.ts` 파일 작성.
        2.  `selectedCardIds: string[]`, `expandedCardId: string | null` 상태 정의.
        3.  `selectCards(ids: string[])`, `toggleExpandCard(id: string)`, `clearSelectedCards()` 액션 정의.
        4.  `selectCards` 액션 내에서 단일/다중 선택 로직 통합 (기존 `selectCard`, `toggleSelectedCard` 로직 참고).
        5.  기존 `useAppStore`에서 해당 상태/액션 로직 이동 및 통합.
    *   **예상 결과:** 카드 상태 슬라이스 구현 완료, 선택 액션 통합.
    *   **규칙:** [zustand-slice-refactor], [refactor-duplicate-logic]

*   **Task ID:** `ZS-SLICE-004`
    *   **작업:** 테마 관련 상태 및 액션 `createThemeSlice`로 이동 (`ThemeContext` 로직 통합).
    *   **지침:**
        1.  `src/store/slices/createThemeSlice.ts` 파일 작성.
        2.  `Theme` 타입 정의 import 또는 재정의.
        3.  `theme: Theme` 상태 및 `updateTheme(partialTheme: Partial<Theme>)`, `updateNodeSize(width, height, maxHeight)` 액션 정의.
        4.  기존 `ThemeContext`의 상태 및 로직 이전.
    *   **예상 결과:** 테마 슬라이스 구현 완료.
    *   **규칙:** [zustand-slice-refactor], [remove-context-api]

*   **Task ID:** `ZS-SLICE-005`
    *   **작업:** 루트 스토어(`useAppStore.ts`) 업데이트 (슬라이스 결합).
    *   **지침:**
        1.  `src/store/useAppStore.ts` 파일을 수정합니다.
        2.  각 슬라이스 생성 함수 import.
        3.  `create<CombinedState>()(...)` 내에서 각 슬라이스 생성 함수 호출하여 결합.
            ```typescript
            import { create } from 'zustand';
            import { createUiSlice, UiSlice } from './slices/createUiSlice';
            import { createCardStateSlice, CardStateSlice } from './slices/createCardStateSlice';
            import { createThemeSlice, ThemeSlice } from './slices/createThemeSlice';
            // ... other slices

            type StoreState = UiSlice & CardStateSlice & ThemeSlice /* & OtherSlices */;

            export const useAppStore = create<StoreState>()((...a) => ({
              ...createUiSlice(...a),
              ...createCardStateSlice(...a),
              ...createThemeSlice(...a),
              // ... other slices
            }));
            ```
        4.  기존 `useAppStore`의 상태/액션 정의 중 슬라이스로 이동된 부분 제거.
    *   **예상 결과:** `useAppStore`가 슬라이스 조합으로 재구성됩니다.
    *   **규칙:** [zustand-slice-pattern]

*   **Task ID:** `ZS-SLICE-006`
    *   **작업:** `ThemeContext` 제거 및 관련 컴포넌트 수정.
    *   **지침:**
        1.  `src/contexts/ThemeContext.tsx` 파일 삭제.
        2.  `src/components/layout/ClientLayout.tsx` 등에서 `ThemeProvider` 제거.
        3.  `useTheme` 훅을 사용하던 컴포넌트(예: `NodeSizeSettings`, `CardNode`)에서 `useAppStore(state => state.themeSlice...)` 를 사용하도록 수정.
    *   **예상 결과:** `ThemeContext`가 완전히 제거되고 Zustand 스토어로 대체됩니다.
    *   **규칙:** [remove-context-api], [use-zustand-selector]

*   **Task ID:** `ZS-SLICE-007`
    *   **작업:** 기존 `useAppStore` 사용 부분 업데이트.
    *   **지침:** 프로젝트 전체에서 `useAppStore`를 사용하던 컴포넌트를 찾아, 새로운 슬라이스 기반의 상태와 액션을 사용하도록 수정합니다.
        *   예: `useAppStore(state => state.isSidebarOpen)`
        *   예: `const { selectCards } = useAppStore()`
    *   **예상 결과:** 모든 컴포넌트가 새로운 Zustand 스토어 구조를 사용합니다.
    *   **규칙:** [use-zustand-selector], [component-refactor]

*   **Task ID:** `ZS-SLICE-008` (5단계 최종 검증)
    *   **작업:** 5단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 확인합니다:
        1.  사이드바 열기/닫기, 너비 조절 등 UI 상태 관련 기능이 정상 동작하는가?
        2.  카드 선택 (단일/다중) 및 확장 기능이 정상 동작하는가?
        3.  테마 관련 기능 (예: 노드 크기 변경 UI - 실제 로직은 다음 단계)이 상태 변경을 반영하는가?
        4.  (Optional) Zustand DevTools에서 스토어 상태가 슬라이스 구조로 분리되어 표시되는가?
        5.  `ThemeContext` 관련 코드가 모두 제거되었는가?
    *   **예상 결과:** Zustand 스토어가 슬라이스 패턴으로 성공적으로 재구성되고, 클라이언트 UI 상태 관리가 일원화됩니다.

---

### **6단계: IdeaMap 상태 관리 및 로직 분리**

*   **Task ID:** `IMAP-001`
    *   **작업:** `useIdeaMapStore` 리팩토링 (React Flow UI 상태 집중).
    *   **지침:**
        1.  `src/store/useIdeaMapStore.ts` 파일을 엽니다.
        2.  **유지할 상태/액션:** `reactFlowInstance`, `viewport`, `nodes`, `edges`, `setNodes`, `setEdges`, `onNodesChange`, `onEdgesChange`, `setViewport` 등 React Flow 자체의 상태 및 콜백.
        3.  **제거할 로직:** 노드/엣지 데이터 로딩(`loadIdeaMapData`), 저장(`saveLayout`, `saveEdges`), 변환(`syncCardsWithNodes`), 외부 상태 의존 액션 등. (이들은 커스텀 훅으로 이동)
    *   **예상 결과:** `useIdeaMapStore`는 순수 React Flow 상태 관리에 집중하게 됩니다.
    *   **규칙:** [zustand-refactor], [separation-of-concerns]

*   **Task ID:** `IMAP-002`
    *   **작업:** `useIdeaMapSync` 훅 생성 (데이터 동기화 담당).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapSync.ts` 파일을 새로 생성합니다.
        2.  내부에서 `useCards()`(TanStack Query) 훅을 호출하여 카드 데이터를 가져옵니다.
        3.  (필요시) 로컬 레이아웃 정보 (예: localStorage 또는 Zustand)를 로드합니다.
        4.  카드 데이터와 레이아웃 정보를 결합하여 React Flow용 `nodes` 배열을 생성하는 로직을 구현합니다 (`cardsToCardNodes` 유틸리티 사용).
        5.  (필요시) 엣지 데이터를 로드하거나 생성하는 로직을 구현합니다.
        6.  생성된 `nodes`와 `edges`를 반환하고, 이 데이터를 `useIdeaMapStore`의 `setNodes`, `setEdges`를 호출하여 업데이트합니다. (초기 로드 시 또는 데이터 변경 시)
    *   **예상 결과:** 서버 데이터와 로컬 레이아웃을 동기화하여 React Flow 노드/엣지 배열을 생성하는 훅 구현.
    *   **규칙:** [react-hook], [data-synchronization], [custom-hook-creation]

*   **Task ID:** `IMAP-003`
    *   **작업:** `useIdeaMapInteractions` 훅 생성/리팩토링 (사용자 상호작용 처리).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapInteractions.ts` 파일 생성 또는 기존 핸들러 로직 이동.
        2.  `onNodeClick`, `onPaneClick`, `onConnect`, `onNodesDelete`, `onEdgesDelete`, `onDrop`, `onDragOver` 등 React Flow 이벤트 핸들러 구현.
        3.  `onNodeClick` 내부: `useAppStore`의 `selectCards` 액션 호출.
        4.  `onDrop` 내부: (카드 드롭 시) `useCreateCard().mutate(...)` 호출.
        5.  `onConnect` 내부: 엣지 생성 로직 (상태 업데이트 또는 뮤테이션 호출).
        6.  각 핸들러 함수를 반환합니다.
    *   **예상 결과:** IdeaMap 사용자 상호작용을 처리하는 훅 구현.
    *   **규칙:** [react-hook], [event-handling], [custom-hook-creation]

*   **Task ID:** `IMAP-004`
    *   **작업:** `useIdeaMapLayout` 훅 생성/리팩토링 (레이아웃 관리).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapLayout.ts` 파일 생성 또는 기존 로직 이동.
        2.  자동 레이아웃 계산 함수 (`applyLayout` 등) 구현 (`getLayoutedElements`, `getGridLayout` 유틸 사용).
        3.  계산된 레이아웃을 `useIdeaMapStore`의 `setNodes`를 통해 적용.
        4.  레이아웃 저장/로드 함수 구현 (예: localStorage 또는 Zustand persist 사용).
        5.  관련 함수들을 반환합니다.
    *   **예상 결과:** IdeaMap 레이아웃 관리 훅 구현.
    *   **규칙:** [react-hook], [layout-logic], [custom-hook-creation]

*   **Task ID:** `IMAP-005`
    *   **작업:** `IdeaMap.tsx` 컴포넌트 리팩토링.
    *   **지침:**
        1.  `src/components/ideamap/components/IdeaMap.tsx` 파일을 엽니다.
        2.  상태 관리 로직을 위에서 만든 훅 (`useIdeaMapSync`, `useIdeaMapStore`, `useIdeaMapInteractions`, `useIdeaMapLayout`)으로 위임합니다.
        3.  `useIdeaMapSync`로부터 `nodes`, `edges` 데이터를 받아 `ReactFlow` 컴포넌트에 전달합니다.
        4.  `useIdeaMapStore`로부터 React Flow 상태(`viewport` 등) 및 콜백(`onNodesChange`, `onEdgesChange` 등)을 받아 `ReactFlow` 컴포넌트에 전달합니다.
        5.  `useIdeaMapInteractions`로부터 이벤트 핸들러(`onNodeClick`, `onPaneClick`, `onConnect` 등)를 받아 `ReactFlow` 컴포넌트에 전달합니다.
        6.  (필요시) `useIdeaMapLayout` 훅을 사용하여 레이아웃 관련 버튼 동작을 연결합니다.
        7.  컴포넌트는 주로 UI 렌더링과 훅 연결 역할만 수행하도록 간소화합니다.
    *   **예상 결과:** `IdeaMap.tsx` 컴포넌트가 간결해지고, 로직은 커스텀 훅으로 분리됩니다.
    *   **규칙:** [component-refactor], [use-custom-hook]

*   **Task ID:** `IMAP-006`
    *   **작업:** `useNodeStore` 제거 또는 통합.
    *   **지침:**
        1.  `src/store/useNodeStore.ts` 파일 및 관련 사용 코드 삭제.
        2.  노드 인스펙터 기능이 필요하다면, 관련 상태(`inspectedNode`, `inspectorOpen`)를 `useIdeaMapInteractions` 훅 내부 또는 별도의 `useNodeInspector` 훅으로 이동하여 관리합니다. (간단하면 `IdeaMap.tsx` 내 `useState`도 가능)
    *   **예상 결과:** `useNodeStore` 제거, 노드 인스펙터 로직 통합.
    *   **규칙:** [remove-redundant-store]

*   **Task ID:** `IMAP-007` (6단계 최종 검증)
    *   **작업:** 6단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 확인합니다:
        1.  IdeaMap이 카드 데이터를 기반으로 노드/엣지를 올바르게 렌더링하는가?
        2.  카드 생성/수정/삭제 시 IdeaMap UI가 즉시 (또는 캐시 무효화 후) 반영되는가?
        3.  노드 클릭 시 카드 선택 상태가 `useAppStore`에 반영되고, Sidebar 등 다른 UI와 연동되는가?
        4.  노드 드래그 앤 드롭, 엣지 연결 등 상호작용이 정상적으로 동작하는가?
        5.  자동 레이아웃 적용 및 저장/로드 기능이 정상적으로 동작하는가?
        6.  (Optional) 노드 인스펙터 기능이 필요했다면 정상 동작하는가?
        7.  `useIdeaMapStore` 코드를 확인하여 데이터 로딩/변환 로직이 제거되었는지 확인.
    *   **예상 결과:** IdeaMap 관련 상태 및 로직이 효과적으로 분리되고, 기능은 이전과 동일하게 동작합니다.

---

### **7단계: 공통 타입 정의 통합 및 최종 정리**

*   **Task ID:** `CLEANUP-001`
    *   **작업:** 타입 정의 중앙화 및 검증.
    *   **지침:**
        1.  프로젝트 내 모든 주요 타입(Card, Tag, User, Project, Edge, NodeData, Store Slices, API 응답 등)이 `src/types` 디렉토리 내 파일에서 정의되고 관리되는지 확인합니다.
        2.  Prisma 모델과 타입 정의 간 일관성을 확인하고, 필요시 Prisma 타입을 직접 사용하거나 생성합니다.
        3.  서비스 함수, Server Actions, TanStack Query 훅, Zustand 스토어, 컴포넌트 등에서 중앙 타입 정의를 import하여 사용하는지 확인합니다.
        4.  `npm run build` 또는 `npm run typecheck` 명령어를 실행하여 타입 에러가 없는지 확인합니다.
    *   **예상 결과:** 타입 정의가 일관성 있게 중앙 관리됩니다.
    *   **규칙:** [centralized-types], [type-consistency]

*   **Task ID:** `CLEANUP-002`
    *   **작업:** 불필요한 파일 및 코드 제거.
    *   **지침:**
        1.  더 이상 사용되지 않는 스토어 파일(예: `useNodeStore.ts`), 컨텍스트 파일(예: `AuthContext.tsx`, `ThemeContext.tsx`), 훅, 컴포넌트 등을 삭제합니다.
        2.  제거된 API 라우트 파일 (`/api/cards`, `/api/tags` 등)을 삭제합니다.
        3.  `/api/users/first/route.ts` 파일을 삭제합니다.
        4.  프로젝트 전체 검색을 통해 삭제된 파일/모듈을 import하는 부분이 남아있지 않은지 확인합니다.
    *   **예상 결과:** 코드베이스에서 불필요한 파일과 코드가 제거됩니다.
    *   **규칙:** [code-cleanup]

*   **Task ID:** `CLEANUP-003`
    *   **작업:** 설정 파일 통합 검토.
    *   **지침:** `src/lib` 또는 `src/config` 내의 상수(`constants.ts`), 설정(`ideamap-ui-config.ts` 등) 관련 파일들을 검토하고, 내용 중복이나 분산이 심하다면 논리적으로 통합하거나 정리합니다.
    *   **예상 결과:** 설정 관련 파일 구조가 개선됩니다.
    *   **규칙:** [config-refactor]

*   **Task ID:** `CLEANUP-004` (7단계 최종 검증)
    *   **작업:** 7단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 주요 기능(로그인, 카드/태그 CRUD, IdeaMap 상호작용)에 대한 회귀 테스트를 수행합니다. 빌드 및 타입 체크가 오류 없이 통과하는지 최종 확인합니다.
    *   **예상 결과:** 리팩토링이 완료되고 코드베이스가 정리된 상태에서 모든 기능이 정상 동작합니다.

---

### **8단계: 아키텍처 가이드 문서 작성**

*   **Task ID:** `DOC-001`
    *   **작업:** 개선된 아키텍처와 개발 원칙을 설명하는 문서 작성.
    *   **지침:** 이전 계획(Phase 8)의 세부 내용을 기반으로 아키텍처 가이드 문서(`ARCHITECTURE.md` 또는 유사 파일)를 작성합니다. 다음 내용을 포함합니다:
        *   개요 (TQ + Zustand 원칙)
        *   상태 관리 (TQ 역할/키 전략, Zustand 역할/슬라이스 구조)
        *   API 서비스 계층 & Server Actions (역할, 구조, Zod, 응답 형식)
        *   **API 라우트 사용 기준 (옵션 3 반영)**
        *   인증 흐름 (`@supabase/ssr`, `useAuth`, `useAuthStore`)
        *   주요 데이터 흐름 예시 (카드 CRUD, IdeaMap 동기화)
        *   컴포넌트 책임 원칙
        *   테스트 전략 가이드라인
        *   AI 협업 가이드 (스타일, 구조, LoC)
        *   신규 기능 추가 예시 (Bulletin Board)
    *   **예상 결과:** 프로젝트 아키텍처를 설명하는 포괄적인 문서가 작성됩니다.
    *   **규칙:** [documentation]

*   **Task ID:** `DOC-002` (8단계 최종 검증)
    *   **작업:** 작성된 아키텍처 문서 검토.
    *   **지침:** 팀원 또는 동료 개발자(또는 스스로)가 문서를 검토하여 명확성, 정확성, 완전성을 확인합니다. AI 에이전트가 이 문서를 기반으로 작업을 수행할 수 있을지 평가합니다.
    *   **예상 결과:** 아키텍처 문서가 최종 검토되고 승인됩니다.
