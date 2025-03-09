import { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { InitDatabase } from "@/components/InitDatabase";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Backyard - 모든 아이디어를 정리하는 공간",
  description: "효율적인 메모와 지식 관리를 위한 솔루션",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // 서버 컴포넌트에서는 Supabase 클라이언트를 인증 검증용으로만 사용하고
  // 쿠키 수정은 하지 않도록 설정합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Next.js 15에서는 서버 컴포넌트에서 직접 쿠키를 수정할 수 없으므로
        // 여기서는 빈 구현을 제공합니다. 실제 쿠키 수정은 미들웨어나 서버 액션에서 수행합니다.
        set(name: string, value: string, options: any) {
          // 서버 컴포넌트에서는 쿠키 설정을 하지 않음
          console.warn('서버 컴포넌트에서 쿠키 설정은 지원되지 않습니다.');
        },
        remove(name: string, options: any) {
          // 서버 컴포넌트에서는 쿠키 삭제를 하지 않음
          console.warn('서버 컴포넌트에서 쿠키 삭제는 지원되지 않습니다.');
        },
      },
    }
  );
  
  return (
    <html lang="ko">
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <main>
            {children}
            
            {/* DB 초기화 스크립트 */}
            <InitDatabase />
          </main>
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
