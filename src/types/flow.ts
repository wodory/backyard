export interface NodeData {
  id: string;
  title: string;
  content: string;
  type?: string;
  width?: number;
  height?: number;
  color?: string;
  tags?: string[];
  position?: {
    x: number;
    y: number;
  };
  // 추가 속성들
  [key: string]: any;
} 