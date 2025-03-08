import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 보드 설정 스키마
const boardSettingsSchema = z.object({
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
  settings: z.object({
    snapToGrid: z.boolean(),
    snapGrid: z.tuple([z.number(), z.number()]),
    connectionLineType: z.string(),
    markerEnd: z.string().nullable(),
    strokeWidth: z.number(),
    markerSize: z.number()
  })
});

// 보드 설정 저장 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = boardSettingsSchema.parse(body);

    // 기존 설정이 있는지 확인
    const existingSettings = await prisma.boardSettings.findUnique({
      where: { userId }
    });

    // 설정 업데이트 또는 생성
    if (existingSettings) {
      await prisma.boardSettings.update({
        where: { userId },
        data: {
          settings: settings
        }
      });
    } else {
      await prisma.boardSettings.create({
        data: {
          userId,
          settings
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('보드 설정 저장 실패:', error);
    return NextResponse.json({ error: '보드 설정을 저장하는 데 실패했습니다.' }, { status: 500 });
  }
}

// 보드 설정 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const boardSettings = await prisma.boardSettings.findUnique({
      where: { userId }
    });

    if (!boardSettings) {
      return NextResponse.json({ settings: null }, { status: 200 });
    }

    return NextResponse.json({ settings: boardSettings.settings }, { status: 200 });
  } catch (error) {
    console.error('보드 설정 조회 실패:', error);
    return NextResponse.json({ error: '보드 설정을 조회하는 데 실패했습니다.' }, { status: 500 });
  }
} 