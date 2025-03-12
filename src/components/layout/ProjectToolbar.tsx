'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProjectToolbar() {
  const [projectName, setProjectName] = useState('프로젝트 이름');
  
  return (
    <div className="fixed top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-3 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
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
      
      <h1 className="text-xl font-semibold pr-2">{projectName}</h1>
    </div>
  );
} 