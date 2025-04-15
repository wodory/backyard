import { useState } from 'react';

import { Panel } from '@xyflow/react';

import { ChangeLogger, useChangeLogger, type ChangeLoggerHandlers } from './ChangeLogger';
import { NodeInspector } from './NodeInspector';
import { ViewportLogger } from './ViewportLogger';

/**
 * React Flow 디버깅을 위한 DevTools 컴포넌트
 * 뷰포트 로거, 노드 인스펙터, 변경 로거를 포함합니다.
 */
export default function DevTools() {
  const [showViewport, setShowViewport] = useState(false);
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [showChangeLogger, setShowChangeLogger] = useState(false);

  return (
    <Panel 
      position="top-left" 
      className="bg-card shadow p-3 rounded-md z-50"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => setShowViewport(!showViewport)}
            className={`px-2 py-1 text-xs rounded ${
              showViewport ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            뷰포트 로거 {showViewport ? '숨기기' : '보기'}
          </button>
          <button
            onClick={() => setShowNodeInspector(!showNodeInspector)}
            className={`px-2 py-1 text-xs rounded ${
              showNodeInspector ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            노드 인스펙터 {showNodeInspector ? '숨기기' : '보기'}
          </button>
          <button
            onClick={() => setShowChangeLogger(!showChangeLogger)}
            className={`px-2 py-1 text-xs rounded ${
              showChangeLogger ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            변경 로거 {showChangeLogger ? '숨기기' : '보기'}
          </button>
        </div>
        
        {showViewport && <ViewportLogger />}
        {showNodeInspector && <NodeInspector />}
        {showChangeLogger && <ChangeLogger />}
      </div>
    </Panel>
  );
}

// 노드와 엣지 변경 감지를 위한 훅 익스포트
export const useChangeLoggerHooks = (): ChangeLoggerHandlers => {
  const [, , handlers] = useChangeLogger();
  return handlers;
} 