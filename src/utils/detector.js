// https://magdazelezik.medium.com/face-landmark-detection-in-react-the-right-way-3bcd63e1d108
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { drawMesh } from "./drawMesh";
const DRAW_DELAY = 300; //ms
export const runDetector = async (video, canvas, cb) => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "tfjs",
  };
  const detector = await faceLandmarksDetection.createDetector(
    model,
    detectorConfig
  );
  const detect = async (net) => {
    const estimationConfig = { flipHorizontal: true };
    const faces = await net.estimateFaces(video, estimationConfig);
    const ctx = canvas.getContext("2d");
    setTimeout(() => {
      requestAnimationFrame(() => {
        const angle = drawMesh(faces[0], ctx)
        cb(angle)
      });
      detect(detector);
    }, DRAW_DELAY);
  };
  detect(detector);
  return <></>;
};
