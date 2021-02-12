import * as Sentry from "@sentry/electron";
import { AppContainer } from "react-hot-loader";
import { history, persistor, store } from "./store";
import React from "react";
import ReactDOM from "react-dom";

if (process.env.NODE_ENV != "development") {
  Sentry.init({
    dsn:
      "https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374",
    environment: process.env.NODE_ENV,
  });
}

export type StoreType = typeof store;
export type HistoryType = typeof history;

const render = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const App = require("./app").default;
  ReactDOM.render(
    <AppContainer>
      <App store={store} history={history} persistor={persistor} />
    </AppContainer>,
    document.getElementById("App"),
  );
};

render();
