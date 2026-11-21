import axios from 'axios';

import { API_CONFIG } from '../lib/config.js';

// API Service for communicating with the Python backend
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Grounded Search
  async performSearch(query, context = '') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.SEARCH, {
        query,
        context
      });
      return response.data;
    } catch (error) {
      throw new Error(`Search failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Writing Completion
  async getWritingCompletion(content, prompt, style = 'academic') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.COMPLETE, {
        content,
        prompt,
        style
      });
      return response.data;
    } catch (error) {
      throw new Error(`Writing completion failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Document Analysis
  async analyzeDocument(content, analysisType = 'comprehensive') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.ANALYZE, {
        content,
        type: analysisType
      });
      return response.data;
    } catch (error) {
      throw new Error(`Document analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Plagiarism Check
  async checkPlagiarism(content) {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.PLAGIARISM, {
        content
      });
      return response.data;
    } catch (error) {
      throw new Error(`Plagiarism check failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Asset Analysis
  async analyzeAsset(assetType, content, focus = 'summary') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.ASSET_ANALYSIS, {
        type: assetType,
        content,
        focus
      });
      return response.data;
    } catch (error) {
      throw new Error(`Asset analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Batch operations
  async performBatchAnalysis(documents) {
    const results = [];
    
    for (const doc of documents) {
      try {
        const result = await this.analyzeDocument(doc.content);
        results.push({ 
          id: doc.id, 
          success: true, 
          data: result 
        });
      } catch (error) {
        results.push({ 
          id: doc.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Advanced search with filters
  async advancedSearch(query, filters = {}) {
    try {
      const response = await this.client.post('/api/search/advanced', {
        query,
        filters: {
          dateRange: filters.dateRange || null,
          sources: filters.sources || [],
          contentType: filters.contentType || 'all',
          language: filters.language || 'en'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Advanced search failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get AI suggestions based on document context
  async getContextualSuggestions(content, suggestionType = 'general') {
    try {
      const response = await this.client.post('/api/suggestions', {
        content,
        type: suggestionType // 'references', 'improvements', 'related_topics'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get suggestions: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Named exports for specific functions (for backward compatibility)
export const performSearch = (query, context) => apiService.performSearch(query, context);
export const getWritingCompletion = (content, prompt, style) => apiService.getWritingCompletion(content, prompt, style);
export const analyzeDocument = (content, type) => apiService.analyzeDocument(content, type);
export const checkPlagiarism = (content) => apiService.checkPlagiarism(content);
export const analyzeAsset = (type, content, focus) => apiService.analyzeAsset(type, content, focus);

// Default export
export default apiService;