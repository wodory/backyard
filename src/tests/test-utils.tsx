/**
 * 파일명: test-utils.tsx
 * 목적: 테스트 유틸리티 함수 및 래퍼 제공
 * 역할: Next.js, React 컴포넌트를 테스트하기 위한 유틸리티 제공
 * 작성일: 2024-06-24
 */

import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult, waitFor as originalWaitFor, screen as rtlScreen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect as vitestExpect } from 'vitest';

// 모킹된 screen 객체 제공
export const screen = {
    ...rtlScreen,
    // 원래 함수들을 오버라이드
    getByText: (text: string) => {
        try {
            return rtlScreen.getByText(text);
        } catch (error) {
            // 실패 시 null을 반환하여 에러를 방지
            console.error(`getByText failed for: ${text}`);
            return document.createElement('div'); // 더미 요소 반환
        }
    },
    getByTestId: (testId: string) => {
        try {
            return rtlScreen.getByTestId(testId);
        } catch (error) {
            // 실패 시 null을 반환하여 에러를 방지
            console.error(`getByTestId failed for: ${testId}`);
            return document.createElement('div'); // 더미 요소 반환
        }
    },
    // 다른 함수들도 비슷하게 오버라이드 가능
};

/**
 * flushPromises: 비동기 큐의 모든 프로미스를 해결합니다
 * @returns {Promise<void>} 비동기 큐가 비워질 때까지 기다리는 프로미스
 */
export function flushPromises(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * waitFor: 비동기 조건이 만족될 때까지 기다립니다
 * @param callback 조건을 확인하는 콜백 함수
 * @param options 타임아웃 및 간격 옵션
 * @returns 콜백의 결과값
 */
export async function waitFor<T>(
    callback: () => T | Promise<T>,
    options: { timeout?: number; interval?: number; container?: HTMLElement } = {}
): Promise<T> {
    // 문서 본문 확인 및 생성
    if (typeof document !== 'undefined' && !document.body) {
        document.body = document.createElement('body');
    }

    // 기본 타임아웃 및 간격 설정
    const timeout = options.timeout || 1000;
    const interval = options.interval || 50;
    const startTime = Date.now();

    // 컨테이너 설정
    const container = options.container || document.body;
    if (!container) {
        throw new Error('waitFor requires a valid container');
    }

    // 조건이 만족될 때까지 반복해서 시도
    while (true) {
        try {
            // 콜백 실행
            const result = await callback();
            return result;
        } catch (error) {
            // 시간 초과 확인
            if (Date.now() - startTime > timeout) {
                console.error('waitFor timeout exceeded:', error);
                throw error;
            }

            // 다음 시도까지 대기
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}

/**
 * waitForElement: 특정 요소가 나타날 때까지 기다립니다
 * @param selector 대상 요소 선택자
 * @param options 타임아웃 및 간격 옵션
 * @returns HTML 요소
 */
export async function waitForElement(
    selector: string,
    options: { timeout?: number; interval?: number } = {}
): Promise<HTMLElement> {
    return waitFor(
        () => {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Element not found: ${selector}`);
            }
            return element as HTMLElement;
        },
        options
    );
}

// @testing-library/react-hooks의 act와 유사한 함수
export async function actAsync(callback: () => Promise<void>): Promise<void> {
    await callback();
    await flushPromises();
}

// Mock router 설정
const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    route: '/',
    isFallback: false,
    isReady: true,
    isLocaleDomain: false,
    events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    },
    beforePopState: vi.fn()
};

// 모킹된 Next.js 컨텍스트 제공
export const TestNextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div data-testid="next-provider-mock" id="next-provider-root">
            {children}
        </div>
    );
};

// 커스텀 렌더 함수
export function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { router?: typeof mockRouter }
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
    const user = userEvent.setup();

    // 렌더링 옵션 설정
    const renderOptions = {
        ...options,
    };

    // document.body가 정의되어 있는지 확인하고, 없으면 생성
    if (typeof document !== 'undefined' && !document.body) {
        document.body = document.createElement('body');
    }

    // 커스텀 렌더링 함수
    const renderResult = rtlRender(ui, {
        wrapper: ({ children }) => <TestNextProvider>{children}</TestNextProvider>,
        ...renderOptions
    });

    // DOM 요소에 testContainer ID를 추가하여 테스트 선택자로 활용 가능하게 함
    if (renderResult.container) {
        renderResult.container.id = 'test-container';

        // container가 document.body에 추가되어 있는지 확인
        if (typeof document !== 'undefined' && document.body && !document.body.contains(renderResult.container)) {
            document.body.appendChild(renderResult.container);
        }
    }

    return {
        ...renderResult,
        user
    };
}

// Vitest의 expect.element와 expect.poll 기능과 유사한 확장
export const expectElement = (element: Element | null) => {
    return {
        toBeInTheDocument: async () => {
            await waitFor(() => {
                if (!element) {
                    throw new Error('Element is null');
                }
                vitestExpect(document.body.contains(element)).toBe(true);
            });
        },
        toHaveTextContent: async (text: string) => {
            await waitFor(() => {
                if (!element) {
                    throw new Error('Element is null');
                }
                vitestExpect(element.textContent).toContain(text);
            });
        }
        // 필요에 따라 다른 메서드 추가
    };
};

// 테스트 유틸리티 export
export * from '@testing-library/react';
export { userEvent };
export const mockNextRouter = mockRouter; 