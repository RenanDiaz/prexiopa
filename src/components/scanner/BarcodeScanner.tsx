/**
 * BarcodeScanner Component
 *
 * Full-screen barcode scanning modal with camera access and real-time detection.
 * Supports multiple barcode formats: EAN-13, UPC-A, Code-128, QR Code.
 *
 * Features:
 * - Camera permission handling with error states
 * - Front/back camera toggle
 * - Visual scanning guide overlay
 * - Success animation on detection
 * - Auto-close after successful scan
 * - Keyboard navigation (ESC to close)
 * - Focus trap for accessibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BarcodeScanner
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onScan={handleScanResult}
 * />
 *
 * // Without auto-close
 * <BarcodeScanner
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onScan={handleScanResult}
 *   autoClose={false}
 * />
 *
 * // With custom timeout
 * <BarcodeScanner
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onScan={handleScanResult}
 *   noCodeTimeout={10000}
 * />
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FiX, FiRotateCw, FiAlertCircle } from 'react-icons/fi';
import * as S from './BarcodeScanner.styles';

/**
 * Scanner state types
 */
type ScannerState = 'loading' | 'ready' | 'success' | 'error' | 'no-code-timeout';

/**
 * Error types
 */
type ScannerError = 'no-camera' | 'permission-denied' | 'unknown';

/**
 * BarcodeScanner Props
 */
export interface BarcodeScannerProps {
  /**
   * Controls scanner visibility
   */
  isOpen: boolean;

  /**
   * Callback when scanner should close
   */
  onClose: () => void;

  /**
   * Callback when barcode is detected
   * @param barcode - The detected barcode string
   */
  onScan: (barcode: string) => void;

  /**
   * Auto-close scanner after successful scan
   * @default true
   */
  autoClose?: boolean;

  /**
   * Delay before auto-close (ms)
   * @default 1500
   */
  autoCloseDelay?: number;

  /**
   * Timeout for "no code found" state (ms)
   * Set to 0 to disable timeout
   * @default 15000
   */
  noCodeTimeout?: number;

  /**
   * Initial camera facing mode
   * @default 'environment'
   */
  initialFacingMode?: 'user' | 'environment';
}

/**
 * BarcodeScanner Component
 */
export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  autoClose = true,
  autoCloseDelay = 1500,
  noCodeTimeout = 15000,
  initialFacingMode = 'environment',
}) => {
  // State
  const [state, setState] = useState<ScannerState>('loading');
  const [error, setError] = useState<ScannerError | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [detectedCode, setDetectedCode] = useState<string>('');

  // Refs
  const webcamRef = useRef<Webcam>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize barcode reader
   */
  const initializeReader = useCallback(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
  }, []);

  /**
   * Scan barcode from webcam video
   */
  const scanBarcode = useCallback(async () => {
    if (!codeReaderRef.current || !webcamRef.current?.video) {
      return;
    }

    try {
      const video = webcamRef.current.video;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const result = await codeReaderRef.current.decodeOnceFromVideoElement(video);

        if (result) {
          const barcodeText = result.getText();

          // Update state
          setState('success');
          setDetectedCode(barcodeText);

          // Stop scanning
          if (scanningIntervalRef.current) {
            clearInterval(scanningIntervalRef.current);
            scanningIntervalRef.current = null;
          }

          // Clear timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          // Trigger callback
          onScan(barcodeText);

          // Auto-close if enabled
          if (autoClose) {
            setTimeout(() => {
              onClose();
            }, autoCloseDelay);
          }
        }
      }
    } catch (err) {
      // Ignore decode errors (no barcode found in frame)
      // Only log actual errors
      if (err instanceof Error && !err.message.toLowerCase().includes('not found')) {
        console.error('Barcode scan error:', err);
      }
    }
  }, [onScan, autoClose, autoCloseDelay, onClose]);

  /**
   * Start scanning process
   */
  const startScanning = useCallback(() => {
    setState('ready');

    // Start scanning interval
    scanningIntervalRef.current = window.setInterval(() => {
      scanBarcode();
    }, 300);

    // Set timeout for "no code found"
    if (noCodeTimeout > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setState('no-code-timeout');
        if (scanningIntervalRef.current) {
          clearInterval(scanningIntervalRef.current);
          scanningIntervalRef.current = null;
        }
      }, noCodeTimeout);
    }
  }, [scanBarcode, noCodeTimeout]);

  /**
   * Handle camera user media success
   */
  const handleUserMedia = useCallback(() => {
    initializeReader();
    // Small delay to ensure video is ready
    setTimeout(() => {
      startScanning();
    }, 500);
  }, [initializeReader, startScanning]);

  /**
   * Handle camera user media error
   */
  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.error('Camera error:', err);
    setState('error');

    if (typeof err === 'string') {
      setError('unknown');
    } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('permission-denied');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setError('no-camera');
    } else {
      setError('unknown');
    }
  }, []);

  /**
   * Toggle between front and back camera
   */
  const handleToggleCamera = useCallback(() => {
    // Stop current scanning
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset state
    setState('loading');
    setError(null);

    // Toggle facing mode
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  /**
   * Retry scanning after error or timeout
   */
  const handleRetry = useCallback(() => {
    setState('loading');
    setError(null);
    setDetectedCode('');
  }, []);

  /**
   * Handle ESC key press
   */
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Handle overlay click (close on backdrop)
   */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Cleanup on unmount or close
   */
  useEffect(() => {
    if (isOpen) {
      // Store previous active element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus overlay
      overlayRef.current?.focus();

      // Add ESC listener
      document.addEventListener('keydown', handleEscKey);

      return () => {
        // Cleanup scanning
        if (scanningIntervalRef.current) {
          clearInterval(scanningIntervalRef.current);
          scanningIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Cleanup reader
        codeReaderRef.current = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Remove ESC listener
        document.removeEventListener('keydown', handleEscKey);

        // Restore focus
        previousActiveElement.current?.focus();

        // Reset state
        setState('loading');
        setError(null);
        setDetectedCode('');
      };
    }
  }, [isOpen, handleEscKey]);

  if (!isOpen) return null;

  /**
   * Render error messages
   */
  const renderErrorContent = () => {
    const errorMessages = {
      'no-camera': {
        title: 'No se encontró cámara',
        description: 'No se detectó ninguna cámara en tu dispositivo.',
      },
      'permission-denied': {
        title: 'Permiso denegado',
        description: 'Necesitamos permiso para acceder a tu cámara. Por favor, habilita el acceso en la configuración de tu navegador.',
      },
      'unknown': {
        title: 'Error desconocido',
        description: 'Ocurrió un error al acceder a la cámara. Por favor, intenta nuevamente.',
      },
    };

    const message = error ? errorMessages[error] : null;

    return (
      <S.ErrorContainer>
        <S.ErrorIcon>
          <FiAlertCircle size={64} />
        </S.ErrorIcon>
        <S.ErrorTitle>{message?.title || 'Error'}</S.ErrorTitle>
        <S.ErrorDescription>{message?.description || 'Ocurrió un error.'}</S.ErrorDescription>
        <S.RetryButton onClick={handleRetry}>
          Intentar nuevamente
        </S.RetryButton>
      </S.ErrorContainer>
    );
  };

  /**
   * Render timeout content
   */
  const renderTimeoutContent = () => (
    <S.ErrorContainer>
      <S.ErrorIcon>
        <FiAlertCircle size={64} />
      </S.ErrorIcon>
      <S.ErrorTitle>No se encontró código</S.ErrorTitle>
      <S.ErrorDescription>
        No pudimos detectar ningún código de barras. Asegúrate de que el código esté bien iluminado y enfocado.
      </S.ErrorDescription>
      <S.RetryButton onClick={handleRetry}>
        Intentar nuevamente
      </S.RetryButton>
    </S.ErrorContainer>
  );

  /**
   * Render loading content
   */
  const renderLoadingContent = () => (
    <S.LoadingContainer>
      <S.LoadingSpinner />
      <S.LoadingText>Iniciando cámara...</S.LoadingText>
    </S.LoadingContainer>
  );

  /**
   * Render success content
   */
  const renderSuccessContent = () => (
    <S.SuccessContainer>
      <S.SuccessIcon>
        <S.CheckmarkIcon>✓</S.CheckmarkIcon>
      </S.SuccessIcon>
      <S.SuccessTitle>¡Código detectado!</S.SuccessTitle>
      <S.SuccessCode>{detectedCode}</S.SuccessCode>
    </S.SuccessContainer>
  );

  /**
   * Render scanner content
   */
  const renderScannerContent = () => (
    <>
      <S.WebcamContainer>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </S.WebcamContainer>

      <S.ScanOverlay>
        <S.ScanGuide>
          <S.ScanFrame />
        </S.ScanGuide>
        <S.ScanInstructions>
          Coloca el código de barras dentro del marco
        </S.ScanInstructions>
      </S.ScanOverlay>

      <S.ToggleCameraButton
        onClick={handleToggleCamera}
        aria-label="Cambiar cámara"
      >
        <FiRotateCw size={24} />
      </S.ToggleCameraButton>
    </>
  );

  /**
   * Render content based on state
   */
  const renderContent = () => {
    switch (state) {
      case 'loading':
        return renderLoadingContent();
      case 'ready':
        return renderScannerContent();
      case 'success':
        return renderSuccessContent();
      case 'error':
        return renderErrorContent();
      case 'no-code-timeout':
        return renderTimeoutContent();
      default:
        return null;
    }
  };

  const scannerContent = (
    <S.ScannerOverlay
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Escáner de código de barras"
      tabIndex={-1}
    >
      <S.CloseButton onClick={onClose} aria-label="Cerrar escáner">
        <FiX size={24} />
      </S.CloseButton>

      <S.ScannerContent>{renderContent()}</S.ScannerContent>
    </S.ScannerOverlay>
  );

  return createPortal(scannerContent, document.body);
};

export default BarcodeScanner;
