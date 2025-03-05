"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Trash2 } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

interface TagListProps {
  initialTags: TagItem[];
}

export default function TagList({ initialTags }: TagListProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/tags/${tagToDelete}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "태그 삭제에 실패했습니다.");
      }
      
      // 태그 목록에서 삭제된 태그 제거
      setTags(tags.filter(tag => tag.id !== tagToDelete));
      toast.success("태그가 삭제되었습니다.");
    } catch (error) {
      console.error("태그 삭제 오류:", error);
      toast.error(error instanceof Error ? error.message : "태그 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setTagToDelete(null);
    }
  };

  return (
    <div>
      {tags.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">등록된 태그가 없습니다.</p>
        </div>
      ) : (
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
                  {tag.count > 0 ? (
                    <Link href={`/cards?tag=${tag.name}`}>
                      <Button variant="link" size="sm" className="p-0">
                        {tag.count}개 카드
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">0개</span>
                  )}
                </TableCell>
                <TableCell>{tag.createdAt}</TableCell>
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
                          태그 "{tag.name}"을(를) 삭제하시겠습니까?
                        </AlertDialogDescription>
                        {tag.count > 0 && (
                          <AlertDialogDescription className="text-destructive">
                            이 태그가 지정된 {tag.count}개의 카드에서 태그가 제거됩니다.
                          </AlertDialogDescription>
                        )}
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTag}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 