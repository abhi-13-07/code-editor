const boilerPlate: { [key: string]: string } = {
  c: `#include<stdio.h>\n\nvoid main() {\n\tprintf("Awesome Code Editor!");\n}`,
  cpp: `#include<iostream>\n\nint main() {\n\tstd::cout << "Awesome Code Editor!" << "\\n";\n\treturn 0;\n}`,
  java: `// don't change Main class name\n\npublic class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Awesome Code Editor!");\n\t}\n}`,
  javascript: `function main() {\n\tconsole.log("Awesome Code Editor!");\n}\n\nmain();`,
  python: `def main():\n\tprint("Awesome Code Editor!")\n\nmain()`,
};

const getBoilerPlateCode = (language: ILanguage): string => {
  return boilerPlate[language.value];
};

export default getBoilerPlateCode;
