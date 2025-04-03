/**
 * 파일명: MainToolbarMock.tsx
 * 목적: MainToolbar 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2024-03-31
 */

import React, { useState } from 'react';
import { mockActions } from './test-utils';

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardCreated: () => void;
}

// 모달 컴포넌트 단순화 - 비동기 처리를 상위 컴포넌트로 위임
const SimpleCreateCardModal: React.FC<CreateCardModalProps> = ({ isOpen, onClose, onCardCreated }) => {
    if (!isOpen) return null;

    return (
        <div data-testid="create-card-modal">
            <button data-testid="close-modal-button" onClick={onClose}>닫기</button>
            <button
                data-testid="create-card-button"
                onClick={onCardCreated}
            >
                카드 생성
            </button>
        </div>
    );
};

export const MainToolbarMock: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // createCard 호출 후 즉시 모달 닫기
    const handleCreateCard = () => {
        // 테스트 카드 데이터 생성
        const cardData = { title: '테스트 카드', content: '테스트 내용' };

        // 액션 호출
        mockActions.createCard(cardData);

        // 모달 닫기
        setIsModalOpen(false);
    };

    return (
        <div>
            <button title="새 카드 추가" onClick={() => setIsModalOpen(true)}>새 카드 추가</button>
            <button title="수평 정렬" onClick={() => mockActions.applyLayout('horizontal')}>수평 정렬</button>
            <button title="수직 정렬" onClick={() => mockActions.applyLayout('vertical')}>수직 정렬</button>
            <button title="자동 배치" onClick={() => mockActions.applyLayout('auto')}>자동 배치</button>
            <button title="레이아웃 저장" onClick={() => mockActions.updateBoardSettings({})}>레이아웃 저장</button>

            <SimpleCreateCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCardCreated={handleCreateCard}
            />
        </div>
    );
}; 