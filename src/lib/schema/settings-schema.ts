/**
 * 파일명: src/lib/schema/settings-schema.ts
 * 목적: 설정 스키마 정의 및 타입 추론
 * 역할: Zod 스키마를 사용하여 설정 데이터의 구조를 정의하고 검증
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 빈 객체에서 기본값 생성 문제 수정
 * 수정일: 2025-05-07 : connectionLineTypeEnum에 'bezier' 값 추가
 */

import { z } from 'zod';
import { ConnectionLineType, MarkerType } from '@xyflow/system';

// ConnectionLineType 및 MarkerType 열거형 정의 
const connectionLineTypeEnum = z.enum(['default', 'straight', 'step', 'smoothstep', 'simplebezier', 'bezier']);
const markerTypeEnum = z.enum(['arrow', 'arrowclosed']).nullable();

// ThemeSettings 스키마
export const themeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3498db')
});

// GeneralSettings 스키마
export const generalSettingsSchema = z.object({
  autoSaveIntervalMinutes: z.number().int().positive().default(1)
});

// 핸들 설정 스키마
export const handleSettingsSchema = z.object({
  size: z.number().positive().default(10),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#555555'),
  borderWidth: z.number().nonnegative().default(1)
});

// 카드 폰트 크기 스키마
export const fontSizesSchema = z.object({
  default: z.number().positive().default(16),
  title: z.number().positive().default(16),
  content: z.number().positive().default(14),
  tags: z.number().positive().default(12)
});

// 카드 설정 스키마
export const cardSettingsSchema = z.object({
  defaultWidth: z.number().positive().default(130),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  borderRadius: z.number().nonnegative().default(8),
  tagBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F2F2F2'),
  fontSizes: fontSizesSchema.default({})
});

// 노드 크기 스키마
export const nodeSizeSchema = z.object({
  width: z.number().positive().default(500),
  height: z.number().positive().default(48),
  maxHeight: z.number().positive().default(180)
});

// 레이아웃 간격 스키마
export const spacingSchema = z.object({
  horizontal: z.number().nonnegative().default(30),
  vertical: z.number().nonnegative().default(30)
});

// 그래프 설정 스키마
export const graphSettingsSchema = z.object({
  nodesep: z.number().positive().default(60),
  ranksep: z.number().positive().default(100),
  edgesep: z.number().positive().default(100)
});

// 레이아웃 설정 스키마
export const layoutSettingsSchema = z.object({
  defaultPadding: z.number().nonnegative().default(20),
  defaultSpacing: spacingSchema.default({}),
  nodeSize: nodeSizeSchema.default({}),
  graphSettings: graphSettingsSchema.default({})
});

// 아이디어맵 엣지 설정 스키마
export const edgeSettingsSchema = z.object({
  animated: z.boolean().default(false),
  edgeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C1C1C1'),
  markerEnd: markerTypeEnum.default('arrowclosed' as MarkerType),
  markerSize: z.number().positive().default(20),
  strokeWidth: z.number().positive().default(3),
  selectedEdgeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  connectionLineType: connectionLineTypeEnum.default('bezier' as ConnectionLineType)
});

// 아이디어맵 카드 노드 설정 스키마
export const cardNodeSettingsSchema = z.object({
  handles: handleSettingsSchema.default({}),
  nodeSize: nodeSizeSchema.default({}),
  fontSizes: fontSizesSchema.default({}),
  borderRadius: z.number().nonnegative().default(8),
  defaultWidth: z.number().positive().default(130),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  tagBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F2F2F2')
});

// 아이디어맵 설정 스키마
export const ideaMapSettingsSchema = z.object({
  edge: edgeSettingsSchema.default({}),
  snapGrid: z.tuple([z.number(), z.number()]).default([15, 15]),
  snapToGrid: z.boolean().default(true),
  layout: layoutSettingsSchema.default({}),
  cardNode: cardNodeSettingsSchema.default({})
});

// 전체 설정 스키마
export const fullSettingsSchema = z.object({
  theme: themeSettingsSchema.default({}),
  general: generalSettingsSchema.default({}),
  ideamap: ideaMapSettingsSchema.default({})
});

// Zod 스키마에서 TypeScript 타입 추론
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type HandleSettings = z.infer<typeof handleSettingsSchema>;
export type FontSizes = z.infer<typeof fontSizesSchema>;
export type CardSettings = z.infer<typeof cardSettingsSchema>;
export type NodeSize = z.infer<typeof nodeSizeSchema>;
export type Spacing = z.infer<typeof spacingSchema>;
export type GraphSettings = z.infer<typeof graphSettingsSchema>;
export type LayoutSettings = z.infer<typeof layoutSettingsSchema>;
export type EdgeSettings = z.infer<typeof edgeSettingsSchema>;
export type CardNodeSettings = z.infer<typeof cardNodeSettingsSchema>;
export type IdeaMapSettings = z.infer<typeof ideaMapSettingsSchema>;
export type FullSettings = z.infer<typeof fullSettingsSchema>;

// 설정 섹션 타입
export type SettingSection = 'theme' | 'general' | 'ideamap' | 'full';

// 설정 섹션에 따른 스키마 맵핑
export const settingSectionSchemaMap = {
  theme: themeSettingsSchema,
  general: generalSettingsSchema,
  ideamap: ideaMapSettingsSchema,
  full: fullSettingsSchema
}; 