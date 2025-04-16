import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Box, Typography, Paper } from '@mui/material';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServersPage from './pages/ServersPage';
import NotFoundPage from './pages/NotFoundPage';

// Placeholder for About page
const AboutPage: React.FC = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About MCP Registry
      </Typography>
      <Typography variant="body1" paragraph>
        MCP Registry is a centralized directory for Model Context Protocol servers, helping developers discover trusted tools to extend AI capabilities. We aggregate servers from multiple sources and provide reputation scoring to help you make informed decisions.
      </Typography>
      <Typography variant="body1">
        This application is currently in MVP stage and will be expanded with more features in the future.
      </Typography>
    </Paper>
  );
};

const App: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
      </Container>
    </Layout>
  );
};

export default App; 