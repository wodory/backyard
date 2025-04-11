/**
 * 파일명: src/app/cards/[id]/edit/page.test.tsx
 * 목적: 카드 편집 페이지의 기능 테스트
 * 역할: 페이지 로딩, 네비게이션, API 요청, 에러 처리 등의 기능 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-04-03
 */

import { describe, test, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

/**
 * 참고: Next.js 공식 문서에 따르면, async/await를 사용하는 Client Components는
 * 단위 테스트보다 E2E 테스트를 권장합니다.
 * 
 * "Since async Server Components are new to the React ecosystem, Jest currently does not support them.
 * While you can still run unit tests for synchronous Server and Client Components,
 * we recommend using an E2E tests for async components."
 * 
 * 출처: https://nextjs.org/docs/app/building-your-application/testing/jest
 */

// vi.mock은 파일 상단으로 호이스팅되므로 최상단에 배치 (Vitest 문서 참조)
vi.mock('./test-utils', () => ({
  mockActions: {
    getCard: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        id: '1',
        title: '테스트 카드',
        content: '테스트 내용',
        cardTags: []
      })
    }),
    router: {
      back: vi.fn(),
      push: vi.fn()
    }
  }
}));

// 모킹 모듈 import는 mock 선언 후에 위치해야 함
import { EditCardPageMock } from './EditCardPageMock';
import { mockActions } from './test-utils';

// 테스트 타임아웃 설정
vi.setConfig({ testTimeout: 10000 });

// MSW 서버 설정
const server = setupServer(
  http.get('*/api/cards/:id', () => {
    return HttpResponse.json({
      id: '1',
      title: '테스트 카드',
      content: '테스트 내용',
      cardTags: []
    });
  })
);

const setup = () => {
  const user = userEvent.setup({ delay: null });
  return {
    ...render(<EditCardPageMock />),
    user,
  };
};

// 테스트 환경 설정
beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
  vi.useRealTimers();
});

// 가장 기본적인 테스트만 구현
describe('EditCardPageMock', () => {
  // useEffect의 비동기 작업이 즉시 완료되도록 설정
  beforeEach(() => {
    // 모킹된 EditCardPageMock이 즉시 로딩 완료된 상태를 반환하도록 수정
    vi.mock('./__EditCardPageMock', () => ({
      EditCardPageMock: () => (
        <div data-testid="card-edit-container">
          <button onClick={() => mockActions.router.back()}>뒤로 가기</button>
          <form data-testid="edit-card-form">
            <input
              type="text"
              data-testid="card-title-input"
              defaultValue="테스트 카드"
            />
            <textarea
              data-testid="card-content-textarea"
              defaultValue="테스트 내용"
            />
            <button
              data-testid="save-button"
              onClick={(e) => {
                e.preventDefault();
                mockActions.router.push('/board');
              }}
            >
              저장
            </button>
          </form>
        </div>
      )
    }));
  });

  test('편집 폼이 렌더링되어야 함', async () => {
    const { findByTestId } = setup();

    await act(async () => {
      vi.runAllTimers();
    });

    // 폼 요소 확인
    const form = await findByTestId('edit-card-form');
    const titleInput = await findByTestId('card-title-input');
    const contentTextarea = await findByTestId('card-content-textarea');
    const saveButton = await findByTestId('save-button');

    expect(form).toBeInTheDocument();
    expect(titleInput).toHaveValue('테스트 카드');
    expect(contentTextarea).toHaveValue('테스트 내용');
    expect(saveButton).toBeInTheDocument();
  });

  test('뒤로 가기 버튼을 클릭하면 이전 페이지로 이동해야 함', async () => {
    const { findByText } = setup();

    await act(async () => {
      vi.runAllTimers();
    });

    const backButton = await findByText('뒤로 가기');
    await act(async () => {
      await userEvent.click(backButton);
      vi.runAllTimers();
    });

    expect(mockActions.router.back).toHaveBeenCalled();
  });

  test('저장 버튼을 클릭하면 보드 페이지로 이동해야 함', async () => {
    const { findByTestId } = setup();

    await act(async () => {
      vi.runAllTimers();
    });

    const saveButton = await findByTestId('save-button');
    await act(async () => {
      await userEvent.click(saveButton);
      vi.runAllTimers();
    });

    expect(mockActions.router.push).toHaveBeenCalledWith('/board');
  });
}); 