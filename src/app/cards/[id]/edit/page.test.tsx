/**
 * 파일명: page.test.tsx
 * 목적: 카드 편집 페이지 컴포넌트 테스트
 * 역할: 카드 편집 페이지의 다양한 상태와 기능을 테스트
 * 작성일: 2024-05-27
 */

/// <reference types="vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditCardPage from './page';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// EditCardForm 컴포넌트의 props 타입 정의
interface EditCardFormProps {
  card: {
    id: string;
    title: string;
    content: string;
    cardTags: any[];
  };
  onSuccess: () => void;
}

// EditCardForm 컴포넌트 모킹
const mockEditCardForm = vi.fn();
vi.mock('@/components/cards/EditCardForm', () => ({
  default: (props: EditCardFormProps) => {
    mockEditCardForm(props);
    return <div data-testid="edit-card-form">카드 편집 폼</div>;
  }
}));

// useRouter 및 useParams 모킹
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    back: mockBack,
  })),
  useParams: vi.fn(() => ({
    id: 'test-card-123'
  }))
}));

// 전역 fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('EditCardPage', () => {
  // 성공적인 응답을 위한 모킹 데이터
  const mockCardData = {
    id: 'test-card-123',
    title: '테스트 카드',
    content: '테스트 내용입니다.',
    cardTags: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 기본적으로 성공 응답 모킹
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCardData)
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('초기 로딩 상태를 테스트해야 함', async () => {
    // fetch 호출 지연시키기
    let resolvePromise: Function;
    mockFetch.mockImplementationOnce(() =>
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    await act(async () => {
      render(<EditCardPage />);
    });

    // 로딩 상태가 먼저 표시되는지 확인
    expect(screen.queryByTestId('edit-card-form')).not.toBeInTheDocument();

    // 로딩 표시자가 있는지 확인
    const loadingElement = screen.getByText(/로딩/);
    expect(loadingElement).toBeInTheDocument();
  });

  it('뒤로 가기 버튼 클릭 시 이전 페이지로 이동해야 함', async () => {
    await act(async () => {
      render(<EditCardPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('fetch 호출이 올바른 URL로 이루어져야 함', async () => {
    await act(async () => {
      render(<EditCardPage />);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/cards/test-card-123');
  });

  it('카드 데이터 로드 성공 시 EditCardForm을 렌더링해야 함', async () => {
    await act(async () => {
      render(<EditCardPage />);
    });

    // 비동기 데이터 로딩 완료 대기
    await act(async () => {
      // 비동기 처리 대기
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();

    // EditCardForm에 올바른 props 전달 확인
    expect(mockEditCardForm).toHaveBeenCalledWith(
      expect.objectContaining({
        card: mockCardData
      })
    );
  });

  it('카드 로드 실패 시 에러 메시지를 표시해야 함', async () => {
    // 에러 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await act(async () => {
      render(<EditCardPage />);
    });

    // 비동기 처리 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 에러 메시지가 화면에 표시되는지 확인
    const errorElement = screen.getByText('카드를 찾을 수 없습니다.');
    expect(errorElement).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeInTheDocument();
  });

  it('네트워크 에러 발생 시 에러 메시지를 표시해야 함', async () => {
    // 네트워크 오류 모킹
    mockFetch.mockRejectedValueOnce(new Error('네트워크 오류'));

    await act(async () => {
      render(<EditCardPage />);
    });

    // 비동기 처리 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 실제 에러 메시지 텍스트를 확인 (화면에 표시된 대로)
    const errorElement = screen.getByText('네트워크 오류');
    expect(errorElement).toBeInTheDocument();
  });

  it('EditCardForm의 onSuccess 콜백이 호출되면 /board로 리다이렉트해야 함', async () => {
    await act(async () => {
      render(<EditCardPage />);
    });

    // 비동기 처리 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();

    // EditCardForm에 전달된 onSuccess 콜백 함수 추출
    const onSuccessCallback = mockEditCardForm.mock.calls[0][0].onSuccess;

    // 콜백 함수 실행
    await act(async () => {
      onSuccessCallback();
    });

    // /board로 리다이렉트 확인
    expect(mockPush).toHaveBeenCalledWith('/board');
  });

  it('에러 상태에서 돌아가기 버튼 클릭 시 뒤로 가기 함수가 호출되어야 함', async () => {
    // 에러 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await act(async () => {
      render(<EditCardPage />);
    });

    // 비동기 처리 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));
    });

    expect(mockBack).toHaveBeenCalled();
  });
}); 