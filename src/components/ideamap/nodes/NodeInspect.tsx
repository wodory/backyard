/**
 * 파일명: NodeInspect.tsx
 * 목적: React Flow 노드 검사 컴포넌트
 * 역할: 노드 정보를 표시해주는 디버깅용 컴포넌트
 * 작성일: 2025-03-28
 */

import { useEffect, useState } from 'react';

import { useReactFlow, NodeProps, NodeToolbar, Position } from '@xyflow/react';

/**
 * NodeInspect 컴포넌트는 각 노드에 추가되어 노드의 데이터를 표시합니다.
 * 실시간으로 노드 상태를 반영합니다.
 */
export default function NodeInspect(props: NodeProps) {
  const { data, id, type } = props;
  const { getNode } = useReactFlow();
  // 실시간 상태 업데이트를 위한 상태
  const [nodeState, setNodeState] = useState({ selected: false });
  const [isVisible, setIsVisible] = useState(false);
  
  // 렌더링 전에 isVisible 상태를 설정
  useEffect(() => {
    setIsVisible(!!data?.isInspected);
  }, [data?.isInspected]);

  // 실시간 노드 상태 업데이트
  useEffect(() => {
    // 노드 상태 업데이트 함수
    const updateNodeState = () => {
      const currentNode = getNode(id);
      if (currentNode) {
        setNodeState({
          selected: !!currentNode.selected,
        });
      }
    };

    // 초기 상태 설정
    updateNodeState();

    // 주기적으로 노드 상태 업데이트 (실시간성 보장)
    const intervalId = setInterval(updateNodeState, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [id, getNode]);

  // 핸들 위치 정보
  const handleInfo = {
    leftTop: { position: Position.Left, top: '0%' },
    leftBottom: { position: Position.Left, top: '100%' },
    rightTop: { position: Position.Right, top: '0%' },
    rightBottom: { position: Position.Right, top: '100%' },
  };

  if (!isVisible) return null;

  return (
    <NodeToolbar 
      position={Position.Bottom}
      className="nodrag bg-card shadow-md rounded p-2 text-xs max-w-xs" 
      isVisible={true}
    >
      <div className="space-y-1">
        <div><span className="font-medium">제목:</span> {data?.title || data?.label || '제목 없음'}</div>
        <div><span className="font-medium">ID:</span> {id}</div>
        <div><span className="font-medium">타입:</span> {type || '기본'}</div>
        <div><span className="font-medium">선택됨:</span> {nodeState.selected ? '예' : '아니오'}</div>
      </div>
    </NodeToolbar>
  );
} 