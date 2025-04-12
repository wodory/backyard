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
    markerSize: z.number(),
    edgeColor: z.string(),
    selectedEdgeColor: z.string(),
    animated: z.boolean()
  })
});

// 부분 업데이트용 보드 설정 스키마 (더 유연한 검사)
const partialBoardSettingsSchema = z.object({
  userId: z.string(), // UUID 검사 제거하여 더 유연하게 함
  settings: z.object({
    snapToGrid: z.boolean().optional(),
    snapGrid: z.tuple([z.number(), z.number()]).optional(),
    connectionLineType: z.string().optional(),
    markerEnd: z.union([z.string(), z.null()]).optional(), // 문자열 또는 null 허용
    strokeWidth: z.number().optional(),
    markerSize: z.number().optional(),
    edgeColor: z.string().optional(),
    selectedEdgeColor: z.string().optional(),
    animated: z.boolean().optional()
  }).partial()
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

// 보드 설정 업데이트 API
export async function PUT(request: NextRequest) {
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
    console.error('보드 설정 업데이트 실패:', error);
    return NextResponse.json({ error: '보드 설정을 업데이트하는 데 실패했습니다.' }, { status: 500 });
  }
}

// 보드 설정 부분 업데이트 API
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PATCH 요청 body 수신:', JSON.stringify(body, null, 2));
    
    // userId가 없는 경우 빠른 실패
    if (!body.userId) {
      console.error('userId가 없음:', body);
      return NextResponse.json({ 
        error: '사용자 ID가 필요합니다.', 
      }, { status: 400 });
    }
    
    // settings가 없는 경우 빠른 실패
    if (!body.settings || typeof body.settings !== 'object') {
      console.error('설정 객체가 없음:', body);
      return NextResponse.json({ 
        error: '설정 객체가 필요합니다.', 
      }, { status: 400 });
    }
    
    // 부분 스키마로 유효성 검사
    const validatedData = partialBoardSettingsSchema.safeParse(body);
    
    if (!validatedData.success) {
      console.error('유효성 검사 실패:', 
        JSON.stringify(validatedData.error.format(), null, 2)
      );
      return NextResponse.json({ 
        error: '요청 데이터가 유효하지 않습니다.', 
        details: validatedData.error.format()
      }, { status: 400 });
    }
    
    const { userId, settings: partialSettings } = validatedData.data;
    console.log('검증된 데이터:', { userId, settings: partialSettings });
    
    // 기존 설정 가져오기
    const existingSettings = await prisma.boardSettings.findUnique({
      where: { userId }
    });
    
    console.log('기존 설정:', existingSettings ? 
      JSON.stringify(existingSettings.settings, null, 2) : '설정 없음'
    );

    if (existingSettings) {
      // 기존 설정과 병합하여 업데이트
      const mergedSettings = {
        ...(existingSettings.settings as object),
        ...partialSettings
      };
      
      console.log('병합된 설정:', JSON.stringify(mergedSettings, null, 2));
      
      try {
        await prisma.boardSettings.update({
          where: { userId },
          data: {
            settings: mergedSettings
          }
        });
        console.log('설정 업데이트 성공');
      } catch (updateError) {
        console.error('설정 업데이트 DB 오류:', updateError);
        throw updateError;
      }
    } else {
      // 설정이 없으면 새로 생성
      console.log('새 설정 생성:', JSON.stringify(partialSettings, null, 2));
      
      try {
        await prisma.boardSettings.create({
          data: {
            userId,
            settings: partialSettings
          }
        });
        console.log('새 설정 생성 성공');
      } catch (createError) {
        console.error('설정 생성 DB 오류:', createError);
        throw createError;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: existingSettings ? '설정이 업데이트되었습니다.' : '새 설정이 생성되었습니다.' 
    }, { status: 200 });
  } catch (error) {
    // 더 자세한 오류 정보 로깅
    console.error('보드 설정 부분 업데이트 실패:', error);
    console.error('오류 세부 정보:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    
    let statusCode = 500;
    
    // Prisma 관련 오류 처리
    if (error instanceof Error && 
        error.message.includes('Foreign key constraint failed')) {
      statusCode = 400;
    }
    
    return NextResponse.json({ 
      error: '보드 설정을 부분 업데이트하는 데 실패했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: statusCode });
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