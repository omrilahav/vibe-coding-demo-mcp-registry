import express from 'express';
import path from 'path';
import { setupDatabase } from './models/database';
import dataCollectionService from './services/collection';
import reputationScoringService from './services/reputation';
import searchService from './services/search';
import { startServer } from './server';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Registry API is running' });
});

// Get application stats
app.get('/api/stats', async (req, res) => {
  try {
    // For now, return mock data to bypass the database issues
    res.json({ 
      status: 'ok',
      data: {
        serverCount: 42,
        categoryCount: 12,
        contributionCount: 120
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch application stats' });
  }
});

// Mock endpoint for fetching featured servers
app.get('/api/servers/search', async (req, res) => {
  try {
    // Return mock data for featured servers
    res.json({ 
      status: 'ok',
      data: [
        {
          id: "1",
          name: "File System Access",
          description: "Allows AI models to read and write files on the local system",
          reputationScore: 92,
          categories: [{ name: "File Access" }, { name: "System" }],
          lastUpdated: "2023-04-01"
        },
        {
          id: "2",
          name: "Database Connector",
          description: "Connect to SQL and NoSQL databases to query and manipulate data",
          reputationScore: 88,
          categories: [{ name: "Database" }, { name: "Data" }],
          lastUpdated: "2023-03-15"
        },
        {
          id: "3",
          name: "HTTP Client",
          description: "Make external API calls and web requests from AI contexts",
          reputationScore: 95,
          categories: [{ name: "Network" }, { name: "API" }],
          lastUpdated: "2023-04-10"
        },
        {
          id: "4",
          name: "Image Processing",
          description: "Analyze and modify images using computer vision techniques",
          reputationScore: 84,
          categories: [{ name: "Vision" }, { name: "Media" }],
          lastUpdated: "2023-02-22"
        }
      ],
      pagination: {
        page: 1,
        limit: 4,
        totalCount: 4,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch servers' });
  }
});

// Mock endpoint for fetching categories
app.get('/api/categories', async (req, res) => {
  try {
    // Return mock data for categories
    res.json({ 
      status: 'ok',
      data: [
        { id: "cat1", name: "File Access", count: 15 },
        { id: "cat2", name: "Database", count: 22 },
        { id: "cat3", name: "Network", count: 18 },
        { id: "cat4", name: "API", count: 30 },
        { id: "cat5", name: "Vision", count: 12 },
        { id: "cat6", name: "Audio", count: 8 },
        { id: "cat7", name: "Text", count: 20 },
        { id: "cat8", name: "System", count: 25 }
      ]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
});

// Mock endpoint for server details
app.get('/api/servers/:id', async (req, res) => {
  try {
    // Return mock data for a server
    const serverId = req.params.id;
    
    // Simple mock database with a few servers
    const mockServers: Record<string, any> = {
      "1": {
        id: "1",
        name: "File System Access",
        description: "Allows AI models to read and write files on the local system. This MCP server provides a secure interface for AI models to interact with local file systems, supporting read, write, and list operations. It includes permission controls and sandboxing for security.",
        reputationScore: 92,
        categories: [{ name: "File Access" }, { name: "System" }],
        lastUpdated: "2023-04-01",
        license: "MIT",
        author: "OpenMCP Foundation",
        githubUrl: "https://github.com/openmcp/file-system-mcp",
        documentationUrl: "https://docs.openmcp.org/file-system"
      },
      "2": {
        id: "2",
        name: "Database Connector",
        description: "Connect to SQL and NoSQL databases to query and manipulate data. This MCP server enables AI models to safely interact with various database systems, including MySQL, PostgreSQL, MongoDB, and Redis. It provides query building, connection pooling, and result formatting.",
        reputationScore: 88,
        categories: [{ name: "Database" }, { name: "Data" }],
        lastUpdated: "2023-03-15",
        license: "Apache-2.0",
        author: "DataAI Labs",
        githubUrl: "https://github.com/dataai/db-connector-mcp",
        documentationUrl: "https://dataai.dev/docs/db-connector"
      }
    };
    
    const server = mockServers[serverId];
    if (!server) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    
    res.json({ status: 'ok', data: server });
  } catch (error) {
    console.error('Error fetching server details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch server details' });
  }
});

// Remaining routes - commented out to bypass ESM errors

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../renderer')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../renderer/index.html'));
  });
}

// Export the startServer function for use in Electron's main process
export { startServer }; 