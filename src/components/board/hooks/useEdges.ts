/**
 * 파일명: useEdges.ts
 * 목적: 엣지 관련 상태 및 로직 관리
 * 역할: 엣지 생성, 업데이트, 삭제 및 이벤트 핸들링 로직 캡슐화
 * 작성일: 2025-03-28
 */

import { useCallback, useRef, useEffect } from 'react';
import { 
  useEdgesState, 
  applyEdgeChanges, 
  Position, 
  MarkerType, 
  addEdge 
} from '@xyflow/react';
import { toast } from 'sonner';
import { 
  BoardSettings,
  applyEdgeSettings
} from '@/lib/board-utils';
import { EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { 
  BoardEdge, 
  EdgeChange, 
  Connection, 
  Node, 
  Edge 
} from '../types/board-types';

/**
 * useEdges: 엣지 관련 상태 및 로직을 관리하는 훅
 * @param boardSettings 보드 설정 객체
 * @param nodes 노드 배열
 * @param initialEdges 초기 엣지 데이터 (옵션)
 * @returns 엣지 관련 상태 및 함수들
 */
export function useEdges({
  boardSettings,
  nodes,
  initialEdges = []
}: {
  boardSettings: BoardSettings;
  nodes: Node[];
  initialEdges?: Edge[];
}) {
  // 엣지 상태 관리
  const [edges, setEdges] = useEdgesState<Edge>(initialEdges);
  
  // 저장되지 않은 변경사항 플래그
  const hasUnsavedChanges = useRef(false);
  
  // 초기 엣지 데이터가 변경되면 엣지 상태 업데이트
  useEffect(() => {
    if (initialEdges && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);
  
  /**
   * 엣지 변경 핸들러: 엣지 변경 사항 적용 및 관리
   * @param changes 엣지 변경 사항 배열
   */
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // applyEdgeChanges 함수를 사용하여 적절하게 엣지 변경사항 적용
    setEdges((eds) => applyEdgeChanges(changes, eds));
    
    // 변경이 있을 때마다 저장 대기 상태로 설정
    hasUnsavedChanges.current = true;
  }, [setEdges]);
  
  /**
   * 엣지 저장: 현재 엣지 상태를 로컬 스토리지에 저장
   * @param edgesToSave 저장할 엣지 배열 (기본값은 현재 엣지)
   * @returns 저장 성공 여부
   */
  const saveEdges = useCallback((edgesToSave: Edge[] = edges) => {
    try {
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edgesToSave));
      return true;
    } catch (err) {
      console.error('엣지 저장 실패:', err);
      return false;
    }
  }, [edges]);
  
  /**
   * 노드 연결 핸들러: 노드 간 연결 생성 처리
   * @param {object} params 연결 파라미터
   */
  const onConnect = useCallback((params: Connection) => {
    // 연결 정보 로깅 (디버깅용)
    console.log('[useEdges] onConnect - 연결 파라미터:', { 
      ...params,
      rawSourceHandle: params.sourceHandle, 
      rawTargetHandle: params.targetHandle 
    });
    
    // 소스 노드와 타겟 노드가 같은 경우 연결 방지
    if (params.source === params.target) {
      toast.error('같은 카드에 연결할 수 없습니다.');
      return;
    }
    
    // 기존 노드 정보
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    // 노드 정보 로깅
    console.log('[useEdges] onConnect - 노드 정보:', { 
      sourceNode: sourceNode ? sourceNode.id : 'not found', 
      targetNode: targetNode ? targetNode.id : 'not found'
    });
    
    if (sourceNode && targetNode) {
      // 현재 레이아웃 방향 판단 (노드의 targetPosition으로 확인)
      const firstNode = nodes[0];
      const isHorizontal = firstNode?.targetPosition === Position.Left;
      
      console.log('[useEdges] onConnect - 레이아웃 방향:', { 
        isHorizontal, 
        firstNodeTargetPosition: firstNode?.targetPosition
      });
      
      // 핸들 ID 설정 - 이미 suffix를 포함하는 경우는 그대로 사용
      let sourceHandle = params.sourceHandle;
      let targetHandle = params.targetHandle;
      
      // 들어온 핸들 ID 로깅
      console.log('[useEdges] onConnect - 원본 핸들 ID:', { sourceHandle, targetHandle });
      
      // 핸들 ID가 없는 경우 기본값 설정
      if (!sourceHandle) {
        sourceHandle = isHorizontal ? 'right-source' : 'bottom-source';
      } else if (!sourceHandle.endsWith('-source')) {
        // 접미사가 없는 경우 추가
        sourceHandle = `${sourceHandle}-source`;
      }
      
      if (!targetHandle) {
        targetHandle = isHorizontal ? 'left-target' : 'top-target';
      } else if (!targetHandle.endsWith('-target')) {
        // 접미사가 없는 경우 추가
        targetHandle = `${targetHandle}-target`;
      }
      
      // 추가 디버깅 로그
      console.log('[useEdges] onConnect - 핸들 ID 처리 후:', { 
        sourceHandle, 
        targetHandle,
        sourceNode: sourceNode.id,
        targetNode: targetNode.id
      });
      
      // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
      const edgeId = `${params.source}-${params.target}-${Date.now()}`;
      
      // 엣지 타입이 명시적으로 제공되었는지 확인
      const edgeType = 'custom'; // 항상 'custom' 타입 사용 (EdgeTypes에 등록된 타입)
      
      console.log(`[useEdges] 새 엣지 생성 - ID: ${edgeId}, 타입: ${edgeType}, 소스 핸들: ${sourceHandle}, 타겟 핸들: ${targetHandle}`);
      
      // 기본 에지 스타일과 데이터 설정
      const newEdge: Edge = {
        ...params,
        id: edgeId,
        sourceHandle,
        targetHandle,
        type: edgeType, // 명시적으로 타입 설정
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
          settings: { ...boardSettings },
          // 추가 디버깅 정보 포함
          debug: {
            createdAt: new Date().toISOString(),
            sourceNodePosition: sourceNode.position,
            targetNodePosition: targetNode.position,
            sourceHandleOriginal: params.sourceHandle,
            targetHandleOriginal: params.targetHandle,
            originalParams: { ...params }
          }
        },
      };
      
      // 새 Edge 추가 및 로컬 스토리지에 저장
      setEdges((eds) => {
        // React Flow의 addEdge 함수를 사용하여 엣지 생성
        const newEdges = addEdge(newEdge, eds);
        
        // 엣지가 성공적으로 추가되었는지 확인
        const edgeAdded = newEdges.some(e => e.id === edgeId);
        console.log(`[useEdges] 엣지 추가 결과:`, { 
          success: edgeAdded, 
          edgeCount: newEdges.length,
          previousEdgeCount: eds.length
        });
        
        if (edgeAdded) {
          // 엣지 저장
          saveEdges(newEdges);
          // 성공 메시지
          toast.success('카드가 연결되었습니다.');
        } else {
          // 실패 메시지
          toast.error('카드 연결에 실패했습니다. 다시 시도해주세요.');
          console.error('[useEdges] 엣지 추가 실패:', { newEdge, existingEdges: eds });
        }
        
        return newEdges;
      });
      
      // 저장 상태로 표시
      hasUnsavedChanges.current = true;
    }
  }, [nodes, boardSettings, saveEdges, setEdges]);

  /**
   * 보드 설정에 따라 엣지 스타일 업데이트
   * @param settings 적용할 보드 설정
   */
  const updateEdgeStyles = useCallback((settings: BoardSettings) => {
    if (edges.length === 0) return;

    try {
      // applyEdgeSettings 함수는 새 엣지 배열을 반환함
      const updatedEdges = applyEdgeSettings(edges, settings);
      
      // 엣지 배열 자체가 변경된 경우에만 setEdges 호출
      if (JSON.stringify(updatedEdges) !== JSON.stringify(edges)) {
        // 함수형 업데이트를 통해 상태 업데이트
        setEdges(updatedEdges);
        console.log('[useEdges] 엣지 스타일 업데이트 완료');
      }
    } catch (error) {
      console.error('[useEdges] 엣지 스타일 업데이트 중 오류:', error);
    }
  }, [edges, setEdges]);

  /**
   * 엣지 드롭 시 카드 생성 결과 처리 (새 카드 노드와 기존 노드 연결)
   * @param sourceId 소스 노드 ID 
   * @param targetId 타겟 노드 ID
   * @returns 생성된 엣지
   */
  const createEdgeOnDrop = useCallback((sourceId: string, targetId: string) => {
    console.log('[useEdges] createEdgeOnDrop - 시작:', { sourceId, targetId });
    
    // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
    const edgeId = `${sourceId}-${targetId}-${Date.now()}`;
    
    // 엣지 타입 명시적 설정
    const edgeType = 'custom'; // 항상 'custom' 타입 사용 (EDGE_TYPES에 등록된 타입)
    
    // 핸들 ID 명시적 설정 - 일관성을 위해 "-source", "-target" 접미사 사용
    const sourceHandle = 'right-source';
    const targetHandle = 'left-target';
    
    console.log(`[useEdges] createEdgeOnDrop - 새 엣지 생성: ID=${edgeId}, 타입=${edgeType}, 소스 핸들=${sourceHandle}, 타겟 핸들=${targetHandle}`);
    
    // 새 엣지 객체 생성 및 추가
    const newEdge: Edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
      type: edgeType, // 명시적으로 타입 설정
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
    saveEdges([...edges, newEdge] as Edge[]);
    
    return newEdge;
  }, [boardSettings, edges, saveEdges, setEdges]);

  return {
    edges,
    setEdges,
    handleEdgesChange,
    onConnect,
    saveEdges,
    updateEdgeStyles,
    createEdgeOnDrop,
    hasUnsavedChanges
  };
} 