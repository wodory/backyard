import React, { useEffect, useState } from 'react';
import { XYPosition } from '@xyflow/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateCardButton from '@/components/cards/CreateCardButton';

interface CreateCardModalProps {
  position: XYPosition;
  connectingNodeId: string;
  handleType: 'source' | 'target';
  onClose: () => void;
  onCardCreated: (cardData: any, position: XYPosition, connectingNodeId: string, handleType: 'source' | 'target') => void;
}

/**
 * 엣지 드래그 드롭으로 새 카드를 생성하기 위한 모달 컴포넌트
 */
export function CreateCardModal({
  position,
  connectingNodeId,
  handleType,
  onClose,
  onCardCreated
}: CreateCardModalProps) {
  // 카드 생성 콜백
  const handleCardCreated = (cardData: any) => {
    onCardCreated(cardData, position, connectingNodeId, handleType);
  };

  // 클릭 이벤트 전파 방지
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4" onClick={handleModalClick}>
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="모달 닫기" data-testid="close-modal-button">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <CreateCardButton 
            onCardCreated={handleCardCreated} 
            autoOpen={true} 
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
} 