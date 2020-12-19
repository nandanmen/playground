import equal from "fast-deep-equal";
import { motion, AnimateSharedLayout, AnimatePresence } from "framer-motion";

import styles from "./styles/Variables.module.css";

const Blacklist = new Set(["line", "__returnValue__"]);

export default function Variables({ params, vars = {}, prev }) {
  const values = Object.entries(vars).filter(([key]) => !Blacklist.has(key));
  const parameters = values.filter(([key]) => params.includes(key));
  const localVars = values.filter(([key]) => !params.includes(key));
  return (
    <AnimateSharedLayout>
      <section
        style={{ maxWidth: "40rem", height: "75%" }}
        className="font-mono w-full overflow-y-scroll flex flex-col justify-center"
      >
        {vars.line && (
          <motion.h1 layout className="text-center mb-4">
            debugger @ line {vars.line}
          </motion.h1>
        )}
        <ul className="w-full">
          <motion.li layout className="mb-4">
            <motion.span layout>Parameters</motion.span>
            <VariableList vars={parameters} prev={prev} />
          </motion.li>
          <AnimatePresence>
            {Object.keys(localVars).length ? (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                layout="position"
              >
                Local Variables
                <VariableList vars={localVars} prev={prev} />
              </motion.li>
            ) : null}
            {vars.hasOwnProperty("__returnValue__") && (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                layout="position"
                className={styles.return}
              >
                Return Value
                <VariableItem className="mt-2">
                  {JSON.stringify(vars.__returnValue__)}
                </VariableItem>
              </motion.li>
            )}
          </AnimatePresence>
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
              className={styles.pair}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: hasLast && equal(prev[key], val) ? 0.2 : 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
              }}
            >
              <VariableItem>{key}</VariableItem>
              <VariableItem>{JSON.stringify(val)}</VariableItem>
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
      className={`bg-gray-700 py-2 px-4 rounded-md break-words ${className}`}
      {...props}
    />
  );
}
