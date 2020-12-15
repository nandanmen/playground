import React from "react";

import useCode from "../lib/useCode";

import Variables from "./Variables";
import DebouncedEditor from "./DebouncedEditor";
import Overlay from "./Overlay";
import ErrorPopup from "./ErrorPopup";
import styles from "./styles/App.module.css";

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

function App() {
  const [loading, setLoading] = React.useState(true);
  const [code, setCode] = React.useState(DemoAlgorithm.code);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [error, setError] = React.useState(null);
  const options = React.useMemo(
    () => ({
      timeout: RuntimeTimeout,
      onStart: () => setError(null),
      onComplete: () => setActiveIndex(0),
      onError: ({ message }) => setError(message),
    }),
    []
  );
  const { isProcessing, snapshots, inputs, actions } = useCode(
    code,
    DemoAlgorithm.inputs,
    options
  );

  const handleInputChange = (evt) => {
    const newInputs = [...inputs];
    const inputValue = newInputs.find(([name]) => name === evt.target.name);
    if (inputValue) {
      inputValue[1] = JSON.parse(evt.target.value);
      actions.setInputs(newInputs);
    }
  };

  return (
    <main className={styles.main}>
      <Overlay show={loading} initial={{ opacity: 1 }} />
      <section className={styles.editor}>
        <DebouncedEditor
          initialValue={code}
          delay={DebounceDelay}
          onChange={(newCode) => setCode(newCode)}
          onMount={() => setLoading(false)}
        />
      </section>
      <section className={styles.visualizer}>
        <Overlay show={isProcessing && !loading} className="bg-opacity-60" />
        {snapshots && snapshots.length ? (
          <>
            <Variables
              vars={snapshots[activeIndex]}
              prev={snapshots[activeIndex - 1]}
            />
            <ErrorPopup error={error} style={{ top: "8rem" }} />
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
