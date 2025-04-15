'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { getCurrentUser, signOut } from '@/lib/auth';



type User = {
  id: string;
  email: string;
  dbUser?: {
    name: string | null;
  } | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃 되었습니다.');
      router.push('/login');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
      console.error('로그아웃 오류:', error);
    }
  };

  // 사용자 이름을 가져오는 헬퍼 함수
  const getUserName = () => {
    if (!user) return '';

    // 우선순위: 1. Google 프로필 이름, 2. DB에 저장된 이름, 3. 이메일 앞부분
    return user.user_metadata?.full_name ||
      user.dbUser?.name ||
      (user.email ? user.email.split('@')[0] : '사용자');
  };

  // 아바타 이미지 URL 또는 이니셜을 가져오는 헬퍼 함수
  const getAvatar = () => {
    if (!user) return '';

    return user.user_metadata?.avatar_url || '';
  };

  // 이니셜 생성 헬퍼 함수
  const getInitials = () => {
    const name = getUserName();
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
        로그인
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {getAvatar() ? (
              <AvatarImage src={getAvatar()} alt={getUserName()} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{getUserName()}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/board')}>
          보드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/cards')}>
          카드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/tags')}>
          태그
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 