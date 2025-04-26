import { useState, useEffect } from "react";
import "./App.css";
import TerminalWindow from "./Components/TerminalWindow";
import TextEditor from "./Components/TextEditor";
import { IDEProvider } from "./Context/IDEProvider";

const App = () => {
  const [lang, setLang] = useState<number>(-1);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSavedCode = async () => {
      const pathname = document.location.pathname.slice(1);

      if (!pathname) return;

      setLoading(true);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/${pathname}`);
        const data = await res.json();
        if (res.status === 200) {
          console.log(data);
          setLang(data.languageId);
          setCode(data.code);
        } else {
          console.log("Here");
          document.location.replace("/");
        }
      } catch (err) {
        console.log("Error", err);
      }

      setLoading(false);
    };

    fetchSavedCode();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="center">
          <h1>Loading...</h1>
        </div>
      ) : (
        <main className="main">
          <IDEProvider>
            <TextEditor lang={lang} code={code} />
            <TerminalWindow />
          </IDEProvider>
        </main>
      )}
    </div>
  );
};

export default App;
