import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스를 글로벌로 관리하여 핫 리로드 시 연결이 중복 생성되는 것을 방지
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 개발 환경에서는 로깅 활성화, 프로덕션에서는 비활성화
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;