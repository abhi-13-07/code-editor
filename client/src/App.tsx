import "./App.css";
import TerminalWindow from "./Components/TerminalWindow";
import TextEditor from "./Components/TextEditor";
import { IDEProvider } from "./Context/IDEProvider";

const App = () => {
  return (
    <div>
      {/* <header>
        <h1>Awesome Code Editor</h1>
      </header> */}
      <main className="main">
        <IDEProvider>
          <TextEditor />
          <TerminalWindow />
        </IDEProvider>
      </main>
    </div>
  );
};

export default App;
