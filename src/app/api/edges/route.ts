/**
 * 파일명: src/app/api/edges/route.ts
 * 목적: 엣지 목록 조회 및 생성을 위한 API 라우트
 * 역할: GET /api/edges, POST /api/edges, DELETE /api/edges?ids=...
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw edgesAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase-server';
import { EdgeInput, toEdge } from '@/types/edge';

// 유효성 검증 스키마
const EdgeInputSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.any().optional(),
  data: z.any().optional()
});

// GET /api/edges - 엣지 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const target = searchParams.get('target');
    const userId = searchParams.get('userId');
    
    // Supabase 쿼리 빌더
    let query = supabase.from('edges').select('*');
    
    // 검색 파라미터 적용
    if (source) {
      query = query.eq('source', source);
    }
    if (target) {
      query = query.eq('target', target);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // 결과 가져오기
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('엣지 목록 조회 오류:', error);
      return NextResponse.json(
        { error: '엣지 목록을 가져오는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 카멜케이스로 변환
    const formattedData = data.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.source_handle,
      targetHandle: edge.target_handle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      data: edge.data,
      userId: edge.user_id,
      createdAt: edge.created_at,
      updatedAt: edge.updated_at
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('엣지 목록 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// POST /api/edges - 엣지 생성
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' }, 
        { status: 401 }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    
    // 단일 또는 배열 처리
    const inputsArray = Array.isArray(body) ? body : [body];
    
    // 각 입력 유효성 검증
    const validationResults = inputsArray.map(input => 
      EdgeInputSchema.safeParse(input)
    );
    
    // 유효성 검사 실패 항목 확인
    const invalidInputs = validationResults
      .map((result, index) => result.success ? null : { index, error: result.error })
      .filter(Boolean);
    
    if (invalidInputs.length > 0) {
      return NextResponse.json(
        { error: '잘못된 엣지 데이터 형식입니다.', details: invalidInputs }, 
        { status: 400 }
      );
    }
    
    // DB에 저장할 데이터 변환
    const edgesToInsert = inputsArray.map(input => {
      const edgeData = toEdge(input, user.id);
      return {
        source: edgeData.source,
        target: edgeData.target,
        source_handle: edgeData.sourceHandle,
        target_handle: edgeData.targetHandle,
        type: edgeData.type,
        animated: edgeData.animated,
        style: edgeData.style,
        data: edgeData.data,
        user_id: edgeData.userId
      };
    });
    
    // DB에 저장
    const { data, error } = await supabase
      .from('edges')
      .insert(edgesToInsert)
      .select();
    
    if (error) {
      console.error('엣지 생성 오류:', error);
      
      // 외래 키 제약 에러 처리
      if (error.code === '23503') {
        return NextResponse.json(
          { error: '참조하는 카드가 존재하지 않습니다.' }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: '엣지를 생성하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 카멜케이스로 변환
    const formattedData = data.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.source_handle,
      targetHandle: edge.target_handle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      data: edge.data,
      userId: edge.user_id,
      createdAt: edge.created_at,
      updatedAt: edge.updated_at
    }));
    
    return NextResponse.json(formattedData, { status: 201 });
  } catch (error) {
    console.error('엣지 생성 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/edges?ids=id1,id2,... - 다중 엣지 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: '삭제할 엣지 ID를 지정해야 합니다.' }, 
        { status: 400 }
      );
    }
    
    const ids = idsParam.split(',');
    
    // 소유권 확인 및 삭제
    const { error } = await supabase
      .from('edges')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('엣지 일괄 삭제 오류:', error);
      return NextResponse.json(
        { error: '엣지를 삭제하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('엣지 일괄 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 