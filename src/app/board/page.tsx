/**
 * 파일명: page.tsx
 * 목적: 보드 페이지 컴포넌트
 * 역할: 보드 기능의 페이지 레벨 컴포넌트, 리팩토링된 Board 컴포넌트 사용
 * 작성일: 2024-05-31
 */

'use client';

import { ReactFlowProvider } from '@xyflow/react';
import Board from '@/components/board/components/Board';
import { useAppStore } from '@/store/useAppStore';

// 기존 코드 보존을 위한 주석 처리된 함수들 (테스트에서 참조할 수 있음)
export const autoLayoutNodes = (nodes: any[]) => {
  return nodes.map((node: any, index: number) => ({
    ...node,
    position: {
      x: (index % 3) * 300 + 50, 
      y: Math.floor(index / 3) * 200 + 50
    }
  }));
};

// 보드 페이지 컴포넌트
export default function BoardPage() {
  const { selectCard } = useAppStore();
  
  return (
    <div className="w-full h-full relative">
      <ReactFlowProvider>
        <Board
          onSelectCard={selectCard}
          className="bg-background"
          showControls={true}
        />
      </ReactFlowProvider>
    </div>
  );
} 