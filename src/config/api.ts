import { API_BASE_URL } from '@env';

export const apiBaseUrl = API_BASE_URL || 'https://680f9a8867c5abddd195f75a.mockapi.io/task/api/vi';

export const buildApiUrl = (endpoint: string): string => {
  return `${apiBaseUrl}/${endpoint}`;
};