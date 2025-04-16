import path from "path";

export const EXECUTION_PATH =
  process.env.EXECUTION_PATH || path.join(process.cwd(), "code");
