/**
 * 파일명: src/features/project/utils/updateLocalCardsProject.ts
 * 목적: 로컬 카드의 소유자와 프로젝트 ID 업데이트
 * 역할: 모든 카드의 소유자를 첫 번째 사용자로, 프로젝트를 첫 번째 프로젝트로 설정
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('updateLocalCardsProject');

/**
 * 모든 카드의 소유자와 프로젝트를 업데이트
 * @param userId - 설정할 사용자 ID
 * @param projectId - 설정할 프로젝트 ID
 * @returns 업데이트된 카드 수
 */
export async function updateLocalCardsProject(userId: string, projectId: string): Promise<number> {
  try {
    logger.info('카드 업데이트 시작', { userId, projectId });
    
    // 앱 스토어에서 상태와 액션 가져오기
    const { cards, updateCard } = useAppStore.getState();
    
    // 업데이트할 카드가 없으면 즉시 반환
    if (!cards || cards.length === 0) {
      logger.info('업데이트할 카드가 없습니다');
      return 0;
    }
    
    // 업데이트 성공 카운터
    let successCount = 0;
    let errorCount = 0;
    
    // 각 카드를 순회하며 업데이트
    for (const card of cards) {
      try {
        const updatedCard = {
          ...card,
          userId: userId,
          projectId: projectId
        };
        
        // 카드 업데이트 액션 호출
        await updateCard(updatedCard);
        successCount++;
      } catch (cardError) {
        logger.error(`카드 업데이트 실패: ${card.id}`, cardError);
        errorCount++;
      }
    }
    
    // 결과 로깅
    logger.info('카드 업데이트 완료', { 
      총카드수: cards.length, 
      성공: successCount, 
      실패: errorCount 
    });
    
    // 결과 알림
    if (successCount > 0) {
      toast.success(`${successCount}개 카드가 업데이트되었습니다.`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount}개 카드 업데이트에 실패했습니다.`);
    }
    
    return successCount;
  } catch (error) {
    logger.error('카드 업데이트 실패', error);
    toast.error('카드 업데이트 중 오류가 발생했습니다.');
    return 0;
  }
}

/**
 * 첫 번째 사용자와 첫 번째 프로젝트로 모든 카드 업데이트
 * @returns 업데이트된 카드 수
 */
export async function updateAllCardsToFirstUserAndProject(): Promise<number> {
  try {
    // 첫 번째 사용자 조회
    const userResponse = await fetch('/api/users');
    
    if (!userResponse.ok) {
      throw new Error('사용자 정보를 불러오는데 실패했습니다.');
    }
    
    const users = await userResponse.json();
    
    if (!users || users.length === 0) {
      throw new Error('등록된 사용자가 없습니다.');
    }
    
    const firstUser = users[0];
    
    // 첫 번째 프로젝트 조회
    const projectResponse = await fetch('/api/projects');
    
    if (!projectResponse.ok) {
      throw new Error('프로젝트 정보를 불러오는데 실패했습니다.');
    }
    
    const projects = await projectResponse.json();
    
    if (!projects || projects.length === 0) {
      throw new Error('등록된 프로젝트가 없습니다.');
    }
    
    const firstProject = projects[0];
    
    // 로그 출력
    logger.info('선택된 사용자 및 프로젝트', { 
      userId: firstUser.id, 
      userName: firstUser.name,
      projectId: firstProject.projectId, 
      projectName: firstProject.name 
    });
    
    // 모든 카드 업데이트
    return await updateLocalCardsProject(firstUser.id, firstProject.projectId);
  } catch (error) {
    logger.error('자동 업데이트 실패', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    toast.error(`자동 업데이트 실패: ${errorMessage}`);
    return 0;
  }
} 