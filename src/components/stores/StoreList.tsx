/**
 * StoreList Component
 *
 * Displays a list of stores with loading, error, and empty states.
 * Supports grid and list layouts.
 *
 * @example
 * ```tsx
 * <StoreList
 *   onStoreClick={(store) => navigate(`/stores/${store.id}`)}
 * />
 * ```
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { useStoresQuery } from '@/hooks/useStores';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { StoreCard } from './StoreCard';
import type { Store } from '@/types/store.types';
import * as S from './StoreList.styles';

export interface StoreListProps {
  /** Callback when store is clicked */
  onStoreClick?: (store: Store) => void;
  /** Layout variant */
  layout?: 'grid' | 'list';
  /** Show only featured stores */
  featuredOnly?: boolean;
  /** Maximum number of stores to show */
  limit?: number;
  /** Additional className */
  className?: string;
}

/**
 * StoreList Component
 */
export const StoreList: React.FC<StoreListProps> = ({
  onStoreClick,
  layout = 'grid',
  featuredOnly = false,
  limit,
  className,
}) => {
  const navigate = useNavigate();
  const { data: stores = [], isLoading, error } = useStoresQuery();

  // Handle store click
  const handleStoreClick = (store: Store) => {
    if (onStoreClick) {
      onStoreClick(store);
    } else {
      navigate(`/stores/${store.id}`);
    }
  };

  // Filter and limit stores
  let filteredStores = stores;
  if (featuredOnly) {
    // Filter by stores with most locations (featured)
    filteredStores = stores
      .filter((store) => store.locations && store.locations.length > 3)
      .sort((a, b) => (b.locations?.length || 0) - (a.locations?.length || 0));
  }
  if (limit) {
    filteredStores = filteredStores.slice(0, limit);
  }

  // Loading state
  if (isLoading) {
    return (
      <S.Container className={className}>
        <S.LoadingWrapper>
          <LoadingSpinner size="lg" />
          <S.LoadingText>Cargando tiendas...</S.LoadingText>
        </S.LoadingWrapper>
      </S.Container>
    );
  }

  // Error state
  if (error) {
    return (
      <S.Container className={className}>
        <EmptyState
          icon={FiMapPin}
          title="Error al cargar tiendas"
          message={error.message || 'Ocurrió un error al cargar las tiendas'}
        />
      </S.Container>
    );
  }

  // Empty state
  if (filteredStores.length === 0) {
    return (
      <S.Container className={className}>
        <EmptyState
          icon={FiMapPin}
          title="No hay tiendas disponibles"
          message={
            featuredOnly
              ? 'No hay tiendas destacadas en este momento'
              : 'No encontramos tiendas disponibles'
          }
        />
      </S.Container>
    );
  }

  return (
    <S.Container className={className}>
      <S.Grid $layout={layout}>
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onClick={() => handleStoreClick(store)}
            variant={layout === 'list' ? 'default' : 'compact'}
          />
        ))}
      </S.Grid>
    </S.Container>
  );
};

export default StoreList;
