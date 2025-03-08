import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function TestDatabasePage() {
  // Prisma를 사용하여 태그 목록을 가져옵니다
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          cardTags: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">데이터베이스 연결 테스트</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">태그 목록</h2>
        
        {tags.length === 0 ? (
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
            이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!
          </p>
        </div>
      </div>
    </div>
  );
} 