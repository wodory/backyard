/**
 * 파일명: useNodes.ts
 * 목적: 노드 관련 상태 및 로직 관리
 * 역할: 노드 생성, 업데이트, 삭제 및 이벤트 핸들링 로직 캡슐화
 * 작성일: 2024-05-09
 */

import { useCallback, useRef, useEffect } from 'react';
import { useNodesState, applyNodeChanges } from '@xyflow/react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { 
  CardData, 
  NodeChange, 
  Node,
  XYPosition
} from '../types/board-types';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';

/**
 * useNodes: 노드 관련 상태 및 로직을 관리하는 훅
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @param initialNodes 초기 노드 데이터 (옵션)
 * @returns 노드 관련 상태 및 함수들
 */
export function useNodes({
  onSelectCard,
  initialNodes = []
}: {
  onSelectCard?: (cardId: string | null) => void;
  initialNodes?: Node<CardData>[];
}) {
  // 노드 상태 관리 - Node<CardData> 타입으로 제네릭 지정
  const [nodes, setNodes] = useNodesState<Node<CardData>>(initialNodes);
  
  // 저장되지 않은 변경사항 플래그
  const hasUnsavedChanges = useRef(false);
  
  // 전역 상태에서 선택된 카드 정보 가져오기
  const { selectedCardIds, toggleSelectedCard, selectCard, clearSelectedCards } = useAppStore();
  
  // 초기 노드 데이터가 변경되면 노드 상태 업데이트
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  /**
   * 노드 변경 핸들러: 노드 변경 사항 적용 및 관리
   * @param changes 노드 변경 사항 배열
   */
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 노드 삭제 변경이 있는지 확인
    const deleteChanges = changes.filter(change => change.type === 'remove');
    
    // 삭제된 노드가 있으면 로컬 스토리지에서도 해당 노드 정보를 제거
    if (deleteChanges.length > 0) {
      // 현재 저장된 노드 위치 정보 가져오기
      try {
        const savedPositionsStr = localStorage.getItem(STORAGE_KEY);
        if (savedPositionsStr) {
          const savedPositions = JSON.parse(savedPositionsStr);
          
          // 삭제된 노드 ID 목록
          const deletedNodeIds = deleteChanges.map(change => change.id);
          
          // 삭제된 노드 ID를 제외한 새 위치 정보 객체 생성
          const updatedPositions = Object.fromEntries(
            Object.entries(savedPositions).filter(([id]) => !deletedNodeIds.includes(id))
          );
          
          // 업데이트된 위치 정보 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPositions));
          
          // 엣지 정보도 업데이트 (삭제된 노드와 연결된 엣지 제거)
          const savedEdgesStr = localStorage.getItem(EDGES_STORAGE_KEY);
          if (savedEdgesStr) {
            const savedEdges = JSON.parse(savedEdgesStr);
            const updatedEdges = savedEdges.filter(
              (edge: any) => 
                !deletedNodeIds.includes(edge.source) && 
                !deletedNodeIds.includes(edge.target)
            );
            localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
          }
          
          // 저장 상태 플래그 업데이트
          hasUnsavedChanges.current = true;
        }
      } catch (err) {
        console.error('노드 삭제 정보 저장 실패:', err);
      }
    }
    
    // applyNodeChanges 함수를 사용하여 적절하게 노드 변경사항 적용
    setNodes((nds) => {
      return applyNodeChanges(changes, nds) as Node<CardData>[];
    });
    
    // 위치 변경이 있는 경우에만 저장 상태로 표시
    const positionChanges = changes.filter(
      (change) => change.type === 'position' && change.dragging === false
    );
    
    if (positionChanges.length > 0 || deleteChanges.length > 0) {
      hasUnsavedChanges.current = true;
    }
  }, [setNodes]);

  /**
   * 노드 클릭 핸들러: 노드 선택 처리
   * @param event 마우스 이벤트
   * @param node 클릭된 노드
   */
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<CardData>) => {
    // 다중 선택 모드 (Ctrl/Cmd 키 누른 상태)
    const isMultiSelectMode = event.ctrlKey || event.metaKey;
    
    // 노드 id 가져오기
    const nodeId = node.id;
    
    // 기본 이벤트 관리
    event.stopPropagation();
    
    if (isMultiSelectMode) {
      // 다중 선택 모드: 선택된 카드 목록에 추가/제거
      console.log('다중 선택 모드로 노드 클릭:', node.id);
      
      // 토스트 메시지 결정을 위해 현재 선택 상태 미리 확인
      const isCurrentlySelected = selectedCardIds.includes(nodeId);
      
      // 상태 업데이트
      toggleSelectedCard(nodeId);
      
      // 성공 메시지 표시 - 다중 선택 모드
      if (isCurrentlySelected) {
        toast.success(`'${node.data.title}'가 선택에서 제거되었습니다.`);
      } else {
        toast.success(`'${node.data.title}'가 선택에 추가되었습니다.`);
      }
    } else {
      // 단일 선택 모드: 하나만 선택
      console.log('단일 선택 모드로 노드 클릭:', node.id);
      
      // 이미 선택된 카드를 다시 클릭하는 경우 처리
      if (selectedCardIds.length === 1 && selectedCardIds[0] === nodeId) {
        // 동일한 카드 재선택 - 아무것도 하지 않음
        console.log('이미 선택된 카드 재선택:', nodeId);
      } else {
        // 새로운 카드 선택
        selectCard(nodeId);
        
        // 성공 메시지 표시 - 단일 선택 모드
        toast.success(`'${node.data.title}'가 선택되었습니다.`);
      }
    }
    
    // props로 전달된 콜백이 있다면 실행
    if (onSelectCard) {
      onSelectCard(nodeId);
    }
  }, [onSelectCard, selectedCardIds, selectCard, toggleSelectedCard]);

  /**
   * 패널 클릭 핸들러 (빈 공간 클릭)
   * @param event 마우스 이벤트
   */
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Ctrl/Meta 키가 눌려있지 않은 경우에만 모든 선택 해제
    if (!(event.ctrlKey || event.metaKey)) {
      // 선택된 카드가 있을 때만 토스트 표시 및 선택 해제
      if (selectedCardIds.length > 0) {
        if (selectedCardIds.length > 1) {
          toast.info(`${selectedCardIds.length}개 카드 선택이 해제되었습니다.`);
        } else {
          toast.info('카드 선택이 해제되었습니다.');
        }
        
        // 선택 해제
        clearSelectedCards();
        if (onSelectCard) {
          onSelectCard(null);
        }
      }
    }
  }, [onSelectCard, selectedCardIds, clearSelectedCards]);

  /**
   * 레이아웃 저장
   * @param nodesToSave 저장할 노드 배열 (기본값은 현재 노드)
   * @returns 저장 성공 여부
   */
  const saveLayout = useCallback((nodesToSave = nodes) => {
    try {
      // 노드 ID와 위치만 저장
      const nodePositions = nodesToSave.reduce((acc: Record<string, { position: XYPosition }>, node: Node<CardData>) => {
        acc[node.id] = { position: node.position };
        return acc;
      }, {});
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodePositions));
      
      return true;
    } catch (err) {
      console.error('레이아웃 저장 실패:', err);
      return false;
    }
  }, [nodes]);

  return {
    nodes,
    setNodes,
    handleNodesChange,
    handleNodeClick,
    handlePaneClick,
    saveLayout,
    hasUnsavedChanges
  };
} 