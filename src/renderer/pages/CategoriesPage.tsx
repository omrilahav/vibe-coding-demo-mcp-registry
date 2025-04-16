import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Divider,
  Button
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { searchServers, getCategories } from '../services/api';
import ServerCard from '../components/ServerCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

interface Server {
  id: string;
  name: string;
  description: string;
  reputationScore: number;
  categories: Array<{name: string}> | string[];
}

const CategoriesPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName?: string }>();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedCategories, setRelatedCategories] = useState<string[]>([]);
  
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  
  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      try {
        // Search for servers by category
        const response = await searchServers({
          categories: categoryName ? [decodedCategoryName] : undefined
        });
        
        setServers(response.data || []);
        
        // Get categories for related categories section
        const categoriesData = await getCategories();
        setRelatedCategories(
          categoriesData
            .filter((cat: { name: string }) => 
              !categoryName || cat.name !== decodedCategoryName
            )
            .slice(0, 5)
            .map((cat: { name: string }) => cat.name)
        );
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServers();
  }, [categoryName, decodedCategoryName]);
  
  if (loading) {
    return <LoadingState message="Loading category data..." />;
  }
  
  if (error) {
    return (
      <ErrorState 
        title="Error Loading Category"
        description={error}
        retry={() => window.location.reload()}
      />
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {categoryName ? `Category: ${decodedCategoryName}` : 'All Categories'}
      </Typography>
      
      {categoryName && (
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/categories"
            variant="outlined"
            size="small"
          >
            View All Categories
          </Button>
        </Box>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          {categoryName 
            ? `Showing all MCP servers in the "${decodedCategoryName}" category.`
            : 'Browse MCP servers by category.'}
        </Typography>
        
        {servers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No servers found in this category.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Found {servers.length} {servers.length === 1 ? 'server' : 'servers'}.
          </Typography>
        )}
      </Paper>
      
      {servers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Servers
          </Typography>
          
          <Grid container spacing={3}>
            {servers.map(server => (
              <Grid item xs={12} sm={6} md={4} key={server.id}>
                <ServerCard
                  id={server.id}
                  name={server.name}
                  description={server.description}
                  reputation={server.reputationScore}
                  categories={Array.isArray(server.categories) 
                    ? server.categories.map(cat => typeof cat === 'object' && 'name' in cat ? cat.name : cat) 
                    : []}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {relatedCategories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Related Categories
          </Typography>
          
          <Grid container spacing={2}>
            {relatedCategories.map((cat, index) => (
              <Grid item key={index}>
                <Button
                  component={Link}
                  to={`/categories/${encodeURIComponent(cat)}`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                >
                  {cat}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesPage; 