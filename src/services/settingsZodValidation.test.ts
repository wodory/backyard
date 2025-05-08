/**
 * 파일명: src/services/settingsZodValidation.test.ts
 * 목적: 설정 서비스의 Zod 검증 기능 테스트
 * 역할: 다양한 케이스에서 설정 데이터 검증 기능 확인
 * 작성일: 2025-05-07
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw validateSettings
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { fetchSettings, updateSettings } from './settingsService';
import { SettingsData } from '@/types/settings';

// 테스트용 Mock 유효 데이터
const validSettingsData: SettingsData = {
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

// 테스트용 Mock 잘못된 데이터
const invalidSettingsData = {
  ideamap: {
    snapToGrid: "not-a-boolean", // 불리언이 아님
    snapGrid: [10], // 배열 요소 수 부족
    connectionLineType: 'invalid-type', // 허용되지 않는 유형
    markerEnd: 'invalid-marker',
    strokeWidth: -2, // 음수
    markerSize: 0, // 0이하
    edgeColor: 'not-a-hex-color', // 색상 형식 오류
    animated: 1, // 불리언이 아님
    selectedEdgeColor: 123 // 문자열이 아닌 숫자
  },
  card: {
    defaultWidth: 0, // 0이하
    backgroundColor: 'invalid-color',
    borderRadius: -5, // 음수
    tagBackgroundColor: null, // 널값
    fontSizes: {
      default: 0,
      title: -1,
      content: "14", // 문자열
      tags: null // 널값
    }
  },
  general: {
    autoSaveIntervalMinutes: 0 // 양수가 아님
  },
  theme: {
    mode: 'invalid-mode', // 허용되지 않는 모드
    accentColor: 'not-hex-color'
  }
};

// MSW 서버 설정
const handlers = [
  // TC 2.1: 유효한 데이터 GET (fetchSettings)
  http.get('/api/settings', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId === 'valid-user') {
      return HttpResponse.json({ settingsData: validSettingsData }, { status: 200 });
    }
    
    if (userId === 'invalid-user') {
      return HttpResponse.json({ settingsData: invalidSettingsData }, { status: 200 });
    }
    
    if (userId === 'missing-fields-user') {
      // 일부 필드가 누락된 데이터
      const incompleteData = {
        theme: {
          mode: 'light'
          // accentColor 누락
        },
        general: {} // 빈 객체
        // ideamap, card, handles, layout 섹션 자체가 누락
      };
      return HttpResponse.json({ settingsData: incompleteData }, { status: 200 });
    }
    
    return HttpResponse.json({ error: { message: 'User not found' } }, { status: 404 });
  }),

  // TC 2.3: 업데이트 PATCH (updateSettings)
  http.patch('/api/settings', async ({ request }) => {
    const body = await request.json() as any;
    const { userId, partialUpdate } = body;
    
    if (userId === 'valid-update') {
      return HttpResponse.json({ settingsData: validSettingsData }, { status: 200 });
    }
    
    if (userId === 'invalid-response') {
      return HttpResponse.json({ settingsData: invalidSettingsData }, { status: 200 });
    }
    
    return HttpResponse.json({ error: { message: 'Update failed' } }, { status: 500 });
  })
];

const server = setupServer(...handlers);

// 테스트 전후 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 테스트
describe('설정 서비스 Zod 검증 테스트', () => {
  describe('TC 2.1: fetchSettings - 유효한 설정 검증', () => {
    it('유효한 설정 데이터는 성공적으로 검증되고 반환된다', async () => {
      const result = await fetchSettings('valid-user');
      
      // 데이터 검증 확인
      expect(result).toHaveProperty('theme');
      expect(result).toHaveProperty('general');
      expect(result).toHaveProperty('ideamap');
      expect(result).toHaveProperty('card');
      expect(result).toHaveProperty('handles');
      expect(result).toHaveProperty('layout');
      
      // 특정 값 확인
      expect(result.theme.mode).toBe('light');
      expect(result.ideamap.strokeWidth).toBe(2);
      expect(result.ideamap.snapGrid).toEqual([10, 10]);
    });
  });
  
  describe('TC 2.2: fetchSettings - 잘못된 데이터 복구', () => {
    it('잘못된 설정 데이터는 safe 모드에서 기본값으로 복구된다', async () => {
      const result = await fetchSettings('invalid-user');
      
      // 기본값으로 복구된 데이터 확인
      expect(result.theme.mode).toBe('light'); // 'invalid-mode'가 'light'로 복구됨
      expect(result.theme.accentColor).toBe('#3498db'); // 'not-hex-color'가 복구됨
      expect(result.ideamap.snapToGrid).toBe(true); // "not-a-boolean"이 true로 복구됨
      expect(result.ideamap.snapGrid).toEqual([15, 15]); // [10]이 [15, 15]로 복구됨
      expect(result.ideamap.strokeWidth).toBeGreaterThan(0); // -2가 양수로 복구됨
      expect(result.general.autoSaveIntervalMinutes).toBeGreaterThan(0); // 0이 양수로 복구됨
    });
    
    it('필드가 누락된 데이터는 기본값으로 채워진다', async () => {
      const result = await fetchSettings('missing-fields-user');
      
      // 누락된 필드 기본값 확인
      expect(result.theme.accentColor).toBe('#3498db'); // 누락된 accentColor 기본값
      expect(result.general.autoSaveIntervalMinutes).toBe(1); // 빈 general 객체 기본값
      expect(result.ideamap).toBeDefined(); // 누락된 ideamap 섹션 기본값
      expect(result.card).toBeDefined(); // 누락된 card 섹션 기본값
      expect(result.handles).toBeDefined(); // 누락된 handles 섹션 기본값
      expect(result.layout).toBeDefined(); // 누락된 layout 섹션 기본값
    });
  });
  
  describe('TC 2.3: updateSettings', () => {
    it('유효한 업데이트 요청은 검증 후 처리된다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#112233'
        }
      };
      
      const result = await updateSettings('valid-update', partialUpdate);
      
      // 업데이트 결과 확인
      expect(result.theme.mode).toBe('light'); // API 응답 값으로 덮어씀
      expect(result.theme.accentColor).toBe('#0099ff'); // API 응답 값으로 덮어씌움
    });
    
    it('잘못된 서버 응답 데이터는 복구된다', async () => {
      const partialUpdate: Partial<SettingsData> = {
        theme: {
          mode: 'dark',
          accentColor: '#112233'
        }
      };
      
      const result = await updateSettings('invalid-response', partialUpdate);
      
      // 검증된 응답 확인
      expect(result.theme.mode).toBe('light'); // 'invalid-mode'가 'light'로 복구됨
      expect(result.theme.accentColor).toBe('#3498db'); // 'not-hex-color'가 복구됨
      expect(result.ideamap.strokeWidth).toBeGreaterThan(0); // -2가 양수로 복구됨
    });
    
    it('잘못된 업데이트 요청 데이터는 오류를 발생시킨다', async () => {
      const invalidUpdate = {
        theme: {
          mode: 'invalid-mode',
          accentColor: 'not-hex'
        }
      };
      
      await expect(updateSettings('valid-update', invalidUpdate as any)).rejects.toMatchObject({
        code: 400,
        type: 'VALIDATION_ERROR'
      });
    });
  });
}); 