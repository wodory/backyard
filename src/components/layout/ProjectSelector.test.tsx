/**
 * 파일명: src/components/layout/ProjectSelector.test.tsx
 * 목적: ProjectSelector 컴포넌트 테스트
 * 역할: 프로젝트 선택 기능을 검증하는 테스트
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

import { vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ProjectSelector } from './ProjectSelector';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { server } from '@/tests/msw/server';
import { Project } from '@/types/project';
import { useProjectStore } from '@/store/useProjectStore';

// 모킹
const mockRouter = {
    push: vi.fn(),
};
vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/lib/logger', () => ({
    default: () => ({
        error: vi.fn(),
        info: vi.fn(),
    }),
}));

// 프로젝트 스토어 모킹
const mockProjects: Project[] = [
    {
        projectId: 'project-1',
        name: '프로젝트 1',
        ownerId: 'user-1',
        ownerNickname: '사용자 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        isDeleted: false,
    },
    {
        projectId: 'project-2',
        name: '프로젝트 2',
        ownerId: 'user-1',
        ownerNickname: '사용자 1',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        isDeleted: false,
    },
];

const mockFetchProjects = vi.fn().mockResolvedValue(mockProjects);
const mockSetActiveProject = vi.fn();

// 스토어 상태 타입 정의
type MockStoreState = {
    projects: Project[];
    activeProjectId: string | null;
    fetchProjects: () => Promise<Project[]>;
    setActiveProject: (projectId: string) => void;
};

vi.mock('@/store/useProjectStore', () => ({
    useProjectStore: vi.fn((selector?: (state: MockStoreState) => any) => {
        if (typeof selector === 'function') {
            return selector({
                projects: mockProjects,
                activeProjectId: 'project-1',
                fetchProjects: mockFetchProjects,
                setActiveProject: mockSetActiveProject,
            });
        }
        return {
            projects: mockProjects,
            activeProjectId: 'project-1',
            fetchProjects: mockFetchProjects,
            setActiveProject: mockSetActiveProject,
        };
    }),
}));

describe('ProjectSelector', () => {
    beforeAll(() => {
        server.listen();
    });

    afterAll(() => {
        server.close();
        vi.clearAllMocks();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        server.resetHandlers();
    });

    afterEach(() => {
        cleanup();
    });

    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
        render(<ProjectSelector />);
        expect(screen.getByText('프로젝트 1')).toBeInTheDocument();
    });

    it('마운트 시 프로젝트 목록을 가져와야 함', async () => {
        render(<ProjectSelector />);
        await waitFor(() => {
            expect(mockFetchProjects).toHaveBeenCalledTimes(1);
        });
    });

    it('드롭다운을 열고 프로젝트를 선택할 수 있어야 함', async () => {
        const user = userEvent.setup();
        render(<ProjectSelector />);

        // 드롭다운 버튼 클릭
        const dropdownButton = screen.getByRole('button');
        await user.click(dropdownButton);

        // 두 번째 프로젝트 선택
        const projectOption = screen.getByText('프로젝트 2');
        await user.click(projectOption);

        // 상태 업데이트 및 라우팅 확인
        expect(mockSetActiveProject).toHaveBeenCalledWith('project-2');
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('새 프로젝트 생성 링크가 동작해야 함', async () => {
        const user = userEvent.setup();
        render(<ProjectSelector />);

        // 드롭다운 버튼 클릭
        const dropdownButton = screen.getByRole('button');
        await user.click(dropdownButton);

        // 새 프로젝트 생성 옵션 클릭
        const createProjectOption = screen.getByText('새 프로젝트 생성');
        await user.click(createProjectOption);

        // 라우팅 확인
        expect(mockRouter.push).toHaveBeenCalledWith('/projects/new');
    });

    it('프로젝트가 없을 때 적절한 메시지를 표시해야 함', async () => {
        // 프로젝트 없음 상태로 모킹 변경
        vi.mocked(useProjectStore).mockImplementation((selector?: (state: MockStoreState) => any) => {
            if (typeof selector === 'function') {
                return selector({
                    projects: [],
                    activeProjectId: null,
                    fetchProjects: mockFetchProjects,
                    setActiveProject: mockSetActiveProject,
                });
            }
            return {
                projects: [],
                activeProjectId: null,
                fetchProjects: mockFetchProjects,
                setActiveProject: mockSetActiveProject,
            };
        });

        const user = userEvent.setup();
        render(<ProjectSelector />);

        // 드롭다운 버튼 클릭
        const dropdownButton = screen.getByText('프로젝트 선택');
        await user.click(dropdownButton);

        // 프로젝트 없음 메시지 확인
        expect(screen.getByText('프로젝트가 없습니다')).toBeInTheDocument();
    });
}); 