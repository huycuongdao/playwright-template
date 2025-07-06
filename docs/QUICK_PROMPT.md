# Quick Prompt Template - Copy & Use

**Choose your approach:**
- **🚀 Manual Approach**: Use the prompt below (full control, follows patterns)
- **🤖 AI-Assisted Approach**: Use **[MCP Prompt](MCP_PROMPT.md)** (AI explores and generates)

**Copy this prompt and fill in the details:**

---

I need to add a new page/feature to my existing project. Please follow the comprehensive guide at docs/NEW_FEATURE_GUIDE.md and implement the complete solution.

## 📝 Feature Details:

**Feature Name**: [REPLACE_WITH_FEATURE_NAME]
**Page URL/Route**: [REPLACE_WITH_URL]
**Authentication Required**: [YES/NO]
**Main Functionality**: [REPLACE_WITH_DESCRIPTION]
**API Endpoints**: [REPLACE_WITH_ENDPOINTS_OR_N/A]

## 🎯 Requirements:

Please implement the following following the manual approach from the guide:

1. **Create Page Object Class** (`src/pages/[feature-name].page.ts`)
   - Extend BasePage
   - Use data-testid locators primarily
   - Include all necessary methods for the functionality
   - Follow existing naming conventions

2. **Update Index File** (`src/pages/index.ts`)
   - Export the new page object

3. **Update Test Fixtures** (`src/fixtures/test.fixtures.ts`)
   - Add the page object to PageObjects type
   - Add fixture for both regular and authenticated tests
   - Follow existing patterns

4. **Create E2E Tests** (`tests/e2e/[feature-name].spec.ts`)
   - Include smoke tests (@smoke tag)
   - Include regression tests (@regression tag)
   - Test both happy path and edge cases
   - Use the custom fixtures
   - Include proper test organization with describe blocks

5. **Create Visual Tests** (`tests/visual/[feature-name].visual.spec.ts`)
   - Screenshot tests for different states
   - Mobile and desktop views
   - Include animation disabling

6. **Create API Tests** (`tests/api/[feature-name].api.spec.ts`) - if applicable
   - Test CRUD operations
   - Use APIHelpers utility
   - Include proper status code assertions

7. **Skip Accessibility Tests** for now (as noted in the guide)

## 🔧 Technical Requirements:

- Follow the project's import path conventions (`@fixtures`, `@pages`, `@utils`)
- Use TypeScript strictly
- Include proper error handling
- Use existing utilities (DataGenerator, TestHelpers)
- Follow the existing code style and patterns
- Include comprehensive test coverage

## 📊 Expected Deliverables:

- Complete page object class with all locators and methods
- Updated fixtures file
- Updated index file  
- Comprehensive test suite (E2E, Visual, API)
- All tests should be runnable with existing npm scripts
- Code should pass TypeScript compilation and linting

Please implement this step by step, ensuring each file integrates properly with the existing template structure.

---

**Quick Examples:**

**E-commerce Cart**: 
- Feature Name: Shopping Cart
- URL: /cart  
- Auth: YES
- Functionality: View, modify, checkout cart items
- API: GET /api/cart, POST /api/cart/items, PUT /api/cart/items/:id, DELETE /api/cart/items/:id

**Product Listing**:
- Feature Name: Product Catalog  
- URL: /products
- Auth: NO
- Functionality: Browse, filter, search products
- API: GET /api/products, GET /api/categories

**User Profile**:
- Feature Name: User Profile
- URL: /profile
- Auth: YES  
- Functionality: View and edit user information
- API: GET /api/profile, PUT /api/profile