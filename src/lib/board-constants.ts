import { ConnectionLineType, MarkerType } from '@xyflow/react';

// 스냅 그리드 옵션
export const SNAP_GRID_OPTIONS = [
  { value: 0, label: '끄기' },
  { value: 10, label: '10px' },
  { value: 15, label: '15px' },
  { value: 20, label: '20px' },
  { value: 25, label: '25px' },
];

// 기본 스냅 그리드 설정
export const DEFAULT_SNAP_GRID = [15, 15];

// 연결선 타입 옵션
export const CONNECTION_TYPE_OPTIONS = [
  { value: ConnectionLineType.Bezier, label: '곡선 (Bezier)' },
  { value: ConnectionLineType.Straight, label: '직선 (Straight)' },
  { value: ConnectionLineType.Step, label: '계단식 (Step)' },
  { value: ConnectionLineType.SmoothStep, label: '부드러운 계단식 (SmoothStep)' },
  { value: ConnectionLineType.SimpleBezier, label: '단순 곡선 (SimpleBezier)' },
];

// 화살표 마커 타입 옵션
export const MARKER_TYPE_OPTIONS = [
  { value: MarkerType.Arrow, label: '화살표 (Arrow)' },
  { value: MarkerType.ArrowClosed, label: '닫힌 화살표 (ArrowClosed)' },
  { value: null, label: '없음 (None)' },
];

// 연결선 두께 옵션
export const STROKE_WIDTH_OPTIONS = [
  { value: 1, label: '얇게 (1px)' },
  { value: 2, label: '보통 (2px)' },
  { value: 3, label: '굵게 (3px)' },
  { value: 4, label: '매우 굵게 (4px)' },
];

// 마커 크기 옵션
export const MARKER_SIZE_OPTIONS = [
  { value: 10, label: '작게 (10px)' },
  { value: 15, label: '보통 (15px)' },
  { value: 20, label: '크게 (20px)' },
  { value: 25, label: '매우 크게 (25px)' },
];

// 연결선 애니메이션 옵션
export const EDGE_ANIMATION_OPTIONS = [
  { value: true, label: '켜기' },
  { value: false, label: '끄기' },
];

// 연결선 색상 옵션
export const EDGE_COLOR_OPTIONS = [
  { value: '#C1C1C1', label: '회색 (기본)', color: '#C1C1C1' },
  { value: '#000000', label: '검정색', color: '#000000' },
  { value: '#FF0072', label: '핑크색', color: '#FF0072' },
  { value: '#3366FF', label: '파란색', color: '#3366FF' },
  { value: '#43A047', label: '녹색', color: '#43A047' },
  { value: '#FFC107', label: '노란색', color: '#FFC107' },
  { value: '#9C27B0', label: '보라색', color: '#9C27B0' },
];

// 스토리지 키
export const STORAGE_KEY = 'backyard-board-layout';
export const EDGES_STORAGE_KEY = 'backyard-board-edges';
export const BOARD_SETTINGS_KEY = 'backyard-board-settings';

// 자동 저장 설정
export const BOARD_CONFIG = {
  // 자동 저장 간격 (분)
  autoSaveInterval: 1,
  // 토스트 메시지 표시 여부
  showAutoSaveNotification: true,
  // 콘솔 로깅 활성화 여부
  enableConsoleLogging: true,
}; 