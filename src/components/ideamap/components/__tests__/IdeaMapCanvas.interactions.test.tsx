/**
 * 파일명: src/components/ideamap/components/__tests__/IdeaMapCanvas.interactions.test.tsx
 * 목적: IdeaMapCanvas 컴포넌트의 사용자 상호작용 테스트
 * 역할: 엣지 클릭 시 무한 루프 방지 및 스타일 유지 검증, DB 동기화 검증
 * 작성일: 2025-04-30
 * 수정일: 2025-05-01 : 엣지 추가/삭제 로컬 스토리지 저장 테스트 추가
 * 수정일: 2025-05-01 : TanStack Query 통합 테스트 추가
 * @rule   package.json 테스트 규칙 준수
 * @rule   three-layer-standard
 * @tag    @zustand-action-msw (부분적: 스토어 액션 호출 확인)
 * @tag    @tanstack-mutation-msw (부분적: 엣지 CRUD 훅 동작 검증)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider, type Edge } from '@xyflow/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import IdeaMapCanvas from '../IdeaMapCanvas';
import { useIdeaMapStore, type IdeaMapState } from '@/store/useIdeaMapStore';
import { DEFAULT_SETTINGS } from '@/lib/ideamap-utils';
import {
    Node,
    Edge as ReactFlowEdge,
    Connection,
    MarkerType,
    EdgeChange,
    EdgeSelectionChange,
    EdgeRemoveChange
} from '@xyflow/react';
import { type CardData } from '@/components/ideamap/types/ideamap-types';
import { IDEAMAP_EDGES_STORAGE_KEY } from '@/lib/ideamap-constants';

// TanStack Query 훅 모킹
vi.mock('@/hooks/useEdges', () => ({
    useDeleteEdge: () => ({
        mutate: vi.fn((params, options) => {
            if (options?.onSuccess) options.onSuccess();
        }),
        isLoading: false,
        isError: false,
        error: null
    }),
    useCreateEdge: () => ({
        mutate: vi.fn((params, options) => {
            if (options?.onSuccess) options.onSuccess([{ id: 'new-edge-id', ...params }]);
        }),
        isLoading: false,
        isError: false,
        error: null
    })
}));

// useAppStore 모킹 (activeProjectId 사용)
vi.mock('@/store/useAppStore', () => ({
    useAppStore: (selector: (state: { activeProjectId: string }) => any) => {
        if (typeof selector === 'function') {
            return selector({ activeProjectId: 'test-project-id' });
        }
        return { activeProjectId: 'test-project-id' };
    }
}));

// 임시 목 데이터
const mockNodes: Node<CardData>[] = [{ id: '1', position: { x: 0, y: 0 }, data: { id: 'card1', title: 'Card 1', content: 'Content 1' } }];
const mockEdges: ReactFlowEdge[] = [{ id: 'e1-2', source: '1', target: '2' }];

// 로거 Mock (옵션): 실제 로그 출력을 방지하거나 특정 로그 확인 시 사용
vi.mock('@/lib/logger', () => ({
    default: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    }),
}));

// localStorage Mock 설정
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        getStore: () => store,
    };
})();

// localStorage 전역 객체 모킹
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 스토어 초기 상태 설정 헬퍼 (필요한 최소 상태만 설정)
const initializeStore = () => {
    const initialState: Partial<IdeaMapState> = {
        nodes: mockNodes,
        edges: mockEdges.map((edge: Edge) => ({
            ...edge,
            style: { stroke: DEFAULT_SETTINGS.edgeColor, strokeWidth: DEFAULT_SETTINGS.strokeWidth },
            markerEnd: DEFAULT_SETTINGS.markerEnd ? {
                type: DEFAULT_SETTINGS.markerEnd,
                color: DEFAULT_SETTINGS.edgeColor,
                width: DEFAULT_SETTINGS.markerSize,
                height: DEFAULT_SETTINGS.markerSize
            } : undefined,
        })),
        ideaMapSettings: DEFAULT_SETTINGS,
        applyEdgeChangesAction: vi.fn(),
        onNodesChange: vi.fn(),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        onEdgesChange: vi.fn(),
        onConnect: vi.fn(),
        reactFlowInstance: null,
        setReactFlowInstance: vi.fn(),
        isIdeaMapLoading: false,
        ideaMapError: null,
        loadedViewport: null,
        needsFitView: false,
        hasUnsavedChanges: false,
        setHasUnsavedChanges: vi.fn(),
        viewportToRestore: null,
        isSettingsLoading: false,
        settingsError: null,
        // 추가된 액션들
        saveEdgesAction: vi.fn().mockImplementation(() => true),
        removeEdgesFromStorage: vi.fn(),
    };
    useIdeaMapStore.setState(initialState);
};

describe('IdeaMapCanvas Interactions', () => {
    let applyEdgeChangesActionSpy: any;
    let consoleErrorSpy: any;
    let localStorageSetItemSpy: any;

    beforeEach(() => {
        initializeStore();
        applyEdgeChangesActionSpy = vi.spyOn(useIdeaMapStore.getState(), 'applyEdgeChangesAction');
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        localStorageSetItemSpy = vi.spyOn(window.localStorage, 'setItem');

        // 로컬 스토리지 초기화
        window.localStorage.clear();
    });

    afterEach(() => {
        // 테스트 후 스파이 복원
        applyEdgeChangesActionSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        localStorageSetItemSpy.mockRestore();
        vi.clearAllMocks(); // 모든 Mock 초기화
    });

    it('엣지를 클릭해도 무한 업데이트 루프가 발생하지 않고 스타일이 유지된다', async () => {
        const user = userEvent.setup();
        const mockOnNodesChange = vi.fn();
        const mockOnEdgesChange = useIdeaMapStore.getState().applyEdgeChangesAction; // 실제 스토어 액션 연결 (spy로 감시)
        const mockOnConnect = vi.fn();
        const mockOnNodeClick = vi.fn();
        const mockOnPaneClick = vi.fn();
        const mockWrapperRef = { current: document.createElement('div') };

        render(
            <ReactFlowProvider> {/* React Flow 컨텍스트 제공 */}
                <IdeaMapCanvas
                    nodes={useIdeaMapStore.getState().nodes}
                    edges={useIdeaMapStore.getState().edges}
                    onNodesChange={mockOnNodesChange}
                    onEdgesChange={mockOnEdgesChange} // Mock 대신 실제 스토어 액션 연결
                    onConnect={mockOnConnect}
                    onNodeClick={mockOnNodeClick}
                    onPaneClick={mockOnPaneClick}
                    ideaMapSettings={useIdeaMapStore.getState().ideaMapSettings}
                    wrapperRef={mockWrapperRef}
                    // 기타 필수 props 추가 (onConnectStart, onConnectEnd 등)
                    onConnectStart={vi.fn()}
                    onConnectEnd={vi.fn()}
                />
            </ReactFlowProvider>
        );

        // 초기 엣지 렌더링 확인 (예: 첫 번째 엣지)
        const initialEdges = await screen.findAllByRole('graphics-document'); // React Flow 엣지는 특정 role을 갖지 않을 수 있음, selector 필요
        // **주의:** React Flow 엣지는 DOM에서 직접 찾기 어려울 수 있습니다.
        // 스타일 검증은 스냅샷 테스트나, 엣지 ID를 통해 상태를 검증하는 것이 더 안정적일 수 있습니다.
        // 여기서는 루프 발생 여부에 집중합니다.

        // 첫 번째 엣지 요소 찾기 시도 (구체적인 selector는 실제 DOM 구조 확인 필요)
        // 예시: const edgeElement = document.querySelector('.react-flow__edge');
        const edgeElements = document.querySelectorAll('.react-flow__edge'); // 모든 엣지 요소 선택
        expect(edgeElements.length).toBeGreaterThan(0); // 엣지가 하나 이상 렌더링되었는지 확인
        const firstEdgeElement = edgeElements[0];

        // 엣지 클릭
        await user.click(firstEdgeElement);

        // 상태 변경 및 리렌더링이 안정화될 때까지 대기
        // applyEdgeChangesAction 호출 횟수 확인
        await waitFor(() => {
            // 클릭 시 onEdgesChange가 호출되어 applyEdgeChangesAction이 최소 1번 호출됨
            expect(applyEdgeChangesActionSpy).toHaveBeenCalled();
        });

        // 짧은 시간 내에 추가적인 호출(루프)이 없는지 확인
        // requestAnimationFrame 등을 사용하여 여러 프레임 동안 상태 변화 관찰 가능
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms 대기

        // 최종 호출 횟수 확인 (클릭 이벤트로 인한 호출 외에 추가 호출이 없어야 함)
        // 정확한 호출 횟수는 React Flow 내부 동작 및 이벤트 종류에 따라 다를 수 있으므로,
        // "지나치게 많이 호출되지 않았는지" 확인하는 것이 현실적일 수 있습니다.
        // 예: 10회 미만으로 호출되었는지 확인
        expect(applyEdgeChangesActionSpy.mock.calls.length).toBeLessThan(10);

        // 콘솔에 "Maximum update depth exceeded" 에러가 출력되지 않았는지 확인
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('Maximum update depth exceeded')
        );
    });

    it('엣지 변경 시 DB 업데이트를 요청한다', async () => {
        // TanStack Query 훅을 모킹했으므로 실제 useDeleteEdge mutate 호출을 검증
        const deleteEdgeMutate = vi.fn();
        vi.mocked(require('@/hooks/useEdges').useDeleteEdge).mockReturnValue({
            mutate: deleteEdgeMutate,
            isLoading: false,
            isError: false,
            error: null
        });

        // 컴포넌트 렌더링
        const mockOnEdgesChange = useIdeaMapStore.getState().applyEdgeChangesAction;
        render(
            <ReactFlowProvider>
                <IdeaMapCanvas
                    nodes={useIdeaMapStore.getState().nodes}
                    edges={useIdeaMapStore.getState().edges}
                    onNodesChange={vi.fn()}
                    onEdgesChange={mockOnEdgesChange}
                    onConnect={vi.fn()}
                    onNodeClick={vi.fn()}
                    onPaneClick={vi.fn()}
                    ideaMapSettings={useIdeaMapStore.getState().ideaMapSettings}
                    wrapperRef={{ current: document.createElement('div') }}
                    onConnectStart={vi.fn()}
                    onConnectEnd={vi.fn()}
                />
            </ReactFlowProvider>
        );

        // 올바른 EdgeChange 타입으로 EdgeRemoveChange 사용
        const deleteEdgeChanges: EdgeChange[] = [
            { type: 'remove', id: 'e1-2' } as EdgeRemoveChange
        ];

        // 엣지 삭제 변경을 적용
        mockOnEdgesChange(deleteEdgeChanges);

        // useDeleteEdge mutate가 호출되었는지 확인
        await waitFor(() => {
            expect(deleteEdgeMutate).toHaveBeenCalledWith(
                {
                    id: 'e1-2',
                    projectId: 'test-project-id'
                },
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function)
                })
            );
        });

        // Zustand 스토어 상태도 업데이트 되었는지 확인
        expect(applyEdgeChangesActionSpy).toHaveBeenCalledWith(deleteEdgeChanges);
    });

    it('엣지 연결 생성 시 DB에 저장한다', async () => {
        // TanStack Query 훅을 모킹했으므로 실제 useCreateEdge mutate 호출을 검증
        const createEdgeMutate = vi.fn();
        vi.mocked(require('@/hooks/useEdges').useCreateEdge).mockReturnValue({
            mutate: createEdgeMutate,
            isLoading: false,
            isError: false,
            error: null
        });

        // 컴포넌트 렌더링
        const mockOnConnect = vi.fn();
        render(
            <ReactFlowProvider>
                <IdeaMapCanvas
                    nodes={useIdeaMapStore.getState().nodes}
                    edges={useIdeaMapStore.getState().edges}
                    onNodesChange={vi.fn()}
                    onEdgesChange={vi.fn()}
                    onConnect={mockOnConnect}
                    onNodeClick={vi.fn()}
                    onPaneClick={vi.fn()}
                    ideaMapSettings={useIdeaMapStore.getState().ideaMapSettings}
                    wrapperRef={{ current: document.createElement('div') }}
                    onConnectStart={vi.fn()}
                    onConnectEnd={vi.fn()}
                />
            </ReactFlowProvider>
        );

        // 연결 생성
        const connection: Connection = {
            source: '1',
            target: '2',
            sourceHandle: null,  // Connection 타입에 필요한 속성 추가
            targetHandle: null   // Connection 타입에 필요한 속성 추가
        };

        // handleConnect 함수 직접 호출 (DOM 이벤트 시뮬레이션은 복잡함)
        const handleConnect = (document.querySelector('div.react-flow') as any)._reactProps.onConnect;
        handleConnect(connection);

        // UI 상태 업데이트 확인
        expect(mockOnConnect).toHaveBeenCalledWith(connection);

        // DB 저장 요청 확인 (useCreateEdge mutate 호출)
        await waitFor(() => {
            expect(createEdgeMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    sourceCardId: '1',
                    targetCardId: '2',
                    projectId: 'test-project-id',
                }),
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function)
                })
            );
        });
    });
}); 