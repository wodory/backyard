#!/bin/bash

# 파일명: run-tests.sh
# 목적: 통합된 테스트 실행 스크립트
# 역할: Vitest 기반의 테스트 실행 및 관리
# 작성일: 2024-03-31

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# 함수: 도움말 출력
show_help() {
    echo -e "${BLUE}Vitest 테스트 실행 스크립트${NC}"
    echo
    echo "사용법: ./run-tests.sh [옵션]"
    echo
    echo "옵션:"
    echo "  -a, --all        모든 테스트 실행"
    echo "  -u, --ui         UI 모드로 테스트 실행"
    echo "  -w, --watch      감시 모드로 테스트 실행"
    echo "  -c, --coverage   커버리지 리포트 생성"
    echo "  -f, --filter     특정 패턴의 테스트만 실행 (예: auth, board)"
    echo "  -t, --threads    스레드 모드로 실행"
    echo "  -h, --help       도움말 표시"
    echo
    exit 0
}

# 함수: 환경 검사
check_environment() {
    echo -e "${YELLOW}환경 검사 중...${NC}"
    
    # Node.js 버전 확인
    if ! command -v node &> /dev/null; then
        echo -e "${RED}오류: Node.js가 설치되어 있지 않습니다.${NC}"
        exit 1
    fi
    
    # Yarn 확인
    if ! command -v yarn &> /dev/null; then
        echo -e "${RED}오류: Yarn이 설치되어 있지 않습니다.${NC}"
        exit 1
    fi
    
    # 필수 환경 변수 확인
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo -e "${YELLOW}경고: Supabase 환경 변수가 설정되지 않았습니다. 테스트용 기본값을 사용합니다.${NC}"
    fi
    
    echo -e "${GREEN}환경 검사 완료${NC}"
}

# 함수: 테스트 실행
run_tests() {
    local command="yarn vitest"
    local filter=""
    local use_threads=false
    local coverage=false
    local watch_mode=false
    local ui_mode=false
    
    # 옵션 파싱
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            -f|--filter)
                filter="$2"
                shift 2
                ;;
            -t|--threads)
                use_threads=true
                shift
                ;;
            -c|--coverage)
                coverage=true
                shift
                ;;
            -w|--watch)
                watch_mode=true
                shift
                ;;
            -u|--ui)
                ui_mode=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                echo -e "${RED}알 수 없는 옵션: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    # 명령어 구성
    if [ "$ui_mode" = true ]; then
        command="$command --ui"
    elif [ "$watch_mode" = true ]; then
        command="$command"  # watch mode is default
    else
        command="$command run"  # run once
    fi
    
    if [ "$use_threads" = true ]; then
        command="$command --pool=threads"
    fi
    
    if [ "$coverage" = true ]; then
        command="$command --coverage"
    fi
    
    if [ ! -z "$filter" ]; then
        command="$command \"$filter\""
    fi
    
    # 테스트 실행
    echo -e "${YELLOW}테스트 실행 중...${NC}"
    echo -e "${BLUE}실행 명령어: $command${NC}"
    eval $command
    
    # 결과 확인
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}테스트 완료: 성공${NC}"
    else
        echo -e "${RED}테스트 완료: 실패${NC}"
        exit 1
    fi
}

# 메인 스크립트
main() {
    check_environment
    run_tests "$@"
}

# 스크립트 실행
main "$@" 