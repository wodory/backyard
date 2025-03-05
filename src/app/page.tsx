import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Hello backyard</CardTitle>
          <CardDescription className="text-center">
            아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/cards">카드 목록 보기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/board">보드 시각화</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
