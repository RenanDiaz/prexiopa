# Ejemplos de Uso de Servicios

Guía práctica con ejemplos reales de cómo usar los servicios en componentes de React.

## Ejemplo 1: Login Component

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services';
import { ApiError } from '@/types/api.types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({
        email,
        password,
        rememberMe: true
      });

      if (response.success && response.data) {
        // Guardar usuario en contexto/estado global
        console.log('Usuario autenticado:', response.data.user);

        // Redirigir al dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

## Ejemplo 2: Product List Component

```tsx
import React, { useState, useEffect } from 'react';
import { getAllProducts } from '@/services';
import { ProductSummary } from '@/types/product.types';
import { PaginatedResponse } from '@/types/api.types';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllProducts({
        page,
        limit: 20,
        sort: 'name:asc'
      });

      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Productos</h2>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.brand}</p>
            {product.lowestPrice && (
              <p className="price">${product.lowestPrice.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
```

## Ejemplo 3: Product Detail with Price Comparison

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getPriceComparison, toggleFavorite } from '@/services';
import { Product } from '@/types/product.types';
import { PriceComparison } from '@/types/price.types';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch en paralelo
        const [productRes, comparisonRes] = await Promise.all([
          getProductById(id),
          getPriceComparison(id)
        ]);

        if (productRes.success && productRes.data) {
          setProduct(productRes.data);
        }

        if (comparisonRes.success && comparisonRes.data) {
          setComparison(comparisonRes.data);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;

    try {
      const response = await toggleFavorite(id);
      if (response.success && response.data) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div className="product-detail">
      <div className="product-header">
        <img src={product.images[0]?.url} alt={product.name} />
        <div>
          <h1>{product.name}</h1>
          <p>{product.brand}</p>
          <button onClick={handleToggleFavorite}>
            {isFavorite ? '❤️ Favorito' : '🤍 Agregar a favoritos'}
          </button>
        </div>
      </div>

      {comparison && (
        <div className="price-comparison">
          <h2>Comparación de Precios</h2>
          <p>Mejor precio: ${comparison.bestPrice.toFixed(2)}</p>
          <p>Precio promedio: ${comparison.averagePrice.toFixed(2)}</p>

          <div className="store-prices">
            {comparison.prices.map((storePrice) => (
              <div key={storePrice.storeId} className="store-price-card">
                <img src={storePrice.storeLogo} alt={storePrice.storeName} />
                <h3>{storePrice.storeName}</h3>
                <p className="price">${storePrice.price.toFixed(2)}</p>
                {storePrice.discountPrice && (
                  <p className="discount">
                    Oferta: ${storePrice.discountPrice.toFixed(2)}
                    ({storePrice.discountPercentage}% OFF)
                  </p>
                )}
                {storePrice.differenceFromLowest && (
                  <p className="difference">
                    +${storePrice.differenceFromLowest.toFixed(2)} del mejor precio
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Ejemplo 4: Search Component with Debounce

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { searchProducts } from '@/services';
import { ProductSummary } from '@/types/product.types';
import debounce from 'lodash/debounce';

export const ProductSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await searchProducts({
        query: searchQuery,
        limit: 10
      });

      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para evitar demasiadas requests
  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
      />

      {loading && <div>Buscando...</div>}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((product) => (
            <div key={product.id} className="search-result-item">
              <img src={product.image} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>{product.brand}</p>
                {product.lowestPrice && (
                  <span>${product.lowestPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Ejemplo 5: Alert Creation Component

```tsx
import React, { useState } from 'react';
import { createAlert } from '@/services';
import { AlertType, AlertFrequency } from '@/types/alert.types';

interface CreateAlertFormProps {
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({
  productId,
  productName,
  onSuccess
}) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<AlertType>(AlertType.PRICE_DROP);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createAlert({
        productId,
        condition: {
          type: alertType,
          targetPrice: parseFloat(targetPrice)
        },
        frequency: AlertFrequency.IMMEDIATE
      });

      if (response.success) {
        alert(`¡Alerta creada para ${productName}!`);
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear alerta:', err);
      alert('Error al crear la alerta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Alerta de Precio</h3>
      <p>Producto: {productName}</p>

      <label>
        Tipo de alerta:
        <select
          value={alertType}
          onChange={(e) => setAlertType(e.target.value as AlertType)}
        >
          <option value={AlertType.PRICE_DROP}>Cuando baje de precio</option>
          <option value={AlertType.DISCOUNT}>Cuando tenga descuento</option>
          <option value={AlertType.PRICE_CHANGE}>Cualquier cambio</option>
        </select>
      </label>

      {alertType === AlertType.PRICE_DROP && (
        <label>
          Precio objetivo:
          <input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="5.99"
            required
          />
        </label>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Alerta'}
      </button>
    </form>
  );
};
```

## Ejemplo 6: Custom Hook para Productos

```tsx
import { useState, useEffect } from 'react';
import { getAllProducts } from '@/services';
import { ProductSummary } from '@/types/product.types';
import { GetProductsParams } from '@/services/productService';

interface UseProductsResult {
  products: ProductSummary[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export const useProducts = (
  params?: Omit<GetProductsParams, 'page'>
): UseProductsResult => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllProducts({
        ...params,
        page,
        limit: params?.limit || 20
      });

      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
        setHasNextPage(response.pagination.hasNextPage);
        setHasPreviousPage(response.pagination.hasPreviousPage);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, JSON.stringify(params)]);

  const nextPage = () => {
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setPage(p => p - 1);
    }
  };

  return {
    products,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refetch: fetchProducts
  };
};

// Uso del hook
export const ProductListWithHook: React.FC = () => {
  const {
    products,
    loading,
    error,
    page,
    totalPages,
    nextPage,
    previousPage
  } = useProducts({ category: 'alimentos' });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="products">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pagination">
        <button onClick={previousPage}>Anterior</button>
        <span>{page} / {totalPages}</span>
        <button onClick={nextPage}>Siguiente</button>
      </div>
    </div>
  );
};
```

## Ejemplo 7: Price History Chart Component

```tsx
import React, { useState, useEffect } from 'react';
import { getPriceHistory } from '@/services';
import { PriceHistory, HistoryPeriod } from '@/types/price.types';
import { Line } from 'react-chartjs-2';

interface PriceChartProps {
  productId: string;
  storeId?: string;
}

export const PriceHistoryChart: React.FC<PriceChartProps> = ({
  productId,
  storeId
}) => {
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [period, setPeriod] = useState<HistoryPeriod>(HistoryPeriod.MONTH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);

      try {
        const response = await getPriceHistory({
          productId,
          storeId,
          period
        });

        if (response.success && response.data) {
          setHistory(response.data);
        }
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [productId, storeId, period]);

  if (loading) return <div>Cargando historial...</div>;
  if (!history) return <div>No hay datos disponibles</div>;

  const chartData = {
    labels: history.prices.map(p =>
      new Date(p.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Precio',
        data: history.prices.map(p => p.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="price-history">
      <div className="controls">
        <button onClick={() => setPeriod(HistoryPeriod.WEEK)}>7 días</button>
        <button onClick={() => setPeriod(HistoryPeriod.MONTH)}>30 días</button>
        <button onClick={() => setPeriod(HistoryPeriod.THREE_MONTHS)}>90 días</button>
      </div>

      <div className="stats">
        <div>Precio actual: ${history.currentPrice.toFixed(2)}</div>
        <div>Mínimo: ${history.minPrice.toFixed(2)}</div>
        <div>Máximo: ${history.maxPrice.toFixed(2)}</div>
        <div>Promedio: ${history.averagePrice.toFixed(2)}</div>
      </div>

      <Line data={chartData} />
    </div>
  );
};
```

## Ejemplo 8: Favorites Management

```tsx
import React, { useState, useEffect } from 'react';
import {
  getUserFavorites,
  removeFavorite,
  getFavoriteStatistics
} from '@/services';
import { ProductWithPrice } from '@/types/product.types';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<ProductWithPrice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favoritesRes, statsRes] = await Promise.all([
          getUserFavorites({ limit: 100 }),
          getFavoriteStatistics()
        ]);

        if (favoritesRes.success && favoritesRes.data) {
          setFavorites(favoritesRes.data);
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFavorite(productId);
      setFavorites(favs => favs.filter(f => f.id !== productId));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
    }
  };

  if (loading) return <div>Cargando favoritos...</div>;

  return (
    <div className="favorites-page">
      <h1>Mis Favoritos</h1>

      {stats && (
        <div className="stats-panel">
          <div>Total: {stats.total}</div>
          <div>En oferta: {stats.onSaleCount}</div>
          <div>Ahorro promedio: ${stats.averageSavings.toFixed(2)}</div>
        </div>
      )}

      <div className="favorites-grid">
        {favorites.map((product) => (
          <div key={product.id} className="favorite-card">
            <img src={product.images[0]?.url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.brand}</p>

            {product.currentPrice && (
              <p className="price">${product.currentPrice.toFixed(2)}</p>
            )}

            {product.hasDiscount && (
              <span className="discount-badge">
                {product.discountPercentage}% OFF
              </span>
            )}

            <button onClick={() => handleRemoveFavorite(product.id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Tips Adicionales

### 1. Error Boundary para Servicios

```tsx
class ServiceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Service Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Retry Logic

```typescript
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Uso
const products = await fetchWithRetry(() => getAllProducts());
```

### 3. Loading State Manager

```typescript
const useApiCall = <T,>(apiFunction: () => Promise<ApiResponse<T>>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```
