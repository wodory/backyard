/**
 * 파일명: src/components/layout/ProjectSelector.tsx
 * 목적: 프로젝트 선택 드롭다운 UI 컴포넌트
 * 역할: 사용자가 보유한 프로젝트 목록을 표시하고 선택할 수 있는 UI 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : Zustand 스토어 무한 루프 문제 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : 프로젝트 삭제 기능 및 휴지통 링크 추가
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FolderIcon, PlusCircleIcon, MoreHorizontal, Trash2, Edit, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { Project } from '@/types/project';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';
import { DeleteProjectDialog } from '../project/DeleteProjectDialog';

// 모듈별 로거 생성
const logger = createLogger('ProjectSelector');

// ProjectStore 타입 정의 (스토어 상태에 대한 인터페이스)
interface ProjectStoreState {
    projects: Project[];
    activeProjectId: string | null;
    fetchProjects: () => Promise<Project[]>;
    setActiveProject: (projectId: string) => void;
}

// 개별 상태 선택자 함수들 - 컴포넌트 외부에 정의
const selectProjects = (state: ProjectStoreState) => state.projects;
const selectActiveProjectId = (state: ProjectStoreState) => state.activeProjectId;
const selectFetchProjects = (state: ProjectStoreState) => state.fetchProjects;
const selectSetActiveProject = (state: ProjectStoreState) => state.setActiveProject;

export function ProjectSelector() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    // 각 상태를 개별적으로, 또는 메모이제이션된 선택자로 가져오기
    const projects = useProjectStore(selectProjects);
    const activeProjectId = useProjectStore(selectActiveProjectId);
    const fetchProjects = useProjectStore(selectFetchProjects);
    const setActiveProject = useProjectStore(selectSetActiveProject);

    // 컴포넌트 마운트 시 프로젝트 목록 로드
    useEffect(() => {
        const loadProjects = async () => {
            try {
                await fetchProjects();
            } catch (error) {
                logger.error('프로젝트 목록 로딩 실패', error);
                toast.error('프로젝트 목록을 불러오는데 실패했습니다.');
            }
        };

        loadProjects();
    }, [fetchProjects]);

    // 현재 활성화된 프로젝트 찾기
    const activeProject = projects.find((p: Project) => p.projectId === activeProjectId);

    // 프로젝트 선택 핸들러
    const handleSelectProject = (projectId: string) => {
        try {
            setActiveProject(projectId);
            setOpen(false);
            router.push('/');
            toast.success('프로젝트가 선택되었습니다.');
        } catch (error) {
            logger.error('프로젝트 선택 실패', error);
            toast.error('프로젝트 선택에 실패했습니다.');
        }
    };

    // 프로젝트 생성 페이지로 이동
    const handleCreateProject = () => {
        router.push('/projects/new');
        setOpen(false);
    };

    // 프로젝트 삭제 다이얼로그 열기
    const handleDeleteClick = useCallback((project: Project, e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    }, []);

    // 프로젝트 삭제 다이얼로그 닫기
    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
    }, []);

    // 휴지통으로 이동
    const handleGoToTrash = useCallback(() => {
        router.push('/trash');
        setOpen(false);
    }, [router]);

    // 프로젝트 수정 페이지로 이동
    const handleEditProject = useCallback((projectId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        router.push(`/projects/${projectId}/edit`);
        setOpen(false);
    }, [router]);

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 w-full max-w-56 justify-between">
                        <div className="flex items-center gap-2 truncate">
                            <FolderIcon className="h-4 w-4" />
                            <span className="truncate">
                                {activeProject ? activeProject.name : '프로젝트 선택'}
                            </span>
                        </div>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>프로젝트</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {projects.length === 0 ? (
                        <DropdownMenuItem disabled>
                            프로젝트가 없습니다
                        </DropdownMenuItem>
                    ) : (
                        projects.filter(p => !p.isDeleted).map((project: Project) => (
                            <DropdownMenuItem
                                key={project.projectId}
                                className={`flex justify-between items-center ${activeProjectId === project.projectId ? 'bg-accent' : ''}`}
                            >
                                <div
                                    className="truncate flex-grow"
                                    onClick={() => handleSelectProject(project.projectId)}
                                >
                                    {project.name}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="w-40">
                                        <DropdownMenuItem onClick={(e) => handleEditProject(project.projectId, e)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            수정
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => handleDeleteClick(project, e)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            삭제
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </DropdownMenuItem>
                        ))
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCreateProject} className="text-primary">
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        새 프로젝트 생성
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleGoToTrash}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        휴지통
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* 삭제 확인 다이얼로그 */}
            {projectToDelete && (
                <DeleteProjectDialog
                    projectId={projectToDelete.projectId}
                    projectName={projectToDelete.name}
                    isOpen={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                />
            )}
        </>
    );
} 