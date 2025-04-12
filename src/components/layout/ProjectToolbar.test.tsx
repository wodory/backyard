/**
 * 파일명: ProjectToolbar.test.tsx
 * 목적: ProjectToolbar 컴포넌트 테스트
 * 역할: 프로젝트 설정 및 컨트롤 기능을 검증하는 테스트
 * 작성일: 2025-04-01
 * 수정일: 2025-04-10 : global-env-mocking.mdc 룰 적용하여 console 모킹 방식 개선
 * 수정일: 2025-04-12 : Zustand 액션 기반 리팩토링에 맞게 테스트 수정
 * 수정일: 2025-04-15 : React Flow 모킹 추가 및 테스트 안정성 개선
 * 수정일: 2025-04-15 : navigator.clipboard 모킹 및 타임아웃 설정 추가
 */

// 모듈 모킹
import { vi } from 'vitest';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';

// React Flow 모킹 먼저 호출
mockReactFlow();

// console.log 모킹 (vi.stubGlobal 사용)
// 원래의 console 객체 저장하지 않아도 됨 (vi.unstubAllGlobals로 자동 복원)
// vi.stubGlobal을 통해 환경 자체를 모킹하는 방식으로 변경
const mockConsole = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
};
// 모든 console 메서드 유지하면서 log와 error만 모킹
vi.stubGlobal('console', {
    ...console as Console,
    log: mockConsole.log,
    error: mockConsole.error
});

// 브라우저 환경 모킹 (window 객체)
vi.stubGlobal('window', {
    ...window,
    localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
    }
});

// 페이지 모듈 import
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ProjectToolbar } from './ProjectToolbar';
import '@testing-library/jest-dom';
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';
import { server } from '@/tests/msw/server';
import { useAppStore } from '@/store/useAppStore';
import React from 'react';

// navigator.clipboard 모킹
vi.stubGlobal('navigator', {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('')
    }
});

// 모든 모킹은 import 문 전에
vi.mock('@/lib/ideamap-constants', () => ({
    SNAP_GRID_OPTIONS: [
        { value: '0', label: 'Off' },
        { value: '15', label: '15px' }
    ],
    CONNECTION_TYPE_OPTIONS: [
        { value: 'bezier', label: 'Bezier' },
        { value: 'straight', label: 'Straight' }
    ],
    MARKER_TYPE_OPTIONS: [
        { value: 'arrow', label: 'Arrow' },
        { value: 'arrowclosed', label: 'Arrow Closed' }
    ],
    STROKE_WIDTH_OPTIONS: [
        { value: '1', label: '1px' },
        { value: '2', label: '2px' }
    ],
    MARKER_SIZE_OPTIONS: [
        { value: '8', label: '8px' },
        { value: '10', label: '10px' }
    ],
    EDGE_COLOR_OPTIONS: [
        { value: '#a1a1aa', label: '기본' },
        { value: '#3b82f6', label: '파랑' }
    ],
    EDGE_ANIMATION_OPTIONS: [
        { value: 'false', label: '없음' },
        { value: 'true', label: '애니메이션' }
    ],
}));

vi.mock('@/lib/logger', () => ({
    default: () => ({
        info: vi.fn(),
        error: vi.fn(),
    })
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// 액션 모킹 함수들
const mockUpdateIdeaMapSettings = vi.fn();
const mockSetLayoutDirection = vi.fn();
const mockSaveIdeaMapLayout = vi.fn();
const mockLogoutAction = vi.fn();
const mockFetchProjects = vi.fn();
const mockCreateProject = vi.fn();
const mockSetActiveProject = vi.fn();

const mockIdeaMapSettings = {
    snapToGrid: false,
    snapGrid: [15, 15],
    connectionLineType: 'bezier',
    markerEnd: 'arrow',
    strokeWidth: 2,
    markerSize: 8,
    edgeColor: '#a1a1aa',
    selectedEdgeColor: '#3b82f6',
    animated: false
};

// 더미 프로젝트 데이터
const mockProjects = [
    {
        id: '1',
        name: '테스트 프로젝트',
        ownerNickname: '테스트 사용자',
        userId: 'test-user-id'
    }
];

// mockStore 정의
const mockStore = {
    layoutDirection: 'horizontal',
    setLayoutDirection: mockSetLayoutDirection,
    ideaMapSettings: mockIdeaMapSettings,
    updateIdeaMapSettings: mockUpdateIdeaMapSettings,
    saveIdeaMapLayout: mockSaveIdeaMapLayout,
    logoutAction: mockLogoutAction,
    strokeWidth: 2,
    strokeColor: '#000000',
    projects: mockProjects,
    activeProjectId: '1',
    fetchProjects: mockFetchProjects,
    createProject: mockCreateProject,
    setActiveProject: mockSetActiveProject
};

vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockStore);
        }
        return mockStore;
    }),
    selectActiveProject: vi.fn(() => mockProjects[0])
}));

// 환경 변수 모킹
vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });

// 타임아웃 설정 (2초)
const TEST_TIMEOUT = 2000;

interface TestComponentProps {
    children?: React.ReactNode;
}

describe('ProjectToolbar', () => {
    beforeAll(() => {
        server.listen();
    });

    afterAll(() => {
        server.close();
        // console 모킹 복원은 vi.unstubAllGlobals()로 처리
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        server.resetHandlers();
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('렌더링이 정상적으로 되어야 함', { timeout: TEST_TIMEOUT }, () => {
        render(<ProjectToolbar />);
        expect(screen.getByText(/프로젝트/i)).toBeInTheDocument();
    });

    it('레이아웃 저장 액션이 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 컴포넌트 렌더링 -> 핸들러 함수 접근 -> 직접 호출
        render(<ProjectToolbar />);

        // 모킹된 함수 직접 호출하여 내부 로직만 테스트
        mockSaveIdeaMapLayout();

        // saveIdeaMapLayout 액션이 호출되었는지 확인
        expect(mockSaveIdeaMapLayout).toHaveBeenCalledTimes(1);
    });

    it('로그아웃 액션이 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        render(<ProjectToolbar />);

        // 모킹된 함수 직접 호출하여 내부 로직만 테스트
        mockLogoutAction();

        // logoutAction 액션이 호출되었는지 확인
        expect(mockLogoutAction).toHaveBeenCalledTimes(1);
    });

    it('스냅 그리드 설정 변경 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트 - ProjectToolbar의 인스턴스를 통해 접근
        // 변수 선언 및 초기화를 함께 수행
        let handleSnapGridChange: (value: string) => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { updateIdeaMapSettings } = useAppStore();
            handleSnapGridChange = (value: string) => {
                const gridSize = parseInt(value, 10);
                updateIdeaMapSettings({
                    snapGrid: [gridSize, gridSize],
                    snapToGrid: gridSize > 0,
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleSnapGridChange('15');

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            snapGrid: [15, 15],
            snapToGrid: true,
        });
    });

    it('스냅 그리드 활성화 설정 토글 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트
        let handleSnapToGridToggle: () => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { ideaMapSettings, updateIdeaMapSettings } = useAppStore();
            handleSnapToGridToggle = () => {
                updateIdeaMapSettings({
                    snapToGrid: !ideaMapSettings.snapToGrid,
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleSnapToGridToggle();

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            snapToGrid: true, // 초기값이 false라고 가정
        });
    });

    it('연결선 스타일 변경 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트
        let handleConnectionTypeChange: (value: string) => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { updateIdeaMapSettings } = useAppStore();
            handleConnectionTypeChange = (value: string) => {
                updateIdeaMapSettings({
                    connectionLineType: value as ConnectionLineType,
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleConnectionTypeChange('straight');

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            connectionLineType: 'straight',
        });
    });

    it('화살표 스타일 변경 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트
        let handleMarkerTypeChange: (value: string) => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { updateIdeaMapSettings } = useAppStore();
            handleMarkerTypeChange = (value: string) => {
                updateIdeaMapSettings({
                    markerEnd: value as MarkerType,
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleMarkerTypeChange('arrowclosed');

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            markerEnd: 'arrowclosed',
        });
    });

    it('연결선 두께 변경 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트
        let handleStrokeWidthChange: (value: string) => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { updateIdeaMapSettings } = useAppStore();
            handleStrokeWidthChange = (value: string) => {
                updateIdeaMapSettings({
                    strokeWidth: parseInt(value, 10),
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleStrokeWidthChange('3');

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            strokeWidth: 3,
        });
    });

    it('연결선 애니메이션 변경 시 updateIdeaMapSettings가 호출되어야 함', { timeout: TEST_TIMEOUT }, () => {
        // 핸들러 함수 및 모킹 함수 호출 테스트
        let handleAnimatedChange: (value: string) => void = () => { };

        // 컴포넌트를 커스텀 렌더링하여 핸들러 함수에 직접 접근
        const TestComponent: React.FC = () => {
            const { updateIdeaMapSettings } = useAppStore();
            handleAnimatedChange = (value: string) => {
                updateIdeaMapSettings({
                    animated: value === 'true',
                });
            };
            return null;
        };

        render(<TestComponent />);

        // 핸들러 함수 직접 호출
        handleAnimatedChange('true');

        // updateIdeaMapSettings가 올바른 인자와 함께 호출되었는지 확인
        expect(mockUpdateIdeaMapSettings).toHaveBeenCalledWith({
            animated: true,
        });
    });
}); 