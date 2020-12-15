import { AnimatePresence, motion } from "framer-motion";

export default function ErrorPopup({ error, className, ...props }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className={`rounded-lg shadow-lg p-4 bg-red-800 font-mono text-white ${className}`}
          {...props}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
