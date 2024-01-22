import { TRIANGULATION } from "./triangulation";

let SHOW_MESH  = true
let SHOW_TAG_NUMBERS = true
let DRAW_DIRECTION = true

export const drawMesh = (prediction, ctx) => {
  SHOW_MESH = document.getElementById('show-mesh').checked
  SHOW_TAG_NUMBERS = document.getElementById('show-tags').checked
  DRAW_DIRECTION = document.getElementById('show-dir').checked

  if (!prediction) return;
  const keyPoints = prediction.keypoints;
  if (!keyPoints || keyPoints.length === 0) return;

  // CLEAR CANVAS
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // DRAW AND CALCULATE STUFF
  drawFaceMesh(ctx, keyPoints, SHOW_TAG_NUMBERS, SHOW_MESH);
  return calculateDirection(ctx, keyPoints, DRAW_DIRECTION);
};

function calculateDirection(ctx, keyPoints, draw) {
  let noseTip, leftNose, rightNose;
  try {
    noseTip = { ...keyPoints[1], name: "nose tip" };
    leftNose = { ...keyPoints[279], name: "left nose" };
    rightNose = { ...keyPoints[49], name: "right nose" };
  } catch (error) {
    console.log("error creating directional points", keyPoints, error);
  }

  // MIDESCTION OF NOSE IS BACK OF NOSE PERPENDICULAR
  const midpoint = {
    x: (leftNose.x + rightNose.x) / 2,
    y: (leftNose.y + rightNose.y) / 2,
    z: (leftNose.z + rightNose.z) / 2,
  };
  const perpendicularUp = { x: midpoint.x, y: midpoint.y - 50, z:  midpoint.z };

  // CALC ANGLES
  const yaw = getAngleBetweenLines(midpoint, noseTip, perpendicularUp);
  const turn = getAngleBetweenLines(midpoint, rightNose, noseTip);

  if (draw) {
    const region2 = new Path2D();
    region2.moveTo(leftNose.x, leftNose.y);
    region2.lineTo(noseTip.x, noseTip.y);
    region2.lineTo(rightNose.x, rightNose.y);
    region2.lineTo(midpoint.x, midpoint.y);
    region2.lineTo(leftNose.x, leftNose.y);
    region2.closePath();
    ctx.fillStyle = "brown";
    ctx.stroke(region2);
    ctx.fillText(Math.trunc(turn) + "°", rightNose.x + 10, rightNose.y);
    ctx.fill(region2);

    const region = new Path2D();
    region.moveTo(midpoint.x, midpoint.y);
    region.lineTo(perpendicularUp.x, perpendicularUp.y);
    region.lineTo(noseTip.x, noseTip.y);
    region.lineTo(midpoint.x, midpoint.y);
    region.closePath();
    ctx.fillStyle = "red";
    ctx.stroke(region);
    ctx.fillText(Math.trunc(yaw) + "°", midpoint.x + 10, midpoint.y);
    ctx.fill(region);
  }

  // CALC DISTANCE BETWEEN NOSE TIP AND MIDPOINT, AND LEFT AND RIGHT NOSE POINTS
  const zDistance = getDistanceBetweenPoints(noseTip, midpoint)
  const xDistance = getDistanceBetweenPoints(leftNose, rightNose)

  return {yaw, turn, zDistance, xDistance}
}

function getDistanceBetweenPoints(point1, point2) {
  const xDistance = point1.x - point2.x;
  const yDistance = point1.y - point2.y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

function getAngleBetweenLines(midpoint, point1, point2) {
  const vector1 = { x: point1.x - midpoint.x, y: point1.y - midpoint.y };
  const vector2 = { x: point2.x - midpoint.x, y: point2.y - midpoint.y };

  // Calculate the dot product of the two vectors
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // Calculate the magnitudes of the vectors
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  // Calculate the cosine of the angle between the two vectors
  const cosineTheta = dotProduct / (magnitude1 * magnitude2);

  // Use the arccosine function to get the angle in radians
  const angleInRadians = Math.acos(cosineTheta);

  // Convert the angle to degrees
  const angleInDegrees = (angleInRadians * 180) / Math.PI;

  return angleInDegrees;
}

function drawFaceMesh(ctx, keyPoints, writeTagNumbers, drawLines) {
  if (drawLines) drawMeshPaths(keyPoints, ctx);
  if (writeTagNumbers) {
    let index = 0;
    for (let keyPoint of keyPoints) {
      ctx.beginPath();
      ctx.arc(keyPoint.x, keyPoint.y, 1, 0, 3 * Math.PI);
      ctx.fillText(index, keyPoint.x, keyPoint.y);
      ctx.fillStyle = "black";
      ctx.fill();
      index++;
    }
  }
}

function drawMeshPaths(keyPoints, ctx, off) {
  if (off) return;
  for (let i = 0; i < TRIANGULATION.length / 3; i++) {
    const points = [
      TRIANGULATION[i * 3],
      TRIANGULATION[i * 3 + 1],
      TRIANGULATION[i * 3 + 2],
    ].map((index) => keyPoints[index]);
    drawPath(ctx, points, true);
  }
}

function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point.x, point.y);
  }
  if (closePath) region.closePath();
  ctx.stokeStyle = "black";
  ctx.stroke(region);
}
