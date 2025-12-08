/**
 * PromotionBadge Component
 *
 * Small badge to display promotion info on product cards.
 * Shows different styles based on promotion type and verification status.
 */

import styled from 'styled-components';
import { FiPercent, FiTag, FiGift, FiAlertCircle } from 'react-icons/fi';
import type { ProductPromotion, PromotionType } from '@/types/promotion';
import {
  calculateEffectiveDiscount,
  getPromotionShortDescription,
} from '@/types/promotion';

// =====================================================
// STYLED COMPONENTS
// =====================================================

const BadgeContainer = styled.div<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme, $verified }) =>
    $verified
      ? theme.colors.semantic.success.main
      : theme.colors.semantic.warning.main};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    flex-shrink: 0;
  }
`;

const BadgeText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnverifiedIcon = styled(FiAlertCircle)`
  color: rgba(255, 255, 255, 0.8);
`;

// Larger badge for product detail
const LargeBadgeContainer = styled.div<{ $verified: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ $verified }) =>
    $verified
      ? '#E8F5E9'
      : '#FFF8E1'};
  border: 1px solid ${({ $verified }) =>
    $verified
      ? '#A5D6A7'
      : '#FFE082'};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const LargeBadgeIcon = styled.div<{ $verified: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ theme, $verified }) =>
    $verified
      ? theme.colors.semantic.success.main
      : theme.colors.semantic.warning.main};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const LargeBadgeContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LargeBadgeTitle = styled.div<{ $verified: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $verified }) =>
    $verified
      ? '#2E7D32'
      : '#E65100'};
`;

const LargeBadgeSubtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const LargeBadgeWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: #F57C00;
  margin-top: ${({ theme }) => theme.spacing[1]};

  svg {
    flex-shrink: 0;
  }
`;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getPromotionIcon(type: PromotionType): React.ReactNode {
  switch (type) {
    case 'percentage':
    case 'fixed_amount':
      return <FiPercent size={12} />;
    case 'buy_x_get_y':
    case 'bulk_price':
      return <FiTag size={12} />;
    case 'bundle_free':
    case 'coupon':
    case 'loyalty':
      return <FiGift size={12} />;
    default:
      return <FiPercent size={12} />;
  }
}

function getLargeIcon(type: PromotionType): React.ReactNode {
  switch (type) {
    case 'percentage':
    case 'fixed_amount':
      return <FiPercent size={18} />;
    case 'buy_x_get_y':
    case 'bulk_price':
      return <FiTag size={18} />;
    case 'bundle_free':
    case 'coupon':
    case 'loyalty':
      return <FiGift size={18} />;
    default:
      return <FiPercent size={18} />;
  }
}

// =====================================================
// COMPONENTS
// =====================================================

interface PromotionBadgeProps {
  promotion: ProductPromotion;
  className?: string;
}

/**
 * Small badge for product cards
 */
export const PromotionBadge: React.FC<PromotionBadgeProps> = ({
  promotion,
  className,
}) => {
  const isVerified = promotion.status === 'verified';
  const discount = calculateEffectiveDiscount(promotion);

  return (
    <BadgeContainer $verified={isVerified} className={className}>
      {getPromotionIcon(promotion.promotion_type)}
      <BadgeText>{discount?.label || getPromotionShortDescription(promotion)}</BadgeText>
      {!isVerified && <UnverifiedIcon size={10} />}
    </BadgeContainer>
  );
};

/**
 * Larger badge for product detail page
 */
export const PromotionBadgeLarge: React.FC<PromotionBadgeProps> = ({
  promotion,
  className,
}) => {
  const isVerified = promotion.status === 'verified';
  const description = getPromotionShortDescription(promotion);

  return (
    <LargeBadgeContainer $verified={isVerified} className={className}>
      <LargeBadgeIcon $verified={isVerified}>
        {getLargeIcon(promotion.promotion_type)}
      </LargeBadgeIcon>
      <LargeBadgeContent>
        <LargeBadgeTitle $verified={isVerified}>
          {promotion.name || description}
        </LargeBadgeTitle>
        {promotion.store_name && (
          <LargeBadgeSubtitle>
            en {promotion.store_name}
          </LargeBadgeSubtitle>
        )}
        {!isVerified && (
          <LargeBadgeWarning>
            <FiAlertCircle size={12} />
            <span>Promoción sin verificar</span>
          </LargeBadgeWarning>
        )}
      </LargeBadgeContent>
    </LargeBadgeContainer>
  );
};

// =====================================================
// PROMOTIONS LIST
// =====================================================

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ListTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

interface PromotionListProps {
  promotions: ProductPromotion[];
  title?: string;
  className?: string;
}

/**
 * List of promotion badges for product detail
 */
export const PromotionList: React.FC<PromotionListProps> = ({
  promotions,
  title = 'Promociones Disponibles',
  className,
}) => {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <ListContainer className={className}>
      <ListTitle>{title}</ListTitle>
      {promotions.map((promo) => (
        <PromotionBadgeLarge key={promo.id} promotion={promo} />
      ))}
    </ListContainer>
  );
};

export default PromotionBadge;
