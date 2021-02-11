import { GlobalActionTypes, GlobalState } from "../store/types";
import { History } from "history";
import { Reducer, combineReducers } from "redux";
import { USER_LOGOUT } from "../store/types/auth";
import { connectRouter } from "connected-react-router";
import auth from "./auth";
import library from "./library";
import message from "./message";
import organization from "./organization";
import room from "./room";
import settings from "./settings";
import thread from "./thread";
import user from "./user";

export default (history: History): Reducer => {
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

  const rootReducer = (state: GlobalState, action: GlobalActionTypes) => {
    if (action.type === USER_LOGOUT) {
      state = undefined;
    }

    return appReducer(state, action);
  };

  return rootReducer;
};
