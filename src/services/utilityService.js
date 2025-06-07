class UtilityService {
  // Format response với consistent structure
  formatResponse(success, data = null, message = null, error = null) {
    return {
      success,
      ...(data && { data }),
      ...(message && { message }),
      ...(error && { error }),
      timestamp: new Date().toISOString()
    };
  }

  // Validate request body
  validateRequiredFields(body, requiredFields) {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!body[field]) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Clean và sanitize endpoint path
  cleanEndpoint(endpoint) {
    if (!endpoint) return '';
    
    // Remove leading slash if exists
    const cleaned = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Remove trailing slash if exists
    return cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;
  }

  // Parse query parameters
  parseQueryParams(query) {
    const parsed = {};
    
    Object.keys(query).forEach(key => {
      const value = query[key];
      
      // Try to parse numbers
      if (/^\d+$/.test(value)) {
        parsed[key] = parseInt(value);
      }
      // Try to parse booleans
      else if (value === 'true' || value === 'false') {
        parsed[key] = value === 'true';
      }
      // Keep as string
      else {
        parsed[key] = value;
      }
    });

    return parsed;
  }

  // Generate request ID for tracking
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Mask sensitive data in logs
  maskSensitiveData(obj) {
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'key'];
    const masked = JSON.parse(JSON.stringify(obj));

    function maskRecursive(target) {
      if (typeof target === 'object' && target !== null) {
        Object.keys(target).forEach(key => {
          if (sensitiveKeys.some(sensitive => 
            key.toLowerCase().includes(sensitive.toLowerCase())
          )) {
            target[key] = '***MASKED***';
          } else if (typeof target[key] === 'object') {
            maskRecursive(target[key]);
          }
        });
      }
    }

    maskRecursive(masked);
    return masked;
  }

  // Calculate response time
  calculateResponseTime(startTime) {
    return Date.now() - startTime;
  }

  // Format file size
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Validate URL
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Deep merge objects
  deepMerge(target, source) {
    const output = Object.assign({}, target);
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Retry logic for failed requests
  async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          throw lastError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
}

module.exports = new UtilityService();
