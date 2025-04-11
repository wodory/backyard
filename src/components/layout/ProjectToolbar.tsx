'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  LogOut,
  FileText,
  FolderOpen
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
import { useAppStore, selectActiveProject, Project } from '@/store/useAppStore';
import { toast } from 'sonner';
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { BoardSettings } from '@/lib/board-utils';
import {
  SNAP_GRID_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  MARKER_TYPE_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  MARKER_SIZE_OPTIONS,
  EDGE_COLOR_OPTIONS,
  EDGE_ANIMATION_OPTIONS
} from '@/lib/board-constants';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('ProjectToolbar');

export function ProjectToolbar() {
  // useAppStore에서 프로젝트 정보와 액션을 가져옴
  const {
    layoutDirection,
    setLayoutDirection,
    boardSettings,
    updateBoardSettings,
    saveBoardLayout,
    logoutAction,
    projects,
    activeProjectId,
    fetchProjects,
    createProject,
    setActiveProject
  } = useAppStore();

  // 활성 프로젝트 정보 가져오기
  const activeProject = useAppStore(selectActiveProject);

  // 프로젝트 이름과 작성자 정보 표시
  const displayProjectName = activeProject
    ? (activeProject.ownerNickname
      ? `${activeProject.name} - ${activeProject.ownerNickname}`
      : activeProject.name)
    : '프로젝트를 선택하세요';

  // 저장 핸들러
  const handleSaveLayout = useCallback(() => {
    // saveBoardLayout 액션을 호출하여 레이아웃 저장 처리
    saveBoardLayout();
  }, [saveBoardLayout]);

  // 프로젝트 정보 표시 핸들러
  const handleShowProjectInfo = useCallback(() => {
    if (activeProject) {
      toast.info(`프로젝트 정보: ${activeProject.name} (ID: ${activeProject.id})`);
    } else {
      toast.info('선택된 프로젝트가 없습니다.');
    }
    // TODO: 프로젝트 정보 모달 표시
  }, [activeProject]);

  // 프로젝트 불러오기 핸들러
  const handleLoadProject = useCallback(() => {
    try {
      // API 호출을 통해 프로젝트 목록 가져오기 (아직 API 미구현)
      fetchProjects();
    } catch (error) {
      toast.error('프로젝트 목록 로드 중 오류가 발생했습니다.');
    }
  }, [fetchProjects]);

  // 새 프로젝트 생성 핸들러
  const handleCreateProject = useCallback(() => {
    // 실제 구현에서는 모달을 통해 프로젝트 정보 입력
    const projectName = prompt('새 프로젝트 이름을 입력하세요', '새 프로젝트');

    if (!projectName) return; // 사용자가 취소하거나 빈 이름 입력 시

    // 임시로 하드코딩된 정보로 프로젝트 생성
    createProject({
      name: projectName,
      ownerNickname: '현재 사용자', // 실제 구현에서는 로그인한 사용자 정보 사용
      userId: 'temp-user-id', // 실제 구현에서는a 로그인한 사용자 ID 사용
    });
  }, [createProject]);

  // 스냅 그리드 값 변경 핸들러
  const handleSnapGridChange = useCallback((value: string) => {
    const gridSize = parseInt(value, 10);
    updateBoardSettings({
      snapGrid: [gridSize, gridSize] as [number, number],
      snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
    });
  }, [updateBoardSettings]);

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = useCallback((value: string) => {
    updateBoardSettings({
      connectionLineType: value as ConnectionLineType,
    });
  }, [updateBoardSettings]);

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = useCallback((value: string) => {
    updateBoardSettings({
      markerEnd: value === 'null' ? null : value as MarkerType,
    });
  }, [updateBoardSettings]);

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = useCallback(() => {
    updateBoardSettings({
      snapToGrid: !boardSettings.snapToGrid,
    });
  }, [boardSettings.snapToGrid, updateBoardSettings]);

  // 연결선 두께 변경 핸들러
  const handleStrokeWidthChange = useCallback((value: string) => {
    updateBoardSettings({
      strokeWidth: parseInt(value, 10),
    });
  }, [updateBoardSettings]);

  // 마커 크기 변경 핸들러
  const handleMarkerSizeChange = useCallback((value: string) => {
    updateBoardSettings({
      markerSize: parseInt(value, 10),
    });
  }, [updateBoardSettings]);

  // 연결선 색상 변경 핸들러
  const handleEdgeColorChange = useCallback((value: string) => {
    updateBoardSettings({
      edgeColor: value,
    });
  }, [updateBoardSettings]);

  // 선택된 연결선 색상 변경 핸들러
  const handleSelectedEdgeColorChange = useCallback((value: string) => {
    updateBoardSettings({
      selectedEdgeColor: value,
    });
  }, [updateBoardSettings]);

  // 연결선 애니메이션 변경 핸들러
  const handleAnimatedChange = useCallback((value: string) => {
    updateBoardSettings({
      animated: value === 'true',
    });
  }, [updateBoardSettings]);

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    toast.info('내보내기 기능은 아직 구현되지 않았습니다');
  }, []);

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    logger.info('로그아웃 시작');
    // logoutAction 액션을 호출하여 로그아웃 처리
    logoutAction();
  }, [logoutAction]);

  // 컴포넌트 마운트 시 기본 프로젝트 생성 (API가 없는 경우)
  useEffect(() => {
    logger.info('프로젝트 정보 로딩');
    // 프로젝트가 없고 API 호출이 불가능한 경우 로컬 상태에 기본 프로젝트 생성
    if (projects.length === 0) {
      const defaultProject: Partial<Project> = {
        name: '기본 프로젝트',
        ownerNickname: '사용자',
        userId: 'default-user',
      };

      // 이 부분은 API가 구현되면 실제 API 호출로 대체될 것임
      createProject(defaultProject);
    }
  }, [projects.length, createProject]);

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
          <DropdownMenuItem onClick={handleShowProjectInfo}>
            <FileText className="mr-1.5 h-4 w-4" />
            프로젝트 정보...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLoadProject}>
            <FolderOpen className="mr-1.5 h-4 w-4" />
            프로젝트 불러오기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCreateProject}>
            <FileText className="mr-1.5 h-4 w-4" />
            새 프로젝트 만들기
          </DropdownMenuItem>
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

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <h1 className="text-l font-semibold pr-2">{displayProjectName}</h1>
    </div>
  );
} 