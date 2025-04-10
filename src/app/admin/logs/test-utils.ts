/**
 * 파일명: test-utils.ts
 * 목적: 로그 뷰어 테스트를 위한 유틸리티 함수
 * 역할: 테스트 설정과 해제를 담당
 * 작성일: 2025-04-01
 */

import { vi } from 'vitest'
import { server } from '@/tests/msw/server'
import { http, HttpResponse } from 'msw'
import { mockLogs, mockModules, mockSessionIds } from '@/tests/msw/handlers/logs'

// API 응답에 사용할 기본 데이터
const defaultApiResponse = {
  logs: mockLogs,
  modules: mockModules,
  sessionIds: mockSessionIds,
  levels: ['debug', 'info', 'warn', 'error'],
  total: mockLogs.length,
  filtered: mockLogs.length
}

/**
 * setupLogViewerTests: 로그 뷰어 테스트를 위한 환경을 설정
 */
export const setupLogViewerTests = () => {
  // API 성공 응답 설정
  server.use(
    http.get('/api/logs/view', () => {
      return HttpResponse.json(defaultApiResponse)
    })
  )
}

/**
 * teardownLogViewerTests: 로그 뷰어 테스트 환경을 정리
 */
export const teardownLogViewerTests = () => {
  server.resetHandlers()
  vi.clearAllMocks()
} 