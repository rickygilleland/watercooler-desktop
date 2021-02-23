import {
  ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS,
  CREATE_ITEM_FAILURE,
  CREATE_ITEM_STARTED,
  CREATE_ITEM_SUCCESS,
  GET_ITEMS_FAILURE,
  GET_ITEMS_STARTED,
  GET_ITEMS_SUCCESS,
  LibraryActionTypes,
  LibraryGroup,
  LibraryState,
} from "../store/types/library";
import { cloneDeep, sortBy } from "lodash";

const initialState: LibraryState = {
  items: {},
  itemsOrder: [],
  loading: false,
  creating: false,
  error: false,
};

export default function library(
  state = initialState,
  action: LibraryActionTypes,
): LibraryState {
  let updatedState = {};
  switch (action.type) {
    case GET_ITEMS_STARTED: {
      updatedState = {
        loading: true,
        creating: false,
        error: false,
      };
      break;
    }
    case GET_ITEMS_SUCCESS: {
      const updatedItems: LibraryGroup = {};

      action.payload.forEach((item) => {
        updatedItems[item.id] = item;
      });

      const itemsOrder = sortBy(Object.keys(updatedItems)).reverse();

      updatedState = {
        items: updatedItems,
        itemsOrder: itemsOrder,
        loading: false,
        creating: false,
        error: false,
      };
      break;
    }
    case GET_ITEMS_FAILURE: {
      updatedState = {
        loading: false,
        creating: false,
        error: true,
      };
      break;
    }
    case CREATE_ITEM_STARTED: {
      updatedState = {
        creating: true,
        error: false,
      };
      break;
    }
    case ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS:
    case CREATE_ITEM_SUCCESS: {
      const updatedItems = cloneDeep(state.items);

      updatedItems[action.payload.id] = action.payload;

      const itemsOrder = sortBy(Object.keys(updatedItems)).reverse();

      updatedState = {
        items: updatedItems,
        itemsOrder: itemsOrder,
        creating: false,
        error: false,
      };
      break;
    }
    case CREATE_ITEM_FAILURE: {
      updatedState = {
        creating: false,
        error: true,
      };
      break;
    }
    default: {
      //do nothing
      return state;
    }
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
