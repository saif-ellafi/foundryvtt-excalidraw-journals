import React from "react";
import Excalidraw from "@excalidraw/excalidraw/dist/excalidraw.development";

export const App = () => {
  const excalidrawWrapperRef = React.useRef(null);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      {
        className: "excalidraw-wrapper",
        ref: excalidrawWrapperRef
      },
      React.createElement(Excalidraw.default)
    )
  );
}