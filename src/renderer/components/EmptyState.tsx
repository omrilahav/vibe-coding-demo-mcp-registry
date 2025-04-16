import React from 'react';
import { Box, Typography, Button, ButtonProps } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <SearchOffIcon sx={{ fontSize: 64, opacity: 0.5 }} />,
  actionButton,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'neutral.lightGray',
        borderRadius: 1,
        p: 4,
        my: 2,
        minHeight: 200,
      }}
    >
      {icon}
      
      <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      
      {actionButton && (
        <Button
          variant={actionButton.variant || 'contained'}
          onClick={actionButton.onClick}
          sx={{ mt: 3 }}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState; 