import { Action } from 'redux';
import { 
    GET_AVAILABLE_DEVICES_STARTED,
    GET_AVAILABLE_DEVICES_SUCCESS,
    GET_AVAILABLE_DEVICES_FAILURE,
    UPDATE_DEFAULT_DEVICES_SUCCESS
 } from '../actions/settings';

const initialState = {
    devices: [],
    defaultDevices: {}
}

export default function user(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_AVAILABLE_DEVICES_STARTED:
            return state;
        case GET_AVAILABLE_DEVICES_SUCCESS:
            let updatedDevices = {
                audioInputs: [],
                videoInputs: [],
                audioOutputs: []
            };

            action.payload.forEach(device => {
                if (device.kind == "audioinput") {
                    updatedDevices.audioInputs.push({
                        label: device.label,
                        deviceId: device.deviceId,
                        rawInfo: device
                    });
                }
                if (device.kind == "audiooutput") {
                    updatedDevices.audioOutputs.push({
                        label: device.label,
                        deviceId: device.deviceId,
                        rawInfo: device
                    });
                }
                if (device.kind == "videoinput") {
                    updatedDevices.videoInputs.push({
                        label: device.label,
                        deviceId: device.deviceId,
                        rawInfo: device
                    });
                }
            })

            updatedState = {
                devices: updatedDevices
            }

            break;
        case GET_AVAILABLE_DEVICES_FAILURE:
            return state;
            break;
        case UPDATE_DEFAULT_DEVICES_SUCCESS:

            updatedState = {
                defaultDevices: {
                    videoInput: action.payload.videoInput,
                    audioInput: action.payload.audioInput,
                    audioOutput: action.payload.audioOutput,
                }
            }

            break;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, { ...state, ...updatedState });
    return newState;
};