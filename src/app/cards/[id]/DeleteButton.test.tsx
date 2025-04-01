/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteButton, { callIfExists } from './DeleteButton';
import '@testing-library/jest-dom/vitest';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// 모킹 설정
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// 테스트 유틸리티 함수
// 각각의 모킹 fetch 응답 패턴
const mockFetchSuccess = () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
  });
};

const mockFetchError = (errorMessage = '카드 삭제에 실패했습니다.') => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: errorMessage })
  });
};

const mockFetchNetworkError = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('네트워크 오류'));
};

// 삭제 버튼 클릭하는 유틸리티 함수
const clickDeleteButton = () => {
  const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
  fireEvent.click(deleteButton);
};

// 삭제 확인 다이얼로그에서 삭제 버튼 클릭하는 유틸리티 함수
const clickConfirmDeleteButton = () => {
  const confirmButton = screen.getByRole('button', { name: '삭제' });
  fireEvent.click(confirmButton);
};

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

  beforeEach(() => {
    vi.clearAllMocks();
    // fetch 기본 모킹
    mockFetchSuccess();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('렌더링 및 UI 테스트', () => {
    it('삭제 버튼이 올바르게 렌더링되어야 함', () => {
      render(<DeleteButton cardId={cardId} />);
      const deleteButton = screen.getByRole('button', { name: '카드 삭제' });
      expect(deleteButton).toBeInTheDocument();
    });

    it('삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', () => {
      render(<DeleteButton cardId={cardId} />);
      clickDeleteButton();

      // h2 역할을 가진 요소에서 카드 삭제 찾기
      const dialogTitle = screen.getByRole('heading', { name: '카드 삭제' });
      const confirmText = screen.getByText(/이 카드를 정말로 삭제하시겠습니까?/);

      expect(dialogTitle).toBeInTheDocument();
      expect(confirmText).toBeInTheDocument();
    });

    it('취소 버튼 클릭 시 다이얼로그가 닫혀야 함', () => {
      render(<DeleteButton cardId={cardId} />);
      clickDeleteButton();

      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);

      // 다이얼로그가 닫히면 확인 메시지는 화면에서 사라짐
      expect(screen.queryByText('이 카드를 정말로 삭제하시겠습니까?')).not.toBeInTheDocument();
    });

    // 삭제 버튼 클릭 시 API 호출 테스트
    it('삭제 확인 버튼 클릭 시 API 호출이 이루어져야 함', async () => {
      render(<DeleteButton cardId={cardId} />);
      clickDeleteButton();
      clickConfirmDeleteButton();

      // fetch 호출 확인
      expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, {
        method: "DELETE",
      });
    });
  });

  describe('콜백 테스트', () => {
    it('성공 응답 시 올바른 함수들이 호출되어야 함', async () => {
      const mockSuccessCallback = vi.fn();

      // 성공 응답 모킹
      mockFetchSuccess();

      render(<DeleteButton cardId={cardId} onSuccessfulDelete={mockSuccessCallback} />);
      clickDeleteButton();
      clickConfirmDeleteButton();

      // 비동기 처리가 완료될 때까지 대기
      await vi.waitFor(() => {
        expect(mockSuccessCallback).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("카드가 성공적으로 삭제되었습니다.");
        expect(mockPush).toHaveBeenCalledWith("/cards");
      }, { timeout: 1000 });
    });
  });

  describe('오류 테스트', () => {
    it('API 오류 응답 시 에러 처리가 올바르게 동작해야 함', async () => {
      const errorMessage = '카드 삭제에 실패했습니다';

      // 에러 응답 모킹
      mockFetchError(errorMessage);

      render(<DeleteButton cardId={cardId} />);
      clickDeleteButton();
      clickConfirmDeleteButton();

      // 비동기 처리가 완료될 때까지 대기
      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
        expect(mockPush).not.toHaveBeenCalled(); // 오류 시 리디렉션 없음
      }, { timeout: 1000 });
    });

    it('네트워크 오류 발생 시 오류 처리가 올바르게 동작해야 함', async () => {
      // 네트워크 오류 모킹
      mockFetchNetworkError();

      render(<DeleteButton cardId={cardId} />);
      clickDeleteButton();
      clickConfirmDeleteButton();

      // 비동기 처리가 완료될 때까지 대기
      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("네트워크 오류");
        expect(mockPush).not.toHaveBeenCalled(); // 오류 시 리디렉션 없음
      }, { timeout: 1000 });
    });
  });
}); 