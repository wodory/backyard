'use client';

import { Share2, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShortcutToolbar() {
  return (
    <div className="fixed top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-2 z-10">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Share2 className="h-5 w-5" />
        <span className="sr-only">공유</span>
      </Button>
      
      <Button variant="ghost" size="icon" className="rounded-full">
        <Settings className="h-5 w-5" />
        <span className="sr-only">설정</span>
      </Button>
      
      <Button variant="ghost" size="icon" className="rounded-full">
        <LogOut className="h-5 w-5" />
        <span className="sr-only">로그아웃</span>
      </Button>
    </div>
  );
} 