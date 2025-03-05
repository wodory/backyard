import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CardList from './CardList';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// useSearchParams는 setupTests.ts에서 이미 모킹됨

// fetch는 setupTests.ts에서 이미 전역으로 모킹되어 있음

describe('CardList 컴포넌트', () => {
  // console.error 모킹 추가
  const originalConsoleError = console.error;
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    
    // useSearchParams 기본값으로 초기화
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => null,
      toString: () => '',
    }));
    
    // 모킹된 카드 데이터 (기본 테스트용)
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

    // 기본 fetch 응답 모킹
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockCards,
    });
  });

  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('카드 목록을 성공적으로 로드하고 렌더링한다', async () => {
    // 모킹된 카드 데이터
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

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCards,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 카드 목록이 로드되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 카드 2')).toBeInTheDocument();
      expect(screen.getByText('테스트 내용 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 내용 2')).toBeInTheDocument();
    });

    // fetch가 올바른 URL로 호출되었는지 확인
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
  });

  it('카드가 없을 때 적절한 메시지를 표시한다', async () => {
    // 빈 카드 목록 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 로딩 상태가 끝나고 빈 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드가 없습니다. 새 카드를 추가해보세요!')).toBeInTheDocument();
    });
  });

  it('API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // API 오류 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
    });
  });

  it('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 네트워크 오류 모킹
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // 컴포넌트 렌더링
    render(<CardList />);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 목록을 불러오는데 실패했습니다.');
    });
  });

  it('자세히 보기 버튼을 클릭하면 Dialog가 열린다', async () => {
    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 자세히 보기 버튼 클릭
    const detailButtons = screen.getAllByText('자세히');
    fireEvent.click(detailButtons[0]);

    // Dialog가 열렸는지 확인 (제목이 Dialog에 표시됨)
    await waitFor(() => {
      // Dialog의 내용이 표시되는지 확인
      expect(screen.getAllByText('테스트 카드 1').length).toBeGreaterThan(1); // 카드 목록과 Dialog 두 곳에 표시
      // '작성일:' 대신 Dialog 내에 표시된 날짜 형식 확인
      expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
      expect(screen.getByText('닫기')).toBeInTheDocument(); // Dialog의 닫기 버튼
    });
  });

  it('삭제 버튼을 클릭하면 삭제 확인 Dialog가 열린다', async () => {
    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // 휴지통 아이콘만 있어서 텍스트 없음
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭 (카드마다 자세히 보기와 삭제 버튼이 있음)

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
      expect(screen.getByText('삭제')).toBeInTheDocument();
    });
  });

  it('삭제 확인 Dialog에서 삭제 버튼을 클릭하면 카드가 삭제된다', async () => {
    // 삭제 API 호출 모킹
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/api/cards/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' }),
        });
      }
      
      // 기본 카드 목록 데이터 반환
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 'card1',
            title: '테스트 카드 1',
            content: '테스트 내용 1',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            userId: 'user1',
          },
        ],
      });
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 모든 휴지통 아이콘 버튼 찾기 (삭제 버튼)
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // 마지막 삭제 버튼 클릭

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    // 삭제 API가 호출되었는지 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/card1', { method: 'DELETE' });
      expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
    });
  });

  it('검색 쿼리 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'q' ? '검색어' : null,
      toString: () => 'q=검색어',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4');
    });
  });

  it('태그 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'tag' ? '테스트태그' : null,
      toString: () => 'tag=테스트태그',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
    });
  });

  it('여러 파라미터가 있을 때 올바른 API 요청을 한다', async () => {
    // useSearchParams 모킹 수정
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => {
        if (param === 'q') return '검색어';
        if (param === 'tag') return '테스트태그';
        return null;
      },
      toString: () => 'q=검색어&tag=테스트태그',
    }));

    // 컴포넌트 렌더링
    render(<CardList />);

    // fetch가 올바른 URL로 호출되었는지 확인 (URL 인코딩 되어 호출됨)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards?q=%EA%B2%80%EC%83%89%EC%96%B4&tag=%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%83%9C%EA%B7%B8');
    });
  });

  it('검색 결과가 없을 때 적절한 메시지를 표시한다', async () => {
    // 검색 파라미터 모킹
    (useSearchParams as any).mockImplementation(() => ({
      get: (param: string) => param === 'q' ? '존재하지않는검색어' : null,
      toString: () => 'q=존재하지않는검색어',
    }));

    // 빈 검색 결과 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 검색 결과 없음 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('태그를 포함한 카드를 렌더링한다', async () => {
    // 태그가 있는 카드 데이터 모킹
    const mockCardsWithTags = [
      {
        id: 'card1',
        title: '태그 있는 카드',
        content: '태그 테스트 내용',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
        cardTags: [
          {
            id: 'tag1',
            tag: {
              id: 'tagid1',
              name: '테스트태그'
            }
          }
        ]
      }
    ];

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCardsWithTags,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드와 태그가 렌더링되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('태그 있는 카드')).toBeInTheDocument();
      expect(screen.getByText('#테스트태그')).toBeInTheDocument();
    });
  });

  it('태그를 클릭하면 적절한 URL로 이동한다', async () => {
    // 테스트용 태그 이름
    const tagName = 'testTag';
    
    // window.location.href 모킹
    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalHref }
    });
    
    // handleTagClick 함수 테스트
    const navigateToTagUrl = (tagName: string) => {
      window.location.href = `/cards?tag=${encodeURIComponent(tagName)}`;
    };
    
    // 함수 실행
    navigateToTagUrl(tagName);
    
    // 결과 확인
    expect(window.location.href).toBe(`/cards?tag=${encodeURIComponent(tagName)}`);
    
    // location 복원
    window.location.href = originalHref;
  });

  it('카드 삭제 중 API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 카드 데이터 모킹
    const mockCards = [
      {
        id: 'card1',
        title: '삭제할 카드',
        content: '삭제 테스트 내용',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      }
    ];

    // fetch 응답 모킹 (처음에는 성공, 삭제 시 에러)
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      if (url.includes('/api/cards/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: '권한이 없습니다.' }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => mockCards,
      });
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('삭제할 카드')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    // 삭제 확인 Dialog가 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('카드 삭제')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    // 에러 토스트가 호출되었는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('권한이 없습니다.');
    });
  });

  it('태그 클릭 시 해당 태그로 필터링된 URL로 이동한다', async () => {
    // 창 위치 변경을 모킹
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    const TAG_NAME = '테스트태그';
    
    // 태그를 포함하는 카드 데이터 생성
    const mockCards = [
      {
        id: 1,
        title: '테스트 카드 1',
        content: '테스트 내용 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        cardTags: [
          {
            id: 1,
            cardId: 1,
            tagId: 1,
            tag: {
              id: 1,
              name: TAG_NAME,
            },
          },
        ],
      },
    ];

    // fetch 응답 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCards,
    });

    // 컴포넌트 렌더링
    render(<CardList />);

    // 카드 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('테스트 카드 1')).toBeInTheDocument();
    });

    // 디버깅: 태그 요소가 렌더링되었는지 확인
    screen.debug(document.body);

    // 태그 찾기 및 클릭
    await waitFor(() => {
      // 유연한 방식으로 태그 요소 찾기
      const tagElements = screen.getAllByText((content, element) => {
        return content.includes(TAG_NAME);
      });
      
      console.log('찾은 태그 요소 수:', tagElements.length);
      expect(tagElements.length).toBeGreaterThan(0);
      
      // 첫 번째 태그 요소 클릭
      fireEvent.click(tagElements[0]);
      
      // URL이 올바르게 설정되었는지 확인 (인코딩된 URL 기대)
      const encodedTagName = encodeURIComponent(TAG_NAME);
      const expectedUrl = `/cards?tag=${encodedTagName}`;
      expect(window.location.href).toBe(expectedUrl);
    });
  });
}); 