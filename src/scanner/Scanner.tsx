import { BrowserMultiFormatReader, BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { useEffect, useEffectEvent, useRef } from 'react';
import styles from './Scanner.module.css';

// Chunk lazy (spec §6.6): se carga solo al abrir una pantalla con cámara.

type Props = {
  /** `qr`: factura CAFE (F1). `barcode`: EAN/UPC de un producto (F3). */
  mode: 'qr' | 'barcode';
  /** Se llama una sola vez, con el texto del primer código leído. */
  onResult: (text: string) => void;
  onError: (message: string) => void;
};

function createReader(mode: Props['mode']) {
  if (mode === 'qr') {
    // TRY_HARDER: los QR de la DGI son de alta densidad (CA1.1).
    return new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
  }
  const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E];
  return new BrowserMultiFormatReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, formats]]));
}

export default function Scanner({ mode, onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleResult = useEffectEvent(onResult);
  const handleError = useEffectEvent(onError);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reader = createReader(mode);
    let controls: IScannerControls | undefined;
    let stopped = false;

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, video, (result, _error, ctrl) => {
        if (!result || stopped) return;
        stopped = true;
        ctrl.stop();
        handleResult(result.getText());
      })
      .then((ctrl) => {
        controls = ctrl;
        if (stopped) ctrl.stop();
      })
      .catch((error: unknown) => {
        const name = error instanceof Error ? error.name : '';
        handleError(
          name === 'NotAllowedError'
            ? 'No hay permiso para usar la cámara.'
            : 'No se pudo abrir la cámara.',
        );
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [mode]);

  return <video ref={videoRef} className={mode === 'qr' ? styles.square : styles.wide} muted playsInline />;
}
