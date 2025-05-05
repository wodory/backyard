/**
 * 파일명: src/types/settings.ts
 * 목적: 설정 관련 타입 정의
 * 역할: 애플리케이션 전반에서 사용되는 설정 관련 타입을 정의
 * 작성일: 2025-04-21
 * 수정일: 2025-05-05 : API 에러 타입 정의 추가
 */

import { ConnectionLineType, MarkerType } from '@xyflow/react';

/**
 * IdeaMapSettings: 아이디어맵 관련 설정 인터페이스
 */
export interface IdeaMapSettings {
  snapToGrid: boolean;
  snapGrid: [number, number];
  connectionLineType: ConnectionLineType;
  markerEnd: MarkerType | null;
  strokeWidth: number;
  markerSize: number;
  edgeColor: string;
  animated: boolean;
  selectedEdgeColor: string;
}

/**
 * CardSettings: 카드 컴포넌트 관련 설정 인터페이스
 */
export interface CardSettings {
  defaultWidth: number;
  backgroundColor: string;
  borderRadius: number;
  tagBackgroundColor: string;
  fontSizes: {
    default: number;
    title: number;
    content: number;
    tags: number;
  };
}

/**
 * HandleSettings: 핸들 관련 설정 인터페이스
 */
export interface HandleSettings {
  size: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

/**
 * LayoutSettings: 레이아웃 관련 설정 인터페이스
 */
export interface LayoutSettings {
  defaultPadding: number;
  defaultSpacing: {
    horizontal: number;
    vertical: number;
  };
  nodeSize: {
    width: number;
    height: number;
    maxHeight: number;
  };
  graphSettings: {
    nodesep: number;
    ranksep: number;
    edgesep: number;
  };
}

/**
 * GeneralSettings: 일반 설정 인터페이스
 */
export interface GeneralSettings {
  autoSaveIntervalMinutes: number;
}

/**
 * ThemeSettings: 테마 관련 설정 인터페이스
 */
export interface ThemeSettings {
  mode: 'light' | 'dark';
  accentColor: string;
}

/**
 * API 오류 타입 정의
 */
export interface ApiError {
  code: number;
  type: string;
  message: string;
  originalError?: unknown;
}

/**
 * 전체 설정을 나타내는 인터페이스
 */
export interface SettingsData {
  ideamap: IdeaMapSettings;
  card: CardSettings;
  handles: HandleSettings;
  layout: LayoutSettings;
  general: GeneralSettings;
  theme: ThemeSettings;
}

/**
 * DB 설정 모델 인터페이스 (Prisma 모델과 일치)
 */
export interface Settings {
  id: string;
  userId: string;
  settingsData: SettingsData;
  createdAt: Date;
  updatedAt: Date;
} 