/**
 * 파일명: useIdeaMapStore.ts
 * 목적: Zustand를 활용한 아이디어맵 관련 전역 상태 관리
 * 역할: 아이디어맵의 노드, 엣지, 설정 등 모든 상태를 중앙 관리
 * 작성일: 2025-03-28
 * 수정일: 2023-10-27 : 미사용 함수 제거, any 타입 구체화
 * 수정일: 2024-05-09 : loadIdeaMapData 함수 개선 및 syncCardsWithNodes 함수 추가
 * 수정일: 2024-05-30 : loadIdeaMapData 함수에 노드-카드 동기화 로직 추가
 * 수정일: 2024-06-27 : 노드 생성 관련 디버깅 로깅 강화
 * 수정일: 2024-06-28 : React Flow 초기화 및 노드/엣지 정보 주입 관련 디버깅 로깅 추가
 * 수정일: 2024-07-18 : saveLayout 함수 개선 및 디버깅 로그 추가
 * 수정일: 2025-04-19 : 로그 최적화 - 과도한 콘솔 로그 제거 및 logger.debug로 변경
 * 수정일: 2025-04-19 : 상태 업데이트 최적화 - 다중 set 호출을 하나로 배칭
 * 수정일: 2025-07-18 : 카드가 없을 때 로컬 스토리지의 엣지 정보를 무시하도록 업데이트
 */
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
  Viewport,
  ReactFlowInstance
} from '@xyflow/react';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CardData } from '@/components/ideamap/types/ideamap-types';
import { NODE_TYPES_KEYS } from '@/lib/flow-constants';
import { IDEAMAP_LAYOUT_STORAGE_KEY, IDEAMAP_EDGES_STORAGE_KEY, IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';
import { 
  Settings, 
  DEFAULT_SETTINGS, 
  saveSettings,
  applyIdeaMapEdgeSettings,
  loadSettingsFromServer,
  saveSettingsToServer
} from '@/lib/ideamap-utils';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import createLogger from '@/lib/logger';

import { useAppStore } from './useAppStore';
// 로거 생성
const logger = createLogger('useIdeaMapStore');

// 확장된 Viewport 타입 (width, height 속성 포함)
interface ExtendedViewport extends Viewport {
  width?: number;
  height?: number;
}

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
  ideaMapSettings: Settings;
  setIdeaMapSettings: (settings: Settings) => void;
  updateIdeaMapSettings: (settings: Partial<Settings>, isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 레이아웃 관련 함수
  applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void;
  applyGridLayout: () => void;
  
  // 저장 관련 함수
  saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
  saveEdges: (edgesToSave?: Edge[]) => boolean;
  saveAllLayoutData: () => boolean;
  
  // 엣지 스타일 업데이트
  updateEdgeStyles: (settings: Settings) => void;
  
  // 서버 동기화 함수
  loadIdeaMapSettingsFromServerIfAuthenticated: (isAuthenticated: boolean, userId?: string) => Promise<void>;
  
  // 엣지 생성 함수
  createEdgeOnDrop: (sourceId: string, targetId: string) => Edge;
  
  // 변경 사항 추적
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  
  // 리액트 플로우 인스턴스
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  
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
  updateAndSaveIdeaMapSettings: (newSettings: Partial<Settings>, userId?: string) => Promise<void>;
  saveViewport: () => void;
  restoreViewport: () => void;
  saveIdeaMapState: () => boolean;

  // 노드 추가 관련 액션
  addNodeAtPosition: (type: string, position: XYPosition, data?: Record<string, unknown>) => Promise<Node<CardData> | null>;
  addCardAtCenterPosition: (cardData: CardData) => Promise<Node<CardData> | null>;
  createEdgeAndNodeOnDrop: (cardData: CardData, position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => Promise<Node<CardData> | null>;

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

  // 추가된 함수: 드래그 앤 드롭으로 새 노드 추가하기
  onDrop: (event: React.DragEvent, position: XYPosition) => void;

  // 새로 추가한 액션
  syncCardsWithNodes: (forceRefresh?: boolean) => void;
  
  // 선택적 노드 업데이트 함수 - 변경된 카드에 대해서만 노드 업데이트
  updateNodesSelectively: (changedCards: any[]) => void;
}

// 아이디어맵 스토어 생성
export const useIdeaMapStore = create<IdeaMapState>()(
  persist(
    (set, get) => ({
      // 노드 관련 초기 상태 및 함수
      nodes: [],
      setNodes: (nodes) => {
        logger.debug('setNodes 호출:', { nodeCount: nodes.length });
        set({ nodes, hasUnsavedChanges: true });
      },
      onNodesChange: (changes) => {
        logger.debug('onNodesChange 호출:', { 
          changeCount: changes.length,
          changeTypes: changes.map(c => c.type).join(', ')
        });
        
        // 삭제된 노드가 있는지 확인
        const deleteChanges = changes.filter(
          (change) => change.type === 'remove'
        );
        
        // 삭제된 노드의 ID 추출
        const deletedNodeIds = deleteChanges.map(
          (change) => (change as NodeChange & { id: string }).id
        );
        
        if (deletedNodeIds.length > 0) {
          logger.debug('노드 삭제 감지:', { deletedNodeIds });
        }
        
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
            logger.debug('연결된 엣지 제거:', { 
              이전엣지수: currentEdges.length, 
              제거후엣지수: updatedEdges.length 
            });
            set({ edges: updatedEdges, hasUnsavedChanges: true });
          }
        }
        
        // 위치 변경이 있는 경우 저장 상태 업데이트
        const positionChanges = changes.filter(
          (change) => change.type === 'position' && change.dragging === false
        );
        
        if (positionChanges.length > 0) {
          logger.debug('노드 위치 확정 감지:', { 
            positionChangesCount: positionChanges.length 
          });
        }
        
        if (positionChanges.length > 0 || deleteChanges.length > 0) {
          set({ hasUnsavedChanges: true });
        }
        
        // 노드 변경 적용
        set(state => {
          const updatedNodes = applyNodeChanges(changes, state.nodes) as Node<CardData>[];
          logger.debug('노드 변경 적용 완료:', { 
            이전노드수: state.nodes.length,
            변경후노드수: updatedNodes.length
          });
          return { nodes: updatedNodes };
        });
      },
      
      // 엣지 관련 초기 상태 및 함수
      edges: [],
      setEdges: (edges) => {
        logger.debug('setEdges 호출:', { edgeCount: edges.length });
        set({ edges, hasUnsavedChanges: true });
      },
      onEdgesChange: (changes) => {
        logger.debug('onEdgesChange 호출:', { 
          changeCount: changes.length,
          changeTypes: changes.map(c => c.type).join(', ')
        });
        
        set(state => ({
          edges: applyEdgeChanges(changes, state.edges),
          hasUnsavedChanges: true
        }));
      },
      onConnect: (connection) => {
        logger.debug('onConnect 호출:', connection);
        
        set(state => {
          const newEdge = addEdge({
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
          }, state.edges);
          
          logger.debug('새 엣지 생성 완료:', { 
            엣지ID: newEdge[newEdge.length - 1]?.id,
            총엣지수: newEdge.length
          });
          
          return {
            edges: newEdge,
            hasUnsavedChanges: true
          };
        });
      },
      
      // 아이디어맵 설정 관련 초기 상태 및 함수
      ideaMapSettings: DEFAULT_SETTINGS,
      isSettingsLoading: false,
      settingsError: null,
      viewportToRestore: null,
      setIdeaMapSettings: (settings) => {
        set({ ideaMapSettings: settings });
        saveSettings(settings);
      },
      updateIdeaMapSettings: async (partialSettings, isAuthenticated, userId) => {
        const currentSettings = get().ideaMapSettings;
        const newSettings = { ...currentSettings, ...partialSettings };
        
        logger.debug('아이디어맵 설정 변경:', newSettings);
        
        // 1. 전역 상태 업데이트
        set({ ideaMapSettings: newSettings });
        
        // 2. 새 설정을 엣지에 적용
        const updatedEdges = applyIdeaMapEdgeSettings(get().edges, newSettings);
        set({ edges: updatedEdges });
        
        // 3. 인증된 사용자인 경우 서버에도 저장
        if (isAuthenticated && userId) {
          try {
            await saveSettingsToServer(newSettings, userId);
            // lotoast.success('아이디어맵 설정이 저장되었습니다');
            logger.debug('아이디어맵 설정이 저장되었습니다');
          } catch (err) {
            logger.error('서버 저장 실패:', err);
            // toast.error('서버에 설정 저장 실패');
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
          logger.debug('이미 데이터 로딩 중, 중복 호출 방지');
          return;
        }
        
        // 로딩 상태 초기화
        set({ 
          isIdeaMapLoading: true, 
          ideaMapError: null, 
          loadedViewport: null, 
          needsFitView: false 
        });
        
        logger.debug('아이디어맵 데이터 로딩 시작');
        try {
          // 1. API 호출
          logger.debug('카드 데이터 API 호출');
          const response = await fetch('/api/cards');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `데이터 불러오기 실패 (상태: ${response.status})`);
          }
          const cards = await response.json();
          logger.debug('API 카드 데이터 로드 완료:', { 카드수: cards.length });

          // 2. 로컬 스토리지에서 노드 위치, 엣지, 뷰포트 정보 읽기
          logger.debug('로컬 스토리지에서 레이아웃 데이터 로드 시작');
          let nodePositions: Record<string, { position: XYPosition }> = {};
          let savedEdges: Edge[] = [];
          let savedViewport: Viewport | null = null;

          try {
            const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
            if (savedPositionsStr) {
              nodePositions = JSON.parse(savedPositionsStr);
              logger.debug('저장된 노드 위치 로드 완료:', { 
                노드수: Object.keys(nodePositions).length,
                데이터샘플: Object.keys(nodePositions).length > 0 ? 
                  nodePositions[Object.keys(nodePositions)[0]] : null
              });
            } else {
              logger.debug('저장된 노드 위치 없음, 기본 위치 사용 예정');
            }

            // 카드가 있을 때만 저장된 엣지 정보를 로드
            if (cards.length > 0) {
              const savedEdgesStr = localStorage.getItem(IDEAMAP_EDGES_STORAGE_KEY);
              if (savedEdgesStr) {
                savedEdges = JSON.parse(savedEdgesStr);
                logger.debug('저장된 엣지 로드 완료:', { 엣지수: savedEdges.length });
              } else {
                logger.debug('저장된 엣지 없음, 빈 배열 사용');
              }
            } else {
              logger.debug('카드가 없어 저장된 엣지 정보를 무시합니다.');
              // 카드가 없는 경우 로컬 스토리지의 엣지 정보를 초기화
              localStorage.removeItem(IDEAMAP_EDGES_STORAGE_KEY);
            }

            const transformString = localStorage.getItem(IDEAMAP_TRANSFORM_STORAGE_KEY);
            if (transformString) {
              savedViewport = JSON.parse(transformString);
              logger.debug('저장된 뷰포트 로드 완료:', savedViewport);
            } else {
              logger.debug('저장된 뷰포트 없음, fitView 필요 설정');
            }
          } catch (err) {
            logger.error('로컬 스토리지 읽기 오류:', err);
            // toast.error('저장된 아이디어맵 레이아웃을 불러오는 중 문제가 발생했습니다.');
          }

          // 3. 노드 데이터 생성 및 위치 적용
          logger.debug('카드 데이터를 노드로 변환 시작');
          const nodes: Node<CardData>[] = cards.map((card: CardData, index: number) => {
            // 저장된 위치 정보 가져오기 - 새로운 구조 적용
            let savedPosition: XYPosition | undefined;
            
            if (nodePositions[card.id] && nodePositions[card.id].position) {
              savedPosition = nodePositions[card.id].position;
              logger.debug(`저장된 위치 발견 - 카드 ID: ${card.id}`);
            }
            
            // 저장된 위치가 있으면 사용, 없으면 기본 위치 계산
            const position = savedPosition || { 
              x: (index % 5) * 250, 
              y: Math.floor(index / 5) * 150 
            };
            
            // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
            const tags = card.cardTags && card.cardTags.length > 0
              ? card.cardTags.map((cardTag: {tag: {name: string}}) => cardTag.tag.name)
              : (card.tags || []);
              
            return {
              id: card.id,
              type: NODE_TYPES_KEYS.card,
              position,
              data: {
                ...card,
                tags,
              },
            };
          });
          
          logger.debug('노드 데이터 생성 완료:', { 노드수: nodes.length });
          logger.debug('생성된 노드의 위치 정보 확인:', nodes.map(node => ({
            id: node.id,
            position: node.position
          })));

          // 4. 엣지 데이터 설정 (저장된 엣지 사용 및 설정 적용)
          const boardSettings = get().ideaMapSettings;
          const finalEdges = cards.length > 0 ? applyIdeaMapEdgeSettings(savedEdges, boardSettings) : [];
          logger.debug('엣지 스타일 적용 완료:', { 
            엣지수: finalEdges.length,
            스타일: {
              animated: boardSettings.animated,
              strokeWidth: boardSettings.strokeWidth,
              edgeColor: boardSettings.edgeColor
            }
          });

          // 5. 스토어 상태 업데이트 - 모든 상태를 한 번에 업데이트
          logger.debug('스토어 상태 업데이트');
          set({
            nodes,
            edges: finalEdges,
            isIdeaMapLoading: false,
            loadedViewport: savedViewport,
            needsFitView: !savedViewport,
            ideaMapError: null,
          });
          
          // 최종 상태 설정 후 노드 로그 추가
          logger.debug('최종 상태 설정 후 노드:', get().nodes.map(node => ({
            id: node.id,
            position: node.position
          })));
          
          // 6. 카드 데이터를 전역 상태에 저장 (useAppStore)
          // 현재의 카드 데이터와 새로 가져온 카드 데이터를 비교하여 변경사항이 있을 때만 설정
          const currentCards = useAppStore.getState().cards;
          const hasCardsChanged = 
            currentCards.length !== cards.length || 
            // 모든 카드를 비교하여 변경된 부분이 있는지 확인
            cards.some((newCard: CardData) => {
              const existingCard = currentCards.find(card => card.id === newCard.id);
              if (!existingCard) return true; // 새 카드가 추가됨
              
              // 주요 속성 비교 (제목, 내용, 태그)
              return (
                existingCard.title !== newCard.title ||
                existingCard.content !== newCard.content
              );
            });

          if (hasCardsChanged) {
            logger.debug('카드 데이터가 변경되어 AppStore 상태 업데이트:', {
              이전카드수: currentCards.length,
              새카드수: cards.length
            });
            useAppStore.getState().setCards(cards);
          } else {
            logger.debug('카드 데이터가 변경되지 않아 AppStore 상태 업데이트 건너뜀');
          }
          
          // 7. 카드-노드 동기화 강제 실행 (데이터 로드 후 추가 안전 장치)
          // 약간의 지연 후 실행하여 다른 상태 업데이트와 충돌하지 않도록 함
          setTimeout(() => {
            logger.debug('데이터 로드 후 카드-노드 동기화 실행');
            get().syncCardsWithNodes(true);
          }, 200);

          // toast.success('아이디어맵 데이터를 성공적으로 불러왔습니다.');

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('아이디어맵 데이터 로딩 실패:', errorMessage);
          // 오류 발생 시에도 여러 상태를 한 번에 업데이트
          set({ 
            isIdeaMapLoading: false, 
            ideaMapError: errorMessage,
            nodes: [],
            edges: []
          });
        }
      },
      
      // 레이아웃 함수
      applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => {
        const { nodes, edges } = get();
        
        if (nodes.length === 0) {
          logger.error('노드가 없어 레이아웃을 적용할 수 없습니다');
          return;
        }
        
        try {
          let layoutedNodes;
          let layoutedEdges = edges; // 기본적으로 기존 엣지 사용
          
          if (direction === 'auto') {
            // 자동 레이아웃 (그리드)
            layoutedNodes = getGridLayout(nodes);
          } else {
            // 방향 기반 레이아웃
            const { nodes: newNodes, edges: newEdges } = getLayoutedElements(nodes, edges, direction);
            layoutedNodes = newNodes;
            layoutedEdges = newEdges; // 엣지도 업데이트
          }
          
          // 노드와 엣지 업데이트
          set({ 
            nodes: layoutedNodes as Node<CardData>[],
            edges: layoutedEdges as Edge[],
            hasUnsavedChanges: true
          });
          
          // 레이아웃 적용 후 바로 저장 (추가된 부분)
          setTimeout(() => {
            const result = get().saveAllLayoutData(); // saveLayout 대신 saveAllLayoutData 호출
            logger.debug(`${direction} 레이아웃 적용 후 위치 및 엣지 저장:`, result ? '성공' : '실패');
            
            if (result) {
              set({ hasUnsavedChanges: false });
            }
          }, 200); // 상태 업데이트가 완료된 후 저장하기 위해 약간의 지연 추가
          
          // toast.info(`${direction === 'auto' ? '그리드' : direction === 'horizontal' ? '수평' : '수직'} 레이아웃이 적용되었습니다`);
        } catch (error) {
          logger.error('레이아웃 적용 중 오류:', error);
          toast.error('레이아웃 적용에 실패했습니다');
        }
      },
      
      // 아이디어맵 레이아웃을 그리드 형태로 정렬
      applyGridLayout: () => {
        get().applyLayout('auto');
      },
      
      // 저장 함수
      saveLayout: (nodesToSave) => {
        logger.debug('saveLayout 함수 호출됨', {
          노드수: nodesToSave ? nodesToSave.length : get().nodes.length
        });
        
        try {
          // 1. 기존에 저장된 노드 위치 정보 불러오기
          let existingPositions: Record<string, XYPosition> = {};
          try {
            const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
            if (savedPositionsStr) {
              const parsedData = JSON.parse(savedPositionsStr);
              // 중첩된 position 구조를 변환하여 처리
              Object.entries(parsedData).forEach(([nodeId, data]) => {
                if (typeof data === 'object' && data !== null && 'position' in data) {
                  existingPositions[nodeId] = (data as { position: XYPosition }).position;
                } else {
                  existingPositions[nodeId] = data as XYPosition;
                }
              });
              logger.debug('기존 저장된 노드 위치 로드:', { 
                노드수: Object.keys(existingPositions).length 
              });
            }
          } catch (err) {
            logger.warn('기존 위치 정보 로드 실패:', err);
          }
          
          const positionsData: Record<string, XYPosition> = {...existingPositions};
          const nodes = nodesToSave || get().nodes;
          
          // 노드가 없으면 알림 후 리턴
          if (!nodes || nodes.length === 0) {
            logger.warn('저장할 노드가 없음');
            return false;
          }
          
          logger.debug('노드 위치 저장 준비:', { 노드수: nodes.length });
          
          // 각 노드의 위치 정보를 추출하여 positionsData 객체에 저장 (기존 정보 유지하면서 업데이트)
          nodes.forEach(node => {
            if (node && node.id && node.position) {
              positionsData[node.id] = node.position;
            } else {
              logger.warn('노드 데이터 형식 오류:', node);
            }
          });
          
          // positionsData 객체가 비어있으면 오류 발생
          if (Object.keys(positionsData).length === 0) {
            logger.error('저장할 노드 위치 데이터가 없음');
            return false;
          }
          
          // 로컬 스토리지에 저장
          const jsonData = JSON.stringify(positionsData);
          localStorage.setItem(IDEAMAP_LAYOUT_STORAGE_KEY, jsonData);
          
          logger.debug('노드 위치 저장 완료:', {
            노드수: Object.keys(positionsData).length,
            스토리지키: IDEAMAP_LAYOUT_STORAGE_KEY,
            데이터크기: jsonData.length
          });
          
          // 저장 후 로컬 스토리지 확인
          const savedData = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
          if (!savedData) {
            logger.error('저장 직후 데이터 확인 실패');
            return false;
          }
          
          // 저장이 성공한 경우 변경사항 업데이트
          set({ hasUnsavedChanges: false });
          
          return true;
        } catch (error: unknown) {
          // const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('레이아웃 저장 실패:', error);
          return false;
        }
      },
      
      saveEdges: (edgesToSave) => {
        try {
          // 엣지 배열 결정
          const edges = edgesToSave || get().edges;
          
          // 로컬 스토리지에 저장
          localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(edges));
          
          return true;
        } catch (error) {
          logger.error('엣지 저장 중 오류:', error);
          return false;
        }
      },
      
      saveAllLayoutData: () => {
        const state = get();
        const layoutSaved = state.saveLayout();
        const edgesSaved = state.saveEdges();
        
        if (layoutSaved && edgesSaved) {
          // toast.success('레이아웃이 저장되었습니다');
          set({ hasUnsavedChanges: false });
          return true;
        }
        
        return false;
      },
      
      // 엣지 스타일 업데이트
      updateEdgeStyles: (settings) => {
        const { edges } = get();
        const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
        set({ edges: updatedEdges });
      },
      
      // 서버 동기화 함수
      loadIdeaMapSettingsFromServerIfAuthenticated: async (isAuthenticated, userId) => {
        if (!isAuthenticated || !userId) {
          logger.debug('비인증 사용자는 설정을 로드하지 않음');
          return;
        }

        set({ isSettingsLoading: true, settingsError: null });
        try {
          const settings = await loadSettingsFromServer(userId);
          if (settings) {
            // 여기서 설정을 저장 (로컬 스토리지에도 저장)
            saveSettings(settings);
            
            // 전역 상태 업데이트
            set({ 
              ideaMapSettings: settings, 
              isSettingsLoading: false 
            });
            
            // 엣지 스타일도 업데이트
            const { edges } = get();
            const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
            set({ edges: updatedEdges });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('[IdeaMapStore] 설정 로드 실패:', errorMessage);
          logger.error('[IdeaMapStore] 설정 로드 실패:', errorMessage);
          set({ 
            settingsError: `설정 로드 실패: ${errorMessage}`, 
            isSettingsLoading: false 
          });
        }
      },
      
      // 엣지 생성 함수
      createEdgeOnDrop: (sourceId, targetId) => {
        const { ideaMapSettings } = get();
        return {
          id: `edge-${sourceId}-${targetId}-${Date.now()}`,
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
      },
      
      // 변경 사항 추적
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      
      // 리액트 플로우 인스턴스
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
      
      // useIdeaMapUtils에서 이전된 액션들
      loadAndApplyIdeaMapSettings: async (userId) => {
        try {
          set({ isSettingsLoading: true, settingsError: null });
          
          // 서버에서 설정 로드
          const settings = await loadSettingsFromServer(userId);
          
          // 설정이 로드되면 적용
          if (settings) {
            set({ ideaMapSettings: settings });
            
            // 엣지 스타일 업데이트
            const updatedEdges = applyIdeaMapEdgeSettings(get().edges, settings);
            set({ edges: updatedEdges });
          } else {
            // 낙관적 업데이트 구현 후, 기본값을 로컬 스토리지에 저장하고 바로 DB에도 저장하는 로직 구현 (추가 예정)
            // TODO: 여기서 DEFAULT_IDEAMAP_SETTINGS를 서버에 바로 저장하여 새 사용자 경험 개선 필요
            logger.warn('저장된 아이디어맵 설정이 없어 기본값을 사용합니다');
          }
          
          set({ isSettingsLoading: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('아이디어맵 설정 로드 실패:', errorMessage);
          logger.error('[useIdeaMapStore] 아이디어맵 설정 로드 실패:', errorMessage);
        }
      },
      
      updateAndSaveIdeaMapSettings: async (newSettings, userId) => {
        const currentSettings = get().ideaMapSettings;
        // 설정 업데이트
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        // 로컬 스토리지에 저장
        saveSettings(updatedSettings);
        
        // 전역 상태 업데이트
        set({ ideaMapSettings: updatedSettings });
        
        // 엣지 스타일 업데이트
        const updatedEdges = applyIdeaMapEdgeSettings(get().edges, updatedSettings);
        set({ edges: updatedEdges });
        
        // 인증된 사용자면 서버에도 저장
        if (userId) {
          try {
            await saveSettingsToServer(updatedSettings, userId);
            // toast.success('아이디어맵 설정이 저장되었습니다');
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            // console.error('설정 저장 실패:', errorMessage);
            logger.error('[useIdeaMapStore] 설정 저장 실패:', errorMessage);
          }
        }
      },
      
      saveViewport: () => {
        const { reactFlowInstance } = get();
        if (!reactFlowInstance) return;
        
        try {
          const viewport = reactFlowInstance.getViewport() as ExtendedViewport;
          
          // 로컬 스토리지에 저장
          localStorage.setItem(IDEAMAP_TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
          logger.info('[IdeaMapStore] 뷰포트 저장 완료:', viewport);
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('뷰포트 저장 실패:', errorMessage);
          // console.error('[뷰포트 저장 실패]', errorMessage);
        }
      },
      
      restoreViewport: () => {
        const { reactFlowInstance, viewportToRestore } = get();
        
        if (!reactFlowInstance || !viewportToRestore) {
          console.log('[IdeaMapStore] 뷰포트를 복원할 수 없음');
          return;
        }
        
        try {
          // 뷰포트 복원
          reactFlowInstance.setViewport(viewportToRestore);
          logger.info('[IdeaMapStore] 뷰포트 복원 완료:', viewportToRestore);
          
          // 복원 후 상태 초기화
          set({ viewportToRestore: null });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('[뷰포트 복원 실패]', errorMessage);
          logger.error('뷰포트 저장 실패:', errorMessage);
        }
      },
      
      // 노드를 주어진 위치에 추가하는 액션
      addNodeAtPosition: async (type, position, data = {}) => {
        try {
          // 1. 새 노드 ID 생성
          const newNodeId = `node-${Date.now()}`;
          
          // 2. 기본 노드 데이터 생성
          const newNode: Node<CardData> = {
            id: newNodeId,
            type,
            position,
            data: {
              id: newNodeId,
              title: data.title as string || '새 카드',
              content: data.content as string || '',
              tags: data.tags as string[] || [],
              ...Object.fromEntries(
                Object.entries(data).filter(([key]) => !['id', 'title', 'content', 'tags'].includes(key))
              )
            },
          };
          
          // 3. 노드 저장
          const { nodes } = get();
          set({
            nodes: [...nodes, newNode],
            hasUnsavedChanges: true
          });
          
          return newNode;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('노드 추가 실패:', errorMessage);
          logger.error('[useIdeaMapStore] 노드 추가 실패:', errorMessage);
          // toast.error('노드를 추가하는데 실패했습니다');
          return null;
        }
      },

      // 카드를 중앙 위치에 추가하는 액션
      addCardAtCenterPosition: async (cardData: CardData) => {
        const state = get();
        const reactFlowInstance = state.reactFlowInstance;
        
        if (!reactFlowInstance) {
          logger.error('ReactFlow 인스턴스가 초기화되지 않았습니다');
          return null;
        }
        
        try {
          // 뷰포트 중앙 또는 기본 위치 계산
          const viewport = reactFlowInstance.getViewport() as ExtendedViewport;
          const centerPosition = {
            x: viewport.x + (viewport.width || 0) / 2 - 75, // 카드 너비의 절반 만큼 조정
            y: viewport.y + (viewport.height || 0) / 2 - 50  // 카드 높이의 절반 만큼 조정
          };
          
          return await state.addNodeAtPosition('card', centerPosition, cardData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('[addCardAtCenterPosition Action] 카드 추가 실패:', errorMessage);
          logger.error(`중앙에 카드 추가 실패: ${errorMessage}`);
          return null;
        }
      },

      // 엣지와 노드를 동시에 생성하는 액션
      createEdgeAndNodeOnDrop: async (cardData: CardData, position, connectingNodeId, handleType) => {
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
          
          // toast.success('카드 및 연결선이 생성되었습니다');
          return newNode;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('[createEdgeAndNodeOnDrop Action] 노드 및 엣지 생성 실패:', errorMessage);
          // toast.error(`카드 및 연결선 생성 실패: ${errorMessage}`);
          return null;
        }
      },
      
      saveIdeaMapState: () => {
        const state = get();
        const layoutSaved = state.saveLayout();
        const edgesSaved = state.saveEdges();
        
        // 뷰포트 저장
        state.saveViewport();
        
        if (layoutSaved && edgesSaved) {
          set({ hasUnsavedChanges: false });
          // toast.success('아이디어맵 상태가 저장되었습니다');
          return true;
        }
        
        logger.error('아이디어맵 상태 저장에 실패했습니다');
        return false;
      },
      
      /**
       * applyNodeChangesAction: 노드 변경사항을 적용하는 액션
       * @param changes 노드 변경 사항 배열
       */
      applyNodeChangesAction: (changes: NodeChange[]) => {
        logger.info('[useIdeaMapStore] applyNodeChangesAction 호출:', { 
          변경수: changes.length,
          변경유형: changes.map(c => c.type).join(', ')
        });
        
        // 삭제된 노드가 있는지 확인
        const deleteChanges = changes.filter(change => change.type === 'remove');
        
        // 삭제된 노드가 있으면 로컬 스토리지에서도 해당 노드 정보를 제거
        if (deleteChanges.length > 0) {
          const deletedNodeIds = deleteChanges.map(change => change.id);
          logger.info('[useIdeaMapStore] 노드 삭제 감지:', { deletedNodeIds });
          get().removeNodesAndRelatedEdgesFromStorage(deletedNodeIds);
        }
        
        // 위치 변경이 있는 경우 저장 상태 업데이트
        const positionChanges = changes.filter(
          change => change.type === 'position' && change.dragging === false
        );
        
        if (positionChanges.length > 0) {
          logger.info('[useIdeaMapStore] 노드 위치 변경 확정 감지:', { 
            변경노드수: positionChanges.length 
          });
        }
        
        if (positionChanges.length > 0 || deleteChanges.length > 0) {
          set({ hasUnsavedChanges: true });
        }
        
        // 노드 변경 적용
        set(state => {
          const updatedNodes = applyNodeChanges(changes, state.nodes) as Node<CardData>[];
          logger.info('[useIdeaMapStore] 노드 변경 적용 완료:', { 
            이전노드수: state.nodes.length,
            변경후노드수: updatedNodes.length
          });
          return { nodes: updatedNodes };
        });
      },
      
      /**
       * removeNodesAndRelatedEdgesFromStorage: 로컬 스토리지에서 노드와 관련 엣지 정보를 제거하는 액션
       * @param deletedNodeIds 삭제된 노드 ID 배열
       */
      removeNodesAndRelatedEdgesFromStorage: (deletedNodeIds: string[]) => {
        console.log('[useIdeaMapStore] 노드 및 관련 엣지 스토리지에서 제거 시도:', { deletedNodeIds });
        try {
          // 현재 저장된 노드 위치 정보 가져오기
          const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
          if (savedPositionsStr) {
            // 새로운 데이터 구조 적용
            const savedPositions = JSON.parse(savedPositionsStr) as Record<string, { position: XYPosition }>;
            
            // 삭제된 노드 ID 제거
            const updatedPositions = Object.entries(savedPositions)
              .filter(([nodeId]) => !deletedNodeIds.includes(nodeId))
              .reduce((acc, [nodeId, data]) => {
                acc[nodeId] = data;
                return acc;
              }, {} as Record<string, { position: XYPosition }>);
              
            // 업데이트된 위치 정보 저장
            localStorage.setItem(IDEAMAP_LAYOUT_STORAGE_KEY, JSON.stringify(updatedPositions));
            logger.info('[useIdeaMapStore] 노드 위치 정보 업데이트:', {
              이전노드수: Object.keys(savedPositions).length,
              현재노드수: Object.keys(updatedPositions).length
            });
            
            // 엣지 정보도 업데이트 (삭제된 노드와 연결된 엣지 제거)
            const savedEdgesStr = localStorage.getItem(IDEAMAP_EDGES_STORAGE_KEY);
            if (savedEdgesStr) {
              const savedEdges = JSON.parse(savedEdgesStr) as Edge[];
              const updatedEdges = savedEdges.filter(
                edge => 
                  !deletedNodeIds.includes(edge.source) && 
                  !deletedNodeIds.includes(edge.target)
              );
              
              localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
              logger.info('[useIdeaMapStore] 엣지 정보 업데이트:', {
                이전엣지수: savedEdges.length,
                현재엣지수: updatedEdges.length
              });
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('[useIdeaMapStore] 스토리지에서 노드 제거 실패:', errorMessage);
        }
      },
      
      /**
       * addNodeAction: 새 노드를 추가하는 액션
       * @param newNodeData 새 노드 데이터 (id와 position 제외)
       * @returns 생성된 노드 또는 null (실패 시)
       */
      addNodeAction: async (newNodeData) => {
        try {
          // 카드 데이터 생성
          const cardData = newNodeData.data as CardData;
          
          // 노드 ID 생성
          const nodeId = `node-${Date.now()}`;
          
          // 노드 위치 설정
          const nodePosition = newNodeData.position || { x: 0, y: 0 };
          
          // 노드 생성
          const newNode: Node<CardData> = {
            id: nodeId,
            type: newNodeData.type || 'card',
            position: nodePosition,
            data: {
              id: nodeId,
              title: cardData.title || '새 카드',
              content: cardData.content || '',
              tags: cardData.tags || [],
              ...Object.fromEntries(
                Object.entries(cardData).filter(([key]) => !['id', 'title', 'content', 'tags'].includes(key))
              )
            },
            ...(newNodeData.draggable !== undefined ? { draggable: newNodeData.draggable } : {}),
            ...(newNodeData.selectable !== undefined ? { selectable: newNodeData.selectable } : {}),
          };
          
          // 현재 노드 목록에 추가
          const currentNodes = get().nodes;
          const updatedNodes = [...currentNodes, newNode];
          set({ nodes: updatedNodes, hasUnsavedChanges: true });
          
          return newNode;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          logger.error('[useIdeaMapStore] 노드 추가 중 오류 발생:', errorMessage);
          // toast.error(`노드 추가 실패: ${errorMessage}`);
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
          const { nodes, edges } = get();
          
          // 업데이트된 상태 계산
          const updatedNodes = nodes.filter(node => node.id !== nodeId);
          const updatedEdges = edges.filter(edge => 
            edge.source !== nodeId && edge.target !== nodeId
          );
          
          // 단일 set 호출로 상태 업데이트
          set({
            nodes: updatedNodes,
            edges: updatedEdges,
            hasUnsavedChanges: true
          });
          
          // 로컬 스토리지에서 삭제
          get().removeNodesAndRelatedEdgesFromStorage([nodeId]);
          
          // 성공 메시지
          if (nodeToDelete) {
            // toast.success(`'${nodeToDelete.data.title}' 노드가 삭제되었습니다`);
            logger.info(`'${nodeToDelete.data.title}' 노드가 삭제되었습니다`);
          } else {
            // toast.success('노드가 삭제되었습니다');
            logger.info('노드가 삭제되었습니다');
          }
          
        } catch (err) {
          logger.error('노드 삭제 실패:', err);
          // toast.error('노드 삭제에 실패했습니다');
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
          const nodePositions = nodes.reduce((acc: Record<string, { position: XYPosition }>, node: Node<CardData>) => {
            acc[node.id] = { position: node.position };
            return acc;
          }, {});
          
          localStorage.setItem(IDEAMAP_LAYOUT_STORAGE_KEY, JSON.stringify(nodePositions));
          
          // 변경 사항 플래그 업데이트
          set({ hasUnsavedChanges: false });
          
          // toast.success('노드 레이아웃이 저장되었습니다');
          logger.info('노드 레이아웃이 저장되었습니다');
          return true;
        } catch (err) {
          // console.error('레이아웃 저장 실패:', err);
          logger.error('[useIdeaMapStore] 레이아웃 저장 실패:', err);
          return false;
        }
      },
      
      // 엣지 관련 새 액션들
      
      /**
       * applyEdgeChangesAction: 엣지 변경 사항을 적용하는 액션
       * @param changes 엣지 변경 사항 배열
       */
      applyEdgeChangesAction: (changes: EdgeChange[]) => {
        const { edges, nodes } = get();
        
        // 노드가 없을 때는 엣지 변경을 무시하고 빈 배열로 설정
        if (nodes.length === 0) {
          logger.debug('노드가 없어 엣지 변경을 무시하고 빈 배열로 설정합니다.');
          set({ edges: [] });
          
          // 로컬 스토리지의 엣지 정보도 초기화
          try {
            localStorage.removeItem(IDEAMAP_EDGES_STORAGE_KEY);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            logger.error('[useIdeaMapStore] 로컬 스토리지 엣지 정보 초기화 중 오류 발생:', errorMessage);
          }
          return;
        }
        
        const updatedEdges = applyEdgeChanges(changes, edges) as Edge[];
        set({ edges: updatedEdges, hasUnsavedChanges: true });
        
        // 삭제된 엣지가 있는지 확인
        const deletedEdgeIds = changes
          .filter(change => change.type === 'remove')
          .map(change => (change as EdgeChange & { id: string }).id);
          
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
          const storedEdgesJSON = localStorage.getItem(IDEAMAP_EDGES_STORAGE_KEY);
          if (!storedEdgesJSON) return;
          
          const storedEdges = JSON.parse(storedEdgesJSON) as Edge[];
          
          // 삭제할 엣지를 제외한 나머지 엣지만 남기기
          const updatedEdges = storedEdges.filter(
            edge => !deletedEdgeIds.includes(edge.id)
          );
          
          // 업데이트된 엣지 정보를 다시 로컬 스토리지에 저장
          localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('엣지 제거 중 오류 발생:', errorMessage);
          logger.error('[useIdeaMapStore] 엣지 제거 중 오류 발생:', errorMessage);
        }
      },
      
      /**
       * connectNodesAction: 노드 간 연결을 생성하는 액션
       * @param connection 연결 파라미터
       */
      connectNodesAction: (connection: Connection) => {
        const { ideaMapSettings, edges, nodes } = get();
        
        // 노드가 없을 때는 연결 시도를 무시
        if (nodes.length === 0) {
          logger.debug('노드가 없어 노드 연결 요청을 무시합니다.');
          return;
        }
        
        const newEdge: Edge = {
          ...connection,
          id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
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
        
        const updatedEdges = [...edges, newEdge];
        set({ edges: updatedEdges, hasUnsavedChanges: true });
        
        // 변경 사항 저장
        try {
          localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('엣지 저장 중 오류 발생:', errorMessage);
          logger.error('[useIdeaMapStore] 엣지 저장 중 오류 발생:', errorMessage);
        }
      },
      
      /**
       * saveEdgesAction: 현재 엣지 상태를 로컬 스토리지에 저장하는 액션
       * @returns 저장 성공 여부
       */
      saveEdgesAction: () => {
        try {
          const { edges } = get();
          localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(edges));
          set({ hasUnsavedChanges: false });
          return true;
        } catch (err) {
          // console.error('엣지 저장 실패:', err);
          logger.error('[useIdeaMapStore] 엣지 저장 실패:', err);
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
          // console.error('엣지 스타일 업데이트 중 오류:', error);
          logger.error('[useIdeaMapStore] 엣지 스타일 업데이트 중 오류:', error);
        }
      },
      
      /**
       * createEdgeOnDropAction: 드롭 이벤트에 대한 새 엣지를 생성하는 액션
       * @param sourceId 소스 노드 ID
       * @param targetId 타겟 노드 ID
       * @returns 생성된 엣지 객체
       */
      createEdgeOnDropAction: (sourceId: string, targetId: string) => {
        const { ideaMapSettings: settings } = get();
        
        const newEdge: Edge = {
          id: `edge-${sourceId}-${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: settings.animated,
          style: {
            stroke: settings.edgeColor,
            strokeWidth: settings.strokeWidth,
          },
          markerEnd: settings.markerEnd ? {
            type: settings.markerEnd,
            width: settings.markerSize,
            height: settings.markerSize,
            color: settings.edgeColor,
          } : undefined,
          data: {
            edgeType: settings.connectionLineType,
            settings: {
              animated: settings.animated,
              connectionLineType: settings.connectionLineType,
              strokeWidth: settings.strokeWidth,
              edgeColor: settings.edgeColor,
              selectedEdgeColor: settings.selectedEdgeColor,
            }
          }
        };
        
        const styledEdge = applyIdeaMapEdgeSettings([newEdge], settings)[0];
        return styledEdge;
      },

      // 추가된 함수: 드래그 앤 드롭으로 새 노드 추가하기
      onDrop: (event: React.DragEvent, position: XYPosition) => {
        event.preventDefault();
        
        try {
          const cardData = JSON.parse(event.dataTransfer.getData('application/reactflow')) as Record<string, unknown>;
          
          if (!cardData || !cardData.title) {
            throw new Error('유효하지 않은 카드 데이터');
          }
          
          // 노드 추가
          get().addNodeAtPosition('card', position, cardData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          // console.error('드롭된 데이터 처리 중 오류 발생:', errorMessage);
          logger.error('[useIdeaMapStore] 드롭된 데이터 처리 중 오류 발생:', errorMessage);
        }
      },

      // 새로 추가한 액션
      syncCardsWithNodes: (forceRefresh = false) => {
        const appStoreCards = useAppStore.getState().cards;
        const currentNodes = get().nodes;
        
        logger.debug('syncCardsWithNodes 시작', {
          강제실행: forceRefresh,
          카드개수: appStoreCards.length,
          현재노드개수: currentNodes.length
        });
        
        // 카드가 없는 경우 특별 처리
        if (appStoreCards.length === 0) {
          logger.warn('카드가 없습니다. 노드와 엣지를 초기화합니다.');
          // 노드 초기화
          set({ 
            nodes: [],
            edges: [],
            hasUnsavedChanges: true
          });
          
          // 로컬 스토리지의 엣지 정보 삭제
          try {
            localStorage.removeItem(IDEAMAP_EDGES_STORAGE_KEY);
            logger.debug('로컬 스토리지의 엣지 정보를 삭제했습니다.');
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            logger.error('[useIdeaMapStore] 로컬 스토리지 엣지 정보 삭제 중 오류 발생:', errorMessage);
          }
          return;
        }
        
        // 변경이 필요한지 확인
        let needsUpdate = forceRefresh;
        
        if (!needsUpdate) {
          // 카드 수와 노드 수가 다르면 업데이트 필요
          if (appStoreCards.length !== currentNodes.length) {
            needsUpdate = true;
            logger.debug('카드 수와 노드 수가 달라 업데이트 필요:', 
              { 카드: appStoreCards.length, 노드: currentNodes.length });
          } else {
            // 각 카드가 노드에 제대로 반영되어 있는지 확인
            needsUpdate = appStoreCards.some(card => {
              const matchingNode = currentNodes.find(node => node.id === card.id);
              
              // 매칭되는 노드가 없거나 타이틀이 다르면 업데이트 필요
              if (!matchingNode) {
                logger.debug(`카드 ${card.id}에 대응하는 노드가 없음`);
                return true;
              }
              
              if (matchingNode.data.title !== card.title) {
                logger.debug(`카드와 노드의 타이틀 불일치 (ID: ${card.id}):`, {
                  카드타이틀: card.title,
                  노드타이틀: matchingNode.data.title
                });
                return true;
              }
              
              return false;
            });
          }
        }
        
        // 업데이트가 필요하면 노드 배열 업데이트
        if (needsUpdate) {
          logger.debug('카드와 노드 동기화 수행 시작');
          
          if (appStoreCards.length === 0) {
            logger.warn('카드가 없습니다. 빈 노드 배열로 업데이트합니다.');
            set({ 
              nodes: [],
              edges: [], // 엣지도 초기화
              hasUnsavedChanges: true
            });
            
            // 로컬 스토리지의 엣지 정보도 초기화
            try {
              localStorage.removeItem(IDEAMAP_EDGES_STORAGE_KEY);
            } catch (err) {
              logger.error('로컬 스토리지 엣지 정보 초기화 중 오류 발생:', err);
            }
            return;
          }
          
          try {
            // 1. 먼저 로컬 스토리지에서 저장된 노드 위치 정보 확인
            const savedPositions: Record<string, XYPosition> = {};
            try {
              const savedPositionsStr = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
              if (savedPositionsStr) {
                const parsedData = JSON.parse(savedPositionsStr);
                // 중첩된 position 구조를 처리
                Object.entries(parsedData).forEach(([nodeId, data]) => {
                  if (typeof data === 'object' && data !== null && 'position' in data) {
                    savedPositions[nodeId] = (data as { position: XYPosition }).position;
                  } else {
                    // 이전 구조로 저장된 경우 (직접 위치 좌표가 저장된 경우)
                    savedPositions[nodeId] = data as unknown as XYPosition;
                  }
                });
                logger.debug('저장된 노드 위치 정보 로드 성공:', { 
                  노드수: Object.keys(savedPositions).length 
                });
              }
            } catch (err) {
              logger.warn('로컬 스토리지 위치 정보 로드 실패:', err);
            }
            
            // 2. 그 다음 현재 노드 위치 정보 백업 (로컬 스토리지에 없는 노드용)
            const currentPositions: Record<string, XYPosition> = {};
            currentNodes.forEach(node => {
              if (!savedPositions[node.id]) {
                currentPositions[node.id] = node.position;
              }
            });
            logger.debug('현재 노드 위치 정보 백업 완료:', { 
              백업노드수: Object.keys(currentPositions).length 
            });
            
            // 3. 새 노드 배열 생성
            const updatedNodes = appStoreCards.map((card, index) => {
              // 위치 결정 우선순위:
              // 1. 로컬 스토리지의 저장된 위치
              // 2. 현재 노드 배열의 위치
              // 3. 기본 위치 계산
              let position: XYPosition;
              
              if (savedPositions[card.id]) {
                position = savedPositions[card.id];
                logger.debug(`카드 ${card.id}의 저장된 위치 사용`);
              } else if (currentPositions[card.id]) {
                position = currentPositions[card.id];
                logger.debug(`카드 ${card.id}의 현재 노드 위치 사용`);
              } else {
                position = calculateNodePosition(index, appStoreCards.length);
                logger.debug(`카드 ${card.id}의 새 위치 계산`);
              }

              // 태그 처리
              const tags = card.cardTags && card.cardTags.length > 0
                ? card.cardTags.map((cardTag: {tag: {name: string}}) => cardTag.tag.name)
                : (card.tags || []);
              
              const node = {
                id: card.id,
                type: NODE_TYPES_KEYS.card, // 명시적으로 카드 타입 지정
                position,
                data: {
                  ...card,
                  tags,
                  // 클라이언트 측 사용을 위한 추가 메타데이터
                  _syncedAt: new Date().toISOString(),
                  _nodeType: NODE_TYPES_KEYS.card
                },
              };
              
              return node;
            });
            
            // 4. 한 번에 set 호출
            // 엣지 업데이트 - 기존 노드와 연결된 엣지만 유지
            const currentEdges = get().edges;
            const validNodeIds = updatedNodes.map(node => node.id);
            
            const validEdges = currentEdges.filter(edge => 
              validNodeIds.includes(edge.source) && validNodeIds.includes(edge.target)
            );
            
            if (currentEdges.length !== validEdges.length) {
              logger.debug('유효하지 않은 엣지 제거:', {
                기존엣지: currentEdges.length,
                유효엣지: validEdges.length
              });
            }
            
            set({ 
              nodes: updatedNodes,
              edges: validEdges,
              hasUnsavedChanges: true 
            });
            
            // 유효한 엣지만 저장
            try {
              localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(validEdges));
            } catch (err) {
              logger.error('엣지 정보 저장 중 오류:', err);
            }
            
            logger.debug('카드-노드 동기화 완료, 새 노드 배열 설정:', { 
              노드수: updatedNodes.length,
              엣지수: validEdges.length
            });
            
          } catch (err) {
            logger.error('카드-노드 동기화 중 오류 발생:', err);
            // toast.error('카드와 노드 동기화 중 오류가 발생했습니다');
          }
        } else {
          logger.debug('카드-노드 동기화 불필요, 업데이트 건너뜀');
        }
      },
      
      // 선택적 노드 업데이트 함수 - 변경된 카드에 대해서만 노드 업데이트
      updateNodesSelectively: (changedCards: any[]) => {
        const state = get();
        const cardIds = changedCards.map(card => card.id);
        
        logger.debug('선택적 노드 업데이트 실행:', { 
          변경된카드수: changedCards.length,
          현재노드수: state.nodes.length
        });
        
        if (changedCards.length === 0) {
          logger.debug('변경된 카드가 없습니다. 업데이트를 건너뜁니다.');
          return;
        }
        
        // 1. 현재 노드 맵 생성 (빠른 검색을 위해)
        const currentNodesMap = state.nodes.reduce((acc, node) => {
          acc[node.id] = node;
          return acc;
        }, {} as Record<string, Node<CardData>>);
        
        // 2. 저장된 위치 정보 로드
        const savedPositions = loadIdeaMapPositions();
        
        // 현재 노드들의 위치 정보 맵 생성
        const currentPositions: Record<string, XYPosition> = {};
        state.nodes.forEach(node => {
          currentPositions[node.id] = node.position;
        });
        
        // 3. 변경된 카드에 대해서만 노드 생성/업데이트
        const updatedNodes = state.nodes.map(node => {
          // 변경된 카드에 해당하는 노드인 경우에만 업데이트
          if (cardIds.includes(node.id)) {
            const card = changedCards.find(c => c.id === node.id);
            if (card) {
              logger.debug(`노드 ${node.id} 데이터 업데이트`);
              return {
                ...node,
                data: {
                  ...node.data,
                  ...card,
                  tags: card.cardTags 
                    ? card.cardTags.map((cardTag: any) => cardTag.tag.name) 
                    : (card.tags || []),
                  _syncedAt: new Date().toISOString()
                }
              };
            }
          }
          
          // 변경 없음
          return node;
        });
        
        // 4. 새로 추가된 카드에 대한 노드 생성
        const existingNodeIds = updatedNodes.map(node => node.id);
        const newCards = changedCards.filter(card => !existingNodeIds.includes(card.id));
        
        if (newCards.length > 0) {
          logger.debug('새로 추가된 카드 감지:', { 개수: newCards.length, IDs: newCards.map(c => c.id) });
        }
        
        const newNodes = newCards.map((card, index) => {
          // 위치 결정: 저장된 위치 > 현재 노드 위치 > 계산된 위치
          let position: XYPosition;
          
          if (savedPositions[card.id]) {
            position = savedPositions[card.id];
            logger.debug(`카드 ${card.id}의 저장된 위치 사용`);
          } else if (currentPositions[card.id]) {
            position = currentPositions[card.id];
            logger.debug(`카드 ${card.id}의 현재 노드 위치 사용`);
          } else {
            position = calculateNodePosition(index, newCards.length);
            logger.debug(`카드 ${card.id}의 새 위치 계산`);
          }
          
          return {
            id: card.id,
            type: NODE_TYPES_KEYS.card,
            position,
            data: {
              ...card,
              tags: card.cardTags 
                ? card.cardTags.map((cardTag: any) => cardTag.tag.name) 
                : (card.tags || []),
              _syncedAt: new Date().toISOString(),
              _nodeType: NODE_TYPES_KEYS.card
            }
          };
        });
        
        // 변경된 내용이 있는 경우에만 상태 업데이트
        if (newNodes.length > 0 || updatedNodes.some((node, idx) => node !== state.nodes[idx])) {
          logger.debug('노드 상태 업데이트:', {
            업데이트된노드: updatedNodes.length,
            새노드: newNodes.length
          });
          
          // 최종 노드 배열 설정
          set({ 
            nodes: [...updatedNodes, ...newNodes],
            hasUnsavedChanges: true
          });
          
          // 카드-노드 변경 후 레이아웃 저장
          setTimeout(() => {
            get().saveLayout();
          }, 200);
        } else {
          logger.debug('변경 사항이 없어 노드 업데이트를 건너뜁니다.');
        }
      },
    }),
    {
      name: 'ideamap-store',
      partialize: (state) => ({
        ideaMapSettings: state.ideaMapSettings
      })
    }
  )
);

/**
 * calculateNodePosition: 노드의 위치를 계산
 * @param index - 노드 인덱스
 * @param totalNodes - 전체 노드 수
 * @returns 노드 좌표 {x, y}
 */
const calculateNodePosition = (index: number, totalNodes: number) => {
  const angle = (index / totalNodes) * 2 * Math.PI;
  const radius = Math.min(200, totalNodes * 30); // 노드 수에 따라 반지름 조정
  const x = 400 + radius * Math.cos(angle);
  const y = 300 + radius * Math.sin(angle);
  return { x, y };
}; 

// 로컬 스토리지에서 저장된 노드 위치를 로드하는 함수
const loadIdeaMapPositions = (): Record<string, XYPosition> => {
  try {
    const savedLayout = localStorage.getItem(IDEAMAP_LAYOUT_STORAGE_KEY);
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      logger.debug('저장된 레이아웃 로드:', { nodeCount: Object.keys(parsed).length });
      
      // 중첩된 position 객체 구조 처리
      const positions: Record<string, XYPosition> = {};
      Object.entries(parsed).forEach(([nodeId, data]) => {
        if (typeof data === 'object' && data !== null && 'position' in data) {
          positions[nodeId] = (data as { position: XYPosition }).position;
        } else {
          positions[nodeId] = data as XYPosition;
        }
      });
      
      return positions;
    }
  } catch (error) {
    logger.error('레이아웃 로드 오류:', error);
  }
  
  return {};
};