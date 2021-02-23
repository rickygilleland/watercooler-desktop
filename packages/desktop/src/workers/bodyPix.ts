import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import { Observable } from "observable-fns";
import { expose } from "threads/worker";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bodyPix = require("@tensorflow-models/body-pix");

/*
let net: any;

bodyPix
  .load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  })
  .then((model: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    net = model;
  });*/

expose(async function renderCanvas(
  backgroundBlurFrame: ImageData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const net = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });

  try {
    const personSegmentation = await net.segmentPerson(backgroundBlurFrame, {
      internalResolution: "full",
      segmentationThreshold: 0.8,
      scoreThreshold: 0.2,
      maxDetections: 3,
    });

    return new Observable(personSegmentation);
  } catch (error) {
    //
  }
});
