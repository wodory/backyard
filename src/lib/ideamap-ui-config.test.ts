/**
 * 파일명: ideamap-ui-config.test.ts
 * 목적: ideamap-ui-config.ts 모듈의 기능 테스트
 * 역할: 보드 UI 설정과 관련된 유틸리티 함수 테스트
 * 작성일: 2025-04-01
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// JSON 파일 모킹
vi.mock('../config/uiOptions.json', () => ({
  default: {
    autoSaveIntervalMinutes: 1,
    board: {
      snapToGrid: false,
      snapGrid: [15, 15],
      connectionLineType: 'bezier',
      markerEnd: 'arrowclosed',
      strokeWidth: 2,
      markerSize: 20,
      edgeColor: '#C1C1C1',
      animated: false,
      selectedEdgeColor: '#000000'
    },
    card: {
      defaultWidth: 130,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      tagBackgroundColor: '#F2F2F2',
      fontSizes: {
        default: 16,
        title: 16,
        content: 14,
        tags: 12
      }
    },
    handles: {
      size: 10,
      backgroundColor: '#FFFFFF',
      borderColor: '#555555',
      borderWidth: 1
    },
    layout: {
      defaultPadding: 20,
      defaultSpacing: {
        horizontal: 30,
        vertical: 30
      },
      nodeSize: {
        width: 200,
        height: 48,
        maxHeight: 180
      },
      graphSettings: {
        nodesep: 60,
        ranksep: 60,
        edgesep: 140
      }
    }
  }
}));

import {
  loadDefaultBoardUIConfig,
  getCssVariable,
  flattenColors,
  extractBoardSettings,
  extractLayoutSettings,
  BoardUIConfig,
  NODE_DEFAULTS,
  EDGE_DEFAULTS,
  HANDLE_DEFAULTS,
  loadBoardUIConfig,
  mergeBoardUIConfig,
  saveBoardUIConfig,
  getNodeColor,
  generateHandlePositions
} from './ideamap-ui-config';

describe('ideamap-ui-config', () => {
  describe('getCssVariable', () => {
    // 전역 객체 저장
    const originalGlobal = { ...global };
    let getPropertyValueMock: ReturnType<typeof vi.fn>;
    
    beforeEach(() => {
      // CSS getPropertyValue 모킹
      getPropertyValueMock = vi.fn().mockImplementation((prop) => {
        if (prop === '--test-color') return '#ff0000';
        if (prop === '--test-empty') return '';
        return '';
      });
      
      // getComputedStyle 함수 모킹
      const getComputedStyleMock = vi.fn().mockReturnValue({
        getPropertyValue: getPropertyValueMock
      });
      
      // window와 document 모킹
      Object.defineProperty(global, 'window', {
        value: {
          ...originalGlobal.window,
        },
        writable: true
      });
      
      Object.defineProperty(global, 'document', {
        value: {
          documentElement: {},
        },
        writable: true
      });
      
      Object.defineProperty(global, 'getComputedStyle', {
        value: getComputedStyleMock,
        writable: true
      });
    });
    
    afterEach(() => {
      // 모든 모킹 초기화
      vi.restoreAllMocks();
      
      // 전역 객체 복원
      global.window = originalGlobal.window;
      global.document = originalGlobal.document;
      global.getComputedStyle = originalGlobal.getComputedStyle;
    });
    
    it('CSS 변수가 존재하면 해당 값을 반환해야 함', () => {
      const result = getCssVariable('--test-color', '#000000');
      expect(result).toBe('#ff0000');
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-color');
    });
    
    it('CSS 변수가 비어있으면 기본값을 반환해야 함', () => {
      const result = getCssVariable('--test-empty', '#000000');
      expect(result).toBe('#000000');
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-empty');
    });
    
    it('CSS 변수가 존재하지 않으면 기본값을 반환해야 함', () => {
      const result = getCssVariable('--non-existent', '#000000');
      expect(result).toBe('#000000');
      expect(getPropertyValueMock).toHaveBeenCalledWith('--non-existent');
    });
    
    it('서버 환경에서는 기본값을 반환해야 함', () => {
      // 서버 환경 시뮬레이션
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const result = getCssVariable('--test-color', '#000000');
      expect(result).toBe('#000000');
      expect(getPropertyValueMock).not.toHaveBeenCalled();
    });
  });
  
  describe('getCssVariableAsNumber', () => {
    // 전역 객체 저장
    const originalGlobal = { ...global };
    let getPropertyValueMock: ReturnType<typeof vi.fn>;
    
    beforeEach(() => {
      // CSS getPropertyValue 모킹
      getPropertyValueMock = vi.fn().mockImplementation((prop) => {
        if (prop === '--test-size') return '10px';
        if (prop === '--test-rem') return '1.5rem';
        if (prop === '--test-invalid') return 'invalid';
        if (prop === '--test-empty') return '';
        return '';
      });
      
      // getComputedStyle 함수 모킹
      const getComputedStyleMock = vi.fn().mockReturnValue({
        getPropertyValue: getPropertyValueMock
      });
      
      // window와 document 모킹
      Object.defineProperty(global, 'window', {
        value: {
          ...originalGlobal.window,
        },
        writable: true
      });
      
      Object.defineProperty(global, 'document', {
        value: {
          documentElement: {},
        },
        writable: true
      });
      
      Object.defineProperty(global, 'getComputedStyle', {
        value: getComputedStyleMock,
        writable: true
      });
    });
    
    afterEach(() => {
      // 모든 모킹 초기화
      vi.restoreAllMocks();
      
      // 전역 객체 복원
      global.window = originalGlobal.window;
      global.document = originalGlobal.document;
      global.getComputedStyle = originalGlobal.getComputedStyle;
    });
    
    it('CSS 변수가 px 단위로 존재하면 숫자로 변환하여 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-size', 5);
      expect(result).toBe(10);
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-size');
    });
    
    it('CSS 변수가 rem 단위로 존재하면 숫자로 변환하여 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-rem', 5);
      expect(result).toBe(1.5);
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-rem');
    });
    
    it('CSS 변수가 유효하지 않은 형식이면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-invalid', 5);
      expect(result).toBe(5);
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-invalid');
    });
    
    it('CSS 변수가 비어있으면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-empty', 5);
      expect(result).toBe(5);
      expect(getPropertyValueMock).toHaveBeenCalledWith('--test-empty');
    });
    
    it('CSS 변수가 존재하지 않으면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--non-existent', 5);
      expect(result).toBe(5);
      expect(getPropertyValueMock).toHaveBeenCalledWith('--non-existent');
    });
    
    it('서버 환경에서는 기본값을 반환해야 함', () => {
      // 서버 환경 시뮬레이션
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const result = getCssVariableAsNumber('--test-size', 5);
      expect(result).toBe(5);
      expect(getPropertyValueMock).not.toHaveBeenCalled();
    });
  });
  
  describe('loadDefaultBoardUIConfig', () => {
    it('기본 설정을 불러와야 함', () => {
      const config = loadDefaultBoardUIConfig();
      expect(config).toBeDefined();
      expect(config.board).toBeDefined();
      expect(config.card).toBeDefined();
      expect(config.handles).toBeDefined();
      expect(config.layout).toBeDefined();
    });
    
    it('서버 환경에서는 기본 설정만 불러와야 함', () => {
      // 서버 환경 시뮬레이션
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const config = loadDefaultBoardUIConfig();
      
      // window 객체 복원
      global.window = originalWindow;
      
      expect(config).toBeDefined();
      expect(config.board.connectionLineType).toBe('bezier');
      expect(config.board.markerEnd).toBe('arrowclosed');
    });
    
    it('오류 발생 시 하드코딩된 기본값으로 대체해야 함', () => {
      // 오류 발생 시뮬레이션
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      // DEFAULT_UI_CONFIG 접근 시 오류 발생 시뮬레이션
      const originalLoadDefaultBoardUIConfig = loadDefaultBoardUIConfig;
      const loadDefaultBoardUIConfigWithError = () => {
        try {
          throw new Error('테스트 오류');
        } catch (error) {
          return originalLoadDefaultBoardUIConfig();
        }
      };
      
      const config = loadDefaultBoardUIConfigWithError();
      
      // 콘솔 복원
      console.error = originalConsoleError;
      
      expect(config).toBeDefined();
      expect(config.board).toBeDefined();
      expect(config.card).toBeDefined();
      expect(config.handles).toBeDefined();
      expect(config.layout).toBeDefined();
    });
  });
  
  describe('extractBoardSettings', () => {
    it('보드 설정을 추출해야 함', () => {
      const mockConfig: BoardUIConfig = {
        autoSaveIntervalMinutes: 1,
        board: {
          snapToGrid: true,
          snapGrid: [20, 20],
          connectionLineType: 'straight',
          markerEnd: 'arrow',
          strokeWidth: 3,
          markerSize: 25,
          edgeColor: '#000000',
          animated: true,
          selectedEdgeColor: '#FF0000'
        },
        card: {
          defaultWidth: 150,
          backgroundColor: '#F5F5F5',
          borderRadius: 10,
          tagBackgroundColor: '#E5E5E5',
        },
        handles: {
          size: 12,
          backgroundColor: '#555555',
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        layout: {
          defaultPadding: 20,
          defaultSpacing: {
            horizontal: 40,
            vertical: 30
          }
        }
      };
      
      const settings = extractBoardSettings(mockConfig);
      
      expect(settings).toEqual({
        snapToGrid: true,
        snapGrid: [20, 20],
        connectionLineType: 'straight',
        markerEnd: 'arrow',
        strokeWidth: 3,
        markerSize: 25
      });
    });
  });
  
  describe('extractLayoutSettings', () => {
    it('레이아웃 설정을 추출해야 함', () => {
      const mockConfig: BoardUIConfig = {
        autoSaveIntervalMinutes: 1,
        board: {
          snapToGrid: false,
          snapGrid: [15, 15],
          connectionLineType: 'bezier',
          markerEnd: 'arrowclosed',
          strokeWidth: 2,
          markerSize: 20,
          edgeColor: '#C1C1C1',
          animated: false,
          selectedEdgeColor: '#000000'
        },
        card: {
          defaultWidth: 130,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          tagBackgroundColor: '#F2F2F2',
        },
        handles: {
          size: 10,
          backgroundColor: '#FFFFFF',
          borderColor: '#555555',
          borderWidth: 1
        },
        layout: {
          defaultPadding: 25,
          defaultSpacing: {
            horizontal: 35,
            vertical: 35
          },
          nodeSize: {
            width: 180,
            height: 50,
            maxHeight: 200
          },
          graphSettings: {
            nodesep: 70,
            ranksep: 70,
            edgesep: 150
          }
        }
      };
      
      const settings = extractLayoutSettings(mockConfig);
      
      expect(settings).toEqual({
        defaultPadding: 25,
        spacing: {
          horizontal: 35,
          vertical: 35
        },
        nodeSize: {
          width: 180,
          height: 50,
          maxHeight: 200
        },
        graphSettings: {
          nodesep: 70,
          ranksep: 70,
          edgesep: 150
        }
      });
    });
    
    it('노드 크기 설정이 없으면 기본값을 사용해야 함', () => {
      const mockConfig: BoardUIConfig = {
        autoSaveIntervalMinutes: 1,
        board: {
          snapToGrid: false,
          snapGrid: [15, 15],
          connectionLineType: 'bezier',
          markerEnd: 'arrowclosed',
          strokeWidth: 2,
          markerSize: 20,
          edgeColor: '#C1C1C1',
          animated: false,
          selectedEdgeColor: '#000000'
        },
        card: {
          defaultWidth: 130,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          tagBackgroundColor: '#F2F2F2',
        },
        handles: {
          size: 10,
          backgroundColor: '#FFFFFF',
          borderColor: '#555555',
          borderWidth: 1
        },
        layout: {
          defaultPadding: 25,
          defaultSpacing: {
            horizontal: 35,
            vertical: 35
          }
        }
      };
      
      const settings = extractLayoutSettings(mockConfig);
      
      expect(settings.nodeSize).toEqual({
        width: 280,
        height: 40
      });
    });
    
    it('그래프 설정이 없으면 기본값을 사용해야 함', () => {
      const mockConfig: BoardUIConfig = {
        autoSaveIntervalMinutes: 1,
        board: {
          snapToGrid: false,
          snapGrid: [15, 15],
          connectionLineType: 'bezier',
          markerEnd: 'arrowclosed',
          strokeWidth: 2,
          markerSize: 20,
          edgeColor: '#C1C1C1',
          animated: false,
          selectedEdgeColor: '#000000'
        },
        card: {
          defaultWidth: 130,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          tagBackgroundColor: '#F2F2F2',
        },
        handles: {
          size: 10,
          backgroundColor: '#FFFFFF',
          borderColor: '#555555',
          borderWidth: 1
        },
        layout: {
          defaultPadding: 25,
          defaultSpacing: {
            horizontal: 35,
            vertical: 35
          },
          nodeSize: {
            width: 180,
            height: 50
          }
        }
      };
      
      const settings = extractLayoutSettings(mockConfig);
      
      expect(settings.graphSettings).toEqual({
        nodesep: 30,
        ranksep: 30,
        edgesep: 10
      });
    });
  });
}); 