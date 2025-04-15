import { useCallback, useState } from 'react';

import { type NodeChange, type EdgeChange } from '@xyflow/react';

// 변경 이벤트 핸들러를 위한 타입 정의
export type ChangeLoggerHandlers = {
  onNodesChangeLogger: (changes: NodeChange[]) => void;
  onEdgesChangeLogger: (changes: EdgeChange[]) => void;
};

// 렌더링 컴포넌트와 훅을 분리
export function useChangeLogger(): [NodeChange[], EdgeChange[], ChangeLoggerHandlers] {
  const [nodeChanges, setNodeChanges] = useState<NodeChange[]>([]);
  const [edgeChanges, setEdgeChanges] = useState<EdgeChange[]>([]);

  // 노드 변경 감지 핸들러
  const onNodesChangeLogger = useCallback((changes: NodeChange[]) => {
    console.log('노드 변경 감지:', changes);
    setNodeChanges(changes);
  }, []);

  // 엣지 변경 감지 핸들러
  const onEdgesChangeLogger = useCallback((changes: EdgeChange[]) => {
    console.log('엣지 변경 감지:', changes);
    setEdgeChanges(changes);
  }, []);

  return [
    nodeChanges, 
    edgeChanges, 
    { onNodesChangeLogger, onEdgesChangeLogger }
  ];
}

/**
 * ChangeLogger 컴포넌트는 React Flow의 노드와 엣지 변경사항을 로깅합니다.
 * ReactFlow 컴포넌트의 onNodesChange와 onEdgesChange에 연결하여 사용합니다.
 */
export function ChangeLogger() {
  const [nodeChanges, edgeChanges] = useChangeLogger();

  return (
    <div className="bg-muted p-2 rounded border text-xs mt-2">
      <h3 className="font-bold mb-1 border-b pb-1">변경 로거</h3>
      
      {nodeChanges.length === 0 && edgeChanges.length === 0 ? (
        <div className="text-muted-foreground">아직 변경사항이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {nodeChanges.length > 0 && (
            <div>
              <div className="font-semibold">노드 변경:</div>
              <div className="bg-card p-2 rounded max-h-24 overflow-y-auto text-xs">
                {nodeChanges.map((change, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-medium">{change.type}</span>
                    {change.type === 'remove' && (
                      <span className="ml-1">
                        ID: <span className="text-blue-500">{change.id}</span>
                      </span>
                    )}
                    {change.type === 'select' && (
                      <span className="ml-1">
                        ID: <span className="text-blue-500">{change.id}</span>
                        {' '}{change.selected ? '선택됨' : '선택 해제됨'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {edgeChanges.length > 0 && (
            <div>
              <div className="font-semibold">엣지 변경:</div>
              <div className="bg-card p-2 rounded max-h-24 overflow-y-auto text-xs">
                {edgeChanges.map((change, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-medium">{change.type}</span>
                    {change.type === 'remove' && (
                      <span className="ml-1">
                        ID: <span className="text-blue-500">{change.id}</span>
                      </span>
                    )}
                    {change.type === 'select' && (
                      <span className="ml-1">
                        ID: <span className="text-blue-500">{change.id}</span>
                        {' '}{change.selected ? '선택됨' : '선택 해제됨'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 