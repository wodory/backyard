/**
 * 파일명: src/components/ideamap/LayoutControls.tsx
 * 목적: 아이디어맵 레이아웃 제어 컴포넌트
 * 역할: 레이아웃 방향 변경, 자동 배치, 레이아웃 저장 기능 제공
 * 작성일: 2024-05-07
 * 수정일: 2024-05-07 : 미사용 import(toast) 제거
 */

import React from 'react';

import { Layout, LayoutGrid, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutControlsProps {
  onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
  onAutoLayout: () => void;
  onSaveLayout: () => void;
}

export default function LayoutControls({
  onLayoutChange,
  onAutoLayout,
  onSaveLayout
}: LayoutControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Layout className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>레이아웃 옵션</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onLayoutChange('horizontal')}
          className="flex items-center cursor-pointer"
        >
          <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
          <span>수평 레이아웃</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLayoutChange('vertical')}
          className="flex items-center cursor-pointer"
        >
          <AlignVerticalJustifyCenter className="mr-2 h-4 w-4" />
          <span>수직 레이아웃</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onAutoLayout}
          className="flex items-center cursor-pointer"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>자동 배치</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSaveLayout}
          className="flex items-center cursor-pointer"
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>레이아웃 저장</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 