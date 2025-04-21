import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";

import { Terminal } from "@xterm/xterm";
import { useWebSocket } from "./SocketProvider";

interface IDEProviderType {
  isRunning: boolean;
  terminalRef: React.RefObject<Terminal | null>;
  runCode: (language: string, code: string, filename: string) => void;
  clearTerminal: () => void;
  stopExecution: () => void;
}

const IDEContext = createContext<IDEProviderType>({} as IDEProviderType);

export const useIDE = (): IDEProviderType => useContext(IDEContext);

export const IDEProvider = ({ children }: PropsWithChildren) => {
  const { ws } = useWebSocket();

  const [isRunning, setIsRunning] = useState(() => false);
  const terminalRef = useRef<Terminal>(null);

  useEffect(() => {
    if (!ws) return;

    const handleExitMessage = (event: MessageEvent) => {
      const parseMessage = JSON.parse(event.data);

      if (parseMessage.eventname === "exit") {
        setIsRunning(false);
      }
    };

    ws.addEventListener("message", handleExitMessage);

    return () => {
      ws.removeEventListener("message", handleExitMessage);
    };
  }, [ws]);

  const clearTerminal = () => {
    if (!terminalRef.current) return;
    terminalRef.current.reset();
  };

  const runCode = (language: string, code: string, filename: string) => {
    if (!ws) return;

    clearTerminal();

    setIsRunning(true);

    const payload = JSON.stringify({
      eventname: "execute",
      payload: { lang: language, code, filename },
    });
    ws.send(payload);
  };

  const stopExecution = () => {
    if (!ws) return;
    ws.send(JSON.stringify({ eventname: "terminate" }));
  };

  return (
    <IDEContext.Provider
      value={{ isRunning, terminalRef, runCode, clearTerminal, stopExecution }}
    >
      {children}
    </IDEContext.Provider>
  );
};
