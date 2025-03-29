/**
 * 파일명: useAppStore.test.ts
 * 목적: useAppStore 상태 관리 테스트
 * 역할: 앱 전역 상태 관리 로직 테스트
 * 작성일: 2024-03-27
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore, Card } from '@/store/useAppStore';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';

describe('useAppStore', () => {
  // 테스트용 카드 데이터
  const testCards: Card[] = [
    { id: 'card-1', title: '카드 1', content: '내용 1', tags: ['태그1'] },
    { id: 'card-2', title: '카드 2', content: '내용 2', tags: ['태그2'] }
  ];

  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    useAppStore.setState({
      selectedCardIds: [],
      selectedCardId: null,
      cards: [],
      isSidebarOpen: false,
      layoutDirection: 'auto',
      sidebarWidth: 320,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      reactFlowInstance: null
    });
  });

  describe('카드 선택 관련 테스트', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useAppStore.getState();
      
      expect(state.selectedCardIds).toEqual([]);
      expect(state.selectedCardId).toBeNull();
    });

    it('selectCard 액션이 단일 카드를 선택해야 함', () => {
      const { selectCard } = useAppStore.getState();
      
      selectCard('card-1');
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual(['card-1']);
      expect(state.selectedCardId).toBe('card-1');
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

    it('clearSelectedCards 액션이 모든 선택을 해제해야 함', () => {
      const { selectCards, clearSelectedCards } = useAppStore.getState();
      
      selectCards(['card-1', 'card-2']);
      clearSelectedCards();
      
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual([]);
      expect(state.selectedCardId).toBeNull();
    });
  });

  describe('카드 데이터 관련 테스트', () => {
    it('setCards 액션이 카드 목록을 설정해야 함', () => {
      const { setCards } = useAppStore.getState();
      
      setCards(testCards);
      
      const state = useAppStore.getState();
      expect(state.cards).toEqual(testCards);
    });

    it('updateCard 액션이 카드를 업데이트해야 함', () => {
      const { setCards, updateCard } = useAppStore.getState();
      
      setCards(testCards);
      updateCard({
        id: 'card-1',
        title: '수정된 카드 1',
        content: '수정된 내용 1',
        tags: ['수정된태그1']
      });
      
      const state = useAppStore.getState();
      expect(state.cards[0].title).toBe('수정된 카드 1');
      expect(state.cards[0].content).toBe('수정된 내용 1');
      expect(state.cards[0].tags).toEqual(['수정된태그1']);
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

    it('updateBoardSettings 액션이 보드 설정을 부분 업데이트해야 함', () => {
      const { updateBoardSettings } = useAppStore.getState();
      
      updateBoardSettings({ snapToGrid: true });
      
      const state = useAppStore.getState();
      expect(state.boardSettings.snapToGrid).toBe(true);
      // 다른 설정은 그대로 유지되어야 함
      expect(state.boardSettings).toEqual({
        ...DEFAULT_BOARD_SETTINGS,
        snapToGrid: true
      });
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
}); 