import CodeRunner from "./CodeRunner";
import Compiler from "./Compiler";
import Interpreter from "./Interpreter";

class CodeRunnerFactory {
  private static compiledLanguages = ["java", "cpp", "c"];

  public static buildCodeRunner(
    lang: string,
    sourceFile: string,
    cwd: string
  ): CodeRunner {
    if (this.isCompiledLanguage(lang))
      return new Compiler(lang, sourceFile, cwd);
    return new Interpreter(lang, sourceFile, cwd);
  }

  private static isCompiledLanguage(lang: string): boolean {
    return this.compiledLanguages.includes(lang);
  }
}

export default CodeRunnerFactory;
