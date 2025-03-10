import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스를 글로벌로 관리하여 핫 리로드 시 연결이 중복 생성되는 것을 방지
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 환경 변수 유효성 확인
function validateEnv() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️ 누락된 데이터베이스 환경 변수: ${missingEnvVars.join(', ')}`);
    return false;
  }
  return true;
}

// 개발 환경에서는 로깅 활성화, 프로덕션에서는 비활성화
let prisma: PrismaClient;

try {
  // 환경 변수 확인
  const isEnvValid = validateEnv();
  
  if (!isEnvValid && process.env.NODE_ENV === 'production') {
    console.error('❌ 프로덕션 환경에서 필수 데이터베이스 환경 변수가 누락되었습니다.');
    // 프로덕션 환경에서는 명시적으로 오류를 발생시키지 않고 로깅만 수행
  }
  
  prisma = 
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  
  // 연결 테스트
  if (process.env.NODE_ENV === 'development') {
    prisma.$connect()
      .then(() => console.log('✅ Prisma 데이터베이스 연결 성공'))
      .catch(error => console.error('❌ Prisma 데이터베이스 연결 실패:', error));
  }
} catch (error) {
  console.error('❌ Prisma 클라이언트 초기화 오류:', error);
  // 개발 환경에서는 오류 발생 시 더미 Prisma 클라이언트를 사용
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ 더미 Prisma 클라이언트를 사용합니다. 데이터베이스 작업이 제한됩니다.');
    // @ts-ignore - 더미 클라이언트 생성
    prisma = new Proxy({}, {
      get: (target, prop) => {
        // 기본 속성
        if (prop === 'then' || prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve();
        }
        // 모델 접근 시 더미 모델 반환
        return new Proxy({}, {
          get: () => (...args: any[]) => {
            console.warn(`⚠️ 데이터베이스 연결 없이 Prisma 작업이 호출되었습니다: ${String(prop)}`);
            return Promise.resolve([]);
          }
        });
      }
    });
  } else {
    // 프로덕션 환경에서는 최소한의 기능을 갖춘 클라이언트 제공
    // @ts-ignore - 더미 클라이언트 생성
    prisma = new PrismaClient();
  }
}

// 개발 환경에서 글로벌 인스턴스 저장
if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;