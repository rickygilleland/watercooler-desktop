import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router'
import createRootReducer from '../reducers';
import axios from 'axios';
import logger from 'redux-logger'

const browserHistory = createBrowserHistory();
const rootReducer = createRootReducer(browserHistory);
const router = routerMiddleware(browserHistory);
const enhancer = applyMiddleware(thunk.withExtraArgument(axios), router, logger);

const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, undefined, enhancer);
export const persistor = persistStore(store);
export const history = browserHistory;