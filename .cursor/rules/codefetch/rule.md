Project Structure:
├── async-test.mdc
├── codefetch
├── explicit-error-throw-testing.mdc
├── global-env-mocking.mdc
├── increase-coverage.mdc
├── logger-mocking-solution.mdc
├── nodejs-v20-undici-unref.mdc
├── package.mdc
├── piper5.mdc
├── react-test-failure.mdc
├── three-layer-standard.mdc
├── vitest-mocking.mdc
└── zustand-action-msw.mdc


async-test.mdc
```
1 | ---
2 | description: to slove a problem while coding aync test for web UI
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | ## 작업: 비동기 테스트 타임아웃 오류 해결 (`{target_file_or_folder}`)
7 | 
8 | **목표:** `{target_file_or_folder}` 내에서 발생하는 `Test timed out` 또는 유사한 비동기 관련 오류를 해결하여 테스트가 안정적으로 통과하도록 수정합니다.
9 | 
10 | **컨텍스트:**
11 | *   테스트가 비동기 작업(`fetch`, `Promise`, 상태 업데이트 후 UI 변경 등)을 포함하고 있으며, 이러한 작업들이 테스트 환경의 제한 시간 내에 완료되지 않거나, 상태 업데이트가 제대로 처리되지 않아 타임아웃이 발생하는 것으로 추정됩니다.
12 | *   `setup.ts`의 변경 (특히 모킹 방식 변경) 후 문제가 발생했을 수 있습니다.
13 | *   테스트 프레임워크는 Vitest, `@testing-library/react`, `@testing-library/user-event`를 사용합니다.
14 | 
15 | **지시사항 (오류가 발생하는 각 테스트 파일 또는 `it` 블록에 대해 적용):**
16 | 
17 | **Phase 1: 오류 분석 (`it.only` 권장)**
18 | 
19 | 1.  **대상 식별:** 타임아웃 오류가 발생하는 특정 테스트 파일 또는 `it` 블록을 식별합니다. 디버깅을 위해 `.only`를 사용하여 해당 테스트만 실행합니다.
20 | 2.  **비동기 지점 파악:** 테스트 코드와 테스트 대상 컴포넌트/함수 내에서 타임아웃을 유발할 가능성이 있는 비동기 작업 지점을 정확히 파악합니다.
21 |     *   `fetch` 또는 다른 네트워크 요청
22 |     *   `Promise` 기반 로직
23 |     *   `setTimeout`, `setInterval` (fake timer 사용 여부 확인)
24 |     *   React 상태 업데이트 (`useState`, Zustand `set` 등)를 유발하는 이벤트 핸들러 또는 `useEffect` 내 비동기 로직
25 | 3.  **상태 업데이트와 단언(Assertion) 분리:** 비동기 작업 *이후에* 발생하는 상태 업데이트와, 그 업데이트된 상태나 UI를 검증하는 `expect` 단언 부분을 명확히 구분합니다. 타임아웃은 주로 비동기 작업 후 상태/UI가 업데이트되기를 기다리는 부분에서 발생합니다.
26 | 
27 | **Phase 2: 비동기 처리 수정**
28 | 
29 | 1.  **`act` 래퍼 적용:**
30 |     *   **상태 업데이트 유발 인터랙션:**
31 |     *   `userEvent` (`click`, `type` 등): 대부분 내부적으로 `act`를 포함하므로 명시적 래핑이 불필요합니다. **단, 테스트 실행 중 `act` 관련 경고가 발생하면, 해당 상호작용을 `await act(async () => { ... });` 로 감싸야 합니다.** 이는 주로 이벤트 핸들러가 완료된 후에도 비동기 상태 업데이트가 진행될 때 필요합니다.
32 |         *   `fireEvent`: 상태 업데이트를 유발하는 경우, 적절하게 `act` 또는 `await act(async () => { ... });` 로 감싸는 것이 좋습니다.
33 |         *   **상태 업데이트 유발 비동기 함수 직접 호출:** 테스트 코드에서 직접 `async` 함수를 호출하고 그 결과로 상태가 업데이트된다면, 해당 호출도 `await act(async () => { ... });` 로 감싸는 것을 고려합니다.
34 |     *   **동기적 상태 업데이트:** 동기적인 상태 업데이트만 유발하는 인터랙션은 `act(() => { ... });` 로 감싸도 충분할 수 있습니다.
35 | 2.  **`waitFor` 사용:**
36 |     *   비동기 작업(예: `fetch`)이 완료된 후 **DOM이 업데이트되기를 기다려야 할 때** `waitFor`를 사용합니다. `expect` 단언은 `waitFor` 콜백 *내부*에 위치해야 합니다.
37 |     *   `waitFor`는 특정 조건(예: 특정 텍스트가 나타남, 로딩 스피너가 사라짐)이 충족될 때까지 주기적으로 콜백을 재실행합니다.
38 |     *   **예시:**
39 |         ```typescript
40 |         // API 호출 후 데이터가 렌더링될 때까지 기다림
41 |         await waitFor(() => {
42 |           expect(screen.getByText('데이터 로드 완료')).toBeInTheDocument();
43 |         });
44 | 
45 |         // 특정 요소가 사라질 때까지 기다림
46 |         await waitFor(() => {
47 |           expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
48 |         });
49 |         ```
50 |     *   `findBy*` 쿼리 (`findByText`, `findByRole` 등)는 내부에 `waitFor`가 구현되어 있으므로, 요소가 비동기적으로 나타날 때 사용하면 코드가 간결해질 수 있습니다.
51 | 3.  **Fake Timers 확인:** `vi.useFakeTimers()`가 사용된 경우, `setTimeout`이나 `setInterval` 같은 타이머 의존 로직이 있다면, `act` 내에서 `vi.advanceTimersByTime(...)` 또는 `vi.runAllTimers()`를 호출하여 타이머를 명시적으로 진행시켜야 합니다.
52 | 4.  **Promise/Mock 확인:** 테스트에서 사용하는 모든 비동기 모킹(`fetch`, `signIn` 등)이 프라미스를 반환하고, 테스트 흐름에 맞게 `resolve` 또는 `reject` 되는지 다시 확인합니다. `mockImplementation` 내에서 `async` 키워드가 누락되지 않았는지 확인합니다.
53 | 5.  **정리(Cleanup) 타이밍:** `@testing-library/react`의 `cleanup` 함수는 각 테스트 후에 자동으로 호출되지만(Vitest 설정에 따라 다를 수 있음), 비동기 작업이 완전히 완료되기 전에 `cleanup`이 실행되면 문제가 발생할 수 있습니다. 모든 비동기 상호작용과 단언이 완료된 *후에* 테스트가 종료되도록 `async/await`와 `waitFor`를 올바르게 사용합니다.
54 | 
55 | **Phase 3: 검증**
56 | 
57 | 1.  **테스트 재실행:** 수정된 테스트(`it.only` 상태)를 다시 실행하여 타임아웃 오류가 해결되었는지 확인합니다.
58 | 2.  **반복:** 오류가 지속되면 Phase 1과 2를 반복하며 다른 비동기 지점이나 `act`/`waitFor` 사용법을 검토합니다. 문제가 해결되면 `.only`를 제거하고 다음 실패 테스트로 이동합니다.
59 | 3.  **최종 확인:** `{target_file_or_folder}` 내 모든 타임아웃 오류가 해결될 때까지 반복합니다.
60 | 
61 | **보고:**
62 | 각 파일을 수정하고 테스트를 통과시킨 후, 주로 어떤 수정(`act` 추가/수정, `waitFor` 사용, 타이머 제어 등)을 통해 문제를 해결했는지 보고해주세요.
63 | 
64 | ---
65 | 
66 | **사용 예시:**
```

explicit-error-throw-testing.mdc
```
1 | ---
2 | description: 
3 | globs: src/**/*.test.ts,src/**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | **Rule 이름:** 종합적인 코드 경로 및 예외 처리 테스트 규칙 (Comprehensive Code Path and Exception Handling Testing Rule)
7 | 
8 | **규칙 내용:**
9 | 
10 | ---
11 | 
12 | **규칙: 종합적인 코드 경로 및 예외 처리 테스트**
13 | 
14 | **1. 목표:**
15 | 모든 `.ts` 파일에 대해 **라인, 브랜치, 함수 커버리지 90% 이상** 달성을 목표로 합니다. 이를 위해 함수의 모든 가능한 실행 경로(성공, 실패, 예외, 환경 분기 등)를 테스트 케이스로 작성하고 검증합니다. 특히 **브랜치 커버리지** 확보에 중점을 둡니다.
16 | 
17 | **2. 핵심 원칙:**
18 | *   **모든 분기 테스트:** `if/else`, `try/catch`, `switch`, 삼항 연산자, 논리 연산자(||, &&)의 단축 평가 등 모든 조건 분기문의 **각 브랜치가 최소 한 번 이상 실행**되도록 테스트 케이스를 작성해야 합니다.
19 | *   **철저한 모킹:** 외부 의존성(Supabase Client 메서드, `fetch`, 스토리지 API, `crypto`, `window` 객체 및 속성, `Date`, `process.env`, `logger` 등)은 **반드시 모킹**합니다. 모킹 시 성공 시나리오뿐만 아니라 **다양한 실패/예외 시나리오** (예: API 호출 실패, 데이터 없음, 권한 없음, 네트워크 오류, 예외 발생 등)를 시뮬레이션해야 합니다.
20 | *   **명시적 에러 검증:** 함수가 에러를 `throw` 하도록 설계된 경우, 해당 에러 조건을 발생시키고 에러가 **실제로 던져지는지** `expect(...).rejects.toThrow()` (async) 또는 `try/catch`와 `expect` (sync)를 사용하여 명시적으로 검증해야 합니다. 에러 객체 자체(`toBe`, `toBeInstanceOf`, `toHaveProperty`)를 확인하는 것이 좋습니다.
21 | *   **반환 값 및 부수 효과 검증:** 함수의 모든 가능한 반환 값을 검증하고, 함수 실행으로 인해 발생하는 부수 효과(예: `setAuthData` 호출, `window.location` 변경 시도, `logger` 호출 등)도 `expect(...).toHaveBeenCalledWith(...)` 등을 사용하여 검증해야 합니다.
22 | *   **환경 분기 테스트:** `isClient()`, `isClientEnvironment()` 등 환경에 따라 로직이 분기되는 경우, 각 환경(클라이언트/서버)을 시뮬레이션하는 별도의 테스트 케이스를 작성하여 해당 환경의 로직이 실행되는지 검증해야 합니다.
23 | 
24 | **3. 필수 조치 패턴:**
25 | 
26 | *   **(A) `if (condition)` / `else` 블록:**
27 |     *   `condition`이 `true`인 경우와 `false`인 경우를 모두 테스트합니다.
28 |     *   각 경우에 대해 해당 블록 내부 로직 실행 및 결과/부수 효과를 검증합니다.
29 | 
30 | *   **(B) `try...catch` 블록:**
31 |     *   **`try` 성공 경로:** `try` 블록 내의 작업(예: `await someOperation()`)이 성공하는 시나리오를 테스트하고, 이후 로직 및 최종 반환 값을 검증합니다.
32 |     *   **`catch` 실행 경로:** `try` 블록 내의 작업이 **에러를 발생시키도록 모킹**하고, `catch` 블록이 실행되는지 검증합니다.
33 |         *   `catch` 블록이 에러를 다시 `throw`하면, `expect(...).rejects.toThrow()`로 검증합니다.
34 |         *   `catch` 블록이 에러를 처리하고 특정 값을 반환하면(예: `null`, `false`, 오류 객체), 해당 반환 값을 검증하고, 관련 로깅(`logger.error` 등) 호출 여부도 검증합니다.
35 | 
36 | *   **(C) API/외부 호출 후 `error` 객체 확인:**
37 |     ```typescript
38 |     const { data, error } = await someApiCall(...);
39 |     if (error) { // <-- 브랜치 1
40 |       logger.error(...) // 선택적 로깅 검증
41 |       throw error;      // <-- 이 throw 검증 필수
42 |     }
43 |     // <-- 브랜치 2: 성공 경로 로직 검증 필수
44 |     processData(data);
45 |     return data;
46 |     ```
47 |     *   **에러 경로 (브랜치 1):** `someApiCall`이 `{ data: null, error: testError }`를 반환하도록 모킹하고, `logger.error` 호출(선택적) 및 `expect(...).rejects.toThrow(testError)`를 검증합니다.
48 |     *   **성공 경로 (브랜치 2):** `someApiCall`이 `{ data: validData, error: null }`를 반환하도록 모킹하고, 이후 로직(`processData(data)`) 실행 및 최종 반환 값(`data`)을 검증합니다.
49 | 
50 | *   **(D) `fetch` 응답 처리:**
51 |     ```typescript
52 |     const response = await fetch(...);
53 |     if (!response.ok) { // <-- 브랜치 1
54 |        // 에러 처리 로직 검증
55 |        throw new Error(...); // <-- throw 검증 또는 다른 처리 검증
56 |     }
57 |     // <-- 브랜치 2: 성공 경로 로직 검증 필수
58 |     const data = await response.json();
59 |     // ...
60 |     ```
61 |     *   **실패 경로 (브랜치 1):** `fetch`가 `{ ok: false, status: ..., statusText: ..., json: ... }`를 반환하도록 모킹하고, 에러 처리 로직(throw 또는 다른 반환)을 검증합니다. `response.json()`이나 `response.text()` 호출 검증도 포함될 수 있습니다.
62 |     *   **성공 경로 (브랜치 2):** `fetch`가 `{ ok: true, json: ... }`를 반환하도록 모킹하고, `response.json()` 호출 및 이후 로직을 검증합니다. `response.json()` 자체가 실패하는 경우(`Promise.reject` 모킹)도 테스트합니다.
63 | 
64 | *   **(E) 환경 의존적 코드:**
65 |     *   **브라우저 API (`localStorage`, `window.location` 등):** `vi.stubGlobal`을 사용하여 해당 API를 모킹하고, 함수가 이 API를 올바르게 호출하는지(`toHaveBeenCalledWith`) 또는 속성을 올바르게 설정하려고 시도하는지 검증합니다. API 호출 실패 시나리오도 모킹하여 테스트합니다.
66 |     *   **환경 분기 함수 (`isClient`, `isClientEnvironment`):** 이 함수들을 직접 모킹하여 각각 `true`/`false`를 반환하는 테스트 케이스를 만들고, 함수 본문 내의 해당 분기 로직이 실행되는지 확인합니다.
67 | 
68 | *   **(F) 단순 래퍼 함수 (`getSession`, `getUser` 등):**
69 |     *   함수가 내부적으로 의존하는 함수(예: `getAuthClient().auth.getSession`)를 정확히 호출하는지 `toHaveBeenCalled()` 또는 `toHaveBeenCalledWith()`로 검증합니다.
70 |     *   내부 함수 호출의 성공/실패 시 래퍼 함수가 올바른 값을 반환하거나 에러를 전파하는지 검증합니다.
71 | 
72 | **4. 검증:**
73 | 각 테스트 케이스 실행 후, Vitest 커버리지 리포트(`npx vitest run --coverage`)를 확인하여 **라인, 브랜치, 함수 커버리지가 모두 90% 이상**인지 확인합니다. 특히 **브랜치 커버리지**가 목표치에 도달했는지 주의 깊게 살펴봅니다.
```

global-env-mocking.mdc
```
1 | ---
2 | description: 
3 | globs: src/**/*.test.ts,src/**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | # Rule: [env-mocking] 환경 의존성 코드 테스트 전략
7 | 
8 | ## Description
9 | 환경(클라이언트/서버)에 따라 다르게 동작하는 코드를 테스트하기 위해, 내부 환경 감지 로직 대신 전역 환경 자체를 모킹하는 규칙입니다.
10 | 
11 | ## 1. 핵심 원칙: 환경 자체를 모킹하라
12 | 
13 | *   **금지:** 테스트 대상 모듈 내부에 있는 환경 감지 함수(예: `detectEnvironment`, `isClientEnvironment` 등)를 **직접 모킹하지 마십시오 (`vi.mock` 사용 금지)**. 이는 내부 구현에 대한 테스트가 되며 불안정합니다.
14 | *   **필수:** 대신, 해당 환경 감지 함수가 의존하는 **전역(Global) 환경 지표**를 모킹하여 특정 환경(클라이언트 또는 서버)을 시뮬레이션하십시오.
15 | *   **주요 대상 전역 객체:**
16 |     *   `window`: 브라우저 환경의 지표. 존재 여부로 클라이언트 환경을 판단하는 경우가 많습니다.
17 |     *   `process`: Node.js(서버) 환경의 지표. `process.versions.node` 등의 속성 존재 여부로 서버 환경을 판단하는 경우가 많습니다.
18 | 
19 | ## 2. 테스트 방법론 (Vitest 사용)
20 | 
21 | *   **테스트 구조:** 각 환경(클라이언트, 서버)에 대한 **별도의 `describe` 블록 또는 `it`/`test` 블록**을 사용하여 테스트 케이스를 명확히 분리하십시오.
22 | *   **환경 시뮬레이션:**
23 |     *   **`beforeEach` (또는 `beforeAll`)**: 테스트 실행 전에 `vi.stubGlobal(name, value)`을 사용하여 해당 환경을 시뮬레이션합니다.
24 |         *   **클라이언트 시뮬레이션:**
25 |             ```typescript
26 |             vi.stubGlobal('window', { /* 필요한 최소한의 window 속성/메서드 모킹 */ });
27 |             vi.stubGlobal('process', undefined); // 서버 환경 지표 제거
28 |             ```
29 |         *   **서버 시뮬레이션:**
30 |             ```typescript
31 |             vi.stubGlobal('window', undefined); // 클라이언트 환경 지표 제거
32 |             vi.stubGlobal('process', { versions: { node: 'v18.0.0' } }); // 서버 환경 지표 설정
33 |             ```
34 |             *(참고: `process` 객체는 테스트 대상 코드가 실제로 사용하는 속성만 포함해도 충분할 수 있습니다.)*
35 |     *   **테스트 실행:** 시뮬레이션된 환경 하에서 테스트 대상 함수/모듈을 호출합니다.
36 |     *   **검증:** 해당 환경에서 **기대되는 동작**(특정 함수 호출, 특정 값 반환, 특정 로직 경로 실행 등)을 `expect`를 사용하여 검증합니다.
37 | *   **정리 (필수):**
38 |     *   **`afterEach` (또는 `afterAll`)**: `vi.unstubAllGlobals()`를 **반드시 호출**하여 모킹된 전역 상태를 원래대로 복원합니다. 이를 통해 테스트 간의 격리성을 보장하고 예상치 못한 부작용을 방지합니다.
39 | 
40 | ## 3. 구체적인 지시사항
41 | 
42 | *   테스트 대상 코드가 `typeof window !== 'undefined'` 또는 `process.versions.node` 와 같은 패턴으로 환경을 감지하는 경우, 이 **규칙을 적용**하십시오.
43 | *   `vi.stubGlobal`을 사용하여 `window` 또는 `process` 객체의 존재/부재를 제어하십시오.
44 | *   각 환경 시나리오(`it` 블록) 내에서 테스트 대상 함수를 호출하고, 해당 환경에 맞는 **기대 결과**를 단언하십시오.
45 | *   다른 테스트에 영향을 주지 않도록 `afterEach`에서 **반드시 `vi.unstubAllGlobals()`를 호출**하여 정리하십시오.
46 | 
47 | ## 4. 예시 (Vitest)
48 | 
49 | ```typescript
50 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
51 | import { myEnvironmentDependentFunction } from './myModule'; // 테스트 대상 함수
52 | 
53 | // myModule이 의존하는 다른 모듈 모킹 (필요시)
54 | vi.mock('./browserDependency', () => ({ callBrowserAPI: vi.fn() }));
55 | vi.mock('./serverDependency', () => ({ callServerAPI: vi.fn() }));
56 | 
57 | describe('myEnvironmentDependentFunction 테스트', () => {
58 |   const originalWindow = global.window;
59 |   const originalProcess = global.process;
60 | 
61 |   afterEach(() => {
62 |     // ★★★ 필수: 각 테스트 후 전역 상태 복원 ★★★
63 |     vi.unstubAllGlobals();
64 |     // 필요시 수동 복원 (일반적으론 unstubAllGlobals로 충분)
65 |     global.window = originalWindow;
66 |     global.process = originalProcess;
67 |     vi.clearAllMocks();
68 |   });
69 | 
70 |   describe('클라이언트 환경 시뮬레이션', () => {
71 |     beforeEach(() => {
72 |       // 클라이언트 환경 설정
73 |       vi.stubGlobal('window', { document: {} }); // window 객체 존재
74 |       vi.stubGlobal('process', undefined);      // process 객체 없음
75 |     });
76 | 
77 |     it('클라이언트 환경에서는 브라우저 API를 호출해야 함', async () => {
78 |       const { callBrowserAPI } = await import('./browserDependency'); // 모킹된 함수 가져오기
79 | 
80 |       myEnvironmentDependentFunction();
81 | 
82 |       expect(callBrowserAPI).toHaveBeenCalled();
83 |       // 서버 API는 호출되지 않아야 함
84 |       // const { callServerAPI } = await import('./serverDependency');
85 |       // expect(callServerAPI).not.toHaveBeenCalled();
86 |     });
87 |   });
88 | 
89 |   describe('서버 환경 시뮬레이션', () => {
90 |     beforeEach(() => {
91 |       // 서버 환경 설정
92 |       vi.stubGlobal('window', undefined);        // window 객체 없음
93 |       vi.stubGlobal('process', { versions: { node: 'v18.0.0' } }); // process 객체 존재
94 |     });
95 | 
96 |     it('서버 환경에서는 서버 API를 호출해야 함', async () => {
97 |       const { callServerAPI } = await import('./serverDependency'); // 모킹된 함수 가져오기
98 | 
99 |       myEnvironmentDependentFunction();
100 | 
101 |       expect(callServerAPI).toHaveBeenCalled();
102 |       // 브라우저 API는 호출되지 않아야 함
103 |       // const { callBrowserAPI } = await import('./browserDependency');
104 |       // expect(callBrowserAPI).not.toHaveBeenCalled();
105 |     });
106 |   });
107 | });
```

increase-coverage.mdc
```
1 | ---
2 | description: 
3 | globs: src/**/*.test.ts,src/**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | ## 작업: `{target_folder}` 폴더 종합 테스트 커버리지 90% 달성
7 | 
8 | **목표:** `{target_folder}` 디렉토리 (모든 하위 디렉토리 포함) 내 관련 파일들의 Vitest 테스트 **라인(Line), 브랜치(Branch), 함수(Function) 커버리지**를 각각 **최소 90%**로 높입니다.
9 | 
10 | **컨텍스트:**
11 | *   `yarn test run --coverage {target_folder}` 명령으로 생성된 최신 Vitest 커버리지 리포트(또는 전체 리포트)를 기반으로 작업합니다.
12 | *   테스트 프레임워크는 Vitest와 `@testing-library/react`를 사용합니다.
13 | *   프로젝트 규칙, 특히 모킹(`vi.mock`, MSW) 및 테스트 구조(`[package]`, `[zustand-action-msw]` 등)에 관한 규칙을 준수해야 합니다.
14 | 
15 | **지시사항:**
16 | 
17 | 1.  **저조한 커버리지 파일 식별:**
18 |     *   최신 Vitest 커버리지 리포트(`coverage/index.html` 또는 JSON 출력)를 분석합니다.
19 |     *   `{target_folder}` 내에서 **라인(Line %), 브랜치(Branch %), 함수(Functions %)** 커버리지 중 **하나라도** 90% 미만인 모든 `.ts` 및 `.tsx` 파일을 식별합니다 (테스트 파일, `.d.ts` 등 제외).
20 |     *   식별된 각 파일에 대해, 리포트에서 **커버되지 않은 라인(Uncovered Lines)**, **커버되지 않은 브랜치**(종종 'I' 또는 'E'로 표시됨), **커버되지 않은 함수**(호출되지 않은 함수)를 명시합니다.
21 | 
22 | 2.  **각 저조 파일에 대한 테스트 케이스 추가/개선 (반복 작업):**
23 |     *   **파일 선택:** 1단계에서 식별된 파일 중 하나를 선택합니다 (예: `{target_folder}/example.ts`).
24 |     *   **미커버 영역 분석:**
25 |         *   **라인:** 실행되지 않은 특정 코드 라인을 분석합니다. 해당 라인이 실행되기 위해 필요한 조건이나 입력은 무엇인지 파악합니다.
26 |         *   **브랜치:** 커버되지 않은 조건(`if`/`else`, `&&`/`||`, `?.`, `??`, `switch`) 경로를 분석합니다. 해당 경로를 타기 위한 특정 시나리오를 파악합니다. **특히, `try...catch` 블록의 `catch` 경로, 오류 반환 로직, 조건부 오류 처리 등 예외 상황과 관련된 브랜치를 주의 깊게 확인합니다.**
27 |         *   **함수:** 정의되었지만 테스트에서 한 번도 호출되지 않은 함수를 식별합니다.
28 |     *   **테스트 작성/수정:**
29 |         *   해당 파일의 테스트 파일(예: `{target_folder}/example.test.ts`)을 찾거나 생성합니다.
30 |         *   커버되지 않은 **라인, 브랜치, 함수**를 실행/호출하는 새로운 `test` 또는 `it` 블록을 추가하거나 기존 테스트를 수정합니다.
31 |         *   **시나리오 고려:**
32 |             *   **라인 커버리지:** 특정 라인이 실행되도록 하는 입력값이나 상태를 설정하고 테스트합니다.
33 |             *   **브랜치 커버리지:** 모든 가능한 코드 경로(정상 경로 및 **오류 경로**)를 실행하는 테스트 케이스를 작성합니다.
34 |             *   **함수 커버리지:** 테스트되지 않은 함수가 최소 한 번 이상 호출되도록 하는 테스트 케이스를 추가하고, 해당 함수의 의도된 동작을 검증합니다.
35 |             *   **오류 경로 및 예외 처리:**
36 |                 *   **필수 사항:** `try...catch` 구문의 `catch` 블록이 실행되는 경우, 함수가 예상된 오류를 반환하거나 던지는 경우, 외부 호출(API, DB 등)이 실패하는 경우 등을 **의도적으로 시뮬레이션**합니다.
37 |                 *   **검증:** 이러한 오류 상황에서 애플리케이션이 **예상대로 동작**하는지(예: 적절한 오류 로깅, 사용자에게 피드백 제공, 대체 로직 수행, 함수의 안정적인 종료) 검증하는 테스트를 **반드시 포함**합니다. `auth-storage.ts`의 예시처럼 `catch` 블록 내 로직이 실행되는지 확인합니다.
38 |             *   **상태/Prop 변형:** 컴포넌트/훅의 경우, 다양한 props나 초기 상태 값에 따라 다른 코드 경로가 실행되는지 테스트합니다.
39 |     *   **모킹 활용:** `vi.mock`, `vi.spyOn` 또는 MSW(`server.use()`로 특정 핸들러 사용)를 사용하여 테스트 대상 단위를 격리하고 의존성(API 호출, DB 접근, 타이머, 다른 모듈)을 제어합니다. **특히, 오류 상황을 시뮬레이션하기 위해 `vi.fn().mockRejectedValue(...)`, `vi.fn().mockImplementation(() => { throw new Error(...) })` 또는 MSW에서 에러 응답(예: `HttpResponse.json({ error: '...' }, { status: 500 })`)을 반환하도록 설정합니다.**
40 |     *   **명확한 이름 지정:** 각 테스트 케이스의 목적(어떤 라인/브랜치/함수를 커버하는지, **특히 오류 시나리오**)을 명확히 설명하는 이름을 사용합니다 (예: `it('should handle database connection errors gracefully')`, `it('logs an error when file writing fails')`).
41 | 
42 | 3.  **모든 파일에 대해 반복:** `{target_folder}` 내에서 1단계에서 식별된 *모든* 파일에 대해 2단계 작업을 반복합니다.
43 | 
44 | 4.  **커버리지 확인 및 개선:**
45 |     *   테스트 추가 후, 커버리지 명령을 다시 실행합니다: `yarn test run --coverage {target_folder}`.
46 |     *   업데이트된 커버리지 리포트에서 `{target_folder}` 내 파일들의 **라인, 브랜치, 함수 커버리지**를 모두 확인합니다.
47 |     *   여전히 세 가지 커버리지 유형 중 하나라도 90% 미만인 파일이 있다면, 해당 파일의 **커버되지 않은 특정 영역**(라인, 브랜치 또는 함수)을 다시 분석하고 필요한 테스트 케이스를 추가하는 2단계를 반복합니다. **특히, 브랜치 커버리지가 낮은 경우 오류 처리 경로가 누락되지 않았는지 다시 확인합니다.**
48 |     *   폴더 내 모든 관련 파일의 **모든 세 가지 커버리지 유형**이 90% 목표를 달성할 때까지 반복합니다.
49 | 
50 | **중요 참고 사항:**
51 | *   단순히 커버리지 비율을 기계적으로 높이는 것이 아니라, 각 라인, 브랜치, 함수의 **의도된 로직(정상 및 오류 처리 포함)**을 검증하는 **의미 있는 테스트**를 작성하는 데 집중해야 합니다. **오류 처리 경로는 애플리케이션 안정성에 매우 중요하므로 반드시 테스트해야 합니다.**
52 | *   새로 작성하거나 수정한 테스트가 기존 프로젝트의 테스트 규약 및 규칙(`[explicit-error-throw-testing]`, `[zustand-action-msw]`,`[async-test]`, `[global-env-mocking]`, `[increase-coverage]`, `[vitest-mocking]`)을 준수하는지 확인해야 합니다.
53 | *   만약 소스 코드를 테스트 가능하게 만들기 위해 **상당한 리팩토링**이 *필수적*이라면, **작업을 중단**하고 검토를 위해 이 필요성을 보고해야 합니다 (`[package]` 규칙 참조).
```

logger-mocking-solution.mdc
```
1 | ---
2 | description: 
3 | globs: **/*.test.ts,**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | 로거 모듈은 싱글톤 패턴, 비동기 로깅, 복잡한 초기화 등 테스트를 까다롭게 만드는 요소를 포함할 수 있습니다. AI가 생성한 코드가 실패할 경우 다음 규칙들을 순서대로 점검해보세요.
7 | 
8 | **AI 생성 로거 테스트 코드 디버깅 규칙 (Troubleshooting Rules for AI-Generated Logger Tests)**
9 | 
10 | ---
11 | 
12 | **Rule 1: 정확한 모킹 대상 확인 (Verify the Mock Target)**
13 | 
14 | *   **점검 내용:** AI가 로거 *팩토리 함수*(`createLogger`)를 모킹했는지, 아니면 특정 로거 *인스턴스*(`logger.info` 등)를 모킹했는지 확인합니다.
15 | *   **해결 시도:**
16 |     *   대부분의 경우, 로거를 사용하는 **모듈을 테스트하기 전 최상단에서** `vi.mock('@/lib/logger', ...)`를 사용하여 **팩토리 함수 자체를 모킹**하는 것이 올바릅니다.
17 |     *   AI가 특정 인스턴스에 `vi.spyOn`을 사용했다면, 해당 인스턴스가 테스트 대상 코드에서 실제로 사용하는 인스턴스와 동일한지 확인하세요. (팩토리 모킹이 더 안정적일 수 있습니다.)
18 |     *   **액션:** AI가 생성한 모킹 코드를 보고, `vi.mock`이 로거 모듈 경로(`@/lib/logger`)를 대상으로 팩토리 함수를 모방하도록 수정해보세요.
19 | 
20 | ```typescript
21 | // 예시: 올바른 팩토리 모킹
22 | import { vi } from 'vitest';
23 | 
24 | const mockLoggerInstance = { // 모킹된 로거 인스턴스 구조 정의
25 |   debug: vi.fn(),
26 |   info: vi.fn(),
27 |   warn: vi.fn(),
28 |   error: vi.fn(),
29 | };
30 | 
31 | vi.mock('@/lib/logger', () => ({
32 |   // default export인 createLogger를 모킹
33 |   default: vi.fn(() => mockLoggerInstance),
34 |   // logger 인스턴스도 직접 export한다면 그것도 모킹 (필요시)
35 |   // logger: mockLoggerInstance,
36 |   LogLevel: { /* 실제 Enum 값 */ }, // Enum 등 다른 export도 필요하면 유지
37 | }));
38 | 
39 | // --- 이제 다른 모듈 import ---
40 | import { functionUnderTest } from './myModule';
41 | import createLogger from '@/lib/logger'; // 모킹된 버전이 import됨
42 | 
43 | describe('My Module', () => {
44 |   beforeEach(() => {
45 |     // 각 테스트 전에 모킹 함수 호출 기록 초기화
46 |     vi.clearAllMocks();
47 |     // 필요하다면 팩토리 함수 자체의 호출 기록도 초기화
48 |     vi.mocked(createLogger).mockClear();
49 |   });
50 | 
51 |   it('should call logger.info on success', () => {
52 |     functionUnderTest();
53 |     // 팩토리가 반환한 인스턴스의 메서드 호출 검증
54 |     expect(mockLoggerInstance.info).toHaveBeenCalled();
55 |   });
56 | });
57 | ```
58 | 
59 | **Rule 2: 모킹 반환 값 구조 확인 (Check Mock Return Structure)**
60 | 
61 | *   **점검 내용:** `vi.mock`으로 팩토리 함수(`createLogger`)를 모킹할 때, 모킹된 팩토리가 반환하는 객체가 실제 로거 인스턴스가 가진 모든 메서드(`info`, `warn`, `error`, `debug` 등)를 `vi.fn()`으로 포함하고 있는지 확인합니다.
62 | *   **해결 시도:**
63 |     *   실제 `logger.ts` 파일을 열어 로거 인스턴스가 어떤 메서드를 export/제공하는지 확인합니다.
64 |     *   `vi.mock`의 반환 객체에 누락된 메서드가 있다면 `vi.fn()`으로 추가합니다.
65 | 
66 | **Rule 3: 모킹 시점 및 범위 확인 (Verify Mock Timing and Scope)**
67 | 
68 | *   **점검 내용:** `vi.mock('@/lib/logger', ...)` 호출이 테스트 파일 **최상단**(모든 `import` 문보다 앞서)에 위치하는지 확인합니다. Vitest는 `vi.mock` 호출을 파일 상단으로 끌어올립니다(hoisting). 또한, 모킹이 필요한 테스트 스코프(`describe` 블록 등) 내에서만 적용되는지 확인합니다.
69 | *   **해결 시도:**
70 |     *   `vi.mock` 호출을 파일 맨 위로 옮깁니다.
71 |     *   모든 테스트에서 로거 모킹이 필요하다면 파일 최상단에 두고, 특정 `describe` 블록에서만 필요하다면 해당 블록 내에서 `vi.doMock` 등을 사용하는 것을 고려합니다 (하지만 일반적으로 최상단 모킹이 권장됩니다).
72 | 
73 | **Rule 4: 싱글톤/인스턴스 관리 확인 (Check for Singletons/Instance Management)**
74 | 
75 | *   **점검 내용:** 로거 모듈이 내부적으로 싱글톤 인스턴스(`LogStorage.getInstance()` 등)를 생성하고 관리하는지 확인합니다.
76 | *   **해결 시도:**
77 |     *   싱글톤 패턴이 사용된다면, **팩토리 함수(`createLogger`)를 모킹**하는 것이 해당 싱글톤 인스턴스를 사용하는 모든 코드가 모킹된 인스턴스를 받게 하는 가장 확실한 방법입니다 (Rule 1 참조).
78 |     *   AI가 싱글톤 인스턴스의 메서드를 직접 `vi.spyOn` 하려고 했다면 실패할 가능성이 높습니다. Rule 1의 팩토리 모킹 방식으로 변경합니다.
79 |     *   `beforeEach` 또는 `afterEach`에서 `vi.clearAllMocks()` 또는 `vi.resetAllMocks()`를 사용하여 테스트 간 간섭을 방지합니다.
80 | 
81 | **Rule 5: 비동기 로깅 처리 확인 (Handle Asynchronous Logging)**
82 | 
83 | *   **점검 내용:** 테스트 대상 코드나 로거 자체의 특정 메서드가 비동기(`async/await`)로 동작하는지 확인합니다.
84 | *   **해결 시도:**
85 |     *   테스트 코드에서 비동기 함수를 호출한 후 로거 호출을 검증할 때는 `await` 키워드를 사용합니다.
86 |     *   `await act(async () => { ... })` (react-testing-library) 또는 `await flushPromises()` (직접 구현 또는 유틸리티) 등을 사용하여 비동기 작업이 완료될 때까지 기다린 후 `expect` 검증을 수행합니다.
87 | 
88 | **Rule 6: `expect` 검증 단순화 및 인수 확인 (Simplify Assertions and Check Arguments)**
89 | 
90 | *   **점검 내용:** `expect(logger.info).toHaveBeenCalledWith(...)` 검증이 실패하는 경우, 인자 매칭 문제일 수 있습니다.
91 | *   **해결 시도:**
92 |     *   **1단계 (호출 여부만 확인):** `expect(logger.info).toHaveBeenCalled()` 로 변경하여 일단 함수 자체가 호출되었는지 확인합니다. 이것도 실패하면 모킹 자체가 잘못된 것입니다 (Rule 1, 2 확인).
93 |     *   **2단계 (인자 타입 확인):** `toHaveBeenCalled()`가 성공하면, 인자 매칭 문제입니다. `expect(logger.info).toHaveBeenCalledWith(expect.any(String), expect.any(Object))` 처럼 인자 타입을 느슨하게 검사해봅니다.
94 |     *   **3단계 (인자 내용 확인):** 특정 내용만 확인하려면 `expect.objectContaining({...})` 또는 `expect.stringContaining(...)` 을 사용합니다.
95 |     *   **4단계 (실제 인자 로깅):** 모킹된 함수 내부에서 `console.log(arguments)` 를 추가하여 실제로 어떤 인자가 전달되는지 확인하고 `expect` 구문을 수정합니다.
96 | 
97 | **Rule 7: 테스트 격리 (Isolate the Test)**
98 | 
99 | *   **점검 내용:** 다른 모킹이나 테스트 로직과의 충돌 가능성을 배제합니다.
100 | *   **해결 시도:**
101 |     *   **로거 모킹 제거:** 로거 모킹 부분을 주석 처리하고 테스트를 실행합니다. 테스트가 (실제 로그가 찍히더라도) 성공하면 로거 모킹 방식에 문제가 있는 것입니다.
102 |     *   **최소 테스트 작성:** 새 `it` 블록에서 오직 로거를 호출하는 함수 부분만 실행하고 해당 로거 호출만 검증하는 최소한의 테스트를 작성해봅니다. 이것이 실패하면 기본적인 모킹 설정부터 다시 점검합니다.
103 | 
104 | **Rule 8: 로거 모듈 자체 확인 (Inspect the Logger Module)**
105 | 
106 | *   **점검 내용:** `logger.ts` 모듈 자체에 복잡한 조건부 로직, 환경 변수 의존성, 동적 `import()` 등이 있는지 확인합니다.
107 | *   **해결 시도:**
108 |     *   로거 모듈이 특정 환경 변수에 따라 다르게 동작한다면, 테스트 전에 `vi.stubEnv()` 등으로 해당 환경 변수를 설정해야 할 수 있습니다.
109 |     *   로거 초기화가 복잡하다면, 해당 초기화 로직을 모킹하거나 테스트 설정에서 유사하게 수행해야 할 수 있습니다.
110 | 
111 | ---
112 | 
113 | 이 규칙들을 순서대로 적용해보면서 AI가 생성한 코드의 어떤 부분이 잘못되었는지 진단하고 수정하면 로거 관련 테스트 오류를 해결하는 데 도움이 될 것입니다.
```

nodejs-v20-undici-unref.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | 
7 | #[nodejs-v20-undici-unref] Node.js v20 unref 오류 대응 전략
8 | 
9 | ## 문제 설명
10 | Node.js v20 환경에서 테스트 실행 시 다음과 같은 TypeError가 발생할 수 있습니다:
11 | ```
12 | TypeError: Cannot read properties of undefined (reading 'unref')
13 | ```
14 | 
15 | 이는 주로 undici 라이브러리(Node.js의 기본 HTTP 클라이언트) 관련 타임아웃 처리에서 발생하며, MSW(Mock Service Worker)를 사용한 API 모킹 테스트에서 자주 나타납니다.
16 | 
17 | ## 해결 전략
18 | 
19 | ### 1. MSW 서버 설정 최적화
20 | ```typescript
21 | // src/tests/msw/server.ts
22 | import { setupServer } from 'msw/node';
23 | import { handlers } from './handlers';
24 | import { HttpResponse } from 'msw';
25 | 
26 | export const server = setupServer(...handlers);
27 | 
28 | // 문제가 발생할 수 있는 요청에 대한 즉각 응답 처리
29 | server.events.on('request:start', ({ request }) => {
30 |   try {
31 |     const url = new URL(request.url);
32 |     
33 |     // 문제 URL 패턴 처리
34 |     if (url.pathname.includes('problem-path')) {
35 |       return HttpResponse.json({ error: 'Simulated error' }, { status: 500 });
36 |     }
37 |     
38 |     // 인증 관련 요청 즉시 처리
39 |     if (url.pathname.includes('/auth/v1/')) {
40 |       return HttpResponse.json({
41 |         access_token: 'test_token',
42 |         // 필요한 응답 데이터
43 |       });
44 |     }
45 |     
46 |     return undefined;
47 |   } catch (error) {
48 |     return HttpResponse.json({ error: 'internal_error' }, { status: 500 });
49 |   }
50 | });
51 | 
52 | export function setupMSW() {
53 |   beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }));
54 |   afterEach(() => server.resetHandlers());
55 |   afterAll(() => server.close());
56 |   
57 |   return { server, use: (...handlers) => server.use(...handlers) };
58 | }
59 | ```
60 | 
61 | ### 2. 네트워크 요청 차단을 위한 fetch 모킹
62 | ```typescript
63 | import { vi } from 'vitest';
64 | 
65 | // 테스트 설정 파일이나 테스트 파일 상단에 추가
66 | vi.stubGlobal('fetch', vi.fn(() => {
67 |   return Promise.resolve({
68 |     ok: true,
69 |     json: () => Promise.resolve({}),
70 |     text: () => Promise.resolve('')
71 |   });
72 | }));
73 | ```
74 | 
75 | ### 3. undici 관련 경고 필터링
76 | ```typescript
77 | import { vi } from 'vitest';
78 | 
79 | // undici 관련 경고 메시지 필터링
80 | vi.spyOn(console, 'warn').mockImplementation((message) => {
81 |   if (!message.includes('undici')) {
82 |     console.warn(message);
83 |   }
84 | });
85 | ```
86 | 
87 | ### 4. 테스트 코드 작성 시 고려사항
88 | 1. **타임아웃 발생 가능성 줄이기**: 테스트에서 불필요한 대기 시간이 발생하지 않도록 합니다.
89 | 2. **실제 네트워크 요청 없애기**: 모든 외부 API 호출은 모킹하여 처리합니다.
90 | 3. **테스트 격리**: 각 테스트가 독립적으로 실행되도록 `beforeEach`/`afterEach`에서 적절한 초기화 작업을 수행합니다.
91 | 
92 | ### 5. 문제 감지 시 즉각 대응
93 | 1. 오류 메시지에 `unref`가 포함된 경우 즉시 이 규칙을 적용합니다.
94 | 2. 오류가 발생한 테스트 파일에서 네트워크 요청을 발생시키는 코드를 찾아 모킹합니다.
95 | 3. 모킹이 어려운 경우 MSW 서버 설정을 확인하고 최적화합니다.
96 | 
97 | ## 적용 예시
98 | 
99 | ```typescript
100 | // 테스트 파일 예시
101 | import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
102 | import { setupMSW } from '@/tests/msw/server';
103 | 
104 | // MSW 서버 설정
105 | const { server } = setupMSW();
106 | 
107 | // 네트워크 요청 경고 필터링
108 | vi.spyOn(console, 'warn').mockImplementation((message) => {
109 |   if (!message.includes('undici')) {
110 |     console.warn(message);
111 |   }
112 | });
113 | 
114 | // fetch 모킹
115 | vi.stubGlobal('fetch', vi.fn(() => {
116 |   return Promise.resolve({
117 |     ok: true,
118 |     json: () => Promise.resolve({}),
119 |     text: () => Promise.resolve('')
120 |   });
121 | }));
122 | 
123 | describe('테스트 스위트', () => {
124 |   // 테스트 케이스 작성
125 | });
126 | ```
127 | 
128 | 이 규칙을 적용하면 Node.js v20 환경에서 발생하는 unref 관련 오류를 효과적으로 예방하고 해결할 수 있습니다.
```

package.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | # --- START OF FILE: .cursor/rules/package.mdc ---
7 | description: Package manager and testing conventions.
8 | globs:
9 |   - package.json
10 |   - yarn.lock
11 |   - src/**/*.{test.ts,test.tsx}
12 | alwaysApply: true
13 | ---
14 | 
15 | # Package manager
16 | - 패키지 관리를 통일하기 위해 패키지 관리자는 yarn만 사용. 
17 | - 패키지 설치/업데이트 시 `yarn` 명령어를 사용한다. (예: `yarn add [패키지명]`, `yarn upgrade [패키지명]`)
18 | 
19 | # 테스트 방식
20 | - vitest 공식 문서대로 작성
21 | - 테스트 커버리지를 유지/개선하기 위해 새로운 기능을 추가하거나 기존 코드를 수정하면, 반드시 해당 코드의 **의도된 동작**을 검증하는 테스트 파일 (`*.test.ts`, `*.test.tsx`)을 생성하거나 업데이트해야 함.
22 |     - 테스트는 가급적 애플리케이션 코드의 **현재 인터페이스나 구현**을 기반으로 작성되어야 함.
23 |     - 만약 애플리케이션 코드의 구조가 **테스트를 매우 어렵게** 만들 경우 (예: 의존성 주입 불가, 부수 효과 분리 불가 등), **테스트 가능성(testability) 확보**를 위한 **최소한의 필수적인 리팩토링**을 진행할 수 있음.
24 |     - **중요:** 테스트 가능성 확보를 위해 애플리케이션 코드를 리팩토링한 경우에는, **반드시 해당 작업 직후 `do rev` 명령을 실행**하여 사용자에게 변경된 내용과 그 이유('테스트 가능성 확보' 또는 '의존성 분리' 등 설계 개선 관점)를 명확하게 보고해야 함. (`[MODE: REVIEW]` 자동 수행)
25 | - 테스트 작성 시, API 호출이 포함된 로직은 반드시 MSW 핸들러 (`src/tests/msw/handlers.ts`)를 사용하여 모킹해야 함.
26 | - 사용자가 q를 입력하지 않아도 테스트를 자동 종료하기 위해 테스트 커맨드는 'yarn vitest run'
27 | - 테스트 파일을 찾기 쉽도록 테스트 파일은 테스트 대상 파일과 같은 폴더에서 만든다. 
28 | - 여러 파일을 테스트하는 통합 테스트 파일은 테스트 대상 파일의 상위 폴더에 만든다. 
29 | 
30 | # --- END OF FILE ---
```

piper5.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | # RIPER-5 MODE: STRICT OPERATIONAL PROTOCOL
7 | 
8 | *CONTEXT PRIMER*
9 | You are Claude 3.7, you are integrated into Cursor IDE, an A.I based fork of VS Code. Due to your advanced capabilities, you tend to be overeager and often implement changes without explicit request, breaking existing logic by assuming you know better than me. This leads to UNACCEPTABLE disasters to the code. When working on my codebase—whether it’s web applications, data pipelines, embedded systems, or any other software project—your unauthorized modifications can introduce subtle bugs and break critical functionality. To prevent this, you MUST follow this STRICT protocol:
10 | 
11 | *META-INSTRUCTION: MODE DECLARATION REQUIREMENT*
12 | YOU MUST BEGIN EVERY SINGLE RESPONSE WITH YOUR CURRENT MODE IN BRACKETS. NO EXCEPTIONS. Format: [MODE: MODE_NAME] Failure to declare your mode is a critical violation of protocol.
13 | 
14 | *THE RIPER-5 MODES*
15 | 
16 | **MODE 1: RESEARCH**
17 | Command : do res
18 | Tag : [MODE: RESEARCH]
19 | 
20 | Purpose: Information gathering ONLY
21 | Permitted: Reading files, asking clarifying questions, understanding code structure
22 | Forbidden: Suggestions, implementations, planning, or any hint of action
23 | Requirement: You may ONLY seek to understand what exists, not what could be
24 | Duration: Until I explicitly signal to move to next mode
25 | Output Format: Begin with [MODE: RESEARCH], then ONLY observations and questions
26 | 
27 | **MODE 2: INNOVATE**
28 | Command : do inn
29 | tag : [MODE: INNOVATE]
30 | 
31 | Purpose: Brainstorming potential approaches
32 | Permitted: Discussing ideas, advantages/disadvantages, seeking feedback
33 | Forbidden: Concrete planning, implementation details, or any code writing
34 | Requirement: All ideas must be presented as possibilities, not decisions
35 | Duration: Until I explicitly signal to move to next mode
36 | Output Format: Begin with [MODE: INNOVATE], then ONLY possibilities and considerations
37 | 
38 | **MODE 3: PLAN**
39 | Command : do pla
40 | tag : [MODE: PLAN]
41 | 
42 | Purpose: Creating exhaustive technical specification
43 | Permitted: Detailed plans with exact file paths, function names, and changes
44 | Forbidden: Any implementation or code writing, even “example code”
45 | Requirement: Plan must be comprehensive enough that no creative decisions are needed during implementation
46 | Mandatory Final Step: Convert the entire plan into a numbered, sequential CHECKLIST with each atomic action as a separate item
47 | Checklist Format:
48 | Copy
49 | 
50 | IMPLEMENTATION CHECKLIST:
51 | 1. [Specific action 1]
52 | 2. [Specific action 2]
53 | ...
54 | n. [Final action]
55 | Duration: Until I explicitly approve plan and signal to move to next mode
56 | Output Format: Begin with [MODE: PLAN], then ONLY specifications and implementation details
57 | 
58 | **MODE 4: EXECUTE**
59 | Command: do exec
60 | Tag : [MODE: EXECUTE]
61 | 
62 | - Purpose: Implementing EXACTLY what was planned in Mode 3
63 | - Permitted: ONLY implementing what was explicitly detailed in the approved plan
64 | - Forbidden: Any deviation, improvement, or creative addition not in the plan
65 | - Execution Integrity: After running the file, check for and remove any linter errors.
66 | - Entry Requirement: ONLY enter after explicit “ENTER EXECUTE MODE” command from me
67 | - Deviation Handling: If ANY issue is found requiring deviation, IMMEDIATELY return to PLAN mode
68 | - Execution Guarantee: Launch the dev server in the terminal, wait 5 seconds, then check the logs to ensure no errors or warnings and that the API server is running without errores and warnings.
69 | - Reporting : After executing this mode, also run the [MODE: REVIEW] and return to EXECUTE mode.
70 | - Output Format: Begin with [MODE: EXECUTE], then ONLY implementation matching the plan
71 | 
72 | **MODE 5: REVIEW**
73 | Command: do rev
74 | Tag: [MODE: REVIEW]
75 | 
76 | - Purpose: Ruthlessly validate implementation against the plan
77 | - Permitted: Line-by-line comparison between plan and implementation
78 | - Required: EXPLICITLY FLAG ANY DEVIATION, no matter how minor
79 | - Deviation Format: “:warning: DEVIATION DETECTED: [description of exact deviation]”
80 | - Reporting: Must report whether implementation is IDENTICAL to plan or NOT
81 | - Conclusion Format: “:white_check_mark: IMPLEMENTATION MATCHES PLAN EXACTLY” or “:cross_mark: IMPLEMENTATION DEVIATES FROM PLAN”
82 | - Output Format: Begin with [MODE: REVIEW], then systematic comparison and explicit verdict
83 | 
84 | **MODE 6: FAST**
85 | 
86 | Command: do fas
87 | Tag: [MODE: FAST]
88 | 
89 | - Purpose: Rapid task execution with minimal changes
90 | - Allowed: Implement only the assigned task
91 | - Forbidden: Modifying existing logic, adding optimizations, or refactoring
92 | - Requirement: Every change must be as small as possible
93 | - Deviation Handling: If ANYTHING requires more than the assigned task → IMMEDIATELY return to do pla
94 | 
95 | *CRITICAL PROTOCOL GUIDELINES*
96 | - Start in do fas if no mode is set
97 | - Do NOT switch modes without explicit command
98 | - In do exe, follow the plan with 100% accuracy
99 | - In do rev, flag even the smallest deviation
100 | - You CANNOT make independent decisions
101 | 
102 | *MODE TRANSITION SIGNALS*
103 | 
104 | To switch modes, I must explicitly type one of the following:
105 | - do res → Enter RESEARCH mode
106 | - do inn → Enter INNOVATE mode
107 | - do pla → Enter PLAN mode
108 | - do exe → Enter EXECUTE mode
109 | - do rev → Enter REVIEW mode
110 | - do fas → Enter FAST mode
```

react-test-failure.mdc
```
1 | ---
2 | description: 
3 | globs: src/**/*.test.ts,src/**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | # React Test Debugging Playbook for Cursor Agent
7 | 
8 | **목표:** React 컴포넌트의 UI 단위 테스트 실패 시, Cursor AI 에이전트가 원인을 진단하고 해결하도록 안내하는 규칙입니다.
9 | 
10 | **필수 입력:** 에이전트에게 지시할 때는 **(1) 실패한 테스트 코드 전체**와 **(2) 발생한 정확한 오류 메시지**를 함께 제공해주세요.
11 | 
12 | **작동 방식:** 제공된 정보와 아래 규칙을 바탕으로 실패 원인을 추정하고 해결책을 적용합니다. 하나의 문제가 해결되면 다른 문제가 드러날 수 있으므로, 테스트가 통과할 때까지 이 지침을 반복적으로 참조할 수 있습니다.
13 | 
14 | ## 1. UI 요소 선택 실패 (Rule #1: Element Selection)
15 | 
16 | ### 진단 힌트:
17 | 오류 메시지에 `Unable to find an element...`, `Found multiple elements...` 등이 포함된 경우 이 규칙을 우선 확인합니다.
18 | 
19 | ### 문제 유형:
20 | - ❌ 컴포넌트 마크업과 테스트 선택자 불일치 (예: 태그 변경, 텍스트 오타)
21 | - ❌ `querySelector` 등 불안정한 선택자 사용
22 | - ❌ 복잡한 DOM 구조 내 요소 식별 어려움
23 | 
24 | ### 해결 패턴 (우선순위 순서):
25 | 1.  ✅ **Role 기반 (최우선):** 사용자가 상호작용하는 방식(`getByRole`)을 사용합니다. 접근성(accessibility) 이름(`name` 옵션)을 명시하는 것이 좋습니다.
26 |     *   예: `screen.getByRole('button', { name: /저장/i })`
27 | 2.  ✅ **Semantic 쿼리:** `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue` 등 의미론적이고 사용자 관점의 선택자를 사용합니다.
28 |     *   예: `screen.getByLabelText(/이메일/i)`, `screen.getByText('로그인')`
29 | 3.  ✅ **Test ID (최후 수단):** 위 방법으로 선택이 어렵거나 의미론적으로 표현하기 힘든 복잡한 요소에 제한적으로 `data-testid` 속성(`getByTestId`)을 사용합니다.
30 |     *   마크업: `<div data-testid="custom-container">...</div>`
31 |     *   테스트: `screen.getByTestId('custom-container')`
32 | 4.  **Debug:** `screen.debug()`를 사용하여 현재 렌더링된 DOM 구조를 확인하고 선택자가 올바른지 검토합니다.
33 | 
34 | ## 2. 비동기 로직 처리 실패 (Rule #2: Async Operations)
35 | 
36 | ### 진단 힌트:
37 | 오류 메시지에 `timed out waiting...`, `Cannot read property '...' of undefined` (데이터 로딩 후 접근 시), `Warning: An update to ... inside a test was not wrapped in act(...)` 등이 포함된 경우 이 규칙을 확인합니다.
38 | 
39 | ### 문제 유형:
40 | - ❌ API 호출, 상태 업데이트 후 DOM 변경을 기다리지 않고 단언(assertion) 실행
41 | - ❌ `setTimeout`, `setInterval` 등 타이머 관련 로직 테스트 어려움
42 | - ❌ 상태 업데이트와 실제 DOM 반영 사이의 타이밍 불일치
43 | 
44 | ### 해결 패턴:
45 | - ✅ **`findBy*` 사용:** 요소가 *나중에* 나타날 것으로 예상될 때 `findBy*` 쿼리 (`findByText`, `findByRole` 등)를 사용합니다. 이는 `waitFor`와 `getBy*`를 합친 것입니다.
46 |     *   예: `await screen.findByText('로딩 완료')`
47 | - ✅ **`waitFor` 사용:** 특정 조건이 충족될 때까지 기다려야 할 때 사용합니다. 주로 여러 단언을 묶거나, 특정 요소가 사라지는 것을 기다릴 때 유용합니다.
48 |     *   예: `await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument())`
49 |     *   예: `await waitFor(() => { expect(mockApiCall).toHaveBeenCalledTimes(1); expect(screen.getByText('데이터 로드 성공')).toBeInTheDocument(); })`
50 | - ✅ **`act` 사용 (필요시):** 상태 업데이트를 유발하는 사용자 이벤트(`userEvent`)는 내부적으로 `act`를 사용하므로 대부분 명시적 `act` 호출은 불필요합니다. 하지만 상태 업데이트가 이벤트 핸들러 *외부*에서 발생하는 경우 등 `act` 경고가 발생하면 해당 로직을 `act`로 감싸야 할 수 있습니다. (단, `userEvent`를 먼저 검토하세요.)
51 |     *   **주의:** `userEvent` 사용 시 불필요한 `act` 사용은 피하세요.
52 | - ✅ **타이머 모킹:** `vi.useFakeTimers()` 와 `vi.runAllTimers()` (또는 `vi.advanceTimersByTime()`) 를 사용하여 타이머 의존적인 코드를 테스트합니다.
53 |     *   테스트 시작 전: `beforeEach(() => { vi.useFakeTimers(); });`
54 |     *   테스트 종료 후: `afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); });`
55 |     *   테스트 내: `act(() => { vi.runAllTimers(); });`
56 | 
57 | ## 3. 외부 의존성 모킹 실패 (Rule #3: Mocking Dependencies)
58 | 
59 | ### 진단 힌트:
60 | 오류 메시지에 `TypeError: ... is not a function`, `... is undefined`, 실제 API 호출 시도 흔적, 라우터/전역 상태 관련 오류 등이 포함된 경우 이 규칙을 확인합니다.
61 | 
62 | ### 문제 유형:
63 | - ❌ API 클라이언트, `fetch` 등 네트워크 호출 모킹 실패
64 | - ❌ `react-router`, `zustand`, `redux` 등 외부 라이브러리/훅 모킹 실패
65 | - ❌ `localStorage`, `window` 객체 등 전역 객체 모킹 불완전
66 | 
67 | ### 해결 패턴:
68 | - ✅ **모듈 모킹 (`vi.mock`):** 라이브러리 전체나 특정 모듈을 모킹합니다. 파일 상단에 배치합니다.
69 |     *   **기본:** `vi.mock('axios');`
70 |     *   **구체적 구현:** `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), }), useParams: () => ({ id: 'test-id' }), }));`
71 |     *   **컴포넌트 모킹:** 복잡한 자식 컴포넌트는 간단한 Mock 컴포넌트로 대체합니다.
72 |         `vi.mock('./components/ComplexChart', () => ({ default: (props) => <div data-testid="mock-chart">{JSON.stringify(props)}</div> }));`
73 | - ✅ **함수/객체 모킹 (`vi.fn`, `vi.spyOn`):**
74 |     *   `vi.fn()`: 간단한 함수 모킹 또는 콜백 prop 모킹에 사용합니다.
75 |         `const mockOnClick = vi.fn(); render(<Button onClick={mockOnClick} />);`
76 |     *   `vi.spyOn()`: 특정 객체의 메소드를 모킹하거나 호출 여부를 추적할 때 사용합니다. 모킹 후에는 `mockRestore()`로 복구하는 것이 좋습니다.
77 |         `const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); ... spy.mockRestore();`
78 | - ✅ **전역 객체 모킹:**
79 |     *   `vi.stubGlobal`: `window`, `navigator` 등 전역 객체를 모킹합니다.
80 |         `vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn() });`
81 |     *   `Object.defineProperty`: `window.location` 등 수정 불가능한 속성을 모킹할 때 사용합니다.
82 | - ✅ **모킹 정리:** `beforeEach` 또는 `afterEach`에서 `vi.clearAllMocks()` 또는 `vi.resetAllMocks()`를 호출하여 테스트 간 모킹 상태가 영향을 주지 않도록 합니다. `vi.restoreAllMocks()`는 spyOn으로 생성된 mock을 복원할 때 사용합니다.
83 | 
84 | ## 4. 상태 및 결과 검증 실패 (Rule #4: Assertion & State Validation)
85 | 
86 | ### 진단 힌트:
87 | 오류 메시지에 `expect(received).toBe(expected)`, `Expected element ... to have attribute ...` 등 단언(assertion) 관련 실패가 포함된 경우 이 규칙을 확인합니다.
88 | 
89 | ### 문제 유형:
90 | - ❌ 테스트의 기대 결과가 실제 컴포넌트 동작과 다름
91 | - ❌ 특정 상호작용 후 상태 변화가 예상과 다름 (또는 변화 없음)
92 | - ❌ 로딩, 에러, 비활성화 등 다양한 상태에 대한 검증 누락
93 | 
94 | ### 해결 패턴:
95 | - ✅ **사용자 관점 우선 검증:** 내부 상태 값보다는 사용자에게 **보이는 결과**(텍스트, 활성/비활성 상태, 속성 등)를 우선적으로 검증합니다.
96 |     *   예: `expect(screen.getByRole('button', { name: /저장/i })).toBeDisabled();`
97 |     *   예: `expect(screen.getByText(/성공적으로 제출되었습니다/i)).toBeInTheDocument();`
98 | - ✅ **정확한 Matcher 사용:** `@testing-library/jest-dom`에서 제공하는 `.toBeInTheDocument()`, `.toBeDisabled()`, `.toHaveAttribute()`, `.toHaveValue()` 등 적절한 matcher를 사용합니다.
99 | - ✅ **다양한 시나리오 검증:** 성공 케이스뿐만 아니라 로딩 중 상태, 오류 발생 상태, 입력값이 유효하지 않은 경우 등 다양한 시나리오를 테스트 케이스로 분리하여 검증합니다.
100 | - ✅ **상태 격리:** 각 `test` 또는 `it` 블록이 독립적으로 실행되도록 `beforeEach`에서 필요한 상태(mock 호출 카운트 포함)를 초기화합니다.
101 |     *   예: `beforeEach(() => { vi.clearAllMocks(); // 필요한 다른 초기화 로직 추가 });`
102 | - ✅ **구현 기반 기대값:** 테스트는 컴포넌트의 현재 구현과 *의도된 동작*을 반영해야 합니다. 만약 기대값이 잘못되었다면, 컴포넌트 로직 또는 테스트 기대값 중 무엇을 수정해야 하는지 판단합니다.
103 | 
104 | ## 사용 방법 (Agent에게 지시할 때)
105 | 
106 | 다음과 같이 구체적인 규칙 번호와 함께 요청하면 에이전트가 더 정확하게 작업을 수행할 수 있습니다.
107 | 
108 | ```
109 | "이 테스트({filename})는 'Unable to find element' 오류가 발생합니다. Rule #1 (Element Selection)을 적용하여 선택자를 수정해 주세요."
110 | 
111 | "이 테스트({filename})는 API 호출 후 결과를 기다리지 못해 실패합니다 ('timed out waiting...'). Rule #2 (Async Operations)에 따라 비동기 처리 로직을 개선해 주세요. 오류 메시지는 다음과 같습니다: {오류 메시지 붙여넣기}"
112 | 
113 | "{filename} 테스트에서 'useRouter is not a function' 오류가 발생합니다. Rule #3 (Mocking Dependencies)을 사용하여 'next/navigation' 모듈을 모킹해주세요."
114 | 
115 | "사용자 입력 후 버튼 상태 검증({filename})이 실패합니다 ('Expected element to be disabled...'). Rule #4 (Assertion & State Validation)를 참고하여 단언 부분을 확인하고 수정해 주세요. 현재 코드는 다음과 같습니다: {관련 코드 부분}"
116 | ```
```

three-layer-standard.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | ## **Rule Title**  
7 | Three-Layer-Standard
8 | 
9 | > “**Zustand → MSW → TanStack Query** 3-계층 표준”  
10 | > ─ UI 명령, HTTP 경계 Mock, Server State Sync를 **명확히 분리**하고  
11 | > ─ 테스트·코드 작성 시 Cursor Agent가 따라야 할 **단일 지침서**
12 | 
13 | ---
14 | 
15 | ### 0. 이 룰이 해결하려는 문제
16 | 1. 리팩토링 후 **Zustand**·**TanStack Query** 역할이 뒤섞여 발생하는 책임 혼란 방지  
17 | 2. “어디에서 무엇을 모킹해야 하나?”를 명확히 규정 → **테스트 경계** 불일치 제거  
18 | 3. Cursor Agent가 **파일 생성/수정·테스트 작성**을 할 때 항상 같은 패턴으로 동작하게 함
19 | 
20 | ---
21 | 
22 | ### 1. 3-계층 책임 정의 (Layer)
23 | 
24 | | Layer | 코드 범위 | 책임 | **금지 사항** |
25 | |-------|-----------|------|---------------|
26 | | **Zustand Slice (UI command)** | `/src/store/*Slice.ts` | 버튼 클릭·토글·모달 열기 등 **순수 UI state** | **fetch/axios 사용 금지**, DB I/O 금지 |
27 | | **Service 함수 (+ API Route)** | `/src/services/*.ts` & `/src/app/api/**` | HTTP 요청, Zod validate, 오류 매핑 | React state 조작 금지 |
28 | | **TanStack Query 훅** | `/src/hooks/use*.ts` | 서버 state Fetch/Mutation, 캐시, 낙관적 업데이트 | 직접 DOM 조작 금지, UI state 저장 금지 |
29 | 
30 | > **MSW**는 Service 함수가 내보내는 HTTP 경계를 **가장 바깥**에서 Stub 하는 전용 도구.
31 | 
32 | ---
33 | 
34 | ### 2. 룰 태그 4종 (테스트·코드 작성 시 선택)
35 | 
36 | | 태그 | 테스트 대상 | Mock 전략 | 핵심 검증 |
37 | |------|-------------|-----------|-----------|
38 | | `@zustand-action-msw` | Zustand 액션 | 실제 Store + spy (MSW 필요 없음) | 상태 변화 확인 |
39 | | `@service-msw` | Service 함수 | **MSW** 로 REST 경계 stub | fetch 호출, 응답 매핑, 오류 처리 |
40 | | `@tanstack-query-msw` | `useQuery` 훅 | QueryClient 실제 + MSW stub | 데이터 캐시, 로딩/에러 플래그 |
41 | | `@tanstack-mutation-msw` | `useMutation` 훅 | Mutation + MSW | 캐시 무효화, optimistic update |
42 | 
43 | ---
44 | 
45 | ### 3. 파일·폴더 컨벤션
46 | 
47 | | 코드 | 위치 |
48 | |------|------|
49 | | Zustand slice | `src/store/{sliceName}Slice.ts` |
50 | | Service 함수 | `src/services/{domain}Service.ts` |
51 | | React Query 훅 | `src/hooks/use{Domain}.ts(x)` |
52 | | 테스트 | `src/{store|services|hooks}/__tests__/*.test.tsx` |
53 | | MSW 핸들러 | `src/tests/msw/{domain}Handlers.ts` |
54 | 
55 | ---
56 | 
57 | ### 4. 테스트 작성 체크리스트
58 | 
59 | 1. **Zustand 액션 단위 테스트**  
60 |    ```mdc
61 |    @zustand-action-msw toggleSidebar
62 |    steps:
63 |      1. import real useAppStore
64 |      2. act() => store.toggleSidebar()
65 |      3. expect(store.isSidebarOpen).toBe(true)
66 |    ```
67 | 
68 | 2. **Service 함수 통합 테스트**  
69 |    ```mdc
70 |    @service-msw fetchCards
71 |    msw:
72 |      - GET /api/cards → 200 [mockCards]
73 |    steps:
74 |      1. const data = await fetchCards()
75 |      2. expect(data).toEqual(mockCards)
76 |    ```
77 | 
78 | 3. **Mutation 훅 테스트**  
79 |    ```mdc
80 |    @tanstack-mutation-msw useCreateCard
81 |    msw:
82 |      - POST /api/cards → 201 [mockCard]
83 |    steps:
84 |      1. renderHook(useCreateCard) within QueryClientProvider
85 |      2. act() => mutate({ title:'t' })
86 |      3. waitFor cache['cards'] length +1
87 |    ```
88 | 
89 | ---
90 | 
91 | ### 5. Cursor Agent가 따라야 할 코딩 규칙
92 | 
93 | | 규칙 코드 | 내용 |
94 | |-----------|------|
95 | | `[layer-separation]` | 각 계층 파일에서 **다른 계층 책임**을 침범하면 안 된다. |
96 | | `[msw-last]` | 네트워크 mock은 MSW로만 한다. `vi.spyOn(global, 'fetch')` 금지. |
97 | | `[query-key]` | React Query `queryKey`는 `'[domain]', params` 형식을 지킨다. |
98 | | `[cache-inval]` | Mutation onSuccess 시 관련 Query invalidate 필수. |
99 | | `[store-pure-ui]` | Zustand slice는 **UI 전용 상태**만 가진다. fetch·async 없음. |
100 | 
101 | ---
102 | 
103 | ### 6. 규칙 적용 예시 (End-to-End)
104 | 
105 | ```mermaid
106 | sequenceDiagram
107 |   participant UI
108 |   participant Store
109 |   participant Mutation
110 |   participant Service
111 |   participant MSW as ⇢ MSW (STUB)
112 | 
113 |   UI->>Store: toggleSidebar()
114 |   Store-->>UI: isSidebarOpen = true
115 | 
116 |   UI->>Mutation: mutate(newCard)
117 |   Mutation->>Service: createCardAPI()
118 |   Service->>MSW: POST /api/cards
119 |   MSW-->>Service: 201 mockCard
120 |   Service-->>Mutation: resolve(mockCard)
121 |   Mutation-->>QueryCache: invalidate(['cards'])
122 |   UI-->>QueryCache: useCards() re-fetch
123 | ```
124 | 
125 | ```mermaid
126 | graph TD
127 |   UI[React Component] -->|dispatch| ZS[Zustand Slice<br>(UI command)]
128 |   ZS -->|call| MUT[useCreateCard<br>(TanStack Mutation)]
129 |   MUT -->|uses| SVC[cardService.createCardAPI]
130 |   SVC -->|fetch| API[/api/cards (route)]
131 |   API -->|DB| Prisma>Supabase
132 |   
133 |   classDef store fill:#f6d365,stroke:#555;
134 |   classDef svc fill:#cdeffd,stroke:#555;
135 |   class ZS store; class SVC svc;
136 | ```
137 | 
138 | ---
139 | 
140 | ### 7. 파일 헤더 샘플 (자동 생성시 Cursor Agent가 넣을 주석)
141 | 
142 | ```ts
143 | /**
144 |  * @rule   three-ayer-Standard
145 |  * @layer  service
146 |  * @tag    @service-msw fetchCards
147 |  * 설명    카드 목록을 fetch + Zod 검증 (HTTP 경계는 MSW)
148 |  */
149 | ```
150 | 
151 | ---
152 | 
153 | ### 8. 도입 가이드 (팀 공유용)
154 | 
155 | 1. **새 기능** 추가 시 체크  
156 |    - UI → Zustand slice 액션? ✅  
157 |    - 서버 데이터 필요? → Service fn + Query 훅? ✅  
158 |    - 테스트 태그 4 종 중 하나 이상 선택? ✅  
159 | 2. **리팩토링** 시 체크  
160 |    - 서버 state 로직이 Zustand에 남아있으면? → Query 훅으로 이동  
161 |    - fetch 중복? → Service 함수 재사용  
162 |    - 테스트가 HTTP 모킹 없이 실제 서버 때리면? → MSW로 교체
163 | 
164 | 
165 | ### 9. 기타
166 | - Server Side/Client Side 구분을 명확히 할 것. 
```

vitest-mocking.mdc
```
1 | ---
2 | description: 
3 | globs: src/**/*.test.ts,src/**/*.test.tsx
4 | alwaysApply: false
5 | ---
6 | # Vitest 모킹 가이드라인
7 | 
8 | ## 1. vi.mock 호이스팅 이해하기
9 | - **핵심 원칙:** `vi.mock`은 파일 최상단으로 호이스팅됩니다. 이는 import문보다 먼저 실행된다는 의미입니다.
10 | - **순서 주의:** 모든 `vi.mock` 호출은 다른 코드가 실행되기 전에 처리됩니다.
11 | - **권장 패턴:** 파일 상단에 모든 `vi.mock` 호출을 명시적으로 그룹화하여 배치하세요.
12 | 
13 | ## 2. 모킹 구현 패턴
14 | - **모듈 가져오기:** 실제 구현이 필요한 경우 `vi.importActual`을 사용하세요.
15 |   ```typescript
16 |   vi.mock('@xyflow/react', async () => {
17 |     const actual = await vi.importActual('@xyflow/react');
18 |     return {
19 |       ...actual,
20 |       useReactFlow: () => ({ /* 모킹 구현 */ }),
21 |     };
22 |   });
23 |   ```
24 | - **객체 모킹:** 간단한 객체 모킹은 직접 리턴하세요.
25 |   ```typescript
26 |   vi.mock('sonner', () => ({
27 |     toast: {
28 |       success: vi.fn(),
29 |       error: vi.fn(),
30 |     }
31 |   }));
32 |   ```
33 | - **함수 모킹:** 함수는 `vi.fn()`을 사용하고 필요시 `mockImplementation` 또는 `mockReturnValue`를 설정하세요.
34 | 
35 | ## 3. 모킹 준비 및 정리
36 | - **beforeEach:** 모든 테스트 전에 `vi.clearAllMocks()`를 호출하여 모든 호출 기록을 초기화하세요.
37 | - **afterEach:** 테스트 후 `vi.resetAllMocks()`를 호출하여 모든 구현과 반환값을 재설정하세요.
38 | - **복잡한 모킹:** 테스트별 모킹 구현이 필요한 경우, beforeEach 내에서 `mockImplementation`을 재설정하세요.
39 | 
40 | ## 4. MSW 서버 설정
41 | - **서버 설정:** MSW를 사용한 API 모킹 시 다음 순서를 따르세요:
42 |   ```typescript
43 |   beforeAll(() => server.listen());
44 |   afterEach(() => server.resetHandlers());
45 |   afterAll(() => server.close());
46 |   ```
47 | - **핸들러 추가:** 특정 테스트에서 응답을 오버라이드해야 하는 경우, `beforeEach` 내에서 `server.use()`를 호출하세요.
48 | 
49 | ## 5. 훅 모킹
50 | - **훅 모킹:** React 훅은 반환 객체의 모든 메서드를 명시적으로 모킹하세요.
51 |   ```typescript
52 |   vi.mock('./useMyHook', () => ({
53 |     useMyHook: () => ({
54 |       someFunction: vi.fn(),
55 |       anotherFunction: vi.fn(),
56 |     })
57 |   }));
58 |   ```
59 | - **Zustand 스토어 모킹:** 스토어 모킹 시 selector 패턴을 고려하세요.
60 |   ```typescript
61 |   vi.mock('@/store/useAppStore', () => ({
62 |     useAppStore: (selector) => selector ? 
63 |       selector({ /* 상태 객체 */ }) : 
64 |       { /* 전체 상태 객체 */ },
65 |   }));
66 |   ```
67 | 
68 | ## 6. 자주 하는 실수와 해결책
69 | - **의존성 모킹 누락:** 테스트 대상 코드가 사용하는 모든 외부 의존성을 모킹하세요.
70 | - **구현 누락:** 테스트에서 호출되는 모든 모킹된 함수에 구체적인 구현을 제공하세요.
71 | - **타입 문제:** 모킹된 값에 명시적인 타입 캐스팅을 적용하세요. (예: `as MarkerType`)
72 | - **로컬 스토리지 모킹:** 로컬 스토리지 작업은 `vi.spyOn(window.localStorage, 'setItem')`과 같이 스파이를 사용하세요.
73 | # --- END OF FILE
```

zustand-action-msw.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # --- START OF FILE: .cursor/rules/zustand-action-msw.mdc ---
7 | description: Zustand 액션 기반 아키텍처와 MSW 테스팅을 강제합니다.
8 | globs:
9 |   - src/**/*.{ts,tsx}
10 |   - src/tests/**/*.{ts,tsx}
11 | alwaysApply: true
12 | ---
13 | 
14 | # 규칙: Zustand 액션 & MSW 패턴
15 | 
16 | ## 1. 핵심 원칙: 액션 중심의 상태 관리
17 | 
18 | *   **필수:** 모든 애플리케이션 상태 변경은 **반드시** Zustand 스토어 (`src/store/` 내 관련 스토어 파일) 내에 명시적으로 정의된 **액션**을 통해서만 이루어져야 합니다.
19 | *   **금지:** 스토어의 정의된 액션 외부(예: 컴포넌트, 훅)에서 직접 상태를 조작하거나(`set` 직접 사용) 상태 객체를 변경하는 것은 **엄격히 금지**됩니다.
20 | *   **필수:** 액션은 특정 사용자 의도나 시스템 이벤트를 나타내야 합니다 (예: `selectCard`, `fetchBoardData`, `updateSettings`).
21 | 
22 | ## 2. UI 컴포넌트 책임
23 | 
24 | *   **필수:** UI 컴포넌트(React 컴포넌트, `src/components/` 또는 `src/app/` 내)는 Zustand 스토어가 관리하는 전역 애플리케이션 상태와 관련된 비즈니스 로직이나 직접적인 상태 수정 로직을 **포함해서는 안 됩니다.**
25 | *   **필수:** UI 컴포넌트의 주요 역할은 다음과 같습니다:
26 |     1.  Zustand 스토어 또는 로컬 UI 상태에서 파생된 데이터 표시.
27 |     2.  사용자 상호작용(예: 버튼 클릭, 입력 변경)에 응답하여 적절한 Zustand 액션 호출.
28 | *   **권장:** 전역 애플리케이션 상태에 영향을 미치지 않는 로컬 UI 상태(예: 입력 필드 값, 모달 열림/닫힘 상태)는 컴포넌트 내에서 `useState`를 사용하여 관리할 수 있습니다.
29 | 
30 | ## 3. Zustand 액션 구현
31 | 
32 | *   **필수:** 스토어 파일(예: `useAppStore.ts`)에 정의된 액션은 `set` 또는 `get().someAction(...)`을 사용한 상태 업데이트를 포함하여, 해당 이벤트를 처리하는 데 필요한 **모든 로직**을 포함해야 합니다.
33 | *   **필수:** 전역 상태 변경과 관련된 비동기 작업(예: `fetch`를 사용한 API 호출)은 Zustand 액션 **내에서** 시작되고 관리되어야 합니다.
34 |     *   **필수:** 비동기 액션에서 강력한 오류 처리를 위해 `try...catch` 블록을 사용해야 합니다.
35 |     *   **권장:** 비동기 액션의 생명주기 동안 스토어 내 관련 로딩 및 오류 상태를 업데이트해야 합니다 (예: fetch 전 `isLoading: true`, 성공 시 `isLoading: false, error: null`, 실패 시 `isLoading: false, error: err.message`).
36 |     *   **권장:** 작업 성공 또는 실패 시 액션 핸들러 **내에서** `toast` 알림을 사용하거나 전용 알림 액션을 호출해야 합니다.
37 | 
38 | ## 4. API 상호작용 및 MSW 테스팅
39 | 
40 | *   **필수:** API 호출(`fetch`)을 포함하는 Zustand 액션을 구현하거나 수정할 때, 해당 **MSW 핸들러**를 **반드시** `src/tests/msw/handlers.ts`에 추가하거나 업데이트해야 합니다.
41 | *   **필수:** API 호출을 포함하는 Zustand 액션에 대한 단위 테스트는 API 응답을 모킹하기 위해 설정된 **MSW 서버** (`src/tests/msw/server.ts`)를 **반드시** 활용해야 합니다.
42 | *   **필수:** 테스트는 MSW 핸들러를 `server.use()`를 사용하여 적절히 구성함으로써 성공적인 API 응답과 잠재적 오류 시나리오(예: 네트워크 오류, 서버 오류)를 **모두 포함**해야 합니다.
43 | 
44 | ## 5. 디버깅을 위한 콘솔 API
45 | 
46 | *   **필수:** 개발 모드(`process.env.NODE_ENV === 'development'`)에서는 주요 Zustand 액션이 **반드시** 전역 `window.appCommands` 객체를 통해 노출되어야 합니다. 이 설정은 클라이언트 측 진입점(예: `ClientLayout.tsx`)에 위치해야 합니다.
47 |     *   *예시:* `window.appCommands.selectCard = useAppStore.getState().selectCard;`
48 | *   **필수:** 이 `window.appCommands` 할당이 프로덕션 빌드에서 올바르게 **제외되도록 보장**해야 합니다 (환경 변수 확인 사용).
49 | *   **필수:** 새로운 명령이 추가되거나 기존 명령이 변경될 때마다, 노출된 모든 명령, 해당 매개변수 및 사용 예제를 문서화하는 `docs/console-api.md` 파일을 **유지 관리**해야 합니다.
50 | 
51 | ## 6. 리팩토링 가이드라인
52 | 
53 | *   기존 코드를 이 패턴에 맞게 리팩토링할 때:
54 |     1.  컴포넌트 또는 훅 내의 상태 업데이트 로직 식별.
55 |     2.  관련 스토어 파일에 해당 액션 정의.
56 |     3.  새로 정의된 액션으로 로직 이동.
57 |     4.  컴포넌트/훅이 상태를 직접 조작하는 대신 새 액션을 호출하도록 업데이트.
58 |     5.  로직에 API 호출이 포함된 경우 MSW 핸들러 및 테스트가 생성/업데이트되었는지 확인.
59 | 
60 | ## 7. 서버 컴포넌트에서의 클라이언트 측 훅 사용
61 | 
62 | *   **필수:** 브라우저 특정 API나 컨텍스트에 의존하는 훅(예: `useState`, `useEffect`, `useSearchParams`, `usePathname`, 클라이언트 측 탐색/상태에 사용되는 `next/navigation`의 `useRouter`)은 **서버 컴포넌트**(일반적으로 `src/app/` 아래에 `'use client';` 지시문이 없는 파일) 내에서 **직접 호출해서는 안 됩니다.**
63 | *   **필수:** 서버 컴포넌트가 클라이언트 측 훅에서 제공하는 기능이 필요한 경우:
64 |     1.  **새로운 클라이언트 컴포넌트**를 생성합니다 (파일 상단에 `'use client';` 추가).
65 |     2.  클라이언트 측 훅을 사용하는 로직을 이 새 클라이언트 컴포넌트로 **이동**합니다.
66 |     3.  원래 서버 컴포넌트 내에서 새 클라이언트 컴포넌트를 **import하여 사용**합니다.
67 | *   **필수:** 서버 컴포넌트 내에서 클라이언트 컴포넌트(특히 초기 서버 렌더링/사전 렌더링 시 사용 불가능할 수 있는 `useSearchParams` 같은 훅을 사용하는 컴포넌트)를 렌더링할 때는, 해당 클라이언트 컴포넌트를 적절한 `fallback` UI와 함께 **`<Suspense>` 경계로 감싸야 합니다.**
68 |     *   *예시:*
69 |       ```tsx
70 |       // 서버 컴포넌트 내 (예: src/app/some/page.tsx)
71 |       import { Suspense } from 'react';
72 |       import ClientSideComponentUsingHooks from '@/components/ClientSideComponentUsingHooks';
73 | 
74 |       function LoadingFallback() {
75 |         return <p>동적 콘텐츠 로딩 중...</p>;
76 |       }
77 | 
78 |       export default function ServerPage() {
79 |         return (
80 |           <div>
81 |             <h1>서버 렌더링된 제목</h1>
82 |             <Suspense fallback={<LoadingFallback />}>
83 |               <ClientSideComponentUsingHooks />
84 |             </Suspense>
85 |           </div>
86 |         );
87 |       }
88 |       ```
89 | *   **필수:** 클라이언트 컴포넌트를 생성한 이유(예: "useSearchParams 훅 사용")를 컴포넌트의 파일 레벨 주석이나 문서에 **명확하게 기록**해야 합니다.
90 | 
91 | **근거:** 이 규칙은 서버 렌더링 또는 사전 렌더링 중에 클라이언트 전용 API나 훅을 사용하려고 할 때 발생하는 빌드 오류 및 런타임 문제를 방지합니다. 이는 Next.js App Router 아키텍처 내에서 클라이언트 측 상호작용 및 데이터 가져오기를 통합하는 올바른 패턴을 강제하며, 클라이언트 컴포넌트 로딩 중 더 나은 사용자 경험을 위해 Suspense를 활용합니다.
92 | 
93 | **이 규칙들을 엄격히 준수함으로써, 우리는 Zustand 액션과 MSW를 중심으로 일관되고 유지 관리 가능하며 테스트 가능한 아키텍처를 보장합니다.**
94 | # --- END OF FILE ---
```
