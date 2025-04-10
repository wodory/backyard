/**
 * 파일명: src/types/project.ts
 * 목적: 프로젝트 관련 타입 정의
 * 역할: 프로젝트 데이터 구조 및 관련 인터페이스 정의
 * 작성일: 2024-07-13
 */

/**
 * Project: 프로젝트 데이터 구조
 * 프로젝트는 카드들을 그룹화하는 상위 개념으로 사용됨
 */
export interface Project {
  projectId: string;          // 프로젝트 고유 식별자 (UUID)
  name: string;               // 프로젝트 이름
  ownerId: string;            // 프로젝트 소유자 ID (User 테이블 참조)
  ownerNickname?: string;     // 소유자 닉네임 (표시용, 선택적)
  createdAt: string;          // 생성 일시
  updatedAt: string;          // 마지막 수정 일시
  settings?: Record<string, any>; // 추후 확장성을 위한 프로젝트별 설정 (선택적)
  isDeleted: boolean;         // 삭제 여부 (휴지통 기능 지원)
  deletedAt?: string;         // 삭제 일시 (휴지통 보관 기간 정책 지원, 선택적)
}

/**
 * CreateProjectInput: 프로젝트 생성 시 필요한 입력 데이터
 */
export interface CreateProjectInput {
  name: string;             // 프로젝트 이름 (필수)
  ownerId: string;          // 소유자 ID (필수)
  ownerNickname?: string;   // 소유자 닉네임 (선택적)
  settings?: Record<string, any>; // 초기 설정 (선택적)
}

/**
 * UpdateProjectInput: 프로젝트 업데이트 시 필요한 입력 데이터
 */
export interface UpdateProjectInput {
  name?: string;            // 프로젝트 이름 (선택적 업데이트)
  ownerNickname?: string;   // 소유자 닉네임 (선택적 업데이트)
  settings?: Record<string, any>; // 설정 업데이트 (선택적)
  isDeleted?: boolean;      // 삭제 여부 업데이트 (선택적)
  deletedAt?: string;       // 삭제 일시 업데이트 (선택적)
} 