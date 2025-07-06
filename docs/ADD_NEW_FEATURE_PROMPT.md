# Generic Prompt Template for Adding New Pages/Features

## 📋 Prompt Template

**Copy and customize this prompt each time you want to add a new page/feature:**

---

```
I need to add a new page/feature to my Playwright template project. Please follow the comprehensive guide at docs/NEW_FEATURE_GUIDE.md and implement the complete solution.

## 📝 Feature Details:

**Feature Name**: [FEATURE_NAME]
**Page URL/Route**: [PAGE_URL]
**Authentication Required**: [YES/NO]
**User Permissions**: [PERMISSION_REQUIREMENTS]
**Main Functionality**: [FUNCTIONALITY_DESCRIPTION]
**API Endpoints**: [API_ENDPOINTS_IF_ANY]

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

7. **Create Permission Tests** (`tests/e2e/[feature-name]-permissions.spec.ts`) - if applicable
   - Test different user role behaviors (admin vs normal user)
   - Verify UI elements shown/hidden based on permissions
   - Test unauthorized access attempts
   - Include API permission testing

8. **Skip Accessibility Tests** for now (as noted in the guide)

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
```

---

## 🤖 Alternative: Playwright MCP Approach

For AI-assisted exploration and test generation, use the **[MCP Prompt Template](MCP_PROMPT.md)** instead. This approach:
- Automatically explores your live application
- Discovers functionality and edge cases
- Generates tests based on actual user interactions
- Provides AI-driven test coverage suggestions

## 📋 Required Inputs

When using this prompt, replace the following placeholders:

### **[FEATURE_NAME]** 
- **Format**: Pascal case for classes, kebab-case for files
- **Examples**: 
  - `"Shopping Cart"` → Class: `ShoppingCartPage`, File: `shopping-cart.page.ts`
  - `"User Profile"` → Class: `UserProfilePage`, File: `user-profile.page.ts`
  - `"Product Details"` → Class: `ProductDetailsPage`, File: `product-details.page.ts`

### **[PAGE_URL]**
- **Format**: URL route/path
- **Examples**:
  - `"/cart"`
  - `"/profile"`
  - `"/product/:id"`
  - `"/dashboard/settings"`

### **[YES/NO]**
- **Authentication Required**: 
  - `"YES"` - Page requires user to be logged in
  - `"NO"` - Page is accessible to anonymous users

### **[PERMISSION_REQUIREMENTS]**
- **User Permissions**: Specify what user roles can access this feature
- **Examples**:
  - `"ALL"` - All authenticated users can access
  - `"ADMIN_ONLY"` - Only admin users can access
  - `"ADMIN_AND_MANAGERS"` - Admin and manager roles can access
  - `"ROLE_BASED - Admin sees full functionality, normal users see limited features"`
  - `"OWNER_ONLY"` - Only resource owners can access (e.g., user can only edit their own profile)
  - `"N/A"` - No special permissions (public or basic auth only)

### **[FUNCTIONALITY_DESCRIPTION]**
- **Format**: Clear description of what the page does
- **Examples**:
  - `"Allows users to view, modify, and checkout items in their shopping cart"`
  - `"User profile management including personal info, preferences, and account settings"`
  - `"Product detail view with images, description, reviews, and purchase options"`
  - `"Dashboard for administrators to manage users, products, and orders"`

### **[API_ENDPOINTS_IF_ANY]**
- **Format**: List of API endpoints this feature interacts with
- **Examples**:
  - `"GET /api/cart, POST /api/cart/items, DELETE /api/cart/items/:id"`
  - `"GET /api/profile, PUT /api/profile, POST /api/profile/avatar"`
  - `"N/A"` - if no API interactions

## 📚 Usage Examples

### Example 1: Shopping Cart Feature
```
**Feature Name**: Shopping Cart
**Page URL/Route**: /cart
**Authentication Required**: YES
**User Permissions**: ALL - All authenticated users can access their cart
**Main Functionality**: Allows users to view, modify quantities, remove items, and proceed to checkout for items in their shopping cart
**API Endpoints**: GET /api/cart, POST /api/cart/items, PUT /api/cart/items/:id, DELETE /api/cart/items/:id
```

### Example 2: Product Catalog Feature
```
**Feature Name**: Product Catalog
**Page URL/Route**: /products
**Authentication Required**: NO
**User Permissions**: N/A - Public access, no special permissions
**Main Functionality**: Displays paginated list of products with filtering, sorting, and search capabilities
**API Endpoints**: GET /api/products, GET /api/categories, GET /api/products/search
```

### Example 3: User Settings Feature
```
**Feature Name**: User Settings
**Page URL/Route**: /settings
**Authentication Required**: YES
**User Permissions**: OWNER_ONLY - Users can only access their own settings
**Main Functionality**: User account settings including profile information, password change, notification preferences, and account deletion
**API Endpoints**: GET /api/user/settings, PUT /api/user/settings, PUT /api/user/password, DELETE /api/user/account
```

### Example 4: Admin Dashboard Feature
```
**Feature Name**: Admin Dashboard
**Page URL/Route**: /admin/dashboard
**Authentication Required**: YES
**User Permissions**: ADMIN_ONLY - Only admin users can access
**Main Functionality**: Admin dashboard with user management, system statistics, and administrative controls
**API Endpoints**: GET /api/admin/stats, GET /api/admin/users, PUT /api/admin/users/:id, DELETE /api/admin/users/:id
```

### Example 5: User Profile Feature (Role-Based)
```
**Feature Name**: User Profile
**Page URL/Route**: /profile/:id
**Authentication Required**: YES
**User Permissions**: ROLE_BASED - Admin can view/edit any profile, normal users can only view/edit their own
**Main Functionality**: Display and edit user profile information with different capabilities based on user role
**API Endpoints**: GET /api/users/:id, PUT /api/users/:id, GET /api/users/:id/permissions
```

## 💡 Tips for Success

1. **Be Specific**: The more detailed your functionality description, the better the implementation
2. **Check Existing Code**: Review similar pages in the project for consistency
3. **Start Simple**: Begin with core functionality, then add edge cases
4. **Test Thoroughly**: Verify all tests pass before considering the feature complete
5. **Follow Conventions**: Stick to the project's naming and organization patterns

## 🔄 Post-Implementation Checklist

After using the prompt, verify:

- [ ] All TypeScript compilation errors resolved (`npm run typecheck`)
- [ ] All linting issues resolved (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Page object is properly exported and available in fixtures
- [ ] Tests follow project conventions and include appropriate tags
- [ ] API tests cover all endpoints (if applicable)
- [ ] Visual tests capture key states
- [ ] Permission tests verify role-based access controls (if applicable)
- [ ] User fixtures configured for different roles (if applicable)
- [ ] Environment variables set for test user credentials (if applicable)
- [ ] Code follows existing patterns and style

---

**Save this file and use the prompt template whenever you need to add new pages/features to your Playwright template project.**