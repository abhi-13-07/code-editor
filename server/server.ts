import { WebSocketServer, RawData, WebSocket } from "ws";
import http from "http";
import { v4 as uuidV4 } from "uuid";
import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config();
}

import executeCode from "./utils/executeCode";
import ProcessMap from "./utils/ProcessMap";
import Stream from "stream";
import connectToDB from "./db/connectToDB";
import requestHandlers from "./requestHandlers";

declare module "ws" {
  interface WebSocket {
    socketId: string;
    isAlive: boolean;
  }
}

const PORT = parseInt(process.env.PORT!);

const server = http.createServer(requestHandlers);

// handle HTTP upgrade
server.on(
  "upgrade",
  (request: http.IncomingMessage, socket: Stream.Duplex, head: Buffer) => {
    if (request.url === "/") {
      wss.handleUpgrade(request, socket, head, (client) => {
        wss.emit("connection", client);
      });
    }
  }
);

const wss = new WebSocketServer({ noServer: true });

const processMap = ProcessMap.getInstance();

wss.on("connection", (socket: WebSocket) => {
  const socketId = uuidV4();
  socket.socketId = socketId;
  socket.isAlive = true;

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
      case "pong":
        socket.isAlive = true;

        return;
      default:
        socket.send("Invalid event");
    }
  });

  socket.on("close", function () {
    const socket = this as WebSocket;

    const codeRunner = processMap.get(socket.socketId);

    if (codeRunner) {
      codeRunner.terminate();
    }
  });
});

const pingClients = (client: WebSocket) => {
  if (!client.isAlive) {
    const codeRunner = processMap.get(client.socketId);

    if (codeRunner) {
      codeRunner.terminate();
    }
  } else {
    client.isAlive = false;
    client.send(JSON.stringify({ eventname: "ping" }));
  }
};

const interval = setInterval(() => {
  wss.clients.forEach((client) => {
    pingClients(client as WebSocket);
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.listen(PORT, () => {
  console.log("Server started on port 5000");
  connectToDB();
});
