/**
 * 파일명: useNodeStore.test.ts
 * 목적: useNodeStore 상태 관리 테스트
 * 역할: 노드 인스펙터 관련 상태 관리 로직 테스트
 * 작성일: 2025-03-30
 */

import { Node } from '@xyflow/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useNodeStore } from '@/store/useNodeStore';

describe('useNodeStore', () => {
  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    useNodeStore.setState({
      inspectorOpen: false,
      inspectedNode: null,
    });
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const state = useNodeStore.getState();
    
    expect(state.inspectorOpen).toBe(false);
    expect(state.inspectedNode).toBeNull();
  });

  it('setInspectorOpen 액션이 인스펙터 상태를 변경해야 함', () => {
    const { setInspectorOpen } = useNodeStore.getState();
    
    setInspectorOpen(true);
    
    const state = useNodeStore.getState();
    expect(state.inspectorOpen).toBe(true);
  });

  it('setInspectedNode 액션이 검사 중인 노드를 설정해야 함', () => {
    const { setInspectedNode } = useNodeStore.getState();
    const testNode: Node = {
      id: 'test-node',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: 'Test Node' }
    };
    
    setInspectedNode(testNode);
    
    const state = useNodeStore.getState();
    expect(state.inspectedNode).toEqual(testNode);
  });

  it('inspectNode 액션이 노드를 설정하고 인스펙터를 열어야 함', () => {
    const { inspectNode } = useNodeStore.getState();
    const testNode: Node = {
      id: 'test-node',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: 'Test Node' }
    };
    
    inspectNode(testNode);
    
    const state = useNodeStore.getState();
    expect(state.inspectedNode).toEqual(testNode);
    expect(state.inspectorOpen).toBe(true);
  });

  it('closeInspector 액션이 인스펙터를 닫아야 함', () => {
    const { inspectNode, closeInspector } = useNodeStore.getState();
    const testNode: Node = {
      id: 'test-node',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: 'Test Node' }
    };
    
    // 먼저 인스펙터 열기
    inspectNode(testNode);
    
    // 인스펙터 닫기
    closeInspector();
    
    const state = useNodeStore.getState();
    expect(state.inspectorOpen).toBe(false);
  });
}); 