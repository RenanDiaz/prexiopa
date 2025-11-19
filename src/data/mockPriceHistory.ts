/**
 * Mock Price History Data
 * Historial de precios de productos para mostrar tendencias y gráficos
 */

import type { PriceHistory, PriceHistoryPoint, HistoryPeriod } from '../types/price.types';

/**
 * Función auxiliar para generar puntos de historial con variaciones realistas
 */
function generatePricePoints(
  basePrice: number,
  days: number,
  volatility: number = 0.1
): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  let currentPrice = basePrice;

  for (let i = days - 1; i >= 0; i--) {
    // Generar variación de precio (puede subir o bajar)
    const variation = (Math.random() - 0.5) * 2 * volatility * basePrice;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + variation));

    // Redondear a 2 decimales
    currentPrice = Math.round(currentPrice * 100) / 100;

    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(8, 0, 0, 0);

    // Ocasionalmente agregar descuentos (10% de probabilidad)
    const hasDiscount = Math.random() < 0.1;
    const discountPrice = hasDiscount ? Math.round(currentPrice * 0.85 * 100) / 100 : undefined;

    points.push({
      price: currentPrice,
      discountPrice,
      date,
      isAvailable: Math.random() > 0.02, // 98% disponibilidad
    });
  }

  return points;
}

/**
 * Función auxiliar para calcular estadísticas del historial
 */
function calculateStats(points: PriceHistoryPoint[]): {
  min: number;
  max: number;
  average: number;
  current: number;
} {
  const prices = points.map((p) => p.discountPrice || p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
    current: prices[prices.length - 1],
  };
}

/**
 * Historial de precios de productos populares en diferentes tiendas
 */

// Arroz Gallo en diferentes tiendas - 30 días
const arrozGalloSuper99Points = generatePricePoints(4.99, 30, 0.08);
const arrozGalloSuper99Stats = calculateStats(arrozGalloSuper99Points);

const arrozGalloReyPoints = generatePricePoints(4.49, 30, 0.09);
const arrozGalloReyStats = calculateStats(arrozGalloReyPoints);

const arrozGalloMachetazoPoints = generatePricePoints(4.39, 30, 0.07);
const arrozGalloMachetazoStats = calculateStats(arrozGalloMachetazoPoints);

// Leche Dos Pinos - 30 días
const lecheSuper99Points = generatePricePoints(2.89, 30, 0.06);
const lecheSuper99Stats = calculateStats(lecheSuper99Points);

const lecheReyPoints = generatePricePoints(2.79, 30, 0.07);
const lecheReyStats = calculateStats(lecheReyPoints);

const lecheRomeroPoints = generatePricePoints(2.99, 30, 0.05);
const lecheRomeroStats = calculateStats(lecheRomeroPoints);

// Coca-Cola - 30 días
const cocaColaSuper99Points = generatePricePoints(2.49, 30, 0.12);
const cocaColaSuper99Stats = calculateStats(cocaColaSuper99Points);

const cocaColaReyPoints = generatePricePoints(2.79, 30, 0.10);
const cocaColaReyStats = calculateStats(cocaColaReyPoints);

const cocaColaMachetazoPoints = generatePricePoints(2.59, 30, 0.11);
const cocaColaMachetazoStats = calculateStats(cocaColaMachetazoPoints);

// Detergente Ariel - 30 días
const detergenteSuper99Points = generatePricePoints(16.99, 30, 0.15);
const detergenteSuper99Stats = calculateStats(detergenteSuper99Points);

const detergenteReyPoints = generatePricePoints(17.99, 30, 0.14);
const detergenteReyStats = calculateStats(detergenteReyPoints);

const detergenteMachetazoPoints = generatePricePoints(16.49, 30, 0.13);
const detergenteMachetazoStats = calculateStats(detergenteMachetazoPoints);

// Pan Bimbo - 30 días
const panSuper99Points = generatePricePoints(2.49, 30, 0.05);
const panSuper99Stats = calculateStats(panSuper99Points);

const panReyPoints = generatePricePoints(2.39, 30, 0.06);
const panReyStats = calculateStats(panReyPoints);

const panMachetazoPoints = generatePricePoints(2.29, 30, 0.04);
const panMachetazoStats = calculateStats(panMachetazoPoints);

// Aceite Mazola - 30 días
const aceiteSuper99Points = generatePricePoints(5.49, 30, 0.10);
const aceiteSuper99Stats = calculateStats(aceiteSuper99Points);

const aceiteReyPoints = generatePricePoints(5.29, 30, 0.09);
const aceiteReyStats = calculateStats(aceiteReyPoints);

const aceiteMachetazoPoints = generatePricePoints(4.99, 30, 0.08);
const aceiteMachetazoStats = calculateStats(aceiteMachetazoPoints);

// Papel Higiénico Charmin - 30 días
const papelSuper99Points = generatePricePoints(11.49, 30, 0.12);
const papelSuper99Stats = calculateStats(papelSuper99Points);

const papelReyPoints = generatePricePoints(11.99, 30, 0.11);
const papelReyStats = calculateStats(papelReyPoints);

const papelRomeroPoints = generatePricePoints(13.49, 30, 0.10);
const papelRomeroStats = calculateStats(papelRomeroPoints);

// Pechuga de Pollo - 30 días
const polloSuper99Points = generatePricePoints(3.99, 30, 0.15);
const polloSuper99Stats = calculateStats(polloSuper99Points);

const polloReyPoints = generatePricePoints(3.79, 30, 0.16);
const polloReyStats = calculateStats(polloReyPoints);

const polloRibaSmithPoints = generatePricePoints(4.49, 30, 0.12);
const polloRibaSmithStats = calculateStats(polloRibaSmithPoints);

// Agua Crystal - 30 días
const aguaSuper99Points = generatePricePoints(1.29, 30, 0.08);
const aguaSuper99Stats = calculateStats(aguaSuper99Points);

const aguaReyPoints = generatePricePoints(1.19, 30, 0.07);
const aguaReyStats = calculateStats(aguaReyPoints);

const aguaMachetazoPoints = generatePricePoints(0.99, 30, 0.06);
const aguaMachetazoStats = calculateStats(aguaMachetazoPoints);

// Queso Kraft - 30 días
const quesoSuper99Points = generatePricePoints(5.99, 30, 0.09);
const quesoSuper99Stats = calculateStats(quesoSuper99Points);

const quesoReyPoints = generatePricePoints(5.79, 30, 0.10);
const quesoReyStats = calculateStats(quesoReyPoints);

const quesoXtraPoints = generatePricePoints(6.29, 30, 0.08);
const quesoXtraStats = calculateStats(quesoXtraPoints);

/**
 * Array de historiales de precios
 */
export const mockPriceHistory: PriceHistory[] = [
  // Arroz Gallo
  {
    productId: 'prod-001',
    storeId: 'store-super99',
    prices: arrozGalloSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: arrozGalloSuper99Stats.min,
    maxPrice: arrozGalloSuper99Stats.max,
    averagePrice: arrozGalloSuper99Stats.average,
    currentPrice: arrozGalloSuper99Stats.current,
  },
  {
    productId: 'prod-001',
    storeId: 'store-rey',
    prices: arrozGalloReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: arrozGalloReyStats.min,
    maxPrice: arrozGalloReyStats.max,
    averagePrice: arrozGalloReyStats.average,
    currentPrice: arrozGalloReyStats.current,
  },
  {
    productId: 'prod-001',
    storeId: 'store-machetazo',
    prices: arrozGalloMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: arrozGalloMachetazoStats.min,
    maxPrice: arrozGalloMachetazoStats.max,
    averagePrice: arrozGalloMachetazoStats.average,
    currentPrice: arrozGalloMachetazoStats.current,
  },

  // Leche Dos Pinos
  {
    productId: 'prod-007',
    storeId: 'store-super99',
    prices: lecheSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: lecheSuper99Stats.min,
    maxPrice: lecheSuper99Stats.max,
    averagePrice: lecheSuper99Stats.average,
    currentPrice: lecheSuper99Stats.current,
  },
  {
    productId: 'prod-007',
    storeId: 'store-rey',
    prices: lecheReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: lecheReyStats.min,
    maxPrice: lecheReyStats.max,
    averagePrice: lecheReyStats.average,
    currentPrice: lecheReyStats.current,
  },
  {
    productId: 'prod-007',
    storeId: 'store-romero',
    prices: lecheRomeroPoints,
    period: 'month' as HistoryPeriod,
    minPrice: lecheRomeroStats.min,
    maxPrice: lecheRomeroStats.max,
    averagePrice: lecheRomeroStats.average,
    currentPrice: lecheRomeroStats.current,
  },

  // Coca-Cola
  {
    productId: 'prod-013',
    storeId: 'store-super99',
    prices: cocaColaSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: cocaColaSuper99Stats.min,
    maxPrice: cocaColaSuper99Stats.max,
    averagePrice: cocaColaSuper99Stats.average,
    currentPrice: cocaColaSuper99Stats.current,
  },
  {
    productId: 'prod-013',
    storeId: 'store-rey',
    prices: cocaColaReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: cocaColaReyStats.min,
    maxPrice: cocaColaReyStats.max,
    averagePrice: cocaColaReyStats.average,
    currentPrice: cocaColaReyStats.current,
  },
  {
    productId: 'prod-013',
    storeId: 'store-machetazo',
    prices: cocaColaMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: cocaColaMachetazoStats.min,
    maxPrice: cocaColaMachetazoStats.max,
    averagePrice: cocaColaMachetazoStats.average,
    currentPrice: cocaColaMachetazoStats.current,
  },

  // Detergente Ariel
  {
    productId: 'prod-020',
    storeId: 'store-super99',
    prices: detergenteSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: detergenteSuper99Stats.min,
    maxPrice: detergenteSuper99Stats.max,
    averagePrice: detergenteSuper99Stats.average,
    currentPrice: detergenteSuper99Stats.current,
  },
  {
    productId: 'prod-020',
    storeId: 'store-rey',
    prices: detergenteReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: detergenteReyStats.min,
    maxPrice: detergenteReyStats.max,
    averagePrice: detergenteReyStats.average,
    currentPrice: detergenteReyStats.current,
  },
  {
    productId: 'prod-020',
    storeId: 'store-machetazo',
    prices: detergenteMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: detergenteMachetazoStats.min,
    maxPrice: detergenteMachetazoStats.max,
    averagePrice: detergenteMachetazoStats.average,
    currentPrice: detergenteMachetazoStats.current,
  },

  // Pan Bimbo
  {
    productId: 'prod-011',
    storeId: 'store-super99',
    prices: panSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: panSuper99Stats.min,
    maxPrice: panSuper99Stats.max,
    averagePrice: panSuper99Stats.average,
    currentPrice: panSuper99Stats.current,
  },
  {
    productId: 'prod-011',
    storeId: 'store-rey',
    prices: panReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: panReyStats.min,
    maxPrice: panReyStats.max,
    averagePrice: panReyStats.average,
    currentPrice: panReyStats.current,
  },
  {
    productId: 'prod-011',
    storeId: 'store-machetazo',
    prices: panMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: panMachetazoStats.min,
    maxPrice: panMachetazoStats.max,
    averagePrice: panMachetazoStats.average,
    currentPrice: panMachetazoStats.current,
  },

  // Aceite Mazola
  {
    productId: 'prod-004',
    storeId: 'store-super99',
    prices: aceiteSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: aceiteSuper99Stats.min,
    maxPrice: aceiteSuper99Stats.max,
    averagePrice: aceiteSuper99Stats.average,
    currentPrice: aceiteSuper99Stats.current,
  },
  {
    productId: 'prod-004',
    storeId: 'store-rey',
    prices: aceiteReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: aceiteReyStats.min,
    maxPrice: aceiteReyStats.max,
    averagePrice: aceiteReyStats.average,
    currentPrice: aceiteReyStats.current,
  },
  {
    productId: 'prod-004',
    storeId: 'store-machetazo',
    prices: aceiteMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: aceiteMachetazoStats.min,
    maxPrice: aceiteMachetazoStats.max,
    averagePrice: aceiteMachetazoStats.average,
    currentPrice: aceiteMachetazoStats.current,
  },

  // Papel Higiénico Charmin
  {
    productId: 'prod-025',
    storeId: 'store-super99',
    prices: papelSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: papelSuper99Stats.min,
    maxPrice: papelSuper99Stats.max,
    averagePrice: papelSuper99Stats.average,
    currentPrice: papelSuper99Stats.current,
  },
  {
    productId: 'prod-025',
    storeId: 'store-rey',
    prices: papelReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: papelReyStats.min,
    maxPrice: papelReyStats.max,
    averagePrice: papelReyStats.average,
    currentPrice: papelReyStats.current,
  },
  {
    productId: 'prod-025',
    storeId: 'store-romero',
    prices: papelRomeroPoints,
    period: 'month' as HistoryPeriod,
    minPrice: papelRomeroStats.min,
    maxPrice: papelRomeroStats.max,
    averagePrice: papelRomeroStats.average,
    currentPrice: papelRomeroStats.current,
  },

  // Pechuga de Pollo
  {
    productId: 'prod-035',
    storeId: 'store-super99',
    prices: polloSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: polloSuper99Stats.min,
    maxPrice: polloSuper99Stats.max,
    averagePrice: polloSuper99Stats.average,
    currentPrice: polloSuper99Stats.current,
  },
  {
    productId: 'prod-035',
    storeId: 'store-rey',
    prices: polloReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: polloReyStats.min,
    maxPrice: polloReyStats.max,
    averagePrice: polloReyStats.average,
    currentPrice: polloReyStats.current,
  },
  {
    productId: 'prod-035',
    storeId: 'store-ribasmith',
    prices: polloRibaSmithPoints,
    period: 'month' as HistoryPeriod,
    minPrice: polloRibaSmithStats.min,
    maxPrice: polloRibaSmithStats.max,
    averagePrice: polloRibaSmithStats.average,
    currentPrice: polloRibaSmithStats.current,
  },

  // Agua Crystal
  {
    productId: 'prod-016',
    storeId: 'store-super99',
    prices: aguaSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: aguaSuper99Stats.min,
    maxPrice: aguaSuper99Stats.max,
    averagePrice: aguaSuper99Stats.average,
    currentPrice: aguaSuper99Stats.current,
  },
  {
    productId: 'prod-016',
    storeId: 'store-rey',
    prices: aguaReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: aguaReyStats.min,
    maxPrice: aguaReyStats.max,
    averagePrice: aguaReyStats.average,
    currentPrice: aguaReyStats.current,
  },
  {
    productId: 'prod-016',
    storeId: 'store-machetazo',
    prices: aguaMachetazoPoints,
    period: 'month' as HistoryPeriod,
    minPrice: aguaMachetazoStats.min,
    maxPrice: aguaMachetazoStats.max,
    averagePrice: aguaMachetazoStats.average,
    currentPrice: aguaMachetazoStats.current,
  },

  // Queso Kraft
  {
    productId: 'prod-009',
    storeId: 'store-super99',
    prices: quesoSuper99Points,
    period: 'month' as HistoryPeriod,
    minPrice: quesoSuper99Stats.min,
    maxPrice: quesoSuper99Stats.max,
    averagePrice: quesoSuper99Stats.average,
    currentPrice: quesoSuper99Stats.current,
  },
  {
    productId: 'prod-009',
    storeId: 'store-rey',
    prices: quesoReyPoints,
    period: 'month' as HistoryPeriod,
    minPrice: quesoReyStats.min,
    maxPrice: quesoReyStats.max,
    averagePrice: quesoReyStats.average,
    currentPrice: quesoReyStats.current,
  },
  {
    productId: 'prod-009',
    storeId: 'store-xtra',
    prices: quesoXtraPoints,
    period: 'month' as HistoryPeriod,
    minPrice: quesoXtraStats.min,
    maxPrice: quesoXtraStats.max,
    averagePrice: quesoXtraStats.average,
    currentPrice: quesoXtraStats.current,
  },
];
