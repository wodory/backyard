/**
 * 파일명: ./src/components/cards/CardList.test.tsx
 * 목적: 카드 목록 컴포넌트 테스트
 * 역할: 카드 목록 렌더링 및 동작 검증
 * 작성일: 2025-03-05
 * 수정일: 2025-04-25 : lint 오류 수정
 * 수정일: 2025-04-21 : React Query로 리팩토링
 */

import React from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { toast } from 'sonner';
import { describe, it, expect, beforeEach, afterEach, afterAll, vi, beforeAll } from 'vitest';

import CardList from './CardList';
import * as cardService from '@/services/cardService';

// MSW 서버 설정
const mockCards = [
  {
    id: 'card1',
    title: '테스트 카드 1',
    content: '테스트 내용 1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    userId: 'user1',
  },
  {
    id: 'card2',
    title: '테스트 카드 2',
    content: '테스트 내용 2',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    userId: 'user2',
  },
];

const server = setupServer(
  http.get('/api/cards', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const tag = url.searchParams.get('tag');

    // 검색어나 태그 필터링 적용
    if (q === 'error') {
      return new HttpResponse(null, { status: 500 });
    }

    let filteredCards = [...mockCards];
    if (q) {
      filteredCards = filteredCards.filter(card =>
        card.title.toLowerCase().includes(q.toLowerCase()) ||
        (card.content && card.content.toLowerCase().includes(q.toLowerCase()))
      );
    }

    return HttpResponse.json(filteredCards);
  }),

  http.delete('/api/cards/:id', () => {
    return HttpResponse.json({ success: true });
  })
);

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Next.js useSearchParams 모킹 개선
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  let mockSearchParams = new URLSearchParams();

  return {
    ...actual,
    useSearchParams: vi.fn(() => ({
      get: (key: string) => mockSearchParams.get(key),
      toString: () => mockSearchParams.toString(),
    })),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    })),
    // 테스트에서 검색 파라미터를 설정할 수 있는 헬퍼 함수
    __setSearchParams: (params: Record<string, string>) => {
      mockSearchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        mockSearchParams.append(key, value);
      });
    },
  };
});

// QueryClient 생성 함수
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

// 테스트 래퍼 컴포넌트
const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );

  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) => rerender(
      <QueryClientProvider client={testQueryClient}>
        {rerenderUi}
      </QueryClientProvider>
    ),
  };
};

// 테스트 타임아웃 값을 늘립니다
const EXTENDED_TIMEOUT = 5000;

describe('CardList 컴포넌트', () => {
  // console.error 모킹 추가
  const originalConsoleError = console.error;

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    server.resetHandlers();
    cleanup();
  });

  it('카드 목록을 성공적으로 로드하고 렌더링한다', async () => {
    renderWithClient(<CardList />);

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 카드 목록이 로드되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });

    expect(screen.getByText('테스트 카드 2')).toBeInTheDocument();
  }, EXTENDED_TIMEOUT);

  it('카드가 없을 때 적절한 메시지를 표시한다', async () => {
    // 빈 카드 목록 모킹
    server.use(
      http.get('/api/cards', () => {
        return HttpResponse.json([]);
      }),
    );

    renderWithClient(<CardList />);

    // 로딩 상태가 끝나고 빈 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드가 없습니다. 새 카드를 추가해보세요!')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });
  }, EXTENDED_TIMEOUT);

  it('API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // API 오류 모킹
    server.use(
      http.get('/api/cards', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    renderWithClient(<CardList />);

    // 에러 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText(/오류 발생:/)).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });
  }, EXTENDED_TIMEOUT);

  it('자세히 보기 버튼을 클릭하면 Dialog가 열린다', async () => {
    renderWithClient(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });

    // 자세히 보기 버튼 클릭
    const detailButtons = screen.getAllByText('자세히');
    fireEvent.click(detailButtons[0]);

    // Dialog가 열렸는지 확인
    await waitFor(() => {
      // 제목과 내용이 Dialog에 표시되었는지 확인
      expect(screen.getAllByText('테스트 카드 1').length).toBeGreaterThan(1);
      expect(screen.getByText(/작성일:/)).toBeInTheDocument();
      expect(screen.getByText('닫기')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });
  }, EXTENDED_TIMEOUT);

  it('삭제 버튼을 클릭하면 삭제 확인 Dialog가 열린다', async () => {
    renderWithClient(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });

    // 삭제 버튼 찾기 - 휴지통 아이콘이 있는 버튼
    const deleteButtons = screen.getAllByRole('button').filter(button =>
      !button.textContent || button.textContent.trim() === ''
    );

    fireEvent.click(deleteButtons[0]);

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });
  }, EXTENDED_TIMEOUT);

  it('삭제 확인 Dialog에서 삭제 버튼을 클릭하면 카드가 삭제된다', async () => {
    // 삭제 API 호출 스파이 설정
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderWithClient(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });

    // 삭제 버튼 찾기 - 휴지통 아이콘이 있는 버튼
    const deleteButtons = screen.getAllByRole('button').filter(button =>
      !button.textContent || button.textContent.trim() === ''
    );

    fireEvent.click(deleteButtons[0]);

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
    }, { timeout: EXTENDED_TIMEOUT });

    // 삭제 버튼 클릭
    const deleteButton = screen.getByText('삭제');
    fireEvent.click(deleteButton);

    // 삭제 API 호출 확인
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/cards/card1', { method: 'DELETE' });
      expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
    }, { timeout: EXTENDED_TIMEOUT });
  }, EXTENDED_TIMEOUT);
}); 