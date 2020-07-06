import React from 'react';
import { ipcRenderer } from 'electron';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
const bodyPix = require('@tensorflow-models/body-pix');
const blazeface = require('@tensorflow-models/blazeface');

class FaceTrackingNetBackground extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            raw_local_stream: null
        }

        this.startNet = this.startNet.bind(this);
    }

    componentDidMount() {
        this.startNet();
    }

    async startNet() {
        const { settings } = this.props;
        
        let streamOptions;
        if (settings.defaultDevices != null && Object.keys(settings.defaultDevices).length !== 0) {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                    deviceId: settings.defaultDevices.videoInput
                },
                audio: false
            }
        } else {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                },
                audio: false
            }
        }

        const raw_local_stream = await navigator.mediaDevices.getUserMedia(streamOptions);

        let tracks = raw_local_stream.getTracks();

        this.setState({ raw_local_stream })

        let localVideo = document.createElement("video")
        localVideo.srcObject = raw_local_stream;
        localVideo.autoplay = true;
        localVideo.muted = true;

        localVideo.onloadedmetadata = () => {
            localVideo.width = localVideo.videoWidth;
            localVideo.height = localVideo.videoHeight;
        }

        const model = await blazeface.load();

        var facePrediction = null;
        var newPrediction = {};

        async function getUpdatedCoords() {
            const curDate = new Date();

            if (facePrediction == null || (curDate.getTime() - newPrediction.generated) > 100) {

                facePrediction = await model.estimateFaces(localVideo, false);

                newPrediction = {
                    prediction: facePrediction[0],
                    generated: curDate.getTime()
                }

                ipcRenderer.invoke('face-tracking-update', { type: 'updated_coordinates', facePrediction: newPrediction });
            }

            requestAnimationFrame(getUpdatedCoords);
        }

        getUpdatedCoords();

    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
        const { raw_local_stream } = this.state;

        if (raw_local_stream != null) {
            const tracks = raw_local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }
    }

    render() {
        return(null);
    }
}

export default FaceTrackingNetBackground;