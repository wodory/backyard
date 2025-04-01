/**
 * 파일명: EditCardPageMock.tsx
 * 목적: 카드 편집 페이지의 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2024-03-31
 */

import React, { useEffect, useState } from 'react';
import { mockActions } from './test-utils';

interface Card {
    id: string;
    title: string;
    content: string;
    cardTags: Array<{ id: string; name: string; }>;
}

interface ApiResponse {
    ok: boolean;
    status?: number;
    json: () => Promise<Card | { error: string; }>;
}

export const EditCardPageMock: React.FC = () => {
    const [card, setCard] = useState<Card | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await mockActions.getCard('test-card-123') as ApiResponse;
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('카드를 찾을 수 없습니다.');
                    } else {
                        setError('카드 로딩에 실패했습니다.');
                    }
                    return;
                }
                const data = await response.json();
                if ('error' in data) {
                    setError(data.error);
                    return;
                }
                setCard(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '카드 로딩에 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCard();
    }, []);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => mockActions.router.back()}>돌아가기</button>
            </div>
        );
    }

    if (!card) {
        return null;
    }

    const handleSave = () => {
        mockActions.router.push('/board');
    };

    return (
        <div>
            <button onClick={() => mockActions.router.back()}>뒤로 가기</button>
            <form data-testid="edit-card-form">
                <input type="text" defaultValue={card.title} />
                <textarea defaultValue={card.content} />
                <button onClick={handleSave}>저장</button>
            </form>
        </div>
    );
}; 