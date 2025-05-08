/**
 * 파일명: src/lib/settings-validator.test.ts
 * 목적: 설정 스키마와 검증 유틸리티 테스트
 * 역할: Zod 스키마와 검증 유틸리티의 정확성 검증
 * 작성일: 2025-04-21
 */

import { describe, test, expect, vi } from 'vitest';
import {
  validateSettings,
  getDefaultSettings,
  mergeWithDefaults,
  extractSettingSection
} from './settings-validator';
import { EdgeSettings, FullSettings, IdeaMapSettings } from './schema/settings-schema';

// 로그 메소드 모킹
vi.mock('@/lib/logger', () => ({
  default: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('설정 스키마 및 검증 유틸리티 테스트', () => {
  describe('getDefaultSettings', () => {
    test('TC 1.4: 특정 섹션의 기본값을 반환한다', () => {
      const ideaMapDefaults = getDefaultSettings('ideamap');
      
      // 기본값 확인
      expect(ideaMapDefaults).toBeDefined();
      expect(ideaMapDefaults.edge).toBeDefined();
      expect(ideaMapDefaults.edge.strokeWidth).toBe(3);
      expect(ideaMapDefaults.edge.edgeColor).toBe('#C1C1C1');
      expect(ideaMapDefaults.edge.markerEnd).toBe('arrowclosed');
    });
    
    test('섹션을 지정하지 않으면 전체 설정의 기본값을 반환한다', () => {
      const fullDefaults = getDefaultSettings() as FullSettings;
      
      // 모든 섹션이 있는지 확인
      expect(fullDefaults).toBeDefined();
      expect(fullDefaults.theme).toBeDefined();
      expect(fullDefaults.general).toBeDefined();
      expect(fullDefaults.ideamap).toBeDefined();
    });
  });
  
  describe('validateSettings', () => {
    test('TC 1.1: 유효한 설정 객체를 검증하면 성공적으로 검증되고 입력 객체가 반환된다', () => {
      const validSettings = {
        mode: 'dark',
        accentColor: '#FF5500'
      };
      
      const result = validateSettings('theme', validSettings);
      
      expect(result).toEqual(validSettings);
    });
    
    test('TC 1.2: 일부 필드가 누락된 설정 객체를 safe 모드로 검증하면 누락된 필드가 기본값으로 채워진다', () => {
      const partialSettings = {
        mode: 'dark'
      };
      
      const result = validateSettings('theme', partialSettings);
      
      expect(result.mode).toBe('dark');
      expect(result.accentColor).toBe('#3498db'); // 기본값
    });
    
    test('TC 1.3: 유효하지 않은 타입의 값을 가진 설정 객체를 strict 모드로 검증하면 오류가 발생한다', () => {
      const invalidSettings = {
        mode: 'invalid-mode', // 'light' 또는 'dark'만 유효
        accentColor: '#3498db'
      };
      
      expect(() => validateSettings('theme', invalidSettings, 'strict')).toThrow();
    });
    
    test('TC 1.3: 유효하지 않은 타입의 값을 가진 설정 객체를 safe 모드로 검증하면 기본값 객체가 반환된다', () => {
      const invalidSettings = {
        mode: 'invalid-mode', // 'light' 또는 'dark'만 유효
        accentColor: '#3498db'
      };
      
      const result = validateSettings('theme', invalidSettings, 'safe');
      
      // 기본값 반환 확인
      expect(result.mode).toBe('light'); // 기본값
      expect(result.accentColor).toBe('#3498db');
    });
  });
  
  describe('mergeWithDefaults', () => {
    test('부분 설정과 기본값을 병합한다', () => {
      // 부분 설정 객체 생성
      const partialIdeaMapSettings: Partial<IdeaMapSettings> = {
        edge: {
          edgeColor: '#FF0000',
          animated: false,
          strokeWidth: 5,
          markerEnd: 'arrow',
          markerSize: 20,
          selectedEdgeColor: '#000000',
          connectionLineType: 'straight'
        }
      };
      
      const result = mergeWithDefaults('ideamap', partialIdeaMapSettings);
      
      // 병합 확인
      expect(result.edge.edgeColor).toBe('#FF0000');
      expect(result.edge.strokeWidth).toBe(5); // 변경된 값
      expect(result.edge.markerEnd).toBe('arrow'); // 변경된 값
      expect(result.edge.connectionLineType).toBe('straight'); // 변경된 값
      expect(result.snapGrid).toEqual([15, 15]); // 기본값 유지
    });
  });
  
  describe('extractSettingSection', () => {
    test('전체 설정에서 특정 섹션을 추출한다', () => {
      const fullSettings: FullSettings = {
        theme: {
          mode: 'dark',
          accentColor: '#FF5500'
        },
        general: {
          autoSaveIntervalMinutes: 5
        },
        ideamap: getDefaultSettings('ideamap')
      };
      
      const themeSettings = extractSettingSection(fullSettings, 'theme');
      
      expect(themeSettings.mode).toBe('dark');
      expect(themeSettings.accentColor).toBe('#FF5500');
    });
    
    test('설정이 null이면 기본값을 반환한다', () => {
      const themeSettings = extractSettingSection(null, 'theme');
      
      expect(themeSettings.mode).toBe('light'); // 기본값
    });
    
    test('설정에 해당 섹션이 없으면 기본값을 반환한다', () => {
      const partialFullSettings = {
        general: {
          autoSaveIntervalMinutes: 5
        }
      } as FullSettings;
      
      const themeSettings = extractSettingSection(partialFullSettings, 'theme');
      
      expect(themeSettings.mode).toBe('light'); // 기본값
    });
  });
}); 