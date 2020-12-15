import { AnimatePresence, motion } from "framer-motion";

export default function ErrorPopup({ error, ...props }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.pre
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className="fixed rounded-lg shadow-lg p-4 bg-red-800 font-mono text-white"
          {...props}
        >
          {error}
        </motion.pre>
      )}
    </AnimatePresence>
  );
}
