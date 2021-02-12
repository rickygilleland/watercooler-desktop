/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AuthenticatedRequestHeaders, GlobalState } from "../store/types/index";
import {
  CREATE_CALL_FAILURE,
  CREATE_CALL_STARTED,
  CREATE_CALL_SUCCESS,
  CREATE_ROOM_FAILURE,
  CREATE_ROOM_STARTED,
  CREATE_ROOM_SUCCESS,
  GET_ORGANIZATIONS_FAILURE,
  GET_ORGANIZATIONS_SUCCESS,
  GET_ORGANIZATION_USERS_FAILURE,
  GET_ORGANIZATION_USERS_STARTED,
  GET_ORGANIZATION_USERS_SUCCESS,
  INVITE_USERS_FAILURE,
  INVITE_USERS_STARTED,
  INVITE_USERS_SUCCESS,
  OrganizationActionTypes,
  OrganizationResponse,
} from "../store/types/organization";
import { Room, RoomType } from "../store/types/room";
import { User } from "../store/types/user";

export function getOrganizationsSuccess(
  payload: OrganizationResponse,
): OrganizationActionTypes {
  return {
    type: GET_ORGANIZATIONS_SUCCESS,
    payload,
  };
}

export function getOrganizationsFailure(): OrganizationActionTypes {
  return {
    type: GET_ORGANIZATIONS_FAILURE,
  };
}

export function getOrganizationUsersStarted(): OrganizationActionTypes {
  return {
    type: GET_ORGANIZATION_USERS_STARTED,
  };
}

export function getOrganizationUsersSuccess(
  payload: Partial<User>[],
): OrganizationActionTypes {
  return {
    type: GET_ORGANIZATION_USERS_SUCCESS,
    payload,
  };
}

export function getOrganizationUsersFailure(): OrganizationActionTypes {
  return {
    type: GET_ORGANIZATION_USERS_FAILURE,
  };
}

export function inviteUsersStarted(): OrganizationActionTypes {
  return {
    type: INVITE_USERS_STARTED,
  };
}

export function inviteUsersSuccess(): OrganizationActionTypes {
  return {
    type: INVITE_USERS_SUCCESS,
  };
}

export function inviteUsersFailure(): OrganizationActionTypes {
  return {
    type: INVITE_USERS_FAILURE,
  };
}

export function createRoomStarted(): OrganizationActionTypes {
  return {
    type: CREATE_ROOM_STARTED,
  };
}

export function createRoomSuccess(payload: Room): OrganizationActionTypes {
  return {
    type: CREATE_ROOM_SUCCESS,
    payload,
  };
}

export function createRoomFailure(): OrganizationActionTypes {
  return {
    type: CREATE_ROOM_FAILURE,
  };
}

export function createCallStarted(): OrganizationActionTypes {
  return {
    type: CREATE_CALL_STARTED,
  };
}

export function createCallSuccess(payload: Room): OrganizationActionTypes {
  return {
    type: CREATE_CALL_SUCCESS,
    payload,
  };
}

export function createCallFailure(): OrganizationActionTypes {
  return {
    type: CREATE_CALL_FAILURE,
  };
}

export function getOrganizations() {
  return (
    dispatch: (arg0: OrganizationActionTypes) => void,
    getState: () => GlobalState,
    axios: {
      get: (
        requestUrl: string,
        arg1: { headers: AuthenticatedRequestHeaders },
      ) => Promise<{ data: OrganizationResponse }>;
    },
  ) => {
    const state = getState();

    try {
      axios
        .get("https://blab.to/api/organization", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + state.auth.authKey,
          },
        })
        .then((response: { data: OrganizationResponse }) => {
          dispatch(getOrganizationsSuccess(response.data));
        })
        .catch(() => {
          dispatch(getOrganizationsFailure());
        });
    } catch (error) {
      dispatch(getOrganizationsFailure());
    }
  };
}

export function getOrganizationUsers(organization_id: number) {
  return (
    dispatch: (arg0: OrganizationActionTypes) => void,
    getState: () => GlobalState,
    axios: {
      get: (
        arg0: string,
        arg1: { headers: AuthenticatedRequestHeaders },
      ) => Promise<{ data: Partial<User>[] }>;
    },
  ) => {
    dispatch(getOrganizationUsersStarted());
    const state = getState();
    //check if we need to do some state stuff

    try {
      axios
        .get(`https://blab.to/api/organization/${organization_id}/users`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + state.auth.authKey,
          },
        })
        .then((response: { data: Partial<User>[] }) => {
          dispatch(getOrganizationUsersSuccess(response.data));
        })
        .catch(() => {
          dispatch(getOrganizationUsersFailure());
        });
    } catch (error) {
      dispatch(getOrganizationUsersFailure());
    }
  };
}

export function inviteUsers(emails: string[]) {
  return (
    dispatch: (arg0: OrganizationActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: { emails: string[] };
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: boolean }>,
  ) => {
    dispatch(inviteUsersStarted());
    const state = getState();

    const organization_id = state.organization.organization.id;

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/organization/${organization_id}/users/invite`,
        data: { emails: emails },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then(() => {
          dispatch(inviteUsersSuccess());
        })
        .catch(() => {
          dispatch(inviteUsersFailure());
        });
    } catch (error) {
      dispatch(inviteUsersFailure());
    }
  };
}

export function createRoom(
  name: string,
  videoEnabled: boolean,
  isPrivate: boolean,
) {
  return (
    dispatch: (arg0: OrganizationActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: Partial<Room>;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: Room }>,
  ) => {
    dispatch(createRoomStarted());
    const state = getState();

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/room`,
        data: {
          name: name,
          video_enabled: videoEnabled,
          is_private: isPrivate,
          organization_id: state.organization.organization.id,
          team_id: state.organization.teams[0].id,
        },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: Room }) => {
          dispatch(createRoomSuccess(response.data));
        })
        .catch(() => {
          dispatch(createRoomFailure());
        });
    } catch (error) {
      dispatch(createRoomFailure());
    }
  };
}

export function createCall(participants: number[]) {
  return (
    dispatch: (arg0: OrganizationActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: Partial<Room>;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: Room }>,
  ) => {
    dispatch(createCallStarted());
    const state = getState();

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/call`,
        data: {
          organization_id: state.organization.organization.id,
          team_id: state.organization.teams[0].id,
          participants,
          type: RoomType.Call,
        },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: Room }) => {
          dispatch(createCallSuccess(response.data));
        })
        .catch(() => {
          dispatch(createCallFailure());
        });
    } catch (error) {
      dispatch(createCallFailure());
    }
  };
}
