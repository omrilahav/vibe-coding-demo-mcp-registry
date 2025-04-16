# MCP Registry

A local application that aggregates Model Context Protocol (MCP) servers into a searchable directory with reputation scoring.

## Project Overview

MCP Registry serves as a centralized directory for Model Context Protocol (MCP) servers. The system aggregates data from multiple sources, calculates reputation scores, and provides a searchable interface for users to discover and evaluate MCP servers.

## Features

- **Server Discovery**: Find and browse MCP servers from various sources
- **Reputation Scoring**: Evaluate servers based on calculated reputation scores
- **Search & Filter**: Easily search and filter servers based on various criteria
- **Local Database**: All data is stored locally for offline access

## Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **Application**: Electron for desktop packaging

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/mcp-registry.git
   cd mcp-registry
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Initialize Prisma
   ```
   npx prisma generate
   ```

### Development

1. Start the development server
   ```
   npm run dev
   ```

   This will start both the Electron app and React development server.

2. Build the application
   ```
   npm run build
   ```

## Project Structure

```
mcp-registry/
├── src/
│   ├── main/                  # Electron main process
│   ├── renderer/              # Frontend (React)
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # Frontend services
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   ├── shared/                # Shared code between main and renderer
│   └── server/                # Backend (Express)
│       ├── controllers/       # API controllers
│       ├── models/            # Data models
│       ├── services/          # Backend services
│       │   ├── collection/    # Data collection service
│       │   ├── reputation/    # Reputation scoring engine
│       │   └── search/        # Search service
│       ├── utils/             # Utility functions
├── prisma/                    # Prisma schema and migrations
├── public/                    # Static assets
└── tests/                     # Test files
```

## Available Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build the application
- `npm start` - Start the built application
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

This project is licensed under the MIT License - see the LICENSE file for details.