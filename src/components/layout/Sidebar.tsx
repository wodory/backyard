'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import TiptapViewer from '@/components/editor/TiptapViewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

// 카드 인터페이스 정의
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

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, selectedCardId, selectCard } = useAppStore();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 카드 목록 불러오기
  useEffect(() => {
    if (isSidebarOpen) {
      fetchCards();
    }
  }, [isSidebarOpen]);

  // 선택된 카드 정보 불러오기
  useEffect(() => {
    if (selectedCardId) {
      fetchCardDetails(selectedCardId);
    } else {
      setSelectedCard(null);
    }
  }, [selectedCardId]);

  async function fetchCards() {
    setLoading(true);
    try {
      const response = await fetch('/api/cards');
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

  async function fetchCardDetails(cardId: string) {
    try {
      const response = await fetch(`/api/cards/${cardId}`);
      if (!response.ok) {
        throw new Error('카드 정보를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setSelectedCard(data);
    } catch (error) {
      console.error('Error fetching card details:', error);
      toast.error('카드 정보를 불러오는데 실패했습니다.');
      selectCard(null); // 에러 발생 시 선택 해제
    }
  }

  // 카드 삭제 처리
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
      // 삭제 후 목록 갱신
      fetchCards();
      if (selectedCardId === cardId) {
        selectCard(null);
      }
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

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l shadow-lg pt-14 z-0"
        >
          {/* 사이드바 접기 버튼 */}
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-[calc(50%-20px)] -left-10 h-10 w-10 rounded-full bg-background border shadow-md"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* 삭제 확인 다이얼로그 */}
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
          
          {selectedCardId && selectedCard ? (
            // 카드 콘텐츠 뷰어
            <div className="h-full flex flex-col">
              {/* 카드 헤더 */}
              <div className="border-b p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold truncate">{selectedCard.title}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => selectCard(null)}
                  >
                    목록으로
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">작성일</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedCard.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* 카드 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedCard.content ? (
                  <TiptapViewer content={selectedCard.content} />
                ) : (
                  <p className="text-sm text-muted-foreground">내용이 없습니다.</p>
                )}
                
                {/* 태그 표시 */}
                {selectedCard.cardTags && selectedCard.cardTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedCard.cardTags.map((cardTag) => (
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
            </div>
          ) : (
            // 카드 목록
            <div className="h-full flex flex-col">
              <div className="border-b p-4">
                <h2 className="text-xl font-semibold">카드 목록</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-20">
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                  </div>
                ) : cards.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">카드가 없습니다. 새 카드를 추가해보세요!</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {cards.map((card) => (
                      <div 
                        key={card.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => selectCard(card.id)}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium">{card.title}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={(e) => openDeleteDialog(card.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          <TiptapViewer content={card.content} />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(card.createdAt)}
                          </span>
                          {card.cardTags && card.cardTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {card.cardTags.slice(0, 2).map((cardTag) => (
                                <Badge 
                                  key={cardTag.id} 
                                  variant="outline"
                                  className="text-xs px-1"
                                >
                                  #{cardTag.tag.name}
                                </Badge>
                              ))}
                              {card.cardTags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1">
                                  +{card.cardTags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 