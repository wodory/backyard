/**
 * 파일명: TagForm.test.tsx
 * 목적: TagForm 컴포넌트의 기능 테스트
 * 역할: 태그 생성 폼의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TagFormMock } from './TagFormMock';
import { mockActions, waitForDomChanges, setupTagFormTests, teardownTagFormTests } from './test-utils';
import { act } from 'react-dom/test-utils';

const setup = () => {
  const user = userEvent.setup({ delay: null });
  return {
    ...render(<TagFormMock />),
    user,
  };
};

describe('TagForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setupTagFormTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    teardownTagFormTests();
  });

  describe('태그 입력 기능', () => {
    test('rule: 태그 이름을 입력할 수 있어야 함', async () => {
      const { findByRole } = setup();
      const input = await findByRole('textbox');

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(input).toHaveValue('새로운 태그');
    });

    test('rule: IME 입력이 올바르게 처리되어야 함', async () => {
      const { findByRole } = setup();
      const input = (await findByRole('textbox')) as HTMLInputElement;

      await act(async () => {
        input.focus();
        input.dispatchEvent(new CompositionEvent('compositionstart'));
        input.value = '한글';
        input.dispatchEvent(new CompositionEvent('compositionend'));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(input).toHaveValue('한글');
    });
  });

  describe('태그 생성 기능', () => {
    test('rule: 빈 태그 이름으로 제출하면 오류가 표시되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 이름을 입력해주세요.');
    });

    test('rule: 태그가 성공적으로 생성되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');
      const input = await findByRole('textbox');

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(mockActions.createTag).toHaveBeenCalledWith('새로운 태그');
      expect(mockActions.toast.success).toHaveBeenCalledWith('태그가 생성되었습니다.');
      expect(mockActions.reload).toHaveBeenCalled();
      expect(input).toHaveValue('');
    });

    test('rule: 제출 중에는 버튼이 비활성화되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');
      const input = await findByRole('textbox');

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      let resolveCreateTag: (value: Response) => void;
      const createTagPromise = new Promise<Response>((resolve) => {
        resolveCreateTag = resolve;
      });

      mockActions.createTag.mockImplementationOnce(() => createTagPromise);

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(submitButton).toHaveAttribute('disabled');
      expect(submitButton).toHaveTextContent('생성 중...');

      await act(async () => {
        resolveCreateTag(new Response(JSON.stringify({ ok: true })));
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(submitButton).not.toHaveAttribute('disabled');
      expect(submitButton).toHaveTextContent('태그 생성');
    });
  });

  describe('에러 처리', () => {
    test('rule: API 오류 시 에러 메시지가 표시되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');
      const input = await findByRole('textbox');

      let rejectCreateTag: (reason: any) => void;
      const createTagPromise = new Promise<Response>((_, reject) => {
        rejectCreateTag = reject;
      });

      mockActions.createTag.mockImplementationOnce(() => createTagPromise);

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await act(async () => {
        rejectCreateTag(new Error('API 오류'));
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(mockActions.toast.error).toHaveBeenCalledWith('API 오류');
    });

    test('rule: Error 객체의 message가 토스트 메시지로 표시되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');
      const input = await findByRole('textbox');

      mockActions.createTag.mockImplementationOnce(() => {
        throw new Error('커스텀 에러 메시지');
      });

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(mockActions.toast.error).toHaveBeenCalledWith('커스텀 에러 메시지');
    });

    test('rule: Non-Error 객체가 전달되면 기본 에러 메시지가 표시되어야 함', async () => {
      const { findByRole } = setup();
      const submitButton = await findByRole('button');
      const input = await findByRole('textbox');

      mockActions.createTag.mockImplementationOnce(() => {
        throw '예상치 못한 에러';
      });

      await act(async () => {
        await userEvent.type(input, '새로운 태그');
        vi.runAllTimers();
      });

      await act(async () => {
        await userEvent.click(submitButton);
        vi.runAllTimers();
      });

      await waitForDomChanges();
      expect(mockActions.toast.error).toHaveBeenCalledWith('태그 생성에 실패했습니다.');
    });
  });
}); 