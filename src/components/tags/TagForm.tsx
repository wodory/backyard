"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TagForm() {
  const [tagName, setTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      toast.error("태그 이름을 입력해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tagName.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "태그 생성에 실패했습니다.");
      }
      
      const data = await response.json();
      toast.success("태그가 생성되었습니다.");
      setTagName("");
      
      // 페이지 새로고침을 통해 목록 업데이트
      window.location.reload();
    } catch (error) {
      console.error("태그 생성 오류:", error);
      toast.error(error instanceof Error ? error.message : "태그 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          maxLength={50}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "생성 중..." : "태그 생성"}
      </Button>
    </form>
  );
} 