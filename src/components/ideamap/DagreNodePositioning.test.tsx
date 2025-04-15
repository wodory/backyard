import React from 'react';

import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Edge } from '@xyflow/react';
import { vi } from 'vitest';

import DagreNodePositioning from './DagreNodePositioning';


// 단순 렌더링 테스트
describe('DagreNodePositioning', () => {
  it('컴포넌트가 오류 없이 렌더링되어야 합니다', () => {
    const dummyOptions = { rankdir: 'TB' as const };
    const dummySetNodes = vi.fn();
    const dummySetEdges = vi.fn();
    const dummySetViewIsFit = vi.fn();
    const dummyEdges: Edge[] = [];
    
    render(
      <ReactFlowProvider>
        <DagreNodePositioning
          Options={dummyOptions}
          Edges={dummyEdges}
          SetEdges={dummySetEdges}
          SetNodes={dummySetNodes}
          SetViewIsFit={dummySetViewIsFit}
        />
      </ReactFlowProvider>
    );
  });
}); 