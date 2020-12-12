import React from "react";
import Editor from "react-simple-code-editor";
import * as babel from "@babel/core";
import { highlight, languages } from "prismjs";

import Variables from "./Variables";
import transformFactory from "../lib/transform";
import snapshot from "../lib/snapshot";
import "../styles/prism.css";

import styles from "../styles/App.module.css";
import { motion } from "framer-motion";

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

function findAllAverages(arr, k) {
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
  const [text, setText] = React.useState(initialText);
  const [results, setData] = React.useState([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    try {
      const newAlgorithm = transform(text);
      setActiveIndex(0);
      setData(newAlgorithm(...inputs));
    } catch (err) {
      console.log(err);
      // do nothing
    }
  }, [text]);

  const snapshots = results && results[1];
  const currentLine =
    snapshots && snapshots[activeIndex] && snapshots[activeIndex].line;
  return (
    <main className={styles.main}>
      <section className={styles.editor}>
        <Editor
          className="w-full h-full font-mono text-white bg-gray-900"
          onValueChange={(code) => setText(code)}
          padding={32}
          value={text}
          highlight={(code) => highlight(code, languages.javascript, "javascript")}
          preClassName="language-javascript line-numbers"
        />
        {currentLine && <HighlightLine lineNumber={currentLine} />}
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

function HighlightLine({ lineNumber }) {
  const Padding = 32;
  const LineHeight = 14 /* font size */ * 1.5; /* line height */
  const VisualOffset = 2;
  return (
    <motion.div
      layout
      style={{ top: Padding + (lineNumber - 1) * LineHeight - VisualOffset }}
      className="absolute left-0 h-6 w-full bg-gray-200 opacity-10 pointer-events-none"
    ></motion.div>
  );
}

export default App;
