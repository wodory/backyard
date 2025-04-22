/**
 * 파일명: src/tests/msw/handlers/tagHandlers.ts
 * 목적: 태그 API 엔드포인트에 대한 MSW 핸들러 제공
 * 역할: 테스트 시 태그 관련 API 요청을 인터셉트하여 모킹된 응답 제공
 * 작성일: 2025-04-21
 */

import { http, HttpResponse, delay } from 'msw';
import { Tag, TagInput } from '@/services/tagService';

// Mock 태그 데이터
export const mockTags: Tag[] = [
  { id: '1', name: '개발', count: 5, createdAt: '2025-04-01T00:00:00Z' },
  { id: '2', name: '아이디어', count: 3, createdAt: '2025-04-02T00:00:00Z' },
  { id: '3', name: '프로젝트', count: 2, createdAt: '2025-04-03T00:00:00Z' }
];

// 태그 데이터를 저장할 수 있는 변수
let tags = [...mockTags];

// 태그 관련 핸들러
export const tagHandlers = [
  // 태그 목록 조회
  http.get('/api/tags', async () => {
    await delay(100);
    return HttpResponse.json(tags);
  }),

  // 특정 태그 조회
  http.get('/api/tags/:id', async ({ params }) => {
    const { id } = params;
    await delay(100);
    
    const tag = tags.find(tag => tag.id === id);
    
    if (!tag) {
      return new HttpResponse(null, {
        status: 404,
        statusText: '해당 ID의 태그를 찾을 수 없습니다.'
      });
    }
    
    return HttpResponse.json(tag);
  }),

  // 태그 생성
  http.post('/api/tags', async ({ request }) => {
    const data = await request.json() as TagInput;
    await delay(150);
    
    // 이름 검증
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return new HttpResponse(JSON.stringify({ error: '유효한 태그 이름을 입력해주세요.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 중복 태그 검사
    if (tags.some(tag => tag.name.toLowerCase() === data.name.toLowerCase())) {
      return new HttpResponse(JSON.stringify({ error: '이미 존재하는 태그 이름입니다.' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 새 태그 생성
    const newTag: Tag = {
      id: String(Date.now()),
      name: data.name.trim(),
      count: 0,
      createdAt: new Date().toISOString()
    };
    
    tags = [...tags, newTag];
    
    return HttpResponse.json(newTag, { status: 201 });
  }),

  // 태그 수정
  http.patch('/api/tags/:id', async ({ request, params }) => {
    const { id } = params;
    const data = await request.json() as TagInput;
    await delay(150);
    
    // 태그 찾기
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: '해당 ID의 태그를 찾을 수 없습니다.'
      });
    }
    
    // 이름 검증
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return new HttpResponse(JSON.stringify({ error: '유효한 태그 이름을 입력해주세요.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 중복 태그 검사 (다른 태그와 이름 중복 확인)
    if (tags.some((tag, index) => 
      index !== tagIndex && tag.name.toLowerCase() === data.name.toLowerCase())
    ) {
      return new HttpResponse(JSON.stringify({ error: '이미 존재하는 태그 이름입니다.' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 태그 수정
    const updatedTag = {
      ...tags[tagIndex],
      name: data.name.trim()
    };
    
    tags = tags.map((tag, index) => index === tagIndex ? updatedTag : tag);
    
    return HttpResponse.json(updatedTag);
  }),

  // 태그 삭제
  http.delete('/api/tags/:id', async ({ params }) => {
    const { id } = params;
    await delay(150);
    
    // 태그 찾기
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: '해당 ID의 태그를 찾을 수 없습니다.'
      });
    }
    
    // 태그 삭제
    tags = tags.filter(tag => tag.id !== id);
    
    return new HttpResponse(null, { status: 204 });
  })
]; 