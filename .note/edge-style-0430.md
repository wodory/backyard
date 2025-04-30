**Tasklist: 엣지 스타일 생성 시 적용 및 전역 설정 변경 시 일괄 업데이트**

**목표:**

1.  새로운 엣지를 생성할 때 `useIdeaMapStore`에 저장된 현재 전역 엣지 설정(색상, 두께, 애니메이션, 마커 등)이 자동으로 적용되도록 합니다.
2.  사용자가 전역 엣지 설정을 변경하면, 현재 맵에 있는 **모든** 엣지의 스타일이 새로운 설정에 맞춰 일괄적으로 업데이트되도록 합니다.

**Phase 1: 생성 시 전역 설정 적용**

1.  **`useCreateEdge` 훅 분석 및 수정:**
    *   **파일:** `src/hooks/useEdges.ts` (또는 엣지 뮤테이션 훅이 정의된 파일)
    *   **Action:** `useCreateEdge` 함수의 `mutationFn` 또는 `onMutate` 내부를 확인합니다.
    *   **Action:** 현재 엣지를 생성할 때(`createEdgeAPI` 호출 전 또는 `onMutate`의 낙관적 엣지 생성 시) `useIdeaMapStore`에서 최신 `ideaMapSettings` (특히 `edgeColor`, `strokeWidth`, `animated`, `markerEnd` 등 엣지 관련 설정)를 가져오도록 코드를 추가합니다.
    *   **Action:** 가져온 설정 값을 `createEdgeAPI`로 전달하는 `apiInput` 객체 또는 `onMutate`에서 생성하는 `optimisticEdge` 객체의 `style`, `animated`, `markerEnd`, `type` 등의 속성에 **적절히 매핑**하여 포함시킵니다.
        *   예: `style: { stroke: settings.edgeColor, strokeWidth: settings.strokeWidth }, animated: settings.animated, markerEnd: settings.markerEnd ? { type: settings.markerEnd } : undefined`
    *   **확인:** 이제 새로운 엣지가 생성될 때 API 요청 본문과 낙관적 업데이트 객체에 현재 전역 설정이 반영되는지 확인합니다.

**Phase 2: 전역 설정 변경 시 일괄 업데이트**

2.  **`useIdeaMapStore` 상태 및 액션 검토/추가:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **Action:** `ideaMapSettings` 상태가 엣지 스타일 관련 속성(`edgeColor`, `strokeWidth`, `animated`, `markerEnd` 등)을 포함하고 있는지 확인합니다. (이미 잘 되어 있을 것으로 예상)
    *   **Action:** `updateIdeaMapSettings` 액션 함수가 있는지 확인합니다. 이 함수는 부분적인 설정 객체를 받아 `ideaMapSettings` 상태를 업데이트해야 합니다.
    *   **Action (핵심):** `updateAllEdgeStylesAction` 액션 함수가 있는지 확인합니다. 없다면 **새로 구현**합니다. 이 함수는 다음 작업을 수행해야 합니다:
        *   현재 스토어의 `ideaMapSettings`에서 최신 엣지 스타일 설정을 가져옵니다.
        *   현재 스토어의 `edges` 배열을 순회합니다.
        *   각 엣지 객체의 `style`, `animated`, `markerEnd` 등의 속성을 최신 설정 값으로 **업데이트**한 새로운 엣지 배열을 만듭니다. (개별 수정된 엣지 구분 로직은 **이번 단계에서는 제외**)
        *   `set({ edges: updatedEdgesArray })`를 호출하여 스토어의 엣지 상태를 일괄 업데이트합니다.
        *   (선택적) 변경 사항을 로컬 스토리지나 DB에 저장하는 로직이 있다면 해당 로직도 호출합니다 (`saveEdgesAction` 등).

3.  **설정 변경 UI와 액션 연결:**
    *   **파일:** 사용자가 전역 엣지 설정을 변경하는 UI 컴포넌트 (예: `ProjectToolbar.tsx`, `SettingsPanel.tsx` 등)
    *   **Action:** 설정 변경 UI(드롭다운, 체크박스 등)의 `onValueChange` 또는 `onClick` 핸들러를 찾습니다.
    *   **Action:** 이 핸들러 내부에서 `useIdeaMapStore`의 `updateIdeaMapSettings` 액션을 호출하여 **스토어의 설정 상태**를 먼저 업데이트하도록 합니다.
    *   **Action:** `updateIdeaMapSettings` 호출 **직후에**, `useIdeaMapStore`의 `updateAllEdgeStylesAction` 액션을 호출하여 **현재 맵의 모든 엣지 스타일**을 방금 변경된 설정에 맞춰 일괄 업데이트하도록 합니다.

4.  **`CustomEdge` 컴포넌트 확인:**
    *   **파일:** `src/components/ideamap/nodes/CustomEdge.tsx`
    *   **Action:** `CustomEdge` 컴포넌트가 렌더링될 때 `useIdeaMapStore`에서 `ideaMapSettings`를 가져와서 엣지 스타일(색상, 두께 등)을 적용하는 로직이 이미 있는지 확인합니다. (이전 로그를 보면 이미 구현된 것으로 보임).
    *   **확인:** 설정 변경 시 `updateAllEdgeStylesAction`에 의해 스토어의 `edges` 배열이 업데이트되면, `CustomEdge` 컴포넌트들이 리렌더링되면서 새로운 스타일이 적용될 것임을 확인합니다.

**Phase 3: 테스트 및 검증**

5.  **기능 검증:**
    *   **Action:** 앱을 실행하고 새로운 엣지를 생성합니다. 생성된 엣지가 현재 전역 설정(예: 기본 색상)으로 그려지는지 확인합니다.
    *   **Action:** 설정 UI를 통해 전역 엣지 색상, 두께, 애니메이션 등을 변경합니다.
    *   **Action:** 변경 즉시 맵 상의 **모든** 기존 엣지들의 스타일이 새로운 설정으로 일괄 변경되는지 확인합니다.
    *   **Action:** 설정 변경 후 새로운 엣지를 다시 생성하여, 변경된 설정이 새 엣지에 적용되는지 확인합니다.

---

**결과 보고:**

*   각 Task별 코드 변경 사항을 보고해 주세요.
*   엣지 생성 시 전역 설정이 적용되는 방식과, 설정 변경 시 모든 엣지 스타일이 일괄 업데이트되는 최종 흐름을 설명해 주세요.