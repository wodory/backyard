/**
 * 파일명: constants.test.ts
 * 목적: 보드 컴포넌트 상수 테스트
 * 역할: 상수 정의가 올바르게 되었는지 검증
 * 작성일: 2025-03-28
 */

import { describe, it, expect } from 'vitest';
import { ConnectionLineType, Position } from '@xyflow/react';
import {
  LAYOUT_DIRECTION,
  NODE_TYPES,
  EDGE_TYPES,
  HANDLE_POSITIONS,
  CONNECTION_LINE_TYPES,
  DEFAULT_NODE_DIMENSIONS,
  AUTO_SAVE_DELAY,
  NODE_SPACING,
  DEFAULT_NEW_CARD,
  ZOOM_SETTINGS,
  TOOLTIP_DELAY
} from '../constants';

describe('보드 컴포넌트 상수', () => {
  it('레이아웃 방향 상수가 정의되어 있어야 함', () => {
    expect(LAYOUT_DIRECTION).toBeDefined();
    expect(LAYOUT_DIRECTION.HORIZONTAL).toBe('LR');
    expect(LAYOUT_DIRECTION.VERTICAL).toBe('TB');
  });

  it('노드 타입 상수가 정의되어 있어야 함', () => {
    expect(NODE_TYPES).toBeDefined();
    expect(NODE_TYPES.CARD).toBe('card');
  });

  it('엣지 타입 상수가 정의되어 있어야 함', () => {
    expect(EDGE_TYPES).toBeDefined();
    expect(EDGE_TYPES.CUSTOM).toBe('custom');
  });

  it('핸들 위치 상수가 올바른 Position 값을 가져야 함', () => {
    expect(HANDLE_POSITIONS).toBeDefined();
    expect(HANDLE_POSITIONS.TOP).toBe(Position.Top);
    expect(HANDLE_POSITIONS.RIGHT).toBe(Position.Right);
    expect(HANDLE_POSITIONS.BOTTOM).toBe(Position.Bottom);
    expect(HANDLE_POSITIONS.LEFT).toBe(Position.Left);
  });

  it('연결선 타입 상수가 올바른 ConnectionLineType 값을 가져야 함', () => {
    expect(CONNECTION_LINE_TYPES).toBeDefined();
    expect(CONNECTION_LINE_TYPES.BEZIER).toBe(ConnectionLineType.Bezier);
    expect(CONNECTION_LINE_TYPES.STEP).toBe(ConnectionLineType.Step);
    expect(CONNECTION_LINE_TYPES.SMOOTHSTEP).toBe(ConnectionLineType.SmoothStep);
    expect(CONNECTION_LINE_TYPES.STRAIGHT).toBe(ConnectionLineType.Straight);
  });

  it('기본 노드 크기 상수가 정의되어 있어야 함', () => {
    expect(DEFAULT_NODE_DIMENSIONS).toBeDefined();
    expect(DEFAULT_NODE_DIMENSIONS.WIDTH).toBe(300);
    expect(DEFAULT_NODE_DIMENSIONS.MIN_HEIGHT).toBe(100);
  });

  it('자동 저장 딜레이 상수가 정의되어 있어야 함', () => {
    expect(AUTO_SAVE_DELAY).toBeDefined();
    expect(AUTO_SAVE_DELAY).toBe(1000);
  });

  it('노드 간격 상수가 정의되어 있어야 함', () => {
    expect(NODE_SPACING).toBeDefined();
    expect(NODE_SPACING.HORIZONTAL).toBe(100);
    expect(NODE_SPACING.VERTICAL).toBe(80);
  });

  it('새 카드 기본 데이터 상수가 정의되어 있어야 함', () => {
    expect(DEFAULT_NEW_CARD).toBeDefined();
    expect(DEFAULT_NEW_CARD.title).toBe('새 카드');
    expect(DEFAULT_NEW_CARD.content).toBe('');
    expect(DEFAULT_NEW_CARD.tags).toEqual([]);
  });

  it('줌 설정 상수가 정의되어 있어야 함', () => {
    expect(ZOOM_SETTINGS).toBeDefined();
    expect(ZOOM_SETTINGS.MIN).toBe(0.5);
    expect(ZOOM_SETTINGS.MAX).toBe(2);
    expect(ZOOM_SETTINGS.STEP).toBe(0.1);
  });

  it('툴팁 지연 상수가 정의되어 있어야 함', () => {
    expect(TOOLTIP_DELAY).toBeDefined();
    expect(TOOLTIP_DELAY).toBe(500);
  });
}); 