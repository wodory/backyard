import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Settings, Grid3X3, ArrowRightIcon, Circle, SeparatorHorizontal, Paintbrush, Box } from 'lucide-react';
import { BoardSettings } from '@/lib/board-utils';
import { 
  SNAP_GRID_OPTIONS, 
  CONNECTION_TYPE_OPTIONS, 
  MARKER_TYPE_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  MARKER_SIZE_OPTIONS,
  EDGE_COLOR_OPTIONS,
  EDGE_ANIMATION_OPTIONS
} from '@/lib/board-constants';
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { NodeSizeSettings } from '@/components/settings/NodeSizeSettings';

interface BoardSettingsControlProps {
  settings: BoardSettings;
  onSettingsChange: (settings: BoardSettings) => void;
}

export default function BoardSettingsControl({
  settings,
  onSettingsChange,
}: BoardSettingsControlProps) {
  // 스냅 그리드 값 변경 핸들러
  const handleSnapGridChange = (value: string) => {
    const gridSize = parseInt(value, 10);
    const newSettings = {
      ...settings,
      snapGrid: [gridSize, gridSize] as [number, number],
      snapToGrid: gridSize > 0, // 그리드 크기가 0보다 크면 스냅 활성화
    };
    onSettingsChange(newSettings);
    toast.success('격자 크기가 변경되었습니다.');
  };

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      connectionLineType: value as ConnectionLineType,
    };
    onSettingsChange(newSettings);
    toast.success('연결선 스타일이 변경되었습니다.');
  };

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      markerEnd: value === 'null' ? null : value as MarkerType,
    };
    onSettingsChange(newSettings);
    toast.success('화살표 스타일이 변경되었습니다.');
  };

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = () => {
    const newSettings = {
      ...settings,
      snapToGrid: !settings.snapToGrid,
    };
    onSettingsChange(newSettings);
    toast.success(`격자에 맞추기가 ${newSettings.snapToGrid ? '활성화' : '비활성화'}되었습니다.`);
  };
  
  // 연결선 두께 변경 핸들러
  const handleStrokeWidthChange = (value: string) => {
    const newSettings = {
      ...settings,
      strokeWidth: parseInt(value, 10),
    };
    onSettingsChange(newSettings);
    toast.success('연결선 두께가 변경되었습니다.');
  };
  
  // 마커 크기 변경 핸들러
  const handleMarkerSizeChange = (value: string) => {
    const newSettings = {
      ...settings,
      markerSize: parseInt(value, 10),
    };
    onSettingsChange(newSettings);
    toast.success('화살표 크기가 변경되었습니다.');
  };
  
  // 연결선 색상 변경 핸들러
  const handleEdgeColorChange = (value: string) => {
    const newSettings = {
      ...settings,
      edgeColor: value,
    };
    onSettingsChange(newSettings);
    toast.success('연결선 색상이 변경되었습니다.');
  };
  
  // 선택된 연결선 색상 변경 핸들러
  const handleSelectedEdgeColorChange = (value: string) => {
    const newSettings = {
      ...settings,
      selectedEdgeColor: value,
    };
    onSettingsChange(newSettings);
    toast.success('선택된 연결선 색상이 변경되었습니다.');
  };
  
  // 연결선 애니메이션 변경 핸들러
  const handleAnimatedChange = (value: string) => {
    const newSettings = {
      ...settings,
      animated: value === 'true',
    };
    onSettingsChange(newSettings);
    toast.success(`연결선 애니메이션이 ${newSettings.animated ? '활성화' : '비활성화'}되었습니다.`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>보드 설정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 노드 크기 설정 */}
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Box className="mr-2 h-4 w-4" />
              <span>노드 크기 설정</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <NodeSizeSettings />
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        {/* 스냅 그리드 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Grid3X3 className="mr-2 h-4 w-4" />
            <span>격자에 맞추기</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem 
              checked={settings.snapToGrid}
              onCheckedChange={handleSnapToGridToggle}
            >
              격자에 맞추기 활성화
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={settings.snapGrid[0].toString()} 
              onValueChange={handleSnapGridChange}
            >
              {SNAP_GRID_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 타입 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17C8 17 8 7 13 7C18 7 18 17 21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>연결선 스타일</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.connectionLineType} 
              onValueChange={handleConnectionTypeChange}
            >
              {CONNECTION_TYPE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 화살표 마커 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightIcon className="mr-2 h-4 w-4" />
            <span>화살표 스타일</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.markerEnd === null ? 'null' : settings.markerEnd} 
              onValueChange={handleMarkerTypeChange}
            >
              {MARKER_TYPE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value ?? 'null'} value={option.value === null ? 'null' : option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 두께 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SeparatorHorizontal className="mr-2 h-4 w-4" />
            <span>연결선 두께</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.strokeWidth.toString()} 
              onValueChange={handleStrokeWidthChange}
            >
              {STROKE_WIDTH_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 마커 크기 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Circle className="mr-2 h-4 w-4" />
            <span>화살표 크기</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.markerSize.toString()} 
              onValueChange={handleMarkerSizeChange}
            >
              {MARKER_SIZE_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 색상 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>연결선 색상</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.edgeColor} 
              onValueChange={handleEdgeColorChange}
            >
              {EDGE_COLOR_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 선택된 연결선 색상 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>선택된 연결선 색상</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.selectedEdgeColor} 
              onValueChange={handleSelectedEdgeColorChange}
            >
              {EDGE_COLOR_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* 연결선 애니메이션 설정 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 10L19 12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>연결선 애니메이션</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={settings.animated.toString()} 
              onValueChange={handleAnimatedChange}
            >
              {EDGE_ANIMATION_OPTIONS.map(option => (
                <DropdownMenuRadioItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 