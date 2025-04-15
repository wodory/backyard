/**
 * 파일명: src/types/supabase.ts
 * 목적: Supabase 데이터베이스 타입 정의
 * 역할: Supabase 데이터베이스 스키마 타입을 정의하여 타입 안정성 제공
 * 작성일: 2025-03-27
 * 수정일: 2023-10-27 : 빈 객체 타입({})을 명시적인 타입으로 변경
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Supabase 데이터베이스의 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          content: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          user_id?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      card_tags: {
        Row: {
          id: string
          card_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          tag_id?: string
        }
      }
      board_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: Json
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
} 