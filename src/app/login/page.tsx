/**
 * 파일명: src/app/login/page.tsx
 * 목적: 로그인 페이지 제공
 * 역할: 사용자 로그인 UI 렌더링
 * 작성일: 2025-03-08
 * 수정일: 2025-03-27
 * 수정일: 2024-05-29 : 이미지 표시 방식 변경 (object-cover)
 * 수정일: 2024-05-30 : 이미지 캐싱 및 애니메이션 효과 추가 (지연 없는 동시 로딩)
 * 수정일: 2025-05-30 : LoginForm을 Suspense로 감싸서 useSearchParams 오류 해결
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';

import Image from 'next/image';

import LoginForm from '@/components/login/loginForm';
import { Skeleton } from '@/components/ui/skeleton';

// 배경 이미지 배열 (v0 디자인에서 가져온 이미지)
const backgroundImages = [
  '/images/blockchain-cubes.png',
  '/images/fiber-optic-lights.png',
  '/images/lightbulb-blue.png',
  '/images/lightbulb-hands.png',
  '/images/lightbulb-sunset.png',
  '/images/network-visualization.png',
];

/**
 * getCachedImagePath: 캐시된 이미지 경로 반환 또는 새 이미지 캐싱
 * @returns {string} 이미지 경로
 */
const getCachedImagePath = () => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') return null;

  // 캐시에서 이미지 경로 가져오기
  const cachedImage = localStorage.getItem('loginBackgroundImage');

  if (cachedImage && backgroundImages.includes(cachedImage)) {
    return cachedImage;
  }

  // 새 랜덤 이미지 선택 및 캐싱
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  const newImagePath = backgroundImages[randomIndex];
  localStorage.setItem('loginBackgroundImage', newImagePath);
  return newImagePath;
};

// 로그인 폼 로딩 상태를 위한 스켈레톤 컴포넌트
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md p-6 md:p-12 space-y-6">
      <div className="mb-4 text-center">
        <Skeleton className="h-8 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
        <Skeleton className="h-4 w-full mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  // 이미지 상태 관리
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 이미지 경로 설정
    const imageToLoad = getCachedImagePath();
    if (imageToLoad) {
      setImagePath(imageToLoad);
    }
  }, []);

  // 이미지 로드 완료 핸들러
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* 왼쪽 이미지 섹션 */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100 relative">
        <div className="absolute inset-0">
          {imagePath && (
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <Image
                src={imagePath}
                alt="Login background"
                className="object-cover"
                loading="lazy"
                fill
                sizes="50vw"
                onLoad={handleImageLoad}
              />
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
} 