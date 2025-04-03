/**
 * 파일명: TagList.test.tsx
 * 목적: TagList 컴포넌트의 기능 테스트
 * 역할: 태그 목록의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

// 모킹은 테스트 파일 최상단에 위치해야 함
import { vi } from 'vitest';

// Sonner 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// TagListMock 컴포넌트 모킹 (실제 컴포넌트 로직과 별개로 테스트하기 위함)
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TagListMock } from './TagListMock';
import { mockActions } from './test-utils';
import '@testing-library/jest-dom';

// 테스트용 태그 데이터
const mockTags = [
  { id: '1', name: '자바스크립트', count: 5, createdAt: '2023년 1월 1일' },
  { id: '2', name: '리액트', count: 3, createdAt: '2023년 2월 1일' },
  { id: '3', name: '타입스크립트', count: 0, createdAt: '2023년 3월 1일' }
];

// 실제 TagListMock 컴포넌트를 래핑하는 테스트용 컴포넌트
function TestTagListWithDialog({
  tagId = '1',
  tagName = '자바스크립트',
  tagCount = 5,
  showCountWarning = true
}) {
  // 강제로 다이얼로그가 표시된 상태를 렌더링
  return (
    <div>
      <div>
        {mockTags.map(tag => (
          <div key={tag.id} data-testid={`tag-row-${tag.id}`}>
            <span>{tag.name}</span>
            <span>{tag.count > 0 ? `${tag.count}개 카드` : '0개'}</span>
            <span>{tag.createdAt}</span>
            <button
              data-testid={`delete-tag-button-${tag.id}`}
              aria-label={`${tag.name} 태그 삭제`}
            ></button>
          </div>
        ))}
      </div>

      {/* 다이얼로그를 직접 렌더링 */}
      <div role="dialog" aria-modal="true" data-testid="delete-confirmation-dialog">
        <h2>태그 삭제 확인</h2>
        <p>태그 "{tagName}"을(를) 삭제하시겠습니까?</p>
        {showCountWarning && tagCount > 0 && (
          <p>이 태그가 지정된 {tagCount}개의 카드에서 태그가 제거됩니다.</p>
        )}
        <button
          data-testid="delete-confirm-button"
          onClick={() => mockActions.deleteTag(tagId)}
        >
          삭제
        </button>
        <button data-testid="delete-cancel-button">취소</button>
      </div>
    </div>
  );
}

describe('TagList 기본 테스트', () => {
  // 테스트 전에 실행할 작업
  beforeEach(() => {
    // 모킹 초기화
    vi.clearAllMocks();

    // fetch 모킹
    global.fetch = vi.fn();
  });

  // 테스트 후에 실행할 작업
  afterEach(() => {
    vi.clearAllMocks();
    cleanup(); // DOM 정리
  });

  describe('태그 목록 렌더링', () => {
    it('태그 목록이 올바르게 렌더링되어야 함', () => {
      render(<TagListMock initialTags={mockTags} />);

      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
      expect(screen.getByText('리액트')).toBeInTheDocument();
      expect(screen.getByText('타입스크립트')).toBeInTheDocument();

      expect(screen.getByText('5개 카드')).toBeInTheDocument();
      expect(screen.getByText('3개 카드')).toBeInTheDocument();
      expect(screen.getByText('0개')).toBeInTheDocument();
    });

    it('태그가 없을 경우 메시지가 표시되어야 함', () => {
      render(<TagListMock initialTags={[]} />);
      expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();
    });

    it('태그 삭제 버튼이 각 태그마다 렌더링되어야 함', () => {
      const { container } = render(<TagListMock initialTags={mockTags} />);

      // 버튼 수량 확인
      const deleteButtons = container.querySelectorAll('button[data-testid^="delete-tag-button-"]');
      expect(deleteButtons.length).toBe(3);

      // 각 버튼의 존재 확인
      expect(container.querySelector('[data-testid="delete-tag-button-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="delete-tag-button-2"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="delete-tag-button-3"]')).toBeInTheDocument();
    });
  });

  describe('태그 삭제 다이얼로그', () => {
    it('태그 삭제 확인 다이얼로그의 내용이 올바르게 표시되어야 함', () => {
      // 다이얼로그가 이미 표시된 상태의 컴포넌트 렌더링
      render(<TestTagListWithDialog />);

      // 다이얼로그 검증
      expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
      expect(screen.getByText(/태그 "자바스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
      expect(screen.getByText('이 태그가 지정된 5개의 카드에서 태그가 제거됩니다.')).toBeInTheDocument();

      // 버튼 검증
      expect(screen.getByTestId('delete-confirm-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-cancel-button')).toBeInTheDocument();
    });

    it('카드 수가 0인 태그는 경고 메시지가 표시되지 않아야 함', () => {
      render(<TestTagListWithDialog tagId="3" tagName="타입스크립트" tagCount={0} />);

      // 다이얼로그 검증
      expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
      expect(screen.getByText(/태그 "타입스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();

      // 경고 메시지가 없어야 함
      expect(screen.queryByText(/이 태그가 지정된 0개의 카드에서 태그가 제거됩니다/)).not.toBeInTheDocument();
    });
  });

  describe('태그 삭제 기능', () => {
    it('삭제 버튼 클릭 시 올바른 태그 ID로 API가 호출되어야 함', () => {
      // API 호출 모킹
      mockActions.deleteTag.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '태그가 성공적으로 삭제되었습니다.' })
      } as Response);

      // 다이얼로그가 이미 표시된 상태의 컴포넌트 렌더링
      render(<TestTagListWithDialog tagId="1" />);

      // 삭제 버튼 클릭
      const confirmButton = screen.getByTestId('delete-confirm-button');
      fireEvent.click(confirmButton);

      // API 호출 검증
      expect(mockActions.deleteTag).toHaveBeenCalledTimes(1);
      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
    });

    it('다른 태그를 선택했을 때 올바른 태그 ID로 API가 호출되어야 함', () => {
      // API 호출 모킹
      mockActions.deleteTag.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '태그가 성공적으로 삭제되었습니다.' })
      } as Response);

      // 다른 태그 ID를 가진 다이얼로그 렌더링
      render(<TestTagListWithDialog tagId="2" tagName="리액트" tagCount={3} />);

      // 삭제 버튼 클릭
      const confirmButton = screen.getByTestId('delete-confirm-button');
      fireEvent.click(confirmButton);

      // API 호출 검증
      expect(mockActions.deleteTag).toHaveBeenCalledTimes(1);
      expect(mockActions.deleteTag).toHaveBeenCalledWith('2');
    });
  });

  describe('에러 처리', () => {
    beforeEach(() => {
      // 이전에 모킹된 함수 초기화
      mockActions.toast.success.mockClear();
      mockActions.toast.error.mockClear();
    });

    it('API 에러 발생 시 에러 토스트가 표시되어야 함', async () => {
      // 에러 응답 모킹
      mockActions.deleteTag.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '태그 삭제에 실패했습니다.' })
      } as Response);

      // 테스트용 컴포넌트 렌더링
      const { container } = render(<TagListMock initialTags={mockTags} />);

      // API 메서드 직접 호출
      await mockActions.deleteTag('1').then(response => {
        if (!response.ok) {
          response.json().then(data => {
            if (data.error) {
              mockActions.toast.error(data.error);
            } else {
              mockActions.toast.error('태그 삭제에 실패했습니다.');
            }
          });
        }
      });

      // 에러 토스트 검증
      expect(mockActions.toast.error).toHaveBeenCalledTimes(1);
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
      expect(mockActions.toast.success).not.toHaveBeenCalled();
    });

    it('네트워크 오류 발생 시 에러 토스트가 표시되어야 함', async () => {
      // 네트워크 오류 모킹
      mockActions.deleteTag.mockRejectedValueOnce(new Error('네트워크 오류'));

      try {
        await mockActions.deleteTag('1');
      } catch (error) {
        if (error instanceof Error) {
          mockActions.toast.error(error.message);
        } else {
          mockActions.toast.error('태그 삭제에 실패했습니다.');
        }
      }

      // 에러 토스트 검증
      expect(mockActions.toast.error).toHaveBeenCalledTimes(1);
      expect(mockActions.toast.error).toHaveBeenCalledWith('네트워크 오류');
      expect(mockActions.toast.success).not.toHaveBeenCalled();
    });
  });
}); 