/**
 * 파일명: NodeInspector.tsx
 * 목적: 노드 상세 정보를 모달로 표시하는 컴포넌트
 * 역할: 선택된 노드의 정보를 검사하고 표시
 * 작성일: 2025-03-28
 * 수정일: 2025-04-15
 * 수정일: 2025-04-21 : useNodeStore 제거 및 useAppStore(cardStateSlice) 사용으로 변경
 */

import { useEffect, useMemo } from 'react';

import { Node } from '@xyflow/react';

import TiptapViewer from '@/components/editor/TiptapViewer';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/useAppStore';

interface NodeInspectorProps {
  nodes: Node[];
}

// 노드 데이터 타입 정의
interface NodeData {
  title?: string;
  content?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * NodeInspector: 노드의 상세 정보를 모달로 표시하는 컴포넌트
 * @param {NodeInspectorProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 노드 인스펙터 컴포넌트
 */
export function NodeInspector({ nodes }: NodeInspectorProps) {
  const expandedCardId = useAppStore((state) => state.expandedCardId);
  const toggleExpandCard = useAppStore((state) => state.toggleExpandCard);

  // 확장된 노드 찾기
  const inspectedNode = useMemo(() => {
    if (!expandedCardId) return null;
    return nodes.find(node => node.id === expandedCardId) || null;
  }, [nodes, expandedCardId]);

  // 모달이 닫힐 때 expandedCardId 초기화
  const handleCloseModal = () => {
    if (expandedCardId) {
      toggleExpandCard(expandedCardId);
    }
  };

  // 노드 정보가 없거나 모달이 닫혀있으면 열린 상태로 렌더링하지만 보이지 않게 함
  const shouldShowContent = Boolean(expandedCardId && inspectedNode);

  // 타입 안전을 위한 데이터 접근
  const nodeData = inspectedNode?.data as NodeData | undefined;

  return (
    <Modal.Root open={shouldShowContent} onOpenChange={handleCloseModal}>
      <Modal.Content>
        {shouldShowContent && inspectedNode && (
          <>
            <Modal.Title>
              {nodeData?.title || '제목 없음'}
            </Modal.Title>

            <div className="py-4">
              {/* 노드 ID 정보 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">ID</h3>
                <code className="bg-muted p-1 rounded text-xs">{inspectedNode.id}</code>
              </div>

              {/* 노드 내용 */}
              {nodeData?.content && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">내용</h3>
                  <div className="bg-muted p-2 rounded">
                    <TiptapViewer content={nodeData.content} />
                  </div>
                </div>
              )}

              {/* 노드 태그 */}
              {nodeData?.tags && nodeData.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">태그</h3>
                  <div className="flex flex-wrap gap-1">
                    {nodeData.tags.map((tag: string) => (
                      <Badge key={tag} data-testid="node-tag">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 노드 위치 정보 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">위치</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-1 rounded">
                    X: {Math.round(inspectedNode.position.x)}
                  </div>
                  <div className="bg-muted p-1 rounded">
                    Y: {Math.round(inspectedNode.position.y)}
                  </div>
                </div>
              </div>

              {/* 연결된 노드 표시 (옵션) */}
              {nodes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">연결</h3>
                  <div className="text-xs text-muted-foreground">
                    연결 정보는 구현 중입니다...
                  </div>
                </div>
              )}
            </div>

            <Modal.Close>
              닫기
            </Modal.Close>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  );
} 