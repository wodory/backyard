'use client';

import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  PlusCircle,
  Save
} from 'lucide-react';

import CreateCardModal from '@/components/cards/CreateCardModal';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export function MainToolbar() {
  const {
    applyLayout,
    saveBoardLayout: saveIdeaMapLayout,
    layoutDirection
  } = useAppStore();

  return (
    <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-2 z-10">
      <CreateCardModal
        customTrigger={
          <Button
            variant="ghost"
            size="icon"
            title="새 카드 추가"
            className="rounded-full h-[60px] w-[60px]"
          >
            <PlusCircle className="h-8 w-8" />
            <span className="sr-only">새 카드 추가</span>
          </Button>
        }
      />

      <Button
        variant="ghost"
        size="icon"
        title="수평 정렬"
        className="rounded-full h-[60px] w-[60px]"
        onClick={() => applyLayout('horizontal')}
      >
        <AlignHorizontalJustifyCenter className="h-8 w-8" />
        <span className="sr-only">수평 정렬</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="수직 정렬"
        className="rounded-full h-[60px] w-[60px]"
        onClick={() => applyLayout('vertical')}
      >
        <AlignVerticalJustifyCenter className="h-8 w-8" />
        <span className="sr-only">수직 정렬</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="자동 배치"
        className="rounded-full h-[60px] w-[60px]"
        onClick={() => applyLayout('auto')}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 9L17 9M21 15H11M7 15H3M3 9L13 9M17 15L21 15M7 9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 21V17M17 7V3M7 3V7M7 21V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="15" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">자동 배치</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="레이아웃 저장"
        className="rounded-full h-[60px] w-[60px]"
        onClick={saveIdeaMapLayout}
      >
        <Save className="h-8 w-8" />
        <span className="sr-only">레이아웃 저장</span>
      </Button>
    </div>
  );
} 