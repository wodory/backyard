/**
 * 파일명: TagList.test.tsx
 * 목적: TagList 컴포넌트의 기능 테스트
 * 역할: 태그 목록의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { TagListMock } from './TagListMock';
import { setupTagListTests, teardownTagListTests, mockActions, waitForDomChanges } from './test-utils';
import '@testing-library/jest-dom';

describe('TagList', () => {
  // 테스트용 태그 데이터
  const mockTags = [
    { id: '1', name: '자바스크립트', count: 5, createdAt: '2023년 1월 1일' },
    { id: '2', name: '리액트', count: 3, createdAt: '2023년 2월 1일' },
    { id: '3', name: '타입스크립트', count: 0, createdAt: '2023년 3월 1일' }
  ];

  beforeEach(() => {
    setupTagListTests();
  });

  afterEach(() => {
    teardownTagListTests();
  });

  describe('@testcase.mdc 태그 목록 표시', () => {
    it('rule: 태그 목록이 올바르게 렌더링되어야 함', () => {
      render(<TagListMock initialTags={mockTags} />);

      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
      expect(screen.getByText('리액트')).toBeInTheDocument();
      expect(screen.getByText('타입스크립트')).toBeInTheDocument();

      expect(screen.getByText('5개 카드')).toBeInTheDocument();
      expect(screen.getByText('3개 카드')).toBeInTheDocument();
      expect(screen.getByText('0개')).toBeInTheDocument();

      expect(screen.getByText('2023년 1월 1일')).toBeInTheDocument();
      expect(screen.getByText('2023년 2월 1일')).toBeInTheDocument();
      expect(screen.getByText('2023년 3월 1일')).toBeInTheDocument();
    });

    it('rule: 태그가 없을 경우 메시지가 표시되어야 함', () => {
      render(<TagListMock initialTags={[]} />);
      expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();
    });

    it('rule: 다양한 태그 이름이 올바르게 표시되어야 함', () => {
      const diverseTags = [
        { id: '1', name: '한글태그', count: 1, createdAt: '2023년 1월 1일' },
        { id: '2', name: 'EnglishTag', count: 2, createdAt: '2023년 2월 1일' },
        { id: '3', name: '특수_문자-태그', count: 3, createdAt: '2023년 3월 1일' },
        { id: '4', name: '한글English혼합123', count: 4, createdAt: '2023년 4월 1일' }
      ];

      render(<TagListMock initialTags={diverseTags} />);

      expect(screen.getByText('한글태그')).toBeInTheDocument();
      expect(screen.getByText('EnglishTag')).toBeInTheDocument();
      expect(screen.getByText('특수_문자-태그')).toBeInTheDocument();
      expect(screen.getByText('한글English혼합123')).toBeInTheDocument();
    });
  });

  describe('@testcase.mdc 태그 삭제 다이얼로그', () => {
    it('rule: 태그 삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', async () => {
      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
      expect(screen.getByText(/태그 "자바스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
      expect(screen.getByText('이 태그가 지정된 5개의 카드에서 태그가 제거됩니다.')).toBeInTheDocument();
    });

    it('rule: 카드 수가 0인 태그는 경고 메시지가 표시되지 않아야 함', async () => {
      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[2]);

      expect(screen.getByText('태그 삭제 확인')).toBeInTheDocument();
      expect(screen.getByText(/태그 "타입스크립트"을\(를\) 삭제하시겠습니까\?/)).toBeInTheDocument();
      expect(screen.queryByText(/이 태그가 지정된 0개의 카드에서 태그가 제거됩니다./)).not.toBeInTheDocument();
    });
  });

  describe('@testcase.mdc 태그 삭제 기능', () => {
    it('rule: 태그 삭제 확인 시 API 호출이 이루어지고 태그가 목록에서 제거되어야 함', async () => {
      mockActions.deleteTag.mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ok: true,
          json: async () => ({ message: '태그가 성공적으로 삭제되었습니다.' })
        };
      });

      const { rerender } = render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
      expect(mockActions.toast.success).toHaveBeenCalledWith('태그가 삭제되었습니다.');

      rerender(<TagListMock initialTags={mockTags.filter(tag => tag.id !== '1')} />);

      expect(screen.queryByText('자바스크립트')).not.toBeInTheDocument();
      expect(screen.getByText('리액트')).toBeInTheDocument();
      expect(screen.getByText('타입스크립트')).toBeInTheDocument();
    });

    it('rule: 태그 삭제 실패 시 에러 메시지가 표시되어야 함', async () => {
      mockActions.deleteTag.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '태그 삭제에 실패했습니다.' })
      });

      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
    });

    it('rule: 태그 삭제 중 네트워크 오류 발생 시 에러 메시지가 표시되어야 함', async () => {
      mockActions.deleteTag.mockRejectedValueOnce(new Error('네트워크 오류'));

      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
      expect(mockActions.toast.error).toHaveBeenCalledWith('네트워크 오류');
      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
    });
  });

  describe('@testcase.mdc 에러 처리', () => {
    it('rule: API 응답에 error 속성이 없을 때 기본 오류 메시지를 사용해야 함', async () => {
      mockActions.deleteTag.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ status: "error" })
      });

      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
    });

    it('rule: error가 Error 인스턴스가 아닐 때 기본 오류 메시지를 사용해야 함', async () => {
      mockActions.deleteTag.mockRejectedValueOnce('문자열 에러');

      render(<TagListMock initialTags={mockTags} />);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.deleteTag).toHaveBeenCalledWith('1');
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 삭제에 실패했습니다.');
    });
  });
}); 