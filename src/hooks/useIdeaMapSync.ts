/**
 * 파일명: src/hooks/useIdeaMapSync.ts
 * 목적: React Query 카드 데이터와 ReactFlow 노드 간 동기화
 * 역할: 쿼리 캐시 변경 감지하여 자동으로 ReactFlow 노드 업데이트
 * 작성일: 2025-04-21
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('useIdeaMapSync');

/**
 * useIdeaMapSync: React Query 카드 데이터와 ReactFlow 노드 간 동기화 훅
 * 
 * 이 훅은 컴포넌트 마운트 시 React Query의 카드 쿼리 데이터 변경을 구독하고,
 * 변경이 감지되면 자동으로 ReactFlow 노드를 선택적으로 업데이트합니다.
 */
export function useIdeaMapSync() {
  const queryClient = useQueryClient();
  const updateNodesSelectively = useIdeaMapStore(state => state.updateNodesSelectively);
  
  useEffect(() => {
    logger.debug('카드 데이터와 ReactFlow 노드 동기화 구독 설정');
    
    // React Query의 쿼리 캐시 변경을 구독
    const unsubscribe = queryClient.getQueryCache().subscribe(
      (event) => {
        // 카드 쿼리에 대한 변경만 필터링
        if (
          event.type === 'updated' && 
          Array.isArray(event.query.queryKey) && 
          event.query.queryKey[0] === 'cards'
        ) {
          logger.debug('카드 쿼리 데이터 변경 감지:', { 
            queryKey: event.query.queryKey,
            type: event.type 
          });
          
          // 데이터가 있는 경우만 처리
          const data = queryClient.getQueryData(event.query.queryKey);
          if (data && Array.isArray(data)) {
            logger.debug('변경된 카드 데이터로 노드 업데이트:', { cardCount: data.length });
            
            // setTimeout을 사용하여 비동기 처리 - React Query 업데이트가 완전히 적용된 후 처리
            setTimeout(() => {
              updateNodesSelectively(data);
            }, 50);
          }
        }
      }
    );
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      logger.debug('카드 데이터 동기화 구독 해제');
      unsubscribe();
    };
  }, [queryClient, updateNodesSelectively]);
  
  // 초기 동기화 - 마운트 시 한 번 실행
  useEffect(() => {
    const initialData = queryClient.getQueryData(['cards']);
    
    if (initialData && Array.isArray(initialData)) {
      logger.debug('초기 데이터 동기화:', { cardCount: initialData.length });
      updateNodesSelectively(initialData);
    }
  }, [queryClient, updateNodesSelectively]);
  
  return null; // 렌더링 없음
} 