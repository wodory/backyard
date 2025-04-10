/// <reference types="vitest" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CardPage, { generateMetadata } from './page';
import '@testing-library/jest-dom/vitest';

// next/navigation 모킹
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

// Prisma 모킹 - 함수를 inline으로 정의
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      card: {
        findUnique: vi.fn()
      }
    }
  }
});

// formatDate 모킹
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
  cn: vi.fn((...args: any[]) => args.join(' '))
}));

// EditCardContent 컴포넌트 모킹
vi.mock('@/components/cards/EditCardContent', () => {
  return {
    default: vi.fn(({ initialContent }: { initialContent: string }) => (
      <div data-testid="edit-card-content">{initialContent}</div>
    ))
  };
});

describe('CardPage', () => {
  const params = { id: 'card123' };
  
  // 가짜 카드 데이터
  const mockCard = {
    id: 'card123',
    title: '테스트 카드',
    content: '테스트 내용입니다.',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user123',
      name: '테스트 사용자',
      email: 'test@example.com'
    },
    cardTags: [
      {
        id: 'ct1',
        cardId: 'card123',
        tagId: 'tag1',
        tag: {
          id: 'tag1',
          name: '태그1'
        }
      },
      {
        id: 'ct2',
        cardId: 'card123',
        tagId: 'tag2',
        tag: {
          id: 'tag2',
          name: '태그2'
        }
      }
    ]
  };
  
  // 테스트에서 사용할 모듈 참조 변수
  let prisma: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // 테스트에서 사용할 모킹된 모듈을 동적으로 가져옴
    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.default;
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('유효한 카드 ID로 카드 데이터를 렌더링해야 함', async () => {
    // prisma 모킹 설정
    prisma.card.findUnique.mockResolvedValue(mockCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 카드 제목과 내용이 렌더링되었는지 확인
    expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
    expect(screen.getByTestId('edit-card-content')).toHaveTextContent('테스트 내용입니다.');
    
    // 작성자 정보와 날짜가 렌더링되었는지 확인
    expect(screen.getByText(/작성자: 테스트 사용자/)).toBeInTheDocument();
    expect(screen.getByText(/작성일: 2025-03-05
    
    // 태그가 렌더링되었는지 확인
    expect(screen.getByText('태그1')).toBeInTheDocument();
    expect(screen.getByText('태그2')).toBeInTheDocument();
    
    // prisma 함수 호출 확인
    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: {
        user: true,
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
  });
  
  it('존재하지 않는 카드 ID로 notFound()를 호출해야 함', async () => {
    // prisma 모킹 설정 - 카드가 없음
    prisma.card.findUnique.mockResolvedValue(null);
    
    // notFound 함수 가져오기
    const { notFound } = await import('next/navigation');
    
    await CardPage({ params });
    
    // notFound가 호출되었는지 확인
    expect(notFound).toHaveBeenCalled();
    
    // 카드 조회가 시도되었는지 확인
    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: {
        user: true,
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
  });
  
  it('오류 발생 시 notFound()를 호출해야 함', async () => {
    // prisma 모킹 설정 - 오류 발생
    prisma.card.findUnique.mockRejectedValue(new Error('데이터베이스 오류'));
    
    // notFound 함수 가져오기
    const { notFound } = await import('next/navigation');
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await CardPage({ params });
    
    // notFound가 호출되었는지 확인
    expect(notFound).toHaveBeenCalled();
    
    // 오류 로깅이 되었는지 확인
    expect(consoleSpy).toHaveBeenCalled();
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
  
  it('이메일만 있는 사용자 정보도 표시해야 함', async () => {
    // 이메일만 있는 사용자로 카드 데이터 수정
    const userEmailOnlyCard = {
      ...mockCard,
      user: {
        id: 'user123',
        name: null,
        email: 'test@example.com'
      }
    };
    
    // prisma 모킹 설정
    prisma.card.findUnique.mockResolvedValue(userEmailOnlyCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 이메일이 작성자로 표시되는지 확인
    expect(screen.getByText(/작성자: test@example.com/)).toBeInTheDocument();
  });
  
  it('태그가 없는 카드도 정상적으로 렌더링되어야 함', async () => {
    // 태그가 없는 카드 데이터
    const noTagsCard = {
      ...mockCard,
      cardTags: []
    };
    
    // prisma 모킹 설정
    prisma.card.findUnique.mockResolvedValue(noTagsCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 카드 내용은 렌더링되어야 함
    expect(screen.getByRole('heading', { name: '테스트 카드' })).toBeInTheDocument();
    expect(screen.getByTestId('edit-card-content')).toHaveTextContent('테스트 내용입니다.');
    
    // 태그 영역이 렌더링되지 않아야 함
    expect(screen.queryByText('태그1')).not.toBeInTheDocument();
    expect(screen.queryByText('태그2')).not.toBeInTheDocument();
  });
  
  it('다양한 콘텐츠 형식(한글, 영어, 특수문자)이 올바르게 렌더링되어야 함', async () => {
    // 다양한 콘텐츠를 가진 카드 데이터
    const diverseContentCard = {
      ...mockCard,
      title: '다양한 내용 테스트 카드',
      content: '한글 내용, English content, 특수문자 !@#$%, 숫자 123'
    };
    
    // prisma 모킹 설정
    prisma.card.findUnique.mockResolvedValue(diverseContentCard);
    
    const page = await CardPage({ params });
    render(page);
    
    // 다양한 콘텐츠가 올바르게 렌더링되는지 확인
    expect(screen.getByRole('heading', { name: '다양한 내용 테스트 카드' })).toBeInTheDocument();
    expect(screen.getByTestId('edit-card-content')).toHaveTextContent('한글 내용, English content, 특수문자 !@#$%, 숫자 123');
  });
});

describe('generateMetadata', () => {
  const params = { id: 'card123' };
  
  // 테스트에서 사용할 모듈 참조 변수
  let prisma: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // 테스트에서 사용할 모킹된 모듈을 동적으로 가져옴
    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.default;
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('유효한 카드 ID로 카드 제목을 메타데이터로 반환해야 함', async () => {
    // 가짜 카드 데이터
    const mockCard = {
      id: 'card123',
      title: '테스트 카드',
      content: '테스트 내용입니다.',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // prisma 모킹 설정
    prisma.card.findUnique.mockResolvedValue(mockCard);
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '테스트 카드 | Backyard'
    });
  });
  
  it('존재하지 않는 카드 ID로 기본 메타데이터를 반환해야 함', async () => {
    // prisma 모킹 설정 - 카드가 없음
    prisma.card.findUnique.mockResolvedValue(null);
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '카드를 찾을 수 없음'
    });
  });
  
  it('오류 발생 시 기본 메타데이터를 반환해야 함', async () => {
    // prisma 모킹 설정 - 오류 발생
    prisma.card.findUnique.mockRejectedValue(new Error('데이터베이스 오류'));
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata).toEqual({
      title: '카드를 찾을 수 없음'
    });
    
    // 오류 로깅이 되었는지 확인
    expect(consoleSpy).toHaveBeenCalled();
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
});