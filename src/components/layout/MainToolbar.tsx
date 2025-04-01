'use client';

import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  PlusCircle,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useCallback, useState } from 'react';
import { SimpleCreateCardModal } from '@/components/cards/SimpleCreateCardModal';
import { toast } from 'sonner';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';

export function MainToolbar() {
  const { layoutDirection, setLayoutDirection, reactFlowInstance } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 카드 생성 핸들러
  const handleCardCreated = useCallback((cardData: any) => {
    // 카드 생성 후 모달 닫기
    setIsCreateModalOpen(false);

    // 새로운 카드가 생성되었으므로 페이지를 새로고침하여 보드에 표시
    window.location.reload();
  }, []);

  // 수평 레이아웃 적용 핸들러
  const applyHorizontalLayout = useCallback(() => {
    if (!reactFlowInstance) {
      toast.error('React Flow 인스턴스를 찾을 수 없습니다');
      return;
    }

    // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    if (!nodes.length) {
      toast.error('적용할 노드가 없습니다');
      return;
    }

    // 수평 레이아웃 적용
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'horizontal');

    // 변경된 노드와 엣지 적용
    reactFlowInstance.setNodes(layoutedNodes);
    reactFlowInstance.setEdges(layoutedEdges);

    toast.success('수평 레이아웃이 적용되었습니다');
  }, [reactFlowInstance]);

  // 수직 레이아웃 적용 핸들러
  const applyVerticalLayout = useCallback(() => {
    if (!reactFlowInstance) {
      toast.error('React Flow 인스턴스를 찾을 수 없습니다');
      return;
    }

    // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    if (!nodes.length) {
      toast.error('적용할 노드가 없습니다');
      return;
    }

    // 수직 레이아웃 적용
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'vertical');

    // 변경된 노드와 엣지 적용
    reactFlowInstance.setNodes(layoutedNodes);
    reactFlowInstance.setEdges(layoutedEdges);

    toast.success('수직 레이아웃이 적용되었습니다');
  }, [reactFlowInstance]);

  // 자동 배치 레이아웃 적용 핸들러
  const applyAutoLayout = useCallback(() => {
    if (!reactFlowInstance) {
      toast.error('React Flow 인스턴스를 찾을 수 없습니다');
      return;
    }

    // React Flow 인스턴스에서 현재 노드와 엣지 가져오기
    const nodes = reactFlowInstance.getNodes();

    if (!nodes.length) {
      toast.error('적용할 노드가 없습니다');
      return;
    }

    // 자동 배치 레이아웃 적용
    const layoutedNodes = getGridLayout(nodes);

    // 변경된 노드 적용
    reactFlowInstance.setNodes(layoutedNodes);

    toast.success('자동 배치 레이아웃이 적용되었습니다');
  }, [reactFlowInstance]);

  // 레이아웃 저장 핸들러
  const handleSaveLayout = useCallback(() => {
    try {
      if (!reactFlowInstance) {
        toast.error('React Flow 인스턴스를 찾을 수 없습니다');
        return;
      }

      // React Flow 인스턴스에서 직접 노드와 엣지 데이터 가져오기
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();

      if (!nodes.length) {
        toast.error('저장할 노드가 없습니다');
        return;
      }

      // 노드와 엣지 데이터를 로컬 스토리지에 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));

      toast.success('레이아웃이 저장되었습니다');
      console.log('레이아웃 저장 완료:', { nodes: nodes.length, edges: edges.length });
    } catch (error) {
      console.error('레이아웃 저장 실패:', error);
      toast.error('레이아웃 저장에 실패했습니다');
    }
  }, [reactFlowInstance]);

  return (
    <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-2 z-10">
      {/* 새 카드 추가 */}
      <Button
        variant="ghost"
        size="icon"
        title="새 카드 추가"
        className="rounded-full h-[60px] w-[60px]"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <PlusCircle className="h-8 w-8" />
        <span className="sr-only">새 카드 추가</span>
      </Button>

      {/* 수평 정렬 */}
      <Button
        variant="ghost"
        size="icon"
        title="수평 정렬"
        className="rounded-full h-[60px] w-[60px]"
        onClick={applyHorizontalLayout}
      >
        <AlignHorizontalJustifyCenter className="h-8 w-8" />
        <span className="sr-only">수평 정렬</span>
      </Button>

      {/* 수직 정렬 */}
      <Button
        variant="ghost"
        size="icon"
        title="수직 정렬"
        className="rounded-full h-[60px] w-[60px]"
        onClick={applyVerticalLayout}
      >
        <AlignVerticalJustifyCenter className="h-8 w-8" />
        <span className="sr-only">수직 정렬</span>
      </Button>

      {/* 자동 배치 */}
      <Button
        variant="ghost"
        size="icon"
        title="자동 배치"
        className="rounded-full h-[60px] w-[60px]"
        onClick={applyAutoLayout}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 9L17 9M21 15H11M7 15H3M3 9L13 9M17 15L21 15M7 9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 21V17M17 7V3M7 3V7M7 21V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="15" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">자동 배치</span>
      </Button>

      {/* 레이아웃 저장 */}
      <Button
        variant="ghost"
        size="icon"
        title="레이아웃 저장"
        className="rounded-full h-[60px] w-[60px]"
        onClick={handleSaveLayout}
      >
        <Save className="h-8 w-8" />
        <span className="sr-only">레이아웃 저장</span>
      </Button>

      {/* 일반 카드 생성 모달 */}
      <SimpleCreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCardCreated={handleCardCreated}
      />
    </div>
  );
} 