import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { toast } from 'sonner'
import type { CreateCardInput } from '@/types/card'
import { 
  BoardSettings, 
  DEFAULT_BOARD_SETTINGS, 
  loadBoardSettings,
  saveBoardSettings
} from '@/lib/board-utils'
import { ReactFlowInstance } from '@xyflow/react'
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils'
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants'
import { saveAllLayoutData } from '@/components/board/utils/graphUtils'

// 카드 타입 정의 (src/types/card.ts와 일치하도록 수정, API 응답 고려)
export interface Card {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: import('@/types/card').User;
  cardTags?: Array<{ tag: { id: string; name: string; } }>;
  [key: string]: any;
}

export interface AppState {
  // 선택된 카드 상태 (통합된 단일 소스)
  selectedCardIds: string[];
  // 이전 단일 선택 상태 (내부적으로 selectedCardIds로 변환)
  selectedCardId: string | null; // 하위 호환성 유지 (파생 값)
  // 확장된 카드 ID
  expandedCardId: string | null;
  
  // 선택 관련 액션들
  selectCard: (cardId: string | null) => void; // 단일 카드 선택 (내부적으로 selectCards 사용)
  selectCards: (cardIds: string[]) => void; // 다중 카드 선택 (주요 액션)
  addSelectedCard: (cardId: string) => void; // 선택된 카드 목록에 추가
  removeSelectedCard: (cardId: string) => void; // 선택된 카드 목록에서 제거
  toggleSelectedCard: (cardId: string) => void; // 선택된 카드 목록에서 토글
  clearSelectedCards: () => void; // 모든 선택 해제
  // 카드 확장 액션
  toggleExpandCard: (cardId: string) => void; // 카드 확장 토글
  
  // 카드 데이터 상태
  cards: Card[]; // 현재 로드된 카드 목록
  setCards: (cards: Card[]) => void; // 카드 목록 설정
  updateCard: (updatedCard: Card) => void; // 단일 카드 업데이트
  createCard: (input: CreateCardInput) => Promise<Card | null>; // 카드 생성 액션 추가
  
  // 사이드바 상태
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // 레이아웃 옵션 (수평/수직/자동배치/없음)
  layoutDirection: 'horizontal' | 'vertical' | 'auto' | 'none';
  setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | 'none') => void;
  
  // 레이아웃 적용 및 저장 액션
  applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void;
  saveBoardLayout: () => Promise<boolean>;
  
  // 사이드바 너비
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  // 보드 설정
  boardSettings: BoardSettings;
  setBoardSettings: (settings: BoardSettings) => void;
  updateBoardSettings: (settings: Partial<BoardSettings>) => void;
  
  // 로딩 상태
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 에러 상태
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  
  // React Flow 인스턴스
  reactFlowInstance: any | null;
  setReactFlowInstance: (instance: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 다중 선택 카드 상태 초기값 및 액션 (기본 소스)
      selectedCardIds: [],
      
      // 단일 선택 상태 (파생 값)
      selectedCardId: null,
      
      // 확장된 카드 ID 초기값
      expandedCardId: null,
      
      // 선택 관련 액션들
      selectCards: (cardIds) => {
        set({
          selectedCardIds: cardIds,
          // 다중 선택의 첫 번째 카드를 단일 선택 상태로 설정 (하위 호환성)
          selectedCardId: cardIds.length > 0 ? cardIds[0] : null
        });
        console.log('[AppStore] 카드 선택 변경:', cardIds);
      },
      
      // 단일 카드 선택 (내부적으로 selectCards 호출)
      selectCard: (cardId) => {
        const currentExpanded = get().expandedCardId;
        // 다른 카드가 선택되면서 기존에 펼쳐진 카드가 있는 경우 접기
        const shouldCollapse = currentExpanded !== null && currentExpanded !== cardId;
        
        if (cardId) {
          // 카드 선택
          set({ 
            selectedCardIds: [cardId], 
            selectedCardId: cardId,
            // 다른 카드 선택 시 기존에 펼쳐진 카드 접기
            expandedCardId: shouldCollapse ? null : currentExpanded
          });
          console.log('[AppStore] 카드 선택:', cardId, '펼쳐진 카드 접기:', shouldCollapse);
        } else {
          // 선택 해제
          set({ 
            selectedCardIds: [], 
            selectedCardId: null,
            expandedCardId: null // 선택 해제 시 펼쳐진 카드도 함께 접기
          });
          console.log('[AppStore] 카드 선택 해제');
        }
      },
      
      // 선택된 카드 목록에 추가
      addSelectedCard: (cardId) => 
        set((state) => {
          if (!cardId || state.selectedCardIds.includes(cardId)) return state;
          const newSelectedIds = [...state.selectedCardIds, cardId];
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds[0] // 첫 번째 카드를 단일 선택 상태로 설정
          };
        }),
      
      // 선택된 카드 목록에서 제거
      removeSelectedCard: (cardId) => 
        set((state) => {
          const newSelectedIds = state.selectedCardIds.filter(id => id !== cardId);
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds.length > 0 ? newSelectedIds[0] : null
          };
        }),
      
      // 선택된 카드 목록에서 토글
      toggleSelectedCard: (cardId) => 
        set((state) => {
          if (!cardId) return state;
          
          const isSelected = state.selectedCardIds.includes(cardId);
          let newSelectedIds;
          
          if (isSelected) {
            newSelectedIds = state.selectedCardIds.filter(id => id !== cardId);
          } else {
            newSelectedIds = [...state.selectedCardIds, cardId];
          }
          
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds.length > 0 ? newSelectedIds[0] : null
          };
        }),
      
      // 모든 선택 해제
      clearSelectedCards: () => set({ 
        selectedCardIds: [], 
        selectedCardId: null,
        expandedCardId: null // 선택 해제 시 펼쳐진 카드도 함께 접기
      }),
      
      // 카드 확장 토글 액션
      toggleExpandCard: (cardId) => {
        const currentExpanded = get().expandedCardId;
        
        if (currentExpanded === cardId) {
          // 이미 펼쳐진 카드를 토글 (접기)
          set({ expandedCardId: null, selectedCardId: null, selectedCardIds: [] });
          console.log('[AppStore] 카드 확장 취소:', cardId);
        } else {
          // 새로운 카드를 펼침
          set({ expandedCardId: cardId, selectedCardId: cardId, selectedCardIds: [cardId] });
          console.log('[AppStore] 카드 확장:', cardId);
        }
      },
      
      // 카드 데이터 상태 초기값 및 액션
      cards: [],
      setCards: (cards) => set({ cards }),
      updateCard: async (updatedCard) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/cards/${updatedCard.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCard)
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          set((state) => {
            const updatedCards = state.cards.map(card =>
              card.id === updatedCard.id ? { ...card, ...updatedCard } : card
            );
            return { cards: updatedCards, isLoading: false, error: null };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ error: error as Error, isLoading: false });
          toast.error(`카드 업데이트 실패: ${errorMessage}`);
        }
      },
      createCard: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            let errorMsg = '카드 생성에 실패했습니다.';
            try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg;
            } catch (e) { /* JSON 파싱 실패 무시 */ }
            throw new Error(errorMsg);
          }

          const newCard = await response.json();
          set((state) => ({
            cards: [...state.cards, newCard],
            isLoading: false
          }));
          toast.success('카드가 성공적으로 생성되었습니다.');
          return newCard;

        } catch (err: any) {
          console.error("createCard 액션 오류:", err);
          set({ isLoading: false, error: err.message });
          toast.error(`카드 생성 오류: ${err.message}`);
          return null;
        }
      },
      
      // 사이드바 상태 초기값 및 액션
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // 레이아웃 옵션 초기값 및 액션
      layoutDirection: 'auto' as const,
      setLayoutDirection: (direction) => set({ layoutDirection: direction }),
      
      // 레이아웃 적용 액션
      applyLayout: (direction) => {
        const { reactFlowInstance } = get();
        
        if (!reactFlowInstance) {
          toast.error('React Flow 인스턴스를 찾을 수 없습니다');
          return;
        }
        
        // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
        const nodes = reactFlowInstance.getNodes();
        const edges = reactFlowInstance.getEdges();
        
        if (!nodes.length) {
          toast.error('적용할 노드가 없습니다');
          return;
        }
        
        let layoutedNodes, layoutedEdges;
        
        // 방향에 따라 다른 레이아웃 적용
        if (direction === 'auto') {
          // 자동 배치 레이아웃 적용
          layoutedNodes = getGridLayout(nodes);
          layoutedEdges = edges; // 자동 배치는 엣지를 변경하지 않음
          
          // 변경된 노드만 적용
          reactFlowInstance.setNodes(layoutedNodes);
          toast.success('자동 배치 레이아웃이 적용되었습니다');
        } else {
          // 수평 또는 수직 레이아웃 적용
          const result = getLayoutedElements(nodes, edges, direction);
          layoutedNodes = result.nodes;
          layoutedEdges = result.edges;
          
          // 변경된 노드와 엣지 적용
          reactFlowInstance.setNodes(layoutedNodes);
          reactFlowInstance.setEdges(layoutedEdges);
          toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃이 적용되었습니다`);
        }
        
        // 레이아웃 방향 상태 업데이트
        set({ layoutDirection: direction });
      },
      
      // 레이아웃 저장 액션
      saveBoardLayout: async () => {
        try {
          const { reactFlowInstance } = get();
          
          if (!reactFlowInstance) {
            toast.error('React Flow 인스턴스를 찾을 수 없습니다');
            return false;
          }
          
          // React Flow 인스턴스에서 직접 노드와 엣지 데이터 가져오기
          const nodes = reactFlowInstance.getNodes();
          const edges = reactFlowInstance.getEdges();
          
          if (!nodes.length) {
            toast.error('저장할 노드가 없습니다');
            return false;
          }
          
          // 노드와 엣지 데이터 저장 (graphUtils 유틸리티 함수 사용)
          const saveResult = saveAllLayoutData(nodes, edges);
          
          if (saveResult) {
            toast.success('레이아웃이 저장되었습니다');
            console.log('레이아웃 저장 완료:', { nodes: nodes.length, edges: edges.length });
            return true;
          } else {
            toast.error('레이아웃 저장에 실패했습니다');
            return false;
          }
        } catch (error) {
          console.error('레이아웃 저장 실패:', error);
          toast.error('레이아웃 저장에 실패했습니다');
          return false;
        }
      },
      
      // 사이드바 너비 초기값 및 액션
      sidebarWidth: 320,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      // 보드 설정 초기값 및 액션
      boardSettings: DEFAULT_BOARD_SETTINGS,
      setBoardSettings: (settings) => set({ boardSettings: settings }),
      updateBoardSettings: async (settings) => {
        set({ isLoading: true });
        try {
          // 현재 사용자 ID 가져오기 (로컬 스토리지에서)
          const userId = localStorage.getItem('user_id');
          
          // 디버깅: 사용자 ID 로깅
          console.log('=== 보드 설정 업데이트 중 ===');
          console.log('userId from localStorage:', userId);
          console.log('settings to update:', settings);
          console.log('==================');
          
          if (!userId) {
            throw new Error('사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
          }
          
          // 서버에 설정 업데이트
          const success = await updateBoardSettingsOnServer(userId, settings);
          
          if (!success) {
            throw new Error('서버에 설정을 저장하는데 실패했습니다.');
          }

          // 스토어 상태 업데이트
          set((state) => ({
            boardSettings: { ...state.boardSettings, ...settings },
            isLoading: false,
            error: null
          }));
          
          toast.success('보드 설정이 업데이트되었습니다.');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ error: error as Error, isLoading: false });
          toast.error(`보드 설정 업데이트 실패: ${errorMessage}`);
        }
      },
      
      // 로딩 상태 초기값 및 액션
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // 에러 상태 초기값 및 액션
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // React Flow 인스턴스
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
    }),
    {
      name: 'app-store',
      // 민감한 정보는 LocalStorage에 저장하지 않도록 필터링
      // 또한 함수 타입은 직렬화 불가능하므로 제외
      partialize: (state) => ({
        layoutDirection: state.layoutDirection,
        sidebarWidth: state.sidebarWidth,
        isSidebarOpen: state.isSidebarOpen,
        boardSettings: state.boardSettings,
      }),
    }
  )
); 

// 로컬 함수로 선언된 updateBoardSettingsOnServer 함수를 유지하되, 수정
const updateBoardSettingsOnServer = async (userId: string, partialSettings: Partial<BoardSettings>): Promise<{ success: boolean; settings?: BoardSettings; message?: string }> => {
  try {
    // 깊은 복사를 통해 설정 객체의 안전한 복사본 생성
    const settingsCopy = JSON.parse(JSON.stringify(partialSettings));
    
    // 요청 전 사용자 ID와 함께 설정 데이터 출력
    console.log('=== 서버에 보드 설정 업데이트 요청 시작 ===');
    console.log('userId:', userId);
    console.log('보드 설정 데이터:', settingsCopy);
    
    // API 요청
    const response = await fetch('/api/board-settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings: settingsCopy,
      }),
    });
    
    // 응답 상태 및 데이터 로깅
    console.log('서버 응답 상태:', response.status);
    
    const data = await response.json();
    console.log('서버 응답 데이터:', data);
    console.log('==================');
    
    // 성공적인 응답 처리
    if (response.ok) {
      // ... 기존 성공 처리 코드
      
      // 로컬 스토리지에 저장
      try {
        // 현재 설정 가져오기
        const currentSettings = loadBoardSettings();
        // 병합된 설정 저장
        const mergedSettings = { ...currentSettings, ...settingsCopy };
        saveBoardSettings(mergedSettings);
      } catch (storageError) {
        console.error('로컬 스토리지 저장 오류:', storageError);
      }
      
      return { success: true, settings: data.settings, message: data.message };
    } else {
      throw new Error(data.message || '서버 오류 발생');
    }
  } catch (error) {
    console.error('보드 설정 업데이트 오류:', error);
    
    // 오류 발생 시에도 로컬 스토리지에는 저장 시도 (폴백)
    try {
      const currentSettings = loadBoardSettings();
      const mergedSettings = { ...currentSettings, ...partialSettings };
      saveBoardSettings(mergedSettings);
      console.log('서버 저장 실패, 로컬 저장소에 백업 완료');
    } catch (storageError) {
      console.error('로컬 스토리지 저장도 실패:', storageError);
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류 발생',
    };
  }
}; 