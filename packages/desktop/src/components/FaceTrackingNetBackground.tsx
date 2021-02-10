import React from "react";
import { ipcRenderer } from "electron";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
const bodyPix = require("@tensorflow-models/body-pix");
const blazeface = require("@tensorflow-models/blazeface");

class FaceTrackingNetBackground extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      raw_local_stream: null,
      active: false,
    };

    this.startNet = this.startNet.bind(this);
    this.startFaceTracking = this.startFaceTracking.bind(this);
    this.stopFaceTracking = this.stopFaceTracking.bind(this);

    this.net = null;
  }

  componentDidMount() {
    this.startNet();
  }

  async startNet() {
    this.net = await blazeface.load();

    ipcRenderer.on("net-status-update", (event, args) => {
      if (args.net == "faceTracking") {
        if (args.status) {
          if (this.state.raw_local_stream == null) {
            this.setState({ active: true });
            return this.startFaceTracking();
          }
        } else {
          this.setState({ active: false });
          this.stopFaceTracking();
        }
      }
    });
  }

  async startFaceTracking() {
    const { settings } = this.props;

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

    const raw_local_stream = await navigator.mediaDevices.getUserMedia(
      streamOptions
    );

    this.setState({ raw_local_stream });

    const localVideo = document.createElement("video");
    localVideo.srcObject = raw_local_stream;
    localVideo.autoplay = true;
    localVideo.muted = true;

    localVideo.onloadedmetadata = () => {
      localVideo.width = localVideo.videoWidth;
      localVideo.height = localVideo.videoHeight;
    };

    let facePrediction = null;
    let newPrediction = {};

    const that = this;

    localVideo.onplaying = async () => {
      async function getUpdatedCoords() {
        const curDate = new Date();

        if (that.state.active == false) {
          return;
        }

        if (
          facePrediction == null ||
          curDate.getTime() - newPrediction.generated > 100
        ) {
          try {
            facePrediction = await that.net.estimateFaces(localVideo, false);

            newPrediction = {
              prediction: facePrediction[0],
              generated: curDate.getTime(),
            };

            ipcRenderer.invoke("face-tracking-update", {
              type: "updated_coordinates",
              facePrediction: newPrediction,
            });
          } catch (error) {
            //do nothing
          }
        }

        requestAnimationFrame(getUpdatedCoords);
      }

      getUpdatedCoords();
    };
  }

  stopFaceTracking() {
    const { raw_local_stream } = this.state;

    if (raw_local_stream != null) {
      const tracks = raw_local_stream.getTracks();

      tracks.forEach(function (track) {
        track.stop();
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    this.stopFaceTracking();
  }

  render() {
    return null;
  }
}

export default FaceTrackingNetBackground;
