/**
 * 파일명: src/app/auth/login/page.tsx
 * 목적: 사용자 로그인 페이지
 * 역할: 소셜 로그인 및 이메일 로그인 기능 제공
 * 작성일: 2025-03-30
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6" data-slot="card-header">
          <h1 className="leading-none font-semibold" data-slot="card-title">
            로그인
          </h1>
          <CardDescription>
            소셜 계정으로 간편하게 로그인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : 'Google로 로그인'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 