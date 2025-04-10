/**
 * 파일명: src/utils/projectUtils.ts
 * 목적: 프로젝트 데이터 처리 유틸리티
 * 역할: 프로젝트 데이터 생성 및 유효성 검증 함수 제공
 * 작성일: 2024-07-13
 */

import { CreateProjectInput, Project } from '@/types/project';

/**
 * validateProjectData: 프로젝트 데이터 유효성 검증
 * @param {Project} project - 검증할 프로젝트 데이터 객체
 * @returns {boolean} 유효성 검증 결과
 * @throws {Error} 필수 필드 누락 또는 타입 불일치 시 에러 발생
 */
export function validateProjectData(project: any): project is Project {
  // 필수 필드 존재 여부 확인
  if (!project || typeof project !== 'object') {
    throw new Error('프로젝트 데이터가 객체 형태가 아닙니다.');
  }

  // 필수 필드 검증
  if (!project.projectId) {
    throw new Error('프로젝트 ID는 필수 필드입니다.');
  }

  if (!project.name) {
    throw new Error('프로젝트 이름은 필수 필드입니다.');
  }

  if (!project.ownerId) {
    throw new Error('소유자 ID는 필수 필드입니다.');
  }

  if (project.createdAt === undefined) {
    throw new Error('생성 일시는 필수 필드입니다.');
  }

  if (project.updatedAt === undefined) {
    throw new Error('수정 일시는 필수 필드입니다.');
  }

  if (project.isDeleted === undefined) {
    throw new Error('삭제 여부(isDeleted)는 필수 필드입니다.');
  }

  // 필드 타입 검증
  if (typeof project.projectId !== 'string') {
    throw new Error('프로젝트 ID는 문자열이어야 합니다.');
  }

  if (typeof project.name !== 'string') {
    throw new Error('프로젝트 이름은 문자열이어야 합니다.');
  }

  if (typeof project.ownerId !== 'string') {
    throw new Error('소유자 ID는 문자열이어야 합니다.');
  }

  if (project.ownerNickname !== undefined && typeof project.ownerNickname !== 'string') {
    throw new Error('소유자 닉네임은 문자열이어야 합니다.');
  }

  if (typeof project.createdAt !== 'string') {
    throw new Error('생성 일시는 문자열이어야 합니다.');
  }

  if (typeof project.updatedAt !== 'string') {
    throw new Error('수정 일시는 문자열이어야 합니다.');
  }

  if (typeof project.isDeleted !== 'boolean') {
    throw new Error('삭제 여부(isDeleted)는 불리언이어야 합니다.');
  }

  if (project.deletedAt !== undefined && typeof project.deletedAt !== 'string') {
    throw new Error('삭제 일시는 문자열이어야 합니다.');
  }

  if (project.settings !== undefined && typeof project.settings !== 'object') {
    throw new Error('설정은 객체 형태여야 합니다.');
  }

  // 모든 검증 통과
  return true;
}

/**
 * createProjectData: 프로젝트 데이터 객체 생성
 * @param {CreateProjectInput} input - 프로젝트 생성 입력 데이터
 * @returns {Project} 생성된 프로젝트 데이터 객체
 */
export function createProjectData(input: CreateProjectInput): Omit<Project, 'projectId'> {
  const now = new Date().toISOString();
  
  // 기본값이 있는 프로젝트 객체 생성
  return {
    name: input.name,
    ownerId: input.ownerId,
    ownerNickname: input.ownerNickname,
    createdAt: now,
    updatedAt: now,
    settings: input.settings || {},
    isDeleted: false
  };
}

/**
 * isValidCreateProjectInput: 프로젝트 생성 입력 데이터 유효성 검증
 * @param {any} input - 검증할 입력 데이터
 * @returns {boolean} 유효성 검증 결과
 * @throws {Error} 필수 필드 누락 또는 타입 불일치 시 에러 발생
 */
export function isValidCreateProjectInput(input: any): input is CreateProjectInput {
  if (!input || typeof input !== 'object') {
    throw new Error('입력 데이터가 객체 형태가 아닙니다.');
  }

  // 필수 필드 검증
  if (!input.name) {
    throw new Error('프로젝트 이름은 필수 필드입니다.');
  }

  if (!input.ownerId) {
    throw new Error('소유자 ID는 필수 필드입니다.');
  }

  // 필드 타입 검증
  if (typeof input.name !== 'string') {
    throw new Error('프로젝트 이름은 문자열이어야 합니다.');
  }

  if (typeof input.ownerId !== 'string') {
    throw new Error('소유자 ID는 문자열이어야 합니다.');
  }

  if (input.ownerNickname !== undefined && typeof input.ownerNickname !== 'string') {
    throw new Error('소유자 닉네임은 문자열이어야 합니다.');
  }

  if (input.settings !== undefined && typeof input.settings !== 'object') {
    throw new Error('설정은 객체 형태여야 합니다.');
  }

  // 모든 검증 통과
  return true;
} 