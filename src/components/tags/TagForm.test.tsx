/**
 * 파일명: TagForm.test.tsx
 * 목적: TagForm 컴포넌트의 기능 테스트
 * 역할: 태그 생성 폼의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TagFormMock } from './TagFormMock';
import { setupTagFormTests, teardownTagFormTests, mockActions, waitForDomChanges } from './test-utils';
import '@testing-library/jest-dom';

describe('TagForm', () => {
  beforeEach(() => {
    setupTagFormTests();
  });

  afterEach(() => {
    teardownTagFormTests();
  });

  describe('@testcase.mdc 태그 입력 기능', () => {
    it('rule: 태그 이름을 입력할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');
      expect(tagInput).toHaveValue('새로운태그');
    });

    it('rule: IME 입력이 올바르게 처리되어야 함', async () => {
      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');

      fireEvent.compositionStart(tagInput);
      await user.type(tagInput, '프롬프트');
      fireEvent.compositionEnd(tagInput);

      expect(tagInput).toHaveValue('프롬프트');
    });
  });

  describe('@testcase.mdc 태그 생성 기능', () => {
    it('rule: 빈 태그 이름으로 제출하면 오류가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<TagFormMock />);

      await user.click(screen.getByRole('button', { name: '태그 생성' }));

      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 이름을 입력해주세요.');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('rule: 태그가 성공적으로 생성되어야 함', async () => {
      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');
      await user.click(screen.getByRole('button', { name: '태그 생성' }));

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.createTag).toHaveBeenCalledWith('새로운태그');
      expect(mockActions.toast.success).toHaveBeenCalledWith('태그가 생성되었습니다.');
      expect(mockActions.reload).toHaveBeenCalled();
    });

    it('rule: 제출 중에는 버튼이 비활성화되어야 함', async () => {
      mockActions.createTag.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');

      const submitButton = screen.getByRole('button', { name: '태그 생성' });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('생성 중...');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
    });
  });

  describe('@testcase.mdc 에러 처리', () => {
    it('rule: API 오류 시 에러 메시지가 표시되어야 함', async () => {
      mockActions.createTag.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '서버 오류가 발생했습니다' }),
      });

      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');
      await user.click(screen.getByRole('button', { name: '태그 생성' }));

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.toast.error).toHaveBeenCalledWith('서버 오류가 발생했습니다');
    });

    it('rule: Error 객체의 message가 토스트 메시지로 표시되어야 함', async () => {
      mockActions.createTag.mockRejectedValueOnce(new Error('네트워크 오류가 발생했습니다'));

      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');
      await user.click(screen.getByRole('button', { name: '태그 생성' }));

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.toast.error).toHaveBeenCalledWith('네트워크 오류가 발생했습니다');
    });

    it('rule: Non-Error 객체가 전달되면 기본 에러 메시지가 표시되어야 함', async () => {
      mockActions.createTag.mockRejectedValueOnce('문자열 에러');

      const user = userEvent.setup();
      render(<TagFormMock />);

      const tagInput = screen.getByLabelText('태그 이름');
      await user.type(tagInput, '새로운태그');
      await user.click(screen.getByRole('button', { name: '태그 생성' }));

      await act(async () => {
        await waitForDomChanges();
      });

      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 생성에 실패했습니다.');
    });
  });
}); 