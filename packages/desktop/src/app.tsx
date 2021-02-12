import { Color, Titlebar } from "custom-electron-titlebar";
import { ConnectedRouter } from "connected-react-router";
import { HistoryType, StoreType } from "./renderer";
import { PersistGate } from "redux-persist/integration/react";
import { Persistor } from "redux-persist";
import { Provider } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import BlurNetBackground from "./containers/BlurNetBackground";
import LoadingPage from "./containers/LoadingPage";
import LoginPage from "./containers/LoginPage";
import MagicLoginPage from "./containers/MagicLoginPage";
import React from "react";
import ScreenShareControls from "./components/ScreenShareControls";
import Sidebar from "./containers/Sidebar";
import posthog from "posthog-js";
import routes from "./constants/routes.json";

let path = window.location.href;
path = path.substring(path.lastIndexOf("#") + 1);

if (path != "/screensharing_controls") {
  new Titlebar({
    backgroundColor: Color.fromHex("#121422"),
    overflow: "hidden",
  });
}

const isDevMode = Boolean(process.execPath.match(/[\\/]electron/));

if (!isDevMode) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { init } = require("@sentry/electron/dist/renderer");

  init({
    dsn:
      "https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374",
    environment: process.env.NODE_ENV,
  });
}

posthog.init("64tUVTgJhFVIV7BADDLYHN-zG2Ja1yqzOI_SE8Pytc4", {
  api_host: "https://analytics.blab.to",
});

interface AppProps {
  store: StoreType;
  persistor: Persistor;
  history: HistoryType;
}

export default function App(props: AppProps): JSX.Element {
  const { store, persistor, history } = props;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConnectedRouter history={history}>
          <Switch>
            <Redirect
              from="/"
              exact
              to={{
                pathname: routes.LOADING,
              }}
            />
            <Route path={routes.LOGIN} component={LoginPage} />
            <Route path={routes.MAGIC_LOGIN} component={MagicLoginPage} />
            <Route path={routes.LOADING} component={LoadingPage} />
            <Route
              path="/screensharing_controls"
              exact
              component={ScreenShareControls}
            />

            <Route
              path="/blur_net_background"
              exact
              component={BlurNetBackground}
            />
            <Route path="/*" component={Sidebar} />
          </Switch>
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  );
}
