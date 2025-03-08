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
  
  serverClientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  browserClientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

// 기본 클라이언트 생성 (서버 컴포넌트에서 사용)
const supabase = typeof window === 'undefined' ? createSupabaseClient() : createBrowserClient();
export default supabase; 