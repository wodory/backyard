#!/bin/bash

# 스크립트 이름: run-tests.sh
# 목적: 프로젝트의 테스트를 실행
# 작성일: 2024-03-30

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}        백야드 애플리케이션 테스트 실행         ${NC}"
echo -e "${BLUE}===================================================${NC}"

# 스크립트가 위치한 디렉토리 확인
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJ_ROOT="$(dirname "$SCRIPT_DIR")"

# 프로젝트 루트 디렉토리로 이동
cd "$PROJ_ROOT" || { echo -e "${RED}프로젝트 루트 디렉토리로 이동할 수 없습니다.${NC}"; exit 1; }

echo -e "${YELLOW}현재 디렉토리: $(pwd)${NC}"
echo -e "${YELLOW}Node.js 버전: $(node -v)${NC}"
echo -e "${YELLOW}NPM 버전: $(npm -v)${NC}"

# 의존성 확인
echo -e "\n${BLUE}의존성 확인 중...${NC}"
if ! npm ls jest > /dev/null 2>&1; then
  echo -e "${YELLOW}Jest가 설치되어 있지 않습니다. 설치를 시작합니다...${NC}"
  npm install --save-dev jest @types/jest ts-jest
fi

# 테스트 실행
echo -e "\n${BLUE}테스트 실행 중...${NC}"
npx jest --config=jest.config.js "$@"

# 테스트 결과 확인
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✓ 모든 테스트가 성공적으로 완료되었습니다!${NC}"
else
  echo -e "\n${RED}✗ 테스트 실행 중 오류가 발생했습니다.${NC}"
  exit 1
fi

echo -e "\n${BLUE}===================================================${NC}"
echo -e "${BLUE}              테스트 실행 완료                ${NC}"
echo -e "${BLUE}===================================================${NC}" 