# Product Components

Professional product display components for Prexiopa. Optimized for price comparison and mobile-first responsive design.

## Components

### ProductCard

A feature-rich card component for displaying individual products with pricing information.

#### Features

- Product image with fallback handling
- Animated favorite toggle (heart icon)
- Discount badge for promotional pricing
- Best price highlighting with store information
- Hover effects and smooth transitions
- Click-to-navigate to product details
- Skeleton loading state
- Fully accessible (ARIA labels, keyboard navigation)
- Mobile-optimized touch targets

#### Props

```typescript
interface ProductCardProps {
  product: Product;                           // Product data
  bestPrice?: StorePriceComparison;          // Lowest price information
  onFavoriteToggle?: (productId: string) => void;  // Favorite callback
  isFavorite?: boolean;                      // Is product favorited
  variant?: 'default' | 'compact';           // Card size variant
  className?: string;                        // Additional CSS class
  testId?: string;                           // Test ID for testing
}
```

#### Usage Examples

```tsx
// Basic product card
<ProductCard
  product={product}
  bestPrice={priceData}
/>

// With favorite functionality
<ProductCard
  product={product}
  bestPrice={priceData}
  isFavorite={isInFavorites}
  onFavoriteToggle={handleToggleFavorite}
/>

// Compact variant
<ProductCard
  product={product}
  variant="compact"
/>

// Skeleton loading state
<ProductCardSkeleton />
```

#### Visual Structure

```
┌─────────────────────────────┐
│  ❤ [Image]     [-25% OFF]   │  ← Favorite & Discount
│                              │
│  CATEGORIA                   │  ← Category
│  Nombre del Producto         │  ← Product Name
│  por Marca                   │  ← Brand
│                              │
│  ┌──────────────────────┐   │
│  │ 🏆 Mejor Precio      │   │  ← Best Price Badge
│  │ $12.99 → $9.99       │   │  ← Price (with discount)
│  │ 📍 en Super Rey      │   │  ← Store
│  └──────────────────────┘   │
│                              │
│  [Ver Detalles →]           │  ← CTA Button
└─────────────────────────────┘
```

#### Interactions

1. **Click Card/Image**: Navigate to product detail page
2. **Click Heart**: Toggle favorite status with animation
3. **Click "Ver Detalles"**: Navigate to product detail page
4. **Hover Card**: Subtle lift effect
5. **Hover Heart**: Color change and scale

---

### ProductGrid

Responsive grid layout for displaying multiple product cards with loading and empty states.

#### Features

- Responsive columns (1 mobile → 4 desktop)
- Skeleton loading states
- Empty state with custom messaging
- Consistent spacing from theme
- Performance optimized
- Automatic favorite management
- Custom empty state actions

#### Props

```typescript
interface ProductGridProps {
  products: Product[];                       // Products to display
  bestPrices?: Record<string, StorePriceComparison>;  // Price map by product ID
  favorites?: Set<string>;                   // Set of favorited IDs
  onFavoriteToggle?: (productId: string) => void;  // Favorite callback
  loading?: boolean;                         // Show loading state
  skeletonCount?: number;                    // Number of skeletons (default: 8)
  emptyMessage?: string;                     // Empty state message
  emptyTitle?: string;                       // Empty state title
  emptyAction?: string;                      // Empty action label
  onEmptyAction?: () => void;                // Empty action callback
  variant?: 'default' | 'compact';           // Card variant
  className?: string;                        // Additional CSS class
  testId?: string;                           // Test ID
}
```

#### Usage Examples

```tsx
// Basic grid
<ProductGrid
  products={products}
  bestPrices={pricesMap}
  loading={isLoading}
/>

// With favorites
<ProductGrid
  products={products}
  bestPrices={pricesMap}
  favorites={new Set(favoriteIds)}
  onFavoriteToggle={handleToggle}
/>

// Custom empty state
<ProductGrid
  products={[]}
  emptyTitle="No encontramos nada"
  emptyMessage="Intenta con otros términos"
  emptyAction="Explorar todo"
  onEmptyAction={() => navigate('/products')}
/>

// Loading state
<ProductGrid
  products={[]}
  loading={true}
  skeletonCount={6}
/>
```

#### Responsive Breakpoints

```
Mobile (<640px):        1 column
Tablet (640-1024px):    2 columns
Desktop (1024-1440px):  3 columns
Large (>1440px):        4 columns
```

---

## Complete Integration Example

```tsx
import React, { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/products';
import { Product, StorePriceComparison } from '@/types';
import { fetchProducts, fetchBestPrices } from '@/services/api';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestPrices, setBestPrices] = useState<Record<string, StorePriceComparison>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts();
      const pricesData = await fetchBestPrices(productsData.map(p => p.id));

      setProducts(productsData);
      setBestPrices(pricesData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        // Call API to remove favorite
      } else {
        newFavorites.add(productId);
        // Call API to add favorite
      }
      return newFavorites;
    });
  };

  const handleExploreAll = () => {
    // Navigate to browse page
  };

  return (
    <div className="container">
      <h1>Productos Destacados</h1>

      <ProductGrid
        products={products}
        bestPrices={bestPrices}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
        loading={loading}
        emptyTitle="No hay productos disponibles"
        emptyMessage="Intenta más tarde o explora otras categorías"
        emptyAction="Ver todas las categorías"
        onEmptyAction={handleExploreAll}
      />
    </div>
  );
};
```

---

## Styling & Theming

All components use styled-components and integrate with the Prexiopa theme system.

### Key Theme Tokens Used

```typescript
// Colors
colors.functional.bestPrice.light    // Best price background
colors.functional.bestPrice.dark     // Best price text
colors.functional.favorite.main      // Favorite heart color
colors.functional.discount.main      // Discount badge

// Typography
typography.variants.price            // Price display font
typography.variants.priceSmall       // Secondary prices

// Spacing
spacing.layout.gapMd                 // Grid gaps
spacing.component.paddingMd          // Card padding

// Shadows
shadows.card                         // Card elevation
shadows.cardHover                    // Hover elevation

// Border Radius
borderRadius.card                    // Card corners
borderRadius.md                      // Image corners
```

### Custom Animations

```typescript
// Heart pulse on favorite toggle
heartPulse: 0.6s ease-in-out

// Card hover lift
transform: translateY(-4px)

// Shimmer loading effect
shimmer: 1.5s linear infinite
```

---

## Accessibility

Both components are fully accessible:

- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Focus states with visible outlines
- ✅ Semantic HTML structure
- ✅ Alt text for images
- ✅ Touch targets >44px on mobile
- ✅ Color contrast WCAG AA compliant

---

## Performance

- Image lazy loading
- Skeleton states prevent layout shift
- Minimal re-renders with React.memo (if needed)
- CSS-only animations (no JS)
- Optimized grid with CSS Grid

---

## Testing

```tsx
// Test IDs available
data-testid="product-card"
data-testid="product-card-skeleton"
data-testid="product-grid"
data-testid="product-grid-loading"
data-testid="product-grid-empty"
```

---

## Future Enhancements

- [ ] Compare mode (select multiple products)
- [ ] Quick view modal
- [ ] Share product
- [ ] Add to shopping list
- [ ] Price history sparkline chart
- [ ] Image carousel for multiple images
- [ ] Video support
- [ ] Wishlist collections

---

## Support

For questions or issues with these components, contact the Prexiopa development team.
