# AILover Backend - Demo & Test Commands

## Server đang chạy tại: http://localhost:9000

### 1. Basic Endpoints

```bash
# Root endpoint
curl http://localhost:9000/

# Health check
curl http://localhost:9000/api/health

# Ping test
curl http://localhost:9000/api/health/ping
```

### 2. Proxy Endpoints

Để test proxy functionality, bạn cần:

1. Cập nhật `TARGET_API_URL` trong file `.env` để trỏ tới API thật
2. Hoặc test với JSONPlaceholder API (free testing API)

#### Ví dụ với JSONPlaceholder API:

```bash
# Cập nhật .env file:
TARGET_API_URL=https://jsonplaceholder.typicode.com

# Test GET request
curl http://localhost:9000/api/proxy/posts

# Test GET với query parameters
curl "http://localhost:9000/api/proxy/posts?userId=1"

# Test GET single post
curl http://localhost:9000/api/proxy/posts/1

# Test POST request
curl -X POST http://localhost:9000/api/proxy/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "body": "This is a test post via proxy",
    "userId": 1
  }'

# Test PUT request
curl -X PUT http://localhost:9000/api/proxy/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "title": "Updated Post",
    "body": "This post has been updated via proxy",
    "userId": 1
  }'

# Test DELETE request
curl -X DELETE http://localhost:9000/api/proxy/posts/1
```

### 3. Error Handling Test

```bash
# Test non-existent endpoint
curl http://localhost:9000/api/nonexistent

# Test proxy with invalid endpoint (sẽ return error từ target API)
curl http://localhost:9000/api/proxy/invalid-endpoint
```

### 4. Logs

Tất cả requests sẽ được log ra console với Morgan middleware.

### 5. Cấu trúc Response

Tất cả proxy responses có format:
```json
{
  "success": true/false,
  "data": {...}, // response từ target API
  "timestamp": "ISO string"
}
```
