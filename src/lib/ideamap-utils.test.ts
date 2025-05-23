/**
 * 파일명: src/lib/ideamap-utils.test.ts
 * 목적: ideamap-utils.ts 기능 테스트
 * 역할: 보드 설정 관리 유틸리티 기능 검증
 * 작성일: 2025-04-01
 */

import { Edge, ConnectionLineType, MarkerType } from '@xyflow/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SETTINGS_STORAGE_KEY } from './ideamap-constants';
import { 
  loadSettings, 
  saveSettings, 
  saveSettingsToServer,
  loadSettingsFromServer,
  updateSettingsOnServer,
  applyIdeaMapEdgeSettings,
  DEFAULT_SETTINGS,
  type Settings
} from './ideamap-utils';

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
function getTestSettings(): Settings {
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
      const settings = loadSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY);
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('localStorage에서 저장된 설정을 불러옴', () => {
      const testSettings: Settings = {
        ...DEFAULT_SETTINGS,
        snapToGrid: false,
        edgeColor: '#FF0000'
      };
      
      localStorageMock.set(SETTINGS_STORAGE_KEY, JSON.stringify(testSettings));
      
      const settings = loadSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY);
      expect(settings).toEqual(testSettings);
    });

    it('localStorage에 설정을 저장', () => {
      const testSettings = getTestSettings();
      
      saveSettings(testSettings);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('localStorage 오류 발생 시 기본 설정을 반환', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const settings = loadSettings();
      
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('서버 설정 동기화', () => {
    it('서버에 설정을 성공적으로 저장', async () => {
      const userId = 'test-user';
      const testSettings = getTestSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        clone: () => ({
          json: async () => ({ success: true })
        })
      });
      
      const result = await saveSettingsToServer(testSettings, userId);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain('/api/settings');
      expect(result).toBe(true);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버에서 설정을 성공적으로 불러옴', async () => {
      const userId = 'test-user';
      const testSettings = getTestSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: testSettings }),
        clone: () => ({
          json: async () => ({ settings: testSettings })
        })
      });
      
      const result = await loadSettingsFromServer(userId);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain(`/api/settings?userId=${encodeURIComponent(userId)}`);
      expect(result).toEqual(testSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버 오류 시 false를 반환', async () => {
      const userId = 'test-user';
      const testSettings = getTestSettings();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await saveSettingsToServer(testSettings, userId);
      
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
      
      const result = await loadSettingsFromServer(userId);
      
      expect(result).toBeNull();
    });

    it('모킹된 fetch 오류 메시지 확인', async () => {
      const userId = 'test-user';
      const testSettings = getTestSettings();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await saveSettingsToServer(testSettings, userId);
      
      expect(result).toBe(false);
      
      // 모킹된 fetch 오류 메시지 확인
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('서버 아이디어맵 설정 저장 중 오류:'),
        expect.any(Error)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain('/api/settings');
    });
  });

  describe('엣지 스타일 적용', () => {
    it('기본 엣지에 설정을 올바르게 적용', () => {
      const settings = getTestSettings();
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
      const settings = getTestSettings();
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
      const settings: Settings = {
        ...getTestSettings(),
        markerEnd: null
      };
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].markerEnd).toBeUndefined();
    });

    it('개별 엣지 설정이 전역 설정보다 우선 적용됨', () => {
      const globalSettings = getTestSettings();
      
      // 일부 개별 설정이 있는 엣지 생성
      const edges: Edge[] = [{
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        data: {
          settings: {
            strokeWidth: 5, // 전역 설정과 다른 값
            edgeColor: '#FF0000', // 전역 설정과 다른 값
          }
        }
      }];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, globalSettings);
      
      // 개별 설정값이 전역 설정보다 우선되어야 함
      expect(updatedEdges[0].style).toEqual(
        expect.objectContaining({
          strokeWidth: 5, // 개별 설정값 적용
          stroke: '#FF0000' // 개별 설정값 적용
        })
      );
      
      // data.settings에도 병합된 설정이 저장되어야 함
      expect(updatedEdges[0].data?.settings).toEqual(
        expect.objectContaining({
          strokeWidth: 5,
          edgeColor: '#FF0000',
          animated: globalSettings.animated, // 개별 설정에 없는 속성은 전역 설정 값 사용
          connectionLineType: globalSettings.connectionLineType
        })
      );
    });

    it('data.settings 객체를 올바른 위치에 저장', () => {
      const settings = getTestSettings();
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyIdeaMapEdgeSettings(edges, settings);
      
      // data.settings에 전역 설정이 복사되어야 함
      expect(updatedEdges[0].data).toBeDefined();
      expect(updatedEdges[0].data?.settings).toBeDefined();
      expect(updatedEdges[0].data?.settings).toEqual(
        expect.objectContaining({
          animated: settings.animated,
          connectionLineType: settings.connectionLineType,
          strokeWidth: settings.strokeWidth,
          edgeColor: settings.edgeColor,
          selectedEdgeColor: settings.selectedEdgeColor,
          markerEnd: settings.markerEnd,
          markerSize: settings.markerSize
        })
      );
    });
  });
  
  describe('설정 부분 업데이트', () => {
    it('서버에 설정을 부분적으로 업데이트', async () => {
      const userId = 'test-user';
      const partialSettings: Partial<Settings> = {
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
      
      const result = await updateSettingsOnServer(userId, partialSettings);
      
      // 함수가 fetch를 호출했는지 확인
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // 호출 시 올바른 URL과 메서드 사용했는지 확인
      const requestConfig = mockFetch.mock.calls[0][0];
      expect(requestConfig.method).toBe('PATCH');
      expect(requestConfig.url).toContain('/api/settings');
      
      // 반환값 확인
      expect(result).toBe(true);
    });
    
    it('로컬 설정을 부분 업데이트 후 저장', async () => {
      const userId = 'test-user';
      const currentSettings = getTestSettings();
      const partialSettings: Partial<Settings> = {
        edgeColor: '#FF0000',
        animated: true
      };
      
      // 현재 설정 모킹
      localStorageMock.set(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      
      await updateSettingsOnServer(userId, partialSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        SETTINGS_STORAGE_KEY,
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