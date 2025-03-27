/**
 * 파일명: page.tsx
 * 목적: 로그인 페이지 제공
 * 역할: 사용자 로그인 및 회원가입 UI
 * 작성일: 2024-03-31
 */

'use client'

import { useEffect, useState } from 'react'
import { login, signup, signInWithGoogle } from './actions'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  useEffect(() => {
    // URL 쿼리 파라미터에서 오류 및 성공 메시지 추출
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error) setError(decodeURIComponent(error))
    if (message) setMessage(decodeURIComponent(message))
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-gray-600 mt-2">계정에 로그인하거나 새 계정을 만드세요</p>
        </div>
        
        {/* 오류 메시지 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {/* 성공 메시지 표시 */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            {message}
          </div>
        )}

        <div className="mt-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col space-y-3">
              <button
                formAction={login}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
              >
                로그인
              </button>
              <button
                formAction={signup}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors shadow-sm"
              >
                회원가입
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
            
            <div className="mt-6">
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5 mr-2"
                  />
                  Google로 계속하기
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 