/**
 * ProductCard Example Usage
 *
 * This file demonstrates how to use ProductCard and ProductGrid components
 * with mock data. You can use this as a reference or copy into your pages.
 *
 * To use this example:
 * 1. Import this component into any page
 * 2. Replace mock data with real API data
 * 3. Connect to your state management for favorites
 */

import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import type { Product } from '@/types/product.types';
import { ProductCategory } from '@/types/product.types';
import type { StorePriceComparison } from '@/types/price.types';

// Mock Product Data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Arroz Integral Premium 5 libras',
    description: 'Arroz integral de alta calidad, rico en fibra',
    brand: 'La Preferida',
    category: ProductCategory.ALIMENTOS,
    barcode: '7501234567890',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Arroz+Integral',
        alt: 'Arroz Integral Premium',
        isPrimary: true,
      },
    ],
    unit: 'lb',
    unitQuantity: 5,
    tags: ['arroz', 'integral', 'saludable', 'fibra'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Aceite de Oliva Extra Virgen 1 Litro',
    description: 'Aceite de oliva extra virgen primera presión en frío',
    brand: 'Carbonell',
    category: ProductCategory.ALIMENTOS,
    barcode: '8410030760139',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Aceite+Oliva',
        alt: 'Aceite de Oliva Extra Virgen',
        isPrimary: true,
      },
    ],
    unit: 'l',
    unitQuantity: 1,
    tags: ['aceite', 'oliva', 'extra virgen', 'cocina'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'Detergente Líquido Concentrado 2 Litros',
    description: 'Detergente líquido para ropa, fórmula concentrada',
    brand: 'Ariel',
    category: ProductCategory.LIMPIEZA,
    barcode: '8001841304496',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Detergente',
        alt: 'Detergente Líquido Ariel',
        isPrimary: true,
      },
    ],
    unit: 'l',
    unitQuantity: 2,
    tags: ['detergente', 'ropa', 'limpieza', 'concentrado'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    name: 'Leche Entera Pasteurizada 1 Galón',
    description: 'Leche entera pasteurizada, rica en calcio',
    brand: 'MELO',
    category: ProductCategory.LACTEOS,
    barcode: '7501234567891',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Leche+Melo',
        alt: 'Leche Melo Entera',
        isPrimary: true,
      },
    ],
    unit: 'gal',
    unitQuantity: 1,
    tags: ['leche', 'lacteos', 'calcio', 'pasteurizada'],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    name: 'Pan Integral con Semillas 20 oz',
    description: 'Pan integral con semillas de girasol, linaza y ajonjolí',
    brand: 'Bimbo',
    category: ProductCategory.PANADERIA,
    barcode: '7501234567892',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Pan+Integral',
        alt: 'Pan Integral Bimbo',
        isPrimary: true,
      },
    ],
    unit: 'oz',
    unitQuantity: 20,
    tags: ['pan', 'integral', 'semillas', 'saludable'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    name: 'Pasta de Dientes Whitening 150ml',
    description: 'Pasta dental blanqueadora con flúor',
    brand: 'Colgate',
    category: ProductCategory.CUIDADO_PERSONAL,
    barcode: '7501234567893',
    images: [
      {
        url: 'https://via.placeholder.com/300x300?text=Colgate',
        alt: 'Colgate Whitening',
        isPrimary: true,
      },
    ],
    unit: 'ml',
    unitQuantity: 150,
    tags: ['pasta dental', 'blanqueadora', 'higiene', 'flúor'],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-20'),
  },
];

// Mock Best Prices
const mockBestPrices: Record<string, StorePriceComparison> = {
  '1': {
    storeId: 'rey',
    storeName: 'Super Rey',
    storeLogo: '/logos/super-rey.png',
    price: 8.99,
    discountPrice: 6.99,
    discountPercentage: 22.2,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
  '2': {
    storeId: 'riba',
    storeName: 'Riba Smith',
    storeLogo: '/logos/riba-smith.png',
    price: 12.50,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
  '3': {
    storeId: 'machetazo',
    storeName: 'El Machetazo',
    storeLogo: '/logos/machetazo.png',
    price: 9.99,
    discountPrice: 7.49,
    discountPercentage: 25,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
  '4': {
    storeId: 'xtra',
    storeName: 'Xtra',
    storeLogo: '/logos/xtra.png',
    price: 5.99,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
  '5': {
    storeId: 'ninety-nine',
    storeName: '99',
    storeLogo: '/logos/99.png',
    price: 3.49,
    discountPrice: 2.99,
    discountPercentage: 14.3,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
  '6': {
    storeId: 'farmacias-metro',
    storeName: 'Farmacias Metro',
    storeLogo: '/logos/farmacias-metro.png',
    price: 4.25,
    isAvailable: true,
    lastUpdated: new Date(),
    differenceFromLowest: 0,
    percentageDifferenceFromLowest: 0,
  },
};

/**
 * Example Component demonstrating ProductGrid usage
 */
export const ProductGridExample: React.FC = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3']));
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleEmptyAction = () => {
    console.log('Navigate to search or browse products');
  };

  // Simulate loading state
  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Productos Destacados
        </h1>
        <p style={{ fontSize: '16px', color: '#616161', marginBottom: '16px' }}>
          Los mejores precios en tus productos favoritos
        </p>
        <button
          onClick={toggleLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#00C853',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Cargando...' : 'Simular Carga'}
        </button>
      </div>

      <ProductGrid
        products={mockProducts}
        bestPrices={mockBestPrices}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
        loading={loading}
        skeletonCount={6}
        emptyMessage="No encontramos productos que coincidan con tu búsqueda"
        emptyTitle="No hay productos disponibles"
        emptyAction="Explorar todos los productos"
        onEmptyAction={handleEmptyAction}
      />

      {/* Stats */}
      <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#F5F5F5', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Estado de Favoritos
        </h3>
        <p style={{ fontSize: '14px', color: '#616161' }}>
          Tienes {favorites.size} producto{favorites.size !== 1 ? 's' : ''} favorito{favorites.size !== 1 ? 's' : ''}
        </p>
        <div style={{ marginTop: '12px' }}>
          {Array.from(favorites).map(id => {
            const product = mockProducts.find(p => p.id === id);
            return (
              <div
                key={id}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  marginTop: '8px',
                }}
              >
                {product?.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductGridExample;
