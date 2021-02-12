/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  DefaultDevices,
  ExperimentalSettings,
  GET_AVAILABLE_DEVICES_FAILURE,
  GET_AVAILABLE_DEVICES_SUCCESS,
  RoomSettings,
  SettingsActionTypes,
  UPDATE_DEFAULT_DEVICES_SUCCESS,
  UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS,
  UPDATE_ROOM_SETTINGS_SUCCESS,
} from "../store/types/settings";

export function getAvailableDevicesSuccess(
  payload: MediaDeviceInfo[],
): SettingsActionTypes {
  return {
    type: GET_AVAILABLE_DEVICES_SUCCESS,
    payload,
  };
}

export function getAvailableDevicesFailure(): SettingsActionTypes {
  return {
    type: GET_AVAILABLE_DEVICES_FAILURE,
  };
}

export function updateDefaultDevicesSuccess(
  payload: DefaultDevices,
): SettingsActionTypes {
  return {
    type: UPDATE_DEFAULT_DEVICES_SUCCESS,
    payload,
  };
}

export function updateExperimentalSettingsSuccess(payload: {
  settingToChange: string;
  updatedValue: Partial<ExperimentalSettings>;
}): SettingsActionTypes {
  return {
    type: UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS,
    payload,
  };
}

export function updateRoomSettingsSuccess(payload: {
  settingToChange: string;
  updatedValue: Partial<RoomSettings>;
}): SettingsActionTypes {
  return {
    type: UPDATE_ROOM_SETTINGS_SUCCESS,
    payload,
  };
}

export function getAvailableDevices() {
  return (dispatch: (arg0: SettingsActionTypes) => void) => {
    try {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          dispatch(getAvailableDevicesSuccess(devices));
        })
        .catch(() => {
          dispatch(getAvailableDevicesFailure());
        });
    } catch (error) {
      dispatch(getAvailableDevicesFailure());
    }
  };
}

export function updateDefaultDevices(
  defaultVideoInput: string,
  defaultAudioInput: string,
  defaultAudioOutput: string,
  backgroundBlurAmount: number,
) {
  return (dispatch: (arg0: SettingsActionTypes) => void) => {
    try {
      const payload: DefaultDevices = {
        videoInput: defaultVideoInput,
        audioInput: defaultAudioInput,
        audioOutput: defaultAudioOutput,
        backgroundBlurAmount,
      };

      dispatch(updateDefaultDevicesSuccess(payload));
    } catch (error) {
      //silently fail
    }
  };
}

export function updateExperimentalSettings(
  settingToChange: string,
  updatedValue: Partial<ExperimentalSettings>,
) {
  return (dispatch: (arg0: SettingsActionTypes) => void) => {
    try {
      const payload = {
        settingToChange,
        updatedValue,
      };

      dispatch(updateExperimentalSettingsSuccess(payload));
    } catch (error) {
      //silently fail
    }
  };
}

export function updateRoomSettings(
  settingToChange: string,
  updatedValue: Partial<RoomSettings>,
) {
  return (dispatch: (arg0: SettingsActionTypes) => void) => {
    try {
      const payload = {
        settingToChange,
        updatedValue,
      };

      dispatch(updateRoomSettingsSuccess(payload));
    } catch (error) {
      //silently fail
    }
  };
}
