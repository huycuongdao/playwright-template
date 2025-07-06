import { test, expect } from '@playwright/test';
import { APIHelpers } from '@utils/api.helpers';
import { DataGenerator } from '@utils/data.generator';
import { testConfig } from '@/config/test.config';

test.describe('Users API', () => {
  let apiHelper: APIHelpers;

  test.beforeAll(async ({ request }) => {
    apiHelper = new APIHelpers(request, testConfig.apiBaseURL, {
      'Authorization': `Bearer ${testConfig.apiToken}`,
    });
  });

  test('should create a new user @smoke', async () => {
    // Arrange
    const newUser = DataGenerator.generateUser();
    const userData = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: newUser.password,
    };

    // Act
    const response = await apiHelper.post('/users', { data: userData });

    // Assert
    expect(response.status()).toBe(201);
    const responseData = await response.json();
    expect(responseData).toMatchObject({
      id: expect.any(String),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    expect(responseData).not.toHaveProperty('password');
  });

  test('should get user by ID', async () => {
    // Arrange - Create a user first
    const newUser = DataGenerator.generateUser();
    const createResponse = await apiHelper.post('/users', { 
      data: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        password: newUser.password,
      }
    });
    const { id } = await createResponse.json();

    // Act
    const response = await apiHelper.get(`/users/${id}`);

    // Assert
    expect(response.status()).toBe(200);
    const userData = await response.json();
    expect(userData).toMatchObject({
      id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    });
  });

  test('should update user information', async () => {
    // Arrange
    const userId = 'test-user-id';
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: DataGenerator.generatePhoneNumber(),
    };

    // Act
    const response = await apiHelper.patch(`/users/${userId}`, { data: updateData });

    // Assert
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData).toMatchObject(updateData);
  });

  test('should delete user', async () => {
    // Arrange
    const userId = 'test-user-id';

    // Act
    const deleteResponse = await apiHelper.delete(`/users/${userId}`);
    
    // Assert
    expect(deleteResponse.status()).toBe(204);

    // Verify user is deleted
    const getResponse = await apiHelper.get(`/users/${userId}`);
    expect(getResponse.status()).toBe(404);
  });

  test('should get paginated list of users', async () => {
    // Act
    const response = await apiHelper.get('/users', {
      params: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      users: expect.any(Array),
      pagination: {
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
    expect(data.users.length).toBeLessThanOrEqual(10);
  });

  test('should validate email uniqueness', async () => {
    // Arrange
    const email = DataGenerator.generateEmail();
    const userData = {
      email,
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123!@#',
    };

    // Act - Create first user
    const firstResponse = await apiHelper.post('/users', { data: userData });
    expect(firstResponse.status()).toBe(201);

    // Act - Try to create another user with same email
    const secondResponse = await apiHelper.post('/users', { data: userData });

    // Assert
    expect(secondResponse.status()).toBe(409);
    const errorData = await secondResponse.json();
    expect(errorData).toMatchObject({
      error: 'Conflict',
      message: 'Email already exists',
    });
  });

  test('should validate required fields @regression', async () => {
    // Arrange - Missing required fields
    const invalidData = {
      firstName: 'Test',
      // Missing email and password
    };

    // Act
    const response = await apiHelper.post('/users', { data: invalidData });

    // Assert
    expect(response.status()).toBe(400);
    const errorData = await response.json();
    expect(errorData).toMatchObject({
      error: 'Bad Request',
      validation: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: expect.any(String),
        }),
        expect.objectContaining({
          field: 'password',
          message: expect.any(String),
        }),
      ]),
    });
  });

  test('should handle authentication errors', async ({ request }) => {
    // Arrange - Create helper without auth token
    const unauthHelper = new APIHelpers(request, testConfig.apiBaseURL);

    // Act
    const response = await unauthHelper.get('/users/me');

    // Assert
    expect(response.status()).toBe(401);
    const errorData = await response.json();
    expect(errorData).toMatchObject({
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });

  test('should upload user avatar', async ({ request }) => {
    // Arrange
    const userId = 'test-user-id';
    const imagePath = 'test-data/avatar.jpg';

    // Act
    const response = await APIHelpers.uploadFile(
      request,
      `${testConfig.apiBaseURL}/users/${userId}/avatar`,
      imagePath,
      'avatar',
      { userId }
    );

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      avatarUrl: expect.stringMatching(/^https?:\/\/.+/),
    });
  });

  test('should handle rate limiting', async () => {
    // Arrange
    const requests = Array(100).fill(null);

    // Act - Send many requests rapidly
    const responses = await Promise.all(
      requests.map(() => apiHelper.get('/users'))
    );

    // Assert - Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
    
    const rateLimitResponse = rateLimited[0];
    const headers = rateLimitResponse.headers();
    expect(headers).toHaveProperty('x-ratelimit-limit');
    expect(headers).toHaveProperty('x-ratelimit-remaining');
    expect(headers).toHaveProperty('x-ratelimit-reset');
  });
});