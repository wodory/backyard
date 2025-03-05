'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  // URL에서 검색어 가져오기
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
  }, [searchParams]);
  
  // 검색 실행
  const handleSearch = () => {
    // 태그 검색과 일반 검색 분리
    // #으로 시작하는 검색어는 태그 검색으로 처리
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.slice(1); // # 제거
      if (tag) {
        router.push(`/cards?tag=${encodeURIComponent(tag)}`);
      }
    } else if (searchTerm) {
      router.push(`/cards?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/cards');
    }
  };
  
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 검색어 초기화
  const clearSearch = () => {
    setSearchTerm('');
    router.push('/cards');
  };
  
  return (
    <div className="w-full flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="검색어 입력 또는 #태그 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-8"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} variant="default">
        <Search size={18} className="mr-2" />
        검색
      </Button>
    </div>
  );
}; 