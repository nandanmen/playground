import { ControlledEditor, monaco } from "@monaco-editor/react";
import theme from "../styles/theme.json";

monaco.init().then((monaco) => {
  monaco.editor.defineTheme("night-owl", theme);
});

export default function Editor({ value, onChange, onMount }) {
  return (
    <ControlledEditor
      onChange={(_, code) => onChange(code)}
      value={value}
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
