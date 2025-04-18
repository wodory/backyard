/**
 * 파일명: logger.ts
 * 목적: 통합 로깅 시스템 제공
 * 역할: 브라우저와 서버 양쪽에서 로그를 기록하고 필요시 서버로 로그를 전송
 * 작성일: 2025-03-27
 * 수정일: 2025-04-07
 * 수정일: 2025-04-19 : 디버그 로그 정리 - 개발 환경에서만 출력하도록 개선
 */

// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 로그 데이터 인터페이스
interface LogData {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  sessionId?: string;
}

// 세션 ID 생성
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 로그 저장소
class LogStorage {
  private static instance: LogStorage;
  private logs: LogData[] = [];
  private sessionId: string;
  private readonly MAX_LOGS = 100;

  private constructor() {
    this.sessionId = generateSessionId();
    
    // 브라우저 환경이면 로컬 스토리지에서 세션 ID 복원 시도
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('logger.sessionId');
      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        localStorage.setItem('logger.sessionId', this.sessionId);
      }
    }
  }

  public static getInstance(): LogStorage {
    if (!LogStorage.instance) {
      LogStorage.instance = new LogStorage();
    }
    return LogStorage.instance;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public addLog(log: LogData): void {
    // 세션 ID 추가
    log.sessionId = this.sessionId;
    
    // 로그 저장
    this.logs.push(log);
    
    // 최대 로그 수 제한
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    
    // 브라우저 환경이면 로컬 스토리지에 로그 저장
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('logger.logs', JSON.stringify(this.logs));
      } catch (error) {
        console.error('로그 저장 실패:', error);
      }
    }
  }

  public getLogs(): LogData[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('logger.logs');
    }
  }
}

/**
 * logger: 통합 로깅 기능을 제공하는 함수
 * @param module 로그를 생성하는 모듈 이름
 * @param level 로그 레벨
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택사항)
 */
export const logger = (
  module: string,
  level: LogLevel,
  message: string,
  data?: any
): void => {
  const logStorage = LogStorage.getInstance();
  const timestamp = new Date().toISOString();
  
  // 로그 객체 생성
  const logData: LogData = {
    timestamp,
    level,
    module,
    message,
    data,
    sessionId: logStorage.getSessionId()
  };
  
  // 로그 저장
  logStorage.addLog(logData);
  
  // DEBUG 레벨 로그는 개발 환경에서만 콘솔에 출력
  if ((level === LogLevel.DEBUG || level === LogLevel.ERROR) && process.env.NODE_ENV !== 'development') {
    return; // 개발 환경이 아니면 DEBUG 로그는 콘솔에 출력하지 않음
  }
  
  // 콘솔에 출력
  const formattedMessage = `[${timestamp.split('T')[1].split('.')[0]}][${module}][${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, data || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, data || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, data || '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, data || '');
      break;
  }
  
  // 브라우저 환경에서 서버로 로그 전송 (중요 로그만)
  if (typeof window !== 'undefined' && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
    sendLogToServer(logData);
  }
};

/**
 * 서버로 로그 전송
 * @param logData 로그 데이터
 */
const sendLogToServer = async (logData: LogData): Promise<void> => {
  try {
    // 로그 API 엔드포인트
    const endpoint = '/api/logs';
    
    // 로그 전송
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData),
      // 로그 전송은 비동기적으로 처리하고 실패해도 무시
      keepalive: true
    });
    
    // 전송 성공 시 로컬 스토리지에서 해당 로그 삭제
    if (response.ok) {
      const logStorage = LogStorage.getInstance();
      const logs = logStorage.getLogs();
      logStorage.clearLogs();
    }
  } catch (error) {
    // 로그 전송 실패는 무시 (무한 루프 방지)
  }
};

/**
 * 모듈별 로거 생성
 * @param module 모듈 이름
 */
export const createLogger = (module: string) => {
  return {
    debug: (message: string, data?: any) => {
      // DEBUG 레벨 로그는 개발 환경에서만 처리
      if (process.env.NODE_ENV !== 'development') return;
      logger(module, LogLevel.DEBUG, message, data);
    },
    info: (message: string, data?: any) => logger(module, LogLevel.INFO, message, data),
    warn: (message: string, data?: any) => logger(module, LogLevel.WARN, message, data),
    error: (message: string, data?: any) => logger(module, LogLevel.ERROR, message, data)
  };
};

/**
 * 저장된 로그 가져오기
 */
export const getLogs = (): LogData[] => {
  return LogStorage.getInstance().getLogs();
};

/**
 * 저장된 로그 지우기
 */
export const clearLogs = (): void => {
  LogStorage.getInstance().clearLogs();
};

export default createLogger; 