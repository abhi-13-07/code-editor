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

    const handleMessage = (event: MessageEvent) => {
      const parsedEvent: IServerEvent = JSON.parse(event.data);

      if (parsedEvent.eventname === "ping") {
        webSocket.send(JSON.stringify({ eventname: "pong" }));
      }
    };

    const handleClose = (event: CloseEvent) => {
      alert("Connection closed");
      console.log(event);
    };

    webSocket.addEventListener("message", handleMessage);

    webSocket.addEventListener("close", handleClose);

    return () => {
      webSocket.removeEventListener("message", handleMessage);
      webSocket.removeEventListener("close", handleClose);
      webSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ ws }}>{children}</SocketContext.Provider>
  );
};
