'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ProjectToolbar } from './ProjectToolbar';
import { ShortcutToolbar } from './ShortcutToolbar';
import { MainCanvas } from './MainCanvas';
import { MainToolbar } from './MainToolbar';
import { Sidebar } from './Sidebar';
import { ReactFlowProvider } from '@xyflow/react';
// React Flow 스타일은 MainCanvas에서 import 합니다

export function DashboardLayout() {
  const { isSidebarOpen } = useAppStore();

  // 클라이언트 측에서만 실행되는 코드
  useEffect(() => {
    // 여기에 필요한 초기화 코드 추가
    console.log('DashboardLayout 마운트됨');
    
    return () => {
      console.log('DashboardLayout 언마운트됨');
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 프로젝트 툴바 (좌측 상단) */}
      <ProjectToolbar />
      
      {/* 단축키 툴바 (우측 상단) */}
      <ShortcutToolbar />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 relative">
        {/* 메인 캔버스 */}
        <div className={`flex-1 h-full transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
          <ReactFlowProvider>
            <MainCanvas />
          </ReactFlowProvider>
        </div>
        
        {/* 사이드바 */}
        <Sidebar />
      </div>
      
      {/* 메인 툴바 (하단 센터) */}
      <MainToolbar />
    </div>
  );
} 