import { useState, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import SUPPORTED_LANGUAGE from "../Constants/supportedLanguages";
import getBoilerPlateCode from "../utils/getBoilerPlateCode";
import getFilename from "../utils/getFilename";
import { useIDE } from "../Context/IDEProvider";
import useLocalStorage from "../hooks/useLocalStorage";

const FONT_SIZES = [14, 16, 18, 20];

type MonacoEditorInstance = monaco.editor.IStandaloneCodeEditor | null;
type MonacoEditorTheme = "dark" | "light";

const TextEditor = () => {
  const { isRunning, runCode, stopExecution } = useIDE();

  const editorElementRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<MonacoEditorInstance>(null);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 14);
  const [langIndex, setLangIndex] = useLocalStorage<number>("lang-idx", 0);
  const [theme, setTheme] = useLocalStorage<MonacoEditorTheme>("theme", "dark");

  const language = SUPPORTED_LANGUAGE[langIndex];
  const filename = getFilename(language);

  useEffect(() => {
    if (!editorElementRef.current) return;

    const e = monaco.editor.create(editorElementRef.current, {
      language: language.value,
      value: getBoilerPlateCode(language),
      theme: "vs-dark",
      tabSize: 4,
      fontSize: 14,
      scrollBeyondLastLine: false,
    });

    setEditor(e);

    return () => {
      e.dispose();
    };
  }, [language]);

  useEffect(() => {
    if (!editor) return;

    editor.updateOptions({
      fontSize: fontSize,
      theme: `vs-${theme}`,
    });
  }, [editor, fontSize, theme]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setLangIndex(parseInt(value));
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFontSize(parseInt(value));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setTheme(value as MonacoEditorTheme);
  };

  const handleRun = () => {
    if (!editor) return;

    const model = editor.getModel()!;
    const code = model.getValue();

    runCode(language.value, code, filename);
  };

  const handleStop = () => {
    stopExecution();
  };

  return (
    <div className={`bg-${theme} editor-container`}>
      <div className={`bg-${theme} editor-utils`}>
        <div>
          <pre style={{ fontSize: "14px" }}>{filename}</pre>
        </div>
        <div className="settings-wrapper">
          <div>
            <label htmlFor="language-selector">Language: </label>
            <select
              id="language-selector"
              defaultValue={langIndex}
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANGUAGE.map((lang, idx) => (
                <option key={idx} value={idx}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="font-size-selector">Font Size: </label>
            <select
              id="font-size-selector"
              defaultValue={fontSize}
              onChange={handleFontChange}
            >
              {FONT_SIZES.map((size, idx) => (
                <option key={idx} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="theme-selector">Theme: </label>
            <select
              id="theme-selector"
              defaultValue={theme}
              onChange={handleThemeChange}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
        <div>
          {!isRunning ? (
            <button className="btn btn-lg btn-success" onClick={handleRun}>
              Run
            </button>
          ) : (
            <button className="btn btn-lg btn-danger" onClick={handleStop}>
              Stop
            </button>
          )}
        </div>
      </div>
      <div className="editor" ref={editorElementRef}></div>
    </div>
  );
};

export default TextEditor;
