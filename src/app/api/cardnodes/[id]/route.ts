/**
 * 파일명: src/app/api/cardnodes/[id]/route.ts
 * 목적: 개별 CardNode 항목에 대한 API 엔드포인트
 * 역할: 카드 노드 업데이트 및 삭제 API 제공
 * 작성일: 2025-04-21
 */

import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CardNodeUpdateSchema = z.object({
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  styleJson: z.object({}).passthrough().optional(),
  dataJson: z.object({}).passthrough().optional(),
});

export type CardNodeUpdateInput = z.infer<typeof CardNodeUpdateSchema>;

/**
 * updateCardNode: 카드 노드 정보 업데이트
 * @param request - NextRequest 객체
 * @param params - URL 경로 매개변수 (id)
 * @returns CardNode - 업데이트된 카드 노드
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Card Node ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    try {
      const validatedData = CardNodeUpdateSchema.parse(body);

      // 카드 노드 존재 확인
      const cardNode = await prisma.cardNode.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!cardNode) {
        return NextResponse.json(
          { error: 'Card node not found' },
          { status: 404 }
        );
      }

      // 프로젝트 접근 권한 확인
      if (
        cardNode.project.ownerId !== session.user.id &&
        !(await prisma.projectMember.findFirst({
          where: {
            projectId: cardNode.projectId,
            userId: session.user.id,
          },
        }))
      ) {
        return NextResponse.json(
          { error: 'You do not have access to this project' },
          { status: 403 }
        );
      }

      // 카드 노드 업데이트
      const updatedCardNode = await prisma.cardNode.update({
        where: { id },
        data: validatedData,
      });

      return NextResponse.json(updatedCardNode);
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
    console.error('Error updating card node:', error);
    return NextResponse.json(
      { error: 'Failed to update card node' },
      { status: 500 }
    );
  }
}

/**
 * deleteCardNode: 카드 노드 삭제
 * @param request - NextRequest 객체
 * @param params - URL 경로 매개변수 (id)
 * @returns 성공 시 204 No Content 응답
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Card Node ID is required' },
        { status: 400 }
      );
    }

    // 카드 노드 존재 확인
    const cardNode = await prisma.cardNode.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!cardNode) {
      return NextResponse.json(
        { error: 'Card node not found' },
        { status: 404 }
      );
    }

    // 프로젝트 접근 권한 확인
    if (
      cardNode.project.ownerId !== session.user.id &&
      !(await prisma.projectMember.findFirst({
        where: {
          projectId: cardNode.projectId,
          userId: session.user.id,
        },
      }))
    ) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // 카드 노드 삭제 (카드는 삭제하지 않음)
    await prisma.cardNode.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting card node:', error);
    return NextResponse.json(
      { error: 'Failed to delete card node' },
      { status: 500 }
    );
  }
} 