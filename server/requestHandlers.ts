import http from "http";
import CodeSnippet from "./models/CodeSnippet";

const requestHandlers = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  if (req.url === "/share" && req.method === "POST") {
    let raw = "";

    req.on("data", (data) => {
      raw += data;
    });

    req.on("end", async () => {
      const body = JSON.parse(raw);
      const { language, code } = body;

      const codeSnippet = new CodeSnippet({
        language,
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
