import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Get the directory name from ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Registry API is running' });
});

// Get application stats
app.get('/api/stats', async (req, res) => {
  try {
    console.log('GET /api/stats - Fetching real data');
    
    const serverCount = await prisma.mCPServer.count();
    const categoryCount = await prisma.category.count();
    const contributionCount = await prisma.userContribution.count();
    
    res.json({ 
      status: 'ok',
      data: {
        serverCount,
        categoryCount,
        contributionCount
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch application stats' });
  }
});

// Search servers with optional filtering
app.get('/api/servers/search', async (req, res) => {
  try {
    console.log('GET /api/servers/search - Fetching real data');
    
    const { q, category, minScore, page = 1, limit = 10, sort = 'reputationScore' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build search conditions
    const where = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } }
      ];
    }
    
    if (category) {
      where.categories = {
        some: {
          category: {
            name: category
          }
        }
      };
    }
    
    // First get the total count
    const totalCount = await prisma.mCPServer.count({ where });
    
    // Then fetch servers with their relations
    const servers = await prisma.mCPServer.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        reputationScores: {
          orderBy: {
            calculatedAt: 'desc'
          },
          take: 1
        }
      },
      skip,
      take,
      orderBy: sort === 'recent' 
        ? { updatedAt: 'desc' } 
        : sort === 'alphabetical'
          ? { name: 'asc' }
          : { reputationScores: { _count: 'desc' } }
    });
    
    // Format the response
    const formattedServers = servers.map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      reputationScore: server.reputationScores.length > 0 
        ? Math.round(server.reputationScores[0].overallScore) 
        : null,
      categories: server.categories.map(c => ({ name: c.category.name })),
      lastUpdated: server.updatedAt
    }));
    
    res.json({ 
      status: 'ok',
      data: formattedServers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch servers' });
  }
});

// Fetch categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('GET /api/categories - Fetching real data');
    
    // Get categories with server counts
    const categories = await prisma.category.findMany();
    
    // Get count of servers for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.categoryToServer.count({
          where: { categoryId: category.id }
        });
        
        return {
          id: category.id,
          name: category.name,
          count
        };
      })
    );
    
    res.json({ 
      status: 'ok',
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
});

// Fetch server details
app.get('/api/servers/:id', async (req, res) => {
  try {
    const serverId = req.params.id;
    console.log(`GET /api/servers/${serverId} - Fetching real data`);
    
    const server = await prisma.mCPServer.findUnique({
      where: { id: serverId },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        reputationScores: {
          orderBy: {
            calculatedAt: 'desc'
          },
          take: 1
        },
        capabilities: true,
        userContributions: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!server) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    
    // Format the response
    const formattedServer = {
      id: server.id,
      name: server.name,
      description: server.description,
      url: server.url,
      repositoryUrl: server.repositoryUrl,
      license: server.license,
      author: server.owner,
      reputationScore: server.reputationScores.length > 0 
        ? Math.round(server.reputationScores[0].overallScore)
        : null,
      reputationDetails: server.reputationScores.length > 0 
        ? {
            maintenance: Math.round(server.reputationScores[0].maintenanceScore),
            community: Math.round(server.reputationScores[0].communityScore),
            stability: Math.round(server.reputationScores[0].stabilityScore),
            documentation: Math.round(server.reputationScores[0].documentationScore),
            security: Math.round(server.reputationScores[0].securityScore)
          }
        : null,
      categories: server.categories.map(c => ({ name: c.category.name })),
      capabilities: server.capabilities.map(c => ({
        name: c.name,
        description: c.description,
        details: c.details ? JSON.parse(c.details) : null
      })),
      lastUpdated: server.updatedAt,
      feedback: server.userContributions.filter(c => c.contributionType === 'feedback').map(f => ({
        id: f.id,
        content: f.content,
        submitter: f.submitterName,
        date: f.createdAt
      }))
    };
    
    res.json({ status: 'ok', data: formattedServer });
  } catch (error) {
    console.error('Error fetching server details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch server details' });
  }
});

// Submit user contribution
app.post('/api/contributions', async (req, res) => {
  try {
    const { type, serverId, content, submitterName, submitterEmail } = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    
    const contribution = await prisma.userContribution.create({
      data: {
        contributionType: type,
        serverId,
        content,
        submitterName,
        submitterEmail,
        status: 'pending'
      }
    });
    
    res.status(201).json({ 
      status: 'ok', 
      message: 'Contribution submitted successfully',
      data: { id: contribution.id }
    });
  } catch (error) {
    console.error('Error submitting contribution:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit contribution' });
  }
});

// Serve a simple HTML page for root with automatic redirect
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="refresh" content="0;url=http://localhost:5173">
        <title>MCP Registry API Server</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
          }
          h1 { color: #3f51b5; margin-bottom: 10px; }
          p { margin-bottom: 20px; }
          .card {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: #3f51b5;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
          }
          .endpoints {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .endpoint {
            margin-bottom: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
          }
          code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <h1>MCP Registry API Server</h1>
        <p>The API server is running successfully on port ${PORT}.</p>
        <p>Redirecting to the React frontend...</p>
        
        <div class="card">
          <h2>Frontend Development</h2>
          <p>If you're not redirected automatically, click below:</p>
          <a href="http://localhost:5173" class="button">Open React Frontend</a>
        </div>
        
        <div class="endpoints">
          <h2>Available API Endpoints</h2>
          <div class="endpoint">
            <strong>GET <code>/api/health</code></strong> - Health check endpoint
          </div>
          <div class="endpoint">
            <strong>GET <code>/api/stats</code></strong> - Application statistics
          </div>
          <div class="endpoint">
            <strong>GET <code>/api/servers/search</code></strong> - Search MCP servers
          </div>
          <div class="endpoint">
            <strong>GET <code>/api/categories</code></strong> - List available categories
          </div>
          <div class="endpoint">
            <strong>GET <code>/api/servers/:id</code></strong> - Get server details
          </div>
          <div class="endpoint">
            <strong>POST <code>/api/contributions</code></strong> - Submit feedback or new server
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`MCP Registry API server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
}); 