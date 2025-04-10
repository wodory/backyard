/**
 * 파일명: logs.ts
 * 목적: 로그 뷰어 테스트를 위한 목업 데이터
 * 역할: 테스트에서 사용할 로그 데이터 제공
 * 작성일: 2025-04-01
 */

export interface Log {
  timestamp: string
  module: string
  level: string
  message: string
  sessionId: string
  data?: Record<string, unknown>
}

export const mockModules = ['auth', 'database', 'api', 'system'] as const

export const mockSessionIds = [
  'sess_123456',
  'sess_789012',
  'sess_345678',
  'sess_901234'
]

export const mockLogs: Log[] = [
  {
    timestamp: '2024-03-31T10:00:00Z',
    module: 'auth',
    level: 'info',
    message: '사용자 로그인 성공',
    sessionId: 'sess_123456',
    data: {
      userId: 'user_123',
      loginMethod: 'password'
    }
  },
  {
    timestamp: '2024-03-31T10:01:00Z',
    module: 'database',
    level: 'error',
    message: '데이터베이스 연결 실패',
    sessionId: 'sess_789012',
    data: {
      errorCode: 'DB_001',
      retryCount: 3
    }
  },
  {
    timestamp: '2024-03-31T10:02:00Z',
    module: 'api',
    level: 'warn',
    message: 'API 응답 지연',
    sessionId: 'sess_345678',
    data: {
      endpoint: '/api/users',
      responseTime: 5000
    }
  },
  {
    timestamp: '2024-03-31T10:03:00Z',
    module: 'system',
    level: 'debug',
    message: '시스템 상태 점검',
    sessionId: 'sess_901234',
    data: {
      cpuUsage: 45,
      memoryUsage: 60
    }
  }
] 