import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { Link } from 'react-router-dom';

export interface CategoryTagProps extends Omit<ChipProps, 'onClick'> {
  category: string;
  clickable?: boolean;
  disableLink?: boolean;
}

const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  clickable = true,
  disableLink = false,
  ...props
}) => {
  // Ensure category is a string
  const categoryString = typeof category === 'string' ? category : String(category);
  
  if (clickable && !disableLink) {
    return (
      <Chip
        component={Link}
        to={`/categories/${encodeURIComponent(categoryString)}`}
        label={categoryString}
        size="small"
        sx={{
          bgcolor: 'neutral.lightGray',
          color: 'text.secondary',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'primary.light',
          },
          textDecoration: 'none',
        }}
        {...props}
      />
    );
  }

  return (
    <Chip
      label={categoryString}
      size="small"
      sx={{
        bgcolor: 'neutral.lightGray',
        color: 'text.secondary',
        borderRadius: 1,
        ...(clickable ? {
          '&:hover': {
            bgcolor: 'primary.light',
            cursor: 'pointer',
          }
        } : {}),
      }}
      {...props}
    />
  );
};

export default CategoryTag; 