/**
 * 파일명: src/app/login/page.tsx
 * 목적: 로그인 페이지 제공
 * 역할: 사용자 로그인 UI 렌더링
 * 작성일: 2025-03-08
 * 수정일: 2025-03-27
 * 수정일: 2024-05-29 : 이미지 표시 방식 변경 (object-cover)
 * 수정일: 2024-05-30 : 이미지 캐싱 및 애니메이션 효과 추가 (지연 없는 동시 로딩)
 */

'use client';

import React, { useEffect, useState } from 'react';
import LoginForm from '@/components/login/loginForm';
import Image from 'next/image';

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
        <LoginForm />
      </div>
    </div>
  );
} 