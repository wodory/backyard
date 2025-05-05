sequenceDiagram
    participant API as API Server
    participant QH as React Query 훅(useCards)
    participant Sync as useIdeaMapSync 훅
    participant Store as useIdeaMapStore
    participant RF as ReactFlow 컴포넌트
    participant UI as 사용자 화면

    Note over API,UI: 1. 데이터 페칭 단계
    QH->>API: GET /api/cards 요청
    API-->>QH: 카드 데이터 JSON 응답

    Note over QH,Sync: 2. 카드 → 노드/엣지 변환
    QH->>Sync: 카드 데이터 전달
    Sync->>Sync: 카드를 노드/엣지로 변환
    Note right of Sync: 카드 ID → 노드 ID<br/>카드 제목 → 노드 라벨<br/>카드 내용 → 노드 데이터<br/>카드 관계 → 엣지 정보

    Note over Sync,Store: 3. Zustand 스토어 업데이트
    Sync->>Store: 노드 배열 업데이트(setNodes)
    Sync->>Store: 엣지 배열 업데이트(setEdges)
    Store-->>Store: 상태 업데이트

    Note over Store,RF: 4. ReactFlow 렌더링
    Store-->>RF: 노드/엣지 데이터 전달
    RF->>RF: 내부 상태 업데이트
    RF->>RF: 노드/엣지 레이아웃 계산
    RF-->>UI: 캔버스에 노드/엣지 렌더링

    Note over UI: 5. 상호작용
    UI->>RF: 사용자 노드 클릭/드래그
    RF->>Store: 이벤트 핸들러 호출
    Store->>Store: 노드 위치/선택 상태 변경