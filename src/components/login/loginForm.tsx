/**
 * 파일명: src/components/login/loginForm.tsx
 * 목적: 사용자 로그인 UI 컴포넌트 제공
 * 역할: 이메일/비밀번호 로그인 및 Google 소셜 로그인 폼 제공
 * 작성일: 2024-06-28
 * 수정일: 2024-05-30 : 서버 액션 및 상태 관리 연동 추가
 * 수정일: 2025-04-24 : 액션 함수명 업데이트 및 Supabase 직접 연동
 * 수정일: 2025-04-24 : 구글 로그인 핸들러 수정 - 클라이언트 측 리다이렉션 처리
 * 수정일: 2025-04-24 : AuthContext 제거 및 상태 관리 단순화
 */

"use client"

import React, { useState, useEffect } from 'react'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation' // 에러/메시지 표시 위해 추가

import { ArrowRight, Mail, Lock } from "lucide-react"

import { loginAction, googleSignInAction } from '@/app/login/actions' // 서버 액션 import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailPending, setIsEmailPending] = useState(false); // 이메일 로그인 로딩
    const [isGooglePending, setIsGooglePending] = useState(false); // Google 로그인 로딩
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const messageParam = searchParams.get('message');
        if (errorParam) setError(decodeURIComponent(errorParam));
        if (messageParam) setMessage(decodeURIComponent(messageParam));
    }, [searchParams]);

    const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setIsEmailPending(true);
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        try {
            // 서버 액션 직접 호출 - 성공시 자동 리다이렉션됨
            await loginAction(formData);
        } catch (err) {
            console.error("Login action failed:", err);
            setError("로그인 처리 중 오류가 발생했습니다.");
            setIsEmailPending(false);
        }
        // 성공 시에는 서버 액션이 리다이렉트하므로 여기서 상태를 변경할 필요 없음
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setMessage(null);
        setIsGooglePending(true);
        try {
            // 서버 액션 호출하여 URL 획득
            const result = await googleSignInAction();

            if (result.error) {
                // 오류가 있는 경우 표시
                console.error("Google signin error:", result.error);
                setError(result.error);
                setIsGooglePending(false);
                return;
            }

            if (result.url) {
                // 클라이언트 측에서 URL로 리다이렉션
                console.log("Redirecting to Google OAuth URL...");
                // Supabase SSR을 이용한 로그인 처리 시 window.location.href 사용 권장
                window.location.href = result.url;
                return;
            }

            // URL이 없는 경우 오류 표시
            setError("구글 로그인 URL을 획득하지 못했습니다.");
            setIsGooglePending(false);
        } catch (err) {
            console.error("Google Sign in action failed:", err);
            setError("Google 로그인 처리 중 오류가 발생했습니다.");
            setIsGooglePending(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 md:p-12">
            <div className="mb-4 text-center">
                <h1 className="text-3xl font-bold">Backyard</h1>
                <p className="text-slate-500">상상력을 연결한 문서</p>
            </div>

            {/* Login Form */}
            <Card className="border shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">로그인</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    {/* 오류 메시지 표시 */}
                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                            {error}
                        </div>
                    )}
                    {/* 성공 메시지 표시 */}
                    {message && (
                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
                            {message}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="login-email">이메일</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="example@email.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isEmailPending || isGooglePending}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="login-password">비밀번호</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="login-password"
                                type="password"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isEmailPending || isGooglePending}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        className="w-full bg-primary/90 hover:bg-primary text-base transition-all duration-200"
                        onClick={handleEmailLogin}
                        disabled={isEmailPending || isGooglePending}
                    >
                        {isEmailPending ? '로그인 중...' : '로그인'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="flex w-full items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">또는</span>
                        <Separator className="flex-1" />
                    </div>

                    <Button
                        variant="outline"
                        className="w-full border-gray-300 font-medium"
                        onClick={handleGoogleLogin}
                        disabled={isEmailPending || isGooglePending}
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            width="48px"
                            height="48px"
                        >
                            <path
                                fill="#FFC107"
                                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                            />
                            <path
                                fill="#FF3D00"
                                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                            />
                        </svg>
                        {isGooglePending ? '진행 중...' : 'Google로 로그인하기'}
                    </Button>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            계정이 없으신가요?{" "}
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                회원가입
                            </Link>
                            {" · "}
                            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                                비밀번호 찾기
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 