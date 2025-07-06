import { APIRequestContext, APIResponse } from '@playwright/test';

export interface APIRequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export class APIHelpers {
  private request: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, baseURL: string, defaultHeaders?: Record<string, string>) {
    this.request = request;
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders || {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private mergeHeaders(headers?: Record<string, string>): Record<string, string> {
    return { ...this.defaultHeaders, ...headers };
  }

  async get(endpoint: string, options?: APIRequestOptions): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  async post(endpoint: string, options?: APIRequestOptions): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      headers: this.mergeHeaders(options?.headers),
      data: options?.data,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  async put(endpoint: string, options?: APIRequestOptions): Promise<APIResponse> {
    return this.request.put(`${this.baseURL}${endpoint}`, {
      headers: this.mergeHeaders(options?.headers),
      data: options?.data,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  async patch(endpoint: string, options?: APIRequestOptions): Promise<APIResponse> {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      headers: this.mergeHeaders(options?.headers),
      data: options?.data,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  async delete(endpoint: string, options?: APIRequestOptions): Promise<APIResponse> {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  async verifyResponse(response: APIResponse, expectedStatus: number): Promise<void> {
    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status()}. Response: ${body}`
      );
    }
  }

  async getResponseData<T>(response: APIResponse): Promise<T> {
    await this.verifyResponse(response, 200);
    return response.json() as Promise<T>;
  }

  static async uploadFile(
    request: APIRequestContext,
    url: string,
    filePath: string,
    fieldName = 'file',
    additionalData?: Record<string, string>
  ): Promise<APIResponse> {
    const formData = new FormData();
    
    // Add file
    const file = await request.fetch(filePath);
    const buffer = await file.body();
    formData.append(fieldName, new Blob([buffer]), filePath.split('/').pop() || 'file');
    
    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return request.post(url, {
      multipart: formData,
    });
  }

  static extractCookies(response: APIResponse): Record<string, string> {
    const cookies: Record<string, string> = {};
    const setCookieHeaders = response.headers()['set-cookie'];
    
    if (setCookieHeaders) {
      const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      cookieArray.forEach((cookie) => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        cookies[name.trim()] = value.trim();
      });
    }
    
    return cookies;
  }

  static async waitForAPIResponse(
    operation: () => Promise<APIResponse>,
    condition: (response: APIResponse) => boolean,
    maxRetries = 10,
    delay = 1000
  ): Promise<APIResponse> {
    for (let i = 0; i < maxRetries; i++) {
      const response = await operation();
      if (condition(response)) {
        return response;
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('API response condition not met within timeout');
  }
}