// CA1.9: elección de la cámara del escáner. Funciones puras, sin DOM.

export type Camera = { deviceId: string; label: string };

/** Lo que se usa de `MediaDeviceInfo`; sin tipos del DOM para testear en workerd. */
export type DeviceInfo = { kind: string; deviceId: string; label: string };

/** Cámaras traseras con nombre. Los nombres solo existen después del permiso. */
export function backCameras(devices: DeviceInfo[]): Camera[] {
  return devices
    .filter((d) => d.kind === 'videoinput' && d.label && !/front|frontal|delantera/i.test(d.label))
    .map((d) => ({ deviceId: d.deviceId, label: d.label }));
}

/**
 * En iPhone, las cámaras virtuales "triple" y "dual wide" pasan solas al gran
 * angular al acercarse (macro); la 1x no enfoca a menos de ~20 cm. Safari
 * traduce los nombres, por eso se busca por palabras de ambos idiomas.
 * Sin ninguna, `undefined`: se queda la que abrió `facingMode: 'environment'`.
 */
export function preferredCamera(cameras: Camera[]): Camera | undefined {
  return (
    cameras.find((c) => /triple/i.test(c.label)) ??
    cameras.find((c) => /dual/i.test(c.label) && /wide|gran/i.test(c.label)) ??
    cameras.find((c) => /dual/i.test(c.label))
  );
}
