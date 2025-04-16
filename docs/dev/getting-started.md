# Developer Guide

This guide will help you set up your development environment and understand the development workflow for the MCP Registry project.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher) or yarn
- Git
- A code editor (VS Code recommended)

## Setting Up the Development Environment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/mcp-registry.git
   cd mcp-registry
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up the Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your local configuration.

## Development Workflow

### Starting the Development Server

1. Start the development server:
   ```bash
   npm run dev
   ```
   This will:
   - Start the Electron app
   - Launch the React development server
   - Watch for file changes

2. The app will open automatically. Any changes you make to the code will trigger hot reload.

### Project Structure

```
src/
├── main/              # Electron main process
├── renderer/          # Frontend (React)
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # Frontend services
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions
└── server/            # Backend (Express)
    ├── controllers/   # API controllers
    ├── models/        # Data models
    └── services/      # Backend services
```

### Code Style and Linting

We use ESLint and Prettier for code formatting:

- Format code: `npm run format`
- Lint code: `npm run lint`
- Fix linting issues: `npm run lint:fix`

Configure your editor to format on save using Prettier.

### Testing

1. **Unit Tests**
   ```bash
   npm run test
   ```

2. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

3. **Watch Mode**
   ```bash
   npm run test:watch
   ```

### Building

1. **Development Build**
   ```bash
   npm run build:dev
   ```

2. **Production Build**
   ```bash
   npm run build
   ```

3. **Package Application**
   ```bash
   npm run package
   ```

## Git Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format.

4. **Push Changes**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open a PR on GitHub
   - Fill out the PR template
   - Request review

## Debugging

### Frontend (React)

1. Use React Developer Tools in Chrome/Firefox
2. Use the Console in the Electron DevTools
3. Add `console.log()` or use the debugger statement

### Backend (Node.js)

1. Use VS Code's built-in debugger
2. Add `--inspect` flag to node process
3. Use `console.log()` for quick debugging

### Electron

1. Enable debug mode in main process
2. Use Electron DevTools
3. Check main process logs

## Best Practices

1. **Code Organization**
   - Keep components small and focused
   - Use TypeScript for type safety
   - Follow the container/presenter pattern

2. **Performance**
   - Lazy load components
   - Optimize database queries
   - Use React.memo for expensive components

3. **Testing**
   - Write tests for new features
   - Maintain high test coverage
   - Use meaningful test descriptions

4. **Documentation**
   - Document complex functions
   - Update README when needed
   - Add JSDoc comments for TypeScript

## Common Issues and Solutions

### Installation Problems
- Clear node_modules and package-lock.json
- Run `npm cache clean --force`
- Reinstall dependencies

### Build Issues
- Check Node.js version
- Verify all dependencies are installed
- Clear build cache

### Database Issues
- Reset the database: `npx prisma migrate reset`
- Check connection string in .env
- Verify Prisma schema

## Need Help?

- Check existing issues on GitHub
- Join our developer Discord
- Review the architecture documentation
- Ask in the developer channel 