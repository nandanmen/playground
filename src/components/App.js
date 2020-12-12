import React from "react";
import Editor from "react-simple-code-editor";
import * as babel from "@babel/core";
import { highlight, languages } from "prismjs";

import Variables from "./Variables";
import transformFactory from "../lib/transform";
import snapshot from "../lib/snapshot";
import "../styles/prism.css";

import styles from "../styles/App.module.css";

function transform(input) {
  const out = babel.transform(input, { plugins: [transformFactory] });
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

  return (
    <main className={styles.main}>
      <section className={styles.editor}>
        <Editor
          className="w-full h-full font-mono text-white bg-gray-900"
          onValueChange={(code) => setText(code)}
          padding={32}
          value={text}
          highlight={(code) => highlight(code, languages.javascript, "javascript")}
          preClassName="language-javascript"
        />
      </section>
      <section className={styles.visualizer}>
        {results && results[1] ? (
          <>
            <Variables
              vars={results[1][activeIndex]}
              prev={results[1][activeIndex - 1]}
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
