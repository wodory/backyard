/**
 * 파일명: useIdeaMapUtils.ts
 * 목적: 아이디어맵 유틸리티 함수 관련 로직 분리
 * 역할: 아이디어맵 레이아웃, 저장, 초기화 등 유틸리티 함수를 관리
 * 작성일: 2025-03-28
 * 수정일: 2023-10-27 : 미사용 import 및 변수 제거, useCallback 의존성 배열 수정
 */

import { useCallback, useRef } from 'react';

import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';

import { IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';
import {
  IdeaMapSettings,
  loadIdeaMapSettingsFromServer,
  saveIdeaMapSettingsToServer
} from '@/lib/ideamap-utils';
import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
import { useAppStore } from '@/store/useAppStore';

import { CardData } from '../types/ideamap-types';

/**
 * useIdeaMapUtils: 아이디어맵 유틸리티 함수 관련 로직을 관리하는 훅
 * @param reactFlowWrapper ReactFlow 래퍼 참조
 * @param saveLayout 레이아웃 저장 함수
 * @param saveEdges 엣지 저장 함수
 * @param nodes 현재 노드 배열
 * @param edges 현재 엣지 배열
 * @param setNodes 노드 상태 설정 함수
 * @param setEdges 엣지 상태 설정 함수
 * @returns 아이디어맵 유틸리티 함수들
 */
export function useIdeaMapUtils({
  reactFlowWrapper,
  saveLayout,
  saveEdges,
  nodes,
  edges,
  setNodes,
  setEdges
}: {
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
  updateNodeInternals?: (nodeId: string) => void;
  saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
  saveEdges: (edgesToSave?: Edge[]) => boolean;
  nodes: Node<CardData>[];
  edges: Edge[];
  setNodes: (updater: ((nodes: Node<CardData>[]) => Node<CardData>[]) | Node<CardData>[]) => void;
  setEdges: (updater: ((edges: Edge[]) => Edge[]) | Edge[]) => void;
}) {
  // 전역 상태에서 아이디어맵 설정 가져오기
  const { setIdeaMapSettings } = useAppStore();
  
  // 저장되지 않은 변경사항 플래그
  const hasUnsavedChanges = useRef(false);
  
  // ReactFlow 인스턴스
  const reactFlowInstance = useReactFlow();

  /**
   * 엣지 설정 적용 헬퍼 함수
   * @param currentEdges 현재 엣지 배열
   * @param settings 적용할 설정
   * @returns 설정이 적용된 엣지 배열
   */
  const applyIdeaMapEdgeSettings = useCallback((currentEdges: Edge[], settings: IdeaMapSettings) => {
    return currentEdges.map(edge => ({
      ...edge,
      animated: settings.animated,
      style: {
        ...edge.style,
        strokeWidth: settings.strokeWidth,
        stroke: edge.selected ? settings.selectedEdgeColor : settings.edgeColor
      },
      markerEnd: settings.markerEnd ? {
        type: settings.markerEnd,
        width: settings.markerSize,
        height: settings.markerSize,
      } : undefined
    }));
  }, []);

  /**
   * 인증 상태에 따라 서버에서 설정 불러오기
   * @param isAuthenticated 인증 여부
   * @param userId 사용자 ID
   */
  const loadIdeaMapSettingsFromServerIfAuthenticated = useCallback(async (
    isAuthenticated: boolean, 
    userId?: string
  ) => {
    if (isAuthenticated && userId) {
      try {
        const settings = await loadIdeaMapSettingsFromServer(userId);
        if (settings) {
          // 전역 상태 업데이트 (이것이 localStorage에도 저장됨)
          setIdeaMapSettings(settings);
          
          // 새 설정을 엣지에 적용
          const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
          setEdges(updatedEdges);
        }
      } catch (err) {
        console.error('서버에서 아이디어맵 설정 불러오기 실패:', err);
      }
    }
  }, [edges, setEdges, setIdeaMapSettings, applyIdeaMapEdgeSettings]);

  /**
   * 뷰포트(transform) 저장
   * @returns 저장 성공 여부
   */
  const saveTransform = useCallback(() => {
    try {
      if (!reactFlowInstance) {
        console.error('React Flow 인스턴스를 찾을 수 없습니다');
        return false;
      }
      
      // 현재 뷰포트 가져오기
      const viewport = reactFlowInstance.getViewport();
      
      // 뷰포트 저장
      localStorage.setItem(IDEAMAP_TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
      // console.log('[useIdeaMapUtils] 뷰포트 저장 완료:', viewport);
      
      return true;
    } catch (err) {
      console.error('뷰포트 저장 실패:', err);
      return false;
    }
  }, [reactFlowInstance]);

  /**
   * 모든 레이아웃 데이터 저장
   * @returns 저장 성공 여부
   */
  const saveAllLayoutData = useCallback(() => {
    const layoutSaved = saveLayout();
    const edgesSaved = saveEdges();
    const transformSaved = saveTransform();
    
    if (layoutSaved && edgesSaved && transformSaved) {
      hasUnsavedChanges.current = false;
      console.log('[useIdeaMapUtils] 모든 레이아웃 데이터 저장 완료');
      return true;
    }
    
    if (!layoutSaved) console.error('노드 위치 저장 실패');
    if (!edgesSaved) console.error('엣지 저장 실패');
    if (!transformSaved) console.error('뷰포트 저장 실패');
    
    return false;
  }, [saveLayout, saveEdges, saveTransform]);

  /**
   * 수동 저장
   */
  const handleSaveLayout = useCallback(() => {
    if (saveAllLayoutData()) {
      // toast.success('레이아웃이 저장되었습니다');
      console.log('[useIdeaMapUtils] 레이아웃이 저장되었습니다');
    } else {
      // toast.error('레이아웃 저장에 실패했습니다');
      console.error('[useIdeaMapUtils] 레이아웃 저장에 실패했습니다');
    }
  }, [saveAllLayoutData]);

  /**
   * 아이디어맵 설정 변경 핸들러
   * @param newSettings 새 아이디어맵 설정
   * @param isAuthenticated 인증 여부
   * @param userId 사용자 ID
   */
  const handleIdeaMapSettingsChange = useCallback((
    newSettings: IdeaMapSettings,
    isAuthenticated: boolean,
    userId?: string
  ) => {
    console.log('[useIdeaMapUtils] 아이디어맵 설정 변경 핸들러 호출됨:', newSettings);
    
    // 1. 전역 상태 업데이트
    setIdeaMapSettings(newSettings);
    // console.log('[useIdeaMapUtils] 전역 상태 업데이트 완료');
    
    // 2. 새 설정을 엣지에 적용
    const updatedEdges = applyIdeaMapEdgeSettings(edges, newSettings);
    console.log('[useIdeaMapUtils] 엣지 설정 적용 완료, 엣지 수:', updatedEdges.length);
    setEdges(updatedEdges);
    
    // 3. 인증된 사용자인 경우 서버에도 저장
    if (isAuthenticated && userId) {
      // console.log('[useIdeaMapUtils] 서버에 아이디어맵 설정 저장 시도');
      saveIdeaMapSettingsToServer(newSettings, userId)
        .then(() => {
          console.log('[useIdeaMapUtils] 설정 저장 성공');
          // toast.success('아이디어맵 설정이 저장되었습니다');
        })
        .catch(err => {
          console.error('[useIdeaMapUtils] 설정 저장 실패:', err);
          // toast.error('서버에 설정 저장 실패');
        });
    } else {
      console.error('[useIdeaMapUtils] 비인증 사용자, 서버 저장 생략');
    }
  }, [edges, setEdges, setIdeaMapSettings, applyIdeaMapEdgeSettings]);

  /**
   * 뷰포트 중앙 업데이트
   * @param instance ReactFlow 인스턴스
   */
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
  }, [reactFlowInstance, reactFlowWrapper]);

  /**
   * 그리드 레이아웃 자동 배치
   */
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getGridLayout(nodes) as unknown as Node<CardData>[];
    setNodes(layoutedNodes);
    saveLayout(layoutedNodes);
    toast.success("카드가 격자 형태로 배치되었습니다.");
  }, [nodes, setNodes, saveLayout]);

  /**
   * 레이아웃 변경 핸들러
   * @param direction 레이아웃 방향
   */
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    // 타입 캐스팅
    setNodes(layoutedNodes as unknown as Node<CardData>[]);
    setEdges(layoutedEdges);
    
    // 변경 사항 저장
    setTimeout(() => {
      saveLayout(layoutedNodes as unknown as Node<CardData>[]);
      saveEdges(layoutedEdges);
    }, 10);
    
    toast.success(`${direction === 'horizontal' ? '수평' : '수직'} 레이아웃이 적용되었습니다.`);
  }, [nodes, edges, setNodes, setEdges, saveLayout, saveEdges]);

  return {
    loadIdeaMapSettingsFromServerIfAuthenticated,
    saveTransform,
    saveAllLayoutData,
    handleSaveLayout,
    handleIdeaMapSettingsChange,
    updateViewportCenter,
    handleAutoLayout,
    handleLayoutChange,
    applyIdeaMapEdgeSettings,
    hasUnsavedChanges: hasUnsavedChanges.current
  };
} 