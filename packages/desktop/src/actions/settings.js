export const GET_AVAILABLE_DEVICES_STARTED = "GET_AVAILABLE_DEVICES_STARTED";
export const GET_AVAILABLE_DEVICES_SUCCESS = "GET_AVAILABLE_DEVICES_SUCCESS";
export const GET_AVAILABLE_DEVICES_FAILURE = "GET_AVAILABLE_DEVICES_FAILURE";
export const UPDATE_DEFAULT_DEVICES_SUCCESS = "UPDATE_DEFAULT_DEVICES_SUCCESS";
export const UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS =
  "UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS";
export const UPDATE_ROOM_SETTINGS_SUCCESS = "UPDATE_ROOM_SETTINGS_SUCCESS";

export function getAvailableDevicesSuccess(payload) {
  return {
    type: GET_AVAILABLE_DEVICES_SUCCESS,
    payload,
  };
}

export function getAvailableDevicesFailure(payload) {
  return {
    type: GET_AVAILABLE_DEVICES_FAILURE,
    payload,
  };
}

export function updateDefaultDevicesSuccess(payload) {
  return {
    type: UPDATE_DEFAULT_DEVICES_SUCCESS,
    payload,
  };
}

export function updateExperimentalSettingsSuccess(payload) {
  return {
    type: UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS,
    payload,
  };
}

export function updateRoomSettingsSuccess(payload) {
  return {
    type: UPDATE_ROOM_SETTINGS_SUCCESS,
    payload,
  };
}

export function getAvailableDevices() {
  return (dispatch, getState) => {
    const state = getState();

    try {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          dispatch(getAvailableDevicesSuccess(devices));
        })
        .catch((error) => {
          dispatch(getAvailableDevicesFailure(error.message));
        });
    } catch (error) {
      dispatch(getAvailableDevicesFailure(error));
    }
  };
}

export function updateDefaultDevices(
  defaultVideoInput,
  defaultAudioInput,
  defaultAudioOutput,
  backgroundBlurAmount,
) {
  return (dispatch, getState) => {
    const state = getState();

    try {
      var payload = {
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

export function updateExperimentalSettings(settingToChange, updatedValue) {
  return (dispatch, getState) => {
    const state = getState();

    try {
      var payload = {
        settingToChange,
        updatedValue,
      };

      dispatch(updateExperimentalSettingsSuccess(payload));
    } catch (error) {
      //silently fail
    }
  };
}

export function updateRoomSettings(settingToChange, updatedValue) {
  return (dispatch, getState) => {
    const state = getState();

    try {
      var payload = {
        settingToChange,
        updatedValue,
      };

      dispatch(updateRoomSettingsSuccess(payload));
    } catch (error) {
      //silently fail
    }
  };
}
