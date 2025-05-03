/**
 * 파일명: src/hooks/useCardNodes.ts
 * 목적: 아이디어맵의 CardNode 데이터를 조회하는 React Query 훅 제공
 * 역할: 프로젝트별 CardNode 목록을 서버에서 가져와 캐싱하고 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : useCreateCardNode 뮤테이션 훅 추가
 * 수정일: 2025-04-21 : useUpdateCardNodePosition 뮤테이션 훅 추가
 * 수정일: 2025-04-21 : useDeleteCardNode 뮤테이션 훅 추가
 * @rule   three-layer-standard
 * @layer  TanStack Query 훅
 * @tag    @tanstack-query-msw useCardNodes, @tanstack-mutation-msw useCreateCardNode, useUpdateCardNodePosition, useDeleteCardNode
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CardNode } from '@prisma/client';

type CreateCardNodeParams = {
  cardId: string;
  projectId: string;
  positionX: number;
  positionY: number;
  styleJson?: Record<string, any>;
  dataJson?: Record<string, any>;
};

type UpdateCardNodePositionParams = {
  id: string;
  projectId: string;
  position: {
    x: number;
    y: number;
  };
};

type DeleteCardNodeParams = {
  id: string;
  projectId: string;
};

/**
 * cardNodesService: 카드노드 관련 API 호출 함수 모음
 */
const cardNodesService = {
  /**
   * fetchCardNodes: 특정 프로젝트의 모든 카드노드를 가져오는 함수
   * @param {string} projectId - 카드노드를 가져올 프로젝트 ID
   * @returns {Promise<CardNode[]>} 카드노드 배열
   */
  fetchCardNodes: async (projectId: string): Promise<CardNode[]> => {
    const response = await fetch(`/api/cardnodes?projectId=${encodeURIComponent(projectId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CardNodes 조회 실패: ${response.status}`);
    }

    return response.json();
  },

  /**
   * createCardNode: 새로운 카드노드를 생성하는 함수
   * @param {CreateCardNodeParams} data - 생성할 카드노드 데이터
   * @returns {Promise<CardNode>} 생성된 카드노드
   */
  createCardNode: async (data: CreateCardNodeParams): Promise<CardNode> => {
    const response = await fetch('/api/cardnodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`CardNode 생성 실패: ${response.status}`);
    }

    return response.json();
  },

  /**
   * updateCardNodePosition: 카드노드의 위치를 업데이트하는 함수
   * @param {UpdateCardNodePositionParams} data - 업데이트할 카드노드 위치 데이터
   * @returns {Promise<CardNode>} 업데이트된 카드노드
   */
  updateCardNodePosition: async (data: UpdateCardNodePositionParams): Promise<CardNode> => {
    const { id, position } = data;
    const updateData = {
      positionX: position.x,
      positionY: position.y,
    };

    const response = await fetch(`/api/cardnodes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`CardNode 위치 업데이트 실패: ${response.status}`);
    }

    return response.json();
  },

  /**
   * deleteCardNode: 카드노드를 삭제하는 함수
   * @param {string} id - 삭제할 카드노드의 ID
   * @returns {Promise<void>} 성공 시 빈 응답
   */
  deleteCardNode: async (id: string): Promise<void> => {
    const response = await fetch(`/api/cardnodes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CardNode 삭제 실패: ${response.status}`);
    }
  },
};

/**
 * useCardNodes: 특정 프로젝트의 모든 카드노드를 가져오는 쿼리 훅
 * @param {string | undefined} projectId - 카드노드를 가져올 프로젝트 ID
 * @returns {UseQueryResult<CardNode[]>} 카드노드 배열과 쿼리 상태
 */
export const useCardNodes = (projectId?: string) => {
  return useQuery({
    queryKey: ['cardNodes', projectId],
    queryFn: () => {
      if (!projectId) {
        return Promise.resolve([]);
      }
      return cardNodesService.fetchCardNodes(projectId);
    },
    enabled: !!projectId,
  });
};

/**
 * useCreateCardNode: 새로운 카드노드를 생성하는 뮤테이션 훅
 * @returns {UseMutationResult} 뮤테이션 결과 및 함수
 */
export const useCreateCardNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardNodeParams) => {
      return cardNodesService.createCardNode(data);
    },
    onMutate: async (newCardNode) => {
      // 이전 쿼리 결과를 미리 캐시에서 가져옴
      await queryClient.cancelQueries({ queryKey: ['cardNodes', newCardNode.projectId] });
      const previousCardNodes = queryClient.getQueryData<CardNode[]>(['cardNodes', newCardNode.projectId]) || [];

      // 임시 ID를 가진 새 CardNode를 쿼리 캐시에 추가
      const tempCardNode: CardNode = {
        id: `temp-${Date.now()}`,
        cardId: newCardNode.cardId,
        projectId: newCardNode.projectId,
        positionX: newCardNode.positionX,
        positionY: newCardNode.positionY,
        styleJson: newCardNode.styleJson || null,
        dataJson: newCardNode.dataJson || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData(['cardNodes', newCardNode.projectId], [...previousCardNodes, tempCardNode]);

      // 롤백을 위한 이전 데이터 반환
      return { previousCardNodes };
    },
    onError: (err, newCardNode, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousCardNodes) {
        queryClient.setQueryData(['cardNodes', newCardNode.projectId], context.previousCardNodes);
      }
    },
    onSettled: (data, error, variables) => {
      // 작업 완료 시 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['cardNodes', variables.projectId] });
    },
  });
};

/**
 * useUpdateCardNodePosition: 카드노드의 위치를 업데이트하는 뮤테이션 훅
 * @returns {UseMutationResult} 뮤테이션 결과 및 함수
 */
export const useUpdateCardNodePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCardNodePositionParams) => {
      return cardNodesService.updateCardNodePosition(data);
    },
    onMutate: async (updatedNode) => {
      // 이전 쿼리를 취소하고 이전 데이터 저장
      await queryClient.cancelQueries({ queryKey: ['cardNodes', updatedNode.projectId] });
      const previousCardNodes = queryClient.getQueryData<CardNode[]>(['cardNodes', updatedNode.projectId]) || [];

      // 캐시된 데이터에서 해당 노드의 위치를 업데이트
      const updatedCardNodes = previousCardNodes.map((node) => {
        if (node.id === updatedNode.id) {
          return {
            ...node,
            positionX: updatedNode.position.x,
            positionY: updatedNode.position.y,
            updatedAt: new Date(),
          };
        }
        return node;
      });

      // 업데이트된 데이터를 캐시에 저장
      queryClient.setQueryData(['cardNodes', updatedNode.projectId], updatedCardNodes);

      // 롤백을 위한 이전 데이터 반환
      return { previousCardNodes };
    },
    onError: (err, updatedNode, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousCardNodes) {
        queryClient.setQueryData(['cardNodes', updatedNode.projectId], context.previousCardNodes);
      }
    },
    onSettled: (data, error, variables) => {
      // 작업 완료 시 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['cardNodes', variables.projectId] });
    },
  });
};

/**
 * useDeleteCardNode: 카드노드를 삭제하는 뮤테이션 훅
 * @returns {UseMutationResult} 뮤테이션 결과 및 함수
 */
export const useDeleteCardNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: DeleteCardNodeParams) => {
      return cardNodesService.deleteCardNode(id);
    },
    onMutate: async ({ id, projectId }) => {
      // 이전 쿼리를 취소하고 이전 데이터 저장
      await queryClient.cancelQueries({ queryKey: ['cardNodes', projectId] });
      const previousCardNodes = queryClient.getQueryData<CardNode[]>(['cardNodes', projectId]) || [];

      // 캐시된 데이터에서 해당 노드를 제거
      const updatedCardNodes = previousCardNodes.filter((node) => node.id !== id);

      // 업데이트된 데이터를 캐시에 저장
      queryClient.setQueryData(['cardNodes', projectId], updatedCardNodes);

      // 롤백을 위한 이전 데이터 반환
      return { previousCardNodes };
    },
    onError: (err, deletedNode, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousCardNodes) {
        queryClient.setQueryData(['cardNodes', deletedNode.projectId], context.previousCardNodes);
      }
    },
    onSettled: (data, error, variables) => {
      // 작업 완료 시 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['cardNodes', variables.projectId] });
    },
  });
};

/**
 * @mermaid
 * graph TD
 *   UI[IdeaMap Component] -->|calls| QH[useCardNodes 훅]
 *   QH -->|fetch| SVC[cardNodesService.fetchCardNodes]
 *   SVC -->|HTTP GET| API[/api/cardnodes?projectId=...]
 *   API -->|DB| DB[CardNode 테이블]
 *   
 *   UI -->|mutate| MH[useCreateCardNode 훅]
 *   MH -->|post| SVC2[cardNodesService.createCardNode]
 *   SVC2 -->|HTTP POST| API2[/api/cardnodes]
 *   API2 -->|DB| DB
 *   MH -->|optimistic update| CACHE[Query Cache]
 *
 *   UI -->|onNodeDragStop| POS[useUpdateCardNodePosition 훅]
 *   POS -->|patch| SVC3[cardNodesService.updateCardNodePosition]
 *   SVC3 -->|HTTP PATCH| API3[/api/cardnodes/[id]]
 *   API3 -->|DB| DB
 *   POS -->|optimistic update| CACHE
 *
 *   UI -->|onNodesChange| DEL[useDeleteCardNode 훅]
 *   DEL -->|delete| SVC4[cardNodesService.deleteCardNode]
 *   SVC4 -->|HTTP DELETE| API4[/api/cardnodes/[id]]
 *   API4 -->|DB| DB
 *   DEL -->|optimistic update| CACHE
 *   
 *   classDef hook fill:#f6d365,stroke:#555;
 *   classDef svc fill:#cdeffd,stroke:#555;
 *   class QH,MH,POS,DEL hook;
 *   class SVC,SVC2,SVC3,SVC4 svc;
 */ 