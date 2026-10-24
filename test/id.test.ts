import { describe, expect, it } from 'vitest';
import { newId } from '../worker/lib/id';

describe('newId (UUID v7)', () => {
  it('tiene formato UUID con versión 7 y variante RFC', () => {
    expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('se ordena por tiempo', () => {
    const ids = [newId(1_000), newId(2_000), newId(3_000)];
    expect([...ids].sort()).toEqual(ids);
  });
});
