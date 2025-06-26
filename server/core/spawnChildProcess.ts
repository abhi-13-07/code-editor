import { ChildProcess, spawn } from "child_process";

const spawnChildProcess = (
  command: string,
  args?: string[],
  cwd?: string
): ChildProcess => {
  return spawn(command, args, {
    cwd: cwd,
    env: {},
    timeout: 60000,
    stdio: "pipe",
  });
};

export default spawnChildProcess;
