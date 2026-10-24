import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { createApp } from '../worker/index';
import { devEnv, prodEnv, sessionHeaders } from './helpers';

describe('auth con Better Auth', () => {
  it('rechaza requests sin sesión', async () => {
    const res = await createApp().request('/api/me', {}, prodEnv());
    expect(res.status).toBe(401);
  });

  it('ignora DEV_USER_EMAIL fuera de development', async () => {
    const res = await createApp().request('/api/me', {}, prodEnv({ DEV_USER_EMAIL: 'intruso@example.com' }));
    expect(res.status).toBe(401);
  });

  it('acepta una sesión válida y normaliza el email', async () => {
    const headers = await sessionHeaders('Renan@Example.com');
    const res = await createApp().request('/api/me', { headers }, prodEnv());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'renan@example.com' });
  });

  it('rechaza una cookie firmada con otro secreto', async () => {
    const headers = await sessionHeaders('renan@example.com', {
      BETTER_AUTH_SECRET: 'otro-secreto-de-prueba-con-al-menos-32-caracteres',
    });
    const res = await createApp().request('/api/me', { headers }, prodEnv());
    expect(res.status).toBe(401);
  });

  it('rechaza una sesión expirada', async () => {
    const headers = await sessionHeaders('renan@example.com');
    await env.DB.prepare('UPDATE auth_sessions SET expires_at = ?').bind(Date.now() - 60_000).run();
    const res = await createApp().request('/api/me', { headers }, prodEnv());
    expect(res.status).toBe(401);
  });

  it('corta la sesión de un correo que ya no está en ALLOWED_EMAILS', async () => {
    const headers = await sessionHeaders('renan@example.com');
    const res = await createApp().request('/api/me', { headers }, prodEnv({ ALLOWED_EMAILS: 'familia@example.com' }));
    expect(res.status).toBe(403);
  });

  it('no registra correos fuera de ALLOWED_EMAILS', async () => {
    await expect(sessionHeaders('intruso@example.com')).rejects.toThrow(/no tiene acceso/);
  });

  it('falla cerrado si Better Auth no está configurado', async () => {
    const headers = await sessionHeaders('renan@example.com');
    const res = await createApp().request('/api/me', { headers }, prodEnv({ BETTER_AUTH_SECRET: '' }));
    expect(res.status).toBe(500);
  });

  it('inicia el login con Google redirigiendo al dominio configurado', async () => {
    const res = await createApp().request(
      '/api/auth/sign-in/social',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://prexiopa.test' },
        body: JSON.stringify({ provider: 'google', callbackURL: '/' }),
      },
      prodEnv(),
    );
    expect(res.status).toBe(200);
    const { url } = await res.json<{ url: string }>();
    const google = new URL(url);
    expect(google.hostname).toBe('accounts.google.com');
    expect(google.searchParams.get('redirect_uri')).toBe('https://prexiopa.test/api/auth/callback/google');
  });

  it('permite el bypass solo con ENVIRONMENT=development', async () => {
    const res = await createApp().request('/api/me', {}, devEnv('dev@example.com'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'dev@example.com' });
  });
});
