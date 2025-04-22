"use client";

import React, { useState, useEffect } from "react";

import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import TiptapEditor from "@/components/editor/TiptapEditor";
import TiptapViewer from "@/components/editor/TiptapViewer";
import { Button } from "@/components/ui/button";
import { useUpdateCard } from "@/hooks/useUpdateCard";


interface EditCardContentProps {
  cardId: string;
  initialContent: string;
}

export default function EditCardContent({ cardId, initialContent }: EditCardContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);

  // useUpdateCard 훅 사용
  const updateCardMutation = useUpdateCard();
  const { mutate: updateCard } = updateCardMutation;
  const isSubmitting = updateCardMutation.isPending;
  const { isSuccess, error } = updateCardMutation;

  // 업데이트 성공 시 편집 모드 종료
  useEffect(() => {
    if (isSuccess) {
      setIsEditing(false);
    }
  }, [isSuccess]);

  const handleSubmit = async () => {
    if (content === initialContent) {
      setIsEditing(false);
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    updateCard(
      {
        id: cardId,
        patch: { content }
      },
      {
        onSuccess: () => {
          toast.success("내용이 수정되었습니다.");
        },
        onError: (error) => {
          console.error("Error updating card content:", error);
          toast.error(error instanceof Error ? error.message : "내용 수정에 실패했습니다.");
        }
      }
    );
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="카드 내용을 입력하세요..."
        />
        {error && (
          <p className="text-sm text-red-500">
            오류: {error.message || '내용 수정에 실패했습니다.'}
          </p>
        )}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            취소
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative mt-6 prose prose-stone dark:prose-invert">
      <TiptapViewer content={initialContent} />
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        편집
      </Button>
    </div>
  );
} 