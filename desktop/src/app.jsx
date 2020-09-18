import React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import routes from './constants/routes.json';
import Sidebar from './containers/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './containers/LoginPage';
import MagicLoginPage from './containers/MagicLoginPage';
import ScreenShareControls from './components/ScreenShareControls';
import FaceTrackingNetBackground from './containers/FaceTrackingNetBackground';
import BlurNetBackground from './containers/BlurNetBackground';
import LoadingPage from './containers/LoadingPage';
import posthog from 'posthog-js';

if (process.env.REACT_APP_PLATFORM != "web") {
  const customTitlebar = require('custom-electron-titlebar');

  var path = window.location.href;
  path = path.substring(path.lastIndexOf("#") + 1);

  if (path != "/screensharing_controls") {
    new customTitlebar.Titlebar({
      backgroundColor: customTitlebar.Color.fromHex('#121422'),
      overflow: "hidden",
    });
  }
}

var isDevMode = process.execPath.match(/[\\/]electron/)

if (isDevMode == false) {
  const { init } = require('@sentry/electron/dist/renderer');

  init({
      dsn: 'https://20e5d4f5d6d94630a28e5684a3048940@o281199.ingest.sentry.io/5176374',
      environment: process.env.NODE_ENV
  })

}

posthog.init('64tUVTgJhFVIV7BADDLYHN-zG2Ja1yqzOI_SE8Pytc4', {api_host: 'https://analytics.blab.to'});

export default class App extends React.Component {
  render() {

    const { store, persistor, history } = this.props;

    return(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Switch>
              <Redirect from="/" exact to={{
                      pathname: routes.LOADING,
              }} />
              <Route path={routes.LOGIN} component={LoginPage} />
              <Route path={routes.MAGIC_LOGIN} component={MagicLoginPage} />
              <Route path={routes.LOADING} component={LoadingPage} />
              <Route path="/screensharing_controls" exact component={ScreenShareControls} />
              <Route path="/face_tracking_net_background" exact component={FaceTrackingNetBackground} />
              <Route path="/blur_net_background" exact component={BlurNetBackground} />
              <Route path="/*" component={Sidebar} />
            </Switch>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}