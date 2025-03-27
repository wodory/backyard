/**
 * 파일명: page.test.tsx
 * 목적: 로그 뷰어 관리자 페이지 테스트
 * 역할: 로그 조회 및 필터링 기능 테스트
 * 작성일: 2024-03-31
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LogViewerPage from './page'

// 모의 응답 데이터
const mockLogs = [
  {
    timestamp: '2024-03-31T10:00:00Z',
    level: 'info',
    module: 'auth',
    message: '사용자 로그인 성공',
    data: { userId: '123' }
  },
  {
    timestamp: '2024-03-31T10:01:00Z',
    level: 'error',
    module: 'database',
    message: '데이터베이스 연결 실패',
    data: { error: 'Connection refused' }
  }
]

const mockModules = ['auth', 'database', 'api']
const mockSessionIds = ['session1', 'session2']

// 모의 객체 생성
const mocks = vi.hoisted(() => {
  return {
    fetch: vi.fn(),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn()
    }))
  }
})

// Next.js 라우터 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => mocks.useRouter()
}))

// fetch 모킹
vi.stubGlobal('fetch', mocks.fetch)

describe('LogViewerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        logs: mockLogs,
        modules: mockModules,
        sessionIds: mockSessionIds
      })
    })
  })

  it('로그 목록을 성공적으로 로드하고 표시', async () => {
    render(<LogViewerPage />)

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()

    // 로그 데이터가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('사용자 로그인 성공')).toBeInTheDocument()
      expect(screen.getByText('데이터베이스 연결 실패')).toBeInTheDocument()
    })

    // 필터 옵션이 올바르게 로드되었는지 확인
    await waitFor(() => {
      const moduleSelect = screen.getByLabelText('모듈')
      mockModules.forEach(module => {
        const option = screen.getByRole('option', { name: module })
        expect(moduleSelect).toContainElement(option)
      })
    })
  })

  it('필터 적용 시 API 호출이 올바른 파라미터로 이루어짐', async () => {
    const user = userEvent.setup()
    render(<LogViewerPage />)

    // 데이터 로드 대기
    await waitFor(() => {
      expect(screen.getByLabelText('모듈')).toBeInTheDocument()
    })

    // 필터 값 설정
    await user.selectOptions(screen.getByLabelText('모듈'), 'auth')
    await user.selectOptions(screen.getByLabelText('레벨'), 'error')
    await user.selectOptions(screen.getByLabelText('로그 수'), '200')

    // 필터 적용 버튼 클릭
    await user.click(screen.getByRole('button', { name: '필터 적용' }))

    // API 호출 확인
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/logs/view?module=auth&level=error&limit=200')
    )
  })

  it('API 오류 발생 시 에러 메시지 표시', async () => {
    const errorMessage = '로그를 가져오는 중 오류가 발생했습니다'
    mocks.fetch.mockRejectedValueOnce(new Error(errorMessage))

    render(<LogViewerPage />)

    // 에러 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('필터 초기화 버튼 클릭 시 필터가 리셋됨', async () => {
    const user = userEvent.setup()
    render(<LogViewerPage />)

    // 데이터 로드 대기
    await waitFor(() => {
      expect(screen.getByLabelText('모듈')).toBeInTheDocument()
    })

    // 필터 값 설정
    await user.selectOptions(screen.getByLabelText('모듈'), 'auth')
    await user.selectOptions(screen.getByLabelText('레벨'), 'error')

    // 필터 초기화 버튼 클릭
    await user.click(screen.getByRole('button', { name: '필터 초기화' }))

    // 필터가 초기화되었는지 확인
    await waitFor(() => {
      expect(screen.getByLabelText('모듈')).toHaveValue('')
      expect(screen.getByLabelText('레벨')).toHaveValue('')
    })

    // API가 초기화된 값으로 호출되었는지 확인
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/logs/view?limit=100')
    )
  })

  it('로그가 없을 때 적절한 메시지 표시', async () => {
    mocks.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        logs: [],
        modules: [],
        sessionIds: []
      })
    })

    render(<LogViewerPage />)

    // "조건에 맞는 로그가 없습니다." 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('조건에 맞는 로그가 없습니다.')).toBeInTheDocument()
    })
  })
}) 