/**
 * 파일명: auth/test/page.tsx
 * 목적: 인증 기능 테스트 페이지
 * 역할: 다양한 인증 상태 및 스토리지 검사 기능 제공
 * 작성일: 2024-03-30
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithGoogle, getCurrentUser, signOut } from '@/lib/auth';
import { getHybridSupabaseClient } from '@/lib/hybrid-supabase';
import { getAuthData, STORAGE_KEYS } from '@/lib/auth-storage';

interface StorageData {
  key: string;
  localStorage: string | null;
  sessionStorage: string | null;
  cookie: string | null;
  indexedDB: string | null;
}

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [storageData, setStorageData] = useState<StorageData[]>([]);
  const [cookies, setCookies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toISOString()}] ${message}`, ...prev]);
  };
  
  // 쿠키 가져오기 함수
  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };
  
  // IndexedDB에서 값 가져오기 함수
  const getFromIndexedDB = async (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('auth_backup', 1);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('auth_data')) {
            db.createObjectStore('auth_data');
          }
        };
        
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('auth_data', 'readonly');
          const store = tx.objectStore('auth_data');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => resolve(getRequest.result || null);
          getRequest.onerror = () => resolve(null);
          
          tx.oncomplete = () => db.close();
        };
        
        request.onerror = () => resolve(null);
        
        // 2초 타임아웃
        setTimeout(() => resolve(null), 2000);
      } catch (error) {
        console.error('IndexedDB 읽기 오류:', error);
        resolve(null);
      }
    });
  };

  // 스토리지 데이터 검사
  const checkStorage = async () => {
    addLog('스토리지 데이터 검사 시작');
    
    const keys = Object.values(STORAGE_KEYS);
    const storage: StorageData[] = [];
    
    for (const key of keys) {
      try {
        // 각 스토리지에서 데이터 가져오기
        const localData = localStorage.getItem(key);
        const sessionData = sessionStorage.getItem(`auth.${key}.backup`);
        const cookieData = getCookie(key);
        const dbData = await getFromIndexedDB(key);
        
        storage.push({
          key,
          localStorage: localData ? `${localData.substring(0, 10)}...` : null,
          sessionStorage: sessionData ? `${sessionData.substring(0, 10)}...` : null,
          cookie: cookieData ? `${cookieData.substring(0, 10)}...` : null,
          indexedDB: dbData ? `${dbData.substring(0, 10)}...` : null
        });
      } catch (error) {
        console.error(`${key} 데이터 가져오기 오류:`, error);
        storage.push({
          key,
          localStorage: '오류',
          sessionStorage: '오류',
          cookie: '오류',
          indexedDB: '오류'
        });
      }
    }
    
    setStorageData(storage);
    addLog(`${storage.length}개 스토리지 데이터 항목 검사 완료`);
  };
  
  // 쿠키 검사
  const checkCookies = () => {
    addLog('쿠키 상태 검사 시작');
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
    setCookies(allCookies);
    addLog(`${allCookies.length}개 쿠키 발견`);
  };
  
  // 사용자 정보 검사
  const checkUser = async () => {
    addLog('사용자 정보 검사 시작');
    setLoading(true);
    
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        addLog(`사용자 정보 로드됨: ${currentUser.email}`);
      } else {
        addLog('로그인된 사용자 없음');
      }
      
      // 세션 확인
      const client = getHybridSupabaseClient();
      const { data, error } = await client.auth.getSession();
      
      if (error) {
        addLog(`세션 오류: ${error.message}`);
      } else if (data.session) {
        setSession(data.session);
        addLog('세션 정보 로드됨');
      } else {
        setSession(null);
        addLog('활성 세션 없음');
      }
    } catch (error: any) {
      addLog(`사용자 정보 검사 오류: ${error.message}`);
      console.error('사용자 정보 검사 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 테스트 초기화
  const runAllTests = async () => {
    setLoading(true);
    addLog('모든 테스트 실행 시작');
    
    await checkUser();
    await checkStorage();
    checkCookies();
    
    addLog('모든 테스트 완료');
    setLoading(false);
  };
  
  // Google 로그인 테스트
  const testGoogleLogin = async () => {
    addLog('Google 로그인 시작');
    
    try {
      await signInWithGoogle();
      // 리디렉션되므로 여기에 추가 로직은 필요 없음
    } catch (error: any) {
      addLog(`Google 로그인 오류: ${error.message}`);
      console.error('Google 로그인 오류:', error);
    }
  };
  
  // 로그아웃 테스트
  const testSignOut = async () => {
    addLog('로그아웃 시작');
    
    try {
      await signOut();
      addLog('로그아웃 완료');
      runAllTests();
    } catch (error: any) {
      addLog(`로그아웃 오류: ${error.message}`);
      console.error('로그아웃 오류:', error);
    }
  };

  // 페이지 로드 시 초기 테스트 실행
  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">인증 테스트 페이지</h1>
      
      <div className="flex gap-4 mb-8">
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? '테스트 중...' : '모든 테스트 실행'}
        </Button>
        <Button onClick={testGoogleLogin} variant="outline">
          Google 로그인 테스트
        </Button>
        <Button onClick={testSignOut} variant="outline" disabled={!user}>
          로그아웃 테스트
        </Button>
      </div>
      
      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user">사용자 정보</TabsTrigger>
          <TabsTrigger value="storage">스토리지</TabsTrigger>
          <TabsTrigger value="cookies">쿠키</TabsTrigger>
          <TabsTrigger value="logs">로그</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>사용자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                ) : (
                  <p>로그인된 사용자 없음</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>세션 정보</CardTitle>
              </CardHeader>
              <CardContent>
                {session ? (
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                ) : (
                  <p>활성 세션 없음</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>스토리지 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border">키</th>
                      <th className="p-2 text-left border">localStorage</th>
                      <th className="p-2 text-left border">sessionStorage</th>
                      <th className="p-2 text-left border">cookie</th>
                      <th className="p-2 text-left border">indexedDB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storageData.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border">{item.key}</td>
                        <td className="p-2 border">{item.localStorage || '없음'}</td>
                        <td className="p-2 border">{item.sessionStorage || '없음'}</td>
                        <td className="p-2 border">{item.cookie || '없음'}</td>
                        <td className="p-2 border">{item.indexedDB || '없음'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>쿠키 ({cookies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cookies.length > 0 ? (
                <div className="grid gap-2">
                  {cookies.map((cookie, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {cookie}
                    </div>
                  ))}
                </div>
              ) : (
                <p>쿠키가 없습니다</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>로그 ({logs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md h-96 overflow-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1 font-mono text-sm">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 