import { createClient } from '@supabase/supabase-js';

// 싱글톤 인스턴스를 위한 변수
let browserClientInstance: ReturnType<typeof createClient> | null = null;
let serverClientInstance: ReturnType<typeof createClient> | null = null;

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Next.js 서버 컴포넌트 및 API 라우트용 Supabase 클라이언트
export const createSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (serverClientInstance) {
    return serverClientInstance;
  }
  
  // 정적 렌더링 및 개발 환경을 위한 안전한 클라이언트 생성
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인하세요.');
    
    // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
      },
      from: () => ({ select: () => ({ data: [], error: null }) }),
    } as any;
  }
  
  try {
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
  } catch (error) {
    console.error('Supabase 서버 클라이언트 생성 실패:', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 브라우저 클라이언트용 Supabase 인스턴스
// 필요한 경우에만 import하여 사용
export const createBrowserClient = () => {
  // 브라우저 환경이 아니면 더미 클라이언트 반환
  if (typeof window === 'undefined') {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (browserClientInstance) {
    return browserClientInstance;
  }
  
  // 클라이언트 환경에서 안전하게 처리
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인하세요.');
    
    if (process.env.NODE_ENV !== 'production') {
      // 개발 환경에서는 더미 클라이언트 반환
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
        },
        from: () => ({ select: () => ({ data: [], error: null }) }),
      } as any;
    }
    
    // 운영 환경에서는 경고만 표시하고 계속 진행 (오류 방지)
    console.error('Supabase 환경 변수가 누락되었습니다. 기능이 제한될 수 있습니다.');
  }
  
  try {
    browserClientInstance = createClient(
      supabaseUrl || 'https://placeholder-supabase-url.supabase.co',
      supabaseKey || 'placeholder-anon-key',
      {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    
    return browserClientInstance;
  } catch (error) {
    console.error('Supabase 브라우저 클라이언트 생성 실패:', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 안전한 클라이언트 생성 (정적 빌드 시 오류 방지)
const createSafeClient = () => {
  try {
    if (typeof window === 'undefined') {
      return createSupabaseClient();
    } else {
      return createBrowserClient();
    }
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