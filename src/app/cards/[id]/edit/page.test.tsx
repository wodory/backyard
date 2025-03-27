/**
 * 파일명: page.test.tsx
 * 목적: 카드 편집 페이지 컴포넌트 테스트
 * 역할: 카드 편집 페이지의 다양한 상태와 기능을 테스트
 * 작성일: 2024-05-27
 */

/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditCardPage from './page';
import '@testing-library/jest-dom/vitest';

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

// EditCardForm 컴포넌트 모킹
vi.mock('@/components/cards/EditCardForm', () => ({
  default: vi.fn(({ card, onSuccess }) => (
    <div data-testid="edit-card-form">
      <div>카드 제목: {card.title}</div>
      <div>카드 내용: {card.content}</div>
      <button data-testid="success-button" onClick={onSuccess}>
        저장 성공 시뮬레이션
      </button>
    </div>
  ))
}));

// 전역 fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('EditCardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('초기 로딩 상태를 렌더링해야 함', async () => {
    // fetch 응답이 오기 전 로딩 상태 테스트
    mockFetch.mockImplementation(() => new Promise(() => {})); // 응답이 오지 않는 fetch

    render(<EditCardPage />);

    // 로딩 텍스트 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('카드 데이터 로딩 성공 시 EditCardForm을 렌더링해야 함', async () => {
    // 성공 응답 모킹
    const mockCard = {
      id: 'test-card-123',
      title: '테스트 카드',
      content: '테스트 내용',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCard
    });

    render(<EditCardPage />);

    // 로딩 상태 확인 후 폼 렌더링 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 폼이 렌더링될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
    });

    // 카드 데이터가 폼에 전달되었는지 확인
    expect(screen.getByText(`카드 제목: ${mockCard.title}`)).toBeInTheDocument();
    expect(screen.getByText(`카드 내용: ${mockCard.content}`)).toBeInTheDocument();

    // 올바른 엔드포인트로 fetch 요청이 이루어졌는지 확인
    expect(mockFetch).toHaveBeenCalledWith('/api/cards/test-card-123');
  });

  it('카드 데이터 로딩 실패 시 에러 메시지를 표시해야 함', async () => {
    // 실패 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(<EditCardPage />);

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('카드를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    // 돌아가기 버튼이 표시되는지 확인
    const backButton = screen.getByRole('button', { name: '돌아가기' });
    expect(backButton).toBeInTheDocument();

    // 돌아가기 버튼 클릭 시 router.back이 호출되는지 확인
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('네트워크 오류 발생 시 에러 메시지를 표시해야 함', async () => {
    // 네트워크 오류 모킹
    mockFetch.mockRejectedValueOnce(new Error('네트워크 오류'));

    render(<EditCardPage />);

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
    });
  });

  it('저장 성공 시 보드 페이지로 이동해야 함', async () => {
    // 성공 응답 모킹
    const mockCard = {
      id: 'test-card-123',
      title: '테스트 카드',
      content: '테스트 내용',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCard
    });

    render(<EditCardPage />);

    // 폼이 렌더링될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
    });

    // 성공 버튼 클릭
    fireEvent.click(screen.getByTestId('success-button'));

    // 보드 페이지로 이동하는지 확인
    expect(mockPush).toHaveBeenCalledWith('/board');
  });

  it('뒤로 가기 버튼 클릭 시 이전 페이지로 이동해야 함', async () => {
    // 성공 응답 모킹
    const mockCard = {
      id: 'test-card-123',
      title: '테스트 카드',
      content: '테스트 내용',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCard
    });

    render(<EditCardPage />);

    // 폼이 렌더링될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
    });

    // 뒤로 가기 버튼 찾기
    const backButton = screen.getByRole('button', { name: /뒤로 가기/i });
    expect(backButton).toBeInTheDocument();

    // 뒤로 가기 버튼 클릭
    fireEvent.click(backButton);

    // router.back이 호출되는지 확인
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
}); 