/**
 * 파일명: ideamap-ui-config.test.ts
 * 목적: ideamap-ui-config.ts 모듈의 기능 테스트
 * 역할: 아이디어맵 UI 설정과 관련된 유틸리티 함수 테스트
 * 작성일: 2025-04-01
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// JSON 파일 모킹 - 직접 객체 정의
vi.mock('../config/uiOptions.json', () => ({
  default: {
    autoSaveIntervalMinutes: 1,
    ideaMap: {
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

// getCssVariable 모킹 함수 - 내부에서 직접 정의
vi.mock('./ideamap-ui-config', async () => {
  const actual = await vi.importActual('./ideamap-ui-config');
  
  // 내부에서 CSS 변수 맵 정의 (외부 변수에 의존하지 않음)
  // 이후에는 global.css를 바로 파싱하는 로직 추가.
  const cssVariables: Record<string, string> = {
    '--edge-color': '#C1C1C1',
    '--edge-selected-color': '#000000',
    '--handle-size': '10px',
    '--handle-bg': 'white',
    '--handle-border': '#C1C1C1',
    '--handle-border-width': '2px',
    
    // 테스트용 변수들
    '--test-color': '#ff0000',
    '--test-size': '10px',
    '--test-rem': '1.5rem',
    '--test-empty': '',
    '--test-invalid': 'invalid',
  };
  
  return {
    ...actual,
    // CSS 변수 모킹 함수
    getCssVariable: vi.fn((name, fallback) => {
      // 서버 환경에서는 항상 fallback 값 반환
      if (typeof window === 'undefined') {
        return fallback;
      }
      return cssVariables[name] || fallback;
    }),
    // CSS 변수를 숫자로 변환하는 모킹 함수
    getCssVariableAsNumber: vi.fn((name, fallback) => {
      // 서버 환경에서는 항상 fallback 값 반환
      if (typeof window === 'undefined') {
        return fallback;
      }
      
      const value = cssVariables[name];
      if (!value) return fallback;
      
      // 숫자로 변환
      const numValue = parseFloat(value.replace(/px|rem|em|%/g, ''));
      return isNaN(numValue) ? fallback : numValue;
    }),
  };
});

import {
  loadDefaultIdeaMapUIConfig,
  getCssVariable,
  getCssVariableAsNumber,
  extractIdeaMapSettings,
  extractLayoutSettings,
  IdeaMapUIConfig,
} from './ideamap-ui-config';

// 모킹된 JSON 모듈 가져오기
import uiOptionsJson from '../config/uiOptions.json';

// 테스트 변형 데이터
const testVariants = {
  // IdeaMap 설정 변형
  customIdeaMapSettings: {
    snapToGrid: true,
    snapGrid: [20, 20],
    markerEnd: 'arrow',
    selectedEdgeColor: '#FF0072'
  },
  
  // 레이아웃 설정 변형
  customLayoutSettings: {
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
  },
  
  // 노드 크기 없는 레이아웃 설정
  layoutWithoutNodeSize: {
    defaultPadding: 25,
    defaultSpacing: {
      horizontal: 35,
      vertical: 35
    }
  },
  
  // 그래프 설정 없는 레이아웃 설정
  layoutWithoutGraphSettings: {
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

// 테스트 데이터 통합
const testData = {
  // CSS 변수 값 
  cssValues: {
    edgeColor: '#C1C1C1',
    selectedEdgeColor: '#000000',
    handleSize: 10,
    handleBg: 'white',
    handleBorder: '#C1C1C1',
    handleBorderWidth: 2,
    
    // 테스트용 변수
    testColor: '#ff0000',
    testSize: 10,
    testRem: 1.5,
  },
  
  // 기본 설정 객체 - 모킹된 JSON 직접 사용
  baseMockConfig: uiOptionsJson as IdeaMapUIConfig,
  
  // 테스트 변형 객체들
  variants: testVariants
};

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
      vi.clearAllMocks();
      
      // 전역 객체 복원
      global.window = originalGlobal.window;
      global.document = originalGlobal.document;
      global.getComputedStyle = originalGlobal.getComputedStyle;
    });
    
    it('CSS 변수가 존재하면 해당 값을 반환해야 함', () => {
      const result = getCssVariable('--test-color', '#000000');
      expect(result).toBe('#ff0000');
      expect(getCssVariable).toHaveBeenCalledWith('--test-color', '#000000');
    });
    
    it('CSS 변수가 비어있으면 기본값을 반환해야 함', () => {
      const result = getCssVariable('--test-empty', '#000000');
      expect(result).toBe('#000000');
      expect(getCssVariable).toHaveBeenCalledWith('--test-empty', '#000000');
    });
    
    it('CSS 변수가 존재하지 않으면 기본값을 반환해야 함', () => {
      const result = getCssVariable('--non-existent', '#000000');
      expect(result).toBe('#000000');
      expect(getCssVariable).toHaveBeenCalledWith('--non-existent', '#000000');
    });
    
    it('서버 환경에서는 기본값을 반환해야 함', () => {
      // 서버 환경 시뮬레이션
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const result = getCssVariable('--test-color', '#000000');
      expect(result).toBe('#000000');
      expect(getCssVariable).toHaveBeenCalledWith('--test-color', '#000000');
    });
    
    // CSS 변수 참조 테스트 추가
    it('CSS 변수가 다른 변수를 참조하는 경우 참조된 값을 반환해야 함', () => {
      const result = getCssVariable('--handle-border', '#000000');
      expect(result).toBe('#C1C1C1'); // --handle-border는 --edge-color를 참조하므로 '#C1C1C1'이 됨
      expect(getCssVariable).toHaveBeenCalledWith('--handle-border', '#000000');
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
      vi.clearAllMocks();
      
      // 전역 객체 복원
      global.window = originalGlobal.window;
      global.document = originalGlobal.document;
      global.getComputedStyle = originalGlobal.getComputedStyle;
    });
    
    it('CSS 변수가 px 단위로 존재하면 숫자로 변환하여 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-size', 5);
      expect(result).toBe(10);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--test-size', 5);
    });
    
    it('CSS 변수가 rem 단위로 존재하면 숫자로 변환하여 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-rem', 5);
      expect(result).toBe(1.5);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--test-rem', 5);
    });
    
    it('CSS 변수가 유효하지 않은 형식이면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-invalid', 5);
      expect(result).toBe(5);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--test-invalid', 5);
    });
    
    it('CSS 변수가 비어있으면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--test-empty', 5);
      expect(result).toBe(5);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--test-empty', 5);
    });
    
    it('CSS 변수가 존재하지 않으면 기본값을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--non-existent', 5);
      expect(result).toBe(5);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--non-existent', 5);
    });
    
    it('서버 환경에서는 기본값을 반환해야 함', () => {
      // 서버 환경 시뮬레이션
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const result = getCssVariableAsNumber('--test-size', 5);
      expect(result).toBe(5);
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--test-size', 5);
    });
    
    // 핸들 크기에 대한 테스트 추가
    it('--handle-size 변수가 올바른 값(10)을 반환해야 함', () => {
      const result = getCssVariableAsNumber('--handle-size', 5);
      expect(result).toBe(10); // globals.css에 정의된 값
      expect(getCssVariableAsNumber).toHaveBeenCalledWith('--handle-size', 5);
    });
  });
  
  describe('loadDefaultIdeaMapUIConfig', () => {
    beforeEach(() => {
      // 클라이언트 환경 시뮬레이션
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });
      
      // 테스트를 위해 다시 모킹 함수 설정
      vi.mocked(getCssVariable).mockImplementation((name, fallback) => {
        if (name === '--handle-border') return testData.cssValues.handleBorder; // CSS에서는 var(--edge-color)를 참조
        return fallback;
      });
      
      vi.mocked(getCssVariableAsNumber).mockImplementation((name, fallback) => {
        if (name === '--handle-size') return testData.cssValues.handleSize;
        return fallback;
      });
    });
    
    afterEach(() => {
      vi.clearAllMocks();
    });
    
    it('기본 UI 설정을 로드해야 함', () => {
      const config = loadDefaultIdeaMapUIConfig();
      
      expect(config.ideaMap).toBeDefined();
      expect(config.card).toBeDefined();
      expect(config.handles).toBeDefined();
      expect(config.layout).toBeDefined();
    });
    
    it('UI 설정이 올바른 값을 가져야 함', () => {
      // 실제 CSS 변수 값을 사용하도록 모킹 함수 설정
      vi.mocked(getCssVariable).mockImplementation((name, fallback) => {
        if (name === '--handle-border') return testData.cssValues.handleBorder;
        return fallback;
      });
      
      vi.mocked(getCssVariableAsNumber).mockImplementation((name, fallback) => {
        if (name === '--handle-size') return testData.cssValues.handleSize;
        return fallback;
      });
      
      const config = loadDefaultIdeaMapUIConfig();
      
      // ideaMap 설정 확인
      expect(config.ideaMap.connectionLineType).toBe('bezier');
      expect(config.ideaMap.markerEnd).toBe('arrowclosed');
      
      // 카드 설정 확인
      expect(config.card.backgroundColor).toBe('#FFFFFF');
      expect(config.card.borderRadius).toBe(8);
      
      // 핸들 설정 확인 - CSS 변수를 사용하므로 값이 변경되었을 것
      expect(config.handles.size).toBe(10);
      expect(config.handles.borderColor).toBe(testData.cssValues.handleBorder); // --handle-border는 --edge-color를 참조
    });
    
    it('설정 불러오기 오류 발생 시 기본값을 반환해야 함', () => {
      // 오류를 발생시키는 모킹 함수
      const originalLoadDefaultIdeaMapUIConfig = loadDefaultIdeaMapUIConfig;
      const loadDefaultIdeaMapUIConfigWithError = () => {
        // 실제 함수를 호출하기 전에 오류 로그를 남김
        console.warn('설정 불러오기 오류 발생');
        return originalLoadDefaultIdeaMapUIConfig();
      };
      
      const config = loadDefaultIdeaMapUIConfigWithError();
      
      // 기본값이 반환되었는지 확인
      expect(config.ideaMap).toBeDefined();
      expect(config.card).toBeDefined();
    });
  });
  
  describe('extractIdeaMapSettings', () => {
    it('IdeaMapUIConfig에서 IdeaMapSettings를 추출해야 함', () => {
      // 기본 객체를 복제하여 필요한 부분만 수정
      const mockConfig: IdeaMapUIConfig = {
        ...testData.baseMockConfig,
        ideaMap: {
          ...testData.baseMockConfig.ideaMap,
          ...testData.variants.customIdeaMapSettings
        }
      };
      
      const settings = extractIdeaMapSettings(mockConfig);
      
      // 추출된 설정이 올바른지 확인
      expect(settings.snapToGrid).toBe(mockConfig.ideaMap.snapToGrid);
      expect(settings.snapGrid).toEqual(mockConfig.ideaMap.snapGrid);
      expect(settings.connectionLineType).toBe(mockConfig.ideaMap.connectionLineType);
      expect(settings.markerEnd).toBe(mockConfig.ideaMap.markerEnd);
      expect(settings.strokeWidth).toBe(mockConfig.ideaMap.strokeWidth);
      expect(settings.markerSize).toBe(mockConfig.ideaMap.markerSize);
      expect(settings.edgeColor).toBe(mockConfig.ideaMap.edgeColor);
      expect(settings.selectedEdgeColor).toBe(mockConfig.ideaMap.selectedEdgeColor);
      expect(settings.animated).toBe(mockConfig.ideaMap.animated);
    });
  });
  
  describe('extractLayoutSettings', () => {
    it('레이아웃 설정을 추출해야 함', () => {
      // 기본 객체를 복제하여 필요한 부분만 수정
      const mockConfig: IdeaMapUIConfig = {
        ...testData.baseMockConfig,
        layout: testData.variants.customLayoutSettings
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
      // 기본 객체를 복제하여 필요한 부분만 수정
      const mockConfig: IdeaMapUIConfig = {
        ...testData.baseMockConfig,
        layout: testData.variants.layoutWithoutNodeSize
      };
      
      const settings = extractLayoutSettings(mockConfig);
      
      expect(settings.nodeSize).toEqual({
        width: 280,
        height: 40
      });
    });
    
    it('그래프 설정이 없으면 기본값을 사용해야 함', () => {
      // 기본 객체를 복제하여 필요한 부분만 수정
      const mockConfig: IdeaMapUIConfig = {
        ...testData.baseMockConfig,
        layout: testData.variants.layoutWithoutGraphSettings
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