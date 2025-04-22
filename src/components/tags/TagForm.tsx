"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTag } from "@/hooks/useCreateTag";

/**
 * TagForm: 새로운 태그를 생성하는 폼 컴포넌트
 */
export default function TagForm() {
  const [tagName, setTagName] = useState("");

  // useCreateTag 훅을 사용하여 태그 생성 mutation 사용
  const { mutate: createTag, isPending, isError, error } = useCreateTag();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagName.trim()) {
      toast.error("태그 이름을 입력해주세요.");
      return;
    }

    // 훅의 mutate 함수를 사용하여 태그 생성
    createTag(
      { name: tagName.trim() },
      {
        onSuccess: () => {
          toast.success("태그가 생성되었습니다.");
          setTagName(""); // 입력 필드 초기화
        },
        onError: (error) => {
          console.error("태그 생성 오류:", error);
          toast.error(error instanceof Error ? error.message : "태그 생성에 실패했습니다.");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tagName">태그 이름</Label>
        <Input
          id="tagName"
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="새 태그 이름을 입력하세요"
          disabled={isPending}
          maxLength={50}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            생성 중...
          </>
        ) : (
          "태그 생성"
        )}
      </Button>
    </form>
  );
} 