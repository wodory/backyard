'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { InitDatabase } from "@/components/InitDatabase";
import "@/app/globals.css";

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
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
