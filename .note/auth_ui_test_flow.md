**Integration Test Task List: `AuthContext`, `AuthForm`, `UserProfile`**

**Goal:** Achieve 90%+ coverage for `AuthContext.tsx`, `AuthForm.tsx`, and `UserProfile.tsx` by testing their integration with `src/lib/auth` (and indirectly `hybrid-supabase`, `auth-storage`) using RTL. Mock external Supabase calls and browser storage.

**Testing Strategy:**

1.  **Test Files:**
    *   `src/contexts/AuthContext.integration.test.tsx`
    *   `src/components/auth/AuthForm.integration.test.tsx`
    *   `src/components/auth/UserProfile.integration.test.tsx`
2.  **Framework:** Use `vitest` and `@testing-library/react`.
3.  **Mocking (Leverage existing `src/lib` test setup):**
    *   **Supabase Client Methods:** Mock methods like `supabase.auth.getSession`, `supabase.auth.onAuthStateChange`, `supabase.auth.signInWithPassword`, `supabase.auth.signUp`, `supabase.auth.signOut`, `supabase.auth.getUser` etc., called *within* `src/lib/hybrid-supabase.ts` (used by `src/lib/auth`).
    *   **Storage:** Mock `localStorage`, `sessionStorage`, `document.cookie` (or `src/lib/cookie.ts` functions), and `indexedDB` if used by `src/lib/auth-storage.ts`. Use `vi.stubGlobal` and potentially mocks from `src/tests/setup.ts`.
    *   **`next/navigation`:** Ensure `useRouter`, `useSearchParams` are mocked (likely already done in `src/tests/setup.ts`).
    *   **`sonner (toast)`:** Mock `toast.success`, `toast.error`, etc. to verify user feedback.
    *   **`cookies-next`:** If `AuthForm` uses it directly, mock `setCookie`.
4.  **Rendering:**
    *   For `AuthContext`, render a simple consumer component within `<AuthProvider>`.
    *   For `AuthForm` and `UserProfile`, render them within `<AuthProvider>` to ensure they receive the necessary context.

---

**Phase 1: Test Setup (Apply to all test files)**

1.  **Create Test Files:** Create the three `.integration.test.tsx` files mentioned above.
2.  **Import Utilities:** Import `render`, `screen`, `fireEvent`, `waitFor`, `act` from `@testing-library/react`, `userEvent` from `@testing-library/user-event`, and `vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach` from `vitest`.
3.  **Setup Global Mocks (`beforeEach` / `setupFiles`):**
    *   **Task:** Ensure Supabase client method mocks are configured (reuse/adapt from `src/lib` tests). Mock both success and error responses.
    *   **Task:** Ensure browser storage (`localStorage`, `sessionStorage`, cookies) is mocked and cleared before each test (reuse/adapt from `src/tests/setup.ts`).
    *   **Task:** Ensure `next/navigation` hooks are mocked.
    *   **Task:** Mock `sonner` toast functions.
    *   **Task:** Mock `cookies-next` if used directly.

---

**Phase 2: `AuthContext.tsx` Integration Tests (`src/contexts/AuthContext.integration.test.tsx`)**

*   **Goal:** Verify `AuthProvider` initializes correctly, manages state based on Supabase responses, interacts with `auth-storage`, and provides correct values/functions via context.

4.  **Test Component Setup:**
    *   **Task:** Create a simple test component (`TestConsumer`) that uses `useAuth()` to access and display context values (`user`, `session`, `isLoading`, `error`, `codeVerifier`).
    *   **Task:** Render `<AuthProvider><TestConsumer /></AuthProvider>` in tests.
5.  **Test Initial State (Logged Out):**
    *   **Arrange:** Mock `supabase.auth.getSession` to return `{ data: { session: null }, error: null }`. Mock `onAuthStateChange` to initially emit `SIGNED_OUT`. Mock `auth-storage` `getAuthData` to return null for session/verifier.
    *   **Act:** Render the provider and consumer.
    *   **Assert:** Verify `isLoading` becomes `false`. Verify `user` and `session` are `null`. Verify `error` is `null`. Verify rendered output in `TestConsumer` shows logged-out state.
6.  **Test Initial State (Logged In):**
    *   **Arrange:** Mock `supabase.auth.getSession` to return a valid mock session. Mock `onAuthStateChange` to initially emit `SIGNED_IN` with the same session. Mock `auth-storage` to reflect a stored session/verifier if applicable.
    *   **Act:** Render the provider and consumer.
    *   **Assert:** Verify `isLoading` becomes `false`. Verify `user` and `session` match the mock session. Verify rendered output in `TestConsumer` shows logged-in state.
7.  **Test Initial State (Supabase Client Error):**
    *   **Arrange:** Modify the Supabase client mock setup to throw an error during `getHybridSupabaseClient()` call (e.g., by mocking environment variables or the client constructor itself *within this test's scope*).
    *   **Act:** Render the provider and consumer.
    *   **Assert:** Verify `isLoading` is `false`. Verify `user` and `session` are `null`. Verify the `error` state in the context holds the initialization error. Verify `TestConsumer` displays an error state.
8.  **Test Initial State (getSession Error):**
    *   **Arrange:** Mock `supabase.auth.getSession` to return an error (`{ data: { session: null }, error: new Error('Session fetch failed') }`).
    *   **Act:** Render the provider and consumer.
    *   **Assert:** Verify `isLoading` becomes `false`. Verify `user` and `session` are `null`. Verify `error` state might reflect this (depending on implementation). Check console for error logs.
9.  **Test `onAuthStateChange` Handling:**
    *   **Scenario: SIGNED_IN:**
        *   **Arrange:** Start in a logged-out state. Mock `onAuthStateChange` trigger mechanism.
        *   **Act:** Trigger a mock `SIGNED_IN` event via the mocked listener, passing a valid mock session.
        *   **Assert:** Verify `user` and `session` in the context update. Verify `auth-storage` (`setAuthData`) was called to store the session.
    *   **Scenario: SIGNED_OUT:**
        *   **Arrange:** Start in a logged-in state.
        *   **Act:** Trigger a mock `SIGNED_OUT` event.
        *   **Assert:** Verify `user` and `session` become `null`. Verify `auth-storage` (`removeAuthData` or `clearAllAuthData`) was called.
    *   **Scenario: TOKEN_REFRESHED:**
        *   **Arrange:** Start in a logged-in state.
        *   **Act:** Trigger a mock `TOKEN_REFRESHED` event with a *new* mock session.
        *   **Assert:** Verify `session` in the context updates to the new session. Verify `auth-storage` (`setAuthData`) was called with the new session data.
10. **Test `signOut` Method (from Context):**
    *   **Arrange:** Start in a logged-in state. Mock `supabase.auth.signOut` to resolve successfully.
    *   **Act:** Get the `signOut` function from the context via `TestConsumer` and call it.
    *   **Assert:** Verify `supabase.auth.signOut` was called. Verify `user` and `session` become `null`. Verify `auth-storage` (`clearAllAuthData` or specific `removeAuthData` calls) was invoked.
    *   **Scenario (SignOut Error):** Mock `supabase.auth.signOut` to reject/throw an error. Call `signOut`. Assert error handling (e.g., `error` state update, console log).
11. **Test `codeVerifier` Management:**
    *   **Arrange:** Render provider/consumer.
    *   **Act:** Call `setCodeVerifier('test-verifier')` obtained from the context.
    *   **Assert:** Verify the `codeVerifier` value in the context updates. Verify `auth-storage` (`setAuthData` for `STORAGE_KEYS.CODE_VERIFIER`) was called.
    *   **Act:** Call `setCodeVerifier(null)`.
    *   **Assert:** Verify context value is `null`. Verify `auth-storage` (`removeAuthData`) was called.

---

**Phase 3: `AuthForm.tsx` Integration Tests (`src/components/auth/AuthForm.integration.test.tsx`)**

*   **Goal:** Verify UI rendering, user input, form submission logic, interaction with `src/lib/auth` functions, loading/error states, and mode switching.

12. **Test Basic Rendering:**
    *   **Arrange:** Render `<AuthProvider><AuthForm /></AuthProvider>`.
    *   **Act:** -
    *   **Assert:** Verify email/password inputs, Login button, Register link/button, and Google Login button are present.
13. **Test Input Handling:**
    *   **Arrange:** Render the form.
    *   **Act:** Use `userEvent.type` to enter text into email and password fields.
    *   **Assert:** Verify the input fields' values are updated correctly.
14. **Test Mode Switching:**
    *   **Arrange:** Render the form (default 'login' mode).
    *   **Act:** Click the "Register" link/button.
    *   **Assert:** Verify the "Name" input field appears. Verify the submit button text changes to "Register" (or similar). Verify email/password fields are cleared.
    *   **Act:** Click the "Login" link/button.
    *   **Assert:** Verify the "Name" input field disappears. Verify button text reverts to "Login". Verify fields are cleared.
15. **Test Login Flow (Success):**
    *   **Arrange:** Render form in 'login' mode. Mock `src/lib/auth.signIn` to return a successful mock session (`{ session: mockSession, user: mockUser, error: null }`). Mock `cookies-next` `setCookie`.
    *   **Act:** Fill in email/password. Click the "Login" button.
    *   **Assert:** Verify `signIn` from `src/lib/auth` was called with correct email/password. Verify loading state was briefly active (button disabled). Verify `toast.success` was called. Verify `setCookie` was called for access/refresh tokens (check arguments like domain, path, secure based on `window.location` mock). Verify redirection occurs (e.g., `window.location.href` assignment).
16. **Test Login Flow (Failure):**
    *   **Arrange:** Render form in 'login' mode. Mock `src/lib/auth.signIn` to throw an error or return `{ session: null, user: null, error: new Error('Invalid credentials') }`.
    *   **Act:** Fill in email/password. Click the "Login" button.
    *   **Assert:** Verify `signIn` was called. Verify loading state was active. Verify `toast.error` was called with the error message. Verify *no* redirection or cookie setting occurred.
17. **Test Registration Flow (Success):**
    *   **Arrange:** Render form in 'register' mode. Mock `src/lib/auth.signUp` to resolve successfully.
    *   **Act:** Fill in name, email, password. Click the "Register" button.
    *   **Assert:** Verify `signUp` from `src/lib/auth` was called with correct details. Verify loading state. Verify `toast.success` (with email confirmation message) was called. Verify redirection.
18. **Test Registration Flow (Failure - e.g., User Exists):**
    *   **Arrange:** Render form in 'register' mode. Mock `src/lib/auth.signUp` to throw an error (e.g., `new Error('User already exists')`).
    *   **Act:** Fill in details. Click "Register" button.
    *   **Assert:** Verify `signUp` was called. Verify loading state. Verify `toast.error` was called with the error message. Verify no redirection.
19. **Test Google Sign-In:**
    *   **Arrange:** Render the form. Mock `src/lib/auth.signInWithGoogle` to resolve successfully (it might trigger a redirect internally, which might be hard to test directly in RTL unless you mock `window.location` assignment).
    *   **Act:** Click the "Google로 계속하기" button.
    *   **Assert:** Verify `signInWithGoogle` from `src/lib/auth` was called. Verify Google loading state was active. (Asserting redirection might require specific mocking of `window.location`).
    *   **Scenario (Google Error):** Mock `signInWithGoogle` to throw an error. Assert `toast.error` is called.

---

**Phase 4: `UserProfile.tsx` Integration Tests (`src/components/auth/UserProfile.integration.test.tsx`)**

*   **Goal:** Verify the component correctly reflects the authentication state from `AuthContext`, fetches user data, displays information, and handles logout.

20. **Test Loading State:**
    *   **Arrange:** Mock `src/lib/auth.getCurrentUser` to be a promise that hasn't resolved yet. Render `<AuthProvider><UserProfile /></AuthProvider>` (ensure `AuthProvider` starts in a loading state).
    *   **Act:** -
    *   **Assert:** Verify a loading indicator (e.g., the pulsing div) is rendered instead of the button/avatar.
21. **Test Logged Out State:**
    *   **Arrange:** Mock `src/lib/auth.getCurrentUser` to resolve to `null`. Render `<AuthProvider><UserProfile /></AuthProvider>` (ensure `AuthProvider` resolves to logged-out state).
    *   **Act:** -
    *   **Assert:** Verify the "로그인" button is rendered.
    *   **Act:** Click the "로그인" button.
    *   **Assert:** Verify `router.push('/login')` was called.
22. **Test Logged In State (Rendering):**
    *   **Arrange:** Create a mock user object (include `email`, `user_metadata.full_name`, `user_metadata.avatar_url`). Mock `src/lib/auth.getCurrentUser` to resolve with this user. Render `<AuthProvider><UserProfile /></AuthProvider>` (ensure `AuthProvider` resolves to logged-in state with this user).
    *   **Act:** Wait for the component to finish loading.
    *   **Assert:** Verify the `DropdownMenuTrigger` (containing the `Avatar`) is rendered. Verify `AvatarImage` uses the `avatar_url` if provided. Verify `AvatarFallback` shows correct initials if no `avatar_url`.
23. **Test Logged In State (Dropdown & User Info):**
    *   **Arrange:** Render logged-in state as above.
    *   **Act:** Click the `DropdownMenuTrigger` (Avatar button).
    *   **Assert:** Verify the dropdown content appears. Verify the user's name (using the priority logic in `getUserName`) and email are displayed correctly within the dropdown. Verify the "로그아웃" menu item is present.
24. **Test Logout Action:**
    *   **Arrange:** Render logged-in state. Mock `src/lib/auth.signOut` to resolve successfully.
    *   **Act:** Click the `DropdownMenuTrigger`. Click the "로그아웃" menu item.
    *   **Assert:** Verify `signOut` from `src/lib/auth` was called. Verify `toast.success` was called. Verify `router.push('/login')` was called.
    *   **Scenario (Logout Error):** Mock `signOut` to throw an error. Click logout. Assert `toast.error` was called. Assert no redirection.

---

**Phase 5: Coverage Analysis and Refinement**

25. **Run Coverage:** Execute `vitest run --coverage` targeting these integration tests.
26. **Analyze Report:** Identify uncovered lines/branches in `AuthContext.tsx`, `AuthForm.tsx`, and `UserProfile.tsx`.
27. **Add Specific Tests:** Write new test cases specifically targeting the uncovered code paths (e.g., specific error handling branches, edge cases in user data display logic, untested conditions in `AuthContext`'s `useEffect`).
28. **Iterate:** Repeat steps 25-27 until the 90% coverage goal is met for all three files.