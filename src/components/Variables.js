import equal from "fast-deep-equal";
import { motion, AnimateSharedLayout, AnimatePresence } from "framer-motion";

const Blacklist = new Set(["line"]);

export default function Variables({ vars = {}, prev }) {
  const values = Object.entries(vars).filter(([key]) => !Blacklist.has(key));
  values.sort(compareKeysAlphabetically);
  return (
    <AnimateSharedLayout>
      <section style={{ maxWidth: "40rem" }} className="font-mono w-full">
        <motion.h1 layout className="text-center mb-4">
          debugger @ line {vars.line}
        </motion.h1>
        <ul className="w-full">
          <AnimatePresence>
            {values.map(([key, val]) => {
              const hasLast = prev && prev.hasOwnProperty(key);
              return (
                <motion.li
                  key={key}
                  layout
                  className="flex w-full mb-2 break-words"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: hasLast && equal(prev[key], vars[key]) ? 0.2 : 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <VariableItem className="w-1/3 mr-2">{key}</VariableItem>
                  <VariableItem className="w-2/3">
                    {JSON.stringify(val)}
                  </VariableItem>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </section>
    </AnimateSharedLayout>
  );
}

function VariableItem({ className = "", ...props }) {
  return (
    <motion.div
      layout
      className={`bg-gray-700 py-2 px-4 rounded-md ${className}`}
      {...props}
    />
  );
}

function compareKeysAlphabetically([key1], [key2]) {
  return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
}
