/**
 * 파일명: src/hooks/useIdeaMapLayout.ts
 * 목적: IdeaMap 레이아웃 관리 및 저장 기능 제공
 * 역할: 노드 배치, 레이아웃 변경, 로컬 저장소 관리 등 IdeaMap의 레이아웃 관련 기능 통합 관리
 * 작성일: 2025-04-21
 */

import { useCallback, useRef } from 'react';
import { 
  Node, 
  Edge, 
  useReactFlow,
  Viewport
} from '@xyflow/react';
import { toast } from 'sonner';

import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
import { IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';
import { CardData } from '@/components/ideamap/types/ideamap-types';

/**
 * useIdeaMapLayout: IdeaMap 레이아웃 관련 기능을 제공하는 훅
 * @param {React.RefObject<HTMLDivElement>} reactFlowWrapper - ReactFlow를 감싸는 div 요소의 ref
 * @returns 레이아웃 관련 함수들
 */
export function useIdeaMapLayout(reactFlowWrapper: React.RefObject<HTMLDivElement>) {
  // 변경 사항 추적을 위한 ref
  const hasUnsavedChanges = useRef(false);
  
  // ReactFlow 인스턴스
  const reactFlowInstance = useReactFlow();
  
  // IdeaMapStore에서 필요한 상태와 함수 가져오기
  const nodes = useIdeaMapStore(state => state.nodes);
  const edges = useIdeaMapStore(state => state.edges);
  const setNodes = useIdeaMapStore(state => state.setNodes);
  const setEdges = useIdeaMapStore(state => state.setEdges);
  const saveLayout = useIdeaMapStore(state => state.saveLayout);
  const saveEdges = useIdeaMapStore(state => state.saveEdges);
  const setViewport = useIdeaMapStore(state => state.setViewport);
  const saveViewport = useIdeaMapStore(state => state.saveViewport);
  const restoreViewport = useIdeaMapStore(state => state.restoreViewport);

  /**
   * 뷰포트 저장 함수
   * @returns {boolean} 저장 성공 여부
   */
  const saveTransform = useCallback(() => {
    if (!reactFlowInstance) {
      console.error('[useIdeaMapLayout] 뷰포트 저장 실패: ReactFlow 인스턴스가 없음');
      return false;
    }
    
    try {
      // 현재 뷰포트 가져오기
      const viewport = reactFlowInstance.getViewport();
      
      // 로컬 스토리지에 저장
      localStorage.setItem(IDEAMAP_TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
      
      // 상태 업데이트
      setViewport(viewport);
      
      console.log('[useIdeaMapLayout] 뷰포트 저장 완료:', viewport);
      return true;
    } catch (error) {
      console.error('[useIdeaMapLayout] 뷰포트 저장 중 오류:', error);
      return false;
    }
  }, [reactFlowInstance, setViewport]);

  /**
   * 모든 레이아웃 데이터 저장 (노드, 엣지, 뷰포트)
   * @returns {boolean} 저장 성공 여부
   */
  const saveAllLayoutData = useCallback(() => {
    const layoutSaved = saveLayout();
    const edgesSaved = saveEdges();
    const transformSaved = saveTransform();
    
    const success = layoutSaved && edgesSaved && transformSaved;
    
    if (success) {
      hasUnsavedChanges.current = false;
      console.log('[useIdeaMapLayout] 모든 레이아웃 데이터 저장 완료');
    } else {
      console.error('[useIdeaMapLayout] 레이아웃 저장 일부 실패', {
        노드저장: layoutSaved,
        엣지저장: edgesSaved,
        뷰포트저장: transformSaved
      });
    }
    
    return success;
  }, [saveLayout, saveEdges, saveTransform]);

  /**
   * 수동 저장 핸들러
   * @returns {boolean} 저장 성공 여부
   */
  const handleSaveLayout = useCallback(() => {
    const success = saveAllLayoutData();
    
    if (success) {
      toast.success('레이아웃이 저장되었습니다');
    } else {
      toast.error('레이아웃 저장에 실패했습니다');
    }
    
    return success;
  }, [saveAllLayoutData]);

  /**
   * 노드 중앙 정렬
   * 모든 노드가 화면에 보이도록 조정
   */
  const fitView = useCallback(() => {
    if (!reactFlowInstance) return;
    
    try {
      reactFlowInstance.fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5,
        duration: 800
      });
      console.log('[useIdeaMapLayout] 노드 중앙 정렬 완료');
    } catch (error) {
      console.error('[useIdeaMapLayout] 노드 중앙 정렬 실패:', error);
    }
  }, [reactFlowInstance]);

  /**
   * 뷰포트 중앙 위치 계산
   * @returns {XYPosition | null} 중앙 위치 좌표 또는 실패 시 null
   */
  const getViewportCenter = useCallback(() => {
    if (!reactFlowWrapper.current || !reactFlowInstance) {
      return null;
    }
    
    try {
      // 래퍼 요소의 크기 가져오기
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      
      // 중앙 좌표 계산
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // 스크린 좌표를 Flow 좌표로 변환
      return reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY
      });
    } catch (error) {
      console.error('[useIdeaMapLayout] 뷰포트 중앙 계산 실패:', error);
      return null;
    }
  }, [reactFlowInstance, reactFlowWrapper]);

  /**
   * 그리드 레이아웃 적용 (자동 배치)
   * 카드를 격자 형태로 정렬
   */
  const applyGridLayout = useCallback(() => {
    // 노드가 없으면 아무 작업도 하지 않음
    if (nodes.length === 0) return;
    
    try {
      // 그리드 레이아웃 적용
      const layoutedNodes = getGridLayout(nodes) as Node<CardData>[];
      
      // 노드 위치 업데이트
      setNodes(layoutedNodes);
      
      // 변경 사항 저장
      setTimeout(() => {
        saveLayout(layoutedNodes);
        // 레이아웃 변경 후 화면 중앙 맞추기
        fitView();
      }, 100);
      
      toast.success('카드가 격자 형태로 배치되었습니다');
    } catch (error) {
      console.error('[useIdeaMapLayout] 그리드 레이아웃 적용 실패:', error);
      toast.error('레이아웃 적용에 실패했습니다');
    }
  }, [nodes, setNodes, saveLayout, fitView]);

  /**
   * 방향성 레이아웃 적용 (가로/세로)
   * @param {'horizontal' | 'vertical'} direction - 레이아웃 방향
   */
  const applyDirectionalLayout = useCallback((direction: 'horizontal' | 'vertical') => {
    // 노드가 없으면 아무 작업도 하지 않음
    if (nodes.length === 0) return;
    
    try {
      // dagre 레이아웃 적용
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
      
      // 노드 및 엣지 위치 업데이트
      setNodes(layoutedNodes as Node<CardData>[]);
      setEdges(layoutedEdges);
      
      // 변경 사항 저장
      setTimeout(() => {
        saveLayout(layoutedNodes as Node<CardData>[]);
        saveEdges(layoutedEdges);
        // 레이아웃 변경 후 화면 중앙 맞추기
        fitView();
      }, 100);
      
      toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃이 적용되었습니다`);
    } catch (error) {
      console.error(`[useIdeaMapLayout] ${direction} 레이아웃 적용 실패:`, error);
      toast.error('레이아웃 적용에 실패했습니다');
    }
  }, [nodes, edges, setNodes, setEdges, saveLayout, saveEdges, fitView]);

  /**
   * 뷰포트 변경 콜백
   * ReactFlow의 onViewportChange에 전달
   * @param {Viewport} viewport - 새 뷰포트
   */
  const onViewportChange = useCallback((viewport: Viewport) => {
    setViewport(viewport);
    hasUnsavedChanges.current = true;
  }, [setViewport]);

  /**
   * 모든 함수 반환
   */
  return {
    // 저장 관련
    saveTransform,
    saveAllLayoutData,
    handleSaveLayout,
    
    // 뷰포트 관련
    fitView,
    getViewportCenter,
    restoreViewport,
    onViewportChange,
    
    // 레이아웃 적용
    applyGridLayout,
    applyDirectionalLayout,
    
    // 상태
    hasUnsavedChanges: hasUnsavedChanges.current
  };
} 