/**
 * 파일명: src/app/projects/new/page.tsx
 * 목적: 새 프로젝트 생성 페이지
 * 역할: 사용자가 새 프로젝트를 생성할 수 있는 UI 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : 사용자 존재 확인 로직 추가
 */

'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/store/useProjectStore';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

// 모듈별 로거 생성
const logger = createLogger('NewProjectPage');

export default function NewProjectPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userExists, setUserExists] = useState(false);
    const { createProject } = useProjectStore();
    const { user } = useAuth();

    // 인증 확인 및 리디렉션
    useEffect(() => {
        if (!user && !isLoading) {
            toast.error('로그인이 필요합니다.');
            router.push('/login');
        } else if (user) {
            // 사용자 존재 확인
            checkUserExists(user.id);
        }
    }, [user, router, isLoading]);

    // 사용자가 데이터베이스에 실제로 존재하는지 확인하는 함수
    const checkUserExists = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`);

            if (response.ok) {
                setUserExists(true);
            } else if (response.status === 404) {
                logger.warn('인증된 사용자가 데이터베이스에 존재하지 않습니다', { userId });
                // 사용자 생성 시도
                await createUser(userId);
            } else {
                throw new Error('사용자 확인 중 오류가 발생했습니다');
            }

            setIsLoading(false);
        } catch (error) {
            logger.error('사용자 확인 실패', error);
            toast.error('사용자 정보를 확인하는데 실패했습니다.');
            setIsLoading(false);
        }
    };

    // 데이터베이스에 사용자가 존재하지 않을 경우 생성 시도
    const createUser = async (userId: string) => {
        try {
            if (!user) return;

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userId,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'
                })
            });

            if (response.ok) {
                logger.info('사용자가 성공적으로 생성되었습니다', { userId });
                setUserExists(true);
            } else {
                throw new Error('사용자 생성에 실패했습니다');
            }
        } catch (error) {
            logger.error('사용자 생성 실패', error);
            toast.error('사용자 정보를 생성하는데 실패했습니다. 다시 로그인해주세요.');
            router.push('/login');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('프로젝트 이름을 입력해주세요.');
            return;
        }

        if (!user) {
            toast.error('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        if (!userExists) {
            toast.error('사용자 정보가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);
            logger.info('새 프로젝트 생성 시작', { name });

            // 프로젝트 생성 (ownerId 필수)
            const newProject = await createProject({
                name: name.trim(),
                ownerId: user.id,
                ownerNickname: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'
            });

            toast.success('프로젝트가 생성되었습니다.');

            // 새 프로젝트 페이지로 이동
            router.push('/');
        } catch (error) {
            logger.error('프로젝트 생성 실패', error);
            toast.error('프로젝트 생성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container max-w-md mx-auto py-10 flex justify-center">
                <div className="text-center">
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-md mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>새 프로젝트 생성</CardTitle>
                    <CardDescription>새 프로젝트 정보를 입력해주세요.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">프로젝트 이름</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="프로젝트 이름"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">프로젝트 설명 (선택사항)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                * 프로젝트 설명은 현재 저장되지 않습니다.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || !userExists}
                            className="min-w-[100px]"
                        >
                            {isSubmitting ? '생성 중...' : '생성하기'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 