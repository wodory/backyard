import { Metadata } from "next";
import { Suspense } from 'react';
import CardList from "../../components/cards/CardList";
import CreateCardButton from "../../components/cards/CreateCardButton";
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: "카드 목록 | Backyard",
  description: "백야드 카드 목록 페이지입니다.",
};

// 카드 목록 로딩 스켈레톤
function CardListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="border rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-24" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CardsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">카드 목록</h1>
        <CreateCardButton />
      </div>
      
      <Suspense fallback={<CardListSkeleton />}>
        <CardList />
      </Suspense>
    </div>
  );
} 