import CodeRunner from "./CodeRunner";
import { compilerBinaries } from "../constants/compilerBinaries";
import getFileName from "../utils/getFilename";
import { rm } from "fs/promises";
import Timer from "../utils/Timer";
import spwanChildProcess from "./spwanChildProcess";
import { ChildProcess } from "child_process";

class Compiler extends CodeRunner {
  private filename: string;
  private timer: Timer;
  private compilerProcess: ChildProcess | null;

  constructor(lang: string, sourceFile: string, cwd: string) {
    super(lang, sourceFile, cwd);
    this.filename = getFileName(this.getSourceFile()).split(".")[0];
    this.timer = new Timer();
    this.compilerProcess = null;
  }

  private compile(): void {
    const command = compilerBinaries[this.getLang()];
    const args = [this.getSourceFile()];

    if (this.getLang() === "cpp" || this.getLang() === "c") {
      args.push("-o");
      args.push(this.filename + ".exe");
    }

    const child = spwanChildProcess(command, args, this.cwd);
    this.compilerProcess = child;

    child.stderr?.on("data", (data: Buffer) => {
      this.emit("compilation_error", data.toString());
    });

    child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      this.compilerProcess = null;

      if (code === 0) {
        this.emit("compilation_success");
        rm(this.getSourceFile());
      } else {
        this.emit("exit", code, signal, 0);
        rm(this.cwd, { recursive: true });
      }
    });
  }

  public async execute(): Promise<void> {
    this.on("compilation_error", (data: string) => {
      this.emit("stderr", data);
    });

    this.on("compilation_success", () => {
      let command = this.filename + ".exe";
      const args = [];

      if (this.getLang() === "java") {
        command = `${process.env.JAVA_BIN_PATH!}`;
        args.push(this.filename.split(".")[0]);
      }

      const child = spwanChildProcess(command, args, this.cwd);

      this.setChild(child);

      child.on("spawn", () => {
        this.timer.start();
      });

      child.stdout?.on("data", (data: Buffer) => {
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
    });

    this.compile();
  }

  public terminate(code?: number): void {
    if (this.compilerProcess !== null) {
      this.compilerProcess.kill(code ?? "SIGTERM");
    }
    super.terminate();
  }
}

export default Compiler;
