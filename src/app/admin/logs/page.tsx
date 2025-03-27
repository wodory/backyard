/**
 * 파일명: page.tsx
 * 목적: 로그 뷰어 관리자 페이지
 * 역할: 애플리케이션 로그를 조회하고 필터링하는 인터페이스 제공
 * 작성일: 2024-03-28
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  data?: any;
  sessionId?: string;
  serverTimestamp?: string;
}

export default function LogViewerPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  
  // 필터링 상태
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [limit, setLimit] = useState(100);
  
  // 로그 데이터 가져오기
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // 필터 파라미터 구성
      const params = new URLSearchParams();
      if (selectedModule) params.append('module', selectedModule);
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedSessionId) params.append('sessionId', selectedSessionId);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/logs/view?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setLogs(data.logs || []);
      setModules(data.modules || []);
      setSessionIds(data.sessionIds || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '로그를 가져오는 중 오류가 발생했습니다.');
      console.error('로그 가져오기 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 로그 가져오기
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // 필터 변경 시 로그 새로고침
  const handleFilterChange = () => {
    fetchLogs();
  };
  
  // 레벨에 따른 색상
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'debug': return 'text-gray-600';
      default: return 'text-gray-800';
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">로그 뷰어</h1>
      
      {/* 필터링 컨트롤 */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모듈</label>
            <select
              className="w-full rounded border-gray-300 shadow-sm"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">모든 모듈</option>
              {modules.map((module) => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
            <select
              className="w-full rounded border-gray-300 shadow-sm"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">모든 레벨</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">세션 ID</label>
            <select
              className="w-full rounded border-gray-300 shadow-sm"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <option value="">모든 세션</option>
              {sessionIds.map((id) => (
                <option key={id} value={id}>{id.substring(0, 8)}...</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">로그 수</label>
            <select
              className="w-full rounded border-gray-300 shadow-sm"
              value={limit.toString()}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="50">50개</option>
              <option value="100">100개</option>
              <option value="200">200개</option>
              <option value="500">500개</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleFilterChange}
            disabled={loading}
          >
            필터 적용
          </button>
          
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => {
              setSelectedModule('');
              setSelectedLevel('');
              setSelectedSessionId('');
              setLimit(100);
              setTimeout(fetchLogs, 0);
            }}
          >
            필터 초기화
          </button>
        </div>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="loader">로딩 중...</div>
        </div>
      )}
      
      {/* 로그 목록 */}
      {!loading && logs.length === 0 ? (
        <div className="bg-gray-100 p-8 text-center rounded">
          <p className="text-gray-600">조건에 맞는 로그가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">시간</th>
                <th className="px-4 py-2 text-left">모듈</th>
                <th className="px-4 py-2 text-left">레벨</th>
                <th className="px-4 py-2 text-left">메시지</th>
                <th className="px-4 py-2 text-left">데이터</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`${getLevelColor(log.level)} font-medium`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.message}</td>
                  <td className="px-4 py-2 text-sm">
                    {log.data ? (
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 하단 액션 버튼 */}
      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={fetchLogs}
          disabled={loading}
        >
          새로고침
        </button>
        
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => router.push('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
} 