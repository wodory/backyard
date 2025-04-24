/**
 * 파일명: NodeSizeSettings.tsx
 * 목적: 노드 크기 설정 컴포넌트 제공
 * 역할: 사용자가 노드 크기를 조정할 수 있는 UI 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-04-21 : ThemeContext 대신 useAppStore(themeSlice) 사용으로 변경
 */

'use client';

import { useState, useEffect } from 'react';

import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from '@/store/useAppStore';

/**
 * NodeSizeSettings: 노드 크기 조정 컴포넌트
 * @returns 노드 크기 설정 UI 컴포넌트
 */
export function NodeSizeSettings() {
  const { getNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  // Zustand 스토어에서 테마 관련 상태와 액션 가져오기
  const ideaMapSettings = useAppStore(state => state.ideaMapSettings);
  const updateIdeaMapSettings = useAppStore(state => state.updateIdeaMapSettings);

  const [width, setWidth] = useState(ideaMapSettings.nodeWidth);
  const [height, setHeight] = useState(ideaMapSettings.nodeSpacing);
  const [maxHeight, setMaxHeight] = useState(ideaMapSettings.maxNodeHeight); // 기본 최대 높이 값

  // 입력값이 변경될 때 로컬 상태 업데이트
  const handleWidthChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(numValue) && numValue > 0) {
      setWidth(numValue);
    }
  };

  const handleHeightChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(numValue) && numValue > 0) {
      setHeight(numValue);
    }
  };

  const handleMaxHeightChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(numValue) && numValue > 0) {
      setMaxHeight(numValue);
    }
  };

  // 테마에 변경사항 적용
  const applyChanges = () => {
    // Zustand 스토어 업데이트
    updateIdeaMapSettings({
      nodeWidth: width,
      nodeSpacing: height,
      // 최대 높이는 새로운 속성으로 추가할 수 있음
      maxNodeHeight: maxHeight
    });

    // 모든 노드 업데이트 (내부 상태 갱신)
    setTimeout(() => {
      console.log('모든 노드 내부 상태 업데이트');
      getNodes().forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 100);
  };

  // 설정 초기화
  const resetToDefaults = () => {
    // 기본값으로 되돌리기
    const defaultWidth = 250;
    const defaultHeight = 50;
    const defaultMaxHeight = 300;

    setWidth(defaultWidth);
    setHeight(defaultHeight);
    setMaxHeight(defaultMaxHeight);

    // Zustand 스토어 업데이트
    updateIdeaMapSettings({
      nodeWidth: defaultWidth,
      nodeSpacing: defaultHeight,
      maxNodeHeight: defaultMaxHeight
    });

    // 모든 노드 업데이트
    setTimeout(() => {
      getNodes().forEach(node => {
        updateNodeInternals(node.id);
      });
    }, 100);
  };

  // 테마가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setWidth(ideaMapSettings.nodeWidth);
    setHeight(ideaMapSettings.nodeSpacing);
    setMaxHeight(ideaMapSettings.maxNodeHeight || 300);
  }, [ideaMapSettings.nodeWidth, ideaMapSettings.nodeSpacing, ideaMapSettings.maxNodeHeight]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>노드 크기 설정</CardTitle>
        <CardDescription>
          React Flow 노드의 크기를 조정합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 너비 설정 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="node-width">너비: {width}px</Label>
            <Input
              id="node-width-input"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-20"
              min={80}
              max={500}
            />
          </div>
          <Slider
            id="node-width"
            value={[width]}
            min={80}
            max={300}
            step={10}
            onValueChange={(values: number[]) => handleWidthChange(values[0])}
          />
        </div>

        {/* 높이 설정 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="node-height">헤더 높이: {height}px</Label>
            <Input
              id="node-height-input"
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-20"
              min={30}
              max={100}
            />
          </div>
          <Slider
            id="node-height"
            value={[height]}
            min={30}
            max={100}
            step={2}
            onValueChange={(values: number[]) => handleHeightChange(values[0])}
          />
        </div>

        {/* 최대 높이 설정 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="node-max-height">최대 높이: {maxHeight}px</Label>
            <Input
              id="node-max-height-input"
              type="number"
              value={maxHeight}
              onChange={(e) => handleMaxHeightChange(e.target.value)}
              className="w-20"
              min={100}
              max={500}
            />
          </div>
          <Slider
            id="node-max-height"
            value={[maxHeight]}
            min={100}
            max={500}
            step={20}
            onValueChange={(values: number[]) => handleMaxHeightChange(values[0])}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          기본값으로 초기화
        </Button>
        <Button onClick={applyChanges}>
          변경사항 적용
        </Button>
      </CardFooter>
    </Card>
  );
} 