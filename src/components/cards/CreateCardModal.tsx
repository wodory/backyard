/**
 * 파일명: ./src/components/cards/CreateCardModal.tsx
 * 목적: 새로운 카드 생성을 위한 모달 컴포넌트
 * 역할: 카드 작성 양식을 제공하고 카드 생성 기능 수행
 * 작성일: 2025-03-05
 * 수정일: 2025-04-25 : lint 오류 수정 - 사용되지 않는 import 및 변수 제거
 * 수정일: 2025-04-21 : DEFAULT_USER_ID 상수 대신 useAuthStore를 사용하도록 수정
 * 수정일: 2025-04-21 : 카드 생성 시 projectId 추가
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

import { X, Loader2, PlusCircle } from "lucide-react";

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
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateCard } from "@/hooks/useCreateCard";
import { CreateCardInput, Card } from "@/types/card";

// 프로젝트 인터페이스 정의
interface Project {
  id: string;
  name: string;
}

// 컴포넌트에 props 타입 정의
interface CreateCardModalProps {
  onCardCreated?: (cardData: Card) => void;
  autoOpen?: boolean; // 자동으로 모달을 열지 여부
  onClose?: () => void; // 모달이 닫힐 때 콜백
  customTrigger?: React.ReactNode; // 커스텀 트리거 버튼
}

export default function CreateCardModal({
  onCardCreated,
  autoOpen = false,
  onClose,
  customTrigger,
}: CreateCardModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const isComposing = useRef(false);

  // 프로젝트 관련 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // useAuthStore에서 사용자 ID 가져오기
  const userId = useAuthStore((state) => state.profile?.id);

  // useCreateCard 훅 사용
  const createCardMutation = useCreateCard();
  const { mutate: createCard } = createCardMutation;
  const isLoading = createCardMutation.isPending;
  const { isSuccess, error } = createCardMutation;

  // 컴포넌트 마운트 시 프로젝트 목록 가져오기
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsProjectLoading(true);
        setProjectError(null);

        const response = await fetch('/api/projects');

        if (!response.ok) {
          throw new Error('프로젝트를 불러오는데 실패했습니다.');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          // TODO : 반드시 리펙토링을 통해 현재 로드중인 프로젝트 ID로 변경해야 함. 
          // 지금은 테스트 중이므로 첫 번째 프로젝트를 기본값으로 설정'
          const currentProjectId = data[0].id;
          setSelectedProjectId(currentProjectId);
        } else {
          setProjectError('사용 가능한 프로젝트가 없습니다.');
        }
      } catch (err) {
        console.error('프로젝트 목록 조회 오류:', err);
        setProjectError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setIsProjectLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // 자동으로 모달 열기
  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  // isSuccess 상태를 감지하여 모달 닫기
  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setOpen(false);
    }
  }, [isSuccess]);

  // 모달 상태 변경 처리 핸들러
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);

    // 모달이 닫힐 때 onClose 콜백 호출
    if (!newOpenState && onClose) {
      onClose();
    }
  };

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

    // 사용자가 로그인되어 있지 않은 경우 처리
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 프로젝트가 선택되지 않은 경우 처리
    if (!selectedProjectId) {
      alert('프로젝트를 선택해야 합니다.');
      return;
    }

    const cardInput: CreateCardInput = {
      title: title.trim(),
      content: content,
      userId: userId,
      projectId: selectedProjectId,
      tags: tags,
    };

    createCard(cardInput, {
      onSuccess: (createdCards) => {
        // 콜백이 제공된 경우 실행
        if (onCardCreated && createdCards.length > 0) {
          onCardCreated(createdCards[0]);
        }
      }
    });
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
          {error && (
            <p className="text-sm text-red-500 mt-2">
              오류: {error.message || '카드 생성 중 오류가 발생했습니다.'}
            </p>
          )}
          {projectError && (
            <p className="text-sm text-red-500 mt-2">
              오류: {projectError}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="카드 제목을 입력하세요"
              disabled={isLoading || isProjectLoading}
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
              disabled={isLoading || isProjectLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading || isProjectLoading}>
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || isProjectLoading || !selectedProjectId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : isProjectLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  프로젝트 로딩 중...
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