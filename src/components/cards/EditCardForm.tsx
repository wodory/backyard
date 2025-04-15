"use client";

import React, { useState, useRef, useEffect } from "react";

import { Card } from '@prisma/client';
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

import TiptapEditor from "@/components/editor/TiptapEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_USER_ID } from "@/lib/constants";


// 컴포넌트 props 타입 정의
interface EditCardFormProps {
  card: any; // 카드 데이터
  onSuccess?: (updatedCard?: any) => void; // 수정 성공 시 호출할 콜백
  onCancel?: () => void; // 취소 버튼 클릭 시 호출할 콜백
}

// EditCardForm 컴포넌트
export default function EditCardForm({ card, onSuccess, onCancel }: EditCardFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setContent(card.content || '');
      // CardTag에서 태그 이름을 추출
      if (card.cardTags && Array.isArray(card.cardTags)) {
        const tagNames = card.cardTags.map((cardTag: any) => cardTag.tag.name);
        setTags(tagNames);
      }
    }
  }, [card]);

  // 입력 조합(IME) 시작 핸들러
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 입력 조합(IME) 종료 핸들러
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // 태그 입력 변경 핸들러
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    // 쉼표가 포함되어 있으면 태그 추가
    if (value.includes(',') && !isComposing) {
      const newTag = value.replace(',', '').trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  // 태그 추가 핸들러 (Enter 키)
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  // 태그 삭제 핸들러
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API 호출로 카드 업데이트
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '카드 수정 중 오류가 발생했습니다.');
      }
      
      const updatedCard = await response.json();
      
      toast.success('카드가 성공적으로 수정되었습니다.');
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess(updatedCard);
      }
    } catch (error) {
      console.error('카드 수정 오류:', error);
      toast.error('카드 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카드 수정 폼 렌더링
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="카드 제목을 입력하세요"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="카드 내용을 입력하세요"
          showToolbar={false}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">태그</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleAddTag}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="태그 입력 후 Enter 또는 쉼표(,)로 구분"
          disabled={isSubmitting}
        />
        
        {/* 태그 목록 */}
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-xs hover:text-destructive"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          닫기
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '수정 중...' : '수정하기'}
        </Button>
      </div>
    </form>
  );
} 