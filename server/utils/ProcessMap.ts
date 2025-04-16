import CodeRunner from "../core/CodeRunner";

class ProcessMap {
  private processMap: { [key: string]: CodeRunner };
  private static instance?: ProcessMap;

  private constructor() {
    this.processMap = {};
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ProcessMap();
    }
    return this.instance;
  }

  public add(socketId: string, process: CodeRunner) {
    this.processMap[socketId] = process;
  }

  public contains(socketId: string): boolean {
    return this.processMap[socketId] !== undefined;
  }

  public get(socketId: string): CodeRunner | undefined {
    return this.processMap[socketId];
  }

  public remove(socketId: string): void {
    delete this.processMap[socketId];
  }
}

export default ProcessMap;
