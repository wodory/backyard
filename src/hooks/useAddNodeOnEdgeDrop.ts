import { useState, useCallback } from 'react';
import { OnConnectStart, OnConnectEnd, useReactFlow, Connection, XYPosition } from '@xyflow/react';

interface UseAddNodeOnEdgeDropProps {
  onCreateNode: (position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => void;
}

/**
 * 엣지를 드래그해서 특정 위치에 드롭했을 때 새 노드를 생성하는 기능을 제공하는 훅
 */
export function useAddNodeOnEdgeDrop({ onCreateNode }: UseAddNodeOnEdgeDropProps) {
  // 현재 연결 중인 노드 ID
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  // 현재 연결 중인 핸들 타입 (source 또는 target)
  const [connectingHandleType, setConnectingHandleType] = useState<'source' | 'target' | null>(null);
  
  // ReactFlow 인스턴스 가져오기
  const { screenToFlowPosition, getNodes } = useReactFlow();
  
  // 연결 시작 핸들러
  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleType }) => {
    setConnectingNodeId(nodeId);
    setConnectingHandleType(handleType as 'source' | 'target');
  }, []);
  
  // 연결 종료 핸들러
  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId || !connectingHandleType || !event) {
        return;
      }
      
      // 마우스 이벤트를 캐스팅
      const mouseEvent = event as MouseEvent;
      
      // 마우스 위치를 Flow 좌표로 변환
      const position = screenToFlowPosition({
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      });
      
      // 노드 목록 가져오기
      const nodes = getNodes();
      
      // 해당 위치에 이미 노드가 있는지 확인 (50px 허용 오차)
      const targetNodeAtPosition = nodes.find(
        node => 
          Math.abs(node.position.x - position.x) < 50 && 
          Math.abs(node.position.y - position.y) < 50
      );
      
      // 이미 노드가 있으면 자동 연결 처리는 하지 않고 기본 동작을 사용
      if (!targetNodeAtPosition) {
        // 노드가 없으면 새 노드 생성 함수 호출
        onCreateNode(position, connectingNodeId, connectingHandleType);
      }
      
      // 연결 상태 초기화
      setConnectingNodeId(null);
      setConnectingHandleType(null);
    },
    [connectingNodeId, connectingHandleType, getNodes, onCreateNode, screenToFlowPosition]
  );
  
  return {
    connectingNodeId,
    connectingHandleType,
    onConnectStart,
    onConnectEnd,
  };
} 