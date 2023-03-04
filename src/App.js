import React, {useRef} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";

export const App = () => {
  const excalidrawRef = useRef(null);
  window["excalidraw"] = excalidrawRef.current;
  return (
    <>
      <div style={
        {
          height: ((canvas.screenDimensions[1] * 0.75) - 60) + 'px',
          width: (canvas.screenDimensions[0] * 0.50) + 'px',
        }
      }>
        <Excalidraw/>
      </div>
    </>
  )
}