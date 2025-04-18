import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { useIDE } from "../Context/IDEProvider";
import { useWebSocket } from "../Context/SocketProvider";
import "@xterm/xterm/css/xterm.css";

type OnKeyEvent = { key: string; domEvent: KeyboardEvent };

const TerminalWindow = () => {
  const { terminalRef, isRunning, clearTerminal } = useIDE();
  const { ws } = useWebSocket();
  const terminalElementRef = useRef<HTMLDivElement>(null);
  const stdInBufferRef = useRef<string>("");

  useEffect(() => {
    if (!terminalElementRef.current) return;

    const term = new Terminal();

    terminalRef.current = term;

    term.open(terminalElementRef.current);

    term.onKey(({ key, domEvent }: OnKeyEvent) => {
      if (domEvent.code === "Backspace") {
        term.write("\b \b");
        // remove last character from buffer
        stdInBufferRef.current = stdInBufferRef.current.slice(
          0,
          stdInBufferRef.current.length - 1
        );
      } else if (domEvent.code === "Enter") {
        term.write("\r\n");
        const message = JSON.stringify({
          eventname: "stdin",
          payload: {
            input: stdInBufferRef.current + "\n",
          },
        });
        ws?.send(message);
        stdInBufferRef.current = "";
      } else {
        term.write(key);
        stdInBufferRef.current += key;
      }
    });

    return () => {
      term.dispose();
    };
  }, [terminalRef, ws]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const parsedMessage: IServerEvent = JSON.parse(event.data);

      if (parsedMessage.eventname === "stderr") {
        terminalRef.current?.write("\x1b[5;31m" + parsedMessage.data);
      } else if (parsedMessage.eventname === "exit") {
        const exitInfo = JSON.parse(parsedMessage.data);

        terminalRef.current?.write(
          "\r\n\r\n\x1b[1;90m" +
            `Completed in ${exitInfo.time}ms.\r\nProcess exited with code ${exitInfo.code}`
        );
      } else {
        terminalRef.current?.write(parsedMessage.data);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [terminalRef, ws]);

  return (
    <div className="terminal-container">
      <div className="terminal-utils">
        <div></div>
        <button
          onClick={clearTerminal}
          className="btn btn-lg btn-outline-danger"
          disabled={isRunning}
        >
          Clear
        </button>
      </div>
      <div className="terminal" ref={terminalElementRef}></div>
    </div>
  );
};

export default TerminalWindow;
