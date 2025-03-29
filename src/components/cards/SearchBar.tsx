/**
 * 파일명: SearchBar.tsx
 * 목적: 카드 검색 기능 제공
 * 역할: 카드 검색 및 태그 검색 인터페이스 제공
 * 작성일: 2024-03-30
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Hash, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ 
  className, 
  placeholder = "검색어 입력 또는 #태그 입력" 
}: SearchBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isTagMode, setIsTagMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 로컬 스토리지에서 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5)); // 최대 5개까지만 표시
        }
      } catch {
        // 파싱 오류 시 무시
      }
    }
  }, []);
  
  // URL에서 검색어 가져오기
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag');
    
    if (tag) {
      setSearchTerm(`#${tag}`);
      setIsTagMode(true);
    } else {
      setSearchTerm(q);
      setIsTagMode(q.startsWith('#'));
    }
  }, [searchParams]);
  
  // 최근 검색어 저장
  const saveRecentSearch = useCallback((term: string) => {
    if (!term || term.length < 2) return; // 너무 짧은 검색어는 저장하지 않음
    
    const newSearches = [
      term, 
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 5);
    
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  }, [recentSearches]);
  
  // 검색 실행
  const handleSearch = useCallback(() => {
    // 태그 검색과 일반 검색 분리
    // #으로 시작하는 검색어는 태그 검색으로 처리
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.slice(1).trim(); // # 제거
      if (tag) {
        saveRecentSearch(searchTerm);
        router.push(`/cards?tag=${encodeURIComponent(tag)}`);
      }
    } else if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      router.push(`/cards?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/cards');
    }
  }, [searchTerm, router, saveRecentSearch]);
  
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 검색어 초기화
  const clearSearch = () => {
    setSearchTerm('');
    setIsTagMode(false);
    router.push('/cards');
  };
  
  // 검색어 입력 처리
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // #으로 시작하면 태그 모드로 전환
    if (value.startsWith('#') && !isTagMode) {
      setIsTagMode(true);
    } else if (!value.startsWith('#') && isTagMode) {
      setIsTagMode(false);
    }
  };
  
  // 태그 모드 토글
  const toggleTagMode = () => {
    if (isTagMode) {
      // 태그 모드 해제
      setIsTagMode(false);
      setSearchTerm(searchTerm.startsWith('#') ? searchTerm.slice(1) : searchTerm);
    } else {
      // 태그 모드 활성화
      setIsTagMode(true);
      setSearchTerm(searchTerm.startsWith('#') ? searchTerm : `#${searchTerm}`);
    }
    
    // 포커스 설정
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={isTagMode ? "태그명 입력 (#없이 입력)" : placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "pr-8",
              isTagMode && "pl-7 bg-primary/5"
            )}
          />
          {isTagMode && (
            <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary">
              #
            </div>
          )}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isTagMode ? "default" : "outline"} 
                size="icon" 
                onClick={toggleTagMode}
                className="flex-shrink-0"
              >
                <Hash size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isTagMode ? "일반 검색으로 전환" : "태그 검색으로 전환"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button onClick={handleSearch} variant="default" className="flex-shrink-0">
          <Search size={18} className="mr-2" />
          검색
        </Button>
      </div>
      
      {/* 최근 검색어 표시 */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>최근 검색:</span>
          <div className="flex flex-wrap gap-1">
            {recentSearches.map((term, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary text-xs py-0"
                onClick={() => {
                  setSearchTerm(term);
                  setIsTagMode(term.startsWith('#'));
                  
                  // 즉시 검색 수행
                  if (term.startsWith('#')) {
                    const tag = term.slice(1);
                    router.push(`/cards?tag=${encodeURIComponent(tag)}`);
                  } else {
                    router.push(`/cards?q=${encodeURIComponent(term)}`);
                  }
                }}
              >
                {term}
              </Badge>
            ))}
            <button 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem('recentSearches');
              }}
            >
              지우기
            </button>
          </div>
        </div>
      )}
      
      {isTagMode && (
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <AlertCircle size={12} />
          <span>태그 검색 모드: 태그명만 입력하세요 (#은 자동으로 추가됩니다)</span>
        </div>
      )}
    </div>
  );
}; 