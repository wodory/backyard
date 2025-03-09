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
  applyNodeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import CreateCardButton from '@/components/cards/CreateCardButton';
import LayoutControls from '@/components/board/LayoutControls';
import BoardSettingsControl from '@/components/board/BoardSettingsControl';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';
import { BoardSettings, DEFAULT_BOARD_SETTINGS, loadBoardSettings, saveBoardSettings, applyEdgeSettings } from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY, BOARD_CONFIG } from '@/lib/board-constants';
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import DevTools, { useChangeLoggerHooks } from '@/components/debug/DevTools';

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
  
  // 변경 로거 이벤트 핸들러
  const { onNodesChangeLogger, onEdgesChangeLogger } = useChangeLoggerHooks();
  
  // 노드 및 엣지 변경 로깅을 위한 상태 추가
  const [nodeChanges, setNodeChanges] = useState<NodeChange[]>([]);
  const [edgeChanges, setEdgeChanges] = useState<EdgeChange[]>([]);
  
  // updateNodeInternals 함수 초기화
  const updateNodeInternals = useUpdateNodeInternals();
  
  // ReactFlow 인스턴스 참조
  const { fitView } = useReactFlow();
  
  // 뷰포트 중앙 계산
  const updateViewportCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    setViewportCenter({
      x: width / 2,
      y: height / 2
    });
  }, []);
  
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
    }
  }, [nodes, onNodesChange, onNodesChangeLogger]);
  
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
      // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
      const firstNode = nodes[0];
      const isHorizontal = firstNode?.targetPosition === Position.Left;
      
      // 핸들 ID 설정
      let sourceHandle = params.sourceHandle;
      let targetHandle = params.targetHandle;
      
      // 핸들이 지정되지 않은 경우 레이아웃 방향에 따라 기본 핸들 지정
      if (!sourceHandle) {
        sourceHandle = isHorizontal ? 'right-source' : 'bottom-source';
      }
      if (!targetHandle) {
        targetHandle = isHorizontal ? 'left-target' : 'top-target';
      }
      
      // 보드 설정을 적용한 새 Edge 생성
      const newEdge = {
        ...params,
        sourceHandle,
        targetHandle,
        id: `edge-${params.source}-${params.target}-${Date.now()}`, // 고유 ID 생성
        type: 'custom', // 커스텀 엣지 컴포넌트 사용
        animated: boardSettings.animated, // 애니메이션 설정
        // 스타일 설정
        style: {
          strokeWidth: boardSettings.strokeWidth,
          stroke: boardSettings.edgeColor,
        },
        // 마커 설정
        markerEnd: boardSettings.markerEnd ? {
          type: boardSettings.markerEnd,
          width: boardSettings.markerSize, 
          height: boardSettings.markerSize,
          color: boardSettings.edgeColor,
        } : undefined,
        // 데이터 저장
        data: {
          edgeType: boardSettings.connectionLineType, // 연결선 타입 설정
          settings: { ...boardSettings }, // 현재 보드 설정 저장
          createdAt: new Date().toISOString() // 생성 시간 기록
        }
      };
      
      // 새 Edge 추가 및 로컬 스토리지에 저장
      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);
        
        // 엣지 저장
        try {
          localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(newEdges));
        } catch (error) {
          console.error('엣지 저장 중 오류:', error);
        }
        
        return newEdges;
      });
      
      // 변경 표시
      hasUnsavedChanges.current = true;
      
      // 로그로 확인
      console.log(`새 연결선 생성: ${params.source} -> ${params.target}, 타입: ${boardSettings.connectionLineType}`);
    },
    [nodes, setEdges, boardSettings]
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

  // 보드 설정 변경 핸들러
  const handleSettingsChange = useCallback((newSettings: BoardSettings) => {
    // 설정 변경 내용을 상태와 로컬 스토리지에 저장
    setBoardSettings(newSettings);
    saveBoardSettings(newSettings);
    
    // 모든 엣지에 새 설정 적용 (항상 실행) - 즉시 반영을 위해 강제로 업데이트
    console.log("설정 변경 적용 중...", newSettings);
    
    // 1. 현재 엣지의 복사본 생성 (참조 변경)
    const currentEdgesCopy = JSON.parse(JSON.stringify(edges));
    
    // 2. 설정 적용
    const updatedEdges = applyEdgeSettings(currentEdgesCopy, newSettings);
    
    // 3. 새로운 엣지 배열로 상태 업데이트
    setEdges(updatedEdges);
    
    // 4. 즉시 저장하여 변경 내용이 유지되도록 함
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
    } catch (error) {
      console.error('엣지 저장 중 오류:', error);
    }
    
    // 변경된 설정에 대한 알림 메시지
    const changes: string[] = [];
    
    // 연결선 스타일 변경 확인
    if (newSettings.connectionLineType !== boardSettings.connectionLineType) {
      changes.push('연결선 유형');
    }
    
    if (newSettings.markerEnd !== boardSettings.markerEnd) {
      changes.push('화살표 유형');
    }
    
    if (newSettings.strokeWidth !== boardSettings.strokeWidth) {
      changes.push('선 굵기');
    }
    
    if (newSettings.markerSize !== boardSettings.markerSize) {
      changes.push('화살표 크기');
    }
    
    if (newSettings.edgeColor !== boardSettings.edgeColor || 
        newSettings.selectedEdgeColor !== boardSettings.selectedEdgeColor) {
      changes.push('선 색상');
    }
    
    if (newSettings.animated !== boardSettings.animated) {
      changes.push('애니메이션 ' + (newSettings.animated ? '활성화' : '비활성화'));
    }
    
    if (changes.length > 0) {
      toast.success(`연결선 설정이 변경되었습니다: ${changes.join(', ')}`);
    }
    
    // 스냅 그리드 변경 확인
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
        ref={reactFlowWrapper}
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        edges={edges}
        edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={flow => {
          updateViewportCenter();
          console.log('ReactFlow initialized', flow);
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
        <DevTools />
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