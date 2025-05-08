# 아이디어맵 설정-엣지 동기화 개선 계획 (재구성)

## 1. useIdeaMapStore 리팩토링: TanStack Query를 SSOT로 확립

현재 문제점: Zustand 스토어인 `useIdeaMapStore`가 설정을 관리하고 로컬 스토리지에 저장하는 로직을 포함하고 있어 TanStack Query와 책임이 중복됨. 데이터 불일치 발생.

### 세부 작업:
1. `ideaMapSettings` 상태 및 설정 관련 함수들에서 불필요한 로직 제거
   - `setIdeaMapSettings`: 로컬 스토리지 저장 로직 제거
   - `updateIdeaMapSettings`: 서버 저장 로직 제거 (TanStack Query가 담당)
   - `loadIdeaMapSettingsFromServerIfAuthenticated`: 완전히 제거 (TanStack Query가 담당)
   - `loadAndApplyIdeaMapSettings`: 완전히 제거
   - `updateAndSaveIdeaMapSettings`: 완전히 제거

2. `updateEdgeStyles` 함수를 TanStack Query의 설정을 직접 활용하도록 수정
   - 설정 인자를 받고 이를 기반으로 엣지 스타일을 업데이트하는 방식으로 변경
   - 설정 상태 관리는 TanStack Query에 위임

## 2. updateAllEdgeStylesAction 비교 로직 개선

현재 문제점: 설정 변경이 감지되지 않아 엣지 스타일이 업데이트되지 않음. JSON.stringify 비교가 미묘한 변경을 놓치고 있음.

### 세부 작업:
1. 개별 속성 기반 비교 로직 강화
   - `styleChanged`, `animatedChanged`, `markerChanged`, `settingsChanged` 로직 개선
   - 주요 속성들의 직접 비교 구현 (깊은 비교 대신 정확한 속성 비교)

2. 로깅 개선
   - 비교 전/후 설정값과 엣지 스타일 상태를 명확히 기록
   - 문제 진단을 위한 구체적인 정보 추가

3. 안전한 속성 접근 추가
   - 옵셔널 체이닝 활용
   - 타입 가드 추가

## 3. 엣지 스타일 업데이트 로직 개선

현재 문제점: 마커 타입 관련 타입 호환성 이슈와 비효율적인 로깅으로 인한 성능 문제.

### 세부 작업:
1. 타입 호환성 문제 해결
   - `EdgeMarker` 타입과 `MarkerType` 타입 간 변환 로직 개선
   - `React Flow` 공식 문서의 타입 이름으로 통일
   - 타입 단언 코드 정리

2. 로깅 최적화
   - 중복 로그 제거
   - 디버그 모드에서만 로깅하도록 수정
   - 구조화된 로그 포맷 적용

3. 업데이트 로직 최적화
   - 불필요한 객체 생성 및 중첩 구조 단순화
   - 성능 개선을 위한 코드 최적화

## 4. CustomEdge 컴포넌트 확인

현재 문제점: 설정이 변경되어도 CustomEdge 컴포넌트가 제대로 업데이트되지 않을 수 있음.

### 세부 작업:
1. 컴포넌트 분석 및 테스트
   - 메모이제이션 의존성 확인
   - 설정 값 변경 시 리렌더링 발생 여부 확인

2. 필요시 컴포넌트 업데이트
   - 의존성 배열 조정
   - 설정 변경 감지 메커니즘 개선

3. 스타일 적용 로직 확인
   - 우선순위 적용 규칙이 제대로 작동하는지 확인
   - 누락된 속성 확인

## 5. 테스트 및 검증

### 세부 작업:
1. 설정 변경 테스트
   - 다양한 설정 변경 시나리오 테스트
   - 엣지 스타일 업데이트 확인

2. 동기화 검증
   - 로컬과 서버 설정 동기화 확인
   - UI 반영 확인

3. 다양한 엣지 타입 테스트
   - 다양한 엣지 타입과 설정 조합 테스트
   - 예외 상황 처리 확인

## 보류 (필요시 구현): 강제 업데이트 메커니즘

위 단계들로 문제가 해결되지 않을 경우에만 구현할 메커니즘.

### 세부 작업:
1. 강제 업데이트 플래그 추가
2. 설정 변경 시 자동 강제 업데이트 로직 구현

### IMPLEMENTATION CHECKLIST:

1. **useIdeaMapStore.ts에서 설정 관련 코드 리팩토링**
   - `setIdeaMapSettings` 함수에서 로컬 스토리지 저장 로직 제거
   - `updateIdeaMapSettings` 함수 간소화 - TanStack Query 활용하도록 변경
   - `loadIdeaMapSettingsFromServerIfAuthenticated` 함수 제거
   - `loadAndApplyIdeaMapSettings` 함수 제거
   - `updateAndSaveIdeaMapSettings` 함수 제거
   - `updateEdgeStyles` 함수가 외부 설정을 활용하도록 수정

2. **updateAllEdgeStylesAction 함수 개선**
   - `JSON.stringify` 비교를 속성별 직접 비교로 대체
   - 비교 로직 세분화 (스타일, 애니메이션, 마커, 설정별 비교)
   - 로깅 개선 - 변경 감지 여부와 변경된 구체적 속성 기록
   - 타입 단언 코드 정리 및 옵셔널 체이닝 적용

3. **applyIdeaMapEdgeSettings 함수의 타입 및 로직 개선**
   - `markerEnd` 속성 타입 문제 해결
   - 로깅 최적화 및 정리
   - 엣지 데이터 구조 처리 개선
   - 설정 값 적용 로직 명확화

4. **CustomEdge 컴포넌트 확인 및 필요시 수정**
   - 메모이제이션 의존성 확인
   - 설정 변경 감지 메커니즘 확인
   - 스타일 적용 로직 확인

5. **테스트 및 검증**
   - 설정 변경 후 엣지 스타일 업데이트 확인
   - 로컬과 서버 설정 동기화 확인
   - UI 반영 확인

6. **(필요시) 강제 업데이트 메커니즘 추가**
   - `forceUpdate` 플래그 추가
   - 설정 변경 시 자동 강제 업데이트 로직 구현
