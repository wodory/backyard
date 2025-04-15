/**
 * 파일명: src/app/cards/page.tsx
 * 목적: 카드 목록을 표시하고 필터링 기능 제공
 * 역할: 카드 목록 페이지의 레이아웃과 컴포넌트 구성
 * 작성일: 2025-03-05
 * 수정일: 2025-04-08
 */

import { Suspense } from 'react';

import Link from "next/link";

import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

import CardList from "@/components/cards/CardList";
import CreateCardModal from "@/components/cards/CreateCardModal";
import { TagFilter } from "@/components/cards/TagFilter";
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
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            {/* <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Link href="/" className="hover:underline">홈</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>카드 목록</span>
            </div> */}
            <h1 className="text-3xl font-bold">카드 목록</h1>
          </div>
          <CreateCardModal />
        </div>
        <p className="text-muted-foreground">
          카드를 생성하고 관리할 수 있습니다. 태그를 사용하여 카드를 필터링할 수 있습니다.
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 사이드바 - 태그 필터 */}
        <div className="lg:col-span-1">
          <TagFilter />
        </div>

        {/* 카드 목록 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<CardListSkeleton />}>
            <CardList />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 