import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'] })); // Add CORS middleware with specific origins

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

// Add a new endpoint for submitting servers
app.post('/api/servers', async (req, res) => {
  try {
    const serverData = req.body;
    
    // Validate required fields
    if (!serverData.name || !serverData.url || !serverData.description || 
        !serverData.categories || !serverData.license) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields. Please provide name, URL, description, categories, and license.' 
      });
    }
    
    // Log the submission (for demonstration purposes)
    console.log('Server submission received:', serverData);
    
    // In a real implementation, we would save to the database here
    // For now, just simulate a successful submission
    
    // Return success response
    res.status(201).json({ 
      status: 'success', 
      message: 'Server submitted successfully.',
      data: {
        id: 'new-' + Date.now(), // Generate a fake ID
        ...serverData,
        submissionDate: new Date().toISOString(),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error submitting server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit server.' });
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

// Mock endpoint for server reputation details
app.get('/api/servers/:id/reputation', async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Simple mock reputation data
    const mockReputationData: Record<string, any> = {
      "1": {
        overall: 92,
        components: {
          security: 85,
          documentation: 90,
          communitySupport: 75,
          reliability: 95,
          maintenance: 80,
          userFeedback: 88
        },
        lastUpdated: "2023-04-10"
      },
      "2": {
        overall: 88,
        components: {
          security: 82,
          documentation: 95,
          communitySupport: 79,
          reliability: 86,
          maintenance: 85,
          userFeedback: 80
        },
        lastUpdated: "2023-03-20"
      }
    };
    
    const reputationData = mockReputationData[serverId];
    if (!reputationData) {
      return res.status(404).json({ status: 'error', message: 'Reputation data not found' });
    }
    
    res.json({ status: 'ok', data: reputationData });
  } catch (error) {
    console.error('Error fetching reputation details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reputation details' });
  }
});

// Mock endpoint for server feedback
app.get('/api/servers/:id/feedback', async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Simple mock feedback data
    const mockFeedbackData: Record<string, any> = {
      "1": [
        {
          id: "f1",
          userName: "AI Developer",
          rating: 5,
          comment: "This MCP server is excellent! It provides exactly what I need for secure file access.",
          date: "2023-03-20"
        },
        {
          id: "f2",
          userName: "Data Scientist",
          rating: 4,
          comment: "Works great for most of my use cases, but could use better documentation for advanced features.",
          date: "2023-02-15"
        }
      ],
      "2": [
        {
          id: "f3",
          userName: "Backend Engineer",
          rating: 5,
          comment: "Fantastic integration with multiple database systems. The connection pooling is very efficient.",
          date: "2023-03-10"
        },
        {
          id: "f4",
          userName: "Full Stack Developer",
          rating: 4,
          comment: "Great for common queries, but could use more examples for complex joins and transactions.",
          date: "2023-02-28"
        }
      ]
    };
    
    const feedbackData = mockFeedbackData[serverId] || [];
    
    res.json({ status: 'ok', data: feedbackData });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch feedback' });
  }
});

// Mock endpoint for submitting server feedback
app.post('/api/servers/:id/feedback', async (req, res) => {
  try {
    const serverId = req.params.id;
    const feedback = req.body;
    
    // Validate required fields
    if (!feedback.userName || feedback.rating === undefined || !feedback.comment) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields. Please provide userName, rating, and comment.' 
      });
    }
    
    // Log the feedback (for demonstration purposes)
    console.log(`Received feedback for server ${serverId}:`, feedback);
    
    // In a real implementation, we would save to the database here
    // Return success response with the created feedback
    res.status(201).json({ 
      status: 'success', 
      message: 'Feedback submitted successfully.',
      data: {
        id: 'f' + Date.now(),
        ...feedback,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit feedback' });
  }
});

// Mock endpoint for related servers
app.get('/api/servers/:id/related', async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Simple mock related servers data
    const mockRelatedServers: Record<string, any> = {
      "1": [
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
      "2": [
        {
          id: "3",
          name: "HTTP Client",
          description: "Make external API calls and web requests from AI contexts",
          reputationScore: 95,
          categories: [{ name: "Network" }, { name: "API" }],
          lastUpdated: "2023-04-10"
        },
        {
          id: "5",
          name: "Data Visualization",
          description: "Generate charts and visualizations from data in AI applications",
          reputationScore: 89,
          categories: [{ name: "Data" }, { name: "Visualization" }],
          lastUpdated: "2023-03-05"
        }
      ]
    };
    
    const relatedServers = mockRelatedServers[serverId] || [];
    
    res.json({ status: 'ok', data: relatedServers });
  } catch (error) {
    console.error('Error fetching related servers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch related servers' });
  }
});

// Development mode - Serve a basic HTML page with info
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MCP Registry API Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #3f51b5; }
          ul { list-style-type: none; padding: 0; }
          li { margin-bottom: 10px; }
          .endpoint { background: #f0f0f0; padding: 10px; border-radius: 4px; }
          a { color: #3f51b5; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>MCP Registry API Server</h1>
        <p>The API server is running successfully on port ${PORT}.</p>
        <p>To view the frontend in development mode, visit: <a href="http://localhost:3000">http://localhost:3000</a></p>
        
        <h2>Available API Endpoints:</h2>
        <ul>
          <li><div class="endpoint"><a href="/api/health">/api/health</a> - Health check endpoint</div></li>
          <li><div class="endpoint"><a href="/api/stats">/api/stats</a> - Application statistics</div></li>
          <li><div class="endpoint"><a href="/api/servers/search">/api/servers/search</a> - Search MCP servers</div></li>
          <li><div class="endpoint"><a href="/api/categories">/api/categories</a> - List available categories</div></li>
          <li><div class="endpoint"><a href="/api/servers/1">/api/servers/:id</a> - Get server details (try with id=1 or id=2)</div></li>
          <li><div class="endpoint"><a href="/api/servers/1/reputation">/api/servers/:id/reputation</a> - Get server reputation details</div></li>
          <li><div class="endpoint"><a href="/api/servers/1/feedback">/api/servers/:id/feedback</a> - Get server feedback</div></li>
          <li><div class="endpoint"><a href="/api/servers/1/related">/api/servers/:id/related</a> - Get related servers</div></li>
          <li><div class="endpoint">POST /api/servers - Submit a new server</div></li>
          <li><div class="endpoint">POST /api/servers/:id/feedback - Submit feedback for a server</div></li>
        </ul>
      </body>
    </html>
  `);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../../dist/renderer')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/renderer/index.html'));
  });
}

// Start Server Function
export function startServer() {
  try {
    console.log('Starting server with mock data...');
    
    // Start the server without initializing other services
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} - API available at http://localhost:${PORT}/api/health`);
      console.log(`For development UI, visit: http://localhost:3000`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
} 