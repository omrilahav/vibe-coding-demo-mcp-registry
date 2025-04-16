import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { colors } from '../utils/theme';

export interface ReputationBadgeProps {
  score: number | null;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const getSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 24;
    case 'large':
      return 48;
    case 'medium':
    default:
      return 32;
  }
};

const getColor = (score: number): string => {
  if (score >= 80) return colors.secondary.success;
  if (score >= 50) return colors.secondary.warning;
  return colors.secondary.error;
};

const getFontSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 10;
    case 'large':
      return 16;
    case 'medium':
    default:
      return 12;
  }
};

const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  score,
  size = 'medium',
  showTooltip = true,
}) => {
  if (score === null) {
    return (
      <Box
        sx={{
          width: getSize(size),
          height: getSize(size),
          borderRadius: '50%',
          backgroundColor: colors.neutral.lightGray,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: getFontSize(size),
            fontWeight: 600,
            color: colors.neutral.darkGray,
          }}
        >
          N/A
        </Typography>
      </Box>
    );
  }

  const badgeColor = getColor(score);
  const tooltipContent = (
    <>
      <Typography variant="body2" fontWeight={600}>
        Reputation Score: {score}
      </Typography>
      <Typography variant="caption">
        {score >= 80
          ? 'High reputation - Trusted server'
          : score >= 50
          ? 'Medium reputation - Use with caution'
          : 'Low reputation - Not recommended'}
      </Typography>
    </>
  );

  const badge = (
    <Box
      sx={{
        position: 'relative',
        width: getSize(size),
        height: getSize(size),
        borderRadius: '50%',
        backgroundColor: colors.neutral.lightGray,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Circular progress indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: `conic-gradient(${badgeColor} ${score}%, transparent ${score}%)`,
          maskImage: 'radial-gradient(transparent 55%, black 55%)',
          WebkitMaskImage: 'radial-gradient(transparent 55%, black 55%)',
        }}
      />
      
      {/* Score text */}
      <Typography
        sx={{
          fontSize: getFontSize(size),
          fontWeight: 600,
          color: badgeColor,
        }}
      >
        {score}
      </Typography>
    </Box>
  );

  return showTooltip ? (
    <Tooltip title={tooltipContent} arrow>
      {badge}
    </Tooltip>
  ) : (
    badge
  );
};

export default ReputationBadge; 