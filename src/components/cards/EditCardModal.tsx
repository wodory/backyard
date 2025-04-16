/**
 * 파일명: src/components/cards/EditCardModal.tsx
 * 목적: 카드 수정 모달 컴포넌트
 * 역할: 카드 정보를 수정하기 위한 모달 인터페이스 제공
 * 작성일: 2024-05-17
 */

"use client";

import React, { useState, useEffect } from 'react';

import { X } from 'lucide-react';

import EditCardForm from "@/components/cards/EditCardForm";
import type { CardData } from "@/components/cards/EditCardForm";
import { Button } from "@/components/ui/button";

interface EditCardModalProps {
  cardId: string;
  onClose: () => void;
  onCardUpdated?: (updatedCard: CardData) => void;
}

/**
 * 카드 수정을 위한 모달 컴포넌트
 */
export function EditCardModal({
  cardId,
  onClose,
  onCardUpdated
}: EditCardModalProps) {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카드 데이터 로드
  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cards/${cardId}`);

        if (!response.ok) {
          throw new Error('카드를 찾을 수 없습니다.');
        }

        const data = await response.json();
        setCard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '카드 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  // 카드 업데이트 콜백
  const handleCardUpdated = (updatedCard?: CardData) => {
    if (onCardUpdated && updatedCard) {
      onCardUpdated(updatedCard);
    }
    onClose();
  };

  // 클릭 이벤트 전파 방지
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="relative bg-card rounded-lg shadow-lg max-w-[700px] w-full mx-4" onClick={handleModalClick}>
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-4"
              >
                닫기
              </Button>
            </div>
          ) : card ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">카드 수정</h2>
                <p className="text-sm text-muted-foreground">카드 정보를 수정하려면 아래 양식을 작성하세요.</p>
              </div>
              <EditCardForm
                card={card}
                onSuccess={handleCardUpdated}
                onCancel={onClose}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p>카드를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 