'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import EditCardForm from '@/components/cards/EditCardForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<any>(null);
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