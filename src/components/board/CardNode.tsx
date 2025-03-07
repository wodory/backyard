import React, { useMemo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
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
export default function CardNode({ data, isConnectable, selected }: NodeProps) {
  // 카드 접기/펴기 상태
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  // 핸들러 크기 정의 - UI Config에서 가져온 값 사용
  const handleSize = 12; // 크기 고정
  
  // 핸들러 위치 계산 - 보더의 정중앙에 위치하도록 정확히 설정
  const handleOffset = 0; // 오프셋 0으로 변경, transform으로 위치 조정
  
  // 핸들러 스타일 - 그림자 효과 제거
  const handleStyleBase = {
    width: handleSize,
    height: handleSize,
    background: '#fff',
    border: `2px solid ${connectionLineColor}`,
    borderRadius: '50%',
    zIndex: 20, // 높은 z-index 값
    transition: 'all 0.2s ease' // 부드러운 전환 효과
  };
  
  // 카드 높이 계산 (접힌 상태와 펼쳐진 상태)
  const cardHeight = isExpanded ? 'auto' : '40px';
  
  // 카드 너비
  const cardWidth = 280;
  
  // 접기/펴기 상태에 따른 좌우 핸들러 위치 조정
  const verticalHandlePosition = isExpanded ? 140 : 20;

  return (
    <div 
      className="card-node-container"
      style={{ 
        position: 'relative',
        width: `${cardWidth}px`,
        zIndex: selected ? 5 : 1
      }}
    >
      <div
        className={`card-node ${selected ? 'selected' : ''}`} 
        style={{ 
          width: '100%',
          backgroundColor: selected ? selectedBackgroundColor : '#ffffff',
          borderRadius: '8px',
          border: `${borderWidth}px solid ${selected ? connectionLineColor : '#C1C1C1'}`,
          transition: 'height 0.3s ease, background-color 0.2s ease, border-color 0.2s ease',
          height: cardHeight,
          overflow: isExpanded ? 'auto' : 'hidden',
          maxHeight: isExpanded ? '280px' : '40px'
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
            onClick={() => setIsExpanded(!isExpanded)}
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
        className="nodrag handle-top"
        style={{
          ...handleStyleBase,
          top: 0,
          left: cardWidth / 2,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* 왼쪽 핸들러 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className="nodrag handle-left"
        style={{
          ...handleStyleBase,
          left: 0,
          top: verticalHandlePosition,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* 오른쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className="nodrag handle-right"
        style={{
          ...handleStyleBase,
          right: 0,
          top: verticalHandlePosition,
          transform: 'translate(50%, -50%)'
        }}
      />
      
      {/* 아래쪽 핸들러 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className="nodrag handle-bottom"
        style={{
          ...handleStyleBase,
          bottom: 0,
          left: cardWidth / 2,
          transform: 'translate(-50%, 50%)'
        }}
      />
    </div>
  );
} 