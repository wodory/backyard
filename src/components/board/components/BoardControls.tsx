/**
 * 파일명: BoardControls.tsx
 * 목적: 보드 컨트롤 패널 컴포넌트
 * 역할: 보드 캔버스의 우측 상단에 위치한 컨트롤 패널 UI 관리
 * 작성일: 2024-05-30
 */

'use client';

import React from 'react';
import { Panel } from '@xyflow/react';
import { BoardSettings } from '@/lib/board-utils';
import BoardSettingsControl from '@/components/board/BoardSettingsControl';
import LayoutControls from '@/components/board/LayoutControls';
import CreateCardButton from '@/components/cards/CreateCardButton';
import DevTools from '@/components/debug/DevTools';

/**
 * BoardControlsProps: 보드 컨트롤 컴포넌트 props
 * @interface BoardControlsProps
 */
interface BoardControlsProps {
  /** 보드 설정 */
  boardSettings: BoardSettings;
  /** 보드 설정 변경 핸들러 */
  onBoardSettingsChange: (settings: BoardSettings, isAuthenticated: boolean, userId?: string) => void;
  /** 레이아웃 변경 핸들러 */
  onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
  /** 자동 레이아웃 적용 핸들러 */
  onAutoLayout: () => void;
  /** 레이아웃 저장 핸들러 */
  onSaveLayout: () => void;
  /** 카드 생성 버튼 클릭 핸들러 */
  onCreateCard: () => void;
  /** 사용자 인증 여부 */
  isAuthenticated: boolean;
  /** 사용자 ID */
  userId?: string;
}

/**
 * BoardControls: 보드 컨트롤 패널 컴포넌트
 * 보드의 우측 상단에 위치하며, 보드 설정, 레이아웃 컨트롤, 카드 생성 버튼을 포함
 */
export default function BoardControls({
  boardSettings,
  onBoardSettingsChange,
  onLayoutChange,
  onAutoLayout,
  onSaveLayout,
  onCreateCard,
  isAuthenticated,
  userId
}: BoardControlsProps) {
  return (
    <>
      <Panel position="top-right" className="flex flex-col gap-2">
        <BoardSettingsControl 
          settings={boardSettings} 
          onSettingsChange={(settings) => 
            onBoardSettingsChange(settings, isAuthenticated, userId)
          } 
        />
        <LayoutControls 
          onLayoutChange={onLayoutChange}
          onAutoLayout={onAutoLayout}
          onSaveLayout={onSaveLayout}
        />
        <CreateCardButton 
          onCardCreated={() => {}} 
          onClose={() => onCreateCard()} 
          autoOpen={false}
        />
      </Panel>
      
      {process.env.NODE_ENV === 'development' && (
        <Panel position="bottom-left">
          <DevTools />
        </Panel>
      )}
    </>
  );
} 