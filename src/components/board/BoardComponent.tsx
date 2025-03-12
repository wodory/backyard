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
  XYPosition
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
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
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
    // applyNodeChanges 함수를 사용하여 적절하게 노드 변경사항 적용
    setNodes((nds) => applyNodeChanges(changes, nds));
    
    // 위치 변경이 있는 경우에만 저장 상태로 표시
    const positionChanges = changes.filter(
      (change) => change.type === 'position' && change.dragging === false
    );
    
    if (positionChanges.length > 0) {
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
    saveBoardSettings(newSettings);
    setBoardSettings(newSettings);
    
    // 새 설정을 엣지에 적용
    const updatedEdges = applyEdgeSettings(edges, newSettings);
    setEdges(updatedEdges);
    
    // 인증된 사용자인 경우 서버에도 저장
    if (isAuthenticated && user?.id) {
      saveBoardSettingsToServer(user.id, newSettings)
        .then(() => toast.success('보드 설정이 저장되었습니다'))
        .catch(err => {
          console.error('서버에 보드 설정 저장 실패:', err);
          toast.error('서버에 설정 저장 실패');
        });
    }
  }, [edges, setEdges, isAuthenticated, user?.id]);
  
  // 인증 상태에 따라 서버에서 설정 불러오기
  const loadBoardSettingsFromServerIfAuthenticated = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const settings = await loadBoardSettingsFromServer(user.id);
        if (settings) {
          setBoardSettings(settings);
          saveBoardSettings(settings);
          
          // 새 설정을 엣지에 적용
          const updatedEdges = applyEdgeSettings(edges, settings);
          setEdges(updatedEdges);
        } else {
          // 서버에 설정이 없으면 로컬 설정 사용
          const localSettings = loadBoardSettings();
          setBoardSettings(localSettings);
        }
      } catch (err) {
        console.error('서버에서 보드 설정 불러오기 실패:', err);
        
        // 에러 시 로컬 설정 사용
        const localSettings = loadBoardSettings();
        setBoardSettings(localSettings);
      }
    } else {
      // 로그인하지 않은 경우 로컬 설정 사용
      const localSettings = loadBoardSettings();
      setBoardSettings(localSettings);
    }
  }, [isAuthenticated, user?.id]);
  
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
  
  // 카드 및 설정 데이터 로드
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API에서 카드 데이터 가져오기
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다.');
      }
      
      const cardsData = await response.json();
      
      // 로컬 스토리지에서 노드 위치 불러오기
      let savedNodesData: Record<string, { position: { x: number, y: number } }> = {};
      try {
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        if (savedLayout) {
          savedNodesData = JSON.parse(savedLayout);
        }
      } catch (err) {
        console.error('레이아웃 불러오기 실패:', err);
      }
      
      // 로컬 스토리지에서 엣지 데이터 불러오기
      let savedEdges: Edge[] = [];
      try {
        const savedEdgesData = localStorage.getItem(EDGES_STORAGE_KEY);
        if (savedEdgesData) {
          // 로컬 스토리지에서 보드 설정 불러오기
          const loadedSettings = loadBoardSettings();
          
          // 엣지 데이터 변환 및 타입 확인
          savedEdges = JSON.parse(savedEdgesData).map((edge: Edge) => {
            // 기본 타입 설정
            const updatedEdge = {
              ...edge,
              type: 'custom', // 모든 엣지에 커스텀 타입 적용
            };
            
            // 엣지의 data.edgeType이 없으면 초기화
            if (!edge.data?.edgeType) {
              updatedEdge.data = {
                ...(edge.data || {}),
                edgeType: loadedSettings.connectionLineType,
                settings: { ...loadedSettings }
              };
            }
            
            // style이 없으면 초기화
            if (!edge.style) {
              updatedEdge.style = {
                strokeWidth: loadedSettings.strokeWidth,
                stroke: edge.selected ? loadedSettings.selectedEdgeColor : loadedSettings.edgeColor
              };
            }
            
            return updatedEdge;
          });
        }
      } catch (err) {
        console.error('엣지 데이터 불러오기 실패:', err);
      }
      
      // 노드 및 엣지 데이터 설정
      const nodes = cardsData.map((card: any) => {
        // 저장된 위치가 있으면 사용, 없으면 기본 위치 생성
        const savedNode = savedNodesData[card.id];
        const position = savedNode ? savedNode.position : { 
          x: Math.random() * 500, 
          y: Math.random() * 300 
        };
        
        return {
          id: card.id,
          type: 'card',
          position,
          data: {
            ...card,
            tags: card.cardTags?.map((ct: any) => ct.tag.name) || []
          }
        };
      });
      
      // 설정에 따라 엣지 스타일 적용
      const styledEdges = applyEdgeSettings(savedEdges, boardSettings);
      
      setNodes(nodes);
      setEdges(styledEdges);
      setLastSavedAt(new Date());  // 초기 로드 시간을 마지막 저장 시간으로 설정
    } catch (err) {
      console.error('카드 데이터 불러오기 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
    if (onSelectCard) {
      onSelectCard(node.id);
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
    <div className={`w-full h-full ${className}`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        edges={edges}
        edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick}
        onInit={flow => {
          try {
            if (flow && typeof flow.screenToFlowPosition === 'function') {
              // flow 인스턴스를 직접 전달하여 updateViewportCenter 호출
              updateViewportCenter(flow);
              console.log('ReactFlow initialized', flow);
            } else {
              console.warn('Flow instance is not fully initialized');
            }
          } catch (error) {
            console.error('Error during ReactFlow initialization:', error);
          }
        }}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        connectionLineType={ConnectionLineType.Step}
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        {showControls && <DevTools />}
        <Controls />
        <Background />
        
        {showControls && (
          <>
            {/* 컨트롤 패널 */}
            <Panel position="top-right" className="space-y-2">
              <LayoutControls 
                onLayoutChange={handleLayoutChange} 
                onAutoLayout={handleAutoLayout}
                onSaveLayout={handleSaveLayout}
              />
              <BoardSettingsControl 
                settings={boardSettings} 
                onSettingsChange={handleBoardSettingsChange}
              />
            </Panel>
            
            {/* 새 카드 생성 버튼 */}
            <Panel position="bottom-right" className="mb-20 mr-2">
              <CreateCardButton onCardCreated={handleCardCreated} />
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