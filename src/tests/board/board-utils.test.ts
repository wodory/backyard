/**
 * 파일명: board-utils.test.ts
 * 목적: 보드 유틸리티 함수 테스트
 * 역할: 보드 설정 관리 및 엣지 스타일 적용 테스트
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
} from '@/lib/board-utils';
import { ConnectionLineType, MarkerType, type EdgeMarker } from '@xyflow/react';
import { BOARD_SETTINGS_KEY } from '@/lib/board-constants';

// Map 기반 스토리지 구현
const storageMap = new Map<string, string>();

// localStorage 모킹
const mockStorage = {
  getItem: vi.fn((key: string) => storageMap.get(key) || null),
  setItem: vi.fn((key: string, value: string) => storageMap.set(key, value)),
  removeItem: vi.fn((key: string) => storageMap.delete(key)),
  clear: vi.fn(() => storageMap.clear()),
};

// Vitest의 모킹 API를 사용하여 localStorage 모킹
vi.stubGlobal('localStorage', mockStorage);

// fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('보드 유틸리티 테스트', () => {
  beforeEach(() => {
    // 모든 모킹 초기화
    vi.clearAllMocks();
    storageMap.clear();
    mockFetch.mockReset();
  });

  describe('로컬 스토리지 설정', () => {
    it('localStorage에 설정이 없으면 기본 설정을 반환', () => {
      // 테스트 시 스토리지는 비어 있음 (beforeEach에서 초기화됨)
      const settings = loadBoardSettings();
      expect(settings).toEqual(DEFAULT_BOARD_SETTINGS);
      expect(mockStorage.getItem).toHaveBeenCalledWith(BOARD_SETTINGS_KEY);
    });

    it('localStorage에서 저장된 설정을 불러옴', () => {
      const testSettings: BoardSettings = {
        ...DEFAULT_BOARD_SETTINGS,
        snapToGrid: true,
        animated: true,
      };
      
      // Map에 직접 설정값 저장
      storageMap.set(BOARD_SETTINGS_KEY, JSON.stringify(testSettings));
      
      const settings = loadBoardSettings();
      expect(settings).toEqual(testSettings);
      expect(mockStorage.getItem).toHaveBeenCalledWith(BOARD_SETTINGS_KEY);
    });

    it('localStorage에 설정을 저장', () => {
      const testSettings: BoardSettings = {
        ...DEFAULT_BOARD_SETTINGS,
        snapToGrid: true,
        animated: true,
      };

      saveBoardSettings(testSettings);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
      
      // 실제로 Map에 저장되었는지 확인
      expect(storageMap.get(BOARD_SETTINGS_KEY)).toBe(JSON.stringify(testSettings));
    });

    it('localStorage 오류 발생 시 기본 설정을 반환', () => {
      // 오류를 발생시키도록 getItem 모킹
      mockStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const settings = loadBoardSettings();
      expect(settings).toEqual(DEFAULT_BOARD_SETTINGS);
      expect(mockStorage.getItem).toHaveBeenCalledWith(BOARD_SETTINGS_KEY);
    });
  });

  describe('서버 설정 동기화', () => {
    const userId = 'test-user';
    const testSettings: BoardSettings = {
      ...DEFAULT_BOARD_SETTINGS,
      snapToGrid: true,
    };

    it('서버에 설정을 성공적으로 저장', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await saveBoardSettingsToServer(userId, testSettings);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/board-settings',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            settings: testSettings,
          }),
        })
      );
      expect(result).toBe(true);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
      
      // 실제로 Map에 저장되었는지 확인
      expect(storageMap.get(BOARD_SETTINGS_KEY)).toBe(JSON.stringify(testSettings));
    });

    it('서버에서 설정을 성공적으로 불러옴', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ settings: testSettings }),
      });

      const result = await loadBoardSettingsFromServer(userId);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/board-settings?userId=${encodeURIComponent(userId)}`
      );
      expect(result).toEqual(testSettings);
      
      // localStorage.setItem이 호출되었는지 확인
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        BOARD_SETTINGS_KEY,
        JSON.stringify(testSettings)
      );
      
      // 실제로 Map에 저장되었는지 확인
      expect(storageMap.get(BOARD_SETTINGS_KEY)).toBe(JSON.stringify(testSettings));
    });

    it('서버 오류 시 false를 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await saveBoardSettingsToServer(userId, testSettings);
      
      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalled();
      // 오류 시 localStorage는 수정되지 않아야 함
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('서버에서 설정이 없을 때 null을 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ settings: null }),
      });

      const result = await loadBoardSettingsFromServer(userId);
      
      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalled();
      // 설정이 없을 때 localStorage는 수정되지 않아야 함
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('엣지 스타일 적용', () => {
    const testSettings: BoardSettings = {
      ...DEFAULT_BOARD_SETTINGS,
      strokeWidth: 3,
      edgeColor: '#000000',
      selectedEdgeColor: '#FF0000',
      markerEnd: MarkerType.Arrow,
      markerSize: 15,
    };

    it('기본 엣지에 설정을 올바르게 적용', () => {
      const testEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        selected: false,
      };

      const [updatedEdge] = applyEdgeSettings([testEdge], testSettings);

      expect(updatedEdge).toMatchObject({
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
        animated: testSettings.animated,
        style: {
          strokeWidth: testSettings.strokeWidth,
          stroke: testSettings.edgeColor,
        },
        data: {
          edgeType: testSettings.connectionLineType,
          settings: {
            animated: testSettings.animated,
            connectionLineType: testSettings.connectionLineType,
            strokeWidth: testSettings.strokeWidth,
            edgeColor: testSettings.edgeColor,
            selectedEdgeColor: testSettings.selectedEdgeColor,
          }
        },
      });

      const markerEnd = updatedEdge.markerEnd as EdgeMarker;
      expect(markerEnd).toMatchObject({
        type: testSettings.markerEnd,
        width: testSettings.markerSize,
        height: testSettings.markerSize,
        color: testSettings.edgeColor,
      });
    });

    it('선택된 엣지에 선택 색상을 적용', () => {
      const testEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        selected: true,
      };

      const [updatedEdge] = applyEdgeSettings([testEdge], testSettings);

      expect(updatedEdge.style?.stroke).toBe(testSettings.selectedEdgeColor);
      const markerEnd = updatedEdge.markerEnd as EdgeMarker;
      expect(markerEnd.color).toBe(testSettings.selectedEdgeColor);
    });

    it('마커 설정이 없을 때 마커를 제거', () => {
      const settingsWithoutMarker = {
        ...testSettings,
        markerEnd: null,
      };

      const testEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        selected: false,
      };

      const [updatedEdge] = applyEdgeSettings([testEdge], settingsWithoutMarker);

      expect(updatedEdge.markerEnd).toBeUndefined();
    });
  });
}); 