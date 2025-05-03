/**
 * 파일명: src/components/IdeaMap.tsx
 * 목적: 카드 데이터 업데이트 유틸리티 함수 제공
 * 역할: 아이디어맵 내 카드 노드 데이터 갱신 로직
 * 작성일: 2024-05-07
 */

import { Node } from '@xyflow/react';

import { CardData } from '@/components/ideamap/types/ideamap-types';

/**
 * updateCardNodes: 기존 노드 배열에서 특정 카드 데이터를 업데이트한 새 노드 배열 반환
 * @param {Node<CardData>[]} prevNodes - 업데이트할 노드 배열
 * @param {CardData} cardData - 업데이트할 카드 데이터
 * @returns {Node<CardData>[]} 업데이트된 노드 배열
 */
export const updateCardNodes = (prevNodes: Node<CardData>[], cardData: CardData): Node<CardData>[] => {
    return prevNodes.map((node) => {
        if (node.id === cardData.id) {
            return {
                ...node,
                data: {
                    ...node.data,
                    title: cardData.title,
                    content: cardData.content ?? '',
                },
            };
        }
        return node;
    });
}; 