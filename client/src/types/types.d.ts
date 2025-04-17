interface ISocketContext {
  ws: WebSocket | null;
}

interface ILanguage {
  name: string;
  value: string;
  ext: string;
}

interface IServerEvent {
  eventname: "stdout" | "stderr" | "exit";
  data: string;
}
