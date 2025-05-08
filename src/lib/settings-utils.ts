/**
 * 파일명: src/lib/settings-utils.ts
 * 목적: 설정 관련 유틸리티 함수 제공
 * 역할: 설정 로드, 저장, 병합 등의 기능 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 타입 에러 수정
 * 수정일: 2025-05-06 : extractAndMergeSettings 함수 최적화 - 메모이제이션 적용하여 불필요한 재계산 방지
 * 수정일: 2025-05-06 : 불필요한 디버깅 로그 제거 및 코드 정리
 * 수정일: 2025-05-07 : Zod 스키마 기반 설정 검증 및 기본값 함수 추가
 * 수정일: 2025-05-07 : 타입 호환성 문제 수정
 */

import { SettingsData } from '@/types/settings';
import defaultSettingsJson from '@/config/uiOptions.json';
import createLogger from '@/lib/logger';
import { 
  SettingSection, 
  settingSectionSchemaMap, 
  FullSettings,
  ThemeSettings,
  GeneralSettings,
  IdeaMapSettings
} from './schema/settings-schema';

const logger = createLogger('settings-utils');

/**
 * 설정 객체의 깊은 병합(deep merge) 수행
 * @param {object} target - 대상 설정 객체 (일반적으로 기본 설정)
 * @param {object} source - 소스 설정 객체 (일반적으로 사용자 정의 설정)
 * @returns {object} 병합된 설정 객체
 */
export const deepMergeSettings = (
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> => {
  // 타겟이 없으면 소스 또는 빈 객체 반환
  if (!target) {
    return source || {};
  }
  
  // 소스가 없으면 타겟 반환
  if (!source) {
    return target;
  }
  
  // 깊은 병합을 위한 새 객체 생성
  const result = { ...target };
  
  // 소스의 모든 키에 대해 재귀적으로 병합
  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];
    
    // 둘 다 객체이고 배열이 아닌 경우 재귀적으로 병합
    if (
      typeof targetValue === 'object' && 
      targetValue !== null && 
      !Array.isArray(targetValue) &&
      typeof sourceValue === 'object' && 
      sourceValue !== null && 
      !Array.isArray(sourceValue)
    ) {
      result[key] = deepMergeSettings(targetValue, sourceValue);
    } else {
      // 소스 값이 정의되어 있으면 덮어쓰기
      if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
  });
  
  return result;
};

// 설정 유형 캐시 - 각 설정 유형별로 별도의 맵 사용
// 키: 설정 유형, 값: WeakMap<설정객체, 병합된결과>
const typeCache = new Map<string, WeakMap<object, any>>();

/**
 * 설정 객체에서 특정 유형의 설정만 추출하고 기본값과 병합
 * @param {SettingsData | null} settings - 전체 설정 객체
 * @param {keyof SettingsData} settingType - 추출할 설정 유형 (예: 'ideamap', 'card', 'theme')
 * @returns {any} 기본값과 병합된 특정 유형의 설정
 */
export function extractAndMergeSettings<K extends keyof SettingsData>(
  settings: SettingsData | null | undefined,
  settingType: K
): SettingsData[K] {
  // settings가 없으면 기본값 반환
  if (!settings) {
    // @ts-ignore: 호환성 이슈로 인한 임시 타입 무시
    const defaultSettings = getDefaultSettingsLegacy();
    return defaultSettings[settingType];
  }
  
  // 현재 설정 유형에 대한 캐시 맵 가져오기
  let typeCacheMap = typeCache.get(settingType as string);
  if (!typeCacheMap) {
    typeCacheMap = new WeakMap();
    typeCache.set(settingType as string, typeCacheMap);
  }
  
  // 캐시에서 기존 결과 확인 (settings가 객체인 경우만)
  if (settings && typeof settings === 'object') {
    const cachedResult = typeCacheMap.get(settings);
    if (cachedResult) {
      return cachedResult;
    }
  }
  
  // 기본 설정 가져오기
  // @ts-ignore: 호환성 이슈로 인한 임시 타입 무시
  const defaultSettings = getDefaultSettingsLegacy();
  
  // 설정 유형이 존재하는지 확인하고 기본값과 병합
  const defaultPart = defaultSettings[settingType];
  const settingsPart = settings[settingType];
  
  // 깊은 병합 수행
  const mergedSettings = deepMergeSettings(
    defaultPart as Record<string, any>,
    settingsPart as Record<string, any>
  );
  
  // 결과를 캐시에 저장 (settings가 객체인 경우만)
  if (settings && typeof settings === 'object') {
    typeCacheMap.set(settings, mergedSettings);
  }
  
  return mergedSettings as SettingsData[K];
}

/**
 * 캐시 키 생성 함수
 * @param settings 설정 객체
 * @param key 설정 키
 * @returns 캐시 키 문자열
 */
function createCacheKey<K extends keyof SettingsData>(
  settings: SettingsData | null | undefined,
  key: K
): string {
  let valueString = 'null';
  
  // settings가 있고 key가 있으면 직렬화
  if (settings && settings[key] !== undefined) {
    try {
      valueString = JSON.stringify(settings[key]);
    } catch (error) {
      logger.warn(`[createCacheKey] 직렬화 실패 (${String(key)}):`, error);
      valueString = 'invalid';
    }
  }
  
  return `${String(key)}:${valueString}`;
}

/**
 * 기본 설정 가져오기 (legacy 방식 - 이전 코드와의 호환성 유지)
 * @returns {SettingsData} 기본 설정 객체
 */
export const getDefaultSettingsLegacy = (): SettingsData => {
  // 타입 단언을 사용하여 uiOptions.json의 구조가 SettingsData와 일치함을 보장
  return defaultSettingsJson.DEFAULT_SETTINGS as unknown as SettingsData;
};

/**
 * 기본 설정 가져오기 (Zod 스키마 기반)
 * @param {SettingSection} [section] - 가져올 설정 섹션 (생략 시 전체 설정)
 * @returns {any} 해당 섹션의 기본 설정 객체
 */
export const getDefaultSettings = <T extends SettingSection>(section?: T): 
  T extends 'theme' ? ThemeSettings :
  T extends 'general' ? GeneralSettings :
  T extends 'ideamap' ? IdeaMapSettings :
  T extends 'full' ? FullSettings :
  any => {
    
  const schema = section ? settingSectionSchemaMap[section] : settingSectionSchemaMap.full;
  
  try {
    // 빈 객체에 스키마 기본값 적용
    const defaultSettings = schema.parse({});
    
    // 타입 캐스팅을 통해 반환 타입 일치시키기
    if (section === 'theme') return defaultSettings as any;
    if (section === 'general') return defaultSettings as any;
    if (section === 'ideamap') return defaultSettings as any;
    if (section === 'full') return defaultSettings as any;
    
    return defaultSettings as any;
  } catch (error) {
    logger.error(`[getDefaultSettings] 기본값 생성 실패 (${section || 'full'}):`, error);
    throw new Error(`설정 기본값 생성 실패: ${(error as Error).message}`);
  }
};

/**
 * 입력된 데이터를 해당 섹션의 Zod 스키마로 검증
 * @param {SettingSection} section - 검증할 설정 섹션
 * @param {any} data - 검증할 데이터
 * @param {'strict' | 'safe'} [mode='safe'] - 검증 모드 (strict: 오류 발생, safe: 기본값으로 복구)
 * @returns {any} 검증된 설정 객체
 */
export const validateSettings = <T extends SettingSection>(
  section: T,
  data: any,
  mode: 'strict' | 'safe' = 'safe'
): 
  T extends 'theme' ? ThemeSettings :
  T extends 'general' ? GeneralSettings :
  T extends 'ideamap' ? IdeaMapSettings :
  T extends 'full' ? FullSettings :
  any => {
    
  const schema = settingSectionSchemaMap[section];
  
  try {
    // strict 모드: 오류를 그대로 발생시킴
    if (mode === 'strict') {
      const result = schema.parse(data);
      return result as any;
    }
    
    // safe 모드: 최대한 데이터를 복구하려 시도
    try {
      // 먼저 정상 파싱 시도
      const result = schema.parse(data);
      return result as any;
    } catch (error) {
      // 오류 발생 시 로깅
      logger.warn(`[validateSettings] 설정 검증 실패 (${section}), 부분 복구 시도:`, error);
      
      try {
        // 데이터가 객체인 경우, 부분적으로 병합 시도
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // 기본값과 데이터 병합 (유효한 필드만 유지하기 위해 DeepPartial 접근을 시도)
          // 현재 필드 수가 많고 구조가 복잡해 모든 필드에 대한 개별 검증은 복잡하므로,
          // 단순하게 데이터를 병합 후 전체 검증하는 방식 사용
          const defaultData = getDefaultSettings(section);
          
          // 데이터의 각 최상위 필드만 개별적으로 검증하여 추가
          const partialResult = { ...defaultData };
          
          // 각 섹션별 처리 
          if (section === 'theme' && typeof data === 'object') {
            // 개별 필드 검증을 시도하고 유효한 필드만 결과에 반영
            try {
              if ('mode' in data) {
                // mode가 'light' 또는 'dark'인지 확인
                if (data.mode === 'light' || data.mode === 'dark') {
                  (partialResult as ThemeSettings).mode = data.mode;
                }
              }
              if ('accentColor' in data && typeof data.accentColor === 'string') {
                // HEX 색상 형식 검증
                if (/^#[0-9A-Fa-f]{6}$/.test(data.accentColor)) {
                  (partialResult as ThemeSettings).accentColor = data.accentColor;
                }
              }
            } catch (fieldError) {
              logger.debug(`[validateSettings] theme 필드 복구 실패:`, fieldError);
            }
          } else if (section === 'ideamap' && typeof data === 'object') {
            // ideamap 섹션의 필드 검증
            try {
              // snapGrid 튜플 값 처리
              if ('snapGrid' in data && Array.isArray(data.snapGrid) && data.snapGrid.length === 2) {
                const [x, y] = data.snapGrid;
                if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                  (partialResult as IdeaMapSettings).snapGrid = [x, y];
                }
              }
              
              // snapToGrid 불리언 값 처리
              if ('snapToGrid' in data && typeof data.snapToGrid === 'boolean') {
                (partialResult as IdeaMapSettings).snapToGrid = data.snapToGrid;
              }
              
              // edge 객체의 간단한 필드 처리 (예시)
              if ('edge' in data && typeof data.edge === 'object' && data.edge !== null) {
                const edge = (partialResult as IdeaMapSettings).edge;
                const dataEdge = data.edge;
                
                // strokeWidth 처리
                if ('strokeWidth' in dataEdge && typeof dataEdge.strokeWidth === 'number' && dataEdge.strokeWidth > 0) {
                  edge.strokeWidth = dataEdge.strokeWidth;
                }
                
                // animated 처리
                if ('animated' in dataEdge && typeof dataEdge.animated === 'boolean') {
                  edge.animated = dataEdge.animated;
                }
                
                // edgeColor 처리
                if ('edgeColor' in dataEdge && typeof dataEdge.edgeColor === 'string' && 
                    /^#[0-9A-Fa-f]{6}$/.test(dataEdge.edgeColor)) {
                  edge.edgeColor = dataEdge.edgeColor;
                }
              }
            } catch (fieldError) {
              logger.debug(`[validateSettings] ideamap 필드 복구 실패:`, fieldError);
            }
          } else if (section === 'full' && typeof data === 'object') {
            // full 섹션 처리 - theme, general, ideamap 각각에 대해 재귀적으로 validateSettings 호출
            if ('theme' in data && typeof data.theme === 'object' && data.theme !== null) {
              (partialResult as FullSettings).theme = validateSettings('theme', data.theme, 'safe');
            }
            
            if ('general' in data && typeof data.general === 'object' && data.general !== null) {
              (partialResult as FullSettings).general = validateSettings('general', data.general, 'safe');
            }
            
            if ('ideamap' in data && typeof data.ideamap === 'object' && data.ideamap !== null) {
              (partialResult as FullSettings).ideamap = validateSettings('ideamap', data.ideamap, 'safe');
            }
          }
          
          // 필요한 다른 section들에 대한 개별 검증을 추가할 수 있음...
          
          return partialResult as any;
        } else {
          // 객체가 아닌 경우 기본값 반환
          logger.warn(`[validateSettings] 객체가 아닌 데이터 (${typeof data}), 기본값 반환`);
          return getDefaultSettings(section);
        }
      } catch (secondError) {
        // 복구 시도 중 오류 발생 시 완전한 기본값 반환
        logger.error(`[validateSettings] 설정 복구 실패 (${section}), 기본값 반환:`, secondError);
        return getDefaultSettings(section);
      }
    }
  } catch (fatalError) {
    // 치명적 오류 (일반적으로 발생하지 않음)
    logger.error(`[validateSettings] 예상치 못한 오류 (${section}):`, fatalError);
    throw new Error(`설정 검증 중 오류 발생: ${(fatalError as Error).message}`);
  }
}; 