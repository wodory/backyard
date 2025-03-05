"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TiptapEditor from "@/components/editor/TiptapEditor";
import TiptapViewer from "@/components/editor/TiptapViewer";
import { Pencil, Check, X } from "lucide-react";

interface EditCardContentProps {
  cardId: string;
  initialContent: string;
}

export default function EditCardContent({ cardId, initialContent }: EditCardContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (content === initialContent) {
      setIsEditing(false);
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "내용 수정에 실패했습니다.");
      }

      toast.success("내용이 수정되었습니다.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating card content:", error);
      toast.error(error instanceof Error ? error.message : "내용 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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