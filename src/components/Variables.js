import equal from "fast-deep-equal";
import { motion, AnimateSharedLayout, AnimatePresence } from "framer-motion";

const Blacklist = new Set(["line"]);

export default function Variables({ params, vars = {}, prev }) {
  const values = Object.entries(vars).filter(([key]) => !Blacklist.has(key));
  const parameters = values.filter(([key]) => params.includes(key));
  const localVars = values.filter(([key]) => !params.includes(key));
  return (
    <AnimateSharedLayout>
      <section
        style={{ maxWidth: "40rem", maxHeight: "75%" }}
        className="font-mono w-full overflow-y-scroll"
      >
        <motion.h1 layout className="text-center mb-4">
          debugger @ line {vars.line}
        </motion.h1>
        <ul className="w-full">
          <motion.li layout className="mb-4">
            <motion.span layout>Parameters</motion.span>
            <VariableList vars={parameters} prev={prev} />
          </motion.li>
          <motion.li layout>
            <motion.span layout>Local Variables</motion.span>
            <VariableList vars={localVars} prev={prev} />
          </motion.li>
        </ul>
      </section>
    </AnimateSharedLayout>
  );
}

function VariableList({ vars, prev }) {
  return (
    <motion.ul layout className="mt-2">
      <AnimatePresence>
        {vars.map(([key, val]) => {
          const hasLast = prev && prev.hasOwnProperty(key);
          return (
            <motion.li
              key={key}
              layout
              className="flex w-full mb-2 break-words"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: hasLast && equal(prev[key], val) ? 0.2 : 1,
                y: 0,
              }}
              exit={{ opacity: 0, y: 10 }}
            >
              <VariableItem className="w-1/3 mr-2">{key}</VariableItem>
              <VariableItem className="w-2/3">{JSON.stringify(val)}</VariableItem>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
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
