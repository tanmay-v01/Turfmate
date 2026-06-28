import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function PageTransition({ children, keyId }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId || 'page'}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
