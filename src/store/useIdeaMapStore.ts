/**
 * 파일명: useIdeaMapStore.ts
 * 목적: Zustand를 활용한 아이디어맵 관련 전역 상태 관리
 * 역할: 아이디어맵의 노드, 엣지, 설정 등 모든 상태를 중앙 관리
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
  IdeaMapSettings, 
  DEFAULT_IDEAMAP_SETTINGS, 
  loadIdeaMapSettings, 
  saveIdeaMapSettings,
  applyIdeaMapEdgeSettings,
  loadIdeaMapSettingsFromServer,
  saveIdeaMapSettingsToServer,
  updateIdeaMapSettingsOnServer
} from '@/lib/ideamap-utils';
import { IDEAMAP_LAYOUT_STORAGE_KEY, IDEAMAP_EDGES_STORAGE_KEY, IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { toast } from 'sonner';
import { CardData } from '@/components/ideamap/types/ideamap-types';
import { useAppStore } from './useAppStore';

// 아이디어맵 스토어 상태 인터페이스
interface IdeaMapState {
  // 노드 관련 상태
  nodes: Node<CardData>[];
  setNodes: (nodes: Node<CardData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  
  // 엣지 관련 상태
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // 아이디어맵 설정 관련 상태
  ideaMapSettings: IdeaMapSettings;
  setIdeaMapSettings: (settings: IdeaMapSettings) => void;
  updateIdeaMapSettings: (settings: Partial<IdeaMapSettings>, isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 레이아웃 관련 함수
  applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void;
  applyGridLayout: () => void;
  
  // 저장 관련 함수
  saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
  saveEdges: (edgesToSave?: Edge[]) => boolean;
  saveAllLayoutData: () => boolean;
  
  // 엣지 스타일 업데이트
  updateEdgeStyles: (settings: IdeaMapSettings) => void;
  
  // 서버 동기화 함수
  loadIdeaMapSettingsFromServerIfAuthenticated: (isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 엣지 생성 함수
  createEdgeOnDrop: (sourceId: string, targetId: string) => Edge;
  
  // 변경 사항 추적
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  
  // 리액트 플로우 인스턴스
  reactFlowInstance: any;
  setReactFlowInstance: (instance: any) => void;
  
  // 아이디어맵 데이터 로딩 상태 및 액션
  isIdeaMapLoading: boolean;
  ideaMapError: string | null;
  loadedViewport: Viewport | null;
  needsFitView: boolean;
  loadIdeaMapData: () => Promise<void>;
  
  // 추가된 상태 및 액션
  viewportToRestore: Viewport | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  
  // useIdeaMapUtils에서 이전된 액션들
  loadAndApplyIdeaMapSettings: (userId: string) => Promise<void>;
  updateAndSaveIdeaMapSettings: (newSettings: Partial<IdeaMapSettings>, userId?: string) => Promise<void>;
  saveViewport: () => void;
  restoreViewport: () => void;
  saveIdeaMapState: () => boolean;

  // 노드 추가 관련 액션
  addNodeAtPosition: (type: string, position: XYPosition, data?: any) => Promise<Node<CardData> | null>;
  addCardAtCenterPosition: (cardData: any) => Promise<Node<CardData> | null>;
  createEdgeAndNodeOnDrop: (cardData: any, position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => Promise<Node<CardData> | null>;

  // 새로 추가한 액션들 (useNodes 훅에서 이전)
  applyNodeChangesAction: (changes: NodeChange[]) => void;
  removeNodesAndRelatedEdgesFromStorage: (deletedNodeIds: string[]) => void;
  addNodeAction: (newNodeData: Omit<Node<CardData>, 'id' | 'position'> & { position?: XYPosition }) => Promise<Node<CardData> | null>;
  deleteNodeAction: (nodeId: string) => void;
  saveNodesAction: () => boolean;

  // 새로 추가할 엣지 관련 액션들 (useEdges 훅에서 이전)
  applyEdgeChangesAction: (changes: EdgeChange[]) => void;
  removeEdgesFromStorage: (deletedEdgeIds: string[]) => void;
  connectNodesAction: (connection: Connection) => void;
  saveEdgesAction: () => boolean;
  updateAllEdgeStylesAction: () => void;
  createEdgeOnDropAction: (sourceId: string, targetId: string) => Edge;
}

// 아이디어맵 스토어 생성
export const useIdeaMapStore = create<IdeaMapState>()(
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
            animated: state.ideaMapSettings.animated,
            style: {
              stroke: state.ideaMapSettings.edgeColor,
              strokeWidth: state.ideaMapSettings.strokeWidth,
            },
            markerEnd: state.ideaMapSettings.markerEnd ? {
              type: state.ideaMapSettings.markerEnd,
              width: state.ideaMapSettings.markerSize,
              height: state.ideaMapSettings.markerSize,
              color: state.ideaMapSettings.edgeColor,
            } : undefined,
            data: {
              edgeType: state.ideaMapSettings.connectionLineType,
              settings: {
                animated: state.ideaMapSettings.animated,
                connectionLineType: state.ideaMapSettings.connectionLineType,
                strokeWidth: state.ideaMapSettings.strokeWidth,
                edgeColor: state.ideaMapSettings.edgeColor,
                selectedEdgeColor: state.ideaMapSettings.selectedEdgeColor,
              }
            }
          }, state.edges),
          hasUnsavedChanges: true
        }));
      },
      
      // 아이디어맵 설정 관련 초기 상태 및 함수
      ideaMapSettings: DEFAULT_IDEAMAP_SETTINGS,
      isSettingsLoading: false,
      settingsError: null,
      viewportToRestore: null,
      setIdeaMapSettings: (settings) => {
        set({ ideaMapSettings: settings });
        saveIdeaMapSettings(settings);
      },
      updateIdeaMapSettings: async (partialSettings, isAuthenticated, userId) => {
        const currentSettings = get().ideaMapSettings;
        const newSettings = { ...currentSettings, ...partialSettings };
        
        console.log('[IdeaMapStore] 아이디어맵 설정 변경:', newSettings);
        
        // 1. 전역 상태 업데이트
        set({ ideaMapSettings: newSettings });
        
        // 2. 새 설정을 엣지에 적용
        const updatedEdges = applyIdeaMapEdgeSettings(get().edges, newSettings);
        set({ edges: updatedEdges });
        
        // 3. 인증된 사용자인 경우 서버에도 저장
        if (isAuthenticated && userId) {
          try {
            await saveIdeaMapSettingsToServer(userId, newSettings);
            toast.success('아이디어맵 설정이 저장되었습니다');
          } catch (err) {
            console.error('[IdeaMapStore] 서버 저장 실패:', err);
            toast.error('서버에 설정 저장 실패');
          }
        }
      },
      
      // 아이디어맵 데이터 로딩 상태 및 함수 (신규 추가)
      isIdeaMapLoading: true,
      ideaMapError: null,
      loadedViewport: null,
      needsFitView: false,
      
      /**
       * loadIdeaMapData: 아이디어맵 데이터(노드, 엣지)를 로드하는 액션
       * API에서 카드 데이터를 가져와 노드 데이터로 변환하고 
       * 로컬 스토리지에서 위치, 엣지, 뷰포트 정보를 불러와 적용
       */
      loadIdeaMapData: async () => {
        // 이미 로딩 중이면 중복 호출 방지
        if (get().isIdeaMapLoading) {
          return;
        }
        
        set({ 
          isIdeaMapLoading: true, 
          ideaMapError: null, 
          loadedViewport: null, 
          needsFitView: false 
        });
        console.log('[loadIdeaMapData Action] 아이디어맵 데이터 로딩 시작');
        try {
          // 1. API 호출
          const response = await fetch('/api/cards');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `데이터 불러오기 실패 (상태: ${response.status})`);
          }
          const cards = await response.json();
          console.log('[loadIdeaMapData Action] API 카드 데이터:', cards);

          // 2. 로컬 스토리지에서 노드 위치, 엣지, 뷰포트 정보 읽기
          let nodePositions: Record<string, { position: XYPosition }> = {};
          let savedEdges: Edge[] = [];
          let savedViewport: Viewport | null = null;

          try {
            const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_KEY);
            if (savedPositionsStr) nodePositions = JSON.parse(savedPositionsStr);

            const savedEdgesStr = localStorage.getItem(IDEAMAP_EDGES_KEY);
            if (savedEdgesStr) savedEdges = JSON.parse(savedEdgesStr);

            const transformString = localStorage.getItem(IDEAMAP_TRANSFORM_KEY);
            if (transformString) savedViewport = JSON.parse(transformString);
          } catch (err) {
            console.error('[loadIdeaMapData Action] 로컬 스토리지 읽기 오류:', err);
            toast.error('저장된 아이디어맵 레이아웃을 불러오는 중 문제가 발생했습니다.');
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
          const boardSettings = get().ideaMapSettings;
          const finalEdges = applyIdeaMapEdgeSettings(savedEdges, boardSettings);

          // 5. 스토어 상태 업데이트
          set({
            nodes,
            edges: finalEdges,
            isIdeaMapLoading: false,
            loadedViewport: savedViewport,
            needsFitView: !savedViewport,
            ideaMapError: null,
          });
          
          // 6. 카드 데이터를 전역 상태에 저장 (useAppStore)
          // 현재의 카드 데이터와 새로 가져온 카드 데이터를 비교하여 변경사항이 있을 때만 설정
          const currentCards = useAppStore.getState().cards;
          const hasCardsChanged = 
            currentCards.length !== cards.length || 
            // 모든 카드를 비교하여 변경된 부분이 있는지 확인
            cards.some((newCard: any) => {
              const existingCard = currentCards.find(card => card.id === newCard.id);
              if (!existingCard) return true; // 새 카드가 추가됨
              
              // 주요 속성 비교 (제목, 내용, 태그)
              return (
                existingCard.title !== newCard.title ||
                existingCard.content !== newCard.content ||
                // 태그 비교 로직은 필요에 따라 구현
                JSON.stringify(existingCard.cardTags) !== JSON.stringify(newCard.cardTags)
              );
            });

          if (hasCardsChanged) {
            console.log('[loadIdeaMapData Action] 카드 데이터가 변경되어 상태를 업데이트합니다');
            useAppStore.getState().setCards(cards);
          } else {
            console.log('[loadIdeaMapData Action] 카드 데이터가 변경되지 않아 상태 업데이트를 건너뜁니다');
          }

          toast.success('아이디어맵 데이터를 성공적으로 불러왔습니다.');

        } catch (error: any) {
          console.error('[loadIdeaMapData Action] 아이디어맵 데이터 로딩 실패:', error);
          set({ 
            isIdeaMapLoading: false, 
            ideaMapError: error.message,
            nodes: [],
            edges: []
          });
          toast.error(`아이디어맵 데이터 로딩 실패: ${error.message}`);
        }
      },
      
      // 레이아웃 함수
      applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => {
        const { nodes, edges, ideaMapSettings } = get();
        
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
          localStorage.setItem(IDEAMAP_LAYOUT_KEY, JSON.stringify(positionsData));
          
          return true;
        } catch (error) {
          console.error('[IdeaMapStore] 레이아웃 저장 중 오류:', error);
          return false;
        }
      },
      
      saveEdges: (edgesToSave) => {
        try {
          // 엣지 배열 결정
          const edges = edgesToSave || get().edges;
          
          // 로컬 스토리지에 저장
          localStorage.setItem(IDEAMAP_EDGES_KEY, JSON.stringify(edges));
          
          return true;
        } catch (error) {
          console.error('[IdeaMapStore] 엣지 저장 중 오류:', error);
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
          // applyIdeaMapEdgeSettings 함수는 새 엣지 배열을 반환함
          const updatedEdges = applyIdeaMapEdgeSettings(state.edges, settings);
          
          // 엣지 배열 자체가 변경된 경우에만 setEdges 호출
          if (JSON.stringify(updatedEdges) !== JSON.stringify(state.edges)) {
            set({ edges: updatedEdges });
          }
        } catch (error) {
          console.error('[IdeaMapStore] 엣지 스타일 업데이트 중 오류:', error);
        }
      },
      
      // 서버 동기화 함수
      loadIdeaMapSettingsFromServerIfAuthenticated: async (isAuthenticated, userId) => {
        if (isAuthenticated && userId) {
          try {
            const settings = await loadIdeaMapSettingsFromServer(userId);
            if (settings) {
              const state = get();
              
              // 전역 상태 업데이트
              set({ ideaMapSettings: settings });
              
              // 새 설정을 엣지에 적용
              const updatedEdges = applyIdeaMapEdgeSettings(state.edges, settings);
              set({ edges: updatedEdges });
            }
          } catch (err) {
            console.error('서버에서 아이디어맵 설정 불러오기 실패:', err);
          }
        }
      },
      
      // 엣지 생성 함수
      createEdgeOnDrop: (sourceId, targetId) => {
        const { ideaMapSettings } = get();
        
        // 새 엣지 생성
        const newEdge: Edge = {
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: ideaMapSettings.animated,
          style: {
            stroke: ideaMapSettings.edgeColor,
            strokeWidth: ideaMapSettings.strokeWidth,
          },
          markerEnd: ideaMapSettings.markerEnd ? {
            type: ideaMapSettings.markerEnd,
            width: ideaMapSettings.markerSize,
            height: ideaMapSettings.markerSize,
            color: ideaMapSettings.edgeColor,
          } : undefined,
          data: {
            edgeType: ideaMapSettings.connectionLineType,
            settings: {
              animated: ideaMapSettings.animated,
              connectionLineType: ideaMapSettings.connectionLineType,
              strokeWidth: ideaMapSettings.strokeWidth,
              edgeColor: ideaMapSettings.edgeColor,
              selectedEdgeColor: ideaMapSettings.selectedEdgeColor,
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
      
      // useIdeaMapUtils에서 이전된 액션들
      loadAndApplyIdeaMapSettings: async (userId) => {
        if (!userId) {
          console.error('사용자 ID가 제공되지 않았습니다');
          return;
        }

        set({ isSettingsLoading: true, settingsError: null });

        try {
          // 서버에서 설정 불러오기
          const settings = await loadIdeaMapSettingsFromServer(userId);
          
          if (settings) {
            // 1. 아이디어맵 설정 상태 업데이트
            set({ ideaMapSettings: settings });
            
            // 2. 로컬 스토리지에 저장
            saveIdeaMapSettings(settings);
            
            // 3. 새 설정을 엣지에 적용
            const updatedEdges = applyIdeaMapEdgeSettings(get().edges, settings);
            set({ edges: updatedEdges });
            
            set({ isSettingsLoading: false });
            toast.success('아이디어맵 설정을 불러왔습니다');
          } else {
            // 설정이 없는 경우 기본 설정 사용
            set({ 
              ideaMapSettings: DEFAULT_IDEAMAP_SETTINGS, 
              isSettingsLoading: false 
            });
            console.log('서버에 저장된 설정이 없어 기본 설정을 사용합니다');
          }
        } catch (error: any) {
          console.error('아이디어맵 설정 로드 중 오류:', error);
          set({ 
            isSettingsLoading: false, 
            settingsError: error.message || '알 수 없는 오류' 
          });
          toast.error(`아이디어맵 설정 로드 실패: ${error.message || '알 수 없는 오류'}`);
        }
      },
      
      updateAndSaveIdeaMapSettings: async (newSettings, userId) => {
        const currentSettings = get().ideaMapSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        // 1. 상태 업데이트
        set({ 
          ideaMapSettings: updatedSettings, 
          isSettingsLoading: true,
          settingsError: null
        });
        
        // 2. 로컬 스토리지에 저장
        saveIdeaMapSettings(updatedSettings);
        
        // 3. 새 설정을 엣지에 적용
        const updatedEdges = applyIdeaMapEdgeSettings(get().edges, updatedSettings);
        set({ edges: updatedEdges });
        
        // 4. 인증된 사용자인 경우 서버에도 저장
        if (userId) {
          try {
            await saveIdeaMapSettingsToServer(userId, updatedSettings);
            set({ isSettingsLoading: false });
            toast.success('아이디어맵 설정이 저장되었습니다');
          } catch (error: any) {
            console.error('서버에 아이디어맵 설정 저장 중 오류:', error);
            set({ 
              isSettingsLoading: false,
              settingsError: error.message || '알 수 없는 오류'
            });
            toast.error(`서버에 설정 저장 실패: ${error.message || '알 수 없는 오류'}`);
          }
        } else {
          set({ isSettingsLoading: false });
          toast.info('아이디어맵 설정이 로컬에 저장되었습니다');
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
          localStorage.setItem(IDEAMAP_TRANSFORM_KEY, JSON.stringify(viewport));
          console.log('[IdeaMapStore] 뷰포트 저장 완료:', viewport);
          
          toast.info('현재 보기가 저장되었습니다');
        } catch (error) {
          console.error('뷰포트 저장 중 오류:', error);
          toast.error('뷰포트 저장에 실패했습니다');
        }
      },
      
      restoreViewport: () => {
        try {
          // 로컬 스토리지에서 뷰포트 정보 읽기
          const transformString = localStorage.getItem(IDEAMAP_TRANSFORM_KEY);
          
          if (!transformString) {
            toast.info('저장된 보기가 없습니다');
            return;
          }
          
          // 저장된 뷰포트 정보 파싱
          const viewport: Viewport = JSON.parse(transformString);
          
          // 복원할 뷰포트 상태 설정
          set({ viewportToRestore: viewport });
          
          console.log('[IdeaMapStore] 뷰포트 복원 예정:', viewport);
        } catch (error) {
          console.error('뷰포트 복원 중 오류:', error);
          toast.error('저장된 보기를 복원할 수 없습니다');
        }
      },
      
      // 노드를 주어진 위치에 추가하는 액션
      addNodeAtPosition: async (type, position, droppedData = {}) => {
        try {
          // 1. 새 노드 ID 생성
          const newNodeId = `card_${Date.now()}`;

          // 2. 새 노드 객체 생성
          const newNode: Node<CardData> = {
            id: newNodeId,
            type: type || 'card',
            position,
            data: {
              id: newNodeId,
              title: droppedData.title || '새 카드',
              content: droppedData.content || '',
              tags: droppedData.tags || [],
              ...droppedData
            },
          };

          // 3. 현재 노드 상태에 새 노드 추가
          set((state) => ({
            nodes: [...state.nodes, newNode],
            hasUnsavedChanges: true
          }));

          // 4. 레이아웃 저장
          const state = get();
          const saved = state.saveLayout();
          
          if (saved) {
            // 5. 성공 토스트 알림
            toast.success(`"${newNode.data.title}" 카드가 추가되었습니다.`);
          } else {
            toast.warning('카드 추가됨, 저장 실패');
          }

          return newNode;
        } catch (error: any) {
          console.error('[addNodeAtPosition Action] 노드 추가 실패:', error);
          toast.error(`노드 추가 실패: ${error.message}`);
          return null;
        }
      },

      // 카드를 중앙 위치에 추가하는 액션
      addCardAtCenterPosition: async (cardData) => {
        const state = get();
        const reactFlowInstance = state.reactFlowInstance;
        
        if (!reactFlowInstance) {
          toast.error('ReactFlow 인스턴스가 초기화되지 않았습니다');
          return null;
        }
        
        try {
          // 뷰포트 중앙 또는 기본 위치 계산
          const viewport = reactFlowInstance.getViewport();
          const centerPosition = {
            x: viewport.x + (viewport.width / 2) - 75, // 카드 너비의 절반 만큼 조정
            y: viewport.y + (viewport.height / 2) - 50  // 카드 높이의 절반 만큼 조정
          };
          
          return await state.addNodeAtPosition('card', centerPosition, cardData);
        } catch (error: any) {
          console.error('[addCardAtCenterPosition Action] 카드 추가 실패:', error);
          toast.error(`중앙에 카드 추가 실패: ${error.message}`);
          return null;
        }
      },

      // 엣지와 노드를 동시에 생성하는 액션
      createEdgeAndNodeOnDrop: async (cardData, position, connectingNodeId, handleType) => {
        const state = get();
        
        try {
          // 1. 노드 추가
          const newNode = await state.addNodeAtPosition('card', position, cardData);
          
          if (!newNode) {
            throw new Error('노드 생성 실패');
          }
          
          // 2. 엣지 추가
          let connection: Connection;
          
          if (handleType === 'source') {
            // 연결 노드가 출발점
            connection = {
              source: connectingNodeId,
              target: newNode.id,
              sourceHandle: null,
              targetHandle: null
            };
          } else {
            // 연결 노드가 도착점
            connection = {
              source: newNode.id,
              target: connectingNodeId,
              sourceHandle: null,
              targetHandle: null
            };
          }
          
          // 엣지 생성 및 추가
          state.onConnect(connection);
          
          // 3. 데이터 저장
          state.saveIdeaMapState();
          
          toast.success('카드 및 연결선이 생성되었습니다');
          return newNode;
        } catch (error: any) {
          console.error('[createEdgeAndNodeOnDrop Action] 노드 및 엣지 생성 실패:', error);
          toast.error(`카드 및 연결선 생성 실패: ${error.message}`);
          return null;
        }
      },
      
      saveIdeaMapState: () => {
        const state = get();
        const layoutSaved = state.saveLayout();
        const edgesSaved = state.saveEdges();
        const transformSaved = state.saveViewport();
        
        if (layoutSaved && edgesSaved) {
          set({ hasUnsavedChanges: false });
          toast.success('아이디어맵 상태가 저장되었습니다');
          return true;
        }
        
        toast.error('아이디어맵 상태 저장에 실패했습니다');
        return false;
      },
      
      /**
       * applyNodeChangesAction: 노드 변경사항을 적용하는 액션
       * @param changes 노드 변경 사항 배열
       */
      applyNodeChangesAction: (changes: NodeChange[]) => {
        // 삭제된 노드가 있는지 확인
        const deleteChanges = changes.filter(change => change.type === 'remove');
        
        // 삭제된 노드가 있으면 로컬 스토리지에서도 해당 노드 정보를 제거
        if (deleteChanges.length > 0) {
          const deletedNodeIds = deleteChanges.map(change => change.id);
          get().removeNodesAndRelatedEdgesFromStorage(deletedNodeIds);
        }
        
        // 위치 변경이 있는 경우 저장 상태 업데이트
        const positionChanges = changes.filter(
          change => change.type === 'position' && change.dragging === false
        );
        
        if (positionChanges.length > 0 || deleteChanges.length > 0) {
          set({ hasUnsavedChanges: true });
        }
        
        // 노드 변경 적용
        set(state => ({
          nodes: applyNodeChanges(changes, state.nodes) as Node<CardData>[]
        }));
      },
      
      /**
       * removeNodesAndRelatedEdgesFromStorage: 로컬 스토리지에서 노드와 관련 엣지 정보를 제거하는 액션
       * @param deletedNodeIds 삭제된 노드 ID 배열
       */
      removeNodesAndRelatedEdgesFromStorage: (deletedNodeIds: string[]) => {
        try {
          // 현재 저장된 노드 위치 정보 가져오기
          const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_KEY);
          if (savedPositionsStr) {
            const savedPositions = JSON.parse(savedPositionsStr);
            
            // 삭제된 노드 ID를 제외한 새 위치 정보 객체 생성
            const updatedPositions = Object.fromEntries(
              Object.entries(savedPositions).filter(([id]) => !deletedNodeIds.includes(id))
            );
            
            // 업데이트된 위치 정보 저장
            localStorage.setItem(IDEAMAP_LAYOUT_KEY, JSON.stringify(updatedPositions));
            
            // 엣지 정보도 업데이트 (삭제된 노드와 연결된 엣지 제거)
            const savedEdgesStr = localStorage.getItem(IDEAMAP_EDGES_KEY);
            if (savedEdgesStr) {
              const savedEdges = JSON.parse(savedEdgesStr);
              const updatedEdges = savedEdges.filter(
                (edge: any) => 
                  !deletedNodeIds.includes(edge.source) && 
                  !deletedNodeIds.includes(edge.target)
              );
              localStorage.setItem(IDEAMAP_EDGES_KEY, JSON.stringify(updatedEdges));
            }
          }
        } catch (err) {
          console.error('노드 삭제 정보 저장 실패:', err);
          toast.error('노드 삭제 정보 저장에 실패했습니다.');
        }
      },
      
      /**
       * addNodeAction: 새 노드를 추가하는 액션
       * @param newNodeData 새 노드 데이터 (id와 position 제외)
       * @returns 생성된 노드 또는 null (실패 시)
       */
      addNodeAction: async (newNodeData) => {
        try {
          // 새 노드 ID 생성
          const nodeId = `node-${Date.now()}`;
          
          // 노드 위치 계산
          const position = newNodeData.position || { x: 0, y: 0 };
          
          // 새 노드 생성
          const newNode: Node<CardData> = {
            id: nodeId,
            position,
            type: 'card',
            ...newNodeData,
          };
          
          // 노드 추가
          set(state => ({
            nodes: [...state.nodes, newNode],
            hasUnsavedChanges: true
          }));
          
          toast.success(`'${newNode.data.title}' 노드가 추가되었습니다`);
          
          return newNode;
        } catch (err) {
          console.error('노드 추가 실패:', err);
          toast.error('노드 추가에 실패했습니다');
          return null;
        }
      },
      
      /**
       * deleteNodeAction: 노드를 삭제하는 액션
       * @param nodeId 삭제할 노드 ID
       */
      deleteNodeAction: (nodeId) => {
        try {
          // 노드 데이터 가져오기 (토스트 메시지용)
          const nodeToDelete = get().nodes.find(node => node.id === nodeId);
          
          // 노드 삭제
          set(state => ({
            nodes: state.nodes.filter(node => node.id !== nodeId)
          }));
          
          // 연결된 엣지 삭제
          set(state => ({
            edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
          }));
          
          // 로컬 스토리지에서 삭제
          get().removeNodesAndRelatedEdgesFromStorage([nodeId]);
          
          // 변경 사항 플래그 업데이트
          set({ hasUnsavedChanges: true });
          
          // 성공 메시지
          if (nodeToDelete) {
            toast.success(`'${nodeToDelete.data.title}' 노드가 삭제되었습니다`);
          } else {
            toast.success('노드가 삭제되었습니다');
          }
          
        } catch (err) {
          console.error('노드 삭제 실패:', err);
          toast.error('노드 삭제에 실패했습니다');
        }
      },
      
      /**
       * saveNodesAction: 노드 위치 정보를 로컬 스토리지에 저장하는 액션
       * @returns 저장 성공 여부
       */
      saveNodesAction: () => {
        try {
          const nodes = get().nodes;
          
          // 노드 ID와 위치만 저장
          const nodePositions = nodes.reduce((acc: Record<string, { position: XYPosition }>, node: any) => {
            acc[node.id] = { position: node.position };
            return acc;
          }, {});
          
          localStorage.setItem(IDEAMAP_LAYOUT_KEY, JSON.stringify(nodePositions));
          
          // 변경 사항 플래그 업데이트
          set({ hasUnsavedChanges: false });
          
          toast.success('노드 레이아웃이 저장되었습니다');
          return true;
        } catch (err) {
          console.error('레이아웃 저장 실패:', err);
          toast.error('노드 레이아웃 저장에 실패했습니다');
          return false;
        }
      },
      
      // 엣지 관련 새 액션들
      
      /**
       * applyEdgeChangesAction: 엣지 변경 사항을 적용하는 액션
       * @param changes 엣지 변경 사항 배열
       */
      applyEdgeChangesAction: (changes: EdgeChange[]) => {
        // 삭제된 엣지가 있는지 확인
        const deleteChanges = changes.filter(
          (change) => change.type === 'remove'
        );
        
        // 삭제된 엣지의 ID 추출
        const deletedEdgeIds = deleteChanges.map(
          (change) => (change as any).id
        );
        
        // 엣지 상태 업데이트
        set(state => ({
          edges: applyEdgeChanges(changes, state.edges),
          hasUnsavedChanges: true
        }));
        
        // 삭제된 엣지가 있으면 로컬 스토리지에서도 제거
        if (deletedEdgeIds.length > 0) {
          get().removeEdgesFromStorage(deletedEdgeIds);
        }
      },
      
      /**
       * removeEdgesFromStorage: 삭제된 엣지를 로컬 스토리지에서 제거하는 액션
       * @param deletedEdgeIds 삭제된 엣지 ID 배열
       */
      removeEdgesFromStorage: (deletedEdgeIds: string[]) => {
        try {
          // 로컬 스토리지에서 현재 엣지 정보 가져오기
          const storedEdgesJSON = localStorage.getItem(IDEAMAP_EDGES_KEY);
          if (!storedEdgesJSON) return;
          
          // JSON 파싱
          const storedEdges = JSON.parse(storedEdgesJSON) as Edge[];
          
          // 삭제할 엣지 ID를 제외한 엣지만 필터링
          const updatedEdges = storedEdges.filter(
            (edge) => !deletedEdgeIds.includes(edge.id)
          );
          
          // 업데이트된 엣지 정보를 다시 로컬 스토리지에 저장
          localStorage.setItem(IDEAMAP_EDGES_KEY, JSON.stringify(updatedEdges));
        } catch (err) {
          console.error('엣지 제거 중 오류 발생:', err);
        }
      },
      
      /**
       * connectNodesAction: 노드 간 연결을 생성하는 액션
       * @param connection 연결 파라미터
       */
      connectNodesAction: (connection: Connection) => {
        const { nodes, ideaMapSettings } = get();
        
        // 소스 노드와 타겟 노드가 같은 경우 연결 방지
        if (connection.source === connection.target) {
          toast.error('같은 카드에 연결할 수 없습니다.');
          return;
        }
        
        // 기존 노드 정보
        const sourceNode = nodes.find(node => node.id === connection.source);
        const targetNode = nodes.find(node => node.id === connection.target);
        
        if (!sourceNode || !targetNode) {
          toast.error('연결할 노드를 찾을 수 없습니다.');
          return;
        }
        
        // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
        const firstNode = nodes[0];
        const isHorizontal = firstNode?.targetPosition === Position.Left;
        
        // 핸들 ID 설정 - 이미 suffix를 포함하는 경우는 그대로 사용
        let sourceHandle = connection.sourceHandle;
        let targetHandle = connection.targetHandle;
        
        // 핸들 ID가 없는 경우 기본값 설정
        if (!sourceHandle) {
          sourceHandle = isHorizontal ? 'right-source' : 'bottom-source';
        } else if (!sourceHandle.endsWith('-source')) {
          // 접미사가 없는 경우 추가
          sourceHandle = `${sourceHandle}-source`;
        }
        
        if (!targetHandle) {
          targetHandle = isHorizontal ? 'left-target' : 'top-target';
        } else if (!targetHandle.endsWith('-target')) {
          // 접미사가 없는 경우 추가
          targetHandle = `${targetHandle}-target`;
        }
        
        // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
        const edgeId = `${connection.source}-${connection.target}-${Date.now()}`;
        
        // 기본 에지 스타일과 데이터 설정
        const newEdge: Edge = {
          ...connection,
          id: edgeId,
          sourceHandle,
          targetHandle,
          type: 'custom', // 명시적으로 타입 설정
          animated: ideaMapSettings.animated,
          style: {
            strokeWidth: ideaMapSettings.strokeWidth,
            stroke: ideaMapSettings.edgeColor,
          },
          // 방향 표시가 활성화된 경우에만 마커 추가
          markerEnd: ideaMapSettings.markerEnd ? {
            type: MarkerType.ArrowClosed,
            width: ideaMapSettings.strokeWidth * 2,
            height: ideaMapSettings.strokeWidth * 2,
            color: ideaMapSettings.edgeColor,
          } : undefined,
          data: {
            edgeType: ideaMapSettings.connectionLineType,
            settings: { ...ideaMapSettings },
          },
        };
        
        // 엣지 상태 업데이트
        set(state => {
          // React Flow의 addEdge 함수를 사용하여 엣지 생성
          const newEdges = addEdge(newEdge, state.edges);
          return {
            edges: newEdges,
            hasUnsavedChanges: true
          };
        });
        
        // 엣지 저장 및 성공 메시지
        get().saveEdgesAction();
        toast.success('카드가 연결되었습니다.');
      },
      
      /**
       * saveEdgesAction: 현재 엣지 상태를 로컬 스토리지에 저장하는 액션
       * @returns 저장 성공 여부
       */
      saveEdgesAction: () => {
        try {
          const { edges } = get();
          localStorage.setItem(IDEAMAP_EDGES_KEY, JSON.stringify(edges));
          set({ hasUnsavedChanges: false });
          return true;
        } catch (err) {
          console.error('엣지 저장 실패:', err);
          toast.error(`엣지 저장 실패: ${err instanceof Error ? err.message : String(err)}`);
          return false;
        }
      },
      
      /**
       * updateAllEdgeStylesAction: 아이디어맵 설정에 따라 모든 엣지 스타일을 업데이트하는 액션
       */
      updateAllEdgeStylesAction: () => {
        const { edges, ideaMapSettings } = get();
        
        if (edges.length === 0) return;
        
        try {
          // applyIdeaMapEdgeSettings 함수는 새 엣지 배열을 반환함
          const updatedEdges = applyIdeaMapEdgeSettings(edges, ideaMapSettings);
          
          // 엣지 배열 자체가 변경된 경우에만 setEdges 호출
          if (JSON.stringify(updatedEdges) !== JSON.stringify(edges)) {
            set({
              edges: updatedEdges,
              hasUnsavedChanges: true
            });
          }
        } catch (error) {
          console.error('엣지 스타일 업데이트 중 오류:', error);
        }
      },
      
      /**
       * createEdgeOnDropAction: 드롭 이벤트에 대한 새 엣지를 생성하는 액션
       * @param sourceId 소스 노드 ID
       * @param targetId 타겟 노드 ID
       * @returns 생성된 엣지 객체
       */
      createEdgeOnDropAction: (sourceId: string, targetId: string) => {
        const { ideaMapSettings } = get();
        
        const newEdge: Edge = {
          id: `${sourceId}-${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: ideaMapSettings.animated,
          style: {
            strokeWidth: ideaMapSettings.strokeWidth,
            stroke: ideaMapSettings.edgeColor,
          },
          markerEnd: ideaMapSettings.markerEnd ? {
            type: MarkerType.ArrowClosed,
            width: ideaMapSettings.strokeWidth * 2,
            height: ideaMapSettings.strokeWidth * 2,
            color: ideaMapSettings.edgeColor,
          } : undefined,
          data: {
            edgeType: ideaMapSettings.connectionLineType,
            settings: { ...ideaMapSettings },
          },
        };
        
        const styledEdge = applyIdeaMapEdgeSettings([newEdge], ideaMapSettings)[0];
        return styledEdge;
      },
    }),
    {
      name: 'ideaMap-store',
      partialize: (state) => ({
        ideaMapSettings: state.ideaMapSettings,
      }),
    }
  )
); 