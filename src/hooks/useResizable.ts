import { useState, useEffect, useRef } from 'react';

interface UseResizableProps {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange?: (width: number) => void;
  storageKey?: string;
}

export function useResizable({
  initialWidth = 320,
  minWidth = 240,
  maxWidth = 480,
  onWidthChange,
  storageKey
}: UseResizableProps) {
  // 로컬 스토리지에서 저장된 너비 가져오기
  const getStoredWidth = () => {
    if (typeof window === 'undefined' || !storageKey) return initialWidth;
    
    const storedWidth = localStorage.getItem(storageKey);
    if (storedWidth) {
      const parsed = parseInt(storedWidth, 10);
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        return parsed;
      }
    }
    return initialWidth;
  };

  const [width, setWidth] = useState<number>(getStoredWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, width.toString());
    }
    
    onWidthChange?.(width);
  }, [width, storageKey, onWidthChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // 마우스 위치와 요소의 위치에 따라 너비 계산
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // 마우스 이벤트 리스너 등록
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return {
    width,
    isDragging,
    startResize,
    dragHandleRef,
    setWidth
  };
} 