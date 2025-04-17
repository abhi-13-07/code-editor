import { useState, useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

type OnKeyEvent = { key: string; domEvent: KeyboardEvent };

const TerminalWindow = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal();

    setTerminal(term);

    term.open(terminalRef.current);

    term.onKey(({ key, domEvent }: OnKeyEvent) => {
      if (domEvent.code === "Backspace") {
        term.write("\b \b");
      } else if (domEvent.code === "Enter") {
        term.write("\r\n");
      } else {
        term.write(key);
      }
    });

    return () => {
      term.dispose();
    };
  }, []);

  const clearTerminal = () => {
    if (!terminal) return;
    terminal.reset();
  };

  return (
    <div className="terminal-container">
      <div className="terminal-utils">
        <div></div>
        <button
          onClick={clearTerminal}
          className="btn btn-lg btn-outline-danger"
        >
          Clear
        </button>
      </div>
      <div className="terminal" ref={terminalRef}></div>
    </div>
  );
};

export default TerminalWindow;
