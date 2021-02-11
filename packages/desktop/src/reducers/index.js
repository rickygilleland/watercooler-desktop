import { combineReducers } from "redux";
import { connectRouter, push } from "connected-react-router";

import auth from "./auth";
import library from "./library";
import message from "./message";
import organization from "./organization";
import room from "./room";
import settings from "./settings";
import thread from "./thread";
import user from "./user";

export default (history) => {
  const appReducer = combineReducers({
    router: connectRouter(history),
    auth,
    user,
    library,
    room,
    message,
    thread,
    organization,
    settings,
  });

  const rootReducer = (state, action) => {
    if (action.type === "USER_LOGOUT") {
      state = undefined;
    }

    //state = undefined;

    if (
      typeof action.payload !== "undefined" &&
      typeof action.payload.error !== "undefined" &&
      action.payload.error == "Request failed with status code 401"
    ) {
      state = undefined;
    }

    return appReducer(state, action);
  };

  return rootReducer;
};
