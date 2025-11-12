import { HttpException, HttpStatus } from '@nestjs/common';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  message: string;
  status: number;
}

export class Http {
  static async get<T = any>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'GET', undefined, options);
  }

  static async post<T = any>(
    url: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'POST', body, options);
  }

  static async put<T = any>(
    url: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'PUT', body, options);
  }

  static async patch<T = any>(
    url: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'PATCH', body, options);
  }

  static async delete<T = any>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, 'DELETE', undefined, options);
  }

  private static async request<T = any>(
    url: string,
    method: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    const { headers = {}, timeout = 30000 } = options || {};

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const mergedHeaders = { ...defaultHeaders, ...headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new HttpException(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as any;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        throw new HttpException(`Request timeout after ${timeout}ms`, HttpStatus.REQUEST_TIMEOUT);
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(`Request failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private static async parseErrorResponse(
    response: Response,
  ): Promise<{ message: string; details?: any }> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          message: data.message || data.error || 'Request failed',
          details: data,
        };
      }
      const text = await response.text();
      return { message: text || 'Request failed' };
    } catch {
      return { message: 'Request failed' };
    }
  }
}
