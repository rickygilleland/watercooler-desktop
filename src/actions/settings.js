export const GET_AVAILABLE_DEVICES_STARTED = 'GET_AVAILABLE_DEVICES_STARTED';
export const GET_AVAILABLE_DEVICES_SUCCESS = 'GET_AVAILABLE_DEVICES_SUCCESS';
export const GET_AVAILABLE_DEVICES_FAILURE = 'GET_AVAILABLE_DEVICES_FAILURE';
export const UPDATE_DEFAULT_DEVICES_SUCCESS = 'UPDATE_DEFAULT_DEVICES_SUCCESS';

export function getAvailableDevicesSuccess(payload) {
    return {
        type: GET_AVAILABLE_DEVICES_SUCCESS,
        payload
    };
}

export function getAvailableDevicesFailure(payload) {
    return {
        type: GET_AVAILABLE_DEVICES_FAILURE,
        payload
    };
}

export function updateDefaultDevicesSuccess(payload) {
    return {
        type: UPDATE_DEFAULT_DEVICES_SUCCESS,
        payload
    };
}

export function getAvailableDevices() {
    return (dispatch, getState) => {
        const state = getState();

        navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            dispatch(getAvailableDevicesSuccess(devices));
        })
        .catch(error => {
            dispatch(getAvailableDevicesFailure(error.message));
        });
    }
}

export function updateDefaultDevices(defaultVideoInput, defaultAudioInput, defaultAudioOutput) {
    return (dispatch, getState) => {
        const state = getState();

        var payload = {
            videoInput: defaultVideoInput,
            audioInput: defaultAudioInput,
            audioOutput: defaultAudioOutput
        }

        dispatch(updateDefaultDevicesSuccess(payload));        
    }
}