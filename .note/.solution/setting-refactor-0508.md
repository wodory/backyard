## Tasklist: 설정 아키텍처 RQ 중심으로 개선

**목표:** 설정 데이터 관리를 TanStack Query(RQ)로 완전히 이전하고, Zustand 스토어(`useIdeaMapStore`)에서는 setting 관련 상태를 제거하여 데이터 흐름을 명확히 하고 설정 변경 전파 문제를 해결한다.

**사전 준비:**

*   현재 코드 베이스에서 테스트가 통과하는지 확인하거나, 실패하는 테스트가 있다면 원인을 파악해 둡니다.
*   MSW 핸들러가 `/api/settings` (GET, PATCH) 요청을 적절히 모킹할 수 있도록 준비합니다.

---

### **✅ 1단계: `settingsService.ts` 반환 타입 수정**

*   **목표:** 서비스 계층(`settingsService`)이 API 응답 검증 후, 내부 변환 없이 Zod 스키마 기반의 `FullSettings` 타입을 직접 반환하도록 수정합니다.
*   **수정 파일:** `src/services/settingsService.ts`
*   **작업 내용:**
    1.  `fetchSettings` 함수:
        *   API 응답(`responseData.settingsData`)을 `validateSettings('full', ..., 'safe')`로 검증하는 로직은 유지합니다.
        *   `convertToSettingsData` 함수 호출을 **제거**하고, `validateSettings`가 반환한 `FullSettings` 타입의 객체를 **직접 반환**하도록 수정합니다. (반환 타입 시그니처도 `Promise<FullSettings | null>` 등으로 변경 필요)
    2.  `updateSettings` 함수:
        *   API 성공 응답(`updatedData.settingsData`)을 `validateSettings('full', ..., 'safe')`로 검증하는 로직은 유지합니다.
        *   `convertToSettingsData` 함수 호출을 **제거**하고, 검증된 `FullSettings` 객체를 **직접 반환**하도록 수정합니다. (반환 타입 시그니처도 `Promise<FullSettings>` 등으로 변경 필요)
    3.  (선택) `convertToSettingsData` 함수는 이제 서비스 계층에서 사용되지 않으므로 제거하거나 주석 처리합니다.
*   **실행 가능 상태:** 이 단계 완료 후, 코드는 빌드 가능해야 합니다. `settingsService`를 사용하는 RQ 훅에서 타입 에러가 발생할 수 있습니다 (다음 단계에서 해결).
*   **검증:**
    *   `settingsService.ts`에 대한 유닛 테스트(MSW 사용)를 실행하여 `fetchSettings`와 `updateSettings`가 `FullSettings` 타입을 올바르게 반환하는지 확인합니다.

---

### **✅ 2단계: Core RQ Hook (`useUserSettingsQuery`) 타입 업데이트**

*   **목표:** `useUserSettingsQuery` 훅이 `settingsService`로부터 `FullSettings` 타입을 받아 처리하고 반환하도록 수정합니다.
*   **수정 파일:** `src/hooks/useUserSettingsQuery.ts`
*   **작업 내용:**
    1.  `useQuery`의 제네릭 타입을 수정하여 `fetchSettings`로부터 `FullSettings | null` 타입을 받고, 최종적으로 `FullSettings | null` 타입을 반환하도록 명시합니다.
        ```typescript
        // 예시:
        export const useUserSettingsQuery = (userId?: string) => {
          return useQuery<FullSettings | null, Error, FullSettings | null>({ // <TQueryFnData, TError, TData>
            queryKey: ['userSettings', userId],
            queryFn: async () => {
              // ... 기존 로직 ...
              if (!userId) return null;
              const settingsData = await fetchSettings(userId); // 이제 FullSettings | null 반환
              return settingsData;
            },
            // ... 기타 옵션 ...
          });
        };
        ```
    2.  이 훅 내부에서 더 이상 `SettingsData` 타입을 가정하는 로직이 없도록 확인합니다.
*   **실행 가능 상태:** 코드는 빌드 가능해야 합니다. 이 훅을 직접 사용하는 컴포넌트가 있다면 타입 에러가 날 수 있지만, 주로 파생 훅(`useIdeaMapSettings` 등)에서 사용하므로 큰 문제는 없을 수 있습니다 (다음 단계에서 해결).
*   **검증:**
    *   `useUserSettingsQuery.ts`에 대한 유닛 테스트를 실행하여 반환되는 `data`의 타입이 `FullSettings | null`인지 확인합니다.

---

### **✅ 3단계: 파생 RQ Hooks (`useIdeaMapSettings` 등) 업데이트**

*   **목표:** `useUserSettingsQuery`의 결과를 받아 특정 설정 섹션만 선택(select)하는 파생 훅들이 `FullSettings` 입력을 올바르게 처리하도록 수정합니다.
*   **수정 파일:**
    *   `src/hooks/useIdeaMapSettings.ts`
    *   `src/hooks/useThemeSettings.ts`
    *   `src/hooks/useGeneralSettings.ts`
*   **작업 내용:**
    1.  각 파생 훅 내부에서 `useUserSettingsQuery`를 호출하는 부분은 그대로 둡니다.
    2.  `select` 옵션에 전달되는 함수 (`extractAndMergeSettings`) 또는 해당 로직이 입력으로 `FullSettings | null` 타입을 받고, 반환 타입은 해당 섹션의 타입(예: `IdeaMapSettings`)이 되도록 수정/확인합니다.
        ```typescript
        // useIdeaMapSettings.ts 예시:
        export function useIdeaMapSettings() {
          // ... userId 가져오기 ...
          const { data: userSettings, ...queryInfo } = useUserSettingsQuery(userId);

          // select 로직을 useMemo 등으로 감싸 최적화하는 것이 좋음
          const ideaMapSettings = useMemo(() => {
            if (!userSettings) {
              // 기본값 반환 또는 로딩 상태 처리에 맞게 null 반환
              return getDefaultSettings('ideamap'); // settings-utils 사용
            }
            // userSettings는 FullSettings 타입이므로 직접 접근
            return extractAndMergeSettings(userSettings, 'ideamap');
          }, [userSettings]);

          return { data: ideaMapSettings, ...queryInfo };
        }
        ```
    3.  `extractAndMergeSettings` 함수(`src/lib/settings-utils.ts`)가 `FullSettings` 타입을 입력받아 원하는 섹션을 올바르게 추출하고 기본값과 병합하는지 다시 한번 확인합니다.
*   **실행 가능 상태:** 코드는 빌드 가능해야 합니다. 이제 RQ 훅들은 일관된 `FullSettings` 기반으로 동작합니다.
*   **검증:**
    *   각 파생 훅(`useIdeaMapSettings` 등)에 대한 유닛 테스트를 실행하여 올바른 타입의 설정 섹션 데이터가 반환되는지 확인합니다.

---

### **✅ 4단계: Mutation Hook (`useUpdateSettingsMutation`) 업데이트**

*   **목표:** 설정 업데이트 뮤테이션 훅이 RQ 캐시의 `FullSettings` 데이터를 올바르게 읽고 쓰도록 수정합니다.
*   **수정 파일:** `src/hooks/useUpdateSettingsMutation.ts`
*   **작업 내용:**
    1.  `onMutate` 콜백:
        *   `queryClient.getQueryData<FullSettings | null>(['userSettings', userId])`를 사용하여 현재 캐시 데이터를 `FullSettings` 타입으로 가져옵니다.
        *   `applyPartialSettings` 또는 `deepMergeSettings` 유틸리티를 사용하여 `currentSettings` (FullSettings 타입)와 `variables.partialUpdate` (Partial<FullSettings> 타입)를 병합하여 `nextSettings: FullSettings`를 계산합니다.
        *   `queryClient.setQueryData<FullSettings>(['userSettings', userId], nextSettings)`를 호출하여 캐시를 업데이트합니다.
        *   컨텍스트로 롤백에 필요한 `previousSettings: FullSettings | null`를 반환합니다.
    2.  `onError` 콜백:
        *   컨텍스트에서 `previousSettings`를 가져옵니다.
        *   `queryClient.setQueryData<FullSettings | null>(['userSettings', userId], previousSettings)`를 호출하여 캐시를 롤백합니다.
    3.  (확인) `mutationFn`이 `settingsService.updateSettings`를 올바르게 호출하고, `partialUpdate`가 적절한 형식 (`Partial<FullSettings>`)인지 확인합니다.
*   **실행 가능 상태:** 코드는 빌드 가능해야 합니다. 뮤테이션 로직이 `FullSettings` 타입과 호환됩니다.
*   **검증:**
    *   `useUpdateSettingsMutation.ts`에 대한 유닛 테스트(MSW 사용)를 실행하여 낙관적 업데이트 시 캐시가 `FullSettings`로 올바르게 업데이트되고, 오류 시 올바르게 롤백되는지 확인합니다.

---

### **✅ 5단계: Zustand Store (`useIdeaMapStore`) 의존성 제거**

*   **목표:** `useIdeaMapStore`에서 설정 데이터(`ideaMapSettings`)와 관련 로직을 완전히 제거하여 RQ를 유일한 SSOT로 만듭니다.
*   **수정 파일:** `src/store/useIdeaMapStore.ts`
*   **작업 내용:**
    1.  `IdeaMapState` 인터페이스에서 `ideaMapSettings: Settings` 필드를 **삭제**합니다.
    2.  스토어 초기 상태에서 `ideaMapSettings` 필드를 **삭제**합니다.
    3.  `updateIdeaMapSettings` 액션을 **삭제**합니다.
    4.  `_updateSettingsRef` 함수와 관련 상태 필드(`settingsRef` 등)를 **삭제**합니다. (RQ 훅이 직접 데이터를 제공하므로 참조 전달 불필요)
    5.  스토어 내부의 다른 함수(예: `applyEdgeChangesAction`, `connectNodesAction` 등)에서 `state.ideaMapSettings`를 참조하는 부분이 있다면, 해당 로직을 수정하거나 제거합니다. (엣지 스타일링 등은 이제 `CustomEdge` 컴포넌트가 RQ 훅을 통해 직접 처리해야 함).
    6.  `persist` 미들웨어 설정에서 `ideaMapSettings` 관련 부분을 **제거**합니다. (서버 상태는 로컬 스토리지에 저장하지 않습니다).
*   **실행 가능 상태:** 코드는 빌드 가능해야 합니다. 하지만 `useIdeaMapStore`에서 설정을 읽던 컴포넌트들은 이제 에러가 발생하거나 잘못된 데이터를 사용할 수 있습니다 (다음 단계에서 해결).
*   **검증:**
    *   `useIdeaMapStore.ts` 관련 유닛 테스트 중 설정 관련 테스트는 제거하거나 수정합니다.
    *   애플리케이션을 실행했을 때, 설정 관련 기능이 일시적으로 동작하지 않을 수 있습니다.

---

### **✅ 6단계: UI 컴포넌트에서 RQ Hook 사용 통일**

*   **목표:** 설정 데이터를 사용하는 모든 UI 컴포넌트가 Zustand 대신 적절한 RQ 훅(`useIdeaMapSettings`, `useThemeSettings` 등)을 사용하도록 수정합니다.
*   **수정 파일:** (코드베이스 전체 검색 필요)
    *   `src/components/ideamap/nodes/CustomEdge.tsx`
    *   `src/components/ideamap/nodes/CardNode.tsx`
    *   `src/components/ideamap/components/IdeaMapCanvas.tsx` (내부 로직 확인)
    *   `src/components/layout/ProjectToolbar.tsx` (이미 되어 있을 수 있음)
    *   기타 설정 값을 사용하는 모든 컴포넌트
*   **작업 내용:**
    1.  코드베이스에서 `useIdeaMapStore`를 사용하여 `ideaMapSettings` 또는 관련 설정 값을 읽는 모든 부분을 찾습니다.
    2.  해당 부분을 적절한 RQ 훅(주로 `useIdeaMapSettings`) 호출로 **대체**합니다.
        ```typescript
        // 변경 전 (예시):
        // const settings = useIdeaMapStore(state => state.ideaMapSettings);
        // const edgeColor = settings.edgeColor;

        // 변경 후 (예시):
        const { data: settings, isLoading, isError } = useIdeaMapSettings(); // 또는 useThemeSettings 등
        // 로딩/에러 상태 처리 필요
        if (isLoading) return <Spinner />;
        if (isError || !settings) return <div>Error loading settings</div>;
        const edgeColor = settings.edgeColor; // settings는 이제 IdeaMapSettings 타입
        ```
    3.  `CustomEdge`나 `CardNode` 등에서 설정 값을 props로 받는 대신, 내부에서 직접 RQ 훅을 호출하도록 구조를 변경하는 것을 고려합니다 (Prop Drilling 방지).
*   **실행 가능 상태:** 코드는 빌드 및 실행 가능해야 하며, 설정 변경 기능이 정상적으로 동작해야 합니다.
*   **검증:**
    *   **수동 테스트:** 애플리케이션을 실행하여 `ProjectToolbar`에서 다양한 설정을 변경했을 때, `IdeaMap`의 `CustomEdge`, `CardNode` 등의 UI가 즉시 (낙관적으로) 반영되고, 잠시 후 상태가 유지되는지 확인합니다. 페이지 새로고침 후에도 설정이 유지되는지 확인합니다.
    *   **통합 테스트:** 관련 통합 테스트 또는 E2E 테스트를 실행하여 설정 변경 시나리오가 성공하는지 확인합니다.

---

### **✅ 7단계: 코드 정리 및 사용하지 않는 파일 제거**

*   **목표:** 리팩토링 과정에서 더 이상 사용되지 않는 코드나 파일을 제거합니다.
*   **작업 내용:**
    1.  `src/services/settingsService.ts`에서 제거된 `convertToSettingsData` 함수 관련 코드를 완전히 삭제합니다.
    2.  `src/store/useIdeaMapStore.ts`에서 설정 관련 로직이 완전히 제거되었는지 확인하고, 관련 주석 등도 정리합니다.
    3.  이전에 설정 데이터를 `SettingsData` 타입으로 다루던 임시 타입 정의나 유틸리티 함수가 있다면 제거합니다.
    4.  테스트 코드에서 더 이상 사용되지 않는 모킹이나 변수를 정리합니다.
*   **검증:**
    *   코드 리뷰를 통해 불필요한 코드가 남지 않았는지 확인합니다.
    *   모든 테스트가 통과하는지 최종 확인합니다.

---

**제거해야 할 파일 (잠재적):**

위 작업이 모두 끝나면 아래 파일들은 역할이 없어지거나 크게 변경되어 제거/수정이 필요할 수 있습니다:

1.  `src/types/settings.ts`의 `SettingsData` 타입 정의: `FullSettings` 및 각 섹션별 타입(`IdeaMapSettings`, `ThemeSettings` 등)으로 대체되므로 필요 없어질 수 있습니다. `ApiError` 등 다른 타입은 유지될 수 있습니다.
2.  `src/lib/settings-utils.ts`의 `convertToSettingsData` 함수: 서비스 계층에서 사용하지 않게 되므로 제거 가능합니다. 다른 유틸리티 함수(`deepMergeSettings`, `validateSettings`, `getDefaultSettings`)는 계속 사용됩니다.

이 Tasklist를 단계별로 진행하고 각 단계의 검증 포인트를 확인하면, 설정 관리 아키텍처를 성공적으로 RQ 중심으로 전환할 수 있을 것입니다.