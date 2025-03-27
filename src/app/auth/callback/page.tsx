/**
 * 파일명: callback/page.tsx
 * 목적: OAuth 콜백 처리 및 인증 완료
 * 역할: Google 로그인 후 리디렉션된 콜백을 처리하고 세션을 설정
 * 작성일: 2024-03-30
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthClient } from '@/lib/auth';
import createLogger from '@/lib/logger';
import { 
  getAuthData, 
  setAuthData, 
  getAuthDataAsync, 
  STORAGE_KEYS 
} from '@/lib/auth-storage';

// 모듈별 로거 생성
const logger = createLogger('Callback');

// 백업용 코드 검증기 생성 함수
function generateCodeVerifier() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(128);
  
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < 96; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
  } else {
    // 예비 방법으로 일반 난수 사용
    for (let i = 0; i < 96; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

/**
 * CallbackHandler: OAuth 콜백을 처리하는 컴포넌트
 * @returns {JSX.Element} 콜백 처리 중임을 나타내는 UI
 */
export default function CallbackHandler() {
  const router = useRouter();
  const [processingState, setProcessingState] = useState<string>('초기화 중');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        if (!mounted) return;
        logger.info('콜백 처리 시작');
        setProcessingState('코드 파라미터 확인 중');

        // URL 파라미터 처리 (먼저 확인)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // 인증 코드 확인
        const rawCode = hashParams.get('code') || queryParams.get('code');
        
        // 에러 파라미터 확인
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (errorParam) {
          logger.error('인증 오류 파라미터 감지', { error: errorParam, description: errorDescription });
          setProcessingState('오류 발생');
          setError(`${errorParam}: ${errorDescription}`);
          router.push(`/auth/error?error=${encodeURIComponent(errorParam)}&error_description=${encodeURIComponent(errorDescription || '')}`);
          return;
        }
        
        if (!rawCode) {
          logger.error('인증 코드가 없습니다');
          setProcessingState('오류 발생');
          setError('인증 코드가 없습니다');
          router.push('/auth/error?error=no_code&error_description=인증 코드가 없습니다. 다시 로그인해 주세요.');
          return;
        }

        // 스토리지 상태 기록
        const storageData: Record<string, string> = {};
        for (const key of Object.values(STORAGE_KEYS)) {
          storageData[key] = getAuthData(key) ? '존재' : '없음';
        }
        logger.info('인증 스토리지 상태:', storageData);
        
        setProcessingState('코드 검증기 확인 중');
        // code_verifier 복구 시도 (모든 스토리지에서)
        let codeVerifier = await getAuthDataAsync(STORAGE_KEYS.CODE_VERIFIER);
        
        if (codeVerifier) {
          logger.info('코드 검증기 복구 성공', {
            길이: codeVerifier.length,
            첫_5글자: codeVerifier.substring(0, 5)
          });
        } else {
          // 추가 복구 시도: sessionStorage 직접 확인
          const sessionVerifier = sessionStorage.getItem('auth.code_verifier.backup') || 
                                  sessionStorage.getItem('auth.code_verifier.emergency');
          if (sessionVerifier) {
            codeVerifier = sessionVerifier;
            logger.info('코드 검증기를 sessionStorage에서 직접 복구했습니다', {
              길이: codeVerifier.length,
              첫_5글자: codeVerifier.substring(0, 5)
            });
            // 모든 스토리지에 동기화
            setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 });
          } else {
            // 코드 검증기가 없는 경우 새로 생성 (마지막 수단)
            codeVerifier = generateCodeVerifier();
            logger.warn('코드 검증기를 찾을 수 없어 새로 생성했습니다', {
              길이: codeVerifier.length,
              첫_5글자: codeVerifier.substring(0, 5)
            });
            
            // 모든 스토리지에 저장
            setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 });
          }
        }
        
        // code_verifier 직접 설정 (여러 장소에 백업)
        // Supabase 내부 저장소에 직접 설정을 시도
        try {
          // @ts-ignore - 전역 객체에 추가된 커스텀 속성 접근
          if (window.__SUPABASE_AUTH_SET_ITEM) {
            // @ts-ignore
            window.__SUPABASE_AUTH_SET_ITEM('code_verifier', codeVerifier);
          }
          
          // 이중 안전을 위해 localStorage에도 직접 저장
          localStorage.setItem('code_verifier', codeVerifier);
          
          // 전역 변수에도 저장
          // @ts-ignore
          window.__SUPABASE_AUTH_CODE_VERIFIER = codeVerifier;
          
          // 세션 스토리지에 백업
          sessionStorage.setItem('auth.code_verifier.backup', codeVerifier);
          sessionStorage.setItem('auth.code_verifier.timestamp', Date.now().toString());
        } catch (storageError) {
          logger.warn('일부 스토리지에 저장 실패', storageError);
        }
        
        logger.info('인증 코드 및 코드 검증기 확인', {
          code_존재: true,
          code_verifier_존재: !!codeVerifier,
          code_길이: rawCode.length,
          verifier_길이: codeVerifier.length
        });
        
        setProcessingState('세션 교환 중');
        // Supabase 클라이언트 생성 및 세션 교환
        const supabase = getAuthClient();
        logger.info('세션 교환 시도', { code_길이: rawCode.length, verifier_길이: codeVerifier.length });
        
        try {
          // 세션 교환 전에 코드 검증기 스토리지 검사
          const verifierCheck = {
            localStorage: localStorage.getItem('code_verifier'),
            authDataFunc: getAuthData(STORAGE_KEYS.CODE_VERIFIER),
            sessionBackup: sessionStorage.getItem('auth.code_verifier.backup')
          };
          
          logger.info('세션 교환 직전 code_verifier 상태', verifierCheck);
          
          // 세션 교환
          const { data, error } = await supabase.auth.exchangeCodeForSession(rawCode);
          
          if (error) {
            logger.error('세션 교환 실패', { 에러: error.message, 코드: error.status });
            setProcessingState('오류 발생');
            setError(error.message);
            
            // 오류가 code_verifier 관련이면 새로 생성 후 재시도
            if (error.message?.includes('code verifier') || error.message?.includes('invalid request')) {
              logger.warn('코드 검증기 문제로 인한 오류, 새로 생성 후 다시 시도합니다');
              const newVerifier = generateCodeVerifier();
              
              setProcessingState('코드 검증기 재생성 및 재시도 중');
              
              // 새 코드 검증기를 모든 스토리지에 저장 (더 철저하게)
              setAuthData(STORAGE_KEYS.CODE_VERIFIER, newVerifier, { expiry: 60 });
              
              // Supabase 내부 저장소용
              try {
                // @ts-ignore
                if (window.__SUPABASE_AUTH_SET_ITEM) {
                  // @ts-ignore
                  window.__SUPABASE_AUTH_SET_ITEM('code_verifier', newVerifier);
                }
                
                // 이중 안전을 위해 localStorage에도 직접 저장
                localStorage.setItem('code_verifier', newVerifier);
                
                // 전역 변수에도 저장
                // @ts-ignore
                window.__SUPABASE_AUTH_CODE_VERIFIER = newVerifier;
                
                // 세션 스토리지에 백업
                sessionStorage.setItem('auth.code_verifier.backup', newVerifier);
                sessionStorage.setItem('auth.code_verifier.timestamp', Date.now().toString());
              } catch (storageError) {
                logger.warn('일부 스토리지에 저장 실패', storageError);
              }
              
              // 잠시 대기하여 스토리지 업데이트가 반영되도록 함
              await new Promise(resolve => setTimeout(resolve, 500));
              
              try {
                const secondAttempt = await supabase.auth.exchangeCodeForSession(rawCode);
                
                if (secondAttempt.error) {
                  logger.error('두 번째 세션 교환 시도도 실패', { 에러: secondAttempt.error.message });
                  setProcessingState('최종 오류 발생');
                  setError(secondAttempt.error.message);
                  router.push(`/auth/error?error=exchange_failed&error_description=${encodeURIComponent(secondAttempt.error.message)}`);
                  return;
                }
                
                if (secondAttempt.data.session) {
                  logger.info('두 번째 시도로 세션 교환 성공');
                  setProcessingState('세션 저장 중');
                  
                  // 세션 정보 저장
                  if (secondAttempt.data.session) {
                    setAuthData(STORAGE_KEYS.ACCESS_TOKEN, secondAttempt.data.session.access_token, { expiry: 60 * 60 * 24 });
                    setAuthData(STORAGE_KEYS.REFRESH_TOKEN, secondAttempt.data.session.refresh_token, { expiry: 60 * 60 * 24 * 14 });
                    
                    if (secondAttempt.data.session.user) {
                      setAuthData(STORAGE_KEYS.USER_ID, secondAttempt.data.session.user.id, { expiry: 60 * 60 * 24 });
                      if (secondAttempt.data.session.user.app_metadata?.provider) {
                        setAuthData(STORAGE_KEYS.PROVIDER, secondAttempt.data.session.user.app_metadata.provider, { expiry: 60 * 60 * 24 });
                      }
                    }
                  }
                  
                  setProcessingState('리디렉션 중');
                  // 홈페이지로 리디렉션
                  router.push('/');
                  return;
                }
              } catch (retryError) {
                logger.error('두 번째 시도 중 오류 발생', retryError);
                setProcessingState('최종 오류 발생');
                setError('두 번째 시도 중 오류 발생');
              }
            }
            
            router.push(`/auth/error?error=exchange_failed&error_description=${encodeURIComponent(error.message)}`);
            return;
          }
          
          if (!data.session) {
            logger.error('세션 데이터가 없습니다.');
            setProcessingState('오류 발생');
            setError('세션 데이터 없음');
            router.push('/auth/error?error=no_session&error_description=세션 데이터를 받지 못했습니다. 다시 시도해 주세요.');
            return;
          }
          
          logger.info('세션 교환 성공', { 
            user_id: data.session?.user?.id?.substring(0, 8) + '...',
            provider: data.session?.user?.app_metadata?.provider
          });

          setProcessingState('세션 저장 중');
          // 세션 정보 저장
          setAuthData(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token, { expiry: 60 * 60 * 24 });
          setAuthData(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token, { expiry: 60 * 60 * 24 * 14 });
          
          if (data.session?.user) {
            setAuthData(STORAGE_KEYS.USER_ID, data.session.user.id, { expiry: 60 * 60 * 24 });
            if (data.session.user.app_metadata?.provider) {
              setAuthData(STORAGE_KEYS.PROVIDER, data.session.user.app_metadata.provider, { expiry: 60 * 60 * 24 });
            }
          }

          setProcessingState('완료, 리디렉션 중');
          // 홈페이지로 리디렉션
          logger.info('인증 완료, 홈페이지로 리디렉션');
          router.push('/');
        } catch (supabaseError) {
          logger.error('Supabase 세션 교환 실패', supabaseError);
          setProcessingState('오류 발생');
          setError('Supabase 세션 교환 실패');
          router.push('/auth/error?error=exchange_error&error_description=인증 과정에서 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      } catch (error) {
        logger.error('콜백 처리 실패', error);
        setProcessingState('예외 발생');
        setError('콜백 처리 중 예외 발생');
        router.push('/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.');
      }
    }

    // 즉시 콜백 처리 실행
    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  // 로딩 UI 표시
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
      <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
      <p className="text-gray-500 mb-2">{processingState}</p>
      {error && (
        <p className="text-red-500 text-sm mt-2">오류: {error}</p>
      )}
    </div>
  );
} 