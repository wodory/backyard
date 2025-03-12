import { useEffect, useState, useCallback } from 'react';
import { useReactFlow, Node, NodeProps, NodeToolbar, Position, useOnSelectionChange } from '@xyflow/react';

// 노드 데이터 타입 정의
interface NodeData {
  [key: string]: any;
  isInspected?: boolean;
}

/**
 * NodeInspector 컴포넌트는 React Flow의 노드를 검사할 수 있는 기능을 제공합니다.
 * 컴포넌트가 마운트되면 모든 노드의 정보가 노드 아래에 표시됩니다.
 */
export function NodeInspector() {
  const { getNodes, setNodes } = useReactFlow();
  // 노드 상태가 변경될 때마다 업데이트하기 위한 상태
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 노드 선택 변경을 감지하는 리스너 추가
  useOnSelectionChange({
    onChange: () => {
      // 선택 상태가 변경될 때마다 업데이트 트리거
      setUpdateTrigger(prev => prev + 1);
    },
  });

  // 마운트될 때와 노드 선택 상태가 변경될 때마다 모든 노드의 isInspected를 true로 설정
  useEffect(() => {
    // 모든 노드의 isInspected 속성 업데이트
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isInspected: true
        }
      }))
    );

    // 언마운트될 때 모든 노드의 isInspected를 false로 설정
    return () => {
      setNodes(nodes => 
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isInspected: false
          }
        }))
      );
    };
  }, [setNodes, updateTrigger]);

  // 노드 인스펙터 컴포넌트 주석 처리
  // return (
  //   <div className="bg-muted p-2 rounded border text-xs mt-2">
  //     <h3 className="font-bold mb-1 border-b pb-1">노드 인스펙터</h3>
  //     <div className="text-muted-foreground">
  //       각 노드 아래에 노드 정보가 실시간으로 표시됩니다.
  //     </div>
  //   </div>
  // );
}

/**
 * NodeInspect 컴포넌트는 각 노드에 추가되어 노드의 데이터를 표시합니다.
 * 실시간으로 노드 상태를 반영합니다.
 */
export function NodeInspect(props: NodeProps) {
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
      {/* <div className="font-bold mb-1 border-b pb-1">노드 정보</div> */}
      <div className="space-y-1">
        <div><span className="font-medium">제목:</span> {data?.title || data?.label || '제목 없음'}</div>
        <div><span className="font-medium">ID:</span> {id}</div>
        <div><span className="font-medium">타입:</span> {type || '기본'}</div>
        <div><span className="font-medium">선택됨:</span> {nodeState.selected ? '예' : '아니오'}</div>
        {/* <div className="mt-1">
          <div className="font-medium">핸들 정보:</div>
          <ul className="ml-2">
            <li>좌측 상단: {handleInfo.leftTop.position} + Top</li>
            <li>좌측 하단: {handleInfo.leftBottom.position} + Bottom</li>
            <li>우측 상단: {handleInfo.rightTop.position} + Top</li>
            <li>우측 하단: {handleInfo.rightBottom.position} + Bottom</li>
          </ul>
        </div> */}
      </div>
    </NodeToolbar>
  );
} 