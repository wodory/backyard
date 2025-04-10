/**
 * 파일명: InitDatabase.tsx
 * 목적: 개발 환경에서 데이터베이스 초기화
 * 역할: 개발 환경에서만 데이터베이스를 초기화하는 컴포넌트
 * 작성일: 2025-03-30
 */

'use client';

import { useEffect } from 'react';

/**
 * InitDatabase: 개발 환경에서만 데이터베이스를 초기화하는 컴포넌트
 * @returns null - UI를 렌더링하지 않음
 */
export default function InitDatabase() {
  useEffect(() => {
    const initDatabase = async () => {
      if (process.env.NEXT_PUBLIC_ENABLE_DB_INIT !== 'true') {
        return;
      }

      try {
        const response = await fetch('/api/db-init');
        if (!response.ok) {
          throw new Error('Failed to initialize database');
        }
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();
  }, []);

  return null;
} 