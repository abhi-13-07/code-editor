import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocketProvider } from "./Context/SocketProvider.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </SocketProvider>
);
