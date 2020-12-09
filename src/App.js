import React from "react";
import AceEditor from "react-ace";
import * as babel from "@babel/core";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-textmate";

import Variables from "./Variables";
import transformFactory from "./transform";
import snapshot from "./snapshot";

function transform(input) {
  const out = babel.transform(input, { plugins: [transformFactory] });
  // eslint-disable-next-line no-unused-vars
  const require = () => snapshot;
  // eslint-disable-next-line no-eval
  return eval(out.code);
}

const initialText = `
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
  // eslint-disable-next-line no-unused-vars
  const [[_, data], setData] = React.useState([]);
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
    <main style={{ width: "100vw", height: "100vh" }} className="flex">
      <section style={{ flex: 3 }} className="flex items-center p-8 bg-gray-200">
        <AceEditor
          style={{ width: "100%", height: "100%" }}
          className="font-mono rounded-lg"
          mode="javascript"
          theme="textmate"
          onChange={(newText) => setText(newText)}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          value={text}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </section>
      {data && (
        <section
          style={{ flex: 4 }}
          className="flex relative items-center justify-center text-white overflow-scroll p-8 bg-gray-800"
        >
          <Variables vars={data[activeIndex]} prev={data[activeIndex - 1]} />
          <form
            style={{ top: "2rem" }}
            className="absolute px-8 font-mono text-sm text-black flex w-full"
          >
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
          <div
            style={{ bottom: "2rem" }}
            className="absolute bottom-0 flex items-center"
          >
            <button
              className="bg-gray-700 font-semibold px-4 py-2 rounded-lg"
              onClick={() => setActiveIndex(Math.max(activeIndex - 1, 0))}
            >
              Prev
            </button>
            <p className="mx-4">
              {activeIndex + 1} / {data.length}
            </p>
            <button
              className="bg-gray-700 font-semibold px-4 py-2 rounded-lg"
              onClick={() =>
                setActiveIndex(Math.min(activeIndex + 1, data.length - 1))
              }
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
