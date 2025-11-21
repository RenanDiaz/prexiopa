/**
 * StoreCard Component
 *
 * Card component to display store/supermarket information.
 * Shows logo, name, location count, and quick actions.
 *
 * @example
 * ```tsx
 * <StoreCard
 *   store={storeData}
 *   onClick={() => navigate(`/stores/${store.id}`)}
 * />
 * ```
 */

import React from 'react';
import { FiMapPin, FiGlobe, FiPhone, FiChevronRight } from 'react-icons/fi';
import type { Store } from '@/types/store.types';
import * as S from './StoreCard.styles';

export interface StoreCardProps {
  /** Store data */
  store: Store;
  /** Click handler */
  onClick?: () => void;
  /** Show detailed info */
  variant?: 'default' | 'compact';
  /** Additional className */
  className?: string;
}

/**
 * StoreCard Component
 */
export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onClick,
  variant = 'default',
  className,
}) => {
  const locationCount = store.locations?.length || 0;
  const activeLocations = store.locations?.filter((loc) => loc.isActive).length || 0;

  return (
    <S.Card onClick={onClick} $clickable={!!onClick} className={className}>
      {/* Store Logo */}
      <S.LogoWrapper>
        {store.logo ? (
          <S.Logo src={store.logo} alt={store.name} loading="lazy" />
        ) : (
          <S.LogoPlaceholder>
            <FiMapPin />
          </S.LogoPlaceholder>
        )}
      </S.LogoWrapper>

      {/* Store Info */}
      <S.Content>
        <S.Header>
          <S.Name>{store.name}</S.Name>
          {locationCount > 0 && (
            <S.LocationBadge>
              <FiMapPin />
              {activeLocations} {activeLocations === 1 ? 'sucursal' : 'sucursales'}
            </S.LocationBadge>
          )}
        </S.Header>

        {variant === 'default' && store.description && (
          <S.Description>{store.description}</S.Description>
        )}

        {/* Contact Info */}
        {variant === 'default' && (
          <S.ContactInfo>
            {store.website && (
              <S.ContactItem
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <FiGlobe />
                <span>Sitio web</span>
              </S.ContactItem>
            )}
            {store.phone && (
              <S.ContactItem
                href={`tel:${store.phone}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FiPhone />
                <span>{store.phone}</span>
              </S.ContactItem>
            )}
          </S.ContactInfo>
        )}

        {/* Products Count (if available) */}
        {store.totalProducts !== undefined && store.totalProducts > 0 && (
          <S.Stats>
            <S.StatItem>
              <S.StatValue>{store.totalProducts}</S.StatValue>
              <S.StatLabel>productos</S.StatLabel>
            </S.StatItem>
          </S.Stats>
        )}
      </S.Content>

      {/* Arrow Icon */}
      {onClick && (
        <S.ArrowIcon>
          <FiChevronRight />
        </S.ArrowIcon>
      )}
    </S.Card>
  );
};

export default StoreCard;
