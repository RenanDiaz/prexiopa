/**
 * BarcodeScanner Usage Examples
 *
 * Comprehensive examples showing different ways to use the BarcodeScanner component.
 * These examples can be used as a reference for implementing barcode scanning
 * in various scenarios within the Prexiopá application.
 */

import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { toast } from 'react-toastify';

// ============================================
// EXAMPLE 1: Basic Usage
// ============================================

export function BasicScannerExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');

  const handleScan = (barcode: string) => {
    setScannedCode(barcode);
    console.log('Scanned:', barcode);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan Barcode
      </button>

      {scannedCode && <p>Last scanned: {scannedCode}</p>}

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Product Search with Scanner
// ============================================

export function ProductSearchExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const handleScan = async (barcode: string) => {
    setIsLoading(true);

    try {
      // Fetch product by barcode
      const response = await fetch(`/api/products/barcode/${barcode}`);

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const productData = await response.json();
      setProduct(productData);
      toast.success(`Product found: ${productData.name}`);
    } catch (error) {
      toast.error('Product not found. Try another barcode.');
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan Product Barcode
      </button>

      {isLoading && <p>Searching product...</p>}

      {product && (
        <div>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <img src={product.image} alt={product.name} />
        </div>
      )}

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        autoClose={true}
        autoCloseDelay={1000}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 3: Multiple Scans (Shopping List)
// ============================================

export function ShoppingListExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Array<{ barcode: string; name: string; time: Date }>>([]);

  const handleScan = async (barcode: string) => {
    try {
      // Fetch product info
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const product = await response.json();

      // Add to list
      setItems((prev) => [
        ...prev,
        {
          barcode,
          name: product.name,
          time: new Date(),
        },
      ]);

      toast.success(`Added: ${product.name}`);
    } catch (error) {
      toast.error('Product not found');
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan Items
      </button>

      <h3>Shopping List ({items.length} items)</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.barcode}-${index}`}>
            {item.name} - {item.barcode}
          </li>
        ))}
      </ul>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        autoClose={false} // Keep scanner open for multiple scans
      />
    </div>
  );
}

// ============================================
// EXAMPLE 4: Price Comparison Scanner
// ============================================

export function PriceComparisonExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (barcode: string) => {
    setLoading(true);

    try {
      // Fetch price comparison
      const response = await fetch(`/api/products/${barcode}/prices`);
      const priceData = await response.json();

      setPrices(priceData);

      // Find best price
      const bestPrice = priceData.stores.reduce(
        (min: any, store: any) => (store.price < min.price ? store : min),
        priceData.stores[0]
      );

      toast.success(`Best price: $${bestPrice.price} at ${bestPrice.store}`);
    } catch (error) {
      toast.error('Could not fetch prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Compare Prices
      </button>

      {loading && <p>Loading prices...</p>}

      {prices && (
        <div>
          <h3>{prices.product.name}</h3>
          <h4>Prices:</h4>
          <ul>
            {prices.stores.map((store: any) => (
              <li key={store.id}>
                {store.name}: ${store.price}
              </li>
            ))}
          </ul>
        </div>
      )}

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 5: Add to Favorites with Scanner
// ============================================

export function AddToFavoritesExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScan = async (barcode: string) => {
    try {
      // Add to favorites
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }

      const product = await response.json();
      toast.success(`${product.name} added to favorites!`);
    } catch (error) {
      toast.error('Could not add to favorites');
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan to Add Favorite
      </button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 6: Front Camera Scanner (QR Codes)
// ============================================

export function QRCodeScannerExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [qrData, setQrData] = useState<string>('');

  const handleScan = (code: string) => {
    setQrData(code);

    // Parse QR code data (might be JSON, URL, etc.)
    try {
      const data = JSON.parse(code);
      console.log('QR Data:', data);
    } catch {
      // Not JSON, might be a URL or plain text
      console.log('QR Text:', code);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan QR Code
      </button>

      {qrData && (
        <div>
          <h3>QR Code Data:</h3>
          <pre>{qrData}</pre>
        </div>
      )}

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        initialFacingMode="user" // Use front camera
      />
    </div>
  );
}

// ============================================
// EXAMPLE 7: Scanner with Custom Timeout
// ============================================

export function CustomTimeoutExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScan = (barcode: string) => {
    console.log('Scanned:', barcode);
    toast.success(`Scanned: ${barcode}`);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan (30s timeout)
      </button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        noCodeTimeout={30000} // 30 seconds
      />
    </div>
  );
}

// ============================================
// EXAMPLE 8: Scanner with No Auto-Close
// ============================================

export function NoAutoCloseExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [scans, setScans] = useState<string[]>([]);

  const handleScan = (barcode: string) => {
    setScans((prev) => [...prev, barcode]);
    toast.info(`Scanned: ${barcode}`);
  };

  const handleDone = () => {
    setIsOpen(false);
    toast.success(`Scanned ${scans.length} items`);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan Multiple Items
      </button>

      <button onClick={handleDone} disabled={scans.length === 0}>
        Done ({scans.length})
      </button>

      <ul>
        {scans.map((barcode, index) => (
          <li key={`${barcode}-${index}`}>{barcode}</li>
        ))}
      </ul>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        autoClose={false} // Keep scanner open
      />
    </div>
  );
}

// ============================================
// EXAMPLE 9: Scanner with Price Alert Setup
// ============================================

export function PriceAlertExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>('');

  const handleScan = async (barcode: string) => {
    if (!targetPrice) {
      toast.error('Please enter a target price first');
      return;
    }

    try {
      // Create price alert
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      toast.success('Price alert created!');
    } catch (error) {
      toast.error('Could not create alert');
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Target price"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
      />

      <button onClick={() => setIsOpen(true)}>
        Scan Product for Alert
      </button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 10: Scanner with History Tracking
// ============================================

export function ScanHistoryExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<
    Array<{ barcode: string; timestamp: Date; product?: any }>
  >([]);

  const handleScan = async (barcode: string) => {
    const timestamp = new Date();

    try {
      // Fetch product info
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const product = await response.json();

      // Add to history
      setHistory((prev) => [{ barcode, timestamp, product }, ...prev]);

      // Save to localStorage
      localStorage.setItem('scanHistory', JSON.stringify(history));
    } catch (error) {
      // Add without product info
      setHistory((prev) => [{ barcode, timestamp }, ...prev]);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Scan Barcode
      </button>

      <h3>Scan History</h3>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            {entry.product?.name || entry.barcode} -{' '}
            {entry.timestamp.toLocaleTimeString()}
          </li>
        ))}
      </ul>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
