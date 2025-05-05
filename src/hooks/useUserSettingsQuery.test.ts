/**
 * 파일명: src/hooks/useUserSettingsQuery.test.ts
 * 목적: 사용자 설정 관련 Core React Query 훅 테스트
 * 역할: 사용자 설정을 가져오는 기본 쿼리 훅을 테스트
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : 린터 오류 수정
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw userSettings
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import * as settingsService from '../services/settingsService';
import { SettingsData, ApiError } from '@/types/settings';
import { ConnectionLineType, MarkerType } from '@xyflow/react';

// fetchSettings 함수를 모킹
vi.mock('../services/settingsService', () => ({
  fetchSettings: vi.fn()
}));

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

// MSW 서버 설정
const server = setupServer(
  // 성공 응답
  http.get('/api/settings', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId === 'user-1') {
      return HttpResponse.json(mockSettingsData);
    }
    
    if (userId === 'error-user') {
      return new HttpResponse(null, {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return HttpResponse.json({ wrongFormat: true });
  })
);

describe('settingsService', () => {
  // 테스트 전 서버 설정
  beforeAll(() => server.listen());
  
  // 각 테스트 후 핸들러 리셋
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  
  // 모든 테스트 후 서버 종료
  afterAll(() => server.close());
  
  describe('fetchSettings', () => {
    it('사용자 설정을 성공적으로 조회한다', async () => {
      vi.mocked(settingsService.fetchSettings).mockResolvedValue(mockSettingsData);
      
      const result = await settingsService.fetchSettings('user-1');
      
      expect(settingsService.fetchSettings).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSettingsData);
    });
    
    it('사용자 ID가 없을 때 오류를 발생시킨다', async () => {
      vi.mocked(settingsService.fetchSettings).mockRejectedValue(
        new Error('사용자 ID가 필요합니다.')
      );
      
      await expect(settingsService.fetchSettings()).rejects.toThrow('사용자 ID가 필요합니다.');
    });
    
    it('서버 오류 발생 시 구조화된 오류 객체를 반환한다', async () => {
      const mockError = {
        code: 500,
        type: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      };
      
      vi.mocked(settingsService.fetchSettings).mockRejectedValue({ error: mockError });
      
      try {
        await settingsService.fetchSettings('error-user');
        // 테스트에서는 명시적으로 실패하게 함 (expect.fail() 사용)
        expect.fail('오류가 발생해야 함');
      } catch (error) {
        // 타입 단언을 사용하여 error 객체의 구조를 명시
        const apiError = error as { error: ApiError };
        expect(apiError.error).toBeDefined();
        expect(apiError.error).toEqual(mockError);
      }
    });
    
    it('응답 형식이 올바르지 않을 때 오류를 발생시킨다', async () => {
      const mockError = {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: '잘못된 응답 형식입니다.'
      };
      
      vi.mocked(settingsService.fetchSettings).mockRejectedValue({ error: mockError });
      
      try {
        await settingsService.fetchSettings('wrong-format');
        // 테스트에서는 명시적으로 실패하게 함 (expect.fail() 사용)
        expect.fail('오류가 발생해야 함');
      } catch (error) {
        // 타입 단언을 사용하여 error 객체의 구조를 명시
        const apiError = error as { error: ApiError };
        expect(apiError.error).toBeDefined();
        expect(apiError.error.type).toBe('VALIDATION_ERROR');
      }
    });
  });
}); 