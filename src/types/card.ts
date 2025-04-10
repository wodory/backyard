/**
 * 파일명: src/types/card.ts
 * 목적: 카드 관련 타입 정의
 * 역할: 카드 데이터 구조 및 관련 인터페이스 정의
 * 작성일: 2024-03-15
 * 수정일: 2024-07-13 : 프로젝트 ID 필드 추가
 */

export interface User {
  id: string;
  name: string | null;
}

export interface Card {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  projectId?: string;        // 프로젝트 ID (카드가 속한 프로젝트)
  cardTags?: Array<{ tag: { id: string; name: string; } }>;
}

export interface CreateCardInput {
  title: string;
  content?: string;
  userId: string;
  projectId?: string;        // 프로젝트 ID (선택적)
  tags?: string[];
}

export interface UpdateCardInput {
  title?: string;
  content?: string;
  projectId?: string;        // 프로젝트 ID 업데이트 (선택적)
} 