Okay, I understand the need for integration tests for `src/lib`, particularly for the authentication flow involving `auth.ts`, `hybrid-supabase.ts`, and potentially `auth-storage.ts`. The goal is to test their interaction while mocking the external Supabase dependency, aiming for 90% coverage.

Here's a task list designed to guide the creation of these integration tests, focusing on the authentication flow and clarity for implementation:

**Integration Test Plan: `src/lib` Authentication Flow**

**Goal:** Achieve 90%+ Line, Function, and Branch coverage for `auth.ts`, `hybrid-supabase.ts`, and `auth-storage.ts` through integration testing.

**Strategy:**
1.  Create a dedicated integration test file (e.g., `src/lib/auth.integration.test.ts`).
2.  Use a testing framework like `vitest` (implied by the report format).
3.  Mock the underlying Supabase client functions called by `hybrid-supabase.ts` (e.g., `supabase.auth.signInWithPassword`, `supabase.auth.signUp`, `supabase.auth.signOut`, `supabase.auth.getSession`, `supabase.auth.exchangeCodeForSession`, `supabase.auth.onAuthStateChange`, etc.). Mock successful responses, error responses, and different user/session states.
4.  Mock storage mechanisms used by `auth-storage.ts` (e.g., `localStorage`, `sessionStorage`, cookies) to verify session data persistence and clearing.
5.  Call functions exported by `auth.ts` (which internally use `hybrid-supabase.ts` and `auth-storage.ts`).
6.  Assert the final results from `auth.ts` and verify intermediate calls/state changes within the mocked `hybrid-supabase.ts` and `auth-storage.ts`.

---

**Task List:**

**Phase 1: Setup and Basic Mocks**

1.  **Setup Test File:**
    *   Create `src/lib/auth.integration.test.ts`.
    *   Import necessary functions from `auth.ts`, `hybrid-supabase.ts`, `auth-storage.ts` (or functions that use them).
    *   Import mocking utilities from `vitest` (`vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`).
2.  **Mock Supabase Client:**
    *   Identify the core Supabase client methods used *within* `hybrid-supabase.ts` (look for `supabase.auth.*` calls).
    *   Use `vi.mock` to mock these specific methods. It might be necessary to mock the Supabase client instance creation/retrieval mechanism if `hybrid-supabase.ts` uses one.
    *   *Initial Mock Implementation:* Set up default mock implementations (e.g., returning empty promises or basic structures) that can be overridden in specific tests.
3.  **Mock Storage:**
    *   Identify how `auth-storage.ts` persists data (e.g., `localStorage`, `sessionStorage`).
    *   Implement a mock storage object (e.g., a simple JavaScript object) and use `vi.stubGlobal` or similar to replace the actual storage mechanism during tests.
    *   Implement `beforeEach` to clear/reset the mock storage before each test.
4.  **Mock `hybrid-supabase.ts` (Partial/Spying - Optional but helpful):**
    *   Consider using `vi.spyOn` on specific *exported* functions of `hybrid-supabase.ts` *if* you need to verify they were called correctly by `auth.ts`, in addition to mocking the underlying Supabase client calls.

**Phase 2: Testing Core Authentication Flows**

**(For each test case: Arrange -> Act -> Assert)**
*   **Arrange:** Set up specific mock return values for Supabase client methods and initial state for mock storage.
*   **Act:** Call the relevant `auth.ts` function.
*   **Assert:**
    *   Check the return value/exception of the `auth.ts` function.
    *   Verify Supabase client mocks were called with expected arguments (`toHaveBeenCalledWith`).
    *   Verify storage mock state (e.g., session saved, cleared).
    *   Verify any spied `hybrid-supabase.ts` functions were called.

5.  **Test `signIn` Function (`auth.ts`)**
    *   **Scenario:** Successful login (Email/Password).
        *   Mock `supabase.auth.signInWithPassword` to return a successful session/user object.
        *   Call `signIn`.
        *   Assert successful return, session stored via `auth-storage.ts`.
    *   **Scenario:** Incorrect password.
        *   Mock `supabase.auth.signInWithPassword` to throw an authentication error.
        *   Call `signIn`.
        *   Assert specific error is thrown or returned.
        *   Assert session *not* stored.
    *   **Scenario:** User not found.
        *   Mock `supabase.auth.signInWithPassword` to throw a relevant error.
        *   Call `signIn`.
        *   Assert specific error.
    *   **Scenario:** Network or other Supabase error.
        *   Mock `supabase.auth.signInWithPassword` to throw a generic error.
        *   Call `signIn`.
        *   Assert appropriate error handling.
    *   **Scenario:** Input validation failure (if handled in `auth.ts` or `hybrid-supabase.ts`).
        *   Provide invalid input.
        *   Call `signIn`.
        *   Assert validation error *before* calling Supabase mock.

6.  **Test `signUp` Function (`auth.ts`)**
    *   **Scenario:** Successful sign-up.
        *   Mock `supabase.auth.signUp` to return a successful response (user might need confirmation or might be logged in immediately depending on Supabase settings).
        *   Call `signUp`.
        *   Assert successful return. Check if session is stored (if applicable).
    *   **Scenario:** User already exists.
        *   Mock `supabase.auth.signUp` to throw/return an error indicating the user exists.
        *   Call `signUp`.
        *   Assert specific error.
    *   **Scenario:** Weak password.
        *   Mock `supabase.auth.signUp` to throw/return a password policy error.
        *   Call `signUp`.
        *   Assert specific error.
    *   **Scenario:** Other Supabase/network error during sign-up.
        *   Mock `supabase.auth.signUp` to throw a generic error.
        *   Call `signUp`.
        *   Assert error handling.

7.  **Test `signOut` Function (`auth.ts`)**
    *   **Scenario:** Successful sign-out.
        *   Mock `supabase.auth.signOut` to resolve successfully.
        *   Set up mock storage with an existing session.
        *   Call `signOut`.
        *   Assert successful return/resolution.
        *   Assert `supabase.auth.signOut` was called.
        *   Assert session cleared from mock storage via `auth-storage.ts`.
    *   **Scenario:** Error during sign-out.
        *   Mock `supabase.auth.signOut` to throw an error.
        *   Call `signOut`.
        *   Assert appropriate error handling/propagation.
        *   Assert session *might* still be cleared locally depending on implementation.

**Phase 3: Testing Session Management and Callbacks**

8.  **Test Session Retrieval (`getUser`, `getSession`, etc. in `auth.ts`)**
    *   **Scenario:** Valid session exists (locally or fetched from Supabase).
        *   Mock `supabase.auth.getSession` to return a valid session.
        *   Optionally pre-populate mock storage via `auth-storage.ts`.
        *   Call the session retrieval function in `auth.ts`.
        *   Assert the correct user/session data is returned.
        *   Assert `auth-storage.ts` was potentially read from.
    *   **Scenario:** No active session.
        *   Mock `supabase.auth.getSession` to return `{ data: { session: null }, error: null }`.
        *   Clear mock storage.
        *   Call the session retrieval function.
        *   Assert `null` or appropriate empty state is returned.
    *   **Scenario:** Error fetching session from Supabase.
        *   Mock `supabase.auth.getSession` to return an error.
        *   Call the session retrieval function.
        *   Assert error is handled (e.g., returns null, throws).

9.  **Test Auth State Change Handling (if `auth.ts` or `hybrid-supabase.ts` subscribes)**
    *   **Scenario:** Simulate `onAuthStateChange` emitting a 'SIGNED_IN' event.
        *   Mock the `supabase.auth.onAuthStateChange` listener mechanism.
        *   Trigger a mock 'SIGNED_IN' event with session data.
        *   Assert the session is stored via `auth-storage.ts` and internal state (if any) is updated.
    *   **Scenario:** Simulate `onAuthStateChange` emitting a 'SIGNED_OUT' event.
        *   Trigger a mock 'SIGNED_OUT' event.
        *   Assert the session is cleared via `auth-storage.ts`.
    *   **Scenario:** Simulate 'TOKEN_REFRESHED' event.
        *   Trigger a mock 'TOKEN_REFRESHED' event with a new session.
        *   Assert the updated session is stored.

10. **Test OAuth/Callback Handling (e.g., `exchangeCodeForSession` if used)**
    *   **Scenario:** Successful code exchange.
        *   Mock `supabase.auth.exchangeCodeForSession` (or similar) to return a valid session.
        *   Call the relevant callback handler function in `auth.ts`.
        *   Assert session is stored via `auth-storage.ts`.
    *   **Scenario:** Invalid code or error during exchange.
        *   Mock `supabase.auth.exchangeCodeForSession` to throw an error.
        *   Call the callback handler function.
        *   Assert error is handled correctly (e.g., redirection to error page, error thrown).

**Phase 4: Coverage Improvement and Edge Cases**

11. **Analyze Coverage Report:**
    *   Run `vitest run --coverage` after implementing the above tests.
    *   Identify uncovered lines/branches/functions in `auth.ts`, `hybrid-supabase.ts`, and `auth-storage.ts`.
12. **Target Uncovered Code:**
    *   **`auth.ts` (Example Uncovered: 53-54, 125-126, etc.):** Determine what conditions trigger these lines (specific error types, null checks, specific logic paths) and write tests simulating those conditions.
    *   **`hybrid-supabase.ts` (Example Uncovered: 51-52, 69-71, 106-114, etc.):** These often relate to specific Supabase response structures, error handling branches, or different ways functions can be called. Create mocks returning these specific structures or triggering these errors.
    *   **`auth-storage.ts` (Many Uncovered):** This likely involves various scenarios of getting/setting/removing items, handling different storage types (if applicable), error handling during storage access (e.g., storage full, permissions), and potentially complex logic around session merging or validation. Add specific tests for:
        *   Setting different types of auth data (tokens, user info).
        *   Getting data when it exists vs. doesn't exist.
        *   Removing specific items vs. clearing all.
        *   Handling potential errors during `JSON.parse` or `JSON.stringify` if used.
        *   Testing any utility functions within `auth-storage.ts` directly if needed.
13. **Test Edge Cases:**
    *   Simulate concurrent calls (if applicable, though harder in standard tests).
    *   Test with unusual inputs (empty strings, nulls where objects are expected, etc.) if not covered by validation tests.
    *   Test transitions between states (e.g., sign in, then immediately sign out, then try to get user).
14. **Refine and Iterate:**
    *   Re-run coverage reports frequently.
    *   Adjust mocks and test cases until the 90% target is met or exceeded for all three files.
    *   Ensure assertions are robust and meaningful.

**Key Considerations & Tasks for `src/lib` Auth Integration Tests:**

1.  **Verify Mocking Strategy:**
    *   **Task:** Ensure mocks target the *methods* of the Supabase client instance returned by `hybrid-supabase.ts` (e.g., `supabase.auth.signInWithPassword`, `supabase.auth.getSession`), **not** the `hybrid-supabase.ts` module itself. This is crucial for testing the internal logic of `hybrid-supabase.ts`, including its environment detection.

2.  **Implement Comprehensive Storage Mocking:**
    *   **Task:** Identify and accurately mock *all* storage mechanisms used by `auth-storage.ts`. This includes `localStorage`, `sessionStorage`, cookies (potentially via mocking `src/lib/cookie.ts` or `document.cookie`), and potentially `indexedDB` or `window.__SUPABASE_AUTH_*` helpers if used.
    *   **Task:** Utilize `vitest` utilities like `vi.stubGlobal` for browser storage APIs. Review and leverage the existing storage mocks in `src/tests/setup.ts`.

3.  **Test the Full PKCE Flow:**
    *   **Task:** When testing OAuth flows (like `signInWithGoogle` or email link auth if PKCE is used), ensure the test covers the *complete* sequence:
        *   Calling `generateCodeVerifier` in `auth.ts`.
        *   Storing the generated verifier via `auth-storage.ts` (interacts with mocked storage).
        *   Calling `generateCodeChallenge` in `auth.ts`.
        *   Mocking the underlying Supabase client's `exchangeCodeForSession` (or similar) method call.
        *   Verifying the subsequent handling and storage of session data via `auth.ts` and `auth-storage.ts`.

4.  **Consider Environment Detection:**
    *   **Task:** Be mindful that tests run in a Node.js/jsdom environment. `hybrid-supabase.ts` uses `detectEnvironment()`. Verify how it behaves in your test setup (it will likely detect 'client' due to jsdom, which is probably desired).
    *   **Task:** If a specific environment (client/server) needs to be forced for a test scenario that `hybrid-supabase.ts` might misinterpret, use appropriate mocking techniques (e.g., mocking `detectEnvironment` or its underlying checks within the scope of that test) to simulate the intended behavior.