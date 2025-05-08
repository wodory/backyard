**상황:**

설정 관리 로직 리팩토링을 진행 중입니다. `useIdeaMapSettings` 훅은 `['userSettings', userId]` 쿼리 키를 공유하고 `select` 옵션을 사용하여 아이디어맵 관련 설정만 추출 및 기본값과 병합하여 반환하도록 수정했습니다. 데이터 로딩 자체는 성공하지만, 브라우저 콘솔 로그 확인 결과 `useIdeaMapSettings` 훅의 `select` 함수가 앱 초기화 및 렌더링 과정에서 예상보다 훨씬 많이 호출되는 성능 문제가 발견되었습니다. 이는 불필요한 계산과 잠재적인 리렌더링을 유발할 수 있습니다.

**목표:**

`useIdeaMapSettings` 훅의 `select` 함수 호출 횟수를 최적화하고, 관련 컴포넌트의 불필요한 리렌더링을 최소화하여 애플리케이션 성능을 개선합니다.

**가설:**

1.  `useIdeaMapSettings` 훅을 사용하는 컴포넌트(`IdeaMapCanvas`, `ProjectToolbar` 등)가 불필요하게 자주 리렌더링되면서 훅과 `select` 함수가 반복 실행되고 있습니다.
2.  `select` 함수 내부 또는 `select`가 사용하는 유틸리티 함수(`extractAndMergeSettings`)가 반환하는 객체의 참조(reference)가 안정적이지 않아, 내용이 같음에도 불구하고 React Query가 데이터 변경으로 인식하여 리렌더링을 유발하고 있을 수 있습니다.

**요청 작업 (Tasklist):**

**📌 Unit 1: `select` 함수 반환값 안정화** `@layer hook (TQ), lib`

*   **Task 1.1: `extractAndMergeSettings` 유틸리티 함수 분석 및 수정**
    *   **수행:** `src/lib/settings-utils.ts` (또는 해당 유틸리티 함수가 있는 파일)를 엽니다.
    *   **내용:** `extractAndMergeSettings(settingsData, settingType)` 함수의 로직을 분석합니다. 이 함수가 입력 `settingsData` (DB값)와 `DEFAULT_SETTINGS` (기본값)를 병합할 때, 결과 객체의 내용이 이전 호출과 **실질적으로 동일하더라도 항상 새로운 객체 참조를 생성하여 반환**하는지 확인합니다. (예: 항상 `{ ...defaultPart, ...dbPart }` 같이 스프레드 연산자를 사용하여 새 객체를 만드는 경우)
    *   **수정:** 만약 항상 새 객체를 반환한다면, **결과 객체의 내용이 이전과 동일할 경우 이전 객체의 참조를 그대로 반환**하도록 수정합니다. 이를 위해 입력값과 계산된 결과값을 비교하는 로직 또는 메모이제이션 기법(예: 외부 라이브러리 없이 간단한 깊은 비교 후 조건부 반환)을 적용하는 것을 고려합니다. React Query의 `select`는 이미 결과값에 대한 메모이제이션을 수행하므로, 이 유틸리티 함수 자체가 순수하고 결정적(deterministic)이라면 TQ가 최적화를 잘 수행할 가능성이 높습니다. 함수가 복잡하다면 함수 자체를 `memoize-one` 같은 라이브러리로 감싸는 것도 방법입니다.
    *   **User Verification:** 수정 후, 앱을 다시 로드하고 콘솔 로그에서 `[useIdeaMapSettings -> select]` 로그의 호출 횟수가 이전보다 줄어들었는지 확인합니다.

---

**📌 Unit 2: 설정 사용 컴포넌트 메모이제이션** `@layer UI`

*   **Task 2.1: `React.memo` 적용**
    *   **수행:** `useIdeaMapSettings` 훅을 사용하는 주요 컴포넌트 파일들(`src/components/layout/IdeaMapCanvas.tsx`, `src/components/layout/ProjectToolbar.tsx`, `src/components/ideamap/nodes/CustomEdge.tsx`, `src/components/ideamap/nodes/CardNode.tsx` 등)을 엽니다.
    *   **내용:** 각 컴포넌트 export 부분을 `export default React.memo(ComponentName);` 형태로 수정하여 `React.memo` HOC(Higher-Order Component)를 적용합니다. 이를 통해 해당 컴포넌트로 전달되는 props가 변경되지 않으면 리렌더링을 건너뛰도록 합니다.
    *   **주의:** `React.memo`는 props에 대한 얕은 비교(shallow comparison)를 수행합니다. 만약 props로 복잡한 객체나 함수가 전달되고 이들의 참조가 자주 바뀐다면 `React.memo`의 효과가 없을 수 있습니다. 필요시 `areEqual` 비교 함수를 직접 제공할 수 있습니다.
    *   **User Verification:** 수정 후, 앱을 조작(예: 맵 패닝/줌, 다른 상태 변경)할 때 React DevTools Profiler를 사용하여 해당 컴포넌트들의 리렌더링 횟수가 줄어들었는지 확인합니다. 콘솔의 `select` 함수 로그 호출 횟수도 추가로 감소했는지 확인합니다.

---

**📌 Unit 3: (필요시) 상위 컴포넌트 리렌더링 원인 분석** `@layer UI`

*   **Task 3.1: React DevTools Profiler 사용**
    *   **수행:** 만약 Unit 1, 2를 수행해도 `select` 함수 호출이 여전히 과도하다면, React DevTools의 Profiler 탭을 사용하여 어떤 상호작용 시 어떤 컴포넌트가 왜 리렌더링되는지 분석합니다.
    *   **내용:** 프로파일링 결과를 보고, `useIdeaMapSettings`를 사용하는 컴포넌트의 리렌더링을 유발하는 상위 컴포넌트나 다른 상태 변경(예: `useAppStore`, `useIdeaMapStore`의 불필요한 업데이트)이 있는지 확인합니다.
    *   **User Verification:** 프로파일링 결과를 통해 리렌더링의 근본 원인을 파악합니다.

*   **Task 3.2: 원인 제거**
    *   **수행:** Task 3.1에서 파악된 원인에 따라 관련 코드를 수정합니다.
    *   **내용:** 예를 들어, 상위 컴포넌트의 상태 관리 최적화, Zustand 스토어의 선택자(selector) 세분화, 불필요한 `useEffect` 의존성 제거 등을 수행합니다.
    *   **User Verification:** 수정 후 다시 프로파일링하여 리렌더링이 최적화되었는지 확인합니다.

---

**📌 Unit 4: 최종 검증 및 정리** `@layer test, code`

*   **Task 4.1: 성능 및 기능 테스트**
    *   **수행:** 최적화 작업 완료 후 애플리케이션을 사용하며 성능과 기능을 전반적으로 테스트합니다.
    *   **내용:** 설정 변경 시 UI 반영 속도, 아이디어맵 조작 시 부드러움, 다른 기능과의 상호작용 등을 확인합니다. 개발 환경의 StrictMode로 인한 이중 렌더링/실행을 감안하여 판단합니다.
    *   **User Verification:** 앱 사용 경험이 개선되었는지, 새로운 버그가 발생하지 않았는지 확인합니다.

*   **Task 4.2: 코드 정리**
    *   **수행:** 추가했던 디버깅 로그(`console.log` 등)를 제거하거나 주석 처리합니다.
    *   **내용:** 코드 포맷팅 및 불필요한 주석 정리를 수행합니다.
    *   **검증:** 코드 리뷰 또는 정적 분석을 통해 코드 품질을 확인합니다.

---

**[프롬프트 끝]**

이 Tasklist는 `select` 함수의 반환값 안정화(참조 동등성)와 컴포넌트 메모이제이션을 우선적으로 시도하여 문제를 해결하는 데 중점을 둡니다. Agent가 각 단계를 수행하고 User Verification을 통해 결과를 확인하면서 진행하면 효율적인 최적화가 가능할 것입니다.