import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

// Router mínimo sobre la History API: son 3 pantallas y no justifican una librería.

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (options.replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.scrollTo(0, 0);
  listeners.forEach((listener) => listener());
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** Coincide `/compras/:id` con `/compras/abc` → { id: 'abc' }. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const parts = pattern.split('/');
  const actual = path.split('/');
  if (parts.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(actual[i]!);
    else if (part !== actual[i]) return null;
  }
  return params;
}

export function Link({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...props} />;
}
