/**
 * 파일명: src/components/tags/TagForm.test.tsx
 * 목적: TagForm 컴포넌트 테스트
 * 역할: 태그 생성 폼 컴포넌트의 동작 검증
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TagForm from './TagForm';
import { useCreateTag } from '@/hooks/useCreateTag';
import { toast } from 'sonner';

// useCreateTag 훅 모킹
vi.mock('@/hooks/useCreateTag', () => ({
  useCreateTag: vi.fn(),
}));

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe('TagForm 컴포넌트', () => {
  // 테스트용 mutate 함수
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    // 기본 상태 모킹
    (useCreateTag as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it('태그 입력 폼이 올바르게 렌더링된다', () => {
    renderWithClient(<TagForm />);

    // 폼 요소가 존재하는지 확인
    expect(screen.getByLabelText('태그 이름')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 태그 이름을 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '태그 생성' })).toBeInTheDocument();
  });

  it('빈 입력값으로 제출 시 에러 메시지를 표시한다', () => {
    renderWithClient(<TagForm />);

    // 빈 폼 제출
    const submitButton = screen.getByRole('button', { name: '태그 생성' });
    fireEvent.click(submitButton);

    // 에러 토스트 호출 확인
    expect(toast.error).toHaveBeenCalledWith('태그 이름을 입력해주세요.');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효한 태그 이름 제출 시 createTag 함수를 호출한다', () => {
    renderWithClient(<TagForm />);

    // 태그 이름 입력
    const input = screen.getByLabelText('태그 이름');
    fireEvent.change(input, { target: { value: '새 태그' } });

    // 폼 제출
    const submitButton = screen.getByRole('button', { name: '태그 생성' });
    fireEvent.click(submitButton);

    // createTag 호출 확인
    expect(mockMutate).toHaveBeenCalledWith(
      { name: '새 태그' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('로딩 상태 시 UI를 비활성화하고 로딩 표시를 보여준다', () => {
    // 로딩 상태 모킹
    (useCreateTag as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });

    renderWithClient(<TagForm />);

    // 입력 필드와 버튼이 비활성화되었는지 확인
    expect(screen.getByLabelText('태그 이름')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();

    // 로딩 텍스트 확인
    expect(screen.getByText('생성 중...')).toBeInTheDocument();
  });

  it('성공 시 입력 필드를 초기화하고 성공 메시지를 표시한다', async () => {
    renderWithClient(<TagForm />);

    // 태그 이름 입력
    const input = screen.getByLabelText('태그 이름');
    fireEvent.change(input, { target: { value: '새 태그' } });

    // 폼 제출
    const submitButton = screen.getByRole('button', { name: '태그 생성' });
    fireEvent.click(submitButton);

    // mutate의 onSuccess 콜백 실행 - act()로 감싸기
    const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
    act(() => {
      onSuccessCallback();
    });

    // 성공 토스트 호출 확인
    expect(toast.success).toHaveBeenCalledWith('태그가 생성되었습니다.');

    // 입력 필드가 초기화되었는지 확인
    expect(screen.getByLabelText('태그 이름')).toHaveValue('');
  });

  it('에러 발생 시 에러 메시지를 표시한다', () => {
    renderWithClient(<TagForm />);

    // 태그 이름 입력
    const input = screen.getByLabelText('태그 이름');
    fireEvent.change(input, { target: { value: '새 태그' } });

    // 폼 제출
    const submitButton = screen.getByRole('button', { name: '태그 생성' });
    fireEvent.click(submitButton);

    // mutate의 onError 콜백 실행
    const testError = new Error('이미 존재하는 태그입니다.');
    const onErrorCallback = mockMutate.mock.calls[0][1].onError;
    act(() => {
      onErrorCallback(testError);
    });

    // 에러 토스트 호출 확인
    expect(toast.error).toHaveBeenCalledWith('이미 존재하는 태그입니다.');
  });
}); 