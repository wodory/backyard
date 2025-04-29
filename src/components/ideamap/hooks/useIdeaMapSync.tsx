/**
 * 파일명: src/components/ideamap/hooks/useIdeaMapSync.tsx
 * 목적: 아이디어맵 데이터 동기화 훅
 * 역할: 카드 데이터와 아이디어맵 노드 간 동기화 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 엣지 생성 DB 동기화 기능 추가
 * 수정일: 2025-04-21 : Zustand 구독 방식 수정 및 타입 오류 해결
 * 수정일: 2025-04-21 : 엣지 감지 로직 강화 및 로깅 개선
 * 수정일: 2025-04-21 : useIdeaMapSync 훅 디버깅 강화 및 버그 수정
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useCards } from '@/hooks/useCards';
import { useCreateEdge } from '@/hooks/useEdges';
import createLogger from '@/lib/logger';
import { Edge } from '@xyflow/react';
import { toast } from 'sonner';

// 로거 생성 - 로그 레벨을 높여 확실히 표시되도록 함
const logger = createLogger('useIdeaMapSync');

/**
 * Three-Layer-Standard에 따른 데이터 동기화 훅
 * 역할:
 * 1. Zustand Store(UI 계층)과 TanStack Query(API 계층) 간 동기화
 * 2. 카드-노드 변환 및 매핑
 * 3. 엣지 생성/삭제 시 DB 동기화
 */
export function useIdeaMapSync() {
    console.log('🔄 useIdeaMapSync 훅 실행됨'); // 브라우저 콘솔에도 출력하여 확인

    const queryClient = useQueryClient();
    const activeProjectId = useAppStore(state => state.activeProjectId);

    // 훅이 마운트 되었는지 추적 (강제로 화면에 로그 출력 목적)
    const [isMounted, setIsMounted] = useState(false);

    // Zustand Store에서 필요한 상태와 액션 가져오기
    const edges = useIdeaMapStore(state => state.edges);
    const syncCardsWithNodes = useIdeaMapStore(state => state.syncCardsWithNodes);

    // 이전 엣지 상태 참조를 위한 ref 생성
    const prevEdgesRef = useRef<Edge[]>([]);

    // 초기 설정 여부 추적을 위한 ref
    const isInitializedRef = useRef(false);

    // 디버깅을 위한 타이머 ref
    const debugTimerRef = useRef<NodeJS.Timeout | null>(null);

    // TanStack Query 훅 사용 - 기본 형태로 호출
    const { data: cards, isSuccess } = useCards();
    const createEdgeMutation = useCreateEdge();

    // 컴포넌트 초기 마운트 시 한 번만 실행되는 로그
    useEffect(() => {
        console.log('🚀 useIdeaMapSync 훅 초기화됨, edges:', edges);
        logger.info('useIdeaMapSync 훅 초기화됨, 엣지 DB 동기화 준비 완료, 현재 엣지 수:', edges.length);
        setIsMounted(true);

        // 디버깅용 주기적 로그 설정
        debugTimerRef.current = setInterval(() => {
            console.log('🔍 주기적 엣지 상태 확인, 현재 엣지:', useIdeaMapStore.getState().edges.length);
            const currentEdges = useIdeaMapStore.getState().edges;

            // 엣지 ID 목록 출력
            if (currentEdges.length > 0) {
                console.log('🔗 현재 엣지 ID들:', currentEdges.map(e => e.id));
            }
        }, 5000); // 5초마다 로그 출력

        return () => {
            console.log('💤 useIdeaMapSync 훅 정리됨');
            logger.info('useIdeaMapSync 훅 정리됨');

            if (debugTimerRef.current) {
                clearInterval(debugTimerRef.current);
            }
        };
    }, []);

    // 마운트 상태 업데이트 이후 로깅
    useEffect(() => {
        if (isMounted) {
            console.log('🟢 useIdeaMapSync 훅 완전히 마운트됨, 엣지 감지 활성화, edges:', edges.length);

            // 강제로 즉시 엣지 변경 감지 시도
            if (edges.length > 0) {
                console.log('⚡ 초기 엣지 데이터:', edges);

                // 엣지 샘플 데이터 출력
                if (edges.length > 0) {
                    console.log('📝 첫 번째 엣지 속성:', {
                        id: edges[0].id,
                        source: edges[0].source,
                        target: edges[0].target,
                        sourceHandle: edges[0].sourceHandle,
                        targetHandle: edges[0].targetHandle,
                        startsWith_edge: edges[0].id.startsWith('edge-'),
                        startsWith_reactflow: edges[0].id.startsWith('reactflow__edge-')
                    });
                }
            }
        }
    }, [isMounted, edges]);

    // 엣지 생성 감지 및 DB 동기화 - useEffect 의존성에 isMounted 추가
    useEffect(() => {
        // 마운트 상태가 아니면 실행하지 않음
        if (!isMounted) return;

        // 프로젝트 ID가 없으면 동기화 불가
        if (!activeProjectId) {
            console.log('❌ 프로젝트 ID 없음, 엣지 동기화 불가');
            logger.info('프로젝트 ID가 없어 엣지 동기화를 수행할 수 없습니다.');
            return;
        }

        console.log('🔍 엣지 동기화 Effect 시작, 현재 엣지 수:', edges.length);
        logger.info('엣지 동기화 Effect 시작, 현재 엣지 수:', edges.length);

        try {
            // 초기 엣지 목록 저장
            if (!isInitializedRef.current) {
                prevEdgesRef.current = [...edges];
                isInitializedRef.current = true;
                console.log('📋 초기 엣지 상태 저장 완료, 엣지 수:', edges.length);
                logger.info('초기 엣지 상태 저장 완료, 엣지 수:', edges.length);

                // 초기 설정 직후 엣지 구조 확인
                edges.forEach((edge, index) => {
                    console.log(`🔗 엣지 ${index}:`, {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle
                    });
                });
            }

            // 엣지 배열 길이가 변경된 경우 즉시 확인 (버그 수정: 변경 직후 즉시 처리)
            if (prevEdgesRef.current.length !== edges.length) {
                console.log('📊 엣지 배열 길이 변경 감지:', {
                    이전: prevEdgesRef.current.length,
                    현재: edges.length
                });
                logger.info('엣지 배열 길이 변경 감지:', {
                    이전: prevEdgesRef.current.length,
                    현재: edges.length
                });

                // 새로 추가된 엣지 찾기
                const newEdges = edges.filter(edge =>
                    !prevEdgesRef.current.some(prevEdge => prevEdge.id === edge.id)
                );

                if (newEdges.length > 0) {
                    console.log('🆕 새 엣지 감지됨:', {
                        개수: newEdges.length,
                        첫번째엣지ID: newEdges[0].id,
                        첫번째엣지소스: newEdges[0].source,
                        첫번째엣지타겟: newEdges[0].target,
                        첫번째엣지소스핸들: newEdges[0].sourceHandle,
                        첫번째엣지타겟핸들: newEdges[0].targetHandle
                    });
                    logger.info('새 엣지 감지됨:', {
                        개수: newEdges.length,
                        첫번째엣지ID: newEdges[0].id,
                        첫번째엣지소스: newEdges[0].source,
                        첫번째엣지타겟: newEdges[0].target,
                        첫번째엣지소스핸들: newEdges[0].sourceHandle,
                        첫번째엣지타겟핸들: newEdges[0].targetHandle
                    });

                    // 새 엣지 DB 저장 로직 호출 (트로스트 메시지 추가)
                    toast.info(`새 엣지 ${newEdges.length}개 감지됨, DB 저장 시도 중...`);
                    saveNewEdgesToDB(newEdges, activeProjectId, createEdgeMutation);
                }

                // 이전 엣지 목록 업데이트
                prevEdgesRef.current = [...edges];
            }

            // Zustand 구독 설정
            const unsubscribe = useIdeaMapStore.subscribe((state) => {
                console.log('👂 Zustand 스토어 엣지 상태 변경 감지됨, 상태 확인중...');
                logger.info('Zustand 스토어 엣지 상태 변경 감지됨, 상태 확인중...');

                try {
                    const currentEdges = state.edges;

                    // 구독이 활성화된 직후 첫 번째 엣지 검사
                    if (currentEdges.length > 0) {
                        console.log('🔍 구독 내 엣지 확인:', {
                            총개수: currentEdges.length,
                            첫번째ID: currentEdges[0].id
                        });
                    }

                    // 엣지 배열 길이 변경 확인
                    if (prevEdgesRef.current.length !== currentEdges.length) {
                        console.log('📊 구독 내부: 엣지 배열 길이 변경 감지:', {
                            이전: prevEdgesRef.current.length,
                            현재: currentEdges.length
                        });
                        logger.info('구독 내부: 엣지 배열 길이 변경 감지:', {
                            이전: prevEdgesRef.current.length,
                            현재: currentEdges.length
                        });

                        // 새로 추가된 엣지 찾기
                        const newEdges = currentEdges.filter(edge =>
                            !prevEdgesRef.current.some(prevEdge => prevEdge.id === edge.id)
                        );

                        if (newEdges.length > 0) {
                            console.log('🆕 구독 내부: 새 엣지 감지됨:', {
                                개수: newEdges.length,
                                ID목록: newEdges.map(e => e.id)
                            });
                            logger.info('구독 내부: 새 엣지 감지됨:', {
                                개수: newEdges.length,
                                ID목록: newEdges.map(e => e.id)
                            });

                            // 새 엣지 DB 저장 로직 호출
                            toast.info(`구독에서 새 엣지 ${newEdges.length}개 감지, DB 저장 시도 중...`);
                            saveNewEdgesToDB(newEdges, activeProjectId, createEdgeMutation);
                        }

                        // 이전 엣지 목록 업데이트
                        prevEdgesRef.current = [...currentEdges];
                    }
                } catch (error) {
                    console.error('⚠️ 구독 내 오류 발생:', error);
                    logger.error('구독 내 오류 발생:', error);
                }
            });

            return () => {
                // 구독 해제
                unsubscribe();
                console.log('🛑 엣지 동기화 Effect 정리됨');
                logger.info('엣지 동기화 Effect 정리됨');
            };
        } catch (error) {
            console.error('⚠️ 엣지 동기화 Effect 내 오류:', error);
            logger.error('엣지 동기화 Effect 내 오류:', error);
        }
    }, [activeProjectId, createEdgeMutation, edges, isMounted]);

    // 카드-노드 동기화
    useEffect(() => {
        if (isSuccess && cards) {
            logger.debug('카드 데이터 로드 성공, 노드 동기화 시작:', { cardCount: cards.length });
            // syncCardsWithNodes는 불린 값을 받는 것으로 확인됨
            syncCardsWithNodes(true);
        }
    }, [isSuccess, cards, syncCardsWithNodes]);

    // 새 엣지 DB 저장 함수 - Three-Layer-Standard 준수를 위해 별도 함수로 분리
    function saveNewEdgesToDB(newEdges: Edge[], projectId: string, mutation: ReturnType<typeof useCreateEdge>) {
        console.log('💾 엣지 DB 저장 함수 호출됨, 엣지 개수:', newEdges.length);

        newEdges.forEach((newEdge, index) => {
            // UI에서 생성된 엣지만 DB에 저장 (edge- 또는 reactflow__edge- 로 시작하는 ID)
            console.log(`🔍 엣지 #${index} 확인:`, {
                id: newEdge.id,
                isUIGenerated: newEdge.id.startsWith('edge-') || newEdge.id.startsWith('reactflow__edge-')
            });

            if (newEdge.id.startsWith('edge-') || newEdge.id.startsWith('reactflow__edge-')) {
                console.log('💾 [DB저장] 엣지 DB 저장 요청:', {
                    edgeId: newEdge.id,
                    source: newEdge.source,
                    target: newEdge.target,
                    sourceHandle: newEdge.sourceHandle,
                    targetHandle: newEdge.targetHandle
                });
                logger.info('[DB저장] 엣지 DB 저장 요청:', {
                    edgeId: newEdge.id,
                    source: newEdge.source,
                    target: newEdge.target,
                    sourceHandle: newEdge.sourceHandle,
                    targetHandle: newEdge.targetHandle
                });

                // API 요청을 위한 입력 데이터 생성
                const edgeInput = {
                    source: newEdge.source,
                    target: newEdge.target,
                    // null 값 제거하여 undefined만 허용
                    sourceHandle: newEdge.sourceHandle || undefined,
                    targetHandle: newEdge.targetHandle || undefined,
                    projectId: projectId,
                    type: newEdge.type,
                    animated: newEdge.animated,
                    style: newEdge.style,
                    data: newEdge.data
                };

                console.log('📤 뮤테이션 입력 데이터:', edgeInput);

                // TanStack Query mutation 호출
                mutation.mutate(edgeInput, {
                    onSuccess: (data) => {
                        console.log('✅ [DB저장] 엣지 DB 저장 성공:', {
                            edgeIds: data.map(edge => edge.id)
                        });
                        logger.info('[DB저장] 엣지 DB 저장 성공:', {
                            edgeIds: data.map(edge => edge.id)
                        });
                        toast.success('엣지가 성공적으로 저장되었습니다.');
                    },
                    onError: (error) => {
                        console.error('❌ [DB저장] 엣지 DB 저장 실패:', error);
                        logger.error('[DB저장] 엣지 DB 저장 실패:', error);
                        toast.error(`엣지 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
                    }
                });
            } else {
                console.log('🚫 DB 저장 건너뜀 - UI 생성 엣지가 아님:', newEdge.id);
            }
        });
    }

    // 디버깅용 UI 렌더링 (완전히 마운트되었는지 확인)
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{ display: 'none' }}>
                useIdeaMapSync 훅 마운트됨, 엣지 개수: {edges?.length || 0}
            </div>
        );
    }

    return null;
} 