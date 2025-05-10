**목표:** `ProjectToolbar`에서 설정 변경 시 `CustomEdge` 등 UI에 즉시 올바르게 반영되고, DB에도 스키마에 맞게 저장되며, 불필요한 API 호출이나 리렌더링이 최소화되도록 수정한다.

**사전 준비:**

*   `lodash.isequal` 라이브러리를 설치하거나, 간단한 깊은 비교 유틸리티 함수를 준비합니다. (`JSON.stringify` 비교는 사용하지 않습니다.)
    ```bash
    yarn add lodash.isequal
    yarn add -D @types/lodash.isequal
    ```
*   애플리케이션 전체에서 설정 관련 타입은 `src/lib/schema/settings-schema.ts`의 Zod 스키마 기반 타입(예: `SchemaFullSettings`, `SchemaIdeaMapSettings`)을 사용하도록 점진적으로 통일하는 것을 목표로 합니다. `src/types/settings.ts`의 기존 타입들은 점차 제거합니다.

---

**✅ Task 1: `settingsService.ts` API 통신 시 타입 일관성 확보**

*   **목표:** `settingsService`가 서버와 통신할 때 Zod 스키마 기반 타입을 사용하도록 수정합니다.
*   **수정 파일:** `src/services/settingsService.ts`
*   **작업 내용:**
    1.  `updateSettings` 함수:
        *   두 번째 인자 `partialUpdate`의 타입을 `Partial<SettingsData>`에서 `Partial<SchemaFullSettings>`로 변경합니다.
        *   함수 내부에서 `convertToSettingsData` 또는 유사한 타입 변환 로직을 **제거**하고, 받은 `partialUpdate: Partial<SchemaFullSettings>`를 그대로 API 요청 body에 사용하도록 합니다. (API 엔드포인트도 이 구조를 예상해야 합니다.)
        *   API 성공 응답 처리 시, `validateSettings('full', responseData.settings_data, 'safe')` (또는 API 응답 구조에 맞게)를 통해 받은 데이터를 `SchemaFullSettings`로 검증하고 **그대로 반환**합니다. `convertToSettingsData` 호출을 제거합니다.
    2.  `fetchSettings` 함수:
        *   API 성공 응답 처리 시, `validateSettings('full', responseData.settings_data, 'safe')`를 통해 받은 데이터를 `SchemaFullSettings`로 검증하고 **그대로 반환**합니다. `convertToSettingsData` 호출을 제거합니다.
    3.  `createInitialSettings` 함수 (만약 사용 중이라면):
        *   두 번째 인자 `initialSettings`의 타입을 `SettingsData`에서 `SchemaFullSettings`로 변경하고, 서비스 내부 및 API 요청 시 이 타입을 일관되게 사용합니다.
*   **실행 가능 상태:** 빌드 가능. RQ 훅에서 타입 에러 발생 가능.
*   **검증:** `settingsService.ts` 유닛 테스트에서 `updateSettings`와 `fetchSettings`가 `SchemaFullSettings` 타입을 올바르게 처리하고 반환하는지 확인.

---

**✅ Task 2: RQ Hooks 타입 및 데이터 변환 로직 수정**

*   **목표:** 모든 설정 관련 RQ 훅이 Zod 스키마 기반 타입을 일관되게 사용하도록 하고, 불필요한 중간 타입 변환을 제거합니다.
*   **수정 파일:**
    *   `src/hooks/useUserSettingsQuery.ts`
    *   `src/hooks/useIdeaMapSettings.ts`
*   **작업 내용:**
    1.  **`useUserSettingsQuery.ts`:**
        *   `useQuery`의 제네릭 타입을 `Query<SchemaFullSettings | null, Error, SchemaFullSettings | null>`로 명확히 합니다. (Task 1 완료 시 이미 반영되었을 수 있음)
        *   `useIdeaMapSettingsFromQuery` (및 유사한 파생 훅): `select` 함수가 `SchemaFullSettings | null`을 입력받아 해당 섹션의 스키마 타입(예: `SchemaIdeaMapSettings`)을 반환하도록 합니다.
            ```typescript
            // useUserSettingsQuery.ts 예시
            export function useIdeaMapSettingsFromQuery(userId?: string) {
              return useUserSettingsQuery(userId, {
                select: (data: SchemaFullSettings | null): SchemaIdeaMapSettings => {
                  // data가 null일 경우 또는 data.ideamap이 없을 경우 기본값 반환
                  if (!data || !data.ideamap) {
                    return getDefaultSettings('ideamap'); // Zod 스키마의 기본값 반환
                  }
                  return data.ideamap;
                }
              });
            }
            ```
    2.  **`src/hooks/useIdeaMapSettings.ts`:**
        *   **`convertSchemaToTypeSettings` 함수를 제거합니다.**
        *   **`useIdeaMapSettings` 훅:**
            *   `useIdeaMapSettingsFromQuery(userId)`를 호출하여 `SchemaIdeaMapSettings` 타입의 `ideaMapSettings`를 가져옵니다. 이 훅이 반환하는 모든 값(isLoading 등)을 그대로 반환합니다.
            *   이 훅 내부에 정의된 로컬 `updateSettings` 뮤테이션을 **제거**합니다. (업데이트는 `useUpdateIdeaMapSettingsMutation`으로 일원화)
        *   **`useUpdateIdeaMapSettingsMutation` 훅:**
            *   `mutationFn`의 `settings` 인자 타입은 `Partial<SchemaIdeaMapSettings>`가 됩니다.
            *   `mutationFn` 내부에서 `settingsService.updateSettings`를 호출할 때, `partialUpdate`를 `Partial<SchemaFullSettings>` 형태로 구성해야 합니다. 즉, `settings`를 `ideamap` 키 아래에 넣어 전달합니다.
                ```typescript
                // useUpdateIdeaMapSettingsMutation > mutationFn 내부
                mutationFn: ({ userId, settings /* Partial<SchemaIdeaMapSettings> */ }) => {
                  const partialUpdateForService: Partial<SchemaFullSettings> = {
                    ideamap: settings // settings는 { edge: { animated: true } } 와 같은 형태
                  };
                  // ... (아래 변경 감지 로직 추가) ...
                  logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 요청 시작 (userId: ${userId})`, { partialUpdateForService });
                  return settingsService.updateSettings(userId, partialUpdateForService);
                },
                ```
            *   **`onMutate` 수정:**
                *   `previousSettings`는 `SchemaFullSettings | undefined` 타입입니다.
                *   `updatedSettings`를 계산할 때 `previousSettings.ideamap`과 `variables.settings` (`Partial<SchemaIdeaMapSettings>`)를 올바르게 병합하여 `updatedSettings.ideamap`을 만듭니다.
                    ```typescript
                    // onMutate 내부
                    if (previousSettings) {
                      const updatedIdeamapSettings: SchemaIdeaMapSettings = {
                        ...previousSettings.ideamap, // 기본 구조 유지
                        ...settings,                 // 최상위 레벨 업데이트 (snapToGrid 등)
                        edge: {                      // edge는 특별히 깊게 병합
                          ...previousSettings.ideamap.edge,
                          ...(settings.edge || {}),
                        },
                        // cardNode, layout 등 다른 ideamap 하위 설정도 필요시 병합
                      };
                      const updatedSettings: SchemaFullSettings = {
                        ...previousSettings,
                        ideamap: updatedIdeamapSettings,
                      };
                      queryClient.setQueryData(['userSettings', userId], updatedSettings);
                      logger.info('[onMutate] 낙관적 업데이트 적용', { /* ... */ });
                    }
                    ```
            *   **중요 - 변경 감지 로직 추가 (API 호출 최적화):** `mutationFn` 내부, `settingsService.updateSettings` 호출 **전에** 다음 로직을 추가합니다.
                ```typescript
                // useUpdateIdeaMapSettingsMutation > mutationFn 시작 부분에 추가
                const currentFullSettings = queryClient.getQueryData<SchemaFullSettings>(['userSettings', userId]);
                if (currentFullSettings) {
                  // settings (Partial<SchemaIdeaMapSettings>) 와 currentFullSettings.ideamap 을 깊은 비교
                  // lodash.isEqual 등을 사용하거나, 필요한 부분만 직접 비교
                  // 예시: const changes = !isEqual(currentFullSettings.ideamap, 예상되는_업데이트된_아이디어맵_부분);
                  // 간단하게는, 업데이트 하려는 settings의 키와 값을 currentFullSettings.ideamap의 해당 값과 비교
                  let hasActualChanges = false;
                  if (settings.edge && currentFullSettings.ideamap.edge.animated !== settings.edge.animated) {
                      hasActualChanges = true;
                  }
                  // ... 다른 비교 로직 ...

                  if (!hasActualChanges) {
                    logger.debug('[useUpdateIdeaMapSettingsMutation] 실제 변경 사항 없음 (깊은 비교 후), API 호출 건너뛰기');
                    return Promise.resolve(currentFullSettings); // 현재 캐시된 값 반환
                  }
                }
                ```
*   **실행 가능 상태:** 빌드 가능. 타입 시스템이 Zod 스키마 중심으로 통일되기 시작.
*   **검증:** 각 훅의 유닛 테스트에서 반환/처리되는 데이터 타입이 `SchemaFullSettings` 또는 `SchemaIdeaMapSettings`인지 확인. `useUpdateIdeaMapSettingsMutation`이 실제 변경이 있을 때만 API를 호출하는지 확인.

---

**✅ Task 3: 서버 API (`/api/settings` PATCH 핸들러) 수정**

*   **목표:** 서버 API가 클라이언트로부터 `Partial<SchemaFullSettings>` 구조의 요청을 받아, DB에 저장된 `SchemaFullSettings` 데이터에 올바르게 깊은 병합(deep merge)하여 스키마 일관성을 유지하도록 수정합니다.
*   **수정 파일:** `src/app/api/settings/route.ts` (PATCH 핸들러)
*   **작업 내용:**
    1.  PATCH 요청의 `body` (클라이언트에서 보낸 `partialUpdateForService`)는 `Partial<SchemaFullSettings>` 형태일 것입니다 (예: `{ ideamap: { edge: { animated: true } } }`).
    2.  DB에서 `userId`로 기존 사용자 설정을 조회합니다 (`existingSettings`).
    3.  `lodash.merge` 또는 유사한 깊은 병합 유틸리티를 사용하여 `existingSettings.settings_data` (JSON 필드)와 `body` (클라이언트 요청 본문)를 병합합니다. **주의: `body` 전체를 `settings_data`에 덮어쓰는 것이 아니라, `body`의 각 최상위 키 (예: `ideamap`, `theme`) 내부의 값들을 `existingSettings.settings_data`의 해당 키 내부에 병합해야 합니다.**
        ```typescript
        // /api/settings PATCH 핸들러 내부 (예시)
        const body: Partial<SchemaFullSettings> = await request.json();
        const existingRecord = await prisma.settings.findUnique({ where: { userId } });
        
        if (!existingRecord) { /* ... 사용자 없음 처리 ... */ }

        const existingSettingsData = existingRecord.settings_data as SchemaFullSettings;
        
        // 깊은 병합 (lodash.merge 사용 예시)
        const newSettingsData = merge({}, existingSettingsData, body); 
        
        // 또는 수동 병합 (더 안전할 수 있음, 스키마 구조를 정확히 알고 있을 때)
        // const newSettingsData: SchemaFullSettings = {
        //   theme: { ...existingSettingsData.theme, ...(body.theme || {}) },
        //   general: { ...existingSettingsData.general, ...(body.general || {}) },
        //   ideamap: {
        //     ...existingSettingsData.ideamap,
        //     ...(body.ideamap || {}),
        //     edge: {
        //       ...existingSettingsData.ideamap.edge,
        //       ...(body.ideamap?.edge || {}),
        //     },
        //     cardNode: { /* ... */ },
        //     layout: { /* ... */ },
        //   },
        // };

        const updatedRecord = await prisma.settings.update({
          where: { userId },
          data: { settings_data: newSettingsData as any }, // Prisma JSON 타입 호환성
        });
        // 클라이언트에는 업데이트된 전체 SchemaFullSettings 구조를 반환
        return NextResponse.json({ settings_data: updatedRecord.settings_data }); 
        ```
*   **실행 가능 상태:** 빌드 및 실행 가능. DB 저장 구조가 Zod 스키마와 일치하게 됩니다.
*   **검증:** API 테스트 도구(Postman 등) 또는 통합 테스트를 사용하여 PATCH 요청 시 DB 데이터가 올바른 스키마 구조로 깊은 병합되어 업데이트되는지 확인.

---

**✅ Task 4: Zustand Store (`useIdeaMapStore`) 의존성 완전 제거 (재확인 및 완료)**

*   **목표:** `useIdeaMapStore`가 아이디어맵의 UI 상태(노드, 엣지, 뷰포트 등 React Flow 자체 상태)만 관리하고, 설정 관련 상태 및 액션을 완전히 제거합니다.
*   **수정 파일:** `src/store/useIdeaMapStore.ts`
*   **작업 내용:**
    1.  이전 답변에서 언급된 `ideaMapSettings` 상태, `_updateSettingsRef`, `updateIdeaMapSettings`, `updateAllEdgeStylesAction` 등 설정과 관련된 모든 상태와 액션을 **다시 한번 꼼꼼히 확인하고 완전히 제거**합니다.
    2.  `persist` 미들웨어에서 설정 관련 키가 있다면 제거합니다.
*   **실행 가능 상태:** 빌드 가능. Zustand는 더 이상 설정 데이터를 관리하지 않습니다.
*   **검증:** `useIdeaMapStore`의 코드를 리뷰하여 설정 관련 코드가 완전히 제거되었는지 확인. 애플리케이션 실행 시 콘솔에 Zustand 관련 설정 업데이트 로그가 더 이상 나타나지 않아야 합니다.

---

**✅ Task 5: UI 컴포넌트에서 RQ Hook 사용 및 데이터 적용 방식 재검토 (재확인 및 완료)**

*   **목표:** 모든 UI 컴포넌트가 RQ 훅을 통해 `SchemaIdeaMapSettings` (또는 `SchemaFullSettings`의 일부)를 가져와 사용하고, 이 값을 올바르게 UI 렌더링에 적용하도록 합니다.
*   **수정 파일:**
    *   `src/components/ideamap/nodes/CustomEdge.tsx`
    *   `src/components/ideamap/components/IdeaMapCanvas.tsx`
    *   `src/components/layout/ProjectToolbar.tsx`
*   **작업 내용:**
    1.  **`CustomEdge.tsx`:**
        *   `useIdeaMapSettingsFromQuery(userId)` (또는 `useIdeaMapSettings`로 이름 변경된 훅)를 사용하여 `ideaMapSettings: SchemaIdeaMapSettings`를 가져옵니다.
        *   `animated` prop 값은 `ideaMapSettings.edge.animated`를 직접 사용합니다.
        *   스타일 객체 생성 시 `ideaMapSettings.edge.edgeColor`, `ideaMapSettings.edge.strokeWidth` 등을 사용합니다.
        *   `mergeEdgeStyles` 유틸리티 함수가 있다면, 입력과 출력이 모두 스키마 기반 타입을 따르는지 확인합니다.
    2.  **`IdeaMapCanvas.tsx`:**
        *   `defaultEdgeOptions`를 설정할 때, `useIdeaMapSettingsFromQuery`를 통해 가져온 `ideaMapSettings.edge`의 값들을 사용합니다.
            ```typescript
            // IdeaMapCanvas.tsx 내부 예시
            const { data: ideaMapSettings, isLoading, isError } = useIdeaMapSettingsFromQuery(userId);
            // ... 로딩/에러 처리 ...

            const defaultEdgeOptions = useMemo(() => ({
              type: 'custom',
              animated: ideaMapSettings?.edge?.animated ?? false, // 기본값 폴백
              style: {
                strokeWidth: ideaMapSettings?.edge?.strokeWidth ?? DEFAULT_SETTINGS.ideamap.edge.strokeWidth,
                stroke: ideaMapSettings?.edge?.edgeColor ?? DEFAULT_SETTINGS.ideamap.edge.edgeColor,
              },
              markerEnd: ideaMapSettings?.edge?.markerEnd 
                ? { type: ideaMapSettings.edge.markerEnd, width: ideaMapSettings.edge.markerSize, height: ideaMapSettings.edge.markerSize, color: ideaMapSettings.edge.edgeColor }
                : undefined,
            }), [ideaMapSettings]);
            ```
        *   `useEffect` 등에서 엣지 스타일을 강제로 업데이트하는 로직이 있다면, 해당 로직이 RQ 훅의 데이터를 기반으로 동작하거나, 혹은 불필요하다면 제거합니다. (React Flow는 `edges` 배열이나 `defaultEdgeOptions`가 변경되면 자동으로 리렌더링합니다.)
    3.  **`ProjectToolbar.tsx`:**
        *   `useIdeaMapSettingsFromQuery`를 사용하여 현재 설정을 읽어와 UI에 표시합니다.
        *   설정 변경 시 `useUpdateIdeaMapSettingsMutation`의 `mutate` 함수에 전달하는 `settings` 객체가 `Partial<SchemaIdeaMapSettings>` (예: `{ edge: { animated: true } }`) 형태인지 확인합니다.
*   **실행 가능 상태:** 빌드 및 실행 가능. UI가 RQ 캐시의 최신 설정을 올바르게 반영해야 합니다.
*   **검증:**
    *   애플리케이션을 실행하여 `ProjectToolbar`에서 `animated` 설정을 변경합니다.
    *   **즉시 (낙관적 업데이트):** `IdeaMap`의 엣지들이 애니메이션 상태를 변경하는지 확인합니다.
    *   **잠시 후 (서버 동기화):** 상태가 유지되는지 확인합니다.
    *   **DB 확인:** DB의 `settings_data` 필드가 `SchemaFullSettings` 구조를 유지하며 `ideamap.edge.animated` 값이 올바르게 변경되었는지 확인합니다.
    *   페이지 새로고침 후에도 변경된 설정이 유지되는지 확인합니다.

---

이 Tasklist를 정밀하게 따라서 수정하면, 데이터 흐름이 명확해지고 문제점들이 해결될 것입니다. 특히 **DB 저장 구조의 일관성 확보**와 **타입 통일**, 그리고 **UI 컴포넌트에서의 올바른 데이터 참조**가 핵심입니다.