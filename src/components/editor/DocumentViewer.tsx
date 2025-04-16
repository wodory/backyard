'use client';

import React, { useMemo, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import TiptapViewer from './TiptapViewer';

// 카드 타입 정의
interface CardData {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  cardTags?: Array<{ id: string; tag: { id: string; name: string } }>;
}

// 컴포넌트 props 인터페이스 단순화
interface DocumentViewerProps {
  cards: CardData[];
  isMultiSelection: boolean;
  loading: boolean;
}

export default function DocumentViewer({
  cards,
  isMultiSelection,
  loading
}: DocumentViewerProps) {
  // 디버깅용 로그 추가
  useEffect(() => {
    // 카드 내용이 변경되면 로그 출력
    if (cards && cards.length > 0) {
      console.log('DocumentViewer 카드 업데이트됨:', {
        카드수: cards.length,
        첫번째카드: cards[0]?.id,
        내용길이: cards[0]?.content?.length || 0,
        다중선택: isMultiSelection
      });
    }
  }, [cards, isMultiSelection]);

  // 데이터 가공 로직을 컴포넌트 내부로 이동
  const { content, tags } = useMemo(() => {
    if (!cards || cards.length === 0) {
      return { title: '', content: '', date: null, tags: [] };
    }

    // 단일 카드 선택 모드
    if (!isMultiSelection || cards.length === 1) {
      const card = cards[0];
      return {
        title: card.title || '',
        content: card.content || '',
        date: card.createdAt || null,
        tags: card.cardTags ? card.cardTags.map(ct => ct.tag.name) : []
      };
    }

    // 다중 카드 선택 모드 - 여기서 병합 로직 처리
    const multiTitle = cards.map(card => card.title).join(', ');
    // 카드 내용을 HTML로 병합
    const multiContent = cards.map(card => {
      return card.content;
    }).join('');

    return {
      title: multiTitle,
      content: multiContent,
      date: null,
      tags: []
    };
  }, [cards, isMultiSelection]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>선택된 카드가 없습니다</p>
      </div>
    );
  }

  // 콘텐츠가 비어있는지 확인 (빈 HTML 태그만 있는 경우도 고려)
  const contentIsEmpty = !content || content.trim() === '' || content.trim() === '<p></p>';

  return (
    <div className="p-6 max-w-full">
      {/* <h1 className="text-2xl font-bold mb-2 break-words">{title}</h1> */}

      {/* {!isMultiSelection && date && (
        <div className="text-sm text-gray-500 mb-4">
          {formatDate(date)}
        </div>
      )} */}


      {contentIsEmpty ? (
        <div className="text-gray-400 italic">내용이 없습니다.</div>
      ) : isMultiSelection ? (
        // 다중 선택 시에도 TiptapViewer 사용하도록 변경
        <div className="prose prose-sm max-w-full">
          <TiptapViewer key={"multi-" + cards.map(c => c.id).join("-")} content={content} />
        </div>
      ) : (
        // 단일 선택 시 TiptapViewer 사용
        <div className="prose prose-sm max-w-full">
          <TiptapViewer key={cards[0]?.id} content={content} />
        </div>
      )}

      {!isMultiSelection && tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
} 