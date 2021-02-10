import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import createElectronStorage from "redux-persist-electron-storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import thunk from "redux-thunk";
import { createHashHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import createRootReducer from "../reducers";
import axios from "axios";
import logger from "redux-logger";
import ElectronStore from "electron-store";

const hashHistory = createHashHistory();
const rootReducer = createRootReducer(hashHistory);
const router = routerMiddleware(hashHistory);
const enhancer = applyMiddleware(
  thunk.withExtraArgument(axios),
  router,
  logger
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
