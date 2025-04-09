'use client';

import React, { useState, useCallback } from 'react';
import {
  Menu,
  ChevronRight,
  Palette,
  Grid3X3,
  ChevronsUpDown,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  LayoutGrid,
  Save,
  Settings,
  ArrowRightIcon,
  Circle,
  SeparatorHorizontal,
  Paintbrush,
  Layout,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { BoardSettings, DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
import {
  SNAP_GRID_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  MARKER_TYPE_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  MARKER_SIZE_OPTIONS,
  EDGE_COLOR_OPTIONS,
  EDGE_ANIMATION_OPTIONS,
  STORAGE_KEY,
  EDGES_STORAGE_KEY
} from '@/lib/board-constants';
import { useAuth } from '@/contexts/AuthContext';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('ProjectToolbar');

export function ProjectToolbar() {
  const [projectName, setProjectName] = useState('프로젝트 이름');
  const {
    layoutDirection,
    setLayoutDirection,
    boardSettings,
    updateBoardSettings,
    reactFlowInstance
  } = useAppStore();
  const { signOut } = useAuth();

  // 저장 핸들러 (임시)
  const handleSaveLayout = useCallback(() => {
    try {
      if (!reactFlowInstance) {
        toast.error('React Flow 인스턴스를 찾을 수 없습니다');
        return;
      }

      // React Flow 인스턴스에서 노드와 엣지 데이터 가져오기
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();

      if (!nodes.length) {
        toast.error('저장할 노드가 없습니다');
        return;
      }

      // 노드와 엣지 데이터를 로컬 스토리지에 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));

      toast.success('레이아웃이 저장되었습니다');
    } catch (error) {
      console.error('레이아웃 저장 실패:', error);
      toast.error('레이아웃 저장에 실패했습니다');
    }
  }, [reactFlowInstance]);

  // 스냅 그리드 값 변경 핸들러
  const handleSnapGridChange = useCallback((value: string) => {
    console.log('[ProjectToolbar] 격자 크기 변경:', value);
    const gridSize = parseInt(value, 10);
    updateBoardSettings({
      snapGrid: [gridSize, gridSize] as [number, number],
      snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = useCallback((value: string) => {
    console.log('[ProjectToolbar] 연결선 스타일 변경:', value);
    updateBoardSettings({
      connectionLineType: value as ConnectionLineType,
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = useCallback((value: string) => {
    updateBoardSettings({
      markerEnd: value === 'null' ? null : value as MarkerType,
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = useCallback(() => {
    updateBoardSettings({
      snapToGrid: !boardSettings.snapToGrid,
    });
    toast.success('설정이 변경되었습니다.');
  }, [boardSettings.snapToGrid, updateBoardSettings]);

  // 연결선 두께 변경 핸들러
  const handleStrokeWidthChange = useCallback((value: string) => {
    updateBoardSettings({
      strokeWidth: parseInt(value, 10),
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 마커 크기 변경 핸들러
  const handleMarkerSizeChange = useCallback((value: string) => {
    updateBoardSettings({
      markerSize: parseInt(value, 10),
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 연결선 색상 변경 핸들러
  const handleEdgeColorChange = useCallback((value: string) => {
    updateBoardSettings({
      edgeColor: value,
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 선택된 연결선 색상 변경 핸들러
  const handleSelectedEdgeColorChange = useCallback((value: string) => {
    updateBoardSettings({
      selectedEdgeColor: value,
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 연결선 애니메이션 변경 핸들러
  const handleAnimatedChange = useCallback((value: string) => {
    updateBoardSettings({
      animated: value === 'true',
    });
    toast.success('설정이 변경되었습니다.');
  }, [updateBoardSettings]);

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    toast.info('내보내기 기능은 아직 구현되지 않았습니다');
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      logger.info('로그아웃 시작');

      // 로그아웃 처리는 AuthContext의 signOut 함수가 알아서 처리함
      await signOut();
      toast.success('로그아웃되었습니다.');

      // 로그아웃 후 로그인 페이지로 직접 이동
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      logger.error('로그아웃 실패', error);
      toast.error('로그아웃 중 문제가 발생했습니다.');

      // 오류가 발생해도 로그인 페이지로 리디렉션 (UI 동기화를 위해)
      try {
        window.location.href = '/login';
      } catch (redirectError) {
        console.error('리디렉션 중 오류:', redirectError);
        logger.error('리디렉션 실패', redirectError);
      }
    }
  };

  return (
    <div className="fixed top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border p-1 px-3 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" sideOffset={12} align="start" alignOffset={-12}>
          <DropdownMenuLabel>프로젝트</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSaveLayout}>
            <Save className="mr-1.5 h-4 w-4" />
            레이아웃 저장
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <ArrowRightIcon className="mr-1.5 h-4 w-4" />
            내보내기
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* 보드 설정 서브메뉴 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className="mr-1.5 h-4 w-4" />
              보드 설정
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {/* 스냅 그리드 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Grid3X3 className="mr-1.5 h-4 w-4" />
                    <span>격자에 맞추기</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={boardSettings.snapToGrid}
                      onCheckedChange={handleSnapToGridToggle}
                    >
                      격자에 맞추기 활성화
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={boardSettings.snapGrid[0].toString()}
                      onValueChange={handleSnapGridChange}
                    >
                      {SNAP_GRID_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 연결선 타입 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17C8 17 8 7 13 7C18 7 18 17 21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>연결선 스타일</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.connectionLineType}
                      onValueChange={handleConnectionTypeChange}
                    >
                      {CONNECTION_TYPE_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 화살표 마커 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightIcon className="mr-1.5 h-4 w-4" />
                    <span>화살표 스타일</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.markerEnd === null ? 'null' : boardSettings.markerEnd}
                      onValueChange={handleMarkerTypeChange}
                    >
                      {MARKER_TYPE_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value ?? 'null'} value={option.value === null ? 'null' : option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 연결선 두께 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SeparatorHorizontal className="mr-1.5 h-4 w-4" />
                    <span>연결선 두께</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.strokeWidth.toString()}
                      onValueChange={handleStrokeWidthChange}
                    >
                      {STROKE_WIDTH_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 마커 크기 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Circle className="mr-1.5 h-4 w-4" />
                    <span>화살표 크기</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.markerSize.toString()}
                      onValueChange={handleMarkerSizeChange}
                    >
                      {MARKER_SIZE_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 연결선 색상 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Paintbrush className="mr-1.5 h-4 w-4" />
                    <span>연결선 색상</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.edgeColor}
                      onValueChange={handleEdgeColorChange}
                    >
                      {EDGE_COLOR_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 선택된 연결선 색상 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Paintbrush className="mr-1.5 h-4 w-4" />
                    <span>선택된 연결선 색상</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.selectedEdgeColor}
                      onValueChange={handleSelectedEdgeColorChange}
                    >
                      {EDGE_COLOR_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 연결선 애니메이션 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M14 10L19 12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>연결선 애니메이션</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={boardSettings.animated.toString()}
                      onValueChange={handleAnimatedChange}
                    >
                      {EDGE_ANIMATION_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value.toString()} value={option.value.toString()}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* <DropdownMenuItem>옵션</DropdownMenuItem> */}

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <h1 className="text-l font-semibold pr-2">{projectName}</h1>
    </div>
  );
} 