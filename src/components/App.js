import React from "react";
import * as babel from "@babel/core";
import { ControlledEditor, monaco } from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";

import Variables from "./Variables";
import transformFactory from "../lib/transform";
import snapshot from "../lib/snapshot";

import theme from "../styles/theme.json";
import styles from "../styles/App.module.css";

monaco.init().then((monaco) => {
  monaco.editor.defineTheme("night-owl", theme);
});

function transform(input) {
  const out = babel.transform(input, { plugins: [transformFactory] });
  /**
   * This empty `require` is used within the `eval` to load the snapshot
   * builder. The `snapshot` variable here can be changed to any other
   * snapshot implementation.
   */
  // eslint-disable-next-line no-unused-vars
  const require = () => snapshot;
  // eslint-disable-next-line no-eval
  return eval(out.code);
}

const initialText = `/**
 * Export default a function with a debugger statement and 
 * watch it run on the right :)
 */ 

export default function findAllAverages(arr, k) {
  const result = [];
  let windowStart = 0;
  let windowSum = 0;

  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    debugger;
    if (windowEnd >= k - 1) {
      result.push((windowSum / k).toFixed(2));
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }

  debugger;
  return result;
}
`;

const inputs = [[1, 3, 2, 6, -1, 4, 1, 8, 2], 3];

function App() {
  const [loading, setLoading] = React.useState(true);
  const [text, setText] = React.useState(initialText);
  const [results, setData] = React.useState([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    try {
      const { __params, __entryPoint } = transform(text);
      console.log(__params);
      setActiveIndex(0);
      setData(__entryPoint(...inputs));
    } catch (err) {
      console.log(err);
      // do nothing
    }
  }, [text]);

  const snapshots = results && results[1];

  return (
    <main className={styles.main}>
      <AnimatePresence>
        {loading && (
          <motion.div exit={{ opacity: 0 }} className={styles.loader}>
            Loading...
          </motion.div>
        )}
      </AnimatePresence>
      <section className={styles.editor}>
        <ControlledEditor
          onChange={(_, code) => setText(code)}
          value={text}
          language="javascript"
          theme="night-owl"
          options={{
            fontFamily: "'Input Mono', Menlo, 'Courier New', monospace",
            fontSize: 14,
            scrollbar: {
              vertical: "hidden",
            },
            minimap: {
              enabled: false,
            },
          }}
          editorDidMount={() => setLoading(false)}
        />
      </section>
      <section className={styles.visualizer}>
        {snapshots ? (
          <>
            <Variables
              vars={snapshots[activeIndex]}
              prev={snapshots[activeIndex - 1]}
            />
            <form className={styles.arguments}>
              <label style={{ flex: 1 }} className="mr-2">
                <input
                  className="w-full p-2 rounded-md"
                  type="text"
                  value={JSON.stringify(inputs[0])}
                />
                <span className="block text-white">arr</span>
              </label>
              <label style={{ flex: 1 }} className="ml-2">
                <input
                  className="w-full p-2 rounded-md"
                  type="text"
                  value={JSON.stringify(inputs[1])}
                />
                <span className="block text-white">k</span>
              </label>
            </form>
            <div className={styles.controls}>
              <button
                className={styles.button}
                onClick={() => setActiveIndex(Math.max(activeIndex - 1, 0))}
              >
                Prev
              </button>
              <p className="mx-4">
                {activeIndex + 1} / {results[1].length}
              </p>
              <button
                className={styles.button}
                onClick={() =>
                  setActiveIndex(Math.min(activeIndex + 1, results[1].length - 1))
                }
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>Please return a value from your function.</p>
        )}
      </section>
    </main>
  );
}

export default App;
