/**
 * 파일명: src/lib/ideamap-utils.ts
 * 목적: 아이디어맵 관련 유틸리티 함수 모음
 * 역할: 아이디어맵 설정 관리 및 스타일 적용 유틸리티 제공
 * 작성일: 2024-05-22
 * 수정일: 2024-05-29 : API URL 환경 변수를 사용하도록 수정
 * 수정일: 2025-04-21 : uiOptions.json 구조 변경에 맞게 DEFAULT_SETTINGS 수정
 * 수정일: 2025-04-21 : lint 에러 수정 - snapGrid 타입 단언 추가
 * 수정일: 2025-04-21 : 가독성 개선을 위한 상수 추출
 */

import { Edge, MarkerType, ConnectionLineType } from '@xyflow/react';

import defaultConfig from '@/config/uiOptions.json';
import { SETTINGS_STORAGE_KEY } from './ideamap-constants';

// API URL 가져오기
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return apiUrl;
};

// 설정 상수 정의 - 가독성 개선
const ideamapSettings = defaultConfig.DEFAULT_SETTINGS.ideamap;

export interface Settings {
  // 그리드 설정
  snapToGrid: boolean;
  snapGrid: [number, number];
  
  // 연결선 설정
  connectionLineType: ConnectionLineType;
  markerEnd: MarkerType | null;
  strokeWidth: number;
  markerSize: number;
  edgeColor: string;
  selectedEdgeColor: string;
  animated: boolean;
}

// 기본 설정 - uiOptions.json에서 가져옴
export const DEFAULT_SETTINGS: Settings = {
  // 그리드 설정
  snapToGrid: ideamapSettings.snapToGrid,
  snapGrid: ideamapSettings.snapGrid as [number, number],
  
  // 연결선 설정
  connectionLineType: ideamapSettings.edge.connectionLineType as ConnectionLineType,
  markerEnd: ideamapSettings.edge.markerEnd as MarkerType,
  strokeWidth: ideamapSettings.edge.strokeWidth,
  markerSize: ideamapSettings.edge.markerSize,
  edgeColor: ideamapSettings.edge.edgeColor,
  selectedEdgeColor: ideamapSettings.edge.selectedEdgeColor,
  animated: ideamapSettings.edge.animated,
};

/**
 * 로컬 스토리지에서 설정을 불러오는 함수
 */
export function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    
    if (!savedSettings) {
      return DEFAULT_SETTINGS;
    }

    // 저장된 설정 복원
    const parsedSettings = JSON.parse(savedSettings);
    
    // 기존 설정이 없는 경우 기본값으로 통합
    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };
  } catch (error) {
    console.error('설정 로드 중 오류:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 설정을 로컬 스토리지에 저장하는 함수
 */
export function saveSettings(settings: Settings): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('설정 저장 중 오류:', error);
    }
  }
}

/**
 * 서버 API를 통해 설정을 저장하는 함수
 */
export const saveSettingsToServer = async (settings: Settings, userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.warn('[saveSettingsToServer] 사용자 ID 없음, 설정 저장 스킵');
      return false;
    }

    console.log('[saveSettingsToServer] 서버에 설정 저장 시작', { settings, userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings, userId }),
    });

    if (!response.ok) {
      throw new Error('서버에 설정을 저장하는데 실패했습니다.');
    }

    // 로컬에도 저장
    saveSettings(settings);
    return true;
  } catch (error) {
    console.error('서버 설정 저장 중 오류:', error);
    return false;
  }
}

/**
 * 서버 API를 통해 설정을 불러오는 함수
 */
export const loadSettingsFromServer = async (userId: string): Promise<Settings | null> => {
  try {
    if (!userId) {
      console.warn('[loadSettingsFromServer] 사용자 ID 없음, 설정 로드 스킵');
      return null;
    }

    console.log('[loadSettingsFromServer] 서버에서 설정 로드 시작', { userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error('서버에서 설정을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.settings) {
      // 낙관적 업데이트 구현 후, 기본값을 로컬 스토리지에 저장하고 바로 DB에도 저장하는 로직 구현 (추가 예정)
      // TODO: 처음 사용자의 경우 기본 설정값을 바로 DB에 저장하여 이후 요청 시 불필요한 처리 방지
      return null; // 설정이 없는 경우
    }

    const settings = {
      ...DEFAULT_SETTINGS,
      ...data.settings,
    };

    // 로컬에도 저장
    saveSettings(settings);
    return settings;
  } catch (error) {
    console.error('서버 설정 로드 중 오류:', error);
    return null;
  }
}

/**
 * 서버 API를 통해 설정을 부분 업데이트하는 함수
 */
export async function updateSettingsOnServer(userId: string, partialSettings: Partial<Settings>): Promise<boolean> {
  try {
    // 요청 데이터 깊은 복사 및 문자열 변환 확인
    // markerEnd 값이 null인 경우 명시적으로 null로 처리
    const safeSettings = JSON.parse(JSON.stringify(partialSettings));
    
    console.log('설정 업데이트 요청:', {
      userId,
      settings: safeSettings
    });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings: safeSettings,
      }),
    });

    // 응답 정보 로깅
    console.log('응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
      console.error('응답 오류 데이터:', errorData);
      throw new Error(
        errorData.details || errorData.error || '설정을 부분 업데이트하는 데 실패했습니다.'
      );
    }

    // 성공적인 응답 처리
    const responseData = await response.json();
    console.log('업데이트 성공 응답:', responseData);

    // 로컬 설정도 업데이트 (기존 설정과 병합)
    const currentSettings = loadSettings();
    const updatedSettings = {
      ...currentSettings,
      ...safeSettings,
    };
    
    // 로컬 스토리지에 저장
    saveSettings(updatedSettings);
    console.log('로컬 설정 업데이트 완료:', updatedSettings);
    
    return true;
  } catch (error) {
    console.error('서버 설정 부분 업데이트 중 오류:', error);
    // 로컬 저장소에만 저장 (서버 저장 실패시 임시 대안)
    try {
      const currentSettings = loadSettings();
      saveSettings({
        ...currentSettings,
        ...partialSettings,
      });
      console.log('서버 저장 실패, 로컬에만 저장됨');
    } catch (localError) {
      console.error('로컬 설정 저장 중 오류:', localError);
    }
    return false;
  }
}

/**
 * 설정에 따라 엣지 스타일을 적용하는 함수
 * 모든 연결선에 설정이 즉시 반영되도록 함
 */
export function applyIdeaMapEdgeSettings(edges: Edge[], settings: Settings): Edge[] {
  // 각 엣지에 새 설정을 적용
  return edges.map(edge => {
    // 기존 속성은 유지하면서 새로운 속성 추가
    const updatedEdge: Edge = {
      ...edge,                             // 기존 속성 유지
      id: edge.id,                         // 엣지 ID 유지
      source: edge.source,                 // 소스 노드 유지
      target: edge.target,                 // 타겟 노드 유지
      type: 'custom',                      // 커스텀 엣지 타입 사용 - 렌더링 컴포넌트 지정
      data: {
        ...edge.data,                      // 기존 데이터 보존
        edgeType: settings.connectionLineType, // 연결선 타입을 data로 전달
        settings: {                        // 설정 정보 추가
          animated: settings.animated,
          connectionLineType: settings.connectionLineType,
          strokeWidth: settings.strokeWidth,
          edgeColor: settings.edgeColor,
          selectedEdgeColor: settings.selectedEdgeColor,
        }
      },
      animated: settings.animated,         // 애니메이션 설정
      
      // 스타일 속성 설정
      style: {
        ...(edge.style || {}),             // 기존 스타일 보존
        strokeWidth: settings.strokeWidth, // 선 굵기 설정
        stroke: edge.selected ? settings.selectedEdgeColor : settings.edgeColor, // 선 색상
      },
    };
    
    // 마커 설정 (있을 경우에만)
    if (settings.markerEnd) {
      updatedEdge.markerEnd = {
        type: settings.markerEnd,          // 마커 타입 설정
        width: settings.markerSize,        // 마커 너비
        height: settings.markerSize,       // 마커 높이
        color: edge.selected ? settings.selectedEdgeColor : settings.edgeColor, // 마커 색상
      };
    } else {
      // 마커 제거
      updatedEdge.markerEnd = undefined;
    }
    
    return updatedEdge;
  });
} 