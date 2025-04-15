/**
 * 파일명: src/app/cards/[id]/edit/page.tsx
 * 목적: 카드 편집 페이지
 * 역할: 기존 카드 데이터를 불러와 편집할 수 있는 UI 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-05-17 : any 타입을 구체적인 타입으로 변경
 */

'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import EditCardForm from '@/components/cards/EditCardForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// 카드 데이터 인터페이스 정의
interface CardData {
  id: string;
  title: string;
  content: string;
  cardTags?: { id: string; tag: { id: string; name: string } }[];
  [key: string]: unknown;
}

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cards/${params.id}`);

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

    if (params.id) {
      fetchCard();
    }
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <h1 className="text-2xl font-bold mb-6">카드 수정</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p>로딩 중...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={handleBack}>
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : card ? (
        <EditCardForm
          card={card}
          onSuccess={() => {
            // 성공 시 보드 페이지로 이동
            router.push('/board');
          }}
        />
      ) : null}
    </div>
  );
} 