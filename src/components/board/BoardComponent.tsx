/**
 * @deprecated 이 컴포넌트는 더 이상 사용되지 않습니다. 대신 src/components/board/components/Board.tsx를 사용해 주세요.
 * 이 파일은 리팩토링 과정에서 새로운 구조의 Board 컴포넌트로 대체되었습니다.
 * 향후 릴리스에서 제거될 예정이므로 신규 기능 개발 시 새 컴포넌트를 사용하세요.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ConnectionLineType,
  Position,
  MarkerType,
  useReactFlow,
  useUpdateNodeInternals,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  OnConnectStart,
  OnConnectEnd,
  XYPosition,
  ConnectionMode
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import CreateCardButton from '@/components/cards/CreateCardButton';
import LayoutControls from '@/components/board/LayoutControls';
import BoardSettingsControl from '@/components/board/BoardSettingsControl';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { 
  BoardSettings, 
  DEFAULT_BOARD_SETTINGS, 
  loadBoardSettings, 
  saveBoardSettings, 
  applyEdgeSettings, 
  saveBoardSettingsToServer, 
  loadBoardSettingsFromServer 
} from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import DevTools from '@/components/debug/DevTools';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
import { CreateCardModal } from '@/components/cards/CreateCardModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';
import { logCurrentBoardSettings, resetAllStorage } from '@/lib/debug-utils';
import { cn } from '@/lib/utils';

// 타입 정의
interface BoardComponentProps {
  onSelectCard?: (cardId: string | null) => void;
  className?: string;
  showControls?: boolean;
}

export default function BoardComponent({ 
  onSelectCard,
  className = "",
  showControls = true 
}: BoardComponentProps) {
  const [nodes, setNodes] = useNodesState<any>([]);
  const [edges, setEdges] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 엣지 드롭 관련 상태 추가
  const [isEdgeDropModalOpen, setIsEdgeDropModalOpen] = useState(false);
  const [edgeDropPosition, setEdgeDropPosition] = useState<XYPosition | null>(null);
  const [edgeDropNodeId, setEdgeDropNodeId] = useState<string | null>(null);
  const [edgeDropHandleType, setEdgeDropHandleType] = useState<'source' | 'target' | null>(null);
  
  // 인증 상태 가져오기
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  
  // 레퍼런스 및 기타 훅
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const hasUnsavedChanges = useRef(false);
  
  // 커넥팅 노드 관련 상태
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectingHandleType, setConnectingHandleType] = useState<'source' | 'target' | null>(null);
  const [connectingHandlePosition, setConnectingHandlePosition] = useState<Position | null>(null);
  
  // useAppStore에서 layoutDirection과 boardSettings 가져오기
  const layoutDirection = useAppStore(state => state.layoutDirection);
  const boardSettings = useAppStore(state => state.boardSettings);
  const setBoardSettings = useAppStore(state => state.setBoardSettings);
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);
  const setCards = useAppStore(state => state.setCards);
  const { selectCards, selectedCardIds, toggleSelectedCard, selectCard } = useAppStore();
  
  // 전역 상태의 카드 목록 가져오기 (노드와 동기화를 위해)
  const storeCards = useAppStore(state => state.cards);

  // 전역 상태의 카드가 업데이트되면 노드 데이터 업데이트
  useEffect(() => {
    if (storeCards.length === 0 || nodes.length === 0 || isLoading) return;
    
    console.log('[BoardComponent] 전역 카드 상태 변경 감지, 노드 데이터 업데이트');
    
    // 노드 데이터 업데이트 (카드 ID가 일치하는 노드들만)
    setNodes(currentNodes => 
      currentNodes.map(node => {
        // 대응되는 카드 데이터 찾기
        const cardData = storeCards.find(card => card.id === node.id);
        
        // 카드 데이터가 존재하면 노드 데이터 업데이트
        if (cardData) {
          return {
            ...node,
            data: {
              ...node.data,
              title: cardData.title,
              content: cardData.content,
              // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
              tags: cardData.cardTags 
                ? cardData.cardTags.map((cardTag: any) => cardTag.tag.name) 
                : (cardData.tags || [])
            }
          };
        }
        
        return node;
      })
    );
  }, [storeCards, setNodes, isLoading, nodes.length]);
  
  // 엣지에 새 노드 추가 기능
  const { onConnectStart, onConnectEnd } = useAddNodeOnEdgeDrop({
    onCreateNode: (position, connectingNodeId, handleType) => {
      // 모달을 열기 위한 상태 설정
      setEdgeDropPosition(position);
      setEdgeDropNodeId(connectingNodeId);
      setEdgeDropHandleType(handleType);
      setIsEdgeDropModalOpen(true);
    }
  });
  
  // 노드 변경 핸들러
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 노드 삭제 변경이 있는지 확인
    const deleteChanges = changes.filter(change => change.type === 'remove');
    
    // 삭제된 노드가 있으면 로컬 스토리지에서도 해당 노드 정보를 제거
    if (deleteChanges.length > 0) {
      // 현재 저장된 노드 위치 정보 가져오기
      try {
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
              (edge: Edge) => 
                !deletedNodeIds.includes(edge.source) && 
                !deletedNodeIds.includes(edge.target)
            );
            localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
          }
          
          // 저장 상태 플래그 업데이트
          hasUnsavedChanges.current = true;
        }
      } catch (err) {
        console.error('노드 삭제 정보 저장 실패:', err);
      }
    }
    
    // applyNodeChanges 함수를 사용하여 적절하게 노드 변경사항 적용
    setNodes((nds) => applyNodeChanges(changes, nds));
    
    // 위치 변경이 있는 경우에만 저장 상태로 표시
    const positionChanges = changes.filter(
      (change) => change.type === 'position' && change.dragging === false
    );
    
    if (positionChanges.length > 0 || deleteChanges.length > 0) {
      hasUnsavedChanges.current = true;
    }
  }, [setNodes]);
  
  // 엣지 변경 핸들러
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // applyEdgeChanges 함수를 사용하여 적절하게 엣지 변경사항 적용
    setEdges((eds) => applyEdgeChanges(changes, eds));
    
    // 변경이 있을 때마다 저장 대기 상태로 설정
    hasUnsavedChanges.current = true;
  }, [setEdges]);
  
  // 레이아웃 저장
  const saveLayout = useCallback((nodesToSave = nodes) => {
    try {
      // 노드 ID와 위치만 저장
      const nodePositions = nodesToSave.reduce((acc: Record<string, { position: XYPosition }>, node: Node) => {
        acc[node.id] = { position: node.position };
        return acc;
      }, {});
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodePositions));
      setLastSavedAt(new Date());
      
      return true;
    } catch (err) {
      console.error('레이아웃 저장 실패:', err);
      return false;
    }
  }, [nodes]);
  
  // 엣지 저장
  const saveEdges = useCallback((edgesToSave = edges) => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edgesToSave));
      return true;
    } catch (err) {
      console.error('엣지 저장 실패:', err);
      return false;
    }
  }, [edges]);
  
  // 모든 레이아웃 데이터 저장
  const saveAllLayoutData = useCallback(() => {
    const layoutSaved = saveLayout();
    const edgesSaved = saveEdges();
    
    if (layoutSaved && edgesSaved) {
      hasUnsavedChanges.current = false;
      toast.success('레이아웃이 저장되었습니다');
      return true;
    }
    
    return false;
  }, [saveLayout, saveEdges]);
  
  // 수동 저장
  const handleSaveLayout = useCallback(() => {
    if (saveAllLayoutData()) {
      toast.success('레이아웃이 저장되었습니다');
    } else {
      toast.error('레이아웃 저장에 실패했습니다');
    }
  }, [saveAllLayoutData]);
  
  // 보드 설정 변경 핸들러
  const handleBoardSettingsChange = useCallback((newSettings: BoardSettings) => {
    console.log('[BoardComponent] 보드 설정 변경 핸들러 호출됨:', newSettings);
    
    // 1. 전역 상태 업데이트
    setBoardSettings(newSettings);
    console.log('[BoardComponent] 전역 상태 업데이트 완료');
    
    // 2. 새 설정을 엣지에 적용
    const updatedEdges = applyEdgeSettings(edges, newSettings);
    console.log('[BoardComponent] 엣지 설정 적용 완료, 엣지 수:', updatedEdges.length);
    setEdges(updatedEdges);
    
    // 3. 인증된 사용자인 경우 서버에도 저장
    if (isAuthenticated && user?.id) {
      console.log('[BoardComponent] 서버에 보드 설정 저장 시도');
      saveBoardSettingsToServer(user.id, newSettings)
        .then(() => {
          console.log('[BoardComponent] 서버 저장 성공');
          toast.success('보드 설정이 저장되었습니다');
        })
        .catch(err => {
          console.error('[BoardComponent] 서버 저장 실패:', err);
          toast.error('서버에 설정 저장 실패');
        });
    } else {
      console.log('[BoardComponent] 비인증 사용자, 서버 저장 생략');
    }
  }, [edges, setEdges, isAuthenticated, user?.id, setBoardSettings]);
  
  // 인증 상태에 따라 서버에서 설정 불러오기
  const loadBoardSettingsFromServerIfAuthenticated = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const settings = await loadBoardSettingsFromServer(user.id);
        if (settings) {
          // 전역 상태 업데이트 (이것이 localStorage에도 저장됨)
          setBoardSettings(settings);
          
          // 새 설정을 엣지에 적용
          const updatedEdges = applyEdgeSettings(edges, settings);
          setEdges(updatedEdges);
        }
      } catch (err) {
        console.error('서버에서 보드 설정 불러오기 실패:', err);
      }
    }
  }, [isAuthenticated, user?.id, edges, setEdges, setBoardSettings]);
  
  // 뷰포트 중앙 업데이트
  const updateViewportCenter = useCallback((instance = reactFlowInstance) => {
    // 1. ReactFlow 래퍼와 인스턴스가 존재하는지 확인
    if (!reactFlowWrapper.current || !instance) {
      console.log('ReactFlow wrapper or instance not available yet');
      return;
    }
    
    try {
      // 2. 필요한 메서드가 있는지 확인
      if (typeof instance.screenToFlowPosition !== 'function') {
        console.log('screenToFlowPosition method not available yet');
        return;
      }
      
      // 3. 래퍼 요소의 크기 가져오기
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      if (!rect || typeof rect.width !== 'number' || typeof rect.height !== 'number') {
        console.log('Invalid bounding rect');
        return;
      }
      
      // 4. 중앙 좌표 계산
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // 5. 좌표 객체가 유효한지 확인
      const position = { x: centerX, y: centerY };
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        console.log('Invalid position coordinates', position);
        return;
      }
      
      // 6. 변환 및 결과 기록
      const centerPosition = instance.screenToFlowPosition(position);
      console.log('Viewport center updated:', centerPosition);
    } catch (error) {
      // 7. 모든 오류를 캐치
      console.error('Viewport center update failed:', error);
    }
  }, [reactFlowInstance]);
  
  // 페이지 언로드 전 저장되지 않은 변경사항 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        saveAllLayoutData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveAllLayoutData]);
  
  // 카드 데이터 불러오기
  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // API에서 카드 불러오기
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('데이터 불러오기 실패');
      }
      
      const cards = await response.json();
      
      // 전역 상태에 카드 목록 저장
      setCards(cards);
      
      // 이전에 저장된 위치 정보 가져오기
      let nodePositions: Record<string, { position: { x: number, y: number } }> = {};
      try {
        const savedPositions = localStorage.getItem(STORAGE_KEY);
        if (savedPositions) {
          nodePositions = JSON.parse(savedPositions);
        }
      } catch (err) {
        console.error('저장된 위치 불러오기 실패:', err);
      }
      
      // 카드 데이터를 노드로 변환
      const initialNodes = cards.map((card: any, index: number) => {
        // ID에 해당하는 위치 정보가 있으면 사용, 없으면 기본 위치 설정
        const savedPosition = nodePositions[card.id]?.position || { x: index * 250, y: 50 };
        
        return {
          id: card.id,
          type: 'card',
          position: savedPosition,
          data: {
            ...card,
            onSelect: onSelectCard,
          },
        };
      });
      
      // 이전에 저장된 엣지 정보 가져오기
      let initialEdges: Edge[] = [];
      try {
        const savedEdges = localStorage.getItem(EDGES_STORAGE_KEY);
        if (savedEdges) {
          initialEdges = JSON.parse(savedEdges);
        }
      } catch (err) {
        console.error('저장된 엣지 불러오기 실패:', err);
      }
      
      // 저장된 위치 그대로 사용
      let layoutedNodes = [...initialNodes];
      let layoutedEdges = [...initialEdges];
      
      console.log('[BoardComponent] 저장된 노드 위치를 사용합니다.');
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
      setIsLoading(false);
      setError(null);
      
      // 모든 노드가 뷰에 맞도록 조정 (Fit to View)
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
          console.log('[BoardComponent] 뷰에 맞게 화면을 조정했습니다');
        }
      }, 100);
      
      return { nodes: layoutedNodes, edges: layoutedEdges };
    } catch (error) {
      console.error('카드 데이터 불러오기 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
      setIsLoading(false);
      return { nodes: [], edges: [] };
    }
  }, [onSelectCard, setNodes, setEdges, reactFlowInstance]);
  
  // 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    fetchCards();
    
    // 창 크기 변경 시 뷰포트 중앙 업데이트
    const handleResize = () => {
      updateViewportCenter();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 인증 상태가 변경되면 보드 설정 다시 로드
  useEffect(() => {
    if (!isAuthLoading) {
      loadBoardSettingsFromServerIfAuthenticated();
    }
  }, [isAuthLoading]);
  
  // 저장된 레이아웃 적용
  const applyStoredLayout = useCallback((cardsData: any[], storedLayout: any[]) => {
    return cardsData.map((card: any, index: number) => {
      const cardId = card.id.toString();
      // 저장된 레이아웃에서 해당 카드의 위치 정보 찾기
      const storedPosition = storedLayout.find(item => item.id === cardId)?.position;
      
      // 저장된 위치가 있으면 사용, 없으면 기본 그리드 위치 사용
      const position = storedPosition || {
        x: (index % 3) * 350 + 50,
        y: Math.floor(index / 3) * 250 + 50,
      };
      
      // 카드 태그 준비
      const tags = card.cardTags && card.cardTags.length > 0
        ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
        : [];
      
      return {
        id: cardId,
        type: 'card',
        data: { 
          ...card,
          tags: tags
        },
        position,
      };
    });
  }, []);
  
  // 노드 연결 핸들러
  const onConnect = useCallback((params: Connection) => {
    // 소스 노드와 타겟 노드가 같은 경우 연결 방지
    if (params.source === params.target) {
      toast.error('같은 카드에 연결할 수 없습니다.');
      return;
    }
    
    // 기존 노드 정보
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    if (sourceNode && targetNode) {
      // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
      const firstNode = nodes[0];
      const isHorizontal = firstNode?.targetPosition === Position.Left;
      
      // 핸들 ID 설정
      let sourceHandle = params.sourceHandle;
      let targetHandle = params.targetHandle;
      
      // 핸들 ID가 없는 경우 기본값 설정
      if (!sourceHandle) {
        sourceHandle = isHorizontal ? 'right' : 'bottom';
      }
      if (!targetHandle) {
        targetHandle = isHorizontal ? 'left' : 'top';
      }
      
      // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
      const edgeId = `${params.source}-${params.target}-${Date.now()}`;
      
      // 기본 에지 스타일과 데이터 설정
      const newEdge = {
        ...params,
        id: edgeId,
        sourceHandle,
        targetHandle,
        type: 'custom', // 커스텀 엣지 타입 사용
        animated: boardSettings.animated,
        style: {
          strokeWidth: boardSettings.strokeWidth,
          stroke: boardSettings.edgeColor,
        },
        // 방향 표시가 활성화된 경우에만 마커 추가
        markerEnd: boardSettings.markerEnd ? {
          type: MarkerType.ArrowClosed,
          width: boardSettings.strokeWidth * 2,
          height: boardSettings.strokeWidth * 2,
          color: boardSettings.edgeColor,
        } : undefined,
        data: {
          edgeType: boardSettings.connectionLineType,
          settings: { ...boardSettings }
        },
      };
      
      // 새 Edge 추가 및 로컬 스토리지에 저장
      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);
        
        // 엣지 저장
        saveEdges(newEdges);
        
        return newEdges;
      });
      
      // 저장 상태로 표시
      hasUnsavedChanges.current = true;
      
      // 성공 메시지
      toast.success('카드가 연결되었습니다.');
    }
  }, [nodes, boardSettings, saveEdges, setEdges]);
  
  // 카드 선택 핸들러
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // 다중 선택 모드 (Ctrl/Cmd 키 누른 상태)
    const isMultiSelectMode = event.ctrlKey || event.metaKey;
    
    // 노드 id 가져오기
    const nodeId = node.id;
    
    // 기본 이벤트 관리
    event.stopPropagation();
    
    if (isMultiSelectMode) {
      // 다중 선택 모드: 선택된 카드 목록에 추가/제거
      console.log('다중 선택 모드로 노드 클릭:', node.id);
      
      // 토스트 메시지 결정을 위해 현재 선택 상태 미리 확인
      const isCurrentlySelected = selectedCardIds.includes(nodeId);
      
      // 상태 업데이트
      toggleSelectedCard(nodeId);
      
      // 성공 메시지 표시 - 다중 선택 모드
      if (isCurrentlySelected) {
        toast.success(`'${(node.data as any).title}'가 선택에서 제거되었습니다.`, {
          duration: 1500,
          position: 'bottom-center',
        });
      } else {
        toast.success(`'${(node.data as any).title}'가 선택에 추가되었습니다.`, {
          duration: 1500,
          position: 'bottom-center',
        });
      }
    } else {
      // 단일 선택 모드: 하나만 선택
      console.log('단일 선택 모드로 노드 클릭:', node.id);
      
      // 이미 선택된 카드를 다시 클릭하는 경우 처리
      if (selectedCardIds.length === 1 && selectedCardIds[0] === nodeId) {
        // 동일한 카드 재선택 - 아무것도 하지 않음
        console.log('이미 선택된 카드 재선택:', nodeId);
      } else {
        // 새로운 카드 선택
        selectCard(nodeId);
        
        // 성공 메시지 표시 - 단일 선택 모드
        toast.success(`'${(node.data as any).title}'가 선택되었습니다.`, {
          duration: 1500,
          position: 'bottom-center',
        });
      }
    }
    
    // props로 전달된 콜백이 있다면 실행
    if (onSelectCard) {
      onSelectCard(nodeId);
    }
  }, [onSelectCard, selectedCardIds, selectCard, toggleSelectedCard]);
  
  // 페인 클릭 핸들러 (빈 공간 클릭)
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Ctrl/Meta 키가 눌려있지 않은 경우에만 모든 선택 해제
    if (!(event.ctrlKey || event.metaKey)) {
      const appState = useAppStore.getState();
      const { selectedCardIds, clearSelectedCards } = appState;
      
      // 선택된 카드가 있을 때만 토스트 표시 및 선택 해제
      if (selectedCardIds.length > 0) {
        if (selectedCardIds.length > 1) {
          toast.info(`${selectedCardIds.length}개 카드 선택이 해제되었습니다.`, {
            duration: 1500,
            position: 'bottom-center',
          });
        } else {
          toast.info('카드 선택이 해제되었습니다.', {
            duration: 1500,
            position: 'bottom-center',
          });
        }
        
        // 선택 해제
        clearSelectedCards();
        if (onSelectCard) {
          onSelectCard(null);
        }
      }
    }
  }, [onSelectCard]);
  
  // 카드 생성 완료 핸들러
  const handleCardCreated = useCallback((cardData: any) => {
    // 뷰포트 중앙 또는 기본 위치에 새 카드 추가
    const centerPosition = reactFlowWrapper.current && reactFlowInstance ? {
      x: reactFlowWrapper.current.offsetWidth / 2 - 75, // 카드 너비의 절반 만큼 조정
      y: reactFlowWrapper.current.offsetHeight / 2 - 50  // 카드 높이의 절반 만큼 조정
    } : { x: 100, y: 100 };
      
    const newCard = {
      id: cardData.id,
      type: 'card',
      data: {
        ...cardData,
        title: cardData.title || '새 카드',
        content: cardData.content || ''
      },
      position: centerPosition
    };
      
    setNodes((nds) => [...nds, newCard]);
    
    // 노드 생성 후 모달 닫기
    setIsCreateModalOpen(false);
      
    // 노드 위치 저장
    saveLayout([...nodes, newCard]);
    
    toast.success('새 카드가 생성되었습니다.');
  }, [nodes, saveLayout, setNodes, reactFlowWrapper, reactFlowInstance]);

  // CreateCardButton 클릭 핸들러 추가
  const handleCreateCardClick = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);
  
  // 자동 저장 
  useEffect(() => {
    // 자동 저장이 비활성화된 경우 리턴
    if (BOARD_CONFIG.autoSaveInterval <= 0) return;
    
    const autoSaveTimer = setInterval(() => {
      if (hasUnsavedChanges.current) {
        saveAllLayoutData();
        console.log('자동 저장 완료');
      }
    }, BOARD_CONFIG.autoSaveInterval * 60 * 1000); // 분 단위를 밀리초로 변환
    
    return () => {
      clearInterval(autoSaveTimer);
    };
  }, [saveAllLayoutData]);
  
  // 그리드 레이아웃 자동 배치
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getGridLayout(nodes);
    setNodes(layoutedNodes);
    saveLayout(layoutedNodes);
    toast.success("카드가 격자 형태로 배치되었습니다.");
  }, [nodes, setNodes, saveLayout]);
  
  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // 레이아웃 변경 후 저장 상태로 표시
    hasUnsavedChanges.current = true;
    
    // 모든 노드의 내부 구조 업데이트 - 핸들 위치를 반영하기 위해
    // 즉시 업데이트
    layoutedNodes.forEach(node => {
      updateNodeInternals(node.id);
    });
    
    // 약간의 지연 후 다시 업데이트 (레이아웃 변경 완료 후)
    setTimeout(() => {
      layoutedNodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 50);
    
    // 애니메이션 완료 후 최종 업데이트
    setTimeout(() => {
      layoutedNodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 300);
    
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
  }, [nodes, edges, setNodes, setEdges, updateNodeInternals]);
  
  // 엣지 드롭 시 카드 생성 핸들러
  const handleEdgeDropCardCreated = useCallback((
    cardData: any, 
    position: XYPosition, 
    connectingNodeId: string, 
    handleType: 'source' | 'target'
  ) => {
    // 새 카드 노드 생성
    const newNode = {
      id: cardData.id,
      type: 'card',
      data: {
        ...cardData,
        title: cardData.title || '새 카드',
        content: cardData.content || ''
      },
      position
    };
    
    // 노드 추가
    setNodes((nds) => [...nds, newNode]);
    
    // React Flow 공식 예제 방식으로 엣지 연결
    // 소스와 타겟 설정 (handleType에 따라)
    const source = handleType === 'source' ? connectingNodeId : newNode.id;
    const target = handleType === 'source' ? newNode.id : connectingNodeId;
    
    // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
    const edgeId = `${source}-${target}-${Date.now()}`;
    
    // 새 엣지 객체 생성 및 추가
    const newEdge = {
      id: edgeId,
      source,
      target,
      type: 'custom',
      animated: boardSettings.animated,
      style: {
        strokeWidth: boardSettings.strokeWidth,
        stroke: boardSettings.edgeColor,
      },
      // 방향 표시가 활성화된 경우에만 마커 추가
      markerEnd: boardSettings.markerEnd ? {
        type: MarkerType.ArrowClosed,
        width: boardSettings.strokeWidth * 2,
        height: boardSettings.strokeWidth * 2,
        color: boardSettings.edgeColor,
      } : undefined,
      data: {
        edgeType: boardSettings.connectionLineType,
        settings: { ...boardSettings }
      },
    };
    
    // 엣지 배열에 직접 추가
    setEdges((eds) => [...eds, newEdge]);
    
    // 엣지 상태 저장
    saveEdges([...edges, newEdge]);
    
    // 모달 닫기
    setIsEdgeDropModalOpen(false);
    setEdgeDropPosition(null);
    setEdgeDropNodeId(null);
    setEdgeDropHandleType(null);
    
    // 노드 위치 저장
    saveLayout([...nodes, newNode]);
    
    toast.success('새 카드가 생성되었습니다.');
    
    // 카드 목록 업데이트를 위해 데이터 다시 불러오기
    setTimeout(() => {
      fetchCards();
    }, 500);
  }, [nodes, edges, setNodes, setEdges, saveEdges, saveLayout, boardSettings, fetchCards]);
  
  // 컴포넌트 내 useEffect 추가 (다른 useEffect와 함께 배치)
  // 이 useEffect는 디버깅 용도로 컴포넌트 마운트 시 보드 설정 상태를 로깅합니다
  useEffect(() => {
    console.log('[BoardComponent] 컴포넌트 마운트 - 현재 보드 설정:', boardSettings);
    logCurrentBoardSettings();
    
    // 디버깅 함수를 전역에 노출 (콘솔에서 직접 호출할 수 있도록)
    if (typeof window !== 'undefined') {
      (window as any).resetAllStorage = resetAllStorage;
      (window as any).logBoardSettings = logCurrentBoardSettings;
      console.log('[디버깅] window.resetAllStorage() 및 window.logBoardSettings() 함수가 등록되었습니다.');
    }
  }, [boardSettings]);
  
  // ==================== 보드 설정 최적화 ====================
  // boardSettings 변경 감지 및 엣지 스타일 업데이트
  // 이 부분에서 무한 루프가 발생할 가능성이 높음
  const prevBoardSettingsRef = useRef(boardSettings);
  const prevEdgesRef = useRef(edges);

  useEffect(() => {
    // 1. 무한 루프 방지를 위한 다중 조건 체크
    if (edges.length === 0 || isLoading) {
      return; // 엣지가 없거나 로딩 중이면 처리하지 않음
    }
    
    // 2. 불필요한 업데이트 방지를 위한 설정 및 엣지 변경 감지
    // 직접 비교 대신 JSON 문자열로 변환하여 깊은 비교 수행
    const settingsJSON = JSON.stringify(boardSettings);
    const prevSettingsJSON = JSON.stringify(prevBoardSettingsRef.current);
    const settingsChanged = settingsJSON !== prevSettingsJSON;
    
    // 엣지 배열 자체가 변경되었는지 확인 (참조 비교만으로는 부족)
    const edgesChanged = edges !== prevEdgesRef.current;
    
    if (!settingsChanged && !edgesChanged) {
      // 설정과 엣지가 모두 변경되지 않았으면 업데이트 건너뛰기
      return;
    }
    
    // 3. 디버깅 정보 로깅
    console.log(
      '[BoardComponent] 설정 또는 엣지 변경 감지. 설정 변경:', 
      settingsChanged, 
      '엣지 변경:', 
      edgesChanged
    );
    
    // 4. 엣지 업데이트 처리를 requestAnimationFrame으로 래핑
    // 이렇게 하면 여러 업데이트가 단일 렌더링 사이클로 일괄 처리됨
    const frameId = requestAnimationFrame(() => {
      try {
        // 5. 설정이 변경된 경우에만 엣지 스타일 업데이트
        if (settingsChanged) {
          // applyEdgeSettings 함수는 새 엣지 배열을 반환함
          const updatedEdges = applyEdgeSettings(edges, boardSettings);
          
          // 엣지 배열 자체가 변경된 경우에만 setEdges 호출
          if (JSON.stringify(updatedEdges) !== JSON.stringify(edges)) {
            // 함수형 업데이트를 통해 상태 업데이트
            setEdges(updatedEdges);
            console.log('[BoardComponent] 엣지 스타일 업데이트 완료');
          }
        }
        
        // 6. 현재 값을 이전 값으로 저장
        prevBoardSettingsRef.current = boardSettings;
        prevEdgesRef.current = edges;
      } catch (error) {
        console.error('[BoardComponent] 엣지 스타일 업데이트 중 오류:', error);
      }
    });
    
    // 7. 정리 함수에서 애니메이션 프레임 취소
    return () => {
      cancelAnimationFrame(frameId);
    };
  // 8. 의존성 배열에는 꼭 필요한 값만 포함
  // boardSettings와 edges만 포함하고, 다른 함수나 객체는 제외
  }, [boardSettings, edges, isLoading]);
  
  // ==================== ReactFlow 초기화 최적화 ====================
  // ReactFlow 인스턴스를 초기화하는 함수
  const handleReactFlowInit = useCallback((flow: any) => {
    // 무한 루프 방지를 위한 안전 장치
    try {
      if (!flow) {
        console.warn('[BoardComponent] ReactFlow 초기화: 인스턴스가 null입니다');
        return;
      }
      
      if (typeof flow.screenToFlowPosition !== 'function') {
        console.warn('[BoardComponent] ReactFlow 초기화: screenToFlowPosition 함수가 없습니다');
        return;
      }
      
      // viewport 중앙 업데이트 (초기화 직후 1회만 수행)
      if (flow && typeof flow.screenToFlowPosition === 'function') {
        updateViewportCenter(flow);
      }
      
      // 전역 상태에 인스턴스 저장 (필요 시 사용)
      // 중요: 이미 저장된 경우 중복 저장하지 않음
      const currentInstance = useAppStore.getState().reactFlowInstance;
      if (currentInstance !== flow) {
        setReactFlowInstance(flow);
        console.log('[BoardComponent] ReactFlow 인스턴스 초기화 및 전역 상태 저장 완료');
      }
    } catch (error) {
      console.error('[BoardComponent] ReactFlow 초기화 중 오류:', error);
    }
  }, [updateViewportCenter, setReactFlowInstance]);
  
  // 드래그 오버 이벤트 핸들러 추가
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 드롭 이벤트 핸들러 추가
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    // React Flow 래퍼 요소가 없으면 중단
    if (!reactFlowWrapper.current || !reactFlowInstance) {
      return;
    }

    // 드래그된 데이터 확인
    const reactFlowData = event.dataTransfer.getData('application/reactflow');
    if (!reactFlowData) return;

    try {
      // 데이터 파싱
      const cardData = JSON.parse(reactFlowData);
      
      // 드롭된 위치 계산
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 노드 중복 확인
      const existingNode = nodes.find(n => n.id === cardData.id);
      if (existingNode) {
        // 이미 캔버스에 해당 카드가 있으면 위치만 업데이트
        const updatedNodes = nodes.map(n => {
          if (n.id === cardData.id) {
            return {
              ...n,
              position
            };
          }
          return n;
        });
        setNodes(updatedNodes);
        saveLayout(updatedNodes); // 레이아웃 저장
        toast.info('카드 위치가 업데이트되었습니다.');
      } else {
        // 새로운 노드 생성
        const newNode = {
          id: cardData.id,
          type: 'card',
          position,
          data: cardData.data,
        };

        // 노드 추가
        setNodes(nodes => [...nodes, newNode]);
        saveLayout([...nodes, newNode]); // 레이아웃 저장
        toast.success('카드가 캔버스에 추가되었습니다.');
      }
    } catch (error) {
      console.error('드롭된 데이터 처리 중 오류 발생:', error);
      toast.error('카드를 캔버스에 추가하는 중 오류가 발생했습니다.');
    }
  }, [reactFlowInstance, nodes, setNodes, saveLayout]);
  
  // React Flow에서의 선택 변경 이벤트 핸들러
  const handleSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
    console.log('[BoardComponent] 선택 변경 감지:', { 
      선택된_노드_수: nodes.length,
      선택된_엣지_수: edges.length,
      선택된_노드_ID: nodes.map(node => node.id)
    });

    // 선택된 노드 ID 배열 추출
    const selectedNodeIds = nodes.map(node => node.id);
    
    // React Flow의 선택 상태를 Zustand 상태로 동기화
    // 현재 선택된 ID 배열과 다를 때만 업데이트 (불필요한 리렌더링 방지)
    const currentSelectedIds = useAppStore.getState().selectedCardIds;
    if (!arraysEqual(currentSelectedIds, selectedNodeIds)) {
      // 전역 상태 업데이트
      selectCards(selectedNodeIds);
      
      // 선택된 노드가 있는 경우 토스트 메시지 표시
      if (selectedNodeIds.length > 1) {
        toast.info(`${selectedNodeIds.length}개 카드가 선택되었습니다.`, {
          duration: 2000,
          position: 'bottom-center',
        });
      }
    }
  }, [selectCards]);
  
  // 배열 비교 헬퍼 함수
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };
  
  // Zustand 상태 변경을 React Flow 선택 상태에 동기화
  useEffect(() => {
    if (reactFlowInstance) {
      const rfNodes = reactFlowInstance.getNodes();
      // 선택된 노드들만 업데이트하도록 최적화
      const changedNodes = rfNodes.map(node => {
        const isSelected = selectedCardIds.includes(node.id);
        // 현재 선택 상태와 다를 때만 변경 (불필요한 리렌더링 방지)
        if (node.selected !== isSelected) {
          return {
            ...node,
            selected: isSelected
          };
        }
        return node;
      });
      
      // 노드 상태가 변경된 경우에만 setNodes 호출
      const hasChanges = changedNodes.some((node, i) => node.selected !== rfNodes[i].selected);
      if (hasChanges) {
        console.log("[BoardComponent] 동기화: Zustand 상태 → React Flow 선택 상태");
        setNodes(changedNodes);
      }
    }
  }, [selectedCardIds, reactFlowInstance, setNodes]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">보드를 불러오는 중...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCards}>다시 시도</Button>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("w-full h-full bg-white relative", className)} 
      ref={reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={handleReactFlowInit}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionKeyCode={["Meta", "Control"]}
        multiSelectionKeyCode={["Meta", "Control", "Shift"]}
        connectionLineStyle={{ 
          stroke: boardSettings.edgeColor || '#C1C1C1',
          strokeWidth: 2 
        }}
        className="react-flow-container"
        fitView
        proOptions={{ hideAttribution: true }}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.1}
        maxZoom={4}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        elevateEdgesOnSelect
        selectNodesOnDrag={false}
        zoomOnDoubleClick={true}
        fitViewOptions={{ padding: 0.3 }}
        style={{ background: '#ffffff' }}
      >
        {showControls && <DevTools />}
        <Controls />
        <Background />
        
        {/* 보드 컨트롤러 패널 */}
        {showControls && (
          <>
            <Panel position="top-right" className="mt-3 mr-2">
              <Controls />
            </Panel>
          </>
        )}
      </ReactFlow>
      
      {/* 일반 카드 생성 모달 */}
      <SimpleCreateCardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCardCreated={handleCardCreated}
      />
      
      {/* 엣지 드롭 카드 생성 모달 */}
      {isEdgeDropModalOpen && edgeDropPosition && edgeDropNodeId && edgeDropHandleType && (
        <CreateCardModal
          position={edgeDropPosition}
          connectingNodeId={edgeDropNodeId}
          handleType={edgeDropHandleType}
          onClose={() => {
            setIsEdgeDropModalOpen(false);
            setEdgeDropPosition(null);
            setEdgeDropNodeId(null);
            setEdgeDropHandleType(null);
          }}
          onCardCreated={handleEdgeDropCardCreated}
        />
      )}
    </div>
  );
} 