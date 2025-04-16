import path from "path";

const getFileName = (filepath: string): string => {
  if (!filepath.includes(path.sep)) throw new Error("Invalid filepath");
  return filepath.split(path.sep).at(-1)!;
};

export default getFileName;
