import { WebSocketServer } from "ws";
import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  config();
}

const wss = new WebSocketServer({ port: parseInt(process.env.PORT!) });

wss.on("connection", (client) => {
  console.log("Client Connected!");
  console.log(client);
});

console.log("Server started on port 5000");
