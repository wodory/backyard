**목표:** 아이디어맵에서 엣지 생성 시 발생하는 `SOURCE_CARDNODE_NOT_FOUND` 오류 해결

**핵심 원인:** 백엔드 API (`/api/edges`)가 엣지 생성 요청 처리 시, `CardNode` ID를 가지고 `cards` 테이블을 잘못 조회하고 있음.

**수행할 작업 목록 (Tasklist for Cursor Agent):**

1.  **파일 열기:** `src/app/api/edges/route.ts` 파일을 엽니다.

2.  **`POST` 함수 찾기:** 파일 내에서 `export async function POST(request: NextRequest)` 함수를 찾습니다.

3.  **Source Node 조회 로직 수정:**
    *   `// 소스 카드 존재 여부 확인 (card 테이블 사용으로 수정)` 주석 아래의 코드를 찾습니다.
    *   `prisma.card.findUnique` 호출 부분을 `prisma.cardNode.findUnique`로 변경합니다.
    *   `include` 절을 추가하여 관련 `Card`의 `projectId`를 함께 조회하도록 합니다.
        *   수정 전 예시: `const sourceCard = await prisma.card.findUnique(...)`
        *   **수정 후:**
            ```typescript
            console.log(`[API /edges] Source CardNode 조회 시작 - 조건: { id: '${sourceCardNodeId}' }`); // 로그 업데이트
            const sourceNode = await prisma.cardNode.findUnique({ // card -> cardNode
              where: { id: sourceCardNodeId },
              include: { card: { select: { projectId: true } } } // card 포함 및 projectId 선택
            });
            console.log(`[API /edges] Source CardNode 조회 결과:`, sourceNode ? `{ id: ${sourceNode.id}, cardProjectId: ${sourceNode.card?.projectId} }` : 'null'); // 로그 업데이트
            ```

4.  **Source Node 검증 로직 수정:**
    *   `if (!sourceCard)` 조건문을 찾습니다.
    *   조건문을 `!sourceNode` (방금 조회한 `CardNode`)를 확인하고, 조회된 `CardNode`에 연결된 `Card`의 `projectId`가 요청으로 들어온 `projectId`와 일치하는지 확인하도록 수정합니다.
    *   관련 로그 및 에러 메시지를 `CardNode` 기준으로 수정합니다.
        *   수정 전 예시: `if (!sourceCard)`
        *   **수정 후:**
            ```typescript
            if (!sourceNode || sourceNode.card?.projectId !== projectId) { // sourceNode 확인 및 projectId 비교 추가
               console.log(`[API /edges] Source CardNode를 찾을 수 없거나 프로젝트 불일치! ID=${sourceCardNodeId}, 요청 projectId=${projectId}, 실제 projectId=${sourceNode?.card?.projectId}`); // 로그 업데이트
               logger.warn('존재하지 않는 source CardNode 또는 프로젝트 불일치로 엣지 생성 시도:', { source: sourceCardNodeId, projectId }); // 로그 업데이트
               return NextResponse.json(
                { error: 'Bad Request', code: 'SOURCE_CARDNODE_NOT_FOUND', message: '출발점 노드를 찾을 수 없거나 프로젝트가 일치하지 않습니다.', source: sourceCardNodeId }, // 메시지 업데이트
                { status: 400 }
              );
            }
            ```

5.  **Target Node 조회 로직 수정:**
    *   `const targetCard = await prisma.card.findUnique(...)` 부분을 찾습니다 (Source Node 수정과 유사).
    *   `prisma.card.findUnique`를 `prisma.cardNode.findUnique`로 변경합니다.
    *   `include` 절을 추가하여 관련 `Card`의 `projectId`를 함께 조회합니다.
        *   **수정 후:**
            ```typescript
             console.log(`[API /edges] Target CardNode 조회 시작 - 조건: { id: '${targetCardNodeId}' }`); // 로그 추가
            const targetNode = await prisma.cardNode.findUnique({ // card -> cardNode
              where: { id: targetCardNodeId },
              include: { card: { select: { projectId: true } } } // card 포함 및 projectId 선택
            });
             console.log(`[API /edges] Target CardNode 조회 결과:`, targetNode ? `{ id: ${targetNode.id}, cardProjectId: ${targetNode.card?.projectId} }` : 'null'); // 로그 추가
            ```

6.  **Target Node 검증 로직 수정:**
    *   `if (!targetCard)` 조건문을 찾습니다.
    *   조건문을 `!targetNode`를 확인하고, 조회된 `CardNode`에 연결된 `Card`의 `projectId`가 요청으로 들어온 `projectId`와 일치하는지 확인하도록 수정합니다.
    *   관련 로그 및 에러 메시지를 `CardNode` 기준으로 수정합니다.
        *   **수정 후:**
            ```typescript
            if (!targetNode || targetNode.card?.projectId !== projectId) { // targetNode 확인 및 projectId 비교 추가
              console.log(`[API /edges] Target CardNode를 찾을 수 없거나 프로젝트 불일치! ID=${targetCardNodeId}, 요청 projectId=${projectId}, 실제 projectId=${targetNode?.card?.projectId}`); // 로그 업데이트
              logger.warn('존재하지 않는 target CardNode 또는 프로젝트 불일치로 엣지 생성 시도:', { target: targetCardNodeId, projectId }); // 로그 업데이트
              return NextResponse.json(
                { error: 'Bad Request', code: 'TARGET_CARDNODE_NOT_FOUND', message: '도착점 노드를 찾을 수 없거나 프로젝트가 일치하지 않습니다.', target: targetCardNodeId }, // 메시지 업데이트
                { status: 400 }
              );
            }
            ```

7.  **엣지 생성 데이터 확인:**
    *   `prisma.edge.create` 호출 부분을 찾습니다.
    *   `data` 객체 내에 `userId: currentUserId`가 올바르게 포함되어 있는지 확인합니다. (이전 수정에서 이미 반영되었을 수 있음)
    *   `style` 및 `data` 필드에 값이 없을 경우 `Prisma.JsonNull`을 사용하는지 확인합니다.

8.  **타입 임포트 확인:**
    *   파일 상단에 `import { Prisma } from '@prisma/client';` 가 있는지 확인하고, 없다면 추가합니다.

9.  **파일 저장:** 변경 사항을 저장합니다.