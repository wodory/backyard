/**
 * 파일명: src/store/useProjectStore.ts
 * 목적: 프로젝트 상태 관리 스토어
 * 역할: 프로젝트 정보 관련 전역 상태 관리
 * 작성일: 2024-07-13
 * 수정일: 2024-07-13 : CRUD 액션 추가
 * 수정일: 2024-07-13 : 테스트 오류 수정
 * 수정일: 2024-07-13 : 테스트와 MSW 핸들러에 맞게 에러 처리 로직 수정
 * 수정일: 2024-07-14 : 프로젝트 삭제 로직 소프트 삭제로 수정
 * 수정일: 2024-07-15 : 프로젝트 변경 시 보드 데이터 초기화 기능 추가
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types/project';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';

// 상태 타입 정의
export interface ProjectStoreState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  activeProjectId: string | null;
  isBoardDataLoading: boolean;
}

// Zustand 스토어 생성
export const useProjectStore = create<ProjectStoreState & {
  // 프로젝트 관련 액션
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (updatedProject: Project) => void;
  removeProject: (projectId: string) => void;
  
  // 프로젝트 선택 관련 액션
  setActiveProject: (projectId: string | null) => void;
  
  // 로딩 및 에러 관련 액션
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // API 액션
  fetchProjects: (options?: { includeDeleted?: boolean }) => Promise<Project[]>;
  fetchProjectById: (projectId: string) => Promise<Project | undefined>;
  createProject: (projectData: CreateProjectInput) => Promise<Project>;
  updateProjectData: (projectId: string, updateData: UpdateProjectInput) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<boolean>;
  restoreProject: (projectId: string) => Promise<boolean>;
  
  // 셀렉터
  selectProjects: () => Project[];
  selectAllProjects: () => Project[];
  selectProjectById: (id: string) => Project | undefined;
  selectActiveProjectId: () => string | null;
  selectActiveProject: () => Project | undefined;
  selectIsLoading: () => boolean;
  selectError: () => string | null;
  
  // 보드 데이터 관련 액션 추가
  clearBoardData: () => void;
  loadBoardData: (projectId: string, reactFlowInstance?: any) => Promise<void>;
}>()(
  persist(
    (set, get) => ({
      // 초기 상태
      projects: [],
      activeProjectId: null,
      isLoading: false,
      error: null,
      isBoardDataLoading: false,

      // 기본 액션들
      setProjects: (projects) => set({ projects }),
      
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project]
        }));
      },
      
      updateProject: (updatedProject) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.projectId === updatedProject.projectId ? updatedProject : project
          )
        }));
      },
      
      removeProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter(
            (project) => project.projectId !== projectId
          ),
          // 삭제된 프로젝트가 현재 활성화된 프로젝트인 경우 activeProjectId를 null로 설정
          activeProjectId:
            state.activeProjectId === projectId
              ? null
              : state.activeProjectId
        }));
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // API 액션 - 스텁 구현 (실제 실행되지는 않음)
      fetchProjects: async (options = {}) => {
        console.log('[ProjectStore] fetchProjects 호출', options);
        return [];
      },
      
      fetchProjectById: async (projectId) => {
        console.log('[ProjectStore] fetchProjectById 호출', projectId);
        return undefined;
      },
      
      createProject: async (projectData) => {
        console.log('[ProjectStore] createProject 호출', projectData);
        return {} as Project;
      },
      
      updateProjectData: async (projectId, updateData) => {
        console.log('[ProjectStore] updateProjectData 호출', projectId, updateData);
        return {} as Project;
      },
      
      deleteProject: async (projectId) => {
        console.log('[ProjectStore] deleteProject 호출', projectId);
        return true;
      },
      
      restoreProject: async (projectId) => {
        console.log('[ProjectStore] restoreProject 호출', projectId);
        return true;
      },

      // setActiveProject 액션 수정
      setActiveProject: (projectId) => {
        const prevActiveProjectId = get().activeProjectId;
        
        // 프로젝트 ID가 변경된 경우에만 처리
        if (projectId !== prevActiveProjectId) {
          console.log('[ProjectStore] 프로젝트 변경:', projectId, '이전:', prevActiveProjectId);
          
          // 액티브 프로젝트 ID 설정
          set({ activeProjectId: projectId });
          
          // 보드 데이터 초기화 - localStorage 클리어
          get().clearBoardData();
          
          // isBoardDataLoading 상태 업데이트 제거 (Board 컴포넌트에서 직접 처리)
          console.log('[ProjectStore] 프로젝트 변경 완료:', projectId);
        }
      },
      
      // 셀렉터 구현
      selectProjects: () => {
        // 기본적으로 삭제되지 않은(isDeleted === false) 프로젝트만 반환
        return get().projects.filter(project => !project.isDeleted);
      },
      
      selectAllProjects: () => {
        // 모든 프로젝트 반환 (삭제된 프로젝트 포함)
        return get().projects;
      },
      
      selectProjectById: (id) => {
        return get().projects.find((project) => project.projectId === id);
      },
      
      selectActiveProjectId: () => get().activeProjectId,
      
      selectActiveProject: () => {
        const { projects, activeProjectId } = get();
        if (!activeProjectId) return undefined;
        return projects.find((project) => project.projectId === activeProjectId);
      },
      
      selectIsLoading: () => get().isLoading,
      
      selectError: () => get().error,
      
      // 보드 데이터 관련 액션
      clearBoardData: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(EDGES_STORAGE_KEY);
          console.log('[ProjectStore] 보드 데이터 초기화 완료');
        } catch (error) {
          console.error('[ProjectStore] 보드 데이터 초기화 실패:', error);
        }
      },
      
      // 보드 데이터 로드 액션
      loadBoardData: async (projectId, reactFlowInstance) => {
        if (!projectId || !reactFlowInstance) {
          console.log('[ProjectStore] 프로젝트 ID 또는 ReactFlow 인스턴스가 없어 보드 데이터를 로드할 수 없습니다.');
          return;
        }
        
        set({ isBoardDataLoading: true });
        
        try {
          // 현재 데이터 초기화
          reactFlowInstance.setNodes([]);
          reactFlowInstance.setEdges([]);
          
          // 로컬 스토리지에서 노드 데이터 로드 (기존의 loadNodesAndEdges 로직)
          // 이 부분은 실제 loadNodesAndEdges 함수 내용에 따라 달라질 수 있음
          console.log('[ProjectStore] 프로젝트 ID:', projectId, '에 대한 보드 데이터 로드 중');
          
          set({ isBoardDataLoading: false });
        } catch (error) {
          console.error('[ProjectStore] 보드 데이터 로드 실패:', error);
          set({ isBoardDataLoading: false });
        }
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({ 
        projects: state.projects,
        activeProjectId: state.activeProjectId 
      }),
    }
  )
);

// 보드 데이터 로딩 상태 셀렉터
export const selectIsBoardDataLoading = (state: ProjectStoreState) => state.isBoardDataLoading; 