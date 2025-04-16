import { WebSocketServer, RawData, WebSocket } from "ws";
import { v4 as uuidV4 } from "uuid";
import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config();
}

import executeCode from "./utils/executeCode";
import ProcessMap from "./utils/ProcessMap";

declare module "ws" {
  interface WebSocket {
    socketId: string;
    isAlive: boolean;
  }
}

const wss = new WebSocketServer({ port: parseInt(process.env.PORT!) });

const processMap = ProcessMap.getInstance();

wss.on("connection", (socket: WebSocket) => {
  const socketId = uuidV4();
  socket.socketId = socketId;

  socket.on("message", (data: RawData) => {
    const message = JSON.parse(data.toString());

    const { eventname, payload } = message;

    let codeRunner;

    switch (eventname) {
      case "execute":
        const { lang, filename, code } = payload;
        executeCode(lang, code, filename, socket);
        return;
      case "stdin":
        const { input } = payload;

        if (!processMap.contains(socketId)) return;

        codeRunner = processMap.get(socketId)!;
        codeRunner.input(input);

        return;
      case "terminate":
        if (!processMap.contains(socketId)) return;

        codeRunner = processMap.get(socketId)!;
        codeRunner.terminate();

        return;
      default:
        socket.send("Invalid event");
    }
  });

  socket.on("close", function () {
    const socket = this as WebSocket;

    const childProcess = processMap.get(socket.socketId);

    if (childProcess) {
      processMap.remove(socket.socketId);
      childProcess.terminate();
    }
  });
});

console.log("Server started on port 5000");
