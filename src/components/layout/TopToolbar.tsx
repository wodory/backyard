'use client';

import { useState } from 'react';
import { Menu, Share2, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopToolbar() {
  const [projectName, setProjectName] = useState('프로젝트 이름');
  
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-3 py-2 bg-background/80 backdrop-blur-sm border-b z-10">
      {/* 좌측: 메뉴 아이콘 및 프로젝트 제목 */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>내보내기</DropdownMenuItem>
            <DropdownMenuItem>가져오기</DropdownMenuItem>
            <DropdownMenuItem>저장</DropdownMenuItem>
            <DropdownMenuItem>옵션</DropdownMenuItem>
            <DropdownMenuItem>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <h1 className="text-xl font-semibold">{projectName}</h1>
      </div>
      
      {/* 우측: 기능 아이콘들 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
          <span className="sr-only">공유</span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">설정</span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">로그아웃</span>
        </Button>
      </div>
    </div>
  );
} 