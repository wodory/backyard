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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LayoutGrid } from 'lucide-react';
import CardNode from '@/components/board/CardNode';
import { toast } from 'sonner';
import CreateCardButton from '@/components/cards/CreateCardButton';
import LayoutControls from '@/components/board/LayoutControls';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';

// 노드 타입 설정
const nodeTypes = {
  card: CardNode,
};

// 로컬 스토리지 키
const STORAGE_KEY = 'backyard-board-layout';
const EDGES_STORAGE_KEY = 'backyard-board-edges';

// 새 카드의 중앙 위치를 계산하는 함수
const getNewCardPosition = (viewportCenter?: { x: number, y: number }) => {
  if (!viewportCenter) return { x: 100, y: 100 }; // 기본값
  return viewportCenter;
};

// 카드를 자동으로 정렬하는 함수
const autoLayoutNodes = (nodes: Node[]) => {
  const HORIZONTAL_GAP = 350;
  const VERTICAL_GAP = 250;
  const CARDS_PER_ROW = 3;
  
  return nodes.map((node, index) => {
    return {
      ...node,
      position: {
        x: (index % CARDS_PER_ROW) * HORIZONTAL_GAP + 50,
        y: Math.floor(index / CARDS_PER_ROW) * VERTICAL_GAP + 50,
      }
    };
  });
};

// 내부 구현을 위한 컴포넌트
function BoardContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportCenter, setViewportCenter] = useState<{ x: number, y: number } | undefined>(undefined);
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
      saveLayout(updatedNodes);
    }
  }, [nodes, onNodesChange]);

  // 엣지 변경 핸들러
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // 기본 변경 적용
    onEdgesChange(changes);
    
    // 엣지 삭제 처리
    const removedEdges = changes.filter(change => change.type === 'remove');
    if (removedEdges.length > 0) {
      toast.info('연결선이 삭제되었습니다.');
    }
    
    // 변경 후 로컬 스토리지에 저장
    setTimeout(() => saveEdges(), 100);
  }, [onEdgesChange]);

  // 레이아웃을 로컬 스토리지에 저장
  const saveLayout = useCallback((nodesToSave: Node[]) => {
    try {
      // 노드 ID와 위치만 저장
      const positions = nodesToSave.map(node => ({
        id: node.id,
        position: node.position,
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  }, []);

  // 엣지를 로컬 스토리지에 저장
  const saveEdges = useCallback(() => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
    } catch (err) {
      console.error('Error saving edges:', err);
    }
  }, [edges]);

  // 수동으로 현재 레이아웃 저장
  const handleSaveLayout = useCallback(() => {
    saveLayout(nodes);
    saveEdges();
    toast.success('보드 레이아웃과 연결선이 저장되었습니다.');
  }, [nodes, saveLayout, saveEdges]);

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

  // 카드 데이터를 가져와서 노드로 변환
  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        throw new Error('카드 데이터를 불러오는데 실패했습니다.');
      }
      
      const cardsData = await response.json();
      
      // 로컬 스토리지에서 저장된 레이아웃 가져오기
      let storedLayout = [];
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          storedLayout = JSON.parse(storedData);
        }
      } catch (err) {
        console.error('Error loading stored layout:', err);
      }
      
      // 카드 데이터를 노드로 변환 (저장된 레이아웃 적용)
      const cardNodes: Node[] = applyStoredLayout(cardsData, storedLayout);
      
      setNodes(cardNodes);
      
      // 저장된 엣지 불러오기
      try {
        const storedEdges = localStorage.getItem(EDGES_STORAGE_KEY);
        if (storedEdges) {
          setEdges(JSON.parse(storedEdges));
        } else {
          // 임시 엣지 생성 (처음 실행 시에만)
          const dummyEdges: Edge[] = [];
          
          // 간단한 예시로 첫 번째 카드와 두 번째 카드를 연결 (데이터가 있을 경우)
          if (cardNodes.length >= 2) {
            dummyEdges.push({
              id: 'e1-2',
              source: cardNodes[0].id,
              target: cardNodes[1].id,
              type: 'smoothstep',
              animated: true,
            });
          }
          
          // 카드가 3개 이상이면 첫 번째와 세 번째도 연결 (예시)
          if (cardNodes.length >= 3) {
            dummyEdges.push({
              id: 'e1-3',
              source: cardNodes[0].id,
              target: cardNodes[2].id,
              type: 'default',
            });
          }
          
          setEdges(dummyEdges);
        }
      } catch (err) {
        console.error('Error loading stored edges:', err);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('카드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges, applyStoredLayout]);

  // 연결선 생성 처리 핸들러
  const onConnect = useCallback(
    (connection: Connection) => {
      // 새로운 연결선 생성 시 edges 상태에 추가
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            type: 'smoothstep', // 기본 연결선 타입 설정
            animated: false, // 필요에 따라 애니메이션 설정
            style: { stroke: '#555', strokeWidth: 2 }, // 연결선 스타일 설정
          }, 
          eds
        );
        
        // 로컬 스토리지에 저장
        setTimeout(() => {
          try {
            localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(newEdges));
          } catch (err) {
            console.error('Error saving edges after connection:', err);
          }
        }, 100);
        
        return newEdges;
      });
      
      toast.success('새로운 연결이 생성되었습니다.');
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

  // 노드 자동 배치 (기존 함수 수정)
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getGridLayout(nodes);
    setNodes(layoutedNodes);
    saveLayout(layoutedNodes);
    toast.success("카드가 격자 형태로 배치되었습니다.");
  }, [nodes, setNodes, saveLayout]);

  // 새로운 레이아웃 변경 핸들러 추가
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    saveLayout(layoutedNodes);
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃으로 변경되었습니다.`);
  }, [nodes, edges, setNodes, setEdges, saveLayout]);

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
        connectionLineType={ConnectionLineType.SmoothStep}
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
        </Panel>
        
        {/* 오른쪽 상단에 레이아웃 컨트롤 패널 추가 */}
        <Panel position="top-right" className="mr-2 mt-2">
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