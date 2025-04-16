import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  isLoading?: boolean;
}

// Tertiary button (text button with custom styling)
const TertiaryButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading = false, 
  disabled = false,
  children, 
  ...props 
}) => {
  // Map our variants to MUI variants
  const getButtonVariant = (): MuiButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'outlined';
      case 'tertiary':
        return 'text';
      default:
        return 'contained';
    }
  };

  // For tertiary buttons, we use our custom component
  if (variant === 'tertiary') {
    return (
      <TertiaryButton
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : children}
      </TertiaryButton>
    );
  }

  // For primary and secondary buttons, we use MUI Button with our mapped variant
  return (
    <MuiButton
      variant={getButtonVariant()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
};

export default Button; 