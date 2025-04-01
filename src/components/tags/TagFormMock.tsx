/**
 * 파일명: TagFormMock.tsx
 * 목적: TagForm 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2024-03-31
 */

import React, { useState } from 'react';
import { mockActions } from './test-utils';

export const TagFormMock: React.FC = () => {
    const [tagName, setTagName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tagName.trim()) {
            mockActions.toast.error('태그 이름을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await mockActions.createTag(tagName);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || '태그 생성에 실패했습니다.');
            }
            mockActions.toast.success('태그가 생성되었습니다.');
            mockActions.reload();
        } catch (error) {
            if (error instanceof Error) {
                mockActions.toast.error(error.message);
            } else {
                mockActions.toast.error('태그 생성에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="tagName">태그 이름</label>
            <input
                id="tagName"
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onCompositionStart={() => { }} // IME 입력 처리
                onCompositionEnd={() => { }}
                aria-label="태그 이름"
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '생성 중...' : '태그 생성'}
            </button>
        </form>
    );
}; 