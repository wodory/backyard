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

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// global fetch 모킹
const fetchMock = vi.fn();

describe('useAppStore', () => {
  // 테스트용 카드 데이터 - Card 타입에 맞게 수정
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

  // 전역 설정
  beforeAll(() => {
    // fetch API 모킹
    global.fetch = fetchMock;
    
    // 기본적인 fetch 응답 설정
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => "",
      headers: new Headers(),
      status: 200
    });
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
    fetchMock.mockClear();
  });

  // 각 테스트 후 정리
  afterEach(() => {
    vi.resetAllMocks();
  });

  // 모든 테스트 후 정리
  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
      
      // API 응답 모킹
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200
      });
      
      setCards(testCards);
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
    });

    it('updateCard 액션이 실패 시 에러를 처리해야 함', async () => {
      const { setCards, updateCard } = useAppStore.getState();
      setCards(testCards);
      
      // API 실패 응답 모킹
      fetchMock.mockRejectedValueOnce(new Error('카드 업데이트 실패'));
      
      const updatedCard = {
        id: 'card-1',
        title: '수정된 카드 1',
        content: '수정된 내용 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        userId: 'user-1'
      };
      
      await updateCard(updatedCard);
      
      // 에러 토스트 호출 확인
      expect(toast.error).toHaveBeenCalledWith('카드 업데이트 실패: 카드 업데이트 실패');
      
      const state = useAppStore.getState();
      // 카드가 변경되지 않아야 함
      expect(state.cards[0]).toEqual(testCards[0]);
      expect(state.error).toBeInstanceOf(Error);
    });

    it('updateCard 액션이 로딩 상태를 적절히 처리해야 함', async () => {
      const { setCards, updateCard } = useAppStore.getState();
      setCards(testCards);
      
      // API 응답 모킹
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200
      });
      
      const updatedCard = {
        id: 'card-1',
        title: '수정된 카드 1',
        content: '수정된 내용 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        userId: 'user-1'
      };
      
      const updatePromise = updateCard(updatedCard);
      
      // 로딩 상태 확인
      expect(useAppStore.getState().isLoading).toBe(true);
      
      await updatePromise;
      
      // 로딩 상태 해제 확인
      expect(useAppStore.getState().isLoading).toBe(false);
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
      // API 응답 모킹
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200
      });
      
      const { updateBoardSettings } = useAppStore.getState();
      
      await updateBoardSettings({ snapToGrid: true });
      
      // fetch 호출 확인
      expect(fetchMock).toHaveBeenCalledWith('/api/board-settings', expect.anything());
      
      const state = useAppStore.getState();
      expect(state.boardSettings.snapToGrid).toBe(true);
      // 다른 설정은 그대로 유지되어야 함
      expect(state.boardSettings).toEqual({
        ...DEFAULT_BOARD_SETTINGS,
        snapToGrid: true
      });
    });

    it('updateBoardSettings 액션이 실패 시 에러를 처리해야 함', async () => {
      // API 실패 응답 모킹
      fetchMock.mockRejectedValueOnce(new Error('네트워크 오류'));
      
      const { updateBoardSettings } = useAppStore.getState();
      
      await updateBoardSettings({ snapToGrid: true });
      
      // fetch 호출 확인
      expect(fetchMock).toHaveBeenCalledWith('/api/board-settings', expect.anything());
      
      // 에러 토스트 호출 확인
      expect(toast.error).toHaveBeenCalledWith('보드 설정 업데이트 실패: 네트워크 오류');
      
      const state = useAppStore.getState();
      // 설정이 변경되지 않아야 함
      expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
      expect(state.error).toBeInstanceOf(Error);
    });

    it('updateBoardSettings 액션이 서버 오류를 처리해야 함', async () => {
      // 서버 오류 응답 모킹
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      const { updateBoardSettings } = useAppStore.getState();
      
      await updateBoardSettings({ snapToGrid: true });
      
      // fetch 호출 확인
      expect(fetchMock).toHaveBeenCalledWith('/api/board-settings', expect.anything());
      
      // 에러 토스트 호출 확인
      expect(toast.error).toHaveBeenCalledWith('보드 설정 업데이트 실패: Internal Server Error');
      
      const state = useAppStore.getState();
      // 설정이 변경되지 않아야 함
      expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
      expect(state.error).toBeDefined();
    });

    it('updateBoardSettings 액션이 로딩 상태를 적절히 처리해야 함', async () => {
      // API 응답 모킹
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200
      });
      
      const { updateBoardSettings } = useAppStore.getState();
      
      const updatePromise = updateBoardSettings({ snapToGrid: true });
      
      // 로딩 상태 확인
      expect(useAppStore.getState().isLoading).toBe(true);
      
      await updatePromise;
      
      // 로딩 상태 해제 확인
      expect(useAppStore.getState().isLoading).toBe(false);
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
}); 