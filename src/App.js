import React, { useRef, useState } from "react";
import "@tensorflow/tfjs";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/face_mesh";
import Webcam from "react-webcam";
import { runDetector } from "./utils/detector";

const inputResolution = {
  width: 730,
  height: 640,
};
const videoConstraints = {
  width: inputResolution.width,
  height: inputResolution.height,
  facingMode: "user",
};
function App() {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [mesh, setMesh] = useState(false);
  const [tags, setTags] = useState(false);
  const [dir, setDir] = useState(true);

  const handleVideoLoad = async (videoNode) => {
    const video = videoNode.target;
    if (video.readyState !== 4) return;
    if (loaded) return;
    await runDetector(video, canvasRef.current, (data) => {
      console.log(data)
    });
    setLoaded(true);
  };
  return (
    <div>
      <input type="checkbox" id="show-mesh" checked={mesh} onChange={() => setMesh(!mesh)} /> Show Mesh
      <input type="checkbox" id="show-tags" checked={tags} onChange={() => setTags(!tags)} /> Show Index Tags
      <input type="checkbox" id="show-dir" checked={dir} onChange={() => setDir(!dir)} /> Show Direction
      <div>
        {loaded ? <></> : <header>Loading...</header>}
        <Webcam
          width={inputResolution.width}
          height={inputResolution.height}
          style={{ visibility: "hidden", position: "absolute" }}
          videoConstraints={videoConstraints}
          onLoadedData={handleVideoLoad}
        />
        <canvas
          ref={canvasRef}
          width={inputResolution.width}
          height={inputResolution.height}
          style={{ position: "absolute", border: "1px solid black" }}
        />
      </div>
      
    </div>
  );
}

export default App;
