# PriceHistoryChart Component

A production-ready React component for displaying price history over time using Recharts. Built for the Prexiopa price comparison platform.

## Overview

The `PriceHistoryChart` component visualizes price changes across different stores over time using an interactive line chart. It features responsive design, multiple date range options, and seamless integration with Prexiopa's design system.

## Features

- **Multiple Store Lines**: Display price trends for multiple stores simultaneously
- **Interactive Tooltip**: Hover to see exact prices and dates
- **Date Range Selector**: Choose between 7d, 30d, 90d, or all-time views
- **Responsive Design**: Adapts perfectly to mobile, tablet, and desktop screens
- **Loading States**: Beautiful skeleton loader while data is fetching
- **Empty States**: Graceful handling when no data is available
- **Error Handling**: User-friendly error messages
- **Theme Integration**: Uses Prexiopa's color palette and design tokens
- **Accessibility**: ARIA labels and keyboard navigation support
- **TypeScript**: Full type safety with comprehensive interfaces

## Installation

The component is already integrated with the project dependencies:

```bash
npm install recharts date-fns @tanstack/react-query
```

## Basic Usage

```tsx
import { PriceHistoryChart } from '@/components/products';

function ProductPage() {
  return (
    <PriceHistoryChart productId="550e8400-e29b-41d4-a716-446655440000" />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `productId` | `string` | **required** | Product ID to fetch price history for |
| `className` | `string` | `undefined` | Additional CSS class name |
| `height` | `number` | `400` | Chart height in pixels |
| `showLegend` | `boolean` | `true` | Show/hide the legend |
| `dateRange` | `'7d' \| '30d' \| '90d' \| 'all'` | `'30d'` | Initial date range |
| `testId` | `string` | `'price-history-chart'` | Test ID for testing |

## Examples

### Basic Example

```tsx
<PriceHistoryChart productId="product-uuid" />
```

### Custom Height

```tsx
<PriceHistoryChart
  productId="product-uuid"
  height={500}
/>
```

### Different Date Range

```tsx
<PriceHistoryChart
  productId="product-uuid"
  dateRange="90d"
/>
```

### Without Legend

```tsx
<PriceHistoryChart
  productId="product-uuid"
  showLegend={false}
/>
```

### In Product Detail Page

```tsx
import { PriceHistoryChart, PriceComparison } from '@/components/products';

function ProductDetail({ productId }: { productId: string }) {
  return (
    <div>
      <h1>Product Details</h1>

      {/* Price History Chart */}
      <section>
        <PriceHistoryChart
          productId={productId}
          dateRange="30d"
          height={400}
        />
      </section>

      {/* Price Comparison Table */}
      <section>
        <PriceComparison prices={prices} />
      </section>
    </div>
  );
}
```

### Dashboard Widget

```tsx
<PriceHistoryChart
  productId="product-uuid"
  height={250}
  dateRange="7d"
  showLegend={false}
/>
```

### Side-by-Side Comparison

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
  <PriceHistoryChart
    productId="product-a"
    height={350}
  />
  <PriceHistoryChart
    productId="product-b"
    height={350}
  />
</div>
```

## Data Format

The component fetches data from the `priceService.getPriceHistory()` API which returns:

```typescript
interface PriceHistory {
  productId: string;
  storeId: string;
  prices: PriceHistoryPoint[];
  period: HistoryPeriod;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  currentPrice: number;
}

interface PriceHistoryPoint {
  price: number;
  discountPrice?: number;
  date: Date;
  isAvailable: boolean;
}
```

## Styling

The component uses styled-components and integrates with Prexiopa's theme:

### Theme Colors Used

- **Primary Green** (`#00C853`): Main store line color
- **Secondary Turquoise** (`#00BCD4`): Alternative store line
- **Semantic Colors**: Blue, Orange, Pink for additional stores
- **Neutral Grays**: Text, borders, backgrounds

### Custom Styling

Add custom styles via `className`:

```tsx
<PriceHistoryChart
  productId="product-uuid"
  className="my-custom-chart"
/>
```

```css
.my-custom-chart {
  border: 2px solid #00C853;
  box-shadow: 0 8px 16px rgba(0, 200, 83, 0.15);
}
```

## Responsive Behavior

| Breakpoint | Height | Features |
|------------|--------|----------|
| Mobile (<640px) | 75% of desktop | Compact date buttons, smaller fonts |
| Tablet (640-1024px) | 100% of desktop | Full features |
| Desktop (>1024px) | As specified | All features enabled |

## Component States

### Loading State
- Shows animated skeleton with 8 bars
- Maintains layout structure
- Shimmer animation effect

### Error State
- Displays error icon and message
- Retry button (if applicable)
- Maintains component height

### Empty State
- Shows "No data available" message
- Informative icon
- Helpful description

### Success State
- Interactive line chart
- Hoverable tooltips
- Clickable date range buttons

## Accessibility

The component follows WCAG 2.1 guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Visible focus states
- **Semantic HTML**: Proper heading structure

## Performance

- **Lazy Loading**: Chart renders only when visible
- **Memoization**: Expensive calculations are memoized
- **Query Caching**: React Query caches API responses (5 min stale time)
- **Optimized Re-renders**: Uses React.memo and useMemo
- **Bundle Size**: ~45KB (with Recharts included)

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { PriceHistoryChart } from './PriceHistoryChart';

test('renders chart with product id', () => {
  render(<PriceHistoryChart productId="test-id" />);
  expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
test('fetches and displays price history', async () => {
  render(<PriceHistoryChart productId="test-id" />);

  await waitFor(() => {
    expect(screen.getByText('Historial de precios')).toBeInTheDocument();
  });
});
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- **recharts**: ^3.4.1 (Chart library)
- **date-fns**: ^4.1.0 (Date formatting)
- **@tanstack/react-query**: ^5.90.10 (Data fetching)
- **styled-components**: ^6.1.19 (Styling)
- **react-icons**: ^5.5.0 (Icons)

## File Structure

```
src/components/products/
├── PriceHistoryChart.tsx           # Main component
├── PriceHistoryChart.styles.ts     # Styled components
├── PriceHistoryChart.example.tsx   # Usage examples
├── PriceHistoryChart.README.md     # This file
└── index.ts                        # Barrel export
```

## Related Components

- **PriceComparison**: Shows current prices across stores
- **ProductCard**: Displays product with lowest price
- **ProductList**: Grid of product cards

## API Integration

The component uses the `priceService` to fetch data:

```typescript
// Service call
const response = await priceService.getPriceHistory({
  productId,
  period: dateRange,
});
```

## Troubleshooting

### Chart not rendering
- Verify `productId` is valid
- Check API endpoint is accessible
- Ensure React Query is configured

### No data displayed
- Check if price history exists for the product
- Verify date range has data
- Check network tab for API errors

### Styling issues
- Ensure ThemeProvider wraps the app
- Verify theme tokens are defined
- Check for CSS conflicts

### Performance issues
- Reduce chart height for mobile
- Limit date range for large datasets
- Enable query caching

## Future Enhancements

- [ ] Export chart as image/PDF
- [ ] Compare multiple products
- [ ] Price alerts integration
- [ ] Zoom and pan functionality
- [ ] More chart types (bar, area)
- [ ] Custom color selection
- [ ] Print-friendly version

## Contributing

When contributing to this component:

1. Maintain TypeScript type safety
2. Follow existing code patterns
3. Add tests for new features
4. Update this README
5. Ensure accessibility standards
6. Test on multiple screen sizes

## License

Part of the Prexiopa project. See main project LICENSE file.

## Support

For issues or questions:
- Check examples in `PriceHistoryChart.example.tsx`
- Review component props and types
- Contact the development team

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Author**: Prexiopa Development Team
