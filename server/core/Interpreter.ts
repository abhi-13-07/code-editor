import { rm } from "fs/promises";
import CodeRunner from "./CodeRunner";
import { interpreterBinaries } from "../constants/compilerBinaries";
import Timer from "../utils/Timer";
import spawnChildProcess from "./spwanChildProcess";

class Interpreter extends CodeRunner {
  private timer: Timer;

  constructor(lang: string, sourceFile: string, cwd: string) {
    super(lang, sourceFile, cwd);
    this.timer = new Timer();
  }

  public async execute(): Promise<void> {
    const command = interpreterBinaries[this.getLang()];
    const args = [this.getSourceFile()];

    const child = spawnChildProcess(command, args, this.cwd);

    this.setChild(child);

    child.on("spawn", () => {
      this.timer.start();
    });

    child?.stdout?.on("data", (data: Buffer) => {
      this.emit("stdout", data.toString());
    });

    child.stderr?.on("data", (data: Buffer) => {
      this.emit("stderr", data.toString());
    });

    child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      this.timer.stop();
      this.emit("exit", code, signal, this.timer.getElapsedTime());
    });

    child.on("close", () => {
      rm(this.cwd, { recursive: true });
    });
  }
}

export default Interpreter;
