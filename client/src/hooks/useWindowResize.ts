import { useEffect } from "react";

interface ResizeEventHandler {
  (event?: UIEvent): void;
}

const useWindowResize = (callbackFunction: ResizeEventHandler) => {
  useEffect(() => {
    window.addEventListener("resize", callbackFunction);

    return () => {
      window.removeEventListener("resize", callbackFunction);
    };
  });
};

export default useWindowResize;
