/**
 * 파일명: src/lib/board-utils.test.ts
 * 목적: board-utils.ts 기능 테스트
 * 역할: 보드 설정 관리 유틸리티 기능 검증
 * 작성일: 2024-03-30
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  loadBoardSettings, 
  saveBoardSettings, 
  saveBoardSettingsToServer, 
  loadBoardSettingsFromServer, 
  applyEdgeSettings,
  DEFAULT_BOARD_SETTINGS,
  type BoardSettings
} from './board-utils';
import { BOARD_SETTINGS_KEY } from './board-constants';
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
function getTestBoardSettings(): BoardSettings {
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

describe('@testcase.mdc 보드 유틸리티 테스트', () => {
  describe('로컬 스토리지 설정', () => {
    it('localStorage에 설정이 없으면 기본 설정을 반환', () => {
      const settings = loadBoardSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(BOARD_SETTINGS_KEY);
      expect(settings).toEqual(DEFAULT_BOARD_SETTINGS);
    });

    it('localStorage에서 저장된 설정을 불러옴', () => {
      const testSettings: BoardSettings = {
        ...DEFAULT_BOARD_SETTINGS,
        snapToGrid: false,
        edgeColor: '#FF0000'
      };
      
      localStorageMock.set(BOARD_SETTINGS_KEY, JSON.stringify(testSettings));
      
      const settings = loadBoardSettings();
      expect(localStorage.getItem).toHaveBeenCalledWith(BOARD_SETTINGS_KEY);
      expect(settings).toEqual(testSettings);
    });

    it('localStorage에 설정을 저장', () => {
      const testSettings = getTestBoardSettings();
      
      saveBoardSettings(testSettings);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('localStorage 오류 발생 시 기본 설정을 반환', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const settings = loadBoardSettings();
      
      expect(settings).toEqual(DEFAULT_BOARD_SETTINGS);
    });
  });

  describe('서버 설정 동기화', () => {
    it('서버에 설정을 성공적으로 저장', async () => {
      const userId = 'test-user';
      const testSettings = getTestBoardSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        clone: () => ({
          json: async () => ({ success: true })
        })
      });
      
      const result = await saveBoardSettingsToServer(userId, testSettings);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain('/api/board-settings');
      expect(result).toBe(true);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버에서 설정을 성공적으로 불러옴', async () => {
      const userId = 'test-user';
      const testSettings = getTestBoardSettings();
      
      // 성공적인 응답 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: testSettings }),
        clone: () => ({
          json: async () => ({ settings: testSettings })
        })
      });
      
      const result = await loadBoardSettingsFromServer(userId);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockFetch.mock.calls[0][0].url).toContain(`/api/board-settings?userId=${encodeURIComponent(userId)}`);
      expect(result).toEqual(testSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
    });

    it('서버 오류 시 false를 반환', async () => {
      const userId = 'test-user';
      const testSettings = getTestBoardSettings();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await saveBoardSettingsToServer(userId, testSettings);
      
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
      
      const result = await loadBoardSettingsFromServer(userId);
      
      expect(result).toBeNull();
    });
  });

  describe('엣지 스타일 적용', () => {
    it('기본 엣지에 설정을 올바르게 적용', () => {
      const settings = getTestBoardSettings();
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].style).toEqual(
        expect.objectContaining({
          strokeWidth: settings.strokeWidth,
          stroke: settings.edgeColor
        })
      );
      
      expect(updatedEdges[0].markerEnd).toEqual({
        type: settings.markerEnd,
        width: settings.markerSize,
        height: settings.markerSize,
        color: settings.edgeColor
      });
    });

    it('선택된 엣지에 선택 색상을 적용', () => {
      const settings = getTestBoardSettings();
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', selected: true }
      ];
      
      const updatedEdges = applyEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].style?.stroke).toBe(settings.selectedEdgeColor);
      if (updatedEdges[0].markerEnd && typeof updatedEdges[0].markerEnd !== 'string') {
        expect(updatedEdges[0].markerEnd.color).toBe(settings.selectedEdgeColor);
      }
    });

    it('마커 설정이 없을 때 마커를 제거', () => {
      const settings: BoardSettings = {
        ...getTestBoardSettings(),
        markerEnd: null
      };
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }
      ];
      
      const updatedEdges = applyEdgeSettings(edges, settings);
      
      expect(updatedEdges[0].markerEnd).toBeUndefined();
    });
  });
}); 