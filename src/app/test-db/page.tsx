import React from 'react';
import prisma from '@/lib/prisma';
import type { Tag } from '@prisma/client';

// 태그와 연결된 카드 수를 포함하는 타입 정의
type TagWithCount = Tag & {
  _count: {
    cardTags: number;
  };
};

export default async function TestDatabasePage() {
  let tags: TagWithCount[] = [];
  let error: string | null = null;
  
  try {
    // Prisma를 사용하여 태그 목록을 가져옵니다
    tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            cardTags: true,
          },
        },
      },
    });
  } catch (e) {
    console.error('데이터베이스 연결 오류:', e);
    error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">데이터베이스 연결 테스트</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">태그 목록</h2>
        
        {error ? (
          <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-red-700 dark:text-red-400">
              데이터베이스 연결 오류: {error}
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              Vercel 환경 변수가 올바르게 설정되었는지 확인하세요.
            </p>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">등록된 태그가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li 
                key={tag.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  연결된 카드: {tag._count.cardTags}개
                </span>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-green-700 dark:text-green-400">
            {!error 
              ? '이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!' 
              : '로컬 환경에서는 연결 오류가 발생할 수 있습니다. Vercel 배포 환경에서 다시 테스트해보세요.'}
          </p>
        </div>
      </div>
    </div>
  );
} 