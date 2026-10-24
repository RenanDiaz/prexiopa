// Bindings que no están en wrangler.jsonc (y por eso no los genera `wrangler types`).
// Se declaran en ambos `Env` porque `wrangler types` genera dos interfaces independientes.
interface ExtraEnv {
  /** Secrets de producción (`wrangler secret put`); en local van en .dev.vars. */
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  /** Correos separados por coma que pueden entrar (spec D2). Vacío = nadie. */
  ALLOWED_EMAILS?: string;
  /** Solo en .dev.vars; ignorado salvo que ENVIRONMENT=development. */
  DEV_USER_EMAIL?: string;
}

interface Env extends ExtraEnv {}

declare namespace Cloudflare {
  interface Env extends ExtraEnv {}
}
