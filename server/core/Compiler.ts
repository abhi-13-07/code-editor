import CodeRunner from "./CodeRunner";
import { compilerBinaries } from "../constants/compilerBinaries";
import getFileName from "../utils/getFilename";
import { rm } from "fs/promises";
import Timer from "../utils/Timer";
import createChildProcess from "./createChildProcess";
import { ChildProcess } from "child_process";

class Compiler extends CodeRunner {
  private filename: string;
  private timer: Timer;
  private compilerProcess: ChildProcess | null;

  constructor(lang: string, sourceFile: string, cwd: string) {
    super(lang, sourceFile, cwd);
    this.filename = getFileName(this.getSourceFile()).split(".")[0];
    this.timer = new Timer();
    this.cwd = cwd;
    this.compilerProcess = null;
  }

  private compile(): void {
    const bin = compilerBinaries[this.getLang()];
    let compileCommand = `${bin} ${this.getSourceFile()}`;

    if (this.getLang() === "cpp" || this.getLang() === "c") {
      compileCommand += ` -o ${this.filename}.exe`;
    }

    const child = createChildProcess(compileCommand, this.cwd);
    this.compilerProcess = child;

    child.stderr?.on("data", (data) => {
      this.emit("compilation_error", data);
    });

    child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      this.compilerProcess = null;

      if (code === 0) {
        this.emit("compilation_success");
      } else {
        this.emit("exit", code, signal, 0);
      }

      rm(this.getSourceFile());
    });
  }

  public async execute(): Promise<void> {
    this.compile();

    this.on("compilation_error", (data: string) => {
      this.emit("stderr", data);
    });

    this.on("compilation_success", () => {
      let executeCommand = this.filename + ".exe";

      if (this.getLang() === "java") {
        executeCommand = `${process.env.JAVA_BIN_PATH!} ${
          this.filename.split(".")[0]
        }`;
      }

      const child = createChildProcess(executeCommand, this.cwd);

      this.setChild(child);

      child.on("spawn", () => {
        this.timer.start();
      });

      child.stdout?.on("data", (data) => {
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
    });
  }

  public terminate(code?: number): void {
    if (this.compilerProcess !== null) {
      this.compilerProcess.kill(code ?? "SIGTERM");
    }
    super.terminate();
  }
}

export default Compiler;
