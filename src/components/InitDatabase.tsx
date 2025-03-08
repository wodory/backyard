'use client';

import { useEffect, useState } from 'react';

export function InitDatabase() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // 개발 환경에서만 실행
    if (process.env.NODE_ENV === 'development') {
      // DB 초기화 API 호출
      const initDb = async () => {
        try {
          const response = await fetch('/api/db-init');
          const data = await response.json();
          console.log('DB 초기화 결과:', data);
          setInitialized(true);
        } catch (error) {
          console.error('DB 초기화 중 오류 발생:', error);
        }
      };
      
      if (!initialized) {
        initDb();
      }
    }
  }, [initialized]);
  
  // 아무것도 렌더링하지 않음
  return null;
} 