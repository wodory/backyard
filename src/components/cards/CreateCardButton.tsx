"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X } from "lucide-react";
import TiptapEditor from "@/components/editor/TiptapEditor";

// 생성한 테스트 사용자 ID
const TEST_USER_ID = "ab2473c2-21b5-4196-9562-3b720d80d77f";

// 컴포넌트에 props 타입 정의
interface CreateCardButtonProps {
  onCardCreated?: (cardData: any) => void;
}

export default function CreateCardButton({ onCardCreated }: CreateCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isComposing = useRef(false);

  // 태그 추가 처리
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME 조합 중인 경우 처리하지 않음
    if (isComposing.current) {
      return;
    }
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      // 현재 입력된 태그가 비어있는 경우 처리하지 않음
      if (!tagInput.trim()) {
        return;
      }
      
      // 쉼표로 구분된 여러 태그 처리
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));
      
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
        setTagInput('');
      }
    }
  };
  
  // IME 조합 시작 핸들러
  const handleCompositionStart = () => {
    isComposing.current = true;
  };
  
  // IME 조합 종료 핸들러
  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title, 
          content,
          userId: TEST_USER_ID, // 사용자 ID 추가
          tags: tags // 태그 배열 추가
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 생성에 실패했습니다.");
      }
      
      const createdCard = await response.json();
      
      toast.success("카드가 생성되었습니다.");
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setOpen(false);
      
      // 콜백이 제공된 경우 실행
      if (onCardCreated) {
        onCardCreated(createdCard);
      } else {
        // 페이지 새로고침 (콜백이 없는 경우에만)
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error(error instanceof Error ? error.message : "카드 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 태그 입력 중 쉼표가 입력되면 태그 추가 처리
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 쉼표가 포함된 경우 태그 추가 처리
    if (value.includes(',')) {
      const parts = value.split(',');
      const lastPart = parts.pop() || '';
      
      // 새로운 태그들 추가 (마지막 부분 제외)
      const newTags = parts
        .map(part => part.trim())
        .filter(part => part && !tags.includes(part));
        
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      
      // 쉼표 이후 부분만 입력창에 남김
      setTagInput(lastPart);
    } else {
      setTagInput(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>새 카드 만들기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 카드 만들기</DialogTitle>
          <DialogDescription>
            새로운 카드를 생성하려면 아래 양식을 작성하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="카드 제목을 입력하세요"
              disabled={isSubmitting}
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
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">닫기</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "생성하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 