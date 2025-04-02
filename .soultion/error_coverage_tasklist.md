**Goal:** Increase unit test coverage for any given file (`[filename].ts` or `[filename].tsx`) by specifically targeting untested error handling logic (e.g., `catch` blocks, error-related conditional branches) to contribute towards a 90%+ overall coverage goal.

**Strategy:** Utilize unit tests to isolate functions or methods within the target file. Mock all external dependencies (other modules, global objects, APIs, environment variables) to precisely control execution flow and *force* error conditions. Verify that the error handling code paths are executed and behave as expected.

---

**Generic Task List: Unit Testing Error Handling Logic**

**Phase 1: Preparation & Setup**

1.  **Create Test File:**
    *   Task: Create a corresponding test file (e.g., `[filename].test.ts`).
2.  **Import Dependencies:**
    *   Task: Import the target function(s)/module(s) from `[filename].ts`.
    *   Task: Import necessary testing utilities from `vitest` (`vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`).
3.  **Analyze Coverage Gaps:**
    *   Task: Review the V8 coverage report for `[filename].ts`.
    *   Task: Identify specific line numbers or branches marked as "Uncovered". Pay close attention to lines within `catch` blocks, `if (error)` conditions, or code handling potentially null/undefined values returned from dependencies.
4.  **Identify Dependencies for Mocking:**
    *   Task: List all external modules, functions, global objects (`window`, `localStorage`, `fetch`, `process.env`), or API endpoints that the target function(s) interact with, *especially* those involved in the uncovered error paths.

**Phase 2: Mocking Dependencies for Error Simulation**

5.  **Mock External Modules/Functions:**
    *   Task: Use `vi.mock()` to mock imported modules or `vi.spyOn()` for specific methods if only partial mocking is needed.
6.  **Mock Global Objects/APIs:**
    *   Task: Use `vi.stubGlobal()` to mock global browser/Node.js APIs like `fetch`, `localStorage.setItem`, `indexedDB.open`, `document.cookie`, `process.env`, etc.
7.  **Configure Mocks to Simulate Errors:**
    *   Task: For *each error scenario* being tested, configure the relevant mock(s) to simulate failure. This could involve:
        *   Making the mock function `throw new Error('Specific error message')`.
        *   Making the mock function return `null` or `undefined` where an object is expected.
        *   Making `fetch` mocks return `Response` objects with `ok: false` and a specific `status` code (e.g., 400, 404, 500) and an error body.
        *   Making asynchronous mocks return `Promise.reject(new Error(...))`.
        *   Configuring mocked storage methods (`localStorage.setItem`, etc.) to throw errors.

**Phase 3: Writing Error Handling Test Cases**

8.  **Structure Tests:**
    *   Task: Use `describe('[FunctionName]')` to group tests for a specific function.
    *   Task: Use `it('should handle [specific error condition] correctly')` for each distinct error scenario identified in Phase 1.
9.  **Arrange (Setup Mocks for Failure):**
    *   Task: Inside each `it` block, specifically configure the mocks (from Phase 2) to trigger the *one* error condition being tested in that scenario.
    *   Task: Reset mocks using `beforeEach` or within the `it` block if necessary to avoid interference between tests.
10. **Act (Call the Function):**
    *   Task: Call the target function from `[filename].ts` with appropriate arguments for the error scenario.
    *   Task: If the expected behavior is for the function to *throw* an error, wrap the call using `expect(() => targetFunction(...)).toThrow(...)`.
11. **Assert (Verify Error Handling):**
    *   Task: **If an error is thrown:**
        *   Verify the correct type of error was thrown (`toThrow(ErrorType)`).
        *   Verify the error message is as expected (`toThrow('Expected message')`).
    *   Task: **If the error is handled internally:**
        *   Verify the function returns the expected value (e.g., `null`, `false`, `[]`, a default object). Use `expect(result).toBeNull()`, `expect(result).toBeFalsy()`, `expect(result).toEqual(...)`.
        *   Verify that error logging functions (`logger.error`, `console.error` - ensure these are also mocked/spied upon) were called with the expected arguments (`toHaveBeenCalledWith(...)`).
        *   Verify any specific fallback functions or alternative code paths meant for error handling were executed.
        *   Verify that side effects specific to the *successful* execution path **did not** occur (e.g., `localStorage.setItem` was *not* called after a `getItem` failure, a success toast was *not* shown).

**Phase 4: Iteration and Refinement**

12. **Run Coverage Analysis:**
    *   Task: Execute `vitest run --coverage`.
13. **Review and Iterate:**
    *   Task: Re-examine the coverage report for `[filename].ts`.
    *   Task: If error handling paths are still uncovered, analyze why the test didn't trigger them. Refine the mocks or add new `it` blocks for missing scenarios.
    *   Task: Repeat steps 8-13 until the desired coverage for error paths is achieved.
