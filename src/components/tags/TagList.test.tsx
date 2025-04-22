/**
 * 파일명: src/components/tags/TagList.test.tsx
 * 목적: TagList 컴포넌트 테스트
 * 역할: 태그 목록 컴포넌트의 동작 검증
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TagList from './TagList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTags } from '@/hooks/useTags';
import { useDeleteTag } from '@/hooks/useDeleteTag';
import { Tag } from '@/services/tagService';

// Mock 태그 목록
const mockTags: Tag[] = [
  { id: '1', name: '개발', count: 5, createdAt: '2025-04-01T00:00:00Z' },
  { id: '2', name: '아이디어', count: 0, createdAt: '2025-04-02T00:00:00Z' },
];

// React Query 훅 모킹
vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn(),
}));

vi.mock('@/hooks/useDeleteTag', () => ({
  useDeleteTag: vi.fn(),
}));

// 테스트 환경 설정
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('TagList 컴포넌트', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('로딩 중 상태를 표시한다', () => {
    (useTags as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
      error: null,
      data: undefined,
    });

    renderWithClient(<TagList />);

    expect(screen.getByText('태그 목록을 불러오는 중...')).toBeInTheDocument();
  });

  it('에러 상태를 표시한다', () => {
    const testError = new Error('테스트 에러');
    (useTags as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: testError,
      data: undefined,
    });

    renderWithClient(<TagList />);

    expect(screen.getByText('태그 목록을 불러오는 데 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('테스트 에러')).toBeInTheDocument();
  });

  it('태그가 없을 때 메시지를 표시한다', () => {
    (useTags as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: [],
    });

    renderWithClient(<TagList />);

    expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();
  });

  it('태그 목록을 표시한다', () => {
    // useTags 모킹
    (useTags as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockTags,
    });

    // useDeleteTag 모킹
    const mockDeleteTag = vi.fn();
    (useDeleteTag as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockDeleteTag,
      isPending: false,
    });

    renderWithClient(<TagList />);

    // 태그 이름이 표시되는지 확인
    expect(screen.getByText('개발')).toBeInTheDocument();
    expect(screen.getByText('아이디어')).toBeInTheDocument();

    // 카드 수가 표시되는지 확인
    expect(screen.getByText('5개 카드')).toBeInTheDocument();
    expect(screen.getByText('0개')).toBeInTheDocument();
  });

  it('태그 삭제 확인 다이얼로그를 표시하고 삭제를 실행한다', async () => {
    // useTags 모킹
    (useTags as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockTags,
    });

    // useDeleteTag 모킹
    const mockDeleteTag = vi.fn().mockImplementation((_, options) => {
      if (options?.onSuccess) options.onSuccess();
    });
    (useDeleteTag as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockDeleteTag,
      isPending: false,
    });

    renderWithClient(<TagList />);

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // 아이콘만 있는 버튼
    fireEvent.click(deleteButtons[0]); // 첫 번째 태그(개발)의 삭제 버튼 클릭

    // 확인 다이얼로그가 나타나는지 확인
    expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('태그 "개발"을(를) 삭제하시겠습니까?')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);

    // deleteTag가 호출되는지 확인
    expect(mockDeleteTag).toHaveBeenCalledWith('1', expect.any(Object));
  });
}); 