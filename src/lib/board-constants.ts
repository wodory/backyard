import { ConnectionLineType, MarkerType } from 'reactflow';

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
}; 