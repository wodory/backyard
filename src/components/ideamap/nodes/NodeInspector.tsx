/**
 * 파일명: NodeInspector.tsx
 * 목적: 노드 상세 정보를 모달로 표시하는 컴포넌트
 * 역할: 선택된 노드의 정보를 검사하고 표시
 * 작성일: 2025-03-28
 * 수정일: 2025-04-15
 */

import { useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { useNodeStore } from '@/store/useNodeStore';

interface NodeInspectorProps {
  nodes: Node[];
}

/**
 * NodeInspector: 노드의 상세 정보를 모달로 표시하는 컴포넌트
 * @param {NodeInspectorProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 노드 인스펙터 컴포넌트
 */
export function NodeInspector({ nodes }: NodeInspectorProps) {
  const { inspectorOpen, inspectedNode, setInspectorOpen, setInspectedNode } = useNodeStore();

  // 모달이 닫힐 때 inspectedNode 초기화
  const handleCloseModal = () => {
    setInspectorOpen(false);
  };

  // 노드 정보가 없거나 모달이 닫혀있으면 열린 상태로 렌더링하지만 보이지 않게 함
  const shouldShowContent = inspectorOpen && inspectedNode;

  return (
    <Modal.Root open={Boolean(shouldShowContent)} onOpenChange={handleCloseModal}>
      <Modal.Content>
        {shouldShowContent && (
          <>
            <Modal.Title>
              {inspectedNode.data?.title || '제목 없음'}
            </Modal.Title>

            <div className="py-4">
              {/* 노드 ID 정보 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">ID</h3>
                <code className="bg-muted p-1 rounded text-xs">{inspectedNode.id}</code>
              </div>

              {/* 노드 내용 */}
              {inspectedNode.data?.content && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">내용</h3>
                  <div className="bg-muted p-2 rounded">
                    <TiptapViewer content={inspectedNode.data.content} />
                  </div>
                </div>
              )}

              {/* 노드 태그 */}
              {inspectedNode.data?.tags && inspectedNode.data.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">태그</h3>
                  <div className="flex flex-wrap gap-1">
                    {inspectedNode.data.tags.map((tag: string) => (
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