Okay, let's create a detailed task list for writing unit tests specifically targeting the error handling logic in `auth-storage.ts` and `hybrid-supabase.ts`. This list is designed to be clear for an AI assistant like Cursor Agent.

**Goal:** Increase unit test coverage for `auth-storage.ts` and `hybrid-supabase.ts`, focusing on previously uncovered error handling paths (like `catch` blocks and failure conditions) to reach 90%+ coverage for these files.

**Strategy:** Use unit tests to isolate functions within each file. Mock dependencies (like browser storage APIs, environment variables, or underlying Supabase client creation functions) to *force* error conditions and verify that the error handling logic executes as expected.

---

**Task List: Unit Testing Error Handling**

**Part 1: `auth-storage.ts` Unit Tests (Create `src/lib/auth-storage.test.ts`)**

1.  **Setup Test Environment:**
    *   Import necessary functions from `auth-storage.ts` (`setAuthData`, `getAuthData`, `removeAuthData`, `clearAllAuthData`, `getAuthDataAsync`, etc.).
    *   Import `vitest` utilities (`vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`).
    *   **Mock Global Storage APIs:** Use `vi.stubGlobal` to mock `localStorage`, `sessionStorage`, and potentially `indexedDB` (if its logic is complex enough to warrant separate error testing). Implement mock methods (`getItem`, `setItem`, `removeItem`, `clear`) that can be configured to *throw errors* in specific tests.
    *   **Mock Cookie Utilities:** Mock the functions imported from `./cookie.ts` (`getAuthCookie`, `setAuthCookie`, `deleteAuthCookie`) using `vi.mock`. Configure these mocks to throw errors when needed.
    *   **Mock Crypto Utilities (Optional):** If `encryptValue` or `decryptValue` from `./crypto.ts` have potential failure points (though currently simple), mock them as well.
    *   **Mock Logger:** Mock `createLogger` to prevent actual logging and allow verification of error logging calls.
    *   **`beforeEach`:** Reset all mocks and mock storage state before each test.

2.  **Test `setAuthData` Error Scenarios:**
    *   **Scenario: `localStorage.setItem` fails:**
        *   Configure `localStorage.setItem` mock to throw an error.
        *   Call `setAuthData('test-key', 'test-value')`.
        *   Assert that `sessionStorage.setItem` mock *was called* (fallback attempt).
        *   Assert that `setAuthCookie` mock *was called*.
        *   Assert that IndexedDB write attempt *was made* (if applicable).
        *   Assert that the logger's error method was called.
        *   Assert that `setAuthData` returns `false` (indicating partial or complete failure).
    *   **Scenario: `localStorage` and `sessionStorage.setItem` fail:**
        *   Configure both mocks to throw errors.
        *   Call `setAuthData`.
        *   Assert `setAuthCookie` was called.
        *   Assert IndexedDB write attempt was made.
        *   Assert logger error was called.
        *   Assert return value is `false`.
    *   **Scenario: `setAuthCookie` fails:**
        *   Configure `setAuthCookie` mock to throw.
        *   Call `setAuthData`.
        *   Assert IndexedDB write attempt was made.
        *   Assert logger error was called.
        *   Assert return value is `false`.
    *   **Scenario: IndexedDB write fails (`saveToIndexedDB` internal error):**
        *   Mock `indexedDB.open` or related IDBRequest methods to trigger an error within the IndexedDB helper.
        *   Call `setAuthData`.
        *   Assert logger error was called.
        *   Assert return value is `false`.
    *   **Scenario: `window.__SUPABASE_AUTH_SET_ITEM` fails (if used and mockable):**
        *   Stub `window.__SUPABASE_AUTH_SET_ITEM` to throw.
        *   Call `setAuthData`.
        *   Verify error logging and fallback behavior.

3.  **Test `getAuthData` / `getAuthDataAsync` Error Scenarios:**
    *   **Scenario: `localStorage.getItem` fails:**
        *   Configure mock to throw.
        *   Call `getAuthData('test-key')` / `await getAuthDataAsync('test-key')`.
        *   Assert `sessionStorage.getItem` was called.
        *   Assert `getAuthCookie` was called.
        *   Assert IndexedDB read attempt was made (`getAuthDataAsync`).
        *   Assert logger error was called.
        *   Assert return value is `null`.
    *   **Scenario: All synchronous storage reads fail:**
        *   Configure `localStorage`, `sessionStorage`, `getAuthCookie` mocks to throw/return null.
        *   Call `getAuthData`.
        *   Assert logger errors were called.
        *   Assert return value is `null`.
    *   **Scenario: IndexedDB read fails (`readFromIndexedDB` internal error):**
        *   Mock IndexedDB API calls to cause failure within the helper.
        *   Call `await getAuthDataAsync('test-key')`.
        *   Assert logger error was called.
        *   Assert return value is `null`.
    *   **Scenario: Decryption fails (`decryptValue`):**
        *   Mock `decryptValue` to throw an error.
        *   Provide an "encrypted" value to `getAuthData` via mocked storage.
        *   Call `getAuthData`.
        *   Assert logger error was called.
        *   Assert return value is the original *encrypted* value (or null, depending on implementation).

4.  **Test `removeAuthData` Error Scenarios:**
    *   **Scenario: `localStorage.removeItem` fails:**
        *   Configure mock to throw.
        *   Call `removeAuthData('test-key')`.
        *   Assert `sessionStorage.removeItem` was called.
        *   Assert `deleteAuthCookie` was called.
        *   Assert IndexedDB delete attempt was made.
        *   Assert logger error was called.
        *   Assert return value is `false`.
    *   **Scenario: Failure in multiple/all storage removals:**
        *   Configure multiple mocks to throw.
        *   Call `removeAuthData`.
        *   Assert appropriate logging and `false` return value.

5.  **Test `clearAllAuthData` Error Scenarios:**
    *   **Scenario: `localStorage.clear` fails:**
        *   Configure mock to throw.
        *   Call `clearAllAuthData()`.
        *   Assert `sessionStorage.clear` was called.
        *   Assert cookie clearing logic was attempted.
        *   Assert IndexedDB clearing was attempted.
        *   Assert logger error was called.
    *   **Scenario: Failure in multiple/all storage clears:**
        *   Configure multiple mocks to throw.
        *   Call `clearAllAuthData`.
        *   Assert appropriate logging.

6.  **Test IndexedDB Helper Error Scenarios (If complex):**
    *   Create separate `describe` blocks for `saveToIndexedDB`, `readFromIndexedDB`, `deleteFromIndexedDB`.
    *   **Scenario: `indexedDB.open` fails:** Mock `indexedDB.open` to set `request.onerror`. Verify rejection/error handling.
    *   **Scenario: Transaction fails:** Mock `db.transaction` to throw or mock `transaction.onerror`. Verify error handling.
    *   **Scenario: Object store operation fails:** Mock `store.get/put/delete/clear` request results to set `request.onerror`. Verify error handling.

**Part 2: `hybrid-supabase.ts` Unit Tests (Create `src/lib/hybrid-supabase.test.ts`)**

1.  **Setup Test Environment:**
    *   Import functions (`getHybridSupabaseClient`, `detectEnvironment`, internal creation functions if exported for testing).
    *   Import `vitest` utilities.
    *   **Mock Supabase Libraries:** Use `vi.mock` for `@supabase/ssr` (`createBrowserClient`) and `@supabase/supabase-js` (`createClient`). Configure mocks to return mock client objects or throw errors.
    *   **Mock Environment:**
        *   Mock `process.env` to control `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        *   Mock `window` object (presence/absence) to simulate client/server for `detectEnvironment`.
        *   Mock `next/headers` (`cookies`) if testing server-side paths directly (less likely for pure unit tests here).
    *   **Mock Logger:** Mock `createLogger`.
    *   **`beforeEach`:** Reset mocks.

2.  **Test `createServerSupabaseClient` Error Scenarios:**
    *   **Scenario: Missing Supabase URL:**
        *   Set `process.env.NEXT_PUBLIC_SUPABASE_URL` to `undefined`.
        *   Assert that calling the function (or `getHybridSupabaseClient` in a server context) throws an `Error` with the expected message (Line 51).
        *   Verify logger error call (Line 69).
    *   **Scenario: Missing Supabase Anon Key:**
        *   Set `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` to `undefined`.
        *   Assert that the function throws the expected `Error` (Line 51).
        *   Verify logger error call (Line 69).
    *   **Scenario: `createClient` throws:**
        *   Configure the mocked `createClient` from `@supabase/supabase-js` to throw an error.
        *   Assert that the function catches and re-throws the error (Line 70).
        *   Verify logger error call (Line 69).

3.  **Test `createClientSupabaseClient` Error Scenarios:**
    *   **Scenario: Missing Supabase URL:**
        *   Set `process.env.NEXT_PUBLIC_SUPABASE_URL` to `undefined`.
        *   Assert that the function (or `getHybridSupabaseClient` in a client context) throws an `Error` (Line 86).
        *   Verify logger error call (Line 100).
    *   **Scenario: Missing Supabase Anon Key:**
        *   Set `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` to `undefined`.
        *   Assert that the function throws the expected `Error` (Line 86).
        *   Verify logger error call (Line 100).
    *   **Scenario: `createBrowserClient` throws:**
        *   Configure the mocked `createBrowserClient` from `@supabase/ssr` to throw an error.
        *   Assert that the function catches and re-throws the error (Line 101).
        *   Verify logger error call (Line 100).

4.  **Test `getHybridSupabaseClient` Error Scenarios:**
    *   **Scenario: Unknown Environment:**
        *   Force `detectEnvironment` to return `'unknown'` (by mocking `window` and `process` to be undefined).
        *   Call `getHybridSupabaseClient()`.
        *   Assert that an `Error` is thrown with the message "알 수 없는 환경..." (Line 129).
        *   Verify logger error call (Line 132).
    *   **Scenario: Server Environment, Client Creation Fails:**
        *   Simulate server env (e.g., `window` is undefined).
        *   Mock `createServerSupabaseClient` (or its dependencies like env vars) to throw an error.
        *   Call `getHybridSupabaseClient()`.
        *   Assert that the error is caught and re-thrown (Line 124-125).
        *   Verify logger error call (Line 132).
    *   **Scenario: Client Environment, Client Creation Fails:**
        *   Simulate client env.
        *   Mock `createClientSupabaseClient` (or its dependencies) to throw an error.
        *   Call `getHybridSupabaseClient()`.
        *   Assert that the error is caught and re-thrown.
        *   Verify logger error call.

5.  **Test `detectEnvironment` (Optional but helps Function Coverage):**
    *   **Scenario: Browser:** Mock `window` to exist, `process` to be undefined. Call `detectEnvironment()`. Assert result is `'client'`.
    *   **Scenario: Node:** Mock `window` to be undefined, `process` to exist with `versions.node`. Call `detectEnvironment()`. Assert result is `'server'`.
    *   **Scenario: Unknown:** Mock both `window` and `process` to be undefined. Call `detectEnvironment()`. Assert result is `'unknown'`.