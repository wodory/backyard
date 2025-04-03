/**
 * 파일명: CreateCardButton.test.tsx
 * 목적: CreateCardButton 컴포넌트 테스트
 * 역할: 카드 생성 버튼 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCardButton from './CreateCardButton';
import { toast } from 'sonner';
import { vi, describe, test, expect, beforeEach, afterAll, beforeAll, afterEach } from 'vitest';
import { useRouter } from 'next/navigation';

// TipTap 에디터 모킹
vi.mock('@/components/editor/TiptapEditor', () => ({
  default: ({ onUpdate }: { onUpdate: (content: string) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onUpdate) {
        onUpdate(e.target.value);
      }
    };

    return (
      <div data-testid="tiptap-editor">
        <textarea
          data-testid="tiptap-content"
          onChange={handleChange}
          aria-label="내용"
        />
      </div>
    );
  }
}));

// toast 모킹
vi.mock('sonner', () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
    }
  };
});

// fetch 모킹
const mockFetch = vi.fn();

// 먼저 기본적으로 /api/users/first 호출에 대한 응답을 모킹합니다
// 이는 모든 테스트에서 CreateCardButton이 첫 번째로 이 API를 호출하는 경우에 대비합니다
const mockUserResponse = {
  id: 'user-id',
  name: 'Test User'
};

// window.location.reload 모킹
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
});

// console.error 모킹
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// 테스트 사용자 ID 상수 (CreateCardButton.tsx와 동일한 값)
const TEST_USER_ID = "ab2473c2-21b5-4196-9562-3b720d80d77f";

// 모킹
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// 비동기 작업의 안전한 완료를 위한 도우미 함수
const waitForDomChanges = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

describe('CreateCardButton 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (useRouter as any).mockReturnValue({ refresh: mockReload });

    // 모킹 초기화
    global.fetch = mockFetch;
    mockFetch.mockReset();

    // 기본적으로 /api/users/first API 호출은 항상 성공으로 처리
    mockFetch.mockImplementation(async (url: string) => {
      if (url === '/api/users/first') {
        return {
          ok: true,
          json: async () => mockUserResponse
        };
      }

      // 다른 URL은 각 테스트에서 별도로 모킹
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: '찾을 수 없음' })
      };
    });
  });

  afterEach(async () => {
    vi.runAllTimers();
    await waitForDomChanges();
    cleanup();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test('버튼 클릭 시 모달이 열린다', async () => {
    const { findByRole } = render(<CreateCardButton />);

    // 버튼 클릭
    const button = await findByRole('button', { name: '새 카드 만들기' });
    await act(async () => {
      await userEvent.click(button);
      vi.runAllTimers();
    });

    // 모달이 열렸는지 확인
    const dialog = await findByRole('dialog');
    const titleInput = await findByRole('textbox', { name: '제목' });
    const contentInput = await screen.findByLabelText('내용');

    expect(dialog).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    expect(contentInput).toBeInTheDocument();
  });

  test('빈 제목이나 내용으로 제출하면 오류가 표시됩니다', async () => {
    const { findByRole } = render(<CreateCardButton />);

    // 버튼 클릭하여 모달 열기
    const button = await findByRole('button', { name: '새 카드 만들기' });
    await act(async () => {
      await userEvent.click(button);
      vi.runAllTimers();
    });

    // 제출 버튼 클릭 (제목과 내용 비워둠)
    const submitButton = await findByRole('button', { name: '생성하기' });
    await act(async () => {
      await userEvent.click(submitButton);
      vi.runAllTimers();
    });

    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요');
    });

    // API 호출 확인
    const cardApiCalls = mockFetch.mock.calls.filter(call => call[0] === '/api/cards');
    expect(cardApiCalls.length).toBe(0);
  });

  test('카드 생성 다이얼로그가 열리고 닫힙니다', async () => {
    const { findByRole } = render(<CreateCardButton />);

    // 버튼 클릭하여 모달 열기
    const button = await findByRole('button', { name: '새 카드 만들기' });
    await act(async () => {
      await userEvent.click(button);
      vi.runAllTimers();
    });

    // 다이얼로그가 열렸는지 확인
    const dialog = await findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // 닫기 버튼 클릭
    const closeButton = await findByRole('button', { name: 'Close' });
    await act(async () => {
      await userEvent.click(closeButton);
      vi.runAllTimers();
    });

    // 다이얼로그가 닫혔는지 확인
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('제목과 내용 입력이 작동합니다', async () => {
    const { findByRole, findByLabelText } = render(<CreateCardButton />);

    // 다이얼로그 열기
    const button = await findByRole('button', { name: '새 카드 만들기' });
    await act(async () => {
      await userEvent.click(button);
      vi.runAllTimers();
    });

    // 제목 입력
    const titleInput = await findByLabelText('제목');
    await act(async () => {
      await userEvent.type(titleInput, '테스트 제목');
      vi.runAllTimers();
    });

    // 내용 입력
    const contentInput = await screen.findByTestId('tiptap-content');
    await act(async () => {
      await userEvent.type(contentInput, '테스트 내용');
      vi.runAllTimers();
    });

    // 입력값 확인
    await waitFor(() => {
      expect(titleInput).toHaveValue('테스트 제목');
      expect(contentInput).toHaveValue('테스트 내용');
    });
  });

  it('태그는 중복 추가되지 않습니다', async () => {
    const { getByLabelText, findByLabelText } = render(<CreateCardButton />);
    const openButton = screen.getByRole('button', { name: '새 카드 만들기' });
    await userEvent.click(openButton);

    const tagInput = await findByLabelText('태그');

    // 첫 번째 태그 입력
    await act(async () => {
      await userEvent.type(tagInput, '#태그');
      await userEvent.keyboard('{Enter}');
      vi.runAllTimers();
    });

    // 입력란이 비워졌는지 확인
    await waitFor(() => {
      expect(tagInput).toHaveValue('');
    }, { timeout: 1000 });

    // 같은 태그 다시 입력
    await act(async () => {
      await userEvent.type(tagInput, '#태그');
      await userEvent.keyboard('{Enter}');
      vi.runAllTimers();
    });

    // 입력란이 비워졌는지 다시 확인
    await waitFor(() => {
      expect(tagInput).toHaveValue('');
    }, { timeout: 1000 });

    // 태그 목록에는 하나만 있어야 함
    const tags = screen.getAllByText('#태그');
    expect(tags).toHaveLength(1);
  });

  test('필수 필드가 비어있을 때 오류 메시지를 표시해야 함', async () => {
    const { findByRole, findByLabelText } = render(<CreateCardButton />);

    // 다이얼로그 열기
    const button = await findByRole('button', { name: '새 카드 만들기' });
    await act(async () => {
      await userEvent.click(button);
      vi.runAllTimers();
    });

    // 제목만 입력
    const titleInput = await findByLabelText('제목');
    await act(async () => {
      await userEvent.type(titleInput, '제목만 있음');
      vi.runAllTimers();
    });

    // 제출 버튼 클릭
    const submitButton = await findByRole('button', { name: '생성하기' });
    await act(async () => {
      await userEvent.click(submitButton);
      vi.runAllTimers();
    });

    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요');
    });
  });

  // 스킵된 테스트들은 동일한 패턴으로 수정하면 됩니다.
  // 각 테스트에서 act로 상태 변경을 감싸고, waitFor로 결과를 확인하는 방식을 사용합니다.
}); 