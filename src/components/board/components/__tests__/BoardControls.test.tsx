/**
 * 파일명: BoardControls.test.tsx
 * 목적: BoardControls 컴포넌트 테스트
 * 역할: BoardControls 컴포넌트의 렌더링 및 기능 테스트
 * 작성일: 2024-05-30
 */

import { render, screen, fireEvent } from '@testing-library/react';
import BoardControls from '../BoardControls';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
import { vi } from 'vitest';

// 외부 컴포넌트들을 목킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    Panel: ({ children, position, className }: any) => (
      <div data-testid={`panel-${position}`} className={className}>
        {children}
      </div>
    )
  };
});

vi.mock('@/components/board/BoardSettingsControl', () => ({
  default: ({ settings, onSettingsChange }: any) => (
    <button 
      data-testid="board-settings-control"
      onClick={() => onSettingsChange({ ...settings, snapToGrid: !settings.snapToGrid })}
    >
      Settings Control
    </button>
  )
}));

vi.mock('@/components/board/LayoutControls', () => ({
  default: ({ onLayoutChange, onAutoLayout, onSaveLayout }: any) => (
    <div data-testid="layout-controls">
      <button data-testid="layout-change-button" onClick={() => onLayoutChange('vertical')}>Change Layout</button>
      <button data-testid="auto-layout-button" onClick={onAutoLayout}>Auto Layout</button>
      <button data-testid="save-layout-button" onClick={onSaveLayout}>Save Layout</button>
    </div>
  )
}));

vi.mock('@/components/cards/CreateCardButton', () => ({
  default: ({ onClose }: any) => (
    <button data-testid="create-card-button" onClick={onClose}>
      Create Card
    </button>
  )
}));

vi.mock('@/components/debug/DevTools', () => ({
  default: () => <div data-testid="dev-tools">DevTools</div>
}));

describe('BoardControls', () => {
  // 기본 props
  const defaultProps = {
    boardSettings: DEFAULT_BOARD_SETTINGS,
    onBoardSettingsChange: vi.fn(),
    onLayoutChange: vi.fn(),
    onAutoLayout: vi.fn(),
    onSaveLayout: vi.fn(),
    onCreateCard: vi.fn(),
    isAuthenticated: false,
    userId: undefined
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('상단 우측 패널이 렌더링되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const topRightPanel = screen.getByTestId('panel-top-right');
    expect(topRightPanel).toBeInTheDocument();
    expect(topRightPanel).toHaveClass('flex flex-col gap-2');
  });

  it('개발 환경에서는 개발 도구(DevTools)가 렌더링되어야 함', () => {
    // NODE_ENV를 'development'로 스텁
    vi.stubEnv('NODE_ENV', 'development');
    
    render(<BoardControls {...defaultProps} />);
    
    const devToolsPanel = screen.getByTestId('panel-bottom-left');
    expect(devToolsPanel).toBeInTheDocument();
    
    const devTools = screen.getByTestId('dev-tools');
    expect(devTools).toBeInTheDocument();
    
    // 스텁 제거
    vi.unstubAllEnvs();
  });

  it('프로덕션 환경에서는 개발 도구(DevTools)가 렌더링되지 않아야 함', () => {
    // NODE_ENV를 'production'으로 스텁
    vi.stubEnv('NODE_ENV', 'production');
    
    render(<BoardControls {...defaultProps} />);
    
    expect(screen.queryByTestId('panel-bottom-left')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools')).not.toBeInTheDocument();
    
    // 스텁 제거
    vi.unstubAllEnvs();
  });

  it('BoardSettingsControl이 렌더링되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const settingsControl = screen.getByTestId('board-settings-control');
    expect(settingsControl).toBeInTheDocument();
  });

  it('LayoutControls가 렌더링되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const layoutControls = screen.getByTestId('layout-controls');
    expect(layoutControls).toBeInTheDocument();
  });

  it('CreateCardButton이 렌더링되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const createCardButton = screen.getByTestId('create-card-button');
    expect(createCardButton).toBeInTheDocument();
  });

  it('BoardSettingsControl 클릭 시 onBoardSettingsChange가 호출되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const settingsControl = screen.getByTestId('board-settings-control');
    fireEvent.click(settingsControl);
    
    expect(defaultProps.onBoardSettingsChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onBoardSettingsChange).toHaveBeenCalledWith(
      { ...DEFAULT_BOARD_SETTINGS, snapToGrid: !DEFAULT_BOARD_SETTINGS.snapToGrid },
      false,
      undefined
    );
  });

  it('레이아웃 변경 버튼 클릭 시 onLayoutChange가 호출되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const layoutChangeButton = screen.getByTestId('layout-change-button');
    fireEvent.click(layoutChangeButton);
    
    expect(defaultProps.onLayoutChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLayoutChange).toHaveBeenCalledWith('vertical');
  });

  it('자동 레이아웃 버튼 클릭 시 onAutoLayout이 호출되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const autoLayoutButton = screen.getByTestId('auto-layout-button');
    fireEvent.click(autoLayoutButton);
    
    expect(defaultProps.onAutoLayout).toHaveBeenCalledTimes(1);
  });

  it('레이아웃 저장 버튼 클릭 시 onSaveLayout이 호출되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const saveLayoutButton = screen.getByTestId('save-layout-button');
    fireEvent.click(saveLayoutButton);
    
    expect(defaultProps.onSaveLayout).toHaveBeenCalledTimes(1);
  });

  it('카드 생성 버튼 클릭 시 onCreateCard가 호출되어야 함', () => {
    render(<BoardControls {...defaultProps} />);
    
    const createCardButton = screen.getByTestId('create-card-button');
    fireEvent.click(createCardButton);
    
    expect(defaultProps.onCreateCard).toHaveBeenCalledTimes(1);
  });

  it('인증된 사용자 정보가 BoardSettingsControl에 전달되어야 함', () => {
    const authenticatedProps = {
      ...defaultProps,
      isAuthenticated: true,
      userId: 'test-user-id'
    };
    
    render(<BoardControls {...authenticatedProps} />);
    
    const settingsControl = screen.getByTestId('board-settings-control');
    fireEvent.click(settingsControl);
    
    expect(defaultProps.onBoardSettingsChange).toHaveBeenCalledWith(
      { ...DEFAULT_BOARD_SETTINGS, snapToGrid: !DEFAULT_BOARD_SETTINGS.snapToGrid },
      true,
      'test-user-id'
    );
  });
}); 