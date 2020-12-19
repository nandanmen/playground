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

  it("should throw an error if alias of default export is not a function", () => {
    const code = `
      const arr = [1, 2, 3]
      export default arr
    `;
    expect(() => transpile(code)).toThrow(
      `Default export isn't a function. Make sure you're only default exporting functions.`
    );
  });

  it("should work with constant default exports", () => {
    const code = `
      const sum = function sum(a, b) {}
      export default sum
    `;
    const { entryPoint, params } = transpile(code);
    expect(entryPoint.name).toEqual("sum");
    expect(params).toEqual(["a", "b"]);
  });

  it("should not work with mutable default exports", () => {
    const code = `
      let sum = function sum(a, b) {}
      export default sum
    `;
    expect(() => transpile(code)).toThrow(
      `Sorry, we currently don't allow for 'let' default exports. Please change your 'let' declaration to a 'const'.`
    );
  });

  it("should work with anonymous functions", () => {
    const code = `
      export default (a, b) => {}
    `;
    const { entryPoint, params } = transpile(code);
    expect(typeof entryPoint).toBe("function");
    expect(params).toEqual(["a", "b"]);
  });
});
