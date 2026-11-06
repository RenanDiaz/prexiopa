import { describe, expect, it } from 'vitest';
import { backCameras, preferredCamera } from '../src/scanner/cameras';

// CA1.9 — elegir la cámara trasera que enfoca de cerca.

const dev = (label: string, deviceId = label) => ({ kind: 'videoinput', deviceId, label });

const iphone13ProEn = [
  dev('Front Camera'),
  dev('Back Camera'),
  dev('Back Telephoto Camera'),
  dev('Back Ultra Wide Camera'),
  dev('Back Dual Camera'),
  dev('Back Dual Wide Camera'),
  dev('Back Triple Camera'),
];

describe('backCameras (CA1.9)', () => {
  it('descarta la frontal, los dispositivos sin nombre y los que no son video', () => {
    const devices = [
      ...iphone13ProEn,
      dev('Cámara frontal'),
      dev(''),
      { kind: 'audioinput', deviceId: 'mic', label: 'iPhone Micrófono' },
    ];
    expect(backCameras(devices).map((c) => c.label)).toEqual(iphone13ProEn.slice(1).map((d) => d.label));
  });

  it('Android: descarta "facing front"', () => {
    const labels = backCameras([dev('camera2 1, facing front'), dev('camera2 0, facing back')]).map((c) => c.label);
    expect(labels).toEqual(['camera2 0, facing back']);
  });
});

describe('preferredCamera (CA1.9)', () => {
  it('iPhone Pro en inglés: prefiere la triple', () => {
    expect(preferredCamera(backCameras(iphone13ProEn))?.label).toBe('Back Triple Camera');
  });

  it('nombres en español: también encuentra la triple', () => {
    const cams = backCameras([dev('Cámara trasera'), dev('Cámara trasera gran angular dual'), dev('Cámara trasera triple')]);
    expect(preferredCamera(cams)?.label).toBe('Cámara trasera triple');
  });

  it('sin triple: prefiere la dual wide sobre la dual', () => {
    const cams = backCameras([dev('Back Camera'), dev('Back Dual Camera'), dev('Back Dual Wide Camera')]);
    expect(preferredCamera(cams)?.label).toBe('Back Dual Wide Camera');
  });

  it('sin cámaras virtuales: no elige nada y se queda la de facingMode', () => {
    expect(preferredCamera(backCameras([dev('Back Camera'), dev('camera2 0, facing back')]))).toBeUndefined();
  });
});
