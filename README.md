# AI Website Builder Backend

A production-ready NestJS backend service that generates websites using AI. This service accepts text prompts and uses OpenAI's GPT-4 to generate complete HTML/CSS websites, stores them in a PostgreSQL database, and provides a RESTful API for management.

## 🚀 Features

- **AI-Powered Website Generation**: Uses OpenAI GPT-4 to generate complete, responsive websites from text prompts
- **RESTful API**: Full CRUD operations for website management
- **Database Storage**: PostgreSQL with Prisma ORM for reliable data persistence
- **Rate Limiting**: Built-in throttling to prevent abuse
- **Security**: Helmet.js security headers, CORS protection, input validation
- **Monitoring**: Health checks, logging, and error tracking
- **Docker Support**: Complete containerization with Docker Compose
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **TypeScript**: Full type safety and modern JavaScript features

## 🏗️ Architecture

```
src/
├── common/                 # Shared utilities and configurations
│   ├── dto/               # Common DTOs (pagination, etc.)
│   ├── exceptions/        # Global exception filters
│   ├── filters/          # Custom filters (Prisma, etc.)
│   ├── guards/           # Authentication and rate limiting guards
│   ├── interceptors/     # Logging and transformation interceptors
│   ├── pipes/            # Custom validation pipes
│   └── prisma/           # Database service and module
├── modules/              # Feature modules
│   ├── ai/               # AI service and website generation
│   ├── website/          # Website CRUD operations
│   └── health/           # Health monitoring and stats
├── app.module.ts         # Root application module
└── main.ts              # Application bootstrap
```

## 🛠️ Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5.x
- **AI**: OpenAI GPT-4
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet.js, CORS
- **Containerization**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 15+
- OpenAI API key
- Docker (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-website-builder-backend
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_website_builder?schema=public"

# OpenAI
OPENAI_API_KEY="your_openai_api_key_here"

# Application
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# Security
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`

## 🐳 Docker Setup

### Development

```bash
# Start development database
docker-compose -f docker-compose.dev.yml up -d

# Run the application locally
npm run start:dev
```

### Production

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api/v1/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:deploy      # Deploy migrations to production
npm run prisma:studio      # Open Prisma Studio
npm run db:seed           # Seed the database

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
```

## 📖 API Endpoints

### Websites

- `GET /api/v1/websites` - List all websites (with pagination and filtering)
- `GET /api/v1/websites/public` - List public websites
- `GET /api/v1/websites/:id` - Get website by ID
- `GET /api/v1/websites/:id/preview` - Get website preview (HTML/CSS)
- `POST /api/v1/websites` - Create a new website
- `POST /api/v1/websites/generate` - Generate website using AI
- `PATCH /api/v1/websites/:id` - Update website
- `DELETE /api/v1/websites/:id` - Delete website

### Health

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed health status with stats

## 🤖 AI Website Generation

### Generate a Website

```bash
curl -X POST http://localhost:3000/api/v1/websites/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a portfolio website for a photographer with a dark theme and gallery section",
    "title": "John Doe Photography",
    "description": "Professional photography portfolio",
    "isPublic": true
  }'
```

### Example Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "John Doe Photography",
  "description": "Professional photography portfolio",
  "prompt": "Create a portfolio website for a photographer...",
  "htmlContent": "<!DOCTYPE html><html>...</html>",
  "cssContent": "body { font-family: Arial, sans-serif; }",
  "isPublic": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "category": "portfolio",
    "theme": "dark",
    "features": ["gallery", "contact-form", "responsive"]
  }
}
```

## 🔍 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search in title and description
- `isPublic` - Filter by public status
- `category` - Filter by metadata category
- `theme` - Filter by metadata theme

### Example
```
GET /api/v1/websites?page=1&limit=20&search=photography&isPublic=true&category=portfolio
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Structured error responses without sensitive data

## 📊 Monitoring

### Health Checks

- **Basic**: `GET /api/v1/health`
- **Detailed**: `GET /api/v1/health/detailed` (includes database status and statistics)

### Logging

- Request/response logging with duration
- Error logging with stack traces
- AI generation logging with token usage

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Database Migration

```bash
npm run prisma:deploy
```

### Production Build

```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/v1/docs`
- Review the health status at `/api/v1/health/detailed`

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Website templates and themes
- [ ] Image generation integration
- [ ] Website analytics
- [ ] Custom domain support
- [ ] Website export functionality
- [ ] Advanced AI prompts and customization
- [ ] Caching layer with Redis
- [ ] Webhook support for external integrations
