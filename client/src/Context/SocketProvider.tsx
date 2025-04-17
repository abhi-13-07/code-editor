import {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";

interface ISocketContext {
  ws: WebSocket | null;
}

const SocketContext = createContext<ISocketContext>({} as ISocketContext);

export const useWebSocket = (): ISocketContext => useContext(SocketContext);

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSocket = new WebSocket(import.meta.env.VITE_SERVER_URL);
    setWs(webSocket);
  }, []);

  useEffect(() => {
    if (!ws) return;

    return () => {
      ws.close();
    };
  }, [ws]);

  return (
    <SocketContext.Provider value={{ ws }}>{children}</SocketContext.Provider>
  );
};
