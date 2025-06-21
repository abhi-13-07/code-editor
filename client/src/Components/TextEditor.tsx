import { useState, useEffect, useRef, useCallback } from "react";
import * as monaco from "monaco-editor";

import SUPPORTED_LANGUAGE from "../Constants/supportedLanguages";
import getBoilerPlateCode from "../utils/getBoilerPlateCode";
import getFilename from "../utils/getFilename";
import { useIDE } from "../Context/IDEProvider";
import useLocalStorage from "../hooks/useLocalStorage";
import useWindowResize from "../hooks/useWindowResize";

interface Props {
  lang: number;
  code: string;
}

const FONT_SIZES = [14, 16, 18, 20];

type MonacoEditorInstance = monaco.editor.IStandaloneCodeEditor | null;
type MonacoEditorTheme = "dark" | "light";

const TextEditor = ({ lang, code }: Props) => {
  const { isRunning, runCode, stopExecution } = useIDE();

  const editorElementRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editor, setEditor] = useState<MonacoEditorInstance>(null);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 14);
  const [langIndex, setLangIndex] = useLocalStorage<number>("lang-idx", 0);
  const [theme, setTheme] = useLocalStorage<MonacoEditorTheme>("theme", "dark");

  const language = SUPPORTED_LANGUAGE[langIndex];
  const filename = getFilename(language);

  useEffect(() => {
    if (!lang || lang < 0) return;
    setLangIndex(lang);
  }, [lang, setLangIndex]);

  // useEffect(() => {
  //   if (!editorElementRef.current) return;

  //   const editorElement = editorElementRef.current;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.ctrlKey && e.key === "s") {
  //       e.preventDefault();
  //     } else if (e.ctrlKey && e.key === "Enter") {
  //       if (!editor) return;

  //       const model = editor.getModel()!;
  //       const code = model.getValue()!;

  //       runCode(language.value, code, filename);
  //     }
  //   };

  //   editorElement.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     editorElement.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [runCode, language.value, filename, editor]);

  useEffect(() => {
    if (!editorElementRef.current) return;

    const e = monaco.editor.create(editorElementRef.current, {
      language: language.value,
      value: code || getBoilerPlateCode(language),
      theme: "vs-dark",
      tabSize: 4,
      fontSize: 14,
      scrollBeyondLastLine: false,
    });

    setEditor(e);

    return () => {
      e.dispose();
    };
  }, [language, lang, code]);

  useEffect(() => {
    if (!editor) return;

    editor.updateOptions({
      fontSize: fontSize,
      theme: `vs-${theme}`,
    });
  }, [editor, fontSize, theme]);

  const resizeHandler = useCallback(() => {
    if (!editor) return;
    editor.layout();
  }, [editor]);

  useWindowResize(resizeHandler);

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

  const handleShare = async () => {
    setLoading(true);
    try {
      const model = editor?.getModel();
      const code = model?.getValue();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang: langIndex, code }),
      });

      if (res.status === 201) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.link);
        alert("URL Copied to clipboard.");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong please try again later");
    }

    setLoading(false);
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
              value={langIndex}
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
          {lang < 0 && (
            <button
              className="btn btn-lg btn-outline"
              onClick={handleShare}
              disabled={loading}
            >
              {loading ? "Hold on.." : "Share"}
            </button>
          )}
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
