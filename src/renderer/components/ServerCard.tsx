import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ReputationBadge from './ReputationBadge';
import CategoryTag from './CategoryTag';

export interface ServerCardProps {
  id: string;
  name: string;
  description: string;
  reputation: number | null;
  categories: string[];
}

const ServerCard: React.FC<ServerCardProps> = ({
  id,
  name,
  description,
  reputation,
  categories,
}) => {
  // Handle category chip click to prevent parent card link from triggering
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <Card
      component={Link}
      to={`/servers/${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 160,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="h2" noWrap>
            {name}
          </Typography>
          <ReputationBadge score={reputation} size="small" />
        </Box>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </Typography>
        
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {categories.slice(0, 3).map((category, index) => (
            <CategoryTag 
              key={`${category}-${index}`}
              category={category}
              disableLink={true} // Disable links to prevent nested <a> tags
              // Use a div instead of Link component to avoid nesting <a> tags
            />
          ))}
          {categories.length > 3 && (
            <Typography variant="caption" sx={{ alignSelf: 'center' }}>
              +{categories.length - 3} more
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServerCard; 