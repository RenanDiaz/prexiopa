/**
 * PriceHistoryChart Component
 *
 * Displays a line chart showing price history over time for multiple stores.
 * Uses Recharts library with responsive design and theme integration.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PriceHistoryChart productId="product-uuid" />
 *
 * // With custom settings
 * <PriceHistoryChart
 *   productId="product-uuid"
 *   dateRange="90d"
 *   height={500}
 *   showLegend={true}
 * />
 * ```
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiAlertCircle } from 'react-icons/fi';
import { priceService } from '@/services/priceService';
import { HistoryPeriod } from '@/types/price.types';
import { EmptyState } from '@/components/common/EmptyState';
import {
  ChartContainer,
  ChartHeader,
  ChartTitle,
  DateRangeSelector,
  DateRangeButton,
  ChartWrapper,
  ChartLoadingSkeleton,
  SkeletonBar,
  TooltipContainer,
  TooltipLabel,
  TooltipItem,
  TooltipPrice,
  TooltipStoreName,
  LegendContainer,
  LegendItem,
  LegendColor,
  LegendLabel,
} from './PriceHistoryChart.styles';

export interface PriceHistoryChartProps {
  /** Product ID to fetch price history for */
  productId: string;
  /** Additional CSS class name */
  className?: string;
  /** Chart height in pixels (default: 400) */
  height?: number;
  /** Show/hide legend (default: true) */
  showLegend?: boolean;
  /** Date range for price history (default: '30d') */
  dateRange?: '7d' | '30d' | '90d' | 'all';
  /** Test ID for testing */
  testId?: string;
}

/**
 * Chart data format expected by Recharts
 */
interface ChartDataPoint {
  date: string;
  formattedDate: string;
  [storeName: string]: string | number;
}

/**
 * Store color mapping type
 */
interface StoreColors {
  [storeName: string]: string;
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <TooltipContainer>
      <TooltipLabel>{label}</TooltipLabel>
      {payload.map((entry: any, index: number) => (
        <TooltipItem key={`item-${index}`}>
          <TooltipStoreName style={{ color: entry.color }}>
            {entry.name}
          </TooltipStoreName>
          <TooltipPrice>${Number(entry.value).toFixed(2)}</TooltipPrice>
        </TooltipItem>
      ))}
    </TooltipContainer>
  );
};

/**
 * Custom legend component for the chart
 */
const CustomLegend: React.FC<any> = ({ payload }) => {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <LegendContainer>
      {payload.map((entry: any, index: number) => (
        <LegendItem key={`legend-${index}`}>
          <LegendColor style={{ backgroundColor: entry.color }} />
          <LegendLabel>{entry.value}</LegendLabel>
        </LegendItem>
      ))}
    </LegendContainer>
  );
};

/**
 * PriceHistoryChart component for displaying price trends over time
 *
 * Features:
 * - Line chart with multiple store lines
 * - Responsive design (mobile-first)
 * - Date range selector (7d, 30d, 90d, all)
 * - Custom tooltip with price details
 * - Legend with store colors
 * - Loading skeleton state
 * - Empty state handling
 * - Theme-integrated colors
 * - Accessible labels
 *
 * @component
 */
export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  productId,
  className,
  height = 400,
  showLegend = true,
  dateRange: initialDateRange = '30d',
  testId = 'price-history-chart',
}) => {
  const [dateRange, setDateRange] = useState<HistoryPeriod>(
    initialDateRange === '7d'
      ? HistoryPeriod.WEEK
      : initialDateRange === '30d'
      ? HistoryPeriod.MONTH
      : initialDateRange === '90d'
      ? HistoryPeriod.THREE_MONTHS
      : HistoryPeriod.ALL
  );

  /**
   * Fetch price history data from API
   */
  const {
    data: priceHistory,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['priceHistory', productId, dateRange],
    queryFn: async () => {
      const response = await priceService.getPriceHistory({
        productId,
        period: dateRange,
      });
      return response.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Define store colors based on theme
   * Using different colors from the theme palette for each store
   */
  const storeColors: StoreColors = useMemo(() => {
    return {
      // Primary stores - using primary and secondary colors
      'Super 99': '#00C853',
      'El Machetazo': '#00BCD4',
      'Riba Smith': '#2196F3',
      'Super Xtra': '#FF9800',
      'El Rey': '#E91E63',
      'Felipe Motta': '#9C27B0',
      'Metro Plus': '#00ACC1',
      // Additional stores - using semantic colors
      'Romero': '#4CAF50',
      'Xtra': '#FF7043',
      'Pricesmart': '#FBC02D',
      // Default fallback colors
      default1: '#00C853',
      default2: '#00BCD4',
      default3: '#2196F3',
      default4: '#FF9800',
      default5: '#E91E63',
    };
  }, []);

  /**
   * Transform API data to Recharts format
   * Groups prices by date and creates a unified data structure
   */
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!priceHistory) return [];

    // For now, we'll create mock data structure since the API returns single store history
    // In a real scenario, we'd fetch multiple store histories and merge them
    const data: ChartDataPoint[] = [];

    if (priceHistory.prices && priceHistory.prices.length > 0) {
      priceHistory.prices.forEach((point) => {
        const date = new Date(point.date);
        const formattedDate = format(date, 'dd MMM', { locale: es });

        data.push({
          date: date.toISOString(),
          formattedDate,
          [priceHistory.storeId]: point.price,
        });
      });
    }

    return data;
  }, [priceHistory]);

  /**
   * Get unique store names from chart data
   */
  const storeNames = useMemo((): string[] => {
    if (chartData.length === 0) return [];

    const names = new Set<string>();
    chartData.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== 'date' && key !== 'formattedDate') {
          names.add(key);
        }
      });
    });

    return Array.from(names);
  }, [chartData]);

  /**
   * Get color for a store
   */
  const getStoreColor = (storeName: string, index: number): string => {
    return storeColors[storeName] || Object.values(storeColors)[index] || '#00C853';
  };

  /**
   * Handle date range selection
   */
  const handleDateRangeChange = (range: HistoryPeriod) => {
    setDateRange(range);
  };

  /**
   * Format Y-axis tick
   */
  const formatYAxis = (value: number): string => {
    return `$${value.toFixed(0)}`;
  };

  /**
   * Calculate price range for Y-axis domain
   */
  const yAxisDomain = useMemo((): [number, number] => {
    if (chartData.length === 0) return [0, 100];

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    chartData.forEach((point) => {
      storeNames.forEach((storeName) => {
        const price = point[storeName] as number;
        if (typeof price === 'number' && !isNaN(price)) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      });
    });

    // Add padding (10% on each side)
    const padding = (maxPrice - minPrice) * 0.1;
    return [
      Math.max(0, Math.floor(minPrice - padding)),
      Math.ceil(maxPrice + padding),
    ];
  }, [chartData, storeNames]);

  /**
   * Render loading skeleton
   */
  if (isLoading) {
    return (
      <ChartContainer className={className} data-testid={`${testId}-loading`}>
        <ChartHeader>
          <ChartTitle>Historial de precios</ChartTitle>
          <DateRangeSelector>
            <DateRangeButton disabled>7d</DateRangeButton>
            <DateRangeButton disabled>30d</DateRangeButton>
            <DateRangeButton disabled>90d</DateRangeButton>
            <DateRangeButton disabled>Todo</DateRangeButton>
          </DateRangeSelector>
        </ChartHeader>
        <ChartLoadingSkeleton height={height}>
          {[...Array(8)].map((_, i) => (
            <SkeletonBar
              key={i}
              style={{
                height: `${30 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </ChartLoadingSkeleton>
      </ChartContainer>
    );
  }

  /**
   * Render error state
   */
  if (isError) {
    return (
      <ChartContainer className={className} data-testid={`${testId}-error`}>
        <EmptyState
          icon={FiAlertCircle}
          title="Error al cargar historial"
          message="No pudimos cargar el historial de precios. Por favor, intenta de nuevo."
        />
      </ChartContainer>
    );
  }

  /**
   * Render empty state
   */
  if (!chartData || chartData.length === 0) {
    return (
      <ChartContainer className={className} data-testid={`${testId}-empty`}>
        <ChartHeader>
          <ChartTitle>Historial de precios</ChartTitle>
        </ChartHeader>
        <EmptyState
          icon={FiAlertCircle}
          title="Sin datos disponibles"
          message="No hay historial de precios disponible para el periodo seleccionado."
        />
      </ChartContainer>
    );
  }

  /**
   * Render chart
   */
  return (
    <ChartContainer className={className} data-testid={testId}>
      {/* Header with title and date range selector */}
      <ChartHeader>
        <ChartTitle>Historial de precios</ChartTitle>
        <DateRangeSelector role="group" aria-label="Selector de rango de fechas">
          <DateRangeButton
            $active={dateRange === HistoryPeriod.WEEK}
            onClick={() => handleDateRangeChange(HistoryPeriod.WEEK)}
            aria-pressed={dateRange === HistoryPeriod.WEEK}
          >
            7d
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === HistoryPeriod.MONTH}
            onClick={() => handleDateRangeChange(HistoryPeriod.MONTH)}
            aria-pressed={dateRange === HistoryPeriod.MONTH}
          >
            30d
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === HistoryPeriod.THREE_MONTHS}
            onClick={() => handleDateRangeChange(HistoryPeriod.THREE_MONTHS)}
            aria-pressed={dateRange === HistoryPeriod.THREE_MONTHS}
          >
            90d
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === HistoryPeriod.ALL}
            onClick={() => handleDateRangeChange(HistoryPeriod.ALL)}
            aria-pressed={dateRange === HistoryPeriod.ALL}
          >
            Todo
          </DateRangeButton>
        </DateRangeSelector>
      </ChartHeader>

      {/* Chart wrapper */}
      <ChartWrapper height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.5} />

            {/* X Axis - Dates */}
            <XAxis
              dataKey="formattedDate"
              stroke="#616161"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
            />

            {/* Y Axis - Prices */}
            <YAxis
              stroke="#616161"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
              tickFormatter={formatYAxis}
              domain={yAxisDomain}
              width={60}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            {showLegend && storeNames.length > 1 && (
              <Legend content={<CustomLegend />} />
            )}

            {/* Lines for each store */}
            {storeNames.map((storeName, index) => (
              <Line
                key={storeName}
                type="monotone"
                dataKey={storeName}
                name={storeName}
                stroke={getStoreColor(storeName, index)}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
};

PriceHistoryChart.displayName = 'PriceHistoryChart';

export default PriceHistoryChart;
