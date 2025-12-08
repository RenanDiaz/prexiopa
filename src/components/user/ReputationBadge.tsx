/**
 * ReputationBadge - Component to display user reputation badge
 * Shows reputation level with icon and score
 */

import styled from 'styled-components';
import { Crown, Star, Medal, CheckCircle, Sprout } from 'lucide-react';

export type ReputationLevel = 'beginner' | 'helper' | 'contributor' | 'trusted' | 'expert';

interface ReputationBadgeProps {
  score: number;
  showScore?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const getBadgeConfig = (score: number) => {
  if (score >= 500) {
    return {
      level: 'expert' as const,
      label: 'Experto',
      Icon: Crown,
      color: '#F59E0B', // gold
      bgColor: '#FEF3C7',
      borderColor: '#F59E0B',
    };
  }
  if (score >= 250) {
    return {
      level: 'trusted' as const,
      label: 'Confiable',
      Icon: Star,
      color: '#8B5CF6', // purple
      bgColor: '#EDE9FE',
      borderColor: '#8B5CF6',
    };
  }
  if (score >= 100) {
    return {
      level: 'contributor' as const,
      label: 'Contribuidor',
      Icon: Medal,
      color: '#CD7F32', // bronze
      bgColor: '#FED7AA',
      borderColor: '#CD7F32',
    };
  }
  if (score >= 50) {
    return {
      level: 'helper' as const,
      label: 'Ayudante',
      Icon: CheckCircle,
      color: '#10B981', // green
      bgColor: '#D1FAE5',
      borderColor: '#10B981',
    };
  }
  return {
    level: 'beginner' as const,
    label: 'Principiante',
    Icon: Sprout,
    color: '#6B7280', // gray
    bgColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  };
};

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        padding: '4px 8px',
        fontSize: '12px',
        iconSize: '14px',
        gap: '4px',
      };
    case 'large':
      return {
        padding: '10px 16px',
        fontSize: '16px',
        iconSize: '20px',
        gap: '10px',
      };
    default: // medium
      return {
        padding: '6px 12px',
        fontSize: '14px',
        iconSize: '16px',
        gap: '6px',
      };
  }
};

const BadgeContainer = styled.div<{
  $bgColor: string;
  $borderColor: string;
  $padding: string;
  $gap: string;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${({ $gap }) => $gap};
  padding: ${({ $padding }) => $padding};
  background: ${({ $bgColor }) => $bgColor};
  border: 1.5px solid ${({ $borderColor }) => $borderColor};
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px ${({ $borderColor }) => $borderColor}40;
  }
`;

const Icon = styled.span<{ $size: string }>`
  font-size: ${({ $size }) => $size};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.span<{ $color: string; $fontSize: string }>`
  color: ${({ $color }) => $color};
  font-size: ${({ $fontSize }) => $fontSize};
  font-weight: 600;
`;

const Score = styled.span<{ $color: string; $fontSize: string }>`
  color: ${({ $color }) => $color};
  font-size: ${({ $fontSize }) => $fontSize};
  font-weight: 700;
  opacity: 0.8;
`;

export const ReputationBadge = ({
  score,
  showScore = false,
  size = 'medium',
}: ReputationBadgeProps) => {
  const config = getBadgeConfig(score);
  const sizeStyles = getSizeStyles(size);
  const IconComponent = config.Icon;

  // Get icon size based on badge size
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <BadgeContainer
      $bgColor={config.bgColor}
      $borderColor={config.borderColor}
      $padding={sizeStyles.padding}
      $gap={sizeStyles.gap}
      title={`${config.label} - ${score} puntos de reputación`}
    >
      <Icon $size={sizeStyles.iconSize}><IconComponent size={iconSize} color={config.color} /></Icon>
      <Label $color={config.color} $fontSize={sizeStyles.fontSize}>
        {config.label}
      </Label>
      {showScore && (
        <Score $color={config.color} $fontSize={sizeStyles.fontSize}>
          ({score})
        </Score>
      )}
    </BadgeContainer>
  );
};

/**
 * Helper function to get badge level from score
 */
export const getBadgeLevel = (score: number): ReputationLevel => {
  return getBadgeConfig(score).level;
};

/**
 * Helper function to get badge label from score
 */
export const getBadgeLabel = (score: number): string => {
  return getBadgeConfig(score).label;
};

export default ReputationBadge;
