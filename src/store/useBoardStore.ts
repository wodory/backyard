/**
 * 파일명: useBoardStore.ts
 * 목적: Zustand를 활용한 보드 관련 전역 상태 관리
 * 역할: 보드의 노드, 엣지, 설정 등 모든 상태를 중앙 관리
 * 작성일: 2024-05-31
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
  Position
} from '@xyflow/react';
import { 
  BoardSettings, 
  DEFAULT_BOARD_SETTINGS, 
  saveBoardSettingsToServer,
  loadBoardSettingsFromServer,
  applyEdgeSettings
} from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { toast } from 'sonner';
import { CardData } from '@/components/board/types/board-types';

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
  applyLayout: (direction: 'horizontal' | 'vertical') => void;
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
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      // 노드 관련 초기 상태 및 함수
      nodes: [],
      setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
      onNodesChange: (changes) => {
        // 삭제된 노드가 있는지 확인
        const deleteChanges = changes.filter(change => change.type === 'remove');
        
        if (deleteChanges.length > 0) {
          try {
            // 현재 저장된 노드 위치 정보 가져오기
            const savedPositionsStr = localStorage.getItem(STORAGE_KEY);
            if (savedPositionsStr) {
              const savedPositions = JSON.parse(savedPositionsStr);
              
              // 삭제된 노드 ID 목록
              const deletedNodeIds = deleteChanges.map(change => change.id);
              
              // 삭제된 노드 ID를 제외한 새 위치 정보 객체 생성
              const updatedPositions = Object.fromEntries(
                Object.entries(savedPositions).filter(([id]) => !deletedNodeIds.includes(id))
              );
              
              // 업데이트된 위치 정보 저장
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPositions));
              
              // 엣지 정보도 업데이트 (삭제된 노드와 연결된 엣지 제거)
              const savedEdgesStr = localStorage.getItem(EDGES_STORAGE_KEY);
              if (savedEdgesStr) {
                const savedEdges = JSON.parse(savedEdgesStr);
                const updatedEdges = savedEdges.filter(
                  (edge: any) => 
                    !deletedNodeIds.includes(edge.source) && 
                    !deletedNodeIds.includes(edge.target)
                );
                localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
              }
            }
          } catch (err) {
            console.error('노드 삭제 정보 저장 실패:', err);
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
        const state = get();
        
        // 소스 노드와 타겟 노드가 같은 경우 연결 방지
        if (connection.source === connection.target) {
          toast.error('같은 카드에 연결할 수 없습니다.');
          return;
        }
        
        // 노드 정보 확인
        const sourceNode = state.nodes.find(node => node.id === connection.source);
        const targetNode = state.nodes.find(node => node.id === connection.target);
        
        if (sourceNode && targetNode) {
          // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
          const firstNode = state.nodes[0];
          const isHorizontal = firstNode?.targetPosition === Position.Left;
          
          // 핸들 ID 설정
          let sourceHandle = connection.sourceHandle;
          let targetHandle = connection.targetHandle;
          
          // 핸들 ID가 없는 경우 기본값 설정
          if (!sourceHandle) {
            sourceHandle = isHorizontal ? 'right' : 'bottom';
          }
          if (!targetHandle) {
            targetHandle = isHorizontal ? 'left' : 'top';
          }
          
          // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
          const edgeId = `${connection.source}-${connection.target}-${Date.now()}`;
          
          // 기본 에지 스타일과 데이터 설정
          const newEdge: Edge = {
            ...connection,
            id: edgeId,
            sourceHandle,
            targetHandle,
            type: 'custom', // 커스텀 엣지 타입 사용
            animated: state.boardSettings.animated,
            style: {
              strokeWidth: state.boardSettings.strokeWidth,
              stroke: state.boardSettings.edgeColor,
            },
            // 방향 표시가 활성화된 경우에만 마커 추가
            markerEnd: state.boardSettings.markerEnd ? {
              type: MarkerType.ArrowClosed,
              width: state.boardSettings.strokeWidth * 2,
              height: state.boardSettings.strokeWidth * 2,
              color: state.boardSettings.edgeColor,
            } : undefined,
            data: {
              edgeType: state.boardSettings.connectionLineType,
              settings: { ...state.boardSettings }
            },
          };
          
          // 새 Edge 추가
          const newEdges = addEdge(newEdge, state.edges);
          set({ 
            edges: newEdges,
            hasUnsavedChanges: true
          });
          
          // 엣지 저장
          state.saveEdges(newEdges);
          
          // 성공 메시지
          toast.success('카드가 연결되었습니다.');
        }
      },
      
      // 보드 설정 관련 초기 상태 및 함수
      boardSettings: DEFAULT_BOARD_SETTINGS,
      setBoardSettings: (settings) => set({ boardSettings: settings }),
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
      
      // 레이아웃 관련 함수
      applyLayout: (direction) => {
        const state = get();
        const { nodes: layoutedNodes, edges: layoutedEdges } = 
          getLayoutedElements(state.nodes, state.edges, direction);
        
        // 노드와 엣지 업데이트
        set({ 
          nodes: layoutedNodes as Node<CardData>[],
          edges: layoutedEdges,
          hasUnsavedChanges: true
        });
        
        toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
      },
      applyGridLayout: () => {
        const state = get();
        const layoutedNodes = getGridLayout(state.nodes) as unknown as Node<CardData>[];
        
        set({ 
          nodes: layoutedNodes,
          hasUnsavedChanges: true
        });
        
        state.saveLayout(layoutedNodes);
        toast.success("카드가 격자 형태로 배치되었습니다.");
      },
      
      // 저장 관련 함수
      saveLayout: (nodesToSave) => {
        const nodes = nodesToSave || get().nodes;
        try {
          // 노드 ID와 위치만 저장
          const nodePositions = nodes.reduce((acc: Record<string, { position: XYPosition }>, node: Node<CardData>) => {
            acc[node.id] = { position: node.position };
            return acc;
          }, {});
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nodePositions));
          set({ hasUnsavedChanges: false });
          return true;
        } catch (err) {
          console.error('레이아웃 저장 실패:', err);
          return false;
        }
      },
      saveEdges: (edgesToSave) => {
        const edges = edgesToSave || get().edges;
        try {
          localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
          set({ hasUnsavedChanges: false });
          return true;
        } catch (err) {
          console.error('엣지 저장 실패:', err);
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
        const state = get();
        
        // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
        const edgeId = `${sourceId}-${targetId}-${Date.now()}`;
        
        // 새 엣지 객체 생성
        const newEdge: Edge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: state.boardSettings.animated,
          style: {
            strokeWidth: state.boardSettings.strokeWidth,
            stroke: state.boardSettings.edgeColor,
          },
          // 방향 표시가 활성화된 경우에만 마커 추가
          markerEnd: state.boardSettings.markerEnd ? {
            type: MarkerType.ArrowClosed,
            width: state.boardSettings.strokeWidth * 2,
            height: state.boardSettings.strokeWidth * 2,
            color: state.boardSettings.edgeColor,
          } : undefined,
          data: {
            edgeType: state.boardSettings.connectionLineType,
            settings: { ...state.boardSettings }
          },
        };
        
        // 엣지 배열에 추가
        const newEdges = [...state.edges, newEdge];
        set({ 
          edges: newEdges, 
          hasUnsavedChanges: true 
        });
        
        // 엣지 상태 저장
        state.saveEdges(newEdges);
        
        return newEdge;
      },
      
      // 변경 사항 추적
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      
      // 리액트 플로우 인스턴스
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
    }),
    {
      name: 'board-store',
      partialize: (state) => ({
        boardSettings: state.boardSettings,
      }),
    }
  )
); 