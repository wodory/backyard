/**
 * 파일명: src/app/login/page.tsx
 * 목적: 로그인 페이지 제공
 * 역할: 사용자 로그인 UI 렌더링
 * 작성일: 2025-03-08
 * 수정일: 2025-03-27
 * 수정일: 2024-05-29 : 이미지 표시 방식 변경 (object-cover)
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

export default function LoginPage() {
  // 랜덤 이미지 선택
  const [currentImage, setCurrentImage] = useState(backgroundImages[0]);

  useEffect(() => {
    // 페이지 로드 시 랜덤 이미지 선택
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setCurrentImage(backgroundImages[randomIndex]);

    // 일정 시간마다 이미지 변경 (선택 사항)
    // const interval = setInterval(() => {
    //   const newRandomIndex = Math.floor(Math.random() * backgroundImages.length);
    //   setCurrentImage(backgroundImages[newRandomIndex]);
    // }, 10000); // 10초마다 변경

    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* 왼쪽 이미지 섹션 */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100 relative">
        <div className="absolute inset-0">
          <Image
            src={currentImage}
            alt="Login background"
            className="object-cover"
            priority
            fill
            sizes="50vw"
          />
          {/* 블러 효과 및 오버레이 제거됨 */}
        </div>
      </div>

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
} 