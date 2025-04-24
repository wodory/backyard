/**
 * 파일명: src/lib/api-utils.ts
 * 목적: API 요청을 처리하기 위한 유틸리티 함수
 * 역할: 개발 환경과 프로덕션 환경에서 다른 데이터베이스 클라이언트를 사용하도록 도와줌
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  service
 */

import { NextRequest } from 'next/server';

import { PrismaClient } from '@prisma/client';

import { getUserFromRequest } from './auth-server';
import prisma from './prisma';
import { createClient } from './supabase/server';

/**
 * isDevelopment: 현재 환경이 개발 환경인지 확인
 * @returns {boolean} 개발 환경이면 true, 그렇지 않으면 false
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * getAuthUser: 요청에서 인증된 사용자 정보 가져오기
 * @param {NextRequest} request - 다음 요청 객체
 * @returns {Promise<any>} 인증된 사용자 정보
 */
export async function getAuthUser(request: NextRequest) {
  return await getUserFromRequest(request);
}

/**
 * getEdgeModel: 현재 환경에 맞는 엣지 모델 접근 객체 얻기
 * 개발 환경에서는 Prisma를, 프로덕션 환경에서는 Supabase를 사용
 * @returns Edge 모델 접근 객체
 */
export async function getEdgeModel() {
  if (isDevelopment()) {
    // 개발 환경: Prisma 사용
    return {
      findUnique: async ({ where }: { where: { id: string } }) => {
        return await prisma.edge.findUnique({ where });
      },
      findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }) => {
        return await prisma.edge.findMany({ where, orderBy });
      },
      create: async ({ data }: { data: any }) => {
        return await prisma.edge.create({ data });
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        return await prisma.edge.update({ where, data });
      },
      delete: async ({ where }: { where: { id: string } }) => {
        return await prisma.edge.delete({ where });
      },
      deleteMany: async ({ where }: { where: any }) => {
        return await prisma.edge.deleteMany({ where });
      }
    };
  } else {
    // 프로덕션 환경: Supabase 사용
    const supabase = await createClient();
    return {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const { data, error } = await supabase
          .from('edges')
          .select('*')
          .eq('id', where.id)
          .single();
        
        if (error) throw error;
        return data;
      },
      findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }) => {
        let query = supabase.from('edges').select('*');
        
        // where 조건 적용
        if (where) {
          Object.entries(where).forEach(([key, value]) => {
            if (key === 'id' && (value as any).in) {
              // id IN (...) 조건 처리
              query = query.in('id', (value as any).in);
            } else if (typeof value === 'object' && value !== null) {
              // 복잡한 조건은 처리 불가능할 수 있음
              console.warn('Supabase에서 지원하지 않는 복잡한 쿼리 조건이 있습니다:', key, value);
            } else {
              query = query.eq(key, value);
            }
          });
        }
        
        // 정렬 적용
        if (orderBy) {
          const [field, direction] = Object.entries(orderBy)[0];
          query = query.order(field, { ascending: direction === 'asc' });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      create: async ({ data }: { data: any }) => {
        const { data: createdData, error } = await supabase
          .from('edges')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return createdData;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const { data: updatedData, error } = await supabase
          .from('edges')
          .update(data)
          .eq('id', where.id)
          .select()
          .single();
        
        if (error) throw error;
        return updatedData;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const { error } = await supabase
          .from('edges')
          .delete()
          .eq('id', where.id);
        
        if (error) throw error;
        return { id: where.id };
      },
      deleteMany: async ({ where }: { where: any }) => {
        // Supabase에서는 복잡한 deleteMany를 직접 지원하지 않으므로 단순화
        if (where.id?.in) {
          const { error, count } = await supabase
            .from('edges')
            .delete()
            .in('id', where.id.in);
          
          if (error) throw error;
          return { count };
        } else {
          console.warn('Supabase에서 지원하지 않는 복잡한 deleteMany 조건입니다:', where);
          return { count: 0 };
        }
      }
    };
  }
} 