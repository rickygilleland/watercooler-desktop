/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS,
  CREATE_ITEM_FAILURE,
  CREATE_ITEM_STARTED,
  CREATE_ITEM_SUCCESS,
  GET_ITEMS_FAILURE,
  GET_ITEMS_STARTED,
  GET_ITEMS_SUCCESS,
  LibraryActionTypes,
  LibraryItem,
} from "../store/types/library";

import { AuthenticatedRequestHeaders, GlobalState } from "../store/types";

export function getItemsStarted(): LibraryActionTypes {
  return {
    type: GET_ITEMS_STARTED,
  };
}

export function getItemsSuccess(payload: LibraryItem[]): LibraryActionTypes {
  return {
    type: GET_ITEMS_SUCCESS,
    payload,
  };
}

export function getItemsFailure(): LibraryActionTypes {
  return {
    type: GET_ITEMS_FAILURE,
  };
}

export function createItemStarted(): LibraryActionTypes {
  return {
    type: CREATE_ITEM_STARTED,
  };
}

export function createItemSuccess(payload: LibraryItem): LibraryActionTypes {
  return {
    type: CREATE_ITEM_SUCCESS,
    payload,
  };
}

export function createItemFailure(): LibraryActionTypes {
  return {
    type: CREATE_ITEM_FAILURE,
  };
}

export function addNewItemFromNotificationSuccess(
  payload: LibraryItem,
): LibraryActionTypes {
  return {
    type: ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS,
    payload,
  };
}

export function getLibraryItems() {
  return (
    dispatch: (arg0: LibraryActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: LibraryItem[] }>,
  ) => {
    dispatch(getItemsStarted());
    const state = getState();

    try {
      axios({
        method: "get",
        url: `https://blab.to/api/library/items`,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: LibraryItem[] }) => {
          dispatch(getItemsSuccess(response.data));
        })
        .catch(() => {
          dispatch(getItemsFailure());
        });
    } catch (error) {
      dispatch(getItemsFailure());
    }
  };
}

export function createItem(item: Partial<LibraryItem>) {
  return (
    dispatch: (arg0: LibraryActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: Partial<LibraryItem>;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: LibraryItem }>,
  ) => {
    dispatch(createItemStarted());
    const state = getState();

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/library/items`,
        data: item,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: LibraryItem }) => {
          dispatch(createItemSuccess(response.data));
        })
        .catch(() => {
          dispatch(createItemFailure());
        });
    } catch (error) {
      dispatch(createItemFailure());
    }
  };
}

export function addNewItemFromNotification(item: LibraryItem) {
  return (dispatch: (item: LibraryActionTypes) => void) => {
    dispatch(addNewItemFromNotificationSuccess(item));
  };
}
