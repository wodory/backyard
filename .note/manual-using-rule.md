
*   * **explict-error-throw-testing**

    * "Agent, `auth.ts` 파일의 테스트 커버리지를 90% 이상으로 높여줘. **'종합적인 코드 경로 및 예외 처리 테스트 규칙'**을 엄격하게 따라야 해.

    * 1.  현재 커버되지 않은 라인들(`144, 210-211, 264-265, 345-347, 351-360, 372-394, 434-441`)을 포함하여 **모든 코드 경로**를 테스트해야 해.
    * 2.  특히 `if/else`, `try/catch` 블록의 **모든 브랜치**가 실행되도록 테스트 케이스를 추가해줘. 브랜치 커버리지 90% 이상 달성이 중요해.
    * 3.  `fetch`, Supabase 클라이언트 메서드, 스토리지 API(`localStorage`, `sessionStorage`), `window.location`, `crypto` 등 **모든 외부 의존성은 반드시 모킹**하고, 성공 및 **다양한 실패/에러 시나리오**를 모킹해서 테스트해줘. (예: `fetch`가 `ok: false` 반환, Supabase 메서드가 `error` 객체 반환, `localStorage.setItem` 실패 등)
    * 4.  에러를 `throw`하는 로직은 **반드시 `expect(...).rejects.toThrow()`로 에러 발생 여부를 명시적으로 검증**해야 해. `catch` 블록에서 에러를 처리하고 특정 값을 반환하는 경우, 그 반환 값과 로깅 호출을 검증해줘.
    * 5.  `isClient()`, `isClientEnvironment()`를 사용하는 함수의 경우, **클라이언트 환경과 서버 환경 각각을 시뮬레이션**하는 테스트 케이스를 만들어 각 분기 로직을 테스트해줘.
    * 6.  `googleLogin` 함수처럼 복잡한 함수는 필요한 모든 API(`crypto`, `window.location` 등)를 철저히 모킹하여 내부 로직을 검증해줘. (`window.location.href` 할당 테스트 포함)
    * 7.  `getSession`, `getUser` 같은 단순 래퍼 함수도 최소 한 번 호출되어 내부 함수 호출을 검증하도록 해줘."