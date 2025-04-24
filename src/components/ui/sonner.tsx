/**
 * 파일명: src/components/ui/sonner.tsx
 * 목적: 토스트 알림 UI 컴포넌트 제공
 * 역할: 앱 전체에서 사용할 수 있는 일관된 토스트 알림 시스템 구현
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : next-themes의 useTheme 대신 useAppStore(themeSlice) 사용으로 변경
 */

"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"
import { useAppStore } from "@/store/useAppStore"

const Toaster = ({ ...props }: ToasterProps) => {
  // next-themes의 useTheme 대신 Zustand 스토어에서 테마 모드 가져오기
  const themeMode = useAppStore(state => state.themeMode)
  // themeMode는 'light' | 'dark' | 'system'이며, sonner의 theme 타입과 호환됨
  const theme = themeMode || "system"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
