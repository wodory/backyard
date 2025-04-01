'use client';

import { LogOut, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export function ShortcutToolbar() {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="fixed top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-2 z-10">
      {/* 사이드바 접기 */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={toggleSidebar}
        title="사이드바 접기"
      >
        <PanelRight className="h-5 w-5" />
        <span className="sr-only">사이드바 접기</span>
      </Button>

      {/* 로그아웃 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        title="로그아웃"
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">로그아웃</span>
      </Button>
    </div>
  );
} 