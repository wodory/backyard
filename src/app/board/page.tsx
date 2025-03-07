'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  NodeChange,
  applyNodeChanges,
  Connection,
  addEdge,
  EdgeChange,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid } from 'lucide-react';
import CardNode from '@/components/board/CardNode';
import { toast } from 'sonner';
import CreateCardButton from '@/components/cards/CreateCardButton';
import LayoutControls from '@/components/board/LayoutControls';
import BoardSettingsControl from '@/components/board/BoardSettingsControl';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { BoardSettings, DEFAULT_BOARD_SETTINGS, loadBoardSettings, saveBoardSettings, applyEdgeSettings } from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';

// 노드 타입 설정
const nodeTypes = {
  card: CardNode,
};

// 새 카드의 중앙 위치를 계산하는 함수
const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
  if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
  return viewportCenter;
};

// 내부 구현을 위한 컴포넌트
function BoardContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportCenter, setViewportCenter] = useState<{ x: number, y: number } | undefined>(undefined);
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // 뷰포트 중앙 계산
  const updateViewportCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    setViewportCenter({
      x: width / 2,
      y: height / 2
    });
  }, []);
  
  // 노드 위치 변경 핸들러 (위치 변경 시에만 저장)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 기존 노드 정보를 변경
    onNodesChange(changes);
    
    // 위치 변경이 있는 경우에만 로컬 스토리지에 저장
    const positionChanges = changes.filter(
      change => change.type === 'position' && change.position
    );
    
    if (positionChanges.length > 0) {
      // 현재 노드 상태에 변경사항 적용
      const updatedNodes = applyNodeChanges(changes, nodes);
      hasUnsavedChanges.current = true;
    }
  }, [nodes, onNodesChange]);

  // 엣지 변경 핸들러
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // 기본 변경 적용
    onEdgesChange(changes);
    
    // 변경이 있을 때마다 저장 대기 상태로 설정
    hasUnsavedChanges.current = true;
  }, [onEdgesChange]);

  // 레이아웃을 로컬 스토리지에 저장
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
      console.error('레이아웃 저장 오류:', err);
      return false;
    }
  }, []);

  // 엣지를 로컬 스토리지에 저장
  const saveEdges = useCallback(() => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
      return true;
    } catch (err) {
      console.error('엣지 저장 오류:', err);
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
  const onConnect = useCallback(
    (params: Connection) => {
      // 기본 연결선 스타일과 마커 적용
      const newEdge = {
        ...params,
        type: boardSettings.connectionLineType,
        markerEnd: boardSettings.markerEnd ? {
          type: boardSettings.markerEnd,
          width: 20,
          height: 20,
        } : undefined,
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, boardSettings]
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

  // 노드 자동 배치 (기존 함수 수정)
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
    
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
  }, [nodes, edges, setNodes, setEdges]);

  // 보드 설정 변경 핸들러
  const handleSettingsChange = useCallback((newSettings: BoardSettings) => {
    setBoardSettings(newSettings);
    saveBoardSettings(newSettings);
    
    // 연결선 스타일 변경이 있을 경우 모든 엣지에 적용
    if (newSettings.connectionLineType !== boardSettings.connectionLineType || 
        newSettings.markerEnd !== boardSettings.markerEnd) {
      const updatedEdges = applyEdgeSettings(edges, newSettings);
      setEdges(updatedEdges);
      toast.success("연결선 스타일이 변경되었습니다.");
    }
    
    // 스냅 그리드 변경 메시지
    if (newSettings.snapToGrid !== boardSettings.snapToGrid || 
        newSettings.snapGrid[0] !== boardSettings.snapGrid[0]) {
      toast.success(
        newSettings.snapToGrid 
          ? `격자에 맞추기가 활성화되었습니다 (${newSettings.snapGrid[0]}px)` 
          : "격자에 맞추기가 비활성화되었습니다"
      );
    }
  }, [boardSettings, edges, setEdges]);

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
          savedEdges = JSON.parse(savedEdgesData);
        }
      } catch (err) {
        console.error('엣지 데이터 불러오기 실패:', err);
      }
      
      // 로컬 스토리지에서 보드 설정 불러오기
      const loadedSettings = loadBoardSettings();
      setBoardSettings(loadedSettings);
      
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
      const styledEdges = applyEdgeSettings(savedEdges, loadedSettings);
      
      setNodes(nodes);
      setEdges(styledEdges);
      setLastSavedAt(new Date());  // 초기 로드 시간을 마지막 저장 시간으로 설정
    } catch (err) {
      console.error('카드 데이터 불러오기 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchCards();
    updateViewportCenter();
    
    // 창 크기 변경 시 뷰포트 중앙 업데이트
    window.addEventListener('resize', updateViewportCenter);
    return () => {
      window.removeEventListener('resize', updateViewportCenter);
    };
  }, [fetchCards, updateViewportCenter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">보드를 불러오는 중...</span>
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
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        connectionLineType={boardSettings.connectionLineType}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <Background />
        <Panel position="top-left" className="bg-card shadow-md rounded-md p-3">
          <h2 className="text-lg font-bold mb-2">카드 보드</h2>
          <p className="text-sm text-muted-foreground mb-2">노드를 드래그하여 위치를 변경할 수 있습니다.</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <a href="/cards">카드 목록</a>
            </Button>
            <Button size="sm" onClick={handleSaveLayout}>
              <Save className="w-4 h-4 mr-1" />
              레이아웃 저장
            </Button>
            <CreateCardButton onCardCreated={handleCardCreated} />
          </div>
          {lastSavedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              마지막 저장: {lastSavedAt.toLocaleTimeString()}
              {BOARD_CONFIG.autoSaveInterval > 0 && 
                ` (${BOARD_CONFIG.autoSaveInterval}분마다 자동 저장)`
              }
            </p>
          )}
        </Panel>
        
        {/* 오른쪽 상단에 레이아웃 및 설정 컨트롤 패널 추가 */}
        <Panel position="top-right" className="mr-2 mt-2 flex gap-2">
          <BoardSettingsControl
            settings={boardSettings}
            onSettingsChange={handleSettingsChange}
          />
          <LayoutControls
            onLayoutChange={handleLayoutChange}
            onAutoLayout={handleAutoLayout}
            onSaveLayout={handleSaveLayout}
          />
        </Panel>
      </ReactFlow>
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