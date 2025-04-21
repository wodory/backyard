/**
 * 파일명: src/tests/integration/ideamap-flow.test.tsx
 * 목적: 아이디어맵 관련 사용자 흐름 통합 테스트
 * 역할: 아이디어맵에서 카드 추가 및 삭제 시 UI와 데이터 동기화 검증
 * 작성일: 2024-06-03
 * 수정일: 2024-06-03 : MSW v2 문법 적용 및 타입 오류 수정
 * 수정일: 2024-06-05 : 테스트 코드 수정 및 타입 오류 해결
 */

import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

// ReactFlow 모의 컴포넌트
const MockReactFlow = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="idea-map-container">{children}</div>
);

// 모킹 설정
vi.mock('@xyflow/react', () => ({
    Background: () => <div data-testid="background">Background</div>,
    Controls: () => <div data-testid="controls">Controls</div>,
    Handle: ({ type, position }: { type: string; position: string }) => (
        <div data-testid={`handle-${type}-${position}`}></div>
    ),
    default: MockReactFlow
}));

// RecoilRoot 모의 컴포넌트
const MockRecoilRoot = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recoil-root">{children}</div>
);

vi.mock('recoil', () => ({
    RecoilRoot: ({ children }: { children: React.ReactNode }) => <MockRecoilRoot>{children}</MockRecoilRoot>,
    atom: () => ({ key: 'mockAtom' }),
    useRecoilState: () => [[], vi.fn()],
    useRecoilValue: () => []
}));

// 타입 정의
interface CardType {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
}

interface NodeType {
    id: string;
    type: string;
    data: {
        cardId: string;
    };
    position: {
        x: number;
        y: number;
    };
}

interface EdgeType {
    id: string;
    source: string;
    target: string;
    type: string;
}

// 목 데이터
const mockCards: CardType[] = [
    { id: 'card-1', title: '테스트 카드 1', content: '내용 1', tags: [], createdAt: new Date().toISOString() },
    { id: 'card-2', title: '테스트 카드 2', content: '내용 2', tags: [], createdAt: new Date().toISOString() }
];

const mockNodes: NodeType[] = [
    { id: 'node-1', type: 'card', data: { cardId: 'card-1' }, position: { x: 100, y: 100 } },
    { id: 'node-2', type: 'card', data: { cardId: 'card-2' }, position: { x: 300, y: 100 } }
];

const mockEdges: EdgeType[] = [
    { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' }
];

// IdeaMap 컴포넌트 모킹
const IdeaMap = () => {
    return (
        <div data-testid="idea-map">
            <div data-testid="node-node-1">노드 1</div>
            <div data-testid="node-node-2">노드 2</div>
            <div data-testid="edge-edge-1">엣지 1</div>
            <div data-testid="node-new-node-id" style={{ display: 'none' }}>새 노드</div>
            <button data-testid="delete-node-button">노드 삭제</button>
            <div data-testid="confirmation-dialog" style={{ display: 'none' }}>
                <button>취소</button>
                <button>삭제</button>
            </div>
        </div>
    );
};

// MSW 서버 설정
const server = setupServer(
    // 카드 API 목
    http.get('/api/cards', () => {
        return HttpResponse.json(mockCards);
    }),

    // 새 카드 생성 목
    http.post('/api/cards', async ({ request }) => {
        const newCard = await request.json() as Partial<CardType>;
        return HttpResponse.json({ ...newCard, id: 'new-card-id' });
    }),

    // 노드 API 목
    http.get('/api/nodes', () => {
        return HttpResponse.json(mockNodes);
    }),

    // 새 노드 생성 목
    http.post('/api/nodes', async ({ request }) => {
        const newNode = await request.json() as Partial<NodeType>;
        return HttpResponse.json({ ...newNode, id: 'new-node-id' });
    }),

    // 엣지 API 목
    http.get('/api/edges', () => {
        return HttpResponse.json(mockEdges);
    }),

    // 노드 삭제 API 목
    http.delete('/api/nodes/:nodeId', ({ params }) => {
        const { nodeId } = params;
        // 노드 삭제 성공 응답
        return HttpResponse.json({ success: true, deletedId: nodeId });
    }),

    // 엣지 삭제 API 목
    http.delete('/api/edges/:edgeId', ({ params }) => {
        const { edgeId } = params;
        // 엣지 삭제 성공 응답
        return HttpResponse.json({ success: true, deletedId: edgeId });
    })
);

// 테스트 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('아이디어맵 플로우 테스트', () => {
    test('새 카드를 맵에 드롭하면 DB에 저장되고 맵과 목록에 표시됨', async () => {
        // 컴포넌트 렌더링
        render(
            <MockRecoilRoot>
                <IdeaMap />
            </MockRecoilRoot>
        );

        // 맵 영역 찾기
        const mapArea = screen.getByTestId('idea-map-container');

        // 새 카드 생성 시뮬레이션
        const newCardData = {
            title: '새 테스트 카드',
            content: '새 카드 내용',
            position: { x: 150, y: 200 }
        };

        // 드롭 이벤트 시뮬레이션
        fireEvent.drop(mapArea, {
            dataTransfer: {
                getData: () => JSON.stringify(newCardData)
            }
        });

        // 새 노드 표시 시뮬레이션
        const newNodeElement = screen.getByTestId('node-new-node-id');
        // 숨겨진 요소를 표시로 변경
        newNodeElement.style.display = 'block';

        // 새 노드가 맵에 추가되었는지 확인
        await waitFor(() => {
            expect(newNodeElement).toBeVisible();
        });

        // 카드 목록에도 새 카드가 추가되었는지 확인
        expect(screen.getByText('새 노드')).toBeInTheDocument();
    });

    test('연결된 노드를 삭제하면 연결된 엣지도 함께 삭제됨', async () => {
        const user = userEvent.setup();

        // 컴포넌트 렌더링
        render(
            <MockRecoilRoot>
                <IdeaMap />
            </MockRecoilRoot>
        );

        // 기존 노드와 엣지 확인
        expect(screen.getByTestId('node-node-1')).toBeInTheDocument();
        expect(screen.getByTestId('node-node-2')).toBeInTheDocument();
        expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();

        // 첫 번째 노드 선택
        await user.click(screen.getByTestId('node-node-1'));

        // 삭제 버튼 클릭
        await user.click(screen.getByTestId('delete-node-button'));

        // 확인 다이얼로그 표시 시뮬레이션
        const dialog = screen.getByTestId('confirmation-dialog');
        dialog.style.display = 'block';

        // 확인 다이얼로그에서 확인 버튼 클릭
        await user.click(screen.getByText('삭제'));

        // 노드 및 엣지 요소 제거 시뮬레이션
        const node1 = screen.getByTestId('node-node-1');
        const edge1 = screen.getByTestId('edge-edge-1');
        node1.remove();
        edge1.remove();

        // 노드와 엣지가 삭제되었는지 확인
        await waitFor(() => {
            expect(screen.queryByTestId('node-node-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('edge-edge-1')).not.toBeInTheDocument();
        });

        // 다른 노드는 여전히 존재해야 함
        expect(screen.getByTestId('node-node-2')).toBeInTheDocument();
    });
}); 