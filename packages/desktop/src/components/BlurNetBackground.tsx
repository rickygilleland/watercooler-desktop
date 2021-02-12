import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as bodyPix from "@tensorflow-models/body-pix";
import { PropsFromRedux } from "../containers/BlurNetBackground";
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

export default function BlurNetBackground(props: PropsFromRedux): JSX.Element {
  const [net, setNet] = useState<bodyPix.BodyPix>();
  const [rawLocalStream, setRawLocalStream] = useState<MediaStream>();
  const [active, setActive] = useState(false);
  const [generated, setGenerated] = useState<number>();

  useEffect(() => {
    const startNet = async () => {
      const net = await bodyPix.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });

      setNet(net);

      ipcRenderer.on("net-status-update", (_event, args) => {
        if (args.net === "backgroundBlur" && args.status) {
          if (!rawLocalStream) {
            setActive(true);
            startBackgroundBlur();
            return;
          }
        }
        setActive(false);
        stopBackgroundBlur();
      });
    };

    startNet();

    return () => {
      stopBackgroundBlur();
      ipcRenderer.removeAllListeners("net-status-update");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBackgroundBlur = async () => {
    const { settings } = props;

    let streamOptions;
    if (
      settings.defaultDevices != null &&
      Object.keys(settings.defaultDevices).length !== 0
    ) {
      streamOptions = {
        video: {
          aspectRatio: 1.3333333333,
          deviceId: settings.defaultDevices.videoInput,
        },
        audio: false,
      };
    } else {
      streamOptions = {
        video: {
          aspectRatio: 1.3333333333,
        },
        audio: false,
      };
    }

    const rawLocalStream = await navigator.mediaDevices.getUserMedia(
      streamOptions,
    );

    setRawLocalStream(rawLocalStream);

    const localVideo = document.createElement("video");
    localVideo.srcObject = rawLocalStream;
    localVideo.autoplay = true;
    localVideo.muted = true;

    localVideo.onloadedmetadata = () => {
      localVideo.width = localVideo.videoWidth;
      localVideo.height = localVideo.videoHeight;
    };

    let personSegmentation: bodyPix.SemanticPersonSegmentation;

    localVideo.onplaying = async () => {
      async function getUpdatedCoords() {
        const curDate = new Date();

        if (!active) {
          return;
        }

        if (
          (net && !personSegmentation) ||
          curDate.getTime() - generated > 50
        ) {
          personSegmentation = await net.segmentPerson(localVideo, {
            internalResolution: "full",
            segmentationThreshold: 0.8,
            scoreThreshold: 0.2,
            maxDetections: 3,
          });
          const generated = curDate.getTime();

          setGenerated(generated);

          ipcRenderer.invoke("background-blur-update", {
            type: "updated_coordinates",
            personSegmentation,
            generated,
          });
        }

        requestAnimationFrame(getUpdatedCoords);
      }

      getUpdatedCoords();
    };
  };

  const stopBackgroundBlur = () => {
    if (rawLocalStream) {
      const tracks = rawLocalStream.getTracks();

      tracks.forEach(function (track) {
        track.stop();
      });
    }

    setRawLocalStream(undefined);
  };

  return null;
}
