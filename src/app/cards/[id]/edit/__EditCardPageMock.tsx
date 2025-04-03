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

export const EditCardPageMock: React.FC = () => {
    const [card, setCard] = useState<Card | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 간소화된 useEffect - 비동기 로직 단순화
    useEffect(() => {
        const fetchCard = async () => {
            try {
                const id = 'test-card-123';

                // API 호출 - 동기식으로 처리 (테스트 환경에서는 즉시 해결되는 프로미스 사용)
                const response = await mockActions.getCard(id);

                // 응답 처리
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('카드를 찾을 수 없습니다.');
                    } else {
                        setError('카드 로딩에 실패했습니다.');
                    }
                    setIsLoading(false);
                    return;
                }

                // 응답 데이터 처리
                const data = await response.json();

                // 데이터에 에러가 있는 경우
                if ('error' in data) {
                    setError(data.error);
                } else {
                    // 카드 데이터 설정
                    setCard(data);
                }

                // 로딩 상태 종료
                setIsLoading(false);
            } catch (err) {
                // 에러 처리
                setError(err instanceof Error ? err.message : '카드 로딩에 실패했습니다.');
                setIsLoading(false);
            }
        };

        // 즉시 함수 호출
        fetchCard();
    }, []);

    // 로딩 중 UI
    if (isLoading) {
        return <div data-testid="loading-state">로딩 중...</div>;
    }

    // 에러 UI
    if (error) {
        return (
            <div data-testid="error-state">
                <p>{error}</p>
                <button onClick={() => mockActions.router.back()}>돌아가기</button>
            </div>
        );
    }

    // 카드가 없는 경우
    if (!card) {
        return <div data-testid="no-card-state">카드를 찾을 수 없습니다.</div>;
    }

    // 저장 버튼 핸들러
    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        mockActions.router.push('/board');
    };

    // 편집 폼 UI
    return (
        <div data-testid="card-edit-container">
            <button onClick={() => mockActions.router.back()}>뒤로 가기</button>
            <form data-testid="edit-card-form">
                <input
                    type="text"
                    data-testid="card-title-input"
                    defaultValue={card.title}
                />
                <textarea
                    data-testid="card-content-textarea"
                    defaultValue={card.content}
                />
                <button
                    data-testid="save-button"
                    onClick={handleSave}
                >
                    저장
                </button>
            </form>
        </div>
    );
}; 