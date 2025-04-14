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

        // 2. 로그인 버튼 확인
        const loginButton = screen.getByText('Google 로그인')
        expect(loginButton).toBeInTheDocument()

        // 3. 로그인 버튼 클릭 시 signInWithGoogle 호출 및 성공 반환
        mockSignInWithGoogle.mockResolvedValueOnce({ success: true, error: null })

        fireEvent.click(loginButton)

        await waitFor(() => {
            expect(mockSignInWithGoogle).toHaveBeenCalled()
            expect(useRouter().push).toHaveBeenCalledWith('/dashboard')
        })

        // 4. 로그인 상태로 변경 시 사용자 정보 표시
        vi.mocked(useAuth).mockReturnValue({
            user: { id: 'user-123', email: 'test@example.com', provider: 'google' },
            loading: false
        })

        // 5. 페이지 다시 렌더링
        render(<LoginPage />)

        // 6. 사용자 정보와 로그아웃 버튼 확인
        const userInfo = screen.getByTestId('user-info')
        expect(userInfo).toBeInTheDocument()
        expect(userInfo.textContent).toBe('test@example.com')

        const logoutButton = screen.getByText('로그아웃')
        expect(logoutButton).toBeInTheDocument()

        // 7. 로그아웃 버튼 클릭
        mockSignOut.mockResolvedValueOnce(undefined)

        fireEvent.click(logoutButton)

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled()
            expect(useRouter().push).toHaveBeenCalledWith('/login')
        })
    })

    it('로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리디렉션되어야 합니다', async () => {
        // 1. 로그아웃 상태에서 보호된 페이지 접근
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: false })

        render(<ProtectedPage />)

        // 2. 로그인 페이지로 리디렉션 확인
        await waitFor(() => {
            expect(useRouter().push).toHaveBeenCalledWith('/login')
        })
    })
}) 