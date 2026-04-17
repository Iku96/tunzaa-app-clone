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
const endpoints = (errorsData as any).endpoints as EndpointError[];
const globalErrors = (errorsData as any).global_errors as ApiError[];

/**
 * Extract endpoint path from URL
 */
function extractEndpoint(url: string, method: string): string {
    try {
        const urlObj = new URL(url);
        return `${method.toUpperCase()} ${urlObj.pathname}`;
    } catch {
        return `${method.toUpperCase()} ${url}`;
    }
}

/**
 * Find the best matching endpoint from errors.json
 */
function findMatchingEndpoint(endpoint: string): EndpointError | null {
    const exactMatch = endpoints.find(ep => ep.endpoint === endpoint);
    if (exactMatch) return exactMatch;

    const pathMatch = endpoints.find(ep => {
        const epPath = ep.endpoint.split(' ')[1];
        const reqPath = endpoint.split(' ')[1];
        if (!epPath || !reqPath) return false;
        const pattern = epPath
            .replace(/\{[^}]+\}/g, '[^/]+')
            .replace(/\//g, '\\/');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(reqPath);
    });

    return pathMatch || null;
}

/**
 * Find error by status code and error code
 */
function findError(status: number, code: string, endpoint: string): ApiError | null {
    const endpointConfig = findMatchingEndpoint(endpoint);
    if (endpointConfig) {
        const endpointError = endpointConfig.errors.find(
            err => err.status === status && err.code === code
        );
        if (endpointError) return endpointError;
    }

    const globalError = globalErrors.find(
        err => err.status === status && err.code === code
    );
    if (globalError) return globalError;

    const statusError = globalErrors.find(err => err.status === status);
    return statusError || null;
}

/**
 * Parse error response from API into user-friendly format
 */
export function parseApiError(error: any): ErrorResponse {
    const status = error.response?.status || 500;
    const errorData = error.response?.data;

    let code = 'SERVER_ERROR';
    if (errorData?.code) {
        code = errorData.code;
    } else if (errorData?.error) {
        code = errorData.error;
    } else {
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

    const endpoint = extractEndpoint(
        error.config?.url || '',
        error.config?.method || 'GET'
    );

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

    const fallbackErrors: Record<number, { message: string; action: string }> = {
        400: { message: 'Please check your input and try again', action: 'Review form data' },
        401: { message: 'Please log in to continue', action: 'Login' },
        403: { message: "You don't have permission to perform this action", action: 'Contact support' },
        404: { message: 'The requested item was not found', action: 'Check URL or browse' },
        422: { message: 'Please check your input and try again', action: 'Review form fields' },
        429: { message: 'Too many requests. Please try again later', action: 'Wait before retrying' },
        500: { message: 'Something went wrong. Please try again', action: 'Retry or contact support' },
        502: { message: 'Service temporarily unavailable', action: 'Try again later' },
        503: { message: 'Service under maintenance. Please try again later', action: 'Check status page' },
    };

    const fallback = fallbackErrors[status] || fallbackErrors[500];
    
    // Prefer server-provided message if available
    const serverMessage = errorData?.message || errorData?.detail || errorData?.error_description || errorData?.error || null;
    const finalMessage = serverMessage && typeof serverMessage === 'string' ? serverMessage : fallback.message;

    return {
        status,
        code,
        message: finalMessage,
        action: fallback.action,
        originalError: error,
    };
}

export function createErrorMessage(error: ErrorResponse): string {
    return error.message;
}

export function createDetailedErrorMessage(error: ErrorResponse): string {
    let message = error.message;
    if (error.action) message += `\n\nSuggested action: ${error.action}`;
    if (error.technical) message += `\n\nTechnical details: ${error.technical}`;
    return message;
}

export function isRetryableError(error: ErrorResponse): boolean {
    return [408, 429, 500, 502, 503, 504].includes(error.status);
}

export function isAuthError(error: ErrorResponse): boolean {
    return error.status === 401;
}

export function isValidationError(error: ErrorResponse): boolean {
    return error.status === 422 || error.code === 'VALIDATION_ERROR';
}
