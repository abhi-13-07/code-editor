import { ChildProcess, exec } from "child_process";

const createChildProcess = (command: string, cwd: string): ChildProcess => {
  return exec(command, {
    cwd: cwd,
    env: {},
    timeout: 60000,
    maxBuffer: 1024 * 1204,
  });
};

export default createChildProcess;
