import React from 'react';
import { Grid, Box, BoxProps } from '@mui/material';

export interface CardGridProps extends BoxProps {
  children: React.ReactNode;
  spacing?: number;
}

const CardGrid: React.FC<CardGridProps> = ({
  children,
  spacing = 2,
  ...props
}) => {
  return (
    <Box {...props}>
      <Grid container spacing={spacing}>
        {React.Children.map(children, (child) => (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CardGrid; 