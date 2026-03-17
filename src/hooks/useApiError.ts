import { useCallback } from 'react';
import { ErrorResponse, isAuthError, isValidationError, isRetryableError } from '@/services/error-handler';

export interface UseApiErrorReturn {
  handleError: (error: any) => void;
  getErrorMessage: (error: any) => string;
  getErrorAction: (error: any) => string | undefined;
  isAuthError: (error: any) => boolean;
  isValidationError: (error: any) => boolean;
  isRetryableError: (error: any) => boolean;
  showErrorToast?: (message: string) => void;
}

export interface UseApiErrorOptions {
  onAuthError?: () => void;
  onValidationError?: (error: ErrorResponse) => void;
  onRetryableError?: (error: ErrorResponse) => void;
  showToast?: boolean;
  toastDuration?: number;
}

/**
 * Custom hook for handling API errors with user-friendly messages
 * @param options - Configuration options for error handling
 * @returns Error handling utilities
 */
export function useApiError(options: UseApiErrorOptions = {}): UseApiErrorReturn {
  const {
    onAuthError,
    onValidationError,
    onRetryableError,
    showToast = false,
    toastDuration = 4000,
  } = options;

  // Extract API error from any error object
  const extractApiError = useCallback((error: any): ErrorResponse | null => {
    if (error?.apiError) {
      return error.apiError;
    }
    
    // If it's already an ErrorResponse
    if (error?.status && error?.code && error?.message) {
      return error;
    }
    
    return null;
  }, []);

  // Get user-friendly error message
  const getErrorMessage = useCallback((error: any): string => {
    const apiError = extractApiError(error);
    
    console.log('apiError', apiError);
    if (apiError) {
      return apiError.message;
    }
    
    // Fallback to original error message
    return error?.message || 'Something went wrong. Please try again.';
  }, [extractApiError]);

  // Get suggested action for the error
  const getErrorAction = useCallback((error: any): string | undefined => {
    const apiError = extractApiError(error);
    return apiError?.action;
  }, [extractApiError]);

  // Check if error is authentication related
  const checkAuthError = useCallback((error: any): boolean => {
    const apiError = extractApiError(error);
    if (apiError) {
      return isAuthError(apiError);
    }
    return error?.response?.status === 401;
  }, [extractApiError]);

  // Check if error is validation related
  const checkValidationError = useCallback((error: any): boolean => {
    const apiError = extractApiError(error);
    if (apiError) {
      return isValidationError(apiError);
    }
    return error?.response?.status === 422;
  }, [extractApiError]);

  // Check if error is retryable
  const checkRetryableError = useCallback((error: any): boolean => {
    const apiError = extractApiError(error);
    if (apiError) {
      return isRetryableError(apiError);
    }
    const status = error?.response?.status;
    return [408, 429, 500, 502, 503, 504].includes(status);
  }, [extractApiError]);

  // Main error handler
  const handleError = useCallback((error: any) => {
    const apiError = extractApiError(error);
    
    if (!apiError) {
      console.error('Unhandled error:', error);
      return;
    }

    // Handle authentication errors
    if (isAuthError(apiError)) {
      if (onAuthError) {
        onAuthError();
      }
      return;
    }

    // Handle validation errors
    if (isValidationError(apiError)) {
      if (onValidationError) {
        onValidationError(apiError);
      }
      return;
    }

    // Handle retryable errors
    if (isRetryableError(apiError)) {
      if (onRetryableError) {
        onRetryableError(apiError);
      }
      return;
    }

    // Log error for debugging
    console.error('API Error:', {
      status: apiError.status,
      code: apiError.code,
      message: apiError.message,
      technical: apiError.technical,
      action: apiError.action,
    });
  }, [extractApiError, onAuthError, onValidationError, onRetryableError]);

  // Optional toast function (can be implemented with your preferred toast library)
  const showErrorToast = useCallback((message: string) => {
    if (showToast) {
      // This is a placeholder - implement with your preferred toast library
      // Example: Toast.show(message, { duration: toastDuration });
      console.log('Toast:', message);
    }
  }, [showToast, toastDuration]);

  return {
    handleError,
    getErrorMessage,
    getErrorAction,
    isAuthError: checkAuthError,
    isValidationError: checkValidationError,
    isRetryableError: checkRetryableError,
    showErrorToast,
  };
}

/**
 * Hook for handling mutation errors specifically
 * @param options - Configuration options
 * @returns Error handling utilities for mutations
 */
export function useMutationError(options: UseApiErrorOptions = {}) {
  const errorHandler = useApiError(options);
  
  const handleMutationError = useCallback((error: any) => {
    errorHandler.handleError(error);
    
    // Show toast for mutation errors by default
    const message = errorHandler.getErrorMessage(error);
    errorHandler.showErrorToast?.(message);
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleMutationError,
  };
}

/**
 * Hook for handling query errors specifically
 * @param options - Configuration options
 * @returns Error handling utilities for queries
 */
export function useQueryError(options: UseApiErrorOptions = {}) {
  const errorHandler = useApiError(options);
  
  const handleQueryError = useCallback((error: any) => {
    errorHandler.handleError(error);
    
    // For query errors, we might want to show different UI feedback
    // rather than toasts, so we don't auto-show toast
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleQueryError,
  };
} 