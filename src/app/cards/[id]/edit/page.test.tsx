/**
 * 파일명: page.test.tsx
 * 목적: 카드 편집 페이지 컴포넌트 테스트
 * 역할: 카드 편집 페이지의 다양한 상태와 기능을 테스트
 * 작성일: 2024-03-31
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { EditCardPageMock } from './EditCardPageMock';
import { setupEditCardPageTests, teardownEditCardPageTests, mockActions, waitForDomChanges } from './test-utils';

describe('EditCardPage', () => {
  beforeEach(() => {
    setupEditCardPageTests();
  });

  afterEach(() => {
    teardownEditCardPageTests();
  });

  describe('@testcase.mdc 페이지 로딩 상태', () => {
    it('rule: 초기 로딩 상태가 표시되어야 함', async () => {
      let resolvePromise: Function;
      mockActions.getCard.mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      render(<EditCardPageMock />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('rule: 카드 데이터 로드 후 편집 폼이 표시되어야 함', async () => {
      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 카드')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 내용')).toBeInTheDocument();
    });
  });

  describe('@testcase.mdc 네비게이션', () => {
    it('rule: 뒤로 가기 버튼 클릭 시 이전 페이지로 이동해야 함', async () => {
      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
      expect(mockActions.router.back).toHaveBeenCalled();
    });

    it('rule: 저장 버튼 클릭 시 /board로 리다이렉트되어야 함', async () => {
      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      fireEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(mockActions.router.push).toHaveBeenCalledWith('/board');
    });
  });

  describe('@testcase.mdc API 요청', () => {
    it('rule: 올바른 카드 ID로 데이터를 요청해야 함', async () => {
      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.getCard).toHaveBeenCalledWith('test-card-123');
    });
  });

  describe('@testcase.mdc 에러 처리', () => {
    it('rule: 카드를 찾을 수 없을 때 에러 메시지를 표시해야 함', async () => {
      mockActions.getCard.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: '카드를 찾을 수 없습니다.' })
      });

      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(screen.getByText('카드를 찾을 수 없습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '돌아가기' })).toBeInTheDocument();
    });

    it('rule: 네트워크 오류 발생 시 에러 메시지를 표시해야 함', async () => {
      mockActions.getCard.mockRejectedValueOnce(new Error('네트워크 오류'));

      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
    });

    it('rule: 에러 상태에서 돌아가기 버튼이 작동해야 함', async () => {
      mockActions.getCard.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: '카드를 찾을 수 없습니다.' })
      });

      render(<EditCardPageMock />);

      await act(async () => {
        await waitForDomChanges();
      });

      fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));
      expect(mockActions.router.back).toHaveBeenCalled();
    });
  });
}); 