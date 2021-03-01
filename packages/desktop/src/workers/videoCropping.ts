import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { BlazeFaceModel, load } from "@tensorflow-models/blazeface";
import { THROW, getBoundingCircle, mix } from "./videoCroppingHelpers";
import { expose } from "threads/worker";

let blazeModel: BlazeFaceModel;

load({
  maxFaces: 1,
}).then((model: BlazeFaceModel) => (blazeModel = model));

const videoCropping = {
  async getCoordinates(
    frame: ImageData,
    latestBoundingBox: number[],
    avgBoundingBoxCenter: number[],
    avgBoundingBoxRadius: number,
  ): Promise<{
    latestBoundingBox: number[];
    avgBoundingBoxCenter: number[];
    avgBoundingBoxRadius: number;
  }> {
    try {
      const prediction = await blazeModel.estimateFaces(frame, false);

      if (prediction.length > 0 && prediction[0].landmarks) {
        const {
          boundingCircleCenter,
          boundingCircleRadius,
        } = getBoundingCircle(prediction[0]);

        avgBoundingBoxCenter[0] = mix(
          THROW,
          avgBoundingBoxCenter[0],
          boundingCircleCenter[0],
        );
        avgBoundingBoxCenter[1] = mix(
          THROW,
          avgBoundingBoxCenter[1],
          boundingCircleCenter[1],
        );
        avgBoundingBoxRadius = mix(
          THROW,
          avgBoundingBoxRadius,
          boundingCircleRadius,
        );

        const updatedBoundingBox = [
          avgBoundingBoxCenter[0] - avgBoundingBoxRadius,
          avgBoundingBoxCenter[1] - avgBoundingBoxRadius,
          avgBoundingBoxRadius * 2,
          avgBoundingBoxRadius * 2,
        ];

        if (updatedBoundingBox[0] > 230) updatedBoundingBox[0] = 230;
        if (updatedBoundingBox[0] < 0) updatedBoundingBox[0] = 0;

        if (
          Math.abs(updatedBoundingBox[0] - latestBoundingBox[0]) > 3 ||
          Math.abs(updatedBoundingBox[1] - latestBoundingBox[1]) > 3 ||
          Math.abs(updatedBoundingBox[2] - latestBoundingBox[2]) > 5 ||
          Math.abs(updatedBoundingBox[3] - latestBoundingBox[3]) > 5
        ) {
          latestBoundingBox = updatedBoundingBox;
        }
      }
    } catch (error) {
      //
    }

    return { latestBoundingBox, avgBoundingBoxCenter, avgBoundingBoxRadius };
  },
};

export type VideoCropping = typeof videoCropping;
expose(videoCropping);
