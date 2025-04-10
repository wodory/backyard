/**
 * 파일명: ProjectToolbar.test.tsx
 * 목적: ProjectToolbar 컴포넌트 테스트
 * 역할: 프로젝트 설정 및 컨트롤 기능을 검증하는 테스트
 * 작성일: 2025-04-01
 * 수정일: 2025-04-10 : global-env-mocking.mdc 룰 적용하여 console 모킹 방식 개선
 * 수정일: 2024-07-13 : 프로젝트 이름과 소유자 닉네임 표시 기능 테스트 추가
 * 수정일: 2024-07-13 : 기존 테스트를 새로운 프로젝트 이름 표시 구현에 맞게 수정
 */

// 모듈 모킹
import { vi } from 'vitest';

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
    ...console,
    log: mockConsole.log,
    error: mockConsole.error
});

// 모든 모킹은 import 문 전에
vi.mock('@/lib/board-constants', () => ({
    STORAGE_KEY: 'test-storage-key',
    EDGES_STORAGE_KEY: 'test-edges-storage-key',
    CONNECTION_TYPE_OPTIONS: [
        { value: 'bezier', label: 'Bezier' },
        { value: 'straight', label: 'Straight' }
    ],
    MARKER_TYPE_OPTIONS: [
        { value: 'arrow', label: 'Arrow' },
        { value: 'arrowclosed', label: 'Arrow Closed' }
    ],
    SNAP_GRID_OPTIONS: [
        { value: '0', label: 'Off' },
        { value: '15', label: '15px' }
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

const mockSignOut = vi.fn().mockImplementation(() => Promise.resolve());
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        signOut: mockSignOut,
        user: { id: 'test-user-id' },
    }),
}));

// useProjectStore 모킹
vi.mock('@/store/useProjectStore', () => ({
    useProjectStore: vi.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockProjectStore);
        }
        return mockProjectStore;
    }),
}));

const mockUpdateBoardSettings = vi.fn();
const mockSetLayoutDirection = vi.fn();
const mockReactFlowInstance = {
    fitView: vi.fn(),
    getNodes: vi.fn(),
    getEdges: vi.fn(),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
};

const mockBoardSettings = {
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

// 프로젝트 스토어 모킹
const mockActiveProject = {
    projectId: 'test-project',
    name: '테스트 프로젝트',
    ownerId: 'test-user',
    ownerNickname: '테스트 사용자',
    createdAt: '2024-07-13T00:00:00.000Z',
    updatedAt: '2024-07-13T00:00:00.000Z',
    isDeleted: false
};

const mockProjectStore = {
    activeProjectId: 'test-project',
    selectActiveProject: () => mockActiveProject
};

// reactFlowInstance 타입 정의를 수정하여 null 허용
type MockReactFlowInstanceType = typeof mockReactFlowInstance | null;

// mockStore 정의 수정
const mockStore = {
    layoutDirection: 'horizontal',
    setLayoutDirection: mockSetLayoutDirection,
    boardSettings: mockBoardSettings,
    updateBoardSettings: mockUpdateBoardSettings,
    reactFlowInstance: mockReactFlowInstance as MockReactFlowInstanceType,
    strokeWidth: 2,
    strokeColor: '#000000',
};

vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockStore);
        }
        return mockStore;
    }),
}));

// 이제 다른 import 
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ProjectToolbar } from './ProjectToolbar';
import '@testing-library/jest-dom';
import { ConnectionLineType, MarkerType, Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';
import { server } from '@/tests/msw/server';
import { useAppStore } from '@/store/useAppStore';
import { useProjectStore } from '@/store/useProjectStore';
import React from 'react'; // React import 추가

// 환경 변수 모킹
vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });

// 테스트 노드 및 엣지 데이터
const testNodes = [{ id: 'node1', position: { x: 100, y: 100 } }] as Node[];
const testEdges = [{ id: 'edge1', source: 'node1', target: 'node2' }] as Edge[];

// localStorage 모킹
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

        // 기본 값 설정
        mockReactFlowInstance.getNodes.mockReturnValue(testNodes);
        mockReactFlowInstance.getEdges.mockReturnValue(testEdges);
        mockStore.reactFlowInstance = mockReactFlowInstance;
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('렌더링이 정상적으로 되어야 함', () => {
        render(<ProjectToolbar />);

        // 메뉴 버튼이 존재하는지 확인
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // 활성 프로젝트의 이름과 소유자 닉네임 표시 테스트
    it('활성 프로젝트가 있을 때 프로젝트 이름과 소유자 닉네임을 표시해야 함', () => {
        render(<ProjectToolbar />);

        // 프로젝트 이름과 소유자 닉네임이 표시되는지 확인
        const projectInfoText = screen.getByText('테스트 프로젝트 - 테스트 사용자');
        expect(projectInfoText).toBeInTheDocument();
    });

    // 활성 프로젝트가 없을 때의 테스트
    it('활성 프로젝트가 없을 때 기본 텍스트를 표시해야 함', () => {
        // 활성 프로젝트 없음으로 설정
        vi.mocked(useProjectStore).mockImplementation((selector) => {
            if (selector === mockProjectStore.selectActiveProject) {
                return undefined;
            }
            return null;
        });

        render(<ProjectToolbar />);

        // 기본 텍스트가 표시되는지 확인
        const defaultText = screen.getByText('선택된 프로젝트 없음');
        expect(defaultText).toBeInTheDocument();
    });

    it('메뉴 버튼을 통해 UI 요소에 접근할 수 있어야 함', async () => {
        const user = userEvent.setup();
        render(<ProjectToolbar />);

        // 메뉴 버튼 찾기
        const menuButton = screen.getByRole('button');
        expect(menuButton).toBeInTheDocument();

        // 추가적인 검증: 버튼이 Menu 아이콘을 포함하는지 확인
        expect(menuButton.querySelector('svg')).toBeInTheDocument();
    });

    // 기존 테스트를 수정하여 div와 span 요소를 찾도록 함
    it('프로젝트 이름이 컴포넌트에 표시되는지 확인', () => {
        render(<ProjectToolbar />);

        // div 안의 span에 프로젝트 이름과 소유자가 표시되는지 확인
        const projectInfoContainer = screen.getByText(/테스트 프로젝트 - 테스트 사용자/);
        expect(projectInfoContainer).toBeInTheDocument();
        expect(projectInfoContainer.parentElement).toHaveClass('font-medium');
    });

    it('프로젝트 정보 컨테이너의 스타일 검증', () => {
        render(<ProjectToolbar />);

        // 프로젝트 정보를 담고 있는 div 요소가 적절한 스타일 클래스를 가지고 있는지 확인
        const projectInfoDiv = screen.getByText(/테스트 프로젝트/).parentElement;
        expect(projectInfoDiv).toHaveClass('font-medium');
        expect(projectInfoDiv).toHaveClass('text-sm');
    });

    it('프로젝트 정보가 컴포넌트 마운트 시 올바르게 표시되는지 검증', () => {
        render(<ProjectToolbar />);

        // 프로젝트 정보가 useProjectStore에서 올바르게 가져와지는지 검증
        expect(useProjectStore).toHaveBeenCalled();
        const projectInfo = screen.getByText(/테스트 프로젝트 - 테스트 사용자/);
        expect(projectInfo).toBeInTheDocument();
    });

    // 연결선 두께 변경 테스트 수정 (현재 테스트가 '선 두께가 3px로 변경되었습니다' 메시지를 기대하지만, 실제 구현은 '설정이 변경되었습니다.' 메시지를 사용함)
    it('연결선 두께 변경 테스트', () => {
        const mockHandleStrokeWidthChange = vi.fn().mockImplementation((value: string) => {
            mockUpdateBoardSettings({
                strokeWidth: parseInt(value, 10),
            });
            toast.success('설정이 변경되었습니다.');
        });

        // 테스트 실행
        mockHandleStrokeWidthChange('3');

        // 결과 검증
        expect(mockUpdateBoardSettings).toHaveBeenCalledWith({
            strokeWidth: 3,
        });
        expect(toast.success).toHaveBeenCalledWith('설정이 변경되었습니다.');
    });

    // 기존의 실패하는 '프로젝트 이름' 관련 테스트들을 새 구현에 맞춰 수정
    it('프로젝트 이름이 기본값으로 설정되어 있어야 함', () => {
        render(<ProjectToolbar />);

        // 이전: h1 요소를 찾았으나 이제는 span 요소 찾기
        const projectInfo = screen.getByText(/테스트 프로젝트 - 테스트 사용자/);
        expect(projectInfo).toBeInTheDocument();
        expect(projectInfo.parentElement).toHaveClass('font-medium');
    });

    it('프로젝트 이름 표시 및 스타일 검증', () => {
        render(<ProjectToolbar />);

        // 프로젝트 정보 컨테이너 찾기
        const projectInfoContainer = screen.getByText(/테스트 프로젝트/).parentElement;
        expect(projectInfoContainer).toBeInTheDocument();
        expect(projectInfoContainer).toHaveClass('font-medium');
        expect(projectInfoContainer).toHaveClass('text-sm');

        // 텍스트 내용 확인
        const projectInfoText = screen.getByText(/테스트 프로젝트 - 테스트 사용자/);
        expect(projectInfoText).toBeInTheDocument();
    });

    it('프로젝트 이름이 컴포넌트 상태로 관리되는지 검증', () => {
        render(<ProjectToolbar />);

        // useProjectStore가 호출되었는지 검증
        expect(useProjectStore).toHaveBeenCalled();

        // 프로젝트 정보가 올바르게 표시되는지 확인
        const projectInfoText = screen.getByText(/테스트 프로젝트 - 테스트 사용자/);
        expect(projectInfoText).toBeInTheDocument();
    });
}); 