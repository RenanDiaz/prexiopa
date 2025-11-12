/**
 * Sistema de Animaciones y Transiciones de Prexiopá
 * Duraciones, easing functions y keyframes
 */

// ============================================
// TRANSICIONES
// ============================================

export const transitions = {
  // Duraciones
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },

  // Easing functions
  easing: {
    // Material Design standard
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Entrada (elementos apareciendo)
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Salida (elementos desapareciendo)
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Movimiento enfatizado
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    // Bouncy
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Transiciones predefinidas
  all: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  color: 'color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  background: 'background-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  border: 'border-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  shadow: 'box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Combos comunes
  fadeIn: 'opacity 300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
  fadeOut: 'opacity 200ms cubic-bezier(0.4, 0.0, 1, 1)',
  slideUp: 'transform 300ms cubic-bezier(0.0, 0.0, 0.2, 1), opacity 300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
  scaleIn: 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
};

// ============================================
// KEYFRAME ANIMATIONS
// ============================================

export const keyframes = {
  // Fade animations
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,

  // Slide animations
  slideInUp: `
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
  `,
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  scaleOut: `
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.9);
        opacity: 0;
      }
    }
  `,

  // Bounce animations
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,

  // Pulse animation
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  // Shimmer (skeleton loader)
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,

  // Spin (loaders)
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  // Shake animation
  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }
  `,

  // Swing animation
  swing: `
    @keyframes swing {
      20% {
        transform: rotate(15deg);
      }
      40% {
        transform: rotate(-10deg);
      }
      60% {
        transform: rotate(5deg);
      }
      80% {
        transform: rotate(-5deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
  `,

  // Prexiopá specific - Price drop notification
  priceDropPulse: `
    @keyframes priceDropPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(0, 200, 83, 0);
      }
    }
  `,

  // Favorite heart animation
  heartBeat: `
    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3);
      }
      50% {
        transform: scale(1.1);
      }
      75% {
        transform: scale(1.2);
      }
    }
  `,

  // Alert bell animation
  bellRing: `
    @keyframes bellRing {
      0%, 100% {
        transform: rotate(0deg);
      }
      10%, 30% {
        transform: rotate(-10deg);
      }
      20%, 40% {
        transform: rotate(10deg);
      }
    }
  `,

  // Discount badge pop
  badgePop: `
    @keyframes badgePop {
      0% {
        transform: scale(0) rotate(-45deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotate(5deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }
  `,

  // Loading dots
  loadingDots: `
    @keyframes loadingDots {
      0%, 80%, 100% {
        opacity: 0;
      }
      40% {
        opacity: 1;
      }
    }
  `,

  // Progress bar
  progressBar: `
    @keyframes progressBar {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `,
};

// ============================================
// ANIMATION HELPERS
// ============================================

/**
 * Helper para crear una animación personalizada
 */
export const createAnimation = (
  name: keyof typeof keyframes,
  duration: string = transitions.duration.normal,
  easing: string = transitions.easing.standard,
  iterationCount: string | number = 1
): string => {
  return `${name} ${duration} ${easing} ${iterationCount}`;
};

/**
 * Helper para delay de animación
 */
export const withDelay = (animation: string, delay: string): string => {
  return `${animation} ${delay}`;
};

// ============================================
// ANIMATION PRESETS
// ============================================

export const animationPresets = {
  // Entrada de elementos
  fadeInUp: createAnimation('slideInUp', transitions.duration.slow, transitions.easing.decelerate),
  fadeInDown: createAnimation('slideInDown', transitions.duration.slow, transitions.easing.decelerate),
  fadeInLeft: createAnimation('slideInLeft', transitions.duration.slow, transitions.easing.decelerate),
  fadeInRight: createAnimation('slideInRight', transitions.duration.slow, transitions.easing.decelerate),
  scaleInBounce: createAnimation('scaleIn', transitions.duration.normal, transitions.easing.bounce),

  // Loaders
  spinner: createAnimation('spin', '1s', 'linear', 'infinite'),
  pulseLoader: createAnimation('pulse', '1.5s', transitions.easing.standard, 'infinite'),
  shimmerLoader: createAnimation('shimmer', '2s', 'linear', 'infinite'),

  // Interacciones
  bounce: createAnimation('bounce', transitions.duration.slow, transitions.easing.standard, 'infinite'),
  shake: createAnimation('shake', '0.5s', transitions.easing.standard),
  swing: createAnimation('swing', '1s', transitions.easing.standard),

  // Prexiopá specific
  priceAlert: createAnimation('priceDropPulse', '2s', transitions.easing.standard, 'infinite'),
  favoriteClick: createAnimation('heartBeat', '0.6s', transitions.easing.bounce),
  notificationAlert: createAnimation('bellRing', '0.8s', transitions.easing.standard),
  discountBadge: createAnimation('badgePop', '0.5s', transitions.easing.bounce),
};

// ============================================
// EXPORT
// ============================================

export default {
  transitions,
  keyframes,
  animationPresets,
  createAnimation,
  withDelay,
};
