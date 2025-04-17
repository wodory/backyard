**해결 전략:** `useSearchParams`를 직접 사용하는 `TagFilter`, `CardList`, `SearchBar` 컴포넌트가 **클라이언트 컴포넌트**임을 명시하고, 이들을 사용하는 상위 컴포넌트(`src/app/cards/page.tsx`)에서 해당 컴포넌트들을 각각 **`<Suspense>`** 로 감싸줍니다.

---

**Tasklist:**

1.  **클라이언트 컴포넌트 명시:**
    *   **파일:** `src/components/cards/TagFilter.tsx`
        *   **작업:** 파일 최상단에 `'use client';` 지시문이 없으면 **추가**합니다.
    *   **파일:** `src/components/cards/CardList.tsx`
        *   **작업:** 파일 최상단에 `'use client';` 지시문이 없으면 **추가**합니다. (이미 `"use client";`가 있는 것을 확인했습니다.)
    *   **파일:** `src/components/cards/SearchBar.tsx`
        *   **작업:** 파일 최상단에 `'use client';` 지시문이 없으면 **추가**합니다.

2.  **`<Suspense>` 래핑 (`src/app/cards/page.tsx` 수정):**
    *   **작업:** `src/app/cards/page.tsx` 파일을 열고 다음을 수정합니다.
        *   `import { Suspense } from 'react';` 를 추가합니다.
        *   `<TagFilter />` 컴포넌트를 사용하는 부분을 찾아 `<Suspense>`로 감싸줍니다. 적절한 `fallback` UI를 제공합니다.
        *   (만약 `SearchBar`가 이 페이지에서 직접 사용된다면) `<SearchBar />` 컴포넌트를 사용하는 부분을 찾아 `<Suspense>`로 감싸줍니다. 적절한 `fallback` UI를 제공합니다.
        *   `<CardList />`는 이미 `<Suspense>`로 감싸져 있습니다. `fallback={<CardListSkeleton />}` 부분이 올바르게 적용되어 있는지 확인합니다.
    *   **예시 구조:**
        ```tsx
        // src/app/cards/page.tsx
        import { Metadata } from "next";
        import { Suspense } from 'react'; // Suspense import 추가
        import CardList from "@/components/cards/CardList";
        import CreateCardModal from "@/components/cards/CreateCardModal";
        import { TagFilter } from "@/components/cards/TagFilter";
        import { SearchBar } from "@/components/cards/SearchBar"; // SearchBar import (사용 위치에 따라)
        import { Skeleton } from '@/components/ui/skeleton';
        // ... (CardListSkeleton 정의) ...

        export default function CardsPage() {
          return (
            <div className="container mx-auto py-8">
              {/* ... 페이지 헤더 ... */}
              {/* <SearchBar /> 가 여기서 사용된다면 Suspense 추가 */}
              {/* <Suspense fallback={<SearchBarSkeleton />}>
                 <SearchBar />
              </Suspense> */}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* TagFilter를 Suspense로 감싸기 */}
                <div className="lg:col-span-1">
                  <Suspense fallback={<TagFilterSkeleton />}>
                    <TagFilter />
                  </Suspense>
                </div>

                {/* CardList (이미 Suspense로 감싸져 있음) */}
                <div className="lg:col-span-3">
                  <Suspense fallback={<CardListSkeleton />}>
                    <CardList />
                  </Suspense>
                </div>
              </div>
            </div>
          );
        }

        // TagFilter Fallback 컴포넌트 정의 (간단 예시)
        function TagFilterSkeleton() {
          return (
            <div className="space-y-2 p-3 border rounded-md">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          );
        }

        // SearchBar Fallback 컴포넌트 정의 (간단 예시 - 필요 시)
        // function SearchBarSkeleton() {
        //   return <Skeleton className="h-10 w-full" />;
        // }
        ```

3.  **Fallback UI 정의:**
    *   **작업:** `src/app/cards/page.tsx` 내부에 또는 별도 파일로 `TagFilterSkeleton` (및 필요시 `SearchBarSkeleton`)과 같은 간단한 스켈레톤 로딩 컴포넌트를 정의합니다. 이는 `<Suspense>`의 `fallback` prop에 사용됩니다.

4.  **로컬 빌드 확인:**
    *   **작업:** 수정을 완료한 후, 로컬 환경에서 `yarn build` 또는 `npm run build` 명령어를 실행하여 빌드가 성공적으로 완료되고 `useSearchParams` 관련 오류가 사라졌는지 확인합니다.

5.  **기능 확인:**
    *   **작업:** 로컬 개발 서버(`yarn dev` 또는 `npm run dev`)를 실행하고, `/cards` 페이지가 정상적으로 로드되는지 확인합니다. 또한, URL에 `?q=검색어` 또는 `?tag=태그명` 파라미터를 직접 추가했을 때 필터링/검색 기능이 여전히 올바르게 동작하는지 확인합니다.