// API Service for the MCP Registry application
// This file contains functions to interact with the backend API

// Use direct URL to API server since proxy isn't working correctly
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API requests with better error handling
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    console.log(`API Request: ${url}`);
    const response = await fetch(url, {
      ...options,
      // Add CORS headers
      credentials: 'include',
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API error (${response.status}):`, errorBody);
      throw new Error(`API error: ${response.status} - ${errorBody || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    
    // Re-throw a user-friendly error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the API server. Please check your connection or try again later.');
    }
    
    throw error;
  }
};

// Stats and Metrics
export const getStats = async () => {
  return fetchWithErrorHandling(`${API_BASE_URL}/stats`);
};

// Servers
export const getFeaturedServers = async (limit: number = 4) => {
  const data = await fetchWithErrorHandling(`${API_BASE_URL}/servers/search?sort=reputation&limit=${limit}`);
  return data.data;
};

export const getServerById = async (id: string) => {
  const data = await fetchWithErrorHandling(`${API_BASE_URL}/servers/${id}`);
  return data.data;
};

// Categories
export const getCategories = async () => {
  const data = await fetchWithErrorHandling(`${API_BASE_URL}/categories`);
  return data.data;
};

// Search
export const searchServers = async (params: {
  query?: string;
  categories?: string[];
  license?: string;
  minScore?: number;
  maxScore?: number;
  lastUpdated?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('q', params.query);
  if (params.categories) {
    params.categories.forEach(cat => queryParams.append('categories', cat));
  }
  if (params.license) queryParams.append('license', params.license);
  if (params.minScore !== undefined) queryParams.append('minScore', params.minScore.toString());
  if (params.maxScore !== undefined) queryParams.append('maxScore', params.maxScore.toString());
  if (params.lastUpdated) queryParams.append('lastUpdated', params.lastUpdated);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  
  return fetchWithErrorHandling(`${API_BASE_URL}/servers/search?${queryParams}`);
}; 