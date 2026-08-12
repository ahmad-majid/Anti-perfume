import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
};

const transition = {
  duration: 0.35,
  ease: [0.25, 1, 0.5, 1],
};

/**
 * PageTransition — wraps route content with framer-motion fade+slide.
 * Place inside <Routes> as a parent, keyed by pathname.
 *
 * Usage (in App.jsx):
 *   <AnimatePresence mode="wait">
 *     <PageTransition key={location.pathname}>
 *       <Routes>...</Routes>
 *     </PageTransition>
 *   </AnimatePresence>
 */
const PageTransition = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={transition}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
