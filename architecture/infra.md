# MCP Registry - Infrastructure

This document outlines the infrastructure requirements and recommendations for the MCP Registry application across different environments.

## Environment Overview

The MCP Registry will support three distinct environments:

1. **Local Development**: For individual developers to work on features
2. **Test/Staging**: For integration testing and QA (future)
3. **Production**: For end-user access (future)

The MVP will be deployed as a local application, with infrastructure planning for future web deployment.

## Local Development Environment

### Setup Requirements

- **Runtime Environment**:
  - Node.js 18+ LTS
  - SQLite 3.35+ (with FTS5 support)
  - Git for version control

- **Local Development Tools**:
  - VS Code with recommended extensions
  - SQLite Browser for database inspection
  - Postman or similar for API testing

- **Configuration**:
  - Environment variables for API keys and configuration
  - Local .env file for developer-specific settings
  - SQLite database file in a configurable location

### Development Workflow

```
┌─────────────────┐
│                 │
│  Local          │
│  Development    │
│                 │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│                 │
│  GitHub         │
│  Repository     │
│                 │
└─────────────────┘
```

## MVP Local Application

### Application Packaging

For the MVP local application:

- **Packaging**: Electron to create a desktop application
- **Database**: SQLite file stored in user's app data directory
- **Configuration**: Default settings with user customization options
- **Updates**: Manual updates initially, with potential for auto-update later

### Resource Requirements

- **Disk Space**: ~200MB (application + dependencies + database)
- **Memory**: 512MB minimum, 1GB recommended
- **CPU**: Modern dual-core processor (minimal CPU requirements)

## Future Web Deployment (Post-MVP)

### Staging Environment

- **Hosting**: Heroku or Vercel for simplified deployment
- **Database**: PostgreSQL (smallest tier)
- **Scaling**: Single instance, no auto-scaling needed
- **Monitoring**: Basic logging and error tracking

### Production Environment

- **Hosting Options**:
  - **Option 1**: Cloud PaaS (Heroku, Render, or Vercel)
    - Pros: Simplicity, managed services, lower DevOps overhead
    - Cons: Higher cost at scale, less control
  
  - **Option 2**: Containerized Deployment (Docker + Cloud Provider)
    - Pros: More control, potentially lower costs at scale
    - Cons: Higher complexity, more DevOps requirements

- **Database Requirements**:
  - PostgreSQL database with appropriate scaling
  - Regular backups and monitoring
  - Consider read replicas for high traffic (future)

- **Frontend Hosting**:
  - CDN-backed static hosting for React application
  - Consider Vercel, Netlify, or CloudFront

- **Scaling Considerations**:
  - Horizontal scaling for API servers
  - Database connection pooling
  - Redis for caching frequent queries
  - Rate limiting for external API access

## Data Concerns

### Data Storage

- **Development**: SQLite file with daily backup recommended
- **Production**: PostgreSQL with automated backups
- **Data Retention**: 
  - Server metadata: Indefinite
  - User contributions: Indefinite
  - Collection logs: 30 days rolling

### Security Considerations

- **API Keys**: Securely stored in environment variables
- **GitHub Access**: Use token with minimal required permissions
- **User Data**: Minimal collection, no personal data required for MVP
- **Contribution Validation**: Basic validation to prevent abuse

## Monitoring and Reliability (Future)

- **Logging**: Structured logging with levels (error, warn, info, debug)
- **Error Tracking**: Sentry or similar service
- **Performance Monitoring**: Response time tracking for API endpoints
- **Availability**: Health check endpoints for monitoring uptime

## Notes for Dev Team Lead

- **MVP Infrastructure Priority**:
  - Focus on a solid local development setup with clear documentation
  - Design the database schema to work with both SQLite and PostgreSQL
  - Implement a clean Electron packaging process for the local application
  - Set up GitHub API key handling securely

- **Technical Complexity**:
  - Electron packaging: Medium complexity (handle updates and configuration)
  - Database compatibility: Medium complexity (ensure schema works on SQLite and PostgreSQL)
  - GitHub API integration: Medium complexity (handle rate limits and authentication)

- **Implementation Tradeoffs**:
  - Use SQLite for MVP simplicity vs PostgreSQL flexibility for future
  - Electron for desktop app vs web application deployment
  - Local data storage vs cloud synchronization

- **Development Recommendations**:
  - Implement a clean development environment setup script
  - Document all external dependencies clearly
  - Configure ESLint and Prettier for consistent code style
  - Set up a clear folder structure for separation of concerns 