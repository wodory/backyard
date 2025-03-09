import { useStore } from '@xyflow/react';
import { shallow } from 'zustand/shallow';

/**
 * ViewportLogger 컴포넌트는 현재 React Flow 뷰포트의 상태를 표시합니다.
 * x, y 위치와 줌 레벨을 실시간으로 보여줍니다.
 */
const selector = (state: any) => ({
  x: state.transform?.[0] || 0,
  y: state.transform?.[1] || 0,
  zoom: state.transform?.[2] || 1,
});

export function ViewportLogger() {
  const { x, y, zoom } = useStore(selector, shallow);

  return (
    <div className="bg-muted p-2 rounded border text-xs mt-2">
      <h3 className="font-bold mb-1 border-b pb-1">뷰포트 로거</h3>
      <div>
        <span>x: {x.toFixed(2)}</span>, <span>y: {y.toFixed(2)}</span>, <span>zoom: {zoom.toFixed(2)}</span>
      </div>
    </div>
  );
} 