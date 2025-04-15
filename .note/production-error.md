**🎯 목표:** `yarn lint` 및 `yarn tsc --noEmit` 실행 시 오류가 발생하지 않도록 코드 수정

---

**Phase 1: 자동 수정 가능한 오류 처리 (ESLint Autofix)**

*   **Task 1.1: `import/order` 자동 수정 시도**
    *   **지시:** "Cursor Agent, 프로젝트 전체 파일에 대해 ESLint의 `import/order` 규칙 위반을 자동으로 수정해 주세요. ESLint autofix 기능을 사용하세요. (예: `eslint --fix .` 명령어를 내부적으로 실행하거나 해당 기능을 통해 수정)"
    *   **검증:** Agent 작업 후, 터미널에서 `yarn lint`를 실행하여 `import/order` 관련 오류가 줄었는지 확인합니다. (자동 수정되지 않는 경우가 있을 수 있습니다.)

**Phase 2: 명확하고 기계적인 오류 수정**

*   **Task 2.1: 사용되지 않는 변수/import 제거 (`@typescript-eslint/no-unused-vars`)**
    *   **지시:** "Cursor Agent, Vercel 로그에 보고된 `@typescript-eslint/no-unused-vars` 오류를 찾아 해당 변수 또는 import 구문을 안전하게 제거해 주세요. 각 파일별로 진행합니다."
        *   (Agent에게 로그에 나온 파일 목록을 하나씩 제시하며 지시할 수 있습니다. 예: "src/app/api/cards/[id]/route.test.ts 파일에서 사용되지 않는 'NextResponse' import를 제거하세요.")
    *   **검증:** `yarn tsc --noEmit` 및 `yarn lint` 실행 확인.

*   **Task 2.2: 트리플 슬래시 참조 수정 (`@typescript-eslint/triple-slash-reference`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `/// <reference types="..." />` 구문을 찾아 해당 타입을 `import type { ... } from '...'` 구문으로 변경해 주세요."
        *   (예: "src/app/api/tags/[id]/route.test.ts 파일의 `/// <reference types="vitest" />` 를 `import type { ... } from 'vitest'` (필요한 타입 명시) 또는 적절한 import 방식으로 수정하세요.")
    *   **검증:** `yarn tsc --noEmit` 및 `yarn lint` 실행 확인.

*   **Task 2.3: `module` 변수명 변경 (`@next/next/no-assign-module-variable`)**
    *   **지시:** "Cursor Agent, src/app/api/logs/view/route.ts 파일 49행의 `module` 변수명을 `logModule` 과 같이 다른 이름으로 변경하고, 해당 변수를 사용하는 모든 곳도 함께 수정해 주세요."
    *   **검증:** `yarn tsc --noEmit` 및 `yarn lint` 실행 확인.

*   **Task 2.4: `prefer-const` 오류 수정**
    *   **지시:** "Cursor Agent, 로그에 보고된 `prefer-const` 오류를 찾아, 재할당되지 않는 `let` 변수를 `const`로 변경해 주세요."
        *   (예: "src/components/ideamap/DagreNodePositioning.tsx 파일의 'updatedNode' 변수를 const로 변경하세요.")
    *   **검증:** `yarn tsc --noEmit` 및 `yarn lint` 실행 확인.

*   **Task 2.5: 기타 명확한 ESLint 오류 수정 (남은 `import/order`, `no-unescaped-entities` 등)**
    *   **지시:** "Cursor Agent, 아직 남아있는 `import/order` 오류 및 `react/no-unescaped-entities` 오류 등 명확한 ESLint 오류들을 로그 메시지에 따라 수정해 주세요. 각 파일별로 진행합니다." (로그에 나온 파일과 오류 메시지를 구체적으로 제시)
    *   **검증:** `yarn lint` 실행 확인.

**(중간 커밋 권장)**

**Phase 3: TypeScript 타입 관련 오류 수정**

*   **Task 3.1: `any` 타입 구체화 (`@typescript-eslint/no-explicit-any`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `@typescript-eslint/no-explicit-any` 오류를 파일별로 찾아 수정해 주세요. 다음 우선순위를 따릅니다:
        1.  가능하다면 가장 구체적인 타입 (예: `string`, `number`, 특정 인터페이스)으로 변경합니다.
        2.  타입을 특정하기 어렵지만 객체임이 확실하면 `Record<string, unknown>` 또는 `object`를 사용합니다.
        3.  정말 타입을 알 수 없거나 외부 라이브러리 등으로 인해 불가피하다면 `unknown`을 사용하고, 필요한 곳에서 타입 가드를 사용하도록 코드를 수정합니다.
        4.  왜 특정 타입을 선택했는지 주석을 추가하는 것을 고려하세요."
        *   (예: "src/app/admin/logs/page.tsx 파일 61행의 `err: any` 타입을 `err: unknown`으로 변경하고, `err instanceof Error` 와 같은 타입 가드를 사용하도록 수정하세요.")
    *   **주의:** 이 작업은 코드 로직에 영향을 줄 수 있으므로 신중하게 진행하고 검증이 중요합니다.
    *   **검증:** `yarn tsc --noEmit` 실행 확인.

*   **Task 3.2: 빈 객체 타입 수정 (`@typescript-eslint/no-empty-object-type`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `@typescript-eslint/no-empty-object-type` 오류를 찾아 수정해 주세요.
        1.  빈 인터페이스(`interface Foo {}`)는 실제 필요한 멤버를 추가하거나, 의미가 없다면 제거합니다.
        2.  빈 객체 타입(`{}`)은 의도에 따라 `Record<string, never>`, `object`, `unknown` 등으로 대체합니다."
        *   (예: "src/types/supabase.ts 파일 121행의 Views `{}` 타입을 `Record<string, never>` 또는 실제 필요한 타입으로 수정하세요.")
    *   **검증:** `yarn tsc --noEmit` 실행 확인.

*   **Task 3.3: `@ts-ignore` 주석 처리 (`@typescript-eslint/ban-ts-comment`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `@ts-ignore` 주석을 찾아 수정해 주세요.
        1.  가능하다면 해당 라인의 타입 오류를 근본적으로 해결합니다.
        2.  오류 해결이 어렵거나 의도적인 무시라면 `@ts-expect-error`로 변경하고, 왜 필요한지 주석을 추가합니다."
        *   (예: "src/lib/prisma.ts 파일 47행의 `@ts-ignore`를 제거하고 타입 문제를 해결하거나, 불가피하다면 `@ts-expect-error // 개발 환경에서 더미 클라이언트 생성을 위함`과 같이 수정하세요.")
    *   **검증:** `yarn tsc --noEmit` 실행 확인.

**(중간 커밋 권장)**

**Phase 4: React Hook 관련 오류 수정**

*   **Task 4.1: Hook 의존성 배열 수정 (`react-hooks/exhaustive-deps`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `react-hooks/exhaustive-deps` 경고를 찾아 ESLint가 제안하는 대로 의존성 배열을 수정해 주세요. 만약 의도적으로 특정 의존성을 제외해야 한다면, 해당 라인 위에 `// eslint-disable-next-line react-hooks/exhaustive-deps` 주석과 함께 이유를 명시하세요."
        *   (예: "src/app/admin/logs/page.tsx 파일 72행의 useEffect 훅 의존성 배열에 'fetchLogs'를 추가하세요.")
    *   **주의:** 의존성 추가 시 무한 루프 등이 발생하지 않는지 로직을 확인해야 합니다.
    *   **검증:** `yarn lint` 실행 확인 및 기능 테스트 (무한 루프 등).

*   **Task 4.2: Hook 호출 규칙 위반 수정 (`react-hooks/rules-of-hooks`)**
    *   **지시:** "Cursor Agent, 로그에 보고된 `react-hooks/rules-of-hooks` 오류를 찾아 해당 훅 호출을 컴포넌트나 커스텀 훅의 최상위 레벨로 이동시키거나, 조건부 로직을 훅 외부로 빼내도록 코드를 리팩토링해 주세요."
        *   (예: "src/contexts/AuthContext.tsx 파일 63행부터 시작되는 useState 훅들을 조건문 밖, 컴포넌트 최상위로 이동시키세요. 초기값 설정 로직은 훅 호출 이후에 조건부로 처리하도록 변경하세요.")
    *   **주의:** 이 작업은 컴포넌트 로직 변경을 수반하므로 기능 테스트가 필수적입니다.
    *   **검증:** `yarn lint` 실행 확인 및 관련 컴포넌트 기능 테스트.

**(중간 커밋 권장)**

**Phase 5: 최종 검증 및 정리**

*   **Task 5.1: 전체 린트 및 타입 검사 실행**
    *   **지시 (개발자):** 터미널에서 `yarn lint` 와 `yarn tsc --noEmit` 를 순차적으로 실행하여 남아있는 오류가 없는지 최종 확인합니다.
*   **Task 5.2: (선택) 코드 포맷팅**
    *   **지시:** "Cursor Agent, 프로젝트 전체 코드에 대해 Prettier를 적용하여 코드 스타일을 통일해 주세요."
*   **Task 5.3: 최종 커밋**
    *   **지시 (개발자):** 모든 오류가 수정되었음을 확인하고 최종 변경 사항을 커밋합니다.


**잔여 이슈 유형**
*   lint
    *   사용하지 않는 import/변수 제거
    *   import 순서 수정
    *   any 타입 구체화
    *   React Hooks 의존성 배열 수정