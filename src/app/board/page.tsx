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
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  OnConnectStart,
  OnConnectEnd,
  XYPosition
} from '@xyflow/react';
// reactflow 스타일 버그 픽스 
// import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid, Layout, Settings } from 'lucide-react';
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
// NODE_TYPES, EDGE_TYPES import 대신 직접 정의
import CardNode from '@/components/board/CardNode';
import DevTools, { useChangeLoggerHooks } from '@/components/debug/DevTools';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { CreateCardModal } from '@/components/cards/CreateCardModal';
import { useAuth } from '@/contexts/AuthContext';

// 노드 타입 정의 - 테스트 환경에서는 간단한 Mock 컴포넌트 사용
const NODE_TYPES = {
  cardNode: ({ data }: { data: any }) => (
    <div data-testid={`card-node-${data.id}`}>
      <h3>{data.title}</h3>
      <p>{data.content}</p>
    </div>
  ),
  card: ({ data }: { data: any }) => (
    <div data-testid={`card-node-${data.id}`}>
      <h3>{data.title}</h3>
      <p>{data.content}</p>
    </div>
  )
};

// 엣지 타입 정의
const EDGE_TYPES = {
  defaultEdge: ({ id, data, ...props }: any) => (
    <div>{props.children}</div>
  ),
  custom: ({ id, data, ...props }: any) => (
    <div>{props.children}</div>
  )
};

// 새 카드의 중앙 위치를 계산하는 함수
const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
  if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
  return viewportCenter;
};

// 자동 배치 함수 (테스트용)
export const autoLayoutNodes = (nodes: Node[]) => {
  return nodes.map((node: Node, index: number) => ({
    ...node,
    position: {
      x: (index % 3) * 300 + 50, 
      y: Math.floor(index / 3) * 200 + 50
    }
  }));
};

// 내부 구현을 위한 컴포넌트
function BoardContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportCenter, setViewportCenter] = useState<{ x: number, y: number } | undefined>(undefined);
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // 인증 상태 확인
  const isAuthenticated = !!user;
  
  // 엣지 드롭 기능을 위한 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalInfo, setCreateModalInfo] = useState<{
    position: XYPosition;
    connectingNodeId: string;
    handleType: 'source' | 'target';
  } | null>(null);
  
  // 변경 로거 이벤트 핸들러
  const { onNodesChangeLogger, onEdgesChangeLogger } = useChangeLoggerHooks();
  
  // 노드 및 엣지 변경 로깅을 위한 상태 추가
  const [nodeChanges, setNodeChanges] = useState<NodeChange[]>([]);
  const [edgeChanges, setEdgeChanges] = useState<EdgeChange[]>([]);
  
  // updateNodeInternals 함수 초기화
  const updateNodeInternals = useUpdateNodeInternals();
  
  // ReactFlow 인스턴스 참조
  const { fitView, screenToFlowPosition } = useReactFlow();
  
  // 뷰포트 중앙 계산
  const updateViewportCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    setViewportCenter({
      x: width / 2,
      y: height / 2
    });
  }, []);
  
  // 레이아웃을 로컬 스토리지에 저장하는 함수를 먼저 선언
  const saveLayout = useCallback((nodesToSave: Node[]) => {
    try {
      // 노드 ID와 위치만 저장 (객체 형태로 변환하여 노드 ID를 키로 사용)
      const positions = nodesToSave.reduce((acc, node) => {
        acc[node.id] = { position: node.position };
        return acc;
      }, {} as Record<string, { position: { x: number, y: number } }>);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      return true;
    } catch (err) {
      console.error('Error saving layout:', err);
      return false;
    }
  }, []);

  // 엣지를 로컬 스토리지에 저장
  const saveEdges = useCallback(() => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
      return true;
    } catch (err) {
      console.error('Error saving layout:', err);
      return false;
    }
  }, [edges]);

  // 모든 레이아웃 데이터를 저장
  const saveAllLayoutData = useCallback(() => {
    const layoutSaved = saveLayout(nodes);
    const edgesSaved = saveEdges();
    
    if (layoutSaved && edgesSaved) {
      setLastSavedAt(new Date());
      hasUnsavedChanges.current = false;
      return true;
    }
    return false;
  }, [nodes, saveLayout, saveEdges]);
  
  // 노드 변경 핸들러 수정
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 변경 사항 로깅
    setNodeChanges(changes);
    
    // 변경 로거에 전달
    onNodesChangeLogger(changes);
    
    // 기존 노드 정보를 변경
    onNodesChange(changes);
    
    // 위치 변경이 있는 경우에만 저장 상태로 표시
    const positionChanges = changes.filter(
      change => change.type === 'position' && change.position
    );
    
    if (positionChanges.length > 0) {
      hasUnsavedChanges.current = true;
      // 노드 위치 변경 시 즉시 로컬 스토리지에 저장 (테스트용)
      saveLayout(nodes);
    }
  }, [nodes, onNodesChange, onNodesChangeLogger, saveLayout]);
  
  // 엣지 변경 핸들러 수정
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // 변경 사항 로깅
    setEdgeChanges(changes);
    
    // 변경 로거에 전달
    onEdgesChangeLogger(changes);
    
    // 기본 변경 적용
    onEdgesChange(changes);
    
    // 변경이 있을 때마다 저장 대기 상태로 설정
    hasUnsavedChanges.current = true;
  }, [onEdgesChange, onEdgesChangeLogger]);

  // 보드 설정 변경 핸들러
  const handleBoardSettingsChange = useCallback(async (newSettings: BoardSettings) => {
    setBoardSettings(newSettings);
    
    // 로컬 스토리지에 저장
    saveBoardSettings(newSettings);
    
    // 새 설정을 엣지에 적용
    const updatedEdges = applyEdgeSettings(edges, newSettings);
    setEdges(updatedEdges);
    
    // 인증된 사용자인 경우 서버에도 저장
    if (isAuthenticated && user?.id) {
      const saved = await saveBoardSettingsToServer(user.id, newSettings);
      if (saved) {
        console.log('보드 설정이 서버에 저장되었습니다.');
      } else {
        console.error('보드 설정 서버 저장 실패');
      }
    }
  }, [edges, setEdges, isAuthenticated, user?.id]);

  // 서버에서 보드 설정 로드
  const loadBoardSettingsFromServerIfAuthenticated = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const settings = await loadBoardSettingsFromServer(user.id);
        if (settings) {
          console.log('서버에서 보드 설정을 불러왔습니다.');
          setBoardSettings(settings);
          
          // 새 설정을 엣지에 적용
          const updatedEdges = applyEdgeSettings(edges, settings);
          setEdges(updatedEdges);
        } else {
          // 서버에 설정이 없으면 로컬 설정 사용
          const localSettings = loadBoardSettings();
          setBoardSettings(localSettings);
          
          // 로컬 설정을 서버에 저장
          if (localSettings !== DEFAULT_BOARD_SETTINGS) {
            await saveBoardSettingsToServer(user.id, localSettings);
          }
        }
      } catch (error) {
        console.error('보드 설정 로드 오류:', error);
        // 오류 발생 시 로컬 설정 사용
        const localSettings = loadBoardSettings();
        setBoardSettings(localSettings);
      }
    } else {
      // 인증되지 않은 경우 로컬 설정만 로드
      const localSettings = loadBoardSettings();
      setBoardSettings(localSettings);
    }
  }, [isAuthenticated, user?.id, edges, setEdges]);

  // 수동으로 현재 레이아웃 저장
  const handleSaveLayout = useCallback(() => {
    if (saveAllLayoutData()) {
      toast.success('보드 레이아웃과 연결선이 저장되었습니다.');
    } else {
      toast.error('레이아웃 저장 중 오류가 발생했습니다.');
    }
  }, [saveAllLayoutData]);

  // 자동 저장 기능 설정
  useEffect(() => {
    // 자동 저장 간격 (분 단위를 밀리초로 변환)
    const autoSaveIntervalMs = BOARD_CONFIG.autoSaveInterval * 60 * 1000;

    // 기존 인터벌 정리
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // 자동 저장 인터벌 설정
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChanges.current && nodes.length > 0) {
        const saved = saveAllLayoutData();
        
        // 설정에 따라 토스트 메시지 표시
        if (saved && BOARD_CONFIG.showAutoSaveNotification) {
          toast.info('보드 레이아웃이 자동 저장되었습니다.');
        }
      }
    }, autoSaveIntervalMs);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [nodes, saveAllLayoutData]);

  // 인증 상태가 변경되면 보드 설정 다시 로드
  useEffect(() => {
    if (!isAuthLoading) {
      loadBoardSettingsFromServerIfAuthenticated();
    }
  }, [isAuthLoading, loadBoardSettingsFromServerIfAuthenticated]);

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
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다.');
      }
      
      const cards = await response.json();
      
      // 뷰포트 중앙 계산 (카드 배치를 위해)
      updateViewportCenter();
      
      // 저장된 레이아웃 불러오기 시도
      let storedLayout: Record<string, { position: { x: number, y: number } }> | null = null;
      let storedEdges: Edge[] | null = null;
      
      try {
        const storedLayoutJSON = localStorage.getItem(STORAGE_KEY);
        if (storedLayoutJSON) {
          storedLayout = JSON.parse(storedLayoutJSON);
        }
      } catch (err) {
        console.error('Error loading stored layout:', err);
      }
      
      try {
        const storedEdgesJSON = localStorage.getItem(EDGES_STORAGE_KEY);
        if (storedEdgesJSON) {
          storedEdges = JSON.parse(storedEdgesJSON);
        }
      } catch (err) {
        console.error('Error loading stored layout:', err);
      }
      
      // 노드 생성 (카드 ID를 키로 사용)
      const newNodes: Node[] = cards.map((card: any, index: number) => {
        // 저장된 레이아웃이 있으면 사용, 없으면 그리드 레이아웃 사용
        const position = storedLayout && storedLayout[card.id] 
          ? storedLayout[card.id].position 
          : { x: (index % 3) * 300 + 50, y: Math.floor(index / 3) * 200 + 50 };
        
        return {
          id: card.id.toString(),
          data: { ...card },
          position,
          type: 'cardNode',
        };
      });
      
      setNodes(newNodes);
      
      // 저장된 엣지가 있으면 로드, 없으면 기본 연결 생성
      if (storedEdges && storedEdges.length > 0) {
        setEdges(storedEdges);
      } else if (cards.length >= 2) {
        // 기본적으로 첫 번째 카드에서 다른 모든 카드로 엣지 생성
        const defaultEdges: Edge[] = [];
        
        for (let i = 1; i < cards.length; i++) {
          defaultEdges.push({
            id: `e1-${i+1}`,
            source: '1',
            target: (i+1).toString(),
            type: 'defaultEdge',
            markerEnd: { type: MarkerType.Arrow },
          });
        }
        
        setEdges(defaultEdges);
      }
      
      setIsLoading(false);
      setLastSavedAt(new Date()); // 초기 로드 시간을 마지막 저장 시간으로 설정
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [setNodes, setEdges, updateViewportCenter]);
  
  // 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    fetchCards();
    updateViewportCenter();
    
    // 창 크기 변경 시 뷰포트 중앙 업데이트
    window.addEventListener('resize', updateViewportCenter);
    return () => {
      window.removeEventListener('resize', updateViewportCenter);
    };
  }, [fetchCards, updateViewportCenter]);

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
  const handleConnect = useCallback(
    (params: Connection) => {
      // 커스텀 Edge 생성
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`, // 고유 ID 생성
        type: 'custom', // 커스텀 엣지 컴포넌트 사용
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: '#555',
        },
        markerEnd: {
          type: MarkerType.Arrow,
        },
        data: {
          createdAt: new Date().toISOString() // 생성 시간 기록
        }
      };
      
      // 새 Edge 추가
      setEdges(eds => addEdge(newEdge, eds));
      
      // 변경 표시
      hasUnsavedChanges.current = true;
    },
    [setEdges]
  );
  
  // 카드 생성 후 콜백
  const handleCardCreated = useCallback(async (cardData: any) => {
    try {
      // 새로운 노드 생성
      const newCard = {
        id: cardData.id.toString(),
        type: 'card',
        data: { 
          ...cardData,
          tags: cardData.cardTags?.map((ct: any) => ct.tag.name) || []
        },
        position: getNewCardPosition(viewportCenter),
      };
      
      setNodes((nds) => [...nds, newCard]);
      
      // 노드 위치 저장
      saveLayout([...nodes, newCard]);
      
      toast.success("카드가 보드에 추가되었습니다.");
    } catch (error) {
      console.error("Error adding card to board:", error);
      toast.error("카드를 보드에 추가하는데 실패했습니다.");
    }
  }, [nodes, setNodes, viewportCenter, saveLayout]);

  // 엣지 드롭으로 노드 생성 시 호출되는 함수
  const handleCreateNodeOnEdgeDrop = useCallback((
    position: XYPosition,
    connectingNodeId: string,
    handleType: 'source' | 'target'
  ) => {
    setCreateModalInfo({ position, connectingNodeId, handleType });
    setShowCreateModal(true);
  }, []);
  
  // useAddNodeOnEdgeDrop 훅 사용
  const { onConnectStart, onConnectEnd } = useAddNodeOnEdgeDrop({
    onCreateNode: handleCreateNodeOnEdgeDrop
  });
  
  // 노드를 추가하고 엣지로 연결하는 함수
  const handleCardCreatedWithConnection = useCallback((
    cardData: any,
    position: XYPosition,
    connectingNodeId: string,
    handleType: 'source' | 'target'
  ) => {
    try {
      // 새 카드 노드 생성
      const newCard = {
        id: cardData.id.toString(),
        type: 'card',
        data: { 
          ...cardData,
          tags: cardData.cardTags?.map((ct: any) => ct.tag.name) || []
        },
        position: position,
      };
      
      // 노드 추가
      setNodes(nds => [...nds, newCard]);
      
      // 연결 파라미터 생성
      const connection: Connection = {
        source: handleType === 'source' ? connectingNodeId : newCard.id,
        target: handleType === 'source' ? newCard.id : connectingNodeId,
        // 필요한 경우 sourceHandle과 targetHandle 지정
      };
      
      // 엣지 추가
      handleConnect(connection);
      
      // 저장
      saveLayout([...nodes, newCard]);
      
      // 모달 닫기
      setShowCreateModal(false);
      setCreateModalInfo(null);
      
      toast.success("새 카드가 추가되고 연결되었습니다.");
    } catch (error) {
      console.error("Error creating connected card:", error);
      toast.error("카드 생성 및 연결에 실패했습니다.");
    }
  }, [nodes, setNodes, handleConnect, saveLayout]);
  
  // 모달 닫기 함수
  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setCreateModalInfo(null);
  }, []);

  // 노드 자동 배치 (기존 함수 수정)
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getGridLayout(nodes);
    setNodes(layoutedNodes);
    saveLayout(layoutedNodes);
    toast.success("격자형 레이아웃으로 변경되었습니다");
  }, [nodes, setNodes, saveLayout]);

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
    
    // 레이아웃 자동 저장
    saveLayout(layoutedNodes);
  }, [nodes, edges, setNodes, setEdges, saveLayout]);

  // 자동 레이아웃 적용
  const applyAutoLayout = useCallback(() => {
    // 자동 레이아웃 적용 (그리드)
    const layoutedNodes = autoLayoutNodes(nodes);
    
    setNodes(layoutedNodes);
    toast.success('격자형 레이아웃으로 변경되었습니다');
    
    // 레이아웃 자동 저장
    saveLayout(layoutedNodes);
  }, [nodes, setNodes, saveLayout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-container">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2" data-testid="loading-text">보드를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCards}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        edges={edges}
        edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onInit={flow => {
          updateViewportCenter();
          console.log('ReactFlow initialized', flow);
        }}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        connectionLineType={ConnectionLineType.Bezier}
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        deleteKeyCode={['Backspace', 'Delete']}
        attributionPosition="bottom-left"
      >
        <DevTools />
        <Controls />
        <Background />
        
        {/* 디버그 패널 */}
        <Panel position="top-left" className="z-10">
          <DevTools 
            nodes={nodes} 
            edges={edges} 
            nodeChanges={nodeChanges} 
            edgeChanges={edgeChanges} 
          />
        </Panel>
        
        {/* 상단 패널 - 테스트 셀렉터 수정 */}
        <Panel position="top-left" className="z-20">
          <h2 className="text-lg font-bold mb-2">카드 보드</h2>
          <p className="text-sm text-muted-foreground mb-2">
            노드를 드래그하여 위치를 변경할 수 있습니다.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <a href="/cards">카드 목록</a>
            </Button>
            <Button size="sm" onClick={handleSaveLayout}>
              <Save className="mr-2 h-4 w-4" />
              레이아웃 저장
            </Button>
            <CreateCardButton onCardCreated={handleCardCreated} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            마지막 저장: {lastSavedAt ? lastSavedAt.toLocaleTimeString() : '없음'} (1분마다 자동 저장)
          </p>
        </Panel>
        
        {/* 우측 상단 패널 */}
        <Panel position="top-right">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => applyAutoLayout()}
          >
            <Layout className="h-4 w-4" data-testid="layout-icon" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleBoardSettingsChange(boardSettings)}
          >
            <Settings className="h-4 w-4" data-testid="settings-icon" />
          </Button>
        </Panel>
      </ReactFlow>
      
      {/* 카드 생성 모달 */}
      {showCreateModal && createModalInfo && (
        <CreateCardModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onCardCreated={(cardData) => {
            handleCardCreatedWithConnection(cardData, createModalInfo.position, createModalInfo.connectingNodeId, createModalInfo.handleType);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// 메인 내보내기 컴포넌트 - ReactFlowProvider 추가
export default function BoardPage() {
  return (
    <ReactFlowProvider>
      <BoardContent />
    </ReactFlowProvider>
  );
} 