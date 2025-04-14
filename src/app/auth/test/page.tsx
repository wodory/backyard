/**
 * 파일명: auth/test/page.tsx
 * 목적: 인증 기능 테스트 페이지
 * 역할: 다양한 인증 상태 및 스토리지 검사 기능 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 * 수정일: 2023-10-31 : NextAuth signOut을 Supabase signOut으로 대체
 * 수정일: 2023-11-01 : NextAuth useSession을 Supabase Auth로 완전히 대체
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn } from 'next-auth/react';
import { signOut, getCurrentUser, ExtendedUser } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleGoogleLogin = () => {
    signIn('google');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      alert('로그아웃 성공');
    } catch (e) {
      console.error('로그아웃 오류:', e);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      await fetch('/api/test/run-all', {
        method: 'POST'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">인증 테스트 페이지</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">인증 테스트 페이지</h1>
        <Button onClick={handleGoogleLogin}>Google 로그인 테스트</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">인증 테스트 페이지</h1>

      <div className="flex gap-4 mb-8">
        <Button onClick={handleLogout}>로그아웃 테스트</Button>
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? '테스트 중...' : '모든 테스트 실행'}
        </Button>
      </div>

      <Tabs defaultValue="session">
        <TabsList>
          <TabsTrigger value="session">세션 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle>세션 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 