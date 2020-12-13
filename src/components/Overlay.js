import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles/Overlay.module.css";

export default function Overlay({
  show,
  className,
  children = "Loading...",
  ...props
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${styles.overlay} bg-gray-900 ${className}`}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
