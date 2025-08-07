# Docker Production Deployment Guide

## Overview

This guide covers the production deployment of the Realtime Chat App Firebase using Docker. The setup includes optimized multi-stage builds, security best practices, and production-ready configurations.

## Files Created

- `Dockerfile` - Multi-stage production-optimized Docker build
- `.dockerignore` - Excludes unnecessary files from Docker context
- `docker-compose.yml` - Container orchestration configuration
- `src/app/api/health/route.ts` - Health check endpoint for monitoring

## Quick Start

### 1. Environment Setup

Create a `.env.production` file with your Firebase configuration:

```bash
NEXT_PUBLIC_API_KEY=your_firebase_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_DATABASE_URL=your_database_url
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Manual Docker Build

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY \
  --build-arg NEXT_PUBLIC_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN \
  --build-arg NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID \
  --build-arg NEXT_PUBLIC_STORAGE_BUCKET=$NEXT_PUBLIC_STORAGE_BUCKET \
  --build-arg NEXT_PUBLIC_MESSAGING_SENDER_ID=$NEXT_PUBLIC_MESSAGING_SENDER_ID \
  --build-arg NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID \
  --build-arg NEXT_PUBLIC_MEASUREMENT_ID=$NEXT_PUBLIC_MEASUREMENT_ID \
  --build-arg NEXT_PUBLIC_DATABASE_URL=$NEXT_PUBLIC_DATABASE_URL \
  -t realtime-chatapp .

# Run the container
docker run -p 3000:3000 realtime-chatapp
```

## Production Optimizations

### Multi-Stage Build
- **deps**: Installs only production dependencies
- **builder**: Builds the Next.js application with all environment variables
- **runner**: Creates minimal production image with only necessary files

### Security Features
- Non-root user (`nextjs`) for running the application
- Minimal Alpine Linux base image
- Proper file permissions and ownership
- Health check endpoint for monitoring

### Performance Optimizations
- Standalone output mode for reduced image size
- Package import optimization for Radix UI and Tabler icons
- Efficient layer caching with separate dependency installation
- Telemetry disabled for faster startup

## Health Check

The application includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2025-01-07T12:48:13.000Z",
  "service": "realtime-chatapp-firebase"
}
```

## Monitoring

### Container Health
```bash
# Check container health status
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' <container_id>
```

### Application Logs
```bash
# Follow application logs
docker-compose logs -f realtime-chatapp

# View specific number of log lines
docker-compose logs --tail=100 realtime-chatapp
```

## Environment Variables

All `NEXT_PUBLIC_` variables must be provided at build time since they are embedded in the client-side bundle. See `/docs/ENV.md` for detailed variable documentation.

## Deployment Platforms

### Docker Hub
```bash
# Tag for Docker Hub
docker tag realtime-chatapp your-username/realtime-chatapp:latest

# Push to Docker Hub
docker push your-username/realtime-chatapp:latest
```

### Cloud Platforms
- **AWS ECS/Fargate**: Use the provided Dockerfile with ECS task definitions
- **Google Cloud Run**: Deploy directly from container registry
- **Azure Container Instances**: Use Docker Compose or individual containers
- **DigitalOcean App Platform**: Connect repository with Dockerfile detection

## Troubleshooting

### Common Issues

1. **Build fails with environment variables**: Ensure all `NEXT_PUBLIC_` variables are provided as build args
2. **Health check fails**: Verify the application is running on port 3000 and `/api/health` endpoint is accessible
3. **Firebase connection issues**: Check that all Firebase configuration variables are correct and the project is properly configured

### Debug Mode
```bash
# Run with debug output
docker-compose up --build

# Access container shell
docker-compose exec realtime-chatapp sh
```

## Security Considerations

- Never commit `.env.production` to version control
- Use secrets management for production deployments
- Regularly update base images for security patches
- Monitor container vulnerabilities with security scanning tools
