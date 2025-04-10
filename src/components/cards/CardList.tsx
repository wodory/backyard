"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { useSearchParams } from "next/navigation";
import { Trash2, Eye } from "lucide-react";
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
import TiptapViewer from "@/components/editor/TiptapViewer";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
}

interface CardTag {
  id: string;
  tag: Tag;
}

interface CardItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  cardTags?: CardTag[];
}

export default function CardList() {
  const { cards, setCards } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const filteredCards = React.useMemo(() => {
    const q = searchParams.get('q')?.toLowerCase();
    const tag = searchParams.get('tag')?.toLowerCase();
    
    if (!q && !tag) return cards as CardItem[];
    
    return (cards as CardItem[]).filter(card => {
      const matchesQuery = !q || 
        card.title.toLowerCase().includes(q) || 
        (card.content && card.content.toLowerCase().includes(q));
      
      const matchesTag = !tag || 
        card.cardTags?.some(cardTag => 
          cardTag.tag.name.toLowerCase() === tag
        );
      
      return matchesQuery && matchesTag;
    });
  }, [cards, searchParams]);

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards();
    }
  }, [cards.length, searchParams]);

  async function fetchCards() {
    setLoading(true);
    try {
      const q = searchParams.get('q');
      const tag = searchParams.get('tag');
      
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (tag) params.append('tag', tag);
      
      const queryString = params.toString();
      const endpoint = `/api/cards${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('카드 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('카드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const handleTagClick = (tagName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/cards?tag=${encodeURIComponent(tagName)}`);
  };

  const handleDeleteCard = async (cardId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "카드 삭제에 실패했습니다.");
      }

      toast.success("카드가 성공적으로 삭제되었습니다.");
      fetchCards();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setDeletingCardId(null);
    }
  };

  const openDeleteDialog = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCardId(cardId);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <SearchBar />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={() => deletingCardId && handleDeleteCard(deletingCardId)} 
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {filteredCards.length === 0 ? (
        <div className="text-center py-10">
          {searchParams.toString() 
            ? '검색 결과가 없습니다.' 
            : '카드가 없습니다. 새 카드를 추가해보세요!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="line-clamp-3">
                  <TiptapViewer content={card.content || ''} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(card.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye size={16} />
                          자세히
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{card.title}</DialogTitle>
                          <DialogDescription>
                            작성일: 2025-03-05
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="whitespace-pre-wrap">
                            <TiptapViewer content={card.content || ''} />
                          </div>
                          
                          {card.cardTags && card.cardTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-4">
                              {card.cardTags.map((cardTag) => (
                                <Badge 
                                  key={cardTag.id} 
                                  variant="secondary"
                                >
                                  #{cardTag.tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button>닫기</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => openDeleteDialog(card.id, e)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {card.cardTags && card.cardTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.cardTags.map((cardTag) => (
                      <Badge 
                        key={cardTag.id} 
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={(e) => handleTagClick(cardTag.tag.name, e)}
                      >
                        #{cardTag.tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 