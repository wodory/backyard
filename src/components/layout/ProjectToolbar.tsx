/**
 * 파일명: src/components/layout/ProjectToolbar.tsx
 * 목적: 프로젝트 도구 모음 컴포넌트
 * 역할: 아이디어맵의 설정 변경 및 프로젝트 관리 UI 제공
 * 작성일: 2025-03-15
 * 수정일: 2025-04-21 : 기능 추가 - 프로젝트 기본 정보 표시 및 로그아웃
 * 수정일: 2025-05-21 : Three-Layer-Standard 준수를 위한 리팩토링 - Zustand 직접 업데이트 제거
 * 수정일: 2025-05-23 : userId를 useAuthStore에서 직접 가져오도록 수정
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ConnectionLineType, MarkerType } from '@xyflow/react';
import {
  Menu,
  // ChevronRight,
  // Palette,
  Grid3X3,
  // ChevronsUpDown,
  // AlignHorizontalJustifyCenter,
  // AlignVerticalJustifyCenter,
  // LayoutGrid,
  Save,
  Settings,
  ArrowRightIcon,
  Circle,
  SeparatorHorizontal,
  Paintbrush,
  // Layout,
  LogOut,
  FileText,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

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
import { useUpdateIdeaMapSettingsMutation } from '@/hooks/useIdeaMapSettings';
import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings';
import {
  SNAP_GRID_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  MARKER_TYPE_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  MARKER_SIZE_OPTIONS,
  EDGE_COLOR_OPTIONS,
  EDGE_ANIMATION_OPTIONS
} from '@/lib/ideamap-constants';
// import {
//   IDEAMAP_LAYOUT_STORAGE_KEY,
//   IDEAMAP_EDGES_STORAGE_KEY,
//   IDEAMAP_TRANSFORM_STORAGE_KEY
// } from '@/lib/ideamap-constants';
// import { IdeaMapSettings } from '@/lib/ideamap-utils';
import createLogger from '@/lib/logger';
import { useAppStore, selectActiveProject, Project } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';

// 모듈별 로거 생성
const logger = createLogger('ProjectToolbar');

export function ProjectToolbar() {
  // useRouter 훅 호출
  const router = useRouter();

  // useAppStore에서 프로젝트 정보와 액션을 가져옴
  const {
    // layoutDirection,
    // setLayoutDirection,
    // rename board -> ideaMap
    saveIdeaMapLayout,
    logoutAction,
    projects,
    // activeProjectId,
    // fetchProjects,
    createProject,
    // setActiveProject
  } = useAppStore();

  // 활성 프로젝트 정보 가져오기
  const activeProject = useAppStore(selectActiveProject);

  // 인증된 사용자 ID 가져오기 (useAuthStore에서 직접)
  const userId = useAuthStore(selectUserId);

  // TanStack Query mutation 훅 사용
  const { mutate: updateSettings, isPending } = useUpdateIdeaMapSettingsMutation();

  // TanStack Query를 통해 설정 정보 가져오기
  const { data: ideaMapSettings, isLoading, isError, error } = useIdeaMapSettings(userId);

  // 프로젝트 이름과 작성자 정보 표시
  const displayProjectName = activeProject
    ? (activeProject.ownerNickname
      ? `${activeProject.name} - ${activeProject.ownerNickname}`
      : activeProject.name)
    : '프로젝트를 선택하세요';

  // 저장 핸들러
  const handleSaveLayout = useCallback(() => {
    // saveIdeaMapLayout 액션을 호출하여 레이아웃 저장 처리
    saveIdeaMapLayout();
  }, [saveIdeaMapLayout]);

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
      // 프로젝트 목록은 이미 ClientLayout에서 로드됨
      // 여기서는 단순히 사용자에게 현재 사용 가능한 프로젝트 정보를 표시
      if (projects.length > 0) {
        toast.success(`${projects.length}개의 프로젝트가 로드되었습니다.`);
      } else {
        toast.info('사용 가능한 프로젝트가 없습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  }, [projects]);

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
    if (!userId) return;

    const gridSize = parseInt(value, 10);

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: {
        snapGrid: [gridSize, gridSize] as [number, number],
        snapToGrid: gridSize > 0
      }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('그리드 설정이 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = useCallback((value: string) => {
    if (!userId) return;

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { connectionLineType: value as ConnectionLineType }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('연결선 스타일이 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = useCallback((value: string) => {
    if (!userId) return;

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { markerEnd: value === 'null' ? null : value as MarkerType }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('화살표 스타일이 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = useCallback(() => {
    if (!userId || !ideaMapSettings) return;

    const newValue = !ideaMapSettings.snapToGrid;

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { snapToGrid: newValue }
    }, {
      onSuccess: () => {
        toast.success(`격자 맞춤이 ${newValue ? '활성화' : '비활성화'}되었습니다.`);
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId, ideaMapSettings]);

  // 연결선 두께 변경 핸들러
  const handleStrokeWidthChange = useCallback((value: string) => {
    if (!userId) return;

    const newValue = parseInt(value, 10);

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { strokeWidth: newValue }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('연결선 두께가 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 마커 크기 변경 핸들러
  const handleMarkerSizeChange = useCallback((value: string) => {
    if (!userId) return;

    const newValue = parseInt(value, 10);

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { markerSize: newValue }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('화살표 크기가 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 연결선 색상 변경 핸들러
  const handleEdgeColorChange = useCallback((value: string) => {
    if (!userId) return;

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { edgeColor: value }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('연결선 색상이 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 선택된 연결선 색상 변경 핸들러
  const handleSelectedEdgeColorChange = useCallback((value: string) => {
    if (!userId) return;

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { selectedEdgeColor: value }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success('선택된 연결선 색상이 저장되었습니다.');
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 연결선 애니메이션 변경 핸들러
  const handleAnimatedChange = useCallback((value: string) => {
    if (!userId) return;

    const newValue = value === 'true';

    // 서버 상태만 업데이트 (TanStack Query → Service)
    updateSettings({
      userId: userId,
      settings: { animated: newValue }
    }, {
      onSuccess: () => {
        // 성공 시 현재 맵의 모든 엣지에 새 스타일 적용
        const updateAllEdgeStyles = useIdeaMapStore.getState().updateAllEdgeStylesAction;
        updateAllEdgeStyles();
        toast.success(`연결선 애니메이션이 ${newValue ? '활성화' : '비활성화'}되었습니다.`);
      },
      onError: (error) => {
        toast.error(`설정 저장 중 오류 발생: ${error.message}`);
      }
    });
  }, [updateSettings, userId]);

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    toast.info('내보내기 기능은 아직 구현되지 않았습니다');
  }, []);

  // 로그아웃 핸들러
  const handleLogout = useCallback(async () => {
    logger.info('로그아웃 시작');

    try {
      // logoutAction 액션을 호출하여 로그아웃 처리
      await logoutAction();

      // 로그아웃 후 로그인 페이지로 리디렉션
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 처리 중 오류 발생:', error);
      toast.error('로그아웃 처리 중 오류가 발생했습니다.');
    }
  }, [logoutAction, router]);

  // 컴포넌트 마운트 시 기본 프로젝트 생성 (API가 없는 경우)
  useEffect(() => {
    logger.info('프로젝트 정보 로딩');
    // 프로젝트가 없고 API 호출이 불가능한 경우 로컬 상태에 기본 프로젝트 생성
    if (activeProject) {
      createProject(activeProject);
    }
    else {
      toast.info('프로젝트 정보를 불러오지 못했습니다.');
      logger.error('프로젝트가 없습니다.');
    }
  }, [projects.length, createProject]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div className="fixed top-3 left-3 p-2 bg-background/80 rounded-lg shadow-md" data-testid="loading-settings">아이디어맵 설정 로딩 중...</div>;
  }

  // 에러가 발생했으면 에러 메시지 표시
  if (isError) {
    console.error("아이디어맵 설정 로드 오류:", error);
    return (
      <div className="fixed top-3 left-3 p-2 bg-background/80 rounded-lg shadow-md text-red-500" data-testid="error-settings">
        설정을 불러오는데 실패했습니다. 오류: {error instanceof Error ? error.message : '알 수 없는 오류'}
      </div>
    );
  }

  // 데이터 없음 상태 처리 (로딩과 에러가 아닌 경우)
  if (!ideaMapSettings) {
    // userId가 없는 경우인지, API가 빈 객체를 반환한 경우인지 구분
    const reason = !userId
      ? "사용자 ID가 없습니다."
      : "설정 데이터를 사용할 수 없습니다.";

    console.warn("아이디어맵 설정 데이터를 사용할 수 없습니다.", {
      userId: userId,
    });

    return (
      <div className="fixed top-3 left-3 p-2 bg-background/80 rounded-lg shadow-md text-amber-500" data-testid="no-settings">
        설정 데이터를 사용할 수 없습니다. {reason}
      </div>
    );
  }

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
              아이디어맵 설정
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
                      checked={ideaMapSettings.snapToGrid}
                      onCheckedChange={handleSnapToGridToggle}
                      disabled={isPending}
                    >
                      격자에 맞추기 활성화
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={ideaMapSettings.snapGrid?.[0].toString()}
                      onValueChange={isPending ? undefined : handleSnapGridChange}
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
                      value={ideaMapSettings.connectionLineType}
                      onValueChange={isPending ? undefined : handleConnectionTypeChange}
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
                      value={ideaMapSettings.markerEnd === null ? 'null' : ideaMapSettings.markerEnd}
                      onValueChange={isPending ? undefined : handleMarkerTypeChange}
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
                      value={ideaMapSettings.strokeWidth?.toString()}
                      onValueChange={isPending ? undefined : handleStrokeWidthChange}
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
                      value={ideaMapSettings.markerSize?.toString()}
                      onValueChange={isPending ? undefined : handleMarkerSizeChange}
                    >
                      {MARKER_SIZE_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 엣지 색상 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Paintbrush className="mr-1.5 h-4 w-4" />
                    <span>연결선 색상</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={ideaMapSettings.edgeColor}
                      onValueChange={isPending ? undefined : handleEdgeColorChange}
                    >
                      {EDGE_COLOR_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.value }}></div>
                            {option.label}
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 선택된 엣지 색상 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Paintbrush className="mr-1.5 h-4 w-4" />
                    <span>선택 연결선 색상</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={ideaMapSettings.selectedEdgeColor}
                      onValueChange={isPending ? undefined : handleSelectedEdgeColorChange}
                    >
                      {EDGE_COLOR_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.value }}></div>
                            {option.label}
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 애니메이션 설정 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>애니메이션</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={ideaMapSettings.animated ? 'true' : 'false'}
                      onValueChange={isPending ? undefined : handleAnimatedChange}
                    >
                      {EDGE_ANIMATION_OPTIONS.map(option => (
                        <DropdownMenuRadioItem key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-sm text-foreground/80 truncate max-w-[200px]">{displayProjectName}</span>
      {isPending && <span className="text-xs text-foreground/60 ml-1">저장 중...</span>}
    </div>
  );
}

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as ProjectToolbar
 *   participant TQ_Mutation as useUpdateSettingsMutation
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   UI->>+TQ_Mutation: mutate({ userId, settings: { strokeWidth: 3 } })
 *   TQ_Mutation->>+Service: updateSettings(userId, { ideamap: { strokeWidth: 3 } })
 *   Service->>+API: PATCH /api/settings
 *   API->>+DB: 설정 업데이트
 *   DB-->>-API: 업데이트 성공
 *   API-->>-Service: 성공 응답
 *   Service-->>-TQ_Mutation: 성공 응답
 *   TQ_Mutation->>TQ_Mutation: invalidateQueries(['userSettings', userId])
 *   TQ_Mutation-->>-UI: 성공 상태 반환
 *   UI->>UI: 성공 토스트 메시지 표시
 * ```
 */ 