/**
 * 파일명: src/lib/settings-utils.test.ts
 * 목적: 설정 관련 유틸리티 함수 테스트
 * 역할: 설정 검증 및 기본값 함수의 동작 확인
 * 작성일: 2025-05-07
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateSettings, getDefaultSettings } from './settings-utils';
import { 
  ThemeSettings, 
  GeneralSettings, 
  IdeaMapSettings, 
  FullSettings 
} from './schema/settings-schema';
import createLogger from './logger';

// 목 로거 설정
vi.mock('./logger', () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }))
}));

describe('설정 유틸리티 함수 테스트', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };

  afterEach(() => {
    vi.clearAllMocks();
    (createLogger as any).mockReturnValue(mockLogger);
  });

  // TC 1.1: 유효한 설정 객체를 `validateSettings` 함수에 전달했을 때, 성공적으로 검증되고 입력 객체가 반환되는지 확인
  it('TC 1.1: 유효한 설정 객체는 validateSettings를 통과하고 동일한 객체가 반환된다', () => {
    // 유효한 테마 설정
    const validThemeSettings: ThemeSettings = {
      mode: 'dark',
      accentColor: '#FF5733'
    };

    // 검증 실행
    const result = validateSettings('theme', validThemeSettings);

    // 반환된 객체가 입력과 일치하는지 확인
    expect(result).toEqual(validThemeSettings);
    expect(result.mode).toBe('dark');
    expect(result.accentColor).toBe('#FF5733');
  });

  // TC 1.2: 일부 필드가 누락된 설정 객체를 `validateSettings` 함수의 `safe` 모드로 전달했을 때, 누락된 필드가 기본값으로 채워져서 반환되는지 확인
  it('TC 1.2: 일부 필드가 누락된 설정은 safe 모드에서 기본값으로 채워진다', () => {
    // 일부 필드가 누락된 일반 설정
    const partialGeneralSettings = {};

    // 검증 실행 (safe 모드가 기본값)
    const result = validateSettings('general', partialGeneralSettings);

    // 누락된 필드가 기본값으로 채워졌는지 확인
    expect(result).toHaveProperty('autoSaveIntervalMinutes');
    expect(result.autoSaveIntervalMinutes).toBe(1); // 기본값
  });

  // TC 1.3-1: 유효하지 않은 타입의 값을 가진 설정 객체를 `validateSettings` 함수의 `strict` 모드에서 전달했을 때 오류가 발생하는지 확인
  it('TC 1.3-1: 유효하지 않은 설정은 strict 모드에서 오류를 발생시킨다', () => {
    // 유효하지 않은 테마 설정 (accentColor가 유효하지 않은 형식)
    const invalidThemeSettings = {
      mode: 'dark',
      accentColor: 'invalid-color' // 올바른 HEX 색상 형식이 아님
    };

    // strict 모드에서 오류 발생 예상
    expect(() => {
      validateSettings('theme', invalidThemeSettings, 'strict');
    }).toThrow();
  });

  // TC 1.3-2: 유효하지 않은 타입의 값을 가진 설정 객체를 `validateSettings` 함수의 `safe` 모드에서 전달했을 때 기본값이 반환되는지 확인
  it('TC 1.3-2: 유효하지 않은 설정은 safe 모드에서 기본값으로 복구된다', () => {
    // 유효하지 않은 테마 설정 (accentColor가 유효하지 않은 형식)
    const invalidThemeSettings = {
      mode: 'dark',
      accentColor: 'invalid-color' // 올바른 HEX 색상 형식이 아님
    };

    // safe 모드에서 기본값으로 복구 예상
    const result = validateSettings('theme', invalidThemeSettings, 'safe');
    
    // mode는 유효한 값이 유지되고, accentColor는 기본값으로 복구되었는지 확인
    expect(result.mode).toBe('dark');
    expect(result.accentColor).toBe('#3498db'); // 기본값
  });

  // TC 1.4: `getDefaultSettings('ideamap')` 호출 시, `ideaMapSettingsSchema`에 정의된 기본값으로 구성된 객체가 반환되는지 확인
  it('TC 1.4: getDefaultSettings는 지정된 섹션의 기본값 객체를 반환한다', () => {
    // 아이디어맵 기본 설정 가져오기
    const defaultIdeaMapSettings = getDefaultSettings('ideamap');

    // 기본값이 올바르게 포함되어 있는지 확인
    expect(defaultIdeaMapSettings).toHaveProperty('edge');
    expect(defaultIdeaMapSettings).toHaveProperty('snapGrid');
    expect(defaultIdeaMapSettings).toHaveProperty('snapToGrid');
    expect(defaultIdeaMapSettings).toHaveProperty('layout');
    expect(defaultIdeaMapSettings).toHaveProperty('cardNode');
    
    // 몇 가지 기본값 심층 확인
    expect(defaultIdeaMapSettings.edge.strokeWidth).toBe(3);
    expect(defaultIdeaMapSettings.snapToGrid).toBe(true);
    expect(defaultIdeaMapSettings.snapGrid).toEqual([15, 15]);
  });

  // 추가 테스트: 완전히 잘못된 데이터 형식 (객체가 아닌 값)
  it('완전히 잘못된 데이터 형식은 safe 모드에서 완전한 기본값으로 대체된다', () => {
    // 객체가 아닌 값 (문자열)
    const invalidData = 'not an object';

    // safe 모드에서 완전한 기본값으로 대체 예상
    const result = validateSettings('full', invalidData, 'safe');
    
    // 완전한 기본값 객체가 반환되었는지 확인
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('general');
    expect(result).toHaveProperty('ideamap');
    
    // theme 기본값 확인
    expect(result.theme.mode).toBe('light');
    expect(result.theme.accentColor).toBe('#3498db');
    
    // general 기본값 확인
    expect(result.general.autoSaveIntervalMinutes).toBe(1);
  });

  // 추가 테스트: 객체의 중첩 구조 유효성 검사
  it('객체의 중첩 구조가 올바르게 검증되고 복구된다', () => {
    // 일부 중첩 구조가 유효하지 않은 아이디어맵 설정
    const partiallyInvalidIdeaMapSettings = {
      edge: {
        strokeWidth: -1, // 양수여야 하는데 음수
        edgeColor: '#VALID', 
        animated: 'not-a-boolean' // 불리언이어야 함
      },
      snapGrid: [10, 10], // 유효
      layout: 'not-an-object' // 객체여야 함
    };

    // safe 모드에서 유효한 부분은 유지하고 유효하지 않은 부분은 기본값으로 복구 예상
    const result = validateSettings('ideamap', partiallyInvalidIdeaMapSettings, 'safe');
    
    // 유효한 값은 유지
    expect(result.snapGrid).toEqual([10, 10]);
    
    // 유효하지 않은 값은 기본값으로 복구
    expect(result.edge.strokeWidth).toBe(3); // 음수가 아닌 기본값
    expect(result.edge.animated).toBe(false); // 불리언 기본값
    expect(result.layout).toHaveProperty('defaultPadding'); // 객체 구조 복구
  });

  // 추가 테스트: null 또는 undefined 입력 처리
  it('null 또는 undefined 입력은 완전한 기본값으로 대체된다', () => {
    // null 입력으로 테스트
    const resultFromNull = validateSettings('theme', null, 'safe');
    
    // 완전한 테마 기본값 확인
    expect(resultFromNull.mode).toBe('light');
    expect(resultFromNull.accentColor).toBe('#3498db');
    
    // undefined 입력으로 테스트
    const resultFromUndefined = validateSettings('theme', undefined, 'safe');
    
    // 완전한 테마 기본값 확인
    expect(resultFromUndefined.mode).toBe('light');
    expect(resultFromUndefined.accentColor).toBe('#3498db');
  });
}); 