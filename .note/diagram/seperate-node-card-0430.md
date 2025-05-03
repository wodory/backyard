**Tasklist: 아이디어맵 노드/카드 분리 및 DB 저장 구현 (모델명: `CardNode`)**

**목표:** 아이디어맵의 노드 정보를 별도 `CardNode` 테이블에 저장하고 관리하는 방식으로 리팩토링합니다. 카드와 맵 표현(노드)을 분리하고, 노드 위치 정보를 DB에 영구 저장하며, 다중 노드 표현 및 데이터 일관성을 확보합니다.

**Phase 1: 데이터베이스 스키마 정의 및 마이그레이션 (Prisma & Supabase CLI)**

*   **Task 1.1: Prisma 스키마 정의 (`CardNode` 모델 추가)**
    *   **파일:** `prisma/schema.prisma`
    *   **Action:** 새로운 `CardNode` 모델을 정의합니다. 아래 구조를 참고하여 필드를 추가하고, `Card` 및 `Project` 모델과의 관계를 설정합니다. `onDelete: Cascade`를 사용하여 관련 카드나 프로젝트가 삭제되면 `CardNode`도 자동으로 삭제되도록 설정합니다.

        ```prisma
        model CardNode { // 모델 이름을 CardNode로 변경
          id        String   @id @default(uuid())
          positionX Float
          positionY Float
          // cardId 와 projectId 에 대한 복합 유니크 제약조건 (선택적, 동일 카드를 한 프로젝트 맵에 한 번만 추가하는 경우)
          // @@unique([cardId, projectId])

          // Relations
          card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
          cardId    String
          project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
          projectId String

          // Optional fields for future use
          styleJson Json?    @db.JsonB
          dataJson  Json?    @db.JsonB

          createdAt DateTime @default(now())
          updatedAt DateTime @updatedAt
        }

        model Card {
          // ... 기존 필드 ...
          cardNodes CardNode[] // 관계 필드 이름 변경
        }

        model Project {
          // ... 기존 필드 ...
          cardNodes CardNode[] // 관계 필드 이름 변경
        }
        ```
    *   **Action:** 파일 상단의 `datasource db` 블록에 `extensions = [uuid_ossp]` (또는 `pgcrypto`) 가 포함되어 있는지 확인하거나 추가합니다.
    *   **확인:** `CardNode` 모델 이름이 다른 모델과 충돌하지 않는지 확인합니다.

*   **Task 1.2: Prisma Client 생성**
    *   **Action:** 터미널에서 `yarn prisma generate` (또는 `npx prisma generate`) 를 실행하여 수정된 스키마를 반영한 Prisma Client 타입을 업데이트합니다. (`CardNode` 타입이 생성됨)

*   **Task 1.3: Supabase CLI 연결 확인**
    *   **Action:** 프로젝트 루트에서 `npx supabase status` 명령어를 실행하여 Supabase CLI 연결을 확인합니다. 필요시 `npx supabase link --project-ref <your-project-id>` 를 실행합니다.

*   **Task 1.4: SQL 마이그레이션 스크립트 생성 (`prisma migrate diff`)**
    *   **Action:** Supabase 대시보드에서 **데이터베이스 직접 연결 URI**를 복사합니다.
    *   **Action:** 터미널에서 다음 명령어를 실행하여 SQL 스크립트를 생성합니다. `<YYYYMMDDHHMMSS>` 부분은 실제 생성 시각으로, `<migration_description>`은 `add_card_node_table` 등으로 변경합니다.

        ```bash
        npx prisma migrate diff \
          --from-url "postgresql://postgres.rsycayyhmgmbdmmtzewz:SH1HpNpMW4ZSL21d@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" \
          --to-schema-datamodel prisma/schema.prisma \
          --script > supabase/migrations/20250501071900_fix_card_node_table_key_name.sql
        ```
    *   **확인:** `supabase/migrations` 디렉토리에 SQL 파일이 생성되었는지 확인합니다.

*   **Task 1.5: 생성된 SQL 스크립트 검토 (선택적)**
    *   **Action:** 생성된 SQL 파일을 열어 `CREATE TABLE "CardNode" ...` 등 스키마 변경 사항이 올바른지 검토합니다.

*   **Task 1.6: Supabase 마이그레이션 실행**
    *   **Action:** 터미널에서 `npx supabase migration up --linked` 명령어를 실행하여 Supabase 데이터베이스에 마이그레이션을 적용합니다.
    *   **확인:** Supabase 대시보드의 `Database` > `Migrations` 및 `Table Editor`에서 `CardNode` 테이블 생성 및 마이그레이션 성공 여부를 확인합니다.

**Phase 2: `CardNode` CRUD API 엔드포인트 구현**

*   **Task 2.1: API 라우트 파일 생성/수정**
    *   **파일:** `/api/cardnodes/route.ts`, `/api/cardnodes/[id]/route.ts` (API 경로를 모델명과 일치시키는 것이 좋음)
    *   **Action:** 이 파일들에 아래 CRUD 핸들러 로직을 구현합니다. 모든 핸들러 시작 부분에 `auth()` 헬퍼를 사용하여 사용자 인증을 확인하는 로직을 포함합니다.

*   **Task 2.2: `GET /api/cardnodes?projectId=...` 구현**
    *   **Action:** 요청 URL의 `projectId` 쿼리 파라미터를 읽습니다.
    *   **Action:** `prisma.cardNode.findMany({ where: { projectId: projectIdFromQuery } })` 를 사용하여 해당 프로젝트의 모든 `CardNode` 레코드를 조회합니다.
    *   **Action:** 조회된 `CardNode` 레코드 배열을 JSON으로 반환합니다.

*   **Task 2.3: `POST /api/cardnodes` 구현**
    *   **Action:** 요청 본문(body)에서 `cardId`, `projectId`, `positionX`, `positionY`, (선택적) `styleJson`, `dataJson` 등을 추출합니다.
    *   **Action:** `prisma.cardNode.create({ data: { ...extractedData, userId: session.user.id /* 필요시 */ } })` 를 사용하여 새 `CardNode` 레코드를 생성합니다. (스키마에 userId 필드가 있다면 추가)
    *   **Action:** 생성된 `CardNode` 객체를 JSON으로 반환합니다 (Status 201).

*   **Task 2.4: `PATCH /api/cardnodes/[id]` 구현**
    *   **Action:** URL 경로에서 `cardNodeId`를 추출하고, 요청 본문에서 업데이트할 필드(주로 `positionX`, `positionY`, `styleJson` 등)를 추출합니다.
    *   **Action:** `prisma.cardNode.update({ where: { id: cardNodeId }, data: { ...updates } })` 를 사용하여 `CardNode`를 업데이트합니다.
    *   **Action:** 업데이트된 `CardNode` 객체를 JSON으로 반환합니다.

*   **Task 2.5: `DELETE /api/cardnodes/[id]` 구현**
    *   **Action:** URL 경로에서 `cardNodeId`를 추출합니다.
    *   **Action:** `prisma.cardNode.delete({ where: { id: cardNodeId } })` 를 사용하여 `CardNode`를 삭제합니다. **(Card는 삭제하지 않습니다)**
    *   **Action:** 성공 응답(Status 204 No Content)을 반환합니다.

*   **Task 2.6: `DELETE /api/cards/[id]` 검토**
    *   **파일:** `/api/cards/[id]/route.ts`
    *   **Action:** `DELETE` 핸들러 로직을 검토합니다. Prisma 스키마에서 `CardNode` 모델의 `Card` 관계에 `onDelete: Cascade`를 설정했으므로, `prisma.card.delete()` 호출 시 관련 `CardNode` 레코드가 DB 레벨에서 자동으로 삭제될 것임을 확인합니다.

**Phase 3: TanStack Query 훅 구현/수정 (모델명 변경 적용)**

*   **Task 3.1: `useCardNodes` 훅 신규 구현**
    *   **파일:** `src/hooks/useCardNodes.ts` (신규 생성)
    *   **Action:** `useQuery`를 사용하여 `queryKey: ['cardNodes', projectId]`로 `GET /api/cardnodes?projectId=...` API를 호출하는 훅을 구현합니다. `enabled: !!projectId` 옵션을 사용합니다. 반환 타입은 Prisma의 `CardNode` 레코드 배열입니다.

*   **Task 3.2: `useCreateCardNode` 뮤테이션 훅 신규 구현**
    *   **파일:** `src/hooks/useCardNodes.ts` (또는 별도 파일)
    *   **Action:** `useMutation`을 사용하여 `POST /api/cardnodes` API를 호출하는 훅을 작성합니다.
    *   **Action:** 낙관적 업데이트 로직 포함: `onMutate`에서 `['cardNodes', projectId]` 쿼리 캐시에 임시 ID를 가진 새 `CardNode` 레코드(DB 형태)를 추가합니다.

*   **Task 3.3: `useUpdateCardNodePosition` 훅 신규 구현**
    *   **파일:** `src/hooks/useCardNodes.ts` (또는 별도 파일)
    *   **Action:** `useMutation`을 사용하여 `PATCH /api/cardnodes/[id]` API를 호출하는 훅을 작성합니다.
    *   **Action:** 낙관적 업데이트 로직 포함: `onMutate`에서 `['cardNodes', projectId]` 쿼리 캐시에서 해당 `CardNode`의 `positionX`, `positionY`를 즉시 업데이트합니다.

*   **Task 3.4: `useDeleteCardNode` 훅 신규 구현**
    *   **파일:** `src/hooks/useCardNodes.ts` (또는 별도 파일)
    *   **Action:** `useMutation`을 사용하여 `DELETE /api/cardnodes/[id]` API를 호출하는 훅을 작성합니다.
    *   **Action:** 낙관적 업데이트 로직 포함: `onMutate`에서 `['cardNodes', projectId]` 쿼리 캐시에서 해당 `CardNode` 레코드를 즉시 제거합니다.

*   **Task 3.5: `useDeleteCard` 훅 수정**
    *   **파일:** `src/hooks/useDeleteCard.ts` (또는 관련 파일)
    *   **Action:** `useDeleteCard` 뮤테이션의 `onSuccess` 또는 `onSettled` 콜백 내부에 `queryClient.invalidateQueries({ queryKey: ['cardNodes', projectId] })` 호출을 **추가**합니다. (카드 삭제 시 관련 `CardNode` 쿼리도 무효화)

**Phase 4: UI 및 상태 관리 로직 연결 (모델명 및 데이터 소스 변경)**

*   **Task 4.1: 아이디어맵 데이터 로딩 로직 변경**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx` 또는 `src/components/ideamap/hooks/useIdeaMapData.ts`
    *   **Action:** `useCardNodes(activeProjectId)` 훅을 호출하여 DB의 `CardNode` 레코드(`dbCardNodes`)를 가져오도록 수정합니다. (기존 `useNodes` 호출 제거)
    *   **Action:** `useCards` 훅을 사용하여 필요한 카드 데이터(`cardsData`)를 가져옵니다.

*   **Task 4.2: React Flow 노드 배열 생성 로직 구현**
    *   **파일:** Task 4.1과 동일 파일
    *   **Action:** `dbCardNodes`와 `cardsData`를 병합하는 로직을 구현합니다. `dbCardNodes` 배열을 순회하며 각 `dbCardNode`에 대해:
        *   `id`: `dbCardNode.id` 사용 (**React Flow 노드의 ID는 이제 `CardNode` 테이블의 PK**)
        *   `position`: `{ x: dbCardNode.positionX, y: dbCardNode.positionY }` 사용
        *   `data`: `cardsData` 배열에서 `dbCardNode.cardId`와 일치하는 카드를 찾아 `{ id: card.id, title: card.title, content: card.content, cardId: card.id, ... }` 형태로 구성합니다. (**`data.id`는 이제 Card ID 임**)
        *   이렇게 생성된 객체들을 배열로 만들어 `<ReactFlow>` 컴포넌트의 `nodes` prop으로 전달합니다.

*   **Task 4.3: 아이디어맵 노드 생성 로직 수정**
    *   **파일:** 노드 생성 트리거가 있는 곳 (e.g., `IdeaMap.tsx`, `useIdeaMapHandlers.ts`)
    *   **Action (Toolbar/Drop):**
        1.  카드 생성 필요 시: `useCreateCard().mutateAsync()` 호출.
        2.  성공 시 또는 드롭 시 얻은 `cardId`와 계산된 위치, `activeProjectId`를 사용하여 `useCreateCardNode().mutate()` 호출.

*   **Task 4.4: 아이디어맵 노드 삭제 로직 수정 ("맵에서만 제거")**
    *   **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx` (또는 `onNodesChange` 핸들러)
    *   **Action:** `onNodesChange` 핸들러에서 `type === 'remove'` 인 변경(`change`)을 감지합니다.
    *   **Action:** 이제 `change.id`는 **`CardNode` 테이블의 ID**입니다. `useDeleteCardNode().mutate({ id: change.id, projectId: activeProjectId })` 를 호출합니다. (다중 삭제 처리 로직도 함께 수정)

*   **Task 4.5: 사이드바 카드 삭제 로직 확인**
    *   **파일:** 사이드바 컴포넌트 (`src/components/layout/Sidebar.tsx` 등)
    *   **Action:** 카드 삭제 기능이 `useDeleteCard`를 호출하는지 확인합니다. Task 3.5에서 `cardNodes` 쿼리 무효화가 추가되었으므로, 아이디어맵 UI도 업데이트될 것입니다.

*   **Task 4.6: 노드 위치 업데이트 로직 추가**
    *   **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx` (또는 관련 훅)
    *   **Action:** `<ReactFlow>` 컴포넌트에 `onNodeDragStop` prop을 추가합니다.
    *   **Action:** `onNodeDragStop` 핸들러 내부에서, 변경된 노드의 `id` (**`CardNode` 테이블 ID**)와 새 `position`을 가져옵니다.
    *   **Action:** `useUpdateCardNodePosition().mutate({ id: node.id, position: node.position, projectId: activeProjectId })` 를 호출합니다.

*   **Task 4.7: Zustand 스토어 및 로컬 스토리지 정리**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **Action:** 스토어 상태에서 `nodes` 배열과 관련 액션을 **제거**합니다. React Flow의 노드 상태는 이제 TanStack Query(`useCardNodes` + `useCards`)와 로컬 컴포넌트 상태(`useState`)로 관리됩니다.
    *   **Action:** `syncCardsWithNodes` 함수를 **제거**합니다.
    *   **Action:** 로컬 스토리지 키(`backyard-board-layout`)를 읽고 쓰는 모든 코드를 프로젝트 전체에서 검색하여 **제거**합니다.

**Phase 5: 테스트 및 검증**

*   **Task 5.1: 기능 테스트**
    *   **Action:** 앱을 실행하고 다음 시나리오를 테스트합니다.
        *   초기 로딩 시 노드와 엣지가 DB 데이터 기준으로 올바르게 표시되는가?
        *   아이디어맵에서 노드 생성 시 DB에 카드와 **CardNode** 레코드가 모두 생성되고 UI에 즉시 반영되는가?
        *   사이드바에서 카드를 맵으로 드래그 앤 드롭 시 DB에 **CardNode** 레코드가 생성되고 UI에 반영되는가?
        *   아이디어맵에서 노드 삭제 시 UI에서 즉시 사라지고 DB에서는 **CardNode** 레코드만 삭제되는가? (Card는 유지)
        *   사이드바에서 카드 삭제 시 DB에서 카드와 관련 **CardNode** 레코드가 모두 삭제되고 아이디어맵 UI에도 반영되는가?
        *   노드 위치 이동 시 DB의 **CardNode** 레코드에 위치가 업데이트되고, 새로고침 후에도 유지되는가?
    *   **Action:** 브라우저 개발자 도구(네트워크, 콘솔)와 TanStack Query DevTools를 통해 API 호출, 캐시 상태, 로그를 확인하며 검증합니다.

---

**결과 보고:**

*   각 Phase 및 Task별 코드 변경 사항을 요약하여 보고해 주세요.
*   새로운 `CardNode` 모델과 데이터 흐름이 어떻게 동작하는지 설명해 주세요.
*   Zustand 스토어에서 어떤 상태와 액션이 제거/변경되었는지 명시해 주세요.