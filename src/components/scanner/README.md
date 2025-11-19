# BarcodeScanner Component

Full-screen barcode scanning modal component for Prexiopá. Uses device camera to scan and detect barcodes in real-time.

## Features

- **Full-screen overlay modal** - Immersive scanning experience
- **Real-time detection** - Scans barcodes continuously from camera feed
- **Multiple formats supported** - EAN-13, UPC-A, Code-128, QR Code, EAN-8, UPC-E
- **Camera controls** - Toggle between front/back camera
- **Permission handling** - Graceful error states for camera permissions
- **Visual scanning guide** - Animated frame overlay with scanning line
- **Success animation** - Checkmark animation on successful scan
- **Auto-close** - Optionally closes automatically after scan
- **Keyboard navigation** - ESC key to close, full accessibility support
- **Focus trap** - Maintains focus within modal for accessibility
- **Mobile-first responsive** - Optimized for all screen sizes
- **Loading states** - Shows spinner while initializing camera
- **Error states** - Handles no camera, permission denied, timeout scenarios

## Installation

The component uses these dependencies (already included in Prexiopá):

```bash
npm install react-webcam @zxing/browser react-icons
```

## Basic Usage

```tsx
import { BarcodeScanner } from '@/components/scanner';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScan = (barcode: string) => {
    console.log('Scanned:', barcode);
    // Handle the scanned barcode
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Scan Barcode
      </button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls scanner visibility |
| `onClose` | `() => void` | Callback when scanner should close |
| `onScan` | `(barcode: string) => void` | Callback when barcode is detected |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoClose` | `boolean` | `true` | Auto-close scanner after successful scan |
| `autoCloseDelay` | `number` | `1500` | Delay before auto-close (milliseconds) |
| `noCodeTimeout` | `number` | `15000` | Timeout for "no code found" state (ms). Set to 0 to disable |
| `initialFacingMode` | `'user' \| 'environment'` | `'environment'` | Initial camera facing mode (front or back) |

## Advanced Usage

### Without Auto-Close

Useful when you want to scan multiple barcodes:

```tsx
<BarcodeScanner
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onScan={handleScan}
  autoClose={false}
/>
```

### Front Camera

For scanning barcodes in front of the user:

```tsx
<BarcodeScanner
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onScan={handleScan}
  initialFacingMode="user"
/>
```

### Custom Timeout

Disable or adjust the "no code found" timeout:

```tsx
<BarcodeScanner
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onScan={handleScan}
  noCodeTimeout={30000} // 30 seconds
  // noCodeTimeout={0} // Disable timeout
/>
```

### Complete Example

```tsx
import { useState } from 'react';
import { BarcodeScanner } from '@/components/scanner';
import { toast } from 'react-toastify';

function ProductScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);

  const handleScan = async (barcode: string) => {
    try {
      // Fetch product by barcode
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const product = await response.json();

      setScannedProducts(prev => [...prev, product.name]);
      toast.success(`Producto encontrado: ${product.name}`);
    } catch (error) {
      toast.error('Producto no encontrado');
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Escanear Producto
      </button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        autoClose={true}
        autoCloseDelay={2000}
      />

      <ul>
        {scannedProducts.map((product, i) => (
          <li key={i}>{product}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Supported Barcode Formats

The scanner supports the following formats:

- **EAN-13** - European Article Number (most common for products)
- **UPC-A** - Universal Product Code (North America)
- **Code-128** - High-density linear barcode
- **QR Code** - 2D matrix barcode
- **EAN-8** - Short EAN format
- **UPC-E** - Compressed UPC format

## States

The scanner has five distinct states:

1. **Loading** - Initializing camera, shows spinner
2. **Ready** - Camera active, actively scanning for barcodes
3. **Success** - Barcode detected, shows checkmark animation
4. **Error** - Camera error (no camera, permission denied)
5. **No Code Timeout** - No barcode found within timeout period

## Error Handling

The component handles three types of errors:

### No Camera
- User's device doesn't have a camera
- Shows error message with icon
- Provides retry button

### Permission Denied
- User denied camera access
- Shows instructions to enable in browser settings
- Provides retry button

### Unknown Error
- Other camera-related errors
- Shows generic error message
- Provides retry button

## Accessibility

- **Keyboard Navigation** - ESC key closes the scanner
- **Focus Trap** - Focus stays within modal when open
- **ARIA Labels** - Proper labels for screen readers
- **Role Attributes** - `dialog` role with `aria-modal`
- **Focus Management** - Restores focus to previous element on close
- **Visual Indicators** - Clear visual feedback for all states

## Performance

- **Efficient Scanning** - Scans every 300ms to balance performance and detection
- **Automatic Cleanup** - Properly disposes camera stream on unmount
- **Optimized Video** - Requests ideal resolution (1920x1080) with fallback
- **Lazy Loading** - ZXing library loaded only when needed

## Browser Support

Works on all modern browsers that support:
- `getUserMedia()` API (camera access)
- `<video>` element
- Canvas API

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 5+)

## Troubleshooting

### Camera not working on mobile

Ensure your app is served over HTTPS. Modern browsers require secure contexts for camera access.

### Permission denied automatically

User may have previously denied camera access. Instruct them to:
1. Click the lock icon in the address bar
2. Reset camera permissions
3. Reload the page

### Scanner not detecting barcodes

- Ensure good lighting
- Hold camera steady
- Position barcode within the guide frame
- Try cleaning the camera lens
- Barcode should be in focus

### Performance issues

- Reduce video resolution by adjusting videoConstraints
- Increase scan interval (currently 300ms)
- Ensure device has adequate processing power

## Styling

The component uses styled-components and follows Prexiopá's theme system. All styles are in `BarcodeScanner.styles.ts`.

### Customization

You can override styles by wrapping in a styled component:

```tsx
import styled from 'styled-components';
import { BarcodeScanner } from '@/components/scanner';

const CustomScanner = styled(BarcodeScanner)`
  /* Your custom styles */
`;
```

## Technical Details

### Dependencies

- `react-webcam` - React wrapper for accessing device camera
- `@zxing/browser` - Barcode detection library (ZXing port)
- `react-icons/fi` - Feather icons for UI elements
- `styled-components` - Styling solution

### Architecture

```
BarcodeScanner/
├── BarcodeScanner.tsx       # Main component logic
├── BarcodeScanner.styles.ts # Styled components
├── index.ts                 # Barrel export
└── README.md                # Documentation
```

### Key Implementation Details

- Uses `createPortal` for modal rendering
- `BrowserMultiFormatReader` for barcode detection
- Interval-based scanning (300ms) for continuous detection
- Ref-based video element access for ZXing integration
- Proper cleanup of intervals, timeouts, and media streams

## Phase 3 Integration

This component is part of Phase 3 of the Prexiopá roadmap:

- **Product Search Enhancement** - Scan barcodes to quickly find products
- **Price Comparison** - Scan in-store to compare with online prices
- **Favorites** - Scan to add products to favorites
- **Shopping List** - Scan products to add to shopping list

## Future Enhancements

Potential improvements for future phases:

- [ ] Batch scanning mode (scan multiple items)
- [ ] Scan history with persistence
- [ ] Manual barcode entry fallback
- [ ] Flash/torch control
- [ ] Zoom controls
- [ ] Offline detection
- [ ] Custom scan overlay designs
- [ ] Audio feedback on scan
- [ ] Haptic feedback (mobile)
- [ ] OCR for text recognition

## License

Part of Prexiopá project. Internal component.

## Support

For issues or questions, contact the Prexiopá development team.
