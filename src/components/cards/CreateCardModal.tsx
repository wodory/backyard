"use client";

import React, { useState, useRef, useEffect } from "react";

import { XYPosition } from "@xyflow/react";
import { X, Loader2 } from "lucide-react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import TiptapEditor from "@/components/editor/TiptapEditor";
import { Badge } from "@/components/ui/badge";
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
import { DEFAULT_USER_ID } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { CreateCardInput, Card } from "@/types/card";


// 컴포넌트에 props 타입 정의
interface CreateCardModalProps {
  onCardCreated?: (cardData: Card) => void;
  autoOpen?: boolean; // 자동으로 모달을 열지 여부
  onClose?: () => void; // 모달이 닫힐 때 콜백
  customTrigger?: React.ReactNode; // 커스텀 트리거 버튼
  position?: XYPosition;
  connectingNodeId?: string;
  handleType?: 'source' | 'target';
}

export default function CreateCardModal({
  onCardCreated,
  autoOpen = false,
  onClose,
  customTrigger,
  position,
  connectingNodeId,
  handleType,
}: CreateCardModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [firstUserId, setFirstUserId] = useState<string>("");
  const isComposing = useRef(false);

  // useAppStore 훅 사용
  const { createCard, isLoading } = useAppStore();

  // 자동으로 모달 열기
  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  // 모달 상태 변경 처리 핸들러
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);

    // 모달이 닫힐 때 onClose 콜백 호출
    if (!newOpenState && onClose) {
      onClose();
    }
  };

  // 사용자 ID 가져오기
  useEffect(() => {
    async function fetchFirstUserId() {
      try {
        const response = await fetch('/api/users/first');
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setFirstUserId(data.id);
            console.log('사용자 ID 가져옴:', data.id);
          } else {
            console.error('사용자 ID를 가져오지 못함');
          }
        } else {
          console.error('사용자 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('사용자 ID 가져오기 오류:', error);
      }
    }

    fetchFirstUserId();
  }, []);

  // 태그 추가 처리
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME 조합 중인 경우 처리하지 않음
    if (isComposing.current) {
      return;
    }

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      // 현재 입력된 태그가 비어있는 경우 처리하지 않음
      const trimmedTag = tagInput.trim();
      if (!trimmedTag) {
        return;
      }

      // 쉼표로 구분된 여러 태그 처리
      const newTags = trimmedTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));

      if (newTags.length > 0) {
        setTags(prevTags => [...prevTags, ...newTags]);
        setTagInput('');
      } else {
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
      return;
    }

    // 사용자 ID 확인
    const userId = firstUserId || DEFAULT_USER_ID;
    if (!userId) {
      return;
    }

    const cardInput: CreateCardInput = {
      title: title.trim(),
      content: content,
      userId: userId,
      tags: tags,
    };

    const createdCard = await createCard(cardInput);

    if (createdCard) {
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setOpen(false);

      // 콜백이 제공된 경우 실행
      if (onCardCreated) {
        onCardCreated(createdCard);
      }
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
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));

      if (newTags.length > 0) {
        setTags(prevTags => [...prevTags, ...newTags]);
      }

      // 마지막 부분을 입력란에 설정
      setTagInput(lastPart);
    } else {
      setTagInput(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {customTrigger || (
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            새 카드 만들기
          </Button>
        )}
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <TiptapEditor
              id="content"
              content={content}
              onChange={setContent}
              placeholder="카드 내용을 입력하세요..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-destructive"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleAddTag}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="태그 입력 후 Enter 또는 쉼표(,)로 구분"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "카드 생성"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 