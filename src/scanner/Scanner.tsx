import { BrowserMultiFormatReader, BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { backCameras, preferredCamera, type Camera } from './cameras';
import styles from './Scanner.module.css';

// Chunk lazy (spec §6.6): se carga solo al abrir una pantalla con cámara.

type Props = {
  /** `qr`: factura CAFE (F1). `barcode`: EAN/UPC de un producto (F3). */
  mode: 'qr' | 'barcode';
  /** Se llama una sola vez, con el texto del primer código leído. */
  onResult: (text: string) => void;
  onError: (message: string) => void;
};

const STORAGE_KEY = 'prexiopa.camera';

// CA1.9: resolución alta para leer QR densos a media distancia.
const RESOLUTION = { width: { ideal: 1920 }, height: { ideal: 1080 } };

function createReader(mode: Props['mode']) {
  if (mode === 'qr') {
    // TRY_HARDER: los QR de la DGI son de alta densidad (CA1.1).
    return new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
  }
  const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E];
  return new BrowserMultiFormatReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, formats]]));
}

function loadCamera(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveCamera(deviceId: string | undefined) {
  try {
    if (deviceId) localStorage.setItem(STORAGE_KEY, deviceId);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento (privado, bloqueado): se vuelve a elegir sola cada vez.
  }
}

function activeDeviceId(video: HTMLVideoElement): string | undefined {
  const stream = video.srcObject;
  if (!(stream instanceof MediaStream)) return undefined;
  return stream.getVideoTracks()[0]?.getSettings().deviceId;
}

export default function Scanner({ mode, onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [deviceId, setDeviceId] = useState<string | undefined>(loadCamera);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const handleResult = useEffectEvent(onResult);
  const handleError = useEffectEvent(onError);

  // Al abrir la cámara: lista las traseras y, si no hay una elegida, cambia a la preferida.
  const handleStarted = useEffectEvent(async (video: HTMLVideoElement) => {
    const active = activeDeviceId(video);
    setActiveId(active);
    const found = await navigator.mediaDevices
      .enumerateDevices()
      .then(backCameras)
      .catch((): Camera[] => []);
    setCameras(found);
    if (deviceId) return;
    const preferred = preferredCamera(found);
    if (!preferred) return;
    saveCamera(preferred.deviceId);
    if (preferred.deviceId !== active) setDeviceId(preferred.deviceId);
  });

  const handleFailure = useEffectEvent((error: unknown) => {
    const name = error instanceof Error ? error.name : '';
    if (deviceId && (name === 'OverconstrainedError' || name === 'NotFoundError')) {
      // La cámara guardada ya no existe (otro teléfono, datos borrados): se elige de nuevo.
      saveCamera(undefined);
      setDeviceId(undefined);
      return;
    }
    handleError(name === 'NotAllowedError' ? 'No hay permiso para usar la cámara.' : 'No se pudo abrir la cámara.');
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reader = createReader(mode);
    let controls: IScannerControls | undefined;
    let stopped = false;
    const constraints = deviceId
      ? { deviceId: { exact: deviceId }, ...RESOLUTION }
      : { facingMode: 'environment', ...RESOLUTION };

    reader
      .decodeFromConstraints({ video: constraints }, video, (result, _error, ctrl) => {
        if (!result || stopped) return;
        stopped = true;
        ctrl.stop();
        handleResult(result.getText());
      })
      .then((ctrl) => {
        controls = ctrl;
        if (stopped) ctrl.stop();
        else void handleStarted(video);
      })
      .catch((error: unknown) => {
        if (!stopped) handleFailure(error);
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [mode, deviceId]);

  const current = cameras.findIndex((c) => c.deviceId === activeId);
  const switchCamera = () => {
    const next = cameras[(current + 1) % cameras.length];
    if (!next) return;
    saveCamera(next.deviceId);
    setDeviceId(next.deviceId);
  };

  return (
    <div>
      <video ref={videoRef} className={mode === 'qr' ? styles.square : styles.wide} muted playsInline />
      {cameras.length > 1 && (
        <button type="button" className={styles.switch} onClick={switchCamera}>
          Cambiar cámara
          {cameras[current] && <span className={styles.label}> · {cameras[current].label}</span>}
        </button>
      )}
    </div>
  );
}
