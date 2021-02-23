import { applyMiddleware, createStore } from "redux";
import { createHashHistory } from "history";
import { persistReducer, persistStore } from "redux-persist";
import { routerMiddleware } from "connected-react-router";
import ElectronStore from "electron-store";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import axios from "axios";
import createElectronStorage from "redux-persist-electron-storage";
import createRootReducer from "../reducers";
import logger from "redux-logger";
import thunk from "redux-thunk";

const hashHistory = createHashHistory();
const rootReducer = createRootReducer(hashHistory);
const router = routerMiddleware(hashHistory);
const enhancer = applyMiddleware(
  thunk.withExtraArgument(axios),
  router,
  logger,
);

const electronStore = new ElectronStore();

const persistConfig = {
  key: "root",
  storage: createElectronStorage({
    electronStore,
  }),
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, undefined, enhancer);
export const persistor = persistStore(store);
export const history = hashHistory;
