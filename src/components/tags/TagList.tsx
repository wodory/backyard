"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTags } from "@/hooks/useTags";
import { useDeleteTag } from "@/hooks/useDeleteTag";
import { Tag } from "@/services/tagService";

/**
 * TagList: 전체 태그 목록을 표시하는 컴포넌트
 */
export default function TagList() {
  // React Query 훅을 통해 태그 목록 조회
  const { data: tags, isLoading, error } = useTags();

  // 태그 삭제 뮤테이션 훅
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

  // 삭제 중인 태그 ID 관리
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // 태그 삭제 핸들러
  const handleDeleteTag = () => {
    if (!tagToDelete) return;

    deleteTag(tagToDelete, {
      onSuccess: () => {
        toast.success("태그가 삭제되었습니다.");
        setTagToDelete(null);
      },
      onError: (error) => {
        console.error("태그 삭제 오류:", error);
        toast.error(error instanceof Error ? error.message : "태그 삭제에 실패했습니다.");
        setTagToDelete(null);
      }
    });
  };

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2">태그 목록을 불러오는 중...</span>
      </div>
    );
  }

  // 에러 UI
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>태그 목록을 불러오는 데 실패했습니다.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  // 태그가 없는 경우 UI
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">등록된 태그가 없습니다.</p>
      </div>
    );
  }

  // 태그 목록 UI
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>태그 이름</TableHead>
            <TableHead className="text-center">카드 수</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {tag.name}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {tag.count && tag.count > 0 ? (
                  <Link href={`/cards?tag=${tag.name}`}>
                    <Button variant="link" size="sm" className="p-0">
                      {tag.count}개 카드
                    </Button>
                  </Link>
                ) : (
                  <span className="text-muted-foreground">0개</span>
                )}
              </TableCell>
              <TableCell>
                {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString("ko-KR") : "-"}
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTagToDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>태그 삭제 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        태그 &quot;{tag.name}&quot;을(를) 삭제하시겠습니까?
                      </AlertDialogDescription>
                      {tag.count && tag.count > 0 && (
                        <AlertDialogDescription className="text-destructive">
                          이 태그가 지정된 {tag.count}개의 카드에서 태그가 제거됩니다.
                        </AlertDialogDescription>
                      )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setTagToDelete(null)}>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteTag}
                        disabled={isDeleting && tagToDelete === tag.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting && tagToDelete === tag.id ? "삭제 중..." : "삭제"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 