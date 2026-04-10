import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(6px)',
    y: 40,
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
    y: -30,
    transition: {
      duration: 0.3,
      ease: [0.55, 0, 1, 0.45] as const,
    },
  },
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="marketing-theme min-h-screen flex flex-col overflow-x-hidden">
      <MarketingNav />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <MarketingFooter />
    </div>
  );
}
