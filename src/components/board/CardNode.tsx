import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
import { CSSProperties } from 'react';

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
export default function CardNode({ data, isConnectable, selected, id }: NodeProps) {
  // 카드 접기/펴기 상태
  const [isExpanded, setIsExpanded] = useState(false);
  // 호버 상태 추가
  const [isHovered, setIsHovered] = useState(false);
  // 노드의 실제 높이를 저장하기 위한 ref
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // ReactFlow 인스턴스 가져오기
  const { getNodes, setNodes } = useReactFlow();
  // 노드 내부 구조 업데이트 훅 추가
  const updateNodeInternals = useUpdateNodeInternals();
  
  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
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
    }
    // 단일 클릭은 ReactFlow가 처리하도록 전파 - 추가 로직 없음
  }, [isExpanded]);
  
  // 접기/펼치기 토글 핸들러
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
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
  
  // 노드가 선택되거나 호버 상태가 변경될 때도 업데이트
  useEffect(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [id, selected, isHovered, updateNodeInternals]);
  
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
  const handleSize = 10; // 정확히 10px로 고정
  
  // 카드 너비
  const cardWidth = 280;
  
  // 핸들러 스타일 - 기본 스타일 (핸들러 스타일을 useMemo로 최적화)
  const handleStyleBase = useMemo(() => ({
    width: handleSize,
    height: handleSize,
    backgroundColor: '#fff',
    border: `2px solid ${connectionLineColor}`, // 모든 상태에서 동일한 테두리 색상 사용
    borderRadius: '50%',
    zIndex: 100, // z-index 증가
    padding: 0,
    margin: 0,
    opacity: 1, // 항상 핸들러 표시
    visibility: 'visible' as const, // 명시적으로 visible 설정
    pointerEvents: 'auto' as const,
    // 랜더링 최적화
    willChange: 'transform',
  }), [connectionLineColor]);
  
  // 핸들러 위치 계산 함수 - 모든 상태에서 완전히 동일한 스타일 사용
  const getHandleStyle = useCallback((position: 'top' | 'right' | 'bottom' | 'left') => {
    // 핸들 위치에 대한 기본 스타일 생성 (항상 새 객체 생성)
    const style: React.CSSProperties = { ...handleStyleBase };
    
    // 정확한 소수점 계산을 위한 상수
    const halfSize = handleSize / 2;
    
    // 모든 상태에서 완전히 동일한 위치 계산 (정수 값 사용)
    switch (position) {
      case 'top':
        style.top = -halfSize; // handleSize의 절반만큼 위로
        // transform이 CSS에서 무시되므로 직접 계산 (노드 너비의 절반 - 핸들 너비의 절반)
        style.left = `calc(50% - ${halfSize}px)`;
        // transform 속성 제거 (CSS에서 무시됨)
        style.transform = 'none';
        break;
      case 'right':
        style.right = -halfSize; // handleSize의 절반만큼 오른쪽으로
        // transform이 CSS에서 무시되므로 직접 계산 (노드 높이의 절반 - 핸들 높이의 절반)
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'bottom':
        style.bottom = -halfSize; // handleSize의 절반만큼 아래로
        // transform이 CSS에서 무시되므로 직접 계산 (노드 너비의 절반 - 핸들 너비의 절반)
        style.left = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
      case 'left':
        style.left = -halfSize; // handleSize의 절반만큼 왼쪽으로
        // transform이 CSS에서 무시되므로 직접 계산 (노드 높이의 절반 - 핸들 높이의 절반)
        style.top = `calc(50% - ${halfSize}px)`;
        style.transform = 'none';
        break;
    }
    
    return style;
  }, [handleStyleBase, handleSize]);
  
  // 카드 높이 계산 (접힌 상태와 펼쳐진 상태)
  const cardHeight = isExpanded ? 'auto' : '40px';

  // 트랜지션 종료 이벤트 핸들러 - 애니메이션 완료 후 항상 업데이트
  const handleTransitionEnd = useCallback(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [id, updateNodeInternals]);

  return (
    <div 
      className={`card-node-container ${selected ? 'selected' : ''}`}
      style={{ 
        position: 'relative',
        width: `${cardWidth}px`,
        zIndex: selected ? 5 : 1
      }}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={nodeRef}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`card-node ${selected ? 'selected' : ''}`} 
        style={{ 
          width: '100%',
          backgroundColor: selected ? selectedBackgroundColor : '#ffffff',
          borderRadius: '8px',
          border: `${borderWidth}px solid ${selected ? connectionLineColor : '#C1C1C1'}`,
          transition: 'all 0.2s ease',
          height: cardHeight,
          overflow: isExpanded ? 'auto' : 'hidden',
          maxHeight: isExpanded ? '280px' : '40px',
          boxShadow: selected ? `0 0 0 2px ${connectionLineColor}` : 'none'
        }}
      >
        {/* 카드 헤더 */}
        <div className="card-header" style={{ 
          padding: '0 12px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          height: '40px'
        }}>
          <h3 className="text-md font-semibold truncate text-center flex-grow" style={{
            margin: 0,
            lineHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px'
          }}>
            {data.title}
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
            fontSize: '0.6rem',
            maxHeight: '240px',
            overflow: 'auto'
          }}>
            <div className="tiptap-content" style={{ fontSize: '0.8rem' }}>
              <TiptapViewer content={data.content} />
            </div>
            
            {/* 태그 표시 */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.tags.map((tag: string, index: number) => (
                  <div key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center">
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
      </div>
      
      {/* 핸들러 - 카드 외부에 위치 */}
      {/* 위쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        className="nodrag handle-top visible-handle" // visible-handle 클래스 추가
        style={getHandleStyle('top')}
      />
      
      {/* 왼쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className="nodrag handle-left visible-handle" // visible-handle 클래스 추가
        style={getHandleStyle('left')}
      />
      
      {/* 오른쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className="nodrag handle-right visible-handle" // visible-handle 클래스 추가
        style={getHandleStyle('right')}
      />
      
      {/* 아래쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className="nodrag handle-bottom visible-handle" // visible-handle 클래스 추가
        style={getHandleStyle('bottom')}
      />
    </div>
  );
} 