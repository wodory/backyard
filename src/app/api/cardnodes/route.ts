/**
 * 파일명: src/app/api/cardnodes/route.ts
 * 목적: CardNode 모델의 API 엔드포인트 구현
 * 역할: 노드 목록 조회 및 생성 API 제공
 * 작성일: 2025-04-21
 */

import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CardNodeCreateSchema = z.object({
  cardId: z.string().uuid(),
  projectId: z.string().uuid(),
  positionX: z.number(),
  positionY: z.number(),
  styleJson: z.object({}).passthrough().optional(),
  dataJson: z.object({}).passthrough().optional(),
});

export type CardNodeCreateInput = z.infer<typeof CardNodeCreateSchema>;

/**
 * getCardNodes: 프로젝트 ID를 기반으로 카드 노드 목록을 조회
 * @param request - NextRequest 객체
 * @returns CardNode[] - 카드 노드 목록
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const cardNodes = await prisma.cardNode.findMany({
      where: {
        projectId,
      },
    });

    return NextResponse.json(cardNodes);
  } catch (error) {
    console.error('Error fetching card nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card nodes' },
      { status: 500 }
    );
  }
}

/**
 * createCardNode: 새로운 카드 노드를 생성
 * @param request - NextRequest 객체
 * @returns CardNode - 생성된 카드 노드
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    try {
      const validatedData = CardNodeCreateSchema.parse(body);
      
      // 프로젝트 접근 권한 확인 (옵션)
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
        include: {
          members: {
            where: { userId: session.user.id },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      if (project.ownerId !== session.user.id && project.members.length === 0) {
        return NextResponse.json(
          { error: 'You do not have access to this project' },
          { status: 403 }
        );
      }

      // 카드 존재 확인
      const card = await prisma.card.findUnique({
        where: { id: validatedData.cardId },
      });

      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }

      const cardNode = await prisma.cardNode.create({
        data: {
          cardId: validatedData.cardId,
          projectId: validatedData.projectId,
          positionX: validatedData.positionX,
          positionY: validatedData.positionY,
          styleJson: validatedData.styleJson || {},
          dataJson: validatedData.dataJson || {},
        },
      });

      return NextResponse.json(cardNode, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: validationError.format() },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating card node:', error);
    return NextResponse.json(
      { error: 'Failed to create card node' },
      { status: 500 }
    );
  }
} 