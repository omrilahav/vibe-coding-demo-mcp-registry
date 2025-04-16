import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

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

// Submit a new server
app.post('/api/servers', async (req, res) => {
  try {
    console.log('POST /api/servers - Received data:', req.body);
    const serverData = req.body;
    
    // Validate required fields
    if (!serverData.name || !serverData.url || !serverData.description || 
        !serverData.categories || !serverData.license) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields. Please provide name, URL, description, categories, and license.' 
      });
    }
    
    // First, create the server without categories
    const newServer = await prisma.mCPServer.create({
      data: {
        name: serverData.name,
        url: serverData.url,
        description: serverData.description,
        license: serverData.license,
        owner: serverData.author || 'Anonymous',
        repositoryUrl: serverData.repositoryUrl || null,
        isActive: true,
        isVerified: false
      }
    });
    
    // Then handle categories
    for (const categoryName of serverData.categories) {
      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName }
        });
      }
      
      // Create the relationship in the junction table
      await prisma.categoryToServer.create({
        data: {
          serverId: newServer.id,
          categoryId: category.id
        }
      });
    }
    
    // Get the updated server with categories
    const serverWithCategories = await prisma.mCPServer.findUnique({
      where: { id: newServer.id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Server submitted successfully.',
      data: {
        id: newServer.id,
        name: newServer.name,
        url: newServer.url,
        description: newServer.description,
        categories: serverWithCategories.categories.map(c => c.category.name),
        license: newServer.license,
        submissionDate: newServer.createdAt,
        status: newServer.isVerified ? 'verified' : 'pending'
      }
    });
  } catch (error) {
    console.error('Error submitting server:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    res.status(500).json({ status: 'error', message: 'Failed to submit server.' });
  }
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

// Get server feedback endpoint
app.get('/api/servers/:id/feedback', async (req, res) => {
  try {
    const serverId = req.params.id;
    console.log(`GET /api/servers/${serverId}/feedback - Fetching feedback`);
    
    // Check if server exists
    const server = await prisma.mCPServer.findUnique({
      where: { id: serverId }
    });
    
    if (!server) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    
    // Get feedback from UserContribution table
    const feedbackContributions = await prisma.userContribution.findMany({
      where: {
        serverId: serverId,
        contributionType: 'feedback',
        status: 'approved'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the feedback data
    const feedbackData = feedbackContributions.map(contribution => {
      let parsedContent = {};
      try {
        if (contribution.content.startsWith('{')) {
          parsedContent = JSON.parse(contribution.content);
        } else {
          parsedContent = { comment: contribution.content };
        }
      } catch (e) {
        console.error('Error parsing feedback content:', e);
        parsedContent = { comment: contribution.content };
      }
      
      return {
        id: contribution.id,
        userName: contribution.submitterName || 'Anonymous',
        rating: parsedContent.rating || 5,
        comment: parsedContent.comment || contribution.content,
        date: contribution.createdAt.toISOString().split('T')[0]
      };
    });
    
    res.json({ status: 'ok', data: feedbackData });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch feedback' });
  }
});

// Submit server feedback endpoint
app.post('/api/servers/:id/feedback', async (req, res) => {
  try {
    const serverId = req.params.id;
    console.log(`POST /api/servers/${serverId}/feedback - Submitting feedback:`, req.body);
    
    const { userName, rating, comment } = req.body;
    
    // Validate required fields
    if (!userName || rating === undefined || !comment) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields. Please provide userName, rating, and comment.' 
      });
    }
    
    // Check if server exists
    const server = await prisma.mCPServer.findUnique({
      where: { id: serverId }
    });
    
    if (!server) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }

    // Store feedback as a UserContribution
    const userContribution = await prisma.userContribution.create({
      data: {
        serverId: serverId,
        contributionType: 'feedback',
        content: JSON.stringify({
          rating: rating,
          comment: comment
        }),
        submitterName: userName,
        status: 'approved' // Auto-approve feedback for now
      }
    });
    
    // Return success response with the created feedback
    res.status(201).json({ 
      status: 'success', 
      message: 'Feedback submitted successfully.',
      data: {
        id: userContribution.id,
        userName: userName,
        rating: rating,
        comment: comment,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit feedback. Please try again.' });
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

// Add an endpoint to fetch servers from real sources
app.post('/api/load-servers', async (req, res) => {
  try {
    console.log('Triggering MCP servers data collection from Glama API...');
    
    // Fetch servers directly from Glama API
    const fetchFromGlamaApi = async () => {
      let url = 'https://glama.ai/api/mcp/v1/servers?first=20';
      
      // If we have a saved endCursor, use it for pagination
      try {
        const lastDataSource = await prisma.dataSource.findFirst({
          where: { name: 'glama.ai' },
          orderBy: { lastFetchedAt: 'desc' }
        });
        
        if (lastDataSource && lastDataSource.metadata) {
          // Try to parse metadata for cursor
          const metadata = JSON.parse(lastDataSource.metadata);
          if (metadata.endCursor) {
            url = `https://glama.ai/api/mcp/v1/servers?first=20&after=${encodeURIComponent(metadata.endCursor)}`;
            console.log(`Using saved cursor for pagination: ${metadata.endCursor.substring(0, 20)}...`);
          }
        }
      } catch (err) {
        console.error('Error getting last cursor:', err);
        // Continue with default URL if there's an error
      }
      
      console.log(`Fetching from Glama API: ${url}`);
      
      const response = await axios.get(url);
      const data = response.data;
      
      // Validate response structure
      if (!data || !data.servers || !Array.isArray(data.servers)) {
        throw new Error('Unexpected API response format');
      }
      
      console.log(`Retrieved ${data.servers.length} servers from Glama API`);
      
      // Save the endCursor for next pagination if available
      if (data.pageInfo && data.pageInfo.endCursor) {
        try {
          await prisma.dataSource.upsert({
            where: { name: 'glama.ai' },
            update: { 
              lastFetchedAt: new Date(),
              status: 'active',
              metadata: JSON.stringify({
                endCursor: data.pageInfo.endCursor,
                hasNextPage: data.pageInfo.hasNextPage
              })
            },
            create: {
              name: 'glama.ai',
              sourceType: 'api',
              baseUrl: 'https://glama.ai/api/mcp/v1/servers',
              status: 'active',
              metadata: JSON.stringify({
                endCursor: data.pageInfo.endCursor,
                hasNextPage: data.pageInfo.hasNextPage
              })
            }
          });
          console.log(`Saved endCursor for next pagination: ${data.pageInfo.endCursor.substring(0, 20)}...`);
        } catch (err) {
          console.error('Error saving cursor:', err);
        }
      }
      
      return data.servers;
    };
    
    // Store servers in the database
    const storeServers = async (servers) => {
      const results = [];
      
      for (const server of servers) {
        try {
          // Map server data to our database schema
          const serverData = {
            name: server.name || '',
            description: server.description || '',
            url: server.url || '',
            repositoryUrl: server.repository?.url || '',
            license: server.spdxLicense?.name || '',
            owner: 'Glama AI',
            isActive: true,
            isVerified: true
          };
          
          // Only process servers with required fields
          if (!serverData.name || !serverData.url) {
            continue;
          }
          
          // Create or update server
          const existingServer = await prisma.mCPServer.findFirst({
            where: { url: serverData.url }
          });
          
          let dbServer;
          if (existingServer) {
            // Update existing server
            dbServer = await prisma.mCPServer.update({
              where: { id: existingServer.id },
              data: serverData
            });
            console.log(`Updated server: ${dbServer.name}`);
          } else {
            // Create new server
            dbServer = await prisma.mCPServer.create({
              data: serverData
            });
            console.log(`Created server: ${dbServer.name}`);
          }
          
          // Process categories from attributes
          if (Array.isArray(server.attributes) && server.attributes.length > 0) {
            for (const attrName of server.attributes) {
              // Find or create the category
              let category = await prisma.category.findFirst({
                where: { name: attrName }
              });
              
              if (!category) {
                category = await prisma.category.create({
                  data: { name: attrName }
                });
              }
              
              // Check if relationship already exists
              const existingRelation = await prisma.categoryToServer.findFirst({
                where: {
                  serverId: dbServer.id,
                  categoryId: category.id
                }
              });
              
              // Create relationship if it doesn't exist
              if (!existingRelation) {
                await prisma.categoryToServer.create({
                  data: {
                    serverId: dbServer.id,
                    categoryId: category.id
                  }
                });
              }
            }
          }
          
          // Process capabilities from tools
          if (Array.isArray(server.tools) && server.tools.length > 0) {
            // First clean up existing capabilities
            await prisma.capability.deleteMany({
              where: { serverId: dbServer.id }
            });
            
            // Add new capabilities
            for (const tool of server.tools) {
              await prisma.capability.create({
                data: {
                  serverId: dbServer.id,
                  name: tool.name || 'Unnamed Tool',
                  description: tool.description || '',
                  details: JSON.stringify(tool)
                }
              });
            }
          }
          
          results.push(dbServer);
        } catch (err) {
          console.error(`Error processing server ${server.name}:`, err);
        }
      }
      
      return results;
    };
    
    // Main process
    try {
      // Fetch from Glama
      const servers = await fetchFromGlamaApi();
      
      // Store in DB
      const storedServers = await storeServers(servers);
      
      // Get updated stats
      const newTotal = await prisma.mCPServer.count();
      
      res.json({ 
        status: 'success', 
        message: `Successfully processed ${storedServers.length} MCP servers.`,
        count: storedServers.length,
        total: newTotal
      });
    } catch (error) {
      console.error('Error in server collection process:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to collect and store server data.' 
      });
    }
  } catch (error) {
    console.error('Error triggering data collection:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to trigger server data collection.' 
    });
  }
});

// Add a test endpoint to directly access the Glama API
app.get('/api/test-glama', async (req, res) => {
  try {
    console.log('Testing Glama API directly...');
    
    // Use the curl example provided in the requirements
    const url = 'https://glama.ai/api/mcp/v1/servers?first=20';
    console.log(`Fetching from: ${url}`);
    
    const response = await axios.get(url);
    console.log('Response status:', response.status);
    console.log('Response data sample:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    res.json({ 
      status: 'success', 
      message: 'Direct API test completed',
      data: response.data
    });
  } catch (error) {
    console.error('Error testing Glama API directly:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to test Glama API directly',
      error: error.message || 'Unknown error'
    });
  }
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