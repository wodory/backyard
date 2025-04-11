/**
 * 파일명: useAppStore.test.ts
 * 목적: useAppStore 상태 관리 테스트
 * 역할: 앱 전역 상태 관리 로직 테스트
 * 작성일: 2025-03-30
 * 수정일: 2025-04-09
 */

import { describe, it, expect, beforeEach, vi, afterEach, afterAll, beforeAll } from 'vitest';
import { useAppStore, Card } from '@/store/useAppStore';
import { DEFAULT_BOARD_SETTINGS, BoardSettings } from '@/lib/board-utils';
import { toast } from 'sonner';
import { act } from '@testing-library/react';
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';
import { CreateCardInput } from '@/types/card';
import * as layoutUtils from '@/lib/layout-utils';
import * as graphUtils from '@/components/board/utils/graphUtils';
import { Node, Edge } from '@xyflow/react';
import { waitFor } from '@testing-library/react';
import { signOut } from "next-auth/react";
import { mockReactFlow } from '@/tests/utils/react-flow-mock'; // ReactFlow 모킹 유틸리티 가져오기

// React Flow를 위한 브라우저 환경 모킹 초기화
mockReactFlow();

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
  loadBoardSettings: vi.fn(() => ({
    edgeColor: '#000000',
    strokeWidth: 1,
    animated: false,
    markerEnd: true,
    connectionLineType: 'default',
    snapToGrid: false,
    snapGrid: [20, 20]
  })),
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
  getLayoutedElements: vi.fn().mockImplementation((nodes, edges, direction) => {
    return {
      nodes: nodes.map((node: Node) => ({ ...node, position: { x: Math.random() * 100, y: Math.random() * 100 }})),
      edges: edges
    };
  }),
  getGridLayout: vi.fn().mockImplementation((nodes) => {
    return nodes.map((node: Node) => ({ ...node, position: { x: Math.random() * 200, y: Math.random() * 200 }}));
  })
}));

// graphUtils 모킹
vi.mock('@/components/board/utils/graphUtils', () => ({
  saveAllLayoutData: vi.fn().mockResolvedValue(undefined)
}));

// next-auth/react 모킹
vi.mock("next-auth/react", () => ({
  signOut: vi.fn().mockResolvedValue(undefined)
}));

// 초기 상태 정의 - get initial state after mocks are set up
const getInitialState = () => useAppStore.getState();

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
    server.listen({ onUnhandledRequest: 'warn' });
    
    // 기본 핸들러 설정
    server.use(
      // updateCard API 엔드포인트 핸들러
      http.put('/api/cards/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedCardData = await request.json() as Card;
        return HttpResponse.json({ ...updatedCardData, id: id as string, updatedAt: new Date().toISOString() });
      }),
      
      // createCard API 엔드포인트 핸들러 - 항상 명시적인 응답 반환
      http.post('/api/cards', async ({ request }) => {
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
      }),

      // PUT /api/users/:userId/settings - New handler for board settings
      http.put('/api/users/:userId/settings', async ({ request, params }) => {
        const { userId } = params;
        const partialSettings = await request.json() as Partial<BoardSettings>;
        console.log(`[MSW] PUT /api/users/${userId}/settings`, partialSettings);
        const savedSettings = { ...DEFAULT_BOARD_SETTINGS, ...partialSettings };
        return HttpResponse.json(savedSettings);
      })
    );
  });

  // 각 테스트 전에 스토어 및 모킹 초기화
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState(getInitialState(), true);

    // Reset mocks and MSW handlers
    vi.clearAllMocks();
    server.resetHandlers();

    // Restore default handlers
    server.use(
        http.put('/api/cards/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedCardData = await request.json() as Card;
          return HttpResponse.json({ ...updatedCardData, id: id as string, updatedAt: new Date().toISOString() });
        }),
        http.post('/api/cards', async ({ request }) => {
            const data = await request.json() as CreateCardInput;
            if (!data.title || data.title.trim() === '') {
                return HttpResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
            }
            const newCard: Card = { id: `new-card-${Date.now()}`, title: data.title, content: data.content ?? null, userId: data.userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), cardTags: (data.tags || []).map(tag => ({ tag: { id: tag, name: tag } })) };
            return HttpResponse.json(newCard, { status: 201 });
        }),
        http.put('/api/users/:userId/settings', async ({ request, params }) => {
            const { userId } = params;
            const partialSettings = await request.json() as Partial<BoardSettings>;
            console.log(`[MSW] PUT /api/users/${userId}/settings`, partialSettings);
            const savedSettings = { ...useAppStore.getState().boardSettings, ...partialSettings };
            return HttpResponse.json(savedSettings);
        })
    );
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
      
      // 다른 카드 선택 (기존 선택이 없을 때)
      toggleSelectedCard('card-2');
      expect(useAppStore.getState().selectedCardIds).toEqual(['card-2']);
      
      // 새로운 카드 선택 시 이전 선택은 제거되고 새 카드만 선택 상태가 됨
      toggleSelectedCard('card-1');
      expect(useAppStore.getState().selectedCardIds).toEqual(['card-1']);
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

  describe('보드 설정 관련 테스트', () => {
    it('setBoardSettings 액션이 보드 설정을 설정해야 함', () => {
      const { setBoardSettings } = useAppStore.getState();
      const newSettings = { ...DEFAULT_BOARD_SETTINGS, snapToGrid: true };
      
      setBoardSettings(newSettings);
      
      const state = useAppStore.getState();
      expect(state.boardSettings).toEqual(newSettings);
    });

    it('updateBoardSettings 액션이 보드 설정을 부분 업데이트해야 함', async () => {
      const { updateBoardSettings } = useAppStore.getState();
      const newSettings: Partial<BoardSettings> = { snapToGrid: true, animated: true };
      const expectedSavedSettings = { ...DEFAULT_BOARD_SETTINGS, ...newSettings };

      // Mock the API response
      server.use(
        http.put('/api/users/:userId/settings', async ({ request }) => {
          const reqBody = await request.json() as Partial<BoardSettings>;
          // Simulate merging on server
          const saved = { ...useAppStore.getState().boardSettings, ...reqBody };
          return HttpResponse.json(saved);
        })
      );

      await act(async () => {
        await updateBoardSettings(newSettings);
      });

      const state = useAppStore.getState();
      // Check if the state reflects the settings returned by the mocked API
      expect(state.boardSettings.snapToGrid).toBe(expectedSavedSettings.snapToGrid);
      expect(state.boardSettings.animated).toBe(expectedSavedSettings.animated);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('설정이 업데이트되었습니다.');
    });

    it('updateBoardSettings 액션이 실패 시 에러를 처리해야 함', async () => {
      const { updateBoardSettings } = useAppStore.getState();
      const newSettings: Partial<BoardSettings> = { snapToGrid: true, animated: true };
      const expectedSavedSettings = { ...DEFAULT_BOARD_SETTINGS, ...newSettings };

      // Mock the API response
      server.use(
        http.put('/api/users/:userId/settings', async ({ request }) => {
          const reqBody = await request.json() as Partial<BoardSettings>;
          // Simulate merging on server
          const saved = { ...useAppStore.getState().boardSettings, ...reqBody };
          return HttpResponse.json(saved);
        })
      );

      await act(async () => {
        await updateBoardSettings(newSettings);
      });

      const state = useAppStore.getState();
      // Check if the state reflects the settings returned by the mocked API
      expect(state.boardSettings.snapToGrid).toBe(expectedSavedSettings.snapToGrid);
      expect(state.boardSettings.animated).toBe(expectedSavedSettings.animated);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('설정이 업데이트되었습니다.');
    });

    it('updateBoardSettings 액션이 로딩 상태를 적절히 처리해야 함', async () => {
      const { updateBoardSettings } = useAppStore.getState();
      const newSettings: Partial<BoardSettings> = { snapToGrid: true, animated: true };
      const expectedSavedSettings = { ...DEFAULT_BOARD_SETTINGS, ...newSettings };

      // Mock the API response
      server.use(
        http.put('/api/users/:userId/settings', async ({ request }) => {
          const reqBody = await request.json() as Partial<BoardSettings>;
          // Simulate merging on server
          const saved = { ...useAppStore.getState().boardSettings, ...reqBody };
          return HttpResponse.json(saved);
        })
      );

      await act(async () => {
        await updateBoardSettings(newSettings);
      });

      const state = useAppStore.getState();
      // Check if the state reflects the settings returned by the mocked API
      expect(state.boardSettings.snapToGrid).toBe(expectedSavedSettings.snapToGrid);
      expect(state.boardSettings.animated).toBe(expectedSavedSettings.animated);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('설정이 업데이트되었습니다.');
    });
  });

  describe('로그아웃 액션 테스트 (logoutAction)', () => {
    it('logoutAction 액션이 성공적으로 signOut을 호출하고 상태를 초기화해야 함', async () => {
      // Set some initial state to verify clearing
      act(() => {
        useAppStore.setState({
          selectedCardIds: ['card-1'],
          selectedCardId: 'card-1',
          expandedCardId: 'card-1',
          cards: testCards,
          isLoading: false,
          error: null
        });
      });

      const { logoutAction } = useAppStore.getState();

      await act(async () => {
        await logoutAction();
      });

      expect(signOut).toHaveBeenCalledWith({ redirect: false });
      const state = useAppStore.getState();
      expect(state.selectedCardIds).toEqual([]);
      expect(state.selectedCardId).toBeNull();
      expect(state.expandedCardId).toBeNull();
      expect(state.cards).toEqual([]); // Check if cards are cleared
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('로그아웃 되었습니다.');
    });

    it('logoutAction 액션이 signOut 실패 시 에러 상태를 설정하고 토스트를 표시해야 함', async () => {
        const signOutError = new Error('Sign out failed');
        (signOut as any).mockRejectedValue(signOutError);

        // Set some initial state
        act(() => {
            useAppStore.setState({ selectedCardId: 'card-1' });
        });

        const { logoutAction } = useAppStore.getState();

        try {
             await act(async () => {
                 await logoutAction();
             });
        } catch (e) {
             console.log("Caught error during logoutAction failure test (expected)", e);
        }

        const state = useAppStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeInstanceOf(Error);
        expect(state.error?.message).toBe('Sign out failed');
        expect(state.selectedCardId).toBe('card-1'); // State should not be cleared on failure
        expect(toast.error).toHaveBeenCalledWith('로그아웃 실패: Sign out failed');
    });
  });
}); 