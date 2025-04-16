import React, { useState } from 'react';
import { Typography, Paper, TextField, Box, Grid, Card, CardContent, CardHeader, Chip } from '@mui/material';

// Mock data for the initial setup
const mockServers = [
  {
    id: '1',
    name: 'Sample MCP Server 1',
    description: 'A sample MCP server for demonstration purposes',
    url: 'https://example.com/mcp1',
    reputationScore: 4.5,
    tags: ['Open Source', 'High Performance']
  },
  {
    id: '2',
    name: 'Sample MCP Server 2',
    description: 'Another sample MCP server with different characteristics',
    url: 'https://example.com/mcp2',
    reputationScore: 3.8,
    tags: ['Free Tier', 'API Documentation']
  }
];

const ServersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [servers] = useState(mockServers);

  // Search functionality
  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        MCP Servers Directory
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          label="Search servers"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredServers.map(server => (
          <Grid item xs={12} md={6} key={server.id}>
            <Card>
              <CardHeader 
                title={server.name}
                subheader={`Reputation Score: ${server.reputationScore}/5.0`}
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {server.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  URL: {server.url}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {server.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {filteredServers.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">
                No servers found matching your search criteria.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ServersPage; 