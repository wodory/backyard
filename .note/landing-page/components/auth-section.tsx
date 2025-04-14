"use client"

import Link from "next/link"
import { ArrowRight, Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AuthSection() {
  return (
    <div className="w-full max-w-md p-6 md:p-12">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold">Backyard</h1>
        <p className="text-slate-500">상상력을 연결한 문서</p>
      </div>

      {/* Login Form */}
      <Card className="border shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="login-email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="login-email" type="email" placeholder="example@email.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="login-password" type="password" className="pl-10" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full bg-primary/90 hover:bg-primary text-base transition-all duration-200">
            로그인
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="flex w-full items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">또는</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full border-gray-300 font-medium">
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="48px"
              height="48px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Google로 로그인하기
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                회원가입
              </Link>
              {" · "}
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                비밀번호 찾기
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
