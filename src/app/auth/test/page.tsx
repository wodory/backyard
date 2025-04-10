/**
 * 파일명: auth/test/page.tsx
 * 목적: 인증 기능 테스트 페이지
 * 역할: 다양한 인증 상태 및 스토리지 검사 기능 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AuthTestPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    signIn('google');
  };

  const handleLogout = () => {
    signOut();
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

  if (!session) {
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
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 