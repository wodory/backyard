import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { CardNode } from './CardNode';

// react-flow의 Handle 컴포넌트 모킹
vi.mock('reactflow', () => ({
  Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('CardNode', () => {
  const mockData = {
    id: '1',
    title: '테스트 카드',
    content: '테스트 내용입니다.',
    tags: ['태그1', '태그2'],
  };

  test('카드 노드가 올바르게 렌더링되어야 함', () => {
    render(<CardNode data={mockData} />);
    
    // 제목과 내용이 정확히 렌더링되는지 확인
    expect(screen.getByText('테스트 카드')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
    
    // 태그가 모두 렌더링되는지 확인
    expect(screen.getByText('#태그1')).toBeInTheDocument();
    expect(screen.getByText('#태그2')).toBeInTheDocument();
    
    // 핸들(source, target)이 모두 렌더링되는지 확인
    expect(screen.getByTestId('handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source')).toBeInTheDocument();
  });

  test('태그가 없는 경우에도 정상적으로 렌더링되어야 함', () => {
    const dataWithoutTags = {
      id: '1',
      title: '태그 없는 카드',
      content: '내용만 있는 카드',
    };

    render(<CardNode data={dataWithoutTags} />);
    
    expect(screen.getByText('태그 없는 카드')).toBeInTheDocument();
    expect(screen.getByText('내용만 있는 카드')).toBeInTheDocument();
    
    // 태그가 렌더링되지 않아야 함
    expect(screen.queryByText(/#\w+/)).not.toBeInTheDocument();
  });
}); 