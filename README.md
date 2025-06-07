# AILover Backend - Express Proxy Server

Một Express.js proxy server đơn giản với cấu trúc MVC để forward các request tới API target.

## 🚀 Tính năng

- ✅ Express.js server với cấu trúc MVC
- ✅ Proxy tất cả HTTP methods (GET, POST, PUT, DELETE)
- ✅ Health check endpoints
- ✅ Error handling
- ✅ Request logging với Morgan
- ✅ Security với Helmet
- ✅ CORS support
- ✅ Environment configuration

## 📁 Cấu trúc project

```
AILover-BE/
├── src/
│   ├── controllers/
│   │   ├── proxyController.js    # Proxy logic
│   │   └── healthController.js   # Health check logic
│   ├── services/
│   │   ├── proxyService.js       # Axios proxy service
│   │   └── healthService.js      # Health check service
│   └── routes/
│       ├── proxyRoutes.js        # Proxy routes
│       └── healthRoutes.js       # Health routes
├── server.js                     # Entry point
├── package.json
├── .env                          # Environment variables
└── .gitignore
```

## 🛠️ Cài đặt

1. Clone project:
```bash
git clone <repository-url>
cd AILover-BE
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Cấu hình environment variables trong file `.env`:
```env
NODE_ENV=development
PORT=3000
TARGET_API_URL=https://api.example.com
API_TIMEOUT=30000
```

4. Chạy development server:
```bash
npm run dev
```

Hoặc chạy production:
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Thông tin chi tiết về server health
- `GET /api/health/ping` - Simple ping test

### Proxy Endpoints
- `GET /api/proxy/*` - Forward GET requests
- `POST /api/proxy/*` - Forward POST requests  
- `PUT /api/proxy/*` - Forward PUT requests
- `DELETE /api/proxy/*` - Forward DELETE requests

### Ví dụ sử dụng

```bash
# Health check
curl http://localhost:3000/api/health

# Proxy GET request
curl http://localhost:3000/api/proxy/users

# Proxy POST request
curl -X POST http://localhost:3000/api/proxy/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Proxy với query parameters
curl http://localhost:3000/api/proxy/users?page=1&limit=10
```

## ⚙️ Configuration

Các environment variables có thể cấu hình:

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `TARGET_API_URL`: URL của API target để proxy tới
- `API_TIMEOUT`: Timeout cho requests (default: 30000ms)

## 🔒 Security Features

- Helmet.js cho security headers
- CORS configuration
- Request rate limiting có thể thêm
- Input validation có thể thêm

## 📝 Logging

- Morgan middleware cho HTTP request logging
- Console logging cho errors và debug info
- Log format có thể customize

## 🚀 Deployment

Server sẵn sàng để deploy lên:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## 📋 TODO / Enhancements

- [ ] Add request/response caching
- [ ] Add authentication middleware
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add database integration (khi cần)
- [ ] Add unit tests
- [ ] Add API documentation (Swagger)
- [ ] Add Docker support

## 🤝 Contributing

1. Fork project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🔗 Lark API Integration

Server hỗ trợ tích hợp với Lark API để lấy access token và gọi các API của Lark Suite.

### Lark Token Endpoints
- `POST /api/proxy/lark` - Lấy Lark tenant access token
- `GET /api/proxy/lark/token` - Lấy Lark tenant access token (alternative)

### Environment Variables cho Lark
```env
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret
```

### Ví dụ sử dụng Lark API

```bash
# Lấy Lark access token
curl -X POST http://localhost:9001/api/proxy/lark

# Response format:
{
  "success": true,
  "data": {
    "tenant_access_token": "t-xxx...",
    "expire": 7200
  },
  "timestamp": "2025-06-07T..."
}
```

### Test Lark Integration
```bash
# Chạy test script
bash test-lark.sh
```
