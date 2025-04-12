/*
  @description: 디버깅용 로컬 스토리지 초기화 함수
*/

import { BOARD_SETTINGS_KEY } from './ideamap-constants';

// 디버깅용 로컬 스토리지 초기화 함수
export function resetLocalStorageBoardSettings() {
  try {
    localStorage.removeItem(BOARD_SETTINGS_KEY);
    console.log('보드 설정 로컬 스토리지 초기화 완료');
    return true;
  } catch (e) {
    console.error('보드 설정 초기화 실패:', e);
    return false;
  }
}

// 현재 보드 설정 출력 함수
export function logCurrentBoardSettings() {
  try {
    const settings = localStorage.getItem(BOARD_SETTINGS_KEY);
    console.log('현재 보드 설정 (localStorage):', settings ? JSON.parse(settings) : null);
    
    // Zustand 저장소 내용도 확인
    const appStorage = localStorage.getItem('backyard-app-storage');
    console.log('Zustand 앱 스토리지:', appStorage ? JSON.parse(appStorage) : null);
    
    return settings ? JSON.parse(settings) : null;
  } catch (e) {
    console.error('보드 설정 출력 실패:', e);
    return null;
  }
}

// Zustand 스토리지 초기화 함수
export function resetZustandStorage() {
  try {
    localStorage.removeItem('backyard-app-storage');
    console.log('Zustand 스토리지 초기화 완료');
    return true;
  } catch (e) {
    console.error('Zustand 스토리지 초기화 실패:', e);
    return false;
  }
}

// 전체 스토리지 초기화 함수
export function resetAllStorage() {
  const boardReset = resetLocalStorageBoardSettings();
  const zustandReset = resetZustandStorage();
  
  return boardReset && zustandReset;
} 