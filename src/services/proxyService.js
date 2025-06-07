const axios = require('axios');

class ProxyService {  constructor() {
    this.baseURL = 'https://open.larksuite.com/open-apis';
    this.timeout = parseInt(process.env.API_TIMEOUT) || 30000;
    
    // Cache cho Lark token
    this.cachedToken = null;
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AILover-Proxy/1.0.0'
      }
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🔄 Forwarding ${config.method.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Response received: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('Response interceptor error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }
  async forwardGetRequest(endpoint, queryParams = {}) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const response = await this.axiosInstance.get(`/${cleanEndpoint}`, {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }
  async forwardPostRequest(endpoint, body = {}, queryParams = {}) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const response = await this.axiosInstance.post(`/${cleanEndpoint}`, body, {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }
  async forwardPutRequest(endpoint, body = {}, queryParams = {}) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const response = await this.axiosInstance.put(`/${cleanEndpoint}`, body, {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }
  async forwardDeleteRequest(endpoint, queryParams = {}) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const response = await this.axiosInstance.delete(`/${cleanEndpoint}`, {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  handleAxiosError(error) {
    if (error.response) {
      // Server responded with error status
      const customError = new Error(error.response.data?.message || error.message);
      customError.status = error.response.status;
      customError.data = error.response.data;
      return customError;
    } else if (error.request) {
      // Request was made but no response received
      const customError = new Error('No response received from target server');
      customError.status = 503;
      return customError;
    } else {
      // Something else happened
      const customError = new Error(error.message);
      customError.status = 500;
      return customError;
    }
  }

  // Method to update base URL dynamically
  updateBaseURL(newBaseURL) {
    this.baseURL = newBaseURL;
    this.axiosInstance.defaults.baseURL = newBaseURL;
    console.log(`🔄 Updated base URL to: ${newBaseURL}`);
  }

  // Method to add custom headers
  addHeaders(headers) {
    Object.assign(this.axiosInstance.defaults.headers, headers);
    console.log('🔄 Added custom headers:', headers);
  }
  async handleProxyLark(req, res) {
    try {
      // Lấy credentials từ environment hoặc sử dụng default values
      const app_id = process.env.LARK_APP_ID || 'cli_a8c915c87e78d029';
      const app_secret = process.env.LARK_APP_SECRET || 'D0yyvfvGTO33juMTUPoZcdwSUnvFHSMo';

      console.log(`🔑 Requesting Lark token with app_id: ${app_id}`);
      console.log(`🔐 Using app_secret: ${app_secret.substring(0, 8)}...`);

      // Gọi API Lark để lấy tenant access token
      const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
        app_id,
        app_secret
      });

      console.log('✅ Lark token response:', response.data);

      // Trả về response với format consistent
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Lark token request failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      throw this.handleAxiosError(error);
    }
  }

  // Method để lấy token và cache nó
  async getLarkToken() {
    try {
      const app_id = process.env.LARK_APP_ID || 'cli_a8c915c87e78d029';
      const app_secret = process.env.LARK_APP_SECRET || 'D0yyvfvGTO33juMTUPoZcdwSUnvFHSMo';

      const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
        app_id,
        app_secret
      });

      if (response.data && response.data.tenant_access_token) {
        // Cache token với thời gian expire
        this.cachedToken = {
          token: response.data.tenant_access_token,
          expires_at: Date.now() + (response.data.expire * 1000 - 60000) // Trừ 1 phút để an toàn
        };
        
        console.log('🎯 Cached Lark token successfully');
        return response.data.tenant_access_token;
      }

      throw new Error('Invalid token response from Lark API');
    } catch (error) {
      console.error('❌ Failed to get Lark token:', error.message);
      throw this.handleAxiosError(error);
    }
  }

  // Method để lấy token từ cache hoặc request mới
  async getValidLarkToken() {
    // Kiểm tra cache token
    if (this.cachedToken && this.cachedToken.expires_at > Date.now()) {
      console.log('🔄 Using cached Lark token');
      return this.cachedToken.token;
    }

    console.log('🔄 Requesting new Lark token');
    return await this.getLarkToken();
  }

  // Method để gọi Lark API với token
  async callLarkAPI(endpoint, method = 'GET', data = null, useToken = true) {
    try {
      let headers = {
        'Content-Type': 'application/json'
      };

      // Thêm token vào header nếu cần
      if (useToken) {
        const token = await this.getValidLarkToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method,
        url: endpoint,
        headers,
        timeout: this.timeout
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await this.axiosInstance(config);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Lark API call failed [${method} ${endpoint}]:`, error.message);
      throw this.handleAxiosError(error);
    }
  }
}

module.exports = new ProxyService();
