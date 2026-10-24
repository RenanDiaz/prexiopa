import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { useEffect, useEffectEvent, useRef } from 'react';
import styles from './QrScanner.module.css';

// Chunk lazy (spec §6.6): se carga solo al abrir la pantalla de importar.

type Props = {
  /** Se llama una sola vez, con el texto del primer QR leído. */
  onResult: (text: string) => void;
  onError: (message: string) => void;
};

export default function QrScanner({ onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleResult = useEffectEvent(onResult);
  const handleError = useEffectEvent(onError);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // TRY_HARDER: los QR de la DGI son de alta densidad (CA1.1).
    const reader = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
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
  }, []);

  return <video ref={videoRef} className={styles.video} muted playsInline />;
}
