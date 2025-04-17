import "./App.css";
import TerminalWindow from "./Components/TerminalWindow";
import TextEditor from "./Components/TextEditor";

const App = () => {
  return (
    <div>
      {/* <header>
        <h1>Awesome Code Editor</h1>
      </header> */}
      <main className="main">
        <TextEditor />
        <TerminalWindow />
      </main>
    </div>
  );
};

export default App;
