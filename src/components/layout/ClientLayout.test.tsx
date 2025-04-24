/**
 * 파일명: src/components/layout/ClientLayout.test.tsx
 * 목적: ClientLayout 컴포넌트 테스트
 * 역할: ClientLayout 렌더링 및 동작 검증
 * 작성일: 2025-03-29
 * 수정일: 2025-04-21 : ThemeContext 모킹 제거 및 useAppStore 모킹 추가
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { ClientLayout } from './ClientLayout';
import { useRouter } from 'next/navigation';

// 라우터 모킹
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: vi.fn().mockImplementation(() => ({
        push: mockPush,
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    })),
    usePathname: vi.fn().mockReturnValue('/'),
}));

// Sonner 토스터 모킹
vi.mock('sonner', () => ({
    Toaster: () => <div data-testid="mock-toaster">Mock Toaster</div>,
}));

// 폰트 모킹
vi.mock('next/font/google', () => ({
    Montserrat: vi.fn().mockReturnValue({
        className: 'mock-montserrat-class',
        style: { fontFamily: 'Montserrat' },
    }),
}));

// useAppStore 모킹
vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn().mockImplementation(() => ({
        themeMode: 'dark',
        sidebarOpen: false,
        toggleSidebar: vi.fn(),
        closeSidebar: vi.fn(),
        theme: {
            layout: {
                padding: 25,
                spacing: {
                    horizontal: 40,
                    vertical: 30,
                }
            },
            node: {
                width: 150,
                height: 60,
            }
        }
    })),
}));

// Dropdown 모킹
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div data-testid="dropdown-menu-content">{children}</div>,
    DropdownMenuGroup: ({ children }: { children: ReactNode }) => <div data-testid="dropdown-menu-group">{children}</div>,
    DropdownMenuItem: ({ children }: { children: ReactNode }) => <div data-testid="dropdown-menu-item">{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div data-testid="dropdown-menu-trigger">{children}</div>,
    DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
}));

// 아이콘 모킹
vi.mock('lucide-react', () => ({
    Menu: () => <div data-testid="menu-icon">Menu Icon</div>,
    X: () => <div data-testid="x-icon">X Icon</div>,
    Settings: () => <div data-testid="settings-icon">Settings Icon</div>,
    LogOut: () => <div data-testid="logout-icon">Logout Icon</div>,
    Home: () => <div data-testid="home-icon">Home Icon</div>,
    LayoutDashboard: () => <div data-testid="dashboard-icon">Dashboard Icon</div>,
    Sun: () => <div data-testid="sun-icon">Sun Icon</div>,
    Moon: () => <div data-testid="moon-icon">Moon Icon</div>,
}));

describe('ClientLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockImplementation(() => ({
            push: mockPush,
            refresh: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
        }));
    });

    describe('렌더링 테스트', () => {
        it('헤더와 사이드바를 포함하는 레이아웃을 렌더링해야 함', async () => {
            // 테스트 렌더링
            render(
                <ClientLayout>
                    <div data-testid="mock-children">Mock Children Content</div>
                </ClientLayout>
            );

            // 자식 및 UI 요소가 렌더링되는지 확인
            await waitFor(() => {
                expect(screen.getByTestId('mock-children')).toBeInTheDocument();
                expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
                expect(screen.getByTestId('mock-toaster')).toBeInTheDocument();
            });
        });
    });
}); 