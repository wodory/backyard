/**
 * 파일명: modal.tsx
 * 목적: 모달 다이얼로그 컴포넌트
 * 역할: 모달 UI를 제공하는 컴포넌트
 * 작성일: 2025-03-28
 */

"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const Modal = {
  Root: Dialog,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
}

export { Modal } 