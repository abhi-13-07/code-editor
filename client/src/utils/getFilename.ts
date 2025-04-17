const getFilename = (language: ILanguage) => {
  let name = "main";
  if (language.value === "java") name = "Main";
  return name + language.ext;
};

export default getFilename;
