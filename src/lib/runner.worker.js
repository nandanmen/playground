import transpile from "./transform/transpile";

// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", (evt) => {
  const { code, inputs } = evt.data;
  const { entryPoint, snapshots, params } = transpile(code);
  postMessage({
    returnValue: entryPoint(...inputs),
    snapshots: snapshots.data,
    params,
  });
});
