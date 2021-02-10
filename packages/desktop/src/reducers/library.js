import { Action } from "redux";
import { orderBy, cloneDeep, sortBy } from "lodash";
import {
  GET_ITEMS_STARTED,
  GET_ITEMS_SUCCESS,
  GET_ITEMS_FAILURE,
  CREATE_ITEM_STARTED,
  CREATE_ITEM_SUCCESS,
  CREATE_ITEM_FAILURE,
  ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS,
} from "../actions/library";

const initialState = {
  items: {},
  itemsOrder: [],
  loading: false,
  creating: false,
  error: false,
};

export default function library(state = initialState, action = {}) {
  var updatedState = {};
  switch (action.type) {
    case GET_ITEMS_STARTED:
      updatedState = {
        loading: true,
        creating: false,
        error: false,
      };
      break;
    case GET_ITEMS_SUCCESS:
      var updatedItems = {};

      action.payload.data.forEach((item) => {
        updatedItems[item.id] = item;
      });

      var itemsOrder = sortBy(Object.keys(updatedItems)).reverse();

      updatedState = {
        items: updatedItems,
        itemsOrder: itemsOrder,
        loading: false,
        creating: false,
        error: false,
      };
      break;
    case GET_ITEMS_FAILURE:
      updatedState = {
        loading: false,
        creating: false,
        error: true,
      };
      break;
    case CREATE_ITEM_STARTED:
      updatedState = {
        creating: true,
        error: false,
      };
      break;
    case ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS:
    case CREATE_ITEM_SUCCESS:
      var updatedItems = cloneDeep(state.items);

      updatedItems[action.payload.data.id] = action.payload.data;

      var itemsOrder = sortBy(Object.keys(updatedItems)).reverse();

      updatedState = {
        items: updatedItems,
        itemsOrder: itemsOrder,
        creating: false,
        error: false,
      };
      break;
    case CREATE_ITEM_FAILURE:
      updatedState = {
        creating: false,
        error: true,
      };
      break;
    default:
      //do nothing
      return state;
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
