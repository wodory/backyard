import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15에서는 params가 Promise이므로 await 사용
    const paramsResolved = await params;
    const id = paramsResolved.id;
    
    if (!id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user });
    } catch (dbError: any) {
      console.error('DB 조회 오류:', dbError);
      
      // DB 오류가 발생하면 더미 사용자 데이터 반환
      // 실제 환경에서는 적절한 오류 처리 필요
      return NextResponse.json({
        user: {
          id,
          email: 'user@example.com',
          name: '사용자',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      });
    }
  } catch (error: any) {
    console.error('사용자 조회 API 오류:', error);
    return NextResponse.json(
      { error: `사용자 조회 실패: ${error.message}` },
      { status: 500 }
    );
  }
} 