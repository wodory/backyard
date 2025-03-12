'use client';

import { useAppStore } from '@/store/useAppStore';
import { ReactFlowProvider } from '@xyflow/react';
import { Loader2 } from 'lucide-react';
import BoardComponent from '@/components/board/BoardComponent';
import '@xyflow/react/dist/style.css';

// 외부 내보내기 컴포넌트
export function MainCanvas() {
  const { selectCard } = useAppStore();
  
  return (
    <ReactFlowProvider>
      <div className="w-full h-full pt-14">
        <BoardComponent
          onSelectCard={selectCard}
          className="bg-background"
          showControls={true}
        />
      </div>
    </ReactFlowProvider>
  );
} 