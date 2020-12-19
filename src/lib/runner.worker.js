import transpile from "./transform/transpile";

// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", (evt) => {
  const { code, inputs } = evt.data;
  let { entryPoint, snapshots, params } = transpile(code);
  const returnValue = entryPoint(...inputs);
  snapshots = cleanSnapshots(snapshots.data);
  snapshots = pad(snapshots, returnValue, inputs, params);
  postMessage({ snapshots, params });
});

function cleanSnapshots(snapshots) {
  return snapshots.map((snapshot) => {
    return Object.fromEntries(
      Object.entries(snapshot).filter(([, val]) => typeof val !== "function")
    );
  });
}

/**
 * Pad the snapshots with two additional states:
 *  - Start consisting of just the passed inputs
 *  - End consisting of the passed inputs and return value
 * @param {any[]} snapshots
 * @param {*} returnValue
 * @param {*} inputs
 * @param {*} paramKeys
 */
function pad(snapshots, returnValue, inputs, paramKeys) {
  const args = Object.fromEntries(zip(paramKeys, inputs));
  snapshots.unshift(args);
  snapshots.push({ ...args, __returnValue__: returnValue });
  return snapshots;
}

function zip(arr1, arr2) {
  return arr1.map((item, index) => [item, arr2[index]]);
}
