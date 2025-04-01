/**
 * 파일명: TagListMock.tsx
 * 목적: TagList 컴포넌트의 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2024-03-31
 */

import React, { useState } from 'react';
import { mockActions } from './test-utils';

interface Tag {
    id: string;
    name: string;
    count: number;
    createdAt: string;
}

interface TagListMockProps {
    initialTags: Tag[];
}

export const TagListMock: React.FC<TagListMockProps> = ({ initialTags }) => {
    const [tags, setTags] = useState(initialTags);
    const [tagToDelete, setTagToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (tagId: string) => {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
            setTagToDelete(tagId);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!tagToDelete) return;

        setIsDeleting(true);
        try {
            const response = await mockActions.deleteTag(tagToDelete);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '태그 삭제에 실패했습니다.');
            }
            mockActions.toast.success('태그가 삭제되었습니다.');
            setTags(tags.filter(tag => tag.id !== tagToDelete));
        } catch (error) {
            if (error instanceof Error) {
                mockActions.toast.error(error.message);
            } else {
                mockActions.toast.error('태그 삭제에 실패했습니다.');
            }
        } finally {
            setIsDeleting(false);
            setTagToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setTagToDelete(null);
    };

    if (tags.length === 0) {
        return <div>등록된 태그가 없습니다.</div>;
    }

    const getTagById = (id: string) => tags.find(t => t.id === id);

    return (
        <div>
            {tags.map(tag => (
                <div key={tag.id}>
                    <span>{tag.name}</span>
                    <span>{tag.count > 0 ? `${tag.count}개 카드` : '0개'}</span>
                    <span>{tag.createdAt}</span>
                    <button onClick={() => handleDeleteClick(tag.id)}></button>
                </div>
            ))}

            {tagToDelete && (
                <div role="dialog" aria-modal="true">
                    <h2>태그 삭제 확인</h2>
                    {(() => {
                        const tag = getTagById(tagToDelete);
                        return (
                            <>
                                <p>태그 "{tag?.name}"을(를) 삭제하시겠습니까?</p>
                                {tag && tag.count > 0 && (
                                    <p>이 태그가 지정된 {tag.count}개의 카드에서 태그가 제거됩니다.</p>
                                )}
                            </>
                        );
                    })()}
                    <button onClick={handleDeleteConfirm} disabled={isDeleting}>
                        삭제
                    </button>
                    <button onClick={handleDeleteCancel}>취소</button>
                </div>
            )}
        </div>
    );
}; 