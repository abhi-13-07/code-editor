import { mkdir, stat } from "fs/promises";

const createDir = async (dirPath: string) => {
  try {
    await stat(dirPath);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await mkdir(dirPath);
    }
  }
};

export default createDir;
