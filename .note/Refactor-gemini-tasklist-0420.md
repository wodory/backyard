알겠습니다. 지적된 개선 필요 사항들을 반영하여 AI 에이전트(Cursor)를 위한 "초정밀 유도 및 검증 전략 Tasklist" 최종 버전을 작성하겠습니다. 함수 시그니처, import 경로, 명확한 지시 등을 포함하여 AI의 이해도와 실행 가능성을 높이는 데 중점을 두겠습니다.

---

## **Backyard 애플리케이션 아키텍처 리팩토링 Tasklist (최종 버전)**

**문서 버전:** 1.1
**최종 수정:** 2024-04-20
**목표:** 서버 상태 관리를 TanStack Query로, 클라이언트 UI 상태 관리를 Zustand(Slice 패턴)로 분리하고, 인증 로직을 `@supabase/ssr` 중심으로 통합하여 전체 아키텍처를 개선합니다.

**주의:** 각 Task는 순서대로 진행하며, 한 Task 완료 후 반드시 **검증 단계**를 거쳐 기능 회귀나 오류가 없는지 확인합니다. AI 에이전트에게는 한 번에 하나의 Task ID만 지시합니다.

---

### **0단계: 준비 및 환경 설정**

*   **Task ID:** `PREP-002`
    *   **작업:** TanStack Query `QueryClientProvider` 설정.
    *   **지침:**
        1.  `src/components/providers/QueryProvider.tsx` 파일을 새로 생성합니다.
        2.  아래 코드를 `QueryProvider.tsx`에 **정확히** 추가합니다.
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
                    refetchOnWindowFocus: false,
                    retry: 1,
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
        3.  `src/app/layout.tsx` 파일을 수정합니다.
            *   파일 상단에 다음 import 문을 추가합니다: `import QueryProvider from '@/components/providers/QueryProvider';`
            *   `ClientLayout` 컴포넌트를 찾아 `<QueryProvider>`로 **정확히** 다음과 같이 감쌉니다:
                ```diff
                - <ClientLayout>
                + <QueryProvider>
                +  <ClientLayout>
                    {children}
                - </ClientLayout>
                +  </ClientLayout>
                + </QueryProvider>
                ```
    *   **예상 결과:** 애플리케이션 최상단에 `QueryClientProvider`가 적용되고, 개발 모드에서 React Query DevTools가 활성화됩니다.
    *   **규칙:** [react-provider-setup]
    *   **검증 (AI):** `src/app/layout.tsx` 파일의 변경 사항을 확인하고, `QueryProvider`가 `ClientLayout`을 올바르게 감싸고 있는지 확인합니다. `src/components/providers/QueryProvider.tsx` 파일이 생성되었는지 확인합니다.
    *   **검증 (인간):** 앱 실행 후 React Query DevTools 아이콘이 화면 우측 하단 등에 표시되는지 확인합니다.

---

### **1단계: 인증 리팩토링**

*   **Task ID:** `AUTH-001`
    *   **작업:** `lib/auth.ts`에서 localStorage/sessionStorage 기반 토큰/verifier 관리 로직 제거.
    *   **지침:**
        1.  `src/lib/auth.ts` 파일을 엽니다.
        2.  `STORAGE_KEYS` 객체 정의를 찾아서 `CODE_VERIFIER`, `ACCESS_TOKEN`, `REFRESH_TOKEN` 키 정의를 **삭제**합니다. (`USER_ID`, `PROVIDER`는 일단 유지).
        3.  파일 전체에서 `localStorage.setItem`, `localStorage.getItem`, `localStorage.removeItem`, `sessionStorage.setItem`, `sessionStorage.getItem`, `sessionStorage.removeItem` 호출 부분을 찾습니다.
        4.  이 호출들 중 `STORAGE_KEYS.CODE_VERIFIER`, `STORAGE_KEYS.ACCESS_TOKEN`, `STORAGE_KEYS.REFRESH_TOKEN` (또는 관련된 문자열 키)을 사용하는 코드를 **모두 삭제**합니다.
        5.  `signIn`, `signUp`, `signOut`, `signInWithGoogle` 함수 내에서 위 저장소 호출 코드가 삭제되었는지 확인합니다. Supabase 클라이언트의 `auth` 메서드 호출(예: `supabase.auth.signInWithPassword(...)`) 로직은 **변경하지 않습니다**.
        6.  `generateCodeVerifier`, `generateCodeChallenge` 함수 자체는 **삭제하지 않습니다**. (PKCE 플로우에서 Supabase 클라이언트가 내부적으로 사용할 수 있음).
    *   **예상 결과:** `lib/auth.ts`에서 수동 토큰/verifier 저장소 관리 코드가 완전히 제거됩니다. 인증 관련 함수는 Supabase 클라이언트 호출에만 의존합니다.
    *   **규칙:** [supabase-ssr-auth], [remove-manual-storage]
    *   **검증 (AI):** `src/lib/auth.ts` 파일 내에 `localStorage.set/get/removeItem` 또는 `sessionStorage.set/get/removeItem` 호출이 남아있는지 확인합니다 (단, `USER_ID`, `PROVIDER` 관련은 제외). `STORAGE_KEYS` 객체에 삭제 대상 키가 없는지 확인합니다.
    *   **검증 (인간):** 코드 리뷰를 통해 불필요한 저장소 접근 코드가 제거되었는지 확인합니다.

*   **Task ID:** `AUTH-002`
    *   **작업:** `useAuth` 훅 생성 및 `onAuthStateChange` 구독 설정.
    *   **지침:**
        1.  `src/hooks/useAuth.ts` 파일이 없다면 새로 생성합니다.
        2.  `src/hooks/useAuth.ts` 파일에 아래 코드를 **정확히** 추가/수정합니다.
            ```typescript
            // src/hooks/useAuth.ts
            'use client';

            import { useState, useEffect, useCallback } from 'react';
            import { User } from '@supabase/supabase-js';
            import { createClient } from '@/lib/supabase/client';
            import { useAuthStore } from '@/store/useAuthStore'; // 다음 Task에서 수정 예정

            // User 타입 확장 (필요시 추가 정보 포함)
            // export interface ExtendedUser extends User {
            //   // 추가 필드 정의 (예: dbUser 정보)
            // }

            export function useAuth() {
              // Zustand 스토어 액션 가져오기 (다음 Task에서 생성/수정될 것임)
              const setProfile = useAuthStore((state) => state.setProfile);
              const setLoading = useAuthStore((state) => state.setLoading);
              const setAuthError = useAuthStore((state) => state.setError);

              // 초기화 상태 관리
              const [isInitialized, setIsInitialized] = useState(false);

              useEffect(() => {
                // 마운트 시 로딩 상태 시작
                if (!isInitialized) {
                  setLoading(true);
                }

                const supabase = createClient();
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                  (_event, session) => {
                    console.log('[useAuth] Auth state changed:', _event);
                    const user = session?.user ?? null;
                    setProfile(user); // Store 상태 업데이트
                    setLoading(false); // 로딩 완료
                    setAuthError(null); // 이전 에러 클리어
                    if (!isInitialized) {
                        setIsInitialized(true); // 초기화 완료
                    }
                  }
                );

                // 초기 세션 로드 (콜백보다 먼저 실행될 수 있음)
                supabase.auth.getSession().then(({ data: { session }, error }) => {
                   if (error) {
                       console.error("[useAuth] Error fetching initial session:", error);
                       setAuthError(error);
                   }
                   // onAuthStateChange 콜백이 아직 실행되지 않았다면 초기 상태 설정
                   if (!isInitialized) {
                       const user = session?.user ?? null;
                       setProfile(user);
                       setLoading(false);
                       setIsInitialized(true);
                   }
                });

                return () => {
                  subscription.unsubscribe();
                };
              // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []); // 최초 마운트 시 한 번만 실행

              // 스토어에서 현재 상태 읽기
              const isLoading = useAuthStore((state) => state.isLoading);
              const user = useAuthStore((state) => state.profile);
              const error = useAuthStore((state) => state.error);

              // 초기화 중이거나 명시적 로딩 상태일 때 true 반환
              return { isLoading: !isInitialized || isLoading, user, error };
            }
            ```
    *   **예상 결과:** `useAuth` 훅이 생성되어 Supabase 인증 상태 변경을 감지하고 `useAuthStore`를 업데이트할 준비가 됩니다.
    *   **규칙:** [react-hook], [supabase-auth-listener], [zustand-integration]
    *   **검증 (AI):** `src/hooks/useAuth.ts` 파일이 생성되었고, `onAuthStateChange` 구독 및 `getSession` 호출 로직이 포함되었는지 확인합니다. `useAuthStore` 액션(`setProfile`, `setLoading`, `setError`)이 호출되는지 확인합니다.
    *   **검증 (인간):** 코드 리뷰를 통해 로직의 정확성을 확인합니다.

*   **Task ID:** `AUTH-003`
    *   **작업:** `useAuthStore` 리팩토링 (상태 및 액션 정리).
    *   **지침:**
        1.  `src/store/useAuthStore.ts` 파일을 엽니다.
        2.  파일 상단에 `import { User } from '@supabase/supabase-js';` 를 추가합니다.
        3.  `AuthState` 인터페이스를 **정확히** 다음과 같이 수정합니다:
            ```typescript
            interface AuthState {
              profile: User | null; // 사용자 프로필 정보 (Supabase User 객체)
              isLoading: boolean;   // 인증 상태 로딩 여부
              error: Error | null;  // 인증 관련 에러

              // 액션
              setProfile: (profile: User | null) => void;
              setLoading: (isLoading: boolean) => void;
              setError: (error: Error | null) => void;
              clearAuth: () => void;
            }
            ```
        4.  `create<AuthState>()(...)` 내부의 초기 상태를 **정확히** 다음과 같이 수정합니다:
            ```typescript
            {
              profile: null,
              isLoading: true, // 초기 상태는 로딩 중으로 설정
              error: null,
              // ... 액션 구현 ...
            }
            ```
        5.  액션 구현 부분을 **정확히** 다음과 같이 수정/추가합니다 (기존 `setTokens`, `setUser` 등은 삭제):
            ```typescript
            setProfile: (profile) => set({ profile }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearAuth: () => set({ profile: null, isLoading: false, error: null }),
            ```
        6.  `persist` 미들웨어를 사용하는 경우, `partialize` 옵션을 사용하여 `profile` 상태는 **제외**하고 `isLoading`, `error`만 저장하도록 수정합니다. (또는 persist를 아예 제거해도 무방합니다. UI 상태는 휘발성이어도 괜찮습니다.)
            ```typescript
            // persist 사용하는 경우 예시
            partialize: (state) => ({
              // profile은 제외
              isLoading: state.isLoading, // 필요하다면 isLoading, error 유지
              error: state.error,
            }),
            ```
    *   **예상 결과:** `useAuthStore`는 인증 UI 상태(`isLoading`, `error`)와 사용자 프로필 캐시(`profile`)만 관리하며, 관련 액션만 갖게 됩니다.
    *   **규칙:** [zustand-slice-refactor], [remove-redundant-state]
    *   **검증 (AI):** `AuthState` 인터페이스와 초기 상태, 액션 구현이 지침대로 수정되었는지 확인합니다. 불필요한 상태/액션이 제거되었는지 확인합니다.
    *   **검증 (인간):** 코드 리뷰 및 (필요시) Zustand DevTools를 통해 상태 구조 변경 확인.

*   **Task ID:** `AUTH-004`
    *   **작업:** `AuthContext` 및 `AuthProvider` 제거.
    *   **지침:**
        1.  `src/contexts/AuthContext.tsx` 파일을 **삭제**합니다.
        2.  `src/components/layout/ClientLayout.tsx` 파일에서 `AuthProvider` import 문과 `<AuthProvider>` 태그를 **삭제**합니다.
        3.  프로젝트 전체에서 `useAuthContext` 또는 `AuthContext.Consumer` 사용 부분을 검색합니다.
        4.  찾아낸 부분을 다음과 같이 수정합니다:
            *   사용자 정보나 로딩/에러 상태가 필요한 경우: `useAuth()` 훅을 import 하고 `const { user, isLoading, error } = useAuth();` 와 같이 사용합니다.
            *   단순히 사용자 프로필 정보만 필요한 경우: `useAuthStore`를 import 하고 `const profile = useAuthStore(state => state.profile);` 와 같이 사용합니다. (주의: `useAuth` 훅은 내부적으로 `useAuthStore`를 사용하므로, 한 컴포넌트 내에서 중복 호출은 피하는 것이 좋습니다. `useAuth`를 우선적으로 사용하세요.)
    *   **예상 결과:** `AuthContext` 관련 코드가 프로젝트에서 완전히 제거됩니다.
    *   **규칙:** [remove-context-api], [use-custom-hook]
    *   **검증 (AI):** `AuthContext.tsx` 파일이 삭제되었는지 확인합니다. `ClientLayout.tsx`에서 `AuthProvider`가 제거되었는지 확인합니다. 프로젝트 전체 검색으로 `useAuthContext` 사용 부분이 없는지 확인합니다.
    *   **검증 (인간):** 애플리케이션 빌드 및 실행 시 관련 에러가 없는지 확인합니다.

*   **Task ID:** `AUTH-005`
    *   **작업:** 로그인/콜백 관련 컴포넌트 및 라우트에서 인증 로직 호출 방식 수정.
    *   **지침:**
        1.  `src/app/login/page.tsx` (또는 `src/components/login/loginForm.tsx`):
            *   Google 로그인 버튼(`signInWithGoogle` 호출 부분)의 `onClick` 핸들러에서 `actions.ts`의 액션을 호출하는 대신, `import { signInWithGoogle } from '@/lib/auth';` 를 추가하고 `await signInWithGoogle();` 를 직접 호출하도록 수정합니다. 관련 로딩 상태(`isGooglePending`)는 유지합니다.
        2.  `src/app/login/actions.ts`:
            *   `signInWithGoogle` 액션 함수를 **삭제**합니다.
            *   `login`, `signup` 함수는 Server Actions으로 유지합니다. 내부에서 `import { createClient } from '@/lib/supabase/server';` 를 사용하고, `supabase.auth.signInWithPassword(...)` 와 `supabase.auth.signUp(...)` 를 호출하는지 확인합니다. (기존 코드가 이미 이렇게 되어 있을 가능성이 높음).
        3.  `src/app/auth/callback/route.ts`: 변경 없음. `exchangeCodeForSession` 호출 확인.
        4.  `src/app/auth/error/page.tsx`: 변경 없음. `useSearchParams` 사용 확인.
    *   **예상 결과:** 클라이언트 측 Google 로그인은 `lib/auth.ts` 함수를 직접 호출하고, 이메일/비번 로그인은 Server Actions을 통해 처리됩니다.
    *   **규칙:** [use-server-action], [direct-function-call], [refactor-component]
    *   **검증 (AI):** `login/page.tsx`에서 `signInWithGoogle` 직접 호출 확인. `login/actions.ts`에서 `signInWithGoogle` 액션 삭제 확인 및 `login`/`signup` 내 Supabase 서버 클라이언트 사용 확인.
    *   **검증 (인간):** Google 로그인 버튼 클릭 시 정상적으로 OAuth 플로우가 시작되는지 확인. 이메일/비번 로그인/가입이 Server Action을 통해 동작하는지 확인.

*   **Task ID:** `AUTH-006` (1단계 최종 검증)
    *   **작업:** 1단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **꼼꼼히** 확인합니다:
        1.  **로그인:** Google 및 이메일/비번 로그인이 모두 성공하는가?
        2.  **로그아웃:** 로그아웃 버튼 클릭 시 성공적으로 로그아웃 되는가?
        3.  **세션 유지:** 로그인 후 페이지 새로고침 시 로그인 상태가 유지되는가?
        4.  **페이지 접근 제어:**
            *   로그아웃 상태에서 `/cards` 등 보호된 페이지 접근 시 로그인 페이지로 리디렉션 되는가?
            *   로그인 상태에서 `/login` 페이지 접근 시 홈(`/`)으로 리디렉션 되는가? (`middleware.ts` 동작 확인)
        5.  **콘솔:** 브라우저 개발자 도구 콘솔에 인증 관련 오류가 없는가?
        6.  **(Optional) 상태 확인:** React DevTools 또는 Zustand DevTools에서 `useAuthStore` 상태가 `profile`, `isLoading`, `error` 위주로만 표시되는지 확인.
    *   **예상 결과:** 모든 인증 관련 기능이 `@supabase/ssr` 기반으로 안정적으로 동작합니다.

### **2단계: API 서비스 계층 구축 및 TanStack Query 적용 (Card 조회)**

*   **Task ID:** `TQ-CARD-001`
    *   **작업:** API 서비스 디렉토리 및 Card 서비스 파일 생성.
    *   **지침:**
        1.  프로젝트 루트에 `src/services` 디렉토리가 없다면 생성합니다.
        2.  `src/services/cardService.ts` 파일을 생성합니다.
    *   **예상 결과:** `src/services/cardService.ts` 파일이 생성됩니다.
    *   **규칙:** [service-layer-pattern]
    *   **검증 (AI):** 해당 디렉토리 및 파일 생성 여부 확인.

*   **Task ID:** `TQ-CARD-002`
    *   **작업:** `cardService.ts`에 카드 조회 함수 구현.
    *   **지침:**
        1.  `src/services/cardService.ts` 파일을 엽니다.
        2.  파일 상단에 다음 import 문을 추가합니다:
            ```typescript
            import prisma from '@/lib/prisma';
            import { Card, Prisma } from '@prisma/client'; // Prisma 타입 사용
            import { CardWithRelations } from '@/types/card'; // 상세 타입을 정의했다고 가정 (아래 예시 참고)
            ```
            *참고: `CardWithRelations` 타입 예시 (`src/types/card.ts`에 추가):*
            ```typescript
            // src/types/card.ts
            import { Card as PrismaCard, User, Tag, CardTag } from '@prisma/client';

            export interface CardWithRelations extends PrismaCard {
              user?: Pick<User, 'id' | 'name'>; // 필요한 필드만 선택
              cardTags?: (CardTag & { tag: Tag })[];
            }
            // 기존 Card, CreateCardInput, UpdateCardInput 인터페이스도 유지하거나 CardWithRelations 사용하도록 조정
            ```
        3.  아래 함수들을 `cardService.ts` 내부에 **정확히** 구현합니다 (기존 `/api/cards` 및 `/api/cards/[id]` GET 핸들러 로직 참조):
            ```typescript
            // src/services/cardService.ts

            /**
             * 카드 목록 조회 함수
             * @param params - 조회 파라미터 (검색어, 태그, 사용자 ID 등)
             * @returns 카드 배열 Promise
             */
            export async function fetchCards(params: {
              query?: string;
              tag?: string;
              userId?: string; // 특정 사용자 카드만 조회할 경우
              // 페이지네이션 등 추가 파라미터 가능
            }): Promise<CardWithRelations[]> {
              const { query, tag, userId } = params;
              const whereClause: Prisma.CardWhereInput = {};

              if (userId) {
                whereClause.userId = userId;
              }

              if (query) {
                whereClause.OR = [
                  { title: { contains: query, mode: 'insensitive' } }, // 대소문자 무시
                  { content: { contains: query, mode: 'insensitive' } },
                ];
              }

              if (tag) {
                whereClause.cardTags = {
                  some: {
                    tag: {
                      name: { equals: tag, mode: 'insensitive' },
                    },
                  },
                };
              }

              try {
                const cards = await prisma.card.findMany({
                  where: whereClause,
                  include: {
                    user: { select: { id: true, name: true } },
                    cardTags: { include: { tag: true } },
                  },
                  orderBy: {
                    updatedAt: 'desc', // 최신 수정 순
                  },
                  // 페이지네이션 구현 시 take, skip 추가
                });
                return cards;
              } catch (error) {
                console.error('Error fetching cards:', error);
                throw new Error('카드 목록을 불러오는 중 오류가 발생했습니다.');
              }
            }

            /**
             * ID로 특정 카드 조회 함수
             * @param id - 조회할 카드 ID
             * @returns 카드 객체 또는 null Promise
             */
            export async function fetchCardById(id: string): Promise<CardWithRelations | null> {
              if (!id) {
                  throw new Error('카드 ID가 필요합니다.');
              }
              try {
                const card = await prisma.card.findUnique({
                  where: { id },
                  include: {
                    user: { select: { id: true, name: true } },
                    cardTags: { include: { tag: true } },
                  },
                });
                return card;
              } catch (error) {
                console.error(`Error fetching card with ID ${id}:`, error);
                throw new Error('카드를 불러오는 중 오류가 발생했습니다.');
              }
            }
            ```
    *   **예상 결과:** `cardService.ts`에 Prisma를 사용하여 카드 목록 및 단일 카드를 조회하는 함수가 구현됩니다.
    *   **규칙:** [service-layer-pattern], [prisma-orm], [error-handling]
    *   **검증 (AI):** `fetchCards`와 `fetchCardById` 함수가 정의되었고, Prisma 호출 및 반환 타입(`Promise<CardWithRelations[]>` 등)이 명시되었는지 확인합니다. `include` 옵션이 올바르게 사용되었는지 확인합니다.
    *   **검증 (인간):** 코드 리뷰를 통해 Prisma 쿼리 로직 및 에러 처리의 정확성을 확인합니다.

*   **Task ID:** `TQ-CARD-003`
    *   **작업:** `useCards` TanStack Query 훅 생성.
    *   **지침:**
        1.  `src/hooks/queries/useCards.ts` 파일을 새로 생성합니다.
        2.  파일 상단에 다음 import 문을 추가합니다:
            ```typescript
            import { useQuery } from '@tanstack/react-query';
            import { fetchCards } from '@/services/cardService';
            import { CardWithRelations } from '@/types/card'; // 이전 Task에서 정의/수정한 타입
            ```
        3.  아래 코드를 **정확히** 추가합니다:
            ```typescript
            // src/hooks/queries/useCards.ts

            export interface UseCardsParams {
              query?: string;
              tag?: string;
              userId?: string; // 필요시 추가
            }

            export function useCards(params: UseCardsParams = {}) {
              // 쿼리 키 생성: 파라미터 순서를 보장하여 안정적인 키 생성
              const queryKey = ['cards', JSON.stringify(params)]; // 객체를 직렬화하여 키로 사용

              return useQuery<CardWithRelations[], Error>({
                queryKey: queryKey,
                queryFn: () => fetchCards(params),
                staleTime: 1000 * 60 * 1, // 1분
              });
            }
            ```
    *   **예상 결과:** 카드 목록 조회를 위한 `useCards` 훅이 생성됩니다. 쿼리 키는 파라미터를 포함합니다.
    *   **규칙:** [tanstack-query-hook], [query-key-strategy]
    *   **검증 (AI):** `useCards.ts` 파일 생성 및 내용 확인. `useQuery` 훅 사용, `queryKey` 정의, `queryFn`으로 `fetchCards` 호출, 타입 명시 확인.
    *   **검증 (인간):** 코드 리뷰 및 쿼리 키 전략의 적절성 확인.

*   **Task ID:** `TQ-CARD-004`
    *   **작업:** `useCard` TanStack Query 훅 생성 (개별 카드 조회).
    *   **지침:**
        1.  `src/hooks/queries/useCard.ts` 파일을 새로 생성합니다.
        2.  파일 상단에 다음 import 문을 추가합니다:
            ```typescript
            import { useQuery } from '@tanstack/react-query';
            import { fetchCardById } from '@/services/cardService';
            import { CardWithRelations } from '@/types/card';
            ```
        3.  아래 코드를 **정확히** 추가합니다:
            ```typescript
            // src/hooks/queries/useCard.ts

            export function useCard(cardId: string | null | undefined) {
              const queryKey = ['card', cardId];

              return useQuery<CardWithRelations | null, Error>({
                queryKey: queryKey,
                queryFn: async () => {
                  if (!cardId) return null; // ID 없으면 null 반환
                  return fetchCardById(cardId);
                },
                enabled: !!cardId, // cardId가 유효할 때만 쿼리 실행
                staleTime: 1000 * 60 * 5, // 5분
              });
            }
            ```
    *   **예상 결과:** 특정 카드 조회를 위한 `useCard` 훅이 생성됩니다.
    *   **규칙:** [tanstack-query-hook], [query-key-strategy]
    *   **검증 (AI):** `useCard.ts` 파일 생성 및 내용 확인. `useQuery` 훅 사용, `enabled` 옵션, `queryFn` 로직 확인.
    *   **검증 (인간):** 코드 리뷰 및 로직 정확성 확인.

*   **Task ID:** `TQ-CARD-005`
    *   **작업:** `CardList` 컴포넌트 리팩토링 (useCards 훅 사용).
    *   **지침:**
        1.  `src/components/cards/CardList.tsx` 파일을 엽니다.
        2.  `useEffect` 와 `useState` 를 사용한 데이터 fetching 로직 (`fetchCards`, `loading` 상태 등)을 **모두 삭제**합니다.
        3.  파일 상단에 `import { useCards } from '@/hooks/queries/useCards';` 와 `import { useSearchParams } from 'next/navigation';` 를 추가합니다.
        4.  컴포넌트 최상단에서 `useSearchParams` 훅을 호출하여 `searchParams` 객체를 가져옵니다.
        5.  `useCards` 훅을 호출합니다. `searchParams`에서 `q` 와 `tag` 파라미터를 추출하여 `useCards` 훅의 인자로 전달합니다.
            ```typescript
            const searchParams = useSearchParams();
            const query = searchParams.get('q') || undefined;
            const tag = searchParams.get('tag') || undefined;
            // const userId = ... // 필요시 사용자 ID 가져오기

            const { data: cards, isLoading, error } = useCards({ query, tag /*, userId */ });
            ```
        6.  컴포넌트의 JSX 반환 부분에서 `isLoading`, `error`, `cards` 상태를 사용하여 조건부 렌더링을 구현합니다.
            *   `isLoading` 이 true일 때: 로딩 인디케이터 표시 (예: `<Spinner />`).
            *   `error` 가 존재할 때: 에러 메시지 표시 (예: `<p>Error: {error.message}</p>`).
            *   `cards` 가 존재하고 배열일 때: 카드 목록 렌더링 (기존 로직 활용). `filteredCards` 로직은 제거하고 `cards`를 직접 사용합니다. (서버 필터링으로 대체되었으므로)
            *   `cards` 가 비어있을 때: "카드가 없습니다" 메시지 표시.
        7.  기존 `filteredCards` useMemo 로직을 **삭제**합니다.
    *   **예상 결과:** `CardList` 컴포넌트가 TanStack Query `useCards` 훅을 통해 데이터를 관리하며, 코드가 간결해지고 로딩/에러 상태 처리가 표준화됩니다.
    *   **규칙:** [use-query-hook], [component-refactor], [conditional-rendering]
    *   **검증 (AI):** `useEffect` 데이터 fetching 로직 삭제 확인. `useCards` 훅 호출 및 `isLoading`, `error` 상태 사용 확인. `filteredCards` 로직 삭제 확인.
    *   **검증 (인간):** 카드 목록 페이지 로딩 시 스피너 표시, 데이터 로드 후 목록 정상 표시, (테스트용) 에러 발생 시 에러 메시지 표시 확인.

*   **Task ID:** `TQ-CARD-006`
    *   **작업:** `CardPage` 컴포넌트 리팩토링 (서버 컴포넌트 데이터 Fetching 방식).
    *   **지침:**
        1.  `src/app/cards/[id]/page.tsx` 파일을 엽니다.
        2.  파일 상단에 `'use client'` 지시어가 있다면 **삭제**합니다.
        3.  컴포넌트 함수 선언을 `async function CardPage({ params }: PageProps)` 로 변경합니다.
        4.  파일 상단에 `import { fetchCardById } from '@/services/cardService';` 와 `import { notFound } from 'next/navigation';` 를 추가합니다.
        5.  컴포넌트 함수 내부 최상단에서 `fetchCardById`를 호출하여 카드 데이터를 가져옵니다. `try-catch` 블록으로 감싸 에러를 처리하고, 카드가 없거나 에러 발생 시 `notFound()`를 호출합니다.
            ```typescript
            export default async function CardPage({ params }: PageProps) {
              const cardId = params.id; // string | string[] 이므로 필요시 처리
              let card: CardWithRelations | null = null; // 타입 사용
              let fetchError: string | null = null;

              try {
                card = await fetchCardById(cardId as string); // ID 타입 확인 필요
              } catch (error) {
                console.error("Failed to fetch card:", error);
                fetchError = error instanceof Error ? error.message : "카드를 불러오는 중 오류 발생";
              }

              if (!card && !fetchError) { // 에러 없이 카드만 없는 경우
                notFound();
              }

              // 에러 처리 (선택적: notFound() 대신 에러 페이지 보여주기)
              if (fetchError) {
                 // return <ErrorComponent message={fetchError} />;
                 notFound(); // 또는 간단히 notFound 처리
              }

              if (!card) {
                  // 위에서 notFound()가 호출되었으므로 이 코드는 이론상 도달하지 않음
                  return null;
              }
              // ... 이후 card 데이터를 사용한 JSX 렌더링 ...
            }
            ```
        6.  기존 `useEffect`, `useState` 기반의 클라이언트 측 데이터 fetching 로직을 **모두 삭제**합니다.
        7.  컴포넌트 JSX 반환 부분에서 `await`으로 가져온 `card` 데이터를 직접 사용합니다. (`EditCardContent` 같은 클라이언트 컴포넌트에는 props로 전달)
    *   **예상 결과:** `CardPage`가 서버 컴포넌트로 변경되어, 페이지 요청 시 서버에서 직접 데이터를 가져와 렌더링합니다. 클라이언트 측 로딩 상태가 사라집니다.
    *   **규칙:** [server-component-fetch], [component-refactor], [error-handling-nextjs]
    *   **검증 (AI):** `'use client'` 삭제 확인. 함수가 `async`인지 확인. `fetchCardById` 직접 호출 확인. `useEffect`/`useState` 로직 삭제 확인. `notFound` 호출 확인.
    *   **검증 (인간):** 카드 상세 페이지 접근 시 서버 렌더링으로 빠르게 데이터가 표시되는지 확인. 존재하지 않는 ID 접근 시 404 페이지 표시 확인. (테스트용) 에러 발생 시 500 에러 또는 `notFound` 동작 확인.

*   **Task ID:** `TQ-CARD-007`
    *   **작업:** Card 조회 관련 기존 API 라우트 제거.
    *   **지침:**
        1.  `src/app/api/cards/route.ts` 파일에서 `GET` 핸들러 함수를 **삭제**합니다.
        2.  `src/app/api/cards/[id]/route.ts` 파일에서 `GET` 핸들러 함수를 **삭제**합니다.
    *   **예상 결과:** Card 조회용 `/api/cards...` GET 엔드포인트가 제거됩니다.
    *   **규칙:** [remove-api-route]
    *   **검증 (AI):** 해당 파일들에서 `GET` 함수 정의가 없는지 확인.
    *   **검증 (인간):** 브라우저에서 해당 API 경로로 직접 GET 요청 시 404 또는 405 에러가 발생하는지 확인.

*   **Task ID:** `TQ-CARD-008` (2단계 최종 검증)
    *   **작업:** 2단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **꼼꼼히** 확인합니다:
        1.  **카드 목록 페이지 (`/cards`):**
            *   정상적으로 로드되고 카드 목록이 표시되는가?
            *   초기 로딩 시 (캐시 없을 때) 로딩 상태 UI가 표시되는가?
            *   (테스트용) `fetchCards` 함수 강제 에러 시 에러 메시지가 표시되는가?
            *   React Query DevTools에서 `['cards', ...]` 쿼리 상태 및 데이터 확인.
        2.  **카드 상세 페이지 (`/cards/[id]`):**
            *   서버 렌더링으로 데이터가 즉시 표시되는가?
            *   존재하지 않는 ID 접근 시 Next.js 404 페이지가 표시되는가?
            *   (테스트용) `fetchCardById` 함수 강제 에러 시 `notFound()` 또는 에러 페이지가 표시되는가?
            *   React Query DevTools에서 `['card', id]` 쿼리 상태 및 데이터 확인 (클라이언트에서 사용 시).
        3.  **API 라우트:** 브라우저에서 `/api/cards` 또는 `/api/cards/[id]` GET 요청 시 404/405 에러 확인.
    *   **예상 결과:** 카드 조회 기능이 TanStack Query(클라이언트) 또는 직접 서버 호출(서버 컴포넌트) 방식으로 안정적으로 동작하며, 불필요한 API 라우트가 제거됩니다.

---

### **3단계: Card 뮤테이션 적용 (Server Actions 사용)**

*   **Task ID:** `TQ-MUT-001`
    *   **작업:** `cardService.ts`에 카드 생성/수정/삭제 함수 구현.
    *   **지침:**
        1.  `src/services/cardService.ts` 파일을 엽니다.
        2.  파일 상단에 관련 타입 import 추가: `import { CreateCardInput, UpdateCardInput } from '@/types/card';`
        3.  아래 함수들을 `cardService.ts` 내부에 **정확히** 구현합니다 (기존 `/api/cards...` POST/PUT/DELETE 로직 참조):
            ```typescript
            // src/services/cardService.ts

            /**
             * 새 카드 생성 함수
             * @param data - 생성할 카드 데이터 (title, content, userId, tags)
             * @returns 생성된 카드 객체 Promise
             */
            export async function createCard(data: CreateCardInput): Promise<CardWithRelations> {
              const { title, content, userId, tags } = data;
              try {
                // TODO: 태그 처리 로직 추가 (기존 API 라우트의 processTagsForCard 참조)
                // 1. 고유 태그 추출
                // 2. 각 태그 이름으로 findUniqueOrCreate 실행하여 tag ID 얻기
                // 3. card 생성 시 cardTags connectOrCreate 사용

                const newCard = await prisma.card.create({
                  data: {
                    title,
                    content,
                    userId,
                    // cardTags: {
                    //   create: tags?.map(tagName => ({
                    //     tag: {
                    //       connectOrCreate: { where: { name: tagName }, create: { name: tagName } }
                    //     }
                    //   })) ?? []
                    // }
                  },
                  include: { // 생성 후 반환 시 관계 포함
                    user: { select: { id: true, name: true } },
                    cardTags: { include: { tag: true } },
                  }
                });

                // 임시: 태그 처리 분리 (트랜잭션 고려 필요)
                if (tags && tags.length > 0) {
                  await processTagsForNewCard(newCard.id, tags);
                }

                // 생성된 카드 다시 조회 (관계 포함 위해)
                const createdCardWithRelations = await fetchCardById(newCard.id);
                if (!createdCardWithRelations) throw new Error("Failed to fetch created card with relations");
                return createdCardWithRelations;

              } catch (error) {
                console.error('Error creating card:', error);
                throw new Error('카드 생성 중 오류가 발생했습니다.');
              }
            }

            // 임시 태그 처리 함수 (개선 필요 - 트랜잭션)
            async function processTagsForNewCard(cardId: string, tagNames: string[]) {
                const uniqueTags = [...new Set(tagNames.map(tag => tag.trim()).filter(Boolean))];
                for (const tagName of uniqueTags) {
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName },
                    });
                    await prisma.cardTag.create({
                        data: { cardId, tagId: tag.id }
                    });
                }
            }


            /**
             * 카드 수정 함수
             * @param id - 수정할 카드 ID
             * @param data - 수정할 카드 데이터 (title, content, tags)
             * @returns 수정된 카드 객체 Promise
             */
            export async function updateCard(id: string, data: UpdateCardInput): Promise<CardWithRelations> {
              const { title, content /*, tags */ } = data; // tags는 별도 처리 필요
              try {
                // TODO: 태그 업데이트 로직 추가
                // 1. 기존 CardTag 연결 모두 삭제
                // 2. 새 태그 목록으로 CardTag 다시 생성 (createCard 로직과 유사)
                // => Prisma 트랜잭션으로 묶는 것 권장

                const updatedCard = await prisma.card.update({
                  where: { id },
                  data: {
                    title,
                    content,
                    updatedAt: new Date(), // 수정 시각 업데이트
                  },
                   include: { // 업데이트 후 반환 시 관계 포함
                    user: { select: { id: true, name: true } },
                    cardTags: { include: { tag: true } },
                  }
                });
                return updatedCard;
              } catch (error) {
                console.error(`Error updating card with ID ${id}:`, error);
                throw new Error('카드 수정 중 오류가 발생했습니다.');
              }
            }

            /**
             * 카드 삭제 함수
             * @param id - 삭제할 카드 ID
             * @returns Promise<void>
             */
            export async function deleteCard(id: string): Promise<void> {
               if (!id) {
                  throw new Error('카드 ID가 필요합니다.');
              }
              try {
                // 연결된 CardTag 먼저 삭제 (선택적, Prisma가 자동으로 처리할 수도 있음)
                // await prisma.cardTag.deleteMany({ where: { cardId: id } });
                await prisma.card.delete({
                  where: { id },
                });
              } catch (error) {
                console.error(`Error deleting card with ID ${id}:`, error);
                // Prisma 에러 코드 확인 (예: P2025 - Record to delete does not exist)
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                   console.warn(`Card with ID ${id} not found for deletion.`);
                   // 이미 삭제된 경우 성공으로 처리할 수도 있음
                   return;
                }
                throw new Error('카드 삭제 중 오류가 발생했습니다.');
              }
            }
            ```
    *   **예상 결과:** `cardService.ts`에 Prisma를 사용하여 카드 생성, 수정, 삭제 로직이 구현됩니다. (태그 처리 로직은 TODO로 남겨두거나 기본 구현 포함)
    *   **규칙:** [service-layer-pattern], [prisma-orm], [error-handling]
    *   **검증 (AI):** `createCard`, `updateCard`, `deleteCard` 함수 정의 및 Prisma 호출 확인. 반환 타입 및 에러 처리 확인.
    *   **검증 (인간):** 코드 리뷰를 통해 로직 정확성 및 태그 처리 필요성 확인.

*   **Task ID:** `TQ-MUT-002`
    *   **작업:** Card 관련 Server Actions 생성.
    *   **지침:**
        1.  `src/actions/cardActions.ts` 파일을 새로 생성합니다.
        2.  파일 상단에 `'use server';` 지시어를 **정확히** 추가합니다.
        3.  필요한 import 문을 추가합니다:
            ```typescript
            import { revalidatePath } from 'next/cache';
            import { z } from 'zod';
            import { createCard, updateCard, deleteCard } from '@/services/cardService';
            import { CardWithRelations, CreateCardInput, UpdateCardInput } from '@/types/card'; // 타입 경로 확인 필요
            import { auth } from '@/lib/auth-server'; // 서버 액션 내 인증 확인용
            ```
        4.  (Optional) Zod 스키마 정의 (요청 데이터 유효성 검사용):
            ```typescript
            const CreateCardSchema = z.object({
              title: z.string().min(1, '제목 필수'),
              content: z.string().optional(),
              tags: z.array(z.string()).optional(),
            });
            const UpdateCardSchema = z.object({
              title: z.string().min(1, '제목 필수').optional(),
              content: z.string().optional(),
              tags: z.array(z.string()).optional(),
            });
            ```
        5.  아래 Server Action 함수들을 **정확히** 구현합니다:
            ```typescript
            // src/actions/cardActions.ts

            interface ActionResult<T = null> {
                success: boolean;
                error?: string;
                data?: T;
            }

            // --- Create Card Action ---
            export async function createCardAction(formData: FormData): Promise<ActionResult<CardWithRelations>> {
                const session = await auth(); // 1. 인증 확인
                if (!session?.user?.id) return { success: false, error: '인증 필요' };
                const userId = session.user.id;

                const rawData = {
                    title: formData.get('title') as string,
                    content: formData.get('content') as string | undefined,
                    tags: formData.getAll('tags') as string[], // 'tags[]' 형태로 넘어올 수 있음, 확인 필요
                };

                const validation = CreateCardSchema.safeParse(rawData); // 2. 유효성 검사
                if (!validation.success) {
                    return { success: false, error: validation.error.flatten().fieldErrors.toString() };
                }

                const inputData: CreateCardInput = { ...validation.data, userId };

                try {
                    const newCard = await createCard(inputData); // 3. 서비스 함수 호출
                    revalidatePath('/cards'); // 4. 캐시 무효화
                    return { success: true, data: newCard };
                } catch (error) {
                    console.error("[Server Action Error] createCardAction:", error);
                    return { success: false, error: error instanceof Error ? error.message : '카드 생성 실패' };
                }
            }

            // --- Update Card Action ---
            export async function updateCardAction(id: string, formData: FormData): Promise<ActionResult<CardWithRelations>> {
                 const session = await auth();
                 if (!session?.user?.id) return { success: false, error: '인증 필요' };
                 // TODO: 본인 카드만 수정 가능하도록 권한 검사 추가 (cardService에서 처리하거나 여기서)

                const rawData = {
                    title: formData.get('title') as string | undefined, // optional 필드는 undefined 가능
                    content: formData.get('content') as string | undefined,
                    tags: formData.getAll('tags') as string[] | undefined,
                };

                // 빈 값 제거 (undefined로 남겨야 update 시 해당 필드 무시 가능)
                const dataToValidate = Object.fromEntries(
                    Object.entries(rawData).filter(([_, v]) => v !== undefined)
                );

                const validation = UpdateCardSchema.safeParse(dataToValidate);
                if (!validation.success) {
                     return { success: false, error: validation.error.flatten().fieldErrors.toString() };
                 }

                 const inputData: UpdateCardInput = validation.data;

                 try {
                    const updatedCard = await updateCard(id, inputData);
                    revalidatePath('/cards');
                    revalidatePath(`/cards/${id}`); // 상세 페이지 캐시도 무효화
                    return { success: true, data: updatedCard };
                } catch (error) {
                    console.error(`[Server Action Error] updateCardAction (ID: ${id}):`, error);
                    return { success: false, error: error instanceof Error ? error.message : '카드 수정 실패' };
                }
            }

            // --- Delete Card Action ---
            export async function deleteCardAction(id: string): Promise<ActionResult> {
                 const session = await auth();
                 if (!session?.user?.id) return { success: false, error: '인증 필요' };
                 // TODO: 본인 카드만 삭제 가능하도록 권한 검사 추가

                 if (!id) return { success: false, error: '카드 ID 필요' };

                 try {
                    await deleteCard(id);
                    revalidatePath('/cards');
                    // 상세 페이지 캐시는 TanStack Query에서 removeQueries로 처리하는 것이 더 효율적일 수 있음
                    return { success: true };
                } catch (error) {
                    console.error(`[Server Action Error] deleteCardAction (ID: ${id}):`, error);
                    return { success: false, error: error instanceof Error ? error.message : '카드 삭제 실패' };
                }
            }
            ```
    *   **예상 결과:** 카드 CUD 작업을 수행하고 캐시를 무효화하는 Server Actions 함수들이 생성됩니다.
    *   **규칙:** [use-server-action], [server-action-validation], [cache-revalidation], [error-handling-server]
    *   **검증 (AI):** 각 액션 함수가 `'use server'` 지시어, 인증 확인, 유효성 검사(선택적), 서비스 함수 호출, `revalidatePath` 호출, 표준 결과 객체 반환 로직을 포함하는지 확인합니다.
    *   **검증 (인간):** 코드 리뷰 및 Server Action의 동작 방식 이해 확인.

*   **Task ID:** `TQ-MUT-003`
    *   **작업:** `useCreateCard`, `useUpdateCard`, `useDeleteCard` 뮤테이션 훅 생성.
    *   **지침:**
        1.  `src/hooks/mutations/` 디렉토리 생성 (없다면).
        2.  `useCreateCard.ts`, `useUpdateCard.ts`, `useDeleteCard.ts` 파일 생성.
        3.  각 파일에 아래 구조를 참고하여 `useMutation` 훅을 구현합니다.
            ```typescript
            // 예시: src/hooks/mutations/useCreateCard.ts
            import { useMutation, useQueryClient } from '@tanstack/react-query';
            import { toast } from 'sonner'; // 토스트 메시지용
            import { createCardAction } from '@/actions/cardActions'; // 이전 Task에서 생성
            import { CardWithRelations } from '@/types/card';

            export function useCreateCard() {
              const queryClient = useQueryClient();

              return useMutation<
                { success: boolean; data?: CardWithRelations; error?: string }, // Server Action 반환 타입
                Error, // onError 콜백의 error 타입
                FormData // mutate 함수에 전달될 변수 타입
              >({
                mutationFn: createCardAction, // Server Action 직접 사용
                onSuccess: (result, variables) => {
                  if (result.success && result.data) {
                    console.log('Card created successfully:', result.data);
                    toast.success('카드가 생성되었습니다.');
                    // 카드 목록 캐시 무효화
                    queryClient.invalidateQueries({ queryKey: ['cards'] });
                    // (Optional) 생성된 카드를 캐시에 직접 추가하여 즉시 반영
                    // queryClient.setQueryData(['cards'], (oldData: CardWithRelations[] | undefined) =>
                    //   oldData ? [...oldData, result.data!] : [result.data!]
                    // );
                  } else {
                    // Server Action 자체에서 에러를 반환한 경우
                    console.error('Failed to create card:', result.error);
                    toast.error(`카드 생성 실패: ${result.error || '알 수 없는 오류'}`);
                    // onError 콜백은 Server Action이 throw Error() 할 때만 호출됨
                  }
                },
                onError: (error, variables) => {
                  // 네트워크 오류 또는 Server Action 내부에서 throw된 에러 처리
                  console.error('Error during card creation mutation:', error);
                  toast.error(`카드 생성 중 오류 발생: ${error.message}`);
                },
                // (Optional) 낙관적 업데이트 설정
                // onMutate: async (newFormData) => { ... },
                // onError: (error, newFormData, context) => { queryClient.setQueryData(['cards'], context?.previousCards) },
                // onSettled: () => { queryClient.invalidateQueries({ queryKey: ['cards'] }) },
              });
            }

            // 예시: src/hooks/mutations/useUpdateCard.ts (유사하게 구현)
            // mutationFn: (vars: { id: string; formData: FormData }) => updateCardAction(vars.id, vars.formData)
            // onSuccess: invalidate 'cards' 및 'card', id

            // 예시: src/hooks/mutations/useDeleteCard.ts (유사하게 구현)
            // mutationFn: (id: string) => deleteCardAction(id)
            // onSuccess: invalidate 'cards', removeQuery 'card', id
            ```
    *   **예상 결과:** 카드 CUD 작업을 위한 TanStack Query 뮤테이션 훅들이 생성되어 Server Actions를 호출하고 캐시를 관리합니다.
    *   **규칙:** [tanstack-query-mutation], [integrate-server-action], [error-handling-client], [cache-invalidation]
    *   **검증 (AI):** 각 훅이 `useMutation` 사용, `mutationFn`으로 Server Action 지정, `onSuccess`/`onError` 콜백 구현, 캐시 무효화 로직 포함 확인.
    *   **검증 (인간):** 코드 리뷰 및 뮤테이션 훅의 동작 방식 이해 확인.

*   **Task ID:** `TQ-MUT-004`
    *   **작업:** 관련 컴포넌트에서 뮤테이션 훅 사용하도록 리팩토링.
    *   **지침:**
        1.  `src/components/cards/CreateCardModal.tsx`:
            *   `import { useCreateCard } from '@/hooks/mutations/useCreateCard';` 추가.
            *   컴포넌트 내에서 `const createCardMutation = useCreateCard();` 호출.
            *   폼 제출(`handleSubmit`) 시 `createCardMutation.mutate(formData);` 호출.
            *   `createCardMutation.isPending` (또는 `isLoading`) 상태를 사용하여 로딩 상태 표시 (예: 버튼 비활성화).
            *   기존 `fetch` 또는 `useAppStore` 액션 호출 로직 **삭제**.
        2.  `src/components/cards/EditCardForm.tsx` (또는 `EditCardModal.tsx`):
            *   `import { useUpdateCard } from '@/hooks/mutations/useUpdateCard';` 추가.
            *   `const updateCardMutation = useUpdateCard();` 호출.
            *   폼 제출 시 `updateCardMutation.mutate({ id: card.id, formData });` 호출.
            *   `updateCardMutation.isPending` 상태로 로딩 처리.
            *   기존 `fetch` 로직 **삭제**.
        3.  `src/app/cards/[id]/DeleteButton.tsx`:
            *   `import { useDeleteCard } from '@/hooks/mutations/useDeleteCard';` 추가.
            *   `const deleteCardMutation = useDeleteCard();` 호출.
            *   삭제 확인(`handleDelete`) 시 `deleteCardMutation.mutate(cardId);` 호출.
            *   `deleteCardMutation.isPending` 상태로 로딩 처리.
            *   기존 `fetch` 로직 **삭제**.
        4.  (필요시) `src/components/cards/CardList.tsx` 등 다른 컴포넌트도 유사하게 수정.
    *   **예상 결과:** 데이터 변경 작업을 수행하는 컴포넌트들이 TanStack Query 뮤테이션 훅을 통해 Server Actions를 호출하게 됩니다.
    *   **규칙:** [use-mutation-hook], [component-refactor]
    *   **검증 (AI):** 각 컴포넌트에서 뮤테이션 훅 import 및 사용 확인. `mutate` 함수 호출 확인. 기존 `fetch` 로직 삭제 확인. `isPending` 상태 사용 확인.
    *   **검증 (인간):** 코드 리뷰 및 UI에서 로딩 상태가 올바르게 표시되는지 확인.

*   **Task ID:** `TQ-MUT-005`
    *   **작업:** Card 생성/수정/삭제 관련 기존 API 라우트 제거.
    *   **지침:**
        1.  `src/app/api/cards/route.ts` 파일에서 `POST` 핸들러 함수를 **삭제**합니다.
        2.  `src/app/api/cards/[id]/route.ts` 파일에서 `PUT`, `DELETE` 핸들러 함수를 **삭제**합니다.
    *   **예상 결과:** Card CUD용 `/api/cards...` POST/PUT/DELETE 엔드포인트가 제거됩니다.
    *   **규칙:** [remove-api-route]
    *   **검증 (AI):** 해당 파일들에서 `POST`, `PUT`, `DELETE` 함수 정의가 없는지 확인.
    *   **검증 (인간):** 브라우저 또는 API 클라이언트에서 해당 API 경로로 POST/PUT/DELETE 요청 시 404/405 에러 확인.

*   **Task ID:** `TQ-MUT-006` (3단계 최종 검증)
    *   **작업:** 3단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **꼼꼼히** 확인합니다:
        1.  **카드 생성:** 새 카드 생성 후 목록에 즉시 (또는 잠시 후) 반영되는가? 뮤테이션 로딩 상태가 UI(버튼 등)에 반영되는가? 실패 시 에러 토스트 메시지가 표시되는가?
        2.  **카드 수정:** 카드 수정 후 목록 및 상세 페이지에 즉시 (또는 잠시 후) 반영되는가? 뮤테이션 로딩 상태가 반영되는가? 실패 시 에러 토스트가 표시되는가?
        3.  **카드 삭제:** 카드 삭제 후 목록에서 즉시 제거되는가? 뮤테이션 로딩 상태가 반영되는가? 실패 시 에러 토스트가 표시되는가?
        4.  **(Optional) 낙관적 업데이트:** 설정했다면, UI가 즉시 반영되고 실패 시 롤백되는지 확인.
        5.  **네트워크/DevTools:** 브라우저 네트워크 탭에서 Server Action 호출 확인 (기존 API 라우트 호출 없음 확인). React Query DevTools에서 뮤테이션 상태 및 캐시 무효화/업데이트 동작 확인.
    *   **예상 결과:** 카드 CRUD 기능이 TanStack Query 뮤테이션과 Server Actions를 통해 안정적으로 동작하며, 불필요한 API 라우트가 제거됩니다.

---

### **4단계: Tag 관리 리팩토링 (Server Actions 사용)**

*   **Task ID:** `TQ-TAG-001`
    *   **작업:** Tag 관련 서비스 함수 및 Server Actions 생성.
    *   **지침:** 3단계 (`TQ-MUT-001`, `TQ-MUT-002`) 와 **동일한 패턴**으로 진행합니다.
        1.  `src/services/tagService.ts` 생성 또는 업데이트: `fetchTags`, `createTag`, `deleteTag` 함수 구현 (Prisma 사용).
        2.  `src/actions/tagActions.ts` 생성: `'use server';`, `createTagAction`, `deleteTagAction` 구현 (tagService 호출, revalidatePath 등).
    *   **예상 결과:** Tag 관련 서비스 함수 및 Server Actions 생성 완료.
    *   **규칙:** [service-layer-pattern], [use-server-action]
    *   **검증 (AI):** 파일 및 함수 생성, 내부 로직 패턴 확인.

*   **Task ID:** `TQ-TAG-002`
    *   **작업:** Tag 관련 TanStack Query 훅 생성.
    *   **지침:** 3단계 (`TQ-MUT-003`) 와 **동일한 패턴**으로 진행합니다.
        1.  `src/hooks/queries/useTags.ts`, `src/hooks/mutations/useCreateTag.ts`, `src/hooks/mutations/useDeleteTag.ts` 생성.
        2.  `useQuery` (`['tags', ...]`, `fetchTags`) 및 `useMutation` (`createTagAction`/`deleteTagAction`, 캐시 무효화) 구현.
    *   **예상 결과:** Tag 관련 TanStack Query 훅 생성 완료.
    *   **규칙:** [tanstack-query-hook], [tanstack-query-mutation], [integrate-server-action]
    *   **검증 (AI):** 파일 및 훅 생성, `useQuery`/`useMutation` 사용 패턴, Server Action 호출, 캐시 무효화 로직 확인.

*   **Task ID:** `TQ-TAG-003`
    *   **작업:** Tag 관련 컴포넌트 리팩토링.
    *   **지침:** 3단계 (`TQ-MUT-004`) 와 **동일한 패턴**으로 진행합니다.
        1.  `TagList`: `useTags` 훅으로 데이터 로드, `useDeleteTag` 훅으로 삭제 기능 구현.
        2.  `TagForm`: `useCreateTag` 훅으로 생성 기능 구현.
        3.  `TagFilter`: `useTags` 훅으로 필터링 옵션 로드 (필요시).
        4.  기존 `fetch` 또는 직접 API 호출 로직 제거.
    *   **예상 결과:** Tag 관련 컴포넌트가 TanStack Query 훅 사용.
    *   **규칙:** [use-query-hook], [use-mutation-hook], [component-refactor]
    *   **검증 (AI):** 컴포넌트 내 TanStack Query 훅 사용 및 기존 로직 제거 확인.

*   **Task ID:** `TQ-TAG-004`
    *   **작업:** Tag 관련 기존 API 라우트 제거.
    *   **지침:** 3단계 (`TQ-MUT-005`) 와 **동일한 패턴**으로 진행합니다.
        1.  `src/app/api/tags/route.ts` (GET, POST) 삭제.
        2.  `src/app/api/tags/[id]/route.ts` (GET, PUT, DELETE) 삭제.
    *   **예상 결과:** Tag 관련 API 라우트 제거 완료.
    *   **규칙:** [remove-api-route]
    *   **검증 (AI):** 해당 API 라우트 파일 삭제 또는 핸들러 함수 제거 확인.

*   **Task ID:** `TQ-TAG-005` (4단계 최종 검증)
    *   **작업:** 4단계 리팩토링 후 기능 검증.
    *   **지침:** 3단계 (`TQ-MUT-006`) 와 유사하게 진행합니다.
        1.  태그 목록 페이지 (`/tags`)에서 목록 조회, 새 태그 생성, 기존 태그 삭제 기능이 정상 동작하는지 확인합니다.
        2.  성공/실패 시 UI 업데이트 (목록 갱신, 로딩 상태, 토스트 메시지)가 올바른지 확인합니다.
        3.  React Query DevTools에서 태그 관련 쿼리/뮤테이션 상태 및 캐시 무효화 동작을 확인합니다.
        4.  브라우저 네트워크 탭에서 Tag 관련 API 라우트 호출이 없는지 확인합니다.
    *   **예상 결과:** 태그 관리 기능이 TanStack Query + Server Actions 기반으로 안정적으로 동작하며, 불필요한 API 라우트가 제거됩니다.

---

### **5단계: Zustand 스토어 리팩토링 (슬라이스 및 UI 상태 집중)**

*   **Task ID:** `ZS-SLICE-001`
    *   **작업:** `useAppStore` 슬라이스 구조 정의 및 파일 생성.
    *   **지침:**
        1.  `src/store/slices` 디렉토리 생성 (없다면).
        2.  다음 파일들을 생성합니다: `createUiSlice.ts`, `createCardStateSlice.ts`, `createThemeSlice.ts`.
        3.  각 파일에 아래와 같은 기본 구조를 작성합니다. (타입과 액션은 다음 Task에서 정의)
            ```typescript
            // 예시: src/store/slices/createUiSlice.ts
            import { StateCreator } from 'zustand';

            export interface UiSlice {
              // 상태 타입 정의 예정
              // 액션 타입 정의 예정
            }

            export const createUiSlice: StateCreator<
              UiSlice // & 다른 슬라이스 타입들... - 루트 스토어에서 사용될 타입
              // [[], [], []] // 미들웨어 타입 (필요시)
              // UiSlice // 이 슬라이스가 반환할 타입
            > = (set, get) => ({
              // 상태 초기값 및 액션 구현 예정
            });
            ```
    *   **예상 결과:** Zustand 슬라이스 파일 구조가 생성됩니다.
    *   **규칙:** [zustand-slice-pattern]
    *   **검증 (AI):** `src/store/slices` 디렉토리 및 해당 파일 3개 생성 확인. 각 파일에 `StateCreator` 사용 기본 구조 확인.

*   **Task ID:** `ZS-SLICE-002`
    *   **작업:** UI 관련 상태 및 액션 `createUiSlice`로 이동.
    *   **지침:**
        1.  `src/store/slices/createUiSlice.ts` 파일을 엽니다.
        2.  `UiSlice` 인터페이스에 다음 상태와 액션을 **정확히** 정의합니다:
            ```typescript
            export interface UiSlice {
              isSidebarOpen: boolean;
              sidebarWidth: number;
              setSidebarOpen: (open: boolean) => void;
              toggleSidebar: () => void;
              setSidebarWidth: (width: number) => void;
            }
            ```
        3.  `createUiSlice` 함수 내부에 초기 상태와 액션 구현을 **정확히** 추가합니다 (기존 `useAppStore` 로직 이동):
            ```typescript
            export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
              isSidebarOpen: true, // 기본값 설정
              sidebarWidth: 320, // 기본값 설정
              setSidebarOpen: (open) => set({ isSidebarOpen: open }),
              toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
              setSidebarWidth: (width) => set({ sidebarWidth: width }),
            });
            ```
    *   **예상 결과:** `createUiSlice` 구현 완료.
    *   **규칙:** [zustand-slice-refactor]
    *   **검증 (AI):** `UiSlice` 인터페이스 및 `createUiSlice` 함수 구현 내용이 지침과 일치하는지 확인.

*   **Task ID:** `ZS-SLICE-003`
    *   **작업:** 카드 선택/확장 상태 및 액션 `createCardStateSlice`로 이동 및 통합.
    *   **지침:**
        1.  `src/store/slices/createCardStateSlice.ts` 파일을 엽니다.
        2.  `CardStateSlice` 인터페이스에 다음 상태와 액션을 **정확히** 정의합니다:
            ```typescript
            export interface CardStateSlice {
              selectedCardIds: string[];
              expandedCardId: string | null;
              // 액션 정의
              selectCards: (ids: string | string[]) => void; // 단일/다중 선택 처리
              toggleExpandCard: (id: string) => void;
              clearSelectedCards: () => void;
              addSelectedCard: (id: string) => void; // 다중 선택 보조 액션
              removeSelectedCard: (id: string) => void; // 다중 선택 보조 액션
            }
            ```
        3.  `createCardStateSlice` 함수 내부에 초기 상태와 액션 구현을 **정확히** 추가합니다 (기존 `useAppStore` 로직 이동 및 통합):
            ```typescript
            export const createCardStateSlice: StateCreator<CardStateSlice, [], [], CardStateSlice> = (set, get) => ({
              selectedCardIds: [],
              expandedCardId: null,
              selectCards: (ids) => {
                const newIds = Array.isArray(ids) ? ids : (ids ? [ids] : []);
                set({ selectedCardIds: newIds });
                // 단일 선택 시 확장 상태는 닫음 (옵션)
                if (newIds.length <= 1) {
                   set({ expandedCardId: null });
                }
              },
              toggleExpandCard: (id) => set((state) => ({
                expandedCardId: state.expandedCardId === id ? null : id
              })),
              clearSelectedCards: () => set({ selectedCardIds: [], expandedCardId: null }),
              // 다중 선택 보조 액션 구현 (기존 toggleSelectedCard 로직 활용)
              addSelectedCard: (id) => set((state) => ({
                  selectedCardIds: state.selectedCardIds.includes(id)
                      ? state.selectedCardIds
                      : [...state.selectedCardIds, id]
              })),
              removeSelectedCard: (id) => set((state) => ({
                  selectedCardIds: state.selectedCardIds.filter(cardId => cardId !== id)
              })),
              // 기존 toggleSelectedCard는 UI 레벨에서 add/remove 조합으로 대체 가능
            });
            ```
    *   **예상 결과:** `createCardStateSlice` 구현 완료, `selectCards` 액션으로 선택 로직 통합.
    *   **규칙:** [zustand-slice-refactor], [refactor-duplicate-logic]
    *   **검증 (AI):** `CardStateSlice` 인터페이스 및 `createCardStateSlice` 함수 구현 내용 확인. `selectCards` 액션 로직 확인.
    *   **검증 (인간):** 코드 리뷰 통해 선택 로직 통합의 정확성 확인.

*   **Task ID:** `ZS-SLICE-004`
    *   **작업:** 테마 관련 상태 및 액션 `createThemeSlice`로 이동 (`ThemeContext` 로직 통합).
    *   **지침:**
        1.  `src/store/slices/createThemeSlice.ts` 파일을 엽니다.
        2.  기존 `src/contexts/ThemeContext.tsx` 파일에서 `Theme` 인터페이스 정의를 복사하여 붙여넣거나 import 합니다. (만약 `Theme` 타입이 다른 곳에 정의되어 있다면 해당 경로 사용)
            ```typescript
            import { Theme, defaultTheme } from '@/contexts/ThemeContext'; // 기존 경로 가정
            // 또는 타입을 직접 정의
            // export interface NodeTheme { ... } ... export interface Theme { ... }
            // const defaultTheme: Theme = { ... };
            ```
        3.  `ThemeSlice` 인터페이스에 다음 상태와 액션을 **정확히** 정의합니다:
            ```typescript
            export interface ThemeSlice {
              theme: Theme;
              updateTheme: (partialTheme: Partial<Theme>) => void;
              updateNodeSize: (width: number, height: number, maxHeight?: number) => void;
            }
            ```
        4.  `createThemeSlice` 함수 내부에 초기 상태와 액션 구현을 **정확히** 추가합니다 (기존 `ThemeContext` 로직 이동):
            ```typescript
            export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set, get) => ({
              theme: defaultTheme, // ThemeContext의 기본값 사용
              updateTheme: (partialTheme) => set((state) => ({
                theme: { ...state.theme, ...partialTheme } // 단순 병합 예시, 깊은 병합 필요시 로직 추가
              })),
              updateNodeSize: (width, height, maxHeight) => set((state) => ({
                theme: {
                  ...state.theme,
                  node: {
                    ...state.theme.node,
                    width,
                    height,
                    ...(maxHeight !== undefined && { maxHeight }), // maxHeight가 있으면 업데이트
                  }
                }
              })),
            });
            ```
    *   **예상 결과:** `createThemeSlice` 구현 완료.
    *   **규칙:** [zustand-slice-refactor], [remove-context-api]
    *   **검증 (AI):** `ThemeSlice` 인터페이스 및 `createThemeSlice` 함수 구현 내용 확인. `Theme` 타입 import/정의 확인.

*   **Task ID:** `ZS-SLICE-005`
    *   **작업:** 루트 스토어(`useAppStore.ts`) 업데이트 (슬라이스 결합).
    *   **지침:**
        1.  `src/store/useAppStore.ts` 파일을 엽니다.
        2.  파일 상단에 각 슬라이스 생성 함수와 타입을 import 합니다:
            ```typescript
            import { create } from 'zustand';
            import { createUiSlice, UiSlice } from './slices/createUiSlice';
            import { createCardStateSlice, CardStateSlice } from './slices/createCardStateSlice';
            import { createThemeSlice, ThemeSlice } from './slices/createThemeSlice';
            // 다른 슬라이스가 있다면 추가 import
            ```
        3.  루트 스토어의 전체 상태 타입을 정의합니다:
            ```typescript
            type StoreState = UiSlice & CardStateSlice & ThemeSlice /* & OtherSlices */;
            ```
        4.  `create` 함수 호출 부분을 **정확히** 다음과 같이 수정합니다:
            ```typescript
            export const useAppStore = create<StoreState>()((...a) => ({
              ...createUiSlice(...a),
              ...createCardStateSlice(...a),
              ...createThemeSlice(...a),
              // ... 다른 슬라이스 결합 ...
            }));
            ```
        5.  기존 `useAppStore` 파일 내에 있던 상태 정의 및 액션 구현 중, 각 슬라이스로 **이동된 부분들을 모두 삭제**합니다.
    *   **예상 결과:** `useAppStore`가 슬라이스 조합으로 재구성되고, 이전의 중복 정의가 제거됩니다.
    *   **규칙:** [zustand-slice-pattern]
    *   **검증 (AI):** 슬라이스 import, `StoreState` 타입 정의, `create` 함수 내 슬라이스 결합 확인. 기존 상태/액션 정의 삭제 확인.
    *   **검증 (인간):** 코드 리뷰 및 (Optional) Zustand DevTools에서 스토어 구조 확인.

*   **Task ID:** `ZS-SLICE-006`
    *   **작업:** `ThemeContext` 제거 및 관련 컴포넌트 수정.
    *   **지침:**
        1.  `src/contexts/ThemeContext.tsx` 파일을 **삭제**합니다.
        2.  `src/components/layout/ClientLayout.tsx` 파일에서 `ThemeProvider` import 문과 `<ThemeProvider>` 태그를 **삭제**합니다.
        3.  프로젝트 전체에서 `useTheme` 훅을 사용하던 컴포넌트(예: `NodeSizeSettings`, `CardNode`, `CustomEdge`)를 찾습니다.
        4.  해당 컴포넌트에서 `useTheme` 훅 호출 부분을 **삭제**하고, `useAppStore` 를 import 하여 필요한 테마 상태를 가져오도록 수정합니다.
            ```typescript
            // 예시: CardNode.tsx
            import { useAppStore } from '@/store/useAppStore';

            // ... 컴포넌트 내부 ...
            // const { theme, updateNodeSize } = useTheme(); // 삭제
            const theme = useAppStore((state) => state.theme); // theme 상태 가져오기
            const updateNodeSize = useAppStore((state) => state.updateNodeSize); // 액션 가져오기
            ```
    *   **예상 결과:** `ThemeContext`가 완전히 제거되고, 테마 관련 상태/액션은 Zustand 스토어를 통해 접근합니다.
    *   **규칙:** [remove-context-api], [use-zustand-selector], [component-refactor]
    *   **검증 (AI):** `ThemeContext.tsx` 파일 삭제 확인. `ClientLayout.tsx` 수정 확인. `useTheme` 사용 컴포넌트에서 `useAppStore` 사용으로 변경 확인.
    *   **검증 (인간):** 앱 빌드 및 실행 시 테마 관련 에러 없는지 확인. 테마(노드 크기 등) 관련 기능 정상 동작 확인.

*   **Task ID:** `ZS-SLICE-007`
    *   **작업:** 기존 `useAppStore` 사용 부분 업데이트 (슬라이스 기반 접근).
    *   **지침:** 프로젝트 전체에서 `useAppStore()` 를 호출하는 부분을 찾습니다. 상태나 액션을 구조 분해 할당으로 가져오는 대신, 필요한 부분만 **선택자(selector)**를 사용하여 가져오도록 수정합니다.
        *   **변경 전 예시:** `const { isSidebarOpen, toggleSidebar } = useAppStore();`
        *   **변경 후 예시:**
            ```typescript
            const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
            const toggleSidebar = useAppStore((state) => state.toggleSidebar);
            // 또는 여러 개 필요시:
            // const { isSidebarOpen, sidebarWidth } = useAppStore(
            //   (state) => ({ isSidebarOpen: state.isSidebarOpen, sidebarWidth: state.sidebarWidth }),
            //   shallow // 객체 반환 시 shallow 비교 필수 (zustand/shallow import 필요)
            // );
            ```
        *   **수정 대상 파일:** `Sidebar.tsx`, `MainToolbar.tsx`, `ProjectToolbar.tsx`, `IdeaMap.tsx` 등 `useAppStore`를 사용하는 모든 컴포넌트 및 훅.
    *   **예상 결과:** 모든 컴포넌트가 최적화된 방식으로 새로운 Zustand 스토어 구조를 사용합니다. 불필요한 리렌더링이 감소합니다.
    *   **규칙:** [use-zustand-selector], [performance-optimization]
    *   **검증 (AI):** `useAppStore()` 호출 부분에서 선택자 함수 사용 확인. `shallow` import 및 사용 확인 (객체 반환 시).
    *   **검증 (인간):** 앱 기능 동작 확인 및 (Optional) React DevTools Profiler로 리렌더링 최적화 여부 확인.

*   **Task ID:** `ZS-SLICE-008` (5단계 최종 검증)
    *   **작업:** 5단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **꼼꼼히** 확인합니다:
        1.  **UI 상태:** 사이드바 열기/닫기, 너비 조절 기능이 정상 동작하는가?
        2.  **카드 상태:** 카드 선택(단일/다중) 및 확장 기능이 정상 동작하며, 관련 UI(예: 사이드바 하이라이트)가 연동되는가?
        3.  **테마 상태:** 테마 관련 기능(예: `NodeSizeSettings` 컴포넌트 UI)이 상태를 올바르게 반영하고, 액션 호출 시 상태가 변경되는가?
        4.  **DevTools:** (Optional) Zustand DevTools에서 스토어 상태가 슬라이스 구조(`ui`, `cardState`, `theme` 등)로 명확히 분리되어 표시되는가?
        5.  **코드:** `ThemeContext` 관련 코드가 프로젝트에서 완전히 제거되었는가?
        6.  **콘솔:** 브라우저 콘솔에 관련 에러가 없는가?
    *   **예상 결과:** Zustand 스토어가 슬라이스 패턴으로 성공적으로 재구성되고, 클라이언트 UI 상태 관리가 일원화되며, 불필요한 리렌더링이 최적화됩니다.

---

### **6단계: IdeaMap 상태 관리 및 로직 분리**

*   **Task ID:** `IMAP-001`
    *   **작업:** `useIdeaMapStore` 리팩토링 (React Flow UI 상태 집중).
    *   **지침:**
        1.  `src/store/useIdeaMapStore.ts` 파일을 엽니다.
        2.  **유지할 상태/액션:** `reactFlowInstance`, `viewport`, `nodes`, `edges` (React Flow 컴포넌트에 직접 전달될 상태), `setNodes`, `setEdges`, `onNodesChange`, `onEdgesChange` (React Flow 콜백), `setViewport`, `setReactFlowInstance`.
        3.  **제거할 상태/액션 (커스텀 훅으로 이동 대상):** `loadIdeaMapData`, `saveLayout`, `saveEdges`, `applyLayout`, `syncCardsWithNodes`, `addNodeAtPosition`, `addCardAtCenterPosition`, `createEdgeAndNodeOnDrop`, `ideaMapSettings` (설정 상태는 AppStore로 이동), `loadedViewport`, `needsFitView` 등 데이터 로딩/저장/변환/레이아웃 관련 로직.
        4.  (Optional) `persist` 미들웨어를 사용하여 `viewport` 상태를 저장할 수 있습니다. `nodes`, `edges`는 데이터 동기화 훅에서 관리하므로 persist 대상에서 제외합니다.
    *   **예상 결과:** `useIdeaMapStore`는 React Flow의 UI 상태와 직접적인 콜백 함수 관리에만 집중하게 됩니다.
    *   **규칙:** [zustand-refactor], [separation-of-concerns]
    *   **검증 (AI):** 제거 대상 상태/액션이 `useIdeaMapStore` 정의에서 삭제되었는지 확인. 유지 대상 상태/액션이 남아있는지 확인.
    *   **검증 (인간):** 코드 리뷰를 통해 스토어 역할이 명확해졌는지 확인.

*   **Task ID:** `IMAP-002`
    *   **작업:** `useIdeaMapSync` 훅 생성 (데이터 동기화 담당).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapSync.ts` 파일을 새로 생성합니다.
        2.  필요한 import 문 추가: `useEffect`, `useState`, `useCallback`, `useMemo`, `useCards`, `Node`, `Edge`, `useIdeaMapStore`, `CardWithRelations`, `utils/ideamap-graphUtils` (레이아웃 로드 함수 가정), `utils/layout-utils` (`cardsToCardNodes` 함수 가정).
        3.  훅 시그니처 정의: `export function useIdeaMapSync(): { isLoading: boolean; error: Error | null; }` (훅 자체는 로딩/에러 상태만 반환하고, 실제 노드/엣지 업데이트는 스토어 액션 호출).
        4.  내부 로직 구현:
            *   `useCards()` 훅 호출하여 카드 데이터(`cardsData`, `isLoading`, `error`) 가져오기.
            *   `useIdeaMapStore`의 `setNodes`, `setEdges` 액션 가져오기.
            *   `useEffect` 훅 사용:
                *   `cardsData`가 변경될 때 실행.
                *   로컬 스토리지 또는 다른 곳에서 노드 위치(`savedPositions`) 및 엣지 정보(`savedEdges`) 로드 (예: `loadLayout`, `loadEdges` 유틸리티 함수 사용).
                *   `cardsToCardNodes(cardsData, savedPositions)` 함수를 호출하여 `nodes` 배열 생성 (카드 데이터를 React Flow 노드 형식으로 변환하고 저장된 위치 적용).
                *   로드한 `savedEdges` 또는 카드 관계 기반으로 생성된 `edges` 배열 준비.
                *   `useIdeaMapStore`의 `setNodes(nodes)` 및 `setEdges(edges)` 호출하여 스토어 상태 업데이트.
                *   데이터 로딩 상태(`isLoading`, `error`) 관리 및 반환.
            ```typescript
            // src/hooks/ideamap/useIdeaMapSync.ts (구조 예시)
            import { useEffect, useState, useCallback } from 'react';
            import { useCards } from '@/hooks/queries/useCards';
            import { useIdeaMapStore } from '@/store/useIdeaMapStore';
            import { loadLayout, loadEdges } from '@/components/ideamap/utils/ideamap-graphUtils'; // 유틸 함수 경로 확인
            import { cardsToCardNodes } from '@/lib/layout-utils'; // 유틸 함수 경로 확인
            import { Node, Edge } from '@xyflow/react';
            import { CardData } from '@/components/ideamap/types/ideamap-types';

            export function useIdeaMapSync() {
              const { data: cardsData, isLoading: isCardsLoading, error: cardsError } = useCards(); // TQ 훅
              const setNodes = useIdeaMapStore((state) => state.setNodes);
              const setEdges = useIdeaMapStore((state) => state.setEdges);

              const [isLoading, setIsLoading] = useState(true);
              const [error, setError] = useState<Error | null>(null);

              const syncData = useCallback(async () => {
                setIsLoading(true);
                setError(null);

                if (isCardsLoading) return; // 카드 데이터 로딩 중이면 대기

                if (cardsError) {
                  setError(cardsError);
                  setIsLoading(false);
                  return;
                }

                if (!cardsData) {
                   console.warn("No card data available for sync.");
                   setNodes([]); // 카드 없으면 노드 비움
                   setEdges([]); // 엣지도 비움
                   setIsLoading(false);
                   return;
                }

                try {
                  const savedPositions = loadLayout(); // 로컬 스토리지 등에서 위치 로드
                  const savedEdges = loadEdges();     // 로컬 스토리지 등에서 엣지 로드

                  // 카드 데이터를 React Flow 노드로 변환하고 위치 적용
                  const nodes = cardsToCardNodes(cardsData as CardData[], savedPositions);

                  // TODO: 엣지 생성 로직 (savedEdges 또는 카드 관계 기반)
                  const edges = savedEdges || []; // 임시

                  // IdeaMap 스토어 업데이트
                  setNodes(nodes);
                  setEdges(edges);

                } catch (err) {
                   console.error("Error during ideamap sync:", err);
                   setError(err instanceof Error ? err : new Error('Failed to sync ideamap data'));
                } finally {
                   setIsLoading(false);
                }
              // eslint-disable-next-line react-hooks/exhaustive-deps
              }, [cardsData, isCardsLoading, cardsError, setNodes, setEdges]); // 의존성 배열 최적화 필요

              useEffect(() => {
                syncData();
              }, [syncData]);

              return { isLoading: isLoading || isCardsLoading, error };
            }
            ```
    *   **예상 결과:** 서버 카드 데이터와 로컬 레이아웃 정보를 동기화하여 `useIdeaMapStore`의 `nodes`와 `edges` 상태를 업데이트하는 훅 구현.
    *   **규칙:** [react-hook], [data-synchronization], [custom-hook-creation], [separation-of-concerns]
    *   **검증 (AI):** 훅 시그니처, `useCards` 호출, 로컬 스토리지 로드 함수 호출, `cardsToCardNodes` 호출, `setNodes`/`setEdges` 호출 확인.
    *   **검증 (인간):** 코드 리뷰, 데이터 동기화 로직의 정확성 확인.

*   **Task ID:** `IMAP-003`
    *   **작업:** `useIdeaMapInteractions` 훅 생성/리팩토링 (사용자 상호작용 처리).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapInteractions.ts` 파일 생성 또는 기존 핸들러 로직 이동.
        2.  필요한 import 문 추가: `useCallback`, `Node`, `Edge`, `Connection`, `NodeMouseHandler`, `OnConnectStart`, `OnConnectEnd`, `useAppStore`, `useCreateCard` 등.
        3.  훅 시그니처 정의: `export function useIdeaMapInteractions(): { onNodeClick: NodeMouseHandler, ... }` (필요한 핸들러 반환).
        4.  각 핸들러 함수 구현 (기존 `IdeaMap.tsx` 또는 `useIdeaMapHandlers.ts` 로직 이동):
            *   `onNodeClick`: `event.stopPropagation()`, 다중 선택 로직 (`event.ctrlKey`/`metaKey`), `useAppStore`의 `selectCards` 또는 `addSelectedCard`/`removeSelectedCard` 호출.
            *   `onPaneClick`: `clearSelectedCards()` 호출.
            *   `onConnect`: `useIdeaMapStore`의 `addEdge` 또는 (만약 엣지를 서버에 저장한다면) `useCreateEdge().mutate(...)` 호출.
            *   `onNodesDelete`, `onEdgesDelete`: (필요시) 관련 상태 업데이트 또는 뮤테이션 호출.
            *   `onDrop`: 드롭된 데이터 타입 확인 (카드 노드 생성 시), `useCreateCard().mutate(...)` 호출 (위치 정보 포함 필요).
            *   `onDragOver`: `event.preventDefault()`, `event.dataTransfer.dropEffect = 'move'`.
            *   `onConnectStart`, `onConnectEnd`: (엣지 드롭 시 노드 생성 기능 구현 시) 관련 상태 관리 및 `useCreateCard` 호출 로직.
        5.  구현된 핸들러 함수들을 객체로 반환합니다.
    *   **예상 결과:** IdeaMap 사용자 상호작용(클릭, 연결, 드롭 등)을 처리하는 훅 구현.
    *   **규칙:** [react-hook], [event-handling], [custom-hook-creation]
    *   **검증 (AI):** 훅 시그니처, 각 핸들러 함수 구현, Zustand 액션 및 TQ 뮤테이션 호출 확인.
    *   **검증 (인간):** 코드 리뷰 및 각 상호작용 로직의 정확성 확인.

*   **Task ID:** `IMAP-004`
    *   **작업:** `useIdeaMapLayout` 훅 생성/리팩토링 (레이아웃 관리).
    *   **지침:**
        1.  `src/hooks/ideamap/useIdeaMapLayout.ts` 파일 생성 또는 기존 로직 이동.
        2.  필요한 import 문 추가: `useCallback`, `useReactFlow`, `useIdeaMapStore`, `getLayoutedElements`, `getGridLayout`, `saveLayout` 등.
        3.  훅 시그니처 정의: `export function useIdeaMapLayout(): { applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void, saveCurrentLayout: () => void, ... }`.
        4.  `applyLayout` 함수 구현:
            *   `useReactFlow` 훅으로 `getNodes`, `getEdges`, `fitView` 가져오기.
            *   `useIdeaMapStore` 훅으로 `setNodes` 액션 가져오기.
            *   `direction` 값에 따라 `getLayoutedElements` 또는 `getGridLayout` 호출하여 새 노드 위치 계산.
            *   계산된 노드로 `setNodes` 호출하여 상태 업데이트.
            *   `fitView` 호출하여 뷰 조정.
        5.  `saveCurrentLayout` 함수 구현:
            *   `useReactFlow` 훅으로 `getNodes` 가져오기.
            *   `saveLayout(nodes)` 유틸리티 함수 호출하여 로컬 스토리지 등에 저장.
        6.  (Optional) 레이아웃 로드 함수 구현.
        7.  구현된 함수들을 반환합니다.
    *   **예상 결과:** IdeaMap 레이아웃 계산, 적용, 저장/로드 로직을 관리하는 훅 구현.
    *   **규칙:** [react-hook], [layout-logic], [custom-hook-creation]
    *   **검증 (AI):** 훅 시그니처, `useReactFlow`/`useIdeaMapStore` 사용, 레이아웃 유틸 함수 호출, `setNodes`/`fitView` 호출 확인.
    *   **검증 (인간):** 코드 리뷰 및 자동 레이아웃 로직 정확성 확인.

*   **Task ID:** `IMAP-005`
    *   **작업:** `IdeaMap.tsx` 컴포넌트 리팩토링 (훅 사용).
    *   **지침:**
        1.  `src/components/ideamap/components/IdeaMap.tsx` 파일을 엽니다.
        2.  컴포넌트 내부의 상태 관리 및 이벤트 핸들러 로직을 **모두 삭제**합니다.
        3.  다음 훅들을 import하고 호출합니다:
            *   `const { isLoading, error } = useIdeaMapSync();`
            *   `const { nodes, edges, onNodesChange, onEdgesChange, viewport, setViewport, reactFlowInstance, setReactFlowInstance } = useIdeaMapStore(...)` (필요한 상태/액션만 선택)
            *   `const { onNodeClick, onPaneClick, onConnect, onDrop, onDragOver, ... } = useIdeaMapInteractions();`
            *   `const { applyLayout, saveCurrentLayout } = useIdeaMapLayout();` (툴바 등에서 사용)
        4.  `ReactFlow` 컴포넌트에 props를 전달합니다:
            *   `nodes={nodes}`
            *   `edges={edges}`
            *   `onNodesChange={onNodesChange}`
            *   `onEdgesChange={onEdgesChange}`
            *   `onConnect={onConnect}`
            *   `onNodeClick={onNodeClick}`
            *   `onPaneClick={onPaneClick}`
            *   `onDrop={onDrop}`
            *   `onDragOver={onDragOver}`
            *   `onInit={setReactFlowInstance}`
            *   `viewport={viewport}`
            *   `onViewportChange={(vp) => setViewport(vp)}`
            *   기타 React Flow 설정 props (nodeTypes, edgeTypes 등)
        5.  `isLoading`, `error` 상태를 사용하여 로딩/에러 UI를 렌더링합니다.
    *   **예상 결과:** `IdeaMap.tsx` 컴포넌트가 매우 간결해지고, 상태 관리 및 로직은 분리된 커스텀 훅을 통해 주입됩니다.
    *   **규칙:** [component-refactor], [use-custom-hook], [separation-of-concerns]
    *   **검증 (AI):** 컴포넌트 내 로컬 상태/핸들러 로직 삭제 확인. 커스텀 훅 호출 및 `ReactFlow` props 바인딩 확인.
    *   **검증 (인간):** 코드 리뷰 및 IdeaMap UI가 이전과 동일하게 렌더링되고 상호작용하는지 확인.

*   **Task ID:** `IMAP-006`
    *   **작업:** `useNodeStore` 제거 또는 통합.
    *   **지침:**
        1.  `src/store/useNodeStore.ts` 파일이 존재하면 **삭제**합니다.
        2.  `NodeInspector.tsx` 또는 관련 컴포넌트에서 `useNodeStore` 사용 부분을 수정합니다.
        3.  **옵션:**
            *   노드 인스펙터 상태(`inspectedNode`, `inspectorOpen`)를 `IdeaMap.tsx` 컴포넌트의 로컬 `useState`로 관리하고, `onNodeClick` 핸들러(`useIdeaMapInteractions`)에서 해당 상태를 업데이트하도록 수정합니다.
            *   또는, `useIdeaMapInteractions` 훅 내부에 인스펙터 상태와 관련 로직(노드 클릭 시 상태 업데이트)을 포함시키고, 훅이 이 상태와 액션을 반환하도록 합니다.
            *   또는, `createNodeInspectorSlice`를 `useAppStore`에 추가합니다. (전역 상태 필요성이 낮아 권장하지 않음)
    *   **예상 결과:** `useNodeStore`가 제거되고, 노드 인스펙터 상태는 로컬 상태 또는 다른 훅/스토어로 통합됩니다.
    *   **규칙:** [remove-redundant-store], [refactor-state-location]
    *   **검증 (AI):** `useNodeStore.ts` 파일 삭제 확인. 관련 컴포넌트에서 `useNodeStore` 대신 로컬 상태 또는 다른 훅/스토어 사용 확인.
    *   **검증 (인간):** 노드 인스펙터 기능이 이전과 동일하게 동작하는지 확인.

*   **Task ID:** `IMAP-007` (6단계 최종 검증)
    *   **작업:** 6단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **꼼꼼히** 확인합니다:
        1.  **데이터 로드:** IdeaMap이 카드 데이터를 기반으로 노드와 엣지를 올바르게 렌더링하는가? (초기 로딩 포함)
        2.  **동기화:** 카드 목록(Sidebar)에서 카드를 추가/수정/삭제했을 때 IdeaMap에 즉시 반영되는가?
        3.  **상호작용:**
            *   노드 클릭 시 카드 선택 상태가 `useAppStore`에 반영되고 Sidebar 등과 연동되는가?
            *   노드 드래그, 엣지 연결, 빈 공간 클릭(선택 해제) 등이 정상 동작하는가?
            *   (카드 생성 드롭 기능 구현 시) 드롭으로 카드 생성이 잘 되는가?
        4.  **레이아웃:** 자동 레이아웃 적용 버튼 클릭 시 노드 배치가 변경되고, 레이아웃 저장/로드 기능이 동작하는가?
        5.  **인스펙터:** (구현했다면) 노드 인스펙터 기능이 정상 동작하는가?
        6.  **코드 구조:** `useIdeaMapStore` 코드가 간결해지고 UI 상태 관리에 집중하는지, 로직이 커스텀 훅으로 잘 분리되었는지 확인. `useNodeStore` 관련 코드가 제거되었는지 확인.
    *   **예상 결과:** IdeaMap 관련 상태 및 로직이 효과적으로 분리되고, 데이터 동기화 및 사용자 상호작용이 이전과 동일하거나 개선되어 동작합니다.

---

### **7단계: 공통 타입 정의 통합 및 최종 정리**

*   **Task ID:** `CLEANUP-001`
    *   **작업:** 타입 정의 중앙화 및 검증.
    *   **지침:**
        1.  `src/types` 디렉토리 내 파일을 검토합니다. 주요 데이터 타입(Card, Tag, User, Project, Edge, NodeData, API 응답 등)과 Zustand 슬라이스 타입이 이곳에서 일관되게 정의되고 관리되는지 확인합니다.
        2.  Prisma를 사용하므로, 가능하면 `import { Card, Tag, User } from '@prisma/client';` 와 같이 Prisma가 생성한 타입을 직접 사용하거나, 이를 확장하여 사용합니다. (`CardWithRelations` 예시 참고). 수동 타입 정의는 Prisma 스키마와 불일치할 위험이 있으므로 최소화합니다.
        3.  서비스 함수(`src/services`), Server Actions (`src/actions`), TanStack Query 훅 (`src/hooks/queries`, `src/hooks/mutations`), Zustand 스토어 (`src/store`), 컴포넌트 등 프로젝트 전반에서 `src/types` 또는 `@prisma/client`의 타입을 import하여 사용하는지 확인하고, 컴포넌트나 함수 내부에 정의된 임시 타입을 제거합니다.
        4.  터미널에서 `npm run build` 및 `npm run typecheck` (또는 해당하는 스크립트)를 실행하여 타입 관련 에러가 없는지 **반드시** 확인합니다.
    *   **예상 결과:** 타입 정의가 Prisma 스키마와 동기화되고 중앙에서 일관되게 관리됩니다. 타입 에러가 없습니다.
    *   **규칙:** [centralized-types], [type-consistency], [prisma-type-usage]
    *   **검증 (AI):** 프로젝트 내 타입 정의 파일 검토. `import { ... } from '@prisma/client';` 사용 확인. 임시 타입 정의 부재 확인. 빌드/타입체크 스크립트 실행 (가능하다면).
    *   **검증 (인간):** 빌드 및 타입 체크 성공 확인. 코드 리뷰를 통해 타입 사용 일관성 확인.

*   **Task ID:** `CLEANUP-002`
    *   **작업:** 불필요한 파일 및 코드 제거.
    *   **지침:**
        1.  **삭제 대상:**
            *   `src/store/useNodeStore.ts` (이전 단계에서 삭제 확인)
            *   `src/contexts/AuthContext.tsx` (이전 단계에서 삭제 확인)
            *   `src/contexts/ThemeContext.tsx` (이전 단계에서 삭제 확인)
            *   `src/app/api/cards/route.ts`, `src/app/api/cards/[id]/route.ts` (모든 핸들러 제거 확인)
            *   `src/app/api/tags/route.ts`, `src/app/api/tags/[id]/route.ts` (모든 핸들러 제거 확인)
            *   `src/app/api/users/first/route.ts`
            *   리팩토링 과정에서 더 이상 사용되지 않는 훅, 컴포넌트, 유틸리티 함수 파일.
        2.  프로젝트 전체에서 위 파일들을 import하는 코드가 없는지 검색하여 확인하고 제거합니다.
        3.  주석 처리된 코드 중 불필요한 부분을 제거합니다.
    *   **예상 결과:** 코드베이스에서 더 이상 사용되지 않는 파일과 코드가 정리됩니다.
    *   **규칙:** [code-cleanup], [remove-dead-code]
    *   **검증 (AI):** 지정된 파일들의 삭제 여부 확인. 프로젝트 전체 검색으로 삭제된 파일 import 구문 부재 확인.
    *   **검증 (인간):** Git 변경 사항 확인 또는 수동 검토를 통해 불필요한 코드가 제거되었는지 확인.

*   **Task ID:** `CLEANUP-003`
    *   **작업:** 설정 파일 통합 검토.
    *   **지침:**
        1.  `src/lib` 또는 `src/config` 디렉토리 내의 상수/설정 관련 파일들을 검토합니다. (예: `constants.ts`, `ideamap-constants.ts`, `flow-constants.ts`, `ideamap-ui-config.ts`, `uiOptions.json`)
        2.  파일 간 내용 중복 (예: 기본 노드 크기) 또는 관련 설정 분산 (예: React Flow 관련 상수가 여러 파일에 나뉨) 여부를 확인합니다.
        3.  **조치:** 내용 중복을 제거하고, 관련 설정을 논리적인 파일(예: `src/config/ideamapConfig.ts`, `src/config/appConfig.ts`)로 통합하거나 재구성합니다. `uiOptions.json` 같은 정적 파일은 타입스크립트 설정 객체로 변환하는 것을 고려합니다.
    *   **예상 결과:** 설정 관련 파일 구조가 더 명확하고 효율적으로 개선됩니다.
    *   **규칙:** [config-refactor], [dry-principle]
    *   **검증 (AI):** 지정된 설정 파일들의 내용 변경/통합 여부 확인. 중복 상수 제거 확인.
    *   **검증 (인간):** 코드 리뷰 및 설정 값 참조가 올바르게 업데이트되었는지 확인.

*   **Task ID:** `CLEANUP-004` (7단계 최종 검증)
    *   **작업:** 7단계 리팩토링 후 기능 검증.
    *   **지침:** 애플리케이션을 실행하고 다음 사항을 **최종적으로** 확인합니다:
        1.  **회귀 테스트:** 이전 단계들에서 확인했던 모든 주요 기능(로그인/아웃, 카드 CRUD, 태그 CRUD, IdeaMap 로딩/상호작용/레이아웃)이 여전히 정상적으로 동작하는가?
        2.  **빌드/타입:** `npm run build` 및 `npm run typecheck` 가 오류 없이 성공하는가?
        3.  **코드 상태:** 불필요한 파일(특히 API 라우트)과 코드가 깨끗하게 제거되었는가?
        4.  **콘솔:** 브라우저 콘솔에 예기치 않은 오류나 경고가 없는가?
    *   **예상 결과:** 리팩토링이 완료되고 코드베이스가 정리된 상태에서 모든 기능이 안정적으로 동작합니다.

---

### **8단계: 아키텍처 가이드 문서 작성**

*   **Task ID:** `DOC-001`
    *   **작업:** 개선된 아키텍처와 개발 원칙을 설명하는 문서 작성.
    *   **지침:** 프로젝트 루트에 `ARCHITECTURE.md` 파일을 생성하고, 이전 계획(Phase 8)의 세부 내용을 기반으로 문서를 작성합니다. 다음 목차를 포함하여 각 항목을 **상세하고 명확하게** 기술합니다:
        1.  **개요:** "서버 상태는 TanStack Query, 클라이언트 UI 상태는 Zustand" 원칙 및 목표 설명.
        2.  **상태 관리:**
            *   TanStack Query: 역할(서버 상태 관리), 쿼리 키 명명 규칙 및 전략, 캐싱 전략(staleTime, gcTime), 뮤테이션 사용 패턴(Server Action 연동), 낙관적 업데이트 가이드라인.
            *   Zustand: 역할(클라이언트 UI 상태 관리), 슬라이스 구조 설명 (UiSlice, CardStateSlice, ThemeSlice 등 각 슬라이스의 책임 명시), 상태 접근 방법(선택자 사용 권장), 액션 정의 원칙.
        3.  **API 호출:**
            *   API 서비스 계층 (`src/services`): 역할, 함수 구조 (async/await, Prisma 사용), 표준 응답 형식(성공/실패), Zod 유효성 검사 사용법.
            *   Server Actions (`src/actions`): 역할(클라이언트 요청 처리, 서비스 함수 호출), 작성 규칙 ('use server', 인증/권한 검사, 캐시 무효화), 뮤테이션 훅과의 연동 방식.
            *   **API 라우트 (`src/app/api`) 사용 기준:** **옵션 3 명시** - 내부 CRUD는 Server Actions 사용. 웹훅, OAuth 콜백, 파일 처리 등 외부 연동 및 특수 HTTP 처리에만 제한적으로 사용. 유지되는 API 라우트 목록 및 용도 명시.
        4.  **인증:** `@supabase/ssr` 쿠키 기반 세션 관리 설명. `useAuth` 훅 역할(상태 구독 및 제공). `useAuthStore` 역할(프로필 캐시, UI 상태). 로그인/로그아웃 흐름 요약.
        5.  **주요 데이터 흐름 예시:** 카드 생성 시나리오 (컴포넌트 -> 뮤테이션 훅 -> Server Action -> 서비스 함수 -> DB -> 캐시 무효화 -> UI 업데이트) 상세 설명. IdeaMap 데이터 동기화 (`useIdeaMapSync` 작동 방식) 설명.
        6.  **컴포넌트 책임:** 서버 컴포넌트 vs 클라이언트 컴포넌트 구분 기준. 컴포넌트는 UI 렌더링과 사용자 입력 처리에 집중하고, 상태 로직은 훅(TQ, Zustand, 커스텀)을 통해 주입받는 원칙 설명.
        7.  **테스트 전략:** 단위 테스트 대상(서비스 함수, Zustand 액션/셀렉터, 유틸리티), 통합 테스트 대상(커스텀 훅, 컴포넌트-훅 연동), E2E 테스트 필요성 언급. 테스트 라이브러리(Vitest, Testing Library) 및 모킹(MSW, vi.mock) 사용 가이드라인.
        8.  **AI 협업 가이드:** 코드 스타일 가이드(ESLint, Prettier) 준수 강조. 파일 구조 규칙. 주석 작성 가이드. 500 LoC 파일 크기 가이드라인 및 분리 기준 제시. AI에게 Task 지시 시 명확하고 구체적인 지침 제공의 중요성 강조.
        9.  **신규 기능 추가 예시 (Bulletin Board):** 단계별 개발 절차 (데이터 정의 -> 서비스/액션 -> TQ 훅 -> 컴포넌트 -> 테스트) 설명.
    *   **예상 결과:** 프로젝트의 아키텍처, 상태 관리 패턴, API 호출 방식, 코딩 컨벤션 등을 포괄적으로 설명하는 기술 문서가 작성됩니다.
    *   **규칙:** [documentation], [architecture-guidelines]
    *   **검증 (AI):** 문서의 목차 구조 및 각 섹션 내용 포함 여부 확인. 명확하고 일관된 용어 사용 확인.
    *   **검증 (인간):** 문서 전체를 읽고 내용의 정확성, 명확성, 완전성을 검토합니다. 다른 개발자나 AI가 이 문서를 보고 프로젝트 구조를 이해하고 개발을 진행할 수 있는지 평가합니다.

*   **Task ID:** `DOC-002` (8단계 최종 검증)
    *   **작업:** 작성된 아키텍처 문서 최종 검토 및 승인.
    *   **지침:** 팀 내 코드 리뷰 또는 동료 검토를 통해 아키텍처 문서의 완성도를 최종 확인하고, 프로젝트 공식 문서로 채택합니다.
    *   **예상 결과:** 아키텍처 문서가 최종 승인되어 프로젝트의 기술 표준으로 활용됩니다.