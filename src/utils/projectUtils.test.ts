/**
 * 파일명: src/utils/projectUtils.test.ts
 * 목적: 프로젝트 데이터 유틸리티 함수 테스트
 * 역할: 프로젝트 데이터 검증 및 생성 함수 테스트
 * 작성일: 2024-07-13
 */

import { describe, it, expect } from 'vitest';
import { Project, CreateProjectInput } from '@/types/project';
import { 
  validateProjectData, 
  createProjectData, 
  isValidCreateProjectInput 
} from './projectUtils';

describe('프로젝트 데이터 유효성 검증 (validateProjectData)', () => {
  // 유효한 프로젝트 데이터 테스트
  it('유효한 프로젝트 데이터를 검증할 수 있어야 함', () => {
    const validProject: Project = {
      projectId: 'test-project-123',
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      ownerNickname: '테스트 사용자',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      settings: { theme: 'dark' },
      isDeleted: false
    };

    expect(() => validateProjectData(validProject)).not.toThrow();
    expect(validateProjectData(validProject)).toBe(true);
  });

  // 필수 필드 누락 테스트
  it('projectId가 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: false
    };

    expect(() => validateProjectData(invalidProject)).toThrow('프로젝트 ID는 필수 필드입니다.');
  });

  it('name이 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 'test-project-123',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: false
    };

    expect(() => validateProjectData(invalidProject)).toThrow('프로젝트 이름은 필수 필드입니다.');
  });

  it('ownerId가 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 'test-project-123',
      name: '테스트 프로젝트',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: false
    };

    expect(() => validateProjectData(invalidProject)).toThrow('소유자 ID는 필수 필드입니다.');
  });

  it('isDeleted가 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 'test-project-123',
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z'
    };

    expect(() => validateProjectData(invalidProject)).toThrow('삭제 여부(isDeleted)는 필수 필드입니다.');
  });

  // 타입 검증 테스트
  it('projectId가 문자열이 아닌 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 123,
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: false
    };

    expect(() => validateProjectData(invalidProject)).toThrow('프로젝트 ID는 문자열이어야 합니다.');
  });

  it('isDeleted가 불리언이 아닌 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 'test-project-123',
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: 'false' // 문자열로 넣음
    };

    expect(() => validateProjectData(invalidProject)).toThrow('삭제 여부(isDeleted)는 불리언이어야 합니다.');
  });

  // 선택적 필드 타입 검증
  it('선택적 필드인 settings가 객체가 아닌 경우 에러를 발생시켜야 함', () => {
    const invalidProject = {
      projectId: 'test-project-123',
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      createdAt: '2024-07-13T00:00:00.000Z',
      updatedAt: '2024-07-13T00:00:00.000Z',
      isDeleted: false,
      settings: 'invalidSettings' // 문자열로 넣음
    };

    expect(() => validateProjectData(invalidProject)).toThrow('설정은 객체 형태여야 합니다.');
  });
});

describe('프로젝트 데이터 생성 (createProjectData)', () => {
  it('유효한 입력으로 프로젝트 데이터를 생성할 수 있어야 함', () => {
    const input: CreateProjectInput = {
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      ownerNickname: '테스트 사용자'
    };

    const projectData = createProjectData(input);

    // 필수 필드 확인
    expect(projectData.name).toBe('테스트 프로젝트');
    expect(projectData.ownerId).toBe('user-123');
    expect(projectData.ownerNickname).toBe('테스트 사용자');
    
    // 자동 생성 필드 확인
    expect(projectData.createdAt).toBeDefined();
    expect(projectData.updatedAt).toBeDefined();
    expect(projectData.isDeleted).toBe(false);
    expect(projectData.settings).toEqual({});

    // 날짜 형식 검증
    expect(new Date(projectData.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(projectData.updatedAt).toString()).not.toBe('Invalid Date');
  });

  it('settings가 제공된 경우 이를 사용해야 함', () => {
    const input: CreateProjectInput = {
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      settings: { theme: 'dark', autoSave: true }
    };

    const projectData = createProjectData(input);
    expect(projectData.settings).toEqual({ theme: 'dark', autoSave: true });
  });
});

describe('프로젝트 생성 입력 데이터 유효성 검증 (isValidCreateProjectInput)', () => {
  it('유효한 입력 데이터를 검증할 수 있어야 함', () => {
    const validInput: CreateProjectInput = {
      name: '테스트 프로젝트',
      ownerId: 'user-123',
      ownerNickname: '테스트 사용자'
    };

    expect(() => isValidCreateProjectInput(validInput)).not.toThrow();
    expect(isValidCreateProjectInput(validInput)).toBe(true);
  });

  it('name이 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidInput = {
      ownerId: 'user-123'
    };

    expect(() => isValidCreateProjectInput(invalidInput)).toThrow('프로젝트 이름은 필수 필드입니다.');
  });

  it('ownerId가 누락된 경우 에러를 발생시켜야 함', () => {
    const invalidInput = {
      name: '테스트 프로젝트'
    };

    expect(() => isValidCreateProjectInput(invalidInput)).toThrow('소유자 ID는 필수 필드입니다.');
  });

  it('name이 문자열이 아닌 경우 에러를 발생시켜야 함', () => {
    const invalidInput = {
      name: 123,
      ownerId: 'user-123'
    };

    expect(() => isValidCreateProjectInput(invalidInput)).toThrow('프로젝트 이름은 문자열이어야 합니다.');
  });
}); 