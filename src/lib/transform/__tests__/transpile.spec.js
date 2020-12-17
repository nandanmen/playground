import transpile from "../transpile";

describe("transpile", () => {
  it("should transpile a simple function", () => {
    const code = `export default function findAllAverages(arr, k) {
      const result = [];
      let windowStart = 0;
      let windowSum = 0;
     
      for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
        windowSum += arr[windowEnd];
        if (windowEnd >= k - 1) {
          result.push((windowSum / k).toFixed(2));
          windowSum -= arr[windowStart];
          windowStart++;
        }
      }
     
      debugger;
      return result;
    }`;
    const { entryPoint, params, snapshots } = transpile(code);
    expect(entryPoint.name).toEqual("findAllAverages");
    expect(params).toEqual(["arr", "k"]);

    entryPoint([1, 2], 1);
    expect(snapshots.data).toHaveLength(1);
  });

  it("should throw an error if no default export is found", () => {
    const code = `function findAllAverages(arr, k) {}`;
    expect(() => transpile(code)).toThrow(
      `Couldn't find an entry point. Did you forget to default export a function?`
    );
  });

  it("should throw an error if default export is not a function", () => {
    const code = `export default [1, 2, 3]`;
    expect(() => transpile(code)).toThrow(
      `Default export isn't a function. Make sure you're only default exporting functions.`
    );
  });
});
