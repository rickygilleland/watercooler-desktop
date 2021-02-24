import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import { BlazeFaceModel, load } from "@tensorflow-models/blazeface";
import { expose } from "threads/worker";

let net: BlazeFaceModel;

load({
  maxFaces: 1,
}).then((model: BlazeFaceModel) => {
  net = model;
});

/*

const counter = {
  getCount() {
    return currentCount
  },
  increment() {
    return ++currentCount
  },
  decrement() {
    return --currentCount
  }
}

export type Counter = typeof counter

expose(counter)
*/

const videoCropping = {
  async getCoordinates(frame: HTMLVideoElement) {
    try {
      const facePrediction = await net.estimateFaces(frame, false);

      console.log("TUCKER WORKER", facePrediction);
      console.log("TUCKER WORKER 2", frame);
      console.log("TUCKER WORKER 3", net);

      return facePrediction;
      //return new Observable(personSegmentation);
    } catch (error) {
      console.log("TUCKER ERROR", error);
    }
  },
};
/*
const getCoordinates = async (
  frame: ImageData,
): Promise<NormalizedFace[] | void> => {
  try {
    const facePrediction = await net.estimateFaces(frame, false);

    return facePrediction;
    //return new Observable(personSegmentation);
  } catch (error) {
    //
  }
};*/

export type VideoCropping = typeof videoCropping;
expose(videoCropping);
