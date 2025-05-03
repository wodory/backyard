/**
 * 파일명: src/components/layout/Sidebar.tsx
 * 목적: 사이드바 UI 컴포넌트 구현
 * 역할: 사이드바 렌더링 및 상태 관리
 * 작성일: 2025-03-28
 * 수정일: 2025-04-21 : 카드 정보 로딩 방식 개선 - 불필요한 API 호출 제거 및 캐시 활용
 * 수정일: 2025-05-21 : 개별 카드 조회 API 호출 제거 및 TanStack Query 캐시 활용 로직 구현
 */

'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2, GripVertical, Pencil } from 'lucide-react';
import { toast } from 'sonner';

// import CardList from '@/components/cards/CardList';
import { EditCardModal } from '@/components/cards/EditCardModal';
import DocumentViewer from '@/components/editor/DocumentViewer';
import TiptapViewer from '@/components/editor/TiptapViewer';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Portal } from '@/components/ui/portal';
import { useAuth } from '@/hooks/useAuth';
import { useCards } from '@/hooks/useCards';
import { useCard } from '@/hooks/useCard';
import { useUpdateCard } from '@/hooks/useUpdateCard';
import { useDeleteCard } from '@/hooks/useDeleteCard';
import { useResizable } from '@/hooks/useResizable';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import type { Card } from '@/types/card';
import { signOut } from '@/lib/auth';
import Image from 'next/image';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteCardAPI } from '@/services/cardService';


// 카드 인터페이스 정의
interface Tag {
  id: string;
  name: string;
}

interface CardTag {
  id: string;
  tag: Tag;
}

interface CardItem extends Card {
  cardTags?: CardTag[];
  // 엣지 정보를 통해 계층 구조 파악을 위한 필드
  parents?: string[];
  children?: string[];
  depth?: number;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  // const router = useRouter();
  const {
    isSidebarOpen,
    setSidebarOpen,
    selectedCardId,
    selectedCardIds,
    selectCard,
    toggleSelectedCard,
    sidebarWidth,
    setSidebarWidth,
    reactFlowInstance,
    activeProjectId
  } = useAppStore();

  // React Query를 사용하여 카드 데이터 가져오기
  const { data: allCardsData = [], isLoading: cardsLoading, refetch: refetchCards } = useCards();

  // updateCard 훅 가져오기
  const updateCardMutation = useUpdateCard();

  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // 제목 표시 부분의 ref 추가
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { width, startResize } = useResizable({
    initialWidth: sidebarWidth,
    minWidth: 240,
    maxWidth: 480,
    onWidthChange: setSidebarWidth,
    storageKey: 'sidebar-width'
  });

  // 다중 선택 모드인지 확인 - 이 변수는 항상 앞에 선언
  const isMultiSelectMode = useMemo(() => selectedCardIds.length > 1, [selectedCardIds]);

  // 선택된 카드 정보를 allCardsData에서 필터링하여 가져오기
  const selectedCardsForViewer = useMemo(() => {
    if (!allCardsData || selectedCardIds.length === 0) {
      return [];
    }
    return allCardsData.filter(card => selectedCardIds.includes(card.id));
  }, [selectedCardIds, allCardsData]);

  // 단일 선택된 카드 정보 
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !allCardsData) return null;
    return allCardsData.find(card => card.id === selectedCardId) || null;
  }, [selectedCardId, allCardsData]);

  // 카드 목록 불러오기
  useEffect(() => {
    if (isSidebarOpen) {
      refetchCards();
    }
  }, [isSidebarOpen, refetchCards]);

  useEffect(() => {
    setSidebarWidth(width);
  }, [width, setSidebarWidth]);

  // 선택된 카드 정보를 콘솔에 표시
  useEffect(() => {
    if (selectedCardIds.length >= 2) {
      console.group('다중 선택된 카드 정보');
      console.log('선택된 카드 ID 목록:', selectedCardIds);
      console.log('선택된 카드 데이터:', selectedCardsForViewer);
      console.log('다중 선택 모드:', isMultiSelectMode);
      console.groupEnd();
    }
  }, [selectedCardIds, selectedCardsForViewer, isMultiSelectMode]);

  // 선택된 카드의 카드 데이터 가져오기 (다중 선택 모드)
  useEffect(() => {
    if (selectedCardIds.length > 1) {
      console.log("여러 카드 선택됨:", selectedCardIds);
      setHierarchyLoading(true);

      try {
        // ReactFlow의 노드와 엣지 가져오기
        const nodes = reactFlowInstance?.getNodes() || [];
        const edges = reactFlowInstance?.getEdges() || [];

        // 계층 구조 분석
        const orderedNodeIds = analyzeHierarchy(selectedCardIds, nodes, edges);

        // 선택된 카드 정보를 캐시된 데이터에서 가져오기
        const cardsInfo = orderedNodeIds.map(id => {
          // 캐시된 카드 데이터에서 찾기
          const card = allCardsData.find(card => card.id === id);
          if (card) {
            return {
              id,
              title: card.title || '제목 없음',
              content: card.content || ''
            };
          }

          // 캐시에 없는 경우 기본 정보 반환
          return {
            id,
            title: String(id),
            content: '내용을 불러올 수 없습니다.'
          };
        });

        console.log("로드된 카드 정보:", cardsInfo);
        if (cardsInfo.length > 0) {
          setHierarchyLoading(false);
        }
      } catch (error) {
        console.error("카드 정보 로드 중 오류:", error);
        toast.error("카드 정보를 불러오는데 실패했습니다.");
      } finally {
        setHierarchyLoading(false);
      }
    }
  }, [selectedCardIds, reactFlowInstance, allCardsData]);

  // 카드 삭제를 위한 mutation 설정
  const deleteCardMutation = useMutation<void, Error, string>({
    mutationFn: (cardIdToDelete: string) => deleteCardAPI(cardIdToDelete),
    onSuccess: (_, cardIdToDelete) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.removeQueries({ queryKey: ['card', cardIdToDelete] });

      // cardNodes 쿼리 무효화
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['cardNodes', activeProjectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['cardNodes'] });
      }

      toast.success("카드가 성공적으로 삭제되었습니다.");

      // 삭제된 카드가 현재 선택된 카드라면 선택 해제
      if (selectedCardId === cardIdToDelete) {
        selectCard(null);
      }
    },
    onError: (error) => {
      console.error("Error deleting card:", error);
      toast.error(error instanceof Error ? error.message : "카드 삭제에 실패했습니다.");
    }
  });

  // 카드 삭제 처리
  const handleDeleteCard = async (cardId: string) => {
    setIsDeleting(true);
    try {
      await deleteCardMutation.mutateAsync(cardId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // 에러 처리는 mutation의 onError에서 처리됨
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

  // 다중 선택된 카들의 모든 태그를 합쳐서 중복 제거하여 반환
  const getMultiCardTags = () => {
    const allTags: CardTag[] = [];
    selectedCardsForViewer.forEach(card => {
      if (card.cardTags && card.cardTags.length > 0) {
        // 타입 어서션으로 CardTag 타입을 지정
        allTags.push(...(card.cardTags as CardTag[]));
      }
    });

    // 중복 태그 제거 (태그 ID 기준)
    const uniqueTags = allTags.filter((tag, index, self) =>
      index === self.findIndex(t => t.tag.id === tag.tag.id)
    );

    return uniqueTags;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // React Flow 드래그 이벤트 중지
    startResize(e);
  };

  // 카드 수정 모달 열기
  const openEditModal = (cardId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('카드 수정 모달 열기 요청:', cardId);
    setEditingCardId(cardId);
    setIsEditModalOpen(true);
  };

  // 카드 수정 성공 시 호출될 콜백
  const handleCardUpdated = (updatedCard: any) => {
    console.log('카드 업데이트 완료:', updatedCard);
    if (updatedCard) {
      // React Query 캐시 업데이트를 위한 뮤테이션 호출
      updateCardMutation.mutate({
        id: updatedCard.id,
        patch: {
          title: updatedCard.title,
          content: updatedCard.content,
          // 필요한 다른 필드들 추가
        }
      });

      // 현재 선택된 카드가 업데이트된 카드인 경우 로컬 상태도 즉시 업데이트
      if (selectedCardId === updatedCard.id) {
        console.log('선택된 카드 정보 즉시 업데이트');
        selectCard(updatedCard.id);
      }

      // 다중 선택 모드에서 업데이트된 카드가 포함되어 있는 경우 선택된 카드 목록도 업데이트
      if (selectedCardIds.includes(updatedCard.id) && selectedCardIds.length > 1) {
        console.log('다중 선택 모드에서 카드 정보 업데이트');
        selectCard(updatedCard.id);
      }

      toast.success("카드가 성공적으로 수정되었습니다.");
    }
    setIsEditModalOpen(false);
    setEditingCardId(null);
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      // AuthContext의 signOut 함수 사용
      await signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 엣지 정보를 기반으로 카드의 계층 구조 분석
  const analyzeHierarchy = (selectedIds: string[], nodes: any[], edges: any[]) => {
    console.log("계층 구조 분석 중...", selectedIds);

    // 선택된 카드 간의 관계를 파악하기 위한 그래프 생성
    const graph: Record<string, string[]> = {};
    const reverseGraph: Record<string, string[]> = {};

    // 모든 노드 ID에 대한 인접 목록 초기화
    nodes.forEach(node => {
      graph[node.id] = [];
      reverseGraph[node.id] = [];
    });

    // 엣지 정보를 기반으로 그래프 구성
    edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;

      if (graph[source]) graph[source].push(target);
      if (reverseGraph[target]) reverseGraph[target].push(source);
    });

    // 선택된 노드들 중 루트 노드(들) 찾기 (들어오는 엣지가 없거나 선택되지 않은 노드에서만 들어오는 엣지)
    const rootNodes = selectedIds.filter(id => {
      const parents = reverseGraph[id] || [];
      return parents.length === 0 || !parents.some(parent => selectedIds.includes(parent));
    });

    console.log("루트 노드:", rootNodes);

    // 방문 여부 추적
    const visited = new Set<string>();

    // 계층 순서대로 노드 수집
    const orderedNodes: string[] = [];

    // DFS로 계층 구조 탐색
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      orderedNodes.push(nodeId);

      // 해당 노드의 자식 중 선택된 카드만 탐색
      const children = graph[nodeId] || [];
      children.forEach(child => {
        if (selectedIds.includes(child)) {
          dfs(child);
        }
      });
    };

    // 모든 루트 노드에서 시작하여 DFS 실행
    rootNodes.forEach(root => dfs(root));

    // 만약 선택된 모든 노드가 루트에서 접근되지 않았다면 (연결되지 않은 컴포넌트)
    // 방문하지 않은 선택된 노드로 추가 DFS 실행
    selectedIds.forEach(id => {
      if (!visited.has(id)) {
        dfs(id);
      }
    });

    console.log("계층 순서 노드:", orderedNodes);
    return orderedNodes;
  };

  if (!isSidebarOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-[calc(3rem+12px+0.75rem)] right-3 bottom-3 w-80 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border z-10',
          className
        )}
        style={{ width: `${width}px` }}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-semibold">카드 목록</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        {/* 카드 수정 모달 - Portal을 사용하여 body에 직접 렌더링 */}
        {isEditModalOpen && editingCardId && (
          <Portal>
            <EditCardModal
              cardId={editingCardId}
              onClose={() => {
                console.log('수정 모달 닫기');
                setIsEditModalOpen(false);
                setEditingCardId(null);
              }}
              onCardUpdated={handleCardUpdated}
            />
          </Portal>
        )}

        {selectedCardId && selectedCard && !isMultiSelectMode ? (
          // 단일 카드 선택 모드
          <div className="h-full flex flex-col">
            {/* 카드 헤더 */}
            <div className="border-b p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-l font-semibold truncate">{selectedCard.title}</h2>
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

            {/* DocumentViewer를 사용하여 단일 카드 내용 표시 */}
            <div className="flex-1 overflow-y-auto">
              <DocumentViewer
                cards={[{
                  id: selectedCard.id,
                  title: selectedCard.title,
                  content: selectedCard.content || ''
                }]}
                isMultiSelection={false}
                loading={cardsLoading}
              />
            </div>
          </div>
        ) : isMultiSelectMode ? (
          // 다중 선택 모드
          <div className="h-full flex flex-col">
            {/* 카드 헤더 - 다중 선택 모드 */}
            <div className="border-b p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <h2
                  ref={titleRef}
                  className="text-l font-semibold truncate max-w-[calc(100%-70px)]"
                  title={selectedCardsForViewer.map(card => card.title).join(', ')}
                >
                  <span className="text-green-500 mr-1">📑</span>
                  {selectedCardsForViewer.length > 1
                    ? (selectedCardsForViewer.map(card => card.title).join(', ').length > 50
                      ? selectedCardsForViewer.map(card => card.title).join(', ').substring(0, 50) + '...'
                      : selectedCardsForViewer.map(card => card.title).join(', '))
                    : '선택된 카드들'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectCard(null)}
                >
                  목록으로
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-green-600 font-medium">다중 선택 모드</span>
                <span className="text-sm text-muted-foreground">
                  {selectedCardsForViewer.length}개 카드
                </span>
              </div>
            </div>

            {/* DocumentViewer를 사용하여 다중 선택 모드의 내용 표시 */}
            <div className="flex-1 overflow-y-auto">
              <DocumentViewer
                cards={selectedCardsForViewer.map(card => ({
                  id: card.id,
                  title: card.title || '',
                  content: card.content || ''
                }))}
                isMultiSelection={true}
                loading={cardsLoading || hierarchyLoading}
              />
            </div>
          </div>
        ) : (
          // 카드 목록 (선택된 카드 없음)
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {cardsLoading ? (
                <div className="flex justify-center items-center h-20">
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
              ) : allCardsData.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">카드가 없습니다. 새 카드를 추가해보세요!</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {allCardsData.map((card) => (
                    <div
                      key={card.id}
                      className={cn(
                        "p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group relative sidebar-card-item",
                        selectedCardIds.includes(card.id) && "selected"
                      )}
                      onClick={(e) => {
                        // 다중 선택 모드 (Ctrl/Cmd 키 누른 상태)
                        const isMultiSelection = e.ctrlKey || e.metaKey;

                        if (isMultiSelection) {
                          // 토글 선택: 이미 선택된 카드라면 제거, 아니면 추가
                          const isSelected = selectedCardIds.includes(card.id);
                          toggleSelectedCard(card.id);
                          toast.info(`'${card.title}' ${isSelected ? '선택 해제됨' : '선택됨'}`);
                        } else {
                          // 일반 클릭: 단일 선택
                          selectCard(card.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        // 더블클릭은 전파 중지 - 카드 선택 이벤트가 발생하지 않도록
                        e.stopPropagation();
                        console.log('카드 더블클릭됨:', card.id);
                        openEditModal(card.id);
                      }}
                      draggable
                      onDragStart={(e) => {
                        // 캔버스에 노드로 추가하기 위한 데이터 설정
                        e.dataTransfer.setData('application/reactflow', JSON.stringify({
                          type: 'card',
                          id: card.id,
                          data: {
                            ...card,
                            tags: card.cardTags ? card.cardTags.map((ct: any) => ct.tag.name) : []
                          }
                        }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{card.title}</h3>
                        <div className="flex items-center space-x-1">
                          {/* 수정 버튼 */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => openEditModal(card.id, e)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* 삭제 버튼 */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => openDeleteDialog(card.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        <TiptapViewer content={card.content || ''} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-muted-foreground/50 flex items-center justify-center group z-50"
        >
          <div className="w-4 h-8 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 bg-muted-foreground/50">
            <GripVertical className="h-4 w-4 text-muted" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 