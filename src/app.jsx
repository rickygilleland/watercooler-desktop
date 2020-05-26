import React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import routes from './constants/routes.json';
import Sidebar from './containers/Sidebar';
import LoginPage from './containers/LoginPage';
import MagicLoginPage from './containers/MagicLoginPage';
import ScreenShareControls from './components/ScreenShareControls'
import LoadingPage from './containers/LoadingPage';
const customTitlebar = require('custom-electron-titlebar');

var path = window.location.href;
path = path.substring(path.lastIndexOf("#") + 1);

if (path != "/screensharing_controls") {
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#121422'),
    overflow: "hidden",
  });
}

export default class App extends React.Component {
  render() {

    const { store, persistor, history } = this.props;

    return(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path={routes.LOGIN} component={LoginPage} />
              <Route path={routes.MAGIC_LOGIN} component={MagicLoginPage} />
              <Route path="/screensharing_controls" exact component={ScreenShareControls} />
              <Route path={routes.LOADING} component={LoadingPage} />
              <Route path="/*" component={Sidebar} />
            </Switch>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}
