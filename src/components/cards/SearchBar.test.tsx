import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SearchBar } from './SearchBar';
import '@testing-library/jest-dom';

// 기본 모킹 설정
const push = vi.fn();
const useRouterMock = vi.fn().mockReturnValue({ push });
const useSearchParamsMock = vi.fn().mockReturnValue({
  get: vi.fn().mockReturnValue(null)
});

vi.mock('next/navigation', () => ({
  useRouter: () => useRouterMock(),
  useSearchParams: () => useSearchParamsMock()
}));

// 실제 SearchBar 컴포넌트를 사용합니다.
describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouterMock.mockReturnValue({ push });
    useSearchParamsMock.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    });
  });

  it('올바르게 렌더링 되어야 함', () => {
    render(<SearchBar />);
    
    // 기본 요소들이 렌더링 되었는지 확인
    expect(screen.getByPlaceholderText('검색어 입력 또는 #태그 입력')).toBeInTheDocument();
    expect(screen.getByText('검색')).toBeInTheDocument();
  });
  
  it('URL에서 검색어를 가져와 입력 필드에 표시해야 함', () => {
    // URL 파라미터 모킹 설정
    useSearchParamsMock.mockReturnValue({
      get: (param: string) => param === 'q' ? '테스트쿼리' : null
    });
    
    render(<SearchBar />);
    
    // useEffect에서 URL 파라미터를 가져와 입력 필드에 설정
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    expect(inputElement).toHaveValue('테스트쿼리');
  });
  
  it('검색 버튼 클릭 시 일반 검색어로 올바른 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '일반검색어' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?q=%EC%9D%BC%EB%B0%98%EA%B2%80%EC%83%89%EC%96%B4');
  });
  
  it('태그 검색어(#으로 시작)로 검색 시 올바른 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 태그 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '#태그검색' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?tag=%ED%83%9C%EA%B7%B8%EA%B2%80%EC%83%89');
  });
  
  it('빈 검색어로 검색 시 기본 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드를 비움
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '' } });
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // 기본 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards');
  });
  
  it('#만 입력한 경우 처리를 확인', async () => {
    render(<SearchBar />);
    
    // 입력 필드에 # 만 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '#' } });
    
    // 입력 잘 되었는지 확인
    expect(inputElement).toHaveValue('#');
    
    // push 함수가 호출되지 않았는지 확인 (초기 상태)
    expect(push).not.toHaveBeenCalled();
    
    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    
    // #만 입력된 경우는 tag가 빈 문자열이 되어 라우팅이 발생하지 않음
    // SearchBar.tsx의 handleSearch 함수 내 다음 로직에 의해:
    // if (searchTerm.startsWith('#')) {
    //   const tag = searchTerm.slice(1); // # 제거
    //   if (tag) { // 빈 문자열은 falsy이므로 이 조건을 통과하지 못함
    //     router.push(`/cards?tag=${encodeURIComponent(tag)}`);
    //   }
    // }
    
    // 라우팅이 발생하지 않으므로 push 함수가 호출되지 않아야 함
    expect(push).not.toHaveBeenCalled();
  });
  
  it('엔터 키를 눌러도 검색이 실행되어야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '엔터키검색' } });
    
    // 엔터 키 이벤트 발생
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // 올바른 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards?q=%EC%97%94%ED%84%B0%ED%82%A4%EA%B2%80%EC%83%89');
  });
  
  it('다른 키를 눌렀을 때는 검색이 실행되지 않아야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '다른키테스트' } });
    
    // 다른 키 이벤트 발생
    fireEvent.keyDown(inputElement, { key: 'Tab' });
    
    // 검색이 실행되지 않아야 함
    expect(push).not.toHaveBeenCalled();
  });
  
  it('X 버튼 클릭 시 검색어가 초기화되고 기본 URL로 이동해야 함', () => {
    render(<SearchBar />);
    
    // 입력 필드에 검색어 입력
    const inputElement = screen.getByPlaceholderText('검색어 입력 또는 #태그 입력');
    fireEvent.change(inputElement, { target: { value: '지울검색어' } });
    
    // X 버튼이 표시되어야 함
    const clearButton = screen.getByRole('button', { name: '검색어 지우기' });
    expect(clearButton).toBeInTheDocument();
    
    // X 버튼 클릭
    fireEvent.click(clearButton);
    
    // 검색어가 초기화되고 기본 URL로 이동했는지 확인
    expect(push).toHaveBeenCalledWith('/cards');
    expect(inputElement).toHaveValue('');
  });
});
