// Bindings que no están en wrangler.jsonc (y por eso no los genera `wrangler types`).
// Se declaran en ambos `Env` porque `wrangler types` genera dos interfaces independientes.
interface ExtraEnv {
  /** Solo en .dev.vars; ignorado salvo que ENVIRONMENT=development. */
  DEV_USER_EMAIL?: string;
}

interface Env extends ExtraEnv {}

declare namespace Cloudflare {
  interface Env extends ExtraEnv {}
}
