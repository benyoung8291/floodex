import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

// Keep content readable even if IntersectionObserver never fires (iPad/Safari).
// Only translate — never start at opacity 0.
const fadeUp: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 1, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const inView = { once: true, amount: 0, margin: "80px 0px 80px 0px" } as const;

export const AnimateIn = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={inView}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={stagger}
    initial="hidden"
    whileInView="visible"
    viewport={inView}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={scaleIn}
    initial="hidden"
    whileInView="visible"
    viewport={inView}
    className={className}
  >
    {children}
  </motion.div>
);
