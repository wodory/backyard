import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function checkDatabaseConnection() {
  try {
    // 간단한 쿼리로 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return { 
      connected: false, 
      error: error.message,
      tips: [
        '.env 파일에 DATABASE_URL이 올바르게 설정되었는지 확인하세요.',
        'PostgreSQL 서버가 실행 중인지 확인하세요.',
        '데이터베이스 "backyard"가 생성되었는지 확인하세요.',
        '사용자 이름과 비밀번호가 올바른지 확인하세요.'
      ]
    };
  }
}

export { prisma }; 