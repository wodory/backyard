import React from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import createLogger from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

// 모듈별 로거 생성
const logger = createLogger('ProjectToolbar');

const ProjectToolbar: React.FC = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      logger.info('로그아웃 버튼 클릭');
      
      // AuthContext를 통한 로그아웃 (code_verifier 보존)
      await signOut();
      
      // 로그인 페이지로 리디렉션
      logger.info('로그인 페이지로 리디렉션');
      router.push('/login');
    } catch (error) {
      logger.error('로그아웃 처리 중 오류', error);
      router.push('/login');
    }
  };

  return (
    <div>
      {/* 로그아웃 버튼 */}
      <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
        로그아웃
      </button>
    </div>
  );
};

export default ProjectToolbar; 