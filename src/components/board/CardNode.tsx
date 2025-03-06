import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';

// 카드 노드 컴포넌트 정의
export default function CardNode({ data, isConnectable, sourcePosition, targetPosition }: NodeProps) {
  // sourcePosition과 targetPosition이 없으면 기본값 사용
  const sourcePos = sourcePosition || Position.Bottom;
  const targetPos = targetPosition || Position.Top;
  
  return (
    <div className="min-w-[280px] max-w-[280px]">
      <Card className="border shadow-md hover:shadow-lg transition-shadow">
        {/* 노드 연결 핸들(타겟 - 들어오는 연결) */}
        <Handle
          type="target"
          position={targetPos}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-primary"
        />
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold truncate">{data.title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {new Date(data.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="text-sm line-clamp-3">
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
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-end">
          <Link href={`/cards/${data.id}`} passHref>
            <Button size="sm" variant="outline">자세히 보기</Button>
          </Link>
        </CardFooter>
        
        {/* 노드 연결 핸들(소스 - 나가는 연결) */}
        <Handle
          type="source"
          position={sourcePos}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-primary"
        />
      </Card>
    </div>
  );
} 