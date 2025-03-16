import toast from 'react-hot-toast';

interface FormattedError {
  message: string;
  code: string;
  timestamp: string;
  details?: any;
}

/**
 * Global error handler that provides consistent error handling across the application
 * @param error The error object
 * @param operation Description of the operation that failed
 * @param showToast Whether to show a toast notification (default: true)
 * @returns Formatted error object
 */
export const handleError = (error: any, operation: string, showToast = true): FormattedError => {
  // Log the error to console for debugging
  console.error(`Error during ${operation}:`, error);
  
  // Extract useful information from the error object
  const errorMessage = error.message || error.error?.message || `Failed to ${operation}`;
  const errorCode = error.code || error.error?.code || 'unknown';
  const errorDetails = error.details || error.error?.details || {};
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage);
  }
  
  // Return a formatted error object that can be used in the UI or for logging
  return {
    message: errorMessage,
    code: errorCode,
    timestamp: new Date().toISOString(),
    details: errorDetails
  };
};

/**
 * Handle errors in async functions with automatic error catching
 * @param promise The async function to execute
 * @param operation Description of the operation
 * @param showToast Whether to show a toast notification (default: true)
 * @returns Result of the promise or formatted error
 */
export const asyncErrorHandler = async <T>(
  promise: Promise<T>, 
  operation: string,
  showToast = true
): Promise<{ data: T | null; error: FormattedError | null }> => {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    const error = handleError(err, operation, showToast);
    return { data: null, error };
  }
};

/**
 * Create a safe version of a function that automatically handles errors
 * @param fn The function to make safe
 * @param operation Description of the operation
 * @param showToast Whether to show a toast notification (default: true)
 * @returns Safe function that won't throw errors
 */
export function makeSafe<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  operation: string,
  showToast = true
): (...args: A) => Promise<{ data: T | null; error: FormattedError | null }> {
  return async (...args: A) => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (err) {
      const error = handleError(err, operation, showToast);
      return { data: null, error };
    }
  };
}

/**
 * Standard error messages to ensure consistency
 */
export const errorMessages = {
  networkError: "Network error. Please check your internet connection and try again.",
  authenticationError: "Authentication error. Please sign in again.",
  permissionDenied: "You don't have permission to perform this action.",
  dataNotFound: "The requested data could not be found.",
  invalidInput: "Invalid input. Please check your information and try again.",
  serverError: "Something went wrong on our end. Please try again later.",
  unexpectedError: "An unexpected error occurred. Please try again."
};