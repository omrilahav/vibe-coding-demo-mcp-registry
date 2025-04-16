import React from 'react';
import {
  FormControlLabel,
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormHelperText,
  FormControl,
} from '@mui/material';

export interface CheckboxProps extends MuiCheckboxProps {
  label?: string;
  helper?: string;
  error?: boolean;
  errorText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  helper,
  error = false,
  errorText,
  ...props
}) => {
  return (
    <FormControl error={error}>
      <FormControlLabel
        control={<MuiCheckbox {...props} />}
        label={label || ''}
      />
      
      {(helper || errorText) && (
        <FormHelperText error={error}>
          {error ? errorText : helper}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default Checkbox; 