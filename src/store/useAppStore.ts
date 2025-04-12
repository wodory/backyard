import { create } from 'zustand'
import { persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import type { CreateCardInput } from '@/types/card'
import { 
  IdeaMapSettings, 
  DEFAULT_IDEAMAP_SETTINGS, 
  loadIdeaMapSettings,
  saveIdeaMapSettings
} from '@/lib/ideamap-utils'
import { ReactFlowInstance, Node, Edge } from '@xyflow/react'
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils'
import { IDEAMAP_LAYOUT_KEY, IDEAMAP_EDGES_KEY } from '@/lib/ideamap-constants'
import { saveAllLayoutData } from '@/components/ideamap/utils/ideamap-graphUtils'
import { signOut } from "next-auth/react"

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

// 프로젝트 정보 인터페이스
export interface Project {
  id: string;
  name: string;
  ownerNickname?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  settings?: any;
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
  saveIdeaMapLayout: () => Promise<boolean>;
  
  // 사이드바 너비
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  // 아이디어맵 설정
  ideaMapSettings: IdeaMapSettings;
  setIdeaMapSettings: (settings: IdeaMapSettings) => void;
  updateIdeaMapSettings: (settings: Partial<IdeaMapSettings>) => Promise<void>;
  
  // 로딩 상태
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 에러 상태
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  
  // React Flow 인스턴스
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;

  // Logout Action
  logoutAction: () => Promise<void>;
  
  // 프로젝트 관련 상태 및 액션
  projects: Project[];
  activeProjectId: string | null;
  fetchProjects: () => Promise<void>;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (projectId: string | null) => void;
  createProject: (projectData: Partial<Project>) => Promise<Project | null>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // Reset app state for new/different project
  resetAppState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    subscribeWithSelector((set, get) => ({
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
            // 이전에 다른 카드가 선택되어 있더라도 새 카드만 선택 상태로 만듭니다.
            // 이는 테스트에서 기대하는 동작입니다.
            newSelectedIds = [cardId];
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
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || response.statusText);
          }

          const savedCard = await response.json(); // Assuming API returns the updated card

          set((state) => {
            const updatedCards = state.cards.map(card =>
              card.id === savedCard.id ? savedCard : card // Use savedCard from API response
            );
            // Also update selection if the updated card was selected
            const newSelectedCardIds = state.selectedCardIds.includes(savedCard.id) ? [...state.selectedCardIds] : state.selectedCardIds;
            const newSelectedCardId = state.selectedCardId === savedCard.id ? savedCard.id : state.selectedCardId;

            return {
              cards: updatedCards,
              selectedCardIds: newSelectedCardIds,
              selectedCardId: newSelectedCardId,
              isLoading: false,
              error: null
            };
          });
          toast.success('카드가 성공적으로 업데이트되었습니다.');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ error: new Error(errorMessage), isLoading: false }); // Ensure error is an Error object
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
          return newCard; // Return the created card
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
          set({ error: new Error(errorMessage), isLoading: false });
          toast.error(`카드 생성 실패: ${errorMessage}`);
          return null; // Return null on failure
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
         // Implementation likely needs access to reactFlowInstance, nodes, edges
         const rfInstance = get().reactFlowInstance;
         if (!rfInstance) {
           toast.error("레이아웃 적용 실패: React Flow 인스턴스가 없습니다.");
           return;
         }

         const nodes = rfInstance.getNodes();
         const edges = rfInstance.getEdges();

         if (!nodes || nodes.length === 0) {
            toast.info("레이아웃할 노드가 없습니다.");
            return;
         }

         set({ isLoading: true });
         try {
           let finalLayoutedNodes: Node[]; // Define type explicitly
           if (direction === 'auto') {
              finalLayoutedNodes = getGridLayout(nodes);
           } else {
             // getLayoutedElements returns { nodes, edges }
             const { nodes: layoutedNodesFromElk } = getLayoutedElements(nodes, edges, direction);
             finalLayoutedNodes = layoutedNodesFromElk;
           }

           // Only update positions, keep other node data intact
           const updatedNodes = nodes.map(node => {
             // Add explicit type for ln
             const layoutedNode = finalLayoutedNodes.find((ln: Node) => ln.id === node.id);
             return layoutedNode ? { ...node, position: layoutedNode.position } : node;
           });

           rfInstance.setNodes(updatedNodes);
           // Optional: Fit view after layout
           // rfInstance.fitView({ padding: 0.1 });
           const directionTermForToast = direction === 'horizontal' ? '가로' : direction === 'vertical' ? '세로' : '자동';
           set({ layoutDirection: direction, isLoading: false, error: null });
           toast.success(`${directionTermForToast} 레이아웃이 적용되었습니다.`);

         } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 레이아웃 오류';
            set({ isLoading: false, error: new Error(errorMessage) });
            toast.error(`레이아웃 적용 실패: ${errorMessage}`);
         }
      },
      
      // 레이아웃 저장 액션
      saveIdeaMapLayout: async () => {
          const rfInstance = get().reactFlowInstance;
          if (!rfInstance) {
            toast.error("레이아웃 저장 실패: React Flow 인스턴스가 없습니다.");
            return false; // Indicate failure
          }

          set({ isLoading: true, error: null });
          try {
            const nodes = rfInstance.getNodes();
            const edges = rfInstance.getEdges();
            await saveAllLayoutData(nodes, edges); // Assuming this now handles potential API calls/errors
            set({ isLoading: false });
            toast.success('보드 레이아웃이 저장되었습니다.');
            return true; // Indicate success
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            set({ isLoading: false, error: new Error(errorMessage) });
            toast.error(`레이아웃 저장 실패: ${errorMessage}`);
            return false; // Indicate failure
          }
      },
      
      // 사이드바 너비 초기값 및 액션
      sidebarWidth: 320,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      // 아이디어맵 설정 초기값 및 액션
      ideaMapSettings: loadIdeaMapSettings(), // Load initial settings
      setIdeaMapSettings: (settings) => {
        set({ ideaMapSettings: settings });
        // Removed direct saveIdeaMapSettings(settings) call here
      },
      // Updated updateIdeaMapSettings Action
      updateIdeaMapSettings: async (partialSettings) => {
        const currentSettings = get().ideaMapSettings;
        const optimisticSettings = { ...currentSettings, ...partialSettings };

        // Optimistic update
        set({ ideaMapSettings: optimisticSettings, isLoading: true, error: null });

        try {
           // TODO: Replace with actual user ID mechanism if needed
          const userId = "current-user-id"; // Placeholder
          const response = await fetch(`/api/users/${userId}/settings`, { // Assuming endpoint structure
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(partialSettings),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `서버 오류: ${response.status}`);
          }

          const savedSettings = await response.json(); // API returns the full updated settings object

          // Update store with confirmed settings from server
          set({
            ideaMapSettings: savedSettings,
            isLoading: false,
            error: null
          });
          toast.success('설정이 업데이트되었습니다.');

        } catch (error) {
          // Rollback on error
          set({
             ideaMapSettings: currentSettings, // Rollback to previous settings
             isLoading: false,
             error: error instanceof Error ? error : new Error(String(error))
          });
          toast.error(`설정 업데이트 실패: ${error instanceof Error ? error.message : String(error)}`);
           // Re-throw or handle error as needed for callers
           // throw error;
        }
      },
      
      // 로딩/에러 상태
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // React Flow 인스턴스
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

      // New Logout Action
      logoutAction: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut({ redirect: false }); // Call next-auth signOut, prevent default redirect

          // Clear application-specific state
          set({
            selectedCardIds: [],
            selectedCardId: null,
            expandedCardId: null,
            cards: [], // Optionally clear cards or fetch fresh ones on next login
            projects: [], // 프로젝트 데이터도 초기화
            activeProjectId: null, // 활성 프로젝트 ID도 초기화
            // Reset other relevant states if necessary
            // boardSettings: DEFAULT_IDEAMAP_SETTINGS, // Reset settings to default? Or keep user settings?
            isLoading: false,
            error: null,
            // Consider clearing reactFlowInstance?
            // reactFlowInstance: null,
          });

          toast.success('로그아웃 되었습니다.');
          // Optional: Trigger navigation after state reset
          // Router.push('/login'); // Or use hook equivalent

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ isLoading: false, error: new Error(errorMessage) });
          toast.error(`로그아웃 실패: ${errorMessage}`);
          // Re-throw or handle error as needed
          // throw error;
        }
      },

      // 프로젝트 관련 상태 및 액션
      projects: [],
      activeProjectId: null,
      
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          // API 호출 대신 가상 데이터 반환
          const mockProjects = [
            {
              id: 'project-1',
              name: '기본 프로젝트',
              userId: 'user-1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              settings: {}
            }
          ];
          
          // 짧은 지연 후 가상 데이터 반환 (로딩 상태 시뮬레이션)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            projects: mockProjects, 
            activeProjectId: mockProjects[0].id,
            isLoading: false 
          });
          
          toast.success('가상 프로젝트 로드 완료');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ 
            isLoading: false, 
            error: new Error(errorMessage),
          });
          toast.error(`프로젝트 로드 실패: ${errorMessage}`);
        }
      },
      
      setProjects: (projects) => {
        set({ projects });
      },
      
      setActiveProject: (projectId) => {
        set({ activeProjectId: projectId });
        // 활성 프로젝트 변경 시 해당 프로젝트의 카드만 표시하도록 필터링하는 로직이 필요할 수 있음
        // 나중에 구현 예정
        const project = get().projects.find(p => p.id === projectId);
        if (project) {
          toast.success(`'${project.name}' 프로젝트로 전환되었습니다.`);
        }
      },
      
      createProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
          // API 호출 대신 가상 데이터 생성
          const newProject: Project = {
            id: `project-${Date.now()}`,
            name: projectData.name || '새 프로젝트',
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: projectData.settings || {}
          };
          
          // 짧은 지연 후 가상 데이터 반환 (로딩 상태 시뮬레이션)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({ 
            projects: [...state.projects, newProject],
            activeProjectId: newProject.id,
            isLoading: false 
          }));
          
          toast.success(`'${newProject.name}' 프로젝트가 생성되었습니다.`);
          return newProject;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ isLoading: false, error: new Error(errorMessage) });
          toast.error(`프로젝트 생성 실패: ${errorMessage}`);
          return null;
        }
      },
      
      updateProject: async (projectId, projectData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `서버 오류: ${response.status}`);
          }
          
          const updatedProject = await response.json();
          
          set(state => ({ 
            projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
            isLoading: false 
          }));
          
          toast.success(`'${updatedProject.name}' 프로젝트가 업데이트되었습니다.`);
          return updatedProject;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ isLoading: false, error: new Error(errorMessage) });
          toast.error(`프로젝트 업데이트 실패: ${errorMessage}`);
          return null;
        }
      },
      
      deleteProject: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `서버 오류: ${response.status}`);
          }
          
          // 프로젝트 목록에서 삭제
          const state = get();
          const deletedProject = state.projects.find(p => p.id === projectId);
          const newProjects = state.projects.filter(p => p.id !== projectId);
          
          set({ 
            projects: newProjects,
            // 삭제된 프로젝트가 활성 프로젝트였다면 첫 번째 프로젝트로 변경하거나 null로 설정
            activeProjectId: state.activeProjectId === projectId 
              ? (newProjects.length > 0 ? newProjects[0].id : null) 
              : state.activeProjectId,
            isLoading: false 
          });
          
          toast.success(`'${deletedProject?.name || '프로젝트'}' 가 삭제되었습니다.`);
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set({ isLoading: false, error: new Error(errorMessage) });
          toast.error(`프로젝트 삭제 실패: ${errorMessage}`);
          return false;
        }
      },

      // Reset app state for new/different project
      resetAppState: () => {
        set({
          selectedCardIds: [],
          reactFlowInstance: null,
          // ideaMapSettings: DEFAULT_IDEAMAP_SETTINGS, // Reset settings to default? Or keep user settings?
          isLoading: false,
          error: null,
          // ...other state to reset
        });
      },

    })),
    {
      name: 'app-storage', // 로컬 스토리지 키
      storage: createJSONStorage(() => localStorage), // 로컬 스토리지 사용
      // 특정 상태만 저장/복원 (필요에 따라 조정)
      partialize: (state) => ({
        selectedCardIds: state.selectedCardIds,
        selectedCardId: state.selectedCardId, // Keep for potential direct use?
        expandedCardId: state.expandedCardId,
        isSidebarOpen: state.isSidebarOpen,
        sidebarWidth: state.sidebarWidth,
        ideaMapSettings: state.ideaMapSettings, // Persist board settings
        layoutDirection: state.layoutDirection, // Persist layout direction
        activeProjectId: state.activeProjectId, // 활성 프로젝트 ID 저장
        projects: state.projects, // 프로젝트 목록 저장
        // Do NOT persist: cards, isLoading, error, reactFlowInstance
      }),
      // 버전 관리 (마이그레이션 로직 추가 가능)
      version: 1,
      // 마이그레이션 함수 (예시)
      // migrate: (persistedState, version) => {
      //   if (version === 0) {
      //     // 마이그레이션 로직
      //   }
      //   return persistedState as AppState;
      // },
      // Hydration 완료 후 실행할 로직
      onRehydrateStorage: (state) => {
        console.log("Hydration finished for app-storage");
        // return (state, error) => {
        //   if (error) {
        //     console.error("An error happened during hydration", error);
        //     toast.error('앱 상태 로딩 중 오류 발생');
        //   } else {
        //     console.log("Hydration finished for app-storage");
        //     // 복원 후 초기 로직 (예: 서버에서 최신 설정 가져오기)
        //     // useAppStore.getState().fetchInitialSettings?.(); // 예시: 초기 데이터 로딩 액션 호출
        //   }
        // }
      },
    }
  )
);

// 선택자 추가 (예시)
// export const selectIsCardSelected = (cardId: string) => (state: AppState) => state.selectedCardIds.includes(cardId);
// export const selectSelectedCardsCount = (state: AppState) => state.selectedCardIds.length;

// 프로젝트 관련 선택자 추가
export const selectProjects = (state: AppState) => state.projects;
export const selectActiveProjectId = (state: AppState) => state.activeProjectId;
export const selectActiveProject = (state: AppState) => {
  const { projects, activeProjectId } = state;
  return projects.find(project => project.id === activeProjectId) || null;
};
export const selectProjectById = (projectId: string) => (state: AppState) => 
  state.projects.find(project => project.id === projectId) || null;
export const selectIsProjectActive = (projectId: string) => (state: AppState) => 
  state.activeProjectId === projectId;

// 콘솔 명령 노출 (개발 환경 전용)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!window.appCommands) {
    window.appCommands = {};
  }
  const state = useAppStore.getState();
  window.appCommands.selectCard = state.selectCard;
  window.appCommands.selectCards = state.selectCards;
  window.appCommands.toggleExpandCard = state.toggleExpandCard;
  window.appCommands.clearSelectedCards = state.clearSelectedCards;
  window.appCommands.updateIdeaMapSettings = state.updateIdeaMapSettings;
  window.appCommands.applyLayout = state.applyLayout;
  window.appCommands.saveLayout = state.saveIdeaMapLayout;
  window.appCommands.logout = state.logoutAction; // Expose logout action
  window.appCommands.getState = () => useAppStore.getState(); // Expose getState for debugging
  window.appCommands.getRfInstance = () => useAppStore.getState().reactFlowInstance; // Expose RF instance
  // 프로젝트 관련 명령 추가
  window.appCommands.fetchProjects = state.fetchProjects;
  window.appCommands.setActiveProject = state.setActiveProject;
  window.appCommands.createProject = state.createProject;
  window.appCommands.updateProject = state.updateProject;
  window.appCommands.deleteProject = state.deleteProject;
  window.appCommands.resetAppState = state.resetAppState; // 앱 상태 초기화 명령 추가

  console.log('App commands registered to window.appCommands');
}

// 타입스크립트용 글로벌 타입 확장
declare global {
  interface Window {
    appCommands: {
      selectCard?: (cardId: string | null) => void;
      selectCards?: (cardIds: string[]) => void;
      toggleExpandCard?: (cardId: string) => void;
      clearSelectedCards?: () => void;
      updateIdeaMapSettings?: (settings: Partial<IdeaMapSettings>) => Promise<void>;
      applyLayout?: (direction: 'horizontal' | 'vertical' | 'auto') => void;
      saveLayout?: () => Promise<boolean>;
      logout?: () => Promise<void>; // Add logout command type
      getState?: () => AppState;
      getRfInstance?: () => ReactFlowInstance | null;
      // 프로젝트 관련 명령 타입 추가
      fetchProjects?: () => Promise<void>;
      setActiveProject?: (projectId: string | null) => void;
      createProject?: (projectData: Partial<Project>) => Promise<Project | null>;
      updateProject?: (projectId: string, projectData: Partial<Project>) => Promise<Project | null>;
      deleteProject?: (projectId: string) => Promise<boolean>;
      resetAppState?: () => void; // 앱 상태 초기화 명령 타입 추가
    };
  }
}

export default useAppStore; 