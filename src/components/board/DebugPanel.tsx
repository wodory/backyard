import React, { useState, useEffect } from 'react';
import { useReactFlow, NodeChange, EdgeChange } from '@xyflow/react';

interface DebugPanelProps {
  nodeChanges?: NodeChange[];
  edgeChanges?: EdgeChange[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ nodeChanges, edgeChanges }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getViewport, getNodes } = useReactFlow();
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; message: string }>>([]);

  // 뷰포트 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const currentViewport = getViewport();
      setViewport(currentViewport);
    }, 100);

    return () => clearInterval(interval);
  }, [getViewport]);

  // 로그 추가 함수
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { time, message }]);
  };

  // 노드 변경 시 로그 추가
  useEffect(() => {
    if (nodeChanges && nodeChanges.length > 0) {
      const message = `노드 변경: ${nodeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
      addLog(message);
    }
  }, [nodeChanges]);

  // 엣지 변경 시 로그 추가
  useEffect(() => {
    if (edgeChanges && edgeChanges.length > 0) {
      const message = `엣지 변경: ${edgeChanges.map(c => `${c.type} ${c.id}`).join(', ')}`;
      addLog(message);
    }
  }, [edgeChanges]);

  // 선택된 노드 정보
  const selectedNode = selectedNodeId 
    ? getNodes().find(node => node.id === selectedNodeId) 
    : null;

  return (
    <div className="fixed left-2 top-16 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {isOpen ? '디버그 패널 닫기' : '디버그 패널 열기'}
      </button>
      
      {isOpen && (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 w-64 max-h-[80vh] overflow-y-auto">
          <div className="mb-3">
            <h3 className="text-sm font-bold border-b pb-1 mb-2">뷰포트 정보</h3>
            <div className="text-xs">
              <div>X: {viewport.x.toFixed(2)}</div>
              <div>Y: {viewport.y.toFixed(2)}</div>
              <div>Zoom: {viewport.zoom.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-bold border-b pb-1 mb-2">노드 검사</h3>
            <select 
              className="w-full text-xs p-1 border rounded mb-2"
              value={selectedNodeId || ''}
              onChange={(e) => setSelectedNodeId(e.target.value || null)}
            >
              <option value="">노드 선택...</option>
              {getNodes().map(node => (
                <option key={node.id} value={node.id}>
                  {node.id} {node.data?.title ? `(${node.data.title})` : ''}
                </option>
              ))}
            </select>
            
            {selectedNode && (
              <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-bold border-b pb-1 mb-2">변경 로그</h3>
            <div className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">{log.time}:</span> {log.message}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">아직 로그가 없습니다</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 