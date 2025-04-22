/**
 * 파일명: useNodes.ts
 * 목적: 노드 클릭 핸들러 로직 관리
 * 역할: 노드 클릭 및 패널 클릭 이벤트 핸들링 로직 캡슐화
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 */

import { useCallback } from 'react';

import { 
  NodeMouseHandler,
  Node
} from '@xyflow/react';
import { toast } from 'sonner';

import { useAppStore } from '@/store/useAppStore';

import { CardData } from '../types/board-types';

/**
 * useNodeClickHandlers: 노드 클릭 관련 핸들러를 제공하는 훅
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수 (옵션)
 * @param onNodeDoubleClick 노드 더블 클릭 시 호출될 콜백 함수 (옵션)
 * @returns 노드 클릭 관련 핸들러 함수들
 */
export function useNodeClickHandlers({
  onSelectCard,
  onNodeDoubleClick
}: {
  onSelectCard?: (cardId: string | null) => void;
  onNodeDoubleClick?: (node: Node<CardData>) => void;
}) {
  // 전역 상태에서 선택된 카드 정보 가져오기
  const { selectedCardIds, toggleSelectedCard, selectCard, clearSelectedCards } = useAppStore();
  
  /**
   * 노드 클릭 핸들러: 노드 선택 처리
   * @param event 마우스 이벤트
   * @param node 클릭된 노드
   */
  const handleNodeClick = useCallback<NodeMouseHandler>((event, node) => {
    // 이벤트 전파 방지는 항상 수행
    event.stopPropagation();

    // 노드가 undefined인 경우 처리
    if (!node) {
      console.warn('클릭된 노드가 undefined입니다.');
      return;
    }
    
    // 노드 타입 안전하게 변환
    const typedNode = node as Node<CardData>;
    
    // 더블 클릭 처리
    if (event.detail === 2 && onNodeDoubleClick) {
      onNodeDoubleClick(typedNode);
      return;
    }
    
    // 다중 선택 모드 (Ctrl/Cmd 키 누른 상태)
    const isMultiSelectMode = event.ctrlKey || event.metaKey;
    
    // 노드 id 가져오기
    const nodeId = typedNode.id;
    
    // 기본 이벤트 관리
    event.stopPropagation();
    
    if (isMultiSelectMode) {
      // 다중 선택 모드: 선택된 카드 목록에 추가/제거
      console.log('다중 선택 모드로 노드 클릭:', nodeId);
      
      // 토스트 메시지 결정을 위해 현재 선택 상태 미리 확인
      const isCurrentlySelected = selectedCardIds.includes(nodeId);
      
      // 상태 업데이트
      toggleSelectedCard(nodeId);
      
      // 성공 메시지 표시 - 다중 선택 모드
      if (isCurrentlySelected) {
        toast.success(`'${typedNode.data.title}'가 선택에서 제거되었습니다.`);
      } else {
        toast.success(`'${typedNode.data.title}'가 선택에 추가되었습니다.`);
      }
    } else {
      // 단일 선택 모드: 하나만 선택
      console.log('단일 선택 모드로 노드 클릭:', nodeId);
      
      // 이미 선택된 카드를 다시 클릭하는 경우 처리
      if (selectedCardIds.length === 1 && selectedCardIds[0] === nodeId) {
        // 동일한 카드 재선택 - 아무것도 하지 않음
        console.log('이미 선택된 카드 재선택:', nodeId);
      } else {
        // 새로운 카드 선택
        selectCard(nodeId);
        
        // 성공 메시지 표시 - 단일 선택 모드
        toast.success(`'${typedNode.data.title}'가 선택되었습니다.`);
      }
    }
    
    // props로 전달된 콜백이 있다면 실행
    if (onSelectCard) {
      onSelectCard(nodeId);
    }
  }, [onSelectCard, selectedCardIds, selectCard, toggleSelectedCard, onNodeDoubleClick]);

  /**
   * 패널 클릭 핸들러 (빈 공간 클릭)
   * @param event 마우스 이벤트
   */
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Ctrl/Meta 키가 눌려있지 않은 경우에만 모든 선택 해제
    if (!(event.ctrlKey || event.metaKey)) {
      // 선택된 카드가 있을 때만 토스트 표시 및 선택 해제
      if (selectedCardIds.length > 0) {
        // if (selectedCardIds.length > 1) {
        //   toast.info(`${selectedCardIds.length}개 카드 선택이 해제되었습니다.`);
        // } else {
        //   toast.info('카드 선택이 해제되었습니다.');
        // }
        
        // 선택 해제
        clearSelectedCards();
        if (onSelectCard) {
          onSelectCard(null);
        }
      }
    }
  }, [onSelectCard, selectedCardIds, clearSelectedCards]);

  return {
    handleNodeClick,
    handlePaneClick
  };
} 