'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { Loader2 } from 'lucide-react';

import Board from '@/components/ideamap/components/IdeaMap';
import { useAppStore } from '@/store/useAppStore';

// 외부 내보내기 컴포넌트
export function MainCanvas() {
  const { selectCard } = useAppStore();

  return (
    <div className="w-full h-full pt-14">
      <Board
        onSelectCard={selectCard}
        className="bg-background"
        showControls={true}
      />
    </div>
  );
} 