import { createClient } from '@supabase/supabase-js';

// 싱글톤 인스턴스를 위한 변수
let browserClientInstance: ReturnType<typeof createClient> | null = null;
let serverClientInstance: ReturnType<typeof createClient> | null = null;

// Next.js 서버 컴포넌트 및 API 라우트용 Supabase 클라이언트
export const createSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (serverClientInstance) {
    return serverClientInstance;
  }
  
  // 환경 변수 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase 환경 변수가 설정되지 않았습니다.');
    // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트 반환
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      // 필요한 경우 더 많은 더미 메소드 추가
    } as any;
  }
  
  serverClientInstance = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
  
  return serverClientInstance;
};

// 브라우저 클라이언트용 Supabase 인스턴스
// 필요한 경우에만 import하여 사용
export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('이 함수는 브라우저 환경에서만 사용할 수 있습니다.');
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (browserClientInstance) {
    return browserClientInstance;
  }
  
  // 환경 변수 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase 환경 변수가 설정되지 않았습니다.');
    throw new Error('Supabase URL 및 Anon Key가 필요합니다.');
  }
  
  browserClientInstance = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
  
  return browserClientInstance;
};

// 안전한 클라이언트 생성 (정적 빌드 시 오류 방지)
const createSafeClient = () => {
  try {
    return typeof window === 'undefined' ? createSupabaseClient() : createBrowserClient();
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    // 빌드 타임 에러 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 기본 클라이언트 생성 (서버 컴포넌트에서 사용)
const supabase = createSafeClient();
export default supabase; 