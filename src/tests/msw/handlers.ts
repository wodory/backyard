/**
 * 파일명: handlers.ts
 * 목적: MSW 핸들러 정의
 * 역할: API 요청을 가로채기 위한 MSW 핸들러 제공
 * 작성일: 2025-03-30
 * 수정일: 2025-04-08
 * 수정일: 2024-07-13 : 프로젝트 API 핸들러 추가
 * 수정일: 2024-07-14 : 프로젝트 복구 API 핸들러 추가
 */

import { http, HttpResponse } from 'msw';
import { Project } from '@/types/project';

/**
 * createMockSession: 모의 Supabase 세션 생성
 * @param options - 세션 생성 옵션
 * @returns 모의 세션 객체
 */
export function createMockSession(options: {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  provider?: string;
  errorMessage?: string;
} = {}) {
  const {
    success = true,
    accessToken = 'mock_access_token',
    refreshToken = 'mock_refresh_token',
    userId = 'mock_user_id',
    provider = 'google',
    errorMessage = '인증 실패',
  } = options;

  if (success) {
    return {
      data: {
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: userId,
            app_metadata: { provider }
          }
        }
      },
      error: null
    };
  } else {
    return {
      data: { session: null },
      error: { message: errorMessage, status: 401 }
    };
  }
}

/**
 * 카드 데이터 타입
 */
export interface CardData {
  id: string;
  title: string;
  content: string;
  cardTags: Array<{ id: string; name: string; }>;
}

/**
 * 카드 데이터 생성 함수
 * @param id - 카드 ID
 * @returns 카드 데이터 객체
 */
export function createMockCard(id: string = 'test-card-123'): CardData {
  return {
    id,
    title: '테스트 카드',
    content: '테스트 내용',
    cardTags: []
  };
}

/**
 * 프로젝트 데이터 생성 함수
 * @param id - 프로젝트 ID
 * @returns 프로젝트 데이터 객체
 */
export function createMockProject(id: string = 'project-123'): Project {
  return {
    projectId: id,
    name: '테스트 프로젝트',
    ownerId: 'user-123',
    ownerNickname: '테스트 사용자',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false
  };
}

// 모의 프로젝트 데이터 저장소
let mockProjects: Project[] = [
  createMockProject('project-1'),
  createMockProject('project-2'),
  {
    ...createMockProject('project-3'),
    isDeleted: true,
    deletedAt: new Date().toISOString()
  }
];

// Supabase 인증 API 엔드포인트 핸들러
export const handlers = [
  // Supabase 세션 교환 API 모킹
  http.post('*/auth/v1/token*', async ({ request }) => {
    // URL 파라미터를 사용하여 성공 또는 실패 시나리오 결정
    const url = new URL(request.url);
    const mockFail = url.searchParams.get('mock_fail') === 'true';
    const mockTimeout = url.searchParams.get('mock_timeout') === 'true';

    // 타임아웃 시뮬레이션
    if (mockTimeout) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // 요청 데이터 파싱
    const formData = await request.formData();
    const grantType = formData.get('grant_type');
    const code = formData.get('code');
    const codeVerifier = formData.get('code_verifier');

    // 요청 유효성 검증
    if (!grantType || !code) {
      return HttpResponse.json({
        error: 'invalid_request',
        error_description: '필수 파라미터가 누락되었습니다'
      }, { status: 400 });
    }

    // 코드 검증기 유효성 검증
    if (grantType === 'authorization_code' && !codeVerifier) {
      return HttpResponse.json({
        error: 'invalid_request',
        error_description: 'code_verifier가 필요합니다'
      }, { status: 400 });
    }

    // 실패 시나리오
    if (mockFail) {
      return HttpResponse.json({
        error: 'invalid_grant',
        error_description: '인증 코드가 유효하지 않습니다'
      }, { status: 400 });
    }

    // 성공 시나리오
    return HttpResponse.json({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'mock_user_id',
        app_metadata: { provider: 'google' },
        aud: 'authenticated',
        email: 'test@example.com'
      }
    });
  }),

  // Supabase 사용자 정보 API 모킹
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock_user_id',
      app_metadata: { provider: 'google' },
      user_metadata: { name: 'Test User' },
      aud: 'authenticated',
      email: 'test@example.com'
    });
  }),

  // 카드 조회 API - 성공 케이스
  http.get('/api/cards/:id', ({ params }) => {
    const { id } = params;
    
    // 특정 ID로 에러 케이스 테스트 가능
    if (id === 'not-found') {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      });
    }
    
    if (id === 'server-error') {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error'
      });
    }

    // 성공 응답
    return HttpResponse.json(createMockCard(id as string));
  }),

  // 카드 수정 API
  http.put('/api/cards/:id', async ({ params, request }) => {
    const { id } = params;
    
    try {
      const requestData = await request.json() as Partial<CardData>;

      // 유효성 검사 실패 케이스
      if (!requestData || !requestData.title || !requestData.content) {
        return new HttpResponse(JSON.stringify({ error: '필수 필드가 누락되었습니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // 성공 응답
      return HttpResponse.json({
        ...createMockCard(id as string),
        ...requestData
      });
    } catch (error) {
      return new HttpResponse(JSON.stringify({ error: '잘못된 요청 형식입니다' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),

  // 카드 생성 API
  http.post('/api/cards', async ({ request }) => {
    try {
      const newCardData = await request.json() as any;
      // 실패 시뮬레이션 (예: 제목 누락)
      if (!newCardData || !newCardData.title) {
        return HttpResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
      }
      // 성공 시뮬레이션
      const createdCard = {
        id: `mock-card-${Date.now()}`, // 동적 ID 생성
        title: newCardData.title,
        content: newCardData.content || '',
        userId: newCardData.userId || 'default-user', // userId 처리
        tags: newCardData.tags || [], // tags 처리
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cardTags: (newCardData.tags || []).map((tag: string) => ({ id: tag, name: tag })) // cardTags 형식 맞추기
      };
      return HttpResponse.json(createdCard, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }
  }),

  // 프로젝트 목록 조회 API
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const includeDeleted = url.searchParams.get('includeDeleted') === 'true';
    
    // 삭제된 프로젝트 필터링 (휴지통 기능)
    const filteredProjects = includeDeleted 
      ? mockProjects 
      : mockProjects.filter(p => !p.isDeleted);
    
    // 서버 오류 시뮬레이션
    if (url.searchParams.get('simulateError') === 'true') {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error'
      });
    }
    
    return HttpResponse.json(filteredProjects);
  }),

  // 단일 프로젝트 조회 API
  http.get('/api/projects/:projectId', ({ params }) => {
    const { projectId } = params;
    const project = mockProjects.find(p => p.projectId === projectId);
    
    if (!project) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Project Not Found'
      });
    }
    
    return HttpResponse.json(project);
  }),

  // 프로젝트 생성 API
  http.post('/api/projects', async ({ request }) => {
    try {
      const data = await request.json() as any;
      
      // 필수 필드 검증
      if (!data || !data.name || !data.ownerId) {
        return HttpResponse.json(
          { error: '필수 정보가 누락되었습니다. 이름과 소유자 ID는 필수입니다.' }, 
          { status: 400 }
        );
      }
      
      // 새 프로젝트 생성
      const newProject: Project = {
        projectId: `project-${Date.now()}`,
        name: data.name,
        ownerId: data.ownerId,
        ownerNickname: data.ownerNickname || '사용자',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        settings: data.settings || {}
      };
      
      // 저장소에 추가
      mockProjects.push(newProject);
      
      return HttpResponse.json(newProject, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: '잘못된 요청 형식입니다.' }, 
        { status: 400 }
      );
    }
  }),

  // 프로젝트 수정 API
  http.put('/api/projects/:projectId', async ({ params, request }) => {
    const { projectId } = params;
    
    try {
      const data = await request.json() as any;
      const projectIndex = mockProjects.findIndex(p => p.projectId === projectId);
      
      if (projectIndex === -1) {
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Project Not Found'
        });
      }
      
      // 기존 프로젝트 업데이트
      const updatedProject = {
        ...mockProjects[projectIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // 저장소 업데이트
      mockProjects[projectIndex] = updatedProject;
      
      return HttpResponse.json(updatedProject);
    } catch (error) {
      return HttpResponse.json(
        { error: '잘못된 요청 형식입니다.' }, 
        { status: 400 }
      );
    }
  }),

  // 프로젝트 삭제 API (소프트 삭제)
  http.delete('/api/projects/:projectId', ({ params }) => {
    const { projectId } = params;
    const projectIndex = mockProjects.findIndex(p => p.projectId === projectId);
    
    if (projectIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Project Not Found'
      });
    }
    
    // 소프트 삭제 구현 (휴지통 기능)
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      isDeleted: true,
      deletedAt: new Date().toISOString()
    };
    
    return new HttpResponse(null, { status: 204 });
  }),

  // 프로젝트 복구 API (휴지통에서 복원)
  http.post('/api/projects/:projectId/restore', ({ params }) => {
    const { projectId } = params;
    const projectIndex = mockProjects.findIndex(p => p.projectId === projectId);
    
    if (projectIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Project Not Found'
      });
    }
    
    // 프로젝트가 삭제된 상태인지 확인
    if (!mockProjects[projectIndex].isDeleted) {
      return HttpResponse.json(
        { error: '이미 활성 상태인 프로젝트입니다.' },
        { status: 400 }
      );
    }
    
    // 복구 처리
    const restoredProject = {
      ...mockProjects[projectIndex],
      isDeleted: false,
      deletedAt: undefined, // deletedAt 필드 제거
      updatedAt: new Date().toISOString() // 업데이트 시간 갱신
    };
    
    // 데이터 저장소 업데이트
    mockProjects[projectIndex] = restoredProject;
    
    return HttpResponse.json(restoredProject);
  })
]; 