import React from 'react';
import CreateCardButton from '@/components/cards/CreateCardButton';

interface SimpleCreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (cardData: any) => void;
}

/**
 * 간단한 카드 생성 모달 컴포넌트
 * BoardComponent에서 사용하기 위한 래퍼 컴포넌트
 */
export function SimpleCreateCardModal({
  isOpen,
  onClose,
  onCardCreated
}: SimpleCreateCardModalProps) {
  // 카드가 생성되면 onCardCreated 콜백을 호출하고 모달을 닫음
  const handleCardCreated = (cardData: any) => {
    onCardCreated(cardData);
  };

  // isOpen이 false면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4">
        <CreateCardButton 
          onCardCreated={handleCardCreated} 
          autoOpen={true} 
          onClose={onClose}
        />
      </div>
    </div>
  );
} 