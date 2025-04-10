/**
 * 파일명: src/components/project/DeleteProjectDialog.tsx
 * 목적: 프로젝트 삭제 확인 다이얼로그
 * 역할: 프로젝트 삭제 전 사용자 확인을 위한 UI 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('DeleteProjectDialog');

interface DeleteProjectDialogProps {
    projectId: string;
    projectName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteProjectDialog({
    projectId,
    projectName,
    isOpen,
    onClose
}: DeleteProjectDialogProps) {
    const { deleteProject } = useProjectStore();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!projectId) return;

        setIsDeleting(true);
        try {
            logger.info(`프로젝트 삭제 시작: ${projectId}`);
            const success = await deleteProject(projectId);

            if (success) {
                toast.success('프로젝트가 휴지통으로 이동되었습니다.');
                logger.info(`프로젝트 삭제 성공: ${projectId}`);
            } else {
                toast.error('프로젝트 삭제에 실패했습니다.');
                logger.error(`프로젝트 삭제 실패: ${projectId}`);
            }
        } catch (error) {
            toast.error('프로젝트 삭제 중 오류가 발생했습니다.');
            logger.error(`프로젝트 삭제 오류: ${projectId}`, error);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>프로젝트 삭제</DialogTitle>
                    <DialogDescription>
                        "{projectName}" 프로젝트를 정말 삭제하시겠습니까? 삭제된 프로젝트는 휴지통에서 복구할 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        취소
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="gap-1"
                    >
                        {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 