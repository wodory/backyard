/**
 * 파일명: TagFilter.tsx
 * 목적: 카드 목록에서 태그 기반 필터링 제공
 * 역할: 선택 가능한 태그 목록을 표시하고 태그 필터링 기능 제공
 * 작성일: 2025-03-27
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw fetchTags
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Loader2, Tags, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTags } from '@/hooks/useTags';
import { Tag } from '@/services/tagService';

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // React Query 훅을 사용하여 태그 목록 가져오기
  const { data: tags = [], isLoading, error } = useTags();

  // URL에서 현재 선택된 태그 가져오기
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    setSelectedTag(tagParam);
  }, [searchParams]);

  // 태그 클릭 핸들러
  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      // 이미 선택된 태그를 다시 클릭하면 필터 해제
      router.push('/cards');
      setSelectedTag(null);
    } else {
      // 새 태그 선택
      router.push(`/cards?tag=${encodeURIComponent(tagName)}`);
      setSelectedTag(tagName);
    }
  };

  // 에러 처리
  if (error) {
    toast.error('태그 목록을 불러오는데 실패했습니다');
  }

  return (
    <div className="mb-4 border rounded-md">
      <div
        className="p-3 flex justify-between items-center cursor-pointer bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium flex items-center">
          <Tags size={16} className="mr-2" />
          태그 필터
        </h3>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {expanded && (
        <div className="p-3">
          {isLoading ? (
            <div className="flex justify-center p-2">
              <Loader2 className="animate-spin" size={18} />
            </div>
          ) : (!tags || tags.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              태그가 없습니다
            </p>
          ) : (
            <>
              {selectedTag && (
                <div className="mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleTagClick(selectedTag)}
                  >
                    필터 초기화
                  </Button>
                </div>
              )}
              <ScrollArea className="h-[180px] pr-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTag === tag.name ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-muted transition-colors",
                        selectedTag === tag.name && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleTagClick(tag.name)}
                    >
                      #{tag.name}
                      <span className="ml-1 opacity-70">({tag.count || 0})</span>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
} 