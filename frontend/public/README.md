# 🏋️ Smart Coaching API Documentation

Welcome to the Smart Coaching API! This directory contains the OpenAPI specification for the application.

## 📖 View Documentation

### Web Interface
Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to view the interactive Swagger UI.

### JSON Specification
The OpenAPI 3.0 specification is available at:
- File: `/public/api-docs.json`
- URL: `http://localhost:3000/api-docs.json`

## 🚀 Quick Links

- **Next.js API Docs**: http://localhost:3000/api-docs
- **AI Service Swagger**: http://localhost:8000/docs  
- **AI Service ReDoc**: http://localhost:8000/redoc
- **Detailed Guide**: `/docs/API_DOCUMENTATION.md`

## 📋 Available APIs

### Next.js Backend (Port 3000)
- Authentication (register, login, session)
- User management
- Exercise catalog
- Workout tracking

### AI Service (Port 8000)
- Pose detection from images
- Video analysis with rep counting
- AI workout recommendations
- Form scoring and feedback

## 🔐 Test Credentials

```
Email: admin@smartcoaching.com
Password: admin123
```

## 📚 Documentation Features

✅ Interactive API testing with Swagger UI  
✅ Complete request/response examples  
✅ Authentication details  
✅ Error response formats  
✅ Data model schemas  
✅ Try-it-out functionality  

## 🛠️ Usage Example

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

For more examples, see `/docs/API_DOCUMENTATION.md`
