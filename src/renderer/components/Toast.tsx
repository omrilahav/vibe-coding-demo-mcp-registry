import React from 'react';
import { Snackbar, Alert, AlertProps, AlertTitle, Typography } from '@mui/material';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  open: boolean;
  message: string;
  description?: string;
  type?: ToastType;
  autoHideDuration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  description,
  type = 'info',
  autoHideDuration = 5000,
  onClose,
}) => {
  const getSeverity = (): AlertProps['severity'] => {
    return type as AlertProps['severity'];
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        severity={getSeverity()} 
        onClose={onClose}
        variant="filled"
        sx={{ width: '100%' }}
      >
        <AlertTitle>{message}</AlertTitle>
        {description && <Typography variant="body2">{description}</Typography>}
      </Alert>
    </Snackbar>
  );
};

export default Toast; 