import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { ipcRenderer } from "electron";
import React from "react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bodyPix = require("@tensorflow-models/body-pix");

class BlurNetBackground extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      raw_local_stream: null,
      active: false,
    };

    this.startNet = this.startNet.bind(this);
    this.startBackgroundBlur = this.startBackgroundBlur.bind(this);
    this.stopBackgroundBlur = this.stopBackgroundBlur.bind(this);

    this.net = null;
  }

  componentDidMount() {
    this.startNet();
  }

  async startNet() {
    this.net = await bodyPix.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    });

    ipcRenderer.on("net-status-update", (event, args) => {
      if (args.net == "backgroundBlur") {
        if (args.status) {
          if (this.state.raw_local_stream == null) {
            this.setState({ active: true });
            return this.startBackgroundBlur();
          }
        } else {
          this.setState({ active: false });
          this.stopBackgroundBlur();
        }
      }
    });
  }

  async startBackgroundBlur() {
    const { settings } = this.props;

    console.log("STARTED");

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
      streamOptions,
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

    let personSegmentation = null;

    const that = this;

    localVideo.onplaying = async () => {
      console.log("PLAYING");

      async function getUpdatedCoords() {
        const curDate = new Date();

        if (that.state.active == false) {
          return;
        }

        if (
          (that.net != null && personSegmentation == null) ||
          curDate.getTime() - personSegmentation.generated > 50
        ) {
          personSegmentation = await that.net.segmentPerson(localVideo, {
            internalResolution: "full",
            segmentationThreshold: 0.8,
            scoreThreshold: 0.2,
            maxDetections: 3,
          });

          personSegmentation.generated = curDate.getTime();

          ipcRenderer.invoke("background-blur-update", {
            type: "updated_coordinates",
            personSegmentation,
          });
        }

        requestAnimationFrame(getUpdatedCoords);
      }

      getUpdatedCoords();
    };
  }

  stopBackgroundBlur() {
    const { raw_local_stream } = this.state;

    console.log("STOPPED");

    if (raw_local_stream != null) {
      const tracks = raw_local_stream.getTracks();

      tracks.forEach(function (track) {
        track.stop();
      });
    }

    this.setState({ raw_local_stream: null });
  }

  componentWillUnmount() {
    this.stopBackgroundBlur();
  }

  render() {
    return null;
  }
}

export default BlurNetBackground;
