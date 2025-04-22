/**
 * 파일명: src/app/cards/[id]/DeleteButton.test.tsx
 * 목적: 카드 삭제 버튼 컴포넌트 테스트
 * 역할: 카드 삭제 기능을 테스트
 * 작성일: 2025-03-29
 * 수정일: 2025-04-23 : React Query 리팩토링으로 인한 테스트 업데이트
 */
import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import DeleteButton, { callIfExists } from './DeleteButton';
import { useDeleteCard } from '@/hooks/useDeleteCard';

// 모킹 설정
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// vi.mock('sonner', () => ({
//   toast: {
//     success: vi.fn(),
//     error: vi.fn()
//   }
// }));

// useDeleteCard 훅 모킹
const mockMutate = vi.fn();
let mockIsPending = false;
let mockIsError = false;
let mockIsSuccess = false;

vi.mock('@/hooks/useDeleteCard', () => ({
  useDeleteCard: vi.fn()
}));

// Dialog 컴포넌트 모킹 개선
vi.mock('@/components/ui/dialog', () => {
  return {
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => (
      <div data-testid="dialog" data-open={open}>{children}</div>
    ),
    DialogTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
      <div data-testid="dialog-trigger" onClick={() => document.dispatchEvent(new Event('dialog-open'))}>
        {children}
      </div>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-title">{children}</div>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-description">{children}</div>
    ),
    DialogFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-footer">{children}</div>
    ),
    DialogClose: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
      <div data-testid="dialog-close" onClick={() => document.dispatchEvent(new Event('dialog-close'))}>
        {children}
      </div>
    ),
  };
});

// 테스트를 위한 유틸리티 함수
describe('callIfExists', () => {
  it('콜백이 존재하면, 콜백을 호출해야 함', () => {
    const mockCallback = vi.fn();
    callIfExists(mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('콜백이 undefined이면, 오류 없이 실행되어야 함', () => {
    expect(() => callIfExists(undefined)).not.toThrow();
  });
});

describe('DeleteButton', () => {
  const cardId = '123abc';

  // Dialog 이벤트 핸들러 함수
  let dialogOpenHandler: (event: Event) => void;
  let dialogCloseHandler: (event: Event) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // 이벤트 리스너 핸들러 구현
    dialogOpenHandler = (event: Event) => {
      const dialogElement = document.querySelector('[data-testid="dialog"]');
      if (dialogElement) {
        dialogElement.setAttribute('data-open', 'true');
      }
    };

    dialogCloseHandler = (event: Event) => {
      const dialogElement = document.querySelector('[data-testid="dialog"]');
      if (dialogElement) {
        dialogElement.setAttribute('data-open', 'false');
      }
    };

    // 다이얼로그 이벤트 리스너 등록
    document.addEventListener('dialog-open', dialogOpenHandler);
    document.addEventListener('dialog-close', dialogCloseHandler);

    vi.mocked(useDeleteCard).mockReturnValue({
      mutate: mockMutate,
      isPending: mockIsPending,
      isError: mockIsError,
      isSuccess: mockIsSuccess,
      isIdle: true,
      isPaused: false,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      submittedAt: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();

    // 이벤트 리스너 정리
    document.removeEventListener('dialog-open', dialogOpenHandler);
    document.removeEventListener('dialog-close', dialogCloseHandler);
  });

  describe('렌더링 테스트', () => {
    it('삭제 버튼이 올바르게 렌더링되어야 함', () => {
      render(<DeleteButton cardId={cardId} />);
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('삭제 기능 테스트', () => {
    it('삭제 버튼 클릭 시 다이얼로그가 열려야 함', async () => {
      render(<DeleteButton cardId={cardId} />);

      // 삭제 버튼 클릭
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      fireEvent.click(deleteButton);

      // 다이얼로그 컨텐츠 검증
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까?')).toBeInTheDocument();
    });

    it('확인 버튼 클릭 시 useDeleteCard.mutate가 호출되어야 함', async () => {
      render(<DeleteButton cardId={cardId} />);

      // 삭제 버튼 클릭하여 다이얼로그 열기
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      fireEvent.click(deleteButton);

      // 삭제 확인 버튼 클릭
      const confirmDeleteButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmDeleteButton);

      // mutate 호출 확인
      expect(mockMutate).toHaveBeenCalled();
    });

    it('삭제 성공 시 성공 콜백이 실행되어야 함', () => {
      const mockOnSuccessfulDelete = vi.fn();

      // 성공 콜백 시뮬레이션
      render(<DeleteButton cardId={cardId} onSuccessfulDelete={mockOnSuccessfulDelete} />);

      // mutate의 onSuccess 콜백 수동 실행 시뮬레이션
      const onSuccess = mockMutate.mock.calls[0]?.[1]?.onSuccess;
      if (onSuccess) onSuccess();

      // 성공 시의 동작 검증
      expect(mockPush).toHaveBeenCalledWith("/cards");
      expect(mockOnSuccessfulDelete).toHaveBeenCalled();
    });

    it('삭제 실패 시 에러 처리가 올바르게 동작해야 함', () => {
      const testError = new Error('테스트 에러');

      render(<DeleteButton cardId={cardId} />);

      // 삭제 버튼 클릭하여 다이얼로그 열기
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      fireEvent.click(deleteButton);

      // 삭제 확인 버튼 클릭
      const confirmDeleteButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmDeleteButton);

      // onError 콜백 수동 실행 시뮬레이션
      const onError = mockMutate.mock.calls[0]?.[1]?.onError;
      if (onError) onError(testError);

      // 에러 처리 검증
      expect(mockPush).not.toHaveBeenCalled(); // 에러 시 리디렉션 없음
    });

    it('로딩 상태일 때 삭제 버튼이 비활성화되어야 함', () => {
      // 로딩 상태로 훅 모킹 재설정
      vi.mocked(useDeleteCard).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        isSuccess: false,
        isIdle: false,
        isPaused: false,
        data: undefined,
        error: null,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
        reset: vi.fn(),
        status: 'pending',
        variables: undefined,
        context: undefined,
        submittedAt: 0
      });

      render(<DeleteButton cardId={cardId} />);

      // 삭제 버튼 클릭하여 다이얼로그 열기
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      fireEvent.click(deleteButton);

      // 다이얼로그 내부의 로딩 상태의 버튼 확인
      const loadingButton = screen.getByText('삭제 중...');
      expect(loadingButton).toBeInTheDocument();
      expect(loadingButton.closest('button')).toHaveAttribute('disabled');
    });

    it('특정 ID를 가진 카드를 삭제하는 기능이 있어야 함', () => {
      // given
      render(<DeleteButton cardId={cardId} />);

      // when
      const deleteButton = screen.getByRole('button', { name: /삭제/ });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /확인/ });
      fireEvent.click(confirmButton);

      // then
      expect(mockMutate).toHaveBeenCalled();
    });
  });
}); 