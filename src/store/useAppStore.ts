/**
 * 파일명: src/store/useAppStore.ts
 * 목적: Zustand 스토어 슬라이스 통합 및 글로벌 상태 관리
 * 역할: UI, 카드 상태, 테마 등 여러 슬라이스를 통합한 루트 스토어 제공
 * 작성일: 2024-05-22
 * 수정일: 2025-04-21 : Zustand 스토어 슬라이스 분리 및 통합
 * 수정일: 2025-04-21 : 프로젝트 관련 함수 목업 데이터로 변경
 * 수정일: 2025-04-21 : 슬라이스 함수 호출 인수 수정
 * 수정일: 2025-04-21 : Zustand 슬라이스 통합 구조 명확화
 * 수정일: 2025-04-21 : createIdeaMapSlice를 별도 파일로 분리하고 순수 UI 상태만 관리하도록 수정
 * 수정일: 2025-04-21 : Three-Layer-Standard 적용 - 인증 관련 API 호출을 서비스 함수로 이동
 */

import { ReactFlowInstance, Node, Edge } from '@xyflow/react'
import { toast } from 'sonner'
import { create } from 'zustand'
import { persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware'

import { saveAllLayoutData } from '@/components/ideamap/utils/ideamap-graphUtils'
import { getCurrentUser } from "@/lib/auth"
import { IDEAMAP_LAYOUT_STORAGE_KEY, IDEAMAP_EDGES_STORAGE_KEY } from '@/lib/ideamap-constants'
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils'
import { createLogger } from '@/lib/logger'
import { logout } from '@/services/authService'

import { UiState, createUiSlice } from './uiSlice'
import { CardStateState, createCardStateSlice } from './cardStateSlice'
import { ThemeState, createThemeSlice } from './themeSlice'
import { IdeaMapState, createIdeaMapSlice } from './ideaMapSlice'

//로거 초기화
const logger = createLogger('useIdeaMapLayout');
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

// 아이디어맵 관련 상태 인터페이스는 ideaMapSlice.ts로 이동

// 프로젝트 관련 상태 인터페이스
interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  fetchProjects: () => Promise<void>;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (projectId: string | null) => void;
  createProject: (projectData: Partial<Project>) => Promise<Project | null>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

// 카드 데이터 관련 상태 인터페이스
interface CardDataState {
  cards: any[]; // 전체 카드 목록
  setCards: (cards: any[]) => void; // 카드 목록 설정 함수
}

// 기타 앱 전역 상태 인터페이스
interface AppGlobalState {
  // 로그아웃 액션
  logoutAction: () => Promise<void>;
  
  // 앱 상태 리셋
  resetAppState: () => void;
  
  // 아이디어맵 레이아웃 저장 액션
  saveIdeaMapLayout: () => Promise<boolean>;
}

// 슬라이스를 통합한 AppState 인터페이스 정의
export type AppState = UiState & CardStateState & ThemeState & IdeaMapState & ProjectState & CardDataState & AppGlobalState;

// 목업 프로젝트 데이터
const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: '기본 프로젝트',
    ownerNickname: '우도리',
    userId: '787043b3-3996-4121-b650-404c7bd6fdcc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {}
  },
  {
    id: 'project-2',
    name: '새 아이디어',
    ownerNickname: '사용자',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {}
  }
];

// 아이디어맵 관련 상태와 액션 생성 함수는 ideaMapSlice.ts로 이동

/**
 * 프로젝트 관련 상태와 액션 생성 함수
 */
const createProjectSlice = (set: any, get: any) => ({
  projects: [],
  activeProjectId: null,
  
  fetchProjects: async () => {
    try {
      set({ isLoading: true });
      
      // API 통신 대신 목업 데이터 사용
      // 이후 개발 예정: 실제 API, 호출로 대체
      setTimeout(() => {
        set({ 
          projects: MOCK_PROJECTS,
          isLoading: false
        });
        
        // 활성 프로젝트가 없거나 유효하지 않으면 첫 번째 프로젝트를 활성화
        const { activeProjectId } = get();
        if ((!activeProjectId || !MOCK_PROJECTS.some(p => p.id === activeProjectId)) && MOCK_PROJECTS.length > 0) {
          set({ activeProjectId: MOCK_PROJECTS[0].id });
        }
        
        console.log("목업 프로젝트 데이터 로드 완료");
      }, 500); // 실제 API 호출처럼 약간의 지연 추가
      
    } catch (error) {
      console.error("프로젝트 가져오기 오류:", error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  },
  
  setProjects: (projects: Project[]) => set({ projects }),
  setActiveProject: (projectId: string | null) => set({ activeProjectId: projectId }),
  
  createProject: async (projectData: Partial<Project>) => {
    try {
      set({ isLoading: true });
      
      // API 통신 대신 목업 데이터 사용
      // 이후 개발 예정: 실제 API 호출로 대체
      return new Promise<Project | null>((resolve) => {
        setTimeout(() => {
          // 고유 ID 생성
          const newId = `project-${Date.now()}`;
          const newProject: Project = {
            id: newId,
            name: projectData.name || '새 프로젝트',
            ownerNickname: '사용자',
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: projectData.settings || {},
            ...projectData
          };
          
          // 프로젝트 목록 업데이트 및 새 프로젝트를 활성화
          set((state: AppState) => ({
            projects: [...state.projects, newProject],
            activeProjectId: newProject.id,
            isLoading: false
          }));
          
          resolve(newProject);
        }, 500); // 실제 API 호출처럼 약간의 지연 추가
      });
      
    } catch (error) {
      console.error("프로젝트 생성 오류:", error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
      return null;
    }
  },
  
  updateProject: async (projectId: string, projectData: Partial<Project>) => {
    try {
      set({ isLoading: true });
      
      // API 통신 대신 목업 데이터 사용
      // 이후 개발 예정: 실제 API 호출로 대체
      return new Promise<Project | null>((resolve) => {
        setTimeout(() => {
          // 프로젝트 찾기
          const { projects } = get();
          const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
          
          if (projectIndex === -1) {
            set({ isLoading: false });
            toast.error("프로젝트를 찾을 수 없습니다.");
            resolve(null);
            return;
          }
          
          // 프로젝트 업데이트
          const updatedProject = {
            ...projects[projectIndex],
            ...projectData,
            updatedAt: new Date().toISOString()
          };
          
          // 프로젝트 목록 업데이트
          set((state: AppState) => ({
            projects: state.projects.map((p: Project) => p.id === projectId ? updatedProject : p),
            isLoading: false
          }));
          
          resolve(updatedProject);
        }, 500); // 실제 API 호출처럼 약간의 지연 추가
      });
      
    } catch (error) {
      console.error("프로젝트 업데이트 오류:", error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
      return null;
    }
  },
  
  deleteProject: async (projectId: string) => {
    try {
      set({ isLoading: true });
      
      // API 통신 대신 목업 데이터 사용
      // 이후 개발 예정: 실제 API 호출로 대체
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // 프로젝트 삭제
          set((state: AppState) => {
            const updatedProjects = state.projects.filter((p: Project) => p.id !== projectId);
            const newState: Partial<AppState> = {
              projects: updatedProjects,
              isLoading: false
            };
            
            // 삭제된 프로젝트가 활성 상태였다면 다른 프로젝트로 전환
            if (state.activeProjectId === projectId) {
              newState.activeProjectId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
            }
            
            return newState;
          });
          
          resolve(true);
        }, 500); // 실제 API 호출처럼 약간의 지연 추가
      });
      
    } catch (error) {
      console.error("프로젝트 삭제 오류:", error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
      return false;
    }
  },
});

/**
 * 카드 데이터 관련 상태와 액션 생성 함수
 */
const createCardDataSlice = (set: any) => ({
  cards: [],
  setCards: (cards: any[]) => set({ cards }),
});

/**
 * 앱 전역 상태와 액션 생성 함수
 */
const createAppGlobalSlice = (set: any, get: any) => ({
  // 로그아웃 액션
  logoutAction: async () => {
    try {
      // 인증 서비스 함수를 호출하여 로그아웃 처리
      await logout();
      
      // UI 상태 초기화 (Zustand의 책임)
      set({
        cards: [],
        selectedCardIds: [],
        selectedCardId: null,
        expandedCardId: null,
        activeProjectId: null,
        projects: []
      });
      
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      toast.error("로그아웃에 실패했습니다.");
    }
  },
  
  // 앱 상태 리셋 (프로젝트 변경 등에 사용)
  resetAppState: () => {
    set({
      cards: [],
      selectedCardIds: [],
      selectedCardId: null,
      expandedCardId: null,
      error: null
    });
  },
  
  // 아이디어맵 레이아웃 저장 액션
  saveIdeaMapLayout: async () => {
    const rfInstance = get().reactFlowInstance;
    if (!rfInstance) {
      console.error("레이아웃 저장 실패: React Flow 인스턴스가 없습니다.");
      return false;
    }

    try {
      const nodes = rfInstance.getNodes();
      const edges = rfInstance.getEdges();
      const viewport = rfInstance.getViewport();
      
      console.log("저장할 레이아웃:", { nodes, edges, viewport });
      
      // 로컬 스토리지에 레이아웃 정보(노드 위치, 엣지, 뷰포트) 저장
      saveAllLayoutData(nodes, edges);
      
      console.log("[saveIdeaMapLayout] 레이아웃 데이터 저장 완료");
      return true;
    } catch (error) {
      logger.error("[saveIdeaMapLayout] 레이아웃 저장 중 오류 발생:", error);
      return false;
    }
  },
});

// API URL 가져오기
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return apiUrl;
};

// Zustand 스토어 생성
export const useAppStore = create<AppState>()(
  persist(
    subscribeWithSelector((set, get, api) => ({
      // 여러 슬라이스 통합
      ...createUiSlice(set, get, api),
      ...createCardStateSlice(set, get, api),
      ...createThemeSlice(set, get, api),
      ...createIdeaMapSlice(set, get, api),
      ...createProjectSlice(set, get),
      ...createCardDataSlice(set),
      ...createAppGlobalSlice(set, get),
    })),
    {
      name: 'backyard-app-store', // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 영구 저장할 상태만 지정
        activeProjectId: state.activeProjectId,
        ideaMapSettings: state.ideaMapSettings,
        layoutDirection: state.layoutDirection,
        sidebarWidth: state.sidebarWidth,
      }),
    }
  )
);

// 선택자 함수들 (selectors)
export const selectProjects = (state: AppState) => state.projects;
export const selectActiveProjectId = (state: AppState) => state.activeProjectId;
export const selectActiveProject = (state: AppState) => {
  const activeId = state.activeProjectId;
  return activeId ? state.projects.find((p: Project) => p.id === activeId) || null : null;
};
export const selectProjectById = (projectId: string) => (state: AppState) => 
  state.projects.find((p: Project) => p.id === projectId) || null;
export const selectIsProjectActive = (projectId: string) => (state: AppState) => 
  state.activeProjectId === projectId;

// 개발 모드에서 window 전역 객체에 스토어 제공
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 테스트 편의를 위해 window 객체에 appCommands 추가
  (window as any).appCommands = {
    selectCard: (id: string) => useAppStore.getState().selectCard(id),
    selectCards: (ids: string[]) => useAppStore.getState().selectCards(ids),
    toggleExpandCard: (id: string) => useAppStore.getState().toggleExpandCard(id),
    clearSelectedCards: () => useAppStore.getState().clearSelectedCards(),
    updateIdeaMapSettings: (settings: any) => useAppStore.getState().updateIdeaMapSettings(settings),
    applyLayout: (layout: string) => {
      if (layout === 'horizontal' || layout === 'vertical' || layout === 'auto') {
        useAppStore.getState().applyLayout(layout);
      }
    },
    saveLayout: () => useAppStore.getState().saveIdeaMapLayout(),
    logout: () => useAppStore.getState().logoutAction(),
    getState: () => useAppStore.getState(),
    getRfInstance: () => useAppStore.getState().reactFlowInstance,
    fetchProjects: () => useAppStore.getState().fetchProjects(),
    setActiveProject: (id: string | null) => useAppStore.getState().setActiveProject(id),
    createProject: (projectData: Partial<Project>) => useAppStore.getState().createProject(projectData),
    updateProject: (projectId: string, projectData: Partial<Project>) => useAppStore.getState().updateProject(projectId, projectData),
    deleteProject: (projectId: string) => useAppStore.getState().deleteProject(projectId),
    resetAppState: () => useAppStore.getState().resetAppState(),
    debugFlow: async () => {
      const rfInstance = useAppStore.getState().reactFlowInstance;
      const nodes = rfInstance?.getNodes() || [];
      return {
        nodesCount: nodes.length,
        hasRfInstance: !!rfInstance
      };
    }
  };
} 