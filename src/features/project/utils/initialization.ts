/**
 * 파일명: src/features/project/utils/initialization.ts
 * 목적: 프로젝트 초기화 관련 유틸리티 함수
 * 역할: 프로젝트가 없는 카드들을 기본 프로젝트에 연결하는 로직 제공
 * 작성일: 2024-07-13
 */

import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/types/card';
import { Project } from '@/types/project';

/**
 * associateOrphanCards: 프로젝트가 없는 모든 카드를 기본 프로젝트에 연결
 * @param {string} userId - 현재 사용자의 ID
 * @param {string} userName - 현재 사용자의 이름/닉네임 (선택적)
 * @returns {Promise<void>} 
 */
export const associateOrphanCards = async (userId: string, userName: string = '사용자'): Promise<void> => {
  const projectStore = useProjectStore.getState();
  const appStore = useAppStore.getState();
  
  // 1. 프로젝트 목록을 불러옴
  await projectStore.fetchProjects();
  
  // 2. 기본 프로젝트가 있는지 확인
  const projects = projectStore.selectProjects();
  let defaultProject: Project | undefined = projects.find(p => 
    p.ownerId === userId && !p.isDeleted
  );
  
  // 3. 기본 프로젝트가 없으면 생성
  if (!defaultProject) {
    defaultProject = await projectStore.createProject({
      name: '내 첫 프로젝트',
      ownerId: userId,
      ownerNickname: userName
    });
  }
  
  // 4. 프로젝트가 연결되지 않은 카드들 가져오기
  const orphanCards = await appStore.fetchCards({ withoutProject: true });
  
  // 5. 각 카드에 프로젝트 ID 설정 및 업데이트
  const updatePromises = orphanCards.map(async (card: Card) => {
    try {
      await appStore.updateCard({
        ...card,
        projectId: defaultProject!.projectId
      });
    } catch (error) {
      console.error(`카드 ${card.id} 업데이트 실패:`, error);
      // 개별 카드 실패는 전체 프로세스를 중단하지 않음
    }
  });
  
  // 모든 카드 업데이트 작업 완료 대기
  await Promise.all(updatePromises);
}; 