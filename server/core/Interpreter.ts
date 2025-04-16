import CodeRunner from "./CodeRunner";
import { interpreterBinaries } from "../constants/compilerBinaries";
import Timer from "../utils/Timer";
import createChildProcess from "./createChildProcess";
import path from "path";
import { rm, rmdir } from "fs/promises";

class Interpreter extends CodeRunner {
  private timer: Timer;

  constructor(lang: string, sourceFile: string, cwd: string) {
    super(lang, sourceFile, cwd);
    this.timer = new Timer();
  }

  public async execute(): Promise<void> {
    const executeCommand = `${
      interpreterBinaries[this.getLang()]
    } ${this.getSourceFile()}`;

    const child = createChildProcess(executeCommand, this.cwd);

    this.setChild(child);

    child.on("spawn", () => {
      this.timer.start();
    });

    child?.stdout?.on("data", (data) => {
      this.emit("stdout", data);
    });

    child.stderr?.on("data", (data) => {
      this.emit("stderr", data);
    });

    child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      this.timer.stop();
      this.emit("exit", code, signal, this.timer.getElapsedTime());
      rm(this.cwd, { recursive: true });
    });
  }
}

export default Interpreter;
