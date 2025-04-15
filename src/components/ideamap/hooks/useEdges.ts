/**
 * 파일명: useEdges.ts
 * 목적: 엣지 관련 상태 및 로직 관리
 * 역할: useIdeaMapStore의 엣지 관련 액션들을 사용하는 래퍼 훅
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 */

import { useCallback } from 'react';

import { Edge, Connection, Node, EdgeChange } from '@xyflow/react';

import { IdeaMapSettings } from '@/lib/ideamap-utils';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

/**
 * useEdges: useIdeaMapStore의 엣지 관련 액션들을 사용하는 래퍼 훅
 * @param ideaMapSettings 아이디어맵 설정 객체
 * @param nodes 노드 배열
 * @param initialEdges 초기 엣지 데이터 (옵션)
 * @returns 엣지 관련 상태 및 함수들
 */
export function useEdges({
  ideaMapSettings,
  nodes,
  initialEdges = []
}: {
  ideaMapSettings: IdeaMapSettings;
  nodes: Node[];
  initialEdges?: Edge[];
}) {
  // useIdeaMapStore에서 엣지 관련 상태 및 액션 가져오기
  const edges = useIdeaMapStore(state => state.edges);
  const setEdges = useIdeaMapStore(state => state.setEdges);
  const applyEdgeChangesAction = useIdeaMapStore(state => state.applyEdgeChangesAction);
  const connectNodesAction = useIdeaMapStore(state => state.connectNodesAction);
  const saveEdgesAction = useIdeaMapStore(state => state.saveEdgesAction);
  const updateAllEdgeStylesAction = useIdeaMapStore(state => state.updateAllEdgeStylesAction);
  const createEdgeOnDropAction = useIdeaMapStore(state => state.createEdgeOnDropAction);
  const hasUnsavedChanges = useIdeaMapStore(state => state.hasUnsavedChanges);

  // 엣지 변경 핸들러 (단순히 useIdeaMapStore 액션 호출)
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    applyEdgeChangesAction(changes);
  }, [applyEdgeChangesAction]);

  // 노드 연결 핸들러 (단순히 useIdeaMapStore 액션 호출)
  const onConnect = useCallback((params: Connection) => {
    connectNodesAction(params);
  }, [connectNodesAction]);

  // 엣지 저장 함수 (단순히 useIdeaMapStore 액션 호출)
  const saveEdges = useCallback((edgesToSave?: Edge[]) => {
    // 특정 엣지 목록이 제공되면 먼저 상태 업데이트
    if (edgesToSave) {
      setEdges(edgesToSave);
    }
    return saveEdgesAction();
  }, [setEdges, saveEdgesAction]);

  // 엣지 스타일 업데이트 함수 (단순히 useIdeaMapStore 액션 호출)
  const updateEdgeStyles = useCallback(() => {
    updateAllEdgeStylesAction();
  }, [updateAllEdgeStylesAction]);

  // 엣지 생성 함수 (단순히 useIdeaMapStore 액션 호출)
  const createEdgeOnDrop = useCallback((sourceId: string, targetId: string) => {
    return createEdgeOnDropAction(sourceId, targetId);
  }, [createEdgeOnDropAction]);

  // 기존 API와 호환성을 위해 동일한 인터페이스 유지
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