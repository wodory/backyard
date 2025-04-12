/**
 * 파일명: src/lib/ideamap-utils.test.ts
 * 목적: ideamap-utils.ts 기능 테스트
 * 역할: 보드 설정 관리 유틸리티 기능 검증
 * 작성일: 2025-04-01
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  loadIdeaMapSettings, 
  saveIdeaMapSettings, 
  saveIdeaMapSettingsToServer,
  loadIdeaMapSettingsFromServer,
  updateIdeaMapSettingsOnServer,
  applyIdeaMapEdgeSettings,
  DEFAULT_IDEAMAP_SETTINGS,
  type IdeaMapSettings
} from './ideamap-utils';
import { IDEAMAP_SETTINGS_STORAGE_KEY } from './ideamap-constants';
import { Edge, ConnectionLineType, MarkerType } from '@xyflow/react';

// 전역 모킹 설정
const localStorageMock = new Map();
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => localStorageMock.get(key) || null),
  setItem: vi.fn((key, value) => localStorageMock.set(key, value)),
  clear: vi.fn(() => localStorageMock.clear()),
});

// 전역 fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// 테스트 전에 모킹 초기화
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// 기본 설정 가져오기 함수 (테스트용)
function getTestIdeaMapSettings(): IdeaMapSettings {
  return {
    snapToGrid: true,
    snapGrid: [15, 15] as [number, number],
    connectionLineType: ConnectionLineType.SmoothStep,
    markerEnd: MarkerType.Arrow,
    strokeWidth: 2,
    markerSize: 20,
    edgeColor: '#C1C1C1',
    selectedEdgeColor: '#FF0072',
    animated: false
  };
}

describe('@testcase.mdc 아이디어맵 유틸리티 테스트', () => {
  describe('로컬 스토리지 설정', () => {
    it('localStorage에 설정이 없으면 기본 설정을 반환', () => {
      const settings = loadIdeaMapSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(IDEAMAP_SETTINGS_STORAGE_KEY);
      expect(settings).toEqual(DEFAULT_IDEAMAP_SETTINGS);
    });

    it('localStorage에서 저장된 설정을 불러옴', () => {
      const testSettings: IdeaMapSettings = {
        ...DEFAULT_IDEAMAP_SETTINGS,
        snapToGrid: false,
        edgeColor: '#FF0000'
      };
      
      localStorageMock.set(IDEAMAP_SETTINGS_STORAGE_KEY, JSON.stringify(testSettings));
      
      const settings = loadIdeaMapSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(IDEAMAP_SETTINGS_STORAGE_KEY);
      expect(settings).toEqual(testSettings);
    });

    it('localStorage에 설정을 저장', () => {
      const testSettings = getTestIdeaMapSettings();
      
      saveIdeaMapSettings(testSettings);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        IDEAMAP_SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('localStorage 오류 발생 시 기본 설정을 반환', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const settings = loadIdeaMapSettings();
      
      expect(settings).toEqual(DEFAULT_IDEAMAP_SETTINGS);
    });
  });

  describe('서버 설정 동기화', () => {
    it('서버에 설정을 성공적으로 저장', async () => {
      const userId = 'test-user';
      const testSettings = getTestIdeaMapSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        clone: () => ({
          json: async () => ({ success: true })
        })
      });
      
      const result = await saveIdeaMapSettingsToServer(testSettings, userId);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain('/api/ideamap-settings');
      expect(result).toBe(true);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        IDEAMAP_SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버에서 설정을 성공적으로 불러옴', async () => {
      const userId = 'test-user';
      const testSettings = getTestIdeaMapSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: testSettings }),
        clone: () => ({
          json: async () => ({ settings: testSettings })
        })
      });
      
      const result = await loadIdeaMapSettingsFromServer(userId);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain(`/api/ideamap-settings?userId=${encodeURIComponent(userId)}`);
      expect(result).toEqual(testSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        IDEAMAP_SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버 오류 시 false를 반환', async () => {
      const userId = 'test-user';
      const testSettings = getTestIdeaMapSettings();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await saveIdeaMapSettingsToServer(testSettings, userId);
      
      expect(result).toBe(false);
    });

    it('서버에서 설정이 없을 때 null을 반환', async () => {
      const userId = 'test-user';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
        clone: () => ({
          json: async () => ({ settings: null })
        })
      });
      
      const result = await loadIdeaMapSettingsFromServer(userId);
      
      expect(result).toBeNull();
    });
  });

  describe('엣지 스타일 적용', () => {
    it('기본 엣지에 설정을 올바르게 적용', () => {
      const settings = getTestIdeaMapSettings();
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].style).toEqual(
        expect.objectContaining({
          strokeWidth: settings.strokeWidth,
          stroke: settings.edgeColor
        })
      );
      
      if (updatedEdges[0].markerEnd && typeof updatedEdges[0].markerEnd !== 'string') {
        expect(updatedEdges[0].markerEnd.type).toBe(settings.markerEnd);
        expect(updatedEdges[0].markerEnd.color).toBe(settings.edgeColor);
      }
    });

    it('선택된 엣지에 선택 색상을 적용', () => {
      const settings = getTestIdeaMapSettings();
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', selected: true }
      ];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].style?.stroke).toBe(settings.selectedEdgeColor);
      if (updatedEdges[0].markerEnd && typeof updatedEdges[0].markerEnd !== 'string') {
        expect(updatedEdges[0].markerEnd.color).toBe(settings.selectedEdgeColor);
      }
    });

    it('마커 설정이 없을 때 마커를 제거', () => {
      const settings: IdeaMapSettings = {
        ...getTestIdeaMapSettings(),
        markerEnd: null
      };
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].markerEnd).toBeUndefined();
    });
  });
  
  describe('설정 부분 업데이트', () => {
    it('서버에 설정을 부분적으로 업데이트', async () => {
      const userId = 'test-user';
      const partialSettings: Partial<IdeaMapSettings> = {
        edgeColor: '#FF0000',
        animated: true
      };
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        clone: () => ({
          json: async () => ({ success: true })
        })
      });
      
      const result = await updateIdeaMapSettingsOnServer(userId, partialSettings);
      
      // 함수가 fetch를 호출했는지 확인
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // 호출 시 올바른 URL과 메서드 사용했는지 확인
      const requestConfig = mockFetch.mock.calls[0][0];
      expect(requestConfig.method).toBe('PATCH');
      expect(requestConfig.url).toContain('/api/ideamap-settings');
      
      // 반환값 확인
      expect(result).toBe(true);
    });
    
    it('로컬 설정을 부분 업데이트 후 저장', async () => {
      const userId = 'test-user';
      const currentSettings = getTestIdeaMapSettings();
      const partialSettings: Partial<IdeaMapSettings> = {
        edgeColor: '#FF0000',
        animated: true
      };
      
      // 현재 설정 모킹
      localStorageMock.set(IDEAMAP_SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      
      await updateIdeaMapSettingsOnServer(userId, partialSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        IDEAMAP_SETTINGS_STORAGE_KEY,
        expect.any(String)
      );
      
      // 저장된 값 확인
      const savedSettingsStr = vi.mocked(localStorage.setItem).mock.calls[0][1] as string;
      const savedSettings = JSON.parse(savedSettingsStr);
      
      // 합쳐진 설정 확인
      expect(savedSettings).toEqual({
        ...currentSettings,
        ...partialSettings
      });
    });
  });
}); 