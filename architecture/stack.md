# MCP Registry - Technology Stack

## Core Technologies

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI
- **State Management**: Redux or React Context API
- **Data Fetching**: Axios for API calls
- **Charting**: D3.js or Chart.js for reputation score visualization
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js
- **API Framework**: Express.js
- **Data Validation**: Joi or Zod
- **Authentication**: JWT for future user authentication
- **Type Safety**: TypeScript

### Database
- **Primary Database**: SQLite (for MVP/local app) transitioning to PostgreSQL for production
- **ORM**: Prisma or Sequelize
- **Migration Tool**: Integrated with ORM

### Data Collection
- **HTTP Client**: Axios or Node-fetch
- **HTML Parsing**: Cheerio (for scraping when APIs are unavailable)
- **GitHub Integration**: Octokit (GitHub API client)
- **Scheduling**: Node-cron for periodic data refresh

## Development Tools

### Version Control
- **System**: Git
- **Platform**: GitHub
- **Workflow**: GitHub Flow (feature branches with pull requests)

### Development Environment
- **Package Manager**: npm or Yarn
- **Bundler**: Webpack or Vite
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Testing**: Jest for unit tests, Cypress for E2E tests

### CI/CD (Future)
- **CI Pipeline**: GitHub Actions
- **Containerization**: Docker
- **Deployment**: Heroku or Vercel for initial deployment

## External APIs & Services

### Data Sources
- **GitHub API**: For repository metrics and activity data
- **Glama.ai**: Web scraping or API access (if available)
- **ModelContextProtocol Repositories**: Direct integration

### Monitoring & Analytics (Future)
- **Error Tracking**: Sentry
- **Analytics**: Simple Analytics or Plausible (privacy-focused)

## MVP Implementation Notes

For the local application MVP:
- Use SQLite for local data storage
- Implement a simple Express.js server with React frontend
- Package as an Electron application for desktop deployment
- Focus on implementing the GitHub API integration first as it provides the most structured data

## Notes for Dev Team Lead

- **Initial Setup Priority**: Configure the TypeScript + React + Express + SQLite stack with proper type sharing between frontend and backend
- **Complexity Assessment**: 
  - GitHub API integration: Medium complexity (handle rate limiting)
  - Reputation scoring algorithm: Medium complexity (ensure extensibility)
  - Search functionality: Low complexity (SQLite FTS is sufficient for MVP)
- **Implementation Tradeoffs**:
  - Use SQLite for MVP simplicity, but design schema for PostgreSQL compatibility
  - Start with basic material components for UI speed, but ensure they can be customized
  - Consider delaying Electron packaging until core functionality is solid
- **Development Workflow**: 
  - Set up proper type sharing between frontend and backend
  - Configure comprehensive test coverage for data collection modules
  - Establish code quality standards early with ESLint and Prettier 