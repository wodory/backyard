/**
 * 파일명: src/features/project/utils/initialization.test.ts
 * 목적: 프로젝트 초기화 유틸리티 테스트
 * 역할: 고아 카드를 기본 프로젝트에 연결하는 로직 테스트
 * 작성일: 2024-07-13
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { associateOrphanCards } from './initialization';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/types/card';
import { Project, CreateProjectInput } from '@/types/project';

// 유틸리티 함수 모킹
vi.mock('@/store/useProjectStore', () => ({
  useProjectStore: {
    getState: vi.fn(() => ({
      projects: [],
      fetchProjects: vi.fn(),
      createProject: vi.fn(),
      selectProjects: vi.fn(),
    })),
  }
}));

vi.mock('@/store/useAppStore', () => ({
  useAppStore: {
    getState: vi.fn(() => ({
      cards: [],
      fetchCards: vi.fn(),
      updateCard: vi.fn(),
    })),
  }
}));

// 테스트 데이터
const testUser = { id: 'user-123', name: '테스트 사용자' };
const testProjects: Project[] = [
  {
    projectId: 'project-1',
    name: '내 첫 프로젝트',
    ownerId: testUser.id,
    ownerNickname: testUser.name,
    createdAt: '2024-07-13T00:00:00Z',
    updatedAt: '2024-07-13T00:00:00Z',
    isDeleted: false
  }
];

const orphanCards: Card[] = [
  {
    id: 'card-1',
    title: '카드 1',
    content: '내용 1',
    createdAt: '2024-07-13T00:00:00Z',
    updatedAt: '2024-07-13T00:00:00Z',
    userId: testUser.id
  },
  {
    id: 'card-2',
    title: '카드 2',
    content: '내용 2',
    createdAt: '2024-07-13T00:00:00Z',
    updatedAt: '2024-07-13T00:00:00Z',
    userId: testUser.id
  }
];

describe('associateOrphanCards', () => {
  const projectStore = useProjectStore.getState();
  const appStore = useAppStore.getState();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // 기본 모킹 설정
    projectStore.selectProjects.mockReturnValue([]);
    projectStore.fetchProjects.mockResolvedValue([]);
    projectStore.createProject.mockImplementation(async (input: CreateProjectInput) => {
      return {
        projectId: 'new-project-id',
        name: input.name,
        ownerId: input.ownerId,
        ownerNickname: input.ownerNickname,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };
    });
    
    appStore.fetchCards.mockResolvedValue(orphanCards);
    appStore.updateCard.mockImplementation(async (card: Card) => card);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('기존 프로젝트가 있는 경우 프로젝트 생성을 시도하지 않아야 함', async () => {
    // 기존 프로젝트가 있다고 가정
    projectStore.selectProjects.mockReturnValue(testProjects);
    
    await associateOrphanCards(testUser.id);
    
    // 프로젝트 가져오기는 호출되어야 함
    expect(projectStore.fetchProjects).toHaveBeenCalledTimes(1);
    // 프로젝트 생성은 호출되지 않아야 함
    expect(projectStore.createProject).not.toHaveBeenCalled();
    // 고아 카드는 가져와야 함
    expect(appStore.fetchCards).toHaveBeenCalledTimes(1);
    expect(appStore.fetchCards).toHaveBeenCalledWith({ withoutProject: true });
    // 카드 업데이트는 각 카드마다 호출되어야 함
    expect(appStore.updateCard).toHaveBeenCalledTimes(orphanCards.length);
    // 첫 번째 카드 업데이트 호출 시 projectId가 설정되었는지 확인
    expect(appStore.updateCard).toHaveBeenCalledWith({
      ...orphanCards[0],
      projectId: testProjects[0].projectId
    });
  });
  
  it('프로젝트가 없는 경우 기본 프로젝트를 생성해야 함', async () => {
    // 프로젝트가 없다고 가정
    projectStore.selectProjects.mockReturnValue([]);
    
    await associateOrphanCards(testUser.id);
    
    // 프로젝트 가져오기는 호출되어야 함
    expect(projectStore.fetchProjects).toHaveBeenCalledTimes(1);
    // 프로젝트 생성이 호출되어야 함
    expect(projectStore.createProject).toHaveBeenCalledTimes(1);
    expect(projectStore.createProject).toHaveBeenCalledWith({
      name: '내 첫 프로젝트',
      ownerId: testUser.id,
      ownerNickname: testUser.name
    });
    // 고아 카드는 가져와야 함
    expect(appStore.fetchCards).toHaveBeenCalledTimes(1);
    // 카드 업데이트는 각 카드마다 호출되어야 함
    expect(appStore.updateCard).toHaveBeenCalledTimes(orphanCards.length);
    // 첫 번째 카드 업데이트 호출 시 projectId가 설정되었는지 확인
    expect(appStore.updateCard).toHaveBeenCalledWith({
      ...orphanCards[0],
      projectId: 'new-project-id'
    });
  });
  
  it('카드가 없는 경우 업데이트를 시도하지 않아야 함', async () => {
    // 프로젝트는 있지만 고아 카드가 없다고 가정
    projectStore.selectProjects.mockReturnValue(testProjects);
    appStore.fetchCards.mockResolvedValue([]);
    
    await associateOrphanCards(testUser.id);
    
    // 프로젝트 가져오기는 호출되어야 함
    expect(projectStore.fetchProjects).toHaveBeenCalledTimes(1);
    // 고아 카드 가져오기가 호출되어야 함
    expect(appStore.fetchCards).toHaveBeenCalledTimes(1);
    // 카드 업데이트는 호출되지 않아야 함
    expect(appStore.updateCard).not.toHaveBeenCalled();
  });
  
  it('프로젝트 생성 실패 시 에러를 처리해야 함', async () => {
    // 프로젝트가 없고 생성 실패한다고 가정
    projectStore.selectProjects.mockReturnValue([]);
    projectStore.createProject.mockRejectedValue(new Error('프로젝트 생성 실패'));
    
    // 함수 호출 시 에러가 발생해야 함
    await expect(associateOrphanCards(testUser.id)).rejects.toThrow('프로젝트 생성 실패');
    
    // 프로젝트 가져오기는 호출되어야 함
    expect(projectStore.fetchProjects).toHaveBeenCalledTimes(1);
    // 프로젝트 생성 시도가 있어야 함
    expect(projectStore.createProject).toHaveBeenCalledTimes(1);
    // 고아 카드 가져오기와 업데이트는 호출되지 않아야 함 (에러 발생으로 인해)
    expect(appStore.fetchCards).not.toHaveBeenCalled();
    expect(appStore.updateCard).not.toHaveBeenCalled();
  });
  
  it('카드 업데이트 실패 시 진행 중인 작업을 계속해야 함', async () => {
    // 첫 번째 카드 업데이트는 실패하지만 두 번째 카드는 성공한다고 가정
    projectStore.selectProjects.mockReturnValue(testProjects);
    appStore.updateCard.mockImplementation(async (card: Card) => {
      if (card.id === 'card-1') {
        throw new Error('카드 업데이트 실패');
      }
      return card;
    });
    
    // 함수는 전체적으로 성공해야 함
    await associateOrphanCards(testUser.id);
    
    // 프로젝트 가져오기는 호출되어야 함
    expect(projectStore.fetchProjects).toHaveBeenCalledTimes(1);
    // 고아 카드 가져오기가 호출되어야 함
    expect(appStore.fetchCards).toHaveBeenCalledTimes(1);
    // 두 카드 모두 업데이트가 시도되어야 함
    expect(appStore.updateCard).toHaveBeenCalledTimes(orphanCards.length);
  });
}); 