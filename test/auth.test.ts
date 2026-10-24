import { describe, expect, it } from 'vitest';
import { createApp } from '../worker/index';
import { accessKeys, devEnv, prodEnv } from './helpers';

describe('auth con Cloudflare Access', () => {
  it('rechaza requests sin token', async () => {
    const res = await createApp().request('/api/me', {}, prodEnv());
    expect(res.status).toBe(401);
  });

  it('ignora DEV_USER_EMAIL fuera de development', async () => {
    const res = await createApp().request('/api/me', {}, prodEnv({ DEV_USER_EMAIL: 'intruso@example.com' }));
    expect(res.status).toBe(401);
  });

  it('acepta un JWT válido y normaliza el email', async () => {
    const { app, sign } = await accessKeys();
    const token = await sign({ email: ' Renan@Example.com ' });
    const res = await app.request('/api/me', { headers: { 'Cf-Access-Jwt-Assertion': token } }, prodEnv());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'renan@example.com' });
  });

  it.each([
    ['audiencia equivocada', { aud: 'otra-app' }],
    ['emisor equivocado', { iss: 'https://otro-team.cloudflareaccess.com' }],
    ['token expirado', { exp: '-1m' }],
    ['token sin email', { email: undefined }],
  ])('rechaza %s', async (_, claims) => {
    const { app, sign } = await accessKeys();
    const token = await sign({ email: 'renan@example.com', ...claims });
    const res = await app.request('/api/me', { headers: { 'Cf-Access-Jwt-Assertion': token } }, prodEnv());
    expect(res.status).toBe(401);
  });

  it('rechaza un JWT firmado con otra llave', async () => {
    const { app } = await accessKeys();
    const { sign: signOther } = await accessKeys();
    const token = await signOther({ email: 'renan@example.com' });
    const res = await app.request('/api/me', { headers: { 'Cf-Access-Jwt-Assertion': token } }, prodEnv());
    expect(res.status).toBe(401);
  });

  it('falla cerrado si Access no está configurado', async () => {
    const { app, sign } = await accessKeys();
    const token = await sign({ email: 'renan@example.com' });
    const res = await app.request(
      '/api/me',
      { headers: { 'Cf-Access-Jwt-Assertion': token } },
      prodEnv({ ACCESS_AUD: '' }),
    );
    expect(res.status).toBe(500);
  });

  it('permite el bypass solo con ENVIRONMENT=development', async () => {
    const res = await createApp().request('/api/me', {}, devEnv('dev@example.com'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'dev@example.com' });
  });
});
