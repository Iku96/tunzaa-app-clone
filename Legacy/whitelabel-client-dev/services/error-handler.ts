import errorsData from './errors.json';

// Types for error handling
export interface ApiError {
  status: number;
  code: string;
  message: string;
  technical: string;
  action: string;
}

export interface EndpointError {
  endpoint: string;
  description: string;
  errors: ApiError[];
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  technical?: string;
  action?: string;
  originalError?: any;
}

// Parse the errors.json file
const endpoints = errorsData.endpoints as EndpointError[];
const globalErrors = errorsData.global_errors as ApiError[];

/**
 * Extract endpoint path from URL
 * @param url - The full URL
 * @param method - The HTTP method
 * @returns The endpoint path in the format "METHOD /path"
 */
function extractEndpoint(url: string, method: string): string {
  try {
    const urlObj = new URL(url);
    return `${method.toUpperCase()} ${urlObj.pathname}`;
  } catch {
    // Fallback for relative URLs
    return `${method.toUpperCase()} ${url}`;
  }
}

/**
 * Find the best matching endpoint from errors.json
 * @param endpoint - The endpoint to match
 * @returns The matching endpoint configuration or null
 */
function findMatchingEndpoint(endpoint: string): EndpointError | null {
  // First try exact match
  const exactMatch = endpoints.find(ep => ep.endpoint === endpoint);
  if (exactMatch) return exactMatch;

  // Try to match by path pattern (handle dynamic segments)
  const pathMatch = endpoints.find(ep => {
    const epPath = ep.endpoint.split(' ')[1]; // Get path part
    const reqPath = endpoint.split(' ')[1]; // Get path part

    if (!epPath || !reqPath) return false;

    // Convert dynamic segments to regex pattern
    const pattern = epPath
      .replace(/\{[^}]+\}/g, '[^/]+') // Replace {id} with [^/]+
      .replace(/\//g, '\\/'); // Escape forward slashes

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(reqPath);
  });

  return pathMatch || null;
}

/**
 * Find error by status code and error code
 * @param status - HTTP status code
 * @param code - Error code from response
 * @param endpoint - The endpoint that was called
 * @returns The matching error or null
 */
function findError(status: number, code: string, endpoint: string): ApiError | null {
  // First try to find endpoint-specific error
  const endpointConfig = findMatchingEndpoint(endpoint);
  if (endpointConfig) {
    const endpointError = endpointConfig.errors.find(
      err => err.status === status && err.code === code
    );
    if (endpointError) return endpointError;
  }

  // Fallback to global errors
  const globalError = globalErrors.find(
    err => err.status === status && err.code === code
  );
  if (globalError) return globalError;

  // If no exact match, try to find by status code only
  const statusError = globalErrors.find(err => err.status === status);
  return statusError || null;
}

/**
 * Parse error response from API
 * @param error - The axios error response
 * @returns Formatted error response with user-friendly message
 */
export function parseApiError(error: any): ErrorResponse {
  const status = error.response?.status || 500;
  const errorData = error.response?.data;

  // Extract error code from response
  let code = 'SERVER_ERROR';
  if (errorData?.code) {
    code = errorData.code;
  } else if (errorData?.error) {
    code = errorData.error;
  } else if (errorData?.detail && typeof errorData.detail === 'string' && errorData.detail.length < 50) {
    // If detail is short, it might be a code
    code = errorData.detail.toUpperCase().replace(/\s+/g, '_');
  } else {
    // Map common HTTP status codes to error codes
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
      502: 'SERVICE_UNAVAILABLE',
      503: 'MAINTENANCE',
    };
    code = statusCodeMap[status] || 'SERVER_ERROR';
  }

  // Extract endpoint from request
  const endpoint = extractEndpoint(
    error.config?.url || '',
    error.config?.method || 'GET'
  );

  // Find matching error from errors.json
  const matchedError = findError(status, code, endpoint);

  if (matchedError) {
    return {
      status: matchedError.status,
      code: matchedError.code,
      message: matchedError.message,
      technical: matchedError.technical,
      action: matchedError.action,
      originalError: error,
    };
  }

  // Fallback error response
  const fallbackErrors: Record<number, { message: string; action: string }> = {
    400: { message: 'Please check your input and try again', action: 'Review form data' },
    401: { message: 'Please log in to continue', action: 'Login' },
    403: { message: 'You don\'t have permission to perform this action', action: 'Contact support' },
    404: { message: 'The requested item was not found', action: 'Check URL or browse' },
    422: { message: 'Please check your input and try again', action: 'Review form fields' },
    429: { message: 'Too many requests. Please try again later', action: 'Wait before retrying' },
    500: { message: 'Something went wrong. Please try again', action: 'Retry or contact support' },
    502: { message: 'Service temporarily unavailable', action: 'Try again later' },
    503: { message: 'Service under maintenance. Please try again later', action: 'Check status page' },
  };

  const fallback = fallbackErrors[status] || fallbackErrors[500];

  // Use errorData.detail as message if available and no matchedError was found
  const message = (typeof errorData?.detail === 'string' ? errorData.detail : null) || fallback.message;

  return {
    status,
    code,
    message,
    action: fallback.action,
    originalError: error,
  };
}

/**
 * Create a user-friendly error message
 * @param error - The parsed error response
 * @returns Formatted error message
 */
export function createErrorMessage(error: ErrorResponse): string {
  return error.message;
}

/**
 * Create a detailed error message for debugging
 * @param error - The parsed error response
 * @returns Detailed error message
 */
export function createDetailedErrorMessage(error: ErrorResponse): string {
  let message = error.message;

  if (error.action) {
    message += `\n\nSuggested action: ${error.action}`;
  }

  if (error.technical) {
    message += `\n\nTechnical details: ${error.technical}`;
  }

  return message;
}

/**
 * Check if error is retryable
 * @param error - The parsed error response
 * @returns True if the error can be retried
 */
export function isRetryableError(error: ErrorResponse): boolean {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(error.status);
}

/**
 * Check if error requires authentication
 * @param error - The parsed error response
 * @returns True if authentication is required
 */
export function isAuthError(error: ErrorResponse): boolean {
  return error.status === 401;
}

/**
 * Check if error is a validation error
 * @param error - The parsed error response
 * @returns True if it's a validation error
 */
export function isValidationError(error: ErrorResponse): boolean {
  return error.status === 422 || error.code === 'VALIDATION_ERROR';
}