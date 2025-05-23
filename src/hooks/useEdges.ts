/**
 * 파일명: src/hooks/useEdges.ts
 * 목적: 아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 * 역할: API에서 가져온 엣지 데이터를 React Flow 형식으로 변환하여 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : ApiEdge 별칭 대신 Edge 타입 직접 사용
 * 수정일: 2025-04-21 : React Flow의 Edge를 기본 Edge로 사용하도록 수정
 * 수정일: 2025-04-21 : useCreateEdge 뮤테이션 훅 추가
 * 수정일: 2025-04-21 : useDeleteEdge 뮤테이션 훅 추가 - Task 2.7 구현
 * 수정일: 2025-05-01 : useCreateEdge 내부에서 필드 변환 로직 추가 (sourceCardId → source)
 * 수정일: 2025-05-01 : 엣지 생성/삭제 오류 처리 및 로깅 개선
 * 수정일: 2025-05-02 : useCreateEdge에 낙관적 업데이트(Optimistic Updates) 로직 추가
 * 수정일: 2025-04-21 : sourceHandle과 targetHandle 필드 지원 추가
 * 수정일: 2025-05-11 : queryKey 일관성 확보 및 낙관적 업데이트 개선
 * 수정일: 2025-04-21 : three-layer-standard 규칙에 따라 쿼리 키 구조를 ['edges', projectId]로 통일하여 일관성 확보
 * 수정일: 2025-05-21 : useDeleteMultipleEdges 뮤테이션 훅 추가 - 다중 엣지 동시 삭제 지원
 * 수정일: 2025-04-21 : source/target 필드명을 sourceCardNodeId/targetCardNodeId로 변경하여 Prisma 스키마와 일치시킴
 * 수정일: 2025-04-21 : DB Edge 타입과 ReactFlow Edge 타입의 명확한 구분
 * 수정일: 2025-05-08 : animated 속성을 엣지 테이블에서 제거하고 설정에서 가져오도록 수정
 */

/**
 * @rule   three-layer-Standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw useEdges
 * 설명    아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 */
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { fetchEdges, createEdgeAPI, deleteEdgeAPI, deleteEdgesAPI } from '@/services/edgeService';
import { Edge as DBEdge, EdgeInput } from '@/types/edge';
import { Edge as ReactFlowEdge, Connection } from '@xyflow/react';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';

const logger = createLogger('useEdges');

/**
 * transformDbEdgeToFlowEdge: DB 엣지를 React Flow 엣지로 변환하는 함수
 * @param {DBEdge} dbEdge - API에서 받아온 엣지 데이터
 * @returns {ReactFlowEdge} React Flow에서 사용할 수 있는 Edge 객체
 */
const transformDbEdgeToFlowEdge = (dbEdge: DBEdge): ReactFlowEdge => ({
    id: dbEdge.id,
    source: dbEdge.sourceCardNodeId, // DB의 sourceCardNodeId를 React Flow의 source로 변환
    target: dbEdge.targetCardNodeId, // DB의 targetCardNodeId를 React Flow의 target으로 변환
    type: dbEdge.type || 'custom', // dbEdge에서 type 가져오거나 'custom' 사용
    style: dbEdge.style || undefined,
    data: dbEdge.data || undefined,
    sourceHandle: dbEdge.sourceHandle,
    targetHandle: dbEdge.targetHandle,
    // animated 속성은 더 이상 DB에서 가져오지 않음. 이 속성은 설정에서 가져와 적용됨
});

/**
 * 엣지 생성을 위한 입력 데이터 타입 (Connection 필드명과 API 필드명 매핑)
 */
export interface CreateEdgeInput {
  // React Flow에서는 source/target 필드를 사용하지만 API에서는 sourceCardNodeId/targetCardNodeId로 매핑
  sourceCardId?: string; // 이전 버전 호환성을 위해 유지
  targetCardId?: string; // 이전 버전 호환성을 위해 유지
  source?: string;      // React Flow의 source 필드
  target?: string;      // React Flow의 target 필드
  sourceHandle?: string; // 소스 노드의 핸들 ID
  targetHandle?: string; // 타겟 노드의 핸들 ID
  projectId: string;
  type?: string;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

// CreateEdgeInput을 EdgeInput으로 변환하는 함수
const mapToEdgeInput = (input: CreateEdgeInput): EdgeInput => {
  return {
    sourceCardNodeId: input.source || input.sourceCardId || '',
    targetCardNodeId: input.target || input.targetCardId || '',
    projectId: input.projectId,
    sourceHandle: input.sourceHandle,
    targetHandle: input.targetHandle,
    type: input.type,
    style: input.style,
    data: input.data
  };
};

/**
 * 엣지 쿼리 키 생성 함수 - 일관성을 위해 공통 함수로 분리
 * @param projectId 프로젝트 ID (옵션)
 * @returns 일관된 쿼리 키 배열
 */
export const getEdgesQueryKey = (projectId?: string) => 
  ['edges', projectId];

/**
 * useEdges: 아이디어맵 엣지 데이터를 조회하는 TanStack Query 훅
 * @param {string} projectId - 현재 프로젝트 ID
 * @returns {UseQueryResult<ReactFlowEdge[], Error>} 쿼리 결과 (로딩, 에러, 데이터 상태 포함)
 */
export function useEdges(projectId?: string): UseQueryResult<ReactFlowEdge[], Error> {
  return useQuery({
    queryKey: getEdgesQueryKey(projectId),
    queryFn: async () => {
      logger.debug(`엣지 데이터 조회: projectId=${projectId}`);
      if (!projectId) {
        logger.warn('projectId가 없어 엣지 데이터를 조회할 수 없습니다.');
        return [];
      }
      
      const dbEdges = await fetchEdges(projectId);
      const flowEdges = dbEdges.map(transformDbEdgeToFlowEdge);
      logger.debug(`변환된 엣지 ${flowEdges.length}개`);
      return flowEdges;
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1분 stale time (조정 가능)
    gcTime: 5 * 60 * 1000, // 5분 gc time (조정 가능)
  });
}

/**
 * useCreateEdge: 새로운 엣지를 생성하는 뮤테이션 훅
 * @rule   three-layer-Standard
 * @layer  tanstack-mutation-hook
 * @tag    @tanstack-mutation-msw useCreateEdge
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export function useCreateEdge(): UseMutationResult<DBEdge[], Error, CreateEdgeInput> {
  const queryClient = useQueryClient();
  // useAuth 훅을 사용하여 현재 사용자 ID 가져오기
  const { user } = useAuth();
  
  return useMutation({
    mutationKey: ['createEdge'], // 뮤테이션 키 유지
    mutationFn: async (edgeData: CreateEdgeInput) => {
      logger.debug('새 엣지 생성 요청:', edgeData);
      
      // 필드 유효성 검사 - 필수 필드가 빠졌는지 확인
      if (!edgeData.projectId) {
        logger.error('엣지 생성 실패: projectId가 누락되었습니다.', edgeData);
        throw new Error('엣지 생성에 필요한 projectId가 누락되었습니다.');
      }
      
      if ((!edgeData.source && !edgeData.sourceCardId) || 
          (!edgeData.target && !edgeData.targetCardId)) {
        logger.error('엣지 생성 실패: source 또는 target이 누락되었습니다.', edgeData);
        throw new Error('엣지 생성에 필요한 소스 또는 타겟 노드가 누락되었습니다.');
      }
      
      // sourceCardId/targetCardId를 source/target으로 자동 변환
      const apiInput = mapToEdgeInput(edgeData);
      logger.debug('API 요청용 데이터로 변환:', apiInput);
      
      try {
        // 엣지 생성 시도
        const result = await createEdgeAPI(apiInput);
        logger.debug('엣지 생성 API 호출 성공:', result);
        return result;
      } catch (error: any) {
        // 오류가 "unique constraint" 관련이면 사용자 친화적 메시지로 변환
        if (error.message && (
            error.message.includes('unique constraint') ||
            error.message.includes('Unique constraint') ||
            error.message.includes('duplicate key') ||
            error.message.includes('already exists')
          )) {
          const friendlyError = new Error('이미 동일한 엣지가 존재합니다.');
          logger.warn('엣지 중복 생성 시도:', { input: apiInput, error: friendlyError.message });
          throw friendlyError;
        }
        
        // 외래 키 제약 조건 위반 (카드 ID가 존재하지 않음)
        if (error.message && (
            error.message.includes('foreign key constraint') ||
            error.message.includes('Foreign key constraint')
          )) {
          const friendlyError = new Error('해당 카드가 존재하지 않습니다.');
          logger.warn('존재하지 않는 카드로 엣지 생성 시도:', { input: apiInput, error: friendlyError.message });
          throw friendlyError;
        }
        
        // 인증 관련 오류 처리
        if (error.message && error.message.includes('Unauthorized')) {
          const authError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
          logger.error('엣지 생성 중 인증 오류:', { input: apiInput, error: authError.message });
          throw authError;
        }
        
        // 서버 오류의 경우 원래 에러 메시지에 더 많은 컨텍스트 추가
        logger.error('엣지 생성 중 서버 오류:', {
          error: error.message || '알 수 없는 오류',
          input: apiInput,
          status: error.status || '알 수 없음'
        });
        
        // 사용자에게 표시할 수 있는 오류 메시지 생성
        const serverError = new Error(
          error.message === 'Internal Server Error' 
            ? '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
            : `엣지 생성 중 오류: ${error.message}`
        );
        
        throw serverError;
      }
    },
    // 낙관적 업데이트: API 호출 이전에 UI에 먼저 변경사항 반영
    onMutate: async (newEdgeData) => {
      logger.debug('낙관적 업데이트 시작:', newEdgeData);
      
      // 쿼리 키 가져오기 (일관성을 위해 공통 함수 사용)
      const queryKey = getEdgesQueryKey(newEdgeData.projectId);
      
      // 현재 진행 중인 refetch를 취소하여 낙관적 업데이트가 덮어쓰기 되는 것 방지
      await queryClient.cancelQueries({ queryKey });
      
      // 이전 엣지 데이터 백업 (롤백용)
      const previousEdges = queryClient.getQueryData<ReactFlowEdge[]>(queryKey) || [];
      
      logger.debug('이전 엣지 데이터 백업 완료:', { 
        count: previousEdges.length,
        queryKey
      });
      
      // 임시 ID 생성 (낙관적 업데이트용)
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // 낙관적 엣지 생성 (React Flow는 source/target 필드를 사용)
      const optimisticEdge: ReactFlowEdge = {
        id: tempId,
        source: newEdgeData.source || newEdgeData.sourceCardId || '',
        target: newEdgeData.target || newEdgeData.targetCardId || '',
        sourceHandle: newEdgeData.sourceHandle,
        targetHandle: newEdgeData.targetHandle,
        type: newEdgeData.type || 'custom',
        style: newEdgeData.style || {},
        data: newEdgeData.data || {},
      };
      
      // UI에 낙관적 엣지 추가
      queryClient.setQueryData<ReactFlowEdge[]>(
        queryKey,
        old => [...(old || []), optimisticEdge]
      );
      
      logger.debug('낙관적 엣지 추가 완료:', { 
        tempId, 
        source: optimisticEdge.source, 
        target: optimisticEdge.target,
        queryKey
      });
      
      // 롤백에 필요한 정보 반환
      return {
        previousEdges,
        tempId,
        queryKey
      };
    },
    onSuccess: (data, variables, context) => {
      logger.debug('엣지 생성 성공:', {
        newEdge: data 
      });
      
      // 쿼리 키 가져오기
      const queryKey = getEdgesQueryKey(variables.projectId);
      
      // 엣지 쿼리 무효화 - 이것이 가장 간단하고 권장되는 방식
      queryClient.invalidateQueries({ 
        queryKey: queryKey
      });
      
      logger.debug('엣지 쿼리 무효화 완료, 리페치가 수행됩니다:', {
        queryKey
      });
      
      toast.success('엣지가 성공적으로 생성되었습니다.');
    },
    onError: (error: any, variables, context) => {
      logger.error('엣지 생성 실패:', error);
      
      // 낙관적 업데이트 롤백
      if (context) {
        // 쿼리 키 가져오기 (일관성을 위해 컨텍스트에서 가져오거나 공통 함수 사용)
        const queryKey = context.queryKey || getEdgesQueryKey(variables.projectId);
        
        logger.debug('낙관적 업데이트 롤백 시작:', { 
          projectId: variables.projectId,
          tempId: context.tempId,
          queryKey
        });
        
        // 이전 엣지 데이터로 복원
        queryClient.setQueryData(queryKey, context.previousEdges);
        
        logger.debug('낙관적 업데이트 롤백 완료');
      }
      
      // 사용자 친화적 에러 메시지 표시
      const errorMessage = error.message || '엣지 생성 중 오류가 발생했습니다.';
      
      // 에러 메시지에 따라 다른 토스트 표시
      if (errorMessage.includes('이미 동일한 엣지가 존재합니다')) {
        toast.error('이미 동일한 연결이 존재합니다.');
      } else if (errorMessage.includes('해당 카드가 존재하지 않습니다')) {
        toast.error('연결하려는 카드가 존재하지 않습니다.');
      } else if (errorMessage.includes('인증이 필요합니다')) {
        toast.error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        toast.error(`엣지 생성 중 오류: ${errorMessage}`);
      }
    },
    onSettled: (data, error, variables) => {
      logger.debug('엣지 생성 뮤테이션 완료:', { 
        success: !error,
        projectId: variables.projectId
      });
    },
    // 재시도 방지 (인증 오류, 중복 등은 재시도해도 해결되지 않음)
    retry: (failureCount, error: any) => {
      // 인증 오류, 중복 오류, 외래 키 제약 조건 오류는 재시도하지 않음
      if (error.message && (
        error.message.includes('이미 동일한 엣지가 존재합니다') ||
        error.message.includes('해당 카드가 존재하지 않습니다') ||
        error.message.includes('인증이 필요합니다')
      )) {
        return false;
      }
      
      // 서버 오류는 최대 2번까지만 재시도
      return failureCount < 2;
    }
  });
}

/**
 * useDeleteEdge: 엣지를 삭제하는 뮤테이션 훅
 * @rule   three-layer-Standard
 * @layer  tanstack-mutation-hook
 * @tag    @tanstack-mutation-msw useDeleteEdge
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export function useDeleteEdge(): UseMutationResult<void, Error, { id: string; projectId: string }> {
  const queryClient = useQueryClient();
  // useAuth 훅을 사용하여 현재 사용자 ID 가져오기
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      logger.debug(`엣지 삭제 요청: ID=${id}`);
      return await deleteEdgeAPI(id);
    },
    // 낙관적 업데이트 추가
    onMutate: async (variables) => {
      logger.debug('엣지 삭제 낙관적 업데이트 시작:', variables);
      
      // 쿼리 키 생성
      const queryKey = getEdgesQueryKey(variables.projectId);
      
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey });
      
      // 이전 엣지 데이터 백업
      const previousEdges = queryClient.getQueryData<ReactFlowEdge[]>(queryKey) || [];
      
      // 낙관적으로 UI에서 엣지 제거
      queryClient.setQueryData<ReactFlowEdge[]>(
        queryKey,
        previousEdges.filter(edge => edge.id !== variables.id)
      );
      
      logger.debug('엣지 삭제 낙관적 업데이트 완료:', {
        edgeId: variables.id,
        previousEdgeCount: previousEdges.length,
        currentEdgeCount: previousEdges.length - 1,
        queryKey
      });
      
      // 롤백 정보 반환
      return { previousEdges, queryKey };
    },
    onSuccess: (_, variables) => {
      logger.debug(`엣지 삭제 성공: ID=${variables.id}`);
      
      // 성공적으로 삭제되면 엣지 데이터 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: getEdgesQueryKey(variables.projectId),
        // 낙관적 업데이트로 UI는 이미 반영되었으므로 자동 리페치는 방지
        refetchType: 'none'
      });
      
      toast.success('엣지가 성공적으로 삭제되었습니다.');
    },
    onError: (error, variables, context) => {
      logger.error(`엣지 삭제 실패: ID=${variables.id}`, error);
      
      // 낙관적 업데이트 롤백
      if (context) {
        const queryKey = context.queryKey || getEdgesQueryKey(variables.projectId);
        logger.debug('엣지 삭제 롤백:', { edgeId: variables.id, queryKey });
        queryClient.setQueryData(queryKey, context.previousEdges);
      }
      
      toast.error('엣지 삭제 중 오류가 발생했습니다.');
    },
    onSettled: (_, error, variables) => {
      // 성공이든 실패든 마지막에 쿼리 무효화
      if (error) {
        queryClient.invalidateQueries({
          queryKey: getEdgesQueryKey(variables.projectId)
        });
      }
    }
  });
}

/**
 * useDeleteMultipleEdges: 여러 엣지를 한 번에 삭제하는 뮤테이션 훅
 * @rule   three-layer-Standard
 * @layer  tanstack-mutation-hook
 * @tag    @tanstack-mutation-msw useDeleteMultipleEdges
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export function useDeleteMultipleEdges(): UseMutationResult<void, Error, { ids: string[]; projectId: string }> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids }: { ids: string[]; projectId: string }) => {
      logger.debug(`다중 엣지 삭제 요청: ${ids.length}개`, {
        edgeIds: ids
      });
      
      if (!ids.length) {
        logger.warn('삭제할 엣지 ID가 없습니다.');
        return; // 빈 배열이면 API 호출 스킵
      }
      
      return await deleteEdgesAPI(ids);
    },
    // 낙관적 업데이트 - 여러 엣지를 UI에서 즉시 제거
    onMutate: async (variables) => {
      logger.debug('다중 엣지 삭제 낙관적 업데이트 시작:', {
        edgeCount: variables.ids.length,
        projectId: variables.projectId
      });
      
      // 쿼리 키 생성
      const queryKey = getEdgesQueryKey(variables.projectId);
      
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey });
      
      // 이전 엣지 데이터 백업
      const previousEdges = queryClient.getQueryData<ReactFlowEdge[]>(queryKey) || [];
      
      // 낙관적으로 UI에서 엣지들 제거
      queryClient.setQueryData<ReactFlowEdge[]>(
        queryKey,
        previousEdges.filter(edge => !variables.ids.includes(edge.id))
      );
      
      logger.debug('다중 엣지 삭제 낙관적 업데이트 완료:', {
        edgeIds: variables.ids,
        previousEdgeCount: previousEdges.length,
        currentEdgeCount: previousEdges.length - variables.ids.length,
        queryKey
      });
      
      // 롤백 정보 반환
      return { previousEdges, queryKey };
    },
    onSuccess: (_, variables) => {
      logger.debug(`다중 엣지 삭제 성공: ${variables.ids.length}개`, {
        edgeIds: variables.ids,
        projectId: variables.projectId
      });
      
      // 성공적으로 삭제되면 엣지 데이터 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: getEdgesQueryKey(variables.projectId),
        // 낙관적 업데이트로 UI는 이미 반영되었으므로 자동 리페치는 방지
        refetchType: 'none'
      });
      
      // 엣지 수에 따라 다른 메시지 표시
      if (variables.ids.length === 1) {
        toast.success('엣지가 성공적으로 삭제되었습니다.');
      } else {
        toast.success(`${variables.ids.length}개의 엣지가 성공적으로 삭제되었습니다.`);
      }
    },
    onError: (error, variables, context) => {
      logger.error(`다중 엣지 삭제 실패: ${variables.ids.length}개`, {
        edgeIds: variables.ids,
        error
      });
      
      // 낙관적 업데이트 롤백
      if (context) {
        const queryKey = context.queryKey || getEdgesQueryKey(variables.projectId);
        logger.debug('다중 엣지 삭제 롤백:', { 
          edgeCount: variables.ids.length, 
          queryKey 
        });
        queryClient.setQueryData(queryKey, context.previousEdges);
      }
      
      toast.error('엣지 삭제 중 오류가 발생했습니다.');
    },
    onSettled: (_, error, variables) => {
      // 성공이든 실패든 마지막에 쿼리 무효화
      if (error) {
        queryClient.invalidateQueries({
          queryKey: getEdgesQueryKey(variables.projectId)
        });
      }
    }
  });
} 