/**
 * 파일명: src/app/trash/page.tsx
 * 목적: 휴지통 페이지
 * 역할: 삭제된 프로젝트를 보여주고 복구 기능 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Trash2, RefreshCcw, AlertCircle } from 'lucide-react';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('TrashPage');

export default function TrashPage() {
    const { fetchProjects, selectAllProjects, restoreProject } = useProjectStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isRestoring, setIsRestoring] = useState<Record<string, boolean>>({});

    // 페이지 로드 시 모든 프로젝트(삭제된 것 포함) 가져오기
    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                await fetchProjects({ includeDeleted: true });
                setError(null);
            } catch (e) {
                logger.error('휴지통 프로젝트 로딩 실패', e);
                setError(e instanceof Error ? e : new Error('프로젝트 목록을 불러오는데 실패했습니다'));
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [fetchProjects]);

    // 모든 프로젝트 가져오기 (삭제된 것 포함)
    const allProjects = selectAllProjects();

    // 삭제된 프로젝트만 필터링
    const deletedProjects = allProjects.filter(project => project.isDeleted);

    // 프로젝트 복구 핸들러
    const handleRestore = async (projectId: string) => {
        setIsRestoring(prev => ({ ...prev, [projectId]: true }));

        try {
            logger.info(`프로젝트 복구 시작: ${projectId}`);
            const success = await restoreProject(projectId);

            if (success) {
                toast.success('프로젝트가 복구되었습니다.');
                logger.info(`프로젝트 복구 성공: ${projectId}`);
            } else {
                toast.error('프로젝트 복구에 실패했습니다.');
                logger.error(`프로젝트 복구 실패: ${projectId}`);
            }
        } catch (error) {
            logger.error(`프로젝트 복구 오류: ${projectId}`, error);
            toast.error('프로젝트 복구 중 오류가 발생했습니다.');
        } finally {
            setIsRestoring(prev => ({ ...prev, [projectId]: false }));
        }
    };

    // 날짜 포맷 헬퍼 함수
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '알 수 없음';
        try {
            return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
        } catch (e) {
            return '유효하지 않은 날짜';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>휴지통을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[60vh]">
                <div className="text-center text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
                    <p>{error.message}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                    >
                        다시 시도
                    </Button>
                </div>
            </div>
        );
    }

    if (deletedProjects.length === 0) {
        return (
            <div className="container max-w-5xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Trash2 className="h-6 w-6" />
                    휴지통
                </h1>

                <div className="text-center py-16 border rounded-lg bg-muted/20">
                    <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">휴지통이 비어있습니다</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                휴지통
            </h1>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>프로젝트명</TableHead>
                            <TableHead>소유자</TableHead>
                            <TableHead>삭제일</TableHead>
                            <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deletedProjects.map((project) => (
                            <TableRow key={project.projectId}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell>{project.ownerNickname || '알 수 없음'}</TableCell>
                                <TableCell>{formatDate(project.deletedAt)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() => handleRestore(project.projectId)}
                                        disabled={isRestoring[project.projectId]}
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        {isRestoring[project.projectId] ? '복구 중...' : '복구'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 