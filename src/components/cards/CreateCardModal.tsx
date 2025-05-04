/**
 * 파일명: ./src/components/cards/CreateCardModal.tsx
 * 목적: 새로운 카드 생성을 위한 모달 컴포넌트
 * 역할: 카드 작성 양식을 제공하고 카드 생성 기능 수행
 * 작성일: 2025-03-05
 * 수정일: 2025-04-25 : lint 오류 수정 - 사용되지 않는 import 및 변수 제거
 * 수정일: 2025-04-21 : DEFAULT_USER_ID 상수 대신 useAuthStore를 사용하도록 수정
 * 수정일: 2025-04-21 : 카드 생성 시 projectId 추가
 * 수정일: 2025-04-29 : 직접 프로젝트 로딩 로직 제거 및 useAppStore에서 projects 및 activeProjectId 사용
 * 수정일: 2025-04-21 : 카드 생성 시 아이디어맵에 노드 배치 기능 추가 (의존성 주입 패턴 적용)
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

import { X, Loader2, PlusCircle } from "lucide-react";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { useIdeaMapStore } from "@/store/useIdeaMapStore";
import { useCreateCard } from "@/hooks/useCreateCard";
import { CreateCardInput, Card } from "@/types/card";

// 프로젝트 인터페이스 정의 - AppStore에서 이미 Project 타입이 제공됨
// interface Project {
//   id: string;
//   name: string;
// }

// 컴포넌트에 props 타입 정의
interface CreateCardModalProps {
  onCardCreated?: (cardData: Card) => void;
  autoOpen?: boolean; // 자동으로 모달을 열지 여부
  onClose?: () => void; // 모달이 닫힐 때 콜백
  customTrigger?: React.ReactNode; // 커스텀 트리거 버튼
  placeNodeOnMap?: boolean; // 카드 생성 후 아이디어맵에 노드를 배치할지 여부
}

export default function CreateCardModal({
  onCardCreated,
  autoOpen = false,
  onClose,
  customTrigger,
  placeNodeOnMap = false, // 기본값은 false
}: CreateCardModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const isComposing = useRef(false);

  // AppStore에서 프로젝트 관련 상태 직접 가져오기
  const projects = useAppStore(state => state.projects);
  const activeProjectId = useAppStore(state => state.activeProjectId);
  const isAppLoading = useAppStore(state => state.isLoading);

  // IdeaMapStore에서 노드 배치 액션 가져오기
  const requestNodePlacement = useIdeaMapStore(state => state.requestNodePlacementForCard);

  // 프로젝트 관련 상태 - 선택된 프로젝트 ID는 activeProjectId를 기본값으로 사용
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // useAuthStore에서 사용자 ID 가져오기
  const userId = useAuthStore((state) => state.profile?.id);

  // useCreateCard 훅 사용 (옵션 객체 전달)
  const { mutate: createCard, isPending: isLoading, isSuccess, error } = useCreateCard({
    // placeNodeOnMap prop 값에 따라 콜백 주입 결정
    onPlaceNodeRequest: placeNodeOnMap ? (cardId, projectId) => {
      console.log('[CreateCardModal] Requesting node placement for card:', { cardId, projectId, placeNodeOnMap });
      // 생성된 카드를 찾아 중앙에 노드로 추가
      requestNodePlacement(cardId, projectId);
    } : undefined,
    // 이 컴포넌트 특화 성공 로직 (모달 닫기, 폼 리셋, 토스트 알림)
    onSuccess: (newCards) => {
      const newCard = Array.isArray(newCards) ? newCards[0] : newCards;
      toast.success('카드가 성공적으로 생성되었습니다.');

      // 콜백이 제공된 경우 실행
      if (onCardCreated && newCard) {
        onCardCreated(newCard);
      }

      // 폼 리셋 및 모달 닫기는 useEffect에서 처리됨
    },
    onError: (err) => {
      console.error('카드 생성 오류 (Modal):', err);
      toast.error(err.message || '카드 생성에 실패했습니다.');
    }
  });

  // 컴포넌트 마운트 시 activeProjectId 설정
  useEffect(() => {
    if (activeProjectId) {
      setSelectedProjectId(activeProjectId);
    } else if (projects.length > 0) {
      // 혹시 activeProjectId가 없지만 projects는 있는 경우 첫 번째 프로젝트 사용
      setSelectedProjectId(projects[0].id);
    }
  }, [activeProjectId, projects]);

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

    // createCard 호출 시 필요한 형태로 데이터 전달
    createCard({ cardData: cardInput });
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

  // 로딩 중이거나 에러가 있는 경우의 버튼 상태
  const isButtonDisabled = !selectedProjectId || !title.trim() || !content.trim() || isLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {customTrigger || (
          <Button variant="secondary" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            새 카드 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>새 카드 작성</DialogTitle>
          <DialogDescription>
            아이디어맵에 추가할 새 카드의 내용을 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="카드 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">프로젝트</Label>
            <select
              id="project"
              className="w-full p-2 border rounded-md"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={isAppLoading || projects.length === 0}
            >
              {isAppLoading ? (
                <option>로딩 중...</option>
              ) : projects.length === 0 ? (
                <option>사용 가능한 프로젝트가 없습니다.</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <div className="min-h-[150px] border rounded-md overflow-hidden">
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="카드 내용을 입력하세요..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="py-1">
                  {tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="태그 입력 후 Enter 또는 쉼표로 구분 (선택사항)"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleAddTag}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button type="submit" disabled={isButtonDisabled}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              오류 발생: {error.message || "카드 저장 중 문제가 발생했습니다."}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
} 