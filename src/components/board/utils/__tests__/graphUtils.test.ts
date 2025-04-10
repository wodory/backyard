/**
 * 파일명: graphUtils.test.ts
 * 목적: 그래프 유틸리티 함수 테스트
 * 역할: 그래프 관련 순수 함수들의 정상 동작 검증
 * 작성일: 2025-03-28
 * 수정일: 2025-04-01
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Node, Edge, XYPosition, MarkerType, ConnectionLineType } from '@xyflow/react';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { BoardSettings } from '@/lib/board-utils';
import {
  saveLayout,
  saveEdges,
  saveAllLayoutData,
  removeDeletedNodesFromStorage,
  updateNodesWithCardData,
  applyStoredLayout,
  arraysEqual,
  createEdge,
  getDefaultHandles
} from '../graphUtils';

describe('saveLayout', () => {
  // 로컬 스토리지 모킹
  beforeEach(() => {
    // 로컬 스토리지 스파이 설정
    vi.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY) return JSON.stringify({
        '1': { position: { x: 100, y: 100 } },
        '2': { position: { x: 200, y: 200 } },
        '3': { position: { x: 300, y: 300 } }
      });
      if (key === EDGES_STORAGE_KEY) return JSON.stringify([
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '1', target: '3' }
      ]);
      return null;
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(vi.fn());
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation(vi.fn());
    
    // 모든 모킹 초기화
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 모든 모킹 재설정
    vi.resetAllMocks();
  });

  it('노드 배열을 로컬 스토리지에 저장해야 함', () => {
    const nodes: Node[] = [
      { id: '1', position: { x: 100, y: 100 }, data: {} },
      { id: '2', position: { x: 200, y: 200 }, data: {} }
    ];
    
    const result = saveLayout(nodes);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY, 
      expect.any(String)
    );
  });
  
  it('저장 중 오류 발생 시 false를 반환해야 함', () => {
    // 실제 에러를 발생시키도록 설정
    vi.spyOn(window.localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('저장 실패');
    });
    
    const nodes: Node[] = [
      { id: '1', position: { x: 100, y: 100 }, data: {} }
    ];
    
    const result = saveLayout(nodes);
    
    expect(result).toBe(false);
  });
});

describe('saveEdges', () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('엣지 배열을 로컬 스토리지에 저장해야 함', () => {
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' }
    ];
    
    const result = saveEdges(edges);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY, 
      expect.any(String)
    );
  });
  
  it('저장 중 오류 발생 시 false를 반환해야 함', () => {
    // 실제 에러를 발생시키도록 설정
    vi.spyOn(window.localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('저장 실패');
    });
    
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2' }
    ];
    
    const result = saveEdges(edges);
    
    expect(result).toBe(false);
  });
});

describe('saveAllLayoutData', () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('노드와 엣지를 모두 저장해야 함', () => {
    const nodes: Node[] = [
      { id: '1', position: { x: 100, y: 100 }, data: {} }
    ];
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2' }
    ];
    
    const result = saveAllLayoutData(nodes, edges);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });
  
  it('노드 저장이 실패하면 false를 반환해야 함', () => {
    // 실제 에러를 발생시키도록 설정
    vi.spyOn(window.localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('저장 실패');
    });
    
    const nodes: Node[] = [{ id: '1', position: { x: 100, y: 100 }, data: {} }];
    const edges: Edge[] = [{ id: 'e1', source: '1', target: '2' }];
    
    const result = saveAllLayoutData(nodes, edges);
    
    expect(result).toBe(false);
  });
});

describe('removeDeletedNodesFromStorage', () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY) return JSON.stringify({
        '1': { position: { x: 100, y: 100 } },
        '2': { position: { x: 200, y: 200 } },
        '3': { position: { x: 300, y: 300 } }
      });
      if (key === EDGES_STORAGE_KEY) return JSON.stringify([
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '1', target: '3' }
      ]);
      return null;
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('로컬 스토리지에서 삭제된 노드와 관련 엣지를 제거해야 함', () => {
    // 노드 2 삭제
    removeDeletedNodesFromStorage(['2']);
    
    // 삭제된 노드가 제거된 positions 검증
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.any(String)
    );

    // 첫 번째 호출 인자 검증 - 노드 2가 삭제되어야 함
    const firstCallArgs = vi.mocked(localStorage.setItem).mock.calls[0];
    const savedPositions = JSON.parse(firstCallArgs[1]);
    expect(savedPositions).not.toHaveProperty('2');
    expect(savedPositions).toHaveProperty('1');
    expect(savedPositions).toHaveProperty('3');

    // 두 번째 호출 인자 검증 - 노드 2 관련 엣지가 삭제되어야 함
    const secondCallArgs = vi.mocked(localStorage.setItem).mock.calls[1];
    const savedEdges = JSON.parse(secondCallArgs[1]);
    expect(savedEdges.length).toBe(1);
    expect(savedEdges[0].id).toBe('e3');
  });
});

describe('updateNodesWithCardData', () => {
  it('노드 데이터를 카드 데이터로 업데이트해야 함', () => {
    const nodes: Node[] = [
      { id: '1', position: { x: 100, y: 100 }, data: { title: '이전 제목' } },
      { id: '2', position: { x: 200, y: 200 }, data: { title: '변경 없음' } }
    ];
    
    const storeCards = [
      { id: '1', title: '새 제목', content: '새 내용', tags: ['태그1', '태그2'] }
    ];
    
    const updatedNodes = updateNodesWithCardData(nodes, storeCards);
    
    expect(updatedNodes[0].data.title).toBe('새 제목');
    expect(updatedNodes[0].data.content).toBe('새 내용');
    expect(updatedNodes[0].data.tags).toEqual(['태그1', '태그2']);
    
    // 업데이트되지 않은 노드는 그대로 유지되어야 함
    expect(updatedNodes[1].data.title).toBe('변경 없음');
  });
  
  it('cardTags가 있는 카드 데이터로 업데이트해야 함', () => {
    const nodes: Node[] = [
      { id: '1', position: { x: 100, y: 100 }, data: {} }
    ];
    
    const storeCards = [
      { 
        id: '1', 
        title: '제목', 
        content: '내용', 
        cardTags: [
          { tag: { name: '태그1' } },
          { tag: { name: '태그2' } }
        ]
      }
    ];
    
    const updatedNodes = updateNodesWithCardData(nodes, storeCards);
    
    expect(updatedNodes[0].data.tags).toEqual(['태그1', '태그2']);
  });
});

describe('applyStoredLayout', () => {
  it('카드 데이터에 저장된 레이아웃을 적용해야 함', () => {
    const cardsData = [
      { id: '1', title: '카드1', content: '내용1', cardTags: [] },
      { id: '2', title: '카드2', content: '내용2', cardTags: [{ tag: { name: '태그1' } }] }
    ];
    
    const storedLayout = [
      { id: '1', position: { x: 50, y: 50 } }
    ];
    
    const nodes = applyStoredLayout(cardsData, storedLayout);
    
    // 저장된 레이아웃 적용 확인
    expect(nodes[0].position).toEqual({ x: 50, y: 50 });
    expect(nodes[0].type).toBe('card');
    expect(nodes[0].data.tags).toEqual([]);
    
    // 저장된 레이아웃이 없는 노드는 기본 그리드 위치 사용
    expect(nodes[1].position.x).toBeDefined();
    expect(nodes[1].position.y).toBeDefined();
    expect(nodes[1].data.tags).toEqual(['태그1']);
  });
});

describe('arraysEqual', () => {
  it('동일한 배열은 true를 반환해야 함', () => {
    expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    expect(arraysEqual(['c', 'b', 'a'], ['a', 'b', 'c'])).toBe(true);
  });
  
  it('다른 배열은 false를 반환해야 함', () => {
    expect(arraysEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
    expect(arraysEqual(['a', 'b', 'd'], ['a', 'b', 'c'])).toBe(false);
  });
});

describe('createEdge', () => {
  it('설정에 맞는 엣지를 생성해야 함', () => {
    // Date.now 목업으로 일관된 테스트 결과 유지
    const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => 123456789);
    
    const source = 'node1';
    const target = 'node2';
    const boardSettings: BoardSettings = {
      snapToGrid: false,
      snapGrid: [15, 15],
      connectionLineType: ConnectionLineType.Bezier,
      markerEnd: MarkerType.ArrowClosed as MarkerType, // 타입 캐스팅 추가
      strokeWidth: 2,
      markerSize: 20,
      edgeColor: '#ff0000',
      selectedEdgeColor: '#ff0000',
      animated: true
    };
    
    const edge = createEdge(source, target, boardSettings);
    
    expect(edge.id).toBe('node1-node2-123456789');
    expect(edge.source).toBe(source);
    expect(edge.target).toBe(target);
    expect(edge.type).toBe('custom');
    expect(edge.animated).toBe(true);
    expect(edge.style).toEqual({
      strokeWidth: 2,
      stroke: '#ff0000'
    });
    expect(edge.markerEnd).toEqual({
      type: MarkerType.ArrowClosed,
      width: 4,
      height: 4,
      color: '#ff0000'
    });
    
    dateSpy.mockRestore();
  });
  
  it('markerEnd가 false면 마커가 없어야 함', () => {
    const boardSettings: BoardSettings = {
      snapToGrid: false,
      snapGrid: [15, 15],
      connectionLineType: ConnectionLineType.Straight,
      markerEnd: null,
      strokeWidth: 1,
      markerSize: 20,
      edgeColor: '#000000',
      selectedEdgeColor: '#000000',
      animated: false
    };
    
    const edge = createEdge('node1', 'node2', boardSettings);
    
    expect(edge.markerEnd).toBeUndefined();
  });
});

describe('getDefaultHandles', () => {
  it('수평 레이아웃에 대한 핸들을 반환해야 함', () => {
    const { sourceHandle, targetHandle } = getDefaultHandles(true);
    
    expect(sourceHandle).toBe('right');
    expect(targetHandle).toBe('left');
  });
  
  it('수직 레이아웃에 대한 핸들을 반환해야 함', () => {
    const { sourceHandle, targetHandle } = getDefaultHandles(false);
    
    expect(sourceHandle).toBe('bottom');
    expect(targetHandle).toBe('top');
  });
}); 