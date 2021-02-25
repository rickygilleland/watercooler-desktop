// eslint-disable-next-line import/named
import { NormalizedFace } from "@tensorflow-models/blazeface";

const MODEL_HEAD_EAR_COORD_X = 0.7;
const MODEL_HEAD_RIGHT_EYE_COORD = [0.3, 0.3, 0.7];
const MODEL_HEAD_BOUNDING_SPHERE_CENTER_COORD = [0, 0.15, 0.15];
const MODEL_HEAD_BOUNDING_SPHERE_RADIUS = 1.55;
export const THROW = 0.3;
export type PredictionCoords = [number, number];

const average = (x: number, y: number): number => {
  return (x + y) / 2;
};

const vectorAverage = (
  v1: PredictionCoords,
  v2: PredictionCoords,
): PredictionCoords => {
  return [average(v1[0], v2[0]), average(v1[1], v2[1])];
};

const vectorSubtract = (v1: number[], v2: number[]): PredictionCoords => {
  return [v1[0] - v2[0], v1[1] - v2[1]];
};

const vectorAdd = (...args: number[][]) => {
  const out = [0, 0];
  for (const vector of args) {
    out[0] += vector[0];
    out[1] += vector[1];
  }
  return out;
};

const vectorMultiply = (v: number[], m: number) => {
  return [v[0] * m, v[1] * m];
};

const xzUnitCirclePoints: number[][] = [];
for (let theta = 0; theta < 2 * Math.PI; theta += 0.1) {
  xzUnitCirclePoints.push([Math.sin(theta), 0, Math.cos(theta)]);
}

const vectorLength = (vector: number[]): number => {
  const [x, y] = vector;
  return Math.sqrt(x * x + y * y);
};

export const mix = (p: number, a: number, b: number): number => {
  return p * b + (1 - p) * a;
};

export const getBoundingCircle = (
  prediction: NormalizedFace,
): {
  boundingCircleCenter: number[];
  boundingCircleRadius: number;
} => {
  if (!prediction.landmarks) {
    return { boundingCircleCenter: [0, 0], boundingCircleRadius: 50 };
  }
  const landmarks = prediction.landmarks as PredictionCoords[];
  const rightEye = landmarks[0];
  const leftEye = landmarks[1];
  const nose = landmarks[2];
  const rightEar = landmarks[4];
  const leftEar = landmarks[5];

  const origin = vectorAverage(leftEar, rightEar);
  const unitZ = vectorSubtract(nose, origin);
  const unitX = vectorMultiply(
    vectorSubtract(rightEar, origin),
    1 / MODEL_HEAD_EAR_COORD_X,
  );
  const eyesZ = vectorMultiply(unitZ, MODEL_HEAD_RIGHT_EYE_COORD[2]);

  const leftEyeOnXZPlane = vectorAdd(
    origin,
    vectorMultiply(unitX, -MODEL_HEAD_RIGHT_EYE_COORD[0]),
    eyesZ,
  );
  const rightEyeOnXZPlane = vectorAdd(
    origin,
    vectorMultiply(unitX, MODEL_HEAD_RIGHT_EYE_COORD[0]),
    eyesZ,
  );

  const eyesY = vectorAverage(
    vectorSubtract(leftEye, leftEyeOnXZPlane),
    vectorSubtract(rightEye, rightEyeOnXZPlane),
  );

  const unitY = vectorMultiply(eyesY, 1 / MODEL_HEAD_RIGHT_EYE_COORD[1]);

  function project(coords: number[]) {
    return vectorAdd(
      origin,
      vectorMultiply(unitX, coords[0]),
      vectorMultiply(unitY, coords[1]),
      vectorMultiply(unitZ, coords[2]),
    );
  }

  const boundingCircleCenter = project(MODEL_HEAD_BOUNDING_SPHERE_CENTER_COORD);

  let unitLength = 0;
  for (const p of xzUnitCirclePoints) {
    const projectedUnitCirclePoint = vectorAdd(
      vectorMultiply(unitX, p[0]),
      vectorMultiply(unitY, p[1]),
      vectorMultiply(unitZ, p[2]),
    );
    unitLength = Math.max(unitLength, vectorLength(projectedUnitCirclePoint));
  }

  const boundingCircleRadius = unitLength * MODEL_HEAD_BOUNDING_SPHERE_RADIUS;

  return { boundingCircleCenter, boundingCircleRadius };
};
