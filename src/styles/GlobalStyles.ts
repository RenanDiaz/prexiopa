/**
 * Estilos Globales de Prexiopá
 * CSS Reset, estilos base y configuración de fuentes
 */

import { createGlobalStyle } from 'styled-components';
import type { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  /* ============================================ */
  /* IMPORTAR FUENTES DE GOOGLE FONTS */
  /* ============================================ */
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;600;700&display=swap');

  /* ============================================ */
  /* CSS RESET - Modern Normalize */
  /* ============================================ */

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.default};
    overflow-x: hidden;
  }

  /* ============================================ */
  /* TIPOGRAFÍA */
  /* ============================================ */

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};

    @media (min-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    }
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};

    @media (min-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    }
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};

    @media (min-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }

  p {
    margin: 0;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }

  p:last-child {
    margin-bottom: 0;
  }

  a {
    color: ${({ theme }) => theme.colors.secondary[500]};
    text-decoration: none;
    transition: color 200ms ease;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary[600]};
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.border.focus};
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  strong, b {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }

  em, i {
    font-style: italic;
  }

  /* ============================================ */
  /* ELEMENTOS DE FORMULARIO */
  /* ============================================ */

  button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: inherit;
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
    opacity: 1;
  }

  /* ============================================ */
  /* LISTAS */
  /* ============================================ */

  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* ============================================ */
  /* IMÁGENES Y MEDIA */
  /* ============================================ */

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  /* ============================================ */
  /* TABLAS */
  /* ============================================ */

  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }

  /* ============================================ */
  /* SCROLLBAR PERSONALIZADO */
  /* ============================================ */

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[400]};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.neutral[500]};
    }
  }

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => `${theme.colors.neutral[400]} ${theme.colors.neutral[100]}`};
  }

  /* ============================================ */
  /* SELECCIÓN DE TEXTO */
  /* ============================================ */

  ::selection {
    background-color: ${({ theme }) => theme.colors.primary[200]};
    color: ${({ theme }) => theme.colors.primary[900]};
  }

  ::-moz-selection {
    background-color: ${({ theme }) => theme.colors.primary[200]};
    color: ${({ theme }) => theme.colors.primary[900]};
  }

  /* ============================================ */
  /* ACCESSIBILITY */
  /* ============================================ */

  /* Focus visible para navegación por teclado */
  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Ocultar elementos pero mantenerlos accesibles */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Skip link */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: ${({ theme }) => theme.colors.neutral[900]};
    color: ${({ theme }) => theme.colors.neutral[0]};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    text-decoration: none;
    z-index: ${({ theme }) => theme.zIndex.max};
    border-radius: 0 0 4px 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

    &:focus {
      top: 0;
      outline: 2px solid ${({ theme }) => theme.colors.border.focus};
      outline-offset: 2px;
    }
  }

  /* Respeta preferencia de animaciones reducidas */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* ============================================ */
  /* UTILIDADES GLOBALES */
  /* ============================================ */

  /* Container */
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ theme }) => theme.spacing[4]};
    padding-right: ${({ theme }) => theme.spacing[4]};

    @media (min-width: 640px) {
      max-width: 640px;
    }

    @media (min-width: 768px) {
      max-width: 768px;
      padding-left: ${({ theme }) => theme.spacing[6]};
      padding-right: ${({ theme }) => theme.spacing[6]};
    }

    @media (min-width: 1024px) {
      max-width: 1024px;
      padding-left: ${({ theme }) => theme.spacing[8]};
      padding-right: ${({ theme }) => theme.spacing[8]};
    }

    @media (min-width: 1280px) {
      max-width: 1280px;
    }

    @media (min-width: 1536px) {
      max-width: 1536px;
    }
  }

  /* Text truncate */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Line clamp */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ============================================ */
  /* KEYFRAMES GLOBALES */
  /* ============================================ */

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* ============================================ */
  /* REACT TOASTIFY CUSTOM STYLES */
  /* ============================================ */

  .Toastify__toast {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .Toastify__toast--success {
    background-color: ${({ theme }) => theme.colors.semantic.success.main};
  }

  .Toastify__toast--error {
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
  }

  .Toastify__toast--warning {
    background-color: ${({ theme }) => theme.colors.semantic.warning.main};
  }

  .Toastify__toast--info {
    background-color: ${({ theme }) => theme.colors.semantic.info.main};
  }

  /* ============================================ */
  /* PRINT STYLES */
  /* ============================================ */

  @media print {
    *,
    *::before,
    *::after {
      background: transparent !important;
      color: #000 !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    a,
    a:visited {
      text-decoration: underline;
    }

    a[href]::after {
      content: " (" attr(href) ")";
    }

    img {
      page-break-inside: avoid;
      max-width: 100% !important;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    p {
      orphans: 3;
      widows: 3;
    }
  }
`;

export default GlobalStyles;
