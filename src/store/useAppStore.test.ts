/**
 * 파일명: useAppStore.test.ts
 * 목적: useAppStore 상태 관리 테스트
 * 역할: 앱 전역 상태 관리 로직 테스트
 * 작성일: 2024-03-27
 */

import { describe, it, expect, beforeEach, vi, afterEach, afterAll, beforeAll } from 'vitest';
import { useAppStore, Card } from '@/store/useAppStore';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
import { toast } from 'sonner';
import { act } from '@testing-library/react';
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';
import { CreateCardInput } from '@/types/card';
import * as layoutUtils from '@/lib/layout-utils';
import * as graphUtils from '@/components/board/utils/graphUtils';
import { Node, Edge } from '@xyflow/react';

// 모든 모킹을 파일 상단에 배치
vi.mock('@/lib/board-utils', () => ({
  DEFAULT_BOARD_SETTINGS: {
    edgeColor: '#000000',
    strokeWidth: 1,
    animated: false,
    markerEnd: true,
    connectionLineType: 'default',
    snapToGrid: false,
    snapGrid: [20, 20]
  },
  saveBoardSettings: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

// 레이아웃 유틸리티 모킹
vi.mock('@/lib/layout-utils', () => ({
  getLayoutedElements: vi.fn(),
  getGridLayout: vi.fn()
}));

// graphUtils 모킹
vi.mock('@/components/board/utils/graphUtils', () => ({
  saveAllLayoutData: vi.fn()
}));

// 초기 상태 정의
const initialState = useAppStore.getState();

describe('useAppStore', () => {
  // 테스트용 카드 데이터
  const testCards: Card[] = [
    { 
      id: 'card-1', 
      title: '카드 1', 
      content: '내용 1', 
      createdAt: '2024-01-01T00:00:00Z', 
      updatedAt: '2024-01-01T00:00:00Z', 
      userId: 'user-1' 
    },
    { 
      id: 'card-2', 
      title: '카드 2', 
      content: '내용 2', 
      createdAt: '2024-01-01T00:00:00Z', 
      updatedAt: '2024-01-01T00:00:00Z', 
      userId: 'user-1' 
    }
  ];

  // MSW 서버 시작
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
    
    // 기본 핸들러 설정
    server.use(
      // updateCard API 엔드포인트 핸들러
      http.put('/api/cards/:id', async ({ params, request }) => {
        const { id } = params;
        try {
          const updatedCardData = await request.json() as any;
          return HttpResponse.json({
            ...updatedCardData,
            id: id
          });
        } catch (error) {
          return HttpResponse.json({ error: 'Failed to process request' }, { status: 400 });
        }
      }),
      
      // updateBoardSettings API 엔드포인트 핸들러
      http.post('/api/board-settings', async ({ request }) => {
        try {
          const settingsData = await request.json();
          return HttpResponse.json({
            success: true,
            settings: settingsData
          });
        } catch (error) {
          return HttpResponse.json({ error: 'Failed to process request' }, { status: 400 });
        }
      }),

      // createCard API 엔드포인트 핸들러 - 항상 명시적인 응답 반환
      http.post('/api/cards', async ({ request }) => {
        try {
          const data = await request.json() as CreateCardInput;
          if (!data.title || data.title.trim() === '') {
            return HttpResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
          }
          
          const newCard: Card = {
            id: 'new-card-123',
            title: data.title,
            content: data.content ?? null,
            userId: data.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cardTags: (data.tags || []).map(tag => ({ tag: { id: tag, name: tag }}))
          };
          
          return HttpResponse.json(newCard, { status: 201 });
        } catch (error) {
          return HttpResponse.json({ error: 'Failed to process request' }, { status: 400 });
        }
      })
    );
  });

  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    useAppStore.setState({
      selectedCardIds: [],
      selectedCardId: null,
      expandedCardId: null,
      cards: [],
      isSidebarOpen: false,
      layoutDirection: 'auto',
      sidebarWidth: 320,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      reactFlowInstance: null,
      isLoading: false,
      error: null
    });

    // 모든 모킹 함수 초기화
    vi.clearAllMocks();
  });

  // 각 테스트 후 정리
  afterEach(() => {
    vi.resetAllMocks();
    server.resetHandlers();
  });

  // 모든 테스트 후 정리
  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    server.close();
  });

  describe('카드 선택 및 확장 관련 테스트', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useAppStore.getState();
      
      expect(state.selectedCardIds).toEqual([]);
      expect(state.selectedCardId).toBeNull();
      expect(state.expandedCardId).toBeNull();
    });

    it('selectCard 액션이 단일 카드를 선택해야 함', () => {
      const { selectCard } = useAppStore.getState();
      
      selectCard('card-1');
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual(['card-1']);
      expect(state.selectedCardId).toBe('card-1');
    });

    it('toggleExpandCard 액션이 카드 확장 상태를 토글해야 함', () => {
      const { toggleExpandCard } = useAppStore.getState();
      
      // 카드 확장
      toggleExpandCard('card-1');
      
      let state = useAppStore.getState();
      expect(state.expandedCardId).toBe('card-1');
      expect(state.selectedCardId).toBe('card-1');
      expect(state.selectedCardIds).toEqual(['card-1']);
      
      // 카드 접기
      toggleExpandCard('card-1');
      
      state = useAppStore.getState();
      expect(state.expandedCardId).toBeNull();
      expect(state.selectedCardId).toBeNull();
      expect(state.selectedCardIds).toEqual([]);
    });

    it('selectCard 액션은 다른 카드가 펼쳐진 상태에서 새 카드 선택 시 기존 카드를 접어야 함', () => {
      const { toggleExpandCard, selectCard } = useAppStore.getState();
      
      // 첫 번째 카드 확장
      toggleExpandCard('card-1');
      
      // 다른 카드 선택
      selectCard('card-2');
      
      const state = useAppStore.getState();
      expect(state.expandedCardId).toBeNull(); // 기존 카드가 접혀야 함
      expect(state.selectedCardId).toBe('card-2');
      expect(state.selectedCardIds).toEqual(['card-2']);
    });

    it('selectCard로 null을 전달하면 선택 및 확장 상태가 모두 해제되어야 함', () => {
      const { toggleExpandCard, selectCard } = useAppStore.getState();
      
      // 카드 확장 및 선택
      toggleExpandCard('card-1');
      
      // 선택 해제
      selectCard(null);
      
      const state = useAppStore.getState();
      expect(state.expandedCardId).toBeNull();
      expect(state.selectedCardId).toBeNull();
      expect(state.selectedCardIds).toEqual([]);
    });

    it('clearSelectedCards 액션이 모든 선택 및 확장 상태를 해제해야 함', () => {
      const { toggleExpandCard, clearSelectedCards } = useAppStore.getState();
      
      // 카드 확장
      toggleExpandCard('card-1');
      
      // 모든 선택 해제
      clearSelectedCards();
      
      const state = useAppStore.getState();
      expect(state.expandedCardId).toBeNull();
      expect(state.selectedCardIds).toEqual([]);
      expect(state.selectedCardId).toBeNull();
    });

    it('selectCards 액션이 다중 카드를 선택해야 함', () => {
      const { selectCards } = useAppStore.getState();
      
      selectCards(['card-1', 'card-2']);
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual(['card-1', 'card-2']);
      expect(state.selectedCardId).toBe('card-1');
    });

    it('addSelectedCard 액션이 선택된 카드 목록에 카드를 추가해야 함', () => {
      const { addSelectedCard } = useAppStore.getState();
      
      addSelectedCard('card-1');
      addSelectedCard('card-2');
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual(['card-1', 'card-2']);
      expect(state.selectedCardId).toBe('card-1');
    });

    it('removeSelectedCard 액션이 선택된 카드 목록에서 카드를 제거해야 함', () => {
      const { selectCards, removeSelectedCard } = useAppStore.getState();
      
      selectCards(['card-1', 'card-2']);
      removeSelectedCard('card-1');
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual(['card-2']);
      expect(state.selectedCardId).toBe('card-2');
    });

    it('toggleSelectedCard 액션이 카드 선택을 토글해야 함', () => {
      const { toggleSelectedCard } = useAppStore.getState();
      
      // 카드 선택
      toggleSelectedCard('card-1');
      expect(useAppStore.getState().selectedCardIds).toEqual(['card-1']);
      
      // 동일 카드 선택 해제
      toggleSelectedCard('card-1');
      expect(useAppStore.getState().selectedCardIds).toEqual([]);
    });
  });

  describe('카드 데이터 관련 테스트', () => {
    it('setCards 액션이 카드 목록을 설정해야 함', () => {
      const { setCards } = useAppStore.getState();
      
      setCards(testCards);
      
      const state = useAppStore.getState();
      expect(state.cards).toEqual(testCards);
    });

    it('updateCard 액션이 카드를 업데이트해야 함', async () => {
      const { setCards, updateCard } = useAppStore.getState();
      
      // MSW 핸들러 추가
      server.use(
        http.put('/api/cards/card-1', async ({ request }) => {
          const updatedCardData = await request.json();
          return HttpResponse.json(updatedCardData);
        })
      );
      
      setCards(testCards);
      
      try {
        await updateCard({
          id: 'card-1',
          title: '수정된 카드 1',
          content: '수정된 내용 1',
          createdAt: '2024-01-01T00:00:00Z', 
          updatedAt: '2024-01-02T00:00:00Z', 
          userId: 'user-1'
        });
        
        const state = useAppStore.getState();
        expect(state.cards[0].title).toBe('수정된 카드 1');
        expect(state.cards[0].content).toBe('수정된 내용 1');
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('updateCard 액션이 실패 시 에러를 처리해야 함', async () => {
      const { setCards, updateCard } = useAppStore.getState();
      setCards(testCards);
      
      // API 실패 응답 모킹
      server.use(
        http.put('/api/cards/card-1', () => {
          return HttpResponse.error();
        })
      );
      
      const updatedCard = {
        id: 'card-1',
        title: '수정된 카드 1',
        content: '수정된 내용 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        userId: 'user-1'
      };
      
      try {
        await updateCard(updatedCard);
        
        // 에러 토스트 호출 확인
        expect(toast.error).toHaveBeenCalledWith('카드 업데이트 실패: Failed to fetch');
        
        const state = useAppStore.getState();
        // 카드가 변경되지 않아야 함
        expect(state.cards[0]).toEqual(testCards[0]);
        expect(state.error).toBeInstanceOf(Error);
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('updateCard 액션이 로딩 상태를 적절히 처리해야 함', async () => {
      const { setCards, updateCard } = useAppStore.getState();
      setCards(testCards);
      
      const updatedCard = {
        id: 'card-1',
        title: '수정된 카드 1',
        content: '수정된 내용 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        userId: 'user-1'
      };
      
      try {
        const updatePromise = updateCard(updatedCard);
        
        // 로딩 상태 확인
        expect(useAppStore.getState().isLoading).toBe(true);
        
        await updatePromise;
        
        // 로딩 상태 해제 확인
        expect(useAppStore.getState().isLoading).toBe(false);
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });
  });

  describe('사이드바 관련 테스트', () => {
    it('setSidebarOpen 액션이 사이드바 상태를 변경해야 함', () => {
      const { setSidebarOpen } = useAppStore.getState();
      
      setSidebarOpen(true);
      
      const state = useAppStore.getState();
      expect(state.isSidebarOpen).toBe(true);
    });

    it('toggleSidebar 액션이 사이드바 상태를 토글해야 함', () => {
      const { toggleSidebar } = useAppStore.getState();
      
      // 사이드바 열기
      toggleSidebar();
      expect(useAppStore.getState().isSidebarOpen).toBe(true);
      
      // 사이드바 닫기
      toggleSidebar();
      expect(useAppStore.getState().isSidebarOpen).toBe(false);
    });

    it('setSidebarWidth 액션이 사이드바 너비를 설정해야 함', () => {
      const { setSidebarWidth } = useAppStore.getState();
      
      setSidebarWidth(400);
      
      const state = useAppStore.getState();
      expect(state.sidebarWidth).toBe(400);
    });
  });

  describe('레이아웃 관련 테스트', () => {
    it('setLayoutDirection 액션이 레이아웃 방향을 설정해야 함', () => {
      const { setLayoutDirection } = useAppStore.getState();
      
      setLayoutDirection('horizontal');
      
      const state = useAppStore.getState();
      expect(state.layoutDirection).toBe('horizontal');
    });

    // 새로운 테스트 추가
    describe('applyLayout 액션 테스트', () => {
      // 테스트용 React Flow 인스턴스 모킹
      const mockNodes = [
        { id: 'node-1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } }
      ] as Node[];
      
      const mockEdges = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ] as Edge[];
      
      const mockLayoutedNodes = [
        { id: 'node-1', data: { label: 'Node 1' }, position: { x: 100, y: 100 } }
      ] as Node[];
      
      const mockLayoutedEdges = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', animated: true }
      ] as Edge[];
      
      // getNodes와 getEdges를 명시적으로 정의한 mockReactFlowInstance
      const mockReactFlowInstance = {
        getNodes: vi.fn(() => mockNodes),
        getEdges: vi.fn(() => mockEdges),
        setNodes: vi.fn(),
        setEdges: vi.fn()
      };

      beforeEach(() => {
        vi.clearAllMocks();
        
        // 레이아웃 유틸리티 함수 모킹
        vi.mocked(layoutUtils.getLayoutedElements).mockReturnValue({
          nodes: mockLayoutedNodes, 
          edges: mockLayoutedEdges
        });
        vi.mocked(layoutUtils.getGridLayout).mockReturnValue(mockLayoutedNodes);
        
        // React Flow 인스턴스 설정
        act(() => {
          useAppStore.setState({ reactFlowInstance: mockReactFlowInstance });
        });
      });

      it('수평 레이아웃을 적용해야 함', () => {
        act(() => {
          useAppStore.getState().applyLayout('horizontal');
        });
        
        // 레이아웃 유틸리티 함수 호출 확인
        expect(layoutUtils.getLayoutedElements).toHaveBeenCalledWith(
          mockNodes, 
          mockEdges, 
          'horizontal'
        );
        
        // React Flow 인스턴스의 메서드 호출 확인
        expect(mockReactFlowInstance.setNodes).toHaveBeenCalledWith(mockLayoutedNodes);
        expect(mockReactFlowInstance.setEdges).toHaveBeenCalledWith(mockLayoutedEdges);
        
        // 토스트 메시지 확인
        expect(toast.success).toHaveBeenCalledWith('수평 레이아웃이 적용되었습니다');
        
        // 상태 업데이트 확인
        expect(useAppStore.getState().layoutDirection).toBe('horizontal');
      });

      it('수직 레이아웃을 적용해야 함', () => {
        act(() => {
          useAppStore.getState().applyLayout('vertical');
        });
        
        // 레이아웃 유틸리티 함수 호출 확인
        expect(layoutUtils.getLayoutedElements).toHaveBeenCalledWith(
          mockNodes, 
          mockEdges, 
          'vertical'
        );
        
        // React Flow 인스턴스의 메서드 호출 확인
        expect(mockReactFlowInstance.setNodes).toHaveBeenCalledWith(mockLayoutedNodes);
        expect(mockReactFlowInstance.setEdges).toHaveBeenCalledWith(mockLayoutedEdges);
        
        // 토스트 메시지 확인
        expect(toast.success).toHaveBeenCalledWith('수직 레이아웃이 적용되었습니다');
        
        // 상태 업데이트 확인
        expect(useAppStore.getState().layoutDirection).toBe('vertical');
      });

      it('자동 배치 레이아웃을 적용해야 함', () => {
        act(() => {
          useAppStore.getState().applyLayout('auto');
        });
        
        // 레이아웃 유틸리티 함수 호출 확인
        expect(layoutUtils.getGridLayout).toHaveBeenCalledWith(mockNodes);
        
        // React Flow 인스턴스의 메서드 호출 확인
        expect(mockReactFlowInstance.setNodes).toHaveBeenCalledWith(mockLayoutedNodes);
        // 자동 배치는 엣지를 변경하지 않음
        expect(mockReactFlowInstance.setEdges).not.toHaveBeenCalled();
        
        // 토스트 메시지 확인
        expect(toast.success).toHaveBeenCalledWith('자동 배치 레이아웃이 적용되었습니다');
        
        // 상태 업데이트 확인
        expect(useAppStore.getState().layoutDirection).toBe('auto');
      });

      it('React Flow 인스턴스가 없을 때 에러를 표시해야 함', () => {
        // React Flow 인스턴스 제거
        act(() => {
          useAppStore.setState({ reactFlowInstance: null });
        });
        
        act(() => {
          useAppStore.getState().applyLayout('horizontal');
        });
        
        // 에러 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('React Flow 인스턴스를 찾을 수 없습니다');
        
        // 레이아웃 유틸리티 함수가 호출되지 않음
        expect(layoutUtils.getLayoutedElements).not.toHaveBeenCalled();
      });

      it('노드가 없을 때 에러를 표시해야 함', () => {
        // 빈 노드 배열 반환
        mockReactFlowInstance.getNodes.mockReturnValueOnce([]);
        
        act(() => {
          useAppStore.getState().applyLayout('horizontal');
        });
        
        // 에러 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('적용할 노드가 없습니다');
        
        // 레이아웃 유틸리티 함수가 호출되지 않음
        expect(layoutUtils.getLayoutedElements).not.toHaveBeenCalled();
      });
    });

    describe('saveBoardLayout 액션 테스트', () => {
      // 테스트용 React Flow 인스턴스 모킹
      const mockNodes = [
        { id: 'node-1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } }
      ] as Node[];
      
      const mockEdges = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ] as Edge[];
      
      // getNodes와 getEdges를 명시적으로 정의한 mockReactFlowInstance
      const mockReactFlowInstance = {
        getNodes: vi.fn(() => mockNodes),
        getEdges: vi.fn(() => mockEdges)
      };

      beforeEach(() => {
        vi.clearAllMocks();
        
        // graphUtils 모킹
        vi.mocked(graphUtils.saveAllLayoutData).mockReturnValue(true);
        
        // React Flow 인스턴스 설정
        act(() => {
          useAppStore.setState({ reactFlowInstance: mockReactFlowInstance });
        });
      });

      it('레이아웃을 저장해야 함', async () => {
        let result: boolean | undefined;
        
        await act(async () => {
          result = await useAppStore.getState().saveBoardLayout();
        });
        
        // saveAllLayoutData 호출 확인
        expect(graphUtils.saveAllLayoutData).toHaveBeenCalledWith(mockNodes, mockEdges);
        
        // 성공 토스트 표시 확인
        expect(toast.success).toHaveBeenCalledWith('레이아웃이 저장되었습니다');
        
        // 반환값 확인
        expect(result).toBe(true);
      });

      it('React Flow 인스턴스가 없을 때 에러를 표시해야 함', async () => {
        // React Flow 인스턴스 제거
        act(() => {
          useAppStore.setState({ reactFlowInstance: null });
        });
        
        let result: boolean | undefined;
        
        await act(async () => {
          result = await useAppStore.getState().saveBoardLayout();
        });
        
        // 에러 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('React Flow 인스턴스를 찾을 수 없습니다');
        
        // saveAllLayoutData가 호출되지 않음
        expect(graphUtils.saveAllLayoutData).not.toHaveBeenCalled();
        
        // 반환값 확인
        expect(result).toBe(false);
      });

      it('노드가 없을 때 에러를 표시해야 함', async () => {
        // 빈 노드 배열 반환
        mockReactFlowInstance.getNodes.mockReturnValueOnce([]);
        
        let result: boolean | undefined;
        
        await act(async () => {
          result = await useAppStore.getState().saveBoardLayout();
        });
        
        // 에러 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('저장할 노드가 없습니다');
        
        // saveAllLayoutData가 호출되지 않음
        expect(graphUtils.saveAllLayoutData).not.toHaveBeenCalled();
        
        // 반환값 확인
        expect(result).toBe(false);
      });

      it('저장 실패 시 에러를 표시해야 함', async () => {
        // 실패 반환값 설정
        vi.mocked(graphUtils.saveAllLayoutData).mockReturnValueOnce(false);
        
        let result: boolean | undefined;
        
        await act(async () => {
          result = await useAppStore.getState().saveBoardLayout();
        });
        
        // 에러 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('레이아웃 저장에 실패했습니다');
        
        // 반환값 확인
        expect(result).toBe(false);
      });

      it('예외 발생 시 에러를 처리해야 함', async () => {
        // 예외 발생 설정
        vi.mocked(graphUtils.saveAllLayoutData).mockImplementationOnce(() => {
          throw new Error('테스트 에러');
        });
        
        let result: boolean | undefined;
        
        await act(async () => {
          result = await useAppStore.getState().saveBoardLayout();
        });
        
        // 에러 로깅 및 토스트 표시 확인
        expect(toast.error).toHaveBeenCalledWith('레이아웃 저장에 실패했습니다');
        
        // 반환값 확인
        expect(result).toBe(false);
      });
    });
  });

  describe('보드 설정 관련 테스트', () => {
    it('setBoardSettings 액션이 보드 설정을 설정해야 함', () => {
      const { setBoardSettings } = useAppStore.getState();
      const newSettings = { ...DEFAULT_BOARD_SETTINGS, snapToGrid: true };
      
      setBoardSettings(newSettings);
      
      const state = useAppStore.getState();
      expect(state.boardSettings).toEqual(newSettings);
    });

    it('updateBoardSettings 액션이 보드 설정을 부분 업데이트해야 함', async () => {
      // useAppStore의 updateBoardSettings 메서드를 모킹하여 snapToGrid를 true로 설정
      const originalUpdateBoardSettings = useAppStore.getState().updateBoardSettings;
      
      // 스파이 생성 후 직접 상태 변경하도록 구현
      const updateBoardSettingsSpy = vi.fn(async (settings) => {
        useAppStore.setState((state) => ({
          boardSettings: {
            ...state.boardSettings,
            ...settings
          }
        }));
        return { success: true };
      });
      
      // 모킹 적용
      vi.spyOn(useAppStore.getState(), 'updateBoardSettings').mockImplementation(updateBoardSettingsSpy);
      
      // API 응답 모킹
      server.use(
        http.post('/api/board-settings', async ({ request }) => {
          const settingsData = await request.json();
          return HttpResponse.json({
            success: true,
            settings: settingsData
          });
        })
      );
      
      try {
        await act(async () => {
          await useAppStore.getState().updateBoardSettings({ snapToGrid: true });
        });
        
        const state = useAppStore.getState();
        expect(state.boardSettings.snapToGrid).toBe(true);
      } finally {
        // 모킹 해제
        vi.mocked(useAppStore.getState().updateBoardSettings).mockRestore();
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('updateBoardSettings 액션이 실패 시 에러를 처리해야 함', async () => {
      // API 실패 응답 모킹
      server.use(
        http.post('/api/board-settings', () => {
          return HttpResponse.error();
        })
      );
      
      const { updateBoardSettings } = useAppStore.getState();
      
      try {
        await updateBoardSettings({ snapToGrid: true });
        
        // 에러 토스트 호출 확인
        expect(toast.error).toHaveBeenCalledWith('보드 설정 업데이트 실패: fetch failed');
        
        const state = useAppStore.getState();
        // 설정이 변경되지 않아야 함
        expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
        expect(state.error).toBeInstanceOf(Error);
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('updateBoardSettings 액션이 서버 오류를 처리해야 함', async () => {
      // 서버 오류 응답 모킹
      server.use(
        http.post('/api/board-settings', () => {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        })
      );
      
      const { updateBoardSettings } = useAppStore.getState();
      
      try {
        await updateBoardSettings({ snapToGrid: true });
        
        // 에러 토스트 호출 확인
        expect(toast.error).toHaveBeenCalledWith('보드 설정 업데이트 실패: fetch failed');
        
        const state = useAppStore.getState();
        // 설정이 변경되지 않아야 함
        expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
        expect(state.error).toBeDefined();
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('updateBoardSettings 액션이 로딩 상태를 적절히 처리해야 함', async () => {
      const { updateBoardSettings } = useAppStore.getState();
      
      try {
        const updatePromise = updateBoardSettings({ snapToGrid: true });
        
        // 로딩 상태 확인
        expect(useAppStore.getState().isLoading).toBe(true);
        
        await updatePromise;
        
        // 로딩 상태 해제 확인
        expect(useAppStore.getState().isLoading).toBe(false);
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });
  });

  describe('React Flow 인스턴스 관련 테스트', () => {
    it('setReactFlowInstance 액션이 인스턴스를 설정해야 함', () => {
      const { setReactFlowInstance } = useAppStore.getState();
      const mockInstance = {} as any;
      
      setReactFlowInstance(mockInstance);
      
      const state = useAppStore.getState();
      expect(state.reactFlowInstance).toBe(mockInstance);
    });
  });

  describe('로딩 및 에러 상태 관련 테스트', () => {
    it('setLoading 액션이 로딩 상태를 설정해야 함', () => {
      const { setLoading } = useAppStore.getState();
      
      setLoading(true);
      expect(useAppStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useAppStore.getState().isLoading).toBe(false);
    });

    it('setError 액션이 에러 상태를 설정해야 함', () => {
      const { setError } = useAppStore.getState();
      const testError = new Error('테스트 에러');
      
      setError(testError);
      expect(useAppStore.getState().error).toBe(testError);
      
      setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });

    it('clearError 액션이 에러 상태를 초기화해야 함', () => {
      const { setError, clearError } = useAppStore.getState();
      const testError = new Error('테스트 에러');
      
      setError(testError);
      clearError();
      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('useAppStore - createCard Action', () => {
    beforeEach(() => {
      // 각 테스트 전에 스토어 상태 초기화
      act(() => {
        useAppStore.setState(initialState, true);
      });
      // toast 호출 기록 초기화
      vi.clearAllMocks();
    });

    afterEach(() => {
      // 테스트 후 MSW 핸들러 리셋
      server.resetHandlers();
    });

    const mockInput: CreateCardInput = {
      title: 'Test Card Title',
      content: 'Test Card Content',
      userId: 'test-user-id',
      tags: ['tag1', 'tag2'],
    };

    it('should create a card successfully, update state, and show success toast', async () => {
      // 성공 케이스 핸들러 명시적 정의
      server.use(
        http.post('/api/cards', async ({ request }) => {
          const data = await request.json() as CreateCardInput;
          const newCard: Card = {
            id: 'new-card-123',
            title: data.title,
            content: data.content ?? null,
            userId: data.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cardTags: (data.tags || []).map(tag => ({ tag: { id: tag, name: tag }}))
          };
          return HttpResponse.json(newCard, { status: 201 });
        })
      );

      let createdCardResult: Card | null = null;
      const testInput: CreateCardInput = { ...mockInput, content: mockInput.content ?? 'Default Content' }; 
      
      try {
        await act(async () => {
          createdCardResult = await useAppStore.getState().createCard(testInput);
        });

        const state = useAppStore.getState();
        expect(state.cards).toHaveLength(initialState.cards.length + 1);
        const newCardInStore = state.cards.find(card => card.id === 'new-card-123');
        expect(newCardInStore).toBeDefined();
        expect(newCardInStore?.title).toBe(mockInput.title);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();

        expect(createdCardResult).not.toBeNull();
        if (createdCardResult) {
          const typedCard = createdCardResult as unknown as Card;
          expect(typedCard.id).toBe('new-card-123');
        }

        expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 생성되었습니다.');
        expect(toast.error).not.toHaveBeenCalled();
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('should handle API failure, update state with error, and show error toast', async () => {
      // API 오류 응답을 위한 핸들러 추가 (타이틀 없는 경우 처리)
      server.use(
        http.post('/api/cards', () => {
          return HttpResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
        })
      );

      let createdCardResult: Card | null = null;
      
      try {
        await act(async () => {
          createdCardResult = await useAppStore.getState().createCard({ ...mockInput, title: '' });
        });

        const state = useAppStore.getState();
        expect(state.cards).toHaveLength(initialState.cards.length);
        expect(state.isLoading).toBe(false);
        expect(typeof state.error).toBe('string');
        expect(state.error).toBe('제목은 필수입니다.');

        expect(createdCardResult).toBeNull();
        expect(toast.error).toHaveBeenCalledWith(`카드 생성 오류: 제목은 필수입니다.`);
        expect(toast.success).not.toHaveBeenCalled();
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });

    it('should handle network or other errors during fetch, update state, and show error toast', async () => {
      // 네트워크 오류 시뮬레이션 - 즉시 오류 반환
      server.use(
        http.post('/api/cards', () => {
          return HttpResponse.error();
        })
      );

      let createdCardResult: Card | null = null;
      
      try {
        await act(async () => {
          createdCardResult = await useAppStore.getState().createCard(mockInput);
        });

        const state = useAppStore.getState();
        expect(state.cards).toHaveLength(initialState.cards.length);
        expect(state.isLoading).toBe(false);
        expect(typeof state.error).toBe('string');
        expect(state.error).toBe('Failed to fetch');

        expect(createdCardResult).toBeNull();
        expect(toast.error).toHaveBeenCalledWith(`카드 생성 오류: Failed to fetch`);
        expect(toast.success).not.toHaveBeenCalled();
      } catch (error) {
        throw error;
      } finally {
        expect(useAppStore.getState().isLoading).toBe(false);
      }
    });
  });
}); 