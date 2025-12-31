import { motion } from 'framer-motion';

// Fade in from bottom animation
export const FadeInUp = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade in from left animation
export const FadeInLeft = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: -40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade in from right animation
export const FadeInRight = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Simple fade in animation
export const FadeIn = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale up animation
export const ScaleIn = ({ children, delay = 0, duration = 0.5, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered container for list items
export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      visible: {
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered item (use inside StaggerContainer)
export const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1]
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Interactive card with hover lift effect
export const HoverCard = ({ children, className = '', scale = 1.02 }) => (
  <motion.div
    whileHover={{ y: -8, scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Button with press effect
export const AnimatedButton = ({ children, className = '', onClick, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className={className}
    onClick={onClick}
    {...props}
  >
    {children}
  </motion.button>
);

// Section header animation
export const SectionHeader = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated underline
export const AnimatedUnderline = ({ className = '' }) => (
  <motion.div
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    className={`origin-left ${className}`}
  />
);

// Parallax scroll effect
export const ParallaxSection = ({ children, offset = 50, className = '' }) => (
  <motion.div
    initial={{ y: offset }}
    whileInView={{ y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Counter animation for numbers
export const AnimatedCounter = ({ value, duration = 2, className = '' }) => (
  <motion.span
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className={className}
  >
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {value}
    </motion.span>
  </motion.span>
);

// Image reveal animation
export const ImageReveal = ({ children, direction = 'up', className = '' }) => {
  const directions = {
    up: { clipPath: 'inset(100% 0% 0% 0%)' },
    down: { clipPath: 'inset(0% 0% 100% 0%)' },
    left: { clipPath: 'inset(0% 100% 0% 0%)' },
    right: { clipPath: 'inset(0% 0% 0% 100%)' }
  };

  return (
    <motion.div
      initial={directions[direction]}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
