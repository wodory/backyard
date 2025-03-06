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
import { Settings, Grid3X3, LineIcon } from 'lucide-react';
import { BoardSettings } from '@/lib/board-utils';
import { SNAP_GRID_OPTIONS, CONNECTION_TYPE_OPTIONS, MARKER_TYPE_OPTIONS } from '@/lib/board-constants';
import { ConnectionLineType, MarkerType } from 'reactflow';

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
  };

  // 연결선 타입 변경 핸들러
  const handleConnectionTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      connectionLineType: value as ConnectionLineType,
    };
    onSettingsChange(newSettings);
  };

  // 마커 타입 변경 핸들러
  const handleMarkerTypeChange = (value: string) => {
    const newSettings = {
      ...settings,
      markerEnd: value === 'null' ? null : value as MarkerType,
    };
    onSettingsChange(newSettings);
  };

  // 스냅 그리드 토글 핸들러
  const handleSnapToGridToggle = () => {
    const newSettings = {
      ...settings,
      snapToGrid: !settings.snapToGrid,
    };
    onSettingsChange(newSettings);
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
            <LineIcon className="mr-2 h-4 w-4" />
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
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 