import clsx from "clsx";
import { motion, AnimateSharedLayout, AnimatePresence } from "framer-motion";

const Blacklist = new Set(["line"]);

export default function Variables({ vars, prev }) {
  return (
    <AnimateSharedLayout>
      <section style={{ maxWidth: "50rem" }} className="font-mono w-full">
        <h1 className="text-center mb-4">debugger @ line {vars.line}</h1>
        <ul className="w-full">
          <AnimatePresence>
            {Object.entries(vars)
              .filter(([key]) => !Blacklist.has(key))
              .map(([key, val]) => {
                const hasLast = prev && prev.hasOwnProperty(key);
                return (
                  <motion.li
                    key={key}
                    layout
                    className="flex w-full mb-2 break-words"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hasLast && prev[key] === vars[key] ? 0.2 : 1,
                      y: 0,
                    }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <motion.div
                      layout
                      className="bg-gray-700 w-1/2 py-2 px-4 rounded-md mr-2"
                    >
                      {key}
                    </motion.div>
                    <motion.div
                      layout
                      className="bg-gray-600 w-1/2 py-2 px-4 rounded-md"
                    >
                      {JSON.stringify(val)}
                    </motion.div>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ul>
      </section>
    </AnimateSharedLayout>
  );
}
