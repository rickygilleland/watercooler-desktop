import { Action } from "redux";
import {
  GET_AVAILABLE_DEVICES_FAILURE,
  GET_AVAILABLE_DEVICES_STARTED,
  GET_AVAILABLE_DEVICES_SUCCESS,
  UPDATE_DEFAULT_DEVICES_SUCCESS,
  UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS,
  UPDATE_ROOM_SETTINGS_SUCCESS,
} from "../actions/settings";
import { StaticRouter } from "react-router";

const initialState = {
  devices: [],
  defaultDevices: {},
  experimentalSettings: {
    faceTracking: false,
  },
  roomSettings: {
    videoEnabled: false,
    audioEnabled: true,
    backgroundBlurEnabled: false,
    backgroundBlurAmount: 30,
  },
};

export default function settings(state = initialState, action = {}) {
  var updatedState = {};
  switch (action.type) {
    case GET_AVAILABLE_DEVICES_STARTED:
      return state;
    case GET_AVAILABLE_DEVICES_SUCCESS:
      let updatedDevices = {
        audioInputs: [],
        videoInputs: [],
        audioOutputs: [],
      };

      action.payload.forEach((device) => {
        if (device.kind == "audioinput") {
          updatedDevices.audioInputs.push({
            label: device.label,
            deviceId: device.deviceId,
            rawInfo: device,
          });
        }
        if (device.kind == "audiooutput") {
          updatedDevices.audioOutputs.push({
            label: device.label,
            deviceId: device.deviceId,
            rawInfo: device,
          });
        }
        if (device.kind == "videoinput") {
          updatedDevices.videoInputs.push({
            label: device.label,
            deviceId: device.deviceId,
            rawInfo: device,
          });
        }
      });

      updatedState = {
        devices: updatedDevices,
      };

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
        },
        roomSettings: {
          ...state.roomSettings,
          backgroundBlurAmount: action.payload.backgroundBlurAmount,
        },
      };

      break;
    case UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS:
      updatedState = {
        experimentalSettings: {
          [action.payload.settingToChange]: action.payload.updatedValue,
        },
      };

      break;
    case UPDATE_ROOM_SETTINGS_SUCCESS:
      updatedState = {
        roomSettings: {
          ...state.roomSettings,
          [action.payload.settingToChange]: action.payload.updatedValue,
        },
      };

      break;
    default:
      //do nothing
      return state;
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
