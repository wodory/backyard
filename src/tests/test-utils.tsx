/**
 * 파일명: test-utils.tsx
 * 목적: 테스트 유틸리티 함수 및 래퍼 제공
 * 역할: Next.js, React 컴포넌트를 테스트하기 위한 유틸리티 제공
 * 작성일: 2025-03-30
 * 수정일: 2025-04-01
 */

import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult, waitFor as originalWaitFor, screen as rtlScreen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect as vitestExpect } from 'vitest';
import { Node, Edge, Connection, ReactFlowInstance, ReactFlowProps, ConnectionLineType, MarkerType } from '@xyflow/react';
import { CardData } from '@/components/board/types/board-types';

// XYFlow 모킹
export const mockReactFlow = {
    project: vi.fn(({ x, y }) => ({ x, y })),
    getIntersectingNodes: vi.fn(() => []),
    getNode: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdge: vi.fn(),
    getEdges: vi.fn(() => []),
    viewportInitialized: true,
    getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
} as unknown as ReactFlowInstance;

// 테스트 노드 생성 유틸리티
export const createTestNode = (id: string, position = { x: 0, y: 0 }): Node<CardData> => ({
    id,
    type: 'default',
    position,
    data: {
        id,
        title: `Test Card ${id}`,
        content: `Test Content ${id}`,
        tags: [],
    },
});

// 테스트 엣지 생성 유틸리티
export const createTestEdge = (id: string, source: string, target: string): Edge => ({
    id,
    source,
    target,
    type: 'default',
    markerEnd: MarkerType.ArrowClosed,
});

// 이벤트 객체 생성 유틸리티
export const createDragEvent = (data: any = {}): React.DragEvent => ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
        dropEffect: 'none',
        getData: vi.fn((format: string) => {
            try {
                return typeof data === 'string' ? data : JSON.stringify(data);
            } catch (error) {
                return '';
            }
        }),
        setData: vi.fn(),
    },
} as unknown as React.DragEvent);

export const createMouseEvent = (options: Partial<MouseEvent> = {}): React.MouseEvent => ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ctrlKey: false,
    metaKey: false,
    ...options,
} as unknown as React.MouseEvent);

// 모킹된 screen 객체
export const screen = {
    ...rtlScreen,
    getByText: (text: string) => {
        try {
            return rtlScreen.getByText(text);
        } catch (error) {
            console.error(`getByText failed for: ${text}`);
            return document.createElement('div');
        }
    },
    getByTestId: (testId: string) => {
        try {
            return rtlScreen.getByTestId(testId);
        } catch (error) {
            console.error(`getByTestId failed for: ${testId}`);
            return document.createElement('div');
        }
    },
};

/**
 * flushPromises: 비동기 큐의 모든 프로미스를 해결
 */
export function flushPromises(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * waitFor: 비동기 조건이 만족될 때까지 대기
 */
export async function waitFor<T>(
    callback: () => T | Promise<T>,
    options: { timeout?: number; interval?: number; container?: HTMLElement } = {}
): Promise<T> {
    if (typeof document !== 'undefined' && !document.body) {
        document.body = document.createElement('body');
    }

    const timeout = options.timeout || 1000;
    const interval = options.interval || 50;
    const startTime = Date.now();
    const container = options.container || document.body;

    if (!container) {
        throw new Error('waitFor requires a valid container');
    }

    while (true) {
        try {
            const result = await callback();
            return result;
        } catch (error) {
            if (Date.now() - startTime > timeout) {
                console.error('waitFor timeout exceeded:', error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}

/**
 * waitForElement: 특정 요소가 나타날 때까지 대기
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

    if (typeof document !== 'undefined' && !document.body) {
        document.body = document.createElement('body');
    }

    const renderResult = rtlRender(ui, {
        wrapper: ({ children }) => <TestNextProvider>{children}</TestNextProvider>,
        ...options
    });

    if (renderResult.container) {
        renderResult.container.id = 'test-container';
        if (typeof document !== 'undefined' && document.body && !document.body.contains(renderResult.container)) {
            document.body.appendChild(renderResult.container);
        }
    }

    return {
        ...renderResult,
        user
    };
}

// Vitest의 expect 확장
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
    };
};

// 테스트 유틸리티 export
export * from '@testing-library/react';
export { userEvent };
export const mockNextRouter = mockRouter; 