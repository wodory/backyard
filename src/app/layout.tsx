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
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
