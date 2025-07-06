# Known Issues

## Concurrent User Access in Login Tests

### Problem
Multiple tests running in parallel tried to update the same user record simultaneously, causing database conflicts.

### Symptoms
- Tests fail with 500 error during login
- Manual login works fine
- Error appears only when running tests in parallel

### Backend Error
```
HibernateOptimisticLockingFailureException: Object of class [com.genRocket.User] with identifier [56]: optimistic locking failed
```

### Root Cause
- Playwright runs tests in parallel by default (using multiple workers)
- All tests were using the same user credentials from `testConfig.credentials`
- When multiple tests logged in simultaneously, they all tried to update the same User record (likely updating last login timestamp)
- This triggered Hibernate's optimistic locking mechanism, causing failures

### Implemented Solution
Added `test.describe.configure({ mode: 'serial' })` to force sequential execution of login tests, ensuring only one test accesses the user account at a time.

```typescript
// tests/e2e/login.spec.ts
test.describe.configure({ mode: 'serial' });

test.describe('Login Flow', () => {
  // tests run sequentially
});
```

### Alternative Solutions (Not Implemented)
1. **Use different test users for each test**
   - Create unique test accounts
   - Pros: Maintains parallel execution, more realistic testing
   - Cons: Requires multiple test accounts

2. **Add retry logic for optimistic locking failures**
   - Implement exponential backoff retry mechanism
   - Pros: Handles transient failures gracefully
   - Cons: May mask other issues, adds complexity

3. **Mock authentication to avoid database access**
   - Skip real authentication for unit tests
   - Pros: Faster tests, no database conflicts
   - Cons: Less realistic, doesn't test actual auth flow

### Impact
- Tests run sequentially within the login suite
- Slightly slower execution but more reliable
- No impact on other test suites which can still run in parallel