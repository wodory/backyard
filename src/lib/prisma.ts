import { PrismaClient } from '@prisma/client';

// PrismaClient는 전역 싱글톤으로 사용합니다.
// 이렇게 하면 개발 환경에서 핫 리로딩 시 여러 인스턴스가 생성되는 것을 방지합니다.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;