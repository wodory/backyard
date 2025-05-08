## Tasklist: 설정 아키텍처 개선 및 낙관적 업데이트 구현

### **1단계: 설정 스키마 정의 및 검증 유틸리티 준비 (선행 작업)**

*   **목표**: 설정 데이터의 구조를 Zod 스키마로 정의하고, 이를 검증할 수 있는 유틸리티 함수를 준비하여 데이터 일관성을 확보한다.
*   **세부 작업**:
    1.  **Zod 스키마 파일 생성 (`src/lib/schema/settings-schema.ts`)**:
        *   `docs/setting.md`의 포맷을 참조하여 `edgeSettingsSchema`, `ideaMapSettingsSchema`, `themeSettingsSchema`, `generalSettingsSchema`, `fullSettingsSchema` 등을 Zod로 정의한다.
        *   각 스키마로부터 TypeScript 타입을 추론하여 export 한다 (예: `type FullSettings = z.infer<typeof fullSettingsSchema>;`).
    2.  **검증 유틸리티 함수 작성 (`src/lib/settings-utils.ts` 또는 신규 파일)**:
        *   `validateSettings(section: SettingSection, data: any, mode: 'strict' | 'safe' = 'safe')`: 입력된 데이터를 해당 섹션의 Zod 스키마로 검증하고, `safe` 모드일 경우 기본값으로 채워 반환하거나, `strict` 모드일 경우 오류를 던진다.
        *   `getDefaultSettings(section?: SettingSection)`: 특정 섹션 또는 전체 설정의 기본값을 Zod 스키마의 `.parse({})` 또는 `.default()`를 활용하여 반환한다.
*   **실행 가능성**: 위 파일과 함수를 실제로 코딩하여 생성하고, 기본적인 유닛 테스트를 통해 스키마 정의 및 검증 함수의 정확성을 확인한다.
*   **테스트 케이스**:
    *   **TC 1.1**: 유효한 설정 객체를 `validateSettings` 함수에 전달했을 때, 성공적으로 검증되고 입력 객체가 반환되는지 확인 (또는 기본값으로 채워진 객체).
    *   **TC 1.2**: 일부 필드가 누락된 설정 객체를 `validateSettings` 함수의 `safe` 모드로 전달했을 때, 누락된 필드가 Zod 스키마의 기본값으로 채워져서 반환되는지 확인.
    *   **TC 1.3**: 유효하지 않은 타입의 값을 가진 설정 객체를 `validateSettings` 함수에 전달했을 때, `strict` 모드에서는 오류가 발생하고, `safe` 모드에서는 해당 섹션의 완전한 기본값 객체가 반환되는지 확인.
    *   **TC 1.4**: `getDefaultSettings('ideamap')` 호출 시, `ideaMapSettingsSchema`에 정의된 기본값으로 구성된 객체가 반환되는지 확인.

---

### **2단계: `settingsService.ts` 리팩토링 및 검증 통합**

*   **목표**: `settingsService.ts`가 API 요청 전송 및 응답 처리 시 Zod 스키마 기반의 검증을 수행하도록 개선하여 서비스 계층의 데이터 안정성을 높인다.
*   **세부 작업**:
    1.  `settingsService.ts`의 `fetchSettings`, `updateSettings`, `createInitialSettings` 함수 수정.
    2.  `updateSettings` 함수:
        *   API로 `partialUpdate`를 보내기 전에, 이것이 `Partial<FullSettings>` 스키마의 일부로 유효한지 검사하는 로직 추가 (선택적, API에서 주로 검증).
        *   API 응답으로 받은 데이터를 `validateSettings('full', responseData.settingsData, 'safe')`를 통해 검증 후 반환.
    3.  `fetchSettings` 함수:
        *   API 응답으로 받은 데이터를 `validateSettings('full', responseData.settingsData, 'safe')`를 통해 검증 후 반환. (기존 `settingsData` 필드 추출 로직은 유지하되, 그 결과를 검증)
    4.  오류 처리: Zod 검증 실패 시, 표준화된 `ApiError` 형식으로 오류를 throw 하거나 로깅한다.
*   **실행 가능성**: `settingsService.ts` 파일을 직접 수정하고, API 모킹(MSW 사용 권장)을 통해 서비스 함수들이 Zod 검증을 포함하여 정상 동작하는지 테스트한다.
*   **테스트 케이스**:
    *   **TC 2.1 (`fetchSettings`)**: MSW를 사용하여 API가 유효한 `settingsData`를 반환하도록 설정. `fetchSettings` 호출 시, 검증을 통과한 `FullSettings` 타입의 객체가 반환되는지 확인.
    *   **TC 2.2 (`fetchSettings`)**: MSW를 사용하여 API가 일부 필드가 누락되거나 타입이 잘못된 `settingsData`를 반환하도록 설정. `fetchSettings` 호출 시, `validateSettings`의 `safe` 모드에 의해 기본값으로 채워지거나 수정된 `FullSettings` 객체가 반환되는지 확인.
    *   **TC 2.3 (`updateSettings`)**: 유효한 `partialUpdate` 객체로 `updateSettings` 호출. MSW가 성공 응답(유효한 `settingsData` 포함)을 반환하도록 설정. 검증을 통과한 `FullSettings` 객체가 반환되는지 확인.
    *   **TC 2.4 (`updateSettings`)**: MSW가 유효하지 않은 `settingsData`(예: 필수 필드 누락)를 응답하도록 설정. `updateSettings` 호출 시, 서비스 레벨에서 오류를 적절히 처리하거나, 기본값이 적용된 `FullSettings` 객체가 반환되는지 확인 (오류 처리 전략에 따라 다름).

---

### **3단계: TanStack Query 훅 (`useUserSettingsQuery`, `useUpdateSettingsMutation`) 리팩토링**

*   **목표**: 설정 관련 TanStack Query 훅들이 Zod 스키마로 검증된 데이터를 사용하고, 낙관적 업데이트 로직의 기반을 마련하며, `@three-layer-standard`를 준수하도록 한다.
*   **세부 작업**:
    1.  **`useUserSettingsQuery` 훅 수정 (`src/hooks/useUserSettingsQuery.ts`)**:
        *   `settingsService.fetchSettings`를 호출하여 데이터를 가져오도록 유지. (서비스에서 이미 검증된 데이터가 넘어옴)
        *   `select` 옵션을 사용하여 전체 `FullSettings`에서 특정 부분(예: `ideamap`, `theme`)을 추출하는 별도의 훅(예: `useIdeaMapSettingsFromQuery`)을 만들거나, 이 훅 사용자에게 전체 `FullSettings`를 제공하고 각 컴포넌트/훅에서 필요한 부분을 선택하도록 유도. (후자가 더 유연할 수 있음)
    2.  **`useUpdateSettingsMutation` 훅 수정 (`src/hooks/useIdeaMapSettings.ts` 내 또는 별도 파일)**:
        *   **`mutationFn`**: `settingsService.updateSettings`를 호출. 전달하는 `partialUpdate`는 `Partial<FullSettings>`와 호환되어야 함. (예: `{ ideamap: partialIdeaMapSettings }`)
        *   **`onMutate` (낙관적 업데이트 시작)**:
            *   현재 Query Cache에서 `['userSettings', userId]` 키로 저장된 `FullSettings` 데이터를 가져온다.
            *   가져온 현재 설정과 `variables` (뮤테이션에 전달된 `partialUpdate`)를 사용하여 낙관적으로 업데이트된 `nextSettings: FullSettings`를 계산한다. (이때 `applyPartialSettings` 유틸리티 사용 가능)
            *   `queryClient.setQueryData(['userSettings', userId], nextSettings)`를 호출하여 캐시를 즉시 업데이트한다.
            *   **Zustand와의 연동**: `useIdeaMapStore.getState()._updateSettingsRef(nextSettings.ideamap)` 와 같이, 낙관적으로 업데이트된 아이디어맵 설정을 Zustand 스토어의 설정 참조에 즉시 반영한다. (Zustand는 "데이터 저장"이 아닌 "참조 전달" 역할)
            *   롤백을 위해 이전 `FullSettings` (또는 필요한 부분)를 컨텍스트로 반환한다.
        *   **`onError` (낙관적 업데이트 롤백)**:
            *   `onMutate`에서 반환한 이전 설정을 사용하여 `queryClient.setQueryData(['userSettings', userId], previousSettings)`로 캐시를 롤백한다.
            *   Zustand 스토어의 설정 참조도 이전 아이디어맵 설정으로 롤백한다: `useIdeaMapStore.getState()._updateSettingsRef(previousSettings.ideamap)`.
            *   사용자에게 오류 알림.
        *   **`onSuccess` 또는 `onSettled`**:
            *   `queryClient.invalidateQueries({ queryKey: ['userSettings', userId] })`를 호출하여 서버와 데이터를 최종적으로 동기화한다. (이로 인해 `useUserSettingsQuery`가 최신 데이터를 다시 가져오고, `onMutate`에서 했던 Zustand 참조 업데이트가 서버 확정 데이터로 다시 한번 덮어쓰여짐)
*   **실행 가능성**: 해당 훅들을 직접 수정하고, MSW를 통해 API 동작을 모킹하여 낙관적 업데이트 및 롤백, 캐시 업데이트가 정상적으로 이루어지는지 테스트한다.
*   **테스트 케이스**:
    *   **TC 3.1 (낙관적 업데이트 UI 반영)**: 설정을 변경하는 UI 액션 트리거. `useUpdateSettingsMutation`의 `onMutate`가 실행되어 RQ 캐시와 Zustand 설정 참조가 즉시 업데이트되고, 이로 인해 연결된 UI(예: 엣지 두께, 테마 색상)가 API 응답 전에 변경되는지 확인. (MSW로 API 응답 지연 설정)
    *   **TC 3.2 (낙관적 업데이트 성공 및 서버 동기화)**: TC 3.1 이후, MSW가 성공 응답을 반환하도록 설정. `onSuccess` 또는 `onSettled`에서 `invalidateQueries`가 호출되어 `useUserSettingsQuery`가 최신 데이터를 가져오고, UI가 최종적으로 서버 데이터와 일치하는지 확인.
    *   **TC 3.3 (낙관적 업데이트 실패 및 롤백)**: TC 3.1 상황에서 MSW가 오류 응답을 반환하도록 설정. `onError`가 실행되어 RQ 캐시와 Zustand 설정 참조가 `onMutate` 이전 상태로 롤백되고, UI도 이전 상태로 돌아가는지 확인.
    *   **TC 3.4 (쿼리 훅 데이터 반환)**: `useUserSettingsQuery`가 반환하는 데이터가 `FullSettings` 타입이며, Zod 스키마의 기본값이 잘 적용되어 있는지 확인 (예: 서버에서 특정 필드가 누락된 경우).

---

### **4단계: `useIdeaMapStore.ts` 역할 재정의 및 설정 참조 구현**

*   **목표**: `useIdeaMapStore`가 설정 데이터를 직접 소유하지 않고, TanStack Query로부터 받은 최신 아이디어맵 설정의 "참조"만 관리하도록 역할을 명확히 한다.
*   **세부 작업**:
    1.  `useIdeaMapStore` 상태 인터페이스(`IdeaMapState`) 수정:
        *   기존 `ideaMapSettings: Settings` 필드를 제거하거나, `settingsRef: IdeaMapSettings | null` (또는 `ValidatedIdeaMapSettings`) 와 같은 이름으로 변경. 이 필드는 TanStack Query가 제공하는 아이디어맵 전용 설정을 참조. (스키마 일관성을 위해 `IdeaMapSettings` 사용)
        *   관련 액션(`setIdeaMapSettings`, `updateIdeaMapSettings` 등)에서 로컬 스토리지 저장, 서버 저장 로직 완전히 제거. 이들은 이제 단순 setter 또는 `settingsRef`를 업데이트하는 내부용 액션 (`_updateSettingsRef`)이 될 수 있음.
    2.  `updateEdgeStyles` 및 `updateAllEdgeStylesAction` 함수 수정:
        *   이 함수들은 이제 `settingsRef` (또is `get().settingsRef`)에 저장된 최신 아이디어맵 설정을 사용하여 엣지 스타일을 계산한다.
        *   `updateAllEdgeStylesAction`은 `forceUpdate` 로직은 유지하되, 참조하는 설정의 소스가 `settingsRef`로 변경.
    3.  Zustand `persist` 미들웨어 설정 검토: 만약 `ideaMapSettings`가 `persist` 대상이었다면, 이제 `settingsRef`는 서버 상태의 복사본이므로 `persist`에서 제외하거나, 사용자 UI 선호도와 같이 서버와 무관하고 브라우저에만 저장할 설정만 `persist` 대상으로 남긴다.
*   **실행 가능성**: `useIdeaMapStore.ts` 파일을 수정하고, 관련된 다른 컴포넌트나 훅에서 이 스토어의 설정 관련 부분을 사용하는 방식을 변경한다.
*   **테스트 케이스**:
    *   **TC 4.1 (설정 참조 업데이트 확인)**: 3단계의 TC 3.1, TC 3.2, TC 3.3 테스트 시, `useUpdateSettingsMutation`의 `onMutate` 및 `onError`에서 `useIdeaMapStore`의 `settingsRef` (또는 `latestIdeaMapSettings`)가 낙관적/롤백된 `IdeaMapSettings`로 올바르게 업데이트되는지 확인 (Zustand devtools 또는 로그).
    *   **TC 4.2 (엣지 스타일 업데이트 트리거 확인)**: `settingsRef`가 변경되었을 때, `updateAllEdgeStylesAction`이 호출되고 (만약 `subscribeWithSelector` 등을 사용한 자동 호출 로직이 있다면), 결과적으로 엣지 스타일이 `settingsRef`의 최신 값을 기반으로 계산되는지 확인.
    *   **TC 4.3 (스토어 초기화 시 설정 상태)**: 앱 초기 로드 시, `useUserSettingsQuery`가 데이터를 가져와 `settingsRef`를 채우기 전까지 `settingsRef`는 `null` 또는 기본 `IdeaMapSettings` 상태를 유지하는지 확인. 이 초기 상태에서 UI가 깨지지 않도록 폴백 로직이 잘 동작하는지 확인.

---

### **5단계: UI 컴포넌트 및 최종 통합 테스트**

*   **목표**: 설정 변경 UI (`ProjectToolbar` 등)와 설정을 실제로 사용하는 컴포넌트(`CustomEdge` 등)가 새로운 아키텍처에 맞게 동작하고, 전체 설정 변경 흐름이 사용자에게 올바르게 반영되는지 확인한다.
*   **세부 작업**:
    1.  `ProjectToolbar.tsx` (또는 설정 변경 UI) 수정:
        *   `useUpdateSettingsMutation` 훅을 사용하여 설정 변경 사항을 서버로 전송.
        *   UI 입력값 변경 시, 로컬 컴포넌트 상태나 Zustand의 순수 UI 상태를 사용하여 즉각적인 피드백을 줄 수 있으나, "저장" 액션은 뮤테이션 훅을 통한다.
    2.  `CustomEdge.tsx` 수정:
        *   `useIdeaMapStore`의 `settingsRef`를 참조하여 스타일을 결정하거나, `useIdeaMapSettings` (또는 `useIdeaMapSettingsFromQuery`) 훅을 직접 사용하여 아이디어맵 설정을 가져온다. (후자가 SSOT 원칙에 더 부합하고, Zustand의 역할을 더 줄일 수 있음)
    3.  모든 설정 관련 로직에서 `localStorage` 직접 접근 제거 (Zustand `persist` 미들웨어 제외).
*   **실행 가능성**: UI 컴포넌트들을 수정하고, 애플리케이션을 실제 실행하여 다양한 설정 변경 시나리오를 테스트한다.
*   **테스트 케이스**:
    *   **TC 5.1 (E2E - 설정 변경 성공)**: 사용자가 UI에서 아이디어맵 엣지 두께를 변경하고 저장. UI에 즉시 (낙관적으로) 반영되고, 잠시 후 서버 동기화가 완료되어도 변경된 상태가 유지되는지 확인. 페이지 새로고침 후에도 변경된 설정이 유지되는지 확인.
    *   **TC 5.2 (E2E - 설정 변경 실패 및 롤백)**: TC 5.1과 동일하게 설정 변경 시도. MSW 등을 사용하여 API가 의도적으로 오류를 반환하도록 설정. UI가 낙관적으로 변경되었다가 잠시 후 원래 상태로 롤백되고, 사용자에게 오류 메시지가 표시되는지 확인.
    *   **TC 5.3 (E2E - 여러 설정 동시 변경)**: 짧은 시간 내에 여러 다른 설정을 변경했을 때, 각 변경이 올바르게 처리되고 UI에 정확히 반영되는지 확인 (레이스 컨디션 등 발생 여부 점검).
    *   **TC 5.4 (초기 로드 시 기본 설정 및 사용자 설정 적용)**: 새 사용자 또는 기존 사용자로 로그인 시, 기본 설정 및 서버에 저장된 사용자 설정이 올바르게 로드되어 UI에 반영되는지 확인.