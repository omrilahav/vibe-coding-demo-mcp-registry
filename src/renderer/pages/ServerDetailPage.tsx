import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Tabs, Tab, Button, 
  List, ListItem, ListItemText, Divider, TextField, 
  Rating, Avatar, Chip, CircularProgress
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Description as DocumentationIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { 
  getServerById, 
  getServerReputation, 
  getServerFeedback, 
  submitServerFeedback,
  getRelatedServers 
} from '../services/api';
import { ReputationBadge, CategoryTag, ServerCard, ErrorState, LoadingState } from '../components';

// TypeScript interfaces
interface ServerDetails {
  id: string;
  name: string;
  description: string;
  reputationScore: number;
  categories: { name: string }[];
  lastUpdated: string;
  license: string;
  author: string;
  githubUrl?: string;
  documentationUrl?: string;
}

interface ReputationDetails {
  overall: number;
  components: {
    security: number;
    documentation: number;
    communitySupport: number;
    reliability: number;
    maintenance: number;
    userFeedback: number;
  };
  lastUpdated: string;
}

interface FeedbackItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`server-tabpanel-${index}`}
      aria-labelledby={`server-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ServerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<ServerDetails | null>(null);
  const [reputation, setReputation] = useState<ReputationDetails | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [relatedServers, setRelatedServers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Feedback form state
  const [userFeedback, setUserFeedback] = useState({
    userName: '',
    rating: 0,
    comment: ''
  });

  // Fetch server data
  useEffect(() => {
    const fetchServerDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch basic server details
        const serverData = await getServerById(id || '');
        setServer(serverData);

        // Fetch reputation details, feedback, and related servers in parallel
        const [reputationData, feedbackData, relatedData] = await Promise.all([
          getServerReputation(id || '').catch(() => null),
          getServerFeedback(id || '').catch(() => []),
          getRelatedServers(id || '').catch(() => [])
        ]);
        
        if (reputationData) setReputation(reputationData);
        if (feedbackData) setFeedback(feedbackData);
        if (relatedData) setRelatedServers(relatedData);
        
      } catch (err) {
        console.error('Error fetching server details:', err);
        setError('Failed to load server details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchServerDetails();
    }
  }, [id]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle feedback form changes
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating change
  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setUserFeedback(prev => ({
      ...prev,
      rating: newValue || 0
    }));
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await submitServerFeedback(id, {
        userName: userFeedback.userName,
        rating: userFeedback.rating,
        comment: userFeedback.comment
      });
      
      // Add the new feedback to the list
      setFeedback([response.data, ...feedback]);
      
      // Reset form
      setUserFeedback({
        userName: '',
        rating: 0,
        comment: ''
      });
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState message="Loading server details..." />;
  }

  // Show error state
  if (error || !server) {
    return <ErrorState 
      title="Server Not Found" 
      description={error || "We couldn't find the server you were looking for."} 
    />;
  }

  return (
    <Box sx={{ mb: 8 }}>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link} 
          to="/servers" 
          startIcon={<ArrowBackIcon />} 
          variant="text" 
          color="primary"
        >
          Back to Servers
        </Button>
      </Box>

      {/* Server overview section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {server.name}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {server.categories.map((category, index) => (
                <CategoryTag key={index} category={category.name} />
              ))}
              <Chip 
                label={`License: ${server.license}`} 
                size="small" 
                variant="outlined" 
                sx={{ ml: 1 }} 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Last updated: {new Date(server.lastUpdated).toLocaleDateString()}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Author: {server.author}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {server.githubUrl && (
                <Button 
                  variant="outlined" 
                  startIcon={<GitHubIcon />} 
                  size="small"
                  href={server.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
              )}
              {server.documentationUrl && (
                <Button 
                  variant="outlined" 
                  startIcon={<DocumentationIcon />} 
                  size="small"
                  href={server.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </Button>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <ReputationBadge score={server.reputationScore} size="large" />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabbed content section */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="server detail tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Description" id="server-tab-0" aria-controls="server-tabpanel-0" />
          <Tab label="Reputation Details" id="server-tab-1" aria-controls="server-tabpanel-1" />
          <Tab label="Feedback" id="server-tab-2" aria-controls="server-tabpanel-2" />
          <Tab label="Usage Information" id="server-tab-3" aria-controls="server-tabpanel-3" />
        </Tabs>

        {/* Description Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {server.description}
          </Typography>
        </TabPanel>

        {/* Reputation Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Reputation Score: {server.reputationScore}/100
          </Typography>
          
          {reputation ? (
            <Box sx={{ mt: 2, mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>Score Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>Security:</Typography>
                    <LinearProgressWithLabel value={reputation.components.security} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>Documentation:</Typography>
                    <LinearProgressWithLabel value={reputation.components.documentation} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>Community Support:</Typography>
                    <LinearProgressWithLabel value={reputation.components.communitySupport} />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>Reliability:</Typography>
                    <LinearProgressWithLabel value={reputation.components.reliability} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>Maintenance:</Typography>
                    <LinearProgressWithLabel value={reputation.components.maintenance} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 150 }}>User Feedback:</Typography>
                    <LinearProgressWithLabel value={reputation.components.userFeedback} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Detailed reputation data is not available for this server.
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary">
            The reputation score is calculated based on multiple factors including security audits, documentation quality, community support, reliability metrics, maintenance activity, and user feedback. 
            Scores are updated weekly to reflect the current state of the server.
          </Typography>
        </TabPanel>

        {/* Feedback Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                User Feedback
              </Typography>
              
              {feedback.length > 0 ? (
                <List>
                  {feedback.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography component="span" variant="body2" color="text.primary">
                                {item.userName}
                              </Typography>
                              <Typography component="span" variant="body2" color="text.secondary">
                                {item.date}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Rating value={item.rating} readOnly size="small" sx={{ mt: 0.5, mb: 0.5 }} />
                              <Typography variant="body2" color="text.primary">
                                {item.comment}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No feedback available yet. Be the first to provide feedback!
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Submit Feedback
              </Typography>
              <Paper sx={{ p: 2 }}>
                <form onSubmit={handleSubmitFeedback}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Your Name"
                    name="userName"
                    value={userFeedback.userName}
                    onChange={handleFeedbackChange}
                    required
                  />
                  
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      name="rating"
                      value={userFeedback.rating}
                      onChange={handleRatingChange}
                      precision={0.5}
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Your Feedback"
                    name="comment"
                    value={userFeedback.comment}
                    onChange={handleFeedbackChange}
                    multiline
                    rows={4}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    disabled={isSubmitting || !userFeedback.userName || userFeedback.rating === 0 || !userFeedback.comment}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Usage Information Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Installation Instructions
          </Typography>
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography component="pre" variant="body2" sx={{ fontFamily: 'monospace' }}>
              npm install @mcp/{server.name.toLowerCase().replace(/\s+/g, '-')}
            </Typography>
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography component="pre" variant="body2" sx={{ fontFamily: 'monospace' }}>
              {`import { ${server.name.replace(/\s+/g, '')} } from '@mcp/${server.name.toLowerCase().replace(/\s+/g, '-')}';

// Initialize the MCP server
const ${server.name.toLowerCase().replace(/\s+/g, '_')} = new ${server.name.replace(/\s+/g, '')}({
  // Configuration options
});

// Use the server in your application
async function example() {
  const result = await ${server.name.toLowerCase().replace(/\s+/g, '_')}.performAction({
    // Action parameters
  });
  
  console.log(result);
}`}
            </Typography>
          </Paper>
          
          <Typography variant="body2">
            Refer to the {server.documentationUrl && (
              <a href={server.documentationUrl} target="_blank" rel="noopener noreferrer">
                official documentation
              </a>
            )} for more detailed usage instructions and advanced configuration options.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Related servers section */}
      {relatedServers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Related Servers
          </Typography>
          <Grid container spacing={3}>
            {relatedServers.map((relatedServer) => (
              <Grid item xs={12} sm={6} md={6} key={relatedServer.id}>
                <ServerCard 
                  id={relatedServer.id}
                  name={relatedServer.name}
                  description={relatedServer.description}
                  reputation={relatedServer.reputationScore}
                  categories={relatedServer.categories.map((c: any) => c.name)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

// Helper component for reputation score visualization
const LinearProgressWithLabel = ({ value }: { value: number }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <div style={{ 
          height: 8, 
          borderRadius: 4, 
          background: '#e0e0e0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${value}%`,
            background: value > 80 ? '#4caf50' : value > 60 ? '#ff9800' : '#f44336',
            borderRadius: 4
          }} />
        </div>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {value}%
        </Typography>
      </Box>
    </Box>
  );
};

export default ServerDetailPage; 