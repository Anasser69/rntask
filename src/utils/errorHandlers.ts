/**
 * Utility functions for handling errors consistently across the app
 */
import { buildApiUrl } from '../config/api';

/**
 * Formats API error messages based on the error type
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Network request failed')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (error.message.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // Extract status code if present
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      
      if (status === 401 || status === 403) {
        return 'Authentication error. Please sign in again.';
      }
      
      if (status === 404) {
        return 'Resource not found. Please try again later.';
      }
      
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Handles fetch response errors
 */
export const handleFetchResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error ${response.status}: ${errorText}`);
  }
  return response;
};

/**
 * Wraps API calls with consistent error handling
 */
export const apiCall = async <T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> => {
  try {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, options);
    await handleFetchResponse(response);
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};