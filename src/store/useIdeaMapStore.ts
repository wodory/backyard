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
 * 수정일: 2025-04-21 : localStorage 엣지 데이터 로딩 및 저장 제거
 * 수정일: 2025-04-21 : applyEdgeChangesAction 함수의 역할 명확화 - 오직 엣지 상태 업데이트만 수행하도록 수정
 * 수정일: 2025-04-21 : syncCardsWithNodes 함수 수정 - 카드가 없는 경우에도 엣지 데이터를 초기화하지 않도록 변경
 * 수정일: 2025-04-21 : isIdeaMapLoading 초기 상태 false로 변경 - 실제 데이터 로딩 시작 시에만 로딩 상태 활성화
 * 수정일: 2025-04-21 : 노드와 엣지 상태 업데이트를 항상 원자적으로 수행하도록 수정 - 초기 로딩 시 엣지가 일시적으로 사라지는 문제 해결
 * 수정일: 2025-04-21 : syncCardsWithNodes 함수 제거 - 카드-노드 연동을 TanStack Query로 대체
 * 수정일: 2025-04-21 : nodes 배열과 관련 액션 제거 - TanStack Query로 대체
 * 수정일: 2025-04-30 : 로컬 스토리지 키(IDEAMAP_LAYOUT_STORAGE_KEY) 관련 코드 제거
 * 수정일: 2025-04-30 : Settings 인터페이스와 일치하도록 속성명 수정 (animate→animated, color→edgeColor, markerType→markerEnd)
 * 수정일: 2025-05-12 : updateNodesSelectively, addNodeAtPosition 등 누락된 함수 추가
 * 수정일: 2025-05-12 : applyNodeChangesAction 함수 추가 - 노드 위치 변경 처리
 */
import { 
  Edge, 
  Connection, 
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  EdgeChange,
  XYPosition,
  Viewport,
  ReactFlowInstance,
  MarkerType,
  Node,
  EdgeMarker,
  NodeChange
} from '@xyflow/react';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CardData } from '@/components/ideamap/types/ideamap-types';
import { NODE_TYPES_KEYS } from '@/lib/flow-constants';
import { IDEAMAP_EDGES_STORAGE_KEY, IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';
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
export interface IdeaMapState {
  // 노드 관련 상태 및 액션
  nodes: Node[]; // 노드 배열 상태
  setNodes: (nodes: Node[]) => void; // 노드 상태 설정 함수
  applyNodeChangesAction: (changes: NodeChange[]) => void; // 노드 변경 사항 적용 함수
  
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

  // 새로 추가할 엣지 관련 액션들 (useEdges 훅에서 이전)
  applyEdgeChangesAction: (changes: EdgeChange[]) => void;
  removeEdgesFromStorage: (deletedEdgeIds: string[]) => void;
  connectNodesAction: (connection: Connection) => void;
  saveEdgesAction: () => boolean;
  updateAllEdgeStylesAction: () => void;
  createEdgeOnDropAction: (sourceId: string, targetId: string) => Edge;

  // 추가된 함수: 드래그 앤 드롭으로 새 노드 추가하기
  onDrop: (event: React.DragEvent, position: XYPosition) => void;

  // 노드와 카드 동기화 관련 함수
  updateNodesSelectively: (cards: CardData[]) => void;
  addNodeAtPosition: (type: string, position: XYPosition, data: any) => void;
  addCardAtCenterPosition: (cardData: CardData) => void;
  createEdgeAndNodeOnDrop: (
    cardData: CardData, 
    position: XYPosition, 
    connectingNodeId: string, 
    handleType: 'source' | 'target'
  ) => void;
}

// 아이디어맵 스토어 생성
export const useIdeaMapStore = create<IdeaMapState>()(
  persist(
    (set, get) => ({      
      // 노드 관련 상태 및 액션
      nodes: [], // 노드 배열 초기 상태
      setNodes: (nodes) => {
        logger.debug('setNodes 호출:', { nodeCount: nodes.length });
        set({ nodes, hasUnsavedChanges: true });
      },
      applyNodeChangesAction: (changes) => {
        set(state => {
          const nextNodes = applyNodeChanges(changes, state.nodes);
          logger.debug('노드 변경 적용:', { 
            changeCount: changes.length,
            changeTypes: changes.map(c => c.type).join(', ')
          });
          return {
            nodes: nextNodes,
            hasUnsavedChanges: true
          };
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
            type: 'smoothstep',
            animated: state.ideaMapSettings.animated || false,
            style: {
              stroke: state.ideaMapSettings.edgeColor || '#C1C1C1',
              strokeWidth: state.ideaMapSettings.strokeWidth || 2,
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: state.ideaMapSettings.edgeColor || '#C1C1C1',
              width: state.ideaMapSettings.markerSize || 15,
              height: state.ideaMapSettings.markerSize || 15,
            },
          }, state.edges);
          
          logger.debug('새 엣지 생성됨:', { 
            sourceId: connection.source, 
            targetId: connection.target,
            edgeId: newEdge[newEdge.length - 1].id
          });
          
          return { 
            edges: newEdge,
            hasUnsavedChanges: true
          };
        });
      },
      
      // 아이디어맵 설정 관련 상태 및 함수
      ideaMapSettings: DEFAULT_SETTINGS,
      setIdeaMapSettings: (settings) => set({ ideaMapSettings: settings }),
      updateIdeaMapSettings: async (partialSettings, isAuthenticated, userId) => {
        const currentSettings = get().ideaMapSettings;
        const newSettings = { ...currentSettings, ...partialSettings };
        
        // 로컬 상태 업데이트
        set({ ideaMapSettings: newSettings });
        
        // 엣지 스타일 업데이트
        get().updateEdgeStyles(newSettings);
        
        // 로컬 스토리지에 저장
        saveSettings(newSettings);
        
        // 인증된 사용자인 경우 서버에도 저장
        if (isAuthenticated && userId) {
          try {
            await saveSettingsToServer(newSettings, userId);
            logger.debug('서버에 설정 저장 성공:', { userId });
          } catch (error) {
            logger.error('서버에 설정 저장 실패:', error);
            toast.error('설정을 서버에 저장하는 중 오류가 발생했습니다.');
          }
        }
      },
      
      // 엣지 관련 함수
      updateEdgeStyles: (settings) => {
        const { edges } = get();
        const updatedEdges = edges.map(edge => {
          return {
            ...edge,
            animated: settings.animated,
            style: {
              ...edge.style,
              stroke: settings.edgeColor,
              strokeWidth: settings.strokeWidth,
            },
            markerEnd: {
              ...(edge.markerEnd as any),
              type: settings.markerEnd,
              color: settings.edgeColor,
              width: settings.markerSize,
              height: settings.markerSize,
            },
          };
        });
        
        set({ edges: updatedEdges });
      },
      
      // 레이아웃 함수
      applyLayout: (direction) => {
        logger.debug('레이아웃 적용:', { direction });
        const { edges, reactFlowInstance } = get();
        
        // 노드와 엣지 데이터가 있는지 확인
        if (reactFlowInstance) {
          const currentNodes = reactFlowInstance.getNodes();
          
          if (currentNodes.length === 0) {
            logger.warn('레이아웃을 적용할 노드가 없습니다.');
            toast.warning('레이아웃을 적용할 노드가 없습니다.');
            return;
          }
          
          // 노드 및 엣지 데이터 가져오기
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            currentNodes,
            edges,
            direction === 'auto' ? undefined : direction
          );
          
          // 레이아웃 적용
          reactFlowInstance.setNodes(layoutedNodes);
          if (layoutedEdges) {
            set({ edges: layoutedEdges });
          }
          
          // 뷰포트 조정 (선택적)
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
          }, 100);
          
          set({ hasUnsavedChanges: true });
          
          logger.debug('레이아웃 적용 완료:', { 
            nodeCount: layoutedNodes.length, 
            edgeCount: layoutedEdges ? layoutedEdges.length : edges.length 
          });
        } else {
          logger.error('React Flow 인스턴스가 없어 레이아웃을 적용할 수 없습니다.');
          toast.error('레이아웃을 적용할 수 없습니다. 페이지를 새로고침 해보세요.');
        }
      },
      
      applyGridLayout: () => {
        logger.debug('그리드 레이아웃 적용');
        const { reactFlowInstance } = get();
        
        if (reactFlowInstance) {
          const currentNodes = reactFlowInstance.getNodes();
          
          if (currentNodes.length === 0) {
            logger.warn('그리드 레이아웃을 적용할 노드가 없습니다.');
            toast.warning('그리드 레이아웃을 적용할 노드가 없습니다.');
            return;
          }
          
          // 그리드 레이아웃 계산
          const gridLayoutNodes = getGridLayout(currentNodes);
          
          // 레이아웃 적용
          reactFlowInstance.setNodes(gridLayoutNodes);
          
          // 뷰포트 조정 (선택적)
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
          }, 100);
          
          set({ hasUnsavedChanges: true });
          
          logger.debug('그리드 레이아웃 적용 완료:', { nodeCount: gridLayoutNodes.length });
        } else {
          logger.error('React Flow 인스턴스가 없어 그리드 레이아웃을 적용할 수 없습니다.');
          toast.error('그리드 레이아웃을 적용할 수 없습니다. 페이지를 새로고침 해보세요.');
        }
      },
      
      // 저장 관련 함수
      saveEdges: (edgesToSave) => {
        const edgesToUse = edgesToSave || get().edges;
        if (edgesToUse && edgesToUse.length > 0) {
          try {
            localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(edgesToUse));
            logger.debug('엣지 데이터 저장 완료:', { edgeCount: edgesToUse.length });
            return true;
          } catch (error) {
            logger.error('엣지 데이터 저장 중 오류 발생:', error);
            return false;
          }
        }
        logger.debug('저장할 엣지 데이터가 없습니다.');
        return false;
      },
      
      saveAllLayoutData: () => {
        logger.debug('모든 레이아웃 데이터 저장 시작');
        
        const { saveEdges, saveViewport } = get();
        
        // 엣지 저장
        const edgesSaved = saveEdges();
        
        // 뷰포트 저장
        saveViewport();
        
        set({ hasUnsavedChanges: false });
        
        logger.debug('모든 레이아웃 데이터 저장 완료:', { 
          edgesSaved
        });
        
        return edgesSaved;
      },
      
      // 리액트 플로우 인스턴스 관련 상태 및 함수
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => {
        logger.debug('React Flow 인스턴스 설정:', !!instance);
        set({ reactFlowInstance: instance });
      },
      
      // 엣지 생성 함수
      createEdgeOnDrop: (sourceId, targetId) => {
        const { ideaMapSettings } = get();
        
        const newEdge: Edge = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          animated: ideaMapSettings.animated || false,
          style: {
            stroke: ideaMapSettings.edgeColor || '#C1C1C1',
            strokeWidth: ideaMapSettings.strokeWidth || 2,
          },
          markerEnd: {
            type: MarkerType.Arrow,
            color: ideaMapSettings.edgeColor || '#C1C1C1',
            width: ideaMapSettings.markerSize || 15,
            height: ideaMapSettings.markerSize || 15,
          },
        };
        
        // 새 엣지를 상태에 추가
        set(state => ({
          edges: [...state.edges, newEdge],
          hasUnsavedChanges: true
        }));
        
        logger.debug('드롭으로 엣지 생성:', { 
          sourceId, 
          targetId, 
          edgeId: newEdge.id 
        });
        
        return newEdge;
      },
      
      // 변경 사항 추적 상태 및 함수
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      
      // 아이디어맵 데이터 로딩 상태 및 액션
      isIdeaMapLoading: false,
      ideaMapError: null,
      loadedViewport: null,
      needsFitView: false,
      loadIdeaMapData: async () => {
        logger.info('아이디어맵 데이터 로드 시작');
        
        set({ isIdeaMapLoading: true, ideaMapError: null });
        
        try {
          // 로드된 데이터가 있을 경우 상태 업데이트
          set({ 
            isIdeaMapLoading: false,
            needsFitView: true
          });
          
          logger.info('아이디어맵 데이터 로드 완료');
          
        } catch (error) {
          logger.error('아이디어맵 데이터 로드 중 오류 발생:', error);
          set({ 
            isIdeaMapLoading: false, 
            ideaMapError: error instanceof Error ? error.message : '데이터 로드 중 오류가 발생했습니다.'
          });
        }
      },
      
      // 추가된 상태 및 액션
      viewportToRestore: null,
      isSettingsLoading: false,
      settingsError: null,
      
      // 서버 동기화 함수
      loadIdeaMapSettingsFromServerIfAuthenticated: async (isAuthenticated, userId) => {
        if (!isAuthenticated || !userId) {
          logger.debug('인증되지 않았거나 사용자 ID가 없어 설정을 로드하지 않습니다.');
          return;
        }
        
        set({ isSettingsLoading: true, settingsError: null });
        
        try {
          const serverSettings = await loadSettingsFromServer(userId);
          
          if (serverSettings) {
            logger.debug('서버에서 설정 로드 성공:', serverSettings);
            set({ 
              ideaMapSettings: serverSettings,
              isSettingsLoading: false
            });
            
            // 엣지 스타일 업데이트
            get().updateEdgeStyles(serverSettings);
          } else {
            logger.debug('서버에 저장된 설정이 없습니다.');
            set({ isSettingsLoading: false });
          }
        } catch (error) {
          logger.error('서버에서 설정 로드 중 오류 발생:', error);
          set({ 
            isSettingsLoading: false, 
            settingsError: error instanceof Error ? error.message : '설정 로드 중 오류가 발생했습니다.'
          });
        }
      },
      
      // useIdeaMapUtils에서 이전된 액션들
      loadAndApplyIdeaMapSettings: async (userId) => {
        set({ isSettingsLoading: true, settingsError: null });
        
        try {
          // 서버에서 설정 로드
          const serverSettings = await loadSettingsFromServer(userId);
          
          if (serverSettings) {
            logger.debug('서버에서 설정 로드 및 적용:', serverSettings);
            
            // 설정 적용
            set({ ideaMapSettings: serverSettings });
            
            // 엣지 스타일 업데이트
            get().updateEdgeStyles(serverSettings);
            
            // 로컬 스토리지에도 저장
            saveSettings(serverSettings);
          } else {
            logger.debug('서버에 저장된 설정이 없습니다. 로컬 설정을 유지합니다.');
          }
          
          set({ isSettingsLoading: false });
        } catch (error) {
          logger.error('설정 로드 및 적용 중 오류 발생:', error);
          set({ 
            isSettingsLoading: false, 
            settingsError: error instanceof Error ? error.message : '설정 로드 및 적용 중 오류가 발생했습니다.'
          });
        }
      },
      
      updateAndSaveIdeaMapSettings: async (newSettings, userId) => {
        const currentSettings = get().ideaMapSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        // 로컬 상태 업데이트
        set({ ideaMapSettings: updatedSettings });
        
        // 엣지 스타일 업데이트
        get().updateEdgeStyles(updatedSettings);
        
        // 로컬 스토리지에 저장
        saveSettings(updatedSettings);
        
        // 서버에 저장 (인증된 사용자인 경우)
        if (userId) {
          try {
            await saveSettingsToServer(updatedSettings, userId);
            logger.debug('서버에 설정 저장 성공:', { userId });
          } catch (error) {
            logger.error('서버에 설정 저장 중 오류 발생:', error);
            toast.error('설정을 서버에 저장하는 중 오류가 발생했습니다.');
          }
        }
      },
      
      saveViewport: () => {
        const { reactFlowInstance } = get();
        
        if (reactFlowInstance) {
          const viewport = reactFlowInstance.getViewport();
          
          try {
            localStorage.setItem(IDEAMAP_TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
            logger.debug('뷰포트 저장 완료:', viewport);
          } catch (error) {
            logger.error('뷰포트 저장 중 오류 발생:', error);
          }
        }
      },
      
      restoreViewport: () => {
        const { reactFlowInstance, viewportToRestore, loadedViewport } = get();
        const targetViewport = viewportToRestore || loadedViewport;
        
        if (reactFlowInstance && targetViewport) {
          // setTimeout으로 지연 실행 (React Flow 초기화 시간 확보)
          setTimeout(() => {
            reactFlowInstance.setViewport(targetViewport);
            logger.debug('뷰포트 복원 완료:', targetViewport);
          }, 250);
        }
      },
      
      saveIdeaMapState: () => {
        logger.debug('아이디어맵 상태 저장 시작');
        
        const { saveAllLayoutData } = get();
        
        // 모든 레이아웃 데이터 저장
        const saved = saveAllLayoutData();
        
        if (saved) {
          logger.debug('아이디어맵 상태 저장 완료');
          set({ hasUnsavedChanges: false });
        } else {
          logger.warn('아이디어맵 상태 저장 실패 또는 저장할 데이터 없음');
        }
        
        return saved;
      },

      // 엣지 관련 액션
      applyEdgeChangesAction: (changes) => {
        set(state => {
          const updatedEdges = applyEdgeChanges(changes, state.edges);
          logger.debug('엣지 변경 적용:', { 
            changeCount: changes.length, 
            edgeCount: updatedEdges.length 
          });
          return { edges: updatedEdges, hasUnsavedChanges: true };
        });
      },

      removeEdgesFromStorage: (deletedEdgeIds) => {
        try {
          const storedEdgesString = localStorage.getItem(IDEAMAP_EDGES_STORAGE_KEY);
          
          if (storedEdgesString) {
            const storedEdges = JSON.parse(storedEdgesString) as Edge[];
            const filteredEdges = storedEdges.filter(
              edge => !deletedEdgeIds.includes(edge.id)
            );
            
            localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(filteredEdges));
            logger.debug('스토리지에서 엣지 제거 완료:', { 
              삭제된엣지수: deletedEdgeIds.length,
              남은엣지수: filteredEdges.length
            });
          }
        } catch (error) {
          logger.error('스토리지에서 엣지 제거 중 오류 발생:', error);
        }
      },

      connectNodesAction: (connection) => {
        logger.debug('노드 연결:', connection);
        set(state => {
          const newEdge = addEdge({
            ...connection,
            type: 'smoothstep',
            animated: state.ideaMapSettings.animated || false,
            style: {
              stroke: state.ideaMapSettings.edgeColor || '#C1C1C1',
              strokeWidth: state.ideaMapSettings.strokeWidth || 2,
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: state.ideaMapSettings.edgeColor || '#C1C1C1',
              width: state.ideaMapSettings.markerSize || 15,
              height: state.ideaMapSettings.markerSize || 15,
            },
          }, state.edges);
          
          logger.debug('새 연결 생성:', { 
            sourceId: connection.source, 
            targetId: connection.target 
          });
          
          return { edges: newEdge, hasUnsavedChanges: true };
        });
      },

      saveEdgesAction: () => {
        const { edges } = get();
        if (edges.length > 0) {
          try {
            localStorage.setItem(IDEAMAP_EDGES_STORAGE_KEY, JSON.stringify(edges));
            logger.debug('엣지 저장 완료:', { edgeCount: edges.length });
            return true;
          } catch (error) {
            logger.error('엣지 저장 중 오류 발생:', error);
            return false;
          }
        }
        return false;
      },

      updateAllEdgeStylesAction: () => {
        const { ideaMapSettings, edges } = get();
        
        const updatedEdges = edges.map(edge => ({
          ...edge,
          animated: ideaMapSettings.animated || false,
          style: {
            ...edge.style,
            stroke: ideaMapSettings.edgeColor || '#C1C1C1',
            strokeWidth: ideaMapSettings.strokeWidth || 2,
          },
          markerEnd: {
            ...(edge.markerEnd as any),
            type: MarkerType.Arrow,
            color: ideaMapSettings.edgeColor || '#C1C1C1',
            width: ideaMapSettings.markerSize || 15,
            height: ideaMapSettings.markerSize || 15,
          },
        }));
        
        set({ edges: updatedEdges });
        logger.debug('모든 엣지 스타일 업데이트 완료:', { edgeCount: edges.length });
      },

      createEdgeOnDropAction: (sourceId, targetId) => {
        const { ideaMapSettings } = get();
        
        const newEdge: Edge = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          animated: ideaMapSettings.animated || false,
          style: {
            stroke: ideaMapSettings.edgeColor || '#C1C1C1',
            strokeWidth: ideaMapSettings.strokeWidth || 2,
          },
          markerEnd: {
            type: MarkerType.Arrow,
            color: ideaMapSettings.edgeColor || '#C1C1C1',
            width: ideaMapSettings.markerSize || 15,
            height: ideaMapSettings.markerSize || 15,
          },
        };
        
        set(state => ({
          edges: [...state.edges, newEdge],
          hasUnsavedChanges: true
        }));
        
        logger.debug('드롭으로 엣지 생성:', { 
          sourceId, 
          targetId, 
          edgeId: newEdge.id 
        });
        
        return newEdge;
      },
      
      // 드래그 앤 드롭으로 새 노드 추가하기
      onDrop: (event, position) => {
        event.preventDefault();
        
        const dataTransfer = event.dataTransfer;
        const cardDataString = dataTransfer.getData('application/json');
        
        if (!cardDataString) {
          logger.warn('드롭된 데이터가 없거나 적절한 형식이 아닙니다.');
          return;
        }
        
        try {
          const cardData = JSON.parse(cardDataString) as CardData;
          logger.debug('카드 데이터가 드롭됨:', { 
            cardId: cardData.id, 
            position, 
            title: cardData.title 
          });
        } catch (error) {
          logger.error('드롭된 데이터 파싱 중 오류 발생:', error);
        }
      },

      // React Query 카드 데이터 변경 시 노드 선택적 업데이트
      updateNodesSelectively: (cards) => {
        logger.debug('카드 데이터로 노드 선택적 업데이트:', { cardCount: cards.length });
        
        // ReactFlow 인스턴스 확인
        const { reactFlowInstance, nodes } = get();
        if (!reactFlowInstance) {
          logger.debug('ReactFlow 인스턴스가 없습니다. nodes 상태를 직접 업데이트합니다.');
          
          try {
            // 현재 노드에서 업데이트할 노드 찾기
            const updatedNodes = [...nodes];
            let hasChanges = false;
            
            // 각 카드에 대해 해당하는 노드 찾아 데이터 업데이트
            cards.forEach(card => {
              const nodeIndex = updatedNodes.findIndex(node => node.data?.id === card.id);
              
              if (nodeIndex !== -1) {
                // 기존 노드 찾음 - 데이터 업데이트
                const nodeToUpdate = updatedNodes[nodeIndex];
                updatedNodes[nodeIndex] = {
                  ...nodeToUpdate,
                  data: {
                    ...nodeToUpdate.data,
                    ...card, // 카드 데이터로 업데이트
                    label: card.title || '제목 없음', // 라벨 업데이트
                  }
                };
                hasChanges = true;
              }
            });
            
            // 변경사항이 있으면 노드 상태 업데이트
            if (hasChanges) {
              logger.debug('노드 데이터 업데이트 적용 (직접 상태 업데이트)');
              set({
                nodes: updatedNodes
              });
            }
            return;
          } catch (error) {
            logger.error('노드 선택적 업데이트(비인스턴스) 중 오류 발생:', error);
            return;
          }
        }
        
        try {
          // 현재 노드 가져오기
          const currentNodes = reactFlowInstance.getNodes();
          const updatedNodes = [...currentNodes];
          let hasChanges = false;
          
          // 각 카드에 대해 해당하는 노드 찾아 데이터 업데이트
          cards.forEach(card => {
            const nodeIndex = updatedNodes.findIndex(node => node.data?.id === card.id);
            
            if (nodeIndex !== -1) {
              // 기존 노드 찾음 - 데이터 업데이트
              const nodeToUpdate = updatedNodes[nodeIndex];
              updatedNodes[nodeIndex] = {
                ...nodeToUpdate,
                data: {
                  ...nodeToUpdate.data,
                  ...card, // 카드 데이터로 업데이트
                  label: card.title || '제목 없음', // 라벨 업데이트
                }
              };
              hasChanges = true;
            }
          });
          
          // 변경사항이 있으면 노드 업데이트
          if (hasChanges) {
            logger.debug('노드 데이터 업데이트 적용 (reactFlowInstance 사용)');
            reactFlowInstance.setNodes(updatedNodes);
          }
        } catch (error) {
          logger.error('노드 선택적 업데이트 중 오류 발생:', error);
        }
      },
      
      // 특정 위치에 새 노드 추가
      addNodeAtPosition: (type, position, data) => {
        logger.debug('특정 위치에 노드 추가:', { type, position, id: data.id });
        
        // ReactFlow 인스턴스 확인
        const { reactFlowInstance } = get();
        if (!reactFlowInstance) {
          logger.warn('ReactFlow 인스턴스가 없어 노드를 추가할 수 없습니다.');
          return;
        }
        
        try {
          // 현재 노드 가져오기
          const currentNodes = reactFlowInstance.getNodes();
          
          // 새 노드 ID 생성
          const nodeId = `${type}-${data.id}`;
          
          // 이미 존재하는 노드인지 확인
          const existingNodeIndex = currentNodes.findIndex(node => node.id === nodeId);
          if (existingNodeIndex !== -1) {
            logger.debug('이미 존재하는 노드, 추가하지 않음:', nodeId);
            return;
          }
          
          // 새 노드 생성
          const newNode = {
            id: nodeId,
            type: type, // 노드 타입 (card, note, etc)
            position,
            data: {
              ...data,
              id: data.id,
              label: data.title || '제목 없음',
            },
          };
          
          // 노드 추가
          const updatedNodes = [...currentNodes, newNode];
          reactFlowInstance.setNodes(updatedNodes);
          
          logger.debug('새 노드 추가 완료:', { nodeId, type });
        } catch (error) {
          logger.error('노드 추가 중 오류 발생:', error);
        }
      },
      
      // 카드 데이터로 중앙 위치에 노드 추가
      addCardAtCenterPosition: (cardData) => {
        logger.debug('카드 데이터로 중앙에 노드 추가:', { cardId: cardData.id });
        
        // ReactFlow 인스턴스 확인
        const { reactFlowInstance } = get();
        if (!reactFlowInstance) {
          logger.warn('ReactFlow 인스턴스가 없어 노드를 추가할 수 없습니다.');
          return;
        }
        
        try {
          // 중앙 위치 계산
          const viewport = reactFlowInstance.getViewport();
          const centerX = (window.innerWidth / 2) / viewport.zoom - viewport.x / viewport.zoom;
          const centerY = (window.innerHeight / 2) / viewport.zoom - viewport.y / viewport.zoom;
          
          // 위치에 노드 추가 함수 호출
          get().addNodeAtPosition('card', { x: centerX, y: centerY }, cardData);
        } catch (error) {
          logger.error('중앙에 카드 노드 추가 중 오류 발생:', error);
        }
      },
      
      // 엣지 드롭으로 노드 생성 및 엣지 추가
      createEdgeAndNodeOnDrop: (cardData, position, connectingNodeId, handleType) => {
        logger.debug('엣지 드롭으로 노드 생성 및 엣지 추가:', {
          cardId: cardData.id,
          position,
          connectingNodeId,
          handleType
        });
        
        // ReactFlow 인스턴스 확인
        const { reactFlowInstance } = get();
        if (!reactFlowInstance) {
          logger.warn('ReactFlow 인스턴스가 없어 노드와 엣지를 추가할 수 없습니다.');
          return;
        }
        
        try {
          // 새 노드 ID 생성
          const newNodeId = `card-${cardData.id}`;
          
          // 노드 추가
          get().addNodeAtPosition('card', position, cardData);
          
          // 엣지 연결 - handleType에 따라 소스와 타겟 결정
          const connection: Connection = handleType === 'source'
            ? { source: newNodeId, target: connectingNodeId, sourceHandle: null, targetHandle: null }
            : { source: connectingNodeId, target: newNodeId, sourceHandle: null, targetHandle: null };
          
          // 엣지 생성 (onConnect 함수 사용)
          get().onConnect(connection);
          
          logger.debug('엣지 드롭으로 노드 및 엣지 추가 완료:', {
            newNodeId,
            connectingNodeId,
            handleType
          });
        } catch (error) {
          logger.error('엣지 드롭으로 노드 및 엣지 추가 중 오류 발생:', error);
        }
      },
    }),
    {
      name: 'ideamap-store',
      partialize: (state) => ({
        // 퍼시스트할 상태만 선택
        edges: state.edges,
        nodes: state.nodes, // nodes 상태도 퍼시스트
        ideaMapSettings: state.ideaMapSettings,
        loadedViewport: state.loadedViewport,
        needsFitView: state.needsFitView,
        viewportToRestore: state.viewportToRestore,
      }),
    }
  )
);