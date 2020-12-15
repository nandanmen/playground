import React from "react";
import Runner from "./runner.worker";

const defaultOptions = {
  timeout: 2000,
  onComplete: () => {},
  onError: () => {},
  onStart: () => {},
};

export default function useCode(code, initialInputs, opts = {}) {
  const [isProcessing, setProcessing] = React.useState(false);
  const [snapshots, setSnapshots] = React.useState(null);
  const [inputs, setInputs] = React.useState(initialInputs);

  React.useEffect(() => {
    const options = { ...defaultOptions, ...opts };

    options.onStart();
    setProcessing(true);
    const worker = new Runner();

    /**
     * Set a timer for how long the algorithm should run for. If this timer goes
     * through, we know the algorithm took too long to run.
     */
    const timeout = setTimeout(() => {
      worker.terminate();
      setProcessing(false);
      options.onError(new Error(`Timed out while running algorithm`));
    }, options.timeout);

    /**
     * The worker sends back a message when it completes running the algorithm.
     * When this happens, we want to:
     *
     * 1. Clear the timer
     * 2. Check if the parameter _names_ have changed or if any parameters were
     *    added or removed. If so, update the input state to reflect that change.
     * 3. Finally, update the snapshots with new data and stop the process.
     */
    worker.addEventListener("message", (evt) => {
      clearTimeout(timeout);

      if (areParamsDifferent(evt.data.params, inputs)) {
        setInputs(
          evt.data.params.map((param, index) => {
            const prevParam = inputs[index];
            /**
             * If there's a match we know the input was only renamed. In that case,
             * we want to preserve the current value of the input.
             */
            if (prevParam) {
              return [param, prevParam[1]];
            }
            return [param, undefined];
          })
        );
      }
      setSnapshots(evt.data.snapshots);

      worker.terminate();
      setProcessing(false);
      options.onComplete(evt);
    });

    worker.addEventListener("error", (evt) => {
      clearTimeout(timeout);
      setProcessing(false);
      options.onError(evt);
    });

    worker.postMessage({
      inputs: inputs.map((input) => input[1]),
      code,
    });

    return () => {
      worker.terminate();
      clearTimeout(timeout);
    };
  }, [code, inputs, opts]);

  return { isProcessing, snapshots, inputs, actions: { setInputs } };
}

function areParamsDifferent(params, inputs) {
  if (params.length !== inputs.length) {
    return true;
  }
  return params.some((param, index) => {
    const match = inputs[index];
    return !match || match[0] !== param;
  });
}
