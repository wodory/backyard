/**
 * 파일명: src/tests/msw/handlers/edgeHandlers.ts
 * 목적: 엣지 API 테스트를 위한 MSW 핸들러
 * 역할: 엣지 API 엔드포인트를 모킹하여 테스트 환경 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw edgeHandlers
 */

import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';

import { Edge, EdgeInput, EdgePatch } from '@/types/edge';

// 테스트용 모의 엣지 데이터
export const mockEdges: Edge[] = [
  {
    id: '1',
    source: 'card-1',
    target: 'card-2',
    type: 'default',
    animated: false,
    style: { stroke: '#333333', strokeWidth: 2 },
    data: { label: '연결 1' },
    userId: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    source: 'card-2',
    target: 'card-3',
    type: 'step',
    animated: true,
    style: { stroke: '#007bff', strokeWidth: 2 },
    data: { label: '연결 2' },
    userId: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    source: 'card-1',
    target: 'card-3',
    type: 'bezier',
    animated: false,
    style: { stroke: '#28a745', strokeWidth: 1 },
    data: { label: '연결 3' },
    userId: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

// 인메모리 엣지 저장소 (테스트용)
let edges = [...mockEdges];

// MSW 핸들러
export const edgeHandlers = [
  // GET /api/edges - 엣지 목록 조회
  http.get('/api/edges', async ({ request }) => {
    await delay(100); // 네트워크 지연 시뮬레이션
    
    const url = new URL(request.url);
    const source = url.searchParams.get('source');
    const target = url.searchParams.get('target');
    const userId = url.searchParams.get('userId');
    
    let result = [...edges];
    
    // 필터링 적용
    if (source) {
      result = result.filter(edge => edge.source === source);
    }
    
    if (target) {
      result = result.filter(edge => edge.target === target);
    }
    
    if (userId) {
      result = result.filter(edge => edge.userId === userId);
    }
    
    return HttpResponse.json(result, { status: 200 });
  }),
  
  // GET /api/edges/:id - 단일 엣지 조회
  http.get('/api/edges/:id', async ({ params }) => {
    await delay(100);
    
    const id = params.id as string;
    const edge = edges.find(e => e.id === id);
    
    if (!edge) {
      return new HttpResponse(
        JSON.stringify({ error: '엣지를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }
    
    return HttpResponse.json(edge, { status: 200 });
  }),
  
  // POST /api/edges - 엣지 생성
  http.post('/api/edges', async ({ request }) => {
    await delay(200);
    
    const body = await request.json();
    const inputs = Array.isArray(body) ? body : [body];
    
    const now = new Date().toISOString();
    const createdEdges = inputs.map((input: EdgeInput) => {
      const edge: Edge = {
        id: uuidv4(),
        source: input.source,
        target: input.target,
        sourceHandle: input.sourceHandle,
        targetHandle: input.targetHandle,
        type: input.type || 'default',
        animated: input.animated || false,
        style: input.style || {},
        data: input.data || {},
        userId: 'user-1', // 테스트용 고정 사용자
        createdAt: now,
        updatedAt: now
      };
      
      edges.push(edge);
      return edge;
    });
    
    return HttpResponse.json(createdEdges, { status: 201 });
  }),
  
  // PATCH /api/edges/:id - 엣지 수정
  http.patch('/api/edges/:id', async ({ params, request }) => {
    await delay(200);
    
    const id = params.id as string;
    const edgeIndex = edges.findIndex(e => e.id === id);
    
    if (edgeIndex === -1) {
      return new HttpResponse(
        JSON.stringify({ error: '엣지를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }
    
    const patch = await request.json() as Partial<EdgePatch>;
    const currentEdge = edges[edgeIndex];
    
    const updatedEdge: Edge = {
      ...currentEdge,
      ...(patch.source && { source: patch.source }),
      ...(patch.target && { target: patch.target }),
      ...(patch.sourceHandle !== undefined && { sourceHandle: patch.sourceHandle }),
      ...(patch.targetHandle !== undefined && { targetHandle: patch.targetHandle }),
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.animated !== undefined && { animated: patch.animated }),
      ...(patch.style !== undefined && { style: patch.style }),
      ...(patch.data !== undefined && { data: patch.data }),
      updatedAt: new Date().toISOString()
    };
    
    edges[edgeIndex] = updatedEdge;
    
    return HttpResponse.json(updatedEdge, { status: 200 });
  }),
  
  // DELETE /api/edges/:id - 엣지 삭제
  http.delete('/api/edges/:id', async ({ params }) => {
    await delay(200);
    
    const id = params.id as string;
    const initialLength = edges.length;
    
    edges = edges.filter(e => e.id !== id);
    
    if (edges.length === initialLength) {
      return new HttpResponse(
        JSON.stringify({ error: '엣지를 찾을 수 없습니다.' }),
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // DELETE /api/edges?ids=id1,id2,... - 다중 엣지 삭제
  http.delete('/api/edges', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');
    
    if (!idsParam) {
      return new HttpResponse(
        JSON.stringify({ error: '삭제할 엣지 ID를 지정해야 합니다.' }),
        { status: 400 }
      );
    }
    
    const ids = idsParam.split(',');
    
    edges = edges.filter(e => !ids.includes(e.id));
    
    return new HttpResponse(null, { status: 204 });
  })
];

// 핸들러를 메인 핸들러 배열에 추가
export default edgeHandlers; 