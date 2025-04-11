/**
 * 파일명: useBoardStore.ts
 * 목적: Zustand를 활용한 보드 관련 전역 상태 관리
 * 역할: 보드의 노드, 엣지, 설정 등 모든 상태를 중앙 관리
 * 작성일: 2025-03-28
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Node, 
  Edge, 
  Connection, 
  applyNodeChanges, 
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  XYPosition,
  MarkerType,
  Position,
  Viewport
} from '@xyflow/react';
import { 
  BoardSettings, 
  DEFAULT_BOARD_SETTINGS, 
  saveBoardSettingsToServer,
  loadBoardSettingsFromServer,
  applyEdgeSettings,
  saveBoardSettings
} from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY, TRANSFORM_STORAGE_KEY } from '@/lib/board-constants';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { toast } from 'sonner';
import { CardData } from '@/components/board/types/board-types';
import { useAppStore } from './useAppStore';

// 보드 스토어 상태 인터페이스
interface BoardState {
  // 노드 관련 상태
  nodes: Node<CardData>[];
  setNodes: (nodes: Node<CardData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  
  // 엣지 관련 상태
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // 보드 설정 관련 상태
  boardSettings: BoardSettings;
  setBoardSettings: (settings: BoardSettings) => void;
  updateBoardSettings: (settings: Partial<BoardSettings>, isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 레이아웃 관련 함수
  applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void;
  applyGridLayout: () => void;
  
  // 저장 관련 함수
  saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
  saveEdges: (edgesToSave?: Edge[]) => boolean;
  saveAllLayoutData: () => boolean;
  
  // 엣지 스타일 업데이트
  updateEdgeStyles: (settings: BoardSettings) => void;
  
  // 서버 동기화 함수
  loadBoardSettingsFromServerIfAuthenticated: (isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 엣지 생성 함수
  createEdgeOnDrop: (sourceId: string, targetId: string) => Edge;
  
  // 변경 사항 추적
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  
  // 리액트 플로우 인스턴스
  reactFlowInstance: any;
  setReactFlowInstance: (instance: any) => void;
  
  // 보드 데이터 로딩 상태 및 액션
  isBoardLoading: boolean;
  boardError: string | null;
  loadedViewport: Viewport | null;
  needsFitView: boolean;
  loadBoardData: () => Promise<void>;
  
  // 추가된 상태 및 액션
  viewportToRestore: Viewport | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  
  // useBoardUtils에서 이전된 액션들
  loadAndApplyBoardSettings: (userId: string) => Promise<void>;
  updateAndSaveBoardSettings: (newSettings: Partial<BoardSettings>, userId?: string) => Promise<void>;
  saveViewport: () => void;
  restoreViewport: () => void;
  saveBoardState: () => boolean;
}

// 보드 스토어 생성
export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      // 노드 관련 초기 상태 및 함수
      nodes: [],
      setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
      onNodesChange: (changes) => {
        // 삭제된 노드가 있는지 확인
        const deleteChanges = changes.filter(
          (change) => change.type === 'remove'
        );
        
        // 삭제된 노드의 ID 추출
        const deletedNodeIds = deleteChanges.map(
          (change) => (change as any).id
        );
        
        // 엣지 업데이트 (삭제된 노드와 연결된 엣지 제거)
        if (deletedNodeIds.length > 0) {
          const currentEdges = get().edges;
          const updatedEdges = currentEdges.filter(
            (edge) => 
              !deletedNodeIds.includes(edge.source) && 
              !deletedNodeIds.includes(edge.target)
          );
          
          // 엣지 변경이 있는 경우만 setEdges 호출
          if (currentEdges.length !== updatedEdges.length) {
            set({ edges: updatedEdges, hasUnsavedChanges: true });
          }
        }
        
        // 위치 변경이 있는 경우 저장 상태 업데이트
        const positionChanges = changes.filter(
          (change) => change.type === 'position' && change.dragging === false
        );
        
        if (positionChanges.length > 0 || deleteChanges.length > 0) {
          set({ hasUnsavedChanges: true });
        }
        
        // 노드 변경 적용
        set(state => ({
          nodes: applyNodeChanges(changes, state.nodes) as Node<CardData>[]
        }));
      },
      
      // 엣지 관련 초기 상태 및 함수
      edges: [],
      setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),
      onEdgesChange: (changes) => {
        set(state => ({
          edges: applyEdgeChanges(changes, state.edges),
          hasUnsavedChanges: true
        }));
      },
      onConnect: (connection) => {
        set(state => ({
          edges: addEdge({
            ...connection,
            type: 'custom',
            animated: state.boardSettings.animated,
            style: {
              stroke: state.boardSettings.edgeColor,
              strokeWidth: state.boardSettings.strokeWidth,
            },
            markerEnd: state.boardSettings.markerEnd ? {
              type: state.boardSettings.markerEnd,
              width: state.boardSettings.markerSize,
              height: state.boardSettings.markerSize,
              color: state.boardSettings.edgeColor,
            } : undefined,
            data: {
              edgeType: state.boardSettings.connectionLineType,
              settings: {
                animated: state.boardSettings.animated,
                connectionLineType: state.boardSettings.connectionLineType,
                strokeWidth: state.boardSettings.strokeWidth,
                edgeColor: state.boardSettings.edgeColor,
                selectedEdgeColor: state.boardSettings.selectedEdgeColor,
              }
            }
          }, state.edges),
          hasUnsavedChanges: true
        }));
      },
      
      // 보드 설정 관련 초기 상태 및 함수
      boardSettings: DEFAULT_BOARD_SETTINGS,
      isSettingsLoading: false,
      settingsError: null,
      viewportToRestore: null,
      setBoardSettings: (settings) => {
        set({ boardSettings: settings });
        saveBoardSettings(settings);
      },
      updateBoardSettings: async (partialSettings, isAuthenticated, userId) => {
        const currentSettings = get().boardSettings;
        const newSettings = { ...currentSettings, ...partialSettings };
        
        console.log('[BoardStore] 보드 설정 변경:', newSettings);
        
        // 1. 전역 상태 업데이트
        set({ boardSettings: newSettings });
        
        // 2. 새 설정을 엣지에 적용
        const updatedEdges = applyEdgeSettings(get().edges, newSettings);
        set({ edges: updatedEdges });
        
        // 3. 인증된 사용자인 경우 서버에도 저장
        if (isAuthenticated && userId) {
          try {
            await saveBoardSettingsToServer(userId, newSettings);
            toast.success('보드 설정이 저장되었습니다');
          } catch (err) {
            console.error('[BoardStore] 서버 저장 실패:', err);
            toast.error('서버에 설정 저장 실패');
          }
        }
      },
      
      // 보드 데이터 로딩 상태 및 함수 (신규 추가)
      isBoardLoading: true,
      boardError: null,
      loadedViewport: null,
      needsFitView: false,
      
      /**
       * loadBoardData: 보드 데이터(노드, 엣지)를 로드하는 액션
       * API에서 카드 데이터를 가져와 노드 데이터로 변환하고 
       * 로컬 스토리지에서 위치, 엣지, 뷰포트 정보를 불러와 적용
       */
      loadBoardData: async () => {
        set({ 
          isBoardLoading: true, 
          boardError: null, 
          loadedViewport: null, 
          needsFitView: false 
        });

        try {
          // 1. API 호출
          const response = await fetch('/api/cards');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `데이터 불러오기 실패 (상태: ${response.status})`);
          }
          const cards = await response.json();
          console.log('[loadBoardData Action] API 카드 데이터:', cards);

          // 2. 로컬 스토리지에서 노드 위치, 엣지, 뷰포트 정보 읽기
          let nodePositions: Record<string, { position: XYPosition }> = {};
          let savedEdges: Edge[] = [];
          let savedViewport: Viewport | null = null;

          try {
            const savedPositionsStr = localStorage.getItem(STORAGE_KEY);
            if (savedPositionsStr) nodePositions = JSON.parse(savedPositionsStr);

            const savedEdgesStr = localStorage.getItem(EDGES_STORAGE_KEY);
            if (savedEdgesStr) savedEdges = JSON.parse(savedEdgesStr);

            const transformString = localStorage.getItem(TRANSFORM_STORAGE_KEY);
            if (transformString) savedViewport = JSON.parse(transformString);
          } catch (err) {
            console.error('[loadBoardData Action] 로컬 스토리지 읽기 오류:', err);
            toast.error('저장된 보드 레이아웃을 불러오는 중 문제가 발생했습니다.');
          }

          // 3. 노드 데이터 생성 및 위치 적용
          const nodes: Node<CardData>[] = cards.map((card: any, index: number) => {
            const savedPosition = nodePositions[card.id]?.position;
            const position = savedPosition || { 
              x: (index % 5) * 250, 
              y: Math.floor(index / 5) * 150 
            };
            
            // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
            const tags = card.cardTags && card.cardTags.length > 0
              ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
              : (card.tags || []);
              
            return {
              id: card.id,
              type: 'card',
              position,
              data: {
                ...card,
                tags,
              },
            };
          });

          // 4. 엣지 데이터 설정 (저장된 엣지 사용 및 설정 적용)
          const boardSettings = get().boardSettings;
          const finalEdges = applyEdgeSettings(savedEdges, boardSettings);

          // 5. 스토어 상태 업데이트
          set({
            nodes,
            edges: finalEdges,
            isBoardLoading: false,
            loadedViewport: savedViewport,
            needsFitView: !savedViewport,
            boardError: null,
          });
          
          // 6. 카드 데이터를 전역 상태에 저장 (useAppStore)
          useAppStore.getState().setCards(cards);

          toast.success('보드 데이터를 성공적으로 불러왔습니다.');

        } catch (error: any) {
          console.error('[loadBoardData Action] 보드 데이터 로딩 실패:', error);
          set({ 
            isBoardLoading: false, 
            boardError: error.message,
            nodes: [],
            edges: []
          });
          toast.error(`보드 데이터 로딩 실패: ${error.message}`);
        }
      },
      
      // 레이아웃 함수
      applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => {
        const { nodes, edges, boardSettings } = get();
        
        if (nodes.length === 0) {
          toast.error('노드가 없어 레이아웃을 적용할 수 없습니다');
          return;
        }
        
        try {
          let layoutedNodes;
          
          if (direction === 'auto') {
            // 자동 레이아웃 (그리드)
            layoutedNodes = getGridLayout(nodes);
          } else {
            // 방향 기반 레이아웃
            const { nodes: newNodes } = getLayoutedElements(nodes, edges, direction);
            layoutedNodes = newNodes;
          }
          
          // 노드 업데이트
          set({ 
            nodes: layoutedNodes as Node<CardData>[],
            hasUnsavedChanges: true
          });
          
          toast.info(`${direction === 'auto' ? '그리드' : direction === 'horizontal' ? '수평' : '수직'} 레이아웃이 적용되었습니다`);
        } catch (error) {
          console.error('레이아웃 적용 중 오류:', error);
          toast.error('레이아웃 적용에 실패했습니다');
        }
      },
      
      applyGridLayout: () => {
        get().applyLayout('auto');
      },
      
      // 저장 함수
      saveLayout: (nodesToSave) => {
        try {
          // 노드 배열 결정
          const nodes = nodesToSave || get().nodes;
          
          if (nodes.length === 0) {
            return false;
          }
          
          // 저장할 데이터 형식으로 변환
          const positionsData: Record<string, { position: XYPosition }> = {};
          
          nodes.forEach(node => {
            positionsData[node.id] = { 
              position: { x: node.position.x, y: node.position.y } 
            };
          });
          
          // 로컬 스토리지에 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify(positionsData));
          
          return true;
        } catch (error) {
          console.error('[BoardStore] 레이아웃 저장 중 오류:', error);
          return false;
        }
      },
      
      saveEdges: (edgesToSave) => {
        try {
          // 엣지 배열 결정
          const edges = edgesToSave || get().edges;
          
          // 로컬 스토리지에 저장
          localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
          
          return true;
        } catch (error) {
          console.error('[BoardStore] 엣지 저장 중 오류:', error);
          return false;
        }
      },
      
      saveAllLayoutData: () => {
        const state = get();
        const layoutSaved = state.saveLayout();
        const edgesSaved = state.saveEdges();
        
        if (layoutSaved && edgesSaved) {
          toast.success('레이아웃이 저장되었습니다');
          set({ hasUnsavedChanges: false });
          return true;
        }
        
        return false;
      },
      
      // 엣지 스타일 업데이트
      updateEdgeStyles: (settings) => {
        const state = get();
        if (state.edges.length === 0) return;
        
        try {
          // applyEdgeSettings 함수는 새 엣지 배열을 반환함
          const updatedEdges = applyEdgeSettings(state.edges, settings);
          
          // 엣지 배열 자체가 변경된 경우에만 setEdges 호출
          if (JSON.stringify(updatedEdges) !== JSON.stringify(state.edges)) {
            set({ edges: updatedEdges });
          }
        } catch (error) {
          console.error('[BoardStore] 엣지 스타일 업데이트 중 오류:', error);
        }
      },
      
      // 서버 동기화 함수
      loadBoardSettingsFromServerIfAuthenticated: async (isAuthenticated, userId) => {
        if (isAuthenticated && userId) {
          try {
            const settings = await loadBoardSettingsFromServer(userId);
            if (settings) {
              const state = get();
              
              // 전역 상태 업데이트
              set({ boardSettings: settings });
              
              // 새 설정을 엣지에 적용
              const updatedEdges = applyEdgeSettings(state.edges, settings);
              set({ edges: updatedEdges });
            }
          } catch (err) {
            console.error('서버에서 보드 설정 불러오기 실패:', err);
          }
        }
      },
      
      // 엣지 생성 함수
      createEdgeOnDrop: (sourceId, targetId) => {
        const { boardSettings } = get();
        
        // 새 엣지 생성
        const newEdge: Edge = {
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: boardSettings.animated,
          style: {
            stroke: boardSettings.edgeColor,
            strokeWidth: boardSettings.strokeWidth,
          },
          markerEnd: boardSettings.markerEnd ? {
            type: boardSettings.markerEnd,
            width: boardSettings.markerSize,
            height: boardSettings.markerSize,
            color: boardSettings.edgeColor,
          } : undefined,
          data: {
            edgeType: boardSettings.connectionLineType,
            settings: {
              animated: boardSettings.animated,
              connectionLineType: boardSettings.connectionLineType,
              strokeWidth: boardSettings.strokeWidth,
              edgeColor: boardSettings.edgeColor,
              selectedEdgeColor: boardSettings.selectedEdgeColor,
            }
          }
        };
        
        // 엣지 추가
        set(state => ({
          edges: [...state.edges, newEdge],
          hasUnsavedChanges: true
        }));
        
        return newEdge;
      },
      
      // 변경 사항 추적
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      
      // 리액트 플로우 인스턴스
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
      
      // useBoardUtils에서 이전된 액션들
      loadAndApplyBoardSettings: async (userId) => {
        if (!userId) {
          console.error('사용자 ID가 제공되지 않았습니다');
          return;
        }

        set({ isSettingsLoading: true, settingsError: null });

        try {
          // 서버에서 설정 불러오기
          const settings = await loadBoardSettingsFromServer(userId);
          
          if (settings) {
            // 1. 보드 설정 상태 업데이트
            set({ boardSettings: settings });
            
            // 2. 로컬 스토리지에 저장
            saveBoardSettings(settings);
            
            // 3. 새 설정을 엣지에 적용
            const updatedEdges = applyEdgeSettings(get().edges, settings);
            set({ edges: updatedEdges });
            
            set({ isSettingsLoading: false });
            toast.success('보드 설정을 불러왔습니다');
          } else {
            // 설정이 없는 경우 기본 설정 사용
            set({ 
              boardSettings: DEFAULT_BOARD_SETTINGS, 
              isSettingsLoading: false 
            });
            console.log('서버에 저장된 설정이 없어 기본 설정을 사용합니다');
          }
        } catch (error: any) {
          console.error('보드 설정 로드 중 오류:', error);
          set({ 
            isSettingsLoading: false, 
            settingsError: error.message || '알 수 없는 오류' 
          });
          toast.error(`보드 설정 로드 실패: ${error.message || '알 수 없는 오류'}`);
        }
      },
      
      updateAndSaveBoardSettings: async (newSettings, userId) => {
        const currentSettings = get().boardSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        // 1. 상태 업데이트
        set({ 
          boardSettings: updatedSettings, 
          isSettingsLoading: true,
          settingsError: null
        });
        
        // 2. 로컬 스토리지에 저장
        saveBoardSettings(updatedSettings);
        
        // 3. 새 설정을 엣지에 적용
        const updatedEdges = applyEdgeSettings(get().edges, updatedSettings);
        set({ edges: updatedEdges });
        
        // 4. 인증된 사용자인 경우 서버에도 저장
        if (userId) {
          try {
            await saveBoardSettingsToServer(userId, updatedSettings);
            set({ isSettingsLoading: false });
            toast.success('보드 설정이 저장되었습니다');
          } catch (error: any) {
            console.error('서버에 보드 설정 저장 중 오류:', error);
            set({ 
              isSettingsLoading: false,
              settingsError: error.message || '알 수 없는 오류'
            });
            toast.error(`서버에 설정 저장 실패: ${error.message || '알 수 없는 오류'}`);
          }
        } else {
          set({ isSettingsLoading: false });
          toast.info('보드 설정이 로컬에 저장되었습니다');
        }
      },
      
      saveViewport: () => {
        const { reactFlowInstance } = get();
        
        if (!reactFlowInstance) {
          toast.error('뷰포트를 저장할 수 없습니다');
          return;
        }
        
        try {
          // 현재 뷰포트 가져오기
          const viewport = reactFlowInstance.getViewport();
          
          // 로컬 스토리지에 저장
          localStorage.setItem(TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
          console.log('[BoardStore] 뷰포트 저장 완료:', viewport);
          
          toast.info('현재 보기가 저장되었습니다');
        } catch (error) {
          console.error('뷰포트 저장 중 오류:', error);
          toast.error('뷰포트 저장에 실패했습니다');
        }
      },
      
      restoreViewport: () => {
        try {
          // 로컬 스토리지에서 뷰포트 정보 읽기
          const transformString = localStorage.getItem(TRANSFORM_STORAGE_KEY);
          
          if (!transformString) {
            toast.info('저장된 보기가 없습니다');
            return;
          }
          
          // 저장된 뷰포트 정보 파싱
          const viewport: Viewport = JSON.parse(transformString);
          
          // 복원할 뷰포트 상태 설정
          set({ viewportToRestore: viewport });
          
          console.log('[BoardStore] 뷰포트 복원 예정:', viewport);
        } catch (error) {
          console.error('뷰포트 복원 중 오류:', error);
          toast.error('저장된 보기를 복원할 수 없습니다');
        }
      },
      
      saveBoardState: () => {
        const state = get();
        const layoutSaved = state.saveLayout();
        const edgesSaved = state.saveEdges();
        const transformSaved = state.saveViewport();
        
        if (layoutSaved && edgesSaved) {
          set({ hasUnsavedChanges: false });
          toast.success('보드 상태가 저장되었습니다');
          return true;
        }
        
        toast.error('보드 상태 저장에 실패했습니다');
        return false;
      }
    }),
    {
      name: 'board-store',
      partialize: (state) => ({
        boardSettings: state.boardSettings,
      }),
    }
  )
); 