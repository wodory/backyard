import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, NodeToolbar } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
import { CSSProperties } from 'react';
import { NodeInspect } from '@/components/debug/NodeInspector';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Portal } from '@/components/ui/portal';
import { NodeData } from '@/types/flow';

// 헥스 색상을 HSL로 변환하는 함수
const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
  // hex를 RGB로 변환
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// HSL을 헥스 색상으로 변환하는 함수
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
};

// HSL 색상의 명도(L)를 조정하는 함수
const adjustLightness = (color: string, lightnessIncrease: number): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;

  // L값을 증가시키되 100을 초과하지 않도록 함
  const newL = Math.min(100, hsl.l + lightnessIncrease);
  
  // 새로운 HSL 값을 HEX로 변환
  return hslToHex(hsl.h, hsl.s, newL);
};

// 카드 노드 컴포넌트 정의
export default function CardNode({ data, isConnectable, selected, id }: NodeProps<NodeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const { getNode, setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ==================== 상태 관리 최적화 ====================
  // 선택적으로 상태 가져오기 - 필요한 속성만 선택하여 불필요한 리렌더링 방지
  const isMultiSelectMode = useAppStore(state => state.isMultiSelectMode);
  const selectedCardIds = useAppStore(state => state.selectedCardIds);
  const selectCard = useAppStore(state => state.selectCard);
  const addSelectedCard = useAppStore(state => state.addSelectedCard);
  const removeSelectedCard = useAppStore(state => state.removeSelectedCard);
  
  // 배열을 문자열로 변환하여 참조 동등성 문제 방지
  const selectedCardIdsKey = useMemo(() => {
    return selectedCardIds.join(',');
  }, [selectedCardIds]);
  
  // 다중 선택 상태 계산 최적화
  const isMultiSelected = useMemo(() => {
    // 한 번 계산한 결과는 selectedCardIdsKey가 변경될 때만 다시 계산
    return selectedCardIds.includes(id);
    // selectedCardIds 자체가 아닌 selectedCardIdsKey를 의존성으로 사용
  }, [id, selectedCardIdsKey]);
  
  // ==================== Z-INDEX 최적화 (무한 루프 방지) ====================
  // z-index 업데이트를 위한 상태 및 효과
  const prevZIndexRef = useRef<number | null>(null);
  
  useEffect(() => {
    // 선택되지 않은 상태에서는 업데이트 하지 않음
    if (!selected) {
      // 선택 해제 시에도 z-index를 초기화하는 것이 필요하다면
      // 여기에 초기화 로직 추가 가능
      return;
    }
    
    // 중복 업데이트 방지를 위한 함수
    const updateZIndexSafely = () => {
      try {
        // 현재 노드 참조 가져오기
        const currentNode = getNode(id);
        if (!currentNode) return;
        
        // 현재 z-index 값과 새 값 결정
        const currentZIndex = currentNode.zIndex || 0;
        const newZIndex = 1000; // 선택된 노드는 항상 1000으로 설정
        
        // 이미 같은 값이면 업데이트 건너뛰기
        if (currentZIndex === newZIndex && prevZIndexRef.current === newZIndex) {
          return;
        }
        
        // 업데이트는 requestAnimationFrame으로 래핑하여 렌더링 최적화
        const rafId = requestAnimationFrame(() => {
          setNodes(nodes => {
            // 이미 다른 곳에서 업데이트되었는지 확인
            const node = nodes.find(n => n.id === id);
            if (!node || node.zIndex === newZIndex) {
              return nodes; // 이미 업데이트됨, 동일한 배열 반환하여 리렌더링 방지
            }
            
            // 새 노드 배열 생성 (불변성 유지)
            const updatedNodes = nodes.map(n => {
              if (n.id === id) {
                return { ...n, zIndex: newZIndex };
              }
              return n;
            });
            
            // 현재 z-index 값을 ref에 저장
            prevZIndexRef.current = newZIndex;
            
            return updatedNodes;
          });
        });
        
        // 정리 함수
        return () => {
          cancelAnimationFrame(rafId);
        };
      } catch (error) {
        console.error('[CardNode] Z-Index 업데이트 중 오류:', error);
      }
    };
    
    // 초기 호출 지연 - 렌더링 주기와 분리
    const timeoutId = setTimeout(updateZIndexSafely, 10);
    return () => clearTimeout(timeoutId);
  }, [id, selected, getNode, setNodes]);
  
  // 접기/펼치기 토글 핸들러
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // Cmd/Ctrl 키와 함께 클릭하면 다중 선택 처리
    if (event.ctrlKey || event.metaKey) {
      event.stopPropagation(); // ReactFlow 기본 선택 동작 중지
      
      if (isMultiSelected) {
        // 이미 선택된 경우 선택 해제
        removeSelectedCard(id);
      } else {
        // 선택되지 않은 경우 선택 추가
        addSelectedCard(id);
      }
      return;
    }
    
    // 이벤트 전파 중지하지 않음 - ReactFlow가 노드 선택을 처리하도록 함
    // 단, 토글 버튼이나 링크 클릭 시에는 전파 중지
    if (
      (event.target as HTMLElement).tagName === 'BUTTON' || 
      (event.target as HTMLElement).closest('button') || 
      (event.target as HTMLElement).tagName === 'A'
    ) {
      event.stopPropagation(); // 버튼이나 링크만 이벤트 전파 중지
      return;
    }
    
    // 더블 클릭은 확장 상태 토글로 처리
    if (event.detail === 2) { 
      event.stopPropagation(); // 더블 클릭은 이벤트 전파 중지
      setIsExpanded(!isExpanded);
    } else {
      // 단일 클릭은 단일 카드 선택
      selectCard(id);
    }
  }, [isExpanded, id, isMultiSelected, selectCard, addSelectedCard, removeSelectedCard]);
  
  // 상태 변경 시 노드 내부 업데이트
  useEffect(() => {
    // 노드가 펼쳐지거나 접힐 때 핸들 위치 업데이트
    if (id) {
      // 일련의 업데이트를 통해 핸들 위치가 정확히 계산되도록 함
      // 1. 즉시 업데이트 
      updateNodeInternals(id);
      
      // 2. 약간의 지연 후 업데이트 (레이아웃 변경 직후)
      const timeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 50);
      
      // 3. 트랜지션 완료 후 업데이트 (애니메이션 완료 후)
      const secondTimeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 250);
      
      // 4. 최종 업데이트 (모든 렌더링이 안정화된 후)
      const finalTimeoutId = setTimeout(() => {
        updateNodeInternals(id);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(secondTimeoutId);
        clearTimeout(finalTimeoutId);
      };
    }
  }, [isExpanded, id, updateNodeInternals]);
  
  // 노드가 선택되거나 호버 상태, 다중 선택 상태가 변경될 때도 업데이트
  useEffect(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [selected, isMultiSelected, isHovered, id, updateNodeInternals]);
  
  // 마우스 오버 핸들러
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  // 마우스 아웃 핸들러
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // UI 설정에서 데이터 가져오기
  const uiConfig = useMemo(() => {
    try {
      return loadDefaultBoardUIConfig();
    } catch (error) {
      console.error('UI 설정 로드 실패, 기본값 사용:', error);
      return {
        board: { edgeColor: '#FF0072' },
        handles: { size: 8, backgroundColor: 'white', borderColor: '#FF0072', borderWidth: 2 }
      };
    }
  }, []);
  
  // 연결선 색상
  const connectionLineColor = useMemo(() => {
    return uiConfig.board.edgeColor;
  }, [uiConfig]);
  
  // 선택된 카드 배경색
  const selectedBackgroundColor = "#FFD3E6"; // 요구사항에 맞게 변경
  
  // 외곽선 두께 (연결선과 통일)
  const borderWidth = 2; // 항상 2px로 고정
  
  // 핸들러 크기 정의 
  const handleSize = 12; // 10px에서 12px로 크기 증가
  
  // 카드 너비 - 설정 파일에서 가져오기
  const cardWidth = (uiConfig as any).card?.nodeSize?.width || 280;
  
  // 카드 헤더 높이 - 설정 파일에서 가져오기
  const cardHeaderHeight = (uiConfig as any).card?.nodeSize?.height || 40;
  
  // 카드 최대 높이 - 설정 파일에서 가져오기
  const cardMaxHeight = (uiConfig as any).card?.nodeSize?.maxHeight || 240;
  
  // 폰트 크기 - 설정 파일에서 가져오기
  const defaultFontSize = (uiConfig as any).card?.fontSizes?.default || 16;
  const titleFontSize = (uiConfig as any).card?.fontSizes?.title || 16;
  const contentFontSize = (uiConfig as any).card?.fontSizes?.content || 16;
  const tagsFontSize = (uiConfig as any).card?.fontSizes?.tags || 12;
  
  // 핸들러 스타일 - 기본 스타일 (핸들러 스타일을 useMemo로 최적화)
  const handleStyleBase = useMemo(() => ({
    width: handleSize,
    height: handleSize,
    backgroundColor: '#fff',
    border: `2px solid ${connectionLineColor}`, // 모든 상태에서 동일한 테두리 색상 사용
    borderRadius: '50%',
    zIndex: 100,
    padding: 0,
    margin: 0,
    // opacity와 visibility 속성 제거하여 CSS로 제어
    pointerEvents: 'auto' as const,
    // 랜더링 최적화
    willChange: 'transform',
  }), [connectionLineColor, handleSize]);
  
  // 핸들러 위치 계산 함수 - 모든 상태에서 완전히 동일한 스타일 사용
  const getHandleStyle = useCallback((position: 'top' | 'right' | 'bottom' | 'left') => {
    // 핸들 위치에 대한 기본 스타일 생성 (항상 새 객체 생성)
    const style: React.CSSProperties = { ...handleStyleBase };
    
    // 정확한 소수점 계산을 위한 상수
    const halfSize = handleSize / 2;
    
    // 모든 상태에서 완전히 동일한 위치 계산 (정수 값 사용)
    switch (position) {
      case 'top':
        style.top = -6; // 정확히 위치 지정 (12px의 절반이므로 6px)
        style.left = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'right':
        style.right = -6; // 정확히 위치 지정
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'bottom':
        style.bottom = -6; // 정확히 위치 지정
        style.left = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'left':
        style.left = -6; // 정확히 위치 지정
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
    }
    
    return style;
  }, [handleStyleBase, handleSize]);
  
  // 카드 높이 계산 (접힌 상태와 펼쳐진 상태)
  const cardHeight = isExpanded ? 'auto' : `${cardHeaderHeight}px`;

  // 트랜지션 종료 이벤트 핸들러 - 애니메이션 완료 후 항상 업데이트
  const handleTransitionEnd = useCallback(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [id, updateNodeInternals]);

  // 현재 노드가 드래그 중인지 확인 (ReactFlow 상태에서)
  const currentNode = getNode(id);
  const isDragging = currentNode?.dragging || false;

  // 카드가 활성화된 상태인지 확인 (선택됨, 펼쳐짐, 드래그 중, 호버 상태 중 하나라도 해당됨)
  const isActive = selected || isExpanded || isDragging || isHovered || isMultiSelected;

  // 노드 스타일 계산 (원래 스타일에 다중 선택 상태 추가)
  const getNodeStyle = () => {
    const style: CSSProperties = {
      width: `${cardWidth}px`,
      height: cardHeight,
      border: `${borderWidth}px solid ${selected ? connectionLineColor : isMultiSelected ? '#4CAF50' : '#e2e8f0'}`,
      backgroundColor: selected ? selectedBackgroundColor : isMultiSelected ? '#E8F5E9' : '#fff',
      transition: 'height 0.2s ease-in-out, background-color 0.2s ease',
      overflow: 'visible', // 핸들이 잘리지 않도록 오버플로우 설정
      position: 'relative',
      zIndex: isActive ? 9999 : 1, // 활성화된 카드는 항상 최상위에 표시
      isolation: 'isolate', // 새로운 쌓임 맥락 생성
      transformStyle: 'preserve-3d', // 3D 공간에서의 렌더링 최적화
      willChange: 'transform, height', // 변환 및 높이 변경 최적화
    };
    
    // 다중 선택된 경우 테두리 색상 변경
    if (isMultiSelected) {
      style.borderColor = '#4CAF50'; // 다중 선택 시 녹색 테두리
      style.borderWidth = 3; // 다중 선택 시 테두리 두께 증가
    }
    
    return style;
  };

  // 스타일 계산 최적화 (메모이제이션 적용)
  const cardStyle = useMemo(() => {
    return {
      background: hexToHsl(data.backgroundColor), // 첫 번째 인자만 전달
      borderColor: isMultiSelected 
        ? 'rgb(37, 99, 235)' // 다중 선택 시 진한 파란색
        : selected 
          ? 'rgb(59, 130, 246)' // 단일 선택 시 파란색
          : 'transparent',
      borderWidth: (isMultiSelected || selected) ? '2px' : '1px'
    };
  }, [data.backgroundColor, isMultiSelected, selected]);

  return (
    <div
      data-node-id={id}
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onTransitionEnd={handleTransitionEnd}
      className={`card-node-container card-node bg-white rounded-md ${selected ? 'ring-2 ring-blue-400' : ''} ${isHovered ? 'hovered' : ''} ${isMultiSelected ? 'multi-selected' : ''}`}
      style={getNodeStyle()}
    >
      {/* NodeInspect는 개발 중에만 필요하므로 완전히 비활성화하여 타입 오류 방지 */}
      {/* 
        개발 모드에서도 타입 오류를 방지하기 위해 비활성화
        필요한 속성(type, dragging, zIndex 등)이 없어 TypeScript 오류 발생
      */}
      {/*
      {process.env.NODE_ENV === 'development' && false && (
        <Portal>
          <NodeInspect 
            id={id} 
            data={data} 
            selected={selected}
          />
        </Portal>
      )}
      */}
      
      {/* 다중 선택 표시기 */}
      {isMultiSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-50">
          ✓
        </div>
      )}
      
      {/* 카드 헤더 */}
      <div className="card-header" style={{ 
        padding: '0 12px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
        height: `${cardHeaderHeight}px`
      }}>
        <h3 className="text-md font-semibold text-center flex-grow" style={{
          margin: 0,
          lineHeight: `${cardHeaderHeight}px`,
          alignItems: 'center',
          justifyContent: 'center',
          height: `${cardHeaderHeight}px`,
          fontSize: `${titleFontSize}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 4px'
        }}>
          {(data as any).title}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-6 w-6 ml-2"
          onClick={toggleExpand}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>
      
      {/* 카드 콘텐츠 - 펼쳐진 상태에서만 보임 */}
      {isExpanded && (
        <div className="card-content" style={{ 
          padding: '8px 12px',
          fontSize: `${contentFontSize}px`,
          maxHeight: `${cardMaxHeight}px`,
          overflow: 'auto'
        }}>
          <div className="tiptap-content" style={{ fontSize: `${contentFontSize}px` }}>
            <TiptapViewer content={(data as any).content || ''} />
          </div>
          
          {/* 태그 표시 */}
          {(data as any).tags && (data as any).tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {((data as any).tags || []).map((tag: string, index: number) => (
                <div key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center" style={{ fontSize: `${tagsFontSize}px` }}>
                  <Tag size={10} className="mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          )}
          
          {/* 카드 푸터 */}
          <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={`/cards/${data.id}`} passHref>
              <Button size="sm" variant="outline">자세히 보기</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* 핸들러 - 카드 외부에 위치 */}
      {/* 위쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        className="nodrag handle-top" // visible-handle 클래스 제거
        style={getHandleStyle('top')}
      />
      
      {/* 왼쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className="nodrag handle-left" // visible-handle 클래스 제거
        style={getHandleStyle('left')}
      />
      
      {/* 오른쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className="nodrag handle-right" // visible-handle 클래스 제거
        style={getHandleStyle('right')}
      />
      
      {/* 아래쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className="nodrag handle-bottom" // visible-handle 클래스 제거
        style={getHandleStyle('bottom')}
      />
    </div>
  );
} 