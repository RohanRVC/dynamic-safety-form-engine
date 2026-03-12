/**
 * Shared Framer Motion presets for consistent, smooth animations (no feature changes).
 */
export const spring = {
  smooth: { type: "spring", stiffness: 380, damping: 32 },
  gentle: { type: "spring", stiffness: 260, damping: 28 },
  snappy: { type: "spring", stiffness: 500, damping: 35 },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring.smooth, delay: i * 0.04 },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: spring.smooth },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: spring.gentle },
};
