import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Container,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getStats, getFeaturedServers, getCategories, loadServersFromSources } from '../services/api';
import ServerCard from '../components/ServerCard';
import CategoryTag from '../components/CategoryTag';
import SearchBar from '../components/SearchBar';
import ErrorState from '../components/ErrorState';

interface Stats {
  serverCount: number;
  categoryCount: number;
  contributionCount: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Server {
  id: string;
  name: string;
  description: string;
  reputationScore: number;
  categories: { name: string }[];
  lastUpdated: string;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredServers, setFeaturedServers] = useState<Server[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    servers: true,
    categories: true
  });
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error'
  });
  const [error, setError] = useState<string | null>(null);

  // Function to handle loading servers from sources
  const handleLoadServers = async () => {
    try {
      setIsLoadingServers(true);
      await loadServersFromSources();
      setSnackbar({
        open: true,
        message: 'Server data collection has started. This may take a moment.',
        severity: 'info'
      });
      
      // Wait a bit and then refresh the data
      setTimeout(async () => {
        try {
          await fetchData();
          setSnackbar({
            open: true,
            message: 'Server data has been updated successfully!',
            severity: 'success'
          });
        } catch (err) {
          console.error('Error refreshing data:', err);
        } finally {
          setIsLoadingServers(false);
        }
      }, 3000);
    } catch (err) {
      console.error('Error loading servers:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load server data. Please try again.',
        severity: 'error'
      });
      setIsLoadingServers(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch statistics
      const statsData = await getStats();
      setStats(statsData.data);
      setLoading(prev => ({ ...prev, stats: false }));

      // Fetch featured servers
      const serversData = await getFeaturedServers(4);
      setFeaturedServers(serversData);
      setLoading(prev => ({ ...prev, servers: false }));

      // Fetch categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      setLoading(prev => ({ ...prev, categories: false }));
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError('Failed to load homepage data. Please try again later.');
      setLoading({
        stats: false,
        servers: false,
        categories: false
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle search submit
  const handleSearch = (query: string) => {
    // Navigate to search results page
    window.location.href = `/servers?q=${encodeURIComponent(query)}`;
  };

  if (error) {
    return <ErrorState description={error} />;
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
          color: 'white',
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 10 },
          mb: 6,
          borderRadius: { xs: 0, md: 2 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Discover Trusted MCP Servers
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            color="inherit" 
            paragraph
            sx={{ 
              opacity: 0.9,
              mb: 4,
              px: { xs: 2, md: 0 }
            }}
          >
            Find reliable Model Context Protocol servers for your AI applications
          </Typography>
          
          {/* Hero Search Bar */}
          <Box sx={{ mb: 4, mx: 'auto', maxWidth: '600px' }}>
            <SearchBar 
              fullWidth 
              placeholder="Search for MCP servers..." 
              onSearch={handleSearch}
              initialValue=""
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiIconButton-root': {
                  color: 'white',
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              component={RouterLink} 
              to="/servers"
              sx={{ 
                fontWeight: 600,
                px: 4,
                py: 1.5
              }}
            >
              Explore Servers
            </Button>
            
            <Tooltip 
              title="Note: There is a known issue with the Glama API connection. The application may be unable to fetch the latest server data from external sources."
              arrow
              placement="bottom"
            >
              <Button 
                variant="outlined"
                color="inherit"
                size="large"
                onClick={handleLoadServers}
                disabled={isLoadingServers}
                sx={{ 
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                {isLoadingServers ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                    Loading...
                  </>
                ) : 'Load Servers'}
              </Button>
            </Tooltip>
          </Box>
        </Container>
      </Box>
      
      {/* Statistics Bar */}
      <Box 
        component={Paper} 
        elevation={1}
        sx={{ 
          py: 3,
          mb: 6,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <Container>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {loading.stats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                <StatItem 
                  value={stats?.serverCount || 0} 
                  label="Servers" 
                  isMobile={isMobile}
                />
                <StatItem 
                  value={stats?.categoryCount || 0} 
                  label="Categories" 
                  isMobile={isMobile}
                />
                <StatItem 
                  value={stats?.contributionCount || 0} 
                  label="Contributions" 
                  isMobile={isMobile}
                />
              </>
            )}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Servers Section */}
      <Container>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
              Featured Servers
            </Typography>
            <Button 
              component={RouterLink} 
              to="/servers" 
              color="primary"
            >
              View All
            </Button>
          </Box>
          
          {loading.servers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredServers.map(server => (
                <Grid item xs={12} sm={6} md={3} key={server.id}>
                  <ServerCard 
                    id={server.id}
                    name={server.name}
                    description={server.description}
                    reputation={server.reputationScore}
                    categories={server.categories.map(cat => cat.name)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Categories Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Categories
          </Typography>
          
          {loading.categories ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {categories.slice(0, 8).map(category => (
                <Grid item xs={6} sm={4} md={3} key={category.id}>
                  <Paper
                    component={RouterLink}
                    to={`/servers?categories=${encodeURIComponent(category.id)}`}
                    elevation={1}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <Typography variant="h6" component="h3">
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} servers
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* About Section */}
        <Box sx={{ mb: 6 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              About MCP Registry
            </Typography>
            <Typography variant="body1" paragraph>
              MCP Registry is a centralized directory for Model Context Protocol servers, helping developers discover trusted tools to extend AI capabilities. We aggregate servers from multiple sources and provide reputation scoring to help you make informed decisions.
            </Typography>
            <Typography variant="body1" paragraph>
              The Model Context Protocol allows AI models to interact with external tools like file systems, databases, and APIs, enhancing their capabilities and making them more useful for solving real-world problems.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/about" 
              variant="outlined" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Learn More
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

// StatItem component
const StatItem: React.FC<{ value: number; label: string; isMobile: boolean }> = ({ value, label, isMobile }) => (
  <Grid item xs={4} sm={4} md={4} textAlign="center">
    <Typography variant={isMobile ? 'h5' : 'h4'} component="p" fontWeight="bold" color="primary">
      {value}
    </Typography>
    <Typography variant="body1" color="textSecondary">
      {label}
    </Typography>
  </Grid>
);

export default HomePage; 