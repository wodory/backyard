import React from 'react';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import DagreNodePositioning from './DagreNodePositioning';

// 단순 렌더링 테스트
describe('DagreNodePositioning', () => {
  it('컴포넌트가 오류 없이 렌더링되어야 합니다', () => {
    const dummyOptions = { rankdir: 'TB' };
    const dummySetNodes = jest.fn();
    const dummySetEdges = jest.fn();
    const dummySetViewIsFit = jest.fn();
    const dummyEdges = [];
    
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