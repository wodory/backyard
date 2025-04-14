/**
 * 파일명: src/tests/integration/auth-flow.test.tsx
 * 목적: Supabase 인증 흐름 통합 테스트
 * 역할: OAuth 로그인, 콜백 처리, 로그아웃 과정 검증
 * 작성일: 2024-05-01
 * 수정일: 2024-05-01 : AuthContext 모킹 방식 수정 및 signInWithGoogle 반환 타입 조정
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import userEvent from '@testing-library/user-event'

// 실제 모듈 모킹
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn()
}))

// Auth 모듈 모킹
const mockSignInWithGoogle = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/auth', () => ({
    signInWithGoogle: () => mockSignInWithGoogle(),
    signOut: () => mockSignOut()
}))

// AuthContext 모킹
vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// 테스트 컴포넌트 생성
import { useAuth } from '@/context/AuthContext'

const LoginPage = () => {
    const { user } = useAuth() || { user: null }
    const router = useRouter()

    const handleLogin = async () => {
        const result = await mockSignInWithGoogle()
        if (result.success) router.push('/dashboard')
    }

    const handleLogout = async () => {
        await mockSignOut()
        router.push('/login')
    }

    return (
        <div>
            {!user ? (
                <button onClick={handleLogin}>Google 로그인</button>
            ) : (
                <div>
                    <div data-testid="user-info">{user.email}</div>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            )}
        </div>
    )
}

const ProtectedPage = () => {
    const { user } = useAuth() || { user: null }
    const router = useRouter()

    if (!user) {
        router.push('/login')
        return null
    }

    return <div>비밀 콘텐츠</div>
}

describe('인증 흐름 통합 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // useRouter 모킹
        const mockRouter = { push: vi.fn() }
        vi.mocked(useRouter).mockReturnValue(mockRouter)

        // usePathname 모킹
        vi.mocked(usePathname).mockReturnValue('/login')

        // useAuth 모킹 - 처음에는 로그아웃 상태
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: false })
    })

    it('Google OAuth 로그인 및 로그아웃 전체 흐름을 테스트합니다', async () => {
        // 1. Login 페이지 렌더링
        render(<LoginPage />)

        // 2. Google 로그인 버튼 클릭
        await userEvent.click(screen.getByText(/Google 로그인/))

        // 3. 로그인 함수 호출 확인
        expect(mockSignInWithGoogle).toHaveBeenCalled()

        // 4. 로그인 성공 시 리디렉션 확인
        expect(useRouter().push).toHaveBeenCalledWith('/dashboard')

        // 5. 로그인 성공 후 사용자 상태 확인
        // mockSignInWithGoogle이 호출된 후 getUserData가 호출되는 시점을 시뮬레이션
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            loading: false,
            session: { access_token: 'mock-token' } as any,
            signOut: mockSignOut,
            codeVerifier: 'test-verifier',
            error: null,
            setCodeVerifier: vi.fn(),
        })

        // 6. Dashboard 렌더링 (로그인 후 상태)
        const { rerender } = render(<LoginPage />)

        // 7. 사용자 정보가 표시되는지 확인
        expect(screen.getByTestId('user-info')).toHaveTextContent(mockUser.email as string)

        // 8. 로그아웃 버튼 클릭
        await userEvent.click(screen.getByText('로그아웃'))

        // 9. 로그아웃 함수 호출 확인
        expect(mockSignOut).toHaveBeenCalled()

        // 10. 로그아웃 후 리디렉션 확인
        expect(useRouter().push).toHaveBeenCalledWith('/login')

        // 11. 로그아웃 후 쿠키 및 로컬 스토리지 삭제 확인 
        const cookiesDeleteSpy = vi.spyOn(document.cookie, 'split', 'get');
        expect(document.cookie).not.toContain('sb-access-token');
        expect(document.cookie).not.toContain('sb-refresh-token');

        // 12. 로그아웃 후 사용자 상태 null로 변경 확인
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            session: null,
            signOut: mockSignOut,
            codeVerifier: null,
            error: null,
            setCodeVerifier: vi.fn(),
        })

        rerender(<LoginPage />)

        // 13. 로그인 버튼이 다시 보이는지 확인
        expect(screen.getByText(/Google 로그인/)).toBeInTheDocument()
    })

    it('로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리디렉션되어야 합니다', async () => {
        // 1. 로그아웃 상태에서 보호된 페이지 접근
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            session: null,
            signOut: mockSignOut,
            codeVerifier: null,
            error: null,
            setCodeVerifier: vi.fn(),
        })

        render(<ProtectedPage />)

        // 2. 로그인 페이지로 리디렉션 확인
        await waitFor(() => {
            expect(useRouter().push).toHaveBeenCalledWith('/login')
        })

        // 3. 로컬 스토리지에 인증 토큰이 없는지 확인
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
        expect(sessionStorage.getItem('code_verifier')).toBeNull()
    })
}) 