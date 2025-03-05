import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCardButton from './CreateCardButton';
import { toast } from 'sonner';
import { vi, describe, test, expect, beforeEach, afterAll, beforeAll, afterEach } from 'vitest';

// 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// fetch 모킹
global.fetch = vi.fn();

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

describe('CreateCardButton 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 성공적인 응답을 기본으로 설정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    // 각 테스트 후에 정리
    cleanup(); // 명시적으로 cleanup 먼저 호출
    vi.resetAllMocks();
    document.body.innerHTML = "";
  });

  test('버튼 클릭 시 모달이 열린다', () => {
    render(<CreateCardButton />);
    
    // 버튼 클릭 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 모달이 열렸는지 확인 (제목과 입력 필드 확인)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('내용')).toBeInTheDocument();
  });

  test('유효한 데이터로 카드를 생성한다', async () => {
    const mockNewCard = {
      id: 'new-card-id',
      title: '새 카드 제목',
      content: '새 카드 내용',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      userId: TEST_USER_ID,
    };

    // fetch 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNewCard,
    });

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '새 카드 제목',
          content: '새 카드 내용',
          userId: 'ab2473c2-21b5-4196-9562-3b720d80d77f',
          tags: []
        })
      });
    });
    
    // 성공 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
    
    // 페이지 새로고침 확인
    expect(mockReload).toHaveBeenCalled();
  });

  test('빈 제목과 내용으로 제출 시 유효성 검사 오류를 표시한다', async () => {
    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 제출 버튼 클릭 (제목과 내용 비워둠)
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
    });
    
    // API 호출이 되지 않았는지 확인
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('API 오류 발생 시 에러 메시지를 표시한다', async () => {
    // API 오류 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'response.json is not a function' })
    });

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('response.json is not a function');
    });
    
    // console.error가 호출되었는지 확인
    expect(console.error).toHaveBeenCalled();
  });

  test('네트워크 오류 발생 시 에러 메시지를 표시한다', async () => {
    // 네트워크 오류 모킹
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CreateCardButton />);
    
    // 버튼 클릭하여 모달 열기 (role을 사용하여 버튼 선택)
    fireEvent.click(screen.getByRole('button', { name: '새 카드 만들기' }));
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 카드 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '새 카드 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
    
    // console.error가 호출되었는지 확인
    expect(console.error).toHaveBeenCalled();
  });

  test('카드 생성 다이얼로그가 열리고 닫힙니다', async () => {
    const user = userEvent.setup();
    
    render(<CreateCardButton />);
    
    // 버튼 클릭 대신 직접 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 다이얼로그가 열렸는지 확인
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    
    // 실제 닫기 버튼 클릭 - "Close" 텍스트를 가진 버튼을 찾아 클릭합니다
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    
    // 다이얼로그가 닫혔는지 확인 (비동기적으로 진행될 수 있음)
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test('제목과 내용 입력이 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 제목 입력
    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } });
    expect(titleInput).toHaveValue('테스트 제목');
    
    // 내용 입력
    const contentInput = screen.getByLabelText('내용');
    fireEvent.change(contentInput, { target: { value: '테스트 내용' } });
    expect(contentInput).toHaveValue('테스트 내용');
  });

  test('태그 입력 및 처리가 올바르게 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '태그1' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#태그1')).toBeInTheDocument();
    
    // 태그 입력 필드가 비워졌는지 확인
    expect(tagInput).toHaveValue('');
    
    // 쉼표로 태그 구분하여 입력
    fireEvent.change(tagInput, { target: { value: '태그2, 태그3' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 두 개의 태그가 모두 추가되었는지 확인
    expect(screen.getByText('#태그2')).toBeInTheDocument();
    expect(screen.getByText('#태그3')).toBeInTheDocument();
  });

  test('태그 삭제가 작동합니다', () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 추가
    const tagInput = screen.getByLabelText('태그');
    fireEvent.change(tagInput, { target: { value: '삭제태그' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#삭제태그')).toBeInTheDocument();
    
    // 태그 삭제 버튼 클릭 - SVG나 아이콘을 찾는 대신 버튼 내부의 텍스트를 포함한 요소를 찾습니다.
    const tagContainer = screen.getByText('#삭제태그').closest('.flex');
    if (tagContainer) {
      const deleteButton = tagContainer.querySelector('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    }
    
    // 태그가 삭제되었는지 확인
    expect(screen.queryByText('#삭제태그')).not.toBeInTheDocument();
  });

  test('IME 조합 중 키 입력 이벤트 처리가 올바르게 작동합니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 미리 존재하는 태그 수 확인 (없을 수 있음)
    const getTagCount = () => screen.queryAllByText(/#\S+/).length;
    const initialTagCount = getTagCount();
    
    // IME 조합 시작
    fireEvent.compositionStart(tagInput);
    
    // IME 조합 중 Enter 키를 테스트하기 위해, 한글 입력 상태를 모의
    // 조합 중 태그가 추가되지 않도록 함
    fireEvent.change(tagInput, { target: { value: '한글태그' } });
    
    // 조합 중 Enter 키 입력 - IME 조합 중에는 이벤트가 무시되어야 함
    // 직접 상태를 확인하는 대신 태그 개수를 확인
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 조합이 끝나지 않았으므로 태그 개수는 변하지 않아야 함
    expect(getTagCount()).toBe(initialTagCount);
    
    // IME 조합 종료
    fireEvent.compositionEnd(tagInput);
    
    // 조합 종료 후 Enter 키 입력
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 이제 태그가 추가되었는지 확인
    expect(screen.getByText('#한글태그')).toBeInTheDocument();
    expect(getTagCount()).toBe(initialTagCount + 1);
  });

  test('IME 조합 중 Enter 및 콤마 외의 키 입력은 무시됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // IME 조합 시작
    fireEvent.compositionStart(tagInput);
    
    // Enter 키가 아닌 다른 키 입력 (Tab)
    fireEvent.change(tagInput, { target: { value: '테스트태그' } });
    fireEvent.keyDown(tagInput, { key: 'Tab' });
    
    // 태그가 추가되지 않아야 함
    expect(screen.queryByText('#테스트태그')).not.toBeInTheDocument();
    
    // IME 조합 종료
    fireEvent.compositionEnd(tagInput);
  });

  test('카드가 성공적으로 생성됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 제목, 내용, 태그 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '성공 테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '성공 테스트 내용' } });
    
    const tagInput = screen.getByLabelText('태그');
    fireEvent.change(tagInput, { target: { value: '성공태그' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 태그가 추가되었는지 확인
    expect(screen.getByText('#성공태그')).toBeInTheDocument();
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // API 호출 확인
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // 성공 메시지와 페이지 리로드 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다.');
    expect(mockReload).toHaveBeenCalled();
  });

  test('빈 제목이나 내용으로 제출하면 오류가 표시됩니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 내용만 입력 (제목은 비움)
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '내용만 있음' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 오류 메시지 확인
    expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
    
    // API 호출이 되지 않았는지 확인
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('빈 태그는 추가되지 않습니다', async () => {
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 태그 입력란
    const tagInput = screen.getByLabelText('태그');
    
    // 1. 완전히 빈 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 화면에 표시된 태그가 없는지 확인
    expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
    
    // 2. 공백만 있는 태그 입력 후 Enter 키 입력
    fireEvent.change(tagInput, { target: { value: '   ' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 화면에 표시된 태그가 없는지 다시 확인
    expect(screen.queryByText(/#\S+/)).not.toBeInTheDocument();
    
    // 3. 콤마로 구분된 태그 중 일부가 빈 경우
    fireEvent.change(tagInput, { target: { value: '유효태그,,  ,' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 유효한 태그만 추가되었는지 확인
    expect(screen.getByText('#유효태그')).toBeInTheDocument();
    // 빈 태그는 추가되지 않아야 함
    const allTags = screen.getAllByText(/#\S+/);
    expect(allTags.length).toBe(1); // 유효태그 하나만 있어야 함
  });

  test('API 응답에 에러 메시지가 없을 때 기본 오류 메시지를 사용합니다', async () => {
    // error 필드가 없는 API 오류 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'failed' }) // error 필드 없음
    });
    
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 필수 필드 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 기본 오류 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
    });
  });
  
  test('Error 객체가 아닌 예외 발생 시 기본 오류 메시지가 표시됩니다', async () => {
    // Error 객체가 아닌 예외 발생 모킹
    (global.fetch as any).mockRejectedValueOnce('일반 문자열 에러');
    
    render(<CreateCardButton />);
    
    // 다이얼로그 열기
    const button = screen.getByRole("button", { name: "새 카드 만들기" });
    fireEvent.click(button);
    
    // 필수 필드 입력
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '테스트 내용' } });
    
    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '생성하기' }));
    
    // 기본 오류 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다.');
    });
  });
}); 