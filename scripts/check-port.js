/**
 * 파일명: check-port.js
 * 목적: 포트 3000이 사용 중인지 확인하고 필요시 프로세스 종료
 * 역할: 개발 서버 실행 전 포트 충돌 예방
 * 작성일: 2024-03-24
 * 수정일: 2025-03-26
 */

const { execSync } = require('child_process');
const os = require('os');

const PORT = 3000;

function checkPort() {
  console.log(`\n🔍 포트 ${PORT} 상태 확인 중...`);
  
  try {
    let command;
    let processIdCommand;
    
    // OS별 명령어 설정
    if (os.platform() === 'win32') {
      // Windows
      command = `netstat -ano | findstr :${PORT}`;
      processIdCommand = (line) => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      };
    } else {
      // macOS, Linux
      command = `lsof -i :${PORT}`;
      processIdCommand = (line) => {
        const parts = line.trim().split(/\s+/);
        return parts[1];
      };
    }
    
    // 명령어 실행 및 결과 가져오기
    const result = execSync(command, { encoding: 'utf8' });
    
    if (result && result.trim()) {
      console.log(`⚠️ 포트 ${PORT}가 이미 사용 중입니다.`);
      
      // 결과에서 PID 추출
      const lines = result.split('\n').filter(Boolean);
      
      // 헤더 라인 제외 (macOS/Linux의 lsof 명령어는 헤더가 있음)
      const processLines = os.platform() === 'win32' ? lines : lines.slice(1);
      
      if (processLines.length > 0) {
        // 첫 번째 프로세스의 PID 추출
        const pid = processIdCommand(processLines[0]);
        
        if (pid) {
          console.log(`👉 PID ${pid} 프로세스 종료 중...`);
          
          try {
            // 프로세스 종료
            if (os.platform() === 'win32') {
              execSync(`taskkill /F /PID ${pid}`);
            } else {
              execSync(`kill -9 ${pid}`);
            }
            console.log(`✅ 포트 ${PORT}를 사용하던 프로세스(PID: ${pid})가 종료되었습니다.`);
          } catch (killError) {
            console.error(`❌ 프로세스(PID: ${pid}) 종료 실패:`, killError.message);
            process.exit(1);
          }
        }
      }
    } else {
      console.log(`✅ 포트 ${PORT}는 사용 가능합니다.`);
    }
  } catch (error) {
    // 명령어 실행 오류 - 보통 "포트가 사용 중이 아님"을 의미
    console.log(`✅ 포트 ${PORT}는 사용 가능합니다.`);
  }
}

// 스크립트 실행
checkPort(); 