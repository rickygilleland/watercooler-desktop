export const GET_AVAILABLE_DEVICES_STARTED = "GET_AVAILABLE_DEVICES_STARTED";
export const GET_AVAILABLE_DEVICES_SUCCESS = "GET_AVAILABLE_DEVICES_SUCCESS";
export const GET_AVAILABLE_DEVICES_FAILURE = "GET_AVAILABLE_DEVICES_FAILURE";
export const UPDATE_DEFAULT_DEVICES_SUCCESS = "UPDATE_DEFAULT_DEVICES_SUCCESS";
export const UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS =
  "UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS";
export const UPDATE_ROOM_SETTINGS_SUCCESS = "UPDATE_ROOM_SETTINGS_SUCCESS";

export interface DefaultDevices {
  videoInput: string;
  audioInput: string;
  audioOutput: string;
  backgroundBlurAmount: number;
}

export interface ExperimentalSettings {
  faceTracking: boolean;
}

export interface RoomSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  backgroundBlurEnabled: boolean;
  backgroundBlurAmount: number;
}

export interface DeviceInfo {
  label: string;
  deviceId: string;
  rawInfo: MediaDeviceInfo;
}

export interface Devices {
  audioInputs: DeviceInfo[];
  videoInputs: DeviceInfo[];
  audioOutputs: DeviceInfo[];
}

export interface SettingsState {
  devices: Devices;
  defaultDevices: DefaultDevices;
  experimentalSettings: ExperimentalSettings;
  roomSettings: RoomSettings;
}

interface GetAvailableDevicesStartedAction {
  type: typeof GET_AVAILABLE_DEVICES_STARTED;
}

interface GetAvailableDevicesSuccessAction {
  type: typeof GET_AVAILABLE_DEVICES_SUCCESS;
  payload: MediaDeviceInfo[];
}

interface GetAvailableDevicesFailureAction {
  type: typeof GET_AVAILABLE_DEVICES_FAILURE;
}

interface UpdateDefaultDevicesSuccessAction {
  type: typeof UPDATE_DEFAULT_DEVICES_SUCCESS;
  payload: DefaultDevices;
}

interface UpdateExperimentalSettingsSuccessAction {
  type: typeof UPDATE_EXPERIMENTAL_SETTINGS_SUCCESS;
  payload: {
    settingToChange: string;
    updatedValue: boolean;
  };
}

interface UpdateRoomSettingsSuccessAction {
  type: typeof UPDATE_ROOM_SETTINGS_SUCCESS;
  payload: {
    settingToChange: string;
    updatedValue: boolean;
  };
}

export type SettingsActionTypes =
  | GetAvailableDevicesStartedAction
  | GetAvailableDevicesSuccessAction
  | GetAvailableDevicesFailureAction
  | UpdateDefaultDevicesSuccessAction
  | UpdateExperimentalSettingsSuccessAction
  | UpdateRoomSettingsSuccessAction;
