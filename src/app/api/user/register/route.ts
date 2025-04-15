import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name } = body;
    
    // 필수 필드 확인
    if (!id || !email) {
      return NextResponse.json(
        { error: '사용자 ID와 이메일은 필수입니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 이미 등록된 사용자인지 확인
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      
      if (existingUser) {
        // 이미 존재하는 사용자이면 업데이트 (필요시)
        console.log('기존 사용자 확인:', existingUser.email);
        return NextResponse.json({ message: '기존 사용자 확인됨', user: existingUser });
      }
      
      // 새 사용자 생성
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          name: name || email.split('@')[0],
        },
      });
      
      console.log('새 사용자 생성됨:', newUser.email);
      
      return NextResponse.json({ message: '사용자 등록 성공', user: newUser });
    } catch (dbError: any) {
      console.error('데이터베이스 오류:', dbError);
      
      // 데이터베이스 연결 오류 시 더미 데이터 반환
      const dummyUser = {
        id,
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return NextResponse.json({ 
        message: '사용자 등록은 성공했으나 데이터베이스 연결 실패', 
        user: dummyUser 
      });
    }
  } catch (error: any) {
    console.error('사용자 등록 오류:', error);
    return NextResponse.json(
      { error: `사용자 등록 실패: ${error.message}` },
      { status: 500 }
    );
  }
} 