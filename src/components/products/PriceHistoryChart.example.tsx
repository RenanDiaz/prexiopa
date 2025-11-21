/**
 * PriceHistoryChart Usage Examples
 *
 * This file demonstrates various ways to use the PriceHistoryChart component
 * in different scenarios and configurations.
 */

import React from 'react';
import { PriceHistoryChart } from './PriceHistoryChart';

/**
 * Example 1: Basic usage
 * Simplest implementation with just the product ID
 */
export const BasicExample: React.FC = () => {
  return (
    <div>
      <h2>Basic Price History Chart</h2>
      <PriceHistoryChart productId="550e8400-e29b-41d4-a716-446655440000" />
    </div>
  );
};

/**
 * Example 2: Custom height
 * Chart with custom height for better visibility
 */
export const CustomHeightExample: React.FC = () => {
  return (
    <div>
      <h2>Chart with Custom Height</h2>
      <PriceHistoryChart
        productId="550e8400-e29b-41d4-a716-446655440000"
        height={500}
      />
    </div>
  );
};

/**
 * Example 3: Different date ranges
 * Multiple charts showing different time periods
 */
export const DateRangeExample: React.FC = () => {
  const productId = "550e8400-e29b-41d4-a716-446655440000";

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h3>Last 7 Days</h3>
        <PriceHistoryChart productId={productId} dateRange="7d" />
      </div>

      <div>
        <h3>Last 30 Days</h3>
        <PriceHistoryChart productId={productId} dateRange="30d" />
      </div>

      <div>
        <h3>Last 90 Days</h3>
        <PriceHistoryChart productId={productId} dateRange="90d" />
      </div>

      <div>
        <h3>All Time</h3>
        <PriceHistoryChart productId={productId} dateRange="all" />
      </div>
    </div>
  );
};

/**
 * Example 4: Without legend
 * Chart with legend disabled (useful for single store view)
 */
export const NoLegendExample: React.FC = () => {
  return (
    <div>
      <h2>Chart Without Legend</h2>
      <PriceHistoryChart
        productId="550e8400-e29b-41d4-a716-446655440000"
        showLegend={false}
      />
    </div>
  );
};

/**
 * Example 5: In a Product Detail Page
 * Real-world usage in a product detail context
 */
export const ProductDetailExample: React.FC = () => {
  const product = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Arroz Induarroz 500g',
    brand: 'Induarroz',
    category: 'Granos',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Product Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1>{product.name}</h1>
        <p style={{ color: '#616161' }}>
          {product.brand} - {product.category}
        </p>
      </div>

      {/* Price History Chart */}
      <div style={{ marginBottom: '32px' }}>
        <PriceHistoryChart
          productId={product.id}
          dateRange="30d"
          height={400}
        />
      </div>

      {/* Other product details... */}
    </div>
  );
};

/**
 * Example 6: Side-by-side comparison
 * Compare price history of multiple products
 */
export const ComparisonExample: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '24px',
    }}>
      <div>
        <h3>Producto A</h3>
        <PriceHistoryChart
          productId="550e8400-e29b-41d4-a716-446655440001"
          height={350}
        />
      </div>

      <div>
        <h3>Producto B</h3>
        <PriceHistoryChart
          productId="550e8400-e29b-41d4-a716-446655440002"
          height={350}
        />
      </div>
    </div>
  );
};

/**
 * Example 7: Responsive layout
 * Chart that adapts to different screen sizes
 */
export const ResponsiveExample: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      <h2>Responsive Price History</h2>
      <p style={{ color: '#616161', marginBottom: '16px' }}>
        Resize your browser window to see the chart adapt
      </p>

      <PriceHistoryChart
        productId="550e8400-e29b-41d4-a716-446655440000"
        dateRange="30d"
      />
    </div>
  );
};

/**
 * Example 8: With custom className
 * Adding custom styling via className
 */
export const CustomStyledExample: React.FC = () => {
  return (
    <div>
      <h2>Custom Styled Chart</h2>
      <PriceHistoryChart
        productId="550e8400-e29b-41d4-a716-446655440000"
        className="custom-price-chart"
        dateRange="30d"
      />

      <style>{`
        .custom-price-chart {
          border: 2px solid #00C853;
          box-shadow: 0 8px 16px rgba(0, 200, 83, 0.15);
        }
      `}</style>
    </div>
  );
};

/**
 * Example 9: In a dashboard widget
 * Compact chart for dashboard views
 */
export const DashboardWidgetExample: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '16px',
      padding: '16px',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <h4 style={{ marginTop: 0 }}>Tendencia de Precios - Producto A</h4>
        <PriceHistoryChart
          productId="550e8400-e29b-41d4-a716-446655440001"
          height={250}
          dateRange="7d"
          showLegend={false}
        />
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <h4 style={{ marginTop: 0 }}>Tendencia de Precios - Producto B</h4>
        <PriceHistoryChart
          productId="550e8400-e29b-41d4-a716-446655440002"
          height={250}
          dateRange="7d"
          showLegend={false}
        />
      </div>
    </div>
  );
};

/**
 * Example 10: All features combined
 * Comprehensive example showing all available props
 */
export const ComprehensiveExample: React.FC = () => {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Price History Analysis</h1>
        <p style={{ color: '#616161' }}>
          Comprehensive view of price trends across all stores
        </p>
      </div>

      <PriceHistoryChart
        productId="550e8400-e29b-41d4-a716-446655440000"
        className="comprehensive-chart"
        height={500}
        showLegend={true}
        dateRange="90d"
        testId="comprehensive-price-chart"
      />

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#F5F5F5',
        borderRadius: '8px',
      }}>
        <h3 style={{ marginTop: 0 }}>Chart Features:</h3>
        <ul style={{ color: '#616161', lineHeight: 1.8 }}>
          <li>Interactive line chart with multiple store data</li>
          <li>Responsive design adapts to all screen sizes</li>
          <li>Date range selector (7d, 30d, 90d, all)</li>
          <li>Detailed tooltip on hover showing exact prices</li>
          <li>Color-coded legend for each store</li>
          <li>Smooth animations and transitions</li>
          <li>Loading skeleton while fetching data</li>
          <li>Empty state for no data scenarios</li>
          <li>Theme-integrated colors and styling</li>
          <li>Accessibility support with ARIA labels</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * All examples component
 * Renders all examples in a single view for testing
 */
export const AllExamples: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: '#FAFAFA' }}>
      <div style={{ marginBottom: '48px' }}>
        <BasicExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <CustomHeightExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <NoLegendExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <ProductDetailExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <ResponsiveExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <DashboardWidgetExample />
      </div>

      <div style={{ marginBottom: '48px' }}>
        <ComprehensiveExample />
      </div>
    </div>
  );
};

export default AllExamples;
