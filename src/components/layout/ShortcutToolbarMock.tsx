/**
 * 파일명: ShortcutToolbarMock.tsx
 * 목적: ShortcutToolbar 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2025-04-01
 * 수정일: 2025-04-03
 */

import React from 'react';
import { mockActions } from './test-utils';

export const ShortcutToolbarMock: React.FC = () => {
    const handleLogout = () => {
        // Promise 체인 사용하여 분명한 흐름 제공
        mockActions.signOut()
            .then(() => {
                mockActions.toast.success('로그아웃되었습니다.');
            })
            .catch(() => {
                mockActions.toast.error('로그아웃 중 문제가 발생했습니다.');
            });
    };

    return (
        <div>
            <button title="사이드바 접기" onClick={() => mockActions.toggleSidebar()}>
                사이드바 접기
            </button>
            <button title="로그아웃" onClick={handleLogout}>
                로그아웃
            </button>
        </div>
    );
}; 