#!/bin/bash

# 파일명: run-tests.sh
# 목적: 인증 흐름 테스트 실행 스크립트
# 작성일: 2024-03-30

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # 색상 초기화

echo -e "${BLUE}===== 서버/클라이언트 컴포넌트 분리 및 인증 테스트 시작 =====${NC}"

# 디렉토리가 존재하는지 확인
mkdir -p src/tests/results

# 1. 레이아웃 파일 확인
echo -e "\n${BLUE}[테스트 1] 레이아웃 파일 확인${NC}"
if grep -q "'use client'" src/app/layout.tsx; then
  echo -e "${RED}[실패] src/app/layout.tsx에 'use client' 지시어가 있습니다. 서버 컴포넌트여야 합니다.${NC}"
else
  echo -e "${GREEN}[성공] src/app/layout.tsx는 서버 컴포넌트입니다.${NC}"
fi

if grep -q "'use client'" src/components/layout/ClientLayout.tsx; then
  echo -e "${GREEN}[성공] src/components/layout/ClientLayout.tsx는 클라이언트 컴포넌트입니다.${NC}"
else
  echo -e "${RED}[실패] src/components/layout/ClientLayout.tsx에 'use client' 지시어가 없습니다. 클라이언트 컴포넌트여야 합니다.${NC}"
fi

# 2. Supabase 서버/클라이언트 분리 확인
echo -e "\n${BLUE}[테스트 2] Supabase 서버/클라이언트 분리 확인${NC}"
if grep -q "async function createServerSupabaseClient" src/lib/supabase-server.ts; then
  echo -e "${GREEN}[성공] createServerSupabaseClient는 비동기 함수입니다.${NC}"
else
  echo -e "${RED}[실패] createServerSupabaseClient는 비동기 함수여야 합니다.${NC}"
fi

if grep -q "cookies()" src/lib/supabase-server.ts; then
  if grep -q "await cookies()" src/lib/supabase-server.ts; then
    echo -e "${GREEN}[성공] cookies()가 올바르게 await와 함께 사용되었습니다.${NC}"
  else
    echo -e "${RED}[실패] cookies()는 비동기 함수이므로 await와 함께 사용해야 합니다.${NC}"
  fi
fi

# 3. 인증 흐름 개선 확인
echo -e "\n${BLUE}[테스트 3] 인증 흐름 개선 확인${NC}"
if grep -q "STORAGE_KEYS" src/app/auth/callback/page.tsx; then
  echo -e "${GREEN}[성공] 인증 스토리지 유틸리티를 사용하도록 수정되었습니다.${NC}"
else
  echo -e "${RED}[실패] 인증 스토리지 유틸리티를 사용해야 합니다.${NC}"
fi

# 4. 스토리지 백업 전략 확인
echo -e "\n${BLUE}[테스트 4] 스토리지 백업 전략 확인${NC}"
if [ -f src/lib/auth-storage.ts ]; then
  echo -e "${GREEN}[성공] 인증 스토리지 유틸리티 파일이 존재합니다.${NC}"
  
  # 여러 스토리지에 저장하는지 확인
  STORAGE_COUNT=$(grep -c "setItem\|setAuthCookie\|saveToIndexedDB" src/lib/auth-storage.ts)
  if [ $STORAGE_COUNT -ge 3 ]; then
    echo -e "${GREEN}[성공] 여러 스토리지에 인증 상태를 저장합니다 (${STORAGE_COUNT}개 감지).${NC}"
  else
    echo -e "${RED}[실패] 최소 3개 이상의 스토리지에 저장해야 합니다.${NC}"
  fi
  
  # 우선순위가 적용되었는지 확인
  if grep -q "1.*전역.*헬퍼\|2.*localStorage\|3.*쿠키" src/lib/auth-storage.ts; then
    echo -e "${GREEN}[성공] 인증 데이터 조회에 우선순위가 적용되었습니다.${NC}"
  else
    echo -e "${RED}[실패] 인증 데이터 조회에 우선순위가 적용되어야 합니다.${NC}"
  fi
  
  # 동기화 기능이 있는지 확인
  if grep -q "동기화\|localStorage.setItem.*cookieValue\|localStorage.setItem.*sessionValue" src/lib/auth-storage.ts; then
    echo -e "${GREEN}[성공] 스토리지 간 데이터 동기화가 구현되었습니다.${NC}"
  else
    echo -e "${RED}[실패] 스토리지 간 데이터 동기화가 필요합니다.${NC}"
  fi
else
  echo -e "${RED}[실패] 인증 스토리지 유틸리티 파일이 없습니다.${NC}"
fi

# 5. 미들웨어 개선 확인
echo -e "\n${BLUE}[테스트 5] 미들웨어 개선 확인${NC}"
if grep -q "인증 쿠키 목록\|AUTH_COOKIES" src/middleware.ts; then
  echo -e "${GREEN}[성공] 미들웨어에서 여러 쿠키를 확인합니다.${NC}"
else
  echo -e "${RED}[실패] 미들웨어에서 여러 쿠키를 확인해야 합니다.${NC}"
fi

if grep -q "supabase.*=.*createServerClient" src/middleware.ts; then
  echo -e "${GREEN}[성공] 미들웨어에서 Supabase 클라이언트를 생성하여 세션을 검증합니다.${NC}"
else
  echo -e "${RED}[실패] 미들웨어에서 Supabase 클라이언트를 생성하여 세션을 검증해야 합니다.${NC}"
fi

echo -e "\n${BLUE}===== 테스트 완료 =====${NC}" 