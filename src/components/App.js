import React from "react";
import { useDebounce } from "use-debounce";

import Variables from "./Variables";
import Editor from "./Editor";
import Overlay from "./Overlay";
import Runner from "../lib/runner.worker";
import styles from "../styles/App.module.css";

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

const DebounceDelay = 600;

function App() {
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [text, setText] = React.useState(initialText);
  const [debouncedText] = useDebounce(text, DebounceDelay);
  const [results, setResults] = React.useState(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setProcessing(true);
    const worker = new Runner();

    const timeout = setTimeout(() => {
      console.error(`Timed out while running algorithm`);
      worker.terminate();
      setProcessing(false);
    }, 2000);

    worker.addEventListener("message", (evt) => {
      clearTimeout(timeout);
      setResults(evt.data);
      worker.terminate();
      setProcessing(false);
    });

    worker.addEventListener("error", (evt) => {
      clearTimeout(timeout);
      setProcessing(false);
    });

    worker.postMessage({ code: debouncedText, inputs });

    return () => {
      worker.terminate();
      clearTimeout(timeout);
    };
  }, [debouncedText]);

  const snapshots = results && results.snapshots;
  return (
    <main className={styles.main}>
      <Overlay show={loading} initial={{ opacity: 1 }} />
      <section className={styles.editor}>
        <Editor
          onChange={(code) => setText(code)}
          value={text}
          onMount={() => setLoading(false)}
        />
      </section>
      <section className={styles.visualizer}>
        <Overlay show={processing && !loading} className="bg-opacity-60" />
        {snapshots && snapshots.length ? (
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
                {activeIndex + 1} / {snapshots.length}
              </p>
              <button
                className={styles.button}
                onClick={() =>
                  setActiveIndex(Math.min(activeIndex + 1, snapshots.length - 1))
                }
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>
            Add a <code>debugger</code> statement to your code to get started.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
