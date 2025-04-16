import { WebSocket } from "ws";
import createDir from "./createDir";
import path from "path";
import fs from "fs/promises";
import { EXECUTION_PATH } from "../constants/executionPath";
import CodeRunnerFactory from "../core/CodeRunnerFactory";
import ProcessMap from "./ProcessMap";

const processMap = ProcessMap.getInstance();

const executeCode = async (
  lang: string,
  sourceCode: string,
  filename: string,
  socket: WebSocket
): Promise<void> => {
  if (processMap.contains(socket.socketId)) return;

  try {
    const cwd = path.join(EXECUTION_PATH, socket.socketId);
    await createDir(cwd);

    const filepath = path.join(cwd, filename);

    await fs.writeFile(filepath, sourceCode, {
      encoding: "utf-8",
    });

    const codeRunner = CodeRunnerFactory.buildCodeRunner(lang, filepath, cwd);

    processMap.add(socket.socketId, codeRunner);

    codeRunner.on("stdout", (data: string) => {
      const response = JSON.stringify({ eventname: "stdout", data });
      socket.send(response);
    });

    codeRunner.on("stderr", (data: string) => {
      const response = JSON.stringify({ eventname: "stderr", data });
      socket.send(response);
    });

    codeRunner.on(
      "exit",
      (code: number | null, signal: NodeJS.Signals | null, time: number) => {
        const response = JSON.stringify({
          eventname: "exit",
          code,
          signal,
          time,
        });
        socket.send(response);
        processMap.remove(socket.socketId);
      }
    );

    codeRunner.execute();
  } catch (err) {
    console.log(err);
  }
};

export default executeCode;
