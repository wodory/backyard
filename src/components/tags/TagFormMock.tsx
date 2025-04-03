/**
 * 파일명: TagFormMock.tsx
 * 목적: TagForm 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2024-03-31
 */

import React, { useState } from 'react';
import { mockActions } from './test-utils';

const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '1rem',
};

const labelStyles = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
};

const inputStyles = {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
};

const buttonStyles = {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    ':disabled': {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
};

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
            setTagName('');
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
        <form onSubmit={handleSubmit} style={formStyles} role="form" aria-label="태그 생성 폼">
            <div>
                <label htmlFor="tagName" style={labelStyles}>
                    태그 이름
                </label>
                <input
                    id="tagName"
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    onCompositionStart={() => { }}
                    onCompositionEnd={() => { }}
                    aria-label="태그 이름"
                    aria-required="true"
                    style={inputStyles}
                    disabled={isSubmitting}
                    placeholder="새로운 태그 이름을 입력하세요"
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                style={buttonStyles}
                aria-busy={isSubmitting}
            >
                {isSubmitting ? '생성 중...' : '태그 생성'}
            </button>
        </form>
    );
}; 