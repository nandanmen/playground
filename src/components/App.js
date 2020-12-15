import React from "react";
import { useDebounce } from "use-debounce";

import Variables from "./Variables";
import Editor from "./Editor";
import Overlay from "./Overlay";
import Runner from "../lib/runner.worker";
import styles from "../styles/App.module.css";

const DemoAlgorithm = {
  code: `/**
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
`,
  inputs: [
    ["arr", [1, 3, 2, 6, -1, 4, 1, 8, 2]],
    ["k", 3],
  ],
};

const DebounceDelay = 600;
const RuntimeTimeout = 2000;

function areParamsDifferent(params, inputs) {
  if (params.length !== inputs.length) {
    return true;
  }
  return params.some((param, index) => {
    const match = inputs[index];
    return !match || match[0] !== param;
  });
}

function App() {
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [text, setText] = React.useState(DemoAlgorithm.code);
  const [debouncedText] = useDebounce(text, DebounceDelay);
  const [results, setResults] = React.useState(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [inputs, setInputs] = React.useState(DemoAlgorithm.inputs);

  React.useEffect(() => {
    setProcessing(true);
    const worker = new Runner();

    const timeout = setTimeout(() => {
      console.error(`Timed out while running algorithm`);
      worker.terminate();
      setProcessing(false);
    }, RuntimeTimeout);

    worker.addEventListener("message", (evt) => {
      clearTimeout(timeout);

      if (areParamsDifferent(evt.data.params, inputs)) {
        setInputs(
          evt.data.params.map((param, index) => {
            const prevParam = inputs[index];
            if (prevParam) {
              return [param, prevParam[1]];
            }
            return [param, undefined];
          })
        );
      }
      setResults(evt.data);

      worker.terminate();
      setProcessing(false);
    });

    worker.addEventListener("error", (evt) => {
      clearTimeout(timeout);
      setProcessing(false);
    });

    worker.postMessage({
      code: debouncedText,
      inputs: inputs.map((input) => input[1]),
    });

    return () => {
      worker.terminate();
      clearTimeout(timeout);
    };
  }, [debouncedText, inputs]);

  const handleInputChange = (evt) => {
    const newInputs = [...inputs];
    const inputValue = newInputs.find(([name]) => name === evt.target.name);
    if (inputValue) {
      inputValue[1] = JSON.parse(evt.target.value);
      setInputs(newInputs);
    }
  };

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
            {inputs.length && (
              <form className={styles.arguments}>
                {inputs.map(([name, value]) => (
                  <label key={name} style={{ flex: 1 }} className="mr-2">
                    <input
                      name={name}
                      className="w-full p-2 rounded-md"
                      type="text"
                      defaultValue={JSON.stringify(value)}
                      onBlur={handleInputChange}
                    />
                    <span className="block text-white">{name}</span>
                  </label>
                ))}
              </form>
            )}
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
