import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export default function EditorPanel({ value, onChange, language = "json", readOnly = false }: Props) {
  return (
    <Editor
      height="500px"
      language={language}
      value={value}
      onChange={(v) => onChange?.(v || "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
