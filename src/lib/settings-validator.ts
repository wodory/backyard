/**
 * 파일명: src/lib/settings-validator.ts
 * 목적: 설정 데이터 검증 유틸리티 함수 제공
 * 역할: Zod 스키마를 사용하여 설정 데이터를 검증하고 기본값 제공
 * 작성일: 2025-04-21
 */

import { z } from 'zod';
import createLogger from '@/lib/logger';
import {
  settingSectionSchemaMap,
  SettingSection,
  fullSettingsSchema,
  themeSettingsSchema,
  generalSettingsSchema,
  ideaMapSettingsSchema,
  FullSettings
} from './schema/settings-schema';

const logger = createLogger('settings-validator');

/**
 * validateSettings: 입력된 데이터를 해당 섹션의 Zod 스키마로 검증
 * @param {SettingSection} section - 검증할 설정 섹션
 * @param {any} data - 검증할 데이터
 * @param {'strict' | 'safe'} mode - 검증 모드 (strict: 오류 발생, safe: 기본값으로 대체)
 * @returns {any} 검증된 데이터 (safe 모드일 경우 누락된 필드는 기본값으로 채워짐)
 * @throws {z.ZodError} strict 모드에서 검증 실패 시 오류 발생
 */
export function validateSettings<T extends SettingSection>(
  section: T,
  data: unknown,
  mode: 'strict' | 'safe' = 'safe'
): z.infer<typeof settingSectionSchemaMap[T]> {
  const schema = settingSectionSchemaMap[section];
  
  try {
    // 스키마로 데이터 검증
    return schema.parse(data);
  } catch (error) {
    // 에러 로깅
    logger.error(`설정 검증 실패 (${section}):`, error);
    
    if (mode === 'strict') {
      // strict 모드에서는 오류를 그대로 던짐
      throw error;
    }
    
    // safe 모드에서는 기본값 반환
    logger.warn(`${section} 설정에 오류가 있어 기본값으로 대체합니다.`);
    return getDefaultSettings(section);
  }
}

/**
 * getDefaultSettings: 특정 섹션 또는 전체 설정의 기본값을 반환
 * @param {SettingSection} [section] - 기본값을 가져올 설정 섹션 (생략 시 전체 설정)
 * @returns {any} 지정된 섹션의 기본값 (또는 전체 설정의 기본값)
 */
export function getDefaultSettings<T extends SettingSection>(
  section?: T
): T extends undefined ? FullSettings : z.infer<typeof settingSectionSchemaMap[T]> {
  if (!section) {
    return fullSettingsSchema.parse({}) as any;
  }
  
  const schema = settingSectionSchemaMap[section];
  return schema.parse({}) as any;
}

/**
 * mergeWithDefaults: 부분 설정 데이터를 기본값과 병합
 * @param {SettingSection} section - 설정 섹션
 * @param {Partial<T>} data - 병합할 부분 설정 데이터
 * @returns {T} 기본값과 병합된 완전한 설정 데이터
 */
export function mergeWithDefaults<T extends SettingSection>(
  section: T,
  data: Partial<z.infer<typeof settingSectionSchemaMap[T]>>
): z.infer<typeof settingSectionSchemaMap[T]> {
  // 기본값 가져오기
  const defaults = getDefaultSettings(section);
  
  // 부분 데이터와 기본값 병합
  const merged = { ...defaults, ...data };
  
  // 병합된 데이터 검증하여 반환
  return validateSettings(section, merged, 'safe');
}

/**
 * extractSettingSection: 전체 설정에서 특정 섹션만 추출
 * @param {FullSettings | null | undefined} settings - 전체 설정
 * @param {Exclude<SettingSection, 'full'>} section - 추출할 섹션
 * @returns {any} 추출된 섹션 설정 (없으면 기본값)
 */
export function extractSettingSection<T extends Exclude<SettingSection, 'full'>>(
  settings: FullSettings | null | undefined,
  section: T
): z.infer<typeof settingSectionSchemaMap[T]> {
  if (!settings) {
    return getDefaultSettings(section);
  }
  
  const sectionData = settings[section as keyof FullSettings];
  return validateSettings(section, sectionData, 'safe');
} 