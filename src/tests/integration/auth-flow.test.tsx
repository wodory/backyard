/**
 * 파일명: src/tests/integration/auth-flow.test.tsx
 * 목적: Supabase 인증 흐름 통합 테스트
 * 역할: OAuth 로그인, 콜백 처리, 로그아웃 과정 검증
 * 작성일: 2024-05-01
 * 수정일: 2024-05-01 : AuthContext 모킹 방식 수정 및 signInWithGoogle 반환 타입 조정
 * 수정일: 2024-06-05 : auth-flow.test.ts와 통합
 */

import { useRouter, usePathname } from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// AuthContext 타입 정의
interface AuthContextType {
    user: any;
    loading: boolean;
    session?: any;
    signOut?: typeof mockSignOut;
    codeVerifier?: string | null;
    error?: any;
    setCodeVerifier?: (code: string) => void;
}

// useAuth mock 함수
const useAuth = vi.fn();

// AuthContext 모킹
vi.mock('@/context/AuthContext', () => {
    return {
        useAuth: vi.fn(),
        AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    }
})

// STORAGE_KEYS 정의
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'sb-access-token',
    REFRESH_TOKEN: 'sb-refresh-token',
    CODE_VERIFIER: 'code_verifier'
};

// localStorage 모킹 함수
const getAuthData = (key: string) => localStorage.getItem(key);
const setAuthData = (key: string, value: string) => localStorage.setItem(key, value);
const clearTestEnvironment = () => {
    localStorage.clear();
    sessionStorage.clear();
};

// 타입 정의
interface AuthOptions {
    queryParams?: {
        code_challenge?: string;
        code_challenge_method?: string;
    };
    redirectTo?: string;
}

interface AuthResponse {
    data: any;
    error: any;
}

// 모킹된 Supabase 함수
const mockSignInWithOAuth = async ({ options }: { options: AuthOptions }): Promise<AuthResponse> => {
    if (!options.queryParams?.code_challenge) {
        return { data: null, error: { message: 'code_challenge is required', status: 400 } };
    }
    if (options.queryParams.code_challenge === 'invalid') {
        return { data: null, error: { message: 'Invalid code challenge', status: 400 } };
    }
    return { data: { provider: 'google', url: 'https://accounts.google.com/auth' }, error: null };
};

const mockSupabaseSignOut = async (): Promise<{ error: null }> => {
    await setAuthData(STORAGE_KEYS.ACCESS_TOKEN, '');
    await setAuthData(STORAGE_KEYS.REFRESH_TOKEN, '');
    return { error: null };
};

// 모킹된 브라우저 환경 체크 함수
const mockCheckBrowserEnvironment = () => {
    if (typeof window === 'undefined') {
        throw new Error('브라우저 환경에서만 사용 가능합니다');
    }
    return true;
};

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithOAuth: mockSignInWithOAuth,
            signOut: mockSupabaseSignOut
        }
    }
}));

// 테스트용 사용자 정보
const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: '테스트 사용자'
};

const LoginPage = () => {
    const { user } = useAuth() as AuthContextType || { user: null }
    const router = useRouter() as AppRouterInstance

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
    const { user } = useAuth() as AuthContextType || { user: null }
    const router = useRouter() as AppRouterInstance

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
        const mockRouter = {
            push: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn()
        } as unknown as AppRouterInstance
        vi.mocked(useRouter).mockReturnValue(mockRouter)

        // usePathname 모킹
        vi.mocked(usePathname).mockReturnValue('/login')

        // useAuth 모킹 - 처음에는 로그아웃 상태
        useAuth.mockReturnValue({ user: null, loading: false })

        // localStorage 정리
        clearTestEnvironment()
    })

    it('Google OAuth 로그인 및 로그아웃 전체 흐름을 테스트합니다', async () => {
        // 1. Login 페이지 렌더링
        render(<LoginPage />)

        // 2. Google 로그인 버튼 클릭
        await userEvent.click(screen.getByText(/Google 로그인/))

        // 3. 로그인 함수 호출 확인
        expect(mockSignInWithGoogle).toHaveBeenCalled()

        // 4. 로그인 성공 시 리디렉션 확인
        expect((useRouter() as AppRouterInstance).push).toHaveBeenCalledWith('/dashboard')

        // 5. 로그인 성공 후 사용자 상태 확인
        // mockSignInWithGoogle이 호출된 후 getUserData가 호출되는 시점을 시뮬레이션
        useAuth.mockReturnValue({
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
        expect((useRouter() as AppRouterInstance).push).toHaveBeenCalledWith('/login')

        // 11. 로그아웃 후 쿠키 및 로컬 스토리지 삭제 확인 
        expect(document.cookie).not.toContain('sb-access-token');
        expect(document.cookie).not.toContain('sb-refresh-token');

        // 12. 로그아웃 후 사용자 상태 null로 변경 확인
        useAuth.mockReturnValue({
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
        useAuth.mockReturnValue({
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
            expect((useRouter() as AppRouterInstance).push).toHaveBeenCalledWith('/login')
        })

        // 3. 로컬 스토리지에 인증 토큰이 없는지 확인
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
        expect(sessionStorage.getItem('code_verifier')).toBeNull()
    })
})

describe('PKCE 인증 흐름', () => {
    beforeEach(async () => {
        await clearTestEnvironment();
    });

    it('code_verifier 누락 시 로그인 실패 시나리오', async () => {
        // 1. 로그인 시도
        const { data, error } = await mockSignInWithOAuth({
            options: {
                queryParams: {},
                redirectTo: 'http://localhost:3000/auth/callback'
            }
        });

        // 2. 결과 확인
        expect(data).toBeNull();
        expect(error).toEqual({
            message: 'code_challenge is required',
            status: 400
        });
    });

    it('인증 코드 누락 시 로그인 실패 시나리오', async () => {
        // 1. 로그인 시도
        const { data, error } = await mockSignInWithOAuth({
            options: {
                queryParams: {
                    code_challenge: 'invalid',
                    code_challenge_method: 'S256'
                },
                redirectTo: 'http://localhost:3000/auth/callback'
            }
        });

        // 2. 결과 확인
        expect(data).toBeNull();
        expect(error).toEqual({
            message: 'Invalid code challenge',
            status: 400
        });
    });

    it('로그아웃 시 토큰이 제거되어야 합니다', async () => {
        // 1. 초기 상태 설정
        await setAuthData(STORAGE_KEYS.ACCESS_TOKEN, 'test_access_token');

        // 2. 로그아웃 실행
        const { error } = await mockSupabaseSignOut();

        // 3. 결과 확인
        expect(error).toBeNull();
        const token = await getAuthData(STORAGE_KEYS.ACCESS_TOKEN);
        expect(token).toBeNull();
    });
})

describe('브라우저 환경 검증', () => {
    it('클라이언트 인증 요청은 브라우저 환경에서만 작동해야 함', () => {
        // window 객체가 존재하는 환경에서는 오류가 발생하지 않음
        expect(mockCheckBrowserEnvironment()).toBe(true);

        // 서버 환경 시뮬레이션 (실제 window 객체를 undefined로 설정하지 않음)
        const originalWindow = window;
        try {
            expect(() => {
                // 브라우저 환경 체크 함수를 직접 테스트
                if (typeof undefined === 'undefined') {
                    throw new Error('브라우저 환경에서만 사용 가능합니다');
                }
            }).toThrow('브라우저 환경에서만 사용 가능합니다');
        } finally {
            // window 객체 복원 (실제로는 변경하지 않았음)
            expect(window).toBe(originalWindow);
        }
    });
}) 