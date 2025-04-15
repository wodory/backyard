/**
 * 파일명: src/app/admin/logs/test-utils.ts
 * 목적: 로그 뷰어 테스트를 위한 유틸리티 함수
 * 역할: 테스트 설정과 해제를 담당
 * 작성일: 2025-04-01
 * 수정일: 2024-05-21 : import 순서 수정
 * 수정일: 2024-05-22 : import 순서 오류 수정
 * 수정일: 2024-05-23 : import 순서 및 그룹화 오류 수정
 */

import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'

import { mockLogs, mockModules, mockSessionIds } from '@/tests/msw/handlers/logs'
import { server } from '@/tests/msw/server'

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