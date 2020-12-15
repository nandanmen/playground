import React from "react";
import { useDebounce } from "use-debounce";
import { ControlledEditor, monaco } from "@monaco-editor/react";
import theme from "../styles/theme.json";

monaco.init().then((monaco) => {
  monaco.editor.defineTheme("night-owl", theme);
});

export default function DebouncedEditor({ initialValue, delay, onChange, onMount }) {
  const [text, setText] = React.useState(initialValue);
  const [debouncedText] = useDebounce(text, delay);

  React.useEffect(() => {
    onChange(debouncedText);
  }, [onChange, debouncedText]);

  return (
    <ControlledEditor
      onChange={(_, code) => setText(code)}
      value={text}
      language="javascript"
      theme="night-owl"
      options={{
        fontFamily: "'Input Mono', Menlo, 'Courier New', monospace",
        fontSize: 13,
        minimap: {
          enabled: false,
        },
      }}
      editorDidMount={onMount}
    />
  );
}
