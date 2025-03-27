#!/bin/bash

# 파일명: run-auth-tests.sh
# 목적: Google OAuth 인증 테스트 실행 스크립트
# 역할: 인증 관련 테스트 케이스를 실행하고 결과를 정리
# 작성일: 2024-03-26

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 색상 초기화

# 실행 시간 기록
timestamp=$(date +%Y%m%d-%H%M%S)
start_time=$(date +%s)
echo "테스트 실행 시작: $(date +'%Y년 %m월 %d일 %H:%M:%S KST')"
echo "결과 요약 파일: ./src/tests/results/auth-tests-summary-${timestamp}.txt"

# 결과 디렉토리 생성
mkdir -p ./src/tests/results

# Vitest를 사용하여 인증 관련 테스트만 실행
npx vitest run src/tests/auth/auth-integration.test.ts --globals > ./src/tests/results/auth-tests-summary-${timestamp}.txt

# 종료 코드 확인
exit_code=$?
echo "종료 코드: $exit_code"

# 테스트 종료 시간
end_time=$(date +%s)
duration=$((end_time - start_time))

# 결과 요약
echo "" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
echo "==================================================" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
echo "테스트 요약" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
echo "==================================================" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
echo "테스트 파일: src/tests/auth/auth-integration.test.ts" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt
echo "실행 시간: ${duration} 초" >> ./src/tests/results/auth-tests-summary-${timestamp}.txt

# 결과 출력
cat ./src/tests/results/auth-tests-summary-${timestamp}.txt

exit $exit_code 