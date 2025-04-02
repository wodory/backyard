로거 모듈은 싱글톤 패턴, 비동기 로깅, 복잡한 초기화 등 테스트를 까다롭게 만드는 요소를 포함할 수 있습니다. AI가 생성한 코드가 실패할 경우 다음 규칙들을 순서대로 점검해보세요.

**AI 생성 로거 테스트 코드 디버깅 규칙 (Troubleshooting Rules for AI-Generated Logger Tests)**

---

**Rule 1: 정확한 모킹 대상 확인 (Verify the Mock Target)**

*   **점검 내용:** AI가 로거 *팩토리 함수*(`createLogger`)를 모킹했는지, 아니면 특정 로거 *인스턴스*(`logger.info` 등)를 모킹했는지 확인합니다.
*   **해결 시도:**
    *   대부분의 경우, 로거를 사용하는 **모듈을 테스트하기 전 최상단에서** `vi.mock('@/lib/logger', ...)`를 사용하여 **팩토리 함수 자체를 모킹**하는 것이 올바릅니다.
    *   AI가 특정 인스턴스에 `vi.spyOn`을 사용했다면, 해당 인스턴스가 테스트 대상 코드에서 실제로 사용하는 인스턴스와 동일한지 확인하세요. (팩토리 모킹이 더 안정적일 수 있습니다.)
    *   **액션:** AI가 생성한 모킹 코드를 보고, `vi.mock`이 로거 모듈 경로(`@/lib/logger`)를 대상으로 팩토리 함수를 모방하도록 수정해보세요.

```typescript
// 예시: 올바른 팩토리 모킹
import { vi } from 'vitest';

const mockLoggerInstance = { // 모킹된 로거 인스턴스 구조 정의
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('@/lib/logger', () => ({
  // default export인 createLogger를 모킹
  default: vi.fn(() => mockLoggerInstance),
  // logger 인스턴스도 직접 export한다면 그것도 모킹 (필요시)
  // logger: mockLoggerInstance,
  LogLevel: { /* 실제 Enum 값 */ }, // Enum 등 다른 export도 필요하면 유지
}));

// --- 이제 다른 모듈 import ---
import { functionUnderTest } from './myModule';
import createLogger from '@/lib/logger'; // 모킹된 버전이 import됨

describe('My Module', () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹 함수 호출 기록 초기화
    vi.clearAllMocks();
    // 필요하다면 팩토리 함수 자체의 호출 기록도 초기화
    vi.mocked(createLogger).mockClear();
  });

  it('should call logger.info on success', () => {
    functionUnderTest();
    // 팩토리가 반환한 인스턴스의 메서드 호출 검증
    expect(mockLoggerInstance.info).toHaveBeenCalled();
  });
});
```

**Rule 2: 모킹 반환 값 구조 확인 (Check Mock Return Structure)**

*   **점검 내용:** `vi.mock`으로 팩토리 함수(`createLogger`)를 모킹할 때, 모킹된 팩토리가 반환하는 객체가 실제 로거 인스턴스가 가진 모든 메서드(`info`, `warn`, `error`, `debug` 등)를 `vi.fn()`으로 포함하고 있는지 확인합니다.
*   **해결 시도:**
    *   실제 `logger.ts` 파일을 열어 로거 인스턴스가 어떤 메서드를 export/제공하는지 확인합니다.
    *   `vi.mock`의 반환 객체에 누락된 메서드가 있다면 `vi.fn()`으로 추가합니다.

**Rule 3: 모킹 시점 및 범위 확인 (Verify Mock Timing and Scope)**

*   **점검 내용:** `vi.mock('@/lib/logger', ...)` 호출이 테스트 파일 **최상단**(모든 `import` 문보다 앞서)에 위치하는지 확인합니다. Vitest는 `vi.mock` 호출을 파일 상단으로 끌어올립니다(hoisting). 또한, 모킹이 필요한 테스트 스코프(`describe` 블록 등) 내에서만 적용되는지 확인합니다.
*   **해결 시도:**
    *   `vi.mock` 호출을 파일 맨 위로 옮깁니다.
    *   모든 테스트에서 로거 모킹이 필요하다면 파일 최상단에 두고, 특정 `describe` 블록에서만 필요하다면 해당 블록 내에서 `vi.doMock` 등을 사용하는 것을 고려합니다 (하지만 일반적으로 최상단 모킹이 권장됩니다).

**Rule 4: 싱글톤/인스턴스 관리 확인 (Check for Singletons/Instance Management)**

*   **점검 내용:** 로거 모듈이 내부적으로 싱글톤 인스턴스(`LogStorage.getInstance()` 등)를 생성하고 관리하는지 확인합니다.
*   **해결 시도:**
    *   싱글톤 패턴이 사용된다면, **팩토리 함수(`createLogger`)를 모킹**하는 것이 해당 싱글톤 인스턴스를 사용하는 모든 코드가 모킹된 인스턴스를 받게 하는 가장 확실한 방법입니다 (Rule 1 참조).
    *   AI가 싱글톤 인스턴스의 메서드를 직접 `vi.spyOn` 하려고 했다면 실패할 가능성이 높습니다. Rule 1의 팩토리 모킹 방식으로 변경합니다.
    *   `beforeEach` 또는 `afterEach`에서 `vi.clearAllMocks()` 또는 `vi.resetAllMocks()`를 사용하여 테스트 간 간섭을 방지합니다.

**Rule 5: 비동기 로깅 처리 확인 (Handle Asynchronous Logging)**

*   **점검 내용:** 테스트 대상 코드나 로거 자체의 특정 메서드가 비동기(`async/await`)로 동작하는지 확인합니다.
*   **해결 시도:**
    *   테스트 코드에서 비동기 함수를 호출한 후 로거 호출을 검증할 때는 `await` 키워드를 사용합니다.
    *   `await act(async () => { ... })` (react-testing-library) 또는 `await flushPromises()` (직접 구현 또는 유틸리티) 등을 사용하여 비동기 작업이 완료될 때까지 기다린 후 `expect` 검증을 수행합니다.

**Rule 6: `expect` 검증 단순화 및 인수 확인 (Simplify Assertions and Check Arguments)**

*   **점검 내용:** `expect(logger.info).toHaveBeenCalledWith(...)` 검증이 실패하는 경우, 인자 매칭 문제일 수 있습니다.
*   **해결 시도:**
    *   **1단계 (호출 여부만 확인):** `expect(logger.info).toHaveBeenCalled()` 로 변경하여 일단 함수 자체가 호출되었는지 확인합니다. 이것도 실패하면 모킹 자체가 잘못된 것입니다 (Rule 1, 2 확인).
    *   **2단계 (인자 타입 확인):** `toHaveBeenCalled()`가 성공하면, 인자 매칭 문제입니다. `expect(logger.info).toHaveBeenCalledWith(expect.any(String), expect.any(Object))` 처럼 인자 타입을 느슨하게 검사해봅니다.
    *   **3단계 (인자 내용 확인):** 특정 내용만 확인하려면 `expect.objectContaining({...})` 또는 `expect.stringContaining(...)` 을 사용합니다.
    *   **4단계 (실제 인자 로깅):** 모킹된 함수 내부에서 `console.log(arguments)` 를 추가하여 실제로 어떤 인자가 전달되는지 확인하고 `expect` 구문을 수정합니다.

**Rule 7: 테스트 격리 (Isolate the Test)**

*   **점검 내용:** 다른 모킹이나 테스트 로직과의 충돌 가능성을 배제합니다.
*   **해결 시도:**
    *   **로거 모킹 제거:** 로거 모킹 부분을 주석 처리하고 테스트를 실행합니다. 테스트가 (실제 로그가 찍히더라도) 성공하면 로거 모킹 방식에 문제가 있는 것입니다.
    *   **최소 테스트 작성:** 새 `it` 블록에서 오직 로거를 호출하는 함수 부분만 실행하고 해당 로거 호출만 검증하는 최소한의 테스트를 작성해봅니다. 이것이 실패하면 기본적인 모킹 설정부터 다시 점검합니다.

**Rule 8: 로거 모듈 자체 확인 (Inspect the Logger Module)**

*   **점검 내용:** `logger.ts` 모듈 자체에 복잡한 조건부 로직, 환경 변수 의존성, 동적 `import()` 등이 있는지 확인합니다.
*   **해결 시도:**
    *   로거 모듈이 특정 환경 변수에 따라 다르게 동작한다면, 테스트 전에 `vi.stubEnv()` 등으로 해당 환경 변수를 설정해야 할 수 있습니다.
    *   로거 초기화가 복잡하다면, 해당 초기화 로직을 모킹하거나 테스트 설정에서 유사하게 수행해야 할 수 있습니다.

---

이 규칙들을 순서대로 적용해보면서 AI가 생성한 코드의 어떤 부분이 잘못되었는지 진단하고 수정하면 로거 관련 테스트 오류를 해결하는 데 도움이 될 것입니다.