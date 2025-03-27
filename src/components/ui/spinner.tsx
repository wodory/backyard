/**
 * 파일명: src/components/ui/spinner.tsx
 * 목적: 로딩 상태를 표시하는 스피너 컴포넌트 제공
 * 역할: 비동기 작업 중에 사용자에게 로딩 상태를 표시
 * 작성일: 2024-03-26
 */

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Spinner: 로딩 상태를 표시하는 스피너 컴포넌트
 * @param size 스피너 크기 (sm, md, lg)
 * @param className 추가 CSS 클래스
 * @returns {JSX.Element} 스피너 컴포넌트
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      aria-label="로딩 중"
      role="status"
    />
  );
} 