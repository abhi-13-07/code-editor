const compilerBinaries: { [key: string]: string } = {
  java: process.env.JAVAC_BIN_PATH!,
  cpp: process.env.CPP_BIN_PATH!,
  c: process.env.C_BIN_PATH!,
};

const interpreterBinaries: { [key: string]: string } = {
  python: process.env.PYTHON_BIN_PATH!,
  javascript: process.env.NODE_JS_BIN_PATH!,
};

export { compilerBinaries, interpreterBinaries };
