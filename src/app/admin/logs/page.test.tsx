/**
 * 파일명: page.test.tsx
 * 목적: 로그 뷰어 관리자 페이지 테스트
 * 역할: 로그 조회 및 필터링 기능 테스트
 * 작성일: 2024-03-31
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { setupLogViewerTests, teardownLogViewerTests } from './test-utils'
import { LogViewerPageMock } from './LogViewerPageMock'
import { mockLogs } from '@/tests/msw/handlers/logs'

// Next.js 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

describe('LogViewerPage', () => {
  beforeEach(() => {
    setupLogViewerTests()
  })

  afterEach(() => {
    teardownLogViewerTests()
  })

  describe('기본 UI 렌더링', () => {
    it('페이지 타이틀과 필터 컨트롤이 올바르게 표시되어야 함', () => {
      render(<LogViewerPageMock />)

      // 페이지 타이틀 확인
      expect(screen.getByText('로그 뷰어')).toBeInTheDocument()

      // 필터 컨트롤 확인
      expect(screen.getByLabelText('모듈')).toBeInTheDocument()
      expect(screen.getByLabelText('레벨')).toBeInTheDocument()
      expect(screen.getByLabelText('로그 수')).toBeInTheDocument()
      expect(screen.getByText('필터 적용')).toBeInTheDocument()
      expect(screen.getByText('필터 초기화')).toBeInTheDocument()
    })

    it('초기 로그 목록이 올바르게 표시되어야 함', () => {
      render(<LogViewerPageMock />)
      expect(screen.getByText(mockLogs[0].message)).toBeInTheDocument()
    })
  })

  describe('필터 기능', () => {
    it('모듈 필터가 올바르게 작동해야 함', () => {
      render(<LogViewerPageMock />)

      const moduleSelect = screen.getByTestId('module-select')
      fireEvent.change(moduleSelect, { target: { value: 'auth' } })

      const applyButton = screen.getByTestId('apply-filter')
      fireEvent.click(applyButton)

      const filteredLogs = mockLogs.filter(log => log.module === 'auth')
      expect(screen.getByText(filteredLogs[0].message)).toBeInTheDocument()
    })

    it('레벨 필터가 올바르게 작동해야 함', () => {
      render(<LogViewerPageMock />)

      const levelSelect = screen.getByTestId('level-select')
      fireEvent.change(levelSelect, { target: { value: 'error' } })

      const applyButton = screen.getByTestId('apply-filter')
      fireEvent.click(applyButton)

      const filteredLogs = mockLogs.filter(log => log.level === 'error')
      expect(screen.getByText(filteredLogs[0].message)).toBeInTheDocument()
    })
  })

  describe('로그 상세 정보', () => {
    it('로그 항목 클릭 시 상세 정보가 표시되어야 함', () => {
      render(<LogViewerPageMock />)

      const logRow = screen.getByTestId('log-row-0')
      fireEvent.click(logRow)

      expect(screen.getByTestId('log-detail')).toBeInTheDocument()
      expect(screen.getByText('로그 상세 정보')).toBeInTheDocument()

      // 메시지 텍스트가 포함된 요소를 찾을 때 role을 지정하여 중복을 피함
      const messageElement = screen.getByRole('cell', { name: mockLogs[0].message })
      expect(messageElement).toBeInTheDocument()
    })
  })

  describe('에러 처리', () => {
    it('에러 발생 시 에러 메시지가 표시되어야 함', () => {
      render(<LogViewerPageMock />)

      const moduleSelect = screen.getByTestId('module-select')
      fireEvent.change(moduleSelect, { target: { value: 'error-trigger' } })

      const applyButton = screen.getByTestId('apply-filter')
      fireEvent.click(applyButton)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('로그를 가져오는 중 오류가 발생했습니다.')).toBeInTheDocument()
    })

    it('빈 결과일 때 적절한 메시지를 표시해야 함', () => {
      render(<LogViewerPageMock />)

      const moduleSelect = screen.getByTestId('module-select')
      fireEvent.change(moduleSelect, { target: { value: 'empty-trigger' } })

      const applyButton = screen.getByTestId('apply-filter')
      fireEvent.click(applyButton)

      expect(screen.getByTestId('empty-message')).toBeInTheDocument()
      expect(screen.getByText('조건에 맞는 로그가 없습니다.')).toBeInTheDocument()
    })
  })
}) 