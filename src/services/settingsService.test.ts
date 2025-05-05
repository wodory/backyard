/**
 * 파일명: src/services/settingsService.test.ts
 * 목적: 설정 관련 API 서비스 모듈 테스트
 * 역할: 설정 관련 API 호출 함수를 테스트하고 오류 처리 검증
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : 오류 타입 기대값을 API_ERROR로 변경
 * 수정일: 2025-05-05 : 오류 타입을 서비스 파일과 일치하도록 수정
 * 수정일: 2025-05-05 : 테스트 파일 위치 이동
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchSettings
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { fetchSettings, updateSettings, createInitialSettings } from './settingsService';
import { SettingsData } from '@/types/settings';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { ConnectionLineType, MarkerType } from '@xyflow/react';

// 테스트용 Mock 데이터
const mockSettingsData: SettingsData = {
  ideamap: {
    snapToGrid: true,
    snapGrid: [10, 10],
    connectionLineType: 'straight' as ConnectionLineType,
    markerEnd: 'arrow' as MarkerType,
    strokeWidth: 2,
    markerSize: 8,
    edgeColor: '#aaaaaa',
    animated: true,
    selectedEdgeColor: '#ff0000'
  },
  card: {
    defaultWidth: 200,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    tagBackgroundColor: '#eeeeee',
    fontSizes: {
      default: 14,
      title: 18,
      content: 14,
      tags: 12
    }
  },
  handles: {
    size: 10,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1
  },
  layout: {
    defaultPadding: 50,
    defaultSpacing: {
      horizontal: 100,
      vertical: 70
    },
    nodeSize: {
      width: 200,
      height: 150,
      maxHeight: 300
    },
    graphSettings: {
      nodesep: 70,
      ranksep: 50,
      edgesep: 10
    }
  },
  general: {
    autoSaveIntervalMinutes: 2
  },
  theme: {
    mode: 'light',
    accentColor: '#0099ff'
  }
};

// API 응답 형식 (DB 스키마와 일치)
const mockApiResponse = {
  id: 'settings-1',
  userId: 'user-1',
  settingsData: mockSettingsData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// MSW 서버 설정
const handlers = [
  // GET /api/settings
  http.get('/api/settings', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new HttpResponse(JSON.stringify({
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '사용자 ID가 필요합니다.'
      }), { status: 400 });
    }
    
    if (userId === 'error-user') {
      return new HttpResponse(JSON.stringify({
        code: 500,
        type: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }), { status: 500 });
    }
    
    if (userId === 'not-found') {
      return HttpResponse.json({ settingsData: {} }, { status: 200 });
    }
    
    return HttpResponse.json({ settingsData: mockSettingsData }, { status: 200 });
  }),
  
  // PATCH /api/settings
  http.patch('/api/settings', async ({ request }) => {
    const body = await request.json() as { userId: string; partialUpdate: any };
    const { userId, partialUpdate } = body;
    
    if (!userId) {
      return new HttpResponse(JSON.stringify({
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '사용자 ID가 필요합니다.'
      }), { status: 400 });
    }
    
    if (!partialUpdate) {
      return new HttpResponse(JSON.stringify({
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '업데이트할 설정이 필요합니다.'
      }), { status: 400 });
    }
    
    if (userId === 'error-user') {
      return new HttpResponse(JSON.stringify({
        code: 500,
        type: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }), { status: 500 });
    }
    
    if (userId === 'invalid-json-error') {
      return new HttpResponse('', { status: 500 });
    }
    
    // 실제로는 서버에서 병합 후 전체 설정을 반환
    return HttpResponse.json({ settingsData: mockSettingsData }, { status: 200 });
  }),
  
  // POST /api/settings
  http.post('/api/settings', async ({ request }) => {
    const body = await request.json() as { userId: string; settingsData: any };
    const { userId, settingsData } = body;
    
    if (!userId) {
      return new HttpResponse(JSON.stringify({
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '사용자 ID가 필요합니다.'
      }), { status: 400 });
    }
    
    if (!settingsData) {
      return new HttpResponse(JSON.stringify({
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '설정 데이터가 필요합니다.'
      }), { status: 400 });
    }
    
    if (userId === 'error-user') {
      return new HttpResponse(JSON.stringify({
        code: 500,
        type: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }), { status: 500 });
    }
    
    return HttpResponse.json({ settingsData: mockSettingsData }, { status: 201 });
  })
];

const server = setupServer(...handlers);

// 테스트 전후 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 테스트
describe('settingsService', () => {
  describe('fetchSettings', () => {
    it('사용자 설정을 성공적으로 조회한다', async () => {
      const result = await fetchSettings('user-1');
      
      expect(result).toEqual(mockSettingsData);
    });
    
    it('사용자 ID가 없을 때 오류를 발생시킨다', async () => {
      await expect(fetchSettings('')).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
    
    it('서버 오류 발생 시 구조화된 오류 객체를 반환한다', async () => {
      await expect(fetchSettings('error-user')).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      });
    });
    
    it('응답 형식이 올바르지 않을 때 오류를 발생시킨다', async () => {
      // 응답이 올바르지 않은 핸들러로 재정의
      server.use(
        http.get('/api/settings', () => {
          return HttpResponse.json({ wrongFormat: true }, { status: 200 });
        })
      );
      
      await expect(fetchSettings('user-1')).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
  });
  
  describe('updateSettings', () => {
    it('설정을 성공적으로 업데이트한다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#0099ff'
        }
      };
      
      const result = await updateSettings('user-1', partialUpdate);
      
      expect(result).toEqual(mockSettingsData);
    });
    
    it('사용자 ID가 없을 때 오류를 발생시킨다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#0099ff'
        }
      };
      
      await expect(updateSettings('', partialUpdate)).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
    
    it('업데이트 데이터가 없을 때 오류를 발생시킨다', async () => {
      await expect(updateSettings('user-1', {})).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
    
    it('서버 오류 발생 시 구조화된 오류 객체를 반환한다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#0099ff'
        }
      };
      
      await expect(updateSettings('error-user', partialUpdate)).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
    
    it('응답 형식이 올바르지 않을 때 오류를 발생시킨다', async () => {
      // 응답이 올바르지 않은 핸들러로 재정의
      server.use(
        http.patch('/api/settings', () => {
          return HttpResponse.json({ wrongFormat: true }, { status: 200 });
        })
      );
      
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#0099ff'
        }
      };
      
      await expect(updateSettings('user-1', partialUpdate)).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
    
    it('JSON 파싱 실패 시 적절한 오류 객체를 반환한다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#0099ff'
        }
      };
      
      await expect(updateSettings('invalid-json-error', partialUpdate)).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
  });
  
  describe('createInitialSettings', () => {
    it('초기 설정을 성공적으로 생성한다', async () => {
      const result = await createInitialSettings('user-1', mockSettingsData);
      
      expect(result).toEqual(mockSettingsData);
    });
    
    it('사용자 ID가 없을 때 오류를 발생시킨다', async () => {
      await expect(createInitialSettings('', mockSettingsData)).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
    
    it('설정 데이터가 없을 때 오류를 발생시킨다', async () => {
      await expect(createInitialSettings('user-1', null as unknown as SettingsData)).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
    
    it('서버 오류 발생 시 구조화된 오류 객체를 반환한다', async () => {
      await expect(createInitialSettings('error-user', mockSettingsData)).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
    
    it('응답 형식이 올바르지 않을 때 오류를 발생시킨다', async () => {
      // 응답이 올바르지 않은 핸들러로 재정의
      server.use(
        http.post('/api/settings', () => {
          return HttpResponse.json({ wrongFormat: true }, { status: 201 });
        })
      );
      
      await expect(createInitialSettings('user-1', mockSettingsData)).rejects.toMatchObject({
        code: 500,
        type: 'SERVER_ERROR'
      });
    });
  });
});

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *     participant Test as 테스트 코드
 *     participant Service as settingsService
 *     participant MSW as MSW 서버 (모의 API)
 *     
 *     Test->>Service: fetchSettings(userId)
 *     Service->>MSW: GET /api/settings?userId={userId}
 *     MSW-->>Service: 성공/실패 응답 시뮬레이션
 *     Service-->>Test: 처리된 데이터 또는 오류 반환
 *     
 *     Test->>Service: updateSettings(userId, partialUpdate)
 *     Service->>MSW: PATCH /api/settings
 *     MSW-->>Service: 성공/실패 응답 시뮬레이션
 *     Service-->>Test: 처리된 데이터 또는 오류 반환
 *     
 *     Test->>Service: createInitialSettings(userId, initialSettings)
 *     Service->>MSW: POST /api/settings
 *     MSW-->>Service: 성공/실패 응답 시뮬레이션
 *     Service-->>Test: 처리된 데이터 또는 오류 반환
 * ```
 */ 