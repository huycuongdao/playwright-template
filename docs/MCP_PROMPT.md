# Playwright MCP Prompt Template

## 🤖 AI-Assisted Test Generation with Playwright MCP

Use this when you want AI to explore your application and automatically generate comprehensive tests.

---

## ⚡ Quick Setup (One-time only)

Before using MCP, ensure you have the configuration files:

### 1. Create `.vscode/mcp.json`:
```json
{
    "servers": {
        "playwright": {
            "command": "npx",
            "args": ["@playwright/mcp@latest"]
        }
    }
}
```

### 2. Update `.vscode/settings.json`:
```json
{
    "chat.tools.autoApprove": true,
    "mcp.enableAgent": true
}
```

### 3. Create `.github/generate_tests.prompt.md`:
```markdown
# Playwright Test Generation Prompt

You are a Playwright test generator expert. Your task is to explore web applications and generate comprehensive test suites.

## Guidelines:

1. **Exploration First**: Always explore the page/feature thoroughly before writing tests
2. **Use Page Object Model**: Follow the existing POM pattern in this project
3. **Multiple Test Types**: Generate E2E, visual, and API tests when applicable
4. **Use Proper Locators**: Prefer data-testid attributes, then role-based locators
5. **Follow Project Structure**: Maintain consistency with existing code patterns
6. **Include Edge Cases**: Test both happy path and error scenarios
7. **Add Appropriate Tags**: Use @smoke, @regression, @critical tags
8. **Comprehensive Assertions**: Verify both UI state and business logic

## Process:

1. Navigate to the target page/feature
2. Explore all interactive elements
3. Identify user workflows and edge cases
4. Generate page object classes following existing patterns
5. Create comprehensive test suites
6. Include visual regression tests
7. Skip accessibility tests for now (as noted in project guidelines)
8. Generate API tests for backend interactions

## Code Standards:

- Use TypeScript
- Follow existing naming conventions
- Use import paths: @fixtures, @pages, @utils
- Include proper error handling
- Add meaningful test descriptions
- Use the project's custom fixtures
- Maintain consistency with existing test structure

Generate tests that are production-ready and maintainable.
```

---

## 🎯 MCP Exploration Prompt Template

**Copy this prompt and customize for your feature:**

---

```
I need to explore and generate comprehensive tests for a new feature in my project. Please use your MCP capabilities to explore the application and generate all necessary files.

## 🔍 Exploration Target:

**Feature URL**: [REPLACE_WITH_FULL_URL]
**Feature Name**: [REPLACE_WITH_FEATURE_NAME]
**Authentication Required**: [YES/NO - if YES, provide login credentials or instructions]
**User Permissions**: [PERMISSION_REQUIREMENTS - describe different user roles if applicable]

## 📋 Exploration Instructions:

Please explore the target URL and:

1. **Thoroughly Navigate** the feature/page
   - Interact with all clickable elements
   - Fill out forms with test data
   - Navigate through different states
   - Identify user workflows and edge cases

2. **Explore Different User Permissions** (if applicable)
   - Test the feature with different user roles (admin, normal user, guest)
   - Document what elements are visible/hidden for each role
   - Note functionality that's enabled/disabled based on permissions
   - Test direct URL access attempts for unauthorized users
   - Identify role-specific workflows and restrictions

3. **Document Your Findings**
   - List all interactive elements and their selectors
   - Identify user workflows (happy path and edge cases)
   - Note any API calls being made
   - Capture different page states
   - Document permission-based differences between user roles

4. **Generate Complete Implementation** following our project patterns:

   **Page Object Class** (`src/pages/[feature-name].page.ts`):
   - Extend BasePage from existing template
   - Use data-testid locators primarily
   - Include all necessary methods for interactions
   - Follow existing naming conventions

   **Update Fixtures** (`src/fixtures/test.fixtures.ts`):
   - Add new page object to PageObjects type
   - Add fixture for regular and authenticated tests
   - Follow existing patterns exactly

   **Update Index** (`src/pages/index.ts`):
   - Export the new page object

   **E2E Tests** (`tests/e2e/[feature-name].spec.ts`):
   - Comprehensive test coverage based on your exploration
   - Include @smoke and @regression tagged tests
   - Test both happy path and edge cases you discovered
   - Use our custom fixtures (import from @fixtures/test.fixtures)
   - Follow existing test organization patterns

   **Visual Tests** (`tests/visual/[feature-name].visual.spec.ts`):
   - Screenshot tests for different states you observed
   - Include mobile and desktop views
   - Disable animations for consistency

   **API Tests** (`tests/api/[feature-name].api.spec.ts`) - if applicable:
   - Based on API calls you observed during exploration
   - Use APIHelpers utility from the project
   - Test CRUD operations where applicable

   **Permission Tests** (`tests/e2e/[feature-name]-permissions.spec.ts`) - if applicable:
   - Based on role differences you discovered during exploration
   - Test different user role behaviors (admin vs normal user)
   - Verify UI elements shown/hidden based on permissions
   - Test unauthorized access attempts and redirects
   - Include API permission testing
   - Generate user fixtures for different roles (adminPage, normalUserPage)

## 🔧 Technical Requirements:

- **Import Paths**: Use @fixtures, @pages, @utils (match tsconfig.json)
- **TypeScript**: Strict typing throughout
- **Error Handling**: Include proper error handling
- **Test Data**: Use existing DataGenerator utility when appropriate
- **Code Style**: Follow existing patterns in the project
- **Accessibility**: Skip accessibility tests for now (as per project guidelines)

## 📊 Expected Output:

Based on your exploration, provide:
1. **Exploration Summary**: What you found, key workflows, interesting edge cases
2. **Complete File Implementations**: All files ready to use
3. **Integration Notes**: Any specific notes about how this integrates with existing code
4. **Test Coverage Summary**: What scenarios are covered

## 🚀 Exploration Process:

1. Navigate to [REPLACE_WITH_FULL_URL]
2. Explore all functionality systematically
3. Generate code based on actual observations
4. Ensure all code follows our existing project patterns
5. Provide production-ready implementations

Please start exploring now and generate the complete implementation based on what you discover.
```

---

## 📝 Required Inputs

Replace these placeholders when using the prompt:

### **[REPLACE_WITH_FULL_URL]**
- **Format**: Complete URL including domain
- **Examples**: 
  - `"https://my-app.com/cart"`
  - `"http://localhost:3000/dashboard"`
  - `"https://staging.myapp.com/profile"`

### **[REPLACE_WITH_FEATURE_NAME]**
- **Format**: Descriptive name for the feature
- **Examples**:
  - `"Shopping Cart"`
  - `"User Dashboard"`
  - `"Product Catalog"`

### **[YES/NO - Authentication Info]**
- **Format**: Whether login is required and how to access
- **Examples**:
  - `"YES - use test credentials: user@test.com / password123"`
  - `"NO - publicly accessible"`
  - `"YES - please use the login fixture from our existing tests"`

### **[PERMISSION_REQUIREMENTS]**
- **Format**: Describe user roles and permission differences
- **Examples**:
  - `"ALL - All authenticated users have same access"`
  - `"ADMIN_ONLY - Only admin users can access this feature"`
  - `"ROLE_BASED - Admin users see full functionality, normal users see limited view"`
  - `"OWNER_ONLY - Users can only access their own data"`
  - `"N/A - No special permissions required"`

## 💡 MCP Usage Examples

### Example 1: E-commerce Cart
```
**Feature URL**: https://mystore.com/cart
**Feature Name**: Shopping Cart
**Authentication Required**: YES - use test credentials: shopper@test.com / test123
**User Permissions**: ALL - All authenticated users can access their cart
```

### Example 2: Public Product Listing
```
**Feature URL**: https://mystore.com/products
**Feature Name**: Product Catalog
**Authentication Required**: NO - publicly accessible
**User Permissions**: N/A - No special permissions required
```

### Example 3: User Dashboard
```
**Feature URL**: http://localhost:3000/dashboard
**Feature Name**: User Dashboard  
**Authentication Required**: YES - please use the existing authenticated fixtures
**User Permissions**: ALL - All authenticated users have access to their dashboard
```

### Example 4: Admin Panel
```
**Feature URL**: https://myapp.com/admin
**Feature Name**: Admin Panel
**Authentication Required**: YES - use admin credentials: admin@test.com / admin123
**User Permissions**: ADMIN_ONLY - Only admin users can access this feature
```

### Example 5: Role-Based Feature
```
**Feature URL**: https://myapp.com/users
**Feature Name**: User Management
**Authentication Required**: YES - test with both admin@test.com / admin123 and user@test.com / user123
**User Permissions**: ROLE_BASED - Admin users can view/edit all users, normal users can only view/edit their own profile
```

## 🔄 MCP vs Manual Approach

### Use MCP When:
- ✅ You want AI to discover functionality you might miss
- ✅ The application is complex with many interactions
- ✅ You want to generate tests based on actual usage patterns
- ✅ You're exploring an existing application

### Use Manual Approach When:
- ✅ You know exactly what needs to be tested
- ✅ The feature is simple and straightforward
- ✅ You want full control over test structure
- ✅ The application isn't running yet

## 🚀 After MCP Generation

1. **Review Generated Code**: Ensure it follows project patterns
2. **Run TypeScript Check**: `npm run typecheck`
3. **Run Linting**: `npm run lint`
4. **Test Execution**: `npm test` to verify everything works
5. **Refine If Needed**: Add any missing edge cases or cleanup

---

**The MCP approach provides AI-driven exploration and test generation based on actual application behavior, complementing the manual approach for comprehensive test coverage.**