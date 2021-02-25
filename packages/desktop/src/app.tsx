import { Color, Titlebar } from "custom-electron-titlebar";
import { ConnectedRouter } from "connected-react-router";
import { HistoryType, StoreType } from "./renderer";
import { PersistGate } from "redux-persist/integration/react";
import { Persistor } from "redux-persist";
import { Provider } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import { Routes } from "./components/RootComponent";
import LoadingPage from "./containers/LoadingPage";
import LoginPage from "./containers/LoginPage";
import MagicLoginPage from "./containers/MagicLoginPage";
import React from "react";
import RootContainer from "./containers/RootContainer";
import ScreenShareControls from "./components/ScreenShareControls";
import posthog from "posthog-js";

let path = window.location.href;
path = path.substring(path.lastIndexOf("#") + 1);
let titlebar: Titlebar | undefined;

if (path != "/screensharing_controls") {
  titlebar = new Titlebar({
    backgroundColor: Color.fromHex("#121422"),
    overflow: "hidden",
  });
}

window.addEventListener("resize", () => {
  if (path === "/screensharing_controls") return;
  if (window.innerHeight < 300 && titlebar) {
    titlebar.dispose();
    titlebar = undefined;
  }

  if (window.innerHeight > 300 && !titlebar) {
    titlebar = new Titlebar({
      backgroundColor: Color.fromHex("#121422"),
      overflow: "hidden",
    });
  }
});

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
                pathname: Routes.Loading,
              }}
            />
            <Route path={Routes.Login} component={LoginPage} />
            <Route path={Routes.MagicLogin} component={MagicLoginPage} />
            <Route path={Routes.Loading} component={LoadingPage} />
            <Route
              path="/screensharing_controls"
              exact
              component={ScreenShareControls}
            />
            <Route path="/*" component={RootContainer} />
          </Switch>
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  );
}
