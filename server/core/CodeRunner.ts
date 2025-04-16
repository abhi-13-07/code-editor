import { ChildProcess } from "child_process";
import { EventEmitter } from "ws";

interface CodeRunnerEvents {
  spwan: [child: ChildProcess];
  stdout: [data: string];
  stderr: [data: string];
  exit: [code: number | null, signal: NodeJS.Signals | null, time: number];
  compilation_error: [data: string];
  compilation_success: [];
}

abstract class CodeRunner extends EventEmitter<CodeRunnerEvents> {
  private lang: string;
  private sourceFile: string;
  protected child: ChildProcess | null;
  protected cwd: string;

  constructor(lang: string, sourceFile: string, cwd: string) {
    super();
    this.lang = lang;
    this.sourceFile = sourceFile;
    this.child = null;
    this.cwd = cwd;
  }

  public getLang(): string {
    return this.lang;
  }

  public getSourceFile(): string {
    return this.sourceFile;
  }

  protected setChild(child: ChildProcess): void {
    this.child = child;
  }

  public input(data: string): void {
    if (!this.child) return;
    this.child.stdin?.write(data);
  }

  public terminate(code?: number): void {
    if (!this.child) return;
    this.child.kill(code ?? "SIGTERM");
  }

  public abstract execute(): void;
}

export default CodeRunner;
