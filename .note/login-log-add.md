**목표:** `src/app/auth/callback/route.ts` 파일의 로그를 강화하여 Google OAuth 콜백 처리 과정을 상세히 추적하고 오류 발생 지점을 명확히 파악한다.

**파일:** `src/app/auth/callback/route.ts`

**Tasklist:**

1.  **핸들러 시작 로그 추가:**
    *   `GET` 함수 최상단에 콜백 핸들러가 시작되었음을 알리는 로그를 추가한다.
    *   예시: `console.log('[AuthCallback] Route handler started.');`

2.  **요청 URL 로깅:**
    *   핸들러 시작 직후, 수신된 전체 요청 URL을 로깅하여 어떤 파라미터가 전달되는지 확인한다.
    *   예시: `console.log('[AuthCallback] Received request URL:', request.url);`

3.  **인증 코드 추출 로그 강화:**
    *   `code` 변수를 추출하는 부분(`requestUrl.searchParams.get('code')`) 직후, 코드가 성공적으로 추출되었는지 또는 누락되었는지 명확히 로깅한다.
    *   코드가 존재할 경우, 민감 정보를 제외하고 일부만 로깅한다 (예: 처음 10자리).
    *   예시 (기존 로그 수정/보강):
        ```typescript
        if (code) {
          console.log('[AuthCallback] Authorization code found:', code.substring(0, 10) + '...'); // 코드 일부만 로깅
        } else {
          console.error('[AuthCallback] Authorization code NOT found in URL.'); // 에러 로그로 변경
          // 여기서 바로 리디렉션하거나 아래 로직에서 처리
        }
        ```

4.  **세션 교환 시도 로그:**
    *   `supabase.auth.exchangeCodeForSession(code)` 호출 **직전**에 코드 교환을 시도한다는 로그를 추가한다.
    *   예시: `console.log('[AuthCallback] Attempting to exchange code for session with code:', code.substring(0, 10) + '...');`

5.  **세션 교환 결과 로그 강화:**
    *   `supabase.auth.exchangeCodeForSession(code)` 호출 **직후**, `error` 객체의 존재 여부와 내용을 상세히 로깅한다.
    *   예시 (기존 `if (error)` 블록 내부 수정):
        ```typescript
        if (error) {
          console.error('[AuthCallback] Code exchange failed. Error:', error); // 에러 객체 전체 로깅
          // 리디렉션 URL 생성 전 로그 추가
          const errorRedirectUrl = new URL(`/login?error=코드 교환 실패&error_description=${encodeURIComponent(error.message)}`, request.url);
          console.log('[AuthCallback] Redirecting to (error):', errorRedirectUrl.toString());
          return NextResponse.redirect(errorRedirectUrl);
        } else {
           console.log('[AuthCallback] Code exchange successful.'); // 성공 로그 추가
        }
        ```

6.  **성공 리디렉션 로그:**
    *   성공적으로 코드를 교환하고 리디렉션하기 **직전**에 최종 리디렉션될 URL을 로깅한다.
    *   예시 (기존 `NextResponse.redirect` 직전):
        ```typescript
        const successRedirectUrl = new URL(next, request.url);
        console.log('[AuthCallback] Redirecting to (success):', successRedirectUrl.toString());
        return NextResponse.redirect(successRedirectUrl);
        ```

7.  **전체 예외 처리 로그 강화:**
    *   파일 하단의 `catch (error: unknown)` 블록에서 발생한 예외의 내용을 더 상세히 로깅한다.
    *   예시 (기존 `catch` 블록 내부 수정):
        ```typescript
        console.error('[AuthCallback] Unhandled exception during callback processing:', error); // 에러 객체 로깅
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
        const exceptionRedirectUrl = new URL(`/login?error=콜백 처리 중 예외 발생&error_description=${encodeURIComponent(errorMessage)}`, request.url);
        console.log('[AuthCallback] Redirecting to (exception):', exceptionRedirectUrl.toString());
        return NextResponse.redirect(exceptionRedirectUrl);
        ```

**요청사항:**

*   각 로그 메시지 앞에 `[AuthCallback]` 프리픽스를 붙여 다른 로그와 구별되도록 해주세요.
*   오류 상황에서는 `console.error`를 사용하고, 일반 정보는 `console.log`를 사용해주세요.
*   민감 정보(전체 `code` 등)는 직접 로깅하지 않도록 주의해주세요.