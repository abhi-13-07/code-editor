import http from "http";
import CodeSnippet from "./models/CodeSnippet";

const requestHandlers = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL!);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Content-Length", 0);
    res.end("");
    return;
  }

  if (req.url === "/share" && req.method === "POST") {
    let raw = "";

    req.on("data", (data) => {
      raw += data;
    });

    req.on("end", async () => {
      const body = JSON.parse(raw) as { lang: number; code: string };
      const { lang, code } = body;

      const codeSnippet = new CodeSnippet({
        languageId: lang,
        code,
      });

      try {
        const newSnippet = await codeSnippet.save();

        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            message: "Successfully Created",
            link: `${process.env.CLIENT_URL}/${newSnippet.id}`,
          })
        );
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: "Something went wrong" }));
      }
    });
  } else if (req.method === "GET") {
    const id = req.url?.split("/").at(-1);

    try {
      const codeSnippet = await CodeSnippet.findById(id);

      if (codeSnippet === null) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ message: "Cannot find sinppet with given Id" })
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(codeSnippet));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Something went wrong" }));
    }
  }
};

export default requestHandlers;
