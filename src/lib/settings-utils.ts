/**
 * 파일명: src/lib/settings-utils.ts
 * 목적: 설정 관련 유틸리티 함수 제공
 * 역할: 설정 로드, 저장, 병합 등의 기능 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 타입 에러 수정
 */

import { SettingsData } from '@/types/settings';
import defaultSettingsJson from '@/config/uiOptions.json';

/**
 * 기본 설정 가져오기
 * @returns {SettingsData} 기본 설정 객체
 */
export const getDefaultSettings = (): SettingsData => {
  // 타입 단언을 사용하여 uiOptions.json의 구조가 SettingsData와 일치함을 보장
  return defaultSettingsJson.DEFAULT_SETTINGS as unknown as SettingsData;
};

/**
 * 설정 객체의 깊은 병합(deep merge) 수행
 * @param {Partial<SettingsData>} target - 대상 설정 객체 (일반적으로 기본 설정)
 * @param {Partial<SettingsData>} source - 소스 설정 객체 (일반적으로 사용자 설정)
 * @returns {SettingsData} 병합된 설정 객체
 */
export const deepMergeSettings = (
  target: Partial<SettingsData>, 
  source?: Partial<SettingsData>
): SettingsData => {
  // source가 없거나 빈 객체면 target을 기본값과 병합
  if (!source || Object.keys(source).length === 0) {
    return { ...getDefaultSettings(), ...target };
  }

  // 결과 객체 초기화
  const result: Record<string, any> = { ...target };

  // source의 모든 키에 대해
  Object.keys(source).forEach(key => {
    const sourceValue = source[key as keyof SettingsData];
    const targetValue = target[key as keyof SettingsData];

    // source 값이 객체이고 null이 아니고 target 값도 객체이고 null이 아니면
    if (
      sourceValue && 
      typeof sourceValue === 'object' && 
      !Array.isArray(sourceValue) &&
      targetValue && 
      typeof targetValue === 'object' && 
      !Array.isArray(targetValue)
    ) {
      // 재귀적으로 하위 객체 병합
      result[key] = deepMergeSettings(
        targetValue as Partial<SettingsData>, 
        sourceValue as Partial<SettingsData>
      );
    } else {
      // 아니면 source 값으로 덮어쓰기
      result[key] = sourceValue;
    }
  });

  return result as SettingsData;
};

/**
 * 설정의 한 부분만 추출하고 기본값과 병합
 * @param {SettingsData | null | undefined} settings - 전체 설정 객체
 * @param {K} key - 추출할 설정의 키
 * @returns {SettingsData[K]} 추출된 설정 값
 */
export function extractAndMergeSettings<K extends keyof SettingsData>(
  settings: SettingsData | null | undefined,
  key: K
): SettingsData[K] {
  const defaultValue = getDefaultSettings()[key];
  const userValue = settings?.[key];
  
  if (!userValue) {
    return defaultValue;
  }
  
  if (typeof defaultValue === 'object' && typeof userValue === 'object') {
    return {
      ...defaultValue,
      ...userValue
    } as SettingsData[K];
  }
  
  return userValue;
} 