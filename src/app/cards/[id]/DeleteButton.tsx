"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface DeleteButtonProps {
  cardId: string;
  // 테스트를 위한 프로퍼티 추가 (선택적)
  onSuccessfulDelete?: () => void;
}

// 테스트를 위해 함수를 컴포넌트 외부로 분리
export function callIfExists(callback?: () => void): void {
  if (callback) {
    callback();
  }
}

export default function DeleteButton({
  cardId,
  onSuccessfulDelete
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // API 호출
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      // 실패 응답 처리
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
      }

      // 성공 시에만 다음 코드 실행

      // 성공 시 다이얼로그 닫기
      setOpen(false);

      // 성공적인 삭제 후 토스트 메시지 표시
      toast.success("카드가 성공적으로 삭제되었습니다.");

      // 성공 시에만 리디렉션 수행
      router.push("/cards");

      // 성공 시에만 콜백 호출
      if (onSuccessfulDelete) {
        onSuccessfulDelete();
      }

      // 성공 시에만 여기까지 실행됨

    } catch (error) {
      // 모든 종류의 오류 처리 (네트워크 오류, 응답 오류 등)
      console.error("Error deleting card:", error);

      // 오류 메시지 표시
      toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");

      // 오류 발생 시 다이얼로그만 닫음 (리디렉션 없음)
      setOpen(false);

      // 오류 시 리디렉션이 발생하지 않음
    } finally {
      setIsDeleting(false);
    }
    // 함수 종료
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          카드 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드 삭제</DialogTitle>
          <DialogDescription>
            이 카드를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 