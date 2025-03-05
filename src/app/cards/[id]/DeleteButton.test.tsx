/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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

// fetch 모킹 헬퍼 함수
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

const mockFetchNetworkError = (errorMessage = '네트워크 오류') => {
  global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));
};

// 테스트 헬퍼 함수
const clickDeleteButton = () => {
  const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
  fireEvent.click(deleteButton);
};

const clickConfirmDeleteButton = () => {
  const confirmButton = screen.getByRole('button', { name: '삭제' });
  fireEvent.click(confirmButton);
};

// callIfExists 함수에 대한 별도 테스트 그룹
describe('callIfExists', () => {
  it('콜백이 존재하면, 콜백을 호출해야 함', () => {
    const callback = vi.fn();
    callIfExists(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('콜백이 undefined이면, 오류 없이 실행되어야 함', () => {
    expect(() => callIfExists(undefined)).not.toThrow();
  });
});

describe('DeleteButton', () => {
  const cardId = '123abc';
  
  beforeEach(() => {
    vi.resetAllMocks(); // 모든 모킹 초기화
    mockFetchSuccess(); // 기본적으로 성공 응답 모킹
  });
  
  afterEach(() => {
    cleanup(); // DOM 정리
  });
  
  describe('렌더링 및 UI 테스트', () => {
    it('삭제 버튼이 올바르게 렌더링되어야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Assert
      const deleteButton = screen.getByRole('button', { name: /카드 삭제/ });
      expect(deleteButton).toBeInTheDocument();
    });
    
    it('삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      
      // Assert
      expect(screen.getByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });
    
    it('취소 버튼 클릭 시 다이얼로그가 닫혀야 함', () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act - 다이얼로그 열기
      clickDeleteButton();
      
      // Act - 취소 버튼 클릭
      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);
      
      // Assert
      expect(screen.queryByText('이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).not.toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  describe('삭제 성공 시나리오', () => {
    it('삭제 성공 시 API 호출이 이루어지고 리디렉션되어야 함', async () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.success).toHaveBeenCalledWith('카드가 성공적으로 삭제되었습니다.');
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });
    
    it('삭제 성공 시 onSuccessfulDelete 콜백이 호출되어야 함', async () => {
      // Arrange
      const mockCallback = vi.fn();
      render(<DeleteButton cardId={cardId} onSuccessfulDelete={mockCallback} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });
    
    it('콜백이 제공되지 않아도 정상 동작해야 함', async () => {
      // Arrange
      render(<DeleteButton cardId={cardId} />); // 콜백 없이 렌더링
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });
  });
  
  describe('삭제 중 상태 테스트', () => {
    it('삭제 중에는 버튼이 비활성화되고 로딩 텍스트가 표시되어야 함', async () => {
      // Arrange
      // 비동기 응답을 위한 딜레이 설정
      global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ message: '카드가 성공적으로 삭제되었습니다.' })
          });
        }, 100);
      }));
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert - 삭제 중 상태 확인
      expect(screen.getByText('삭제 중...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
      
      // 응답 완료 후 상태 확인
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
      });
    });
  });
  
  describe('오류 시나리오 테스트', () => {
    it('API 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
      // Arrange
      const errorMessage = '서버 오류로 카드 삭제에 실패했습니다.';
      mockFetchError(errorMessage);
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
        expect(mockPush).not.toHaveBeenCalled(); // 리디렉션 없음
      });
    });
    
    it('errorData.error가 없을 때 기본 에러 메시지를 표시해야 함', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: '응답은 있지만 error 필드가 없는 경우' }) // error 필드 없음
      });
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${cardId}`, { method: 'DELETE' });
        expect(toast.error).toHaveBeenCalledWith('카드 삭제에 실패했습니다.');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
    
    it('네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
      // Arrange
      mockFetchNetworkError();
      
      render(<DeleteButton cardId={cardId} />);
      
      // Act
      clickDeleteButton();
      clickConfirmDeleteButton();
      
      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('네트워크 오류');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('다양한 카드 ID 테스트', () => {
    it('다양한 형식의 카드 ID로 삭제가 가능해야 함', async () => {
      // Arrange
      const cardIds = [
        'abc123',
        'card_with-hyphen',
        '123456',
        'longCardIdWithMixedCharacters123'
      ];
      
      // 각 ID에 대한 테스트
      for (const id of cardIds) {
        vi.clearAllMocks();
        mockFetchSuccess();
        
        const { unmount } = render(<DeleteButton cardId={id} />);
        
        // Act
        clickDeleteButton();
        clickConfirmDeleteButton();
        
        // Assert
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(`/api/cards/${id}`, { method: 'DELETE' });
        });
        
        unmount(); // 다음 테스트를 위해 언마운트
      }
    });
  });
}); 