/* eslint-disable no-restricted-globals */
import * as babel from "@babel/core";

import transformFactory from "./transform";
import snapshot from "./snapshot";

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

self.addEventListener("message", (evt) => {
  const { code, inputs } = evt.data;
  const { entryPoint, snapshots, params } = transform(code);
  postMessage({
    returnValue: entryPoint(...inputs),
    snapshots: snapshots.data,
    params,
  });
});
