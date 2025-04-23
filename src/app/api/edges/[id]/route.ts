/**
 * 파일명: src/app/api/edges/[id]/route.ts
 * 목적: 개별 엣지 조회, 수정, 삭제를 위한 API 라우트
 * 역할: GET, PATCH, DELETE /api/edges/:id
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw edgeAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromRequest } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase-server';

// 유효성 검증 스키마
const EdgePatchSchema = z.object({
  source: z.string().optional(),
  target: z.string().optional(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.any().optional(),
  data: z.any().optional()
});

// GET /api/edges/:id - 개별 엣지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '엣지를 찾을 수 없습니다.' }, 
          { status: 404 }
        );
      }
      
      console.error(`엣지 조회 오류 (ID=${id}):`, error);
      return NextResponse.json(
        { error: '엣지를 가져오는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 카멜케이스로 변환
    const formattedData = {
      id: data.id,
      source: data.source,
      target: data.target,
      sourceHandle: data.source_handle,
      targetHandle: data.target_handle,
      type: data.type,
      animated: data.animated,
      style: data.style,
      data: data.data,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`엣지 조회 API 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// PATCH /api/edges/:id - 엣지 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' }, 
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // 소유권 확인
    const { data: existingEdge, error: fetchError } = await supabase
      .from('edges')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '엣지를 찾을 수 없습니다.' }, 
          { status: 404 }
        );
      }
      
      console.error(`엣지 확인 오류 (ID=${id}):`, fetchError);
      return NextResponse.json(
        { error: '엣지를 확인하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    if (existingEdge.user_id !== user.id) {
      return NextResponse.json(
        { error: '이 엣지를 수정할 권한이 없습니다.' }, 
        { status: 403 }
      );
    }
    
    // 요청 본문 파싱 및 유효성 검사
    const body = await request.json();
    const validationResult = EdgePatchSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '잘못된 엣지 데이터 형식입니다.', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const patch = validationResult.data;
    
    // 스네이크 케이스로 변환
    const updateData: any = {};
    if (patch.source) updateData.source = patch.source;
    if (patch.target) updateData.target = patch.target;
    if (patch.sourceHandle !== undefined) updateData.source_handle = patch.sourceHandle;
    if (patch.targetHandle !== undefined) updateData.target_handle = patch.targetHandle;
    if (patch.type !== undefined) updateData.type = patch.type;
    if (patch.animated !== undefined) updateData.animated = patch.animated;
    if (patch.style !== undefined) updateData.style = patch.style;
    if (patch.data !== undefined) updateData.data = patch.data;
    
    // DB 업데이트
    const { data, error } = await supabase
      .from('edges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`엣지 업데이트 오류 (ID=${id}):`, error);
      
      // 외래 키 제약 에러 처리
      if (error.code === '23503') {
        return NextResponse.json(
          { error: '참조하는 카드가 존재하지 않습니다.' }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: '엣지를 업데이트하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 카멜케이스로 변환
    const formattedData = {
      id: data.id,
      source: data.source,
      target: data.target,
      sourceHandle: data.source_handle,
      targetHandle: data.target_handle,
      type: data.type,
      animated: data.animated,
      style: data.style,
      data: data.data,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`엣지 업데이트 API 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/edges/:id - 엣지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' }, 
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // 소유권 확인 및 삭제
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error(`엣지 삭제 오류 (ID=${id}):`, error);
      return NextResponse.json(
        { error: '엣지를 삭제하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`엣지 삭제 API 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 