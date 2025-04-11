// 데이터베이스 연결 테스트 스크립트
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('데이터베이스 연결 테스트 시작...');
  console.log('환경 변수:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER
  });

  try {
    const prisma = new PrismaClient();
    console.log('Prisma 클라이언트 초기화 성공');

    // 연결 테스트
    console.log('데이터베이스 연결 시도 중...');
    await prisma.$connect();
    console.log('데이터베이스 연결 성공!');

    // 간단한 쿼리 테스트
    console.log('사용자 조회 시도 중...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`사용자 조회 성공: ${users.length}명의 사용자 발견`);

    // 연결 종료
    await prisma.$disconnect();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main(); 