'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { InitDatabase } from "@/components/InitDatabase";
import "@/app/globals.css";
// reactflow 스타일 버그 픽스 
// import "@xyflow/react/dist/style.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <main>
            {children}
            
            {/* DB 초기화 스크립트 */}
            <InitDatabase />
          </main>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
