/**
 * 파일명: useBoardHandlers.test.tsx
 * 목적: useBoardHandlers 훅을 테스트
 * 역할: 보드 이벤트 핸들러 관련 로직 테스트
 * 작성일: 2024-05-11
 */

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { useBoardHandlers } from './useBoardHandlers';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';

// Zustand 상태 관리 모킹
const mockSelectCards = vi.fn();
const mockSetModalOpen = vi.fn();
const mockSetSelectedNode = vi.fn();

const mockState = {
  selectedCardIds: ['node1', 'node2'],
  selectCards: mockSelectCards,
  isModalOpen: false,
  setModalOpen: mockSetModalOpen,
  setSelectedNode: mockSetSelectedNode,
};

const mockStore = {
  getState: () => mockState,
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('@/store/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    }),
    mockStore
  ),
}));

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useBoardHandlers', () => {
  // 테스트를 위한 모의 함수 및 데이터 준비
  const saveLayout = vi.fn().mockReturnValue(true);
  const setNodes = vi.fn();
  const fetchCards = vi.fn().mockResolvedValue({ nodes: [], edges: [] });
  
  const mockNodes = [
    { id: 'node1', position: { x: 0, y: 0 }, data: { title: '카드 1', content: '내용 1' } },
    { id: 'node2', position: { x: 100, y: 100 }, data: { title: '카드 2', content: '내용 2' } },
  ];
  
  const reactFlowWrapper = {
    current: {
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
      }),
      offsetWidth: 1000,
      offsetHeight: 800,
    },
  } as unknown as React.RefObject<HTMLDivElement>;
  
  const reactFlowInstance = {
    screenToFlowPosition: vi.fn().mockImplementation((pos) => pos),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectCards.mockClear();
    mockSetModalOpen.mockClear();
    mockSetSelectedNode.mockClear();
  });
  
  it('handleSelectionChange가 전역 상태를 올바르게 업데이트해야 함', () => {
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    const selectedNodes = [
      { id: 'node3', type: 'card' },
      { id: 'node4', type: 'card' },
    ];
    
    act(() => {
      result.current.handleSelectionChange({
        nodes: selectedNodes as any,
        edges: [] as any,
      });
    });
    
    expect(mockSelectCards).toHaveBeenCalledWith(['node3', 'node4']);
    expect(mockSetSelectedNode).toHaveBeenCalledWith(null);
    expect(mockSetModalOpen).toHaveBeenCalledWith(false);
    expect(toast.info).toHaveBeenCalledWith(
      '2개 카드가 선택되었습니다.',
      expect.objectContaining({ duration: 2000 })
    );
  });
  
  it('handleSelectionChange가 선택된 노드가 없을 때 상태를 초기화해야 함', () => {
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    act(() => {
      result.current.handleSelectionChange({
        nodes: [],
        edges: [] as any,
      });
    });
    
    expect(mockSelectCards).toHaveBeenCalledWith([]);
    expect(toast.info).not.toHaveBeenCalled();
  });
  
  it('onDragOver가 기본 이벤트를 방지하고 dropEffect를 설정해야 함', () => {
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    // 드래그 오버 이벤트 객체 생성
    const event = {
      preventDefault: vi.fn(),
      dataTransfer: {
        dropEffect: '',
      },
    } as unknown as React.DragEvent;
    
    // 핸들러 호출
    act(() => {
      result.current.onDragOver(event);
    });
    
    // 기본 이벤트가 방지되었는지 확인
    expect(event.preventDefault).toHaveBeenCalled();
    // dropEffect가 'move'로 설정되었는지 확인
    expect(event.dataTransfer.dropEffect).toBe('move');
  });
  
  it('onDrop이 새 노드를 생성하고 레이아웃을 저장해야 함', () => {
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    // 드롭 이벤트 객체 생성
    const event = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        getData: vi.fn().mockReturnValue(JSON.stringify({ 
          id: 'new-node', 
          data: { title: '새 카드', content: '새 내용' } 
        })),
      },
    } as unknown as React.DragEvent;
    
    // 핸들러 호출
    act(() => {
      result.current.onDrop(event);
    });
    
    // 기본 이벤트가 방지되었는지 확인
    expect(event.preventDefault).toHaveBeenCalled();
    // 노드 추가가 호출되었는지 확인
    expect(setNodes).toHaveBeenCalled();
    // 레이아웃 저장이 호출되었는지 확인
    expect(saveLayout).toHaveBeenCalled();
    // 성공 메시지가 표시되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 캔버스에 추가되었습니다.');
  });
  
  it('handleCardCreated가 새 카드를 추가하고 레이아웃을 저장해야 함', () => {
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    // 카드 생성 데이터
    const cardData = {
      id: 'new-card',
      title: '새 카드',
      content: '새 내용',
    };
    
    // 핸들러 호출
    act(() => {
      result.current.handleCardCreated(cardData);
    });
    
    // 노드 추가가 호출되었는지 확인
    expect(setNodes).toHaveBeenCalled();
    // 레이아웃 저장이 호출되었는지 확인
    expect(saveLayout).toHaveBeenCalled();
    // 성공 메시지가 표시되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('새 카드가 생성되었습니다.');
  });
  
  it('handleEdgeDropCardCreated가 새 카드를 추가하고 데이터를 다시 불러와야 함', () => {
    // 실제 타이머 대신 가상 타이머 사용
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useBoardHandlers({
      saveLayout,
      nodes: mockNodes as any,
      setNodes,
      reactFlowWrapper,
      reactFlowInstance,
      fetchCards,
    }));
    
    // 카드 생성 데이터
    const cardData = {
      id: 'edge-drop-card',
      title: '엣지 드롭 카드',
      content: '엣지 드롭 내용',
    };
    
    // 위치 및 연결 정보
    const position = { x: 200, y: 200 };
    const connectingNodeId = 'node1';
    const handleType = 'source' as const;
    
    // 핸들러 호출
    act(() => {
      result.current.handleEdgeDropCardCreated(cardData, position, connectingNodeId, handleType);
      // 타이머 진행
      vi.advanceTimersByTime(500);
    });
    
    // 노드 추가가 호출되었는지 확인
    expect(setNodes).toHaveBeenCalled();
    // 레이아웃 저장이 호출되었는지 확인
    expect(saveLayout).toHaveBeenCalled();
    // 성공 메시지가 표시되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('새 카드가 생성되었습니다.');
    // 데이터 다시 불러오기가 호출되었는지 확인
    expect(fetchCards).toHaveBeenCalled();
    
    // 가상 타이머 종료
    vi.useRealTimers();
  });
}); 